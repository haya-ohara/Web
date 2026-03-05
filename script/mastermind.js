const tutorialTexts = [
    {
        image:"mastermind/mastermind-tutorial-1.png",
        text:"マスターマインドは、隠された４色のボールの組み合わせを当てるロジックゲームです。<br><br>隠されたボールを推理するためには、ボードの上部に表示されているピンの色と数が重要になります。"
    },{
        image:"mastermind/mastermind-tutorial-2.png",
        text:"まず光っている円をドラッグし、ボールを配置して確認ボタンを押しましょう。<br>するとピンが表示されます。<br><br>(確認ボタンを押すには、１列全ての円にボールを選択している必要があります)"
    },{
        image:"mastermind/mastermind-tutorial-3.png",
        text:'ボールの「位置と色」が答えと同じであれば<br><span style="color: #ff5353; border-bottom:1px solid #ff5353;">赤いピン</span>が表示され、<br><br>ボールの「色だけ」が答えと同じであれば<br><span style="border-bottom:1px solid #fff;">白いピン</span>が表示されます。'
    },{
        image:"mastermind/mastermind-tutorial-4.png",
        text:"解答できる数は最大で１２回です。<br>４つの赤いピンを立てられるよう頑張りましょう！<br>ぜひ楽しんでください！"
    },
]

const board = document.getElementById("mastermind-board")
const circleContainer = document.getElementById("circles")
const ballSelect = document.getElementById("ball-select")
const selectItems = document.querySelectorAll(".select-item")
const selectBorder = document.getElementById("select-border")
const submitBtn = document.getElementById("submit")
const resultContainer = document.getElementById("result-container")
const resultBalls = document.querySelectorAll(".result-ball")
const resultComment = document.getElementById("result-comment")
const retryBtn = document.getElementById("retry-btn")
let circleArray = []
let pinArray = []
let currentRound = 0
let currentSelected
let currentColor = 0
let currentColorTable = []
let answerTable = []
let hitTable = [0,0] //色・場所、色のみ
let roundStart = true
let boardRect

const colors = [
    "ball-hole",
    "red-ball",
    "green-ball",
    "blue-ball",
    "cyan-ball",
    "magenta-ball",
    "yellow-ball",
    "black-ball"
]
const colorNames = [
    undefined,
    "red",
    "green",
    "blue",
    "cyan",
    "magenta",
    "yellow",
    "black"
]

// 円のアニメーション用
const animBall = document.createElement("div")
animBall.classList.add("select-item")

