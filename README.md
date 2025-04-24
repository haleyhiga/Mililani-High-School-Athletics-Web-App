Mililani High School Athletics Web Application
----------------------------------------------

# How To Run Locally
Requires Python 3.9+, 'pip', SQLite, Flask, Flask-mail, Passlib, and Stripe.
In order to collect payments, go to stripe.com and create an account.  Once the account is created, you will need to use the Stripe secret key in server.py.  You will also need the publishable key, and use that in payment.js.  For email confirmations, you will need to create a gmail account, set up app passwords, and use that for the MAIL_USERNAME and MAIL_PASSWORD in server.py.

1. Clone this repo: https://github.com/haleyhiga/MHS-Athletics-Web-App
2. Create a virtual environment: (to protect app passwords, stripe keys, etc)
- python -m venv venv
- source venv/bin/activate 
3. Install the dependencies: 
- pip install -r requirements.txt
4. Create a .env file within the directory that contains:
- MAIL_USERNAME=yourgmail@gmail.com
- MAIL_PASSWORD=yourapppassword
- STRIPE_SECRET_KEY=sk_test_key
4. Run the app via:
- python server.py





# Technical Overview

# Frontend Stack:
	For the frontend, I used HTML/CSS/Javascript, and also used Vue.js 3 (CDN) for the user to interact with dynamically.  Vue.js 3 was used to manage states for things such as the product lists, shopping cart, and admin features.  Vanilla JS was used for adding logic in some areas such as adding to cart on the dynamic product detail pages.  LocalStorage was used to store the cart data for the client, as well as persisting across sessions.  I used Vue bindings to create products and edit products.  I also used SwiperJS for the slider on the home page.

# Backend Stack:
	For the backend, I used Python using Flask.  Flask was used for accessing databases, managing sessions, email order confirmations, and integrating Stripe.  It was also used for handling routes, API endpoints, serving static files, setting up sessions, and response headers.  An example of using Flask would be for retrieving products.  The products are fetched from the backend using GET /products, which will then query the database and returns structured JSON to the frontend.   
    Stripe Python SDK was used for handling payments securely using payment intents and for the checkout process of the client.  The frontend will send the cart and the information of the user to the Flask backend, then Flask will create a Stripe payment intent.  When an order is placed, the order details will then be stored in the database, the cart will then be cleared, and the email confirmation will then be sent. Flask-Mail was used to send automated order confirmation emails after the user had submitted their form of payment and the order was successful. 
    Passlib bcrypt was used for authentication, it hashes and verifies the passwords of the admin.  I have a custom session class which will track and persist the admin login state using Bearer tokens.  Admin operations such as creating, deleting, and editing products will only be available to admins that were authenticated using that Bearer token.  Depending on the operation it will be either a POST, PUT, or DELETE request.
    For the database, I used SQLite.  This was used for storing data for products, admin credentials (only shows the hash of the passwords), as well as orders and order information.  This is stored in three separate databases, store_db.db, order_db.db, and admin_db.db.
    For security purposes, I have used CORS headers, content security policies, and authentication checks from Flask.  I also used environment variables to store the password and username for my email confirmations, as well as the stripe API key.
