const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).json({
    status: 'success',
    data: {
      data: tours
    }
  });
});

exports.getMyReviews = catchAsync(async (req, res, next) => {
  // 1) Find all reviews
  const reviews = await Review.find({ user: req.user.id }).populate({
    path: 'tour'
  });

  res.status(200).json({
    status: 'success',
    data: {
      data: reviews
    }
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead'
  });
};

exports.getUser = factory.getOne(User);

exports.getCountBooks = catchAsync(async (req, res, next) => {
  const doc = await Booking.find({ user: req.params.id });

  res.status(200).json({
    status: 'success',
    results: doc.length
  });
});

exports.getCountReviews = catchAsync(async (req, res, next) => {
  const doc = await Review.find({ user: req.params.id });

  res.status(200).json({
    status: 'success',
    results: doc.length
  });
});

exports.getAllUsers = factory.getAll(User);
exports.getAllUsers2 = catchAsync(async (req, res, next) => {
  const doc = await User.find();
  const lenReview = [];
  const lenBooking = [];
  // doc.map(async (user, i) => {
  //   // eslint-disable-next-line no-shadow
  //   const query = Review.find({ user: user._id });
  //   const doc2 = await query;
  //   console.log(doc2.length);
  //   lenReview.push(doc2.length);
  // });
  for (let i = 0; i < doc.length; i++) {
    const query = Review.find({ user: doc[i]._id });
    const doc2 = await query;
    lenReview.push(doc2.length);
  }
  for (let i = 0; i < doc.length; i++) {
    const query = Booking.find({ user: doc[i]._id });
    const doc2 = await query;
    lenBooking.push(doc2.length);
  }
  console.log(lenReview);
  console.log(lenBooking);
  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    lenReview: lenReview,
    lenBooking: lenBooking,
    results: doc.length,
    data: {
      data: doc
    }
  });
});

// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.getGuides = catchAsync(async (req, res, next) => {
  const query = User.find({ role: 'guide' });
  const doc1 = await query;

  const query1 = User.find({ role: 'lead-guide' });
  const document = await query1;

  const doc = [...document, ...doc1];

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: doc
    }
  });
});
