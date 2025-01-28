from flask import Flask, request, g
from store import Store



app = Flask(__name__)




@app.route("/products", methods=["GET"])
def retrieve_products():
    db = Store("store_db.db")
    products = db.getProducts()
    return products, 200, {"Access-Control-Allow-Origin":"*"}



def run():
    app.run(port=8080, host='0.0.0.0')

if __name__ == "__main__":
    run()