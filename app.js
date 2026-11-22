const QUESTION_DATASET = [
  {
    id: "dsa-01",
    topic: "DSA",
    meta: "Time: O(log n) · Space: O(1)",
    question: "Why does Binary Search require random-access memory (arrays) rather than a singly linked list to achieve O(log n) time?",
    options: [
      "Linked lists cannot store sorted elements",
      "Finding the middle node in a linked list takes O(n) traversal",
      "Linked lists use non-contiguous heap allocation which breaks comparisons",
      "Recursion depth exceeds stack limits on linked lists"
    ],
    answer: 1,
    explanation: "Without O(1) index addressing, locating the midpoint at each step requires linear pointer traversal, degrading performance to O(n)."
  },
  {
    id: "os-01",
    topic: "OS",
    meta: "Concurrency · Deadlocks",
    question: "Which Coffman condition is broken if a system enforces a strict global ordering on mutex acquisition?",
    options: [
      "Mutual Exclusion",
      "Hold and Wait",
      "No Preemption",
      "Circular Wait"
    ],
    answer: 3,
    explanation: "Acquiring locks in a monotonically increasing order makes a dependency cycle mathematically impossible."
  },
  {
    id: "dbms-01",
    topic: "DBMS",
    meta: "Indexing · B+ Trees",
    question: "Why do relational databases prefer B+ Trees over standard Binary Search Trees for disk-based indexing?",
    options: [
      "B+ Trees have high fan-out, minimizing disk I/O block reads",
      "B+ Trees store data pointers at every internal node",
      "B+ Trees do not require rebalancing after deletions",
      "Binary Search Trees cannot handle duplicate keys"
    ],
    answer: 0,
    explanation: "High branching factor keeps tree height shallow (typically 3–4 levels for millions of rows), matching disk page sizes."
  },
  {
    id: "net-01",
    topic: "Networks",
    meta: "Transport Layer · TCP",
    question: "What problem does TCP's three-way handshake primarily prevent?",
    options: [
      "Packet sniffing on unencrypted links",
      "Duplicate delayed connection requests causing desynchronized sequence numbers",
      "DNS cache poisoning during domain resolution",
      "MAC address collisions on local subnets"
    ],
    answer: 1,
    explanation: "Synchronizing initial sequence numbers (ISNs) in both directions ensures stale duplicate SYN packets from old sessions are rejected."
  },
  {
    id: "dsa-02",
    topic: "DSA",
    meta: "Hashing · Collision Resolution",
    question: "In an open-addressed hash table using linear probing, what happens if an element is deleted without a tombstone marker?",
    options: [
      "Memory leaks occur in the bucket array",
      "Subsequent lookups for collided keys prematurely terminate at the empty slot",
      "The load factor automatically resets to zero",
      "Hash values become non-deterministic"
    ],
    answer: 1,
    explanation: "Probing stops when an empty slot is encountered; a tombstone signals that probing must continue past the deleted index."
  },
  {
    id: "os-02",
    topic: "OS",
    meta: "Virtual Memory · Paging",
    question: "What is the primary purpose of a Translation Lookaside Buffer (TLB)?",
    options: [
      "Cache recently translated virtual-to-physical page frame mappings",
      "Store dirty pages before flushing to swap space",
      "Encrypt kernel-space memory addresses",
      "Schedule I/O interrupts across CPU cores"
    ],
    answer: 0,
    explanation: "The TLB is a hardware associative cache inside the MMU that avoids extra memory lookups into multi-level page tables."
  }
];

const state = {
  activeTopic: "All",
  deck: [],
  index: 0,
  score: 0,
  streak: 0,
  maxStreak: 0,
  bestScore: Number(localStorage.getItem("recall_dev_best")) || 0,
  answered: false,
  history: []
};

const el = {
  streakVal: document.getElementById("streak-val"),
  scoreVal: document.getElementById("score-val"),
  bestVal: document.getElementById("best-val"),
  segmentedProgress: document.getElementById("segmented-progress"),
  studyPanel: document.getElementById("study-panel"),
  auditPanel: document.getElementById("audit-panel"),
  cardIndex: document.getElementById("card-index"),
  cardTopic: document.getElementById("card-topic"),
  questionTitle: document.getElementById("question-title"),
  optionsList: document.getElementById("options-list"),
  diagnosticDrawer: document.getElementById("diagnostic-drawer"),
  statusIndicator: document.getElementById("status-indicator"),
  complexityTag: document.getElementById("complexity-tag"),
  explanationText: document.getElementById("explanation-text"),
  nextBtn: document.getElementById("next-btn"),
  restartBtn: document.getElementById("restart-btn"),
  filterChips: document.querySelectorAll(".filter-chip"),
  auditScore: document.getElementById("audit-score"),
  auditAccuracy: document.getElementById("audit-accuracy"),
  auditStreak: document.getElementById("audit-streak"),
  auditVerdict: document.getElementById("audit-verdict"),
  auditLog: document.getElementById("audit-log")
};

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function startSession() {
  const filtered =
    state.activeTopic === "All"
      ? QUESTION_DATASET
      : QUESTION_DATASET.filter((q) => q.topic === state.activeTopic);

  state.deck = shuffle(filtered);
  state.index = 0;
  state.score = 0;
  state.streak = 0;
  state.maxStreak = 0;
  state.answered = false;
  state.history = [];

  el.bestVal.textContent = state.bestScore;
  el.auditPanel.classList.add("hidden");
  el.studyPanel.classList.remove("hidden");

  buildSegments();
  syncTelemetry();
  renderCard();
}

