# Escola Harpa

**Abrir no celular:** https://contatojampro5-dot.github.io/escola-musica-/ (no iPhone: Safari → Compartilhar → Adicionar à Tela de Início)

Versão no Claude: https://claude.ai/artifact/BDtSj1bsoUFdRaLXXz8Gf6

App de estudos de música no navegador (pode ser instalado na tela inicial do celular). Feito no mesmo molde da Escola Apologia, mas com **som de verdade** gerado no próprio aparelho.

## O que tem
- **No padrão do app Firmes**: boas-vindas com nome, tela inicial com teste, stories dos mestres, “Você está aqui”, missão do dia, álbum e frase do dia; trilha em caminho pontilhado; stories em tela cheia com capa; mestres desenhados que evoluem em 4 fases (motor de arte `personS` do Firmes).
- **Teste**: “Qual caminho na música combina com você?” (Bacharelado, Licenciatura, Composição, Regência, Produção).
- **Álbum**: 91 figurinhas (3 por lição + 1 lendária por mestre).
- **Trilha de 28 lições em 7 níveis** (as áreas de uma faculdade de música): Teoria (Quenanias), Percepção (Davi), Ritmo e prática (Miriã), Harmonia (Asafe), Composição e arranjo (Salomão), História (Jubal), Acústica e produção (Bezalel).
- **Lições em stories** com som: teclado tocável, pauta, grade de ritmo, "toque no ritmo", ouça e responda, verdadeiro/falso, ordem, pares, conversas do dia a dia na banda. Prova no fim e missão prática.
- **Academia de ouvido** (exercícios gerados na hora, com níveis): intervalos, acordes, escalas e modos, graus da tonalidade, progressões, ritmo, afinação fina, timbre e "ouvido de engenheiro" (EQ).
- **Laboratório**: teclado com escalas/acordes/intervalos (grafia correta), campo harmônico, círculo das quintas, metrônomo, ondas e harmônicos, mesa de mixagem (EQ, compressor, reverb, espectro).
- **Piano**: notas caindo sobre o teclado (Esperar / Tocar junto / Só assistir, mão direita/esquerda/as duas, velocidade), teclado USB-MIDI (Chrome/Edge), microfone, 6 músicas de domínio público, abrir arquivo MIDI, partitura, tirar a melodia de um áudio ou vídeo e treino de leitura de partitura em 5 níveis.
- **Cards** com revisão espaçada (~100 termos) e **Guia da faculdade de música**.

Progresso salvo no aparelho (localStorage). `sw.js` deixa abrir sem internet depois da primeira visita.

## Arquivos
`index.html` · `css/app.css` · `js/teoria.js` (teoria com grafia certa) · `js/audio.js` (motor de som Web Audio) · `js/art.js` (desenho dos mestres) · `js/base.js` (mestres, níveis, cards, guia) · `js/extras.js` (figurinhas, frases, teste) · `js/ui2.js` (telas no padrão Firmes) · `js/licoes1-3.js` (conteúdo) · `js/app.js` (telas).

## Versões
- **v2.2**: aba Piano em 4 partes (Tocar · Partitura · Tirar música · Leitura); partitura em tamanho normal que abre em tela cheia com zoom e compasso aceso; link do YouTube identifica a música (nome, canal, vídeo, busca de cifra/partitura/MIDI) e grava o som do vídeo; IA Basic Pitch (Spotify) escreve a partitura completa (acordes + melodia) de áudio ou vídeo.
- **v2.1**: aba **Piano** (ideia do anúncio do TeclaTreino): notas caindo com modo Esperar, teclado USB-MIDI, microfone, 6 músicas prontas, abrir MIDI, partitura, tirar melodia de áudio/vídeo e treino de leitura.
- **v2**: visual e fluxo no padrão do Firmes (boas-vindas, início, trilha em caminho, stories em tela cheia, mestres desenhados, álbum, teste vocacional).
- **v1**: primeira versão (28 lições, academia de ouvido, laboratório).
