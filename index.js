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







function solveOption1(userId,init){
  if (init=='help'){
    helpCrypto(userId);
  }else{
    io.to(userId).emit("chat to crypto",init);
  }
}
function solveOption2(userId,init,cantidad){
  io.to(userId).emit("chat to crypto",init+"_"+cantidad);
}

function solveOption3(userId,init,cantidad,end){
  io.to(userId).emit("chat to crypto",init+"_"+cantidad+"_"+end);
}
function  solveErrorRegex(userId,texto){
  texto = texto.replace("-crypto- ","")
  io.to(userId).emit("chat to crypto","No se entiende argumentos: "+texto);
  io.to(userId).emit("chat to crypto","Envia --help para mostrar opciones...");
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
        solveErrorRegex(userId,texto);
      }
  }else if (tamano==2){
      if (array[0].startsWith("--") && !isNaN(parseFloat(array[1]))){
          solveOption2(userId,array[0].replace("--",""),array[1])
      }else{
        solveErrorRegex(userId,texto);
      }
  }else if(tamano==3){
      if (array[0].startsWith("--") && !isNaN(parseFloat(array[1])) && array[2].startsWith("--")){
        solveOption3(userId,array[0].replace("--",""),array[1],array[2].replace("--",""))
      }else{
        solveErrorRegex(userId,texto);
      }
  }else{
    solveErrorRegex(userId,texto);
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
