require("dotenv").config();
const express = require("express");
const formidable = require("express-formidable");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary");
const isAuthenticated = require("./middleware/isAuthenticated");

const app = express();
app.use(formidable());

const cors = require("cors");
app.use(cors());

const offer = require("./routes/offer.js");
const user = require("./routes/user.js");
const pay = require("./routes/pay.js");
app.use(offer);
app.use(user);
app.use(pay);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

cloudinary.config({
  cloud_name: "dqp905mfv",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(process.env.PORT, () => {
  console.log("Server Started");
});
