const express = require('express');
var cors = require('cors')
var os = require("os");

const morgan = require('morgan');
// morgan è un middleware per il loggin di eventi, di default reindirizza tutto su stdout
// che è una best pratice per la gestione dei log su docker

const MongoClient = require('mongodb').MongoClient;

const {
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_HOSTNAME,
  MONGO_PORT,
  MONGO_DATABASE_NAME
} = process.env;

// Connection URL
const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}`;

// Create a new MongoClient
const client = new MongoClient(url);

let db;
// Use connect method to connect to the Server
setTimeout(() => {
  client.connect(function(err) {
    if (err) {
      return console.error(err);
    }
    console.log("Connected successfully to database");
    db = client.db(MONGO_DATABASE_NAME);
  });
}, 2000);

// Api
const app = express();
app.use(cors());
app.use(morgan('common'));

app.get('/', async function (req, res, next) {
  const options = { // upsert è usato per creare l'oggetto nel db se non esiste ancora
    upsert: true
  };
  
  res.send('hello from host: <br>'+ os.hostname() + "  " + MONGO_USERNAME + "  " + MONGO_PASSWORD);
});

app.get('/ping', async function (req, res, next) {
  const options = { // upsert è usato per creare l'oggetto nel db se non esiste ancora
    upsert: true
  };

  const query = { hostname: os.hostname() };
  const update = { $inc: { counter: 1 }};
 if (db) {
    await db.collection('connections').updateOne(query, update, options);
    db.collection("connections").find({hostname: os.hostname()}).toArray(function(err, data) {
      if (err) {
        console.error(err);
        next(new Error('Error while talking to database')); // utile per loggare l'errore
      } else {
        setTimeout(() => { // utile per simulare del "carico"
          res.json(data);
        }, 500);
      }
    });
 } else {
  res.json({hostname: os.hostname(), status: "pending"});
 }
});


app.get('/kill', function (req, res) {
  res.json({hostname: os.hostname(), status: "killed"});
  process.kill(process.pid, 'SIGTERM');
});

app.get('/connections', function (req, res, next) {
  // might have not been connected just yet
  if (db) {
    db.collection('connections').find({}).toArray(function(err, conn) {
      if (err) {
        console.error(err);
        next(new Error('Error while talking to database')); // utile per loggare l'errore
      } else {
        res.json(conn);
      }
    });
  } else {
    next(new Error('Waiting for connection to database'));
  }
})

module.exports = app;
