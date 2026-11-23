# ESCOLA HARPA — guia para o Claude (leia antes de mexer)

App web de estudos de música (no molde do app Firmes, `contatojampro5-dot/escola-apologia-`). Dono: Theo (GitHub
`contatojampro5-dot`), chama o assistente de **"Zeus"**. Responda sempre em português, simples e direto. Theo é iniciante
em GitHub: explicar passo a passo. Theo gosta de autonomia: se ele não responder, decida e avise depois o que decidiu.

## Como o projeto é montado
- HTML + CSS + JS puro, sem build. GitHub Pages (`main`, raiz, `.nojekyll`): https://contatojampro5-dot.github.io/escola-musica-/
- Mesma página publicada como artifact no Claude: https://claude.ai/artifact/BDtSj1bsoUFdRaLXXz8Gf6 (atualizar junto).
- Ordem dos scripts (index.html): teoria → audio → art → base → extras → licoes1..3 → app → piano → ui2 (ui2 inicia o app).
- `js/teoria.js` notas com grafia certa (`T.parse/up/build`, `SCALES`, `CHORDS`, `campo()`); `js/audio.js` som Web Audio
  (`AU`, mini linguagem `playSpec("C4 [C4 E4 G4]:2 bpm=80")`, efeitos `fx:...`, `MIX` mesa, `METRO`).
- `js/art.js` motor de desenho `personS` trazido do Firmes + 7 mestres (`ARTMAP`, `mArt(id, fase)`).
- `js/base.js` mestres, `TRACKS` (7 níveis × 4 lições), `CARDS`, `GUIA()`; `js/extras.js` figurinhas `FIGS`, frases, teste `VOC`.
- `js/licoes*.js` conteúdo: tipos de slide em `slideHTML` (app.js): mentor, txt, list, table, big, quote, tf, pick, ear,
  order, match, play, kb, rhythm, tap, chat, staff. Prova em `q`.
- `js/app.js` motor (stories, prova, academia de ouvido `EAR`, cards, laboratório, perfil, rotas); `js/ui2.js` telas no
  padrão Firmes (boas-vindas, início, trilha em caminho, mestres, álbum, teste).
- `js/piano.js` aba Piano (v2.1): notas caindo no canvas (`PZ`, modos esperar/tocar junto/assistir), entrada `INP`
  (Web MIDI para o teclado USB, toque, microfone `MIC` com YIN), músicas prontas `SONGS` (domínio público, `mkSong`),
  leitor de MIDI `parseMidi`, partitura com VexFlow 4.2.2 do jsdelivr (carregado só ao abrir), `transcribeBuffer`
  (melodia de áudio/vídeo, uma nota por vez) e treino de leitura (`#piano-leitura`).
  v2.2: sub-rotas `#piano` (tocar), `#piano-partitura` (prévia 8 compassos + `openScoreViewer` tela cheia), `#piano-tirar`
  (YouTube via oEmbed `ytIdentify` + gravação do som da aba `getDisplayMedia`/microfone `recordAudio`; arquivo → `trRun`),
  `#piano-leitura`. IA polifônica: Basic Pitch 1.0.1 por `import(jsdelivr/+esm)` (`transcribePoly`), saída em `notesToSong`. Minhas músicas em localStorage `harpa.songs`.
  v2.7: `#piano` = central `pianoHub` (atalhos `PTILES`); telas `#piano-tocar|musicas|partitura|youtube|arquivo|gravar|teclado|leitura`
  (roteador `viewPiano`, `#piano-tirar` antigo vai para youtube); escolha IA/melodia em `TR_MODE` (`modeSeg`).
  v2.5: cifras automáticas `songChords(s)` (janela de meio compasso, peso no baixo, acordes do tom primeiro), desenhadas
  como `VF.Annotation` na pauta de cima e na lateral do canvas.
- `js/musicas.js` (v2.8): `PIECES` convertidas da coleção do music21 (pip `music21`, `corpus.parse`) por um script Python
  (vozes de cima = mão direita, de baixo = esquerda; até ~24–40 compassos) + Para Elisa e Minueto escritos à mão. Campo `cat`
  (hino | classica | comecar) agrupa a biblioteca. Só domínio público; letras/arranjos da Harpa Cristã são da CPAD (não usar).
- Progresso em localStorage `harpa.v1`. Ao mudar arquivos básicos, subir `VERSAO` no `sw.js` (e listar arquivos novos).

## Testar
- `node --check js/*.js`; navegador com Playwright (Chromium já instalado) servindo a pasta com `python3 -m http.server`,
  percorrendo todas as lições, provas, níveis de ouvido e laboratório; procurar `pageerror`.

## Regras
- Toda atualização: commit + push em `main`, mensagem curta em português começando pela versão (ex.: `v2.1: ...`),
  e uma linha em "Versões" no `README.md`. Atualizar também o artifact.
