// 右クリ禁止
window.addEventListener("contextmenu",(event)=>{
    event.preventDefault()
})

// ローディング
const loadingMenu = document.getElementById("loading-menu")
const header = document.getElementById("header")
const headerBg = document.getElementById("header-bg")
const yearScale = document.getElementById("year-scale")
const yearContainer = document.getElementById("year-container")
const loadingText = document.getElementsByClassName("year")
const loadingFrame = document.getElementById("year-frame")

// ロード後に展開するdiv
const afterLoad = document.getElementById("after-load")

// ステージ背景
const stageBg = document.getElementById("stage-bg")

// 時計
const clock = document.getElementById("clock")
const clockContainer = document.getElementById("clock-container")
// 短針
const hourHand = document.getElementById("hour-hand")
// 長針
const minuteHand = document.getElementById("minute-hand")

// ゲームブロック
const prevGameBlock = document.getElementById("prev-game")
const prevGameInfo = {
    top: 400,
    left:0,
    size: 80,
    transform: 0,
    zIndex: -50
}
const currentGameBlock = document.getElementById("current-game")
const currentGameInfo = {
    top: 320,
    left: 50,
    size: 200,
    transform: -50,
    zIndex: 50
}
const nextGameBlock = document.getElementById("next-game")
const nextGameInfo = {
    top: 400,
    left:100,
    size: 80,
    transform: -100,
    zIndex: -50
}
// const gameLink = document.getElementById("game-link")
// ゲームテキスト
const gameTexts = document.getElementById("game-texts")
const gameTitle = document.getElementById("game-title")
const gameDescription = document.getElementById("game-description")

// チュートリアル
const tutorial = document.getElementById("tutorial")
const tutorialText = document.getElementById("tutorial-text")
const tutorialStep = document.getElementById("tutorial-step")
// チュートリアルテキスト
const mainTexts = [
    "ようこそ！",
    "このサイトでは様々な年代のゲームで遊ぶことができます！",
    "まずはこの時計の長針を回して、少し時間を進めてみましょう！",
    "ステージ上にゲームが表示されました！",
    "試しにゲームをクリックしてプレイしてみましょう！",
    "チュートリアルは以上です。ご自由にお楽しみください！"
]
// チュートリアル入力中はfalse
let isTyping = false
// チュートリアルの状態（falseなら停止、trueなら続行）
let tutorialState = false
// チュートリアルテキストの配列番号
let tutorialNum = 0
// 時計を１回転検知したらtrue(一回だけ発火させるための変数)
let tutorialPhase = {clock:false}
// チュートリアル用に一回転時計を回した後に逆回転させないため
let avoidReverse = 0

let containerRect,clockX,clockY

let totalSpin = 0

// ゲーム詳細
const games = [
    {
        title:"チュートリアル",
        description:"チュートリアルの指示にそって進めましょう",
        year:1958,
        image:"images/tutorial.png",
        link:""
    },
    {
        title:"マスターマインド",
        description:"隠されたボールの色をピンの色のヒントを元に推理するボードゲーム。<br>「ヒット＆ブロー」とも呼ばれる",
        year:1970,
        image:"images/mastermind.png",
        link:"mastermind.html",
        size:[1000,600]
    },
    {
        title:"<s style='text-decoration-color:red;'>インベーダー</s>",
        description:"製作中です。",
        year:1978,
        image:"images/invader-block.png",
        link:"",
        size:[600,720]
    },
    {
        title:"テトリス",
        description:"上から落ちてくる7種類のブロック（テトリミノ）、隙間なく横一列に並べて消すパズルゲームです。",
        year:1984,
        image:"images/tetris.png",
        link:"tetris.html",
        size:[640,720]
    },
    {
        title:"マインスイーパー",
        description:"盤面に隠された地雷を避けてすべての安全なマスを開ける論理パズルゲームです。",
        year:1992,
        image:"images/minesweeper.png",
        link:"minesweeper.html",
        size:[900,720]
    },
    {
        title:"<s style='text-decoration-color:red;;'>スネークゲーム</s>",
        description:"製作中です。",
        year:1997,
        image:"images/snake-block.png",
        link:"",
        size:[620,720]
    },
    {
        title:"生誕",
        description:"私が生誕した年です",
        year:2005,
        image:"images/icon.png",
        link:""
    }
]


