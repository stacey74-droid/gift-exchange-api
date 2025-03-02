const { Wishlist } = require("../models");

// Get all wishlist
const getAllWishlists = async (req, res) => {
    try {
        const wishlists = await wishlist.find();
        return wishlists.map(x => x.toObject());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//get wishlists of the logged in member
const getMyWishlists = async (req, res) => {
    try {
      const memberId = req.params.memberId;
  
      // Find the wishlists for the logged-in user
      const wishlists = await Wishlist.find({ memberId });
      if (!wishlists || wishlists.length === 0) {
        return res.status(404).json({ message: 'No wishlists found for this user' });
      }
  
      // Return the wishlists
      res.status(200).json({ wishlists });
    } catch (error) {
      console.error('Error fetching wishlists:', error);
      res.status(500).json({ message: 'An error occurred', error: error.message });
    }
};

//add wishlist
async function createWishlist(wishlistData) { 
    try {
      let wishlist = new Wishlist({ 
        ...wishlistData
      });
      await wishlist.save();
      return wishlist.toObject();
    } catch (error) {
      console.error('Error creating wishlist:', error);
      throw error; 
    }
}

// Update an existing wishlist
const updateWishlist = async (req, res) => {
    try {
        const updatedData = req.body;
        const wishlist = await wishlist.findOne({ _id: req.params.id });
        if (!wishlist) {
            return res.status(404).json({ message: 'wishlist not found' });
        }
        // Update fields if provided, otherwise retain the current value
        wishlist.itemName = updatedData.itemName || wishlist.itemName;
        wishlist.description = updatedData.description || wishlist.description;
        wishlist.price = updatedData.price || wishlist.price;
        wishlist.imageUrl = updatedData.imageUrl || wishlist.imageUrl;
        wishlist.eventId = wishlist.eventId || wishlist.eventId;
        wishlist.memberId = wishlist.memberId || wishlist.memberId;

        await wishlist.save();
        res.json({ message: 'wishlist updated successfully', wishlist });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a wishlist
const deleteWishlist = async (req, res) => {
    try {
        const wishlist = await wishlist.findOneAndDelete({ _id: req.params.id });
        if (!wishlist) {
            return res.status(404).json({ message: 'wishlist not found' });
        }
        res.json({ message: 'wishlist deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//validation function for wishlist data
const validateWishlist = (wishlist) => {
    return wishlist.itemName &&
        wishlist.price &&
        wishlist.description &&
        wishlist.imageUrl &&
        wishlist.eventId &&
        wishlist.memberId;
};

module.exports = {
    getAllWishlists,
    getMyWishlists,
    createWishlist,
    updateWishlist,
    deleteWishlist
};
