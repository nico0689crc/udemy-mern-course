const fs = require("fs");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const { getCoordinateByAddress } = require("../util/location");

const Place = require("../models/place");
const User = require("../models/user");
const place = require("../models/place");

console;

const getLocation = async address => {
  let location;
  try {
    location = await getCoordinateByAddress(address);
  } catch (error) {
    return { lat: "", lng: "" };
  }

  return location;
};

const getPlaceById = async (req, res, next) => {
  const { placeId } = req.params;

  let place;

  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(new HttpError(error, 500));
  }

  if (!place) {
    return next(
      new HttpError("Could not find a place for the provided id", 404)
    );
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const { userId } = req.params;

  let places;

  try {
    places = await Place.find({ creator: userId });
  } catch (error) {
    return next(new HttpError(error, 500));
  }

  const places_object = places.map(place => place.toObject({ getters: true }));

  res.json({ places: places_object });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError(errors, 404));
  }

  const body = { ...req.body };
  const location = await getLocation(body.address);

  let place;

  try {
    place = await Place.create({
      ...body,
      location,
      image: req.file.path,
      creator: req.userData.userId,
    });

    await place.save();

    const userById = await User.findById(body.creator);

    userById.places.push(place.id);

    await userById.save();
  } catch (error) {
    return next(new HttpError(error, 500));
  }

  res.status(201).json({ place });
};

const updatePlace = async (req, res, next) => {
  const { placeId } = req.params;
  const { title, description } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError(JSON.stringify(errors), 404));
  }

  let place;

  try {
    place = await Place.findById(placeId);

    if (place.creator.toString() !== req.userData.userId) {
      throw new Error("You do not have authorization to perform this action.");
    }

    place.title = title;
    place.description = description;

    place.save();
  } catch (error) {
    return next(new HttpError(error, 500));
  }

  res.status(200).json({ place });
};

const deletePlace = async (req, res, next) => {
  const { placeId } = req.params;
  let place;

  try {
    place = await Place.findById(placeId);

    if (place.creator.toString() !== req.userData.userId) {
      throw new Error("You do not have authorization to perform this action.");
    }

    const placeImagePath = place.image;

    const user = await User.findById(place.creator.toString());

    const placesUpdated = user.places.filter(
      place => place.toString() !== placeId.toString()
    );

    user.places = placesUpdated;
    await user.save();
    await Place.findByIdAndDelete(placeId);

    fs.unlink(placeImagePath, err => {});
  } catch (error) {
    return next(new HttpError(error, 500));
  }

  res.status(200).json({ place });
};

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
};
