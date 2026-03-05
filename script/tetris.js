const tutorialTexts = [
    {
        image:"tetris/tetris-tutorial.png",
        text:"上から落ちてくる7種類のブロック（テトリミノ）を回転・移動させ、隙間なく横一列に並べて消すパズルゲームです。"
    },{
        image:"tetris/tetris-keys.png",
        text:"操作方法です。<br>稀に回転できないこともあり操作性に難がありますが、ご了承ください。"
    }
]

let outOfFocus = true

const spaceStart = document.querySelector(".spaceStart")
const next1 = document.getElementById("next1")
const next2 = document.getElementById("next2")
const next3 = document.getElementById("next3")
const next4 = document.getElementById("next4")
const hold = document.getElementById("holdImg")
const board = document.getElementById("board")
const cells = Array.from(board.rows).map(row => Array.from(row.cells))
const boardState = Array.from({length: 22}, () => Array(10).fill(null));
const occupiedArea = Array.from({length:22}, () => Array(10).fill(null))
let spaceStartBoolean = true
let isGameOver = false
let roundStart = false
let isHolding = false
let swap = false
let nextBlock = []
let currentMinoPos = []
let deployedBlock
let holdingBlock
let origin = [0,4]
let repeatBool = true
let dropCount = 0.8
let clearedLine = 0
let rightInterval,leftInterval,bottomInterval
let isDropping = false
const moveSpeed = 100 //ミノのキー入力による移動速度
const allBlocks = ["images/tetris/red.png","images/tetris/green.png","images/tetris/orange.png","images/tetris/blue.png","images/tetris/purple.png","images/tetris/cyan.png","images/tetris/yellow.png"]
const allPixels = ["images/tetris/red.jpg","images/tetris/green.jpg","images/tetris/orange.jpg","images/tetris/blue,jpg","images/tetris/purple.jpg","images/tetris/cyan.jpg","images/tetris/yellow.jpg"]
const allColors = ["red","green","orange","blue","purple","cyan","yellow"]
const fallSpeed = [0.8,0.716,0.633,0.55,0.466,0.383,0.3,0.216,0.133,0.1,0.083,0.066,0.05,0.033,0.016]
const belowTarget = (element) => element[0] >= 21;
const leftTarget = (element) => element[1] <= 0;
const rightTarget = (element) => element[1] >= 9;
const minos = {
    red:    [[0,3],[0,4],[1,4],[1,5]],
    green:  [[0,4],[0,5],[1,3],[1,4]],
    orange: [[-1,5],[0,4],[0,3],[0,5]],
    blue:   [[-1,3],[0,4],[0,3],[0,5]],
    purple: [[-1,4],[0,4],[0,3],[0,5]],
    cyan:   [[1,3],[1,4],[1,5],[1,6]],
    yellow: [[0,4],[0,5],[1,4],[1,5]],
};
// functions
// asyncs
async function wait(second) {
	return new Promise(resolve => setTimeout(resolve, 1000 * second));
}

async function blinkSpaceStart(str) {
    let text
    if (str)text = '<span style="color: #ff2c2c;">GAME-OVER<br>Press space to restart</span>'
    else text = "Press space to start"
    spaceStart.style.backgroundColor = "#55555580"
    while (spaceStartBoolean) {
        spaceStart.textContent = ""
        await wait(0.5)
        if (str && !isGameOver)return
        spaceStart.innerHTML = text
        await wait(0.5);
    }
    spaceStart.style.backgroundColor = ""
    spaceStart.textContent = ""
}

async function minoDrop() {
    while (spaceStartBoolean === false) {
        if (isGameOver) return;
        await wait(dropCount)
        if (!bottomInterval){
            if (!outOfFocus){
                eraseCurrent()
                if (currentMinoPos.some(belowTarget) || checkAround("bottom")) {
                    confirmMino()
                }
                else {
                    currentMinoPos.forEach(element => {
                        element[0] += 1
                    })
                    origin[0] += 1
                    placeMino()
                    drawBoard()
                }
            }
        }
        
    }
}
// asyncs end

let rolled
function rollRandom() {
    let num = Math.floor(Math.random()*7)
    while (rolled == num){
        num = Math.floor(Math.random()*7)
    }
    rolled = num
    return num
};

function shiftTable() {
    nextBlock.shift()
    nextBlock.push(rollRandom())
    next1.src = allBlocks[nextBlock[0]]
    next2.src = allBlocks[nextBlock[1]]
    next3.src = allBlocks[nextBlock[2]]
    next4.src = allBlocks[nextBlock[3]]
}

function drawBoard() {
    for (let y = 0; y < 22; y++) {
        for (let x = 0; x < 10; x++) {
            const cell = cells[y][x];
            const value = boardState[y][x];
            if (value) {
                cell.style.backgroundImage = `url(images/tetris/${value}.jpg)`;
                cell.style.border = "none"
            } else {
                cell.style.backgroundImage = "";
                cell.style.border = "1px solid #555"
            }
        }
    }
}

