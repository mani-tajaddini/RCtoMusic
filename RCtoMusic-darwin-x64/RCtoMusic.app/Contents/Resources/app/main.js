const electron = require('electron')
const child_process = require('child_process')
const {ipcMain} = electron
var open = require("open");
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

// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

var outPLot
var outMusic
var ipcEvent
var sign = 0

wss.on('connection', function connection(ws) {
  setInterval(function(){
    if(sign === 1){
      ws.send(JSON.stringify({type: "command", value: "restart"}))
      sign = 0
    }
  }, 10)

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
      case "done":
        if(message.value === "done"){
          ipcEvent.sender.send('async-reply', "done")
        }
        break;
    }
  })
});

ipcMain.on('async', (event, arg) => {
  console.log("got the messaaagggeeee");
   ipcEvent = event;
   if(arg === "restart"){
     sign = 1
   }
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
