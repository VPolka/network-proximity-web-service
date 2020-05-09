from http_error import HttpError, make_http_error
from send_response import send_post_succsess, send_error_with_message

import json
import sqlite3 as sql
import ast

def get_course_info_from_request(conn):
    try:
        length = int(conn.headers.getheader('Content-Length'))
        request_data = conn.rfile.read(length)
        return ast.literal_eval(request_data)
    except KeyError as error:
        raise make_http_error(404)

def subscribe_course_handler(conn):
    try:
        course_info = get_course_info_from_request(conn)

        con = sql.connect('data/data.db')
        with con:
            cur = con.cursor()

            cur.execute("SELECT students FROM courses WHERE name='%(name)s'" % {
                "name": course_info["course_name"]
            })
            students_str = cur.fetchone()
            if (not students_str):
                con.commit()
                cur.close()
                send_error_with_message(conn, HttpError(404), "No such course")
                return
            
            students = ast.literal_eval(students_str[0])
            cur.execute("UPDATE courses SET students='%(students)s' WHERE name='%(name)s'" % {
                "students": json.dumps(students),
                "name": course_info["course_name"]
            })

            cur.execute("SELECT courses FROM users WHERE id='%(id)s'" % {
                "id": course_info["device_address"]
            })
            courses_str = cur.fetchone()[0]
            courses = ast.literal_eval(courses_str)
            courses.append(course_info["course_name"])

            cur.execute("UPDATE users SET courses='%(courses)s' WHERE id='%(id)s'" % {
                "courses": json.dumps(courses),
                "id": course_info["device_address"]
            })

            con.commit()
            cur.close()
        
        send_post_succsess(conn, "Course subscribed")
    except HttpError as error:
        raise error