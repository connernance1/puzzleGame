let canvas = null;
let context = null;
let elem = null;
let inputBuffer = {};
let keyBuffer = {};

let tiles = 0;
let tileSize = 0;
let emptyTile = {x: 384,y: 384}
let currClick = {x: 0, y: 0};

let canClick = true;
let checkedClick = false;
let updatingTilePos = false;
let clickedTileId = 0;
let updatedTileId = false;
let scramblePuzzle = true;
let gameOver = false;

//GameState
let gameState;
let moves = 0;
let score = 0;

//Particles
activateSparks = false;
let particleSystem;
let particlesNorth = [];
let particlesSouth = [];
let particlesEast = [];
let particlesWest = [];

const COORD_SIZE = 512;
let transitionRate = 0;
let PuzzleImages = [];
let PuzzleObjects = [];
let SafeZoneCt = 2;

let imageRender = true;
let puzzleInit = true;
let puzzleDraw = false;

let highscores_E_T = [];
let highscores_E_S = [];
let highscores_H_T = [];
let highscores_H_S = [];
let addedHS = false;

let lastTimeStamp = performance.now();
let timer = 0;
let countDownTimer = 0;
let gameTime = 0;
let countdownnum = 3;
let gameElapsedTime = 0;
let particleTimer = 0;

let imageFire = new Image();
imageFire.src = '../images/fire.png';



function gameLoop(time) {
    let elapsedTime = time - lastTimeStamp;
    lastTimeStamp = time;

    update(elapsedTime);

    processInput(elapsedTime);
    update(elapsedTime);
    render(elapsedTime);

    requestAnimationFrame(gameLoop);
}
function processInput(elapsedTime){
    this.movementInput(elapsedTime);
}
function update(elapsedTime){  

    if(puzzleInit){
        initPuzzle(gameState);
    }
    if(addedHS){
        addHighScore();
        addedHS = false;
    }
    updateTilePos();
    particleSystemLogic(elapsedTime);  // Inside are Particles System Executions
    updateCountDown(elapsedTime);
    updateTimer(elapsedTime);
}
function render(elapsedTime){
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawPuzzle();
    renderTimer();
    renderMoves();
    if(activateSparks){
        particleSystem.render();
    }
    renderGameOver();
}

function particleSystemLogic(elapsedTime){
    if(activateSparks){
        if(typeof(elapsedTime) === 'number'){
            particleTimer += elapsedTime;
            if(particleTimer >= 1500){
                activateSparks = false;
                particleTimer -= 1500;
            }
        }
        particleSystem.updateNorth(elapsedTime);
        particleSystem.updateSouth(elapsedTime);
        particleSystem.updateEast(elapsedTime);
        particleSystem.updateWest(elapsedTime);
    }
    // if(particlesNorth.length > 0){
    //     particleSystem.updateNorth(elapsedTime);
    // }
}