function eraseCurrent() {
        for (const[y,x] of currentMinoPos){
            if (y >= 0 && y < 22 && x >= 0 && x < 10) {
            boardState[y][x] = null
            }
        }
    drawBoard()
}

function checkAround(value) {
    if (value === "bottom") {
    return currentMinoPos.some(element => {
            return occupiedArea[element[0]+1]?.[element[1]] === "filled"
    })
    }
    if (value === "left") {
        return currentMinoPos.some(element => {
            return occupiedArea[element[0]]?.[element[1]-1] === "filled"
    })
    }
    if (value === "right") {
        return currentMinoPos.some(element => {
            return occupiedArea[element[0]]?.[element[1]+1] === "filled"
    })
    }
}

function holdSwap(){
    [holdingBlock,deployedBlock] = [deployedBlock,holdingBlock]
}

function placeMino(value){
    if (value === "deploy"){
        deployedBlock = allColors[nextBlock[0]]
        origin = [0,4]
        currentMinoPos = minos[deployedBlock].map(([y, x]) => [y, x])
    }
    else if(value === "swap"){
        origin = [0,4]
        currentMinoPos = minos[deployedBlock].map(([y, x]) => [y, x])
    }
    for (const [y, x] of currentMinoPos) {
        if (y >= 0 && y < 22 && x >= 0 && x < 10) {
            boardState[y][x] = deployedBlock;
        }
    }
}

function checkGameOver() {
    // もし出現予定のミノ位置にすでにブロックがある場合
    for (const [y, x] of currentMinoPos) {
        if (y >= 0 && y < 22 && x >= 0 && x < 10) {
            if (occupiedArea[y][x] === "filled") {
                return true
            }
        }
    }
    return false
}

function detectLines() {
    for (let y = 0; y < 22; y++) {
        const isFull = boardState[y].every(cell => cell !== null);

        if (isFull) {
            // 行削除
            boardState.splice(y, 1);
            occupiedArea.splice(y, 1);
            clearedLine += 1

            // 上に新しい空行を追加
            boardState.unshift(new Array(10).fill(null));
            occupiedArea.unshift(new Array(10).fill(null));

            // 消した後の行数がずれるので、もう一度同じ y を調べる
            y--;

            const clearAudio = document.querySelector("#clearLine")
            clearAudio.currentTime = 0
            clearAudio.play()
        }
    }
    if (clearedLine < 75) {
        let divide = Math.floor(clearedLine/5)
        dropCount = fallSpeed[divide]
    }
}


function resetGame() {
    // ボード初期化
    for (let y = 0; y < 22; y++) {
        for (let x = 0; x < 10; x++) {
            boardState[y][x] = null;
            occupiedArea[y][x] = null;
        }
    }

    // 状態初期化
    clearedLine = 0;
    dropCount = 0.8;
    isGameOver = false;
    isHolding = false;
    swap = false;
    holdingBlock = null;
    deployedBlock = null;
    hold.style.backgroundImage = ""
    origin = [0, 4];
    currentMinoPos = [];

    // NEXT再生成
    nextBlock = [];
    for (let i = 0; i <= 3; i++) {
        nextBlock.push(rollRandom());
    }

    next1.src = allBlocks[nextBlock[0]];
    next2.src = allBlocks[nextBlock[1]];
    next3.src = allBlocks[nextBlock[2]];
    next4.src = allBlocks[nextBlock[3]];

    drawBoard();

    // スタート表示に戻す
    spaceStartBoolean = true;
    spaceStart.textContent = "Press Space to Start";
    blinkSpaceStart();
}

function confirmMino() {
    for (const [y, x] of currentMinoPos) {
        if (y >= 0 && y < 22 && x >= 0 && x < 10) {
            occupiedArea[y][x] = "filled"
        }
    }
    placeMino()
    drawBoard()
    detectLines()
    placeMino("deploy")
    if (checkGameOver()) {
        isGameOver = true
        spaceStartBoolean = true
        blinkSpaceStart("gameover")
        return
    }
    drawBoard()
    shiftTable()
    swap = false
    
    const dropAudio = document.querySelector("#instantDrop")
    dropAudio.currentTime = 0
    dropAudio.play()
}


function isValidRotation(posArray) {
    return posArray.every(([y, x]) =>
        y >= 0 && y < 22 && x >= 0 && x < 10 && !occupiedArea[y]?.[x]
    );
}

function applyRotation(newPos) {
    eraseCurrent();
    currentMinoPos = newPos;
    placeMino();
    drawBoard();
}



function rotateMinoClockwise(direction = "clockwise") {
    const originY = origin[0];
    const originX = origin[1];

    const rotated = currentMinoPos.map(([y, x]) => {
        if (direction === "anti") {
            return [
                originY - (x - originX),
                originX + (y - originY)
            ];
        } else {
            return [
                originY + (x - originX),
                originX - (y - originY)
            ];
        }
    });

    // 通常の位置で衝突していなければそのまま回転
    if (isValidRotation(rotated)) {
        applyRotation(rotated);
        return;
    }

    // 壁キック候補: 原点を横に±1, ±2 ずらす
    const kicks = [-1, 1, -2, 2];

    for (let dx of kicks) {
        const kicked = rotated.map(([y, x]) => [y, x + dx]);
        if (isValidRotation(kicked)) {
            origin[1] += dx;  // 原点を動かす
            applyRotation(kicked);
            return;
        }
    }
}

