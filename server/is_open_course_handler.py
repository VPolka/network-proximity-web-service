from http_error import HttpError
from send_response import send_get_succsess

import re
import sqlite3 as sql
import json

def is_open_course_handler(conn):
    try:
        length = int(conn.headers.getheader('Content-Length'))
        course = conn.rfile.read(length)
        
        con = sql.connect('data/data.db')
        with con:
            cur = con.cursor()
            cur.execute("SELECT * FROM open_courses WHERE name='%(name)s'" % {"name": course})
            result = cur.fetchone()
            if result:
                cur.execute("SELECT owner_address FROM courses WHERE name='%(name)s'" % {"name": course})
                owner_address = cur.fetchone()[0]
                send_get_succsess(conn, json.dumps({"course": "open", "owner_address": owner_address}))
            else:
                send_get_succsess(conn, json.dumps({"course": "close"}))
            con.commit()
            cur.close()

    except HttpError as error:
        raise error