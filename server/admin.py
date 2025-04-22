import sqlite3

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

class Admin:
    def __init__(self, filename):
        self.connection = sqlite3.connect(filename)
        self.connection.row_factory = dict_factory
        self.cursor = self.connection.cursor()

    def createAdmin(self, username, password):
        data = [username, password]
        self.cursor.execute("INSERT INTO admins (username, password) VALUES (?, ?)", data)
        self.connection.commit()

    def getAllAdmins(self):
        self.cursor.execute("SELECT * FROM admins")
        return self.cursor.fetchall()

    def getSingleAdmin(self, username):
        data = [username]
        self.cursor.execute("SELECT * FROM admins WHERE username = ?", data)
        admin = self.cursor.fetchone()
        return admin
