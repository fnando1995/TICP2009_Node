let texto="-crypto- --btc".toLowerCase();;
console.log(texto);
let array = texto.split(" ").slice(1);
let tamano = array.length;
if(tamano==1){ 
    if (array[0].startsWith("--")){
        let init=array[0].replace("--","");
        console.log("opcion1",texto);
    }
}else if (tamano==2){
    if (array[0].startsWith("--") && !isNaN(parseFloat(array[1]))){
        let init=array[0].replace("--","");
        let cantidad=array[1];
    }
}else if(tamano==3){
    if (array[0].startsWith("--") && !isNaN(parseFloat(array[1])) && array[2].startsWith("--")){
        let init=array[0].replace("--","");
        let cantidad=array[1];
        let end=array[2].replace("--","");
    }
}else{
  console.log(otros);
}


// console.log();

