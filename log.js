var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var LogSchema   = new Schema({
	iterations: [
		{ iteration: Number, t: Number, aa: Number,  value: Number}
	],
	chord: Number,
	L: Number,
	state: Boolean,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', LogSchema);

/**

state
date
thickness
angle of attack
chord
Length

*/