const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
app.use(cors());

const server = http.createServer(app);
const ws = new WebSocket.Server({ port: 8080 })




mongoose.connect('mongodb://localhost/websockets', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connected to database'))
.catch(err => console.error('Could not connect', err));

const User = mongoose.model('User',  new mongoose.Schema({
    name: {
        type: String,
        required: true,
        },
        email: {
            type: String,
            required: true,
        }
}));


ws.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => {
      ws.isAlive = true;
  });
});

setInterval(() => {
  ws.clients.forEach((ws) => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping(null, false, true);
  });
}, 10000);



//initialize a simple http server

ws.on('connection', async ws => {

    ws.on('message', async message => {
      try {
          const body =  JSON.parse(message);
          let user = new User({ 
              name: body.name,
              email: body.email,
          });
          const resuser = await user.save();

          const fetchUsers = await User.find();
          const resUsers = JSON.stringify({allUsers: fetchUsers});
          setTimeout(function timeout() {
              ws.send(resUsers);
          }, 500);
      } catch (error) {
          console.log(error);
      }
    });
    const fetchUsers = await User.find();
    const resUsers = JSON.stringify({allUsers: fetchUsers});
    setTimeout(function timeout() {
      ws.send(resUsers);
  }, 500);
})

//start our server
server.listen(Number(2500), () => {
    console.log(`Server started on port ${JSON.stringify({server})}`);
});