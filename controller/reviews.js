const Listing=require("../models/listing.js")
const Review=require("../models/review.js");

// module.exports.createReview=async (req, res) => {
//         console.log(req.params.id);
//         let listing = await Listing.findById(req.params.id);
//         let newReview = new Review(req.body.review);
//         newReview.author=req.user._id;
//         listing.reviews.push(newReview);

//         await newReview.save();
//         await listing.save();
//         req.flash("success","Review created!");

//         res.redirect(`/listings/${listing._id}`);
//     }

module.exports.createReview = async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "Review created!");
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    next(err);
  }
};

module.exports.destroyReview=async(req,res)=>{           ///router.delete("/listings/:id/reviews/:reviewId",
          const {id,reviewId}=req.params;
          await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
          await Review.findByIdAndDelete(reviewId);
           req.flash("success","Review deleted!");

          return res.redirect(`/listings/${id}`);

          
}