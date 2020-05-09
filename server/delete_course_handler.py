from http_error import HttpError
from send_response import send_post_succsess

import re
import sqlite3 as sql
import json

def delete_course_handler(conn):
    try:
        length = int(conn.headers.getheader('Content-Length'))
        course = conn.rfile.read(length)

        con = sql.connect('data/data.db')
        with con:
            cur = con.cursor()

            cur.execute("SELECT * FROM courses WHERE name='%(name)s'" % {"name": course})
            name, owner_address, students_str, _ = cur.fetchone()

            cur.execute("DELETE FROM courses WHERE name='%(name)s'" % {"name": course})

            cur.execute("SELECT courses FROM users WHERE id='%(id)s'" % {
                "id": owner_address
            })
            courses_str = cur.fetchone()[0]
            courses = json.loads(courses_str)
            courses.remove(name)

            cur.execute("UPDATE users SET courses='%(courses)s' WHERE id='%(id)s'" % {
                "courses": json.dumps(courses),
                "id": owner_address
            })

            students = json.loads(students_str)
            for student in students:
                cur.execute("SELECT courses FROM users WHERE id='%(id)s'" % {
                    "id": student
                })
                courses_str = cur.fetchone()
                if (not courses_str):
                    continue
                courses = json.loads(courses_str[0])
                courses.remove(name)

                cur.execute("UPDATE users SET courses='%(courses)s' WHERE id='%(id)s'" % {
                    "courses": json.dumps(courses),
                    "id": student
                })

            con.commit()
            cur.close()

        send_post_succsess(conn, "Course deleted")
    except HttpError as error:
        raise error