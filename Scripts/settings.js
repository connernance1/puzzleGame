let inputBuffer = [];
let changekey = false;
let currentKey;
let storelocation;

function changeKeys(key){
    changekey = true;

    document.getElementById('message').style.visibility = "";

    if(key == "up"){
        currentKey = localStorage.getItem("thrustUp");
        storelocation = "thrustUp";
    }
    else if(key == "right"){
        currentKey = localStorage.getItem("rotateRight");
        storelocation = "rotateRight";
    }
    else if(key == "left"){
        currentKey = localStorage.getItem("rotateLeft");
        storelocation = "rotateLeft";
    }
}

function getKey(key){
    console.log(key, currentKey)
    
    localStorage[storelocation] = inputBuffer[key];
    inputBuffer = [];
    if(changekey){
        changekey = false;
        document.getElementById('message').style.visibility = "hidden";

    }

    updateKeys();
}

function updateKeys(){

    // var up = document.getElementById('up');
    // var left = document.getElementById('left');
    // var right = document.getElementById('right');

    console.log('these are my ids', document.getElementById('up').value,document.getElementById('left').value,document.getElementById('right').value )

    var thrust = localStorage.getItem('thrustUp');
    var rotateR = localStorage.getItem('rotateRight');
    var rotateL = localStorage.getItem('rotateLeft');

    document.getElementById('up').value ='';
    document.getElementById('left').value = '';
    document.getElementById('right').value = '';

    document.getElementById('up').value = thrust;
    document.getElementById('left').value = rotateL;
    document.getElementById('right').value = rotateR;
}



function initialize() {

    updateKeys();

    console.log("hellow world")
    window.addEventListener('keydown', function(event) {
        inputBuffer[event.key] = event.key;
        if(changekey){
            getKey(event.key);
        }
    });
}




//lANDER.JS LOGIC
//  -Get key from local storage, use as key
//      - if key from local storage is null
//          -use default set key.
//          -set default in local storage.
//          -on menu load, store default key 
//           local storage, if empty.

//-----------------------------//
//onRender
//  - Gets keys from local storage and displays 
//    in button values

//Click on button
//  - sets boolean value to true
//      - once true, next key pressed gets passed
//        into function that changes key


//Change key(keypressed)
//  -Get previous key from local storage
//  -update localstorage with 'keypressed'
//  -set boolean value to false