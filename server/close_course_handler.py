from http_error import HttpError
from send_response import send_post_succsess

import re
import sqlite3 as sql
import json
import ast

def close_course_handler(conn):
    try:
        length = int(conn.headers.getheader('Content-Length'))
        course = conn.rfile.read(length)

        con = sql.connect('data/data.db')
        with con:
            cur = con.cursor()

            cur.execute("SELECT * FROM open_courses WHERE name='%(name)s'" % {"name": course})
            name, date, date_attendance = cur.fetchone()

            cur.execute("DELETE FROM open_courses WHERE name='%(name)s'" % {"name": course})

            cur.execute("SELECT attendance FROM courses WHERE name='%(name)s'" % {
                "name": course
            })
            attendance_str = cur.fetchone()[0]
            attendance = ast.literal_eval(attendance_str)
            attendance.update({date: ast.literal_eval(date_attendance)})
            print(attendance)

            cur.execute("UPDATE courses SET attendance='%(attendance)s' WHERE name='%(name)s'" % {
                "attendance": json.dumps(attendance),
                "name": course
            })

            con.commit()
            cur.close()

        send_post_succsess(conn, "Course closed")
    except HttpError as error:
        raise error