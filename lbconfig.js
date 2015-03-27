var zmq = require('zmq'), programador = zmq.socket('req');

	var opt = process.argv[3];
	var urlBroker = process.argv[2];
	
	var msg1 = JSON.stringify({
	'distribution':'equitable'});
	
	var msg2 = JSON.stringify({
	'distribution':'lowerLoad',
	'periodicity':process.argv[4]});

	
	programador.connect(urlBroker);
	if(opt!='equitable'&&opt!='lowerLoad'){
		console.log('Distribution should be equitable or lowerLoad');
		}
	else if(opt=='equitable'){
		programador.send(msg1);
		}
	else{
		programador.send(msg2);
		}
	programador.close();