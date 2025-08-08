


// ------------- Tiny key click + chimes -------------
function audioCtxSupported() { return !!(window.AudioContext || window.webkitAudioContext); }
let audioCtx, clickBuffer;
async function initAudio() {
  if (!audioCtxSupported()) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const duration = 0.015, sr = audioCtx.sampleRate, length = Math.floor(duration * sr);
  const buffer = audioCtx.createBuffer(1, length, sr);
  const data = buffer.getChannelData(0);
  for (let i = 0; i  Candy) -------------
const THEMES = {
  amber: {
    '--bg':'#0b0905','--panel':'#100e09','--fg':'#ffbf69','--muted':'#f1a94e','--caret':'#ffb200','--accent':'#ffe8b0','--accent-2':'#ffa94d'
  },
  candy: {
    '--bg':'#0b0b12','--panel':'#0f0f19','--fg':'#e9e7ff','--muted':'#cfcdf2','--caret':'#ff79c6','--accent':'#ffd6e7','--accent-2':'#ff79c6'
  }
};
let currentTheme = 'amber';
function applyTheme(name){
  const root = document.documentElement;
  const t = THEMES[name]; if (!t) return;
  Object.entries(t).forEach(([k,v])=> root.style.setProperty(k,v));
  currentTheme = name;
}
document.getElementById('themeToggle')?.addEventListener('click', ()=>{
  applyTheme(currentTheme === 'amber' ? 'candy' : 'amber');
});

// ------------- Terminal helpers -------------
const PROMPT = "C:\\Users\\Heart>";
const screen = document.getElementById('screen');

function el(tag, cls, text){ const e=document.createElement(tag); if(cls) e.className=cls; if(text!=null) e.textContent=text; return e; }
function appendLine(text=""){ screen.appendChild(document.createTextNode(text+"\n")); }
function appendHTML(html=""){ const div=document.createElement("div"); div.innerHTML=html; screen.appendChild(div); }
function appendBlank(){ appendLine(""); }
function pause(ms){ return new Promise(r=>setTimeout(r,ms)); }

function appendPrompt(){
  const line = el("div");
  const promptSpan = el("span","prompt-line",PROMPT+" ");
  const inputSpan = el("span","prompt-input");
  const cursor = el("span","cursor");
  line.appendChild(promptSpan); line.appendChild(inputSpan); line.appendChild(cursor);
  screen.appendChild(line);
  return { line, promptSpan, inputSpan, cursor };
}
function typeTextTo(node, text, speed=16, withClicks=true){
  return new Promise(resolve=>{
    let i=0;
    const step=()=>{
      if(i{
    const handler=()=>{ window.removeEventListener('keydown',handler); resolve(); };
    window.addEventListener('keydown',handler,{ once:true });
  });
}

// ------------- Extras: speed slider, now playing, hearts -------------
const speedEl = document.getElementById('speedRange');
if (speedEl) {
  speedEl.addEventListener('input', () => {
    const v = parseInt(speedEl.value || '16', 10);
    typing.speed = v;
    typing.cmdSpeed = Math.max(10, v + 10);
  });
}
function setNowPlaying(title){
  const np = document.getElementById('nowPlaying');
  if (!np) return;
  if (title) { np.style.display='block'; np.textContent = `Now Playing: ${title}`; }
  else { np.style.display='none'; }
}
function burstHearts(count=18){
  const c = document.getElementById('hearts'); if (!c) return;
  for(let i=0;i c.removeChild(s), 1600);
  }
}

// ------------- Spotify controls (Space works when iframe focused) -------------
function focusSpotify() {
  const iframe = document.getElementById('spotify-embed');
  if (iframe) iframe.focus();
}
function revealSpotifyEmbed(){
  const wrap = document.getElementById('spotify-embed-wrap');
  if (wrap) {
    wrap.style.display = 'block';
    wrap.style.opacity = '0';
    requestAnimationFrame(()=>{ wrap.style.transition='opacity 500ms ease'; wrap.style.opacity='1'; });
  }
  setTimeout(()=>{ wrap?.scrollIntoView({ behavior: 'smooth', block: 'center' }); focusSpotify(); }, 200);
}

// ------------- Dedication prompt -------------
let dedicateTo = null;
async function askDedication(){
  return new Promise((resolve)=>{
    const name = window.prompt("Who is this mixtape dedicated to?");
    resolve(name && name.trim() ? name.trim() : null);
  });
}

// ------------- Playlist + romantic note -------------
const ROMANTIC_NOTE = [
  "note.txt",
  "",
  "Dear You,",
  "",
  "Some nights feel like open windows—",
  "quiet air, moonlit corners, and a song that knows our names.",
  "This mixtape maps those moments: soft hands, shared secrets,",
  "and the way time slows when your smile finds mine.",
  "",
  "If love were a command, I'd make it default:",
  "  set LOVE /pinned /forever /y",
  "",
  "Press any key when you're ready. I'll be here—always. `${String(i+1).padStart(2,"0")} - ${t.title}.mp3`).join("\n") },
  { type: "blank" },
  { type: "prompt", text: "type note.txt" },
  { type: "type", text: ROMANTIC_NOTE },
  { type: "waitkey" },
  { type: "action", fn: async ()=>{ dedicateTo = await askDedication(); } },
  { type: "action", fn: ()=>{ playChime(740, 0.10); burstHearts(22); revealSpotifyEmbed(); } },
  { type: "type", text: ()=> "╔══════════════════════════════════════════════════╗" },
  { type: "type", text: ()=> `║    "╚══════════════════════════════════════════════════╝" },
  { type: "type", text: "Tip: click the player or press Space (inside the player) to pause/play." },
  { type: "blank" },
  ...playbackBlocks(PLAYLIST),
  { type: "blank" },
  { type: "prompt", text: "echo I love you." },
  { type: "type", text: "I love you. { setNowPlaying(null); playChime(523, 0.16); } },
];

function playbackBlocks(list){
  const blocks=[];
  list.forEach((t, idx)=>{
    const cmd = `play "${t.title}.mp3" /artist:"${t.artist}" /mood:romance`;
    blocks.push({ type: "prompt", text: cmd });
    blocks.push({ type: "type", text: trackHeader(t, idx, list.length) });
    blocks.push({ type: "action", fn: ()=> setNowPlaying(t.title) });
    blocks.push({ type: "type", text: fauxPlayer(t.dur) });
    if ((idx+1) % 5 === 0) blocks.push({ type: "type", text: "REM whisper: you + me + this song = forever" });
    blocks.push({ type: "blank" });
  });
  return blocks;
}
function trackHeader(t, idx, total){
  return [
    `[TRACK ${String(idx+1).padStart(2,"0")}/${String(total).padStart(2,"0")}] ❤`,
    `Title : ${t.title}`,
    `Artist: ${t.artist}`,
    `Length: ${t.dur || "—:—"}`
  ].join("\n");
}
function fauxPlayer(durationStr="3:00"){
  const [mm, ss] = (durationStr||"3:00").split(":").map(Number);
  const totalSec = (isFinite(mm)?mm:3)*60 + (isFinite(ss)?ss:0);
  const barLen = 24, steps = 6, block = "■";
  const out=[];
  for(let i=0;iC:\\&gt; REM CMD Love Mixtape — Press Enter to skip typing`);
  appendBlank();

  for (const item of script) {
    if (item.type === "line") { appendLine(item.text); await pause(typing.linePause); }
    if (item.type === "blank") { appendBlank(); await pause(typing.linePause/2); }
    if (item.type === "prompt") {
      const p = appendPrompt();
      await typeTextTo(p.inputSpan, typeof item.text==='function'?item.text():item.text, typing.cmdSpeed);
      p.cursor.remove();
      appendLine("");
      await pause(typing.linePause);
    }
    if (item.type === "type") {
      const txt = typeof item.text==='function' ? item.text() : item.text;
      await slowOutput(txt);
    }
    if (item.type === "waitkey") { appendLine("Press any key to continue . . ."); await waitKeyPress(); appendBlank(); }
    if (item.type === "action" && typeof item.fn === "function") { await item.fn(); }
  }
  appendPrompt();
})();

// Accessibility: Enter to fast-skip typing
window.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const oldSpeed = typing.speed, oldCmd = typing.cmdSpeed;
    typing.speed = 0; typing.cmdSpeed = 0;
    setTimeout(()=>{ typing.speed = oldSpeed; typing.cmdSpeed = oldCmd; }, 300);
  }
});

// Optional: number keys 1–9 jump to track headers
function jumpToTrack(idx) {
  const headers = Array.from(document.querySelectorAll('.trk-hdr'));
  if (!headers.length) return;
  const target = headers[idx] || headers[headers.length-1];
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
window.addEventListener('keydown', (e) => {
  if (/^[1-9]$/.test(e.key)) {
    const idx = parseInt(e.key, 10) - 1;
    jumpToTrack(idx);
  }
});

// Apply current theme variables on load so live toggle works with either CSS file
applyTheme('amber');
