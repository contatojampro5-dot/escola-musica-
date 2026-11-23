// Estilos de toque: gera o acompanhamento (baixo + acordes) a partir das cifras da música, em vários estilos.
"use strict";
const ST_LET = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
// cifra → { root, iv (intervalos), bass }
function parseChord(name) {
  const m = /^([A-G])([♯♭#b]?)(.*?)(?:\/([A-G])([♯♭#b]?))?$/.exec(name); if (!m) return null;
  const acc = a => (a === "♯" || a === "#") ? 1 : (a === "♭" || a === "b") ? -1 : 0;
  const root = (ST_LET[m[1]] + acc(m[2]) + 12) % 12, suf = m[3];
  const iv = ({ "": [0, 4, 7], m: [0, 3, 7], "7": [0, 4, 7, 10], m7: [0, 3, 7, 10], "7M": [0, 4, 7, 11], "°": [0, 3, 6], "m7(♭5)": [0, 3, 6, 10] })[suf] || [0, 4, 7];
  return { root, iv, bass: m[4] ? (ST_LET[m[4]] + acc(m[5]) + 12) % 12 : root, minor: iv[1] === 3, dim: iv[2] === 6 };
}
const NMS = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"];
// enriquece o acorde conforme o estilo (e diz como escrever a cifra)
function colorChord(c, style, dom, orig) {
  const R = NMS[c.root], sl = c.bass !== c.root ? "/" + NMS[c.bass] : "";
  if (c.dim) return { iv: [0, 3, 6, 9], name: R + "°" };
  const T = {
    gospel: dom ? [[0, 4, 10, 14], "7(9)"] : c.minor ? [[0, 3, 10, 14], "m7(9)"] : [[0, 4, 7, 14], "add9"],
    groove: dom ? [[0, 4, 10, 14], "9"] : c.minor ? [[0, 3, 10, 14], "m9"] : [[0, 4, 11, 14], "7M(9)"],
    bossa: dom ? [[0, 4, 10, 14], "7(9)"] : c.minor ? [[0, 3, 7, 10], "m7"] : [[0, 4, 7, 11], "7M"],
    baiao: dom || !c.minor ? [[0, 4, 7, 10], "7"] : [[0, 3, 7], "m"],
    balada: c.minor ? [[0, 3, 7], "m"] : [[0, 4, 7, 14], "add9"]
  }[style];
  if (!T) return { iv: c.iv, name: orig };
  return { iv: T[0], name: R + T[1] + sl };
}
// montagem (voicing) perto da anterior, na região do meio do teclado
function voiceNear(pcs, prev, lo = 52, hi = 67) {
  let best = null;
  for (let base = lo - 12; base <= hi; base++) {
    if (!pcs.includes(base % 12)) continue;
    const ms = [base]; let ok = true;
    for (let k = 1; k < pcs.length; k++) { let m = ms[ms.length - 1] + 1; while (!pcs.includes(m % 12) || ms.some(x => x % 12 === m % 12)) { m++; if (m > hi + 12) { ok = false; break; } } if (!ok) break; ms.push(m); }
    if (!ok || ms[0] < lo || ms[ms.length - 1] > hi + 5) continue;
    const ctr = ms.reduce((a, b) => a + b, 0) / ms.length, d = prev ? Math.abs(ctr - prev) : Math.abs(ctr - 60);
    if (!best || d < best.d) best = { ms, d, ctr };
  }
  return best || { ms: pcs.map(p => 60 + p), ctr: 64 };
}
const bassOf = pc => { let m = 36 + pc; while (m < 40) m += 12; return m; };

const STYLES = {
  balada: { bpm: 72, n: "Balada / Louvor", ic: "🕊", d: "O acompanhamento dos louvores lentos: baixo firme no 1 e no 3 e acordes abertos com 9ª, segurando o som.", como: ["Mão esquerda: fundamental no tempo 1 e a 5ª (ou a fundamental) no tempo 3.", "Mão direita: acorde com a 9ª (add9) segurado, renovando no tempo 3.", "Deixe o pedal ligar os acordes; troque o pedal junto com o acorde.", "Dinâmica conta tudo: verso suave, refrão mais cheio."] },
  gospel: { bpm: 76, n: "Gospel americano", ic: "🙌", d: "O som das igrejas negras americanas: acordes com 7ª e 9ª, baixo que caminha até o próximo acorde e o “deslize” de meio tom antes de cada acorde.", como: ["Acordes ricos: add9 no I, 7(9) na dominante, m7(9) nos menores.", "I7 antes do IV: em Dó, C → C7 → F. O C7 “puxa” para o F e soa igreja na hora.", "IV/V antes do V: em Dó, F/G → G7. O acorde do IV com o baixo do V dá aquele som suspenso.", "Baixo caminhando: nos últimos tempos do compasso, suba ou desça por graus até a fundamental do próximo acorde (walk-up).", "Deslize cromático: toque o acorde meio tom acima (ou abaixo) numa semicolcheia antes de cair no acorde certo.", "Ritmo com balanço (shuffle): pense em tercinas, “dum-da dum-da”.", "Clássicos do estilo: IV/V no lugar do V, 2–5–1 e o diminuto de passagem."] },
  groove: { bpm: 90, n: "Groove (R&B / soul)", ic: "🎧", d: "Acordes curtos e sincopados em semicolcheias, com 7M(9), m9 e 9; o baixo responde à bateria.", como: ["Ataques curtos (staccato) fora do tempo: 1, o “a” do 1, o “e” do 2, o 3 e o “e” do 4.", "Acordes sem a 5ª e com 9ª: m9, 7M(9), 9.", "Baixo sincopado: fundamental no 1, oitava no “e” do 2, 5ª no 3 e meio.", "Menos é mais: o silêncio entre os ataques é o que dá o groove."] },
  bossa: { bpm: 126, n: "Bossa nova", ic: "🌴", d: "A batida de João Gilberto: baixo alternando fundamental e 5ª, acordes 7M e m7 em síncope.", como: ["Baixo no 1 e no 3: fundamental e depois a 5ª, como o polegar do violão.", "Acordes com 7M, m7 e 7(9), na região do meio.", "Batida sincopada: os acordes caem antes do tempo, “empurrando” o próximo compasso.", "Toque leve: bossa é intimidade, pouco volume."] },
  baiao: { bpm: 112, n: "Baião / forró", ic: "🪗", d: "O ritmo de Luiz Gonzaga: baixo no 3 + 3 + 2 (tresillo) e acordes com 7ª no contratempo.", como: ["Baixo: fundamental no 1, de novo no “a” do 1 e a 5ª no 2 (a figura da zabumba).", "Acordes no contratempo (o “e”), curtos, como o triângulo.", "Use acordes com 7ª (mixolídio): é o tempero nordestino.", "Também funciona em louvores alegres (xote, baião gospel)."] },
  hino: { bpm: 84, n: "Hino tradicional", ic: "⛪", d: "O jeito do hinário: acordes cheios a cada tempo forte, baixo e vozes andando juntos, como um coral.", como: ["Acorde completo (fundamental, 3ª, 5ª) a cada tempo forte.", "Baixo na fundamental, com inversões para andar por graus.", "Toque ligado (legato), sem enfeites: quem enfeita é a congregação cantando.", "No fim, a cadência plagal (IV → I) para o “Amém”."] },
  arpejo: { bpm: 70, n: "Arpejo (piano solo)", ic: "🎹", d: "Os acordes desmanchados em colcheias: fundamental, 5ª, oitava, 9ª, 3ª… Bonito para introduções e momentos de oração.", como: ["Mão esquerda abre o acorde: 1 – 5 – 8 – 9 – 10, subindo e descendo.", "Mantenha o pedal durante o acorde e troque quando o acorde mudar.", "Comece devagar e deixe soar: o arpejo vive da ressonância.", "Varie: suba numa frase, desça na outra."] }
};
const STYLE_KEYS = ["balada", "gospel", "groove"]; // estilos mostrados (decisão do Theo: focar nesses três)

// ---------- frases ("licks") que o tecladista faz em cima dos acordes ----------
// cada nota: [início em tempos, duração, semitons acima da fundamental do acorde (número ou [dupla]), força]
const T3 = 1 / 3, T6 = 1 / 6;
const LICKS = {
  gospel: {
    maior: [
      { n: "descida com nota esmagada", len: 3, ns: [[0, T6, 15, .5], [T6, .5, 16, .72], [2 * T3, T3, 14, .55], [1, T3, 12, .6], [4 * T3, T3, 9, .55], [5 * T3, T3, 7, .5], [2, 1, 4, .6]] },
      { n: "subida gospel", len: 3, ns: [[0, T3, 7, .5], [T3, T3, 9, .55], [2 * T3, T3, 12, .6], [1, T3, 14, .62], [4 * T3, T6, 15, .5], [1.5, 1.5, 16, .72]] },
      { n: "terças deslizando", len: 2, ns: [[0, T6, [3, 8], .45], [T6, .5, [4, 9], .66], [2 * T3, T3, [2, 7], .52], [1, 1, [0, 4], .6]] },
      { n: "6-5-3-2-1 com blue note", len: 3, ns: [[0, T3, 21, .6], [T3, T3, 19, .55], [2 * T3, T6, 15, .45], [5 * T6, .5, 16, .62], [4 * T3, T3, 14, .5], [5 * T3, 4 * T3, 12, .66]] },
      { n: "trinado curto", len: 2, ns: [[0, T6, 16, .55], [T6, T6, 17, .5], [T3, T6, 16, .5], [.5, T6, 14, .5], [2 * T3, 4 * T3, 12, .62]] }
    ],
    menor: [
      { n: "pentatônica menor descendo", len: 3, ns: [[0, T3, 19, .6], [T3, T3, 17, .55], [2 * T3, T3, 15, .55], [1, T3, 12, .6], [4 * T3, T3, 10, .5], [5 * T3, 4 * T3, 12, .62]] },
      { n: "resposta curta", len: 2, ns: [[0, T6, 14, .5], [T6, .5, 15, .66], [2 * T3, T3, 12, .55], [1, 1, 10, .55]] }
    ]
  },
  groove: {
    maior: [
      { n: "9ª, 3ª e 5ª em semicolcheias", len: 2, ns: [[0, .25, 14, .55], [.25, .25, 16, .5], [.5, .5, 19, .66], [1, .25, 23, .5], [1.25, .75, 21, .6]] },
      { n: "deslize para a 9ª", len: 3, ns: [[0, .12, 13, .4], [.12, .38, 14, .66], [.5, .25, 12, .5], [.75, .25, 7, .45], [1, .5, 9, .58], [1.75, .25, 11, .5], [2, 1, 14, .64]] },
      { n: "dupla sincopada", len: 2, ns: [[0, .25, [7, 14], .55], [.75, .25, [9, 16], .6], [1.5, .5, [11, 16], .62]] }
    ],
    menor: [
      { n: "pentatônica menor sincopada", len: 3, ns: [[0, .25, 10, .5], [.25, .25, 12, .52], [.5, .25, 15, .58], [.75, .25, 17, .52], [1, .5, 19, .66], [1.75, .25, 17, .48], [2, 1, 15, .6]] },
      { n: "deslize e resposta", len: 3, ns: [[0, .12, 16, .4], [.12, .38, 15, .62], [.5, .25, 12, .5], [.75, .75, 10, .56], [1.75, .25, 7, .45], [2, .75, 10, .58]] }
    ],
    dom: [
      { n: "blues no dominante", len: 3, ns: [[0, .12, 15, .42], [.12, .38, 16, .64], [.5, .25, 14, .5], [.75, .25, 10, .52], [1, .5, 7, .55], [1.5, .5, 9, .52], [2, 1, 10, .6]] }
    ]
  }
};
// coloca as frases nos buracos da melodia (ou numa linha improvisada, se não houver melodia)
function addFills(out, parts, mel, style, num, R) {
  const L = LICKS[style]; if (!L) return;
  const partAt = t => parts.find(p => t >= p.t - .01 && t < p.t1 - .01);
  const busy = (a, b) => mel.some(n => n.t < b - .05 && n.t + n.d > a + .05);
  const wins = [];
  if (mel.length) {
    const ms = mel.slice().sort((a, b) => a.t - b.t); let cur = 0;
    ms.forEach(n => { if (n.t - cur >= 1.25) wins.push([cur, n.t, false]); if (n.d >= 2.5 && !ms.some(o => o !== n && o.t > n.t + .1 && o.t < n.t + n.d - .05)) wins.push([n.t + 1, n.t + n.d, Math.min(...ms.filter(o => o.t <= n.t + .05 && o.t + o.d > n.t + 1).map(o => o.m))]); cur = Math.max(cur, n.t + n.d); });
    const end = parts.length ? parts[parts.length - 1].t1 : cur; if (end - cur >= 1.25) wins.push([cur, end, false]);
  } else {
    // linha improvisada: pergunta no 1º compasso, resposta no 2º, a cada 2 compassos
    const end = parts.length ? parts[parts.length - 1].t1 : 0;
    for (let b = 0; b * num < end - num; b += 2) { wins.push([b * num + .5, (b + 1) * num, false]); wins.push([(b + 1) * num + 1, (b + 2) * num, false]); }
  }
  let lastEnd = -9;
  wins.forEach(([a, b, held]) => {
    if (a - lastEnd < (mel.length ? 3 : 0)) return; // não encher demais
    const p = partAt(a); if (!p) return;
    const kind = p.c.minor ? "menor" : (p.dom && L.dom ? "dom" : "maior"), pool = (L[kind] || L.maior).filter(l => l.len <= Math.min(b, p.t1 + (mel.length ? 0 : 1)) - a + .01);
    if (!pool.length) return;
    const lk = pool[Math.floor(R() * pool.length)];
    const ofs = lk.ns.flatMap(x => [].concat(x[2])); let base = 60 + p.c.root; // oitava: acima dos acordes, abaixo de Ré6
    while (base + Math.max(...ofs) > 88) base -= 12; while (base + Math.min(...ofs) < 64) base += 12;
    if (held) while (base + Math.max(...ofs) >= held - 1 && base - 12 + Math.min(...ofs) >= 55) base -= 12; // por baixo da nota segurada
    if (held && base + Math.max(...ofs) >= held) return; // não cabe por baixo: deixa a melodia sozinha
    lk.ns.forEach(([t, d, o, v]) => [].concat(o).forEach(oo => { const tt = a + t; if (tt + d > b + .01) return; if (!held && busy(tt, tt + d)) return; out.push({ t: +tt.toFixed(3), d: +d.toFixed(3), m: base + oo, h: "F", v: Math.min(.9, (v || .6) + (R() - .5) * .06), sw: style === "groove" ? .02 : 0, j: (R() - .5) * .012, lick: lk.n }); }));
    lastEnd = a + lk.len;
  });
}

// gerador "humano": pedal, dinâmica, balanço, antecipações, viradas no fim das frases
function rngOf(seed) { let a = 0; for (const ch of String(seed)) a = (a * 31 + ch.charCodeAt(0)) | 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function styledSong(base, style) {
  if (!STYLES[style]) return base;
  const chords = songChords(base); if (!chords.length) return base;
  const mel = base.notes.filter(n => n.h === "R"), num = base.num, den = base.den;
  const end = Math.max(...base.notes.map(n => n.t + n.d), chords[chords.length - 1].t + num);
  const kr = T.pc(T.parse((base.key || "C").replace("m", "")) || T.parse("C"));
  const out = mel.map(n => Object.assign({}, n, { v: n.v || .78 })), names = [], R = rngOf(base.id + style);
  const segs = chords.map((c, i) => ({ t: c.t, t1: i + 1 < chords.length ? chords[i + 1].t : Math.ceil(end / num) * num, c: parseChord(c.name), name: c.name })).filter(s => s.c);
  const parts = []; segs.forEach(s => { for (let t = s.t; t < s.t1 - .01; ) { const nb = (Math.floor(t / num + 1e-6) + 1) * num, te = Math.min(s.t1, nb); parts.push({ t, t1: te, c: s.c, name: s.name, first: Math.abs(t - s.t) < .01 }); t = te; } });
  // 1ª passada: cifra colorida e montagem de cada pedaço (condução de vozes)
  let prevV = null;
  parts.forEach(p => {
    const c = p.c; p.dom = (c.root - kr + 12) % 12 === 7 && !c.minor;
    p.col = colorChord(c, style, p.dom, p.name); p.pcs = p.col.iv.map(x => (c.root + x) % 12);
    p.V = voiceNear(style === "hino" ? p.pcs.slice(0, 3) : p.pcs.slice(1), prevV, style === "hino" ? 50 : 53, style === "hino" ? 62 : 67); prevV = p.V.ctr;
    p.B = bassOf(c.bass); const f = bassOf((c.root + 7) % 12); p.F = f > p.B + 2 && f - 12 >= 36 ? f - 12 : f;
    if (p.first) names.push({ t: p.t, name: p.col.name });
  });
  const swing = style === "gospel" ? 1 / 6 : 0, laid = style === "groove" ? .02 : 0;
  // n: nota · sd: quanto tempo soa (pedal) · v: força
  const add = (t, d, m, v, sd) => {
    if (!(d > .02) || m < 28 || m > 96) return;
    const fr = +(t % 1).toFixed(3), sw = (swing && Math.abs(fr - .5) < .01 ? swing : 0) + laid + (style === "groove" && (Math.abs(fr - .25) < .01 || Math.abs(fr - .75) < .01) ? .03 : 0);
    out.push({ t: +t.toFixed(3), d: +d.toFixed(3), m, h: "L", v: Math.max(.12, Math.min(1, v + (R() - .5) * .08)), sd: sd != null ? +sd.toFixed(3) : undefined, sw, j: (R() - .5) * .018 });
  };
  const chordAt = (t, d, ms, v, sd) => ms.forEach((m, k) => add(t, d, m, v - (k === ms.length - 1 ? 0 : .04), sd)); // nota de cima um pouco mais forte
  parts.forEach((p, i) => {
    const len = p.t1 - p.t, nx = parts[i + 1], chg = nx && nx.first, bar = Math.floor(p.t / num + 1e-6), phraseEnd = bar % 4 === 3 && Math.abs(p.t1 - (bar + 1) * num) < .01;
    const T0 = p.t, B = p.B, F = p.F, V = p.V.ms, skip = p.skip; // skip: o 1º tempo já foi antecipado no compasso anterior
    const at = (x, d, ms, v, sd) => { if (x < len - .01 && !(skip && x < .01)) ms.forEach((m, k) => add(T0 + x, Math.min(d, len - x), m, v - (ms.length > 1 && k < ms.length - 1 ? .04 : 0), sd)); };
    const anticip = (x, vB, vC, withBass = true) => { // o próximo acorde entra antes do compasso virar
      if (!chg || x >= len - .01) return false;
      const rest = len - x, nd = Math.min(1.5, nx.t1 - nx.t) + rest;
      nx.V.ms.forEach(m => add(T0 + x, rest, m, vC, nd)); if (withBass) { add(T0 + x, rest, nx.B, vB, nd); add(T0 + x, rest, nx.B + 12, vB - .1, nd); }
      nx.skip = true; return true;
    };
    // ----- valsa 3/4 e compasso composto 6/8 (todos os estilos menos arpejo e hino) -----
    if (num === 3 && den === 4 && style !== "arpejo" && style !== "hino") { at(0, 1, [B], .7, 3); at(1, 1, V, .42, .9); at(2, 1, V, .4, .9); return; }
    if (den === 8 && style !== "hino") { at(0, len, [B], .68, len); const arp = [B + 7, B + 12, V[V.length - 1], B + 12, B + 7]; for (let k = 1; k < Math.min(6, Math.round(len)); k++) at(k, 1, [arp[(k - 1) % 5]], .4 + (k === 3 ? .1 : 0), len - k); return; }
    switch (style) {
      case "balada": {
        at(0, 2, [B, B + 12], .66, chg || len < 4 ? len : 2.5); if (len >= 4) at(2.5, 1.5, [phraseEnd ? B + 7 : F], .46, 1.5);
        at(0, 1.5, V, .56, 1.5); if (len >= 2) at(1.5, .5, V, .38, 1.5);
        if (phraseEnd && len >= 4) { const top = Math.max(...V); [V[0], V[1] || V[0], top, top + 5].forEach((m, k) => at(2 + k * .5, .5, [m], .4 + k * .05, 2 - k * .5)); }
        else if (len >= 4 && !anticip(3.5, .58, .55)) at(3, 1, V, .44, 1);
        else if (len >= 4) at(3, .5, V, .4, .5);
        break;
      }
      case "gospel": {
        at(0, 1, [B, B + 12], .82, 1.5); at(0, 1, V, .7, 1);
        at(1.5, .5, V, .48, .35); at(1.5, .25, [B], .38, .3); // contratempo com balanço
        if (len >= 4) {
          // marcas do gospel na 2ª metade do compasso: I7 antes do IV e IV/V antes do V
          let V2 = V, tag = "";
          if (chg && !p.c.minor && (nx.c.root - p.c.root + 12) % 12 === 5) { V2 = voiceNear([4, 10, 14].map(x => (p.c.root + x) % 12), p.V.ctr).ms; tag = NMS[p.c.root] + "7"; }
          else if (chg && nx.dom && (nx.c.root - p.c.root + 12) % 12 !== 0) { const IV = (nx.c.root + 10) % 12; V2 = voiceNear([0, 4, 7].map(x => (IV + x) % 12), p.V.ctr).ms; tag = NMS[IV] + "/" + NMS[nx.c.root]; }
          if (tag) names.push({ t: T0 + 2, name: tag });
          at(2, 1, V2, .6, .9);
          if (tag.includes("/")) { at(2, 2, [bassOf(nx.c.root)], .64, 2); }
          else if (chg && bassOf(nx.c.bass) !== B) { const tgt = bassOf(nx.c.bass), dir = tgt > B ? 1 : -1; at(2, 1, [Math.abs(tgt - B) > 3 ? B + dir * 2 : B], .62, 1); at(3, 1, [tgt - dir], .66, 1); nx.slide = true; }
          else at(2, 2, [F], .6, 2);
          if (phraseEnd) { const top = Math.max(...V); [top + 2, top, top - 3].forEach((m, k) => at(3 + k / 3, 1 / 3, [m], .5 - k * .04, 1 / 3)); } // corrida em tercinas
          else at(3, .5, V2, .45, .4);
        }
        if (p.slide) p.V.ms.forEach(m => add(T0 - 1 / 6, 1 / 6, m + 1, .42, 1 / 6)); // deslize de meio tom antes do acorde
        break;
      }
      case "groove": {
        at(0, .75, [B], .86, .6); at(1.75, .25, [B], .34, .2); if (len >= 4) { at(2, .5, [B + 12], .6, .4); at(2.75, .5, [F], .55, .4); at(3.5, .5, [chg ? bassOf(nx.c.bass) - 1 : B], .5, .4); }
        at(0, 1, V, .62, .9); at(1.5, .25, V, .44, .28); if (len >= 4) { at(2.25, .25, V, .28, .15); at(2.5, .5, V, .55, .38); if (phraseEnd) { at(3, .25, V, .45, .2); at(3.5, .25, V, .5, .2); } else if (!anticip(3.75, .62, .58, false)) at(3.25, .25, V, .4, .2); }
        break;
      }
      case "bossa": {
        for (let b = 0; b < len - .01; b++) at(b, 1, [b % 2 ? F : B], b % 2 ? .44 : .56, .95); // polegar: fundamental e 5ª
        const hits = bar % 2 ? [.5, 1.25, 2, 3, 3.75] : [0, .75, 1.5, 2.5, 3.25];
        hits.forEach(x => { if (x >= 3.74 && chg) anticip(3.75, .5, .46, false); else at(x, .5, V, x % 1 ? .4 : .46, .42); });
        break;
      }
      case "baiao": {
        [0, 2].forEach(o => { at(o, .75, [B], .82, .7); at(o + .75, .25, [B], .5, .25); at(o + 1, 1, [F], .66, .9); });
        [.5, 1.5, 2.5].forEach(x => at(x, .25, V, .55, .3)); [1.25, 3.25].forEach(x => at(x, .25, V, .3, .2));
        if (!anticip(3.5, .7, .6, false)) at(3.5, .25, V, .55, .3);
        break;
      }
      case "hino": {
        const notes = mel.filter(n => n.t >= T0 - .01 && n.t < p.t1 - .01);
        if (notes.length) notes.forEach(n => { const below = []; for (let m = n.m - 1; m >= n.m - 12 && below.length < 2; m--) if (p.pcs.includes(m % 12) && (!below.length || below[below.length - 1] - m >= 3)) below.push(m); below.forEach(m => add(n.t, Math.min(n.d, p.t1 - n.t), m, .5, Math.min(n.d, p.t1 - n.t))); });
        else for (let x = 0; x < len - .01; x++) at(x, 1, V, .5, 1);
        for (let x = 0; x < len - .01; x += num >= 4 ? 2 : num) at(x, Math.min(num >= 4 ? 2 : num, len - x), [B], .58, Math.min(num >= 4 ? 2 : num, len - x));
        break;
      }
      case "arpejo": {
        const up = [B, B + 7, B + 12, B + (p.c.minor ? 15 : 16), B + 19, B + 24 - (phraseEnd ? 0 : 5)], seq = up.concat(up.slice(1, -1).reverse());
        const n8 = Math.round(len * 2);
        for (let k = 0; k < n8; k++) { const x = k * .5; at(x, .5, [seq[k % seq.length]], .42 + .14 * Math.sin(Math.PI * k / Math.max(1, n8 - 1)), len - x); }
        break;
      }
    }
  });
  if (style === "gospel" || style === "groove") addFills(out, parts, mel, style, num, R);
  out.sort((a, b) => a.t - b.t || a.m - b.m);
  return Object.assign({}, base, { id: base.id + "~" + style, title: base.title + " · " + STYLES[style].n, notes: out, base, style, _ch: names.sort((a, b) => a.t - b.t), bpm: base.id === "demo" ? STYLES[style].bpm : base.bpm });
}

// tela "Estilos de toque"
const DEMO = { id: "demo", title: "Progressão I–V–vi–IV", sub: "Dó maior", bpm: 84, num: 4, den: 4, key: "C", notes: [{ t: 0, d: .01, m: 0, h: "X" }], _ch: [{ t: 0, name: "C" }, { t: 4, name: "G" }, { t: 8, name: "Am" }, { t: 12, name: "F" }, { t: 16, name: "C" }, { t: 20, name: "G" }, { t: 24, name: "Am" }, { t: 28, name: "F" }, { t: 32, name: "C" }] };
function viewEstilos() {
  app().innerHTML = `${subHead("Estilos de toque", "O mesmo louvor pode virar balada, gospel ou groove. Um estilo é feito de ritmo, montagem dos acordes, movimento do baixo e enfeites.")}
  ${STYLE_KEYS.map(k => { const S = STYLES[k]; return `<section class="card stack"><div class="row" style="flex-wrap:nowrap"><span class="spic">${S.ic}</span><div class="grow"><b>${esc(S.n)}</b><p class="small muted">${esc(S.d)}</p></div></div>
    <details class="como"><summary>Como tocar</summary><ul class="small steps">${S.como.map(x => `<li>${esc(x)}</li>`).join("")}</ul></details>
    <div class="row"><button class="btn pri" data-demo="${k}">${IC.play} Ouvir em I–V–vi–IV</button><button class="btn" data-use="${k}">Usar numa música</button></div></section>`; }).join("")}`;
  app().querySelectorAll("[data-demo]").forEach(b => b.onclick = () => { const s = styledSong(DEMO, b.dataset.demo); s.title = STYLES[b.dataset.demo].n + " · I–V–vi–IV"; PZ.song = s; pzLoad(s); PZ.mode = "watch"; location.hash = "#piano-tocar"; setTimeout(pzPlay, 400); });
  app().querySelectorAll("[data-use]").forEach(b => b.onclick = () => { PZ.style = b.dataset.use; toast("Escolha a música: ela vai tocar em " + STYLES[PZ.style].n); location.hash = "#piano-musicas"; });
}
