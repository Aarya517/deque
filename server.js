const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const products = {
  "8901234567890": { name: "Milk", price: 52, rfid: "RFID001" }
};

let paidBills = {};

app.get("/product/:barcode", (req, res) => {
  res.json(products[req.params.barcode]);
});

app.post("/pay", (req, res) => {
  const billId = "BILL" + Date.now();
  const rfids = req.body.cart.map(p => p.rfid);

  paidBills[billId] = rfids;

  res.json({ billId, rfids });
});

app.get("/verify/:billId", (req, res) => {
  res.json({ rfids: paidBills[req.params.billId] || [] });
});

app.listen(3000, () => console.log("Server running"));

