Mililani High School Athletics Web Application
----------------------------------------------


**Requirements:**
- Python 3.9+
- pip
- SQLite
- Flask
- Flask-Mail
- Passlib (bcrypt)
- Stripe

## How To Run Locally
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
- HTML / CSS / Javascript
- Vue.js 3 (via CDN)
- LocalStorage for cart persistance
- SwiperJS for homepage slider


# Backend Stack:
- Python + Flask
- Stripe Python SDK
- Flask-Mail for email confirmations
- Passlib bcrypt for admin authentication
- Custom session class (using Bearer tokens)
- SQLite for product, order, and admin data


# Security:
- CORS headers
- Content Security Policies (CSP)
- Authorization checks for admin endpoints
- Environment variables for all credentials