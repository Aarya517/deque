let cart = [];

function startScan() {
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
  fetch("http://localhost:3000/pay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cart })
  })
  .then(res => res.json())
  .then(data => {
    new QRCode(document.getElementById("qr"), JSON.stringify(data));
  });
}