// ピンのアニメーション用
const animPin = document.createElement("div")
animPin.classList.add("pin")
// ボード上の円生成
function generateCircles(){
    for (let i = 0;i<12;i++){
        const newGroup = document.createElement("div")
        let newCircleArray = []
        let newPinArray = []
        for (let j = 0;j<4;j++){
            const newCircle = document.createElement("div")
            newCircle.classList.add("circle")
            // newCircle.style.width = 35 / board.offsetWidth * 100 + "%"
            // newCircle.style.height = 35 / board.offsetHeight * 100 + "%"
            // newCircle.style.left = (75.68 + 61.28 * i) / board.offsetWidth * 100 + "%"
            // newCircle.style.top = (112.5 + 47.5 * j) / board.offsetHeight * 100 + "%"
            if (i == 0)newCircle.classList.add("emit-animation")
            newCircle.style.left = (75.98 + 61.8 * i) / board.offsetWidth * 100 + "%"
            newCircle.style.top = (87.5 + 47.5 * j) / board.offsetHeight * 100 + "%"
            newGroup.appendChild(newCircle)
            newCircleArray.push(newCircle)

            // ピン配置
            const newPin = document.createElement("div")
            newPin.classList.add("pin")
            newPin.style.left = (75.98 + 61.8 * i + (j % 2) * 20 + ((j+1) % 2) * 5) / board.offsetWidth * 100 + "%"
            newPin.style.top = (35 + 15 * Math.floor(j / 2)) / board.offsetHeight * 100 + "%"
            newGroup.appendChild(newPin)
            newPinArray.push(newPin)

            // 円選択
            newCircle.addEventListener("mousedown",()=>{
                currentSelected = newCircle
                currentSelected.col = j
                currentSelected.row = i
                if (currentSelected.row != currentRound)return
                ballSelect.style.display = "block"
                const circlePos = newCircle.getBoundingClientRect()
                const cL = circlePos.left + newCircle.clientWidth/2
                const cT = circlePos.top + newCircle.clientWidth/2
                ballSelect.style.left = cL - ballSelect.clientWidth/2 + "px"
                ballSelect.style.top = cT -  ballSelect.clientHeight/2 + "px"

                const radius = 80
                selectItems.forEach((item,idx)=>{
                    const angle = (idx / selectItems.length) * 2 * Math.PI
                    const x = ballSelect.clientWidth/2 - item.clientWidth/2 + radius * Math.cos(angle)
                    const y = ballSelect.clientHeight/2 - item.clientHeight/2 + radius * Math.sin(angle)
                    item.style.left = x + "px"
                    item.style.top = y + "px"
                })
            })
        }
        circleContainer.appendChild(newGroup)
        circleArray.push(newCircleArray)
        pinArray.push(newPinArray)
    }
}
document.getElementById("play-btn").addEventListener("click",()=>{
    if (roundStart){
        roundStart = false
        setTimeout(()=>{
            boardRect = board.getBoundingClientRect()
            generateCircles()
            generateAnswer()
        }, 500);
    }
})
function generateAnswer(){
    // 色回答生成
    for(let i = 0;i<4;i++){
        answerTable[i] = colorNames[Math.floor(Math.random()*(selectItems.length-1))+1]
    }
}
// ボール選択
const selectAngle = 360/selectItems.length //45
let angleRight = selectAngle/2
let angleLeft = 360-selectAngle/2
let prevAngle = 0
let prevSelectItem
window.addEventListener("mousemove",(mouse)=>{
    if (!currentSelected)return
    if (currentSelected.row != currentRound)return
        const curRect = currentSelected.getBoundingClientRect()
        const originX = (curRect.left + currentSelected.clientWidth / 2) - mouse.clientX
        const originY = (curRect.top + currentSelected.clientHeight / 2) - mouse.clientY
        const ballAngle = Math.atan2(originY,originX)*180 / Math.PI + 180
        const diffRight = angleDiff(ballAngle,angleRight)
        const diffLeft = angleDiff(ballAngle,angleLeft)
        if (diffRight > 0){
            angleRight+=selectAngle
            angleLeft+=selectAngle
            currentColor = (currentColor + 1) % selectItems.length
        }else if(diffLeft < 0){
            angleLeft-=selectAngle
            angleRight-=selectAngle
            currentColor = (currentColor - 1 + selectItems.length) % selectItems.length
        }
        // 選択したものを発光
        if (diffRight > 0 || diffLeft < 0){
            if (prevSelectItem)prevSelectItem.classList.remove("emit")
            selectItems[currentColor].classList.add("emit")
            prevSelectItem = selectItems[currentColor]
        }
        angleRight = (angleRight + 360) % 360
        angleLeft  = (angleLeft + 360) % 360

        selectBorder.style.transform = `translate(-50%, -50%)rotate(${(angleRight+selectAngle)}deg)`
})
function angleDiff(a, b) {
  return (a - b + 540) % 360 - 180;
}