// function end

// play
blinkSpaceStart()

// keys
document.addEventListener("keydown", event => {
    if (outOfFocus)return
    if (event.code === "Space"){
        if (spaceStartBoolean === false && !isGameOver) {
            swap = false
            eraseCurrent()
            while (repeatBool){
                if (currentMinoPos.some(belowTarget)|| checkAround("bottom")) {
                    confirmMino()
                    repeatBool = false
                }
                else {
                    currentMinoPos.forEach(element => {
                    element[0] += 1
                    })
                }
            }
            repeatBool = true
            return
        }
        if (isGameOver){
            resetGame()
        }
        else{
            spaceStart.textContent = ""
            spaceStartBoolean = false;
            roundStart = true;
            placeMino("deploy")
            drawBoard()
            shiftTable()
            minoDrop()
        }
    }
    else if (event.key === "c"){
        if (spaceStartBoolean === false){
            if (swap === false){
                swap = true
                eraseCurrent()
                holdSwap()
                if (isHolding === false){
                    isHolding = true
                    placeMino("deploy")
                    shiftTable()
                }
                else{
                    placeMino("swap")
                }
                drawBoard()
                hold.style.backgroundImage = `url(images/tetris/${holdingBlock}.png)`
            }
        }}
    else if (event.key === "z" || event.key === "ArrowUp") {
    if (deployedBlock !== "yellow") {
        rotateMinoClockwise("anti");
    }
    }
    else if (event.key === "x") {
        if (deployedBlock !== "yellow") {
            rotateMinoClockwise("clockwise");
        }
    }
    else if (event.key === "a" || event.key === "ArrowLeft") {
        if (!leftInterval){
            moveMino("left")
            leftInterval = setInterval(() => {
                moveMino("left")
            }, moveSpeed);
        }
    }
    else if (event.key === "d" || event.key === "ArrowRight") {
        if (!rightInterval){
            moveMino("right")
            rightInterval = setInterval(() => {
                moveMino("right")
            }, moveSpeed);
        }
    }
    else if(event.key === "s" || event.key === "ArrowDown"){
        if (!bottomInterval){
            moveMinoDown()
            bottomInterval = setInterval(() => {
                moveMinoDown()
            }, 50);
        }
    }
})
// 左右にミノを動かす関数
function moveMino(str){
    let num,target
    if (str === "left"){
        num = -1
        target = leftTarget
    }
    else {
        num = 1
        target = rightTarget
    }
    if (!currentMinoPos.some(target) && !checkAround(str)) {
        eraseCurrent()
        origin[1] += num
        currentMinoPos.forEach(element => {
            element[1] += num
        })
        placeMino()
        drawBoard()
    }
}
function moveMinoDown(){
    if (isGameOver) return;
    if (!outOfFocus){
        eraseCurrent()
        if (currentMinoPos.some(belowTarget) || checkAround("bottom")) {
            confirmMino()
        }
        else {
            currentMinoPos.forEach(element => {
                element[0] += 1
            })
            origin[0] += 1
            placeMino()
            drawBoard()
        }
    }
}

document.addEventListener("keyup", event => {
    if (outOfFocus)return
    if (event.key === "s" || event.key === "ArrowDown") {
        clearInterval(bottomInterval)
        bottomInterval = null
    }
    if (event.key === "a" || event.key === "ArrowLeft"){
        clearInterval(leftInterval)
        leftInterval = null
    }
    if (event.key === "d" || event.key === "ArrowRight"){
        clearInterval(rightInterval)
        rightInterval = null
    }
})
// keys end

for (let i = 0;i<=3;i++){
    nextBlock.push(rollRandom())
}

next1.src = allBlocks[nextBlock[0]]
next2.src = allBlocks[nextBlock[1]]
next3.src = allBlocks[nextBlock[2]]
next4.src = allBlocks[nextBlock[3]]


// 新規
const tetrisPlayBtn = document.getElementById("play-btn")
const tetrisReturnBtn = document.getElementById("play-return")
const tetrisPlayRuleBtn = document.getElementById("play-tutorial")
const tetrisRuleReturnBtn = document.getElementById("tutorial-return")
const tArray = [tetrisReturnBtn,tetrisPlayRuleBtn]
let prevBtn

tetrisPlayBtn.addEventListener("click",(e)=>{
    outOfFocus = false
    prevBtn = e.target
})

tArray.forEach(btn =>{
    btn.addEventListener("click",(e)=>{
        outOfFocus = true
        prevBtn = e.target
    })
})
tetrisRuleReturnBtn.addEventListener("click",(e)=>{
    if (prevBtn){
        if (prevBtn == tetrisPlayRuleBtn){
            outOfFocus = false
        }
    }
    prevBtn = e.target
})