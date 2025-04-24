document.addEventListener("DOMContentLoaded", async () => {
    // publishable test key from Stripe
    const stripe = Stripe("pk_test_51Qvp0L01pNu8pFsBtV2Q33LZAzFu8zAoJQDfEUhktMkJtrNXhyx94QIYQM2B7qb0WkgAFp81NdB71Oer5orXJ8IM00YpCBQcmG");
    
    // stripe elements instance for card UI components
    const elements = stripe.elements();
  
    // create input fields for the card number, expiration date, and the CVC
    const cardNumber = elements.create("cardNumber");
    const cardExpiry = elements.create("cardExpiry");
    const cardCvc = elements.create("cardCvc");


    // get cart from localstorage
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
  
    // mount srtipe elements to the DOM
    cardNumber.mount("#card-number");
    cardExpiry.mount("#card-expiry");
    cardCvc.mount("#card-cvc");
  
    // RENDER ORDER SUMMARY ON CHECKOUT PAGE
    const orderSummaryContainer = document.getElementById("order-summary");
    // display to the user if the cart is empty
    if (cart.length === 0) {
      orderSummaryContainer.innerHTML = "<p>Your cart is empty.</p>";
    } else {
        // create rows for the items in the cart
      const summaryHTML = cart.map(item => `
        <div class="order-item">
          <span>${item.product_name} x${item.quantity || 1}</span>
          <span>$${(item.price * (item.quantity || 1)).toFixed(2)}</span>
        </div>
      `).join("");
  
      // calculate the total
      const totalAmount = cart.reduce((total, item) => total + parseFloat(item.price) * (item.quantity || 1), 0);
  
      // put summary and total into DOM
      orderSummaryContainer.innerHTML = `
        ${summaryHTML}
        <hr>
        <div class="order-item" style="font-weight: bold;">
          <span>Total</span>
          <span>$${totalAmount.toFixed(2)}</span>
        </div>
      `;
    }
  
    // checkout button click events
    document.getElementById("checkout-button").addEventListener("click", async (e) => {
      e.preventDefault();
  
      // get the total in cents (since Stripe needs cents)
      const totalAmount = cart.reduce((total, item) => total + parseFloat(item.price) * (item.quantity || 1), 0) * 100;
  
      // get customer info
      const firstName = document.getElementById("first-name").value.trim();
      const lastName = document.getElementById("last-name").value.trim();
      const email = document.getElementById("email").value.trim();
      const address = document.getElementById("address").value.trim();
  
      // make sure they enter all these required fields
      if (!firstName || !lastName || !email || !address) {
        alert("Please fill in all fields.");
        return;
      }


      // get the payment intent from the backend
      const response = await fetch("http://localhost:8080/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount })
      });
  
      const data = await response.json();
  
      // debugging (if i get errors creating the intent)
      if (data.error) {
        document.getElementById("payment-message").innerText = data.error;
        document.getElementById("payment-message").style.display = "block";
        return;
      }
  
      // continue card confirmation
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
  
      // if i get Stripe errors
      if (error) {
        document.getElementById("payment-message").innerText = error.message;
        document.getElementById("payment-message").style.display = "block";
      } else {
        alert("Payment successful!");
  
        // tell backend to send order confirmation
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
  
        // save the order details to display in the success.html
        localStorage.setItem("orderDetails", JSON.stringify({
          transactionId: paymentIntent.id,
          total: (totalAmount / 100).toFixed(2),
          items: cart
        }));
  
        // clear cart and redirect to success.html
        localStorage.removeItem("cart");
        window.location.href = "success.html";
      }
    });
  });
  