'use strict';

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var fs = require('fs');
var childProcess = require("child_process");
var bodyParser = require('body-parser');


// Create static public directory
app.set('port', process.env.PORT || 8057);
app.use(express.static(__dirname + '/static'));
app.use(express.urlencoded());
app.use(bodyParser.json());

server.listen(app.get("port"), function () {
  console.log("Please connect to http://localhost:" + app.get("port"));
});

var CodeRunner = {

  // Run the specified code
  run: function( code, handleError ) {
    var filename = __dirname + '/robotnik-file.js';
    var codeRunner = this;
    fs.writeFile( filename, code, function(err) {
      if (!err) {
        codeRunner.child = childProcess.fork( filename );
        codeRunner.child.on('exit', function(code, signal) {
          // 8 = horrible error
          if ( code === 8 ) {
            handleError();
          }
        });
      }
    });
  },

  // Kill the process
  kill: function() {
    if ( this.child ) {
      this.child.kill();
    }
  },

  // Send a message
  send: function(message) {
    if ( this.child ) {
      this.child.send(message);
    }
  },

  is_alive: function() {

  }

};

app.post('/message', function(req,res) {
  var message = req.body.message,
    channel = req.body.channel;

  console.log( '/' + channel + '/ ' + message );

  if ( channel === 'code' ) {
    CodeRunner.run( message, function() {
      res.send('Program closed unexpectedly');
    });
  }

  if ( channel === 'control' ) {
    CodeRunner.send( message );
    if ( message === 'stop' ) {
      CodeRunner.kill();
    }
  }
  res.send('OK');
});

app.get('/api/workshops', function(req, res) {
  fs.readdir('./workshops', function(err, files) {
    var workshops = files.map(function(file) {
      var fileData = fs.readFileSync('./workshops/' + file);
      var data = JSON.parse(fileData);
      data.id = file.split('.')[0];
      return data;
    });

    res.send(workshops);
  });
})

app.get('/api/workspaces', function(req, res) {
  fs.readdir('./workspaces', function(err, files) {
    var workspaces = files.map(function(file) {
      var fileData = fs.readFileSync('./workspaces/' + file);
      if ( fileData.length ) {
        var data = JSON.parse(fileData);
        data.id = file.split('.')[0];
        return data;
      }
    });
    res.send(workspaces);
  });
});

app.post('/api/workspaces', function(req, res) {
  var workspace = req.body;
  var filename = './workspaces/' + workspace.id + '.json';

  fs.writeFile( filename, JSON.stringify(req.body), function() {
    res.send('OK');
  });
});
