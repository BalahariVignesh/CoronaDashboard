const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const cors = require("cors");
const neo4j = require('neo4j-driver');
const redis = require('redis');
const http = require('http');
const request = require('request');



const app = express();
 app.get('/',(req,resp)=>{
     console.log('Hello World');
     resp.send('Hello World');
 })
app.use(express.json());

const mongodb=config.get('mongoURI');
mongoose
    .connect(mongodb,{
        useNewUrlParser:true,
        useCreateIndex:true,

    })
    .then(()=>console.log("Mongo is Connected successfully"))
    .catch(err=>console.log(err));


//redis
// const client = redis.createClient('6379','0.0.0.0');
// client.on('connect',()=>{
//     console.log('Redis is connected');
// })

//neo4j
const neodb = config.get('neo4jURI');
const neodriver = neo4j.driver(neodb,neo4j.auth.basic('neo4j','neo4j'));
const session = neodriver.session();

//redis route to check whether query is working
app.get('/redis', function(req,res) {
    client.hmset("hosts", "mjr", "1", "another", "23", "home", "1234");
    client.hgetall("hosts", function (err, obj) {
        console.dir(obj);
    });
    res.send("redis works");
  });




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
  console.log('Inside list')
    var api = 'https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_COVID19/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json';
    // Connect to the server
    mongoose.connect(mongodb, function (err, db) {
    if (err) {
      console.log('Unable to connect to the Server', err);
    } else {
      // We are connected
      console.log('Connection established to',api);
   
      // Get the documents collection
      var collection = db.createCollection('CURRENT_DATA');
      request.get(api, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          var data = JSON.parse(body);
          res.send("Successfully stored in mongodb");
          // Connect to the server
           mongoose.connect(mongodb, function (err, db) {
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
    mongoose.connect(mongodb, function (err, db) {
    if (err) {
      console.log('Unable to connect to the Server', err);
    } else {
      // We are connected
      console.log('Connection established to', mongodb);
   
      // Get the documents collection
      var collection = db.collection('CURRENT_DATA');
   
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


const port = 8080;
app.listen(port, ()=>console.log(`Server running on port ${port}`));

module.exports=app;