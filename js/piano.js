// Aba Piano: notas caindo (assistir / tocar junto / esperar), teclado USB-MIDI, microfone, músicas prontas,
// abrir arquivo MIDI, partitura (VexFlow), tirar melodia de áudio/vídeo e treino de leitura.
"use strict";

// ---------- músicas prontas (domínio público) ----------
function mkSong(id, title, sub, bpm, num, den, key, rh, lh) {
  const notes = [];
  [[rh, "R"], [lh, "L"]].forEach(([sp, h]) => { if (!sp) return; parseSpec(sp).ev.forEach(e => e.notes.forEach(m => notes.push({ t: e.beat, d: e.dur, m, h }))); });
  notes.sort((a, b) => a.t - b.t || a.m - b.m);
  return { id, title, sub, bpm, num, den, key, notes };
}
const SONGS = [
  mkSong("brilha", "Brilha, brilha estrelinha", "Fácil · Dó maior · melodia + baixo", 92, 4, 4, "C",
    "C4 C4 G4 G4 A4 A4 G4:2 F4 F4 E4 E4 D4 D4 C4:2 G4 G4 F4 F4 E4 E4 D4:2 G4 G4 F4 F4 E4 E4 D4:2 C4 C4 G4 G4 A4 A4 G4:2 F4 F4 E4 E4 D4 D4 C4:2",
    "C3:4 F3:2 C3:2 F3:2 C3:2 G2:2 C3:2 C3:2 G2:2 C3:2 G2:2 C3:2 G2:2 C3:2 G2:2 C3:4 F3:2 C3:2 F3:2 C3:2 G2:2 C3:2"),
  mkSong("cristo", "Cristo me ama", "Fácil · hino infantil (W. Bradbury, 1862)", 96, 4, 4, "C",
    "G4 E4 E4 D4 E4 G4 G4:2 A4 A4 C5 A4 A4 G4 G4:2 G4 E4 E4 D4 E4 G4 G4:2 A4 A4 G4 C4 E4 D4 C4:2",
    "C3:4 C3:4 F2:4 C3:4 C3:4 C3:4 F2:2 C3:2 G2:2 C3:2"),
  mkSong("parabens", "Parabéns a você", "Fácil · 3/4 com anacruse", 100, 3, 4, "C",
    "-:2 G4:0.75 G4:0.25 A4 G4 C5 B4:2 G4:0.75 G4:0.25 A4 G4 D5 C5:2 G4:0.75 G4:0.25 G5 E5 C5 B4 A4 F5:0.75 F5:0.25 E5 C5 D5 C5:3",
    "-:3 C3:3 G2:3 G2:3 C3:3 C3:3 F2:3 C3:1 G2:2 C3:3"),
  mkSong("ode", "Ode à Alegria", "Médio · Beethoven, 9ª Sinfonia (1824)", 100, 4, 4, "C",
    "E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4:1.5 D4:0.5 D4:2 E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4:1.5 C4:0.5 C4:2 D4 D4 E4 C4 D4 E4:0.5 F4:0.5 E4 C4 D4 E4:0.5 F4:0.5 E4 D4 C4 D4 G3:2 E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4:1.5 C4:0.5 C4:2",
    "C3:4 G2:4 C3:4 G2:4 C3:4 G2:4 C3:4 G2:2 C3:2 G2:4 G2:4 G2:4 C3:2 G2:2 C3:4 G2:4 C3:4 G2:2 C3:2"),
  mkSong("noite", "Noite de Paz", "Médio · F. Gruber (1818) · 6/8", 132, 6, 8, "C",
    "G4:1.5 A4:0.5 G4 E4:3 G4:1.5 A4:0.5 G4 E4:3 D5:2 D5 B4:3 C5:2 C5 G4:3 A4:2 A4 C5:1.5 B4:0.5 A4 G4:1.5 A4:0.5 G4 E4:3 A4:2 A4 C5:1.5 B4:0.5 A4 G4:1.5 A4:0.5 G4 E4:3 D5:2 D5 F5:1.5 D5:0.5 B4 C5:3 E5:3 C5:1.5 G4:0.5 E4 G4:1.5 F4:0.5 D4 C4:6",
    "C3:6 C3:6 G2:6 C3:6 F2:6 C3:6 F2:6 C3:6 G2:6 C3:6 C3:3 G2:3 C3:6"),
  mkSong("canon", "Cânon (tema)", "Médio · J. Pachelbel · Ré maior", 72, 4, 4, "D",
    "F#5:2 E5:2 D5:2 C#5:2 B4:2 A4:2 B4:2 C#5:2 D5:2 C#5:2 B4:2 A4:2 G4:2 F#4:2 G4:2 E4:2",
    "D3:2 A2:2 B2:2 F#2:2 G2:2 D2:2 G2:2 A2:2 D3:2 A2:2 B2:2 F#2:2 G2:2 D2:2 G2:2 A2:2")
];
const PZK = "harpa.songs";
function mySongs() { try { return JSON.parse(localStorage.getItem(PZK) || "[]"); } catch (e) { return []; } }
function saveMySongs(a) { try { localStorage.setItem(PZK, JSON.stringify(a.slice(-20))); return true; } catch (e) { toast("Sem espaço para salvar"); return false; } }
function findSong(id) { return SONGS.find(s => s.id === id) || mySongs().find(s => s.id === id); }

// ---------- entrada: teclado MIDI, toque e microfone ----------
const INP = {
  down: new Set(), last: {}, midi: null, midiName: "", appSound: true, listeners: [],
  press(m, src) {
    this.down.add(m); this.last[m] = performance.now();
    if (src !== "midi" || this.appSound) { if (src !== "mic") AU.note(m, AU.now() - .04, 1.2, { v: .8 }); }
    this.listeners.forEach(f => f(m, true, src));
  },
  release(m, src) { this.down.delete(m); this.listeners.forEach(f => f(m, false, src)); },
  on(f) { this.listeners = [f]; },
  async connectMidi() {
    if (!navigator.requestMIDIAccess) { toast("Este navegador não tem MIDI. Use Chrome ou Edge no PC/Android."); return false; }
    try {
      this.midi = await navigator.requestMIDIAccess();
      const bind = () => { const names = []; this.midi.inputs.forEach(i => { names.push(i.name); i.onmidimessage = e => this.msg(e.data); }); this.midiName = names.join(", "); };
      bind(); this.midi.onstatechange = () => { bind(); if (typeof pianoStatus === "function") pianoStatus(); };
      if (!this.midiName) toast("Nenhum teclado encontrado. Ligue o cabo USB e tente de novo.");
      return true;
    } catch (e) { toast("Permissão de MIDI negada"); return false; }
  },
  msg(d) { const st = d[0] & 0xf0; if (st === 0x90 && d[2] > 0) this.press(d[1], "midi"); else if (st === 0x80 || (st === 0x90 && d[2] === 0)) this.release(d[1], "midi"); }
};