const loadDelay = 1 //ロードしてからの遅延秒数
const loadAnimDelay = 3.5 //スロット開始
const loadTime = 4 //スロットの秒数
const totalDelay = (loadTime+loadDelay+loadAnimDelay)*1000+1000
const afterDelay = 3000

let currentYear

// ロードしたら開始
window.addEventListener("load",startLoading)
function startLoading(){
    [header,loadingMenu].forEach((elem,idx)=>{
        let delay = loadDelay/(idx+1)
        elem.animate({
        opacity:[0,1]
    },{
        duration:1500,
        delay:delay*1000,
        fill:"forwards"
    })
    })
    setTimeout(() => {
        rollNum(yearContainer,loadingText,1958,loadTime)
        loadingMenu.style.backgroundPosition = "left 0 bottom -20px"
    }, loadAnimDelay*1000);

    // アニメーション後、年代スロット縮小
    yearScale.animate({
        transform:"scale(0.5)"
    },{
        duration:afterDelay,
        delay:totalDelay,
        easing:"cubic-bezier(.17,-0.2,.32,1.25)",
        fill:"forwards"
    })

    // ヘッダーを縮小
    header.animate({
        height:"100px"
    },{
        duration:afterDelay,
        delay:totalDelay,
        easing:"cubic-bezier(.8,.19,.34,.97)",
        fill:"forwards"
    })

    // ヘッダー背景のアニメーション
    headerBg.animate({
        transform:"translateY(0)"
    },{
        duration:afterDelay+800,
        delay:totalDelay,
        easing:"ease-in-out",
        fill:"forwards"
    })

    // ローディングメニューを透明化
    loadingMenu.animate({
        opacity:[1,0]
    },{
        duration:afterDelay-1000,
        delay:totalDelay,
        fill:"forwards"
    })
    // ローディングメニュー削除
    setTimeout(() => {
        loadingMenu.remove()
    }, afterDelay+totalDelay-1000);

    // ロード後コンテンツを可視化
    setTimeout(() => {
        afterLoad.style.display = "block"
    }, totalDelay);

    stageBg.animate({
        transform:["scale(1.5)","scale(1)"]
    },{
        duration:afterDelay,
        delay:totalDelay,
        easing:"cubic-bezier(.06,.87,.34,1)",
        fill:"forwards"
    })

    tutorial.animate({
        transform:["translateY(100%)","translateY(0)"]
    },{
        duration:afterDelay,
        delay:totalDelay,
        easing:"cubic-bezier(.06,.87,.34,1)",
        fill:"forwards"
    })

    // チュートリアル開始
    setTimeout(() => {
        tutorialState = true
        typingAnim()
    }, afterDelay+totalDelay+1000);
}

