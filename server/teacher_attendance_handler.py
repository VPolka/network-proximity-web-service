from http_error import HttpError
from send_response import send_get_succsess

import re
import sqlite3 as sql
import json
import ast

def teacher_attendance_handler(conn):
    try:
        length = int(conn.headers.getheader('Content-Length'))
        course = conn.rfile.read(length)
        attendance_str = None

        con = sql.connect('data/data.db')
        with con:
            cur = con.cursor()
            cur.execute("SELECT * FROM courses WHERE name='%(name)s'" % {
                "name": course
            })
            _, _, students_str, attendance_str = cur.fetchone()
            con.commit()
            cur.close()

        attendance = ast.literal_eval(attendance_str)
        students = ast.literal_eval(students_str)
        names = dict()
        for students_date in attendance:
            student_addresses = attendance[students_date].keys()
            for student_address in student_addresses:
                if attendance[students_date][student_address] not in names:
                    names[attendance[students_date][student_address]] = {student_address : 0}
                else:
                    name_size = len(names[attendance[students_date][student_address]])
                    names[attendance[students_date][student_address]].update({student_address : name_size})

        result = dict()
        dates = attendance.keys()
        for date in dates:
            result[date] = dict()
            for name in names:
                for student in names[name]:
                    result[date].update({name + (str(names[name][student]) if names[name][student] else "") : 
                        1 if (student in attendance[date] and attendance[date][student] == name) else 0})

        send_get_succsess(conn, json.dumps(result))

    except HttpError as error:
        raise error