const { Member, Wishlist } = require("../models");
const mongoose = require("mongoose");

// Get all members
const getAllMembers = async (req, res) => {
    try {
        const members = await Member.find();
        //res.json(events);
        return members.map(x => x.toObject());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//add member
async function createMember(memberData) {
    try {
        let member = new Member({
            ...memberData
        });
        await member.save();
        return member.toObject();
    } catch (error) {
        console.error('Error creating wishlist:', error);
        throw error;
    }
}


// Delete a member and all related wishlists
const deleteMember = async (id) => {
    let session;
    try {
        // Start a session for transactions
        session = await mongoose.startSession();
        session.startTransaction();

        // Delete the member
        const member = await Member.findByIdAndDelete(id).session(session);
        if (!member) {
            await session.abortTransaction();
            session.endSession();
            return null; // member not found
        }

        // Delete all wishlists associated with the Member
        await Wishlist.deleteMany({ memberId: id }).session(session);

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        // Return the deleted member
        return member;
    } catch (error) {
        // Abort the transaction on error (if session is defined)
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        console.error('Error deleting member and related data:', error);
        throw error; // Throw the error to be handled by the router
    }
};

//assign buddy
const startDraw = async (eventId, res) => {
    try {
        const participants = await Member.find({ eventId });
        console.log('Participants:', participants);

        if (participants.length < 2) {
            console.log('Not enough participants');
            return res.status(400).json({ message: 'Must have at least 2 participants' });
        }

        // Shuffle participants using Fisher-Yates algorithm
        let shuffled = [...participants];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Assign buddies in a circular fashion
        for (let i = 0; i < shuffled.length; i++) {
            const buddyIndex = (i + 1) % shuffled.length;

            // Ensure no one is assigned to themselves
            if (shuffled[buddyIndex]._id.equals(shuffled[i]._id)) {
                // Swap with the next person to avoid self-assignment
                const nextBuddyIndex = (buddyIndex + 1) % shuffled.length;
                shuffled[i].assignedBuddy = shuffled[nextBuddyIndex]._id;
            } else {
                shuffled[i].assignedBuddy = shuffled[buddyIndex]._id;
            }

            await shuffled[i].save();
            console.log(`Assigned buddy to ${shuffled[i].name}: ${shuffled[buddyIndex].name}`);
        }

        console.log('Draw completed successfully');
        res.status(200).json({ message: 'Draw completed successfully!' });
    } catch (error) {
        console.error('Error in startDraw:', error);
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
};


//get assigned buddy
const getAssignedBuddy = async (req, res) => {
    try {
        const memberId = req.params.memberId;

        // Find the current user
        const user = await Member.findById(memberId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the assigned buddy
        const buddy = await Member.findById(user.assignedBuddy);
        if (!buddy) {
            return res.status(404).json({ message: 'Assigned buddy not found' });
        }

        // Return the buddy's name
        res.status(200).json({ buddyName: buddy.name });
    } catch (error) {
        console.error('Error fetching assigned buddy:', error);
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
};

//get the assigned buddy's wishlist
const getBuddyWishlists = async (req, res) => {
    try {
        const memberId = req.params.memberId;

        // Find the current user
        const user = await Member.findById(memberId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the wishlists for the assigned buddy
        const wishlists = await Wishlist.find({ memberId: user.assignedBuddy });
        if (!wishlists || wishlists.length === 0) {
            return res.status(404).json({ message: 'No wishlists found for this buddy' });
        }

        // Return the wishlists
        res.status(200).json({ wishlists });
    } catch (error) {
        console.error('Error fetching buddy wishlists:', error);
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
};

// A simple validation function for member data
const validateMember = (member) => {
    return member.name &&
        member.email &&
        member.eventId;
};

module.exports = {
    getAllMembers,
    createMember,
    deleteMember,
    startDraw,
    getAssignedBuddy,
    getBuddyWishlists
};

// Update an existing member
// const updateMember = async (req, res) => {
//     try {
//         const updatedData = req.body;
//         const member = await Member.findOne({ id: req.params.id });
//         if (!member) {
//             return res.status(404).json({ message: 'Member not found' });
//         }
//         // Update fields if provided, otherwise retain the current value
//         member.name = updatedData.name || member.name;
//         member.email = updatedData.email || member.email;
//         member.eventId = updatedData.eventId || member.eventId;

//         await member.save();
//         res.json({ message: 'member updated successfully', member });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

//get member by id
// async function getMemberById(id) {
//     const member = await Member.findById(id);
//     return member.toObject();
// }