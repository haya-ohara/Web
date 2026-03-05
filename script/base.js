// 右クリ禁止
window.addEventListener("contextmenu",(event)=>{
    event.preventDefault()
})

const mainMenu = document.getElementById("main-menu")
const mainIcon = document.getElementById("icon")
const playBtn = document.getElementById("play-btn")
const tutorialBtn = document.getElementById("tutorial-btn")
const exitBtn = document.getElementById("exit-btn")
const btns = [playBtn,tutorialBtn,exitBtn]

const tutorialMenu = document.getElementById("tutorial-menu")
const tutorialReturn = document.getElementById("tutorial-return")
const tutorialPrev = document.getElementById("tutorial-prev")
const tutorialNext = document.getElementById("tutorial-next")
const tutorialContents = document.getElementById("tutorial-text-buttons").querySelector("p")
const tutorialImage = document.getElementById("tutorial-image")

const playMenu = document.getElementById("play-menu")
const playReturn = document.getElementById("play-return")
const playTutorial = document.getElementById("play-tutorial")

const allBtn = document.querySelectorAll("button")

let prevMenu
let currentTutorial = 0

// メインスクリーン表示アニメーション
mainIcon.animate({
    opacity:[0,1]
},{
    duration:1000,
    delay:200,
    fill:"forwards"
})
btns.forEach((btn,idx) => {
    btn.animate({
        opacity:[0,1]
    },{
        duration:1000,
        delay:800+idx*500,
        fill:"forwards"
    })
});

// メインメニュー非表示（要素、ディスプレイタイプ)
function swapMenu(currentMenu,targetMenu,display){
    const menuDelay = 400
    currentMenu.animate({
        opacity:[1,0]
    },{
        duration:menuDelay,
        fill:"forwards"
    })
    targetMenu.animate({
        opacity:[0,1]
    },{
        duration:menuDelay,
        delay:menuDelay,
        fill:"forwards"
    })
    setTimeout(() => {
        targetMenu.style.display = display
        currentMenu.style.display = "none"
    }, menuDelay);

    // 実行中はボタン使用停止
    for (const btn of allBtn){
        btn.disabled = true
    }
    setTimeout(() => {
        for (const btn of allBtn){
            btn.disabled = false
        }
    }, menuDelay*2);
}
// チュートリアル表示
tutorialBtn.addEventListener("click",()=>{
    prevMenu = mainMenu
    swapMenu(mainMenu,tutorialMenu,"flex")
})
playTutorial.addEventListener("click",()=>{
    prevMenu = playMenu
    swapMenu(playMenu,tutorialMenu,"flex")
})
// メインメニュー表示
tutorialReturn.addEventListener("click",()=>{
    swapMenu(tutorialMenu,prevMenu,"flex")
})
playReturn.addEventListener("click",()=>{
    swapMenu(playMenu,mainMenu,"flex")
})
// プレイメニュー表示
playBtn.addEventListener("click",()=>{
    swapMenu(mainMenu,playMenu,"flex")
})
// ウィンドウ削除
exitBtn.addEventListener("click",()=>{
    window.close()
})

// チュートリアル説明用ボタン
tutorialPrev.style.visibility = "hidden"
writeTutorial()
tutorialPrev.addEventListener("click",()=>{
    if (currentTutorial <= 0)return
    currentTutorial--
    if (currentTutorial == tutorialTexts.length - 2)tutorialNext.style.visibility = "visible"
    if (currentTutorial == 0)tutorialPrev.style.visibility = "hidden"
    writeTutorial()
})
tutorialNext.addEventListener("click",()=>{
    if (currentTutorial >= tutorialTexts.length-1)return
    currentTutorial++
    if (currentTutorial == 1)tutorialPrev.style.visibility = "visible"
    if (currentTutorial == tutorialTexts.length-1)tutorialNext.style.visibility = "hidden"
    writeTutorial()
})
function writeTutorial(){
    const current = tutorialTexts[currentTutorial]
    tutorialContents.innerHTML = current.text
    tutorialImage.style.backgroundImage = `url(images/${current.image})`
}