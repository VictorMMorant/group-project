var zmq       = require('zmq')
  , requester = zmq.socket('dealer')
  , Q=require('q')
  , id=randString();

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
//requester.on('message',processResponse);

function processResponse(arguments) {
  request = reqOf(requester).then(processResponse);
  var args = Array.apply(null, arguments);
	
  console.log('client ( '+requester['identity']+' ) has received reply: "'+args[1]+'"');

  if(!JSON.parse(args[1]).finish) {
    Log.findByIdAndUpdate(JSON.parse(args[1])._id,{ $set : { iterations: JSON.parse(args[1]).iterations}},function(err, result){
        if(err){
            console.log(err);
        }
        
        result.save(function(err) {
          if (err)
            console.log('error')
          else {
            requester.send(['',JSON.stringify(result)]);

            console.log('success')
            console.log(result);
          }
        });
        
    });
  } else {
      Log.findByIdAndUpdate(JSON.parse(args[1])._id,{ $set : { status: true }},function(err, result){
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
var https = require('https');
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

app.set('port', process.env.PORT || process.argv[3]);
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

  requester.send(['',JSON.stringify(log)]);

});

app.post('/recover/', function(req,res){
  Log.findById(req.body._id,function(err,result) {
    
    if(err) {
      console.log(err);
    } else {
      console.log(JSON.stringify(result));
      requester.send(['',JSON.stringify(result)]);
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
  console.log('Express server listening on HTTP port ' + app.get('port') + ' and HTTPS port 8443');
  
});
https.createServer({
      key: "-----BEGIN PRIVATE KEY-----\n\
MIICdQIBADANBgkqhkiG9w0BAQEFAASCAl8wggJbAgEAAoGBAKYTHUxptvj+qwDF\n\
k+XayGFk4eFucP3rlPzLu8PjYFseDOad8ImsLx7MyhtuqxIyi3J74AwKLFuSm0av\n\
d7Zm9ryHGgNAMyLmnnB/dKb97vrvpDlXQUE8Pl9BKOHG6CUdVOqpNeKw5CMsj+VL\n\
f9wETsw+MV+GrClcADBZ1+Wi6E1JAgMBAAECgYBJ0yNqDXBd/W9s12eofPooeV0E\n\
BkFKTwga3EIqkRALUS9w8PK1cIo9ydFqImb/nuJoUPLGx1rylhhacrPnrJuveZjd\n\
xG/H8UxnXMWQKGN+dFZ9H90izgx5PbyqRjXiz/H1qTaIBqwXIEGAOvHeQ4jKWv53\n\
+UjJL88dD7bOCuuQtQJBAM9WiJ5d3khCla4E9ry+aTaaOL/biGK3HcIkgRJx7RmG\n\
xqDPaS0jJ/MLeW1uyf0uxRSiTXynEcshVxW9lyMAe6MCQQDNDVv8/ND36nCziKdf\n\
Ag87q95sX1zsnuQe4FCL0/YcmJ7wZoi5QjM9lszSi7H2MQhHvGeD5tMSk7WyVOcD\n\
oWIjAkAV1SHbszy11TUXtvQYWeCQXFr/cOmCo4+houBohdCWsId35X9Ivnv1bs7h\n\
hBoG7AbarmCEcL9B6YfXBTjF+cYLAkB9jj2SRjeqZhoGRJm/eiJbtlxmXWon1Q73\n\
vQB07h/X2LgRmacEUP3RK4JVNYaNqe5ZBosX4AHEcT+jZ4tg1LOjAkAxcVll+Izg\n\
ZMTFcA1ygK4nyweIIlygdkNKrhyfdHZ9Ck6llMag9ZJgLInf4RyHgM3WKc5vNQ84\n\
bWd+2DS6CLUX\n\
-----END PRIVATE KEY-----",
      cert: "-----BEGIN CERTIFICATE-----\n\
MIICWDCCAcGgAwIBAgIJAMAskdceixmuMA0GCSqGSIb3DQEBBQUAMEUxCzAJBgNV\n\
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX\n\
aWRnaXRzIFB0eSBMdGQwHhcNMTUwMzI2MjAxNjQ2WhcNMTYwMzI1MjAxNjQ2WjBF\n\
MQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50\n\
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKB\n\
gQCmEx1Mabb4/qsAxZPl2shhZOHhbnD965T8y7vD42BbHgzmnfCJrC8ezMobbqsS\n\
Motye+AMCixbkptGr3e2Zva8hxoDQDMi5p5wf3Sm/e7676Q5V0FBPD5fQSjhxugl\n\
HVTqqTXisOQjLI/lS3/cBE7MPjFfhqwpXAAwWdflouhNSQIDAQABo1AwTjAdBgNV\n\
HQ4EFgQULWLJwnYULFdMaYomPOo6O/4Z7DwwHwYDVR0jBBgwFoAULWLJwnYULFdM\n\
aYomPOo6O/4Z7DwwDAYDVR0TBAUwAwEB/zANBgkqhkiG9w0BAQUFAAOBgQAvUb7Z\n\
uOplTk6inchw04t7ylWQ0aWFXPXGaHMCtIbmY+EV7QiIubwowuSqCSpPSnN38fDT\n\
qVNwVtTM/pGfL421c7Ymf8TXDoXlVuNkMipx7SCTDkjhoSyGuj35WeYjcZHlrBMT\n\
dVgRxW82icUC00xr0QBbwq3w9k3wg0pB6CHkEA==\n\
-----END CERTIFICATE-----"
    }, app).listen(process.argv[4]);