Geolocation.prototype.start = function(args) {
    PhoneGap.exec("Location.start", args);
};

Geolocation.prototype.stop = function() {
    PhoneGap.exec("Location.stop");
};

navigator.geolocation.getCurrentPosition(Map.set_user_loc)

load_next_script()