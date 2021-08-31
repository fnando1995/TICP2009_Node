const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

function helpCrypto(userId){
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
  
}
function notFound(userId){
  io.to(userId).emit("chat to crypto","Ese(os) argumento(s) no fue(ron) encontrado(s). Usa --help para más ayuda.");
}

function showCryptos(userId){
  io.to(userId).emit("chat to crypto"," ---- Lista de Monedas Válidas ----");
  io.to(userId).emit("chat to crypto","btc | bitcoin");

}



function solveOption1(userId,init){
  if (init=='help'){
    helpCrypto(userId);
  }else if(init=='show'){
    showCryptos(userId);
  }else{
    io.to(userId).emit("chat to crypto",init);
  }
}
function solveOption2(userId,init,cantidad){
  io.to(userId).emit("chat to crypto",init+"_"+cantidad);
}

function solveOption3(userId,init,end){
  io.to(userId).emit("chat to crypto",init+"_"+end);
}

function solveOption4(userId,init,cantidad,end){
  io.to(userId).emit("chat to crypto",init+"_"+cantidad+"_"+end);
}


function solveCryptoQuestion(msg){
  let userId = msg.split("|")[0];
  let texto       = msg.split("|")[1].toLowerCase();
  let array = texto.split(" ").slice(1);
  let tamano = array.length;
  console.log(texto,array,userId);
  if(tamano==1){ 
      if (array[0].startsWith("--")){
          solveOption1(userId,array[0].replace("--",""));
      }else{
        notFound(userId)
      }
  }else if (tamano==2){
      if (array[0].startsWith("--") && !isNaN(parseFloat(array[1]))){
          solveOption2(userId,array[0].replace("--",""),array[1])
      }else if (array[0].startsWith("--") && array[1].startsWith("--")){
          solveOption3(userId,array[0].replace("--",""),array[1].replace("--",""))
      }else{
        notFound(userId)
      }
  }else if(tamano==3){
      if (array[0].startsWith("--") && !isNaN(parseFloat(array[1])) && array[2].startsWith("--")){
        solveOption4(userId,array[0].replace("--",""),array[1],array[2].replace("--",""))
      }else{
        notFound(userId)
      }
  }else{
    notFound(userId)
  }


}






app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('chat to all', msg => {
    io.emit('chat to all', msg);
  });
  socket.on('chat to crypto', msg => {
    solveCryptoQuestion(msg);
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
