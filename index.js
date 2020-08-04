require("dotenv").config();
const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary");

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
