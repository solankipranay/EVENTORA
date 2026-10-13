const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const parsePagination = require('../utils/pagination');
const { getEvents } = require('../controllers/eventController');

const emailModulePath = require.resolve('../utils/email');
const emailModule = new Module(emailModulePath);
emailModule.filename = emailModulePath;
emailModule.loaded = true;
emailModule.exports = {
    sendBookingEmail: async () => true,
    sendOTPEmail: async () => {}
};
require.cache[emailModulePath] = emailModule;

const { confirmBooking } = require('../controllers/bookingController');

test('pagination uses bounded defaults for invalid and excessive values', () => {
    assert.deepEqual(parsePagination({ page: '3', limit: '1000' }), {
        page: 3,
        limit: 100,
        skip: 200
    });
    assert.deepEqual(parsePagination({ page: '-1', limit: 'not-a-number' }), {
        page: 1,
        limit: 25,
        skip: 0
    });
});

test('event listing applies literal search and paginates its response', { concurrency: false }, async () => {
    const originalFind = Event.find;
    const originalCountDocuments = Event.countDocuments;
    let filters;
    const items = [{ _id: 'event-1', title: 'VIP Night' }];
    Event.find = query => {
        filters = query;
        return {
            select() { return this; },
            sort() { return this; },
            skip(value) { this.offset = value; return this; },
            limit(value) { this.pageSize = value; return this; },
            lean() { return Promise.resolve(items); }
        };
    };
    Event.countDocuments = async () => 3;
    const response = {
        statusCode: 200,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; }
    };

    try {
        await getEvents(
            { query: { page: '2', limit: '1', search: 'VIP.*', category: 'Entry Pass' } },
            response
        );
        assert.equal(filters.title.$regex, 'VIP\\.\\*');
        assert.equal(filters.category, 'Entry Pass');
        assert.deepEqual(response.body, { items, total: 3, page: 2, limit: 1, totalPages: 3 });
    } finally {
        Event.find = originalFind;
        Event.countDocuments = originalCountDocuments;
    }
});

test('destructive seed refuses to run in production', () => {
    const seedPath = path.join(__dirname, '..', 'seed.js');
    const result = spawnSync(process.execPath, [seedPath, '--reset'], {
        encoding: 'utf8',
        env: { ...process.env, NODE_ENV: 'production' }
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /cannot run in production/i);
});

test('concurrent booking confirmations cannot oversell the last seat', { concurrency: false }, async () => {
    const originalBookingFindById = Booking.findById;
    const originalBookingFindOneAndUpdate = Booking.findOneAndUpdate;
    const originalEventFindOneAndUpdate = Event.findOneAndUpdate;
    const originalEventExists = Event.exists;
    const originalEventUpdateOne = Event.updateOne;
    const booking = {
        _id: 'booking-1',
        status: 'pending',
        eventId: { _id: 'event-1', title: 'Night pass' },
        userId: { email: 'guest@example.test', name: 'Guest' }
    };
    let availableSeats = 1;

    Booking.findById = () => ({
        populate() { return this; },
        then(resolve, reject) {
            return Promise.resolve({ ...booking }).then(resolve, reject);
        }
    });
    Booking.findOneAndUpdate = async (filter, update) => {
        if (booking.status !== filter.status) return null;
        Object.assign(booking, update.$set);
        return { ...booking };
    };
    Event.findOneAndUpdate = async () => {
        if (availableSeats <= 0) return null;
        availableSeats -= 1;
        return { _id: 'event-1' };
    };
    Event.exists = async () => ({ _id: 'event-1' });
    Event.updateOne = async (filter, update) => {
        availableSeats += update.$inc.availableSeats;
    };

    const respond = () => ({
        statusCode: 200,
        body: null,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; }
    });

    try {
        const responses = [respond(), respond()];
        await Promise.all(responses.map(response => confirmBooking(
            { params: { id: 'booking-1' }, body: { paymentStatus: 'paid' } },
            response
        )));

        assert.equal(responses.filter(response => response.statusCode === 200).length, 1);
        assert.equal(responses.filter(response => response.statusCode === 400).length, 1);
        assert.equal(availableSeats, 0);
        assert.equal(booking.status, 'confirmed');
    } finally {
        Booking.findById = originalBookingFindById;
        Booking.findOneAndUpdate = originalBookingFindOneAndUpdate;
        Event.findOneAndUpdate = originalEventFindOneAndUpdate;
        Event.exists = originalEventExists;
        Event.updateOne = originalEventUpdateOne;
        delete require.cache[emailModulePath];
    }
});

test('seat reservation is restored when a booking changes before confirmation', { concurrency: false }, async () => {
    const originalBookingFindById = Booking.findById;
    const originalBookingFindOneAndUpdate = Booking.findOneAndUpdate;
    const originalEventFindOneAndUpdate = Event.findOneAndUpdate;
    const originalEventUpdateOne = Event.updateOne;
    let availableSeats = 0;

    Booking.findById = () => ({
        populate() { return this; },
        then(resolve, reject) {
            return Promise.resolve({
                _id: 'booking-2',
                status: 'pending',
                eventId: { _id: 'event-2', title: 'Night pass' },
                userId: { email: 'guest@example.test', name: 'Guest' }
            }).then(resolve, reject);
        }
    });
    Booking.findOneAndUpdate = async () => null;
    Event.findOneAndUpdate = async () => {
        availableSeats -= 1;
        return { _id: 'event-2' };
    };
    Event.updateOne = async (filter, update) => {
        availableSeats += update.$inc.availableSeats;
    };
    const response = {
        statusCode: 200,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; }
    };

    try {
        await confirmBooking(
            { params: { id: 'booking-2' }, body: { paymentStatus: 'not_paid' } },
            response
        );
        assert.equal(response.statusCode, 409);
        assert.equal(availableSeats, 0);
    } finally {
        Booking.findById = originalBookingFindById;
        Booking.findOneAndUpdate = originalBookingFindOneAndUpdate;
        Event.findOneAndUpdate = originalEventFindOneAndUpdate;
        Event.updateOne = originalEventUpdateOne;
        delete require.cache[emailModulePath];
    }
});
