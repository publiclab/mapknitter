Geolocation.prototype.start = function(args) {
    PhoneGap.exec("Location.start", args);
};

Geolocation.prototype.stop = function() {
    PhoneGap.exec("Location.stop");
};

navigator.geolocation.getCurrentPosition(User.set_loc)

load_next_script()