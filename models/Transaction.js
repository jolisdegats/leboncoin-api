const mongoose = require("mongoose");

const Transaction = mongoose.model("Transaction", {
  created: Date,
  title: String,
  currency: String,
  amount: Number,
  picture: Object,
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = Transaction;
