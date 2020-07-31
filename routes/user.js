const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const encBase64 = require("crypto-js/enc-base64");
const { SHA256 } = require("crypto-js");

//Import du modele user
const User = require("../models/User.js");

// Signup

router.post("/user/sign_up", async (req, res) => {
  try {
    if (req.fields.username && req.fields.email && req.fields.password) {
      const emailExists = await User.findOne({ email: req.fields.email });
      if (emailExists) {
        return res
          .status(400)
          .json({ error: "This email is already registered" });
      } else {
        const userSalt = uid2(16);
        const newUser = await new User({
          email: req.fields.email,
          token: uid2(16),
          hash: SHA256(req.fields.password + userSalt).toString(encBase64),
          salt: userSalt,
          account: {
            username: req.fields.username,
            phone: req.fields.phone,
          },
        });
        await newUser.save();
        res.status(200).json({
          _id: newUser.id,
          email: newUser.email,
          token: newUser.token,
          account: newUser.account,
        });
      }
    } else {
      return res.status(400).json({ error: "Missing parameter" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json(error.message);
  }
});

// Login
router.post("/user/login", async (req, res) => {
  try {
    if (req.fields.email && req.fields.password) {
      const userFound = await User.findOne({ email: req.fields.email });
      if (userFound) {
        const userHash = SHA256(req.fields.password + userFound.salt).toString(
          encBase64
        );
        if (userHash === userFound.hash) {
          res.status(200).json({
            _id: userFound.id,
            token: userFound.token,
            account: userFound.account,
          });
        } else {
          res.status(401).json({ error: "Wrong password" });
        }
      } else {
        res
          .status(404)
          .json({ error: "This user does not exist in the database" });
      }
    } else {
      res.status(400).json({ error: "Missing parameter" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json(error.message);
  }
});

module.exports = router;
