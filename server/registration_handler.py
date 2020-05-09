from http_error import HttpError, make_http_error
from send_response import send_post_succsess

import json
import sqlite3 as sql
import ast

def get_user_info_from_request(conn):
    try:
        length = int(conn.headers.getheader('Content-Length'))
        request_data = conn.rfile.read(length)
        return ast.literal_eval(request_data)
    except KeyError as error:
        raise make_http_error(404)

def registration_handler(conn):
    try:
        user_info = get_user_info_from_request(conn)

        con = sql.connect('data/data.db')
        with con:
            cur = con.cursor()
            cur.execute("INSERT INTO users VALUES ('%(id)s', '%(type)s', '%(name)s', '[]')" % {
                "id": user_info["device_address"],
                "type": user_info["user_type"],
                "name": user_info["user_name"]
            })
            con.commit()
            cur.close()
        
        send_post_succsess(conn, "User created")
    except HttpError as error:
        raise error