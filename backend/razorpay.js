const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: "rzp_test_XXXXXXXX",
  key_secret: "XXXXXXXXXXXX"
});

module.exports = razorpay;
