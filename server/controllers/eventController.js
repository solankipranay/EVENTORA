const Event = require('../models/Event');
const Booking = require('../models/Booking');

exports.getEvents = async (req, res) => {
    try {
        const filters = {};
        if (req.query.category && req.query.category !== 'All') {
            filters.category = req.query.category;
        }
        if (req.query.search) {
            filters.title = { $regex: req.query.search.trim(), $options: 'i' };
        }

        const events = await Event.find(filters).populate('createdBy', 'name email').sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const { title, description, date, location, category, totalSeats, ticketPrice, image } = req.body;
        if (!title || !description || !date || !location || !category || totalSeats === undefined || totalSeats === '') {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const numSeats = Number(totalSeats);
        const numPrice = Number(ticketPrice) || 0;

        if (isNaN(numSeats) || numSeats < 0) {
            return res.status(400).json({ message: 'Total seats must be a valid positive number' });
        }

        const event = await Event.create({
            title: title.trim(),
            description: description.trim(),
            date,
            location: location.trim(),
            category,
            totalSeats: numSeats,
            availableSeats: numSeats,
            ticketPrice: numPrice,
            image: image ? image.trim() : '',
            createdBy: req.user.id
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (updateData.totalSeats !== undefined) updateData.totalSeats = Number(updateData.totalSeats);
        if (updateData.ticketPrice !== undefined) updateData.ticketPrice = Number(updateData.ticketPrice);
        if (updateData.availableSeats !== undefined) updateData.availableSeats = Number(updateData.availableSeats);

        const event = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Also cancel any pending bookings linked to this deleted pass
        await Booking.updateMany(
            { eventId: req.params.id, status: 'pending' },
            { status: 'cancelled' }
        );

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};