from http_error import HttpError
from send_response import send_post_succsess

import re
import sqlite3 as sql
import json

def get_info_from_request(conn):
    try:
        length = int(conn.headers.getheader('Content-Length'))
        request_data = conn.rfile.read(length)
        return json.loads(request_data)
    except KeyError as error:
        raise make_http_error(404)

def unsubscribe_course_handler(conn):
    try:
        request = get_info_from_request(conn)

        con = sql.connect('data/data.db')
        with con:
            cur = con.cursor()

            cur.execute("SELECT courses FROM users WHERE id='%(id)s'" % {
                "id": request["device_address"]
            })
            courses_str = cur.fetchone()[0]
            courses = json.loads(courses_str)
            courses.remove(request["course"])

            cur.execute("UPDATE users SET courses='%(courses)s' WHERE id='%(id)s'" % {
                "courses": json.dumps(courses),
                "id": request["device_address"]
            })

            con.commit()
            cur.close()

        send_post_succsess(conn, "Unsubscribed")
    except HttpError as error:
        raise error