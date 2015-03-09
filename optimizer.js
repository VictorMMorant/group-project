optimizer();
function optimizer() {

	var chord = 1;
	var L = 10;
	/*Optimizer
	* i -> angle of attack
	* j -> thickness
	*/
	var max = 0;
	var maxParameters =  {
		aa : 0,
		t : 0
	}

	for(var i = 0.1; i <= Math.PI;i+=0.1) {
		for(var j = 0.1; j <= 0.4*chord;j+=0.01) {

			var currentRatio = mathieu(i,L,j,chord);
			console.log("Ratios: "+currentRatio+"\n Angle of Attack: "+i+"\n Thickness: "+j);
			if(currentRatio > max) {
				maxParameters.aa = i;
				maxParameters.t = j;
				max = currentRatio;
			}
			
		}	
	}


	console.log("MaxRatio: "+max+"\n Angle of Attack: "+maxParameters.aa+"\n Thickness: "+maxParameters.t);
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
	var cd = 0.2; //Empirically
	var cl = 2 * Math.PI * aa;
	var lift =  cl*L*Math.cos(aa)*c;
	var drag =  cd*L*Math.PI*1.1019*t*t * Math.sin(aa)*c ;
	return lift/drag;
}
