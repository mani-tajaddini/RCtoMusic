var express = require('express')
var bodyParser = require('body-parser');
var fs = require('fs');
var R = require("r-script")

var appp = express()
appp.use(bodyParser.urlencoded({extended: false}));
appp.use(bodyParser.json());
appp.use(express.static('public'))

appp.listen(8888, function(){
  console.log('listening on port 8888')
})

var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({port : 9999})

var outPLot
var outMusic

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    message = JSON.parse(message)
    switch(message.type){
      case "inputString":
        console.log("message recieved from server: ", message.value);
        outPlot = R("rcPlot.R")
          .data(message.value)
          .callSync()
        ws.send(JSON.stringify({type: "input", value: outPlot}))
        break;
      case "inputNote":
        console.log(message.value);
        outMusic = R("sonify.R")
          .data(message.value[0], message.value[1])
          .callSync()
        console.log("outMusic: ", outMusic);
        ws.send(JSON.stringify({type: "inputMusic", value: outMusic}))
        break;
    }
  })
});
