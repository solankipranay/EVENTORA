const Booking = require('../models/Booking');
const Event = require('../models/Event');
const OTP = require('../models/OTP');
const { sendBookingEmail, sendOTPEmail } = require('../utils/email');
const parsePagination = require('../utils/pagination');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.sendBookingOTP = async (req, res) => {
    try {
        const otp = generateOTP();
        await OTP.deleteMany({ email: req.user.email, action: 'event_booking' });
        await OTP.create({ email: req.user.email, otp, action: 'event_booking' });
        await sendOTPEmail(req.user.email, otp, 'event_booking');
        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Booking OTP request failed:', error);
        res.status(error.message === 'Unable to send verification email' ? 503 : 500).json({
            message: error.message === 'Unable to send verification email'
                ? 'Unable to send verification email. Please try again.'
                : 'Error sending OTP'
        });
    }
};

exports.bookEvent = async (req, res) => {
    try {
        const { eventId, otp } = req.body;
        if (!eventId || !otp) {
            return res.status(400).json({ message: 'Event ID and OTP are required' });
        }

        // Verify OTP explicitly before proceeding
        const validOTP = await OTP.findOne({ email: req.user.email, otp: otp.trim(), action: 'event_booking' });
        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP for booking' });
        }

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (event.availableSeats <= 0) return res.status(400).json({ message: 'No seats available for this pass' });

        // Check if user already has an active (confirmed or pending) booking
        const existingActiveBooking = await Booking.findOne({
            userId: req.user.id,
            eventId,
            status: { $in: ['pending', 'confirmed'] }
        });
        if (existingActiveBooking) {
            return res.status(400).json({
                message: existingActiveBooking.status === 'confirmed'
                    ? 'You have already booked this pass'
                    : 'You already have a pending booking request for this pass'
            });
        }

        const booking = await Booking.create({
            userId: req.user.id,
            eventId,
            status: 'pending',
            paymentStatus: 'not_paid',
            amount: event.ticketPrice
        });

        await OTP.deleteMany({ email: req.user.email, action: 'event_booking' }); // cleanup

        res.status(201).json({ message: 'Booking request submitted', booking });
    } catch (error) {
        console.error('Booking request failed:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.confirmBooking = async (req, res) => {
    try {
        const { paymentStatus } = req.body;
        if (paymentStatus !== undefined && !['paid', 'not_paid'].includes(paymentStatus)) {
            return res.status(400).json({ message: 'Payment status must be paid or not_paid' });
        }

        const booking = await Booking.findById(req.params.id).populate('userId').populate('eventId');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.status === 'confirmed') return res.status(400).json({ message: 'Booking is already confirmed' });
        if (booking.status === 'cancelled') return res.status(400).json({ message: 'Cannot confirm a cancelled booking request' });

        if (!booking.eventId) {
            return res.status(404).json({ message: 'Associated event no longer exists' });
        }

        const event = await Event.findOneAndUpdate(
            { _id: booking.eventId._id, availableSeats: { $gt: 0 } },
            { $inc: { availableSeats: -1 } },
            { new: true }
        );
        if (!event) {
            const existingEvent = await Event.exists({ _id: booking.eventId._id });
            if (!existingEvent) return res.status(404).json({ message: 'Event not found' });
            return res.status(400).json({ message: 'No seats available to confirm this booking' });
        }

        const update = { status: 'confirmed' };
        if (paymentStatus) update.paymentStatus = paymentStatus;
        let confirmedBooking;
        try {
            confirmedBooking = await Booking.findOneAndUpdate(
                { _id: booking._id, status: 'pending' },
                { $set: update },
                { new: true }
            );
        } catch (error) {
            await Event.updateOne({ _id: event._id }, { $inc: { availableSeats: 1 } });
            throw error;
        }
        if (!confirmedBooking) {
            await Event.updateOne({ _id: event._id }, { $inc: { availableSeats: 1 } });
            return res.status(409).json({ message: 'Booking status changed. Refresh and try again.' });
        }

        const notificationSent = booking.userId?.email
            ? await sendBookingEmail(booking.userId.email, booking.userId.name, booking.eventId.title)
            : false;

        res.json({
            message: notificationSent
                ? 'Booking confirmed successfully'
                : 'Booking confirmed, but the email notification could not be sent',
            notificationSent,
            booking: confirmedBooking
        });
    } catch (error) {
        console.error('Booking confirmation failed:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };
        const { page, limit, skip } = parsePagination(req.query);
        let bookingQuery = Booking.find(filter)
            .populate('eventId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        if (req.user.role === 'admin') {
            bookingQuery = bookingQuery.populate('userId', 'name email');
        }
        const [items, total] = await Promise.all([
            bookingQuery,
            Booking.countDocuments(filter)
        ]);
        res.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('Booking list request failed:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getBookingSummary = async (req, res) => {
    try {
        const [[summary], [confirmedUsers]] = await Promise.all([
            Booking.aggregate([
                {
                    $group: {
                        _id: null,
                        totalRevenue: {
                            $sum: {
                                $cond: [
                                    { $and: [{ $eq: ['$paymentStatus', 'paid'] }, { $eq: ['$status', 'confirmed'] }] },
                                    '$amount',
                                    0
                                ]
                            }
                        },
                        pendingRequests: {
                            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalRevenue: 1,
                        pendingRequests: 1
                    }
                }
            ]),
            Booking.aggregate([
                { $match: { status: 'confirmed', paymentStatus: 'paid' } },
                { $group: { _id: '$userId' } },
                { $count: 'count' }
            ])
        ]);
        res.json({
            totalRevenue: summary?.totalRevenue || 0,
            pendingRequests: summary?.pendingRequests || 0,
            confirmedPassHolders: confirmedUsers?.count || 0
        });
    } catch (error) {
        console.error('Booking summary request failed:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });

        const wasConfirmed = booking.status === 'confirmed';
        const cancelledBooking = await Booking.findOneAndUpdate(
            { _id: booking._id, status: booking.status },
            { $set: { status: 'cancelled' } },
            { new: true }
        );
        if (!cancelledBooking) {
            return res.status(409).json({ message: 'Booking status changed. Refresh and try again.' });
        }

        // Only restore the seat if it was actually confirmed and deducted
        if (wasConfirmed) {
            await Event.updateOne(
                { _id: booking.eventId, $expr: { $lt: ['$availableSeats', '$totalSeats'] } },
                { $inc: { availableSeats: 1 } }
            );
        }

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error('Booking cancellation failed:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};