// ボール選択モード解除
let fullColor
window.addEventListener("mouseup",()=>{
    if (!currentSelected)return
    if (currentSelected.row != currentRound)return
    ballSelect.style.display = "none"

    // ボール設置アニメーション
    if (currentColor !== 0){
        const selectedRect = currentSelected.getBoundingClientRect()
        const newAnimBall = animBall.cloneNode(false)
        circleContainer.appendChild(newAnimBall)
        newAnimBall.style.left = selectedRect.left - boardRect.left + "px"
        newAnimBall.style.top = selectedRect.top - boardRect.top + "px"
        newAnimBall.style.backgroundImage = `url(images/mastermind/${colors[currentColor]}.png)`
        newAnimBall.animate({
            transform:["scale(1.5)","scale(1)"]
        },{
            duration:250,
            easing:"ease-out",
        })
        setTimeout(() => {
            newAnimBall.remove()
        }, 250);
    }
    

    currentSelected.style.backgroundImage = `url(images/mastermind/${colors[currentColor]}.png)`
    currentColorTable[currentSelected.col] = colorNames[currentColor]
    if (currentColor == 0)currentSelected.classList.add("emit-animation")
    else currentSelected.classList.remove("emit-animation")
    // カラーチェック
    fullColor = true
    for (let i = 0;i<4;i++){
        if(!currentColorTable[i])fullColor = false
    }
    if (fullColor)submitBtn.classList.remove("disable-btn")
    else submitBtn.classList.add("disable-btn")
    currentSelected = ""
})
submitBtn.addEventListener("click",()=>{
    // 色がすべて入っている状態
    if (fullColor){
        // 色判定
        let hitList = []
        let answerClone = answerTable.concat()
        for (let i = 3;i>=0;i--){
            if (currentColorTable[i] == answerTable[i]){
                hitTable[0]++
                answerClone.splice(i,1)
                hitList.push(i)
            }
        }
        for (let i = 3;i>=0;i--){
            if (!hitList.includes(i)){
                for (let j = answerClone.length;j>=0;j--){
                    if (answerClone[j] === currentColorTable[i]){
                        hitTable[1]++
                        answerClone.splice(j,1)
                        break
                    }
                }
            }
        }

        // ピン配置
        let placedPin = 0
        for (let i = 0;i<hitTable[0];i++){
            pinAnim(placedPin,"red")
            placedPin++
        }
        for (let i = 0;i<hitTable[1];i++){
            pinAnim(placedPin,"white")
            placedPin++
        }

        if (hitTable[0] === 4){ //色があっていた場合
            showResult("clear")
        }
        else{ //色が違ったら
            // 次のラウンドへ
            currentRound++
            if (currentRound >= 12){
                showResult("over")
            }
            else for (const circle of circleArray[currentRound])circle.classList.add("emit-animation")
        }
        submitBtn.classList.add("disable-btn")
        currentColorTable = []
        hitTable = [0,0]
        fullColor = false
    }
})

// ピンのアニメーション
async function pinAnim(num,val){
    const pinPos = pinArray[currentRound][num].getBoundingClientRect()
    const newAnimPin = animPin.cloneNode(false)
    const delay = num*200
    circleContainer.appendChild(newAnimPin)
    newAnimPin.style.left = pinPos.left - boardRect.left + "px"
    newAnimPin.style.top = pinPos.top - boardRect.top + "px"
    newAnimPin.animate({
        transform:["scale(1.5)","scale(1)"]
    },{
        duration:250,
        easing:"ease-out",
        delay:delay
    })
    setTimeout(() => {
        newAnimPin.style.backgroundImage = `url(images/mastermind/${val}-pin.png)`
    }, delay);
    const round = currentRound
    setTimeout(() => {
        pinArray[round][num].style.backgroundImage = `url(images/mastermind/${val}-pin.png)`
        newAnimPin.remove()
    }, 250 + delay);
}

function showResult(result){
    setTimeout(() => {
        resultContainer.style.display = "block"
        if (result === "clear")resultComment.textContent = "クリアおめでとう！"
        else if(result === "over")resultComment.textContent = "もう1回！！"
        resultBalls.forEach((ball,idx)=>{
            ball.style.backgroundImage = `url(images/mastermind/${answerTable[idx]}-ball.png)`
        })
    }, 1000);
}
// リトライ
retryBtn.addEventListener("click",()=>{
    // リザルト画面非表示
    resultContainer.style.display = "none"
    // 円の色.ピンの色リセット
    for (const circleArr of circleArray){
        for (const circle of circleArr){
            if (circle.row === 0)circle.classList.add("emit-animation")
            circle.style.backgroundImage = `url(images/mastermind/ball-hole.png)`
        }
    }
    for (const pinArr of pinArray){
        for (const pin of pinArr){
            pin.style.backgroundImage = `url(images/mastermind/ball-hole.png)`
        }
    }
    answerTable = []
    currentRound = 0
    generateAnswer()
})