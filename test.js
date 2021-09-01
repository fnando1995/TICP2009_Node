const request = require('request');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;


let dict_coins = {}
request('https://api.coingecko.com/api/v3/coins/list',{ json: true }, (err, res, body)=> {
  if (err) { return console.log(err); }
  body.forEach(element => {
    dict_coins[element.symbol]={"id":element.id,"name":element.name}
  });
  console.log("Lista de Monedas cargadas")
});


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('chat to all', msg => {
    io.emit('chat to all', msg);
  });
  socket.on('chat to crypto', msg => {
    console.log(dict_coins['eth'])
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
