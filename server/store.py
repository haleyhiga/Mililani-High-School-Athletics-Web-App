import sqlite3
from datetime import datetime

def dict_factory(cursor, row):
    fields = []
    # extract column names from cursor description
    for column in cursor.description:
        fields.append(column[0])

    # create a dictionary where keys are column names and values are row values
    result_dict = {}
    for i in range(len(fields)):
        result_dict[fields[i]] = row[i]

    return result_dict

class Store:
    def __init__(self,filename):
        #connect to DB file
        self.connection = sqlite3.connect(filename)
        self.connection.row_factory = dict_factory
        #use the connection instance to perform db operations
        #create a cursor insaance for the connection
        self.cursor = self.connection.cursor()    


    def getProducts(self):
        #now that we have an acess point we can fetch all of or one
        #ONLY applicable use of fetch is following a select query
        self.cursor.execute("SELECT * FROM store")
        #goes and gets an array 
        products = self.cursor.fetchall()
        return products
    

    def createProduct(self, product_name, product_desc, price, quantity, image):
        data = [product_name, product_desc, price, quantity, image]
        #add a new rollercoaster to ur db
        self.cursor.execute("INSERT INTO store (product_name, product_desc, price, quantity, image) VALUES (?,?,?,?, ?)", data)
        self.connection.commit() #saves the insert
        return


    def getSingleProduct(self,product_id):
        data = [product_id]
        self.cursor.execute("SELECT * FROM store WHERE product_id = ?",data)
        #goes and gets an array 
        product = self.cursor.fetchone()
        return product
    

    def updateProduct(self, product_id, product_name, product_desc, price, quantity, image):
        data = [product_name, product_desc, price, quantity, image, product_id]
        self.cursor.execute("UPDATE store SET product_name = ?, product_desc = ?, price = ?, quantity = ?, image = ? WHERE product_id = ?", data)
        self.connection.commit()
        return
    

    def deleteProduct(self, product_id):
        data = [product_id]
        self.cursor.execute("DELETE FROM store WHERE product_id = ?", data)
        self.connection.commit()
        return


    # FOR ORDERS
    def createOrder(self, email, timestamp):
        timestamp = datetime.now().isoformat()
        self.cursor.execute("INSERT INTO orders (email, total, created_at) VALUES (?, ?, ?)", [email, 0.0, timestamp])
        self.connection.commit()
        return self.cursor.lastrowid

    def addOrderItem(self, order_id, product_id, quantity):
        self.cursor.execute("INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)", [order_id, product_id, quantity])
        self.connection.commit()

    def getOrderItems(self, order_id):
        self.cursor.execute("""
            SELECT p.product_name, p.price, oi.quantity
            FROM order_items oi
            JOIN store p ON oi.product_id = p.product_id
            WHERE oi.order_id = ?
        """, [order_id])
        return self.cursor.fetchall()

    def updateOrderTotal(self, order_id, total):
        self.cursor.execute("UPDATE orders SET total = ? WHERE order_id = ?", [total, order_id])
        self.connection.commit()