from admin import Admin
from passlib.hash import bcrypt
from datetime import datetime
from flask import Flask, request, g, render_template, send_from_directory, url_for, jsonify
from flask_mail import Mail, Message
from session_store import SessionStore
from store import Store
import stripe
import os
from dotenv import load_dotenv
load_dotenv()  # loads environment variables from .env


app = Flask(__name__, template_folder="templates", static_folder="../client")
session_store = SessionStore()

# MAIL SECTION FOR ORDER CONFIRMATIONS
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_DEFAULT_SENDER'] = app.config['MAIL_USERNAME']







mail = Mail(app)



def load_session_data():
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        session_id = auth_header.removeprefix("Bearer ")
    else:
        session_id = None
    
    if session_id:
        session_data = session_store.get_session_data(session_id)
        print("loaded session data", session_data)

    # if the session ID is either missing or session data is invalid
    if session_id == None or session_data == None:
        # create a new session and session ID
        session_id = session_store.create_session()
        # load the session with the new session ID
        session_data = session_store.get_session_data(session_id)
        print("created session data", session_data)

    g.session_id = session_id
    g.session_data = session_data






@app.route('/images/<path:filename>')
def serve_images(filename):
    return send_from_directory("client", filename)

@app.route("/products/<int:product_id>")
def product_details(product_id):
    from store import Store
    db = Store("store_db.db")
    product = db.getSingleProduct(product_id)
    
    if product:
        return render_template("product_details.html", product=product)
    else:
        return f"Product with ID {product_id} not found", 404

@app.before_request
def before_request_func():
    if request.method == "OPTIONS":
        response = app.response_class("", status=204)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
 
        response.headers["Content-Security-Policy"] = "sandbox allow-scripts allow-same-origin allow-forms allow-modals"

        return response
    load_session_data()


