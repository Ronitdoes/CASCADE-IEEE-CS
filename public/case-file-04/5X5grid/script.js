import QRCode from "https://cdn.jsdelivr.net/npm/qrcode@1.4.4/+esm";

// ── STATE ──
let stage = "puzzle";
let secondsElapsed = 0;
let timerInterval = null;
let ticketFullImage = null;

let pieces = [];
let board = Array(25).fill(null);
let tray = [];
let selectedPieceId = null;

// ── AUDIO ──
function playBeep(freq = 600, duration = 0.08) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      ctx.currentTime + duration
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

// ── TIMER ──
function startTimer() {
  stopTimer();
  secondsElapsed = 0;
  updateTimerUI();

  timerInterval = setInterval(() => {
    secondsElapsed++;
    updateTimerUI();
  }, 1000);

  document.getElementById("nav-timer-container").classList.remove("hidden");
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
}

function formatTime(totalSecs) {
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;

  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

function updateTimerUI() {
  const timer = document.getElementById("timer-text");
  if (timer) timer.textContent = `⏰ ${formatTime(secondsElapsed)}`;
}

// ── GENERATE TICKET ──
async function generateTicketImage() {
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 600;

  const ctx = canvas.getContext("2d");

  const qrDataUrl = await QRCode.toDataURL("CAN YOU SEE ME?", {
    width: 260,
    margin: 1,
  });

  const qrImg = await new Promise((resolve) => {
    const img = new Image();
    img.src = qrDataUrl;
    img.onload = () => resolve(img);
  });

  ctx.fillStyle = "#1b0204";
  ctx.fillRect(0, 0, 600, 600);

  ctx.strokeStyle = "#dbac49";
  ctx.lineWidth = 5;
  ctx.strokeRect(20, 20, 560, 560);

  ctx.fillStyle = "#ffe4a0";
  ctx.font = "bold 42px serif";
  ctx.textAlign = "center";
  ctx.fillText("THE CARNIVAL", 300, 85);

  ctx.fillStyle = "#dbac49";
  ctx.fillRect(170, 170, 260, 260);

  ctx.fillStyle = "#fff";
  ctx.fillRect(175, 175, 250, 250);

  ctx.drawImage(qrImg, 175, 175, 250, 250);

  ctx.fillStyle = "#ffe4a0";
  ctx.font = "14px monospace";
  ctx.fillText("SERIAL NO. 06-23-2026", 300, 470);

  ticketFullImage = canvas.toDataURL("image/png");
  return ticketFullImage;
}

// ── INIT PUZZLE ──
async function initializePuzzle() {
  const imgUrl = await generateTicketImage();

  const img = new Image();
  img.src = imgUrl;

  img.onload = () => {
    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = 120;
    sliceCanvas.height = 120;
    const sctx = sliceCanvas.getContext("2d");

    pieces = [];

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        sctx.clearRect(0, 0, 120, 120);

        sctx.drawImage(
          img,
          c * 120,
          r * 120,
          120,
          120,
          0,
          0,
          120,
          120
        );

        pieces.push({
          id: r * 5 + c,
          dataUrl: sliceCanvas.toDataURL("image/png"),
        });
      }
    }

    tray = [...Array(25).keys()].sort(() => Math.random() - 0.5);
    board = Array(25).fill(null);

    renderPuzzle();
  };
}

// ── CHECK SOLVE ──
function checkSolved() {
  const topEdge = [1, 2, 3];
  const bottomEdge = [21, 22, 23];
  const leftEdge = [5, 10, 15];
  const rightEdge = [9, 14, 19];
  const corners = [0, 4, 20, 24];

  for (let i = 0; i < board.length; i++) {
    const piece = board[i];

    if (piece === null) return false;

    if (corners.includes(i)) {
      if (piece !== i) return false;
    } else if (topEdge.includes(i)) {
      if (!topEdge.includes(piece)) return false;
    } else if (bottomEdge.includes(i)) {
      if (!bottomEdge.includes(piece)) return false;
    } else if (leftEdge.includes(i)) {
      if (!leftEdge.includes(piece)) return false;
    } else if (rightEdge.includes(i)) {
      if (!rightEdge.includes(piece)) return false;
    } else {
      if (piece !== i) return false;
    }
  }

  return true;
}

