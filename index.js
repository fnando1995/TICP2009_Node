const request = require('request');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

// Se traen al servidor las monedas y se almacena en variable.
const dict_coins = {}
request('https://api.coingecko.com/api/v3/coins/list',{ json: true }, (err, res, body)=> {
  if (err) { return console.log(err); }
  body.forEach(element => {
    dict_coins[element.symbol]={"id":element.id,"name":element.name}
  });
  console.log("Lista de Monedas cargadas")
});
// Se traen las monedas validas de intercambio
const supported_coins=[];
request('https://api.coingecko.com/api/v3/simple/supported_vs_currencies',{ json: true }, (err, res, body)=> {
  if (err) { return console.log(err); }
  body.forEach(element => {
    supported_coins.push(element);
  });
  console.log('Lista de Monedas soportadas cargada')
});

// Funcion para mostrar mensajes de ayuda
function helpCrypto(userId){
  io.to(userId).emit("chat to crypto"," ----------------------------------------------");
  io.to(userId).emit("chat to crypto","... CryptoBot Helper ...");
  io.to(userId).emit("chat to crypto","A continuación las opciones:");
  io.to(userId).emit("chat to crypto","--help");
  io.to(userId).emit("chat to crypto","Muestra opciones de ayuda.");
  io.to(userId).emit("chat to crypto","--show");
  io.to(userId).emit("chat to crypto","Muestra los nombres y ids de las cryptomonedas o monedas fiat válidas de intercambio.");
  io.to(userId).emit("chat to crypto","--CRYPTO_ID");
  io.to(userId).emit("chat to crypto","Ejemplo --btc. Esta opción muestra el cambio de 1 unidad de Bitcoin (btc) y Dolares Americanos (USD).");
  io.to(userId).emit("chat to crypto","--CRYPTO_ID INT/FLOAT");
  io.to(userId).emit("chat to crypto","Ejemplo --btc 0.001. Esta opción muestra el cambio de 0.001 unidades de Bitcoin (btc) y Dolares Americanos (USD).");
  io.to(userId).emit("chat to crypto","--CRYPTO_ID1 --CRYPTO_ID2");
  io.to(userId).emit("chat to crypto","Ejemplo --btc --eth. Esta opción muestra el cambio de 1 unidad de Bitcoin (btc) y Ethereum (eth).");
  io.to(userId).emit("chat to crypto","--CRYPTO_ID1 INT/FLOAT --CRYPTO_ID2");
  io.to(userId).emit("chat to crypto","Ejemplo --btc 0.001 --eth. Esta opción muestra el cambio de 0.001 unidades de Bitcoin (btc) y Ethereum (eth).");
  io.to(userId).emit("chat to crypto"," ----------------------------------------------");
}

// Funcion de mensaje generico de argumentos no encontrados
function notFound(userId){
  io.to(userId).emit("chat to crypto","Ese(os) argumento(s) no fue(ron) encontrado(s). Usa --help para más ayuda.");
}
function notInDictCoin(userId,init){
  io.to(userId).emit("chat to crypto",init+' no se encuentra en coingecko...')
}
function notInSupported(userId,end){
  io.to(userId).emit("chat to crypto",end+' no se encuentra entre las cryptos soportadas de cambio. --show para ayuda.')
}
// Funcion que muestra las monedas soportadas de cambio
function showCryptos(userId){
  io.to(userId).emit("chat to crypto"," ---- Lista de Símbolos Monedas Soportadas ----");
    let group=""
    supported_coins.forEach(element => {
      group=group+" | "+element;
      if (group.length>70){
        io.to(userId).emit("chat to crypto",group)
        group = ""
      }
    });
    io.to(userId).emit("chat to crypto",group)
    io.to(userId).emit("chat to crypto"," ----------------------------------------------"); 
}

// Funcion para resolver consultas con 1 solo argumento
function solveOption1(userId,init){
  if (init=='help'){
    helpCrypto(userId);
  }else if(init=='show'){
    showCryptos(userId);
  }else{
      //-crypto- --btc
    if (Object.keys(dict_coins).includes(init)){
      let id = dict_coins[init].id;
      request('https://api.coingecko.com/api/v3/simple/price?ids='+id+'&vs_currencies=usd',{ json: true }, (err, res, body)=> {
      if (err) { return console.log(err); }
      value =body[id]['usd']
      io.to(userId).emit("chat to crypto",'1 unidad de '+init.toUpperCase()+' es '+value+' unidades de USD.')
      });
    }else{
      notInDictCoin(userId,init)
    }
  }
}

