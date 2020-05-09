chrome.app.runtime.onLaunched.addListener(
    function () {
        chrome.bluetooth.getAdapterState(function(result) {
            var device_address = result.address;
            const httpRequest = new XMLHttpRequest();
            const url='https://localhost:4443/user';
            httpRequest.open("POST", url);
            httpRequest.setRequestHeader('Content-Type', 'text/plain');
            httpRequest.send(device_address);
            httpRequest.onreadystatechange = function() {
                if (this.readyState==4) {
                    if (this.statusText=="Success") {
                        if (this.responseText=="teacher") {
                            chrome.app.window.create('../htmls/teacher.html');
                        } else if (this.responseText=="student") {
                            chrome.app.window.create('../htmls/student.html');
                        } else if (this.responseText=="unknown") {
                            chrome.app.window.create('../htmls/registration.html');
                        }
                    }
                }
            }
        });
    }
);