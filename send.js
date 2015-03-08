var zmq = require('zmq')
var fs=require("fs");
var dat;
//Read the file to know the url to connect and the client identificator
data=fs.readFileSync('url','utf8')
dat=data.split("\n")
console.log(dat)
url=dat[0]
clientServed=dat[1]
workerid=dat[2]
responder = zmq.socket('req')
responder['identity']=workerid
responder.connect(url);

//Read the file to know the url to connect and the client identificator
data=fs.readFileSync('./ratio','utf8');
dat=data.split("\n");
var responseJSON={iteration:{ratio:dat[0], angle:dat[1], radius:dat[2] ,thickness:dat[3]}}
var response=JSON.stringify(responseJSON)
//Send the optimum parameters to the broker
responder.send([clientServed,'','Iteration',response]);
responder.close();