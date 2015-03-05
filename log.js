var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var LogSchema   = new Schema({
	state: Boolean,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', LogSchema);