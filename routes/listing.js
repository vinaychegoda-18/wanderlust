const express=require("express");
const router=express.Router();
const Listing=require("../models/listing.js")


const wrapAsync=require("../utill/wrapAsync.js");
const {isLoggedIn}=require("../middleware.js");
const {isOwner,validateListing}=require("../middleware.js");

const listingController=require("../controller/listing.js");
const multer  = require('multer')

const {storage}=require("../cloudConfig.js");
const upload = multer({ storage });



router.get("/search", wrapAsync(listingController.searchListings));

router.route("/")
.get(wrapAsync(listingController.index))                        // Index Route
.post(isLoggedIn,  
    upload.single('listing[image]'),                                             ///Create Route            
    validateListing,
    wrapAsync(listingController.createListing)
);



// New Route
router.get("/new",isLoggedIn,listingController.renderNewForm);

router.route("/:id")
.get(                                                                   // Show Route
    wrapAsync(listingController.showListing)
)
.put(                                                                  // Update Route
isLoggedIn,
    isOwner, 
    upload.single('listing[image]'),  
    validateListing,
    wrapAsync(listingController.updateListing)
)
.delete(                                                                 // Delete Route
 isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing)
);



// Edit Route
router.get(
    "/:id/edit",isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm)
);

// search route

router.get("/category/:category",wrapAsync( async (req, res) => {
  const { category } = req.params;

  const listings = await Listing.find({ category });

  res.render("listings/index", { allListings: listings });
}));
 module.exports=router;