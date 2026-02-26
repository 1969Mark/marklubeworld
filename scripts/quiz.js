/* quiz.js - 潤滑油達人挑戰邏輯 */

const QUIZ_DATA = [
    {
        question: "在二衝程十字頭引擎中，哪一個部件負責物理性隔離燃燒室與曲軸箱？",
        options: ["活塞環 (Piston Ring)", "填料箱 (Stuffing Box)", "十字頭滑塊 (Crosshead Guide)", "掃氣孔 (Scavenge Port)"],
        answer: 1,
        explanation: "填料箱 (Stuffing Box) 是關鍵的物理屏障，將上方的燃燒區域與下方的曲軸箱潤滑系統隔開。"
    },
    {
        question: "為什麼氣缸潤滑油 (Cylinder Oil) 的 BN 值通常遠高於系統油？",
        options: ["為了導熱更快", "為了增加黏度", "為了中和燃油燃燒產生的硫酸", "為了清淨曲軸箱"],
        answer: 2,
        explanation: "氣缸油需要高 BN (總鹼價) 來中和含硫燃油燃燒產生的酸性物質，預防腐蝕。"
    },
    {
        question: "當缸套溫度低於硫酸露點 (通常約 200°C) 時，容易發生什麼現象？",
        options: ["熱腐蝕 (Hot Corrosion)", "拉缸 (Scuffing)", "低溫腐蝕 (Cold Corrosion)", "電解腐蝕"],
        answer: 2,
        explanation: "低溫腐蝕發生在酸液凝結的溫度點以下，特別是在慢速航行(Slow Steaming)時尤為嚴重。"
    },
    {
        question: "根據 Stribeck 曲線，最理想的潤滑狀態（幾乎無機械磨損）是？",
        options: ["邊界潤滑 (Boundary Lubrication)", "混合潤滑 (Mixed Lubrication)", "流體動力潤滑 (Hydrodynamic Lubrication)", "彈性流體動力潤滑"],
        answer: 2,
        explanation: "流體動力潤滑狀態下，固體表面被連續油膜完全分離，幾乎沒有機械接觸磨損。"
    },
    {
        question: "燃油中的哪種極硬顆粒若未經分離器移除，會對缸套造成毀滅性刮削？",
        options: ["釩 (Vanadium)", "鈉 (Sodium)", "觸媒微粉 (Catfines)", "碳粒"],
        answer: 2,
        explanation: "觸媒微粉 (Catfines) 是源自煉油過程的鋁矽顆粒，硬度極高。"
    },
    {
        question: "現代航運中，BoB (Blending on Board) 系統的主要目的是？",
        options: ["自動更換系統油", "精確調配最適當的 BN 值汽缸油", "過濾系統油中的水分", "增加燃油的發熱值"],
        answer: 1,
        explanation: "BoB 系統能根據當前燃油硫含量，動態混合添加劑與系統油，調配出精確 BN 值的汽缸油。"
    },
    {
        question: "系統油 (System Oil) 在二衝程引擎中的核心任務除了潤滑，還有？",
        options: ["冷卻活塞下端", "增加燃燒壓力", "清潔掃氣箱", "防止缸壁拋光"],
        answer: 0,
        explanation: "系統油在活塞下方空腔循環，負責帶走大量熱量以防止活塞受熱變形。"
    },
    {
        question: "在電子控制引擎（如 MAN ME 型）中，系統油還扮演什麼額外角色？",
        options: ["冷媒", "液壓驅動油", "封堵氣體", "抗氧劑"],
        answer: 1,
        explanation: "電子控制引擎使用系統油作為液壓介質來驅動排氣閥與噴油系統。"
    },
    {
        question: "當燃油中釩 (Vanadium) 與鈉 (Sodium) 的比例處於什麼狀態時，最容易發生熱腐蝕？",
        options: ["1:1", "10:1", "3:1", "1:3"],
        answer: 2,
        explanation: "釩與鈉比例約 3:1 時最容易形成低熔點鹽類，在 550°C 以上會造成金屬燒灼。"
    },
    {
        question: "評估潤滑效能最直接且必須優先進行的實地檢查是？",
        options: ["燃油化驗", "掃氣口檢查 (Scavenge Port Inspection)", "排煙顏色觀測", "曲軸箱油霧偵測"],
        answer: 1,
        explanation: "掃氣口檢查是觀察活塞、活塞環與缸套真實狀況最直接的基準。"
    }
];

