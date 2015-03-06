var zmq = require('zmq')
var fs=require("fs");
var dat;
//Read the file to know the url to connect and the client identificator
fs.readFile('url','utf8',function(err,data) {
	if (err) {
		return console.log(err);
	}
		dat=data.split("\n");
});
url=dat[0]
clientServed=dat[1]
responder = zmq.socket('req')
responder.connect(url);

//Read the file to know the url to connect and the client identificator
fs.readFile('ratio','utf8',function(err,data) {
	if (err) {
		return console.log(err);
	}
		dat=data.split("\n");
});
var responseJSON={iteration:{ratio:dat[0], angle:dat[1], radius:dat[2] ,thickness:dat[3]}}
var response=JSON.stringify(responseJSON)
//Send the optimum parameters to the broker
responder.send([clientServed,'','OK',response]);