function updateTimer(elapsedTime) {
    if(typeof(elapsedTime) === 'number'){
        timer += elapsedTime;
        if(timer >= 1000){
            updateTime();
            timer -= 1000;
        }
    }
}
function renderTimer(){
    if(typeof(gameState) === 'number'){
        document.getElementById('gameTime').innerHTML = gameElapsedTime;
    }
}
function renderMoves(){
    if(typeof(gameState) === 'number'){
        document.getElementById('moves').innerHTML = moves;
    }
}
function renderGameOver(){
    if(gameOver){
        context.font = "30px Arial";
        context.fillStyle = "Green";
        context.fillText('Congrats! You Solved The Puzzle!!',
                        25, 170);
        context.fillText(countdownnum, 245, 245)
    }
}
function addHighScore(){
    if(gameState == 1){
        let prevScores_E_S = localStorage.getItem("highscores_E_S");
        let prevScores_E_T = localStorage.getItem("highscores_E_T")
        
        highscores_E_S = JSON.parse(prevScores_E_S)
        highscores_E_T = JSON.parse(prevScores_E_T)
        
        highscores_E_S.push(moves);
        highscores_E_T.push(gameElapsedTime);

        highscores_E_S.sort(function(a,b){return a - b});
        highscores_E_T.sort(function(a,b){return a - b});

        if(highscores_E_S.length > 5) highscores_E_S.pop();
        if(highscores_E_T.length > 5) highscores_E_T.pop();

        for(let i = 0; i < highscores_E_S.length; i++){
            if(highscores_E_S[i] == 0){
                highscores_E_S.splice(i,1);
            }
        }
        for(let i = 0; i < highscores_E_T.length; i++){
            if(highscores_E_T[i] == 0){
                highscores_E_T.splice(i,1);
            }
        }

        localStorage['highscores_E_S'] = JSON.stringify(highscores_E_S);
        localStorage['highscores_E_T'] = JSON.stringify(highscores_E_T);
    }
    else if(gameState == 2){
        let prevScores_H_S = localStorage.getItem("highscores_E_S");
        let prevScores_H_T = localStorage.getItem("highscores_E_T")
        // if(prevScores == null){
        highscores_H_S = JSON.parse(prevScores_H_S)
        highscores_H_T = JSON.parse(prevScores_H_T)
        // }
        highscores_H_S.push(moves);
        highscores_H_T.push(gameElapsedTime);

        highscores_H_S.sort(function(a,b){return a - b});
        highscores_H_T.sort(function(a,b){return a - b});

        if(highscores_H_S.length > 5) highscores_H_S.pop();
        if(highscores_H_T.length > 5) highscores_H_T.pop();

        for(let i = 0; i < highscores_H_S.length; i++){
            if(highscores_H_S[i] == 0){
                highscores_H_S.splice(i,1);
            }
        }
        for(let i = 0; i < highscores_H_T.length; i++){
            if(highscores_H_T[i] == 0){
                highscores_H_T.splice(i,1);
            }
        }

        localStorage['highscores_H_S'] = JSON.stringify(highscores_H_S);
        localStorage['highscores_H_T'] = JSON.stringify(highscores_H_T);

    }
    
}
function outputHighscore(){
    var HS_E_S = document.getElementById('HS_E_S');
    var HS_E_T = document.getElementById('HS_E_T');
    var HS_H_S = document.getElementById('HS_H_S');
    var HS_H_T = document.getElementById('HS_H_T');

    var HS_E_S_array = JSON.parse(localStorage.getItem('highscores_E_S'));
    var HS_E_T_array = JSON.parse(localStorage.getItem('highscores_E_T'));
    var HS_H_S_array = JSON.parse(localStorage.getItem('highscores_H_S'));
    var HS_H_T_array = JSON.parse(localStorage.getItem('highscores_H_T'));
    
    if(HS_E_S_array != null){HS_E_S.innerHTML = '';}
    if(HS_E_T_array != null){HS_E_T.innerHTML = '';}
    if(HS_H_S_array != null){HS_H_S.innerHTML = '';}
    if(HS_H_T_array != null){HS_H_T.innerHTML = '';}
    
    var E_S_Place = 1;
    var E_T_Place = 1;
    var H_S_Place = 1;
    var H_T_Place = 1;

    if(HS_E_S_array != null){
        for(let i = 0; i < HS_E_S_array.length; i++){
            HS_E_S.innerHTML += E_S_Place + "- Score: " + HS_E_S_array[i] + "</br>";
            E_S_Place++;
        }
    }
    if(HS_E_T_array != null){
        for(let i = 0; i < HS_E_T_array.length; i++){
            HS_E_T.innerHTML += E_T_Place + "- Time: " + HS_E_T_array[i] + "</br>";
            E_T_Place++;
        }
    }
    if(HS_H_S_array != null){
        for(let i = 0; i < HS_H_S_array.length; i++){
            HS_H_S.innerHTML += H_S_Place + "- Score: " + HS_H_S_array[i] + "</br>";
            H_S_Place++;
        }
    }
    if(HS_H_T_array != null){
        for(let i = 0; i < HS_H_T_array.length; i++){
            HS_H_T.innerHTML += H_T_Place + "- Time: " + HS_H_T_array[i] + "</br>";
            H_T_Place++;
        }
    }   
}
function updateTimer(elapsedTime){
    if(!gameOver){
        if(typeof(elapsedTime) === 'number'){
            timer += elapsedTime;
            if(timer >= 2000){
                updateTime();
                timer -= 2000;
            }
        }
    }
}
function updateTime(){
    gameElapsedTime++;
}
function updateCountDown(elapsedTime){
    if(gameOver){
        if(countdownnum == 0){
            window.location.href = '../index.html'
        }
        if(typeof(elapsedTime) === 'number'){
            countDownTimer += elapsedTime;
            if(countDownTimer >= 2000){
                countDown();
                countDownTimer -= 2000;
            }
        }
    }  
}
function countDown(){
    if(countdownnum > 0){
        countdownnum--;
    }
}
function updateTilePos(){
    
    if(checkedClick){
        if(isValidTile(currClick.x, currClick.y) || updatingTilePos ){
            moveTile(clickedTileId);
            console.log('Valid Tile!')
        }else{
            console.log('Invalid Tile')
        }
    }  
}
function isGameOver(){
    for(let i = 0; i < PuzzleObjects.length; i++){
        if(PuzzleObjects[i].currLoc.x != PuzzleObjects[i].correctPos.x ||
           PuzzleObjects[i].currLoc.y != PuzzleObjects[i].correctPos.y) {
            return false;
        }
    }
    return true;
}
function tileInCorrectPosition(tile){
    if(PuzzleObjects[tile].currLoc.x == PuzzleObjects[tile].correctPos.x &&
       PuzzleObjects[tile].currLoc.y == PuzzleObjects[tile].correctPos.y){
           return true;
       }
       return false;
}

