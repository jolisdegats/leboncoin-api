const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/isAuthenticated");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

const Offer = require("../models/Offer.js");
const User = require("../models/User.js");
const Transaction = require("../models/Transaction.js");

router.post("/pay", isAuthenticated, async (req, res) => {
  const stripeToken = req.fields.stripeToken;

  try {
    //   Créer la transaction
    const response = await stripe.charges.create({
      amount: req.fields.amount,
      currency: "eur",
      description: req.fields.title,
      source: stripeToken,
    });

    const userData = await User.findById(req.fields.userRefId);
    const offerData = await Offer.findOne({ _id: req.fields.offerId });

    const transaction = await new Transaction({
      created: Date(),
      description: req.fields.title,
      currency: req.fields.currency,
      amount: req.fields.amount,
      product: offerData,
      buyer: userData,
    });
    await transaction.save();

    res.status(200).json(response);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
