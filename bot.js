(() => {
  const STORE_KEY = "hieldt-rodrick-chat-v1";
  const chat = document.getElementById("chat");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("messageInput");
  const typingRow = document.getElementById("typingRow");
  const clearChat = document.getElementById("clearChat");
  const clearDialog = document.getElementById("clearDialog");
  const confirmClear = document.getElementById("confirmClear");
  const bank = window.HIYOCE_RESPONSES;
  let history = [];
  let lastCategory = "fallback";
  let replyCounter = 0;

  const now = () => new Date();
  const timeLabel = (date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateLabel = (date) => date.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  document.getElementById("dateChip").textContent = dateLabel(now());

  function normalize(str) {
    return String(str || "").toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[’‘]/g, "'")
      .replace(/[^a-z0-9\s']/g, " ")
      .replace(/\s+/g, " ").trim();
  }

  function detectCategory(message) {
    const text = normalize(message);
    const priority = ["reassurance", "sad", "missing", "affection", "routine", "teasing", "everyday"];
    for (const category of priority) {
      const keys = bank[category].keywords;
      if (keys.some(keyword => {
        const k = normalize(keyword);
        if (!k) return false;
        // Phrase matching avoids matching tiny fragments inside unrelated words.
        return (` ${text} `).includes(` ${k} `) || text === k;
      })) return category;
    }
    // Small contextual bridge for a follow-up message.
    if (lastCategory !== "fallback" && history.slice(-4).some(m => m.role === "user")) {
      if (text.split(" ").length <= 5) return lastCategory;
    }
    return "fallback";
  }

  function makeElement(message) {
    const wrap = document.createElement("div");
    wrap.className = `message ${message.role === "user" ? "user" : "bot"}`;
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = message.text;
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = timeLabel(new Date(message.time));
    wrap.append(bubble, meta);
    chat.appendChild(wrap);
  }

  function renderHistory() {
    chat.querySelectorAll(".message").forEach(el => el.remove());
    history.forEach(makeElement);
    chat.scrollTop = chat.scrollHeight;
  }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(history)); }
    catch (e) { /* The chat still works for this open tab if storage is unavailable. */ }
  }

  function addMessage(role, text) {
    const message = { role, text, time: now().toISOString() };
    history.push(message);
    makeElement(message);
    save();
    chat.scrollTop = chat.scrollHeight;
  }

  function chooseReply(category) {
    const replies = bank[category]?.replies || bank.fallback.replies;
    let index = Math.floor(Math.random() * replies.length);
    if (replies.length > 1 && index === replyCounter % replies.length) index = (index + 1) % replies.length;
    replyCounter++;
    return replies[index];
  }

  function showTyping() {
    typingRow.hidden = false;
    chat.scrollTop = chat.scrollHeight;
  }
  function hideTyping() { typingRow.hidden = true; }

  function sendUserMessage(text) {
    addMessage("user", text);
    const category = detectCategory(text);
    if (category !== "fallback") lastCategory = category;
    showTyping();
    const delay = Math.min(1550, Math.max(550, 420 + text.length * 13));
    window.setTimeout(() => {
      hideTyping();
      addMessage("bot", chooseReply(category));
    }, delay);
  }

  function firstGreeting() {
    const hour = now().getHours();
    let pool;
    if (hour >= 4 && hour < 11) pool = [
      "good morning, bebe. did you sleep well? come tell me how you're feeling today.",
      "morning, mbul. take your time waking up; i'm here if you wanna talk.",
      "good morning, sayang. what's the first thing on your mind today?"
    ];
    else if (hour >= 11 && hour < 17) pool = [
      "hii, bebe. how's your day going so far? tell me anything, even the little stuff.",
      "hey, mbul. have you eaten yet? come tell me about your day.",
      "hello, sayang. taking a little break? i'm listening."
    ];
    else pool = [
      "hey, bebe. how was your day? you can tell me the good parts and the messy ones.",
      "hi, mbul. it's okay if today was a lot. wanna talk for a bit?",
      "hello, sayang. you're welcome to leave a little story here before the day ends."
    ];
    addMessage("bot", pool[Math.floor(Math.random() * pool.length)]);
  }

  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) history = parsed.filter(m => m && ["user", "bot"].includes(m.role) && typeof m.text === "string");
    }
  } catch (e) { history = []; }

  if (history.length) renderHistory();
  else firstGreeting();

  form.addEventListener("submit", event => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    sendUserMessage(text);
    input.focus();
  });

  clearChat.addEventListener("click", () => {
    if (typeof clearDialog.showModal === "function") clearDialog.showModal();
    else if (window.confirm("Clear all messages saved in this browser?")) clearHistory();
  });

  function clearHistory() {
    history = [];
    lastCategory = "fallback";
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    chat.querySelectorAll(".message").forEach(el => el.remove());
    firstGreeting();
  }

  confirmClear.addEventListener("click", event => {
    // Let the dialog close naturally, then clear after confirmation.
    event.preventDefault();
    clearDialog.close("clear");
    clearHistory();
  });
})();