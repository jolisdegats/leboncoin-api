const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/isAuthenticated");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

router.post("/pay", isAuthenticated, async (req, res) => {
  const stripeToken = req.fields.stripeToken;

  //   Créer la transaction
  const response = await stripe.charges.create({
    amount: req.fields.amount,
    currency: "eur",
    description: req.fields.title,
    source: stripeToken,
  });

  res.json(response);
});

module.exports = router;
