const express = require('express');
const router = express.Router();

const {
    getAllEvents,
    updateEvent,
    createEvent,
    getEventById,
    deleteEvent
} = require('../controllers/Events.js');

router.post('/events', async (req, res) => {
    try {
        console.log("req.body", req.body);
        const event = await createEvent(req.body);
        res.status(201).json({ message: 'Event created successfully', event });
    } catch (error) {
        console.error('Error in /events endpoint:', error);
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});

router.get('/events', async (req, res) => {
    let events = await getAllEvents(req.body);
    res.send(events);
});

router.get('/events/:id', async (req, res) => {
    let event = await getEventById(req.params["id"]);
    res.send(event);
});

router.put('/events/:id', async (req, res) => {
    const event = await updateEvent(req.params.id, req.body); // Pass req.body for updates
    if (!event) {
        return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
});

router.delete('/events/:id', async (req, res) => {
    const event = await deleteEvent(req.params.id);
    if (!event) {
        return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json({ message: 'Event successfully deleted' });
});


module.exports = router;