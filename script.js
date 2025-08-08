

// ------------- Tiny key click + chimes -------------
function audioCtxSupported() { return !!(window.AudioContext || window.webkitAudioContext); }
let audioCtx, clickBuffer;
async function initAudio() {
  try {
    if (!audioCtxSupported()) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const sr = audioCtx.sampleRate, len = Math.floor(0.015 * sr);
    const buf = audioCtx.createBuffer(1, len, sr), data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) * 0.25;
    clickBuffer = buf;
  } catch (e) {
    console.error("Audio context failed:", e);
  }
}
function playClick() { if (!audioCtx || !clickBuffer) return; const s = audioCtx.createBufferSource(); s.buffer = clickBuffer; const g = audioCtx.createGain(); g.gain.value = 0.22; s.connect(g).connect(audioCtx.destination); s.start(); }
function playChime(freq = 880, time = 0.12) { if (!audioCtx) return; const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.type = 'sine'; o.frequency.value = freq; g.gain.setValueAtTime(0.0001, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + time); o.connect(g).connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime + time); }
window.playClick = playClick;

// ------------- Theme toggle (Amber <-> Candy) -------------
const THEMES = { amber: { '--bg': '#0b0905', '--panel': '#100e09', '--fg': '#ffbf69', '--muted': '#f1a94e', '--caret': '#ffb200', '--accent': '#ffe8b0', '--accent-2': '#ffa94d' }, candy: { '--bg': '#0b0b12', '--panel': '#0f0f19', '--fg': '#e9e7ff', '--muted': '#cfcdf2', '--caret': '#ff79c6', '--accent': '#ffd6e7', '--accent-2': '#ff79c6' } };
let currentTheme = 'amber';
function applyTheme(name) { const root = document.documentElement, t = THEMES[name]; if (!t) return; Object.entries(t).forEach(([k, v]) => root.style.setProperty(k, v)); currentTheme = name; }
document.addEventListener('DOMContentLoaded', () => { document.getElementById('themeToggle')?.addEventListener('click', () => applyTheme(currentTheme === 'amber' ? 'candy' : 'amber')); });

// ------------- Terminal helpers -------------
const PROMPT = "C:\\Users\\Heart>";
const screen = document.getElementById('screen');
function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
function appendLine(text = "") { screen.appendChild(document.createTextNode(text + "\n")); }
function appendHTML(html = "") { const d = document.createElement("div"); d.innerHTML = html; screen.appendChild(d); }
function appendBlank() { appendLine(""); }
function pause(ms) { return new Promise(r => setTimeout(r, ms)); }
function appendPrompt() { const line = el("div"); const p = el("span", "prompt-line", PROMPT + " "); const i = el("span", "prompt-input"); const c = el("span", "cursor"); line.appendChild(p); line.appendChild(i); line.appendChild(c); screen.appendChild(line); return { line, promptSpan: p, inputSpan: i, cursor: c }; }
function typeTextTo(node, text, speed = 16, withClicks = true) { return new Promise(res => { let j = 0; const step = () => { if (j < text.length) { node.textContent += text[j++]; if (withClicks) playClick(); setTimeout(step, speed); window.scrollTo(0, document.body.scrollHeight); } else res(); }; step(); }); }
async function slowOutput(text) { const lines = String(text).split("\n"); for (const ln of lines) { const lineNode = el("div"); if (ln.trim().startsWith('<div class="trk-hdr"')) lineNode.innerHTML = ln; else lineNode.textContent = ln; screen.appendChild(lineNode); await pause(typing.speed); screen.appendChild(document.createTextNode("\n")); await pause(typing.speed * 2); } }
function waitKeyPress() { return new Promise(res => { const h = () => { window.removeEventListener('keydown', h); res(); }; window.addEventListener('keydown', h, { once: true }); }); }

// ------------- Extras: speed slider, now playing, hearts -------------
const speedEl = document.getElementById('speedRange');
if (speedEl) { speedEl.addEventListener('input', () => { const v = parseInt(speedEl.value || '16', 10); typing.speed = v; typing.cmdSpeed = Math.max(10, v + 10); }); }
function setNowPlaying(title) { const np = document.getElementById('nowPlaying'); if (!np) return; if (title) { np.style.display = 'block'; np.textContent = `Now Playing: ${title}`; } else { np.style.display = 'none'; } }
function burstHearts(count = 18) { const c = document.getElementById('hearts'); if (!c) return; for (let i = 0; i < count; i++) { const s = document.createElement('div'); s.className = 'heart-fx'; s.textContent = '❤'; s.style.left = Math.random() * 100 + 'vw'; s.style.bottom = (8 + Math.random() * 18) + 'vh'; s.style.animationDelay = (Math.random() * 0.4) + 's'; s.style.color = getComputedStyle(document.documentElement).getPropertyValue('--accent-2').trim() || '#ff79c6'; c.appendChild(s); setTimeout(() => c.removeChild(s), 1600); } }

