const mongoose = require("mongoose");

const BillSchema = new mongoose.Schema({
  products: Array,
  total: Number,
  paymentId: String,
  orderId: String,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Bill", BillSchema);
