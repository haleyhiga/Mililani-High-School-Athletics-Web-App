from flask import Flask, request, g, render_template
from store import Store


app = Flask(__name__)


@app.before_request
def before_request_func():
    if request.method == "OPTIONS":
        response = app.response_class("", status=204)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content, Authorization"
        return response

@app.after_request
def after_request_func(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content, Authorization"
    return response


@app.route("/products", methods=["GET"])
def retrieve_products():
    db = Store("store_db.db")
    products = db.getProducts()
    print("Products fetched from database:", products)  # Debugging step
    return {"products": products}, 200, {"Access-Control-Allow-Origin": "*"}


# create a product
@app.route("/products", methods=["POST"])
def create_product():
    db = Store("store_db.db")
    product_name = request.form["product_name"]
    product_desc = request.form["product_desc"]
    price = request.form["price"]
    quantity = request.form["quantity"]
    image = request.form["image"]
    db.createProduct(product_name, product_desc, price, quantity, image)
    return "Created", 201, {"Access-Control-Allow-Origin":"*"}


@app.route("/products/<int:product_id>",methods=["PUT"]) 
def update_product(product_id):
    db = Store("store_db.db")
    product = db.getSingleProduct(product_id)
    print("product",product)
    if product: 
        print("update product with ID", product_id)
        product_name = request.form["product_name"]
        product_desc = request.form["product_desc"]
        price = request.form["price"]
        quantity = request.form["quantity"]
        image = request.form["image"]
        db.updateProduct(product_id, product_name, product_desc, price, quantity, image)
        return "Update", 200, {"Access-Control-Allow-Origin":"*"}
    else:
        return f"Product {product_id}  not found", 404, {"Access-Control-Allow-Origin":"*"}

@app.route("/products/<int:product_id>",methods=["DELETE"])
def delete_product(product_id):
    db = Store("store_db.db")
    product = db.getSingleProduct(product_id)
    print("product_id",product)
    print("deleted homework with ID:",product_id)
    if product:
        db.deleteProduct(product_id)
        return "Deleted", 200,{"Access-Control-Allow-Origin":"*"}
    else:
        return f"Product {product_id} not found", 404, {"Access-Control-Allow-Origin":"*"}

@app.route("/products/<int:product_id>")
def product_details(product_id):
    db = Store("store_db.db")
    product = db.getSingleProduct(product_id)
    if product:
        return render_template("product_details.html", product=product)
    else:
        return f"Product with ID {product_id} not found", 404


def run():
    app.run(port=8080, host='0.0.0.0')

if __name__ == "__main__":
    run()