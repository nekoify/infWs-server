const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
let { DB } = require("mongquick");
// const mongoSec = process.env.mongoSec
// const mdb = new DB(`mongodb+srv://xl83:${mongoSec}@cluster0.c2sln.mongodb.net/Cluster0?retryWrites=true&w=majority`);

 // mdb.set(`info-${userLower}`, {pass: hash, user: data.username});
// await mdb.get(`info-${checkLower}`)
const io = require("socket.io")(server, {
    cors: {
        origin: "https://aeolus-1.github.io"
    }
});

app.get('/', (req, res) => {
    res.send('server');
});

io.on('connection', async(socket) => {
  
 
})

server.listen(process.env.PORT || 8085, () => {
    console.log('listening on *:3000');
})