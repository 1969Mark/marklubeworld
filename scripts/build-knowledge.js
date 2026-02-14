// ==========================================================
// 1. 模組引入與常量定義
// ==========================================================
const fs = require('fs');
const path = require('path');

/** @type {Object} 設定常量 */
const CONFIG = {
  LINKS_DIR: path.join(__dirname, '..', 'links'),
  INDEX_FILE: path.join(__dirname, '..', 'index.html'),
  OUTPUT_FILE: path.join(__dirname, '..', 'knowledge_base.json'),
  ENCODING: 'utf-8'
};

/**
 * 文章分類映射表
 * @type {Map<string, string>}
 */
const CATEGORY_MAP = new Map([
  ['lube_organic_chemistry', '一般潤滑油'],
  ['compressor_maintenance', '一般潤滑油'],
  ['hydraulic_system', '一般潤滑油'],
  ['gearbox_lubrication', '一般潤滑油'],
  ['refrigerant_lubricant', '一般潤滑油'],
  ['organic', '一般潤滑油'],
  ['basic_viscosity', '一般潤滑油'],
  ['baseoil_additives', '一般潤滑油'],
  ['testkit_xray', '一般潤滑油'],
  ['cimac_usedoilanalysis', '一般潤滑油'],
  ['qands', '一般潤滑油'],
  ['usedoil_pbi', '一般潤滑油'],
  ['biofuels', '船舶潤滑油'],
  ['egrbp_deposit', '船舶潤滑油'],
  ['lng_ash_control', '船舶潤滑油'],
  ['methanol_ethanol', '船舶潤滑油'],
  ['microbial_degradation', '船舶潤滑油'],
  ['methanol_vs_lng', '船舶潤滑油'],
  ['wingd_methanol', '船舶潤滑油'],
  ['lng_methanol_lubrication', '船舶潤滑油'],
  ['lng_engine_wear', '船舶潤滑油'],
  ['sl2025_776', '船舶潤滑油'],
  ['sl', '船舶潤滑油'],
  ['bn', '船舶潤滑油'],
  ['sl2023_738', '船舶潤滑油'],
  ['port_inspection', '船舶潤滑油'],
  ['dos', '船舶潤滑油'],
  ['egr', '船舶潤滑油'],
  ['bnperformance', '船舶潤滑油'],
  ['stern_tube', '機械設備'],
  ['everllence_engine', '機械設備']
]);

// ==========================================================
// 2. HTML 內容提取函數
// ==========================================================

/**
 * 移除 HTML 標籤，保留純文字內容
 * @param {string} html - 原始 HTML 字串
 * @returns {string} 純文字內容
 */
function stripHtmlTags(html) {
  // 移除 script 和 style 區塊
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');

  // 移除 header/nav 區塊（避免提取導航列文字）
  text = text.replace(/<header[\s\S]*?<\/header>/gi, '');

  // 移除 footer 區塊
  text = text.replace(/<footer[\s\S]*?<\/footer>/gi, '');

  // 將特定 HTML 元素轉為結構化文字
  text = text.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n## $1\n');
  text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n');
  text = text.replace(/<\/div>/gi, '\n');
  text = text.replace(/<\/tr>/gi, '\n');
  text = text.replace(/<td[^>]*>(.*?)<\/td>/gi, '$1 | ');
  text = text.replace(/<th[^>]*>(.*?)<\/th>/gi, '$1 | ');
  text = text.replace(/<figcaption[^>]*>(.*?)<\/figcaption>/gi, '[圖片說明: $1]\n');
  text = text.replace(/<sub>(.*?)<\/sub>/gi, '($1)');
  text = text.replace(/<sup>(.*?)<\/sup>/gi, '^$1');
  text = text.replace(/<strong>(.*?)<\/strong>/gi, '$1');
  text = text.replace(/<em>(.*?)<\/em>/gi, '$1');
  text = text.replace(/<dt[^>]*>(.*?)<\/dt>/gi, '\n**$1**\n');
  text = text.replace(/<dd[^>]*>(.*?)<\/dd>/gi, '  $1\n');

  // 移除所有剩餘 HTML 標籤
  text = text.replace(/<[^>]+>/g, '');

  // 解碼 HTML 實體
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&copy;/g, '©');
  text = text.replace(/&ndash;/g, '–');
  text = text.replace(/&mdash;/g, '—');

  // 清理多餘空白行與空格
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n\s*\n\s*\n/g, '\n\n');
  text = text.trim();

  return text;
}

