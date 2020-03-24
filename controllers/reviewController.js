const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');
const Bookings = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  
  next();
};

exports.isBooked = async(req, res, next) => {
  const {tour, user} = req.body;

  const result = await Bookings.find({user: user, tour: tour});
  //console.log(result.length);
  if(result.length == 0) {
    return next(
      new AppError('You do not have permission to perform this action', 403)
    );
    //console.log("err");
  }
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
