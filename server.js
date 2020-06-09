const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); //mongodb
const neo4j = require('neo4j-driver'); //neo4j driver
const redis = require('redis'); // redis 
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const request = require('request'); // required to fetch json from url
const beautify = require("json-beautify");

const Users = require('./models/covid')

var port = process.env.PORT || 8000

const app = express();

// app.use(express.static(path.join(__dirname,'client','build')));
// app.get('/', (req,resp) => {
//    console.log('helloworld!');
//   resp.sendFile(path.join(__dirname,'client','build','index.html'));
// });


app.use(bodyParser.json())
app.use(morgan('dev'))
app.use(cors())
app.use(
  bodyParser.urlencoded({
    extended: false
  })
)



const mongoURI = 'mongodb://localhost:27017/COVID';



mongoose
  .connect(mongoURI, {useNewUrlParser: true})
  .then(() => console.log("MongoDB connected"))

//   var COVID = require('./models/covid')

// redis connection
var client = redis.createClient();
client.on('connect', function() {
  console.log('Redis connected');
});

//redis route to check whether query is working
app.get('/redis', function(req,res) {
  client.hmset("hosts", "mjr", "1", "another", "23", "home", "1234");
  client.hgetall("hosts", function (err, obj) {
      console.dir(obj);
  });
  res.send("redis works");
});

// home route
app.get('/', function(req,res) {
    res.send( 'Express');
});

//neo4j basic connection
const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j','rajath@123')); //neo4j connection
const session = driver.session();

// neo4j route to query
app.get('/neo4j', function(req, res){
      session
      .run('MATCH (tom {name: "Tom Hanks"}) RETURN tom')
      .then(function(result){
        result.records.forEach(function(record){
          console.log(record);
        });
      })
      .catch(function(err){
        console.log(err);
      })
      res.send("neo4j works");
    });

//mongodb connection to fetch json from url and load into collection
app.get('/patientslist', function(req, res){

  // Define where the MongoDB server is
  var api = 'https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json';
  // Connect to the server
  mongoose.connect(mongoURI, function (err, db) {
  if (err) {
    console.log('Unable to connect to the Server', err);
  } else {
    // We are connected
    console.log('Connection established to', mongoURI,api);
 
    // Get the documents collection
    var collection = db.collection('COVID');
    request.get(api, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        var data = JSON.parse(body);
        res.send("Successfully stored in mongodb");

        var url = "mongodb://localhost:27017/COVID";
        // Connect to the server
         mongoose.connect(url, function (err, db) {
          if (err) throw err;
          var myobj = data.features.map(patients => patients.attributes);
          

             db.collection("patients").insertMany(myobj, function(err, res) {
              if (err) throw err;
                console.log("Number of documents inserted: " + res.insertedCount);
                db.close();
              });

         })
    }
  });
  }
  });


})



//sample testing mongodb query to find all patients
app.get('/patients', function(req, res){
    // Connect to the server
    mongoose.connect(mongoURI, function (err, db) {
    if (err) {
      console.log('Unable to connect to the Server', err);
    } else {
      // We are connected
      console.log('Connection established to', mongoURI);
   
      // Get the documents collection
      var collection = db.collection('COVID');
   
      // Find all patients
      
      collection.find({}).toArray(function (err, result) {
        if (err) {
          res.send(err);
        } else if (result.length) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(JSON.stringify(result, null,  100))
        } else {
          res.send('No documents found');
        }
        //Close connection
        db.close();
      });
    }
    });

  });



app.get('/patients/county', function(req, res){

    mongoose.connect(mongoURI, function (err, db) {
  if (err) {
    console.log('Unable to connect to the Server', err);
  } else {
    // We are connected
    console.log('Connection established to', mongoURI);
 
  var collection = db.collection('COVID');
  db.collection('patients').aggregate( [{$match: { $and: [ {$or:[{NeuerFall:0},{NeuerFall:1}]}] } },{$group:{_id:"$Landkreis"}}] ).toArray(function (error, data) {
          db.collection('current').insert(data);
          return res.status(200).send(data);
          //handle error case also 
        })
      }
});
})

server = app.listen(port, function(){
    console.log("Server is running on port:"  + port);
}); 
