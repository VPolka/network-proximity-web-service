from http_error import HttpError, make_http_error
from send_response import send_post_succsess, send_error_with_message

import json
import sqlite3 as sql

def get_course_info_from_request(conn):
    try:
        length = int(conn.headers.getheader('Content-Length'))
        request_data = conn.rfile.read(length)
        return json.loads(request_data)
    except KeyError as error:
        raise make_http_error(404)

def create_course_handler(conn):
    try:
        course_info = get_course_info_from_request(conn)

        con = sql.connect('data/data.db')
        with con:
            cur = con.cursor()

            cur.execute("SELECT * FROM courses WHERE name='%(name)s'" % {
                "name": course_info["course_name"]
            })
            course = cur.fetchall()
            if (course):
                con.commit()
                cur.close()
                send_error_with_message(conn, HttpError(404), "This course has already been created")
                return

            cur.execute("INSERT INTO courses VALUES ('%(name)s', '%(address)s', '[]', '{}')" % {
                "name": course_info["course_name"],
                "address": course_info["device_address"]
            })

            cur.execute("SELECT courses FROM users WHERE id='%(id)s'" % {
                "id": course_info["device_address"]
            })
            courses_str = cur.fetchone()[0]
            courses = json.loads(courses_str)
            courses.append(course_info["course_name"])

            cur.execute("UPDATE users SET courses='%(courses)s' WHERE id='%(id)s'" % {
                "courses": json.dumps(courses),
                "id": course_info["device_address"]
            })

            con.commit()
            cur.close()
        
        send_post_succsess(conn, "Course created")
    except HttpError as error:
        raise error