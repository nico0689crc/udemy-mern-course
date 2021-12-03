const { v4: uuidv4 } = require("uuid");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const globalConfig = require("../config/global-config");
const HttpError = require("../models/http-error");

const User = require("../models/user");
const { createPlace } = require("./places-controllers");

const getUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.find({}, "-password");
  } catch (error) {
    return next(new HttpError(error, 500));
  }

  const users_object = users.map(user => {
    return user.toObject({ getters: true });
  });

  res.json({ users: users_object });
};

const signup = async (req, res, next) => {
  const { email, name, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError(errors, 404));
  }

  const checkUser = await User.findOne({ email: email });
  if (checkUser) {
    return next(
      new HttpError("User already exist with this email address.", 404)
    );
  }

  let hashedPassword;
  try {
    hashedPassword = await bcryptjs.hash(password, 12);
  } catch (error) {
    return next(new HttpError("Could not create user, please try again.", 500));
  }

  const user = new User({
    email,
    name,
    password: hashedPassword,
    image: req.file.path,
    places: [],
  });

  await user.save().catch(error => {
    return next(new HttpError(error, 500));
  });

  let token;
  try {
    token = jwt.sign(
      { userId: user.id, email: user.email },
      "supersecret_dont_share",
      { expiresIn: "1h" }
    );
  } catch (error) {
    return next(
      new HttpError("User already exist with this email address.", 404)
    );
  }

  const userResponse = user.toObject({ getters: true });

  res.status(201).json({ user: { ...userResponse, token } });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError(errors, 404));
  }

  const user = await User.findOne({ email: email }).catch(() => {
    return next(new HttpError(error, 500));
  });

  if (!user) {
    return next(
      new HttpError("The user's credentials seem to be incorrect.", 404)
    );
  }

  let isValidPassword;
  try {
    isValidPassword = await bcryptjs.compare(password, user.password);
  } catch (error) {
    return next(
      new HttpError("The user's credentials seem to be incorrect.", 500)
    );
  }

  if (!isValidPassword) {
    return next(
      new HttpError("The user's credentials seem to be incorrect.", 404)
    );
  }

  let token;
  try {
    token = jwt.sign(
      { userId: user.id, email: user.email },
      "supersecret_dont_share",
      { expiresIn: "1h" }
    );
  } catch (error) {
    return next(
      new HttpError("User already exist with this email address.", 404)
    );
  }

  const userResponse = user.toObject({ getters: true });

  res.status(200).json({ user: { ...userResponse, token } });
};

module.exports = { getUsers, login, signup };