function moveTile(id){
    for(let i = 0; i < PuzzleObjects.length; i++){
        if(PuzzleObjects[i].key == id){

            let temp = {x: PuzzleObjects[i].currLoc.x, y: PuzzleObjects[i].currLoc.y};
            updatingTilePos = true;
            canClick = false;

            if(PuzzleObjects[i].direction == 'east') {
                if(PuzzleObjects[i].currLoc.x == emptyTile.x) {
                    console.log('East')
                    var prevEmptyX = temp.x - tileSize;
                    emptyTile.x = prevEmptyX;
                    checkedClick = false;
                    updatingTilePos = false;
                    console.log('CurrLocation', PuzzleObjects[i].currLoc, 'Prev Location', PuzzleObjects[i].prevLoc, 'Empty Tile', emptyTile )
                    canClick = true;
                    PuzzleObjects[i].isMoving = false;
                    moves++;
                    if(tileInCorrectPosition(i)){
                        activateSparks = true;
                        particleSystem = ParticleSystemLinear(graphics, {
                            image: imageFire,
                            tile: PuzzleObjects[i],
                            width: tileSize,
                            size: {mean: 10, stdev: 3},
                            speed: { mean: 0.00000005, stdev: 0.00025},
                            lifetime: { mean: 50, stdev: 100}  // Really short lifetime
                        })
                        console.log('emenate Sparks');
                    }
                    if(isGameOver()){
                        console.log('Game is Over')
                        addedHS = true;
                        gameOver = true;
                    }
                    break;
                }
                PuzzleObjects[i].isMoving = true;
                var val = parseFloat(PuzzleObjects[i].currLoc.x, 10);
                var xPos = val + transitionRate;
                var num = parseFloat(xPos.toFixed(2), 10);
                PuzzleObjects[i].currLoc.x = num;
            }

            if(PuzzleObjects[i].direction == 'west') {
                if(PuzzleObjects[i].currLoc.x == emptyTile.x){
                    console.log('West')
                    var prevEmptyX = temp.x + tileSize;
                    emptyTile.x = prevEmptyX;
                    checkedClick = false;
                    updatingTilePos = false;
                    canClick = true;
                    console.log('CurrLocation', PuzzleObjects[i].currLoc, 'Prev Location', PuzzleObjects[i].prevLoc, 'Empty Tile', emptyTile )
                    PuzzleObjects[i].isMoving = false;
                    moves++;
                    if(tileInCorrectPosition(i)){
                        activateSparks = true;
                        particleSystem = ParticleSystemLinear(graphics, {
                            image: imageFire,
                            tile: PuzzleObjects[i],
                            width: tileSize,
                            size: {mean: 10, stdev: 3},
                            speed: { mean: 0.00000005, stdev: 0.00025},
                            lifetime: { mean: 50, stdev: 100}  // Really short lifetime
                        })
                        console.log('emenate Sparks');
                    }
                    if(isGameOver()){
                        console.log('Game is Over')
                        addedHS = true;
                        gameOver = true;
                    }
                    break;
                }
                PuzzleObjects[i].isMoving = true;
                var val = parseFloat(PuzzleObjects[i].currLoc.x, 10);
                var xPos = val - transitionRate;
                var num = parseFloat(xPos.toFixed(2), 10);
                PuzzleObjects[i].currLoc.x = num;
            }

            if(PuzzleObjects[i].direction == 'north') {
                if(PuzzleObjects[i].currLoc.y == emptyTile.y){
                    console.log('North')
                    var prevEmptyY = temp.y + tileSize;
                    emptyTile.y = prevEmptyY;
                    checkedClick = false;
                    updatingTilePos = false;
                    canClick = true;
                    console.log('CurrLocation', PuzzleObjects[i].currLoc, 'Prev Location', PuzzleObjects[i].prevLoc, 'Empty Tile', emptyTile )
                    PuzzleObjects[i].isMoving = false;
                    moves++;
                    if(tileInCorrectPosition(i)){
                        activateSparks = true;
                        particleSystem = ParticleSystemLinear(graphics, {
                            image: imageFire,
                            tile: PuzzleObjects[i],
                            width: tileSize,
                            size: {mean: 10, stdev: 3},
                            speed: { mean: 0.00000005, stdev: 0.00025},
                            lifetime: { mean: 50, stdev: 100}  // Really short lifetime
                        })
                        console.log('emenate Sparks');
                    }
                    if(isGameOver()){
                        console.log('Game is Over');
                        addedHS = true;
                        gameOver = true;
                    }
                    break;
                }
                PuzzleObjects[i].isMoving = true;
                var val = parseFloat(PuzzleObjects[i].currLoc.y, 10);
                var yPos = val - transitionRate;
                var num = parseFloat(yPos.toFixed(2), 10);
                PuzzleObjects[i].currLoc.y = num;
            }

            if(PuzzleObjects[i].direction == 'south') {
                if(PuzzleObjects[i].currLoc.y == emptyTile.y) {
                    console.log('South');
                    var prevEmptyY = emptyTile.y - tileSize;
                    emptyTile.y = prevEmptyY;
                    checkedClick = false;
                    updatingTilePos = false;
                    canClick = true;
                    console.log('CurrLocation', PuzzleObjects[i].currLoc, 'Prev Location', PuzzleObjects[i].prevLoc, 'Empty Tile', emptyTile )
                    PuzzleObjects[i].isMoving = false;
                    moves++;
                    if(tileInCorrectPosition(i)){
                        activateSparks = true;
                        particleSystem = ParticleSystemLinear(graphics, {
                            image: imageFire,
                            tile: PuzzleObjects[i],
                            width: tileSize,
                            size: {mean: 10, stdev: 3},
                            speed: { mean: 0.00000005, stdev: 0.00025},
                            lifetime: { mean: 50, stdev: 100}  // Really short lifetime
                        })
                        console.log('emenate Sparks');
                    }
                    if(isGameOver()){
                        console.log('Game is Over')
                        addedHS = true;
                        gameOver = true;
                    }
                    break;
                }
                PuzzleObjects[i].isMoving = true;
                var val = parseFloat(PuzzleObjects[i].currLoc.y, 10);
                var yPos = val + transitionRate;
                var num = parseFloat(yPos.toFixed(2), 10);
                PuzzleObjects[i].currLoc.y = num;
            }

            break;
        }
    }
}

