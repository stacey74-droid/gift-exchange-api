const mongoose = require('mongoose');

//Event Model
const eventSchema = new mongoose.Schema({
        eventName: String,
        location: String,
        budgetLimit: Number,
        date: Date,
        description: String,
        imageUrl: String
});

const Event = mongoose.model('Event', eventSchema);

//Member Model
const memberSchema = new mongoose.Schema({
    name: String,
    email: String,
    eventId: String,
    assignedBuddy: String
});

const Member = mongoose.model('Member', memberSchema);

//Wishlist model
const wishlistSchema = new mongoose.Schema({
    itemName: String,
    description: String,
    price: Number,
    imageUrl: String,
    eventId: String,
    memberId: String
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

// Export models
module.exports = { Event, Wishlist, Member };
