from http_error import HttpError
from send_response import send_get_succsess

import re
import sqlite3 as sql

def get_user_from_request(conn):
    length = int(conn.headers.getheader('Content-Length'))
    request_data = conn.rfile.read(length)
    template_device_id = '(^([0-9A-F]{2}:){5}[0-9A-F]{2}$)'
    user = re.search(template_device_id, request_data)
    if user:
        return user.group(0)
    raise HttpError(404)

def courses_handler(conn):
    try:
        user_target = get_user_from_request(conn)

        con = sql.connect('data/data.db')
        with con:
            cur = con.cursor()
            cur.execute("SELECT courses FROM users WHERE id='%(id)s'" % {"id": user_target})
            courses = cur.fetchone()
            send_get_succsess(conn, courses[0])
            con.commit()
            cur.close()

    except HttpError as error:
        raise error