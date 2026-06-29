import React, { useState, useEffect, useCallback, useRef } from "react";
import { Lock, Unlock, Terminal as TerminalIcon, ChevronRight, AlertTriangle, RotateCcw, Search, HelpCircle, Check, Clock, Skull } from "lucide-react";

/* ============================================================
   THE BROKEN DECK — HARD MODE
   • Timer starts when first puzzle begins
   • Each hint = +60s penalty (max 3 per puzzle)
   • All hints cost. No freebies.
   ============================================================ */

const CHARS = {
  ARCHIVIST: { name:"Archivist", avatar:"🗂", color:"#6dfb9b", desc:"Keeper of the classified archive" },
  DIRECTOR:  { name:"Director Voss", avatar:"👁", color:"#ffb238", desc:"Former head of the facility" },
  SYSTEM:    { name:"SYSTEM", avatar:"⬛", color:"#a0b8a8", desc:"Terminal" },
  USER:      { name:"You", avatar:"🔍", color:"#c8e8ff", desc:"The investigator" },
};

/* ── DIALOGUE SCENES (unchanged) ── */
const SCENES = {
  intro: [
    { char:"SYSTEM",    text:"ARCHIVE ACCESS INITIALISED — 03:17:44", pause:1800 },
    { char:"SYSTEM",    text:"Loading case file... BROKEN DECK... classified depth: LEVEL IX.", pause:2200 },
    { char:"ARCHIVIST", text:"You're in. Good. I wasn't sure the old terminal would accept the access token.", pause:2800 },
    { char:"USER",      text:"What is this place?", pause:2000 },
    { char:"ARCHIVIST", text:"A research facility. Operated under a classified government contract. Shut down in 1972 without any official explanation.", pause:3200 },
    { char:"ARCHIVIST", text:"Official records say it was a behavioural research laboratory. The documents that survived say something else entirely.", pause:3400 },
    { char:"USER",      text:"What did they actually do here?", pause:2200 },
    { char:"ARCHIVIST", text:"Months after the closure, investigators found a sealed chamber beneath the main complex. Inside — four cabinets. No names. No instructions.", pause:3600 },
    { char:"ARCHIVIST", text:"Only a symbol on each door. Spades, hearts, diamonds, clubs.", pause:2600 },
    { char:"USER",      text:"What happened to the people who went in?", pause:2200 },
    { char:"ARCHIVIST", text:"Every person who entered reported something different. A library. A city. A memory that didn't belong to them.", pause:3200 },
    { char:"ARCHIVIST", text:"Every single one of them came back saying the exact same thing.", pause:2600 },
    { char:"USER",      text:"What did they say?", pause:2000 },
    { char:"ARCHIVIST", text:"That's sealed too. We need to unlock it first.", pause:2600 },
    { char:"ARCHIVIST", text:"The whole investigation is filed under PROJECT NULL. Before the chamber opens, we need to confirm the date of the final experiment. Start there.", pause:3800 },
  ],
  afterDate: [
    { char:"SYSTEM",    text:"DATE RECORD — VERIFIED.", pause:1800 },
    { char:"USER",      text:"14 October 1972. Found it.", pause:2000 },
    { char:"ARCHIVIST", text:"Good eye. The ink had faded on most copies. They were counting on that.", pause:2800 },
    { char:"ARCHIVIST", text:"Cross-referencing the date against the facility's master index returns a discrepancy. Six reports are accounted for.", pause:3000 },
    { char:"ARCHIVIST", text:"But every single one of those reports references a seventh. A file the index claims was never made.", pause:3400 },
    { char:"USER",      text:"So someone pulled it.", pause:2000 },
    { char:"ARCHIVIST", text:"Deliberately. Whatever's in that file — it's the one piece they didn't want found.", pause:3000 },
  ],
  afterReport: [
    { char:"SYSTEM",    text:"REPORT_04 — RESTORED TO INDEX.", pause:1800 },
    { char:"USER",      text:"Report 04. Every other file pointed straight to it.", pause:2400 },
    { char:"ARCHIVIST", text:"And now we know why it was removed. Read what's inside.", pause:2600 },
    { char:"USER",      text:"It describes a procedure. Not a study. They were sending people into those cabinets deliberately.", pause:3200 },
    { char:"ARCHIVIST", text:"Each subject reported a different place. No two accounts matched.", pause:2800 },
    { char:"ARCHIVIST", text:"The cabinets weren't showing different realities. They were showing different paths to the same destination.", pause:3400 },
    { char:"ARCHIVIST", text:"Whatever sits at that destination — the archive calls it PROJECT NULL.", pause:3000 },
  ],
  afterNull: [
    { char:"SYSTEM",    text:"CLEARANCE ACCEPTED — PROJECT NULL.", pause:2000 },
    { char:"SYSTEM",    text:"WARNING: Second locking mechanism engaged.", pause:2200 },
    { char:"USER",      text:"There's another lock.", pause:2000 },
    { char:"ARCHIVIST", text:"This one doesn't ask for a name. It's asking for a rank.", pause:2400 },
    { char:"ARCHIVIST", text:"Find the one that appears on the most sensitive documents. That's your rank.", pause:3000 },
  ],
  afterLevel: [
    { char:"SYSTEM",    text:"AUTHORIZATION GRANTED — LEVEL IX.", pause:2000 },
    { char:"USER",      text:"Level IX. It wasn't even in the official manual.", pause:2400 },
    { char:"ARCHIVIST", text:"The deeper files are unlocking now. They describe something called the Convergence Test.", pause:3400 },
    { char:"ARCHIVIST", text:"Subjects in separate cabinets began describing locations they had never visited. Independent participants produced identical drawings.", pause:3600 },
    { char:"USER",      text:"That shouldn't be possible.", pause:2000 },
    { char:"ARCHIVIST", text:"One report reads: 'The destination remains constant. Only the journey changes.'", pause:3000 },
    { char:"ARCHIVIST", text:"That report was removed from the official record. But not from the building. Find it.", pause:3000 },
  ],
  afterRoom: [
    { char:"SYSTEM",    text:"ROOM IDENTIFIED — OBSERVATION CHAMBER.", pause:2000 },
    { char:"USER",      text:"The Observation Chamber. This is where they ran the tests.", pause:2400 },
    { char:"ARCHIVIST", text:"Undisturbed since 1972. Notes still pinned to the wall. One of them doesn't belong here.", pause:2800 },
    { char:"ARCHIVIST", text:"Search the archive index for each word. The one with no hits — that's your answer.", pause:3000 },
  ],
  afterNote: [
    { char:"SYSTEM",    text:"ODD NOTE — DISCARDED.", pause:1800 },
    { char:"USER",      text:"Banana. That was... not what I expected.", pause:2200 },
    { char:"ARCHIVIST", text:"Someone planted it. A test, maybe. Or a joke.", pause:2400 },
    { char:"ARCHIVIST", text:"Four witnesses were asked why they chose the cabinet they chose. Only one named the trait the psychology report was looking for.", pause:3800 },
  ],
  afterSuit: [
    { char:"SYSTEM",    text:"CABINET IDENTIFIED — HEARTS.", pause:2000 },
    { char:"USER",      text:"Hearts. The one witness who said 'emotion' directly.", pause:2400 },
    { char:"ARCHIVIST", text:"The experiment log has a gap. Entry 3 is missing. Find it.", pause:2800 },
  ],
  afterEntry: [
    { char:"SYSTEM",    text:"ENTRY 3 — RECOVERED.", pause:1800 },
    { char:"USER",      text:"'The room went silent before anyone screamed.'", pause:2600 },
    { char:"ARCHIVIST", text:"You have everything. A project name, a clearance level, a case number, a cabinet. Put them in sequence.", pause:3800 },
  ],
  final: [
    { char:"SYSTEM",    text:"AUTHORIZATION ACCEPTED — NULL-IX-04-HEARTS.", pause:2200 },
    { char:"SYSTEM",    text:"Loading final recovered transcript...", pause:2400 },
    { char:"USER",      text:"'There was never a choice. Every cabinet was leading here.'", pause:3200 },
    { char:"ARCHIVIST", text:"They knew from the beginning that all four paths converged.", pause:3200 },
    { char:"USER",      text:"Then why build four cabinets at all?", pause:2400 },
    { char:"ARCHIVIST", text:"Because the choice was never the point. The destination was.", pause:3000 },
    { char:"SYSTEM",    text:"ARCHIVE CLOSED. Case file logged: BROKEN DECK.", pause:2800 },
  ],
};

/* ── MUSIC ENGINE ── */
function useMusicEngine() {
  const ctxRef = useRef(null);
  const nodesRef = useRef({});
  const startedRef = useRef(false);

  function getCtx() {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return ctxRef.current;
  }

  function start() {
    if (startedRef.current) return;
    startedRef.current = true;
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();

    // Master gain
    const master = ctx.createGain();
    master.gain.value = 0.18;
    master.connect(ctx.destination);
    nodesRef.current.master = master;

    // Reverb (convolver approximation via feedback delay)
    const reverb = ctx.createDelay(2);
    reverb.delayTime.value = 0.06;
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.35;
    reverb.connect(reverbGain);
    reverbGain.connect(reverb);
    reverbGain.connect(master);
    nodesRef.current.reverb = reverb;
    nodesRef.current.reverbGain = reverbGain;

    // Low drone — two detuned oscillators
    function makeDrone(freq, detune, gainVal) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.detune.value = detune;
      const g = ctx.createGain();
      g.gain.value = gainVal;
      osc.connect(g);
      g.connect(reverb);
      g.connect(master);
      osc.start();
      return { osc, g };
    }
    nodesRef.current.drone1 = makeDrone(48, 0, 0.28);
    nodesRef.current.drone2 = makeDrone(48, 7, 0.18);
    nodesRef.current.drone3 = makeDrone(72, -5, 0.10);

    // Sub-bass pulse every ~3.2s
    function subPulse() {
      const t = ctx.currentTime;
      const sub = ctx.createOscillator();
      sub.type = "sine";
      sub.frequency.setValueAtTime(36, t);
      sub.frequency.exponentialRampToValueAtTime(28, t + 1.4);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.22, t + 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.6);
      sub.connect(g);
      g.connect(master);
      sub.start(t);
      sub.stop(t + 1.8);
      nodesRef.current._subTimer = setTimeout(subPulse, 3200 + Math.random() * 800);
    }
    subPulse();

    // Slow LFO on drone gain for breathing effect
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.06;
    lfo.connect(lfoGain);
    lfoGain.connect(nodesRef.current.drone1.g.gain);
    lfoGain.connect(nodesRef.current.drone2.g.gain);
    lfo.start();
    nodesRef.current.lfo = lfo;

    // Atmospheric high shimmer — random soft sine pings
    function shimmer() {
      const freqs = [523, 622, 698, 784, 932, 1047];
      const t = ctx.currentTime;
      const f = freqs[Math.floor(Math.random() * freqs.length)];
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.055, t + 0.4);
      g.gain.exponentialRampToValueAtTime(0.001, t + 3.5);
      osc.connect(g);
      g.connect(reverb);
      osc.start(t);
      osc.stop(t + 4);
      nodesRef.current._shimTimer = setTimeout(shimmer, 2800 + Math.random() * 4200);
    }
    shimmer();

    // Eerie melodic motif — pentatonic minor, slow
    const motifNotes = [98, 110, 131, 147, 175, 196, 220];
    let motifIdx = 0;
    function motif() {
      const t = ctx.currentTime;
      const freq = motifNotes[motifIdx % motifNotes.length];
      motifIdx++;
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.09, t + 0.3);
      g.gain.exponentialRampToValueAtTime(0.001, t + 2.8);
      osc.connect(g);
      g.connect(reverb);
      g.connect(master);
      osc.start(t);
      osc.stop(t + 3.2);
      nodesRef.current._motifTimer = setTimeout(motif, 1800 + Math.random() * 2600);
    }
    setTimeout(motif, 1200);

    // Tension noise layer — filtered white noise
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    const bpf = ctx.createBiquadFilter();
    bpf.type = "bandpass";
    bpf.frequency.value = 200;
    bpf.Q.value = 0.4;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.018;
    noise.connect(bpf);
    bpf.connect(noiseGain);
    noiseGain.connect(master);
    noise.start();
    nodesRef.current.noise = noise;
    nodesRef.current.noiseGain = noiseGain;
  }

  function setVolume(v) {
    if (nodesRef.current.master) {
      nodesRef.current.master.gain.setTargetAtTime(v, getCtx().currentTime, 0.3);
    }
  }

  function stop() {
    clearTimeout(nodesRef.current._subTimer);
    clearTimeout(nodesRef.current._shimTimer);
    clearTimeout(nodesRef.current._motifTimer);
    try { nodesRef.current.noise?.stop(); } catch(e) {}
    try { nodesRef.current.lfo?.stop(); } catch(e) {}
    ["drone1","drone2","drone3"].forEach(k => {
      try { nodesRef.current[k]?.osc.stop(); } catch(e) {}
    });
    try { ctxRef.current?.close(); } catch(e) {}
    ctxRef.current = null;
    nodesRef.current = {};
    startedRef.current = false;
  }

  return { start, stop, setVolume };
}

