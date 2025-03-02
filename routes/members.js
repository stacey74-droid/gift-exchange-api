const express = require('express');
const router = express.Router();

const {
    getAllMembers,
    createMember,
    deleteMember,
    startDraw,
    getAssignedBuddy,
    getBuddyWishlists
} = require('../controllers/Members.js');

router.post('/members', async (req, res) => {
    console.log("req.body", req.body);
    await createMember(req.body);
    res.send("done");
});

router.get('/members', async (req, res) => {
    let members = await getAllMembers(req.body);
    res.send(members);
});

router.delete('/members/:id', async (req, res) => {
    const member = await deleteMember(req.params.id);
    if (!member) {
        return res.status(404).json({ message: 'member not found' });
    }
    res.status(200).json({ message: 'Member successfully deleted' });
});

router.post('/start-draw', async (req, res) => {
    const { eventId } = req.body;  
    
    if (!eventId) {
        return res.status(400).json({ message: 'Event ID is required' });
    }
    await startDraw(eventId, res); 
});

router.get('/assigned-buddy/:memberId', async (req, res) =>{
    await getAssignedBuddy(req, res);
});

router.get('/buddy-wishlists/:memberId', async (req, res) => {
    await getBuddyWishlists(req, res); 
});

module.exports = router;