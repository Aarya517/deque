let cart = [];

function scan() {
  Quagga.init({
    inputStream: { name: "Live", type: "LiveStream", target: document.body },
    decoder: { readers: ["ean_reader"] }
  }, () => Quagga.start());

  Quagga.onDetected(data => {
    fetch(`http://localhost:3000/product/${data.codeResult.code}`)
      .then(res => res.json())
      .then(product => {
        cart.push(product);
        updateCart();
        Quagga.stop();
      });
  });
}

function updateCart() {
  document.getElementById("cart").innerHTML =
    cart.map(p => `<p>${p.name} - ₹${p.price}</p>`).join("");
}

function pay() {
  fetch("http://localhost:3000/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cart })
  })
  .then(res => res.json())
  .then(order => {
    const options = {
      key: "rzp_test_XXXXXXXX",
      amount: order.amount,
      currency: "INR",
      order_id: order.id,
      handler: function (response) {
        verifyPayment(response, order.amount / 100);
      }
    };
    new Razorpay(options).open();
  });
}

function verifyPayment(response, amount) {
  fetch("http://localhost:3000/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      paymentId: response.razorpay_payment_id,
      orderId: response.razorpay_order_id,
      signature: response.razorpay_signature,
      cart,
      amount
    })
  })
  .then(res => res.json())
  .then(bill => {
    new QRCode(document.getElementById("qr"), JSON.stringify({
      billId: bill._id,
      total: bill.total
    }));
  });
}