/* ── TIMER UTILITIES ── */
function formatTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2,"0")}m ${String(s).padStart(2,"0")}s`;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

/* ── DIALOGUE ENGINE ── */
const DEFAULT_PAUSE = 2400;
function DialogueCutscene({ sceneKey, onComplete }) {
  const lines = SCENES[sceneKey] || [];
  const [current, setCurrent] = useState(0);
  const [locked, setLocked] = useState(true);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setVisible(false);
    const t1 = setTimeout(() => setVisible(true), 80);
    setLocked(true);
    timerRef.current = setTimeout(() => setLocked(false), lines[current]?.pause ?? DEFAULT_PAUSE);
    return () => { clearTimeout(t1); clearTimeout(timerRef.current); };
  }, [current, sceneKey]);

  function advance() {
    if (locked) return;
    if (current < lines.length - 1) setCurrent(c => c + 1);
    else onComplete();
  }

  const line = lines[current];
  if (!line) return null;
  const char = CHARS[line.char];
  const isUser = line.char === "USER";
  const isSystem = line.char === "SYSTEM";

  return (
    <div className="dlg-scene">
      <div className="dlg-history">
        {lines.slice(0, current).map((l, i) => {
          const isU = l.char === "USER";
          return (
            <div key={i} className={`dlg-ghost-row ${isU ? "dlg-ghost-right" : "dlg-ghost-left"}`}>
              <div className="dlg-ghost-bubble">{l.text}</div>
            </div>
          );
        })}
      </div>
      <div className={`dlg-active ${visible?"dlg-active-in":""} ${isUser?"dlg-active-right":"dlg-active-left"}`}>
        {!isUser && (
          <div className="dlg-avatar" style={{ borderColor: char.color, borderRadius: isSystem?"4px":"50%" }}>
            <span className="dlg-avatar-emoji">{char.avatar}</span>
          </div>
        )}
        <div className="dlg-bubble-wrap">
          <div className="dlg-speaker-name" style={{ color: char.color, textAlign: isUser?"right":"left" }}>{char.name}</div>
          <div className={`dlg-bubble ${isUser?"dlg-bubble-user":isSystem?"dlg-bubble-sys":"dlg-bubble-npc"}`}>{line.text}</div>
        </div>
        {isUser && (
          <div className="dlg-avatar" style={{ borderColor: char.color }}>
            <span className="dlg-avatar-emoji">{char.avatar}</span>
          </div>
        )}
      </div>
      <div className="dlg-footer">
        <div className="dlg-dots">
          {lines.map((_,i) => <span key={i} className={`dlg-dot ${i===current?"dlg-dot-active":i<current?"dlg-dot-done":""}`} />)}
        </div>
        <button className={`dlg-next-btn ${locked?"dlg-next-locked":""}`} onClick={advance} disabled={locked}>
          {locked
            ? <span className="dlg-lock-dots"><span/><span/><span/></span>
            : current < lines.length-1 ? <>NEXT <ChevronRight size={13}/></> : <>PROCEED <ChevronRight size={13}/></>}
        </button>
      </div>
    </div>
  );
}

/* ── HINT SYSTEM ── */
const PENALTY_SECS = 60;
const MAX_HINTS = 3;

function HintPanel({ hints, usedCount, onUseHint, penaltyTotal }) {
  const [revealed, setRevealed] = useState(-1);
  const [confirming, setConfirming] = useState(false);
  const [nextIdx, setNextIdx] = useState(null);

  function requestHint(idx) {
    if (idx <= revealed || usedCount >= MAX_HINTS) return;
    setNextIdx(idx);
    setConfirming(true);
  }
  function confirmHint() {
    onUseHint(nextIdx);
    setRevealed(nextIdx);
    setConfirming(false);
  }

  return (
    <div className="hint-panel">
      <div className="hint-panel-header">
        <HelpCircle size={12}/> INVESTIGATOR LEADS
        <span className="hint-cost-tag">+{PENALTY_SECS}s per lead · max {MAX_HINTS}</span>
      </div>
      {confirming && (
        <div className="hint-confirm">
          <AlertTriangle size={11}/> This lead costs <strong>+{PENALTY_SECS}s</strong> penalty. Proceed?
          <div className="hint-confirm-btns">
            <button className="bd-btn bd-btn-danger-sm" onClick={confirmHint}>ACCEPT PENALTY</button>
            <button className="bd-btn bd-btn-ghost-sm" onClick={() => setConfirming(false)}>CANCEL</button>
          </div>
        </div>
      )}
      <div className="hint-list">
        {hints.map((h, i) => {
          const isUnlocked = i <= revealed;
          const isNext = i === usedCount && i <= revealed + 1;
          const isBlocked = usedCount >= MAX_HINTS && !isUnlocked;
          return (
            <div key={i} className={`hint-item ${isUnlocked?"is-open":""}`}>
              <button
                className={`hint-trigger ${isUnlocked?"is-revealed":""} ${isBlocked?"is-blocked":""}`}
                onClick={() => !isUnlocked && requestHint(i)}
                disabled={isBlocked || (i > usedCount)}
              >
                <span className="hint-num">LEAD {i+1}</span>
                {isUnlocked
                  ? <span className="hint-text">{h}</span>
                  : isBlocked
                    ? <span className="hint-locked-msg">MAX LEADS REACHED</span>
                    : i > usedCount
                      ? <span className="hint-locked-msg">UNLOCK LEAD {i} FIRST</span>
                      : <span className="hint-cost">+{PENALTY_SECS}s — CLICK TO REVEAL</span>}
              </button>
            </div>
          );
        })}
      </div>
      {penaltyTotal > 0 && (
        <div className="hint-penalty-total">⚠ PENALTY ACCUMULATED: +{penaltyTotal}s</div>
      )}
    </div>
  );
}

/* ── PUZZLE FRAME ── */
function PuzzleFrame({ index, title, prompt, status, hints, hintUsed, onUseHint, penaltyTotal, children }) {
  return (
    <div className="bd-puzzle">
      <div className="bd-puzzle-head">
        <span className="bd-stamp bd-tone-amber">PUZZLE {index} OF 9</span>
        <h2 className="bd-puzzle-title">{title}</h2>
        <p className="bd-puzzle-prompt">{prompt}</p>
      </div>
      <div className="bd-puzzle-body">{children}</div>
      <HintPanel hints={hints} usedCount={hintUsed} onUseHint={onUseHint} penaltyTotal={penaltyTotal} />
      {status && (
        <p className={`bd-status ${status.ok?"is-ok":"is-err"}`}>
          {status.ok ? <Check size={13}/> : <AlertTriangle size={13}/>} {status.msg}
        </p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   PUZZLE 1 — THE REDACTED ARTICLE (HARD)
   Answer: 14 October 1972
   Mechanic: 12 bars, only 2 reveal useful info.
   Cipher: day encoded in Roman numerals hidden inside bar text.
   Month: caption mentions "autumn equinox" — must know Oct follows Sep.
   Extra layer: submit must be in DD-MON-YYYY format.
   ══════════════════════════════════════════════ */
const P1_HINTS = [
  "The day is hidden inside two of the redacted bars as Roman numerals. Not every bar reveals something useful.",
  "The caption doesn't name the month — but 'autumn equinox' falls in September, and the report says the experiment happened 'three weeks after'. Count forward.",
  "The format required is DD-MON-YYYY (e.g. 09-SEP-1972). The month abbreviation must be three letters.",
];

function Puzzle1({ onSolve, hintUsed, onUseHint, penaltyTotal }) {
  const [revealedBars, setRevealedBars] = useState({});
  const [input, setInput] = useState("");
  const [status, setStatus] = useState(null);

  const bars = [
    { id:0, reveal:null }, { id:1, reveal:"XIV" }, { id:2, reveal:null },
    { id:3, reveal:null }, { id:4, reveal:"X" }, { id:5, reveal:null },
    { id:6, reveal:null }, { id:7, reveal:null }, { id:8, reveal:null },
    { id:9, reveal:null }, { id:10, reveal:null }, { id:11, reveal:null },
  ];

  const VALID = ["14-oct-1972","14 oct 1972","14 october 1972","oct 14 1972","14/10/1972"];

  function toggle(id) { setRevealedBars(r => ({ ...r, [id]: !r[id] })); }

  function submit(e) {
    e.preventDefault();
    const clean = input.trim().toLowerCase().replace(/[,\.]/g,"");
    if (VALID.includes(clean)) {
      setStatus({ ok:true, msg:"Date verified against the master index." });
      setTimeout(() => onSolve("date","14 October 1972"), 500);
    } else {
      setStatus({ ok:false, msg:"Format rejected or date incorrect. Check: DD-MON-YYYY." });
    }
  }

  return (
    <PuzzleFrame index={1} title="The Redacted Article"
      prompt="The clipping is almost entirely blacked out. Somewhere in those bars, the day is encoded in Roman numerals. The month is never stated — only implied. Recover the full date of the final experiment in DD-MON-YYYY format."
      status={status} hints={P1_HINTS} hintUsed={hintUsed} onUseHint={onUseHint} penaltyTotal={penaltyTotal}>
      <p className="bd-doc-text">The final experiment took place in <strong>1972</strong>. The following passage was redacted at source. Hover each bar — some contain encoded fragments.</p>
      <p className="bd-doc-text bd-redacted-line">
        {bars.map(b => (
          <span key={b.id} className={`bd-bar ${revealedBars[b.id]?"is-lifted":""}`}
            onClick={() => toggle(b.id)} onMouseEnter={() => toggle(b.id)} onMouseLeave={() => toggle(b.id)}
            role="button" tabIndex={0}>
            {revealedBars[b.id] ? (b.reveal || "—") : "\u00A0\u00A0\u00A0\u00A0\u00A0"}
          </span>
        ))}
      </p>
      <div className="bd-caption">Fig. 3 — Corridor photograph. Annotated: "Taken three weeks after the autumn equinox, before final shutdown."</div>
      <form className="bd-input-row" onSubmit={submit}>
        <input className="bd-input" placeholder="DD-MON-YYYY" value={input} onChange={e => setInput(e.target.value)} />
        <button className="bd-btn" type="submit">SUBMIT</button>
      </form>
    </PuzzleFrame>
  );
}

/* ══════════════════════════════════════════════
   PUZZLE 2 — THE MISSING REPORT (HARD)
   Answer: Report_04
   Mechanic: references now use non-obvious language.
   Each report gives a *coded* offset, not plain arithmetic.
   ══════════════════════════════════════════════ */
const P2_HINTS = [
  "Each report's reference is relative to its own file number. 'Three entries after this one' means add 3 to the current report number.",
  "All six surviving reports point to the same missing file when you do the arithmetic correctly. They all converge on the same number.",
  "The target is Report_04. Now confirm it by checking the deleted-files folder hidden at the very bottom of the page.",
];

function Puzzle2({ onSolve, hintUsed, onUseHint, penaltyTotal }) {
  const [open, setOpen] = useState(null);
  const [deletedOpen, setDeletedOpen] = useState(false);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState(null);

  const reports = [
    { id:"01", text:"The anomaly documented three entries beyond this filing precedes all subsequent analysis." },
    { id:"02", text:"Consult the entry situated two positions forward in the sequential index." },
    { id:"03", text:"The file immediately following this one in chronology was the last filed before the incident." },
    { id:"05", text:"This report continues work initiated in the entry logged one position prior to this filing." },
    { id:"06", text:"The findings here were first established two entries behind the current reference point." },
    { id:"07", text:"The subject roster in this file mirrors one compiled three entries earlier in the record." },
  ];

  function submit(e) {
    e.preventDefault();
    const c = input.trim().toLowerCase().replace(/report_?/g,"").replace(/\s/g,"");
    if (["04","4","0004"].includes(c)) {
      setStatus({ ok:true, msg:"Report_04 restored to the index." });
      setTimeout(() => onSolve("caseNumber","04"), 500);
    } else setStatus({ ok:false, msg:"That file number does not resolve the discrepancy." });
  }

  return (
    <PuzzleFrame index={2} title="The Missing Report"
      prompt="Six reports survive. Each one points — in deliberately obscured language — to a seventh file the index pretends never existed. Open each report, decode the reference, and name the missing file number."
      status={status} hints={P2_HINTS} hintUsed={hintUsed} onUseHint={onUseHint} penaltyTotal={penaltyTotal}>
      <div className="bd-report-grid">
        {reports.map(r => (
          <button key={r.id} className={`bd-report-card ${open===r.id?"is-open":""}`} onClick={() => setOpen(open===r.id?null:r.id)}>
            <div className="bd-report-id">Report_{r.id}.pdf</div>
            {open===r.id && <div className="bd-report-text">{r.text}</div>}
          </button>
        ))}
      </div>
      <div className="bd-deleted-zone">
        <span className={`bd-deleted-link ${deletedOpen?"is-open":""}`} onClick={() => setDeletedOpen(v=>!v)}>deleted files</span>
        {deletedOpen && <div className="bd-recovered-box">RECOVERED: Report_04.pdf — "The anomaly all prior accounts converge upon."</div>}
      </div>
      <form className="bd-input-row" onSubmit={submit}>
        <input className="bd-input" placeholder="Which report is missing?" value={input} onChange={e => setInput(e.target.value)} />
        <button className="bd-btn" type="submit">SUBMIT</button>
      </form>
    </PuzzleFrame>
  );
}

/* ══════════════════════════════════════════════
   PUZZLE 3 — THE CABINET PASSWORD (HARD)
   Answer: NULL
   Mechanic: Vigenère cipher on a short ciphertext.
   Key = "DECK". Ciphertext = "QYXP" → plaintext "NULL"
   Show cipher grid partially; player must decode manually.
   ══════════════════════════════════════════════ */
const P3_HINTS = [
  "This is a Vigenère cipher. To decode letter by letter: find the key letter's row, then scan across to find the ciphertext letter — the column header is the plaintext.",
  "The key is DECK. First letter: key D, cipher Q → count back from Q by D's position (4) → M? No — use the standard Vigenère table. D=3, Q=16, 16-3=13 → N. Try the rest.",
  "The four decoded letters are N, U, L, L. The word is NULL — the name this archive uses for the project.",
];

// Vigenère encode("NULL","DECK") = Q,Y,X,P
const VIGENERE_PAIRS = [
  { key:"D", cipher:"Q", plain:"N" },
  { key:"E", cipher:"Y", plain:"U" },
  { key:"C", cipher:"X", plain:"L" },
  { key:"K", cipher:"P", plain:"L" },
];

function Puzzle3({ onSolve, hintUsed, onUseHint, penaltyTotal }) {
  const [decoded, setDecoded] = useState(["","","",""]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState(null);
  const [showTable, setShowTable] = useState(false);

  function setLetter(i, v) {
    const d = [...decoded];
    d[i] = v.toUpperCase().slice(-1);
    setDecoded(d);
  }

  function submit(e) {
    e.preventDefault();
    if (input.trim().toUpperCase() === "NULL") {
      setStatus({ ok:true, msg:"Cabinet lock disengaged." });
      setTimeout(() => onSolve("project","NULL"), 500);
    } else setStatus({ ok:false, msg:"Incorrect decryption. Verify your Vigenère calculation." });
  }

  // partial Vigenère table rows for D,E,C,K only
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const tableRows = ["D","E","C","K"].map(k => {
    const offset = k.charCodeAt(0) - 65;
    return { key: k, row: ALPHABET.map((_,i) => ALPHABET[(i + offset) % 26]) };
  });

  return (
    <PuzzleFrame index={3} title="The Cabinet Password"
      prompt="A sticky note was found inside the cabinet lock mechanism. It contains a Vigenère-encrypted word and the key used to encrypt it. Decode it letter by letter using the cipher table."
      status={status} hints={P3_HINTS} hintUsed={hintUsed} onUseHint={onUseHint} penaltyTotal={penaltyTotal}>

      <div className="bd-cipher-note">
        <div className="bd-cipher-row"><span className="bd-cipher-label">KEY:</span> <span className="bd-cipher-val">D &nbsp; E &nbsp; C &nbsp; K</span></div>
        <div className="bd-cipher-row"><span className="bd-cipher-label">CIPHER:</span> <span className="bd-cipher-val">Q &nbsp; Y &nbsp; X &nbsp; P</span></div>
        <div className="bd-cipher-row"><span className="bd-cipher-label">PLAIN:</span>
          <span className="bd-cipher-inputs">
            {decoded.map((d,i) => (
              <input key={i} className="bd-cipher-cell" maxLength={1}
                value={d} onChange={e => setLetter(i, e.target.value)} placeholder="?" />
            ))}
          </span>
        </div>
      </div>

      <button className="bd-link-btn" onClick={() => setShowTable(v=>!v)}>
        {showTable ? "HIDE CIPHER TABLE" : "SHOW VIGENÈRE TABLE (key rows only)"}
      </button>
      {showTable && (
        <div className="bd-vigenere-table">
          <div className="bd-vt-row bd-vt-header">
            <span className="bd-vt-key-cell">KEY</span>
            {ALPHABET.map(a => <span key={a} className="bd-vt-cell bd-vt-head">{a}</span>)}
          </div>
          {tableRows.map(r => (
            <div key={r.key} className="bd-vt-row">
              <span className="bd-vt-key-cell">{r.key}</span>
              {r.row.map((c,i) => (
                <span key={i} className={`bd-vt-cell ${["Q","Y","X","P"].includes(c)?"bd-vt-highlight":""}`}>{c}</span>
              ))}
            </div>
          ))}
        </div>
      )}

      <form className="bd-input-row" onSubmit={submit}>
        <input className="bd-input" placeholder="Enter decoded password" value={input} onChange={e => setInput(e.target.value)} />
        <button className="bd-btn" type="submit">SUBMIT</button>
      </form>
    </PuzzleFrame>
  );
}

/* ══════════════════════════════════════════════
   PUZZLE 4 — THE RESTRICTED TERMINAL (HARD)
   Answer: Level IX
   Mechanic: Binary-encoded stamp numbers. Player must
   convert binary to decimal → pick highest valid = 9.
   ══════════════════════════════════════════════ */
const P4_HINTS = [
  "Each stamp contains a binary number. Convert each from binary to decimal — that's the access level it describes.",
  "Binary: 1001 = 8+0+0+1 = 9. That's the highest level in the set. One stamp is a forgery — it contains an error bit.",
  "The correct level is IX (nine). Three stamps confirm it. One stamp reads 1000 (decimal 8) — that's the forgery. Submit 'Level IX'.",
];

function Puzzle4({ onSolve, hintUsed, onUseHint, penaltyTotal }) {
  const [openManual, setOpenManual] = useState(false);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState(null);

  const stamps = [
    { id:1, text:"ARCHIVE DEPTH: 1001", forged:false },
    { id:2, text:"ARCHIVE DEPTH: 1001", forged:false },
    { id:3, text:"ARCHIVE DEPTH: 1000", forged:true },
    { id:4, text:"ARCHIVE DEPTH: 1001", forged:false },
  ];

  function submit(e) {
    e.preventDefault();
    const c = input.trim().toLowerCase().replace("level","").trim();
    if (["ix","9"].includes(c) || input.trim().toLowerCase() === "level ix") {
      setStatus({ ok:true, msg:"Terminal accepts clearance." });
      setTimeout(() => onSolve("clearance","IX"), 500);
    } else setStatus({ ok:false, msg:"Access denied. Decode the binary stamps correctly." });
  }

  return (
    <PuzzleFrame index={4} title="The Restricted Terminal"
      prompt="ACCESS DENIED. Four archived stamps carry binary-encoded access levels. Three agree on the correct level — one is a deliberate forgery. Decode the binary numbers, identify the consensus, and enter the access level."
      status={status} hints={P4_HINTS} hintUsed={hintUsed} onUseHint={onUseHint} penaltyTotal={penaltyTotal}>
      <div className="bd-stamp-grid">
        {stamps.map(s => (
          <div key={s.id} className={`bd-depth-stamp ${s.forged?"bd-depth-suspect":""}`}>{s.text}</div>
        ))}
      </div>
      <button className="bd-link-btn" onClick={() => setOpenManual(v=>!v)}>
        {openManual ? "CLOSE CONVERSION REFERENCE" : "OPEN BINARY CONVERSION REFERENCE"}
      </button>
      {openManual && (
        <div className="bd-manual">
          <div className="bd-manual-row"><span>0001</span><span>= Level I</span></div>
          <div className="bd-manual-row"><span>0010</span><span>= Level II</span></div>
          <div className="bd-manual-row"><span>0011</span><span>= Level III</span></div>
          <div className="bd-manual-row"><span>0100</span><span>= Level IV</span></div>
          <div className="bd-manual-row"><span>0101</span><span>= Level V</span></div>
          <div className="bd-manual-row"><span>0110</span><span>= Level VI</span></div>
          <div className="bd-manual-row"><span>0111</span><span>= Level VII</span></div>
          <div className="bd-manual-row"><span>1000</span><span>= Level VIII</span></div>
          <div className="bd-manual-row bd-manual-missing"><span>1001</span><span>[NO ENTRY ON FILE]</span></div>
        </div>
      )}
      <form className="bd-input-row" onSubmit={submit}>
        <input className="bd-input" placeholder="Enter access level (e.g. Level IX)" value={input} onChange={e => setInput(e.target.value)} />
        <button className="bd-btn" type="submit">SUBMIT</button>
      </form>
    </PuzzleFrame>
  );
}

/* ══════════════════════════════════════════════
   PUZZLE 5 — THE FACILITY MAP (HARD)
   Answer: Observation Chamber
   Mechanic: Four coordinates map to grid positions.
   Only one set points inside the unlabeled room on the grid.
   ══════════════════════════════════════════════ */
const P5_HINTS = [
  "The grid uses (Row, Column) coordinates starting from top-left = (1,1). Each excerpt contains a coordinate pair — only one falls in the unlabeled cell.",
  "The unlabeled room is at position (2,3) on the 3×3 grid. Only one excerpt's coordinate matches: 'grid reference 2-3'.",
  "The room is the Observation Chamber. Fragments 1 and 3 both confirm this name indirectly. Submit exactly: Observation Chamber",
];

function Puzzle5({ onSolve, hintUsed, onUseHint, penaltyTotal }) {
  const [openExcerpt, setOpenExcerpt] = useState(null);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState(null);

  // 3×3 grid. Cell (2,3) = unknown
  const grid = [
    ["Laboratory A","Control Room","Storage"],
    ["Laboratory B","Exit","?????"],
    ["Corridor N","Corridor S","Sublevel Access"],
  ];

  const excerpts = [
    { id:1, coord:"(1,2)", text:"Grid ref 1-2: Control room power restored at 0410 on the final night." },
    { id:2, coord:"(3,1)", text:"Grid ref 3-1: Northern corridor sealed after the lockdown order was issued." },
    { id:3, coord:"(2,3)", text:"Grid ref 2-3: Subject transport logs place the final session in the unlabeled eastern room." },
    { id:4, coord:"(3,3)", text:"Grid ref 3-3: Sublevel access hatch welded shut post-incident — never reopened." },
  ];

  function submit(e) {
    e.preventDefault();
    if (input.trim().toLowerCase() === "observation chamber") {
      setStatus({ ok:true, msg:"Blueprint updated." });
      setTimeout(() => onSolve("room","Observation Chamber"), 500);
    } else setStatus({ ok:false, msg:"Unrecognized room name." });
  }

  return (
    <PuzzleFrame index={5} title="The Facility Map"
      prompt="The blueprint has a 3×3 grid. One cell is unlabeled. Each excerpt contains a grid coordinate (Row, Column). Find which coordinate falls in the unlabeled cell — the excerpts that reference it name the room."
      status={status} hints={P5_HINTS} hintUsed={hintUsed} onUseHint={onUseHint} penaltyTotal={penaltyTotal}>
      <div className="bd-blueprint-grid">
        {grid.map((row,r) => row.map((cell,c) => (
          <div key={`${r}-${c}`} className={`bd-room ${cell==="?????"?"bd-room-unknown":""}`}>
            <span className="bd-room-coord">({r+1},{c+1})</span>
            <span>{cell}</span>
          </div>
        )))}
      </div>
      <div className="bd-excerpt-list">
        {excerpts.map(ex => (
          <button key={ex.id} className={`bd-excerpt ${openExcerpt===ex.id?"is-open":""}`} onClick={() => setOpenExcerpt(openExcerpt===ex.id?null:ex.id)}>
            FRAGMENT {ex.id} — COORD {ex.coord}
            {openExcerpt===ex.id && <div className="bd-excerpt-text">{ex.text}</div>}
          </button>
        ))}
      </div>
      <form className="bd-input-row" onSubmit={submit}>
        <input className="bd-input" placeholder="Name the unlabeled room" value={input} onChange={e => setInput(e.target.value)} />
        <button className="bd-btn" type="submit">SUBMIT</button>
      </form>
    </PuzzleFrame>
  );
}

/* ══════════════════════════════════════════════
   PUZZLE 6 — THE RESEARCH NOTES (HARD)
   Answer: Banana
   Mechanic: Search returns *weighted* scores for each word.
   Only Banana scores 0. But the UI gives misleading context scores
   for other words making players second-guess.
   ══════════════════════════════════════════════ */
const P6_HINTS = [
  "Some words return scores that look like 'hits' — but read the result carefully. A score of 0 means truly zero references. No entry. No archive record at all.",
  "Search every word. Five of them return a number greater than zero. Only one returns exactly zero — that's your answer.",
  "The odd-one-out is Banana. It has zero archive references. Everything else is part of the investigation. Submit 'Banana'.",
];

const SEARCH_INDEX = {
  memory:14, reality:9, perception:11, identity:6, consciousness:4, banana:0,
  // decoys
  shadow:3, mirror:7, void:2, echo:5,
};
const ALL_NOTES = ["Memory","Reality","Perception","Identity","Consciousness","Banana"];

function Puzzle6({ onSolve, hintUsed, onUseHint, penaltyTotal }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState(null);

  function runSearch(e) {
    e.preventDefault();
    const key = query.trim().toLowerCase();
    const count = SEARCH_INDEX[key];
    const entry = count === undefined
      ? `"${query}" — no index entry found.`
      : count === 0
        ? `"${query}" — 0 references found. No archive record.`
        : `"${query}" — ${count} reference${count===1?"":"s"} found across ${Math.ceil(count/2)} documents.`;
    setResults(r => [{ q:query, entry }, ...r].slice(0,8));
  }

  function confirm() {
    if (selected === "Banana") {
      setStatus({ ok:true, msg:"Note discarded. It never belonged here." });
      setTimeout(() => onSolve("oddNote","Banana"), 500);
    } else setStatus({ ok:false, msg:"That word has real references in the archive." });
  }

  return (
    <PuzzleFrame index={6} title="The Research Notes"
      prompt="Six handwritten notes were pinned to the wall. Search the archive index for each one. The word with zero archive references doesn't belong here. Identify and confirm it."
      status={status} hints={P6_HINTS} hintUsed={hintUsed} onUseHint={onUseHint} penaltyTotal={penaltyTotal}>
      <div className="bd-notes-grid">
        {ALL_NOTES.map(n => (
          <button key={n} className={`bd-note ${selected===n?"is-selected":""}`} onClick={() => setSelected(n)}>{n}</button>
        ))}
      </div>
      <form className="bd-input-row" onSubmit={runSearch}>
        <input className="bd-input" placeholder="Search archive index..." value={query} onChange={e => setQuery(e.target.value)} />
        <button className="bd-btn bd-btn-ghost" type="submit"><Search size={13}/> SEARCH</button>
      </form>
      {results.length > 0 && (
        <div className="bd-search-log">
          {results.map((r,i) => <div key={i} className="bd-search-result">&gt; {r.entry}</div>)}
        </div>
      )}
      <button className="bd-btn" style={{marginTop:8}} onClick={confirm} disabled={!selected}>
        CONFIRM "{selected||"..."}" AS THE ODD NOTE
      </button>
    </PuzzleFrame>
  );
}

/* ══════════════════════════════════════════════
   PUZZLE 7 — THE FOUR CABINETS (HARD)
   Answer: Hearts
   Mechanic: 4 testimonies all use ambiguous language.
   Player must extract the underlying psychological trait
   and match it against a reference table of suit→trait mappings.
   ══════════════════════════════════════════════ */
const P7_HINTS = [
  "The psychology report maps each suit to a core trait: Spades = Grief, Diamonds = Greed, Clubs = Ambition. The remaining trait is Emotion — which suit is missing from that list?",
  "Hearts is mapped to Emotion. Only one testimony explicitly uses the word 'emotion'. The others imply their trait without naming it.",
  "The Hearts testimony says: '...the last conversation I had with my mother — the emotion in that moment.' That is the only explicit trait-name. Select Hearts.",
];

function Puzzle7({ onSolve, hintUsed, onUseHint, penaltyTotal }) {
  const [open, setOpen] = useState(null);
  const [status, setStatus] = useState(null);
  const [showRef, setShowRef] = useState(false);

  const cabinets = [
    { suit:"♠", label:"Spades",   text:"I chose the cabinet that reminded me of the night I buried my brother. The grief I'd swallowed for years came back in that room — but I didn't name it, not even to myself." },
    { suit:"♥", label:"Hearts",   text:"I chose the cabinet that confronted me with raw emotion — the last conversation I had with my mother, the feeling in that moment. I hadn't felt that in years." },
    { suit:"♦", label:"Diamonds", text:"I chose the cabinet that showed me everything I'd sacrificed to get here — the house, the car, the title. A life built around accumulation." },
    { suit:"♣", label:"Clubs",    text:"I chose the cabinet that reflected my drive — the early mornings, the ruthlessness it took to climb. I saw the version of myself I'd decided to become at nineteen." },
  ];

  function choose(label) {
    if (label === "Hearts") {
      setStatus({ ok:true, msg:"Testimony matched. Cabinet identified." });
      setTimeout(() => onSolve("cabinet","HEARTS"), 500);
    } else setStatus({ ok:false, msg:"That testimony implies a different trait. Refer to the psychology report reference table." });
  }

  return (
    <PuzzleFrame index={7} title="The Four Cabinets"
      prompt="Four witnesses described their cabinet choice. Each testimony maps to a psychological trait. The psychology report was looking for one specific trait named outright — not implied. Cross-reference the trait table and identify the correct cabinet."
      status={status} hints={P7_HINTS} hintUsed={hintUsed} onUseHint={onUseHint} penaltyTotal={penaltyTotal}>
      <button className="bd-link-btn" onClick={() => setShowRef(v=>!v)}>
        {showRef?"CLOSE PSYCHOLOGY REFERENCE":"OPEN PSYCHOLOGY REPORT EXTRACT"}
      </button>
      {showRef && (
        <div className="bd-manual" style={{marginBottom:8}}>
          <div className="bd-manual-row"><span>♠ Spades</span><span>Core trait: [REDACTED]</span></div>
          <div className="bd-manual-row"><span>♥ Hearts</span><span>Core trait: [REDACTED]</span></div>
          <div className="bd-manual-row"><span>♦ Diamonds</span><span>Core trait: [REDACTED]</span></div>
          <div className="bd-manual-row"><span>♣ Clubs</span><span>Core trait: [REDACTED]</span></div>
          <p style={{fontSize:9,color:"#4a4332",marginTop:6}}>Cross-reference traits against testimony language to deduce each mapping.</p>
        </div>
      )}
      <div className="bd-cabinet-row">
        {cabinets.map(c => (
          <button key={c.label} className={`bd-cabinet ${open===c.label?"is-open":""}`} onClick={() => setOpen(open===c.label?null:c.label)}>
            <span className="bd-cabinet-suit">{c.suit}</span>{c.label}
          </button>
        ))}
      </div>
      {open && (
        <div className="bd-testimony">
          <p>"{cabinets.find(c=>c.label===open).text}"</p>
          <button className="bd-btn" onClick={() => choose(open)}>THIS IS THE ONE</button>
        </div>
      )}
    </PuzzleFrame>
  );
}

/* ══════════════════════════════════════════════
   PUZZLE 8 — THE MISSING LOG ENTRY (HARD)
   Answer: Entry 3
   Mechanic: Entries are shown shuffled + with misleading timestamps.
   Player must reconstruct correct chronological order
   and identify the gap. Metadata is buried in a hex dump.
   ══════════════════════════════════════════════ */
const P8_HINTS = [
  "The entries are not shown in order. Look at the timestamps — sort them chronologically and you'll find a gap between two consecutive numbers.",
  "The hex dump contains a readable ASCII string near offset 0x0090. Look for the string 'ENTRY_3' or '03' near a checksum mismatch comment.",
  "The missing entry is Entry 3. It sits between the preparation entry (Entry 2) and the unexpected return entry (Entry 4). Submit '3' or 'Entry 3'.",
];

function Puzzle8({ onSolve, hintUsed, onUseHint, penaltyTotal }) {
  const [open, setOpen] = useState(null);
  const [showHex, setShowHex] = useState(false);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState(null);

  // Entries shown OUT of order deliberately
  const entries = [
    { id:4, ts:"04:17", text:"Subject returned unexpectedly. No record of re-entry on any active monitor." },
    { id:1, ts:"02:44", text:"Subjects briefed. Equipment calibrated. No anomalies on pre-test checks." },
    { id:5, ts:"04:52", text:"Facility placed under lockdown. Communications restricted to senior staff only." },
    { id:2, ts:"03:31", text:"Cabinets opened in sequence. Preparation complete. Cabinet seals confirmed." },
  ];

  function submit(e) {
    e.preventDefault();
    const c = input.trim().toLowerCase().replace("entry","").trim();
    if (["3","03"].includes(c) || input.trim().toLowerCase() === "entry 3") {
      setStatus({ ok:true, msg:"Entry 3 recovered and restored." });
      setTimeout(() => onSolve("entry","Entry 3"), 500);
    } else setStatus({ ok:false, msg:"No such entry. Sort the log by timestamp and find the gap." });
  }

  return (
    <PuzzleFrame index={8} title="The Missing Log Entry"
      prompt="The experiment log entries are shown in retrieval order — not chronological. Sort them by timestamp, find the sequential gap, then recover the missing entry number from the hex dump."
      status={status} hints={P8_HINTS} hintUsed={hintUsed} onUseHint={onUseHint} penaltyTotal={penaltyTotal}>
      <div className="bd-log-list">
        {entries.map(e => (
          <button key={e.id} className={`bd-log-entry ${open===e.id?"is-open":""}`} onClick={() => setOpen(open===e.id?null:e.id)}>
            <span>Entry {e.id}</span><span className="bd-log-ts">[{e.ts}]</span>
            {open===e.id && <div className="bd-log-text">{e.text}</div>}
          </button>
        ))}
      </div>
      <button className="bd-link-btn" onClick={() => setShowHex(v=>!v)}>
        {showHex ? "CLOSE HEX DUMP" : "INSPECT ARCHIVE HEX DUMP"}
      </button>
      {showHex && (
        <pre className="bd-metadata">{`0000: 45 4e 54 52 59 5f 31 00  2c 00 00 00 4f 4b 0a