function movementInput(key, elapsedTime) {
    
            canvas.addEventListener('click', function(e) {
                if(!gameOver){
                    if(canClick){
                        currClick.x = e.offsetX;
                        currClick.y = e.offsetY;
                        checkedClick = true;
                        updatedTileId = true;
                    }
                }  
            }); 
}

function allTilesFixed(){
    MoveCount = 0;
    for(let i = 0; i < PuzzleObjects.length; i++){
        if(PuzzleObjects[i].isMoving = true){
            MoveCount++;
        }
        if(MoveCount > 1){
            return true;
        }
    }
    return false;
    
}

function otherTilesMoving(){
    MoveCount = 0;
    for(let i = 0; i < PuzzleObjects.length; i++){
        if(PuzzleObjects[i].isMoving = true){
            MoveCount++;
        }
        if(MoveCount > 1){
            return true;
        }
    }
    return false;
}

function isValidTile(clickX, clickY) {
    if(updatedTileId){
        if(!allTilesFixed()){
            if(otherTilesMoving()){
                return false;
            }
        }
        
        clickedTileId = getCurrTile(clickX, clickY); 
        updatedTileId = false; 
    }
    

    for(let i = 0; i < PuzzleObjects.length; i++){
        if(PuzzleObjects[i].key == clickedTileId){
            return isNeighbor(PuzzleObjects[i]);
        }
    }
}

