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

 	var response = step(log);
 	console.log(response);
 	responder.send([clientServed,'',"Iteration",response]);

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

/** Check the boundaries for a parameter */
function checkBoundaries(parameter, min, increment, max) {
	console.log("Min: "+min);
	console.log("Substraction: "+(parameter-increment));
	var up = (parameter+increment <= max);
	var down = (parameter-increment >= min);
	return { up: up, down: down};
}

function valids(aa,minAA,incrementAA,maxAA,t,minT,incrementT,maxT) {
	var valids = new Array();
	valids.push(4);

	var aaBoundaries = checkBoundaries(aa,minAA,incrementAA,maxAA); 
	var tBoundaries = checkBoundaries(t,minT,incrementT,maxT);
	if( aaBoundaries.up && tBoundaries.up) {
		valids.push(0);
	}
	if(aaBoundaries.up) {
		valids.push(1);
	}
	if(aaBoundaries.up && tBoundaries.down) {
		valids.push(2);
	}
	if(tBoundaries.up) {
		valids.push(3);
	}
	if(tBoundaries.down) {
		valids.push(5);
	}
	if(aaBoundaries.down && tBoundaries.up) {
		valids.push(6);
	}
	if(aaBoundaries.down) {
		valids.push(7);
	} 
	if(aaBoundaries.down && tBoundaries.down) {
		valids.push(8);
	}
	return valids;
}

/** Calculate the maximum between incresing the parameters, dicreasing the parameters or doing nothing 
* Boundaries -> { up: up, down: down}
*	++ -> 0
*	+0 -> 1
*	+- -> 2
*	0+ -> 3
*	00 -> 4
*	0- -> 5
*	-+ -> 6
*	-0 -> 7
*	-- -> 8
*/
function chooseParameters(aa,incrementAA, L, t, incrementT, c, valids) {

	var results = [];

	//resultUpUp 
		results[0] = calculateLiftToDragRatio(aa+incrementAA,L,t+incrementT,c);
		console.log("results[0] ",results[0]);
	//resultUpO 

		results[1] = calculateLiftToDragRatio(aa+incrementAA,L,t,c);
		console.log("results[1] ",results[1]);
	//resultUpDown 

		results[2] = calculateLiftToDragRatio(aa+incrementAA,L,t-incrementT,c);
		console.log("results[2] ",results[2]);
	//resultOUp 

		results[3] = calculateLiftToDragRatio(aa,L,t+incrementT,c);
		console.log("results[3] ",results[3]);
	//resultOO 

		results[4] = calculateLiftToDragRatio(aa,L,t,c);
		console.log("results[4] ",results[4]);
	//resultODown 
		
		results[5] = calculateLiftToDragRatio(aa,L,t-incrementT,c);
		console.log("results[5] ",results[5]);
	//resultDownUp 
		
		results[6] = calculateLiftToDragRatio(aa-incrementAA,L,t+incrementT,c);
		console.log("results[6] ",results[6]);
	//resultDownO 
		
		results[7] = calculateLiftToDragRatio(aa-incrementAA,L,t,c);
		console.log("results[7] ",results[7]);
	//resultDownDown 
		
		results[8] = calculateLiftToDragRatio(aa-incrementAA,L,t-incrementT,c);
		console.log("results[8] ",results[8]);

	var max = results[valids[0]];
	var maxIndex = valids[0];

	for(var i = 0; i < results.length && i in valids; i++) {
		if(results[i] > max) {
			maxIndex = i;
			max = results[i];
		}
	}
	var nextAA;
	if(Math.floor(maxIndex / 3) === 0) {
		nextAA = aa+incrementAA;
	} else if(Math.floor(maxIndex / 3) === 1) {
		nextAA = aa;
	} else {
		nextAA = aa-incrementAA;
	}
	
	var nextT;
	if(maxIndex % 3 === 0) {
		nextT = t+incrementT;
	} else if(maxIndex % 3 === 1) {
		nextT = t;
	} else {
		nextT = t-incrementT;
	}
		
	return  maxIndex !== 4 && { aa: nextAA, t : nextT, value: max };

}

function step(log) {


		/**Boundaries*/
		var minAA = 0.1;
		var incrementAA = 0.1;
		var maxAA = Math.PI/2;
		var minT = 0.1*log.chord;
		var incrementT = 0.01*log.chord;
		var maxT = 0.4*log.chord;

		/* First time default parameters */
		var previousParameters =  {
			iteration: 0,
			aa 

			: 1,
			t : 1,
			value: 0
		};

	 	if(log.iterations.length > 0) {
	 		 previousParameters = log.iterations[log.iterations.length - 1];
	 	}

	 	var validsResult = valids(previousParameters.aa,minAA,incrementAA,maxAA,previousParameters.t,minT,incrementT,maxT);
	 	console.log("After Valids:",validsResult);
	 	var nextParameters = chooseParameters(previousParameters.aa,incrementAA,log.L,previousParameters.t,incrementT,log.chord,validsResult);
	 	if(nextParameters) {
		 	
		 	nextParameters.iteration = 1+previousParameters.iteration;
		 	console.log(nextParameters);
		 	log.iterations.push(nextParameters);
		 	return JSON.stringify(log);

	 	} else {
	 		log.finish = true;
	 		return JSON.stringify(log);
	 	}

	 	/*Optimizer
		* i -> angle of attack
		* j -> thickness
		*
		if(previousParameters.aa <= maxAA) {
			if(previousParameters.t+0.01*log.chord > maxT) {
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
		}*/

}

/**
*	Calculate the lift to drag ratio
*	cd -> Drag coefficient
*	cl -> Lift coefficient	
*	L  -> Length of the wing
*	t  -> Thickness
*	c  -> Chord
*	aa -> Angle of Attack
*/
function calculateLiftToDragRatio(aa,L,t,c) {
	var cd = 0.2; //Empirically
	var cl = 2 * Math.PI * aa;
	var lift =  cl*L*Math.cos(aa)*c;
	var drag =  cd*L*Math.PI*1.1019*t*t * Math.sin(aa)*c ;
	return lift/drag;
}
