var MathUtil = {
	clip: function(x, min, max) {
		return x < min ? min : x > max ? max : x;
	},
	
	magnitude: function(x, y) {
		return Math.sqrt(x * x + y * y);
	},
};

var DateUtil = {
	getCurrentTimeMillis: function() {
		return new Date().getTime();
	},
};

var ArrayUtil = {
	dup: function(array) {
		return [].concat(array);
	}
};
