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

def user_handler(conn):
    try:
        user_target = get_user_from_request(conn)
        user_type = None

        con = sql.connect('data/data.db')
        with con:
            cur = con.cursor()
            cur.execute("SELECT type FROM users WHERE id='%(id)s'" % {"id": user_target})
            user_type = cur.fetchone()
            con.commit()
            cur.close()

        if user_type:
            send_get_succsess(conn, user_type[0])
        else:
            send_get_succsess(conn, "unknown")
    except HttpError as error:
        raise error
        """
        users = open('data/users.txt', 'r')
        user_existing_type= None
        for user in users:
            user_id, user_type = user.split(';')
            print(user_id, user_target)
            if (user_id == user_target):
                user_existing_type = user_type
                break
        if user_existing_type:
            send_get_succsess(conn, user_existing_type)
        else:
            send_get_succsess(conn, "unknown")
    except HttpError as error:
        raise error
        """