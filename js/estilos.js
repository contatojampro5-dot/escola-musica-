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
  balada: { n: "Balada / Louvor", ic: "🕊", d: "O acompanhamento dos louvores lentos: baixo firme no 1 e no 3 e acordes abertos com 9ª, segurando o som.", como: ["Mão esquerda: fundamental no tempo 1 e a 5ª (ou a fundamental) no tempo 3.", "Mão direita: acorde com a 9ª (add9) segurado, renovando no tempo 3.", "Deixe o pedal ligar os acordes; troque o pedal junto com o acorde.", "Dinâmica conta tudo: verso suave, refrão mais cheio."] },
  gospel: { n: "Gospel americano", ic: "🙌", d: "O som das igrejas negras americanas: acordes com 7ª e 9ª, baixo que caminha até o próximo acorde e o “deslize” de meio tom antes de cada acorde.", como: ["Acordes ricos: add9 no I, 7(9) na dominante, m7(9) nos menores.", "Baixo caminhando: nos últimos tempos do compasso, suba ou desça por graus até a fundamental do próximo acorde (walk-up).", "Deslize cromático: toque o acorde meio tom acima (ou abaixo) numa semicolcheia antes de cair no acorde certo.", "Ritmo com balanço (shuffle): pense em tercinas, “dum-da dum-da”.", "Clássicos do estilo: IV/V no lugar do V, 2–5–1 e o diminuto de passagem."] },
  groove: { n: "Groove (R&B / soul)", ic: "🎧", d: "Acordes curtos e sincopados em semicolcheias, com 7M(9), m9 e 9; o baixo responde à bateria.", como: ["Ataques curtos (staccato) fora do tempo: 1, o “a” do 1, o “e” do 2, o 3 e o “e” do 4.", "Acordes sem a 5ª e com 9ª: m9, 7M(9), 9.", "Baixo sincopado: fundamental no 1, oitava no “e” do 2, 5ª no 3 e meio.", "Menos é mais: o silêncio entre os ataques é o que dá o groove."] },
  bossa: { n: "Bossa nova", ic: "🌴", d: "A batida de João Gilberto: baixo alternando fundamental e 5ª, acordes 7M e m7 em síncope.", como: ["Baixo no 1 e no 3: fundamental e depois a 5ª, como o polegar do violão.", "Acordes com 7M, m7 e 7(9), na região do meio.", "Batida sincopada: os acordes caem antes do tempo, “empurrando” o próximo compasso.", "Toque leve: bossa é intimidade, pouco volume."] },
  baiao: { n: "Baião / forró", ic: "🪗", d: "O ritmo de Luiz Gonzaga: baixo no 3 + 3 + 2 (tresillo) e acordes com 7ª no contratempo.", como: ["Baixo: fundamental no 1, de novo no “a” do 1 e a 5ª no 2 (a figura da zabumba).", "Acordes no contratempo (o “e”), curtos, como o triângulo.", "Use acordes com 7ª (mixolídio): é o tempero nordestino.", "Também funciona em louvores alegres (xote, baião gospel)."] },
  hino: { n: "Hino tradicional", ic: "⛪", d: "O jeito do hinário: acordes cheios a cada tempo forte, baixo e vozes andando juntos, como um coral.", como: ["Acorde completo (fundamental, 3ª, 5ª) a cada tempo forte.", "Baixo na fundamental, com inversões para andar por graus.", "Toque ligado (legato), sem enfeites: quem enfeita é a congregação cantando.", "No fim, a cadência plagal (IV → I) para o “Amém”."] },
  arpejo: { n: "Arpejo (piano solo)", ic: "🎹", d: "Os acordes desmanchados em colcheias: fundamental, 5ª, oitava, 9ª, 3ª… Bonito para introduções e momentos de oração.", como: ["Mão esquerda abre o acorde: 1 – 5 – 8 – 9 – 10, subindo e descendo.", "Mantenha o pedal durante o acorde e troque quando o acorde mudar.", "Comece devagar e deixe soar: o arpejo vive da ressonância.", "Varie: suba numa frase, desça na outra."] }
};
const STYLE_KEYS = Object.keys(STYLES);

