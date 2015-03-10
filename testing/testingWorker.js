/**
Unit testing of some functions of lbworker.js
*/
var test=require('assert')
verbose=false

/**
Test 1. Function checkBoundaries()
*/
//------------------------------------------------------------------------------
//Test 1.1 Expected true true
var parameter=0.5
var mini=0.2
increment=0.1
maxi=0.8
res=checkBoundaries(parameter,mini,increment,maxi)
test.equal(res.up,true,"Error at test 1.1. Expected up = true. But up = "+res.up)
test.equal(res.down,true,"Error at test 1.1. Expected down = true. But down = "+res.down)
//Test 1.2 Expected true false
var parameter=0.5
var mini=0.45
increment=0.1
maxi=0.7
res=checkBoundaries(parameter,mini,increment,maxi)
test.equal(res.up,true,"Error at test 1.2. Expected up = true. But up = "+res.up)
test.equal(res.down,false,"Error at test 1.2. Expected down = false. But down = "+res.down)
//Test 1.3 Expected false true
var parameter=0.3
var mini=0.2
increment=0.05
maxi=0.301
res=checkBoundaries(parameter,mini,increment,maxi)
test.equal(res.up,false,"Error at test 1.1. Expected up = false. But up = "+res.up)
test.equal(res.down,true,"Error at test 1.1. Expected down = true. But down = "+res.down)
//Test 1.4 Expected false false
var parameter=0.3
var mini=0.25
increment=0.1
maxi=0.35
res=checkBoundaries(parameter,mini,increment,maxi)
test.equal(res.up,false,"Error at test 1.1. Expected up = false. But up = "+res.up)
test.equal(res.down,false,"Error at test 1.1. Expected down = false. But down = "+res.down)
/**
Test 2. Function valids()
*/

//------------------------------------------------------------------------------
/**
Test 3. Function chooseParameters()
*/

//------------------------------------------------------------------------------
/**
Test 4. Function step()
*/

//------------------------------------------------------------------------------
/**
Test 5. Function calculateLiftToDragRatio()
*/


/*******************************************************************************
*******************************************************************************/

/** Check the boundaries for a parameter */
function checkBoundaries(parameter, min, increment, max) {
	
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

/** Calculate the maximum between incresing the parameters, decreasing the parameters or doing nothing 
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
	//resultUpO 

		results[1] = calculateLiftToDragRatio(aa+incrementAA,L,t,c);
	//resultUpDown 

		results[2] = calculateLiftToDragRatio(aa+incrementAA,L,t-incrementT,c);
	//resultOUp 

		results[3] = calculateLiftToDragRatio(aa,L,t+incrementT,c);
	//resultOO 

		results[4] = calculateLiftToDragRatio(aa,L,t,c);
	//resultODown 
		
		results[5] = calculateLiftToDragRatio(aa,L,t-incrementT,c);
	//resultDownUp 
		
		results[6] = calculateLiftToDragRatio(aa-incrementAA,L,t+incrementT,c);
	//resultDownO 
		
		results[7] = calculateLiftToDragRatio(aa-incrementAA,L,t,c);
	//resultDownDown 
		
		results[8] = calculateLiftToDragRatio(aa-incrementAA,L,t-incrementT,c);
	if(verbose)
		for(index=0;index<=8;index++)
			console.log("results["+index+"] ",results[index]);
	var max = results[valids[0]];
	var maxIndex = valids[0];
	
	for(var i in valids) {
		if(results[valids[i]] > max) {
			maxIndex = valids[i];
			max = results[valids[i]];
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
		var incrementAA = 0.05;
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