// 数字スロットプログラム
function rollNum(container,from,to,second){ 
    //親要素、動かす要素（数字）、目的の数、秒数

    // それぞれ数字の桁数を取得
    let fromDigit = from.length

    // from(要素群)を数値に
    let fromNum = 0
    for(num of from){
        fromNum+=Number(num.textContent)*(10**(fromDigit-1))
        fromDigit--
    }

    if(fromNum == to)return

    currentYear = to // 年代更新

    const toDigit = String(to).length

    // toの数値を配列(toArray)に分解
    let toArray = []
    // toを複製
    let toNum = to
    for (let i=toDigit;i>0;i--){
        let divide = Math.floor(toNum/10)*10
        toArray[i-1]= toNum-divide
        toNum = Math.floor(toNum/10)
    }

    // 親要素の高さ
    let rollHeight = container.clientHeight

    let midArray = []

    // 半回転の秒数
    const animTime = second*1000
    const delayAmount = animTime/4
    

    
    // 回転方向 true=下回転 false=上回転
    let direction = fromNum-to < 0 ? true : false;

    // fromからtoまでの差分をmidArrayに入れる(回転方向による)
    [...from].forEach((num,idx) => {
        let newNum
        if(direction){
            newNum = toArray[idx]-Number(num.textContent)
        }
        else{
            newNum = Number(num.textContent)-toArray[idx]
        }
        if (newNum < 0){
            newNum+=10
        }
        midArray.push(newNum)
    });

    rollHeight *= direction?1:-1;

    [...from].forEach((num,idx) => {
        const arrNum = midArray[idx]
        // delayを分割
        const newDelay = (animTime-(delayAmount*2))/(arrNum*2)

        // 最初・最後のアニメーションディレイ
        let lastDelay = 0
        let firstDelay = delayAmount

        // 上記の調整用
        let midDelay = 0

            for(let j = 1;j<=arrNum;j++){
                lastDelay = j==arrNum?delayAmount:0

                // 最後・最初だけスローにする
                let easeOut = j==arrNum?"cubic-bezier(.17,.89,.32,1.25)":"linear"
                let easeIn = j==1?"ease-in":"linear"
                // 中心からのアニメーション
                num.animate({
                    transform:["translateY(0px)",`translateY(${rollHeight}px)`],
                },{
                    duration:newDelay+firstDelay,
                    delay:(newDelay*j-newDelay)*2+midDelay,
                    easing:easeIn,
                    fill:"forwards"
                })

                // テキストを変更
                setTimeout(() => {
                    let newText
                    newText = direction?Number(num.textContent)+1:Number(num.textContent)-1
                    newText = newText >= 10 ? 0:newText
                    newText = newText < 0 ? 9:newText
                    num.textContent = newText
                    },newDelay+newDelay*2*(j-1)+firstDelay+midDelay)
                // 上・下から中心へのアニメーション
                num.animate({
                    transform:[`translateY(${-1*rollHeight}px)`,"translateY(0px)"],
                },{
                    duration:newDelay+lastDelay,
                    delay:newDelay+newDelay*2*(j-1)+firstDelay+midDelay,
                    easing:easeOut,
                    fill:"forwards"
                })
                firstDelay=0
                midDelay=delayAmount
            }
    });
}

// 時計回転
const rotationSpeed = 2
let startRotating = false
let totalRotation = 0       //合計の角度
let currentAngle = 0        //現在の角度（最大360度）
let rotations = 0           //現在の回転数
let angle                   //マウスの位置(角度）
let prevAngle = null        //１つ前の角度
let prevRotations = -1    //１つ前の回転数
let prevTotalRotation = 0 //１つ前の合計の角度
let angleInterval = false   //マウスが押された時にだけインターバルを発動させるための変数
let clockInterval           //時計用のインターバル

let yearStepAngle = 0      // 1年進むための角度
let progressedYears = null

let clockBottom = true //時計が360度に達したか
let clockRotation = 180
let startAngle = 0
let targetAngle = 0

let currentGame = games[0]

