from http_error import HttpError
from send_response import send_post_succsess

import re
import sqlite3 as sql
import json
import ast

def get_info_from_request(conn):
    try:
        length = int(conn.headers.getheader('Content-Length'))
        request_data = conn.rfile.read(length)
        return ast.literal_eval(request_data)
    except KeyError as error:
        raise make_http_error(404)

def subscribe_handler(conn):
    try:
        request = get_info_from_request(conn)
        
        con = sql.connect('data/data.db')
        with con:
            cur = con.cursor()
            cur.execute("SELECT students FROM open_courses WHERE name='%(name)s'" % {
                "name": request["course"]
            })
            students_str = cur.fetchone()[0]
            students = ast.literal_eval(students_str)
            
            cur.execute("SELECT name FROM users WHERE id='%(id)s'" % {
                "id": request["device_address"]
            })
            student_name = cur.fetchone()[0]

            students.update({request["device_address"]: student_name})
            cur.execute("UPDATE open_courses SET students='%(students)s' WHERE name='%(name)s'" % {
                "students": json.dumps(students),
                "name": request["course"]
            })

            send_post_succsess(conn, "Subscribed")

            con.commit()
            cur.close()

    except HttpError as error:
        raise error