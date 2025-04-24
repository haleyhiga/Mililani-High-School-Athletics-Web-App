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
- HTML
- CSS
- Javascript
- Vue.js 3 (CDN)
- LocalStorage
- SwiperJS


# Backend Stack:
- Python
- Flask
- StripeJS
- Flask-Mail
- Passlib bcrypt
- Custom session class (using Bearer tokens)
- SQLite


# Security:
- CORS Headers
- Content Security Policies
- Authentication checks from Flask
- All sensitive information stored in environment variables