function isNeighbor(tile){
    let posX = tile.currLoc.x;
    let posY = tile.currLoc.y;
    if((posX + tile.width) == emptyTile.x && posY == emptyTile.y){
        setDiriction(tile, 'east');
        return true;
    }
    if((posX - tile.width) == emptyTile.x && posY == emptyTile.y){
        setDiriction(tile, 'west');
        return true;
    }
    if((posY + tile.height) == emptyTile.y && posX == emptyTile.x){
        setDiriction(tile, 'south');
        return true;
    }
    if((posY - tile.height) == emptyTile.y && posX == emptyTile.x){
        setDiriction(tile, 'north');
        return true;
    }

    return false;
}

function setDiriction(tile, direction){
    for(let i = 0; i < PuzzleObjects.length; i++){
        if(tile.key == PuzzleObjects[i].key){
            PuzzleObjects[i].direction = direction
            break;
        }
    }
}

function getCurrTile(x, y){
    for(let i = 0; i < PuzzleObjects.length; i++){
        let posX = PuzzleObjects[i].currLoc.x;
        let posY = PuzzleObjects[i].currLoc.y;
        if( x > posX && x < (posX + tileSize)){
            if(y > posY && y < (posY + tileSize)){
                return PuzzleObjects[i].key;
            }
        }

    }
    
}

class Tile {
    constructor(image, x, y, correctPos, key, imageSize, nullTile){
        this.image = image;
        this.center = {};
        this.width = imageSize;
        this.height = imageSize;
        this.prevLoc = {x: x, y: y};
        this.direction = "";
        this.currLoc = {x: x, y: y};
        this.correctPos = {x: correctPos.x, y: correctPos.y};
        this.key = key;
        this.isMoving = false;
        this.nullTile = nullTile;
    }
}

function initPuzzle(state){
    var easyPuzzle = []
    var size = 3;
    var row = 0;
    var col = 0;
    var x = 0;
    var y = 0;
    var imageSize = 0;
    var temp;
    var tileCt;
    var mod;

    if(state == 1){
        tileCt = 15;
        mod = 4;
        emptyTile = {x: 384, y: 384};
    }else{
        tileCt = 63;
        mod = 8;
        emptyTile = {x: 448, y: 448};
    }
    


    for(let i = 0; i < tileCt; i++){
        var tileimage = new Image();
        tileimage.ready = false;
        var num = i;
        if(state == 1){
            temp = `../images/easy/Tile128-${i}.png`;
        }else{
            temp = `../images/hard/Tile64-${i}.png`;
        }
        

        if(temp.includes('128')){
            tiles = 15;
            imageSize = 128;
            tileSize = 128;
            transitionRate = tileSize / 50;
        }else if(temp.includes('64')){
            tiles = 63;
            imageSize = 64;
            tileSize = 64;
            transitionRate = tileSize / 50;
        }
        
        tileimage.ready = false;
    
        tileimage.onload = function(){
            tileimage.ready = true;
        }
        if(state == 1){
            tileimage.src = `../images/easy/Tile128-${i}.png`;
        } else if(state == 2){
            tileimage.src = `../images/hard/Tile64-${i}.png`;
        }
              
        if((x % mod) == 0){
            col = 0;
        }
        if(i == 0 || (i%mod) == 0){
            x = 0;
        }
        let TileLoc = {
            imageSrc: temp,
            image: new Image(),
            center: { x: (COORD_SIZE / mod) * col, y: (COORD_SIZE / mod) * row}, 
            correctPos: { x: (COORD_SIZE / mod) * col, y: (COORD_SIZE / mod) * row},
            id: i,
        };
        col++
        x++;
        if((x % mod) == 0){
            row++;
        }
        let that;
        if(i != 15){
            that = new Tile(tileimage, TileLoc.center.x, TileLoc.center.y, TileLoc.correctPos, i, imageSize, false)
        }else{
            that = new Tile(tileimage, TileLoc.center.x, TileLoc.center.y, TileLoc.correctPos, i, imageSize, true)
        }
        easyPuzzle.push(Tile)
        PuzzleObjects.push(that)
    }
    console.log(PuzzleObjects);
    PuzzleImages = easyPuzzle;
    puzzleInit = false;
    puzzleDraw = true;
}

