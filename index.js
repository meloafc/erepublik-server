const admin = require('firebase-admin');

let configFirebase;

let PROJECT_ID;
let CLIENT_EMAIL;
let PRIVATE_KEY;
let DATABASE_URL;

let configFileExist = false;
try {
    configFirebase = require('./config-firebase.json');
    configFileExist = true;
} catch (ex) {
    console.log('No config file found.');
}

if(configFileExist) {
    PROJECT_ID = configFirebase.project_id;
    CLIENT_EMAIL = configFirebase.client_email;
    PRIVATE_KEY = configFirebase.private_key;
    DATABASE_URL = configFirebase.database_url;
} else {
    PROJECT_ID = process.env.PROJECT_ID;
    CLIENT_EMAIL = process.env.CLIENT_EMAIL;
    PRIVATE_KEY = JSON.parse(process.env.PRIVATE_KEY);
    DATABASE_URL = process.env.DATABASE_URL;
}

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: PROJECT_ID,
        clientEmail: CLIENT_EMAIL,
        privateKey: PRIVATE_KEY
    }),
    databaseURL: DATABASE_URL
});

var db = admin.database();

let serverRef = db.ref('server');
serverRef.update({
  start : admin.database.ServerValue.TIMESTAMP
});

var request = require('request');
var cheerio = require('cheerio');
var express = require('express');

var app = express();
app.set('port', process.env.PORT || 4200);

app.get('/', function (req, res) {
  res.send('ONLINE');
});

app.get('/ping', function (req, res) {
  let ref = db.ref('server/ping');
  ref.transaction(function(currentCounter) {
      return (currentCounter || 0) + 1;
  });
  res.send('pong');
});

app.get('/log', function (req, res) {
  db.ref('server').once("value", function(snap) {
    res.send(snap);
  });
});

app.get('/player/:id', function(req, res, next) {
  let id = req.params.id;

  let url = 'https://www.erepublik.com/br/citizen/profile/' + id;
  request(url, function (error, response, body) {
      if (!error && response.statusCode === 200) {
          const $ = cheerio.load(body);

          $('img.citizen_avatar').each(function(i, element) {
            const player = $(this).attr('alt');
            res.send(player);
          });

      } else {
        if (response.statusCode === 404) {
          res.send('Jogador não encontrado');
        }
        console.log(error);
      }
  });
});

app.listen(app.get('port'), function () {
  console.log('App is listening on port ' + app.get('port'));
});

var http = require("http");
var ping = process.env.PING || 'http://localhost:4200/ping';

setInterval(function() {
  http.get(ping);
}, 60000);