minuteHand.addEventListener("mousedown",()=>{
    startRotating = true
    angleInterval = true
})
window.addEventListener("mousemove",(mouse)=>{
    if (!startRotating)return
    let mouseX = mouse.clientX
    let mouseY = mouse.clientY
    angle = ((Math.atan2(mouseY-clockY,mouseX-clockX)*180)/Math.PI)+90

    // 角度補正
    if (angle >= 360)angle -= 360
    if (angle < 0)angle += 360

    // インターバル用
    if(angleInterval){
        angleInterval = false
        clockInterval = setInterval(()=>{
            if (prevAngle !== null) {
                // 方向判定
                let delta = angle - prevAngle
        
                // 角度ジャンプ補正
                if (delta > 180) delta -= 360
                if (delta < -180) delta += 360

                // 最低値以下への回転防止
                if (totalRotation-avoidReverse <= 0 && delta < 0) {
                    delta = 0
                }
                // 最大値以上への回転防止
                if (rotations >= games.length-1 && delta > 0){
                    delta = 0
                }
                
                // 一定の速度で回転
                if (delta > 2){
                    currentAngle+=rotationSpeed
                    totalRotation+=rotationSpeed
                }
                else if(delta < -2){
                    currentAngle-=rotationSpeed
                    totalRotation-=rotationSpeed
                }

                if (currentAngle < 0)currentAngle += 360
                if (currentAngle > 360)currentAngle -= 360
                // >= から > に変更済み
            }
            minuteHand.style.transform = `rotate(${currentAngle}deg)`
            hourHand.style.transform = `rotate(${180+totalRotation/12}deg)`
        
        
            // 回転数（1回転 = 360deg）
            rotations = Math.floor(totalRotation / 360)
            const prevGame = games[rotations-1]
            currentGame = games[rotations]
            let nextGame = games[rotations+1]
            const dbPrevGame = games[rotations-2]
            const dbNextGame = games[rotations+2]

            // 時計を回すごとに年代を増加させる(360/次の年代-今の年代)
            if (totalRotation%360 == 0 && clockBottom){
                clockBottom = false
                fade("in",gameTexts)
                // ゲームリンク有効化(チュートリアル例外処理)
                if (currentGame.link){
                    currentGameBlock.classList.remove("disable-link")
                }
                // ゲーム詳細更新
                gameTitle.innerHTML = currentGame.title
                gameDescription.innerHTML = currentGame.description
                currentGameBlock.style.backgroundImage = `url(${currentGame.image})`
                if (prevGame)prevGameBlock.style.backgroundImage = `url(${prevGame.image})`
                if (nextGame)nextGameBlock.style.backgroundImage = `url(${nextGame.image})`
                
                // ゲームブロックアニメーション リセット
                const blocks = [currentGameBlock,nextGameBlock,prevGameBlock]
                const infos = [currentGameInfo,nextGameInfo,prevGameInfo]
                // const exists = [currentGame,nextGame,prevGame]
                blocks.forEach((block,idx)=> {
                    block.style.top = infos[idx].top+"px"
                    block.style.width = infos[idx].size+"px"
                    block.style.height = infos[idx].size+"px"
                    block.style.left = infos[idx].left+"%"
                    block.style.transform = `translateX(${infos[idx].transform}%)`
                    block.style.zIndex = infos[idx].zIndex
                });
            }
            else if(totalRotation%180 == 0 && !(totalRotation%360 == 0)){
                if(!clockBottom){
                    clockBottom = true
                    clockRotation = totalRotation > prevTotalRotation ? 180 : -180
                    startAngle = totalRotation
                    targetAngle = totalRotation + clockRotation
                }
                // テキストフェードアニメーション
                if (totalRotation > prevTotalRotation){
                    if (clockRotation == 180){
                        fade("out",gameTexts)
                        // ゲームリンク無効化
                        currentGameBlock.classList.add("disable-link")
                    }else{
                        fade("in",gameTexts)
                        // ゲームリンク有効化
                        currentGameBlock.classList.remove("disable-link")
                    }
                }
                else if (prevTotalRotation > totalRotation){
                    if (clockRotation == 180){
                        fade("in",gameTexts)
                        // ゲームリンク有効化
                        currentGameBlock.classList.remove("disable-link")
                    }else{
                        fade("out",gameTexts)
                        // ゲームリンク無効化
                        currentGameBlock.classList.add("disable-link")
                    }
                }
            }
            if (rotations !== prevRotations){
                // 例外処理
                if (rotations == games.length-1){
                    rollNum(yearContainer,loadingText,currentGame.year,0.1)
                    prevRotations = rotations
                }

                // nextGame = games[rotations+1]
                if (!nextGame) return
                // 差分の年数
                remainingYears = nextGame.year - currentGame.year
                // 順回転
                if (rotations > prevRotations){
                    progressedYears = 0
                }
                // 逆回転
                else if(rotations < prevRotations){
                    progressedYears = remainingYears

                }
                yearStepAngle = 360/remainingYears
            }
            if (clockBottom){
                // 次のターゲットとなるアングルまでのパーセント値
                let percentage
                const edgeSize = currentGameInfo.size-prevGameInfo.size
                let nextSize
                let edgeTop
                let triangle
                if (clockRotation == 180){
                    if (targetAngle - totalRotation <= 180){
                        percentage = 1-(360-currentAngle)/180
                        nextSize = nextGameInfo.size + edgeSize*percentage + "px"
                        edgeTop = prevGameInfo.top - (prevGameInfo.top-currentGameInfo.top)*percentage + "px"
                        triangle = 1 - Math.abs(percentage * 2 - 1);
                        // ゲームブロックアニメーション
                        currentGameBlock.style.left = 50-50*percentage+"%"
                        currentGameBlock.style.transform = `translateX(${-50+50*percentage+"%"})`
                        nextGameBlock.style.top = edgeTop
                        nextGameBlock.style.width = nextSize
                        nextGameBlock.style.height = nextSize
                        nextGameBlock.style.left = nextGameInfo.left - currentGameInfo.left*percentage + "%"
                        nextGameBlock.style.transform = `translateX(${-100+50*percentage+"%"})`
                        nextGameBlock.style.zIndex = nextGameInfo.zIndex+150*percentage
                        if(percentage > 0.5){
                            if (dbNextGame){
                                prevGameBlock.style.transform = `translateX(${-100*(1-triangle)}%)`
                                prevGameBlock.style.left = "100%"
                                if(dbNextGame)prevGameBlock.style.backgroundImage = `url(${dbNextGame.image})`
                            }
                        }else{
                            prevGameBlock.style.transform = `translateX(${-100*triangle}%)`
                            prevGameBlock.style.left = "0%"
                            if(prevGame)prevGameBlock.style.backgroundImage = `url(${prevGame.image})`
                        }
                    }
                }
                else if(clockRotation == -180){
                    if (totalRotation - targetAngle <= 180){
                        percentage = 1-currentAngle/180
                        nextSize = nextGameInfo.size + edgeSize*percentage + "px"
                        edgeTop = prevGameInfo.top - (prevGameInfo.top-currentGameInfo.top)*percentage + "px"
                        triangle = 1 - Math.abs(percentage * 2 - 1);
                        // ゲームブロックアニメーション
                        currentGameBlock.style.left = 50+50*percentage+"%"
                        currentGameBlock.style.transform = `translateX(${-50-50*percentage+"%"})`
                        prevGameBlock.style.top = edgeTop
                        prevGameBlock.style.width = nextSize
                        prevGameBlock.style.height = nextSize
                        prevGameBlock.style.left = prevGameInfo.left + currentGameInfo.left*percentage + "%"
                        prevGameBlock.style.transform = `translateX(${-50*percentage+"%"})`
                        prevGameBlock.style.zIndex = nextGameInfo.zIndex+150*percentage
                        if(percentage > 0.5){
                            nextGameBlock.style.transform = `translateX(${-100*triangle*2}%)`
                            nextGameBlock.style.left = "0%"
                            if(prevGame)nextGameBlock.style.backgroundImage = `url(${prevGame.image})`
                        }else{
                            nextGameBlock.style.transform = `translateX(${-100*(1-triangle)}%)`
                            nextGameBlock.style.left = "100%"
                            if(dbNextGame)nextGameBlock.style.backgroundImage = `url(${dbNextGame.image})`
                        }
                    }
                }

                // ゲームブロックアニメーション
                currentGameBlock.style.top = currentGameInfo.top + (prevGameInfo.top-currentGameInfo.top)*percentage+"px"
                const midSize = currentGameInfo.size-(currentGameInfo.size-prevGameInfo.size)*percentage+"px"
                currentGameBlock.style.width = midSize
                currentGameBlock.style.height = midSize
                currentGameBlock.style.zIndex = 50-100*percentage
            }

            if (!nextGame)return

            // 年代スロット
            if (totalRotation > prevTotalRotation  && (currentAngle >= yearStepAngle * (progressedYears+1))){
                progressedYears++
                // 例外処理
                if (totalRotation == 360*rotations && rotations !== 0)progressedYears--
                rollNum(yearContainer,loadingText,currentGame.year + progressedYears,0.1)
            }
            else if (totalRotation < prevTotalRotation && (currentAngle < yearStepAngle * progressedYears)){
                progressedYears--
                rollNum(yearContainer,loadingText,currentGame.year + progressedYears,0.1)
            }
            prevRotations = rotations
            prevAngle = currentAngle
            prevTotalRotation = totalRotation
            
        
            if (rotations == 1 && tutorialPhase.clock == false){
                tutorialPhase.clock = true
                startRotating = false
                tutorialState = true
                avoidReverse = 360
                clearInterval(clockInterval)
                toNextTutorial()
            }
        },16)
    }
})
window.addEventListener("mouseup",()=>{
    startRotating = false
    clearInterval(clockInterval)
})
currentGameBlock.addEventListener("click",()=>{
    if (!currentGame.link)return
    const w = currentGame.size[0]
    const h = currentGame.size[1]
    const posW = screen.width/2-w/2
    const posH = screen.height/2-h/2
    window.open(currentGame.link, 'NewWindow',`width=${w},height=${h},left=${posW},top=${posH}`,"resizable=no")
})