function randomizePuzzle(){
    for(let i = 0; i < 10; i++){
        let rand1 = 0;
        let rand2 = 0;

        while(rand1 == rand2){
            rand1 = Random.nextRange(0, tiles);
            rand2 = Random.nextRange(0, tiles);
        }

        let temp1 = PuzzleObjects[rand1].currLoc;
        let temp2 = PuzzleObjects[rand2].currLoc;

        PuzzleObjects[rand1].currLoc = temp2;
        PuzzleObjects[rand2].currLoc = temp1;
    }
}

function drawPuzzle(){

    if(scramblePuzzle){
        // randomizePuzzle();
        scramblePuzzle = false;
    }
    

    for(let i = 0; i < PuzzleImages.length; i++){
            context.save();
            context.translate(PuzzleObjects[i].currLoc.x, PuzzleObjects[i].currLoc.y);
            context.translate(-PuzzleObjects[i].currLoc.x, -PuzzleObjects[i].currLoc.y);

            
            context.drawImage(
                PuzzleObjects[i].image,
                PuzzleObjects[i].currLoc.x,
                PuzzleObjects[i].currLoc.y,
                tileSize,
                tileSize)

            drawRectangle('rgba(255, 255, 255, 1)',
                        PuzzleObjects[i].currLoc.x, PuzzleObjects[i].currLoc.y,
                        tileSize, tileSize,context);
            context.restore();
    }
    puzzleDraw = false;

}
function drawRectangle(style, left, top, width, height, context) {
        context.strokeStyle = style;
        context.strokeRect(
            left,
            top,
            width,
            height);
    }
function renderTime(){
    if(endGame && !gameWon){
        context.font = "40px Arial";
        context.fillStyle = "white";
        context.fillText("At least we're still flying half a ship.  " ,150,200);
        context.fillText("Returning to Menu in... " + countdownnum, 250, 300);
        if(countdownnum == 0){
            updateHighScore();
            window.location.href = './scores.html'
        }
    }else if(gameWon){
        context.font = "40px Arial";
        context.fillStyle = "white";
        context.fillText("You Won!" ,250,500);
        context.fillText("Returning to Menu in... " + countdownnum, 150, 300);
        if(countdownnum == 0){
            updateHighScore();
            window.location.href = './scores.html'
        }
    }
    else{
        context.font = "60px Arial";
        context.fillStyle = "white";
        context.fillText("Next Level Starts ... " + countdownnum ,150,200);
    }
    if(countdownnum == 0){
        reset();
    }
}

function graphics() {
    function drawTexture(image, center, rotation, size) {
        context.save();

        context.translate(center.x, center.y);
        context.rotate(rotation);
        context.translate(-center.x, -center.y);

        context.drawImage(
            image,
            center.x - size.x / 2,
            center.y - size.y / 2,
            size.x, size.y);

        context.restore();
    }

    function drawRectangle(rect) {
        context.save();
        context.translate(rect.center.x, rect.center.y );
        context.rotate(rect.rotation);
        context.translate(-rect.center.x, -rect.center.y);
        
        context.fillStyle = rect.fill;
        context.fillRect(rect.center.x - rect.size.x / 2, rect.center.y - rect.size.y / 2, rect.size.x, rect.size.y);
        
        context.strokeStyle = rect.stroke;
        context.strokeRect(rect.center.x - rect.size.x / 2, rect.center.y - rect.size.y / 2, rect.size.x, rect.size.y);

        context.restore();
    }

    let api = {
        drawTexture: drawTexture,
        drawRectangle: drawRectangle,
    };

    return api;

}


