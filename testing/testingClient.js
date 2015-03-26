var zmq       = require('zmq')
  , requester = zmq.socket('req')
  , Q=require('q');

requester['identity']=randString();

requester.connect(process.argv[2]);
console.log('client ( '+requester['identity']+' ) connected to '+process.argv[2]+' ...');

//requester.send(process.argv[3]);
//console.log('client ( '+requester['identity']+' ) has sent its msg: "'+process.argv[3]+'"');

function onMessageOf(socket,cb) {
	socket.once('message', function() {
    console.log("Here, I'm !");
		cb(null,arguments);
  	});
}
var reqOf=Q.nfbind(onMessageOf);

var request=reqOf(requester).then(processResponse);

function processResponse(arguments) {
	
  var args = Array.apply(null, arguments);
	
  console.log('client ( '+requester['identity']+' ) has received reply: "'+args[0]+'"');

  if(!JSON.parse(args[0]).finish) {
    Log.findByIdAndUpdate(JSON.parse(args[0])._id,{ $set : { iterations: JSON.parse(args[0]).iterations}},function(err, result){
        if(err){
            console.log(err);
        }
        
        result.save(function(err) {
          if (err)
            console.log('error')
          else {
            requester.send(JSON.stringify(result));

            console.log('success')
            console.log(result);
          }
        });
        
    });
  } else {
      Log.findByIdAndUpdate(JSON.parse(args[0])._id,{ $set : { status: true }},function(err, result){
        if(err){
            console.log(err);
        }
        
        result.save(function(err) {
          if (err)
            console.log('error')
          else {

            console.log('success')
            console.log(result);
          }
        });
        
    }); 
  }
  request = reqOf(requester).then(processResponse);

  

}

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

var path = require('path');
var qs = require('querystring');

var async = require('async');
var bcrypt = require('bcryptjs');
var bodyParser = require('body-parser');
var express = require('express');
var logger = require('morgan');
var jwt = require('jwt-simple');
var moment = require('moment');
var mongoose = require('mongoose');
var request = require('request');
var config = require('./config');

var userSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true },
  password: { type: String, select: false },
  displayName: String,
  picture: String,
  facebook: String,
  foursquare: String,
  google: String,
  github: String,
  linkedin: String,
  live: String,
  yahoo: String,
  twitter: String
});

userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(password, done) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    done(err, isMatch);
  });
};

var User = mongoose.model('User', userSchema);

mongoose.connect(config.MONGO_URI);
mongoose.connection.on('error', function() {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
});

var app = express();

app.set('port', process.env.PORT || 8000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Force HTTPS on Heroku
if (app.get('env') === 'production') {
  app.use(function(req, res, next) {
    var protocol = req.get('x-forwarded-proto');
    protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
  });
}

app.use(express.static(path.join(__dirname, 'client')));

var Log = require('./log');

/*
 |--------------------------------------------------------------------------
 | Login Required Middleware
 |--------------------------------------------------------------------------
 */
function ensureAuthenticated(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
  }
  var token = req.headers.authorization.split(' ')[1];
  var payload = jwt.decode(token, config.TOKEN_SECRET);
  if (payload.exp <= moment().unix()) {
    return res.status(401).send({ message: 'Token has expired' });
  }
  req.user = payload.sub;
  next();
}

/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
function createToken(user) {
  console.log("Create Token")
  var payload = {
    sub: user._id,
    iat: moment().unix(),
    exp: moment().add(14, 'days').unix()
  };
  return jwt.encode(payload, config.TOKEN_SECRET);
}


app.post('/start/', function(req,res){
	var log = new Log({
    chord: req.body.chord,
    L: req.body.L,
    status: false,
    finish: false
  });

  log.save(function() {
    res.json(log);
  });

  requester.send(JSON.stringify(log));

});

app.post('/recover/', function(req,res){
  Log.findById(req.body._id,function(err,result) {
    
    if(err) {
      console.log(err);
    } else {
      console.log(JSON.stringify(result));
      requester.send(JSON.stringify(result));
    }

  });
});

/** ROUTES */
app.get('/details/:id', function(req, res) {
  // Return the list of logs
  Log.find({ _id : req.params.id},function(err,log) {
      res.json(log);
  });
});

/** API LOG */
app.get('/log', function(req, res) {
  // Return the list of logs
  Log.find({},function(err,log) {
      res.json(log);
  });
});

app.post('/log', function(req, res) {
    
    var log = new Log({
      state: req.body.state
    });
    
    log.save(function() {
      res.json(log);
    });
});

/*
 |--------------------------------------------------------------------------
 | Log in with Email
 |--------------------------------------------------------------------------
 */
app.post('/auth/login', function(req, res) {
  User.findOne({ email: req.body.email }, '+password', function(err, user) {
    if (!user) {
      return res.status(401).send({ message: 'Wrong email and/or password' });
    }
    user.comparePassword(req.body.password, function(err, isMatch) {
      if (!isMatch) {
        return res.status(401).send({ message: 'Wrong email and/or password' });
      }
      res.send({ token: createToken(user) });
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Create Email and Password Account
 |--------------------------------------------------------------------------
 */
app.post('/auth/signup', function(req, res) {
  console.log("Sign up Node")
  User.findOne({ email: req.body.email }, function(err, existingUser) {
    if (existingUser) {
      return res.status(409).send({ message: 'Email is already taken' });
    }
    var user = new User({
      displayName: req.body.displayName,
      email: req.body.email,
      password: req.body.password
    });
    user.save(function() {
      res.send({ token: createToken(user) });
    });
  });
});


/*
 |--------------------------------------------------------------------------
 | Start the Server
 |--------------------------------------------------------------------------
 */
app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

/**
Unit testing of some functions of lbclient.js
*/
var test=require('assert')
/**
Test 1. Log Database. Check that a Log can be stored and recovered from the database
*/
//------------------------------------------------------------------------------
var logtest = new Log({
	chord: 123,
	L: 5,
	status: false,
	finish: false
});
//Save the Log object
logtest.save(function(error) {
	if(error)
		test.fail(0,0,"Error at test 1.1. Could not save the Log: "+error)
	//Check that the object is in the database
	Log.findById(logtest._id,function(err,result) {
		
	if(err) {
		test.fail(0,0,"Error at test 1.2. Could not find the Log: "+err)
	} 
	else {
		test.deepEqual(logtest._id,result._id,"Error at test 1.3. Logs are different. Original has id: "+logtest._id+" while the other: "+result._id)
	}

	});
	
});

/**
Test 2. User Database. Check that a User can be stored and recovered from the database
*/
//------------------------------------------------------------------------------
var user = new User({
      displayName: "Oscar",
      email: "oscar_rocks@gmail.com",
      password: "password"
    });
//Save the User object
user.save(function(error) {
	if(error)
		test.fail(0,0,"Error at test 1.1. Could not save the User: "+error)
	//Check that the object is in the database
	User.findOne({email:user.email},function(err,result) {
	if(err) {
		test.fail(0,0,"Error at test 1.2. Could not find the user: "+err)
	} 
	else {
		test.deepEqual(user.email,result.email,"Error at test 1.3. Users are different. Original has email: "+user.email+" while the other: "+result.email)
	}

	});
	
});

/**
Test 3. Login. Check that a user registered in the database can login
*/
//------------------------------------------------------------------------------




