from http_error import HttpError
from send_response import send_post_succsess

import re
import sqlite3 as sql
import json
import ast

def get_course_info_from_request(conn):
    try:
        length = int(conn.headers.getheader('Content-Length'))
        request_data = conn.rfile.read(length)
        return ast.literal_eval(request_data)
    except KeyError as error:
        raise make_http_error(404)

def open_course_handler(conn):
    try:
        course_info = get_course_info_from_request(conn)

        con = sql.connect('data/data.db')
        with con:
            cur = con.cursor()
            cur.execute("INSERT INTO open_courses VALUES ('%(name)s', '%(date)s', '{}')" % {
                "name": course_info["course_name"],
                "date": course_info["course_date"]
            })
            con.commit()
            cur.close()

        send_post_succsess(conn, "Course opened")
    except HttpError as error:
        raise error