function ParticleSystemLinear(graphics, spec) {
    let that = {};
    

    function create(spec) {
        let that = {};

        console.log(spec.center, spec.direction, spec.speed)


        spec.fill = 'rgb(255, 255, 255)';
        spec.stroke = 'rgb(0, 0, 0)';
        spec.alive = 0;

        that.update = function(elapsedTime) {
            spec.center.x += (spec.speed * spec.direction.x * elapsedTime);
            spec.center.y += (spec.speed * spec.direction.y * elapsedTime);
            spec.alive += elapsedTime;

            spec.rotation += spec.speed * 0.5;

            return spec.alive < spec.lifetime;
        };

        that.draw = function() {
            context.save();

            context.translate(spec.center.x, spec.center.y);
            context.rotate(spec.rotation);
            context.translate(-spec.center.x, -spec.center.y);

            context.drawImage(
                imageFire,
                spec.center.x - spec.size.x / 2,
                spec.center.y - spec.size.y / 2,
                spec.size.x, spec.size.y);

            context.restore();
            // graphics.drawRectangle(spec);
            // drawRectangle(spec);
            // context.save();
            // context.translate(spec.center.x, spec.center.y );
            // context.rotate(spec.rotation);
            // context.translate(-spec.center.x, -spec.center.y);
            
            // context.fillStyle = spec.fill;
            // context.fillRect(spec.center.x - spec.size.x / 2, spec.center.y - spec.size.y / 2, spec.size.x, spec.size.y);
            
            // context.strokeStyle = spec.stroke;
            // context.strokeRect(spec.center.x - spec.size.x / 2, spec.center.y - spec.size.y / 2, spec.size.x, spec.size.y);

            // context.restore();
        };

        return that;
    }

    that.updateNorth = function(elapsedTime) {
        let keepMeNorth = [];
        for (let particle = 0; particle < particlesNorth.length; particle++) {
            if (particlesNorth[particle].update(elapsedTime)) {
                keepMeNorth.push(particlesNorth[particle]);
            }
        }
        particlesNorth = keepMeNorth;

        for (let particle = 0; particle < 5; particle++) {
            let size = Math.abs(Random.nextGaussian(spec.size.mean, spec.size.stdev));
            let xPos = Random.nextRange(spec.tile.currLoc.x, spec.tile.currLoc.x + tileSize);
            let speed = -1;
            while(speed <= 0){
                speed = (0 + Random.nextGaussian(spec.speed.mean, spec.speed.stdev))
            }
            let p = create({
                center: { x: xPos, y:  spec.tile.currLoc.y },
                size: {x: size, y: size},
                rotation: 0,
                speed: -speed,
                direction: {x: 0, y: xPos},
                lifetime: Random.nextGaussian(spec.lifetime.mean, spec.lifetime.stdev)
            });
            
            particlesNorth.push(p);
        }
    };

    that.updateSouth = function(elapsedTime) {
        let keepMeSouth = [];
        for (let particle = 0; particle < particlesSouth.length; particle++) {
            if (particlesSouth[particle].update(elapsedTime)) {
                keepMeSouth.push(particlesSouth[particle]);
            }
        }
        particlesSouth = keepMeSouth;

        for (let particle = 0; particle < 5; particle++) {
            let size = Math.abs(Random.nextGaussian(spec.size.mean, spec.size.stdev));
            let xPos = Random.nextRange(spec.tile.currLoc.x, spec.tile.currLoc.x + tileSize);
            let speed = -1;
            while(speed <= 0){
                speed = (0 + Random.nextGaussian(spec.speed.mean, spec.speed.stdev))
            }
            let p = create({
                center: { x: xPos, y:  spec.tile.currLoc.y + tileSize },
                size: {x: size, y: size},
                rotation: 0,
                speed: speed,
                direction: {x: 0, y: xPos},
                lifetime: Random.nextGaussian(spec.lifetime.mean, spec.lifetime.stdev)
            });
            
            particlesNorth.push(p);
        }
    };

    that.updateWest = function(elapsedTime) {
        let keepMeWest = [];
        for (let particle = 0; particle < particlesWest.length; particle++) {
            if (particlesWest[particle].update(elapsedTime)) {
                keepMeWest.push(particlesWest[particle]);
            }
        }
        particlesWest = keepMeWest;

        for (let particle = 0; particle < 5; particle++) {
            let size = Math.abs(Random.nextGaussian(spec.size.mean, spec.size.stdev));
            let yPos = Random.nextRange(spec.tile.currLoc.y, spec.tile.currLoc.y + tileSize);
            let speed = -1;
            while(speed <= 0){
                speed = (0 + Random.nextGaussian(spec.speed.mean, spec.speed.stdev))
            }
            let p = create({
                // center: { x: spec.tile.currLoc.x, y:  yPos },
                center: { x: spec.tile.currLoc.x, y: yPos},
                size: {x: size, y: size},
                rotation: 0,
                speed: -speed,
                direction: {x: yPos, y: 0},
                lifetime: Random.nextGaussian(spec.lifetime.mean, spec.lifetime.stdev)
            });
            
            particlesNorth.push(p);
        }
    };

    that.updateEast = function(elapsedTime) {
        let keepMeEast = [];
        for (let particle = 0; particle < particlesEast.length; particle++) {
            if (particlesEast[particle].update(elapsedTime)) {
                keepMeEast.push(particlesEast[particle]);
            }
        }
        particlesSouth = keepMeEast;

        for (let particle = 0; particle < 5; particle++) {
            let size = Math.abs(Random.nextGaussian(spec.size.mean, spec.size.stdev));
            let yPos = Random.nextRange(spec.tile.currLoc.y, spec.tile.currLoc.y + tileSize);
            let speed = -1;
            while(speed <= 0){
                speed = (0 + Random.nextGaussian(spec.speed.mean, spec.speed.stdev))
            }
            let p = create({
                center: { x: spec.tile.currLoc.x + tileSize, y: yPos  },
                size: {x: size, y: size},
                rotation: 0,
                speed: speed,
                direction: {x: yPos, y: 0},
                lifetime: Random.nextGaussian(spec.lifetime.mean, spec.lifetime.stdev)
            });
            
            particlesNorth.push(p);
        }
    };

    that.render = function() {
        for (let p = particlesNorth.length - 1; p >= 0; p--) {
            particlesNorth[p].draw();
        }
    };

    return that;
}