// Funcion para resolver caso de 2 argumentos moneda y cantidad
function solveOption2(userId,init,cantidad){
  //-crypto- --btc 10.5
  if (Object.keys(dict_coins).includes(init)){
    request('https://api.coingecko.com/api/v3/simple/price?ids='+dict_coins[init.toLowerCase()].id+'&vs_currencies=usd',{ json: true }, (err, res, body)=> {
      if (err) { return console.log(err); }
      value =body[dict_coins[init].id]['usd']*cantidad
      io.to(userId).emit("chat to crypto",cantidad+' unidades de '+init.toUpperCase()+' es '+value+' unidades de USD.')
    });
  }else{
    notInDictCoin(userId,init)
  }
}

// Funcion para resolver caso de 2 argumentos de dos monedas
function solveOption3(userId,init,end){
  //-crypto- --btc --eth
  if (Object.keys(dict_coins).includes(init)){
    if(supported_coins.includes(end)){
      request('https://api.coingecko.com/api/v3/simple/price?ids='+dict_coins[init].id+'&vs_currencies='+end,{ json: true }, (err, res, body)=> {
        if (err) { return console.log(err); }
        value =body[dict_coins[init].id][end]
        io.to(userId).emit("chat to crypto",'1 unidad de '+init.toUpperCase()+' es '+value+' unidades de '+end.toUpperCase())
      });
    }else{
      notInSupported(userId,end);
    }
  }else{
    notInDictCoin(userId,init)
  }

}
// Funcion para resolver el caso de 3 argumentos dos monedas y una cantidad
function solveOption4(userId,init,cantidad,end){
  //-crypto- --eth 8.24 --xrp
    if (Object.keys(dict_coins).includes(init)){
      if(supported_coins.includes(end)){
        request('https://api.coingecko.com/api/v3/simple/price?ids='+dict_coins[init].id+'&vs_currencies='+end,{ json: true }, (err, res, body)=> {
          if (err) { return console.log(err); }
          value =body[dict_coins[init].id][end]*cantidad
          io.to(userId).emit("chat to crypto",cantidad+' unidades de '+init.toUpperCase()+' es '+value+' unidades de '+end.toUpperCase())
        });
      }else{
        notInSupported(userId,end);
      }
    }else{
      notInDictCoin(userId,init)
    }
}

// Funcion que valida los argumentos ingresados por el usuario
function solveCryptoQuestion(msg){
  let userId = msg.split("|")[0];
  let texto       = msg.split("|")[1].toLowerCase();
  let array = texto.split(" ").slice(1);
  let tamano = array.length;
  console.log(texto,array,userId);
  if(tamano==1){ 
      if (array[0].startsWith("--")){
          solveOption1(userId,array[0].replace("--","").toLowerCase());
      }else{
        notFound(userId)
      }
  }else if (tamano==2){
      if (array[0].startsWith("--") && !isNaN(parseFloat(array[1]))){
          solveOption2(userId,array[0].replace("--","").toLowerCase(),array[1])
      }else if (array[0].startsWith("--") && array[1].startsWith("--")){
          solveOption3(userId,array[0].replace("--","").toLowerCase(),array[1].replace("--","").toLowerCase())
      }else{
        notFound(userId)
      }
  }else if(tamano==3){
      if (array[0].startsWith("--") && !isNaN(parseFloat(array[1])) && array[2].startsWith("--")){
        solveOption4(userId,array[0].replace("--","").toLowerCase(),array[1],array[2].replace("--","").toLowerCase())
      }else{
        notFound(userId)
      }
  }else{
    notFound(userId)
  }
}

// Iniciando servidor
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Definicion mensajes entre clientes/servidor
io.on('connection', (socket) => {
  socket.on('chat to all', msg => {
    io.emit('chat to all', msg);
  });
  socket.on('chat to crypto', msg => {
    solveCryptoQuestion(msg);
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server will run at http://localhost:${port}/, wait for charging data to server`);
});