@app.after_request
def after_request_func(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Content-Security-Policy"] = "sandbox allow-scripts allow-same-origin allow-forms allow-modals"

    return response


@app.route("/products", methods=["GET"])
def retrieve_products():
    db = Store("store_db.db")
    products = db.getProducts()
    print("Products fetched from database:", products) 
    return {"products": products}, 200, {"Access-Control-Allow-Origin": "*"}


# create a product
@app.route("/products", methods=["POST"])
def create_product():
    if not is_admin_logged_in():
        return {"message": "Unauthorized"}, 401
    
    db = Store("store_db.db")
    product_name = request.form["product_name"]
    product_desc = request.form["product_desc"]
    price = request.form["price"]
    quantity = request.form["quantity"]
    image = request.form["image"]

    db.createProduct(product_name, product_desc, price, quantity, image)
    return {"message": "Product created"}, 201




@app.route("/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    if not is_admin_logged_in():
        return {"message": "Unauthorized"}, 401

    db = Store("store_db.db")
    product = db.getSingleProduct(product_id)
    
    if product:
        product_name = request.form["product_name"]
        product_desc = request.form["product_desc"]
        price = request.form["price"]
        quantity = request.form["quantity"]
        image = request.form["image"]
        db.updateProduct(product_id, product_name, product_desc, price, quantity, image)
        return {"message": "Product updated"}, 200
    else:
        return {"message": "Product not found"}, 404


@app.route("/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    if not is_admin_logged_in():
        return {"message": "Unauthorized"}, 401

    db = Store("store_db.db")
    product = db.getSingleProduct(product_id)
    
    if product:
        db.deleteProduct(product_id)
        return {"message": "Product deleted"}, 200
    else:
        return {"message": "Product not found"}, 404


@app.route("/sessions/logout", methods=["POST"])
def logout():
    g.session_data.clear()  
    return {"message": "Logged out"}, 200



# ADMIN LOGIN
@app.route("/sessions/admins", methods=["GET"])
def retrieve_session():
    return {
        'id': g.session_id,
        'data': g.session_data
    }


@app.route("/sessions/auth", methods=["POST"])
def login():
    db = Admin("admin_db.db")
    username = request.form.get("username")
    password = request.form.get("password")

    admin = db.getSingleAdmin(username)
    if admin:
        if bcrypt.verify(password, admin["password"]):
            session_id = session_store.create_session()
            session_store.session_data[session_id]["admin_id"] = admin["admin_id"]

            return {"message": "Authenticated", "session_id": session_id}, 200
        else:
            return {"message": "Invalid password"}, 401
    else:
        return {"message": "Admin not found"}, 404


@app.route("/admins", methods=["POST"])
def create_admin():
    db = Admin("admin_db.db")
    
    username = request.form["username"]
    password = request.form["password"]
    

    encrypted_password = bcrypt.hash(password)
    
    db.createAdmin(username, encrypted_password)
    
    return "Admin Created", 201, {"Access-Control-Allow-Origin": "*"}

def is_admin_logged_in():
    return g.session_data and g.session_data.get("admin_id") is not None  



@app.route("/submit-order", methods=["POST"])
def submit_order():
    data = request.get_json()
    cart = data["cart"]  # [{'id': 1, 'quantity': 2}, etc]

    email = data["email"]
    first = data.get("first_name", "")
    last = data.get("last_name", "")
    address = data.get("address", "")

    product_db = Store("store_db.db")   
    order_db = Store("order_db.db")     

    total = 0
    order_id = order_db.createOrder(email, datetime.now())  

    for item in cart:
        product = product_db.getSingleProduct(item["id"])
        if product:
            print("there is product")
            print(item)
            price = float(product["price"]) * item["quantity"]
            total += price
            order_db.addOrderItem(order_id, item["id"], item["quantity"])

    order_db.updateOrderTotal(order_id, total)

    send_order_email(email, order_id)  # notify user the order confirmation

    return {"message": "Order placed"}, 200



def send_order_email(to_email, order_id):
    order_db = Store("order_db.db")
    product_db = Store("store_db.db")


    order_db.cursor.execute("""
        SELECT product_id, quantity
        FROM order_items
        WHERE order_id = ?
    """, [order_id])
    order_items = order_db.cursor.fetchall()

    total = 0
    item_list = ""

    for item in order_items:
        product = product_db.getSingleProduct(item["product_id"])
        if not product:
            continue

        name = product["product_name"]
        unit_price = float(product["price"])
        quantity = item["quantity"]
        item_total = unit_price * quantity

        total += item_total
        item_list += f"<li>{name} x{quantity} — ${item_total:.2f}</li>"

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
        <style>
            body {{
            font-family: Arial, sans-serif;
            background-color: #f8f8f8;
            color: #333;
            padding: 20px;
            }}
            .container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            padding: 20px;
            }}
            h2 {{
            color: #552C00;
            margin-bottom: 20px;
            }}
            ul {{
            padding-left: 20px;
            }}
            li {{
            margin-bottom: 10px;
            }}
            .total {{
            font-size: 18px;
            font-weight: bold;
            margin-top: 20px;
            }}
            .footer {{
            margin-top: 30px;
            font-size: 14px;
            color: #777;
            text-align: center;
            }}
        </style>
        </head>
        <body>
        <div class="container">

            <h2>Thank you for your order from MHS Athletics!</h2>
            <p>Here’s a summary of your purchase:</p>
            <ul>{item_list}</ul>
            <p class="total">Total: ${total:.2f}</p>
            <p>We’ll notify you once your order is processed and ready for pickup or delivery.</p>
            <div class="footer">
            <p>Mililani High School Athletics</p>
            <p>95-1200 Meheula Parkway, Mililani, HI 96789</p>
            <p>(808) 307-4200</p>
            </div>
        </div>
        </body>
        </html>
        """

    msg = Message("MHS Order Confirmation", recipients=[to_email], html=html_body)
    mail.send(msg)









# PAYMENT SECTION
# my secret key
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

@app.route("/create-payment-intent", methods=["POST"])
def create_payment_intent():
    try:
        data = request.get_json()
        print("Received Data:", data)

        if not data or "amount" not in data:
            return jsonify({"error": "Invalid request. Missing 'amount' field."}), 400

        amount = int(data["amount"])  # Convert amount to cents

        if amount <= 0:
            return jsonify({"error": "Invalid payment amount. Must be greater than 0."}), 400

        # create paymentintent in stripe
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency="usd",
            payment_method_types=["card"]
        )

        print("PaymentIntent Created:", intent) 

        return jsonify({"clientSecret": intent["client_secret"]})

    except stripe.error.AuthenticationError as e:
        print("Authentication Error:", str(e))
        return jsonify({"error": "Invalid Stripe API key. Check your keys."}), 401

    except stripe.error.APIConnectionError as e:
        print("Network Error:", str(e))
        return jsonify({"error": "Network error. Check your internet connection."}), 503

    except Exception as e:
        print("Unexpected Error:", str(e))
        return jsonify({"error": str(e)}), 400


@app.route("/success")
def payment_success():
    return "<h1>Payment Successful!</h1>"



@app.route('/client/<path:filename>')
def serve_client_files(filename):
    return send_from_directory("client", filename)


def run():
    app.run(port=8080, host='0.0.0.0')

if __name__ == "__main__":
    run()