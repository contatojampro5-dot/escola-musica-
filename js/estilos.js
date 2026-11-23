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