// ------------- Spotify (focus for Spacebar) -------------
function focusSpotify() { document.getElementById('spotify-embed')?.focus(); }
function revealSpotifyEmbed() { const wrap = document.getElementById('spotify-embed-wrap'); if (wrap) { wrap.style.display = 'block'; wrap.style.opacity = '0'; requestAnimationFrame(() => { wrap.style.transition = 'opacity 500ms ease'; wrap.style.opacity = '1'; }); } setTimeout(() => { wrap?.scrollIntoView({ behavior: 'smooth', block: 'center' }); focusSpotify(); }, 200); }

// ------------- Dedication -------------
let dedicateTo = null;
async function askDedication() { return new Promise(r => { const name = window.prompt("Who is this mixtape dedicated to?"); r(name && name.trim() ? name.trim() : null); }); }

// ------------- Content -------------
const ROMANTIC_NOTE = ["note.txt", "", "Dear You,", "", "Some nights feel like open windows—", "quiet air, moonlit corners, and a song that knows our names.", "This mixtape maps those moments: soft hands, shared secrets,", "and the way time slows when your smile finds mine.", "", "If love were a command, I'd make it default:", "  set LOVE /pinned /forever /y", "", "Press any key when you're ready. I'll be here—always. <3"].join("\n");
const PLAYLIST = [{ title: "End of Beginning", artist: "Djo", dur: "3:55" }, { title: "Die With A Smile", artist: "Lady Gaga, Bruno Mars", dur: "3:45" }, { title: "Ordinary", artist: "Alex Warren", dur: "3:05" }, { title: "blue", artist: "yung kai", dur: "2:58" }, { title: "Belong Together", artist: "Mark Ambor", dur: "2:38" }, { title: "Until I Found You (with Em Beihold)", artist: "Stephen Sanchez, Em Beihold", dur: "2:57" }, { title: "Let Her Go (feat. Ed Sheeran) - Anniversary Edition", artist: "Passenger, Ed Sheeran", dur: "3:45" }, { title: "Infinity", artist: "Jaymes Young", dur: "3:57" }, { title: "Young And Beautiful", artist: "Lana Del Rey", dur: "3:56" }, { title: "Summertime Sadness", artist: "Lana Del Rey", dur: "4:25" }, { title: "Diet Mountain Dew", artist: "Lana Del Rey", dur: "3:42" }, { title: "Lay All Your Love On Me", artist: "ABBA", dur: "4:35" }, { title: "Mr. Loverman", artist: "Ricky Montgomery", dur: "3:23" }, { title: "I Wanna Be Yours", artist: "Arctic Monkeys", dur: "3:04" }, { title: "The Night We Met", artist: "Lord Huron", dur: "3:28" }, { title: "Night Changes", artist: "One Direction", dur: "3:46" }, { title: "Dandelions", artist: "Ruth B.", dur: "3:55" }, { title: "Until I Found You", artist: "Stephen Sanchez", dur: "2:57" }, { title: "That’s So True", artist: "Gracie Abrams", dur: "2:46" }, { title: "Heather", artist: "Conan Gray", dur: "3:18" }, { title: "Apocalypse", artist: "Cigarettes After Sex", dur: "4:50" }, { title: "Runaway", artist: "AURORA", dur: "4:11" }, { title: "golden hour", artist: "JVKE", dur: "3:29" }, { title: "I Love You So", artist: "The Walters", dur: "2:40" }, { title: "Line Without a Hook", artist: "Ricky Montgomery", dur: "3:38" }, { title: "i'm yours", artist: "Isabel LaRosa", dur: "2:45" }, { title: "Let Me Down Slowly (feat. Alessia Cara)", artist: "Alec Benjamin, Alessia Cara", dur: "2:49" }, { title: "we fell in love in october", artist: "girl in red", dur: "3:04" }, { title: "deja vu", artist: "Olivia Rodrigo", dur: "3:35" }, { title: "Yellow", artist: "Coldplay", dur: "4:29" }];

