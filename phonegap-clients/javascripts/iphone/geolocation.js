Geolocation.prototype.start = function(args) {
    PhoneGap.exec("Location.start", args);
};

Geolocation.prototype.stop = function() {
    PhoneGap.exec("Location.stop");
};

load_next_script()