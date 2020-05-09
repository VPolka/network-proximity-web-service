errors = {
    404: "Bad request",
    500: "Internal Server Error"
}

def make_http_error(status):
    return status, errors[status]

class HttpError:
    def __init__(self, status):
        self.status, self.message = make_http_error(status)