let currentQuestionIndex = 0;
let score = 0;

function initQuiz() {
    const trigger = document.createElement('button');
    trigger.id = 'quiz-trigger';
    trigger.innerText = '潤滑油達人挑戰';
    document.body.appendChild(trigger);

    const overlay = document.createElement('div');
    overlay.id = 'quiz-overlay';
    overlay.innerHTML = `
        <div id="quiz-container">
            <div class="quiz-header">
                <h3>潤滑油達人挑戰</h3>
                <button class="quiz-close">✕</button>
            </div>
            <div class="quiz-progress-bar"></div>
            <div class="quiz-body" id="quiz-main">
                <!-- 內容動態插入 -->
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    trigger.onclick = openQuiz;
    overlay.querySelector('.quiz-close').onclick = closeQuiz;
}

function openQuiz() {
    document.getElementById('quiz-overlay').classList.add('active');
    currentQuestionIndex = 0;
    score = 0;
    showQuestion();
}

function closeQuiz() {
    document.getElementById('quiz-overlay').classList.remove('active');
}

function showQuestion() {
    const quizMain = document.getElementById('quiz-main');
    const questionData = QUIZ_DATA[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / QUIZ_DATA.length) * 100;
    document.querySelector('.quiz-progress-bar').style.width = `${progress}%`;

    quizMain.innerHTML = `
        <div id="quiz-question">${currentQuestionIndex + 1}. ${questionData.question}</div>
        <div class="quiz-options">
            ${questionData.options.map((opt, i) => `
                <button class="option-btn" onclick="checkAnswer(${i})">${opt}</button>
            `).join('')}
        </div>
        <div class="quiz-feedback" id="quiz-feedback"></div>
    `;
}

function checkAnswer(selectedIndex) {
    const questionData = QUIZ_DATA[currentQuestionIndex];
    const feedback = document.getElementById('quiz-feedback');
    const options = document.querySelectorAll('.option-btn');
    
    // 停用所有按鈕防止重複點擊
    options.forEach(btn => btn.disabled = true);

    if (selectedIndex === questionData.answer) {
        score++;
        options[selectedIndex].classList.add('correct');
        feedback.innerHTML = `<div class="success-box">✅ 答對了！<br>${questionData.explanation}</div>`;
    } else {
        options[selectedIndex].classList.add('wrong');
        options[questionData.answer].classList.add('correct');
        feedback.innerHTML = `<div class="warning-box">❌ 答錯了。<br>正確答案是：${questionData.options[questionData.answer]}<br>${questionData.explanation}</div>`;
    }
    feedback.style.display = 'block';

    // 延遲進入下一題
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < QUIZ_DATA.length) {
            showQuestion();
        } else {
            showResult();
        }
    }, 3500);
}

function showResult() {
    const quizMain = document.getElementById('quiz-main');
    document.querySelector('.quiz-progress-bar').style.width = `100%`;
    
    let title = "";
    let color = "";
    if (score >= 8) {
        title = "達人等級 🏆";
        color = "#ee9b00";
    } else if (score >= 5) {
        title = "工程師等級 ⚙️";
        color = "#0a9396";
    } else {
        title = "再接再厲等級 ⚓";
        color = "#555555";
    }

    quizMain.innerHTML = `
        <div class="result-screen">
            <h2>測驗完成！</h2>
            <p>您的得分：<strong>${score} / ${QUIZ_DATA.length}</strong></p>
            <span class="title-badge" style="color: ${color}">${title}</span>
            <button class="cta-button" onclick="openQuiz()" style="margin-top: 1rem; cursor:pointer;">再挑戰一次</button>
            <button class="cta-button" onclick="closeQuiz()" style="margin-top: 1rem; margin-left: 1rem; background: #999; cursor:pointer;">觀看網站內容複習</button>
        </div>
    `;
}

// 初始化
document.addEventListener('DOMContentLoaded', initQuiz);
