import os, base64


class SessionStore:
    def __init__(self):
        # initialize our data
        self.session_data = {}

    def generate_session_id(self):
        # generate large random number for session id
        # this is like the number on the sticky note
        rnum = os.urandom(32)
        print(rnum)
        rstr = base64.b64encode(rnum).decode("utf-8")
        return rstr
    

    def create_session(self):
        # make a new session id
        session_id = self.generate_session_id()
        self.session_data[session_id] = {}
        return session_id

    def get_session_data(self, session_id):
        # retrieve an existing session from the store
        if session_id in self.session_data:
            return self.session_data[session_id]
        else:
            return None
            

