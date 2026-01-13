let cart = [];
let scanning = false;

function startScan() {
  if (scanning) return;
  scanning = true;

  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: document.querySelector("#scanner"),
      constraints: {
        facingMode: "environment"
      }
    },
    decoder: {
      readers: ["ean_reader", "code_128_reader"]
    }
  }, err => {
    if (err) {
      console.error(err);
      scanning = false;
      return;
    }
    Quagga.start();
  });

  Quagga.onDetected(onDetected);
}

function onDetected(data) {
  const barcode = data.codeResult.code;
  Quagga.stop();
  scanning = false;

  fetch(`http://localhost:3000/product/${barcode}`)
    .then(res => res.json())
    .then(product => {
      if (!product) {
        alert("Product not found");
        return;
      }
      cart.push(product);
      updateCart();
    });
}

function updateCart() {
  const cartList = document.getElementById("cart-items");
  const totalEl = document.getElementById("total");

  cartList.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;
    cartList.innerHTML += `
      <li>
        ${item.name} - ₹${item.price}
      </li>
    `;
  });

  totalEl.innerText = total;
}

function pay() {
  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

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
          showQR(order.id);
        }
      };
      new Razorpay(options).open();
    });
}

function showQR(orderId) {
  document.getElementById("qr").innerHTML = "";
  new QRCode(document.getElementById("qr"), {
    text: `ORDER:${orderId}`,
    width: 200,
    height: 200
  });
}