function fade(string,target){
    const transparency = string == "in"?[0,1]:[1,0]
    
    target.animate({
        opacity:transparency
    },{
        duration:500,
        easing:"ease",
        fill:"forwards"
    })
}

// チュートリアルテキスト
let currentLen = mainTexts[tutorialNum].length
function typingAnim(){
    currentLen = mainTexts[tutorialNum].length
    // １文字22.41px
    adjustPosition()
    let i = 1
    let interval = setInterval(() => {
        tutorialText.textContent = mainTexts[tutorialNum].substring(0,i)
        i++
        if(currentLen<i){
            clearInterval(interval)
            setTimeout(() => {
                isTyping = true
                if (tutorialState)tutorialStep.style.visibility = "visible"
            }, 500);
        }
    }, 50);
}
// テキストの位置を中央揃えに
function adjustPosition(){
    let newPos = tutorial.clientWidth/2 - (currentLen/2)*22.41
    if (newPos>0){
        tutorialText.style.left = newPos - 20 + "px"
    }
    // パディングを引く
    if(afterLoad.style.display == "block"){
        containerRect = clockContainer.getBoundingClientRect()
        clockX = clockContainer.clientWidth/2+containerRect.left
        clockY = clockContainer.clientHeight/2+containerRect.top
    }
}
window.addEventListener("resize",adjustPosition)
// クリックでチュートリアル続行
window.addEventListener("click",toNextTutorial)
function toNextTutorial(){
    if (!tutorialState || !isTyping)return
    isTyping = false
    tutorialStep.style.visibility = "hidden"
    if (mainTexts.length-1 > tutorialNum){
        tutorialText.textContent = ""
        tutorialNum++
        // 時計登場アニメーション
        if (tutorialNum == 2){
            clock.style.display = "block"
            clock.animate({
                left:["-300px","20px"]
            },{
                duration:1000,
                easing:"ease-out",
                fill:"forwards"
            })
            // 時計の中心を把握（時計の針を回すため）
            setTimeout(() => {
                containerRect = clockContainer.getBoundingClientRect()
                clockX = clockContainer.clientWidth/2+containerRect.left
                clockY = clockContainer.clientHeight/2+containerRect.top
            }, 1000);

            setTimeout(() => {
                typingAnim()
            }, 1500);
            
            // 時計を回すまでストップ
            tutorialState = false
        }
        else typingAnim()
    }
    else{
        tutorial.animate({
            transform:["translateY(0)","translateY(100%)"]
        },{
            duration:1000,
            delay:1000,
            easeing:"ease-out",
            fill:"forwards"
        })
    }
}