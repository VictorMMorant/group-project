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
test.equal(res.up,false,"Error at test 1.3. Expected up = false. But up = "+res.up)
test.equal(res.down,true,"Error at test 1.3. Expected down = true. But down = "+res.down)
//Test 1.4 Expected false false
var parameter=0.3
var mini=0.25
increment=0.1
maxi=0.35
res=checkBoundaries(parameter,mini,increment,maxi)
test.equal(res.up,false,"Error at test 1.4. Expected up = false. But up = "+res.up)
test.equal(res.down,false,"Error at test 1.4. Expected down = false. But down = "+res.down)
/**
Test 2. Function valids()
*/
//Test 2.1 Expected [4,1,7]
expected=[4,1,7]
obtained=valids(0.1,0.05,0.05,0.35,0.2,0.09,0.5,0.4)
test.deepEqual(obtained,expected,"Error at test 2.1. Expected "+expected+". But obtained "+obtained)
//Test 2.2 Expected [4,1,2,5]
expected=[4,1,2,5]
obtained=valids(0.05,0.03,0.1,0.35,0.3,0.1,0.01,0.3)
test.deepEqual(obtained,expected,"Error at test 2.2. Expected "+expected+". But obtained "+obtained)
//Test 2.3 Expected [4,0,1,2,3,5,6,7,8]
expected=[4,0,1,2,3,5,6,7,8]
obtained=valids(0.2,0.03,0.1,0.35,0.2,0.1,0.01,0.3)
test.deepEqual(obtained,expected,"Error at test 2.3. Expected "+expected+". But obtained "+obtained)
//Test 2.4 Expected [4]
expected=[4]
obtained=valids(0.1,0.1,0.1,0.1,0.2,0.2,0.2,0.2)
test.deepEqual(obtained,expected,"Error at test 2.4. Expected "+expected+". But obtained "+obtained)
//------------------------------------------------------------------------------
/**
Test 3. Function chooseParameters()
*/
//chooseParameters(aa,incrementAA, L, t, incrementT, c, valids)
//Test 3.1 Expected a decrement of aa
aa=0.1,minAA=0.05,incrementAA=0.05,maxAA=0.35,t=0.1,minT=0.09,incrementT=0.5,maxT=0.4,c=1,L=5
obtained=chooseParameters(aa,incrementAA, L, t, incrementT, c, valids(aa,minAA,incrementAA,maxAA,t,minT,incrementT,maxT))
expected=aa-incrementAA
test.equal(obtained.aa,expected,"Error at test 3.1.1. Expected "+expected+". But obtained "+obtained.aa)
expected=t
test.equal(obtained.t,expected,"Error at test 3.1.2. Expected "+expected+". But obtained "+obtained.t)
//Test 3.2 Expected a decrement of t
aa=0.05,minAA=0.03,incrementAA=0.1,maxAA=0.35,t=0.3,minT=0.1,incrementT=0.01,maxT=0.3,c=1,L=5
obtained=chooseParameters(aa,incrementAA, L, t, incrementT, c, valids(aa,minAA,incrementAA,maxAA,t,minT,incrementT,maxT))
expected=aa
test.equal(obtained.aa,expected,"Error at test 3.2.1. Expected "+expected+". But obtained "+obtained.aa)
expected=t-incrementT
test.equal(obtained.t,expected,"Error at test 3.2.2. Expected "+expected+". But obtained "+obtained.t)
//Test 3.3 Expected a decrement of aa and t
aa=0.2,minAA=0.03,incrementAA=0.1,maxAA=0.35,t=0.2,minT=0.1,incrementT=0.01,maxT=0.3,c=1,L=5
obtained=chooseParameters(aa,incrementAA, L, t, incrementT, c, valids(aa,minAA,incrementAA,maxAA,t,minT,incrementT,maxT))
expected=aa-incrementAA
test.equal(obtained.aa,expected,"Error at test 3.3.1. Expected "+expected+". But obtained "+obtained.aa)
expected=t-incrementT
test.equal(obtained.t,expected,"Error at test 3.3.2. Expected "+expected+". But obtained "+obtained.t)
//Test 3.4 Expected false, as there is not possible to increment or decrement the parameters
aa=0.1,minAA=0.1,incrementAA=0.1,maxAA=0.1,t=0.2,minT=0.2,incrementT=0.2,maxT=0.2,c=1,L=5
obtained=chooseParameters(aa,incrementAA, L, t, incrementT, c, valids(aa,minAA,incrementAA,maxAA,t,minT,incrementT,maxT))
expected=false
test.equal(obtained,expected,"Error at test 3.4.1. Expected "+expected+". But obtained "+obtained.aa)

//------------------------------------------------------------------------------
/**
Test 4. Function step()
*/
//Test 4.1
log={"L":5,"__v":0,"_id":"551306435a4177651e142623","chord":3,"status":false,"date":"2015-02-25T19:02:27.568Z","iterations":[{"iteration":1,"value":6.552574171177686,"t":0.97,"aa":0.95,"_id":"551306435a4177651e142624"}]}
chord=log.chord
incrementAA = 0.05;
incrementT = 0.01*log.chord;
//Test 4.1.1 Expected finished=false
newlog=JSON.parse(step(log))
expected=undefined
obtained=newlog.finish
test.equal(obtained,expected,"Error at test 4.1.1. Expected "+expected+". But obtained "+obtained)
//Test 4.1.2 Expected aa to decrease
newlog=JSON.parse(step(log))
//previous iteration
expected=newlog.iterations[newlog.iterations.length-2].aa-incrementAA
//last iteration
obtained=newlog.iterations[newlog.iterations.length-1].aa
test.equal(obtained,expected,"Error at test 4.1.2. Expected "+expected+". But obtained "+obtained)
//Test 4.1.3 Expected t to decrease
newlog=JSON.parse(step(log))
//previous iteration
expected=newlog.iterations[newlog.iterations.length-2].t-incrementT
//last iteration
obtained=newlog.iterations[newlog.iterations.length-1].t
test.equal(obtained,expected,"Error at test 4.1.3. Expected "+expected+". But obtained "+obtained)
//Test 4.2 Expected finish=true
log={"L":5,"__v":0,"_id":"551306435a4177651e142623","chord":3,"status":false,"date":"2015-02-25T19:02:27.568Z","iterations":[{"iteration":1,"value":41.552574171177686,"t":0.3,"aa":0.1,"_id":"551306435a4177651e142624"}]}
chord=log.chord
incrementAA = 0.05;
incrementT = 0.01*log.chord;

newlog=JSON.parse(step(log))
expected=true
obtained=newlog.finish
test.equal(obtained,expected,"Error at test 4.2. Expected "+expected+". But obtained "+obtained)




//------------------------------------------------------------------------------



/*******************************************************************************
*******************************************************************************/

/** Check the boundaries for a parameter */
function checkBoundaries(parameter, min, increment, max) {
	
	var up = (parameter+increment <= max);
	var down = (parameter-increment >= min);
	return { up: up, down: down};
}
/** Check what combinations of increments/decrements can be performed to the variables */
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

/** Calculate which increases/decreases of the variables give the maximum ratio.
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
		var maxAA = 0.35;
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
	 	var nextParameters = chooseParameters(previousParameters.aa,incrementAA,log.L,previousParameters.t,incrementT,log.chord,validsResult);
	 	if(nextParameters) {
		 	
		 	nextParameters.iteration = 1+previousParameters.iteration;
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