// detecção de altura (YIN) para áudio já reduzido a ~11 kHz
function yin(buf, sr, start, W, tmin, tmax) {
  const d = new Float32Array(tmax + 2); let run = 0, best = -1;
  for (let tau = 1; tau <= tmax; tau++) {
    let s = 0; for (let i = 0; i < W; i++) { const x = buf[start + i] - buf[start + i + tau]; s += x * x; }
    run += s; d[tau] = run ? s * tau / run : 1;
    if (tau >= tmin && best < 0 && d[tau] < .15) { while (tau + 1 <= tmax) { let s2 = 0; for (let i = 0; i < W; i++) { const x = buf[start + i] - buf[start + i + tau + 1]; s2 += x * x; } run += s2; const v = run ? s2 * (tau + 1) / run : 1; d[tau + 1] = v; if (v < d[tau]) tau++; else break; } best = tau; break; }
  }
  if (best < 0) return null;
  const a = d[best - 1] || d[best], b = d[best], c = d[best + 1] || d[best], den = a + c - 2 * b, sh = den ? (a - c) / (2 * den) : 0;
  return { f: sr / (best + sh), ap: b };
}
function decimate(x, srIn, target) {
  const k = Math.max(1, Math.round(srIn / target)), n = Math.floor(x.length / k), y = new Float32Array(n);
  for (let i = 0; i < n; i++) { let s = 0; for (let j = 0; j < k; j++) s += x[i * k + j]; y[i] = s / k; }
  return { y, sr: srIn / k };
}
const MIC = {
  on: false, stream: null, ana: null, raf: 0, cur: null, cand: null, cnt: 0, lastRms: 0,
  async start() {
    try { this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }); }
    catch (e) { toast("Sem acesso ao microfone"); return false; }
    const c = AU.init(), src = c.createMediaStreamSource(this.stream); this.ana = c.createAnalyser(); this.ana.fftSize = 4096; src.connect(this.ana);
    this.on = true; this.buf = new Float32Array(this.ana.fftSize); this.loop(); return true;
  },
  stop() { this.on = false; cancelAnimationFrame(this.raf); if (this.stream) this.stream.getTracks().forEach(t => t.stop()); this.stream = null; if (this.cur != null) INP.release(this.cur, "mic"); this.cur = null; },
  loop() {
    if (!this.on) return;
    this.ana.getFloatTimeDomainData(this.buf);
    let rms = 0; for (let i = 0; i < this.buf.length; i++) rms += this.buf[i] * this.buf[i]; rms = Math.sqrt(rms / this.buf.length);
    let m = null;
    if (rms > .012) { const { y, sr } = decimate(this.buf, AU.ctx.sampleRate, 11025); const r = yin(y, sr, 0, Math.min(512, y.length - 160), Math.floor(sr / 1100), Math.floor(sr / 70)); if (r && r.ap < .2) m = Math.round(69 + 12 * Math.log2(r.f / 440)); }
    const onset = rms > this.lastRms * 1.8 && rms > .02;
    if (m != null && (m === this.cand)) this.cnt++; else { this.cand = m; this.cnt = 1; }
    if (m != null && this.cnt >= 2 && (m !== this.cur || onset)) { if (this.cur != null) INP.release(this.cur, "mic"); this.cur = m; INP.press(m, "mic"); }
    if (m == null && this.cur != null && rms < .008) { INP.release(this.cur, "mic"); this.cur = null; }
    this.lastRms = rms * .6 + this.lastRms * .4;
    this.raf = requestAnimationFrame(() => this.loop());
  }
};

// ---------- leitor de arquivo MIDI ----------
function parseMidi(buf) {
  const v = new DataView(buf); let p = 0;
  const str = n => { let s = ""; for (let i = 0; i < n; i++) s += String.fromCharCode(v.getUint8(p++)); return s; };
  const u32 = () => { const x = v.getUint32(p); p += 4; return x; }, u16 = () => { const x = v.getUint16(p); p += 2; return x; };
  const vlq = () => { let x = 0, b; do { b = v.getUint8(p++); x = (x << 7) | (b & 127); } while (b & 128); return x; };
  if (str(4) !== "MThd") throw new Error("não é um arquivo MIDI");
  const hl = u32(), fmt = u16(), nt = u16(), div = u16(); p += hl - 6;
  if (div & 0x8000) throw new Error("formato de tempo SMPTE não suportado");
  let bpm = 0, num = 4, den = 4, ks = 0; const tracks = [];
  for (let t = 0; t < nt && p < v.byteLength; t++) {
    const id = str(4), len = u32(), end = p + len; if (id !== "MTrk") { p = end; continue; }
    let tick = 0, rs = 0; const on = {}, notes = [];
    while (p < end) {
      tick += vlq(); let st = v.getUint8(p);
      if (st < 0x80) st = rs; else { p++; if (st < 0xf0) rs = st; }
      if (st === 0xff) { const ty = v.getUint8(p++), l = vlq(); if (ty === 0x51 && !bpm) bpm = Math.round(60000000 / ((v.getUint8(p) << 16) | (v.getUint8(p + 1) << 8) | v.getUint8(p + 2))); if (ty === 0x58 && t <= 1) { num = v.getUint8(p); den = 1 << v.getUint8(p + 1); } if (ty === 0x59) ks = v.getInt8(p); p += l; continue; }
      if (st === 0xf0 || st === 0xf7) { p += vlq(); continue; }
      const ty = st & 0xf0, ch = st & 15, a = v.getUint8(p++), b = (ty === 0xc0 || ty === 0xd0) ? 0 : v.getUint8(p++);
      if (ch === 9) continue; // bateria fora
      const k = ch * 128 + a;
      if (ty === 0x90 && b > 0) { (on[k] = on[k] || []).push(tick); }
      else if (ty === 0x80 || (ty === 0x90 && b === 0)) { const s = on[k] && on[k].shift(); if (s != null) notes.push({ t: s / div, d: Math.max(.1, (tick - s) / div), m: a }); }
    }
    p = end; if (notes.length) tracks.push(notes);
  }
  if (!tracks.length) throw new Error("o arquivo não tem notas");
  let notes = [];
  if (tracks.length >= 2) { tracks.forEach((tr, i) => tr.forEach(n => notes.push(Object.assign(n, { h: i === 0 ? "R" : "L" })))); }
  else notes = tracks[0].map(n => Object.assign(n, { h: n.m >= 60 ? "R" : "L" }));
  notes = notes.slice(0, 6000).sort((a, b) => a.t - b.t || a.m - b.m);
  const t0 = Math.floor(notes[0].t); notes.forEach(n => n.t -= t0);
  // em compassos de colcheia (x/8) o "tempo" do app é a colcheia
  if (den === 8) notes.forEach(n => { n.t *= 2; n.d *= 2; });
  const KEYS = ["Cb", "Gb", "Db", "Ab", "Eb", "Bb", "F", "C", "G", "D", "A", "E", "B", "F#", "C#"];
  return { bpm: (bpm || 100) * (den === 8 ? 2 : 1), num, den, key: KEYS[ks + 7] || "C", notes };
}

// ---------- tirar melodia de áudio/vídeo ----------
async function transcribeBuffer(ab, onProg) {
  const ch = ab.getChannelData(0), max = Math.min(ch.length, ab.sampleRate * 120);
  const { y, sr } = decimate(ch.subarray(0, max), ab.sampleRate, 11025);
  const W = 384, hop = 128, tmin = Math.floor(sr / 1100), tmax = Math.floor(sr / 70), fr = [];
  let peak = 0; for (let i = 0; i < y.length; i++) peak = Math.max(peak, Math.abs(y[i]));
  const thr = Math.max(.008, peak * .06);
  for (let s = 0, k = 0; s + W + tmax < y.length; s += hop, k++) {
    let rms = 0; for (let i = 0; i < W; i++) rms += y[s + i] * y[s + i]; rms = Math.sqrt(rms / W);
    let m = null; if (rms > thr) { const r = yin(y, sr, s, W, tmin, tmax); if (r && r.ap < .2) m = 69 + 12 * Math.log2(r.f / 440); }
    fr.push({ t: s / sr, m, rms });
    if (k % 400 === 0) { onProg(s / y.length); await new Promise(r => setTimeout(r, 0)); }
  }
  // mediana de 5 quadros
  const med = fr.map((f, i) => { const w = fr.slice(Math.max(0, i - 2), i + 3).map(x => x.m).filter(x => x != null); if (f.m == null || w.length < 3) return null; w.sort((a, b) => a - b); return w[w.length >> 1]; });
  const notes = []; let cur = null, pk = 0, dip = 1e9, dipped = false;
  const dt = hop / sr;
  for (let i = 0; i < fr.length; i++) {
    const m = med[i], r = fr[i].rms;
    // novo ataque: o volume caiu bem (fim da nota anterior) e voltou a subir
    if (cur) { pk = Math.max(pk, r); if (r < pk * .6 && fr[i].t - cur.s > .1) { dipped = true; dip = Math.min(dip, r); } }
    const onset = cur && dipped && r > dip * 1.5 && r > pk * .8;
    if (m == null) { if (cur) { notes.push(cur); cur = null; } continue; }
    const mr = Math.round(m);
    if (!cur || Math.abs(m - cur.mf) > .7 || onset) { if (cur) notes.push(cur); cur = { s: fr[i].t, e: fr[i].t + dt, mf: m, ms: [mr], att: !!onset }; pk = r; dip = 1e9; dipped = false; }
    else { cur.e = fr[i].t + dt; cur.ms.push(mr); cur.mf = cur.mf * .8 + m * .2; }
  }
  if (cur) notes.push(cur);
  let ns = notes.filter(n => n.e - n.s >= .08).map(n => { const c = {}; n.ms.forEach(x => c[x] = (c[x] || 0) + 1); const m = +Object.entries(c).sort((a, b) => b[1] - a[1])[0][0]; return { s: n.s, e: n.e, m, att: n.att }; });
  // junta notas iguais separadas por buracos mínimos
  ns = ns.reduce((a, n) => { const l = a[a.length - 1]; if (l && l.m === n.m && !n.att && n.s - l.e < .015) l.e = n.e; else a.push(n); return a; }, []);
  if (!ns.length) return null;
  // andamento: o que melhor encaixa os inícios numa grade de semicolcheias
  const on = ns.map(n => n.s - ns[0].s); let best = { bpm: 90, err: 1e9 };
  for (let bpm = 60; bpm <= 150; bpm++) { const g = 60 / bpm / 4; let e = 0; on.forEach(t => { const q = t / g; e += Math.abs(q - Math.round(q)); }); e = e / on.length + Math.abs(bpm - 95) / 2000; if (e < best.err) best = { bpm, err: e }; }
  const bpm = best.bpm, bs = 60 / bpm, q = x => Math.round(x * 4) / 4;
  const out = ns.map(n => ({ t: q((n.s - ns[0].s) / bs), d: Math.max(.25, q((n.e - n.s) / bs)), m: n.m, h: "R" }));
  for (let i = 0; i < out.length - 1; i++) if (out[i].t + out[i].d > out[i + 1].t) out[i].d = Math.max(.25, out[i + 1].t - out[i].t);
  // tom provável (perfis de Krumhansl)
  const P = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88], Pm = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
  const h = new Array(12).fill(0); out.forEach(n => h[n.m % 12] += n.d);
  const NM = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
  let bk = { s: -1e9 }; for (let r = 0; r < 12; r++) for (const [prof, minor] of [[P, 0], [Pm, 1]]) { let s = 0; for (let i = 0; i < 12; i++) s += h[(i + r) % 12] * prof[i]; if (minor) s *= .93; if (s > bk.s) bk = { s, r, minor }; }
  const key = bk.minor ? NM[(bk.r + 3) % 12] : NM[bk.r];
  return { bpm, num: 4, den: 4, key, keyName: T.pt(T.parse(NM[bk.r])) + (bk.minor ? " menor" : " maior"), notes: out };
}

// ---------- player de notas caindo ----------
const PZ = { song: null, pos: 0, playing: false, speed: 1, hand: "R", mode: "wait", metro: false, raf: 0, last: 0, groups: [], gi: 0, waiting: false, hits: 0, miss: 0, zoom: 1, flash: {} };
const HC = { R: ["#FF8A3D", "#FFB27A"], L: ["#8C6CFF", "#B9A6FF"] };
function userHand(n) { return PZ.mode !== "watch" && (PZ.hand === "both" || PZ.hand === n.h); }
function pzLoad(song) {
  PZ.song = song; PZ.playing = false; cancelAnimationFrame(PZ.raf);
  const ns = song.notes; let lo = Math.min(...ns.map(n => n.m)), hi = Math.max(...ns.map(n => n.m));
  lo = Math.min(lo, 60) - 2; hi = Math.max(hi, 72) + 2; while (![0, 5].includes(lo % 12)) lo--; while (![4, 11].includes(hi % 12)) hi++;
  if (hi - lo < 24) hi = lo + 23 + (hi % 12 === 4 ? 0 : 0);
  PZ.lo = lo; PZ.hi = hi; PZ.flat = !SHARP_KEYS.includes(song.key) && song.key !== "C"; PZ.end = Math.max(...ns.map(n => n.t + n.d));
  const first = Math.min(...ns.map(n => n.t)); pzReset(Math.floor(first / song.num) * song.num - song.num);
}
function pzReset(pos) {
  PZ.pos = pos; PZ.hits = 0; PZ.miss = 0; PZ.waiting = false;
  const us = PZ.song.notes.filter(userHand); PZ.song.notes.forEach(n => { n.hit = false; n.miss = false; });
  const g = []; us.forEach(n => { const l = g[g.length - 1]; if (l && Math.abs(l.t - n.t) < .06) l.ns.push(n); else g.push({ t: n.t, ns: [n], armed: null }); });
  PZ.groups = g; PZ.gi = g.findIndex(x => x.t >= pos - .01); if (PZ.gi < 0) PZ.gi = g.length;
  pzDraw(); pzHud();
}
function pzKeys(W) {
  const wh = []; for (let m = PZ.lo; m <= PZ.hi; m++) if (WHITE.includes(m % 12)) wh.push(m);
  const ww = W / wh.length, X = {};
  wh.forEach((m, i) => X[m] = { x: i * ww, w: ww, b: false });
  for (let m = PZ.lo; m <= PZ.hi; m++) if (!WHITE.includes(m % 12)) { const l = X[m - 1]; if (l) X[m] = { x: l.x + ww * .68, w: ww * .62, b: true }; }
  return { X, ww };
}
function pzDraw() {
  const cv = $("#pzc"); if (!cv || !PZ.song) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1), W = cv.clientWidth, H = cv.clientHeight;
  if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  const x = cv.getContext("2d"); x.setTransform(dpr, 0, 0, dpr, 0, 0);
  const KH = Math.min(120, H * .24), KT = H - KH, PPB = 70 * PZ.zoom * (PZ.song.den === 8 ? .6 : 1), { X, ww } = pzKeys(W);
  x.fillStyle = "#100C18"; x.fillRect(0, 0, W, H);
  // linhas de oitava e de compasso
  x.strokeStyle = "rgba(255,255,255,.06)"; x.lineWidth = 1;
  for (let m = PZ.lo; m <= PZ.hi; m++) if (m % 12 === 0 && X[m]) { x.beginPath(); x.moveTo(X[m].x + .5, 0); x.lineTo(X[m].x + .5, KT); x.stroke(); }
  const bar = PZ.song.num; for (let b = Math.ceil(PZ.pos / bar) * bar; ; b += bar) { const y = KT - (b - PZ.pos) * PPB; if (y < 0) break; x.strokeStyle = "rgba(255,255,255,.10)"; x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke(); }
  // notas
  const now = new Set(), font = Math.max(9, Math.min(13, ww * .45));
  x.font = `700 ${font}px system-ui`; x.textAlign = "center";
  for (const n of PZ.song.notes) {
    const yb = KT - (n.t - PZ.pos) * PPB, yt = yb - n.d * PPB; if (yt > KT || yb < 0) continue;
    const k = X[n.m]; if (!k) continue;
    const u = userHand(n), [c1, c2] = HC[n.h];
    let col = n.hit ? "#45D483" : u ? c1 : PZ.mode === "watch" ? c1 : c2; if (!u && PZ.mode !== "watch") x.globalAlpha = .55;
    const bx = k.x + (k.b ? 0 : 1.5), bw = k.w - (k.b ? 0 : 3), top = Math.max(yt, -4), bot = Math.min(yb, KT);
    x.fillStyle = col; pzRound(x, bx, top, bw, Math.max(4, bot - top - 1), Math.min(6, bw / 3)); x.fill();
    if (n.miss) { x.strokeStyle = "#FF6B7D"; x.lineWidth = 2; x.stroke(); }
    x.globalAlpha = 1;
    if (bot - top > font + 6 && bw > font * 1.4) { x.fillStyle = "rgba(0,0,0,.55)"; x.fillText(T.midiName(n.m, PZ.flat).replace(/-?\d+$/, ""), bx + bw / 2, bot - 6); }
    if (n.t <= PZ.pos + .02 && n.t + n.d > PZ.pos && (!u || PZ.mode === "watch")) now.add(n.m);
  }
  // linha de toque
  x.fillStyle = PZ.waiting ? "#FFC145" : "rgba(255,255,255,.35)"; x.fillRect(0, KT - 2, W, 2);
  // teclado
  for (const pass of [false, true]) for (let m = PZ.lo; m <= PZ.hi; m++) {
    const k = X[m]; if (!k || k.b !== pass) continue;
    const down = INP.down.has(m), nowN = now.has(m), g = PZ.groups[PZ.gi], want = PZ.waiting && g && g.ns.some(n => n.m === m);
    let col = k.b ? "#17131F" : "#F6F2EA";
    if (nowN) { const n = PZ.song.notes.find(q => q.m === m && q.t <= PZ.pos + .02 && q.t + q.d > PZ.pos); col = HC[n ? n.h : "R"][0]; }
    if (want) col = k.b ? "#B8860B" : "#FFE08A";
    if (down) col = "#45D483";
    x.fillStyle = col;
    if (k.b) { pzRound(x, k.x, KT, k.w, KH * .62, 3); x.fill(); }
    else { x.fillRect(k.x + .5, KT, k.w - 1, KH); if (m % 12 === 0) { x.fillStyle = "#8a8378"; x.font = `600 ${Math.max(8, ww * .34)}px system-ui`; x.fillText("Dó" + (Math.floor(m / 12) - 1), k.x + k.w / 2, H - 6); } }
  }
}
function pzRound(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
function pzHud() {
  const h = $("#pzHud"); if (!h || !PZ.song) return;
  const bar = Math.floor(Math.max(0, PZ.pos) / PZ.song.num) + 1, tot = Math.ceil(PZ.end / PZ.song.num);
  const done = PZ.hits + PZ.miss;
  h.innerHTML = `<span>Compasso <b>${Math.min(bar, tot)}/${tot}</b></span>${PZ.mode !== "watch" ? `<span>Acertos <b>${PZ.hits}</b>${done ? ` · ${Math.round(PZ.hits / done * 100)}%` : ""}</span>` : ""}${PZ.waiting ? `<span class="wait">Esperando você: ${PZ.groups[PZ.gi].ns.map(n => T.midiName(n.m, PZ.flat)).join(" + ")}</span>` : ""}`;
  const sl = $("#pzSeek"); if (sl && document.activeElement !== sl) sl.value = Math.max(0, PZ.pos);
  const pb = $("#pzPlay"); if (pb) pb.innerHTML = PZ.playing ? IC.stop + " Pausar" : IC.play + " Tocar";
  if (typeof scoreMark === "function") scoreMark();
}
function pzTick(ts) {
  if (!PZ.playing) return;
  const dt = Math.min(.1, (ts - (PZ.last || ts)) / 1000); PZ.last = ts;
  const s = PZ.song, prev = PZ.pos; let pos = prev + dt * s.bpm / 60 * PZ.speed;
  const g = PZ.groups[PZ.gi];
  if (g && g.armed == null && pos >= g.t - .5) g.armed = performance.now() - 120;
  if (PZ.mode === "wait" && g && pos >= g.t) { pos = g.t - .0005; if (!PZ.waiting) { PZ.waiting = true; pzHud(); } }
  // tempo do metrônomo
  if (PZ.metro) for (let b = Math.floor(prev) + 1; b <= pos; b++) if (b >= 0 || b > -s.num - 1) AU.click(AU.ctx.currentTime, ((b % s.num) + s.num) % s.num === 0, AU.master);
  // notas automáticas
  for (const n of s.notes) if (n.t > prev && n.t <= pos && (!userHand(n))) AU.note(n.m, AU.ctx.currentTime, Math.max(.15, n.d * 60 / s.bpm / PZ.speed), { v: PZ.mode === "watch" || n.h === "R" ? .75 : .55 });
  PZ.pos = pos;
  // julgar grupo atual
  if (g && g.armed != null) {
    const ok = g.ns.every(n => (INP.last[n.m] || 0) >= g.armed);
    if (ok) { g.ns.forEach(n => n.hit = true); PZ.hits += g.ns.length; PZ.gi++; PZ.waiting = false; }
    else if (PZ.mode === "play" && pos > g.t + .6) { g.ns.forEach(n => n.miss = true); PZ.miss += g.ns.length; PZ.gi++; }
  }
  pzDraw(); if (Math.floor(prev) !== Math.floor(pos) || PZ.waiting) pzHud();
  if (pos > PZ.end + 1) { PZ.playing = false; pzDone(); return; }
  PZ.raf = requestAnimationFrame(pzTick);
}
function pzPlay() { if (!PZ.song) return; AU.init(); if (PZ.pos >= PZ.end) pzReset(-PZ.song.num); PZ.playing = !PZ.playing; PZ.last = 0; if (PZ.playing) PZ.raf = requestAnimationFrame(pzTick); pzHud(); }
function pzDone() {
  pzHud();
  if (PZ.mode === "watch") return;
  const tot = PZ.hits + PZ.miss, pc = tot ? Math.round(PZ.hits / tot * 100) : 0;
  if (PZ.hits) gain(Math.min(40, Math.round(PZ.hits / 4) + (pc >= 90 ? 10 : 0)), "piano");
  modal(`<div class="center stack"><p class="eyebrow">${esc(PZ.song.title)}</p><h2 class="display">${PZ.mode === "wait" ? "Música completa!" : pc + "% de acerto"}</h2><p class="muted">${PZ.hits} notas tocadas${PZ.mode === "play" ? `, ${PZ.miss} perdidas` : ""}. ${PZ.mode === "wait" ? "Agora tente no modo <b>Tocar junto</b>, sem a música esperar." : pc >= 90 ? "Excelente! Suba a velocidade." : "Diminua a velocidade e repita os trechos difíceis."}</p></div>`);
}
function pzInput(m, isDown) { if (PZ.song && !PZ.playing) pzDraw(); else if (PZ.song) { /* desenhado no próximo quadro */ } }

// ---------- partitura (VexFlow, carregado só quando abre) ----------
let VF_P = null;
function loadVF() { if (window.Vex) return Promise.resolve(); if (VF_P) return VF_P; VF_P = new Promise((ok, no) => { const s = document.createElement("script"); s.src = "https://cdn.jsdelivr.net/npm/vexflow@4.2.2/build/cjs/vexflow.js"; s.onload = ok; s.onerror = () => { VF_P = null; no(new Error("sem internet para carregar a partitura")); }; document.head.appendChild(s); }); return VF_P; }
const DUR = [[4, "w"], [3, "hd"], [2, "h"], [1.5, "qd"], [1, "q"], [.75, "8d"], [.5, "8"], [.25, "16"]];
function splitDur(q) { const out = []; let r = Math.round(q * 4) / 4; while (r > .001) { const d = DUR.find(([v]) => v <= r + .001); if (!d) break; out.push(d); r -= d[0]; } return out; }
const SHARP_KEYS = ["G", "D", "A", "E", "B", "F#", "C#"];
function vfKey(m, flat) { const n = T.midiName(m, flat), o = +n.match(/-?\d+$/)[0], b = n.replace(/-?\d+$/, ""); const L = { "Dó": "c", "Ré": "d", "Mi": "e", "Fá": "f", "Sol": "g", "Lá": "a", "Si": "b" }; const base = b.replace(/[♯♭]/, ""); return L[base] + (b.includes("♯") ? "#" : b.includes("♭") ? "b" : "") + "/" + o; }
let SC_BOX = [];
async function renderScore(el) {
  const s = PZ.song; el.innerHTML = `<p class="small muted">Carregando partitura…</p>`;
  try { await loadVF(); } catch (e) { el.innerHTML = `<p class="small muted">Não deu para carregar a partitura: ${esc(e.message)}.</p>`; return; }
  const VF = Vex.Flow, flat = !SHARP_KEYS.includes(s.key) && s.key !== "C" && s.key !== "Am";
  PZ.flat = flat;
  const qPerBeat = 4 / s.den, barQ = s.num * qPerBeat, nBars = Math.ceil(PZ.end / s.num);
  const W = Math.max(320, el.clientWidth), per = W < 520 ? 2 : W < 900 ? 3 : 4, mw = (W - 20) / per, sysH = 230, rows = Math.ceil(nBars / per);
  el.innerHTML = `<div class="scwrap"><div id="scHi" class="schi"></div><div id="scV"></div></div>`;
  const R = new VF.Renderer($("#scV"), VF.Renderer.Backends.SVG); R.resize(W, rows * sysH + 20); const ctx = R.getContext();
  SC_BOX = [];
  const hasL = s.notes.some(n => n.h === "L");
  for (let b = 0; b < nBars; b++) {
    const row = Math.floor(b / per), col = b % per, x = 10 + col * mw, y = 10 + row * sysH, first = col === 0;
    const st = new VF.Stave(x, y, mw), sb = new VF.Stave(x, y + 110, mw);
    if (first) { st.addClef("treble").addKeySignature(s.key.replace("m", "")); sb.addClef("bass").addKeySignature(s.key.replace("m", "")); if (b === 0) { st.addTimeSignature(s.num + "/" + s.den); sb.addTimeSignature(s.num + "/" + s.den); } }
    st.setContext(ctx).draw(); if (hasL) sb.setContext(ctx).draw();
    if (first && hasL) { new VF.StaveConnector(st, sb).setType("brace").setContext(ctx).draw(); new VF.StaveConnector(st, sb).setType("singleLeft").setContext(ctx).draw(); }
    if (hasL) new VF.StaveConnector(st, sb).setType("singleRight").setContext(ctx).draw();
    const voices = [], ties = [], beams = [];
    for (const [h, stave, clef] of [["R", st, "treble"], ["L", sb, "bass"]]) {
      if (h === "L" && !hasL) continue;
      const b0 = b * s.num, b1 = b0 + s.num, ns = s.notes.filter(n => n.h === h && n.t >= b0 - .001 && n.t < b1 - .001);
      const on = [...new Set(ns.map(n => +n.t.toFixed(3)))].sort((a, c) => a - c), tick = [];
      let cur = b0;
      const rest = (len) => splitDur(len * qPerBeat).forEach(([, d]) => { const r = new VF.StaveNote({ clef, keys: [clef === "bass" ? "d/3" : "b/4"], duration: d + "r" }); if (d.includes("d")) VF.Dot.buildAndAttach([r], { all: true }); tick.push(r); });
      on.forEach((t, i) => {
        if (t > cur + .001) rest(t - cur);
        const grp = ns.filter(n => Math.abs(n.t - t) < .002), nxt = i + 1 < on.length ? on[i + 1] : b1;
        const len = Math.min(Math.min(...grp.map(n => n.d)), nxt - t, b1 - t), keys = [...new Set(grp.map(n => n.m))].sort((a, c) => a - c).map(m => vfKey(m, flat));
        let prevN = null;
        splitDur(len * qPerBeat).forEach(([, d]) => { const sn = new VF.StaveNote({ clef, keys, duration: d, auto_stem: true }); if (d.includes("d")) VF.Dot.buildAndAttach([sn], { all: true }); if (prevN) ties.push(new VF.StaveTie({ first_note: prevN, last_note: sn, first_indices: keys.map((_, k) => k), last_indices: keys.map((_, k) => k) })); prevN = sn; tick.push(sn); });
        cur = t + len;
      });
      if (b1 > cur + .001) rest(b1 - cur);
      const v = new VF.Voice({ num_beats: s.num, beat_value: s.den }).setMode(VF.Voice.Mode.SOFT).addTickables(tick);
      VF.Accidental.applyAccidentals([v], s.key.replace("m", ""));
      const bm = VF.Beam.generateBeams(tick.filter(n => !n.isRest()), s.den === 8 ? { groups: [new VF.Fraction(3, 8)] } : {});
      beams.push(...bm);
      voices.push([v, stave]);
    }
    const fmt = new VF.Formatter(); voices.forEach(([v]) => fmt.joinVoices([v]));
    fmt.format(voices.map(([v]) => v), mw - (first ? 90 : 25));
    voices.forEach(([v, stv]) => v.draw(ctx, stv)); beams.forEach(b => b.setContext(ctx).draw()); ties.forEach(t => t.setContext(ctx).draw());
    SC_BOX.push({ x, y, w: mw, h: hasL ? 200 : 100 });
  }
  scoreMark();
}
function scoreMark() {
  const hi = $("#scHi"); if (!hi || !SC_BOX.length || !PZ.song) return;
  const b = SC_BOX[Math.min(SC_BOX.length - 1, Math.max(0, Math.floor(Math.max(0, PZ.pos) / PZ.song.num)))];
  Object.assign(hi.style, { left: b.x + "px", top: b.y + "px", width: b.w + "px", height: b.h + "px" });
}

// ---------- tela ----------
function pianoStatus() {
  const el = $("#pzSt"); if (!el) return;
  el.innerHTML = `<span class="stchip ${INP.midiName ? "on" : ""}">🎹 ${INP.midiName ? esc(INP.midiName) : "Teclado USB/MIDI desligado"}</span><span class="stchip ${MIC.on ? "on" : ""}">🎤 ${MIC.on ? "Microfone ouvindo" : "Microfone desligado"}</span>`;
}
function viewPiano(sub) {
  if (sub === "leitura") return viewLeitura();
  const mine = mySongs(), cur = PZ.song || SONGS[0];
  app().innerHTML = `<header class="phead"><p class="eyebrow">Piano</p><h1 class="display">Aprenda tocando</h1><p class="muted">As notas caem no teclado. No modo <b>Esperar</b>, a música só anda quando você toca a nota certa.</p></header>
  <section class="card stack"><div id="pzSt" class="row"></div>
    <div class="row"><button class="btn" id="pzMidi">Conectar teclado USB</button><button class="btn" id="pzMic">${MIC.on ? "Desligar microfone" : "Usar microfone"}</button><label class="tog"><input type="checkbox" id="pzAS" ${INP.appSound ? "checked" : ""}> Som do app também no teclado USB</label></div>
    <p class="small muted">Teclado digital (como o Casio): ligue pelo cabo USB e use Chrome ou Edge no PC ou Android. No iPhone, use o microfone (uma nota por vez) ou toque na tela.</p></section>
  <section class="card stack">
    <div class="row"><select id="pzSong" class="sel grow"><optgroup label="Músicas prontas">${SONGS.map(s => `<option value="${s.id}" ${s.id === cur.id ? "selected" : ""}>${esc(s.title)}</option>`).join("")}</optgroup>${mine.length ? `<optgroup label="Minhas músicas">${mine.map(s => `<option value="${s.id}" ${s.id === cur.id ? "selected" : ""}>${esc(s.title)}</option>`).join("")}</optgroup>` : ""}</select></div>
    <p class="small muted" id="pzSub"></p>
    <div class="row"><label class="btn" for="pzFile">Abrir arquivo MIDI</label><input type="file" id="pzFile" accept=".mid,.midi,audio/midi" hidden><button class="btn" id="pzTr">Tirar melodia de áudio/vídeo</button>${mine.some(s => s.id === cur.id) ? `<button class="btn danger" id="pzDel">Apagar esta</button>` : ""}</div>
    <div id="pzTrBox"></div>
  </section>
  <section class="card stack pzcard">
    <div class="row pzctl">
      <button class="btn pri" id="pzPlay">${IC.play} Tocar</button><button class="btn" id="pzRe">Recomeçar</button>
      <select id="pzMode" class="sel"><option value="wait">Esperar (aprender)</option><option value="play">Tocar junto</option><option value="watch">Só assistir</option></select>
      <select id="pzHand" class="sel"><option value="R">Mão direita</option><option value="L">Mão esquerda</option><option value="both">As duas mãos</option></select>
      <select id="pzSpd" class="sel"><option value=".5">50%</option><option value=".75">75%</option><option value="1" selected>100%</option><option value="1.25">125%</option></select>
      <label class="tog"><input type="checkbox" id="pzMet"> Metrônomo</label>
    </div>
    <div id="pzHud" class="pzhud"></div>
    <canvas id="pzc" class="pzc" aria-label="Notas caindo sobre o teclado"></canvas>
    <input type="range" id="pzSeek" class="range" min="0" step=".25" value="0">
    <p class="small muted">Laranja = mão direita · roxo = mão esquerda · verde = acertou. Toque no teclado da tela para tocar.</p>
  </section>
  <section class="card stack"><div class="row" style="justify-content:space-between"><p class="eyebrow">Partitura</p><button class="btn" id="pzSc">Mostrar partitura</button></div><div id="pzScore"></div></section>
  <a class="card linkcard" href="#piano-leitura"><span class="lc-ic">𝄞</span><div><b>Treino de leitura de partitura</b><p class="small muted">Aparece uma nota na pauta, você toca no teclado. Clave de sol, clave de fá e acidentes, por níveis.</p></div></a>`;
  pianoStatus();
  const sel = id => $("#" + id);
  sel("pzMode").value = PZ.mode; sel("pzHand").value = PZ.hand; if (![.5, .75, 1, 1.25].includes(PZ.speed)) PZ.speed = 1; sel("pzSpd").value = String(PZ.speed); sel("pzMet").checked = PZ.metro;
  const load = s => { pzLoad(s); sel("pzSub").textContent = s.sub || ""; sel("pzSeek").max = PZ.end; if ($("#scV")) renderScore($("#pzScore")); };
  load(cur);
  sel("pzSong").onchange = e => { const s = findSong(e.target.value); if (s) { PZ.song = s; viewPiano(); } };
  sel("pzPlay").onclick = pzPlay;
  sel("pzRe").onclick = () => { PZ.playing = false; pzReset(-PZ.song.num); };
  sel("pzMode").onchange = e => { PZ.mode = e.target.value; pzReset(Math.max(-PZ.song.num, PZ.pos)); };
  sel("pzHand").onchange = e => { PZ.hand = e.target.value; pzReset(Math.max(-PZ.song.num, PZ.pos)); };
  sel("pzSpd").onchange = e => { PZ.speed = +e.target.value; };
  sel("pzMet").onchange = e => { PZ.metro = e.target.checked; };
  sel("pzSeek").oninput = e => { pzReset(+e.target.value); };
  sel("pzAS").onchange = e => { INP.appSound = e.target.checked; };
  sel("pzMidi").onclick = async () => { await INP.connectMidi(); pianoStatus(); };
  sel("pzMic").onclick = async () => { if (MIC.on) MIC.stop(); else await MIC.start(); viewPiano(); };
  sel("pzSc").onclick = () => { renderScore($("#pzScore")); sel("pzSc").hidden = true; };
  const del = $("#pzDel"); if (del) del.onclick = () => { if (!confirm("Apagar esta música?")) return; saveMySongs(mySongs().filter(s => s.id !== cur.id)); PZ.song = SONGS[0]; viewPiano(); };
  sel("pzFile").onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try { const r = parseMidi(await f.arrayBuffer()); const s = Object.assign({ id: "u" + Date.now(), title: f.name.replace(/\.midi?$/i, ""), sub: `Arquivo MIDI · ${r.notes.length} notas · ${r.bpm} BPM` }, r); const a = mySongs(); a.push(s); saveMySongs(a); PZ.song = s; toast("Música aberta!"); viewPiano(); }
    catch (err) { toast("Não consegui abrir: " + err.message); }
  };
  sel("pzTr").onclick = () => trBox($("#pzTrBox"));
  // teclado na tela
  const cv = sel("pzc"); const ptr = {};
  const keyAt = ev => { const r = cv.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top, H = cv.clientHeight, KH = Math.min(120, H * .24), KT = H - KH; if (y < KT) return null; const { X } = pzKeys(cv.clientWidth); let hit = null; for (const m in X) { const k = X[m]; if (k.b && y < KT + KH * .62 && x >= k.x && x <= k.x + k.w) return +m; } for (const m in X) { const k = X[m]; if (!k.b && x >= k.x && x < k.x + k.w) hit = +m; } return hit; };
  cv.onpointerdown = ev => { const m = keyAt(ev); if (m == null) { pzPlay(); return; } ev.preventDefault(); cv.setPointerCapture(ev.pointerId); ptr[ev.pointerId] = m; INP.press(m, "touch"); pzDraw(); };
  const up = ev => { const m = ptr[ev.pointerId]; if (m != null) { INP.release(m, "touch"); delete ptr[ev.pointerId]; pzDraw(); } };
  cv.onpointerup = up; cv.onpointercancel = up;
  INP.on(() => { if (!PZ.playing) pzDraw(); });
  window.onresize = () => pzDraw();
}
function trBox(el) {
  el.innerHTML = `<div class="tips stack"><p class="small"><b>Como funciona:</b> escolha um áudio ou vídeo do celular (ou grave pelo microfone). O app escuta e escreve a <b>melodia</b> (uma nota por vez: voz, flauta, solo). Acordes e várias vozes juntas ainda não dá para separar.</p>
  <p class="small muted">Link do YouTube: o navegador não consegue baixar o vídeo sozinho. Grave a tela ou salve o áudio no celular e escolha o arquivo aqui.</p>
  <div class="row"><label class="btn pri" for="trF">Escolher áudio ou vídeo</label><input type="file" id="trF" accept="audio/*,video/*" hidden><button class="btn" id="trRec">Gravar 20 s</button></div><p class="small" id="trMsg"></p></div>`;
  const msg = t => { const m = $("#trMsg"); if (m) m.innerHTML = t; };
  const go = async (ab, name) => {
    msg("Ouvindo a música… 0%");
    const r = await transcribeBuffer(ab, p => msg(`Ouvindo a música… ${Math.round(p * 100)}%`));
    if (!r || r.notes.length < 3) { msg("Não encontrei uma melodia clara. Tente um trecho com voz ou instrumento solo, sem muito acompanhamento."); return; }
    const s = Object.assign({ id: "u" + Date.now(), title: "Melodia: " + name, sub: `Tirada de áudio · tom provável ${r.keyName} · ~${r.bpm} BPM · ${r.notes.length} notas` }, r);
    const a = mySongs(); a.push(s); saveMySongs(a); PZ.song = s; PZ.hand = "R"; toast("Melodia tirada!"); viewPiano();
  };
  $("#trF").onchange = async e => { const f = e.target.files[0]; if (!f) return; msg("Lendo o arquivo…"); try { const ab = await AU.init().decodeAudioData(await f.arrayBuffer()); await go(ab, f.name.replace(/\.[^.]+$/, "")); } catch (err) { msg("Não consegui ler esse arquivo. Tente MP3, M4A ou MP4."); } };
  $("#trRec").onclick = async () => {
    let st; try { st = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) { msg("Sem acesso ao microfone."); return; }
    const rec = new MediaRecorder(st), ch = []; rec.ondataavailable = e => ch.push(e.data);
    rec.onstop = async () => { st.getTracks().forEach(t => t.stop()); try { const ab = await AU.init().decodeAudioData(await new Blob(ch).arrayBuffer()); await go(ab, "gravação " + new Date().toLocaleTimeString().slice(0, 5)); } catch (e) { msg("Não consegui processar a gravação."); } };
    rec.start(); let n = 20; msg(`Gravando… ${n} s (cante ou toque a melodia)`);
    const iv = setInterval(() => { n--; msg(`Gravando… ${n} s`); if (n <= 0) { clearInterval(iv); rec.stop(); msg("Processando…"); } }, 1000);
  };
}

// ---------- treino de leitura ----------
const LEI = {
  levels: [["Clave de sol · notas naturais", "sol", ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5", "E5", "F5", "G5"]],
  ["Clave de fá · notas naturais", "fa", ["F2", "G2", "A2", "B2", "C3", "D3", "E3", "F3", "G3", "A3", "B3", "C4"]],
  ["As duas claves", "mix", null],
  ["Com sustenidos e bemóis", "acc", ["C#4", "Eb4", "F#4", "Ab4", "Bb4", "C#5", "Eb5", "F#5", "Bb3", "F#3", "Eb3", "C#3"]],
  ["Linhas suplementares", "sup", ["A3@sol", "B3@sol", "C4@sol", "A5@sol", "B5@sol", "C6@sol", "C2@fa", "D2@fa", "E2@fa", "C4@fa", "D4@fa", "E4@fa"]]]
};
let LS_ = null;
function viewLeitura() {
  const lv = LS_ ? LS_.lv : (S.leitLv || 1);
  app().innerHTML = `<a class="back" href="#piano">${IC.back} Piano</a><header class="phead"><p class="eyebrow">Treino de leitura</p><h1 class="display">Leia e toque</h1><p class="muted">Aparece uma nota na pauta. Toque a mesma nota (a oitava conta!) no teclado da tela, no teclado USB ou pelo microfone. 20 notas por rodada.</p></header>
  <section class="card stack"><div class="chips">${LEI.levels.map((l, i) => `<button class="chip btnchip ${i + 1 === lv ? "sel" : ""}" data-lv="${i + 1}">${i + 1}. ${esc(l[0])}</button>`).join("")}</div>
  <div id="leiBox" class="stack"></div></section>`;
  app().querySelectorAll("[data-lv]").forEach(b => b.onclick = () => { S.leitLv = +b.dataset.lv; save(); LS_ = null; viewLeitura(); });
  if (!LS_ || LS_.lv !== lv) LS_ = { lv, i: 0, ok: 0, t0: 0, cur: null, err: 0 };
  leiNext();
  INP.on((m, d) => { if (d) leiAnswer(m); });
}
function leiPool(lv) { const L = LEI.levels[lv - 1]; if (L[2]) return L[2].map(x => { const [s, c] = x.split("@"); return { s, clef: c || (L[1] === "sol" || L[1] === "fa" ? L[1] : T.midi(T.parse(s)) >= 60 ? "sol" : "fa") }; }); return [...LEI.levels[0][2].map(s => ({ s, clef: "sol" })), ...LEI.levels[1][2].map(s => ({ s, clef: "fa" }))]; }
function leiNext() {
  const box = $("#leiBox"); if (!box) return;
  if (LS_.i >= 20) {
    const sec = Math.round((performance.now() - LS_.t0) / 1000), pc = Math.round(LS_.ok / 20 * 100);
    if (!LS_.saved) { LS_.saved = true; gain(LS_.ok, "leitura"); S.leitBest = S.leitBest || {}; const k = "n" + LS_.lv; if (!S.leitBest[k] || pc > S.leitBest[k]) S.leitBest[k] = pc; save(); }
    box.innerHTML = `<div class="center stack"><h2 class="display">${LS_.ok}/20</h2><p>${sec} segundos · ${(sec / 20).toFixed(1)} s por nota</p><p class="muted">${pc >= 90 ? "Leitura firme! Tente o próximo nível ou tente ficar abaixo de 2 s por nota." : "Repita este nível: a leitura melhora com repetição curta e diária."}</p><button class="btn pri" id="leiAg">Nova rodada</button></div>`;
    $("#leiAg").onclick = () => { LS_ = null; viewLeitura(); }; return;
  }
  if (!LS_.t0) LS_.t0 = performance.now();
  const pool = leiPool(LS_.lv); let q; do { q = pick(pool); } while (LS_.cur && q.s === LS_.cur.s && pool.length > 1);
  LS_.cur = q; LS_.tries = 0;
  const m = T.midi(T.parse(q.s)), lo = Math.min(m - 7, q.clef === "fa" ? 36 : 55), from = lo - (lo % 12), to = Math.max(from + 24, m + 5);
  box.innerHTML = `<div class="row" style="justify-content:space-between"><span class="small muted">${LS_.i + 1}/20 · ${LS_.ok} certas</span><span class="small muted">${LS_.err ? LS_.err + " erros" : ""}</span></div><div class="qbar"><span style="width:${LS_.i / 20 * 100}%"></span></div>
  <div class="leistaff">${staffSVG(q.s, q.clef)}</div><div id="leiFb" class="small center"></div>${kbHTML(from, Math.min(to, from + 36), "leiKb")}`;
  kbBind($("#leiKb"), mm => leiAnswer(mm, true));
}
function leiAnswer(m, fromScreen) {
  if (!LS_ || !LS_.cur || LS_.i >= 20) return;
  const want = T.midi(T.parse(LS_.cur.s)), fb = $("#leiFb"), kb = $("#leiKb");
  if (m === want) { if (LS_.tries === 0) LS_.ok++; LS_.i++; if (fb) fb.innerHTML = `<b class="okc">${T.pt(T.parse(LS_.cur.s))}${LS_.cur.s.match(/\d/)[0]} ✓</b>`; setTimeout(leiNext, 450); }
  else { LS_.tries++; LS_.err++; if (fb) fb.innerHTML = m % 12 === want % 12 ? `Nota certa, <b>oitava errada</b>. Veja as linhas suplementares.` : `Você tocou ${T.midiName(m)}. Tente de novo.`; if (kb) { const k = kb.querySelector(`[data-m="${m}"]`); if (k) { k.classList.add("badk"); setTimeout(() => k.classList.remove("badk"), 400); } } }
}
