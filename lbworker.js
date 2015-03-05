var zmq = require('zmq')
,responder = zmq.socket('req')
,estado = zmq.socket('rep')
,Q=require('q')
,url=process.argv[2]
,verbose=(process.argv[3]==='true')
,loadHost = process.argv[4]
,loadPort = process.argv[5]
,workerID= randString()
,disp= 'I_am_ready'
,serviceDone='OK'
,count=0;

function onMessageOf(socket,cb) {
	socket.once('message', function() {
		cb(null,arguments);
  	});
}
var reqOf=Q.nfbind(onMessageOf);

estado.bind('tcp://*:'+loadPort);
var estadoRequest = reqOf(estado).then(respLoad);
//estado.on('message',respLoad);

function respLoad(){
	console.log("LOAD REQUESTED");
	estado.send([getLoad()]);
	estadoRequest = reqOf(estado).then(respLoad);
}

responder['identity']=workerID;

responder.connect(url);
if(verbose) console.log('worker ( '+workerID+' ) connected to '+url+' ...');
responder.send([disp,getLoad(),'tcp://'+loadHost+':'+loadPort]);
if(verbose) console.log('worker ( '+workerID+' ) has sent READY msg: "'+disp+'". Load in port: '+loadPort);

var request=reqOf(responder).then(respWork); 

function respWork(arguments) {
	 var args = Array.apply(null, arguments);
	 var clientServed=args[0];
	 if(verbose){
	 	console.log('worker ( '+workerID+' ) has received request from '+clientServed);
	 	showArguments(args);
	 }
	 responder.send([clientServed,'',serviceDone,getLoad()]);
	 if(verbose){
	 	console.log('worker ( '+workerID+' ) has sent its reply:');
	 	showArguments([clientServed,'',serviceDone,getLoad()]);
	 }
	 request=reqOf(responder).then(respWork);
	 console.log('worker ( '+workerID+' ) has sent '+(++count)+' replies.');
  }

//auxiliar functions
function randString () {
	var len = 10
	, charSet = '0123456789abcdef'
	, result = [];
	for (var i = 0; i < len; ++i) {
		result.push(charSet[Math.floor(Math.random() * charSet.length)]);
	}
	result.splice(len / 2, 0, ['-']);
	return result.join('');
}

function showArguments(a) {
	for(var k in a) console.log('\tPart', k, ':', a[k].toString());
};


function getLoad() {
  var fs     = require('fs')//Este código está tal cual. 
  , data   = fs.readFileSync("/proc/loadavg") //version sincrona
  , tokens = data.toString().split(' ')
  , min1   = parseFloat(tokens[0])+0.01
  , min5   = parseFloat(tokens[1])+0.01
  , min15  = parseFloat(tokens[2])+0.01
  , m      = min1*10 + min5*2 + min15;
  return m;
}