// ------------- Flow -------------
const typing = { speed: 16, cmdSpeed: 28, linePause: 260 };
const script = [
    { type: "line", text: "Microsoft Windows [Version 10.0.19045]" },
    { type: "line", text: "(c) Microsoft Corporation. All rights reserved." },
    { type: "blank" },
    { type: "prompt", text: "echo Initializing love.exe ..." },
    { type: "type", text: "[ OK ] Loaded memories: sunsets, late-night calls, quiet laughter" },
    { type: "type", text: "[ OK ] Set HEART=YOURS" },
    { type: "blank" },
    { type: "prompt", text: "dir /b playlist\\love\\" },
    { type: "type", text: PLAYLIST.map((t, i) => `${String(i + 1).padStart(2, "0")} - ${t.title}.mp3`).join("\n") },
    { type: "blank" },
    { type: "prompt", text: "type note.txt" },
    { type: "type", text: ROMANTIC_NOTE },
    { type: "waitkey" },
    { type: "action", fn: async () => { dedicateTo = await askDedication(); } },
    { type: "action", fn: () => { playChime(740, 0.10); burstHearts(22); revealSpotifyEmbed(); } },
    { type: "type", text: () => "╔══════════════════════════════════════════════════╗" },
    { type: "type", text: () => `║   <3 Now playing for ${dedicateTo || "You"} — our love mixtape <3   ║` },
    { type: "type", text: () => "╚══════════════════════════════════════════════════╝" },
    { type: "type", text: "Tip: click the player or press Space (inside the player) to pause/play." },
    { type: "blank" },
    ...playbackBlocks(PLAYLIST),
    { type: "blank" },
    { type: "prompt", text: "echo I love you." },
    { type: "type", text: "I love you. <3" },
    { type: "blank" },
    { type: "type", text: "End of playlist." },
    { type: "action", fn: () => { setNowPlaying(null); playChime(523, 0.16); } }
];
function playbackBlocks(list) { const blocks = []; list.forEach((t, idx) => { const cmd = `play "${t.title}.mp3" /artist:"${t.artist}" /mood:romance`; blocks.push({ type: "prompt", text: cmd }); blocks.push({ type: "type", text: trackHeader(t, idx, list.length) }); blocks.push({ type: "action", fn: () => setNowPlaying(t.title) }); blocks.push({ type: "type", text: fauxPlayer(t.dur) }); if ((idx + 1) % 5 === 0) blocks.push({ type: "type", text: "REM whisper: you + me + this song = forever" }); blocks.push({ type: "blank" }); }); return blocks; }
function trackHeader(t, idx, total) { return [`<div class="trk-hdr">[TRACK ${String(idx + 1).padStart(2, "0")}/${String(total).padStart(2, "0")}] ❤</div>`, `Title : ${t.title}`, `Artist: ${t.artist}`, `Length: ${t.dur || "—:—"}`].join("\n"); }
function fauxPlayer(durationStr = "3:00") { const [mm, ss] = (durationStr || "3:00").split(":").map(Number); const totalSec = (isFinite(mm) ? mm : 3) * 60 + (isFinite(ss) ? ss : 0); const barLen = 24, steps = 6, block = "■"; const out = []; for (let i = 0; i <= steps; i++) { const p = Math.round((i / steps) * barLen); const bar = "[" + block.repeat(p) + "-".repeat(barLen - p) + "]"; const cur = Math.round((i / steps) * totalSec); const m = Math.floor(cur / 60).toString().padStart(2, "0"); const s = (cur % 60).toString().padStart(2, "0"); out.push(`${bar} ${m}:${s} / ${durationStr}  <3`); } return out.join("\n"); }

// ------------- Runner -------------
(async function run() {
    applyTheme('amber');
    await initAudio();
    screen.innerHTML = "";
    appendHTML(`<div class="note">C:\\&gt; REM CMD Love Mixtape — Press <span class="kbd">Enter</span> to skip typing</div>`);
    appendBlank();
    for (const item of script) {
        if (item.type === "line") { appendLine(item.text); await pause(typing.linePause); }
        if (item.type === "blank") { appendBlank(); await pause(typing.linePause / 2); }
        if (item.type === "prompt") { const p = appendPrompt(); const txt = typeof item.text === "function" ? item.text() : item.text; await typeTextTo(p.inputSpan, txt, typing.cmdSpeed); p.cursor.remove(); appendLine(""); await pause(typing.linePause); }
        if (item.type === "type") { const txt = typeof item.text === "function" ? item.text() : item.text; await slowOutput(txt); }
        if (item.type === "waitkey") { appendLine("Press any key to continue . . ."); await waitKeyPress(); appendBlank(); }
        if (item.type === "action" && typeof item.fn === "function") { await item.fn(); }
    }
    appendPrompt();
})();

// Accessibility: Enter to fast-skip typing
window.addEventListener('keydown', e => { if (e.key === 'Enter') { const os = typing.speed, oc = typing.cmdSpeed; typing.speed = 0; typing.cmdSpeed = 0; setTimeout(() => { typing.speed = os; typing.cmdSpeed = oc; }, 300); } });

// Optional: number keys 1–9 jump to track headers
function jumpToTrack(idx) { const headers = [...document.querySelectorAll('.trk-hdr')]; if (!headers.length) return; (headers[idx] || headers[headers.length - 1]).scrollIntoView({ behavior: 'smooth', block: 'center' }); }
window.addEventListener('keydown', e => { if (/^[1-9]$/.test(e.key)) { jumpToTrack(parseInt(e.key, 10) - 1); } });
