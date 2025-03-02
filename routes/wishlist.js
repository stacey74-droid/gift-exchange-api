const express = require('express');
const router = express.Router();

const {
    getAllWishlists,
    getMyWishlists,
    createWishlist,
    updateWishlist,
    deleteWishlist
} = require('../controllers/Wishlist.js');

router.post('/wishlists', async (req, res) => {
    try {
      console.log("req.body", req.body);
      const wishlist = await createWishlist(req.body); // Call the function
      res.status(201).json({ message: 'Wishlist created successfully', wishlist });
    } catch (error) {
      console.error('Error in /wishlists endpoint:', error);
      res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});

router.get('/wishlists', async (req, res) => {
    let Wishlists = await getAllWishlists(req.body);
    res.send(Wishlists);
});

router.put('/wishlists/:id', async (req, res) => {
    const wishlist = await updateWishlist(req.params.id, req.body);
    if (!wishlist) {
        return res.status(404).json({ message: 'wishlist not found' });
    }
    res.status(200).json(wishlist);
});

router.delete('/wishlists/:id', async (req, res) => {
    const wishlist = await deleteWishlist(req.params.id);
    if (!wishlist) {
        return res.status(404).json({ message: 'wishlist not found' });
    }
    res.status(200).json({ message: 'wishlist successfully deleted' });
});

router.get('/my-wishlists/:memberId', async (req, res) => {
    await getMyWishlists(req, res); // Pass req and res
});

module.exports = router;