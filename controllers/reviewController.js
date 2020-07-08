const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');
const Bookings = require('./../models/bookingModel');
const Reviews = require('./../models/reviewModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.isBooked = async (req, res, next) => {
  const { tour, user } = req.body;
  const result = await Bookings.find({ user: user, tour: tour });
  //console.log(result.length);
  // eslint-disable-next-line eqeqeq
  // eslint-disable-next-line no-console
  console.log(result);
  // eslint-disable-next-line eqeqeq
  if (result.length == 0) {
    return next(
      new AppError('You do not have permission to perform this action', 403)
    );
    //console.log("err");
  }
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getAllReviews2 = catchAsync(async (req, res, next) => {
  const doc = await Reviews.find().populate({ path: 'tour' });
  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: {
      data: doc
    }
  });
});

exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);

exports.deleteReview2 = catchAsync(async (req, res, next) => {
  const doc = await Reviews.findByIdAndDelete(req.params.id);
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: null
  });
});
