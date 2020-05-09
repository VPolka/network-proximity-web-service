from http_error import HttpError

def send_get_succsess(conn, body):
    conn.send_response(200, "Success")
    conn.send_header('Content-type','text/plain')
    conn.send_header('Access-Control-Allow-Origin','*')
    conn.end_headers()
    conn.wfile.write(str(body).encode())

def send_post_succsess(conn, body):
    conn.send_response(204, "Success")
    conn.send_header('Content-type','text/plain')
    conn.send_header('Access-Control-Allow-Origin','*')
    conn.end_headers()
    conn.wfile.write(str(body).encode())

def send_error_with_message(conn, error, message):
    conn.send_response(error.status, error.message)
    conn.send_header('Access-Control-Allow-Origin','*')
    conn.end_headers()
    conn.wfile.write(message.encode())

def send_error(conn, error):
    send_error_with_message(conn, error, "")

def send_error_bad_request(conn):
    send_error(conn, HttpError(404))