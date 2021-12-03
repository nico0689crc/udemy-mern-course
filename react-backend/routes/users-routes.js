const express = require("express");
const { check } = require("express-validator");
const { getUsers, login, signup } = require("../controller/users-controllers");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.get("/", getUsers);

router.post("/login", login);

router.post(
  "/signup",
  fileUpload.single("image"),
  [
    check("name").isLength({ min: 5 }),
    check("email").isEmail(),
    check("password").isLength({ min: 5 }),
  ],
  signup
);

module.exports = router;
