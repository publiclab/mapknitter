var Person = Class.create(
    /**
      @name Person
      @constructor
      @scope Person.prototype
    */
    {
        initialize: function(name) {
            this.name = name;
        },
        say: function(message) {
            return this.name + ': ' + message;
        }
    }
);

/** @scope Person.prototype */
{
	sing: function(song) {
	}
}

/** @scope Person */
{
	getCount: function() {
	}
}

/** @scope Unknown */
{
	isok: function() {
	}
}

/** @scope Unknown.prototype */
{
	notok: function() {
	}
}