from user_handler import user_handler
from registration_handler import registration_handler
from create_course_handler import create_course_handler
from courses_handler import courses_handler
from is_open_course_handler import is_open_course_handler
from open_course_handler import open_course_handler
from close_course_handler import close_course_handler
from delete_course_handler import delete_course_handler
from teacher_attendance_handler import teacher_attendance_handler
from subscribe_course_handler import subscribe_course_handler
from subscribe_handler import subscribe_handler
from unsubscribe_course_handler import unsubscribe_course_handler
from student_attendance_handler import student_attendance_handler

from http_error import HttpError
from send_response import send_error, send_error_bad_request

import BaseHTTPServer, SimpleHTTPServer
from BaseHTTPServer import BaseHTTPRequestHandler
import ssl

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        print(self.requestline)
        try:
            if self.path == "/user":
                user_handler(self)
            elif self.path == "/registration":
                registration_handler(self)
            elif self.path == "/create_course":
                create_course_handler(self)
            elif self.path == "/courses":
                courses_handler(self)
            elif self.path == "/is_open_course":
                is_open_course_handler(self)
            elif self.path == "/open_course":
                open_course_handler(self)
            elif self.path == "/close_course":
                close_course_handler(self)
            elif self.path == "/delete_course":
                delete_course_handler(self)
            elif self.path == "/teacher_attendance":
                teacher_attendance_handler(self)
            elif self.path == "/subscribe_course":
                subscribe_course_handler(self)
            elif self.path == "/subscribe":
                subscribe_handler(self)
            elif self.path == "/unsubscribe_course":
                unsubscribe_course_handler(self)
            elif self.path == "/student_attendance":
                student_attendance_handler(self)
            else:
                send_error_bad_request(self)
        except HttpError as error:
            send_error(self, error)
        except:
            send_error(self, HttpError(500))


httpd = BaseHTTPServer.HTTPServer(('localhost', 4443), Handler)
httpd.socket = ssl.wrap_socket (httpd.socket, certfile='./server.pem', server_side=True)
httpd.serve_forever()