let Random = (function() {
    'use strict';

    function nextDouble() {
        return Math.random();
    }


    function nextRange(min, max) {
        let range = max - min;
        return Math.floor((Math.random() * range) + min);
    }

    function nextCircleVector() {
        let angle = Math.random() * 2 * Math.PI;
        return {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
    }
            
    function nextArcVector(range){
        let angle = range * (Math.PI/180);
        return {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
    }

    //
    // This is used to give a small performance optimization in generating gaussian random numbers.
    let usePrevious = false;
    let y2;

    //
    // Generate a normally distributed random number.
    //
    // NOTE: This code is adapted from a wiki reference I found a long time ago.  I currLocally
    // wrote the code in C# and am now converting it over to JavaScript.
    //
    function nextGaussian(mean, stdDev) {
        let x1 = 0;
        let x2 = 0;
        let y1 = 0;
        let z = 0;

        if (usePrevious) {
            usePrevious = false;
            return mean + y2 * stdDev;
        }

        usePrevious = true;

        do {
            x1 = 2 * Math.random() - 1;
            x2 = 2 * Math.random() - 1;
            z = (x1 * x1) + (x2 * x2);
        } while (z >= 1);
        
        z = Math.sqrt((-2 * Math.log(z)) / z);
        y1 = x1 * z;
        y2 = x2 * z;
        
        return mean + y1 * stdDev;
    }

    return {
        nextDouble : nextDouble,
        nextRange : nextRange,
        nextCircleVector : nextCircleVector,
        nextArcVector : nextArcVector,
        nextGaussian : nextGaussian
    };

}());


function initialize() {
    canvas = document.getElementById('canvas-main');
    context = canvas.getContext('2d');    

    let initArray = []
    if(localStorage.getItem('state') == null){
        gameState = 1;
    }else{
        num = localStorage.getItem('state');
        gameState = parseInt(num, 10);
    }
    
    if(localStorage.getItem('highscores_E_T') == null){
        localStorage.setItem('highscores_E_T', JSON.stringify(initArray))
    }
    if(localStorage.getItem('highscores_E_S') == null){
        localStorage.setItem('highscores_E_S', JSON.stringify(initArray))
    }
    if(localStorage.getItem('highscores_H_T') == null){
        localStorage.setItem('highscores_H_T', JSON.stringify(initArray))
    }
    if(localStorage.getItem('highscores_H_S') == null){
        localStorage.setItem('highscores_H_S', JSON.stringify(initArray))
    }
    requestAnimationFrame(gameLoop);
}