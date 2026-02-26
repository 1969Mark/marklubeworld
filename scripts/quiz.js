/* quiz.js - 潤滑油達人挑戰邏輯 - 百題隨機專業版 */

// ========== 1. 題庫數據 (共計 100 題) ==========
const QUIZ_BANK = [
    // --- 基礎理化與化學 (1-20) ---
    {
        question: "傳統基礎油命名如 SN150，其數字 150 是代表在 100°F 時的哪種黏度單位？",
        options: ["運動黏度 (cSt)", "賽氏通用秒數 (SUS)", "恩氏黏度 (Engler)", "絕對黏度 (cP)"],
        answer: 1,
        explanation: "SN 代表 Solvent Neutral，150 是在 100°F 下的 Saybolt Universal Seconds (SUS)。"
    },
    {
        question: "API 基礎油分類中，哪一類是指「加氫處理製程，飽和物 > 90%，硫 < 0.03%，VI 在 80-120 之間」？",
        options: ["Group I", "Group II", "Group III", "Group IV"],
        answer: 1,
        explanation: "Group II 經過加氫處理，純度高於 Group I，但 VI 未達 Group III 的高標準。"
    },
    {
        question: "Stribeck 曲線中，當油膜厚度足以完全隔離金屬表面，幾乎無機械磨損的狀態稱為？",
        options: ["邊界潤滑", "混合潤滑", "流體動力潤滑", "靜壓潤滑"],
        answer: 2,
        explanation: "流體動力潤滑 (Hydrodynamic) 是最理想狀態，油膜完全支撐荷重。"
    },
    {
        question: "ISO VG 100 的黏度等級，大約相當於 SAE 引擎油規範的哪一個等級？",
        options: ["SAE 20", "SAE 30", "SAE 40", "SAE 50"],
        answer: 1,
        explanation: "依照黏度分類比較，ISO VG 100 的運動黏度範圍與 SAE 30 接近。"
    },
    {
        question: "潤滑油氧化反應中，哪種添加劑負責捐獻氫原子以終止自由基鏈反應？",
        options: ["清淨劑", "分散劑", "抗氧化劑 (受阻酚/芳香胺)", "極壓劑"],
        answer: 2,
        explanation: "抗氧化劑透過犧牲自我的化學結構來捕捉自由基，防止油品快速酸化。"
    },
    {
        question: "二衝程汽缸油通常選用 API Group I 基礎油，主要原因為何？",
        options: ["價格最便宜", "飽和烴含量適中 (80-90%)，清淨性與溶解力優於 II/III 類", "氧化穩定性最強", "黏度指數最高"],
        answer: 1,
        explanation: "Group I 的溶解力較佳，有助於將燃燒產物懸浮，且在活塞高溫區的清淨表現有時優於更高純度的合成油。"
    },
    {
        question: "酯類 (Ester) 合成油具有優異的「潤濕性」，其化學本質為何？",
        options: ["表面張力極低", "具有極性官能團 (-COO-) 可吸附於金屬表面", "分子量極小", "含氧量高"],
        answer: 1,
        explanation: "酯基的極性使其能形成定向排列分子膜，即使在油膜破裂時仍提供保護。"
    },
    {
        question: "黏度指數改質劑 (VII) 在油中發揮功能的物理模型類似？",
        options: ["小球滾動", "熱脹冷縮的彈簧 (遇熱展開增加內摩擦)", "化學中和", "物理過濾"],
        answer: 1,
        explanation: "VII 聚合物長鏈在高溫下舒展開來，增加流體阻力以抵消油品變稀的趨勢。"
    },
    {
        question: "極壓添加劑 (EP) 通常含有活性硫或磷，其作用機制為何？",
        options: ["降低油溫", "與金屬表面發生反應生成低剪切強度的無機膜", "防止水分進入", "改善氧化穩定性"],
        answer: 1,
        explanation: "EP 劑在瞬時高溫下反應生成化學膜，防止金屬直接焊接 (Scuffing)。"
    },
    {
        question: "分散劑 (Dispersants) 的主要任務是處理燃料燃燒產生的哪種污染物？",
        options: ["水分", "海水", "菸灰 (Soot) 與極性氧化副產物", "鐵粉"],
        answer: 2,
        explanation: "分散劑透過微胞封裝 (Encapsulation) 讓微小顆粒懸浮，防止其凝聚成油泥。"
    },
    {
        question: "當設備負荷提高，Stribeck 曲線的操作點會向哪個方向移動？",
        options: ["向右 (進入流體動力區)", "向左 (進入混合或邊界區)", "向上", "原點不動"],
        answer: 1,
        explanation: "負荷 P 在 Hersey Number 的分母，P 變大數值變小，操作點左移，磨損風險增加。"
    },
    {
        question: "API Group III 基礎油雖然源自原油，但常被稱為「合成油」是因為經過了什麼工藝？",
        options: ["簡單蒸餾", "酸鹼中和", "加氫異構化 (Hydroisomerization)", "物理過濾"],
        answer: 2,
        explanation: "長鏈分子結構經過重組達到高 VI，其性能已接近化學合成油。"
    },
    {
        question: "PAO基礎油的「Noack 揮發度」通常很低，這是因為？",
        options: ["分子量分佈窄且不含輕質組分", "黏度很高", "含有金屬添加劑", "密度很大"],
        answer: 0,
        explanation: "純化學合成可精確控制分子量，避免了容易蒸發的小分子存在。"
    },
    {
        question: "哪種化學元素常被用來作為「洗滌劑」的核心，負責中和酸性物質？",
        options: ["鋅", "鈣 (Calcium) 或鎂 (Magnesium)", "銅", "鋁"],
        answer: 1,
        explanation: "超鹼性磺酸鈣或水楊酸鈣是船舶油中中和硫酸的主要成分。"
    },
    {
        question: "所謂「單級油」與「多級油」的差異，主要在於是否添加了？",
        options: ["抗磨劑", "抗乳化劑", "黏度指數改質劑 (VII)", "清淨劑"],
        answer: 2,
        explanation: "VII 讓油品能同時符合高低溫的 SAE 黏度規範。"
    },
    {
        question: "冷媒與潤滑油相容性中，HFC 冷媒 (如 R134a) 通常必須匹配哪種合成油？",
        options: ["礦物油 (MO)", "烷基苯 (AB)", "聚酯油 (POE) 或 PAG", "PAO"],
        answer: 2,
        explanation: "HFC 冷媒不含氯，與非極性礦物油不互溶，必須使用具極性的合成油。"
    },
    {
        question: "冷凍機油的「絮點 (Flock Point)」是指？",
        options: ["油開始燃燒的溫度", "蠟從油/冷媒混合液中析出的溫度", "油完全凝固的溫度", "油的水分飽和點"],
        answer: 1,
        explanation: "絮點若高於蒸發器溫度，蠟晶會堵塞膨脹閥。"
    },
    {
        question: "基礎油中的「芳香烴」含量太高會導致？",
        options: ["黏度過低", "高溫下極易發生聚合反應生成漆膜與沉積物", "傾點降低", "完全沒影響"],
        answer: 1,
        explanation: "不飽和的苯環結構在高溫下熱穩定性較差。"
    },
    {
        question: "齒輪油中加入 EP 添加劑時，需注意其對哪種材質具有潛在腐蝕性？",
        options: ["鋼材", "白合金", "黃色金屬 (青銅/黃銅)", "工程塑膠"],
        answer: 2,
        explanation: "活性硫 EP 劑在高溫下會攻擊銅合金。"
    },
    {
        question: "判斷非引擎類油品（如液壓油）是否劣化的最關鍵分析指標是？",
        options: ["鹼值 (BN)", "酸值增加 (AN Increase) 與黏度變化", "鐵含量", "釩含量"],
        answer: 1,
        explanation: "非引擎油主要關注氧化程度與添加劑耗損，以 AN 反映最為直接。"
    },

    // --- 引擎與船舶系統 (21-40) ---
    {
        question: "二衝程低速引擎的「十字頭 (Crosshead)」結構，誕生了哪個重要的物理隔離部件？",
        options: ["增壓機", "填料箱 (Stuffing Box)", "分油機", "控制閥"],
        answer: 1,
        explanation: "填料箱隔離了燃燒室 (汽缸) 與曲軸箱 (系統油)，保護下部油品不受污染。"
    },
    {
        question: "二衝程主機「系統油 (System Oil)」的最核心任務除了潤滑，還包括？",
        options: ["中和 100 BN 的酸", "活塞冷卻 (Piston Cooling)", "取代汽缸油", "防止燃油洩漏"],
        answer: 1,
        explanation: "系統油在活塞內部循環帶走大量熱量，維持溫度平衡。"
    },
    {
        question: "主機汽缸油的注油率 (LOFR) 單位通常使用？",
        options: ["Liters / Hour", "g / kW-h", "kg / Day", "ppm"],
        answer: 1,
        explanation: "根據功率輸出的重量消耗率是工業標準指標。"
    },
    {
        question: "當主機使用高硫燃料油 (HSFO) 時，應選用哪種等級的汽缸油？",
        options: ["BN 25", "BN 40", "BN 70 或 100 以上", "BN 5"],
        answer: 2,
        explanation: "高硫燃油燃燒產生大量硫酸，必須用高驗值油進行中和。"
    },
    {
        question: "電子控制引擎 (如 MAN ME 型) 中，主機系統油還扮演了什麼功能？",
        options: ["燃料", "控制排氣閥與噴油的液壓驅動油 (Hydraulic Power Oil)", "滅火劑", "冷媒"],
        answer: 1,
        explanation: "ME 引擎取消了凸輪軸，改由高壓系統油作為執行機構的動力介質。"
    },
    {
        question: "汽缸殘油分析 (CDO/SDA) 中，如果鐵份高且殘留 BN 低，最可能的失效原因是？",
        options: ["磨料磨損 (Cat-fines)", "酸性腐蝕 (Corrosion)", "注油率太高", "水分過濾不良"],
        answer: 1,
        explanation: "BN 不足導致酸無法中和，造成化學侵蝕，鐵值隨之上升。"
    },
    {
        question: "船舶四衝程發電機引擎通常只有一套油系統，其黏度等級多為？",
        options: ["SAE 50", "SAE 30 或 SAE 40", "ISO VG 220", "SAE 10W"],
        answer: 1,
        explanation: "四衝程中速機需兼顧循環保護與些許汽缸潤滑，多選用 SAE 30/40。"
    },
    {
        question: "大型二衝程主機的「低溫腐蝕」主要發生在哪個位置？",
        options: ["曲軸箱壁", "活塞冠中心", "缸套下部 (低於露點溫度區域)", "增壓機葉片"],
        answer: 2,
        explanation: "缸套下部溫度較低，硫酸蒸氣容易凝結成液態造成腐蝕。"
    },
    {
        question: "主機掃氣室檢查 (Port Inspection) 時，若發現活塞環有「坍塌 (Collapse)」現象，原因常為？",
        options: ["注油率太低", "環槽積碳嚴重 (Deposit) 導致環失去彈性", "燃油太乾淨", "轉速太快"],
        answer: 1,
        explanation: "積碳填滿環槽會導致環無法自由移動，進而導致漏氣與磨損。"
    },
    {
        question: "船舶往復式空壓機紧急缺油時，可用哪種油品臨時替代？",
        options: ["汽缸油 (BN100)", "主機系統油 (SAE 30, 新油)", "齒輪油", "液壓油 (VG 32)"],
        answer: 1,
        explanation: "系統油黏度與清淨性與空壓機要求較為接近，是較佳的臨時替代選擇。"
    },
    {
        question: "白合金 (White Metal) 艉軸承通常採用哪種製程以獲取緻密組織？",
        options: ["手工焊接", "冷鍛", "離心鑄造 (Centrifugal Casting)", "3D 列印"],
        answer: 2,
        explanation: "離心力能有效排除氣泡與雜質，增強制承負載力。"
    },
    {
        question: "空氣密封系統 (Air Seal) 中的壓縮機空氣壓力通常維持在？",
        options: ["與海水壓力完全相等", "略高於外部海水壓力約 0.2 bar", "極高壓 (7 bar)", "真空狀態"],
        answer: 1,
        explanation: "維持微正壓可確保空氣主動向外逸出，防止海水進入。"
    },
    {
        question: "艉軸系統封印圈 (Seal Rings) 最常用的高性能材質為？",
        options: ["皮革", "鐵氟龍", "氟橡膠 (Viton)", "普通塑膠"],
        answer: 2,
        explanation: "氟橡膠耐熱、耐油且耐化學性優於普通丁腈橡膠 (NBR)。"
    },
    {
        question: "舵機液壓系統中，「氣穴現象」產生的氣泡破裂時，瞬間局部壓力可達？",
        options: ["10 bar", "100 bar", "數千 bar 甚至更高", "無壓力"],
        answer: 2,
        explanation: "微型氣泡崩塌產生的冲击力極強，會從金屬表面「啃」掉物質。"
    },
    {
        question: "MAN B&W 之 G 型引擎相較於 S 型引擎，主要的結構特徵是？",
        options: ["缸徑變更小", "更長的衝程 (Ultra Long Stroke) 與更低轉速", "轉速變快", "沒有區別"],
        answer: 1,
        explanation: "G 型代表超長衝程，可搭配更大直徑螺旋槳以提升效率，但也增加了潤滑挑戰。"
    },
    {
        question: "船舶離心分油機 (Purifier) 清除油中水分與重質雜質的原理是？",
        options: ["化學吸附", "比重差異與強大離心力", "加熱蒸發", "濾網攔截"],
        answer: 1,
        explanation: "利用數千倍重力加速度讓比重較大的水與渣快速分離。"
    },
    {
        question: "主機曲軸箱發生爆炸 (Crankcase Explosion) 的前兆通常是？",
        options: ["油色變黑", "產生大量油霧 (Oil Mist) 且遇到熱點", "溫度突然下降", "壓力表顯示負壓"],
        answer: 1,
        explanation: "油霧濃度達到爆炸極限且遇到過熱的軸承等熱點，即會發生劇烈燃燒。"
    },
    {
        question: "Everllence 2026 最新引擎趨勢中，對於氣缸油的要求是？",
        options: ["全面使用 BN 70", "必須具備處理低負荷 (Part Load) 與變動燃油的能力", "取消潤滑", "完全依賴基礎油"],
        answer: 1,
        explanation: "現代主機常態低負荷運轉，油品需加強清淨性防止環槽積碳。"
    },
    {
        question: "船舶配電盤使用的「乾式變壓器」不需潤滑油，但若為舊型油浸式，其專用油稱為？",
        options: ["液壓油", "絕緣油 (Transformer Oil)", "透平油", "齒輪油"],
        answer: 1,
        explanation: "絕緣油主要功能是電氣絕緣與冷卻散熱。"
    },
    {
        question: "填料箱 (Stuffing Box) 的殘油 (Drain Oil) 顏色異常變黑且含燃油味，代表？",
        options: ["汽缸油注油過多", "活塞桿密封環 (Scraper Rings) 損壞，燃燒產物下漏", "系統油壓力過高", "正常現象"],
        answer: 1,
        explanation: "密封環失效導致燃燒廢氣與碳渣穿過屏障污染系統油路。"
    },

    // --- 替代燃料與環保規範 (41-60) ---
    {
        question: "FuelEU Maritime 條例對於 2025 年後的溫室氣體強度限制，是以哪年為基準？",
        options: ["2008 年", "2020 年平均值", "2015 年", "無基準年"],
        answer: 1,
        explanation: "基準值是根據 2020 年監測報告數據建立的平均強度。"
    },
    {
        question: "使用 LNG 作為燃料的雙燃料引擎，其最大潤滑挑戰是？",
        options: ["油品變稀", "燃燒非常乾淨，導致氣缸油無法形成化學保護層 (需低灰分/低 BN)", "水分太多", "酸性太強"],
        answer: 1,
        explanation: "LNG 燃燒極乾乾淨，若使用高 BN 油會產生過多硬灰分沉積 (Ash Deposit)。"
    },
    {
        question: "WinGD X-DF 引擎使用哪種原理降低 NOx 排放以符合 Tier III？",
        options: ["後處理 SCR", "奧圖循環 (Otto Cycle/低壓進氣)", "加裝分油機", "提高燃燒壓力"],
        answer: 1,
        explanation: "X-DF 採用低壓燃氣噴射，預混燃燒溫度較低，天然產生較少 NOx。"
    },
    {
        question: "WinGD 的 iCER 技術是指？",
        options: ["智慧型冷却器", "低壓廢氣再循環 (LPEGR) 與控制系統", "噴油嘴優化", "海水淡化"],
        answer: 1,
        explanation: "iCER 透過循環冷卻後的廢氣來替代部分進氣，進一步降低甲烷逸散與油耗。"
    },
    {
        question: "甲醇 (Methanol) 燃料引擎在發生洩漏時，對人體的主要風險是？",
        options: ["腐蝕性", "毒性 (可能導致失明) 與不可見火焰", "高放射性", "極度刺鼻味"],
        answer: 1,
        explanation: "甲醇具有神經毒性，且燃燒火燄在白天幾乎肉眼不可見，需特殊感知器。"
    },
    {
        question: "使用甲醇燃油時，潤滑油必須具備哪種特殊性能？",
        options: ["完全不溶於甲醇", "與甲醇具備一定的乳化容忍能力，防止油膜瞬間失效", "必須是固態", "不需特殊性能"],
        answer: 1,
        explanation: "甲醇會稀釋油膜且吸水，油品需能應對潛在的甲醇污染。"
    },
    {
        question: "HVO 與 FAME 生質燃料的最大化學差異在於？",
        options: ["HVO 含氧，FAME 不含氧", "HVO 不含氧且具有極高穩定性，FAME 含氧且易氧化酸敗", "HVO 是固體", "沒有差異"],
        answer: 1,
        explanation: "HVO 經加氫處理，移除氧與不飽和鍵，是真正的「Drop-in」替代燃油。"
    },
    {
        question: "IMO NOx Tier III 規範與 Tier I 相比，排放量需減少約多少？",
        options: ["20%", "50%", "75% - 80%", "95%"],
        answer: 2,
        explanation: "從 Tier I 的 17.0 g/kWh 降至 Tier III 的 3.4 g/kWh (依轉速而定)。"
    },
    {
        question: "所謂「Well-to-Wake (WtW)」排放計算模型是指？",
        options: ["僅計算船上燃燒排放", "計算燃料從「開採、製造、運輸到終端燃燒」的全生命週期排放", "計算海浪阻力", "計算船體塗料排放"],
        answer: 1,
        explanation: "這是 FuelEU Maritime 採用的標準，旨在避免將排放轉移到燃料生產端。"
    },
    {
        question: "EGR 廢氣再循環技術中，為何需要「Scrubber」清洗廢氣？",
        options: ["增加氧氣", "去除粉塵與硫氧化物，防止氣缸磨損與腐蝕", "降低氣壓", "為了除臭"],
        answer: 1,
        explanation: "將廢氣引回汽缸前必須先冷卻與洗淨，否則會毀滅性地損壞零件。"
    },
    {
        question: "SCR 脫硝系統主要使用的還原劑通常是？",
        options: ["海水", "車用尿素溶液 (AdBlue/AUS32)", "滑油", "液化石油氣"],
        answer: 1,
        explanation: "尿素在高溫下分解成氨，與噴過催化劑的 NOx 反應生成氮氣與水。"
    },
    {
        question: "2024 年起，海運業納入 ETS (排放交易體系)，指的是哪地的政策？",
        options: ["美國", "中國", "歐盟 (EU)", "日本"],
        answer: 2,
        explanation: "歐盟 ETS 要求航運公司為每噸二氧化碳排放購買配額。"
    },
    {
        question: "生質燃料長期儲存最怕的污染物是？",
        options: ["氮氣", "水分與細菌 (易導致微生物滋生與酸敗)", "鐵粉", "二氧化碳"],
        answer: 1,
        explanation: "生質油含氧且結構具極性，易吸水並成為微生物滋生的溫床。"
    },
    {
        question: "未來能源「氨 (Ammonia)」作為燃料，主要是因為其具備？",
        options: ["高熱值", "零碳排放 (分子內不含碳)", "好聞的味道", "極低毒性"],
        answer: 1,
        explanation: "氨 (NH3) 燃燒不產生二氧化碳，是綠色航運的候選者，但具備強烈腐蝕與毒性。"
    },
    {
        question: "歐盟 FuelEU 條例中的「超合規配額」可以？",
        options: ["換成現金", "銀行化儲存 (Banking) 或借貸 (Borrowing) 給未來年份", "捐給慈善機構", "無法保存"],
        answer: 1,
        explanation: "制度具備彈性，允許表現好的年份為未來數年節省合規成本。"
    },
    {
        question: "使用氨燃料時，潤滑油面臨的最大挑戰是？",
        options: ["黏度增加", "強鹼性衝擊與燃燒副產物可能沉積 (需特殊抗腐蝕添加劑)", "價格太高", "沒挑戰"],
        answer: 1,
        explanation: "氨是鹼性的，會與潤滑油中的清淨劑發生複雜化學作用。"
    },
    {
        question: "生物潤滑油 (Biolubricants) 通常是指來源為？",
        options: ["回收廢油", "植物油、動物脂肪合成的酯類油", "天然氣合成油", "海水提煉油"],
        answer: 1,
        explanation: "具備高生物可分解性，適合環保敏感區使用。"
    },
    {
        question: "EGRBP 系統中，「BP」是指？",
        options: ["英國石油", "高壓 (High Pressure) 旁通迴路", "分層噴射", "自動清理"],
        answer: 1,
        explanation: "BP 代表 Bypass，用於更靈活控制廢氣流量。"
    },
    {
        question: "SCR 催化劑「中毒」的主要原因通常是？",
        options: ["溫度太高", "燃料中硫含量太高或潤滑油磷含量超標", "尿素加太多", "海水入侵"],
        answer: 1,
        explanation: "化學元素會附著於催化劑孔隙，使反應失去活性。"
    },
    {
        question: "哪種類型的船最迫切需要空氣密封面 (Air Seal) 以符合環保法規？",
        options: ["普通貨輪", "頻繁進出美國或受監管海域的船 (符合 VGP 零排放要求)", "內河船", "漁船"],
        answer: 1,
        explanation: "美國 VGP 要求若非空氣密封則必須使用昂貴的 EAL 油。"
    },

    // --- 維護、診斷與分析 (61-80) ---
    {
        question: "殘油分析中的「PQ-Index」數值特別高，但「鐵含量 (Fe)」一般，代表？",
        options: ["酸性腐蝕", "大尺寸鐵顆粒 (如剝落、磨損) 增加", "油品過熱", "水分太多"],
        answer: 1,
        explanation: "PQ 指數對鐵磁性物質重量敏感，反映較大的機械磨損顆粒。"
    },
    {
        question: "燃料油規範 ISO 8217 規定 Al+Si 含量是為了限制什麼？",
        options: ["硫氧化物", "觸媒微粒 (Cat-fines) 等研磨性顆粒", "燃油密度", "點火性能"],
        answer: 1,
        explanation: "觸媒微粒極度堅硬，會像砂紙一樣快速毀滅燃料泵與缸套。"
    },
    {
        question: "殘油中若發現大量「銅 (Copper)」金屬，通常來源於？",
        options: ["缸套磨損", "活塞環損壞", "活塞裙 (Piston Skirt) 的銅條磨損", "曲軸箱壁"],
        answer: 2,
        explanation: "活塞裙的引導銅條是主機殘油中銅的主要來源。"
    },
    {
        question: "油樣化驗中，「黏度 (Viscosity)」劇烈上升最常與哪個過程有關？",
        options: ["油品過濾太乾淨", "嚴重氧化與黑油泥生成", "燃油稀釋", "添加劑太少"],
        answer: 1,
        explanation: "氧化聚合反應會生成大分子，顯著增加流動阻力。"
    },
    {
        question: "用攜帶式 X 射線分析儀 (EDXRF) 檢測油樣，最大優勢是？",
        options: ["可以喝掉油樣", "即時獲得準確的元素分析數值，不需送實驗室", "比較便宜", "能看到細菌"],
        answer: 1,
        explanation: "現場診斷讓輪機員能根據結果立即調整注油率。"
    },
    {
        question: "齒輪箱分析報告顯示「鈉 (Sodium)」含量高，最可能的污染源是？",
        options: ["滑油老化", "海水滲漏 (含鹽 NaCl)", "磨損", "正常現象"],
        answer: 1,
        explanation: "鈉與氯是海水的特徵元素，代表冷卻器或密封失效。"
    },
    {
        question: "所謂的「基於狀態維護 (CBM)」是指？",
        options: ["壞了再修", "固定的定期更換", "根據感測器與油樣數據動態決定維修時機", "看心情維修"],
        answer: 2,
        explanation: "CBM 能最大化零件壽命並減少不必要的維修風險。"
    },
    {
        question: "用 Power BI 進行油樣管理的重點是？",
        options: ["畫漂亮的圖", "透過數據趨勢分析早期預警潛在失效", "存檔用", "給船東看而已"],
        answer: 1,
        explanation: "趨勢比單次數據更具備診斷價值。"
    },
    {
        question: "齒輪失效中「微點蝕 (Micropitting)」的典型外觀是？",
        options: ["巨大的深坑", "灰暗的磨砂狀感 (Frosting)", "長條刮痕", "斷裂"],
        answer: 1,
        explanation: "這是由於油膜厚度不足導致微觀表面的交變應力損壞。"
    },
    {
        question: "齒輪箱發生「膠合 (Scuffing)」的主要機制為何？",
        options: ["金屬過冷", "瞬時嚙合溫度過高導致油膜破裂發生金屬熔焊", "水分太多", "缺乏極壓劑"],
        answer: 1,
        explanation: "膠合是嚴重的突發性損壞，通常與超載或潤滑中斷有關。"
    },
    {
        question: "油品分析中的「TAN (總酸值)」增加代表？",
        options: ["油品變新鮮", "有機酸生成，代表油品發生氧化劣化", "添加劑增加", "鹼值上升"],
        answer: 1,
        explanation: "TAN 反映了油品被空氣與熱破壞的程度。"
    },
    {
        question: "微生物降解 (Microbial Degradation) 發生在油箱中，最典型的特徵是？",
        options: ["油色變透亮", "產生難聞臭味 (硫化氫) 與粘稠菌膜 (Biofilm)", "黏度下降", "溫度降低"],
        answer: 1,
        explanation: "細菌在油水介面代謝會產生腐蝕性酸與惡臭沉澱物。"
    },
    {
        question: "主機系統油變黑 (Black Oil) 主要是受到什麼污染？",
        options: ["水分", "燃燒殘渣 (不溶物) 穿過填料箱下漏", "新油", "鋁粉"],
        answer: 1,
        explanation: "碳渣是使油色變深的主要碳源。"
    },
    {
        question: "清潔油系統時進行「沖洗 (Flushing)」, 沖洗油的黏度建議？",
        options: ["越高越好", "比工作油稍低，以增加流速與沖刷效果", "必須完全一樣", "用海水即可"],
        answer: 1,
        explanation: "低黏度加高速循環能帶走沉積物。"
    },
    {
        question: "油樣採集應該在什麼狀態下進行？",
        options: ["停航且冷卻 24 小時後", "操作溫度且循環中的狀態 (取得代表性樣品)", "加新油後立即", "隨便挑時間"],
        answer: 1,
        explanation: "只有在機器運轉中採樣，才能捕捉到真實懸浮的污染物。"
    },
    {
        question: "汽缸殘油分析中，「釩 (Vanadium)」含量過高代表？",
        options: ["活塞環磨損", "燃油中的重金屬隨燃燒產物進入殘油 (代表燃油品質)", "注油率太低", "正常現象"],
        answer: 1,
        explanation: "釩是重油中的天然成分，可用來判斷是否有燃油污染油系統。"
    },
    {
        question: "分油機排渣異常頻繁，最可能的原因是？",
        options: ["油太乾淨", "燃油中含有大量水分或 Cat-fines", "分離盤太少", "溫度太高"],
        answer: 1,
        explanation: "污垢多導致分油機頻繁自動排渣。"
    },
    {
        question: "所謂「Bore Polishing (缸套拋光)」現象通常與什麼有關？",
        options: ["注油率太低", "注油率過高且 BN 過剩，導致鈣鹽積碳磨平缸套溝紋", "燃油壓力高", "活塞環太硬"],
        answer: 1,
        explanation: "拋光會導致缸套失去儲油能力，進而引發拉缸風險。"
    },
    {
        question: "EAL 環保油品在檢測時，除了常規指標外，應特別注意？",
        options: ["磷化氫", "總酸值 (TAN) 突發性增長 (代表水解風險)", "顏色", "閃火點"],
        answer: 1,
        explanation: "水解產生的酸會嚴重損壞密封件。"
    },
    {
        question: "診斷主機曲軸箱油中含有汽缸油的依據是發現？",
        options: ["鐵含量增加", "鋅 (Zinc) 含量下降且鈣 (Calcium) 異常增加", "水分增加", "銅增加"],
        answer: 1,
        explanation: "汽缸油含鈣量極高，混合後會稀釋系統油原有的添加劑成分。"
    },

    // --- 綜合應用與 Q&A (81-100) ---
    {
        question: "現在系統使用 A 品牌油，可以直接更換 B 品牌同類油嗎？",
        options: ["絕對不行", "只要滿足「同等級、同類別、相容性」且基礎油一致即可，若容量小建議全換", "可以直接混加沒關係", "要看價錢"],
        answer: 1,
        explanation: "雖然理論可相容，但基於風險管理，不同品牌添加劑配方不同，應謹慎進行。"
    },
    {
        question: "ISO VG 150 齒輪油沒庫存，紧急替代建議方案為何？",
        options: ["用 VG 100 替代", "改用 VG 220 替代 (保護設備為重，即便內度稍增)", "用海水代替", "空著等貨到了再開"],
        answer: 1,
        explanation: "寧可黏度稍高增加保護力，也不可黏度過低導致磨損。"
    },
    {
        question: "主機汽缸油 BN 40 與 BN 70 以 1:1 比例混合，生成的鹼值約為？",
        options: ["BN 40", "BN 55", "BN 70", "無法計算"],
        answer: 1,
        explanation: "同性質油品混合，鹼值大致呈現線性比例關係。"
    },
    {
        question: "「冷腐蝕」最容易在什麼操作模式下發生？",
        options: ["全速航行", "低速/慢速巡航 (Slow Steaming，氣缸溫度偏低)", "裝卸貨中", "停岸充電中"],
        answer: 1,
        explanation: "低負荷時氣缸壓力與溫度不足以維持在露點以上。"
    },
    {
        question: "MAN ES 提出的最新 Cat II 汽缸油規範，主要目的是為了？",
        options: ["更便宜", "應對 Tier III 引擎在高負荷操作下的清淨性需求", "減少油煙", "美觀"],
        answer: 1,
        explanation: "Cat II 油具備更好的清淨分散能力，防止氣缸產生沉積物。"
    },
    {
        question: "當冷媒從 R-22 改為環保冷媒 R-404A，潤滑油應該？",
        options: ["繼續用礦物油", "必須換成 POE 合成油", "不需更換", "用葵花油"],
        answer: 1,
        explanation: "環保冷媒不含氯，對極性有特殊需求。"
    },
    {
        question: "空氣密封系統 (Air Seal) 若出現排污箱排水頻率增加，代表？",
        options: ["系統很健康", "海水封印圈 (Seawater Seal Rings) 損毀", "壓縮空氣太乾", "沒問題"],
        answer: 1,
        explanation: "排除系統正常排油外，大量冷凝水代表外部密封失效。"
    },
    {
        question: "下列何者並非影響汽缸油中和能力的主要因素？",
        options: ["燃油硫含量", "注油率", "螺旋槳顏色", "引擎負荷"],
        answer: 2,
        explanation: "螺旋槳顏色與汽缸內的中和化學反應無關。"
    },
    {
        question: "目前市售「超高鹼值 (Ultra High BN)」汽缸油最高等級可達？",
        options: ["BN 70", "BN 100", "BN 140", "BN 500"],
        answer: 2,
        explanation: "應對極高硫燃油與嚴苛腐蝕環境，已開發出 BN 140 油品。"
    },
    {
        question: "潤滑油的「傾點 (Pour Point)」是指？",
        options: ["開始冒煙的溫度", "油品在規定條件下還能流動的最低溫度", "油品沸騰溫度", "油品閃火溫度"],
        answer: 1,
        explanation: "傾點反映了基礎油在低溫下的物理狀態極限。"
    },
    {
        question: "「SAE 50」與「SAE 30」之區分主要是以何時的黏度為準？",
        options: ["40°C", "100°C (引擎操作代表溫度)", "0°C", "常溫"],
        answer: 1,
        explanation: "SAE 規範以 100°C 的運動黏度作為主要分級依據。"
    },
    {
        question: "透平機 (TurboCharger) 因轉速極高，通常選用黏度較低的油品如？",
        options: ["ISO VG 220", "ISO VG 46 或 68", "SAE 50", "黃油"],
        answer: 1,
        explanation: "高轉速需低攪拌阻力與快速散熱能力。"
    },
    {
        question: "齒輪箱中的「呼吸器 (Breather)」失效堵塞會導致？",
        options: ["油品變香", "內部壓力升高，導致油封漏油", "轉速變慢", "沒影響"],
        answer: 1,
        explanation: "壓力無法釋放會強制推擠密封圈。"
    },
    {
        question: "「不溶物 (Insolubles)」數值高，代表燃油引擎中的？",
        options: ["水分太多", "燃燒不完全、濾清與分油系統效能不彰", "鋅含量不夠", "油品太貴"],
        answer: 1,
        explanation: "不溶物是碳渣、灰分與氧化副產物的集合體。"
    },
    {
        question: "SCR 系統操作中，若溫度低於規定值 (如 300°C 以下)，可能會導致？",
        options: ["發電增加", "硫酸銨沉積物生成導致催化劑堵塞損毀", "油表跳動", "魚類靠近"],
        answer: 1,
        explanation: "低溫下化學反應不完全會生成固態沉積物。"
    },
    {
        question: "所謂「零碳燃料」氫氣 (Hydrogen) 的潤滑挑戰主要是？",
        options: ["氫脆化與燃燒介面極高的熱負荷", "油品變香", "不需潤滑", "沒挑戰"],
        answer: 0,
        explanation: "氫氣會改變金屬性質且燃燒溫度極高。"
    },
    {
        question: "船舶裝設「洗滌塔 (Scrubber)」後，主機可以使用？",
        options: ["低硫燃油 (VLSFO)", "高硫燃油 (HSFO)", "液態氧", "原木"],
        answer: 1,
        explanation: "洗滌塔可用於去除廢氣中的硫，使合規性回歸燃後處理。"
    },
    {
        question: "對於老舊引擎，改用合成油 (PAO/Ester) 特別需要注意？",
        options: ["顏色變好看", "系統中老舊沉積物被分散溶解可能導致堵塞 (自潔效應)", "油太稀", "油太貴"],
        answer: 1,
        explanation: "合成油優異的溶解力會把積垢帶走，需加強監控濾器。"
    },
    {
        question: "「達人等級」需要在 10 題隨機測驗中答對幾題？",
        options: ["5 題", "7 題", "8 題以上", "10 題全錯"],
        answer: 2,
        explanation: "根據您的設定，8-10 題為達人等級獎勵稱號。"
    },
    {
        question: "本測驗「潤滑油達人挑戰」的目的是？",
        options: ["浪費時間", "寓教於樂並測試全站技術文章之理解程度", "考試用", "賺取獎金"],
        answer: 1,
        explanation: "希望透過互動方式加深讀者對潤滑與船舶工程知識的理解。"
    }
];

