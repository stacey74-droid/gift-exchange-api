const { Event, Member, Wishlist } = require('../models');
const mongoose = require('mongoose');

// Get all events where the logged in user belong to
const getAllEvents = async (req, res) => {
  try {
    console.log('Query:', req.query);
    const userEmail = req.query.email; // Retrieve email from query parameters
    console.log('Email received:', userEmail); 

    if (!userEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const userMemberships = await Member.find({ email: userEmail });

    if (userMemberships.length === 0) {
      return res.status(404).json({ message: 'No events found for this user' });
    }

    // Extract eventIds from the user’s memberships
    const eventIds = userMemberships.map(member => member.eventId);

    // Find events where eventId matches
    const events = await Event.find({ _id: { $in: eventIds } });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get event by id
async function getEventById(id){
  const event = await Event.findById(id);
  return event.toObject();
}

//add event
async function createEvent(eventData){
  try{
    let event = new Event({
      ...eventData
    });
    await event.save();
    return event;
  } catch (error) {
    console.error('Error creating wishlist:', error);
    throw error; 
  }
}

//update an existing event
const updateEvent = async (id, updatedData) => {
  try {
    // Find the event by ID
    const event = await Event.findById(id);
    if (!event) {
      return null; // Event not found
    }

    // Update fields if provided in the request body
    if (updatedData.eventName !== undefined) event.eventName = updatedData.eventName;
    if (updatedData.location !== undefined) event.location = updatedData.location;
    if (updatedData.budgetLimit !== undefined) event.budgetLimit = updatedData.budgetLimit;
    if (updatedData.description !== undefined) event.description = updatedData.description;
    if (updatedData.date !== undefined) event.date = new Date(updatedData.date); // Ensure date is a Date object
    if (updatedData.imageUrl !== undefined) event.imageUrl = updatedData.imageUrl;

    // Save the updated event
    await event.save();

    // Return the updated event
    return event;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error; // Throw the error to be handled by the router
  }
};

// Delete an event and all related members and wishlists
const deleteEvent = async (id) => {
  let session; // Declare session outside the try block
  try {
    // Start a session for transactions
    session = await mongoose.startSession();
    session.startTransaction();

    // Delete the event
    const event = await Event.findByIdAndDelete(id).session(session);
    if (!event) {
      await session.abortTransaction();
      session.endSession();
      return null; // Event not found
    }

    await Wishlist.deleteMany({ eventId: id }).session(session);

    // Delete all members associated with the event
    await Member.deleteMany({ eventId: id }).session(session);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Return the deleted event
    return event;
  } catch (error) {
    // Abort the transaction on error (if session is defined)
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    console.error('Error deleting event and related data:', error);
    throw error;
  }
};

// validation function for event data
const validateEvent = (event) => {
  return event.eventName &&
         event.location &&
         event.budgetLimit &&
         event.date &&
         event.description &&
         event.imageUrl;
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};

