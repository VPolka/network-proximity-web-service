window.onload = function () {
    document.querySelector("#convert").addEventListener("click",
        function () {
            var device_names = {};
            var updateDeviceName = function(device) {
            device_names[device.address] = device.id;
            };
            var removeDeviceName = function(device) {
            delete device_names[device.id];
            }

            // Add listeners to receive newly found devices and updates
            // to the previously known devices.
            chrome.bluetooth.onDeviceAdded.addListener(updateDeviceName);
            chrome.bluetooth.onDeviceChanged.addListener(updateDeviceName);
            chrome.bluetooth.onDeviceRemoved.addListener(removeDeviceName);

            // With the listeners in place, get the list of devices found in
            // previous discovery sessions, or any currently active ones,
            // along with paired devices.
            chrome.bluetooth.getDevices(function(devices) {
                for (var i = 0; i < devices.length; i++) {
                    updateDeviceName(devices[i]);
                }
            });
            var heh = "";
            var meters = document.querySelector("#meters");
            var feet = document.querySelector("#feet");
            // Now begin the discovery process.
            chrome.bluetooth.startDiscovery(function() {
            // Stop discovery after 3 seconds.
            setTimeout(function() {
                chrome.bluetooth.stopDiscovery(function() {});
                for (let key in device_names) {
                    //feet.value = device_names;
                    heh = heh + device_names[key];
                }
                //feet.value = heh;
            }, 30000);
            });
            chrome.bluetooth.getAdapterState(function(result) {
                feet.value = result.name;
            });
        }
    );
};