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
	 
	 	var log = JSON.parse(args[2].toString());

	 	/* First time default parameters */
		var previousParameters =  {
			iteration: 0,
			aa : 0.1,
			t : 0.1,
			value: 0
		};

	 	if(log.iterations.length > 0) {
	 		 previousParameters = log.iterations[log.iterations.length - 1];
	 	}
	 	

		/*Optimizer
		* i -> angle of attack
		* j -> thickness
		*/
		if(previousParameters.aa <= Math.PI) {
			if((previousParameters.t+0.01)*log.chord > 0.4*log.chord) {
				previousParameters.t = 0;
				previousParameters.aa+=0.1;
			} else {
				previousParameters.t += 0.01*log.chord;
			}

			//Step
			previousParameters.value = calculateLiftToDragRatio(previousParameters.aa,log.L,previousParameters.t,log.chord);
			previousParameters.iteration++;
			log.iterations.push(previousParameters);
			responder.send([clientServed,'',"Iteration",JSON.stringify(log)]);

			if(verbose){
			 	console.log('worker ( '+workerID+' ) has sent its reply:');
			 	showArguments([clientServed,'',"Iteration",JSON.stringify(log)]);
		 	}
	
		} else {
			//Finish
			responder.send([clientServed,'',"Iteration",JSON.stringify(log), "Finish"]);
						if(verbose){
			 	console.log('worker ( '+workerID+' ) has sent its reply:');
			 	showArguments([clientServed,'',"Iteration",JSON.stringify(log), "Finish"]);
		 	}
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
	return 10;
}



/**
*	cd -> Drag coefficient
*	cl -> Lift coefficient	
*	L  -> Length of the wing
*	t  -> Thickness
*	c  -> Chord
*	aa -> Angle of Attack
*/
function calculateLiftToDragRatio(aa,L,t,c) {
	var cd = 0.2 //Empirically
	var cl = 2 * Math.PI * aa;
	var lift =  cl*L*Math.cos(aa)*c;
	var drag =  cd*L*Math.PI*1.1019*t*t * Math.sin(aa)*c ;
	return lift/drag;
}