function buildSegments() {
  el.segmentedProgress.innerHTML = "";
  state.deck.forEach((_, idx) => {
    const seg = document.createElement("div");
    seg.className = "segment" + (idx === 0 ? " active" : "");
    el.segmentedProgress.appendChild(seg);
  });
}

function syncTelemetry() {
  el.scoreVal.textContent = state.score;
  el.streakVal.textContent = `${state.streak}x`;
}

function renderCard() {
  const current = state.deck[state.index];
  state.answered = false;

  el.diagnosticDrawer.classList.add("hidden");
  el.cardIndex.textContent = `${String(state.index + 1).padStart(2, "0")} / ${String(state.deck.length).padStart(2, "0")}`;
  el.cardTopic.textContent = current.topic;
  el.questionTitle.textContent = current.question;

  // Highlight active segment
  const segments = el.segmentedProgress.children;
  if (segments[state.index]) {
    segments[state.index].classList.add("active");
  }

  el.optionsList.innerHTML = "";
  current.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "option-row";
    btn.innerHTML = `
      <span class="option-left">
        <span class="key-box">${idx + 1}</span>
        <span>${opt}</span>
      </span>
      <span class="state-tag"></span>
    `;
    btn.addEventListener("click", () => evaluateAnswer(idx));
    el.optionsList.appendChild(btn);
  });
}

function evaluateAnswer(selectedIdx) {
  if (state.answered) return;
  state.answered = true;

  const current = state.deck[state.index];
  const isCorrect = selectedIdx === current.answer;
  const rows = el.optionsList.querySelectorAll(".option-row");
  const segments = el.segmentedProgress.children;

  rows.forEach((row, idx) => {
    row.disabled = true;
    const tag = row.querySelector(".state-tag");

    if (idx === current.answer) {
      row.classList.add("correct");
      tag.textContent = "CORRECT";
    } else if (idx === selectedIdx && !isCorrect) {
      row.classList.add("wrong");
      tag.textContent = "YOUR PICK";
    } else {
      row.classList.add("muted");
    }
  });

  if (isCorrect) {
    state.score += 1;
    state.streak += 1;
    state.maxStreak = Math.max(state.maxStreak, state.streak);
    segments[state.index].className = "segment done-correct";
  } else {
    state.streak = 0;
    segments[state.index].className = "segment done-wrong";
  }

  state.history.push({
    question: current.question,
    passed: isCorrect
  });

  syncTelemetry();

  // Populate diagnostic drawer
  el.statusIndicator.textContent = isCorrect ? "PASSED" : "FAILED";
  el.statusIndicator.className = "status-pill " + (isCorrect ? "pass" : "fail");
  el.complexityTag.textContent = current.meta;
  el.explanationText.textContent = current.explanation;
  el.nextBtn.innerHTML =
    state.index === state.deck.length - 1
      ? `View Audit <span class="arrow">→</span>`
      : `Next Card <span class="arrow">→</span>`;

  el.diagnosticDrawer.classList.remove("hidden");
}

function advanceDeck() {
  if (!state.answered) return;
  state.index += 1;

  if (state.index < state.deck.length) {
    renderCard();
  } else {
    renderAuditReport();
  }
}

function renderAuditReport() {
  const total = state.deck.length;
  const accuracy = Math.round((state.score / total) * 100);

  if (state.score > state.bestScore) {
    state.bestScore = state.score;
    localStorage.setItem("recall_dev_best", state.bestScore);
    el.bestVal.textContent = state.bestScore;
  }

  el.auditScore.textContent = `${state.score}/${total}`;
  el.auditAccuracy.textContent = `${accuracy}%`;
  el.auditStreak.textContent = `${state.maxStreak}x`;
  el.auditVerdict.textContent =
    accuracy >= 80
      ? "Interview-ready accuracy across selected CS modules."
      : "Review failed diagnostics below before your next run.";

  el.auditLog.innerHTML = "";
  state.history.forEach((entry) => {
    const li = document.createElement("li");
    li.className = "audit-row";
    li.innerHTML = `
      <span class="audit-q">${entry.question}</span>
      <span class="status-pill ${entry.passed ? "pass" : "fail"}">
        ${entry.passed ? "PASS" : "FAIL"}
      </span>
    `;
    el.auditLog.appendChild(li);
  });

el.studyPanel.classList.add("hidden");
el.auditPanel.classList.remove("hidden");
}
// Topic Filter Switching
el.filterChips.forEach((chip) => {
chip.addEventListener("click", () => {
el.filterChips.forEach((c) => c.classList.remove("active"));
chip.classList.add("active");
state.activeTopic = chip.dataset.topic;
startSession();
});
});
// Keyboard Shortcuts (1-4 to answer, Enter to advance)
document.addEventListener("keydown", (e) => {
if (el.studyPanel.classList.contains("hidden")) return;
const num = Number(e.key);
const current = state.deck[state.index];
if (!state.answered && num >= 1 && num <= current.options.length) {
evaluateAnswer(num - 1);
} else if (state.answered && e.key === "Enter") {
advanceDeck();
}
});
el.nextBtn.addEventListener("click", advanceDeck);
el.restartBtn.addEventListener("click", startSession);
startSession();