// ── RENDER ──
function renderPuzzle() {
  const container = document.getElementById("puzzle-board-container");

  container.innerHTML = `
    <div class="flex flex-col items-center">

      <div class="flex gap-8 items-start">

        <!-- Board -->
        <div class="grid grid-cols-5 gap-2 w-[450px]">
          ${board
            .map((piece, i) => {
              const match =
                piece !== null ? pieces.find((p) => p.id === piece) : null;

              return `
                <div data-cell="${i}" 
                  class="w-[88px] h-[88px] border border-white/10 bg-zinc-900 cursor-pointer">
                  ${
                    match
                      ? `<img src="${match.dataUrl}" class="w-full h-full object-cover">`
                      : ""
                  }
                </div>
              `;
            })
            .join("")}
        </div>

        <!-- Tray -->
        <div class="grid grid-cols-5 gap-2 w-[450px]">
          ${tray
            .map((id) => {
              const piece = pieces.find((p) => p.id === id);

              return `
                <div data-tray="${id}" 
                  class="w-[88px] h-[88px] border border-red-500 cursor-pointer ${
                    selectedPieceId === id ? "ring-2 ring-white" : ""
                  }">
                  <img src="${piece.dataUrl}" class="w-full h-full object-cover">
                </div>
              `;
            })
            .join("")}
        </div>

      </div>

      <button
        id="btn-submit-puzzle"
        class="mt-10 px-10 py-4 bg-red-600 hover:bg-red-500 text-white font-mono text-lg rounded-md font-bold"
      >
        Submit
      </button>

    </div>
  `;

  // Select tray piece
  container.querySelectorAll("[data-tray]").forEach((el) => {
    el.addEventListener("click", () => {
      selectedPieceId = Number(el.dataset.tray);
      renderPuzzle();
    });
  });

  // Board interaction
  container.querySelectorAll("[data-cell]").forEach((el) => {
    el.addEventListener("click", () => {
      const index = Number(el.dataset.cell);

      if (selectedPieceId !== null) {
        if (board[index] !== null) {
          tray.push(board[index]);
        }

        board[index] = selectedPieceId;
        tray = tray.filter((x) => x !== selectedPieceId);
        selectedPieceId = null;
      } else {
        if (board[index] !== null) {
          tray.push(board[index]);
          board[index] = null;
        }
      }

      renderPuzzle();
    });
  });

  // Submit
  document
    .getElementById("btn-submit-puzzle")
    .addEventListener("click", () => {
      if (checkSolved()) {
        playBeep(900);
        goToStage("scanning");
      } else {
        playBeep(250);
      }
    });
}

// ── STAGES ──
function goToStage(target) {
  stage = target;

  document.getElementById("screen-puzzle").classList.add("hidden");
  document.getElementById("screen-scanning").classList.add("hidden");
  document.getElementById("screen-victory").classList.add("hidden");

  if (stage === "puzzle") {
    document.getElementById("screen-puzzle").classList.remove("hidden");
    startTimer();
    initializePuzzle();
  }

  if (stage === "scanning") {
    document.getElementById("screen-scanning").classList.remove("hidden");

    const container = document.getElementById("scanned-ticket-container");
    container.innerHTML = `
      <img src="${ticketFullImage}" class="w-full h-full object-contain rounded" />
    `;
  }

  if (stage === "victory") {
    stopTimer();

    document.getElementById("screen-victory").classList.remove("hidden");

    document.getElementById(
      "victory-team-badge"
    ).innerHTML = `✅ Sequence completed in <span class="text-red-500 font-bold">${formatTime(
      secondsElapsed
    )}</span>`;
  }
}

// ── VERIFY ──
document.getElementById("btn-verify").addEventListener("click", () => {
  const input = document
    .getElementById("word-input")
    .value.trim()
    .toUpperCase()
    .replace(/[?.,!"]/g, "")
    .replace(/\s+/g, "");

  if (input === "CANYOUSEEME") {
    playBeep(900);
    goToStage("victory");
  } else {
    playBeep(250);
    document.getElementById("scanning-error-hint").classList.remove("hidden");
  }
});

// ── ENTER KEY ──
document.getElementById("word-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    document.getElementById("btn-verify").click();
  }
});

// ── RESTART ──
document.getElementById("btn-restart").addEventListener("click", () => {
  playBeep(350);

  document.getElementById("word-input").value = "";
  document.getElementById("scanning-error-hint").classList.add("hidden");

  goToStage("puzzle");
});

// START
goToStage("puzzle");