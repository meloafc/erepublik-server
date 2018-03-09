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
serverRef.update({
  start: admin.database.ServerValue.TIMESTAMP
});

var request = require('request');
var cheerio = require('cheerio');
var express = require('express');

var app = express();
app.set('port', process.env.PORT || 5000);

require('./routes/server.routes.js')(app);

app.get('/', function (req, res) {
  res.send('ONLINE');
});

app.get('/ping', function (req, res) {
  let ref = db.ref('server/ping');
  ref.transaction(function (currentCounter) {
    return (currentCounter || 0) + 1;
  });
  res.send('pong');
});

app.get('/log', function (req, res) {
  db.ref('server').once("value", function (snap) {
    res.send(snap);
  });
});

app.get('/player/:id', function (req, res, next) {
  let id = req.params.id;

  let url = 'https://www.erepublik.com/br/citizen/profile/' + id;
  request(url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      const $ = cheerio.load(body);

      $('img.citizen_avatar').each(function (i, element) {
        const name = $(this).attr('alt');

        $('#achievment').find('li').each(function (i, element) {
          let medal = $(this).children('img').attr('alt');
          if (medal === 'resistance hero') {
            let resistanceHero = $(this).children('.counter').text();
            if (!resistanceHero) {
              resistanceHero = 0;
            }
            return res.json({
              "name": name,
              "resistance_hero": resistanceHero
            });
          }
        });

      });

    } else {
      return res.json({});
    }
  });
});

app.listen(app.get('port'), function () {
  console.log('App is listening on port ' + app.get('port'));
});

var http = require("http");
var ping = process.env.PING || 'http://localhost:5000/ping';

console.log('ping url: ' + ping);

setInterval(function () {
  http.get(ping);
}, 300000);

battlesActive = function() {
  request({
    url: EREPUBLIK_DEUTSCHLAND_API + '/battles/active',
    json: true
  }, function (error, response, body) {
  
    if (!error && response.statusCode === 200) {
      for (const i in body.active) {
        // console.log(i + ' = ' + body.active[i].general.type + ' | ' + body.active[i].region.name);
        region = 'Dublin';
        if (body.active[i].region.name === region) {
          console.log(body.active[i]);
        }
      }
      // console.log(body.active) // Print the json response
    }
  
  })
}

countries = function() {
  request({
    url: EREPUBLIK_DEUTSCHLAND_API + '/countries/details/all',
    json: true
  }, function (error, response, body) {
    let countryCounter = 0;
    let regionCounter = 0;
  
    if (!error && response.statusCode === 200) {
      for (const countryId in body.countries) {
        countryCounter += 1;
        console.log(body.countries[countryId].country_name);

        for (const regionId in body.countries[countryId].regions.lists.original) {
          regionCounter += 1;
          console.log('-' + body.countries[countryId].regions.lists.original[regionId].region_name);
        }
      }

      console.log('countryCounter ' + countryCounter);
      console.log('regionCounter ' + regionCounter);
    }
  
  })
}

players = function() {
  request({
    url: EREPUBLIK_DEUTSCHLAND_API + '/players/details/2',
    json: true
  }, function (error, response, body) {
  
    if (!error && response.statusCode === 200) {
      for (const i in body.players) {
        console.log(body.players[i].name + ' | ' + body.players[i].general.lastupdate);
        
        let tempRef = db.ref('temp');
        tempRef.push({
          time: admin.database.ServerValue.TIMESTAMP,
          player: body.players[i].name,
          lastupdate: body.players[i].general.lastupdate
        });
      }
    }
  
  })
}

var moment = require('moment');

app.get('/temp', function (req, res) {
  db.ref('temp').once("value", function (snapshot) {

    const retorno = []

    snapshot.forEach(object => {
      const serverTime = moment(object.val().time).fromNow();

      retorno.push({
        lastupdate: object.val().lastupdate,
        player: object.val().player,
        serverTime: serverTime,
      });
    });

    res.send(retorno);
  });
});

var CronJob = require('cron').CronJob;
new CronJob('0 0,10,20,30,40,50 * * * *', function() {
  console.log('-------------------');
  console.log(moment().format());
  players();
}, null, true, 'America/Manaus');