// gera uma nova música = melodia original + acompanhamento no estilo
function styledSong(base, style) {
  if (!STYLES[style]) return base;
  const chords = songChords(base); if (!chords.length) return base;
  const mel = base.notes.filter(n => n.h === "R"), num = base.num, den = base.den, unit = den === 8 ? .5 : 1;
  const end = Math.max(...base.notes.map(n => n.t + n.d), chords[chords.length - 1].t + num);
  const kr = T.pc(T.parse((base.key || "C").replace("m", "")) || T.parse("C"));
  const out = mel.map(n => Object.assign({}, n)), names = [];
  let prevV = null;
  const segs = chords.map((c, i) => ({ t: c.t, t1: i + 1 < chords.length ? chords[i + 1].t : Math.ceil(end / num) * num, c: parseChord(c.name), name: c.name })).filter(s => s.c);
  // divide em pedaços de no máximo 1 compasso (para o padrão rítmico repetir)
  const parts = []; segs.forEach(s => { for (let t = s.t; t < s.t1 - .01; ) { const nb = (Math.floor(t / num + 1e-6) + 1) * num, te = Math.min(s.t1, nb); parts.push({ t, t1: te, c: s.c, name: s.name, first: t === s.t }); t = te; } });
  const add = (t, d, m, v) => { if (d > .05 && m >= 28 && m <= 96) out.push({ t: +t.toFixed(3), d: +d.toFixed(3), m, h: "L", v }); };
  parts.forEach((p, i) => {
    const c = p.c, dom = (c.root - kr + 12) % 12 === 7 && !c.minor, col = colorChord(c, style, dom, p.name), pcs = col.iv.map(x => (c.root + x) % 12);
    if (p.first) names.push({ t: p.t, name: col.name });
    const V = voiceNear(style === "hino" ? pcs.slice(0, 3) : pcs.slice(1).concat(style === "balada" || style === "hino" ? [] : []), prevV, style === "hino" ? 50 : 53, style === "hino" ? 62 : 67);
    prevV = V.ctr;
    const B = bassOf(c.bass), F = bassOf((c.root + 7) % 12), len = p.t1 - p.t, nxt = parts[i + 1];
    const at = (x, d, ms) => { if (x < len - .01) ms.forEach(m => add(p.t + x, Math.min(d, len - x), m)); };
    if (num === 3 && den === 4 && style !== "arpejo") { at(0, 1, [B]); at(1, 1, V.ms); at(2, 1, V.ms); return; }
    if (den === 8 && style !== "arpejo") { at(0, 3, [B]); at(0, 3, V.ms); at(3, 3, [F]); at(3, 3, V.ms); return; }
    switch (style) {
      case "balada": at(0, 2 * unit, [B]); at(2 * unit, 2 * unit, [len >= 4 * unit ? F : B]); at(0, 2 * unit, V.ms); at(2 * unit, 2 * unit, V.ms); break;
      case "hino": for (let x = 0; x < len - .01; x += num >= 4 ? 2 : 1) { at(x, num >= 4 ? 2 : 1, [B]); at(x, num >= 4 ? 2 : 1, V.ms); } break;
      case "arpejo": { const seq = [B, B + 7, B + 12, B + 14, B + 16 - (c.minor ? 1 : 0), B + 14, B + 12, B + 7]; for (let k = 0; k * .5 < len - .01; k++) add(p.t + k * .5, .5, seq[k % 8]); break; }
      case "gospel": {
        at(0, 1.5, [B]); at(0, .75, V.ms); at(1.5, .5, V.ms); at(2, .75, V.ms); at(3, .5, V.ms);
        // baixo caminhando até o próximo acorde (walk-up) e deslize de meio tom
        if (nxt && nxt.first && len >= 4 && bassOf(nxt.c.bass) !== B) {
          // walk-up: um passo inteiro em direção ao próximo baixo e depois a aproximação cromática (meio tom)
          const tgt = bassOf(nxt.c.bass), dir = tgt > B ? 1 : -1;
          if (Math.abs(tgt - B) > 3) at(2, 1, [B + dir * 2]); else at(2, 1, [B]);
          at(3, 1, [tgt - dir]); nxt.slide = true;
        }
        else at(2, 2, [F]);
        if (p.slide) V.ms.forEach(m => add(p.t - .25, .25, m + 1));
        break;
      }
      case "groove": at(0, .5, [B]); at(1.5, .25, [B + 12]); at(2.5, .5, [F]); at(3.5, .25, [B]);
        [0, .75, 1.5, 2.5, 3.25].forEach(x => at(x, .25, V.ms)); break;
      case "bossa": at(0, 1.5, [B]); at(2, 1.5, [F]); [0, 1.5, 2.5, 3.5].forEach(x => at(x, .5, V.ms)); break;
      case "baiao": [0, 2].forEach(o => { at(o, .75, [B]); at(o + .75, .25, [B]); at(o + 1, 1, [F]); at(o + .5, .25, V.ms); at(o + 1.5, .25, V.ms); }); break;
    }
  });
  out.sort((a, b) => a.t - b.t || a.m - b.m);
  const s = Object.assign({}, base, { id: base.id + "~" + style, title: base.title + " · " + STYLES[style].n, notes: out, base, style, _ch: names });
  return s;
}

// tela "Estilos de toque"
const DEMO = { id: "demo", title: "Progressão I–V–vi–IV", sub: "Dó maior", bpm: 84, num: 4, den: 4, key: "C", notes: [{ t: 0, d: .01, m: 0, h: "X" }], _ch: [{ t: 0, name: "C" }, { t: 4, name: "G" }, { t: 8, name: "Am" }, { t: 12, name: "F" }, { t: 16, name: "C" }, { t: 20, name: "G" }, { t: 24, name: "Am" }, { t: 28, name: "F" }, { t: 32, name: "C" }] };
function viewEstilos() {
  app().innerHTML = `${subHead("Estilos de toque", "O mesmo louvor pode virar balada, gospel, groove ou bossa. Um estilo é feito de ritmo, montagem dos acordes, movimento do baixo e enfeites.")}
  ${STYLE_KEYS.map(k => { const S = STYLES[k]; return `<section class="card stack"><div class="row" style="flex-wrap:nowrap"><span class="spic">${S.ic}</span><div class="grow"><b>${esc(S.n)}</b><p class="small muted">${esc(S.d)}</p></div></div>
    <details class="como"><summary>Como tocar</summary><ul class="small steps">${S.como.map(x => `<li>${esc(x)}</li>`).join("")}</ul></details>
    <div class="row"><button class="btn pri" data-demo="${k}">${IC.play} Ouvir em I–V–vi–IV</button><button class="btn" data-use="${k}">Usar numa música</button></div></section>`; }).join("")}`;
  app().querySelectorAll("[data-demo]").forEach(b => b.onclick = () => { const s = styledSong(DEMO, b.dataset.demo); s.title = STYLES[b.dataset.demo].n + " · I–V–vi–IV"; PZ.song = s; pzLoad(s); PZ.mode = "watch"; location.hash = "#piano-tocar"; setTimeout(pzPlay, 400); });
  app().querySelectorAll("[data-use]").forEach(b => b.onclick = () => { PZ.style = b.dataset.use; toast("Escolha a música: ela vai tocar em " + STYLES[PZ.style].n); location.hash = "#piano-musicas"; });
}