/**
 * 從 HTML 中提取 <title> 內容
 * @param {string} html - HTML 字串
 * @returns {string} 頁面標題
 */
function extractTitle(html) {
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  if (titleMatch) {
    return titleMatch[1].trim();
  }

  // 備選：提取第一個 h1
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (h1Match) {
    return h1Match[1].replace(/<[^>]+>/g, '').trim();
  }

  return '未知標題';
}

/**
 * 從 HTML 中提取 <main> 區塊的內容
 * @param {string} html - HTML 字串
 * @returns {string} main 區塊的 HTML
 */
function extractMainContent(html) {
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) {
    return mainMatch[1];
  }

  // 備選：提取 body 區塊（移除 head）
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    return bodyMatch[1];
  }

  return html;
}

// ==========================================================
// 3. 知識庫建構主函數
// ==========================================================

/**
 * 處理單一 HTML 檔案，轉為知識庫條目
 * @param {string} filePath - HTML 檔案完整路徑
 * @returns {Object} 知識庫條目
 */
function processHtmlFile(filePath) {
  const html = fs.readFileSync(filePath, CONFIG.ENCODING);
  const fileName = path.basename(filePath, '.html');
  const title = extractTitle(html);
  const mainHtml = extractMainContent(html);
  const content = stripHtmlTags(mainHtml);
  const category = CATEGORY_MAP.get(fileName) || '其他';

  return {
    title,
    url: `/links/${path.basename(filePath)}`,
    category,
    content
  };
}

/**
 * 提取首頁「關於本站」區塊的文字內容
 * @returns {Object} 首頁知識庫條目
 */
function processIndexPage() {
  const html = fs.readFileSync(CONFIG.INDEX_FILE, CONFIG.ENCODING);
  const aboutMatch = html.match(/<section id="about">([\s\S]*?)<\/section>/i);
  const aboutContent = aboutMatch ? stripHtmlTags(aboutMatch[1]) : '';

  return {
    title: '馬克的潤滑油世界 - 關於本站',
    url: '/',
    category: '關於本站',
    content: aboutContent
  };
}

/**
 * 建構完整知識庫
 */
function buildKnowledgeBase() {
  console.log('🔧 開始建構知識庫...\n');

  const knowledgeBase = [];

  // 處理首頁
  knowledgeBase.push(processIndexPage());
  console.log('✅ 已處理：首頁（關於本站）');

  // 處理所有子頁面
  const htmlFiles = fs.readdirSync(CONFIG.LINKS_DIR)
    .filter(file => file.endsWith('.html'));

  for (const file of htmlFiles) {
    const filePath = path.join(CONFIG.LINKS_DIR, file);
    const entry = processHtmlFile(filePath);
    knowledgeBase.push(entry);
    console.log(`✅ 已處理：${entry.title}（${entry.category}）`);
  }

  // 寫入 JSON 檔案
  const output = JSON.stringify(knowledgeBase, null, 2);
  fs.writeFileSync(CONFIG.OUTPUT_FILE, output, CONFIG.ENCODING);

  // 統計資訊
  const totalChars = knowledgeBase.reduce((sum, entry) => sum + entry.content.length, 0);
  console.log(`\n📊 知識庫建構完成！`);
  console.log(`   📄 文章數量：${knowledgeBase.length}`);
  console.log(`   📝 總字數：${totalChars.toLocaleString()}`);
  console.log(`   💾 輸出檔案：${CONFIG.OUTPUT_FILE}`);
  console.log(`   📦 檔案大小：${(Buffer.byteLength(output) / 1024).toFixed(1)} KB`);
}

// ==========================================================
// 4. 執行
// ==========================================================
buildKnowledgeBase();