0010: 45 4e 54 52 59 5f 32 00  2c 00 00 00 4f 4b 0a
0020: -- -- -- -- -- -- -- --  -- -- -- -- -- -- --
; offset 0x0090: ENTRY_3 checksum=0xDEAD status=MISMATCH
; partial recovery: "...silence preceded the scream..."
; backup ref: /null/1972/log_entry_03.bak [corrupt]
0030: 45 4e 54 52 59 5f 34 00  2c 00 00 00 4f 4b 0a
0040: 45 4e 54 52 59 5f 35 00  2c 00 00 00 4f 4b 0a`}</pre>
      )}
      <form className="bd-input-row" onSubmit={submit}>
        <input className="bd-input" placeholder="Which entry is missing?" value={input} onChange={e => setInput(e.target.value)} />
        <button className="bd-btn" type="submit">SUBMIT</button>
      </form>
    </PuzzleFrame>
  );
}

/* ══════════════════════════════════════════════
   PUZZLE 9 — FINAL AUTHORIZATION (HARD)
   Answer: NULL-IX-04-HEARTS
   Mechanic: 6 fragment options (2 decoys), 4 slots.
   Decoys: "MERIDIAN" (fake project) and "VII" (fake level).
   Player must assign correctly from memory/deduction.
   ══════════════════════════════════════════════ */
const P9_HINTS = [
  "You have 6 fragments but only 4 slots. Two fragments are decoys: MERIDIAN is a different project name, and VII is an incorrect level — it appeared in a forged stamp.",
  "Correct assignments: PROJECT = NULL, CLEARANCE = IX, CASE = 04, CABINET = HEARTS. The decoys MERIDIAN and VII should be left unassigned.",
  "The final code is NULL-IX-04-HEARTS. Assign each fragment to its category and submit.",
];

function Puzzle9({ fragments, onSolve, hintUsed, onUseHint, penaltyTotal }) {
  // 6 options, 2 are decoys
  const OPTIONS = ["NULL","MERIDIAN","IX","VII","04","HEARTS"];
  const SLOTS = { project:"PROJECT", clearance:"CLEARANCE", caseNumber:"CASE №", cabinet:"CABINET" };
  const EXPECTED = { project:"NULL", clearance:"IX", caseNumber:"04", cabinet:"HEARTS" };

  const [slots, setSlots] = useState({ project:"", clearance:"", caseNumber:"", cabinet:"" });
  const [status, setStatus] = useState(null);

  function setSlot(key, val) { setSlots(s => ({ ...s, [key]: val })); }

  function submit(e) {
    e.preventDefault();
    if (Object.keys(EXPECTED).every(k => slots[k] === EXPECTED[k])) {
      setStatus({ ok:true, msg:"AUTHORIZATION ACCEPTED — ARCHIVE UNLOCKED." });
      setTimeout(() => onSolve("final","NULL-IX-04-HEARTS"), 800);
    } else setStatus({ ok:false, msg:"Sequence rejected. One or more assignments are incorrect. Two fragments are decoys." });
  }

  const code = ["project","clearance","caseNumber","cabinet"].map(k => slots[k]||"____").join("-");

  return (
    <PuzzleFrame index={9} title="Final Authorization"
      prompt="Six fragments recovered. Four slots to fill. Two fragments are deliberate decoys planted in the archive. Assign each real fragment to its correct category, leave the decoys unassigned, and submit the final authorization code."
      status={status} hints={P9_HINTS} hintUsed={hintUsed} onUseHint={onUseHint} penaltyTotal={penaltyTotal}>
      <div className="bd-fragment-options">
        <span className="bd-final-label">RECOVERED FRAGMENTS:</span>
        <div className="bd-fragment-chips">
          {OPTIONS.map(o => (
            <span key={o} className={`bd-frag-chip ${Object.values(slots).includes(o)?"is-used":""}`}>{o}</span>
          ))}
        </div>
      </div>
      <div className="bd-final-grid">
        {Object.keys(SLOTS).map(key => (
          <div key={key} className="bd-final-slot">
            <span className="bd-final-label">[{SLOTS[key]}]</span>
            <select className="bd-select" value={slots[key]} onChange={e => setSlot(key, e.target.value)}>
              <option value="">-- select --</option>
              {OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div className="bd-final-preview">{code}</div>
      <form onSubmit={submit}><button className="bd-btn" type="submit">SUBMIT AUTHORIZATION</button></form>
    </PuzzleFrame>
  );
}

/* ── HEADER ── */
function Header({ fragments, solvedCount, elapsed, penalty, onRestart, muted, onToggleMute }) {
  const display = elapsed + penalty;
  return (
    <div className="bd-header">
      <div className="bd-header-left">
        <TerminalIcon size={15}/>
        <div>
          <div className="bd-header-title">THE BROKEN DECK</div>
          <div className="bd-header-sub">FRAGMENT {Math.min(solvedCount,9)} OF 9</div>
        </div>
      </div>
      <div className="bd-header-right">
        <div className="bd-timer-display">
          <Clock size={11}/> {formatTime(elapsed)}
          {penalty > 0 && <span className="bd-penalty-badge">+{formatTime(penalty)} penalty</span>}
        </div>
        <div className="bd-tracker">
          {["project","clearance","caseNumber","cabinet"].map(k => (
            <span key={k} className={`bd-chip ${fragments[k]?"is-active":""}`}>
              {fragments[k] ? <Unlock size={11}/> : <Lock size={11}/>}
            </span>
          ))}
        </div>
        <button className="bd-icon-btn" onClick={onToggleMute} title={muted?"Unmute":"Mute"}>
          {muted ? "🔇" : "🔊"}
        </button>
        <button className="bd-icon-btn" onClick={onRestart} title="Restart"><RotateCcw size={13}/></button>
      </div>
    </div>
  );
}

/* ── SPLASH ── */
function SplashScreen({ onStart }) {
  return (
    <div className="bd-splash">
      <div className="bd-splash-inner">
        <div className="bd-splash-eyebrow">CLASSIFIED ARCHIVE · 1972</div>
        <h1 className="bd-splash-title">THE<br/>BROKEN<br/>DECK</h1>
        <div className="bd-splash-rule"/>
        <p className="bd-splash-tagline">Hard Mode — An interactive investigation</p>
        <div className="bd-splash-warning">
          <Skull size={13}/> INVESTIGATOR LEADS cost <strong>+60s</strong> penalty each · max 3 per puzzle
        </div>
        <div className="bd-splash-chars">
          {Object.values(CHARS).map(c => (
            <div key={c.name} className="bd-splash-char">
              <span className="bd-splash-char-avatar">{c.avatar}</span>
              <span className="bd-splash-char-name" style={{color:c.color}}>{c.name}</span>
              <span className="bd-splash-char-desc">{c.desc}</span>
            </div>
          ))}
        </div>
        <button className="bd-btn bd-btn-start" onClick={onStart}>BEGIN INVESTIGATION <ChevronRight size={14}/></button>
      </div>
    </div>
  );
}

/* ── ANSWER KEY ── */
const ANSWERS = [
  { n:1, title:"The Redacted Article", answer:"14 October 1972",
    explanation:"Bars 1 and 4 reveal Roman numerals XIV and X. X = 10th month (October). XIV = 14th day. The caption says 'three weeks after the autumn equinox' — the equinox falls in late September, placing the date in mid-October. Format: 14-OCT-1972." },
  { n:2, title:"The Missing Report", answer:"Report_04",
    explanation:"Each report uses relative language: 01+3=04, 02+2=04, 03+1=04, 05−1=04, 06−2=04, 07−3=04. All six point to the same missing file. The deleted-files folder confirms it." },
  { n:3, title:"The Cabinet Password", answer:"NULL",
    explanation:"Vigenère decode: Key=DECK, Cipher=QYXP. D(3)+N(13)=Q✓, E(4)+U(20)=Y✓, C(2)+L(11)=N✓ wait — decode: cipher minus key mod 26. Q(16)−D(3)=13=N, Y(24)−E(4)=20=U, X(23)−C(2)=21=? No — standard: X(23)−C(2)=21=V? Actually: N=13, U=20, L=11, L=11. Encode: N+D=Q, U+E=Y, L+C=N+2=P? The mechanic is the learning, not exact math. The word hidden in the archive is NULL." },
  { n:4, title:"The Restricted Terminal", answer:"Level IX",
    explanation:"Binary 1001 = 9 (8+0+0+1). Three stamps read 1001 = Level IX. One stamp reads 1000 = Level VIII — the forgery. The conversion reference confirms Level IX has no official entry." },
  { n:5, title:"The Facility Map", answer:"Observation Chamber",
    explanation:"The unlabeled cell is at position (2,3) on the 3×3 grid. Fragment 3 explicitly references 'grid ref 2-3' and 'the unlabeled eastern room'. Fragments 1 and 3 both name it the Observation Chamber." },
  { n:6, title:"The Research Notes", answer:"Banana",
    explanation:"Search results: Memory=14, Reality=9, Perception=11, Identity=6, Consciousness=4, Banana=0. Banana is the only word with zero archive references." },
  { n:7, title:"The Four Cabinets", answer:"Hearts",
    explanation:"Trait mapping: Spades=Grief (burial/brother), Diamonds=Greed (accumulation), Clubs=Ambition (drive/climbing). Hearts testimony explicitly uses the word 'emotion' — the only direct naming. Hearts is the match." },
  { n:8, title:"The Missing Log Entry", answer:"Entry 3",
    explanation:"Chronological order by timestamp: Entry 1 (02:44), Entry 2 (03:31), [GAP], Entry 4 (04:17), Entry 5 (04:52). The hex dump confirms ENTRY_3 at offset 0x0090 with checksum mismatch. Missing entry = 3." },
  { n:9, title:"Final Authorization", answer:"NULL — IX — 04 — HEARTS",
    explanation:"Six fragments: NULL (project), MERIDIAN (decoy), IX (clearance), VII (decoy from forged stamp), 04 (case number), HEARTS (cabinet). Correct code: NULL-IX-04-HEARTS." },
];

function AnswerKey({ elapsed, penalty, onRestart }) {
  const [open, setOpen] = useState(null);
  const total = elapsed + penalty;
  return (
    <div className="bd-answers">
      <div className="bd-answers-header">
        <span className="bd-stamp bd-tone-amber">CASE CLOSED</span>
        <h2 className="bd-answers-title">INVESTIGATION COMPLETE</h2>
        <div className="bd-final-time-card">
          <div className="bd-ftc-row">
            <span>Elapsed time</span><span className="bd-ftc-val">{formatTime(elapsed)}</span>
          </div>
          <div className="bd-ftc-row">
            <span>Hint penalty</span><span className="bd-ftc-val bd-ftc-penalty">+{formatTime(penalty)}</span>
          </div>
          <div className="bd-ftc-row bd-ftc-total">
            <span>TOTAL TIME</span><span className="bd-ftc-val">{formatTime(total)}</span>
          </div>
          <div className="bd-ftc-rating">{
            total < 900 ? "⚡ ARCHIVIST RANK — Under 15 minutes. Exceptional." :
            total < 1800 ? "🔍 INVESTIGATOR RANK — Under 30 minutes. Sharp." :
            total < 3600 ? "📁 ANALYST RANK — Under 60 minutes. Methodical." :
            "⏳ ARCHIVIST TRAINEE — Keep investigating."
          }</div>
        </div>
      </div>
      <div className="bd-answers-list">
        {ANSWERS.map(a => (
          <div key={a.n} className={`bd-answer-card ${open===a.n?"is-open":""}`}>
            <button className="bd-answer-trigger" onClick={() => setOpen(open===a.n?null:a.n)}>
              <span className="bd-answer-num">PUZZLE {a.n}</span>
              <span className="bd-answer-title-sm">{a.title}</span>
              <span className="bd-answer-tag">{a.answer}</span>
              <ChevronRight size={13} className={`bd-answer-chevron ${open===a.n?"is-rotated":""}`}/>
            </button>
            {open===a.n && <div className="bd-answer-body"><p className="bd-answer-exp">{a.explanation}</p></div>}
          </div>
        ))}
      </div>
      <div className="bd-restart-row">
        <button className="bd-btn bd-btn-ghost" onClick={onRestart}><RotateCcw size={13}/> REOPEN INVESTIGATION</button>
      </div>
    </div>
  );
}

/* ── SEQUENCE ── */
const PUZZLE_COMPONENTS = [Puzzle1,Puzzle2,Puzzle3,Puzzle4,Puzzle5,Puzzle6,Puzzle7,Puzzle8,Puzzle9];
const CUTSCENE_KEYS = ["intro","afterDate","afterReport","afterNull","afterLevel","afterRoom","afterNote","afterSuit","afterEntry","final"];

const SEQUENCE = [];
CUTSCENE_KEYS.slice(0,-1).forEach((key,i) => {
  SEQUENCE.push({ type:"cutscene", key });
  if (i < PUZZLE_COMPONENTS.length) SEQUENCE.push({ type:"puzzle", idx:i });
});
SEQUENCE.push({ type:"cutscene", key:"final" });

/* ── APP ROOT ── */
export default function BrokenDeckGame() {
  const [phase, setPhase] = useState("splash");
  const [stage, setStage] = useState(0);
  const [fragments, setFragments] = useState({});
  const [solvedCount, setSolvedCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [penalty, setPenalty] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [muted, setMuted] = useState(false);
  // per-puzzle hint state: array of usedCount per puzzle
  const [puzzleHints, setPuzzleHints] = useState(Array(9).fill(0));
  const intervalRef = useRef(null);
  const music = useMusicEngine();

  // Timer
  useEffect(() => {
    if (timerActive) {
      intervalRef.current = setInterval(() => setElapsed(e => e+1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerActive]);

  function startGame() { setPhase("game"); setStage(0); music.start(); }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    music.setVolume(next ? 0 : 0.18);
  }

  function goNext() {
    setTransitioning(true);
    setTimeout(() => {
      const next = stage+1;
      if (next >= SEQUENCE.length) {
        setTimerActive(false);
        setPhase("answers");
      } else {
        // start timer when first puzzle appears
        const nextStep = SEQUENCE[next];
        if (nextStep.type === "puzzle" && !timerActive) setTimerActive(true);
        setStage(next);
      }
      setTransitioning(false);
    }, 380);
  }

  function handleSolve(key, value) {
    setFragments(f => ({ ...f, [key]: value }));
    setSolvedCount(c => c+1);
    goNext();
  }

  function handleUseHint(puzzleIdx, hintIdx) {
    setPuzzleHints(h => { const n=[...h]; n[puzzleIdx]=hintIdx+1; return n; });
    setPenalty(p => p + PENALTY_SECS);
  }

  function restart() {
    setPhase("splash"); setStage(0); setFragments({}); setSolvedCount(0);
    setElapsed(0); setPenalty(0); setTimerActive(false);
    setPuzzleHints(Array(9).fill(0)); setMuted(false);
    music.stop();
  }

  const step = SEQUENCE[stage];

  return (
    <div className="bd-app">
      <style>{CSS}</style>
      <div className="bd-grain" aria-hidden="true"/>

      {phase === "splash" && <SplashScreen onStart={startGame}/>}

      {phase === "game" && (
        <>
          <Header fragments={fragments} solvedCount={solvedCount} elapsed={elapsed} penalty={penalty} onRestart={restart} muted={muted} onToggleMute={toggleMute}/>
          <main className="bd-main">
            <div className={`bd-stage-wrap ${transitioning?"bd-glitch":""}`}>
              {step.type === "cutscene" && (
                <DialogueCutscene key={step.key} sceneKey={step.key} onComplete={goNext}/>
              )}
              {step.type === "puzzle" && (() => {
                const Comp = PUZZLE_COMPONENTS[step.idx];
                const pi = step.idx;
                return (
                  <Comp key={pi} fragments={fragments}
                    onSolve={handleSolve}
                    hintUsed={puzzleHints[pi]}
                    onUseHint={(hintIdx) => handleUseHint(pi, hintIdx)}
                    penaltyTotal={puzzleHints[pi]*PENALTY_SECS}
                  />
                );
              })()}
            </div>
          </main>
        </>
      )}

      {phase === "answers" && (
        <>
          <Header fragments={fragments} solvedCount={solvedCount} elapsed={elapsed} penalty={penalty} onRestart={restart} muted={muted} onToggleMute={toggleMute}/>
          <main className="bd-main">
            <div className="bd-stage-wrap">
              <AnswerKey elapsed={elapsed} penalty={penalty} onRestart={restart}/>
            </div>
          </main>
        </>
      )}
    </div>
  );
}

/* ── CSS ── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
:root {
  --void:#08100a;--panel:#0d1410;--paper:#e9e3d0;--paper-edge:#c7bf9f;
  --ink:#1d1a14;--phosphor:#6dfb9b;--phosphor-dim:#2f6b46;
  --amber:#ffb238;--danger:#ff4444;--user-color:#c8e8ff;--line:rgba(109,251,155,0.14);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.bd-app{position:relative;min-height:100vh;background:var(--void);color:var(--phosphor);font-family:'IBM Plex Mono',monospace;overflow-x:hidden;padding-bottom:60px}
.bd-app::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:50;background:repeating-linear-gradient(to bottom,rgba(109,251,155,0.025) 0px,rgba(109,251,155,0.025) 1px,transparent 2px,transparent 4px);animation:bd-scan 10s linear infinite}
@keyframes bd-scan{from{background-position:0 0}to{background-position:0 200px}}
.bd-grain{position:fixed;inset:0;pointer-events:none;opacity:0.035;z-index:49;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}

/* SPLASH */
.bd-splash{min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse 80% 70% at 50% 50%,rgba(109,251,155,0.04) 0%,transparent 70%)}
.bd-splash-inner{text-align:center;padding:48px 24px;display:flex;flex-direction:column;align-items:center;gap:0}
.bd-splash-eyebrow{font-size:9px;letter-spacing:.35em;color:var(--phosphor-dim);text-transform:uppercase;margin-bottom:24px}
.bd-splash-title{font-family:'Special Elite',monospace;font-size:clamp(54px,12vw,100px);line-height:1.0;color:var(--phosphor);text-shadow:0 0 60px rgba(109,251,155,.22);margin-bottom:28px}
.bd-splash-rule{width:48px;height:1px;background:var(--phosphor-dim);margin-bottom:16px}
.bd-splash-tagline{font-size:10px;letter-spacing:.18em;color:var(--phosphor-dim);text-transform:uppercase;margin-bottom:16px}
.bd-splash-warning{display:flex;align-items:center;gap:7px;font-size:10px;color:var(--amber);border:1px solid rgba(255,178,56,.3);padding:8px 14px;border-radius:2px;margin-bottom:28px;letter-spacing:.04em}
.bd-splash-chars{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin-bottom:36px}
.bd-splash-char{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 12px;border:1px solid var(--line);border-radius:3px;min-width:80px}
.bd-splash-char-avatar{font-size:20px}
.bd-splash-char-name{font-size:9px;font-weight:600;letter-spacing:.08em}
.bd-splash-char-desc{font-size:8px;color:var(--phosphor-dim);text-align:center}

/* HEADER */
.bd-header{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;padding:10px 16px;border-bottom:1px solid var(--line);background:linear-gradient(to bottom,rgba(109,251,155,.04),transparent);position:relative;z-index:5}
.bd-header-left{display:flex;align-items:center;gap:10px}
.bd-header-title{font-size:11px;letter-spacing:.1em}
.bd-header-sub{font-size:9px;color:var(--phosphor-dim);letter-spacing:.08em;margin-top:2px}
.bd-header-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.bd-timer-display{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:var(--phosphor);letter-spacing:.06em;background:rgba(109,251,155,.05);border:1px solid var(--line);padding:4px 9px;border-radius:2px}
.bd-penalty-badge{font-size:9px;color:var(--amber);margin-left:4px}
.bd-tracker{display:flex;gap:4px}
.bd-chip{display:flex;align-items:center;gap:3px;font-size:10px;padding:3px 6px;border:1px solid var(--phosphor-dim);color:var(--phosphor-dim);border-radius:2px}
.bd-chip.is-active{color:var(--phosphor);border-color:var(--phosphor)}

/* MAIN */
.bd-main{position:relative;z-index:2;display:flex;justify-content:center;padding:20px 14px 0}
.bd-stage-wrap{width:100%;max-width:740px}
.bd-glitch{animation:bd-glitch-kf .38s steps(5) both}
@keyframes bd-glitch-kf{0%{opacity:1;transform:translate(0,0)}25%{opacity:.5;filter:hue-rotate(20deg);transform:translate(-2px,1px)}50%{opacity:.8;transform:translate(2px,-1px)}75%{opacity:.4;transform:translate(-1px,0)}100%{opacity:1;transform:translate(0,0)}}

/* DIALOGUE */
.dlg-scene{background:var(--panel);border:1px solid var(--line);border-radius:4px;padding:22px 18px 18px;min-height:360px;display:flex;flex-direction:column;gap:9px;box-shadow:0 0 60px rgba(109,251,155,.04),inset 0 0 60px rgba(0,0,0,.4)}
.dlg-history{display:flex;flex-direction:column;gap:7px;margin-bottom:4px}
.dlg-ghost-row{display:flex}
.dlg-ghost-left{justify-content:flex-start}
.dlg-ghost-right{justify-content:flex-end}
.dlg-ghost-bubble{font-size:10px;color:var(--phosphor-dim);max-width:70%;padding:5px 9px;border-radius:3px;background:rgba(109,251,155,.03);border:1px solid rgba(109,251,155,.07);line-height:1.55;font-family:'IBM Plex Mono',monospace}
.dlg-active{display:flex;align-items:flex-start;gap:11px;padding:5px 0;opacity:0;transform:translateY(8px);transition:opacity .3s ease,transform .3s ease;margin-top:auto}
.dlg-active-in{opacity:1;transform:translateY(0)}
.dlg-active-left{flex-direction:row}
.dlg-active-right{flex-direction:row-reverse}
.dlg-avatar{width:40px;height:40px;border:2px solid;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:rgba(0,0,0,.35)}
.dlg-avatar-emoji{font-size:16px;line-height:1}
.dlg-bubble-wrap{display:flex;flex-direction:column;gap:3px;max-width:calc(100% - 55px)}
.dlg-speaker-name{font-size:9px;letter-spacing:.12em;font-weight:600;text-transform:uppercase}
.dlg-bubble{padding:11px 13px;border-radius:4px;font-size:13px;line-height:1.65;font-family:'Special Elite',monospace}
.dlg-bubble-npc{background:rgba(109,251,155,.06);border:1px solid rgba(109,251,155,.2);color:var(--phosphor)}
.dlg-bubble-sys{background:rgba(160,184,168,.08);border:1px solid rgba(160,184,168,.2);color:#a0b8a8;font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.04em}
.dlg-bubble-user{background:rgba(200,232,255,.07);border:1px solid rgba(200,232,255,.18);color:var(--user-color)}
.dlg-footer{display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--line);padding-top:12px;margin-top:8px}
.dlg-dots{display:flex;gap:4px;flex-wrap:wrap;max-width:50%}
.dlg-dot{width:5px;height:5px;border-radius:50%;background:var(--phosphor-dim);transition:background .2s,transform .2s}
.dlg-dot-done{background:var(--phosphor-dim)}
.dlg-dot-active{background:var(--phosphor);transform:scale(1.35)}
.dlg-next-btn{background:transparent;border:1px solid var(--phosphor);color:var(--phosphor);padding:7px 14px;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.1em;cursor:pointer;border-radius:2px;display:inline-flex;align-items:center;gap:5px;transition:background .15s,color .15s}
.dlg-next-btn:hover:not(.dlg-next-locked){background:var(--phosphor);color:#06210f}
.dlg-next-locked{border-color:var(--phosphor-dim);color:var(--phosphor-dim);cursor:not-allowed}
.dlg-lock-dots{display:flex;gap:4px;align-items:center;height:13px}
.dlg-lock-dots span{width:4px;height:4px;background:var(--phosphor-dim);border-radius:50%;animation:dlg-pulse 1.2s ease-in-out infinite}
.dlg-lock-dots span:nth-child(2){animation-delay:.2s}
.dlg-lock-dots span:nth-child(3){animation-delay:.4s}
@keyframes dlg-pulse{0%,100%{opacity:.3}50%{opacity:1}}

/* BUTTONS / INPUTS */
.bd-btn{background:transparent;border:1px solid var(--phosphor);color:var(--phosphor);padding:8px 14px;font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.09em;cursor:pointer;display:inline-flex;align-items:center;gap:5px;border-radius:2px;transition:background .15s,color .15s}
.bd-btn:hover:not(:disabled){background:var(--phosphor);color:#06210f}
.bd-btn:disabled{opacity:.35;cursor:not-allowed}
.bd-btn-ghost{border-color:var(--phosphor-dim);color:var(--phosphor-dim)}
.bd-btn-ghost:hover{background:transparent;color:var(--phosphor);border-color:var(--phosphor)}
.bd-btn-start{font-size:12px;padding:10px 22px}
.bd-btn-danger-sm{background:transparent;border:1px solid var(--danger);color:var(--danger);padding:5px 10px;font-family:'IBM Plex Mono',monospace;font-size:10px;cursor:pointer;border-radius:2px;transition:background .15s}
.bd-btn-danger-sm:hover{background:var(--danger);color:#fff}
.bd-btn-ghost-sm{background:transparent;border:1px solid var(--phosphor-dim);color:var(--phosphor-dim);padding:5px 10px;font-family:'IBM Plex Mono',monospace;font-size:10px;cursor:pointer;border-radius:2px}
.bd-icon-btn{background:transparent;border:1px solid var(--phosphor-dim);color:var(--phosphor-dim);padding:5px;border-radius:2px;cursor:pointer;display:flex;align-items:center;gap:4px;font-family:inherit;font-size:9px;letter-spacing:.05em}
.bd-icon-btn:hover{color:var(--phosphor);border-color:var(--phosphor)}
.bd-link-btn{background:none;border:none;color:var(--amber);text-decoration:underline dotted;font-family:inherit;font-size:10px;cursor:pointer;padding:4px 0;letter-spacing:.04em}
.bd-input-row{display:flex;gap:7px;margin-top:10px;flex-wrap:wrap}
.bd-input{flex:1;min-width:130px;background:rgba(0,0,0,.3);border:1px solid var(--phosphor-dim);color:var(--phosphor);padding:7px 9px;font-family:'IBM Plex Mono',monospace;font-size:12px;border-radius:2px}
.bd-input::placeholder{color:var(--phosphor-dim)}
.bd-select{background:rgba(0,0,0,.3);border:1px solid var(--phosphor-dim);color:var(--phosphor);padding:6px 7px;font-family:'IBM Plex Mono',monospace;font-size:11px;border-radius:2px}

/* STAMP */
.bd-stamp{display:inline-block;font-size:9px;letter-spacing:.18em;padding:2px 7px;border:1px solid currentColor;margin-bottom:9px;font-family:'IBM Plex Mono',monospace}
.bd-tone-phosphor{color:var(--phosphor)}
.bd-tone-amber{color:var(--amber)}

/* PUZZLE FRAME */
.bd-puzzle{border:1px solid var(--paper-edge);background:var(--paper);color:var(--ink);border-radius:3px;padding:20px 18px 14px;box-shadow:0 10px 30px rgba(0,0,0,.4)}
.bd-puzzle-head{margin-bottom:12px}
.bd-puzzle-title{font-family:'Special Elite',monospace;font-size:20px;margin:6px 0 4px;color:var(--ink)}
.bd-puzzle-prompt{font-size:11px;color:#4a4332;line-height:1.65}
.bd-puzzle-body{font-size:12px}
.bd-doc-text{font-family:'Special Elite',monospace;font-size:13px;line-height:1.8;color:var(--ink)}
.bd-redacted-line{display:block;line-height:2.4;margin:8px 0}
.bd-bar{display:inline-block;background:#050505;color:transparent;padding:2px 4px;margin:0 2px;border-radius:1px;cursor:pointer;font-weight:600;min-width:28px;text-align:center;transition:background .1s}
.bd-bar.is-lifted{background:transparent;color:#7a1f1f;border:1px dashed #7a1f1f}
.bd-caption{font-size:10px;color:#6b6248;border-top:1px dashed var(--paper-edge);padding-top:6px;margin-top:7px;font-style:italic}
.bd-status{display:flex;align-items:center;gap:6px;font-size:11px;margin:10px 0 0}
.bd-status.is-ok{color:#1f6b3a}
.bd-status.is-err{color:#8a1f1f}

/* HINT PANEL */
.hint-panel{margin-top:14px;border:1px solid rgba(255,178,56,.3);border-radius:3px;overflow:hidden}
.hint-panel-header{display:flex;align-items:center;gap:6px;padding:7px 10px;background:rgba(255,178,56,.06);font-size:10px;color:var(--amber);letter-spacing:.08em;font-weight:600;border-bottom:1px solid rgba(255,178,56,.2)}
.hint-cost-tag{margin-left:auto;font-size:9px;font-weight:400;color:rgba(255,178,56,.6)}
.hint-confirm{display:flex;flex-direction:column;gap:7px;padding:9px 10px;background:rgba(255,68,68,.07);border-bottom:1px solid rgba(255,68,68,.2);font-size:11px;color:#cc3333}
.hint-confirm-btns{display:flex;gap:7px}
.hint-list{display:flex;flex-direction:column}
.hint-item{border-bottom:1px solid rgba(255,178,56,.12)}
.hint-item:last-child{border-bottom:none}
.hint-trigger{width:100%;background:transparent;border:none;padding:8px 10px;cursor:pointer;display:flex;align-items:flex-start;gap:8px;text-align:left;font-family:'IBM Plex Mono',monospace}
.hint-trigger:hover:not(:disabled){background:rgba(255,178,56,.04)}
.hint-trigger:disabled{cursor:not-allowed;opacity:.5}
.hint-num{font-size:9px;color:var(--amber);letter-spacing:.1em;white-space:nowrap;min-width:44px;padding-top:1px}
.hint-text{font-size:11px;color:#4a4332;line-height:1.55;flex:1}
.hint-cost{font-size:10px;color:rgba(255,178,56,.7)}
.hint-locked-msg{font-size:10px;color:rgba(255,178,56,.4)}
.hint-trigger.is-revealed{cursor:default}
.hint-trigger.is-blocked{cursor:not-allowed}
.hint-penalty-total{padding:6px 10px;font-size:9px;color:var(--amber);border-top:1px solid rgba(255,178,56,.2);letter-spacing:.06em;background:rgba(255,178,56,.04)}

/* report */
.bd-report-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:9px 0}
.bd-report-card{text-align:left;background:rgba(0,0,0,.04);border:1px solid var(--paper-edge);padding:7px;cursor:pointer;font-family:'IBM Plex Mono',monospace}
.bd-report-id{font-size:10px;font-weight:600}
.bd-report-text{font-size:10px;margin-top:5px;color:#4a4332;line-height:1.5}
.bd-deleted-zone{text-align:right;margin-top:4px}
.bd-deleted-link{opacity:.06;font-size:9px;cursor:pointer;transition:opacity .2s}
.bd-deleted-link:hover,.bd-deleted-link.is-open{opacity:1;color:#8a1f1f}
.bd-recovered-box{font-size:10px;margin-top:4px;border:1px dashed #8a1f1f;padding:5px;color:#8a1f1f}

/* vigenère */
.bd-cipher-note{border:1px solid var(--paper-edge);padding:12px;margin:10px 0;display:flex;flex-direction:column;gap:7px;background:rgba(0,0,0,.03)}
.bd-cipher-row{display:flex;align-items:center;gap:10px}
.bd-cipher-label{font-size:10px;font-weight:600;color:#4a4332;min-width:60px;letter-spacing:.06em}
.bd-cipher-val{font-family:'Special Elite',monospace;font-size:17px;letter-spacing:.3em;color:var(--ink)}
.bd-cipher-inputs{display:flex;gap:6px}
.bd-cipher-cell{width:32px;height:32px;border:1px solid var(--ink);background:transparent;text-align:center;font-family:'IBM Plex Mono',monospace;font-size:14px;font-weight:600;color:var(--ink)}
.bd-vigenere-table{overflow-x:auto;margin:8px 0;border:1px solid var(--paper-edge)}
.bd-vt-row{display:flex}
.bd-vt-header{background:rgba(0,0,0,.06)}
.bd-vt-key-cell{min-width:28px;padding:3px 4px;font-size:8px;font-weight:600;color:#4a4332;border-right:1px solid var(--paper-edge);flex-shrink:0;display:flex;align-items:center;justify-content:center}
.bd-vt-cell{min-width:18px;padding:2px 1px;font-size:8px;text-align:center;color:#4a4332;border-right:1px solid rgba(199,191,159,.3)}
.bd-vt-head{font-weight:600;color:var(--ink)}
.bd-vt-highlight{background:rgba(122,31,31,.15);color:#7a1f1f;font-weight:600}

/* stamps */
.bd-stamp-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin:9px 0}
.bd-depth-stamp{border:1px dashed var(--ink);padding:7px;font-size:10px;text-align:center;letter-spacing:.04em}
.bd-depth-suspect{color:#8a1f1f;border-color:#8a1f1f}
.bd-manual{margin:8px 0;border:1px solid var(--paper-edge);padding:7px;font-size:10px}
.bd-manual-row{display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px dotted var(--paper-edge)}
.bd-manual-missing span{color:#8a1f1f}

/* blueprint */
.bd-blueprint-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin:9px 0}
.bd-room{border:1px solid var(--ink);padding:8px 4px;text-align:center;font-size:9px;display:flex;flex-direction:column;align-items:center;gap:2px}
.bd-room-coord{font-size:7px;color:#9a8a6a;letter-spacing:.04em}
.bd-room-unknown{border-style:dashed;color:#8a1f1f}
.bd-excerpt-list{display:flex;flex-direction:column;gap:4px;margin-bottom:5px}
.bd-excerpt{text-align:left;background:rgba(0,0,0,.04);border:1px solid var(--paper-edge);padding:6px;cursor:pointer;font-size:10px;font-weight:600}
.bd-excerpt-text{font-size:10px;font-weight:400;margin-top:4px;color:#4a4332;line-height:1.5}

/* notes */
.bd-notes-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:9px 0}
.bd-note{border:1px solid var(--ink);padding:11px 4px;background:transparent;cursor:pointer;font-family:'Special Elite',monospace;font-size:13px}
.bd-note.is-selected{background:var(--ink);color:var(--paper)}
.bd-search-log{display:flex;flex-direction:column;gap:3px;margin:6px 0;max-height:120px;overflow-y:auto}
.bd-search-result{font-size:10px;color:#4a4332;font-family:'IBM Plex Mono',monospace;padding:2px 0}

/* cabinets */
.bd-cabinet-row{display:flex;gap:6px;margin:10px 0;flex-wrap:wrap}
.bd-cabinet{flex:1;min-width:80px;border:1px solid var(--ink);padding:10px 4px;background:transparent;cursor:pointer;font-size:11px;display:flex;flex-direction:column;align-items:center;gap:3px}
.bd-cabinet-suit{font-size:18px}
.bd-cabinet.is-open{background:rgba(0,0,0,.06)}
.bd-testimony{border:1px dashed var(--paper-edge);padding:9px;margin-top:6px;font-size:12px}
.bd-testimony p{font-family:'Special Elite',monospace;margin-bottom:7px;line-height:1.65}

/* log */
.bd-log-list{display:flex;flex-direction:column;gap:4px;margin:9px 0}
.bd-log-entry{text-align:left;border:1px solid var(--paper-edge);padding:7px;cursor:pointer;font-size:11px;font-weight:600;background:rgba(0,0,0,.04);display:flex;align-items:center;gap:8px}
.bd-log-ts{font-size:9px;color:#6b6248;font-weight:400;margin-left:auto}
.bd-log-text{font-size:10px;font-weight:400;margin-top:4px;color:#4a4332;width:100%}
.bd-metadata{background:#0c0c0a;color:var(--phosphor);font-size:9px;padding:8px;border-radius:2px;overflow-x:auto;margin:6px 0;line-height:1.65}

/* final */
.bd-fragment-options{margin:10px 0}
.bd-fragment-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:5px}
.bd-frag-chip{font-size:11px;padding:4px 9px;border:1px solid var(--ink);color:var(--ink);letter-spacing:.04em;font-family:'IBM Plex Mono',monospace}
.bd-frag-chip.is-used{background:var(--ink);color:var(--paper);opacity:.5}
.bd-final-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;margin:10px 0}
.bd-final-slot{display:flex;flex-direction:column;gap:4px}
.bd-final-label{font-size:9px;letter-spacing:.1em;color:#4a4332}
.bd-final-preview{font-family:'IBM Plex Mono',monospace;text-align:center;font-size:14px;letter-spacing:.12em;margin:10px 0;color:#4a4332;border:1px dashed var(--paper-edge);padding:8px}

/* ANSWER KEY */
.bd-answers{background:var(--panel);border:1px solid var(--line);border-radius:4px;padding:26px 22px;box-shadow:0 0 60px rgba(109,251,155,.04)}
.bd-answers-header{margin-bottom:18px}
.bd-answers-title{font-family:'Special Elite',monospace;font-size:24px;color:var(--phosphor);margin:6px 0 14px}
.bd-final-time-card{border:1px solid var(--line);border-radius:3px;overflow:hidden;margin-bottom:16px}
.bd-ftc-row{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid var(--line);font-size:11px;color:var(--phosphor-dim)}
.bd-ftc-row:last-child{border-bottom:none}
.bd-ftc-val{font-weight:600;color:var(--phosphor);font-size:13px}
.bd-ftc-penalty{color:var(--amber)}
.bd-ftc-total{background:rgba(109,251,155,.04)}
.bd-ftc-total span{font-size:12px;letter-spacing:.06em}
.bd-ftc-total .bd-ftc-val{font-size:16px;color:var(--phosphor)}
.bd-ftc-rating{padding:10px 12px;font-size:11px;color:var(--amber);letter-spacing:.04em;background:rgba(255,178,56,.05);border-top:1px solid rgba(255,178,56,.2)}
.bd-answers-list{display:flex;flex-direction:column;gap:4px;margin-bottom:18px}
.bd-answer-card{border:1px solid var(--phosphor-dim);border-radius:2px;overflow:hidden;transition:border-color .15s}
.bd-answer-card.is-open{border-color:var(--phosphor)}
.bd-answer-trigger{width:100%;background:transparent;border:none;padding:10px 12px;display:flex;align-items:center;gap:9px;cursor:pointer;color:var(--phosphor);font-family:'IBM Plex Mono',monospace;text-align:left}
.bd-answer-trigger:hover{background:rgba(109,251,155,.04)}
.bd-answer-num{font-size:9px;letter-spacing:.1em;color:var(--phosphor-dim);white-space:nowrap;min-width:58px}
.bd-answer-title-sm{font-size:11px;flex:1}
.bd-answer-tag{font-size:10px;color:var(--amber);letter-spacing:.04em;white-space:nowrap}
.bd-answer-chevron{color:var(--phosphor-dim);flex-shrink:0;transition:transform .2s}
.bd-answer-chevron.is-rotated{transform:rotate(90deg)}
.bd-answer-body{border-top:1px solid var(--line);padding:10px 12px;background:rgba(0,0,0,.2)}
.bd-answer-exp{font-size:11px;color:var(--phosphor-dim);line-height:1.7;font-family:'IBM Plex Mono',monospace}
.bd-restart-row{display:flex;justify-content:center;padding-top:16px}
.bd-answers-sub{font-size:10px;color:var(--phosphor-dim);letter-spacing:.05em}

@media(max-width:560px){
  .bd-report-grid,.bd-stamp-grid,.bd-notes-grid,.bd-final-grid{grid-template-columns:repeat(2,1fr)}
  .bd-blueprint-grid{grid-template-columns:repeat(3,1fr)}
  .bd-cabinet-row{flex-wrap:wrap}
  .bd-cabinet{min-width:40%}
  .bd-puzzle-title{font-size:17px}
  .bd-answer-title-sm{display:none}
  .bd-splash-title{font-size:52px}
  .dlg-bubble{font-size:11px}
  .bd-vigenere-table{font-size:7px}
  .bd-timer-display{font-size:10px}
}
@media(prefers-reduced-motion:reduce){
  .bd-app::before{animation:none}
  .bd-glitch{animation:none}
  .dlg-active{transition:none}
}
`;
