// ==========================================================
// 1. Configuration
// ==========================================================

/** @type {string} API endpoint URL */
const CHAT_API_URL = "/api/chat";

/** @type {number} Max conversation history to send */
const MAX_HISTORY_LENGTH = 10;

/** @type {Array<string>} Quick action suggestions */
const QUICK_QUESTIONS = [
  "什麼是 BN 鹼值？",
  "如何選擇黏度？",
  "LNG 引擎潤滑",
  "汽缸殘油化驗",
];

// ==========================================================
// 2. State
// ==========================================================

/** @type {Array<{role: string, content: string}>} Chat history */
let chatHistory = [];

/** @type {boolean} Whether chat is currently processing */
let isProcessing = false;

// ==========================================================
// 3. DOM Initialization
// ==========================================================

/**
 * Initialize the chatbot UI and event listeners
 */
function initChatbot() {
  // Detect image base path (sub-pages use ../images/, index uses images/)
  const existingLogo = document.querySelector('img[src*="mark_small"]');
  const imgPath = existingLogo ? existingLogo.src.replace(/mark_small\.png.*/, 'mark_small.png') : 'images/mark_small.png';

  // Inject chatbot HTML structure
  const chatbotHtml = `
    <button class="chatbot-fab" id="chatbotFab" aria-label="開啟 AI 助理">
      <img class="chatbot-fab-img" src="${imgPath}" alt="AI 助理">
      <span class="chatbot-fab-label">AI 助理</span>
      <div class="chatbot-fab-close">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </div>
    </button>

    <div class="chatbot-window" id="chatbotWindow">
      <div class="chatbot-header">
        <div class="chatbot-header-avatar">🛢️</div>
        <div class="chatbot-header-info">
          <h3>潤滑油 AI 助理</h3>
          <p>基於網站知識庫回答您的問題</p>
        </div>
      </div>

      <div class="chatbot-messages" id="chatbotMessages">
        <div class="chatbot-welcome">
          <div class="chatbot-welcome-icon">🤖</div>
          <h4>歡迎使用 AI 助理！</h4>
          <p>我可以回答關於潤滑油技術、船舶引擎潤滑、油品化驗分析等問題。請隨時提問！</p>
        </div>
        <div class="chatbot-quick-btns" id="chatbotQuickBtns"></div>
      </div>

      <div class="chatbot-input-area">
        <textarea
          class="chatbot-input"
          id="chatbotInput"
          placeholder="輸入您的問題..."
          rows="1"
        ></textarea>
        <button class="chatbot-send-btn" id="chatbotSendBtn" aria-label="送出">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", chatbotHtml);

  // Bind events
  bindEvents();

  // Render quick action buttons
  renderQuickButtons();
}

// ==========================================================
// 4. Event Binding
// ==========================================================

/**
 * Bind all chatbot event listeners
 */
function bindEvents() {
  const fab = document.getElementById("chatbotFab");
  const sendBtn = document.getElementById("chatbotSendBtn");
  const input = document.getElementById("chatbotInput");

  // Toggle chat window
  fab.addEventListener("click", toggleChatWindow);

  // Send message
  sendBtn.addEventListener("click", handleSendMessage);

  // Enter key to send (Shift+Enter for new line)
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  // Auto-resize textarea
  input.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 100) + "px";
  });
}

/**
 * Toggle the chat window open/closed
 */
function toggleChatWindow() {
  const fab = document.getElementById("chatbotFab");
  const chatWindow = document.getElementById("chatbotWindow");

  fab.classList.toggle("active");
  chatWindow.classList.toggle("open");

  // Focus input when opening
  if (chatWindow.classList.contains("open")) {
    setTimeout(() => {
      document.getElementById("chatbotInput").focus();
    }, 300);
  }
}

// ==========================================================
// 5. Quick Action Buttons
// ==========================================================

/**
 * Render quick suggestion buttons
 */
function renderQuickButtons() {
  const container = document.getElementById("chatbotQuickBtns");
  QUICK_QUESTIONS.forEach((question) => {
    const btn = document.createElement("button");
    btn.className = "chatbot-quick-btn";
    btn.textContent = question;
    btn.addEventListener("click", function () {
      document.getElementById("chatbotInput").value = question;
      handleSendMessage();
    });
    container.appendChild(btn);
  });
}

// ==========================================================
// 6. Message Handling
// ==========================================================

/**
 * Handle sending a message from the user
 */
async function handleSendMessage() {
  if (isProcessing) return;

  const input = document.getElementById("chatbotInput");
  const message = input.value.trim();
  if (!message) return;

  // Clear input
  input.value = "";
  input.style.height = "auto";

  // Hide welcome & quick buttons on first message
  hideWelcome();

  // Display user message
  appendMessage("user", message);

  // Add to history
  chatHistory.push({ role: "user", content: message });

  // Show typing indicator
  showTypingIndicator();
  isProcessing = true;
  updateSendButton(true);

  try {
    const response = await sendToAPI(message);
    hideTypingIndicator();

    if (response.success) {
      appendMessage("bot", response.reply);
      chatHistory.push({ role: "assistant", content: response.reply });
    } else {
      appendMessage(
        "bot",
        "⚠️ 抱歉，我暫時無法回應。請稍後再試。"
      );
    }
  } catch (error) {
    hideTypingIndicator();
    appendMessage(
      "bot",
      "❌ 連線失敗，請檢查網路連線後再試。"
    );
    console.error("Chatbot error:", error);
  } finally {
    isProcessing = false;
    updateSendButton(false);
  }

  // Trim history if too long
  if (chatHistory.length > MAX_HISTORY_LENGTH * 2) {
    chatHistory = chatHistory.slice(-MAX_HISTORY_LENGTH * 2);
  }
}

/**
 * Send message to the API
 * @param {string} message - User message
 * @returns {Promise<{reply: string, success: boolean}>}
 */
async function sendToAPI(message) {
  const recentHistory = chatHistory.slice(
    -(MAX_HISTORY_LENGTH * 2 - 1)
  );

  const response = await fetch(CHAT_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: message,
      history: recentHistory.slice(0, -1), // Exclude current message
    }),
  });

  if (!response.ok) {
    throw new Error(`API responded with status ${response.status}`);
  }

  return await response.json();
}

// ==========================================================
// 7. UI Rendering
// ==========================================================

/**
 * Append a message bubble to the messages area
 * @param {string} role - "user" or "bot"
 * @param {string} content - Message content (supports markdown for bot)
 */
function appendMessage(role, content) {
  const messagesContainer = document.getElementById("chatbotMessages");

  const msgDiv = document.createElement("div");
  msgDiv.className = `chatbot-msg ${role}`;

  const avatar = document.createElement("div");
  avatar.className = "chatbot-msg-avatar";
  avatar.textContent = role === "bot" ? "🛢️" : "👤";

  const bubble = document.createElement("div");
  bubble.className = "chatbot-msg-bubble";

  if (role === "bot") {
    bubble.innerHTML = renderMarkdown(content);
  } else {
    bubble.textContent = content;
  }

  msgDiv.appendChild(avatar);
  msgDiv.appendChild(bubble);
  messagesContainer.appendChild(msgDiv);

  // Scroll to bottom
  scrollToBottom();
}

/**
 * Simple markdown renderer for bot messages
 * @param {string} text - Raw markdown text
 * @returns {string} HTML string
 */
function renderMarkdown(text) {
  let html = text;

  // Escape HTML
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headers
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Bold & italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Links [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Unordered lists
  html = html.replace(
    /^- (.+)$/gm,
    "<li>$1</li>"
  );
  html = html.replace(
    /(<li>.*<\/li>\n?)+/g,
    function (match) {
      return "<ul>" + match + "</ul>";
    }
  );

  // Ordered lists
  html = html.replace(
    /^\d+\. (.+)$/gm,
    "<li>$1</li>"
  );

  // Paragraphs (double newline)
  html = html.replace(/\n\n/g, "</p><p>");
  html = "<p>" + html + "</p>";

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, "");
  html = html.replace(/<p>(<h[1-3]>)/g, "$1");
  html = html.replace(/(<\/h[1-3]>)<\/p>/g, "$1");
  html = html.replace(/<p>(<ul>)/g, "$1");
  html = html.replace(/(<\/ul>)<\/p>/g, "$1");

  return html;
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
  const messagesContainer = document.getElementById("chatbotMessages");

  const typingDiv = document.createElement("div");
  typingDiv.className = "chatbot-typing";
  typingDiv.id = "chatbotTyping";

  typingDiv.innerHTML = `
    <div class="chatbot-msg-avatar">🛢️</div>
    <div class="chatbot-typing-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;

  messagesContainer.appendChild(typingDiv);
  scrollToBottom();
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
  const typing = document.getElementById("chatbotTyping");
  if (typing) {
    typing.remove();
  }
}

/**
 * Hide welcome message and quick buttons
 */
function hideWelcome() {
  const welcome = document.querySelector(".chatbot-welcome");
  const quickBtns = document.getElementById("chatbotQuickBtns");
  if (welcome) welcome.remove();
  if (quickBtns) quickBtns.remove();
}

/**
 * Scroll messages container to bottom
 */
function scrollToBottom() {
  const container = document.getElementById("chatbotMessages");
  requestAnimationFrame(() => {
    container.scrollTop = container.scrollHeight;
  });
}

/**
 * Update send button disabled state
 * @param {boolean} disabled
 */
function updateSendButton(disabled) {
  document.getElementById("chatbotSendBtn").disabled = disabled;
}

// ==========================================================
// 8. Auto-Init on DOM Ready
// ==========================================================

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initChatbot);
} else {
  initChatbot();
}
