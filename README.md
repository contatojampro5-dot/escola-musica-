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
- **v3.2**: estilos reduzidos a Original, Balada/Louvor, Gospel americano e Groove (pedido do Theo); gospel com I7 antes do IV e IV/V antes do V.
- **v3.1**: estilos com pegada humana: dinâmica (acentos e notas fantasma), pedal, swing no gospel, antecipações, viradas no fim das frases, bossa com polegar alternado, hino com vozes seguindo a melodia, micro-variações de tempo e piano mais brilhante quando tocado forte.
- **v3.0**: estilos de toque: o app gera o acompanhamento de qualquer música em Balada/Louvor, Gospel americano, Groove (R&B), Bossa nova, Baião, Hino tradicional e Arpejo, com cifras enriquecidas; tela "Estilos de toque" explica e toca cada estilo em I–V–vi–IV.
- **v2.9**: mais 7 hinos de domínio público (Graça Excelsa, Que segurança sou de Jesus, Santo Santo Santo, Alegria ao mundo, Ó vinde fiéis, Doxologia, Mais perto quero estar), transcritos das partituras da Wikipédia, com baixo automático pelas cifras.
- **v2.8**: 14 músicas novas de domínio público: hinos (Castelo Forte, Graças dai a Deus, Ó fronte ensanguentada, Despertai!, Jesus minha alegria, Vencendo vem Jesus) e clássicas (Mozart K. 545, Para Elisa, Minueto em Sol, Handel, Schubert, Verdi, Chopin, Joplin). Biblioteca separada em Hinos, Música clássica e Para começar.
- **v2.7**: aba Piano virou uma central com atalhos (Tocar, Treino de leitura, Minhas músicas, Do YouTube, Subir áudio/vídeo, Gravar, Meu teclado), cada um na sua tela, e cartão "Continuar".
- **v2.6**: tom da música escrito na tela da partitura (e na tela cheia); melodia grave vai para a clave de fá; menos ruído nas gravações de microfone; cifras mais musicais quando só há melodia (I, IV, V e tempos fortes).
- **v2.5**: cifras (acordes) em cima da partitura e ao lado das notas caindo, descobertas automaticamente pelas notas (músicas prontas, MIDI e as tiradas pela IA).
- **v2.4**: som no iPhone mesmo com a chave do silencioso ligada; IA mais sensível (normaliza gravações baixas); no celular, passo a passo da Gravação de Tela para tirar a partitura de vídeos do YouTube.
- **v2.3**: aberto dentro do app do Claude (onde o YouTube é bloqueado), o Harpa avisa e oferece abrir o site já com o link do YouTube preenchido, identificando sozinho.
- **v2.2**: aba Piano em 4 partes (Tocar · Partitura · Tirar música · Leitura); partitura em tamanho normal que abre em tela cheia com zoom e compasso aceso; link do YouTube identifica a música (nome, canal, vídeo, busca de cifra/partitura/MIDI) e grava o som do vídeo; IA Basic Pitch (Spotify) escreve a partitura completa (acordes + melodia) de áudio ou vídeo.
- **v2.1**: aba **Piano** (ideia do anúncio do TeclaTreino): notas caindo com modo Esperar, teclado USB-MIDI, microfone, 6 músicas prontas, abrir MIDI, partitura, tirar melodia de áudio/vídeo e treino de leitura.
- **v2**: visual e fluxo no padrão do Firmes (boas-vindas, início, trilha em caminho, stories em tela cheia, mestres desenhados, álbum, teste vocacional).
- **v1**: primeira versão (28 lições, academia de ouvido, laboratório).
