document.addEventListener("DOMContentLoaded", async () => {
    const stripe = Stripe("pk_test_51Qvp0L01pNu8pFsBtV2Q33LZAzFu8zAoJQDfEUhktMkJtrNXhyx94QIYQM2B7qb0WkgAFp81NdB71Oer5orXJ8IM00YpCBQcmG");
    const elements = stripe.elements();
  
    const cardNumber = elements.create("cardNumber");
    const cardExpiry = elements.create("cardExpiry");
    const cardCvc = elements.create("cardCvc");
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
  
    cardNumber.mount("#card-number");
    cardExpiry.mount("#card-expiry");
    cardCvc.mount("#card-cvc");
  
    // RENDER ORDER SUMMARY
    const orderSummaryContainer = document.getElementById("order-summary");
    if (cart.length === 0) {
      orderSummaryContainer.innerHTML = "<p>Your cart is empty.</p>";
    } else {
      const summaryHTML = cart.map(item => `
        <div class="order-item">
          <span>${item.product_name} x${item.quantity || 1}</span>
          <span>$${(item.price * (item.quantity || 1)).toFixed(2)}</span>
        </div>
      `).join("");
  
      const totalAmount = cart.reduce((total, item) => total + parseFloat(item.price) * (item.quantity || 1), 0);
  
      orderSummaryContainer.innerHTML = `
        ${summaryHTML}
        <hr>
        <div class="order-item" style="font-weight: bold;">
          <span>Total</span>
          <span>$${totalAmount.toFixed(2)}</span>
        </div>
      `;
    }
  
    document.getElementById("checkout-button").addEventListener("click", async (e) => {
      e.preventDefault();
  
      const totalAmount = cart.reduce((total, item) => total + parseFloat(item.price) * (item.quantity || 1), 0) * 100;
  
      const firstName = document.getElementById("first-name").value.trim();
      const lastName = document.getElementById("last-name").value.trim();
      const email = document.getElementById("email").value.trim();
      const address = document.getElementById("address").value.trim();
  
      if (!firstName || !lastName || !email || !address) {
        alert("Please fill in all fields.");
        return;
      }
  
      const response = await fetch("http://localhost:8080/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount })
      });
  
      const data = await response.json();
  
      if (data.error) {
        document.getElementById("payment-message").innerText = data.error;
        document.getElementById("payment-message").style.display = "block";
        return;
      }
  
      const { clientSecret } = data;
  
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumber,
          billing_details: {
            name: `${firstName} ${lastName}`,
            email: email,
            address: { line1: address }
          }
        }
      });
  
      if (error) {
        document.getElementById("payment-message").innerText = error.message;
        document.getElementById("payment-message").style.display = "block";
      } else {
        alert("Payment successful!");
  
        await fetch("http://localhost:8080/submit-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            first_name: firstName,
            last_name: lastName,
            address,
            cart
          })
        });
  
// Used for the success.html
        localStorage.setItem("orderDetails", JSON.stringify({
          transactionId: paymentIntent.id,
          total: (totalAmount / 100).toFixed(2),
          items: cart
        }));
  
        localStorage.removeItem("cart");
        window.location.href = "success.html";
      }
    });
  });
  