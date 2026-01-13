let cart = [];
let walletBalance = 1000;
let scanning = false;

/* ---------------- STATUS ---------------- */
function setStatus(msg) {
  document.getElementById("status").innerText = msg;
}

/* ---------------- START SCAN ---------------- */
function startScan() {
  if (scanning) return;
  scanning = true;

  setStatus("📷 Scanning barcode...");
  const scannerDiv = document.getElementById("scanner");

  /* 🔥 HARD RESET (THIS FIXES EVERYTHING) */
  try {
    Quagga.stop();
    Quagga.offDetected(onDetected);
  } catch (e) {}

  scannerDiv.innerHTML = "";

  Quagga.init({
    inputStream: {
      type: "LiveStream",
      target: scannerDiv,
      constraints: {
        facingMode: "environment",
        width: { min: 640 },
        height: { min: 480 }
      }
    },
    locator: {
      patchSize: "medium",
      halfSample: true
    },
    numOfWorkers: 2,
    frequency: 10,
    decoder: {
      readers: ["ean_reader"]
    },
    locate: true
  }, err => {
    if (err) {
      console.error(err);
      setStatus("❌ Camera error");
      scanning = false;
      return;
    }
    Quagga.start();
  });

  Quagga.onDetected(onDetected);
}

/* ---------------- ON DETECT ---------------- */
function onDetected(result) {
  const barcode = result.codeResult.code;

  console.log("SCANNED BARCODE:", barcode);

  Quagga.offDetected(onDetected);
  Quagga.stop();
  scanning = false;

  document.getElementById("scanner").innerHTML =
    "✅ Scan complete. Click Start Scan to scan next item.";

  setStatus("✅ Scanned: " + barcode);

  /* 🔗 FETCH PRODUCT FROM DB */
  fetch(`http://localhost:3000/product/${barcode}`)
    .then(res => res.json())
    .then(product => {
      if (!product) {
        setStatus("❌ Scanned but product not in database");
        return;
      }

      cart.push(product);
      updateCart();
      setStatus(`🛒 Added ${product.name} (₹${product.price})`);
    })
    .catch(() => {
      setStatus("❌ Backend not reachable");
    });
}

/* ---------------- CART ---------------- */
function updateCart() {
  const list = document.getElementById("cart-items");
  const totalEl = document.getElementById("total");

  list.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    total += item.price;
    list.innerHTML += `<li>${item.name} - ₹${item.price}</li>`;
  });

  totalEl.innerText = total;
}

/* ---------------- WALLET PAYMENT ---------------- */
function payNow() {
  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  const total = cart.reduce((sum, p) => sum + p.price, 0);

  if (walletBalance < total) {
    alert("❌ Insufficient wallet balance");
    return;
  }

  walletBalance -= total;
  document.getElementById("balance").innerText = walletBalance;

  setStatus("💰 Payment successful (Cashless Wallet)");
  generateQR(total);
}

/* ---------------- QR ---------------- */
function generateQR(totalAmount) {
  const bill = {
    items: cart,
    total: totalAmount,
    payment: "CASHLESS_TOKEN",
    remaining_balance: walletBalance,
    time: new Date().toISOString()
  };

  document.getElementById("qrBox").innerHTML = "";
  new QRCode(document.getElementById("qrBox"), {
    text: JSON.stringify(bill),
    width: 200,
    height: 200
  });

  cart = [];
  updateCart();
}
