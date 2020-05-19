window.onload = function () {

var host = "host";
var port = "port";

    chrome.bluetooth.getAdapterState(function(result) {
        var deviceAddress = result.address;
        var userType;

        function load_html(document_name, process_html) {
            httpRequest = new XMLHttpRequest();
            httpRequest.open('GET', "../htmls/" + document_name + ".html", true);
            httpRequest.send(null);
            httpRequest.onreadystatechange = function() {
                if (httpRequest.readyState == 4) {
                    if (httpRequest.status == 200) {
                        document.documentElement.innerHTML = this.responseText;
                        process_html();
                    } else {
                        document.documentElement.innerHTML = "Что-то пошло не так..."
                    }
                }
            }
        }

        function load_html_with_arg(document_name, process_html, arg) {
            httpRequest = new XMLHttpRequest();
            httpRequest.open('GET', "../htmls/" + document_name + ".html", true);
            httpRequest.send(null);
            httpRequest.onreadystatechange = function() {
                if (httpRequest.readyState == 4) {
                    if (httpRequest.status == 200) {
                        document.documentElement.innerHTML = this.responseText;
                        process_html(arg);
                    } else {
                        document.documentElement.innerHTML = "Что-то пошло не так..."
                    }
                }
            }
        }

        var load_teacher_html_wrapper = function(arg) {
            return function() {
                load_html_with_arg("teacher_course", teacher_course_html, arg);
            };
        }

        var load_student_html_wrapper = function(arg) {
            return function() {
                load_html_with_arg("student_course", student_course_html, arg);
            };
        }

        function back_to_init() {
            if (userType == "teacher") {
                load_html("teacher", teacher_html);
            } else if (userType == "student") {
                load_html("student", student_html);
            } else {
                document.documentElement.innerHTML="что-то пошло не так...";
            }
        }

        function success_html() {
            document.querySelector("#back_to_init").addEventListener("click",
                function() {
                    back_to_init();
                }
            );
        }

        function error_html() {
            document.querySelector("#back_to_init").addEventListener("click",
                function() {
                    back_to_init();
                }
            );
        }

        function create_courses_html() {
            document.querySelector("#send_create_course_form").addEventListener("click",
                function() {
                    send_create_course_form();
                }
            )
        }

        function send_create_course_form() {
            var courseName=document.CreateCourses.CourseName.value;
            if (!courseName.length) {
                document.getElementById('error').innerHTML="Это явно не самый лучший курс в мире...";
            } else {
                httpRequest = new XMLHttpRequest();
                const url='https://' + host + ':' + port + '/create_course';
                httpRequest.open("POST", url);
                httpRequest.setRequestHeader('Content-Type', 'text/plain');
                httpRequest.send('{"device_address": "' + deviceAddress
                    + '", "course_name": "' + courseName + '"}'
                );
                httpRequest.onreadystatechange = function() {
                    if (this.readyState==4) {
                        if (this.statusText=="Success") {
                            load_html("success", success_html);
                        } else {
                            if (this.responseText == "This course has already been created") {
                                document.getElementById('error').innerHTML="Ты недостаточно креативен!";
                            } else {
                                load_html("error", error_html);
                            }
                        }
                    }
                }
            }
        }

        var send_open_course_form_wrapper = function(arg) {
            return function() {
                send_open_course_form(arg);
            };
        }

        function send_open_course_form(course) {
            var courseDay=document.OpenCourse.CourseDay.value;
            var courseMonth=document.OpenCourse.CourseMonth.value;
            var courseTime=document.OpenCourse.CourseTime.value;
            if (!courseDay.length || !courseMonth.length || !courseTime.length) {
                document.getElementById('error').innerHTML="Такого времени не существует!";
            } else {
                httpRequest = new XMLHttpRequest();
                const url='https://' + host + ':' + port + '/open_course';
                httpRequest.open("POST", url);
                httpRequest.setRequestHeader('Content-Type', 'text/plain');
                httpRequest.send('{"course_name": "' + course
                    + '", "course_date": "' + courseDay + "." + courseMonth + " " + courseTime + '"}'
                );
                httpRequest.onreadystatechange = function() {
                    if (this.readyState==4) {
                        if (this.statusText=="Success") {
                            document.getElementById('send_open_course_form').disabled = true;
                            document.getElementById('delete_course').disabled = true;
                            document.getElementById('close_course').disabled = false;
                            courseDay=document.OpenCourse.CourseDay.value = "";
                            courseMonth=document.OpenCourse.CourseMonth.value = "";
                            courseTime=document.OpenCourse.CourseTime.value = "";
                            load_teacher_html_wrapper(course);
                        } else {
                            load_html("error", error_html);
                        }
                    }
                }
            }
        }

        var close_course_wrapper = function(arg) {
            return function() {
                close_course(arg);
            };
        }

        function close_course(course) {
            httpRequest = new XMLHttpRequest();
            const url='https://' + host + ':' + port + '/close_course';
            httpRequest.open("POST", url);
            httpRequest.setRequestHeader('Content-Type', 'text/plain');
            httpRequest.send(course);
            httpRequest.onreadystatechange = function() {
                if (this.readyState==4) {
                    if (this.statusText=="Success") {
                        document.getElementById('send_open_course_form').disabled = false;
                        document.getElementById('delete_course').disabled = false;
                        document.getElementById('close_course').disabled = true;
                        load_teacher_html_wrapper(course);
                    } else {
                        load_html("error", error_html);
                    }
                }
            }
        }

        var delete_course_wrapper = function(arg) {
            return function() {
                delete_course(arg);
            };
        }

        function delete_course(course) {
            httpRequest = new XMLHttpRequest();
            const url='https://' + host + ':' + port + '/delete_course';
            httpRequest.open("POST", url);
            httpRequest.setRequestHeader('Content-Type', 'text/plain');
            httpRequest.send(course);
            httpRequest.onreadystatechange = function() {
                if (this.readyState==4) {
                    if (this.statusText=="Success") {
                        load_html("success", success_html);
                    } else {
                        load_html("error", error_html);
                    }
                }
            }
        }

        function teacher_course_html(course) {
            document.getElementById('course').innerHTML = "<h1>" + course + "</h1>";
            httpRequest = new XMLHttpRequest();
            var url='https://' + host + ':' + port + '/is_open_course';
            httpRequest.open("POST", url);
            httpRequest.setRequestHeader('Content-Type', 'text/plain');
            httpRequest.send(course);
            httpRequest.onreadystatechange = function() {
                if (this.readyState==4) {
                    if (this.statusText=="Success") {
                        var response = JSON.parse(this.responseText)
                        if (response["course"] == "open") {
                            document.getElementById('send_open_course_form').disabled = true;
                            document.getElementById('delete_course').disabled = true;
                        } else if (response["course"] == "close"){
                            document.getElementById('close_course').disabled = true;
                        } else {
                            load_html("error", error_html);
                        }
                    } else {
                        load_html("error", error_html);
                    }
                }
            }

            httpRequest = new XMLHttpRequest();
            url='https://' + host + ':' + port + '/teacher_attendance';
            httpRequest.open("POST", url);
            httpRequest.setRequestHeader('Content-Type', 'text/plain');
            httpRequest.send(course);
            httpRequest.onreadystatechange = function() {
                if (this.readyState==4) {
                    if (this.statusText=="Success") {
                        var attendance = JSON.parse(this.responseText);
                        var table = document.querySelector('#attendance');
                        var listOfTr = table.children;
                        var newTr;
                        var column_names = '<td></td>';
                        var check = true;
                        var students_list = [];
                        var dates = [];
                        for (date in attendance) {
                            dates.push(date);
                        }
                        dates.sort();
                        for (date in dates) {
                            column_names = column_names + '<td>' + dates[date] + '</td>';
                            if (check) {
                                for (student in attendance[dates[date]]) {
                                    students_list.push(student);
                                }
                            }
                            check = false;
                        }

                        for (let i = 0; i < students_list.length; ++i) {
                            newTr = document.createElement('tr');
                            var columns = '<td>' + students_list[i] + '</td>';
                            for (date in dates) {
                                if (attendance[dates[date]][students_list[i]] != 0) {
                                    columns = columns + '<td>' + 1 + '</td>';
                                } else {
                                    columns = columns + '<td></td>';
                                }
                            }
                            newTr.innerHTML = columns;
                            table.insertBefore(newTr, listOfTr[(listOfTr.length - 1)]);
                        }
                        
                        newTr = document.createElement('tr');
                        newTr.innerHTML = column_names;
                        table.insertBefore(newTr, listOfTr[0]);
                    } else {
                        document.getElementById('error').innerHTML="Что-то пошло не так...";
                    }
                }
            }

            document.querySelector("#send_open_course_form").addEventListener("click",
                send_open_course_form_wrapper(course)
            );

            document.querySelector("#close_course").addEventListener("click",
                close_course_wrapper(course)
            );

            document.querySelector("#delete_course").addEventListener("click",
                delete_course_wrapper(course)
            );
        }

        function view_teacher_courses() {
            httpRequest = new XMLHttpRequest();
            const url='https://' + host + ':' + port + '/courses';
            httpRequest.open("POST", url);
            httpRequest.setRequestHeader('Content-Type', 'text/plain');
            httpRequest.send(deviceAddress);
            httpRequest.onreadystatechange = function() {
                if (this.readyState==4) {
                    if (this.statusText=="Success") {
                        var courses = JSON.parse(this.responseText)
                        for (let i = 0; i < courses.length; ++i) {
                            let course = document.createElement("course_" + i);
                            course.innerHTML = '<button id="course_' + toString(i) +'">' + courses[i] + '</button><Br>';
                            document.body.append(course);
                            document.querySelector("course_" + i).addEventListener("click", 
                                load_teacher_html_wrapper(courses[i])
                            )
                        }
                    } else {
                        load_html("error", error_html);
                    }
                }
            }
        }

        function teacher_html() {
            userType = "teacher";
            
            document.querySelector("#create_courses").addEventListener("click",
                function() {
                    load_html("create_courses", create_courses_html)
                }
            );

            document.querySelector("#view_teacher_courses").addEventListener("click",
                function() {
                    load_html("view_teacher_courses", view_teacher_courses)
                }
            );
        }

        function subscribe_courses_html() {
            document.querySelector("#send_subscribe_course_form").addEventListener("click",
                function() {
                    send_subscribe_course_form();
                }
            )
        }

        function send_subscribe_course_form() {
            var courseName=document.SubscribeCourses.CourseName.value;
            if (!courseName.length) {
                document.getElementById('error').innerHTML="Попросили же ввести название курса!";
            } else {
                httpRequest = new XMLHttpRequest();
                const url='https://' + host + ':' + port + '/subscribe_course';
                httpRequest.open("POST", url);
                httpRequest.setRequestHeader('Content-Type', 'text/plain');
                httpRequest.send('{"device_address": "' + deviceAddress
                    + '", "course_name": "' + courseName + '"}'
                );
                httpRequest.onreadystatechange = function() {
                    if (this.readyState==4) {
                        if (this.statusText=="Success") {
                            load_html("success", success_html);
                        } else {
                            if (this.responseText == "No such course") {
                                document.getElementById('error').innerHTML="Ты что-то напутал, у меня такого нет...";
                            } else {
                                load_html("error", error_html);
                            }
                        }
                    }
                }
            }
        }

        var subscribe_wrapper = function(course, address) {
            return function() {
                subscribe(course, address);
            }
        }

        function subscribe(course, address) {
            var device_names = {};
            var updateDeviceName = function(device) {
                device_names[device.address] = device.id;
            };
            chrome.bluetooth.onDeviceAdded.addListener(updateDeviceName);
            chrome.bluetooth.onDeviceChanged.addListener(updateDeviceName);
            chrome.bluetooth.getDevices(function(devices) {
                for (var i = 0; i < devices.length; i++) {
                    updateDeviceName(devices[i]);
                }
            });
            chrome.bluetooth.startDiscovery(function() {
                setTimeout(function() {
                    chrome.bluetooth.stopDiscovery(function() {});
                    var check_course_owner_address = false;
                    for (let key in device_names) {
                        if (address == key) {
                            check_course_owner_address = true;
                            break;
                        }
                    }
                    if (check_course_owner_address) {
                        httpRequest = new XMLHttpRequest();
                        const url='https://' + host + ':' + port + '/subscribe';
                        httpRequest.open("POST", url);
                        httpRequest.setRequestHeader('Content-Type', 'text/plain');
                        httpRequest.send('{"course": "' + course + '", "device_address": "' + deviceAddress + '"}');
                        httpRequest.onreadystatechange = function() {
                            if (this.readyState==4) {
                                if (this.statusText=="Success") {
                                    load_html("success", success_html);
                                } else {
                                    load_html("error", error_html);
                                }
                            }
                        }
                    } else {
                        document.getElementById('error').innerHTML="Кажется, ты не пришел...";
                    }

                }, 3000);
            });
        }

        var unsubscribe_course_wrapper = function(arg) {
            return function() {
                unsubscribe_course(arg);
            }
        }

        function unsubscribe_course(course) {
            httpRequest = new XMLHttpRequest();
            const url='https://' + host + ':' + port + '/unsubscribe_course';
            httpRequest.open("POST", url);
            httpRequest.setRequestHeader('Content-Type', 'text/plain');
            httpRequest.send('{"course": "' + course + '", "device_address": "' + deviceAddress + '"}');
            httpRequest.onreadystatechange = function() {
                if (this.readyState==4) {
                    if (this.statusText=="Success") {
                        load_html("success", success_html);
                    } else {
                        load_html("error", error_html);
                    }
                }
            }
        }

        function student_course_html(course) {
            document.getElementById('course').innerHTML = "<h1>" + course + "</h1>";
            httpRequest = new XMLHttpRequest();
            var url='https://' + host + ':' + port + '/is_open_course';
            httpRequest.open("POST", url);
            httpRequest.setRequestHeader('Content-Type', 'text/plain');
            httpRequest.send(course);
            httpRequest.onreadystatechange = function() {
                if (this.readyState==4) {
                    if (this.statusText=="Success") {
                        var response = JSON.parse(this.responseText)
                        if (response["course"] != "open") {
                            document.getElementById('subscribe').disabled = true;
                        } else {
                            document.querySelector("#subscribe").addEventListener("click",
                                subscribe_wrapper(course, response["owner_address"])
                            );
                        }
                    } else {
                        load_html("error", error_html);
                    }
                }
            }

            httpRequest = new XMLHttpRequest();
            url='https://' + host + ':' + port + '/student_attendance';
            httpRequest.open("POST", url);
            httpRequest.setRequestHeader('Content-Type', 'text/plain');
            httpRequest.send('{"course": "' + course + '", "device_address": "' + deviceAddress + '"}');
            httpRequest.onreadystatechange = function() {
                if (this.readyState==4) {
                    if (this.statusText=="Success") {
                        var attendance = JSON.parse(this.responseText);
                        var table = document.querySelector('#attendance');
                        var listOfTr = table.children;
                        var newTr;
                        var column_names = '';
                        var dates = [];
                        for (date in attendance) {
                            dates.push(date);
                        }
                        dates.sort();
                        for (date in dates) {
                            column_names = column_names + '<td>' + dates[date] + '</td>';
                        }

                        newTr = document.createElement('tr');
                        var columns = '';
                        for (date in dates) {
                            if (attendance[dates[date]] != 0) {
                                columns = columns + '<td>' + 1 + '</td>';
                            } else {
                                columns = columns + '<td></td>';
                            }
                        }
                        newTr.innerHTML = columns;
                        table.insertBefore(newTr, listOfTr[(listOfTr.length - 1)]);
                        
                        newTr = document.createElement('tr');
                        newTr.innerHTML = column_names;
                        table.insertBefore(newTr, listOfTr[0]);
                    } else {
                        document.getElementById('error').innerHTML="Что-то пошло не так...";
                    }
                }
            }

            document.querySelector("#unsubscribe_course").addEventListener("click",
                unsubscribe_course_wrapper(course)
            );
        }

        function view_student_courses() {
            httpRequest = new XMLHttpRequest();
            const url='https://' + host + ':' + port + '/courses';
            httpRequest.open("POST", url);
            httpRequest.setRequestHeader('Content-Type', 'text/plain');
            httpRequest.send(deviceAddress);
            httpRequest.onreadystatechange = function() {
                if (this.readyState==4) {
                    if (this.statusText=="Success") {
                        var courses = JSON.parse(this.responseText)
                        for (let i = 0; i < courses.length; ++i) {
                            let course = document.createElement("course_" + i);
                            course.innerHTML = '<button id="course_' + toString(i) +'">' + courses[i] + '</button><Br>';
                            document.body.append(course);
                            document.querySelector("course_" + i).addEventListener("click", 
                                load_student_html_wrapper(courses[i])
                            )
                        }
                    } else {
                        load_html("error", error_html);
                    }
                }
            }
        }

        function student_html() {
            userType = "student";
            chrome.networking;

            document.querySelector("#subscribe_to_course").addEventListener("click",
                function() {
                    load_html("subscribe_courses", subscribe_courses_html)
                }
            );

            document.querySelector("#view_student_courses").addEventListener("click",
                function() {
                    load_html("view_student_courses", view_student_courses)
                }
            );
        }

        function send_registration_form() {
            var userType=document.UserRegistration.UserTypes.options[document.UserRegistration.UserTypes.selectedIndex].value;
            var userName=document.UserRegistration.UserName.value;
            if (!userName.length) {
                document.getElementById('error').innerHTML="Обделенных именем не регистрируем!";
            } else {
                httpRequest = new XMLHttpRequest();
                const url='https://' + host + ':' + port + '/registration';
                httpRequest.open("POST", url);
                httpRequest.setRequestHeader('Content-Type', 'text/plain');
                httpRequest.send('{"device_address": "' + deviceAddress + '", "user_name": "' + userName+ '", "user_type": "' + userType + '"}');
                httpRequest.onreadystatechange = function() {
                    if (this.readyState==4) {
                        if (this.statusText=="Success") {
                            if (userType == "teacher") {
                                load_html(userType, teacher_html);
                            } else {
                                load_html(userType, student_html);
                            }
                        } else {
                            load_html("error", error_html);
                        }
                    }
                }
            }
        }

        function registration_html() {
            document.querySelector("#send_registration_form").addEventListener("click",
                function() {
                    send_registration_form();
                }
            );
        }

        
        if (document.getElementById('teacher_html')) {
            teacher_html();
        } else if (document.getElementById('student_html')) {
            student_html();
        } else if (document.getElementById('registration_html')) {
            registration_html();
        }
    })
};