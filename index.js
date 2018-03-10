const admin = require('firebase-admin');

let configErepublikDeutschland;
let configFirebase;

let EREPUBLIK_DEUTSCHLAND_KEY;
let PROJECT_ID;
let CLIENT_EMAIL;
let PRIVATE_KEY;
let DATABASE_URL;

let configFileExist = false;
try {
  configErepublikDeutschland = require('./config-erepublik-deutschland.json');
  configFirebase = require('./config-firebase.json');
  configFileExist = true;
} catch (ex) {
  console.log('No config file found.');
}

if (configFileExist) {
  EREPUBLIK_DEUTSCHLAND_KEY = configErepublikDeutschland.api_key;
  PROJECT_ID = configFirebase.project_id;
  CLIENT_EMAIL = configFirebase.client_email;
  PRIVATE_KEY = configFirebase.private_key;
  DATABASE_URL = configFirebase.database_url;
} else {
  EREPUBLIK_DEUTSCHLAND_KEY = process.env.EREPUBLIK_DEUTSCHLAND_KEY;
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

const EREPUBLIK_DEUTSCHLAND_API = 'https://api.erepublik-deutschland.de/' + EREPUBLIK_DEUTSCHLAND_KEY;

let serverRef = db.ref('server');
serverRef.push({
  start: admin.database.ServerValue.TIMESTAMP
});

var request = require('request');
var cheerio = require('cheerio');
var express = require('express');

var app = express();
app.set('port', process.env.PORT || 5000);

require('./routes/server.routes.js')(app, db);

app.listen(app.get('port'), function () {
  console.log('App is listening on port ' + app.get('port'));
});

require('./jobs/cron-job.js')();
