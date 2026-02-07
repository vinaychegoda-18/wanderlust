const Listing=require("../models/listing.js");
const fetch=require("node-fetch");

module.exports.index=(async (req, res) => {
        const allListings = await Listing.find({});
        res.render("listings/index.ejs", { allListings });
    })


module.exports.renderNewForm= (req, res) => {
    //console.log(req.user);
    
    res.render("listings/new.ejs");
    
}

module.exports.showListing=async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author"},}).populate("owner");
        if(!listing){
             req.flash("error","Listing you requested for does not exist!");
             return res.redirect("/listings");
        }
        console.log(listing);
        res.render("listings/show.ejs", { listing });
    }

// module.exports.createListing=async (req, res, next) => {
//         let url=req.file.path;
//         let filename=req.file.filename;
//         const newListing = new Listing(req.body.listing);
//         newListing.owner=req.user._id;
//         newListing.image={url,filename};
//         await newListing.save();
//         req.flash("success","New Listing Successfully Saved!");
//         res.redirect("/listings");

//     }

module.exports.createListing = async (req, res, next) => {
  try{
    const { location } = req.body.listing;

  const geoResponse = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
  );

  const geoData = await geoResponse.json();

  if (!geoData || geoData.length === 0) {
    req.flash("error", "Location not found");
    return res.redirect("/listings/new");
  }

  const lat = Number(geoData[0].lat);
  const lon = Number(geoData[0].lon);

  let newListing = new Listing(req.body.listing);

  newListing.geometry = {
    type: "Point",
    coordinates: [lon, lat], // lng, lat
  };

  newListing.owner = req.user._id;

  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  await newListing.save();

  req.flash("success", "New Listing Successfully Saved!");
  res.redirect("/listings");
}catch(err){
    next(err);
}
};

module.exports.renderEditForm=async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findById(id);
        if(!listing){
             req.flash("error","Listing you requested for does not exist!");
             return res.redirect("/listings");
        }

        let originalImageUrl=listing.image.url;
        originalImageUrl=originalImageUrl.replace("/upload","/upload/h_300/w_250");
        res.render("listings/edit.ejs", { listing ,originalImageUrl});
    }

module.exports.updateListing=async (req, res) => {
        let { id } = req.params;
        // let listing=await Listing.findById(id);
        // if(!listing.owner._id.equals(res.local.currUser._id)){
        //     req.flash("error","you dont have permission to edit");
        //     return res.redirect(`/listings/${id}`);
        // }
       let listing= await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        if(typeof req.file!=="undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        await listing.save();
        }
        req.flash("success","New Listing Successfully updated!");
         return res.redirect(`/listings/${id}`);
    }


module.exports.destroyListing=async (req, res) => {
        let { id } = req.params;
        let deletedListing = await Listing.findByIdAndDelete(id);
        console.log(deletedListing);
        req.flash("success","New Listing Successfully deleted!");
        res.redirect("/listings");
    }

    
module.exports.searchListings = async (req, res) => {
    const { query } = req.query;

    // Check if query is empty
    if (!query || query.trim() === "") {
        req.flash("error", "Please enter something to search.");
        return res.redirect("/listings");
    }

    const allListings = await Listing.find({ 
        $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { category: { $regex: query, $options: "i" } }
        ]
    });

    if (!allListings || allListings.length === 0) {
        req.flash("error", `No listings found for "${query}"`);
        return res.redirect("/listings");
    }

    // If matches found, render index page with listings
    res.render("listings/index.ejs", { allListings });
};