const { Event, Member, Wishlist } = require('../models');
const mongoose = require('mongoose'); 

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    //res.json(events);
    return events.map(x => x.toObject());
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
    return event.toObject();
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

    // Fetch all members associated with the event
    // const members = await Member.find({ id }).session(session);

    // // Delete wishlists for each member and event
    // for (const member of members) {
    //   await Wishlist.deleteMany({ eventId: id, memberId: member._id }).session(session);
    // }

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
    throw error; // Throw the error to be handled by the router
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

// Get a single event by ID
// const getEventById = async (req, res) => {
//   try {
//     const event = await Event.findOne({ id: req.params.id });
//     if (!event) {
//       return res.status(404).json({ message: 'Event not found' });
//     }
//     res.json(event);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Create a new event
// const createEvent = async (req, res) => {
//   const newEvent = req.body;
//   if (!validateEvent(newEvent)) {
//     return res.status(400).json({ message: 'Missing required event data' });
//   }
//   newEvent.id = randomUUID(); // generate a unique id for the event
//   try {
//     const event = await Event.create(newEvent);
//     res.status(201).json(event);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };