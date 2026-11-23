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
  const thr = Math.max(.01, peak * .1);
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
  let ns = notes.filter(n => n.e - n.s >= .11).map(n => { const c = {}; n.ms.forEach(x => c[x] = (c[x] || 0) + 1); const m = +Object.entries(c).sort((a, b) => b[1] - a[1])[0][0]; return { s: n.s, e: n.e, m, att: n.att }; });
  // junta notas iguais separadas por buracos mínimos
  ns = ns.reduce((a, n) => { const l = a[a.length - 1]; if (l && l.m === n.m && !n.att && n.s - l.e < .015) l.e = n.e; else a.push(n); return a; }, []);
  if (!ns.length) return null;
  return notesToSong(ns, false);
}
// notas em segundos [{s, e, m}] -> música do app (andamento, grade de semicolcheias, tom provável, mãos)
function notesToSong(ns, poly) {
  ns = ns.slice().sort((a, b) => a.s - b.s || a.m - b.m);
  const t0 = ns[0].s, on = [...new Set(ns.map(n => Math.round((n.s - t0) * 50) / 50))];
  let best = { bpm: 90, err: 1e9 };
  for (let bpm = 60; bpm <= 150; bpm++) { const g = 60 / bpm / 4; let e = 0; on.forEach(t => { const q = t / g; e += Math.abs(q - Math.round(q)); }); e = e / on.length + Math.abs(bpm - 95) / 2000; if (e < best.err) best = { bpm, err: e }; }
  const bpm = best.bpm, bs = 60 / bpm, q = x => Math.round(x * 4) / 4;
  const med = ns.map(n => n.m).sort((a, b) => a - b)[ns.length >> 1], monoH = med < 57 ? "L" : "R";
  let out = ns.map(n => ({ t: q((n.s - t0) / bs), d: Math.max(.25, q((n.e - n.s) / bs)), m: n.m, h: poly ? (n.m >= 60 ? "R" : "L") : monoH }));
  if (poly) {
    // tira notas repetidas no mesmo instante e limita o tamanho
    const seen = new Set(); out = out.filter(n => { const k = n.t + ":" + n.m; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 6000);
    // mesma altura não se sobrepõe
    const last = {}; out.forEach(n => { const p = last[n.m]; if (p && p.t + p.d > n.t) p.d = Math.max(.25, n.t - p.t); last[n.m] = n; });
  } else for (let i = 0; i < out.length - 1; i++) if (out[i].t + out[i].d > out[i + 1].t) out[i].d = Math.max(.25, out[i + 1].t - out[i].t);
  // tom provável (perfis de Krumhansl)
  const P = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88], Pm = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
  const h = new Array(12).fill(0); out.forEach(n => h[n.m % 12] += n.d);
  const NM = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
  let bk = { s: -1e9 }; for (let r = 0; r < 12; r++) for (const [prof, minor] of [[P, 0], [Pm, 1]]) { let sc = 0; for (let i = 0; i < 12; i++) sc += h[(i + r) % 12] * prof[i]; if (minor) sc *= .93; if (sc > bk.s) bk = { s: sc, r, minor }; }
  const key = bk.minor ? NM[(bk.r + 3) % 12] : NM[bk.r];
  return { bpm, num: 4, den: 4, key, keyName: T.pt(T.parse(NM[bk.r])) + (bk.minor ? " menor" : " maior"), notes: out.sort((a, b) => a.t - b.t || a.m - b.m) };
}
// música completa (várias notas juntas): Basic Pitch, a IA aberta do Spotify, rodando no próprio aparelho
const BP_URL = "https://cdn.jsdelivr.net/npm/@spotify/basic-pitch@1.0.1";
let BP_P = null;
function loadBP() { if (BP_P) return BP_P; BP_P = import(BP_URL + "/+esm").then(m => ({ m, bp: new m.BasicPitch(BP_URL + "/model/model.json") })).catch(e => { BP_P = null; throw e; }); return BP_P; }
async function transcribePoly(ab, onProg) {
  const { m, bp } = await loadBP();
  const len = Math.min(ab.duration, 240), oc = new OfflineAudioContext(1, Math.ceil(len * 22050), 22050);
  const src = oc.createBufferSource(); src.buffer = ab; src.connect(oc.destination); src.start(0);
  const rb = await oc.startRendering(), fr = [], on = [], co = [];
  // gravações baixas (microfone): normaliza o volume antes da IA
  const x = rb.getChannelData(0); let pk = 0; for (let i = 0; i < x.length; i++) pk = Math.max(pk, Math.abs(x[i]));
  if (pk < .0005) return null;
  const g = .95 / pk, y = new Float32Array(x.length); for (let i = 0; i < x.length; i++) y[i] = x[i] * g;
  await bp.evaluateModel(y, (f, o, c) => { fr.push(...f); on.push(...o); co.push(...c); }, p => onProg(p));
  const ev = m.noteFramesToTime(m.addPitchBendsToNoteEvents(co, m.outputToNotesPoly(fr, on, .45, .28, 11)));
  let ns = ev.filter(n => n.durationSeconds >= .06 && n.amplitude > .15 && n.pitchMidi >= 28 && n.pitchMidi <= 96).map(n => ({ s: n.startTimeSeconds, e: n.startTimeSeconds + n.durationSeconds, m: n.pitchMidi, a: n.amplitude }));
  // tira "notas fantasma": harmônicos (8ª, 12ª, 15ª acima) bem mais fracos que a nota de verdade
  ns = ns.filter(n => !ns.some(o => o !== n && [12, 19, 24].includes(n.m - o.m) && Math.abs(o.s - n.s) < .06 && o.a >= n.a * 1.4));
  if (ns.length < 3) return null;
  return notesToSong(ns, true);
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
  // cifra na lateral, na altura em que o acorde começa
  x.textAlign = "left"; x.font = "800 15px system-ui";
  for (const c of songChords(PZ.song)) { const y = KT - (c.t - PZ.pos) * PPB; if (y < 14 || y > KT + 2) continue; const w = x.measureText(c.name).width + 12; x.fillStyle = "rgba(255,255,255,.92)"; pzRound(x, 6, y - 20, w, 20, 6); x.fill(); x.fillStyle = "#1B1410"; x.fillText(c.name, 12, y - 5); }
  x.textAlign = "center";
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
  scoreMark();
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


// ---------- tom da música ----------
const KEY_PT = { C: "Dó maior", G: "Sol maior", D: "Ré maior", A: "Lá maior", E: "Mi maior", B: "Si maior", "F#": "Fá♯ maior", "C#": "Dó♯ maior", F: "Fá maior", Bb: "Si♭ maior", Eb: "Mi♭ maior", Ab: "Lá♭ maior", Db: "Ré♭ maior", Gb: "Sol♭ maior", Cb: "Dó♭ maior" };
function songKey(s) {
  if (s.keyName) return s.keyName;
  const ch = songChords(s), last = ch.length ? ch[ch.length - 1].name : "", maj = KEY_PT[s.key] || s.key;
  const rel = { C: "Lá menor", G: "Mi menor", D: "Si menor", A: "Fá♯ menor", E: "Dó♯ menor", F: "Ré menor", Bb: "Sol menor", Eb: "Dó menor" }[s.key];
  return rel && /m$|m7$/.test(last) ? rel : maj;
}
function keyLine(s) { const k = songKey(s), sig = { C: 0, G: 1, D: 2, A: 3, E: 4, B: 5, "F#": 6, "C#": 7, F: -1, Bb: -2, Eb: -3, Ab: -4, Db: -5, Gb: -6, Cb: -7 }[s.key] || 0; return `<span class="keytag">Tom: <b>${esc(k)}</b>${s.keyName ? " (provável)" : ""}</span> <span class="small muted">${sig ? Math.abs(sig) + (sig > 0 ? " sustenido(s)" : " bemol(is)") + " na armadura" : "armadura sem acidentes"}</span>`; }

// ---------- acordes (cifra) a partir das notas ----------
const CH_T = [["", [0, 4, 7]], ["m", [0, 3, 7]], ["7", [0, 4, 7, 10]], ["m7", [0, 3, 7, 10]], ["7M", [0, 4, 7, 11]], ["°", [0, 3, 6]], ["m7(♭5)", [0, 3, 6, 10]]];
const NM_S = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"], NM_F = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];
function songChords(s) {
  if (s._ch) return s._ch;
  const mono = new Set(s.notes.map(n => n.h)).size === 1 && !s.notes.some((n, i) => i && Math.abs(n.t - s.notes[i - 1].t) < .01);
  const step = mono ? s.num : s.den === 8 ? 3 : s.num === 3 ? 3 : 2, end = Math.max(...s.notes.map(n => n.t + n.d)), out = [];
  const flat = !SHARP_KEYS.includes(s.key) && s.key !== "C", NM = flat ? NM_F : NM_S;
  const kr = T.pc(T.parse((s.key || "C").replace("m", "")) || T.parse("C")), scale = [0, 2, 4, 5, 7, 9, 11].map(x => (kr + x) % 12);
  for (let t0 = 0; t0 < end - .01; t0 += step) {
    const t1 = t0 + step, w = new Array(12).fill(0); let tot = 0, low = null;
    s.notes.forEach(n => { const o = Math.min(t1, n.t + n.d) - Math.max(t0, n.t); if (o <= 0) return; const strong = Math.abs(n.t % (s.den === 8 ? 3 : 2)) < .01, k = o * (n.t >= t0 - .01 ? 1 : .7) * (n.h === "L" && !mono ? 1.6 : 1) * (mono && strong ? 1.5 : 1); w[n.m % 12] += k; tot += k; if (n.t < t0 + step / 2 && (!low || n.m < low.m)) low = n; });
    if (tot < .2) continue;
    if (mono) low = null; // melodia sozinha: não há baixo de verdade
    if (low) w[low.m % 12] += tot * .25;
    let best = null;
    for (let r = 0; r < 12; r++) for (const [suf, iv] of CH_T) {
      if (mono && (iv.length === 4 || suf === "°")) continue;
      const pcs = iv.map(x => (r + x) % 12); let sc = 0;
      for (let p = 0; p < 12; p++) sc += pcs.includes(p) ? w[p] : -.6 * w[p];
      if (iv.length === 4 && w[pcs[3]] < tot * .18) sc -= tot * .5; // só põe a 7ª se ela soa de verdade
      if (iv.length === 4) sc -= tot * .22;
      if (iv[1] === 6 || iv[2] === 6) sc -= tot * .1; // diminuto só com evidência
      if (!pcs.slice(0, 2).every(p => w[p] > 0)) sc -= tot * .2; // precisa de fundamental e 3ª (ou 4ª)
      if (low && low.m % 12 === r) sc += tot * .3; else if (low) sc -= tot * .12;
      if (pcs.every(p => scale.includes(p))) sc += tot * .1; // acordes do tom primeiro
      if (mono && [0, 5, 7].includes((r - kr + 12) % 12) && suf === "") sc += tot * .32; // melodia sozinha: I, IV e V primeiro
      if (!best || sc > best.sc + 1e-6) best = { sc, r, suf, pcs };
    }
    if (!best || best.sc < tot * .2) continue;
    let name = NM[best.r] + best.suf;
    if (low && low.m % 12 !== best.r && best.pcs.includes(low.m % 12)) name += "/" + NM[low.m % 12];
    const prev = out[out.length - 1];
    if (!prev || prev.name !== name) out.push({ t: t0, name });
  }
  return (s._ch = out);
}

// ---------- partitura (VexFlow, carregado só quando abre) ----------
let VF_P = null;
function loadVF() { if (window.Vex) return Promise.resolve(); if (VF_P) return VF_P; VF_P = new Promise((ok, no) => { const s = document.createElement("script"); s.src = "https://cdn.jsdelivr.net/npm/vexflow@4.2.2/build/cjs/vexflow.js"; s.onload = ok; s.onerror = () => { VF_P = null; no(new Error("sem internet para carregar a partitura")); }; document.head.appendChild(s); }); return VF_P; }
const DUR = [[4, "w"], [3, "hd"], [2, "h"], [1.5, "qd"], [1, "q"], [.75, "8d"], [.5, "8"], [.25, "16"]];
function splitDur(q) { const out = []; let r = Math.round(q * 4) / 4; while (r > .001) { const d = DUR.find(([v]) => v <= r + .001); if (!d) break; out.push(d); r -= d[0]; } return out; }
const SHARP_KEYS = ["G", "D", "A", "E", "B", "F#", "C#"];
function vfKey(m, flat) { const n = T.midiName(m, flat), o = +n.match(/-?\d+$/)[0], b = n.replace(/-?\d+$/, ""); const L = { "Dó": "c", "Ré": "d", "Mi": "e", "Fá": "f", "Sol": "g", "Lá": "a", "Si": "b" }; const base = b.replace(/[♯♭]/, ""); return L[base] + (b.includes("♯") ? "#" : b.includes("♭") ? "b" : "") + "/" + o; }
let SC = null;
async function renderScore(el, o = {}) {
  const s = PZ.song; el.innerHTML = `<p class="small muted">Carregando partitura…</p>`;
  try { await loadVF(); } catch (e) { el.innerHTML = `<p class="small muted">Não deu para carregar a partitura: ${esc(e.message)}.</p>`; return; }
  const VF = Vex.Flow, flat = !SHARP_KEYS.includes(s.key) && s.key !== "C" && s.key !== "Am";
  PZ.flat = flat;
  const qPerBeat = 4 / s.den, barQ = s.num * qPerBeat, nBars = Math.ceil(PZ.end / s.num);
  const chords = o.noChords ? [] : songChords(s), hasR = s.notes.some(n => n.h === "R");
  const hasL = s.notes.some(n => n.h === "L"), shown = Math.min(nBars, o.maxBars || nBars);
  const W = Math.max(280, el.clientWidth - 8), sc = o.scale || (W < 600 ? .62 : .8), LW = W / sc;
  const per = Math.max(1, Math.min(4, Math.floor((LW - 20) / 250))), mw = (LW - 20) / per, sysH = hasL && hasR ? 250 : 150, rows = Math.ceil(shown / per);
  el.innerHTML = `<div class="scwrap"><div class="schi"></div><div class="scv"></div></div>`;
  const R = new VF.Renderer(el.querySelector(".scv"), VF.Renderer.Backends.SVG); R.resize(W, (rows * sysH + 20) * sc); const ctx = R.getContext(); ctx.scale(sc, sc);
  const boxes = [];
  for (let b = 0; b < shown; b++) {
    const row = Math.floor(b / per), col = b % per, x = 10 + col * mw, y = 30 + row * sysH, first = col === 0;
    const st = new VF.Stave(x, y, mw), sb = new VF.Stave(x, hasR ? y + 110 : y, mw), two = hasR && hasL;
    if (first) { st.addClef("treble").addKeySignature(s.key.replace("m", "")); sb.addClef("bass").addKeySignature(s.key.replace("m", "")); if (b === 0) { st.addTimeSignature(s.num + "/" + s.den); sb.addTimeSignature(s.num + "/" + s.den); } }
    if (hasR) st.setContext(ctx).draw(); if (hasL) sb.setContext(ctx).draw();
    if (first && two) { new VF.StaveConnector(st, sb).setType("brace").setContext(ctx).draw(); new VF.StaveConnector(st, sb).setType("singleLeft").setContext(ctx).draw(); }
    if (two) new VF.StaveConnector(st, sb).setType("singleRight").setContext(ctx).draw();
    const voices = [], ties = [], beams = [];
    for (const [h, stave, clef] of [["R", st, "treble"], ["L", sb, "bass"]]) {
      if ((h === "L" && !hasL) || (h === "R" && !hasR)) continue;
      const b0 = b * s.num, b1 = b0 + s.num, ns = s.notes.filter(n => n.h === h && n.t >= b0 - .001 && n.t < b1 - .001);
      const on = [...new Set(ns.map(n => +n.t.toFixed(3)))].sort((a, c) => a - c), tick = [], tt = [];
      let tcur = b0;
      let cur = b0;
      const rest = (len) => splitDur(len * qPerBeat).forEach(([, d]) => { const r = new VF.StaveNote({ clef, keys: [clef === "bass" ? "d/3" : "b/4"], duration: d + "r" }); if (d.includes("d")) VF.Dot.buildAndAttach([r], { all: true }); tick.push(r); tt.push(tcur); tcur += DUR.find(x => x[1] === d)[0] / qPerBeat; });
      on.forEach((t, i) => {
        if (t > cur + .001) rest(t - cur);
        tcur = t;
        const grp = ns.filter(n => Math.abs(n.t - t) < .002), nxt = i + 1 < on.length ? on[i + 1] : b1;
        const len = Math.min(Math.min(...grp.map(n => n.d)), nxt - t, b1 - t), keys = [...new Set(grp.map(n => n.m))].sort((a, c) => a - c).map(m => vfKey(m, flat));
        let prevN = null;
        splitDur(len * qPerBeat).forEach(([, d]) => { const sn = new VF.StaveNote({ clef, keys, duration: d, auto_stem: true }); if (d.includes("d")) VF.Dot.buildAndAttach([sn], { all: true }); if (prevN) ties.push(new VF.StaveTie({ first_note: prevN, last_note: sn, first_indices: keys.map((_, k) => k), last_indices: keys.map((_, k) => k) })); prevN = sn; tick.push(sn); tt.push(tcur); tcur += DUR.find(x => x[1] === d)[0] / qPerBeat; });
        cur = t + len;
      });
      if (b1 > cur + .001) rest(b1 - cur);
      if (h === "R" || !hasR) chords.filter(c => c.t >= b0 - .01 && c.t < b1 - .01).forEach(c => {
        let i = tt.findIndex(x => x >= c.t - .01); if (i < 0) i = tt.length - 1; if (i < 0) return;
        const a = new VF.Annotation(c.name).setFont("Arial", 15, "bold").setVerticalJustification(VF.Annotation.VerticalJustify.TOP);
        tick[i].addModifier(a, 0);
      });
      const v = new VF.Voice({ num_beats: s.num, beat_value: s.den }).setMode(VF.Voice.Mode.SOFT).addTickables(tick);
      VF.Accidental.applyAccidentals([v], s.key.replace("m", ""));
      const bm = VF.Beam.generateBeams(tick.filter(n => !n.isRest()), s.den === 8 ? { groups: [new VF.Fraction(3, 8)] } : {});
      beams.push(...bm);
      voices.push([v, stave]);
    }
    const fmt = new VF.Formatter(); voices.forEach(([v]) => fmt.joinVoices([v]));
    fmt.format(voices.map(([v]) => v), mw - (first ? 90 : 25));
    voices.forEach(([v, stv]) => v.draw(ctx, stv)); beams.forEach(b => b.setContext(ctx).draw()); ties.forEach(t => t.setContext(ctx).draw());
    boxes.push({ x: (x + 4) * sc, y: y * sc, w: mw * sc, h: (hasL && hasR ? 200 : 100) * sc });
  }
  SC = { el, hi: el.querySelector(".schi"), boxes, last: -1 };
  if (shown < nBars) el.insertAdjacentHTML("beforeend", `<p class="small muted center">… mais ${nBars - shown} compassos. Abra em tela cheia para ver tudo.</p>`);
  scoreMark();
}
function scoreMark() {
  if (!SC || !SC.hi || !document.body.contains(SC.hi) || !PZ.song) return;
  const i = Math.max(0, Math.floor(Math.max(0, PZ.pos) / PZ.song.num)), b = SC.boxes[i];
  if (!b) { SC.hi.style.display = "none"; return; }
  Object.assign(SC.hi.style, { display: "block", left: b.x + "px", top: b.y + "px", width: b.w + "px", height: b.h + "px" });
  if (i !== SC.last && SC.follow && PZ.playing) SC.hi.scrollIntoView({ block: "center", behavior: "smooth" });
  SC.last = i;
}
// partitura em tela cheia, com zoom e "tocar acompanhando"
let SCV_Z = null;
function openScoreViewer() {
  if (!PZ.song) return;
  closeScoreViewer();
  const v = document.createElement("div"); v.className = "scview"; v.id = "scview";
  v.innerHTML = `<div class="scbar"><button class="iconbtn" id="svX" aria-label="Fechar">${IC.x}</button><div class="grow svt"><b>${esc(PZ.song.title)}</b><span>Tom: ${esc(songKey(PZ.song))}</span></div><button class="btn" id="svM" aria-label="Diminuir">−</button><button class="btn" id="svP" aria-label="Aumentar">+</button><button class="btn pri" id="svPlay">${IC.play}</button></div><div class="scbody"><div id="svScore"></div></div>`;
  document.body.appendChild(v); document.body.classList.add("scopen");
  if (SCV_Z == null) SCV_Z = innerWidth < 600 ? .7 : .95;
  const draw = () => renderScore($("#svScore"), { scale: SCV_Z }).then(() => { SC.follow = true; });
  draw();
  $("#svX").onclick = closeScoreViewer;
  $("#svM").onclick = () => { SCV_Z = Math.max(.45, SCV_Z - .1); draw(); };
  $("#svP").onclick = () => { SCV_Z = Math.min(1.6, SCV_Z + .1); draw(); };
  $("#svPlay").onclick = () => { if (!PZ.playing && PZ.mode !== "watch" && !$("#pzc")) PZ.mode = "watch"; pzPlay(); $("#svPlay").innerHTML = PZ.playing ? IC.stop : IC.play; };
  v.onkeydown = e => { if (e.key === "Escape") closeScoreViewer(); };
}
function closeScoreViewer() { const v = $("#scview"); if (v) { v.remove(); document.body.classList.remove("scopen"); if (PZ.playing && !$("#pzc")) PZ.playing = false; const p = $("#pzScore"); if (p && p.innerHTML) renderScore(p, { maxBars: 8 }); } }

// ---------- tela ----------
function pianoStatus() {
  const el = $("#pzSt"); if (!el) return;
  el.innerHTML = `<span class="stchip ${INP.midiName ? "on" : ""}">🎹 ${INP.midiName ? esc(INP.midiName) : "Teclado USB desligado"}</span><span class="stchip ${MIC.on ? "on" : ""}">🎤 ${MIC.on ? "Microfone ouvindo" : "Microfone desligado"}</span>`;
}
const PSUB = [["", "Tocar"], ["partitura", "Partitura"], ["tirar", "Tirar música"], ["leitura", "Leitura"]];
function pianoNav(cur) { return `<nav class="seg wide psub">${PSUB.map(([k, n]) => `<a href="#piano${k ? "-" + k : ""}" aria-current="${k === cur}" class="${k === cur ? "on" : ""}">${n}</a>`).join("")}</nav>`; }
function songSelect(cur) {
  const mine = mySongs();
  return `<select id="pzSong" class="sel grow"><optgroup label="Músicas prontas">${SONGS.map(s => `<option value="${s.id}" ${s.id === cur.id ? "selected" : ""}>${esc(s.title)}</option>`).join("")}</optgroup>${mine.length ? `<optgroup label="Minhas músicas">${mine.slice().reverse().map(s => `<option value="${s.id}" ${s.id === cur.id ? "selected" : ""}>${esc(s.title)}</option>`).join("")}</optgroup>` : ""}</select>`;
}
function bindSongSelect(again) { $("#pzSong").onchange = e => { const s = findSong(e.target.value); if (s) { PZ.song = s; pzLoad(s); again(); } }; }
function viewPiano(sub) {
  sub = sub || "";
  if (sub === "leitura") return viewLeitura();
  if (sub.startsWith("tirar")) { const q = sub.split("?yt=")[1]; return viewTirar(q ? decodeURIComponent(q) : null); }
  if (sub === "partitura") return viewPartitura();
  const cur = PZ.song || SONGS[0];
  app().innerHTML = `${pianoNav("")}
  <section class="card stack">
    <div class="row">${songSelect(cur)}</div>
    <p class="small muted" id="pzSub"></p>
    <div class="row pzctl">
      <button class="btn pri" id="pzPlay">${IC.play} Tocar</button><button class="btn" id="pzRe">Recomeçar</button><button class="btn" id="pzSv">Ver partitura</button>
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
  <section class="card stack"><p class="eyebrow">Seu teclado</p><div id="pzSt" class="row"></div>
    <div class="row"><button class="btn" id="pzMidi">Conectar teclado USB</button><button class="btn" id="pzMic">${MIC.on ? "Desligar microfone" : "Usar microfone"}</button><label class="tog"><input type="checkbox" id="pzAS" ${INP.appSound ? "checked" : ""}> Som do app também no teclado USB</label></div>
    <p class="small muted">Teclado digital (como o Casio): cabo USB + Chrome ou Edge no PC ou Android. No iPhone, use o microfone (uma nota por vez) ou toque na tela.</p></section>`;
  pianoStatus();
  const sel = id => $("#" + id);
  if (![.5, .75, 1, 1.25].includes(PZ.speed)) PZ.speed = 1;
  sel("pzMode").value = PZ.mode; sel("pzHand").value = PZ.hand; sel("pzSpd").value = String(PZ.speed); sel("pzMet").checked = PZ.metro;
  if (PZ.song !== cur || !PZ.end) pzLoad(cur);
  PZ.song = cur; sel("pzSub").textContent = cur.sub || ""; sel("pzSeek").max = PZ.end; pzDraw(); pzHud();
  bindSongSelect(() => viewPiano());
  sel("pzPlay").onclick = pzPlay;
  sel("pzRe").onclick = () => { PZ.playing = false; pzLoad(PZ.song); };
  sel("pzSv").onclick = openScoreViewer;
  sel("pzMode").onchange = e => { PZ.mode = e.target.value; pzReset(Math.max(-PZ.song.num, PZ.pos)); };
  sel("pzHand").onchange = e => { PZ.hand = e.target.value; pzReset(Math.max(-PZ.song.num, PZ.pos)); };
  sel("pzSpd").onchange = e => { PZ.speed = +e.target.value; };
  sel("pzMet").onchange = e => { PZ.metro = e.target.checked; };
  sel("pzSeek").oninput = e => { pzReset(+e.target.value); };
  sel("pzAS").onchange = e => { INP.appSound = e.target.checked; };
  sel("pzMidi").onclick = async () => { await INP.connectMidi(); pianoStatus(); };
  sel("pzMic").onclick = async () => { if (MIC.on) MIC.stop(); else await MIC.start(); viewPiano(); };
  const cv = sel("pzc"), ptr = {};
  const keyAt = ev => { const r = cv.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top, H = cv.clientHeight, KH = Math.min(120, H * .24), KT = H - KH; if (y < KT) return null; const { X } = pzKeys(cv.clientWidth); let hit = null; for (const m in X) { const k = X[m]; if (k.b && y < KT + KH * .62 && x >= k.x && x <= k.x + k.w) return +m; } for (const m in X) { const k = X[m]; if (!k.b && x >= k.x && x < k.x + k.w) hit = +m; } return hit; };
  cv.onpointerdown = ev => { const m = keyAt(ev); if (m == null) { pzPlay(); return; } ev.preventDefault(); cv.setPointerCapture(ev.pointerId); ptr[ev.pointerId] = m; INP.press(m, "touch"); pzDraw(); };
  const up = ev => { const m = ptr[ev.pointerId]; if (m != null) { INP.release(m, "touch"); delete ptr[ev.pointerId]; pzDraw(); } };
  cv.onpointerup = up; cv.onpointercancel = up;
  INP.on(() => { if (!PZ.playing) pzDraw(); });
  window.onresize = () => pzDraw();
}
function viewPartitura() {
  const cur = PZ.song || SONGS[0]; if (PZ.song !== cur || !PZ.end) pzLoad(cur);
  const mine = mySongs().some(s => s.id === cur.id);
  app().innerHTML = `${pianoNav("partitura")}
  <section class="card stack"><div class="row">${songSelect(cur)}</div><p class="keyline">${keyLine(cur)}</p><p class="small muted">${esc(cur.sub || "")}</p>
    ${cur.keyName && /gravação|Melodia/i.test(cur.sub + cur.title) && cur.notes.length ? `<p class="small muted">Gravação pelo microfone pega ruído: se a partitura parecer bagunçada (muitos ♯ soltos), o tom também pode estar errado. Para som limpo, use a Gravação de Tela.</p>` : ""}
    <div class="row"><button class="btn pri" id="ptFull">Abrir em tela cheia</button><a class="btn" href="#piano">Tocar com notas caindo</a>${mine ? `<button class="btn danger" id="ptDel">Apagar esta</button>` : ""}</div></section>
  <button class="card scprev" id="ptPrev" aria-label="Abrir a partitura em tela cheia"><div id="pzScore"></div><span class="scopen-tag">Toque para abrir em tela cheia ⤢</span></button>
  <p class="small muted center">Quer a partitura de outra música? Vá em <a href="#piano-tirar">Tirar música</a>: link do YouTube, áudio, vídeo ou arquivo MIDI.</p>`;
  bindSongSelect(() => viewPartitura());
  renderScore($("#pzScore"), { maxBars: 8 });
  $("#ptFull").onclick = openScoreViewer; $("#ptPrev").onclick = openScoreViewer;
  const d = $("#ptDel"); if (d) d.onclick = () => { if (!confirm("Apagar esta música?")) return; saveMySongs(mySongs().filter(s => s.id !== cur.id)); PZ.song = SONGS[0]; pzLoad(PZ.song); viewPartitura(); };
}

// ---------- tirar música: YouTube, áudio/vídeo, MIDI, gravação ----------
const YT = { info: null };
function ytId(u) { const m = String(u).match(/(?:youtu\.be\/|v=|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/); return m ? m[1] : (/^[\w-]{11}$/.test(u.trim()) ? u.trim() : null); }
const SITE = "https://contatojampro5-dot.github.io/escola-musica-/", IOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
function onSite() { return /github\.io$|^localhost$|^127\.0\.0\.1$/.test(location.hostname); }
function siteLink(yt) { return SITE + "#piano-tirar" + (yt ? "?yt=" + encodeURIComponent(yt) : ""); }
function viewTirar(autoYt) {
  const y = YT.info;
  app().innerHTML = `${pianoNav("tirar")}
  ${onSite() ? "" : `<section class="card stack warnc"><b>Você está com o Harpa aberto dentro do app do Claude.</b><p class="small">Aqui dentro a internet é bloqueada por segurança, então o YouTube e a IA não funcionam. Abra o site do Harpa (dá para colocar na tela inicial do celular):</p><a class="btn pri" href="${siteLink()}" target="_blank" rel="noopener">Abrir o site do Harpa</a></section>`}
  <section class="card stack"><p class="eyebrow">1 · Link do YouTube</p><h2>Identificar a música</h2>
    <div class="row"><input id="ytU" class="inp grow" placeholder="Cole aqui o link do YouTube" inputmode="url" value="${y ? esc(y.url) : ""}"><button class="btn pri" id="ytGo">Identificar</button></div>
    <div id="ytOut">${y ? ytCard(y) : ""}</div></section>
  <section class="card stack"><p class="eyebrow">2 · Subir a música</p><h2>Escrever a partitura de um áudio ou vídeo</h2>
    <p class="small muted">MP3, M4A, WAV, MP4 ou um vídeo da galeria. Até 4 minutos.</p>
    <div class="seg wide" id="trMode"><button data-v="poly" aria-pressed="true">Música completa (IA)</button><button data-v="mono" aria-pressed="false">Só a melodia</button></div>
    <p class="small muted" id="trModeTxt"></p>
    <div class="row"><label class="btn pri" for="trF">Escolher arquivo</label><input type="file" id="trF" accept="audio/*,video/*" hidden><button class="btn" id="trRec">Gravar pelo microfone</button></div>
    <div id="trMsg" class="trmsg"></div></section>
  <section class="card stack"><p class="eyebrow">3 · Arquivo MIDI</p><p class="small muted">Se você tiver a música em .mid, ela abre perfeita, com as duas mãos.</p><div class="row"><label class="btn" for="pzFile">Abrir arquivo MIDI</label><input type="file" id="pzFile" accept=".mid,.midi,audio/midi" hidden></div></section>`;
  let mode = "poly";
  const modeTxt = () => { $("#trModeTxt").innerHTML = mode === "poly" ? "Usa o <b>Basic Pitch</b> (IA gratuita do Spotify) no próprio aparelho: tira acordes, baixo e melodia. Melhor com piano ou violão solo. Na primeira vez baixa uns 3 MB." : "Rápido e sem internet. Tira uma nota por vez: ideal para voz, flauta ou solo."; };
  modeTxt();
  $("#trMode").querySelectorAll("button").forEach(b => b.onclick = () => { mode = b.dataset.v; $("#trMode").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); modeTxt(); });
  $("#ytGo").onclick = ytIdentify; $("#ytU").onkeydown = e => { if (e.key === "Enter") ytIdentify(); };
  if (y) bindYt();
  if (autoYt) { $("#ytU").value = autoYt; ytIdentify(); }
  $("#trF").onchange = async e => { const f = e.target.files[0]; if (!f) return; trMsg("Lendo o arquivo…"); try { const ab = await AU.init().decodeAudioData(await f.arrayBuffer()); await trRun(ab, f.name.replace(/\.[^.]+$/, ""), mode); } catch (err) { trMsg("Não consegui ler esse arquivo. Tente MP3, M4A ou MP4."); } };
  $("#trRec").onclick = () => recordAudio(() => navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false } }), "gravação " + new Date().toLocaleTimeString().slice(0, 5), () => mode);
  $("#pzFile").onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try { const r = parseMidi(await f.arrayBuffer()); const s = Object.assign({ id: "u" + Date.now(), title: f.name.replace(/\.midi?$/i, ""), sub: `Arquivo MIDI · ${r.notes.length} notas · ${r.bpm} BPM` }, r); const a = mySongs(); a.push(s); saveMySongs(a); PZ.song = s; pzLoad(s); toast("Música aberta!"); location.hash = "#piano-partitura"; }
    catch (err) { toast("Não consegui abrir: " + err.message); }
  };
}
function trMsg(t, p) { const m = $("#trMsg"); if (m) m.innerHTML = t + (p != null ? `<div class="qbar"><span style="width:${Math.round(p * 100)}%"></span></div>` : ""); }
async function trRun(ab, name, mode) {
  let r;
  try {
    if (mode === "poly") { trMsg("Carregando a IA (só na primeira vez)…", 0); r = await transcribePoly(ab, p => trMsg(`A IA está ouvindo a música… ${Math.round(p * 100)}%`, p)); }
    else r = await transcribeBuffer(ab, p => trMsg(`Ouvindo a melodia… ${Math.round(p * 100)}%`, p));
  } catch (e) { trMsg(mode === "poly" ? "Não consegui carregar a IA (precisa de internet). Tente o modo <b>Só a melodia</b>." : "Deu um erro ao processar o áudio."); return; }
  if (!r || r.notes.length < 3) { trMsg(`Não encontrei notas claras em ${Math.round(ab.duration)} s de áudio. O som estava muito baixo ou com muito ruído. ${IOS ? "No iPhone, use a <b>Gravação de Tela</b> (veja os passos no item 1)." : "Tente de novo com o som mais alto."}`); return; }
  const s = Object.assign({ id: "u" + Date.now(), title: name, sub: `${mode === "poly" ? "Tirada pela IA" : "Melodia tirada do áudio"} de ${Math.round(ab.duration)} s · tom provável ${r.keyName} · ~${r.bpm} BPM · ${r.notes.length} notas` }, r);
  const a = mySongs(); a.push(s); saveMySongs(a); PZ.song = s; PZ.hand = mode === "poly" ? "both" : "R"; pzLoad(s);
  toast("Partitura pronta!"); location.hash = "#piano-partitura";
}
// grava áudio de uma fonte (microfone ou som da aba) até o usuário parar (máx. 4 min)
let REC = null;
async function recordAudio(getStream, name, getMode) {
  if (REC) { REC.stop(); return; }
  try { if (navigator.audioSession) navigator.audioSession.type = "play-and-record"; } catch (e) {}
  let st; try { st = await getStream(); } catch (e) { trMsg("Sem permissão para gravar."); return; }
  const au = st.getAudioTracks(); if (!au.length) { st.getTracks().forEach(t => t.stop()); trMsg("Nenhum som foi compartilhado. Na janela do navegador, escolha <b>esta aba</b> e marque <b>Compartilhar áudio da guia</b>."); return; }
  const rec = new MediaRecorder(new MediaStream(au)), ch = []; rec.ondataavailable = e => ch.push(e.data);
  let sec = 0; const iv = setInterval(() => { sec++; trMsg(`🔴 Gravando… ${sec} s. Toque em <b>Parar e escrever a partitura</b> quando a música acabar.`); if (sec >= 240) REC.stop(); }, 1000);
  REC = { stop: () => { clearInterval(iv); if (rec.state !== "inactive") rec.stop(); } };
  rec.onstop = async () => { st.getTracks().forEach(t => t.stop()); REC = null; try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {} document.querySelectorAll(".recbtn").forEach(b => b.textContent = b.dataset.t); if (sec < 3) { trMsg("Gravação curta demais."); return; } trMsg("Processando…"); try { const ab = await AU.init().decodeAudioData(await new Blob(ch).arrayBuffer()); await trRun(ab, name, getMode()); } catch (e) { trMsg("Não consegui processar a gravação."); } };
  rec.start(); trMsg("🔴 Gravando…");
  document.querySelectorAll(".recbtn").forEach(b => { b.dataset.t = b.dataset.t || b.textContent; b.textContent = "Parar e escrever a partitura"; });
}
async function ytIdentify() {
  const u = $("#ytU").value.trim(), id = ytId(u), out = $("#ytOut");
  if (!id) { out.innerHTML = `<p class="small">Esse não parece um link do YouTube. Exemplo: <i>https://youtu.be/…</i></p>`; return; }
  out.innerHTML = `<p class="small muted">Procurando…</p>`;
  let title = "", author = "";
  try { const r = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent("https://www.youtube.com/watch?v=" + id)}&format=json`); if (!r.ok) throw 0; const j = await r.json(); title = j.title; author = j.author_name; }
  catch (e) { try { const r = await fetch(`https://noembed.com/embed?url=${encodeURIComponent("https://www.youtube.com/watch?v=" + id)}`); const j = await r.json(); title = j.title || ""; author = j.author_name || ""; } catch (e2) {} }
  if (!title) {
    out.innerHTML = onSite() ? `<p class="small">Não consegui identificar esse vídeo. Ele pode ser privado, ou a internet falhou. Tente de novo.</p>`
      : `<p class="small">Aqui dentro do app do Claude a conexão com o YouTube é bloqueada. Toque abaixo: o site do Harpa abre com o seu link e identifica sozinho.</p><a class="btn pri" href="${siteLink(u)}" target="_blank" rel="noopener">Abrir no site do Harpa</a>`;
    return;
  }
  YT.info = { id, url: u, title, author }; out.innerHTML = ytCard(YT.info); bindYt();
}
function ytClean(t) { return t.replace(/\(.*?\)|\[.*?\]|official|video|clipe|ao vivo|live|lyric[s]?|letra/gi, "").replace(/\s+/g, " ").trim(); }
function ytCard(y) {
  const q = encodeURIComponent(ytClean(y.title)), desk = !/iPhone|iPad|Android/i.test(navigator.userAgent) && !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
  return `<div class="ytres"><img src="https://i.ytimg.com/vi/${y.id}/hqdefault.jpg" alt="" class="ytthumb"><div class="grow"><p class="eyebrow">Música identificada</p><b>${esc(y.title)}</b><p class="small muted">${esc(y.author)}</p></div></div>
  <div class="row"><a class="btn" target="_blank" rel="noopener" href="https://www.google.com/search?q=${q}+cifra">Buscar cifra</a><a class="btn" target="_blank" rel="noopener" href="https://www.google.com/search?q=${q}+partitura+piano">Buscar partitura pronta</a><a class="btn" target="_blank" rel="noopener" href="https://www.google.com/search?q=${q}+midi">Buscar MIDI</a></div>
  <div class="ytframe"><iframe src="https://www.youtube-nocookie.com/embed/${y.id}" title="${esc(y.title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>
  <p class="eyebrow">Escrever a partitura deste vídeo</p>
  <p class="small muted">O YouTube não deixa nenhum app baixar o som direto. ${desk ? "Então o Harpa <b>escuta</b> o vídeo tocando: toque em <b>Gravar o som desta aba</b>, escolha <b>esta aba</b>, marque <b>Compartilhar áudio</b> e dê play no vídeo acima." : ""}</p>
  ${desk ? "" : `<div class="tips stack"><p class="small"><b>No celular, o melhor jeito (som perfeito):</b></p><ol class="small steps"><li>Abra a <b>Central de Controle</b> (deslize do canto de cima, à direita) e toque em <b>Gravar Tela</b> ⏺.</li><li>Volte aqui e dê play no vídeo acima até o fim do trecho que você quer.</li><li>Pare a gravação (barra vermelha lá em cima).</li><li>Em <b>2 · Subir a música</b>, toque em <b>Escolher arquivo</b> e escolha o vídeo gravado.</li></ol><p class="small muted">Gravar pelo microfone do mesmo celular quase não funciona: o iPhone abaixa o próprio som enquanto o microfone grava. Pelo microfone, toque o vídeo em <b>outro aparelho</b> (TV, PC, outro celular).</p></div>`}
  <div class="row">${desk ? `<button class="btn pri recbtn" id="ytTab">Gravar o som desta aba</button>` : ""}<button class="btn recbtn" id="ytMic">Gravar pelo microfone</button></div>`;
}
function bindYt() {
  const y = YT.info, mode = () => { const b = document.querySelector('#trMode [aria-pressed="true"]'); return b ? b.dataset.v : "poly"; };
  const tab = $("#ytTab"); if (tab) tab.onclick = () => recordAudio(() => navigator.mediaDevices.getDisplayMedia({ video: true, audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }, preferCurrentTab: true, selfBrowserSurface: "include", systemAudio: "include" }), y.title, mode);
  const mic = $("#ytMic"); if (mic) mic.onclick = () => recordAudio(() => navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }), y.title, mode);
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
  app().innerHTML = `${pianoNav("leitura")}<header class="phead"><p class="eyebrow">Treino de leitura</p><h1 class="display">Leia e toque</h1><p class="muted">Aparece uma nota na pauta. Toque a mesma nota (a oitava conta!) no teclado da tela, no teclado USB ou pelo microfone. 20 notas por rodada.</p></header>
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
