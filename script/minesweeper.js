const tutorialTexts = [
    {
      image:"minesweeper/minesweeper-tutorial-1.png",
      text:"<br>マインスイーパーは、盤面に隠された地雷を避けてすべての安全なマスを開ける論理パズルゲームです。<br><br>開いた数字は周囲8マスにある地雷の数を示し、それをヒントに地雷の位置を特定して旗（フラグ）を立てます。"
    },{
      image:"minesweeper/minesweeper-tutorial-2.png",
      text:"左クリックでマスを開き、右クリックでフラグを立てます。<br><br>画像右の場合は中央の「1」の周りに未開封のマスが1つしかないので、左上に確定で爆弾があります。<br><br>爆弾があると思うマスにはフラグを立てておきます。"
    }
]
const board = document.getElementById("board")
const chooseMode = document.getElementById("choose-mode")
const easyBtn = document.getElementById("easy")
const mediumBtn = document.getElementById("medium")
const hardBtn = document.getElementById("hard")
const result = document.getElementById("result")
const resultTitle = document.getElementById("result-title")
const resultComment = document.getElementById("result-comment")
const retryBtn = document.getElementById("retry")

const modeStats = [
    [15,10], //爆弾の数、タイルの幅・高さ
    [50,15],
    [200,25]
]
const modeBtns = [easyBtn,mediumBtn,hardBtn]
const boardSize = 600
let divMap = []
let firstTile
let excludeTile = []
let openCount = 0
let current
let currentMode

modeBtns.forEach((btn,idx)=>{
  btn.addEventListener("click",()=>{
    currentMode = idx
    chooseMode.style.display = "none"
    board.style.display = "block"
    loadMap(modeStats[idx][0],modeStats[idx][1])
  })
})


function loadMap(bombsNum,tilesNum){
  current = {bombs:bombsNum,tiles:tilesNum}
    for (let i = 0;i<current.tiles;i++){
        let newMapArr = []
        for (let j = 0;j<current.tiles;j++){
            const size = boardSize / current.tiles
            const x = i
            const y = j
            
            newMapArr.push(generateTile(x,y,size))
        }
        divMap.push(newMapArr)
    }
}

function generateTile(x,y,size){
    const newTile = document.createElement("div")
    newTile.classList.add("tile")
    newTile.classList.add("closed-tile")
    newTile.style.left = x * size + "px"
    newTile.style.top = y * size + "px"
    newTile.style.width = size + "px"
    newTile.style.height = size + "px"
    newTile.position = [x,y]
    newTile.open = false
    newTile.bomb = false
    newTile.flag = false
    board.appendChild(newTile)
    newTile.addEventListener("click",()=>{
        if (newTile.open)return
        if (!firstTile){
            firstTile = newTile
            for (let i = -1;i<=1;i++){
              for (let j = -1;j<=1;j++){
                if (x+j >= 0 && x+j < current.tiles && y+i >= 0 && y+i < current.tiles){
                  excludeTile.push([x+j,y+i])
                }
              }
            }
            generateBombs()
        }
        openTile(x,y)
    })
    newTile.addEventListener("contextmenu",placeFlag)
    return newTile
}

function openTile(x,y){
  const targetTile = divMap[x][y]
  if (targetTile.flag)return
  if (targetTile.bomb){
    updateTile(targetTile,0,"bomb")
    showResult("failed")
    return
  }

  const bombAround = checkSurroudingBombs(x,y)
  updateTile(targetTile,bombAround,"normal")
  if (bombAround === 0){
    for (let i = -1; i<=1;i++){
      for (let j = -1;j<=1;j++){
        //範囲内かどうか
        if (x+j >= 0 && x+j < current.tiles && y+i >= 0 && y+i < current.tiles && !(i==0&&j==0)){
          if (!divMap[x+j][y+i].open)openTile(x+j,y+i)
        }
      }
    }
  }
}

function checkSurroudingBombs(x,y){
  let bombCheck = 0
  for (let i = -1; i<=1;i++){
    for (let j = -1;j<=1;j++){
      //範囲内かどうか
      if (x+j >= 0 && x+j < current.tiles && y+i >= 0 && y+i < current.tiles && !(i==0&&j==0)){
        const target = divMap[x+j][y+i]
        if (target.bomb)bombCheck++
      }
    }
  }
  return bombCheck
}

function updateTile(target,count,type){
  if (type === "flag"){
    if (target.flag){
      target.flag = false
      target.style.backgroundImage = "url(images/minesweeper/tile.png)"
    }
    else{
      target.flag = true
      target.style.backgroundImage = "url(images/minesweeper/flag.png)"
    }
    return
  }

  target.classList.remove("closed-tile")
  target.removeEventListener("contextmenu",placeFlag)

  if (type === "bomb"){
    target.style.backgroundImage = "url(images/minesweeper/mine.png)"
    target.classList.add("bomb")
    return
  }

  target.open = true
  openCount++
  clearCheck()
  target.style.backgroundImage = `url(images/minesweeper/${count}.png)`
  if (count > 0)target.addEventListener("click",openSurroudings)
}

function placeFlag(e){
  updateTile(e.target,0,"flag")
}

function openSurroudings(e){
  const [x,y] = e.target.position
  const bombAround = checkSurroudingBombs(x,y)
  let flagCount = 0
  for (let i = -1; i<=1;i++){
    for (let j = -1;j<=1;j++){
      //範囲内かどうか
      if (x+j >= 0 && x+j < current.tiles && y+i >= 0 && y+i < current.tiles && !(i==0&&j==0)){
        if (divMap[x+j][y+i].flag)flagCount++
      }
    }
  }
  if (flagCount === bombAround)
  for (let i = -1; i<=1;i++){
    for (let j = -1;j<=1;j++){
      //範囲内かどうか
      if (x+j >= 0 && x+j < current.tiles && y+i >= 0 && y+i < current.tiles && !(i==0&&j==0)){
        if (!divMap[x+j][y+i].open)openTile(x+j,y+i)
      }
    }
  }
}

//爆弾生成
function generateBombs() {
  // 除外位置を文字列化してセットに入れる（高速検索のため）
  const excludeSet = new Set(excludeTile.map(pos => `${pos[0]},${pos[1]}`));

  // 爆弾候補の全マスをリスト化
  const candidates = [];
  for (let x = 0; x < current.tiles; x++) {
    for (let y = 0; y < current.tiles; y++) {
      const key = `${x},${y}`;
      if (!excludeSet.has(key)) {
        candidates.push([x, y]);
      }
    }
  }

  // シャッフル（Fisher–Yates）
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  for (let i = 0;i<current.bombs;i++){
    const newPos = candidates[i]
    divMap[newPos[0]][newPos[1]].bomb = true
  }
}

function clearCheck(){
  if (current.tiles**2 - current.bombs === openCount){
    showResult("clear")
  }
}

function showResult(str){
  result.style.display = "flex"
  if (str === "failed"){
    resultTitle.textContent = "惜しい！"
    resultComment.textContent = "もう一度挑戦してみよう！"
  }
  else if(str === "clear"){
    resultTitle.textContent = "クリアおめでとう！"
    resultComment.textContent = "次の難易度も試してみてね！"
    modeBtns[currentMode].style.borderColor = "#0f0"
  }
}
function resetGame(){
  board.innerHTML = ""
  divMap = []
  firstTile = null
  excludeTile = []
  openCount = 0
}
retryBtn.addEventListener("click",()=>{
  resetGame()
  board.style.display = "none"
  result.style.display = "none"
  chooseMode.style.display = "flex"
})