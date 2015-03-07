// Simple request-reply broker in Node.js

var zmq      = require('zmq')
  , frontend = zmq.socket('router')
  , backend  = zmq.socket('router')
  , config   = zmq.socket('rep')
  , verbose  = (process.argv[5]==='true')
  , Q = require('q')
  , PriorityQueue = require('priorityqueuejs') // npm install priorityqueuejs
  , secs     = 6
  , distribution = 'lowerLoad';

var queue = new PriorityQueue(function(a, b) {
  return b.load - a.load;
});

var messagequeue=[];
var count={};
var loadUrls={};

frontend.bindSync('tcp://*:'+process.argv[2]);
backend.bindSync('tcp://*:'+process.argv[3]);

function onMessageOf(socket,cb) {
	socket.once('message', function() {
		cb(null,arguments);
  	});
}
var reqOf=Q.nfbind(onMessageOf);

var requestF=reqOf(frontend).then(responseF);
var requestB=reqOf(backend).then(responseB);

function responseF(arguments) {
  // Note that separate message parts come as function arguments.
  var args = Array.apply(null, arguments);
  if(verbose){
    console.log('Received from client:');
    showArguments(args);
  }

  if (queue.isEmpty()){
	messagequeue.push(args);
  }
  else{
	var worker=queue.deq();
	if(verbose){
		console.log('Sending to worker:');
		showArguments([worker.id,'',args[0],'',args[2]]);
	}
	backend.send([worker.id,'',args[0],'',args[2]]);
  }
  requestF=reqOf(frontend).then(responseF);
}
  
function responseB(arguments) {
  var args = Array.apply(null, arguments);
  if(verbose){
    console.log('Received from worker:');
    showArguments(args);
  }
  if(args[2]=="I_am_ready"){
  	var worker={};
  	worker.id=args[0];
  	if(distribution=='lowerLoad') worker.load=args[3];
	else if(distribution=='equitable') worker.load=0;
  	loadUrls[args[0]]=args[4];
  	queue.enq(worker);
  	count[args[0]]=0;
  }
  else if(args[4]=="OK"){
    	count[args[0]]++;
	var worker={};
  	worker.id=args[0];
  	if(distribution=='lowerLoad') worker.load=args[5];
	else if(distribution=='equitable') worker.load=count[args[0]];
  	queue.enq(worker);
  	if(verbose){
  		console.log('Sending to client the output of nimrod. Execution finalized:');
  		showArguments([args[2],'',args[4]]);
  	}
	frontend.send([args[2],'',args[4]]);
  }

  else if(args[4]=="Iteration"){
  	if(verbose){
  		console.log('Sending to client data from the last iteration:');
  		showArguments([args[2],'',args[4]]);
  	}
	frontend.send([args[2],'',args[5]]);
  }  


  if (messagequeue.length>0){
    var msg=messagequeue.shift();
    var worker=queue.deq();
    if(verbose){
    	console.log('Sending to worker:');
    	showArguments([worker.id,'',msg[0],'',msg[2]]);
    }
    backend.send([worker.id,'',msg[0],'',msg[2]]);
  }
  requestB=reqOf(backend).then(responseB);
}


setInterval( function (){
	var newqueue = new PriorityQueue(function(a, b) {
	  return b.load - a.load;
	});
	for (var i in loadUrls) {
		(function(id){
			var sock  = zmq.socket('req');
			var address=loadUrls[id];
			sock.connect(address.toString());
			sock.send(['load']);
			var tout =setTimeout(function(){
				//Aquí desterramos al worker.
				delete loadUrls[id];
				//sock.removeAllListeners('message');
				if(verbose) console.log('RIP '+id);
			},secs/2*1000);
			sock.once('message', function(msg) {
				if(verbose) console.log('UP  '+id);
				clearTimeout(tout);
				loadUrls[id]=address;
				var worker={};
				worker.id=id;
				if(distribution=='lowerLoad') worker.load=msg;
				else if(distribution=='equitable') worker.load=count[id];
				newqueue.enq(worker);
				sock.close();
			});
		})(i);
	}
	queue=newqueue;
}, secs*1000);

config.bind('tcp://*:'+process.argv[4]);
var configRequest = reqOf(config).then(respConfig);

function respConfig(arguments){
	var args = Array.apply(null, arguments);
	var msg=JSON.parse(args[0]);
	if(msg.distribution=='equitable'){
		distribution='equitable';
		}
	else if(msg.distribution=='lowerLoad'){
		distribution='lowerLoad';
		secs=msg.periodicity;
		}
	config.send(['OK']);
	configRequest = reqOf(config).then(respConfig);
}

setInterval(function(){
  console.log('   [WORKER ID] : # served requests');
  console.log(count);
},10000)

//Aux functions
function showArguments(a) {
for(var k in a)
console.log('\tPart', k, ':', a[k].toString());
};
