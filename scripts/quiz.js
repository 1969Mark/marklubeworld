/* quiz.js - 潤滑油達人挑戰邏輯 - 擴充版 (涵蓋全站文章) */

const QUIZ_DATA = [
    {
        question: "傳統基礎油命名如 SN150，其數字 150 是代表在 100°F 時的哪種黏度單位？",
        options: ["運動黏度 (cSt)", "賽氏通用秒數 (SUS)", "恩氏黏度 (Engler)", "絕對黏度 (cP)"],
        answer: 1,
        explanation: "SN150 代表 Solvent Neutral 溶劑中性油，其 150 是在 100°F 下的賽氏通用秒數 (Saybolt Universal Seconds)。"
    },
    {
        question: "根據 API 基礎油分類，哪一類基礎油具有 100% 飽和物、0 硫含量且屬於「純化學合成」？",
        options: ["Group I", "Group II", "Group III", "Group IV (PAO)"],
        answer: 3,
        explanation: "Group IV 是聚α-烯烴 (PAO)，是完全不含天然原油雜質的純化學合成基礎油。"
    },
    {
        question: "在脫碳轉型中，HVO 生質燃料相較於 FAME 的主要優點是什麼？",
        options: ["價格更低", "不含氧、化學穩定性極佳且十六烷值高", "能溶解管路積碳", "含氧量高達 10%"],
        answer: 1,
        explanation: "HVO (加氫處理植物油) 是純烴類，不含氧且物理性與石油柴油接近，穩定性遠優於 FAME。"
    },
    {
        question: "2025 年生效的 FuelEU Maritime 條例，主要限制船舶能源的哪項指標？",
        options: ["總耗油量", "硫氧化物排放量", "溫室氣體強度 (GHG Intensity)", "航行速度"],
        answer: 2,
        explanation: "FuelEU Maritime 規定船舶溫室氣體強度必須逐年降低，以生命週期 (Well-to-Wake) 模型計算。"
    },
    {
        question: "空氣引導式艉軸密封 (Air Seal) 相比傳統油封，其核心優勢為何？",
        options: ["不需要潤滑油", "利用空氣緩衝區徹底隔離油與水，實現零排放", "成本更低", "構造更簡單"],
        answer: 1,
        explanation: "空氣密封透過受控的壓力空氣腔室，將海水與潤滑油徹底分離，即使洩漏也會排向船內收集箱而非大海。"
    },
    {
        question: "環保潤滑油 (EAL) 若混入海水，最容易發生的致命化學反應是？",
        options: ["氧化反應", "硝化反應", "水解反應 (Hydrolysis)", "聚合反應"],
        answer: 2,
        explanation: "酯類 EAL 遇到水會發生水解反應產生酸性物質，導致 TAN 升高並損壞密封件。"
    },
    {
        question: "液壓泵浦發生「氣穴現象 (Cavitation)」時，典型的聲音特徵為何？",
        options: ["悶悶的轟隆聲", "穩定且尖銳的高頻嘯叫聲", "碎石撞擊缸體的聲音", "低頻的震動聲"],
        answer: 1,
        explanation: "氣穴現象是油液內部因真空氣泡在高壓區迅速崩塌產生的尖銳高頻嘯叫聲。"
    },
    {
        question: "舵機系統中的「追隨機構 (Hunting Gear)」主要發揮什麼功能？",
        options: ["增加轉向動力", "防止液壓油過熱", "負反饋機制使舵葉角度精確跟隨駕駛台指令", "自動隔離洩漏缸"],
        answer: 2,
        explanation: "追隨機構是一種機械式負反饋系統，確保舵葉到達指令角度後，泵浦能自動歸零停止供油。"
    },
    {
        question: "在冷媒與潤滑油匹配中，POE (聚酯油) 最需要嚴格防範的物理特性是？",
        options: ["揮發性太高", "強大的吸濕性 (Hygroscopic)", "黏度太低", "顏色太深"],
        answer: 1,
        explanation: "POE 油極易吸收空氣中的水分，進而導致水解產生酸，侵蝕壓縮機線圈。"
    },
    {
        question: "目前船舶空調系統中，哪種冷媒被視為 R-134a 的最佳低 GWP 替代品？",
        options: ["R-404A", "R-513A", "R-448A", "CO2"],
        answer: 1,
        explanation: "R-513A 的 GWP 約 630，且屬於 A1 級不可燃，是 R-134a 理想的直接替代方案。"
    }
];

let currentQuestionIndex = 0;
let score = 0;

function initQuiz() {
    // 檢查是否已存在按鈕，避免重複初始化
    if (document.getElementById('quiz-trigger')) return;

    const trigger = document.createElement('button');
    trigger.id = 'quiz-trigger';
    trigger.innerText = '潤滑油達人挑戰';
    document.body.appendChild(trigger);

    const overlay = document.createElement('div');
    overlay.id = 'quiz-overlay';
    overlay.innerHTML = `
        <div id="quiz-container">
            <div class="quiz-header">
                <h3>潤滑油達人挑戰 (全方位版)</h3>
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

    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < QUIZ_DATA.length) {
            showQuestion();
        } else {
            showResult();
        }
    }, 4000);
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
            <div style="margin-top: 2rem;">
                <button class="cta-button" onclick="openQuiz()" style="cursor:pointer;">再挑戰一次</button>
                <button class="cta-button" onclick="closeQuiz()" style="margin-left: 1rem; background: #999; cursor:pointer;">回首頁複習知識</button>
            </div>
        </div>
    `;
}

// 初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuiz);
} else {
    initQuiz();
}