// ========== 2. 測驗控制變數 ==========
let activeQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
const SESSION_QUESTION_COUNT = 10; // 每次測驗 10 題

// ========== 3. 核心功能函數 ==========

/**
 * 隨機洗牌演算法 (Fisher-Yates)
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * 初始化測驗介面
 */
function initQuiz() {
    if (document.getElementById('quiz-trigger')) return;

    // 建立浮動觸發按鈕
    const trigger = document.createElement('button');
    trigger.id = 'quiz-trigger';
    trigger.innerHTML = '🎯 潤滑油達人挑戰';
    document.body.appendChild(trigger);

    // 建立測驗 Overlay
    const overlay = document.createElement('div');
    overlay.id = 'quiz-overlay';
    overlay.innerHTML = `
        <div id="quiz-container">
            <div class="quiz-header">
                <div>
                    <h3 style="margin:0; font-size: 1.4rem;">潤滑油達人挑戰 (隨機百題版)</h3>
                    <small style="opacity:0.8">數據庫: 100 題專業內容</small>
                </div>
                <button class="quiz-close">✕</button>
            </div>
            <div class="quiz-progress-container">
                <div class="quiz-progress-bar"></div>
            </div>
            <div class="quiz-body" id="quiz-main">
                <!-- 動態注入內容 -->
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    trigger.onclick = openQuiz;
    overlay.querySelector('.quiz-close').onclick = closeQuiz;
}

/**
 * 開啟測驗並重新抽題
 */
function openQuiz() {
    document.getElementById('quiz-overlay').classList.add('active');
    
    // 從題庫隨機抽取 10 題
    const shuffled = shuffleArray([...QUIZ_BANK]);
    activeQuestions = shuffled.slice(0, SESSION_QUESTION_COUNT);
    
    currentQuestionIndex = 0;
    score = 0;
    showQuestion();
}

function closeQuiz() {
    document.getElementById('quiz-overlay').classList.remove('active');
}

/**
 * 顯示當前題目
 */
function showQuestion() {
    const quizMain = document.getElementById('quiz-main');
    const questionData = activeQuestions[currentQuestionIndex];
    
    // 更新進度條
    const progressPercent = (currentQuestionIndex / SESSION_QUESTION_COUNT) * 100;
    document.querySelector('.quiz-progress-bar').style.width = `${progressPercent}%`;

    quizMain.innerHTML = `
        <div class="question-info">
            <span>領域: 全方位技術</span>
            <span>進度: ${currentQuestionIndex + 1} / ${SESSION_QUESTION_COUNT}</span>
        </div>
        <div id="quiz-question">${questionData.question}</div>
        <div class="quiz-options">
            ${questionData.options.map((opt, i) => `
                <button class="option-btn" onclick="checkAnswer(${i})">${opt}</button>
            `).join('')}
        </div>
        <div class="quiz-feedback" id="quiz-feedback" style="display:none;"></div>
    `;
    
    // 平滑捲動至頂部
    document.getElementById('quiz-container').scrollTop = 0;
}

/**
 * 檢查答案邏輯
 */
function checkAnswer(selectedIndex) {
    const questionData = activeQuestions[currentQuestionIndex];
    const feedback = document.getElementById('quiz-feedback');
    const options = document.querySelectorAll('.option-btn');
    
    // 禁用所有按鈕
    options.forEach(btn => btn.disabled = true);

    if (selectedIndex === questionData.answer) {
        score++;
        options[selectedIndex].classList.add('correct');
        feedback.innerHTML = `
            <div class="feedback-box success">
                <strong>✅ 答對了！</strong><br>
                ${questionData.explanation}
            </div>`;
    } else {
        options[selectedIndex].classList.add('wrong');
        options[questionData.answer].classList.add('correct');
        feedback.innerHTML = `
            <div class="feedback-box warning">
                <strong>❌ 答錯了。</strong><br>
                <span>正確答案：${questionData.options[questionData.answer]}</span><br>
                <p>${questionData.explanation}</p>
            </div>`;
    }
    
    feedback.style.display = 'block';

    // 延遲後進入下一題
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < SESSION_QUESTION_COUNT) {
            showQuestion();
        } else {
            showResult();
        }
    }, 4000); // 提供足夠時間閱讀解釋
}

/**
 * 顯示測驗結果與等級稱號
 */
function showResult() {
    const quizMain = document.getElementById('quiz-main');
    document.querySelector('.quiz-progress-bar').style.width = `100%`;
    
    let title = "";
    let color = "";
    let icon = "";
    let desc = "";

    if (score >= 8) {
        title = "達人等級 (Master)";
        color = "#e67e22";
        icon = "🏆";
        desc = "太厲害了！您對船舶潤滑與現代技術有著極其深刻的理解。";
    } else if (score >= 5) {
        title = "工程師等級 (Engineer)";
        color = "#16a085";
        icon = "⚙️";
        desc = "很專業！您已掌握大部分核心知識，足以應對實務上的潤滑管理。";
    } else {
        title = "再接再厲等級 (Keep it up)";
        color = "#7f8c8d";
        icon = "⚓";
        desc = "還有進步空間，建議多閱讀網站上的技術文章來充實自己。";
    }

    quizMain.innerHTML = `
        <div class="result-screen">
            <div class="result-icon">${icon}</div>
            <h2>測驗完成！</h2>
            <div class="final-score">
                您的得分: <span>${score}</span> / ${SESSION_QUESTION_COUNT}
            </div>
            <div class="title-badge" style="background: ${color}">
                ${title}
            </div>
            <p class="result-desc">${desc}</p>
            
            <div class="result-actions">
                <button class="cta-button primary" onclick="openQuiz()">重新挑戰 (隨機換題)</button>
                <button class="cta-button secondary" onclick="closeQuiz()">回首頁複習知識</button>
            </div>
        </div>
    `;
}

// ========== 4. 初始化執行 ==========
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuiz);
} else {
    initQuiz();
}
