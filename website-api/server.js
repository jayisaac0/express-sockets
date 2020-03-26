const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const {userController, preloadUsers }= require('./controllers/user.controller');

const app = express();
app.use(cors());
const server = http.createServer(app);

const WebSocket = require('ws').Server;
const ws = new WebSocket({ port: 8080 })

mongoose.connect('mongodb://localhost/websockets', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connected to database'))
.catch(err => console.error('Could not connect', err));


 
ws.on('connection', async(socket) => {
    socket.on('message', async(message) => {

        userController(ws, socket, message);
    });

    preloadUsers(socket);
    
    socket.on('close', () => {
        console.log("I lost a client");
    });
    console.log("One more cient conected");
       
});

server.listen(Number(2500), () => {
    console.log(`Server started on port ${JSON.stringify({server})}`);
});