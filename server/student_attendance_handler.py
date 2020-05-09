from http_error import HttpError
from send_response import send_get_succsess

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

def student_attendance_handler(conn):
    try:
        request = get_info_from_request(conn)
        attendance_str = None

        con = sql.connect('data/data.db')
        with con:
            cur = con.cursor()
            cur.execute("SELECT attendance FROM courses WHERE name='%(name)s'" % {
                "name": request["course"]
            })
            attendance_str = cur.fetchone()[0]
            con.commit()
            cur.close()

        attendance = ast.literal_eval(attendance_str)

        result = dict()
        dates = attendance.keys()
        for date in dates:
            result[date] = 1 if request["device_address"] in attendance[date] else 0

        print(result)
        send_get_succsess(conn, json.dumps(result))

    except HttpError as error:
        raise error