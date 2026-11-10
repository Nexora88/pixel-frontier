# Pixel Frontier — Ses kimliği

## Yön
Kadim, gizemli ve yaşayan bir sınır diyarı. Sesler sakin keşfi desteklemeli; sürekli yüksek sesli veya yorucu olmamalı. Müzik özgün, sözsüz ve döngüye uygun olmalı.

## İlk ses karışımı
- Doğa: %75 — rüzgâr, kuş çağrıları, hafif su dokusu; yağmurda rüzgâr/su katmanı artar.
- Müzik: %35 — ayrı müzik kanalı. Suno parçası hazır olduğunda `public/assets/audio/frontier-mystery.mp3` yoluna konur.
- Oyuncu sesleri: %80 — toplama, inşa ve üretme için kısa özgün Web Audio efektleri.
- Konuşma tercihi: Bas-konuş. Bu PR sesli sohbeti bağlamaz; gerçek oyuncudan oyuncuya ses için güvenli sinyalleşme, yakınlık doğrulaması, sessize alma/engelleme ve küçük grup sınırı ayrıca uygulanmalıdır.

Sesler tarayıcıda ilk kullanıcı etkileşiminden sonra başlar. Seviyeler cihazda saklanır. Harici ses dosyası olmadan doğa ve temel eylem efektleri çalışır.

## Suno için özgün müzik istemleri

### 1. Ana keşif teması — Frontier Mystery
Instrumental only, no vocals, no lyrics. Original cinematic ambient fantasy soundtrack for an ancient unexplored frontier survival game. Mysterious, wondrous and quietly adventurous, not horror. Slow 76 BPM, sparse frame drums, distant low strings, breathy wooden flute, subtle plucked lute-like texture, warm bowed drones, tiny metallic chimes, wide natural reverb. Gradually evolving, memorable but restrained, seamless loop, 2 minutes, no sudden loud hits, no recognizable melodies or references to existing franchises.

### 2. Gece ormanı — Whispers Beneath the Pines
Instrumental only, no vocals. Original nocturnal forest ambience music for a peaceful ancient-world exploration game. Deep soft drones, delicate low strings, airy flute fragments, faint bells, slow 60 BPM pulse, mysterious and beautiful with a feeling of discovery and safety. Very subtle dynamics, sparse arrangement, seamless loop, 2 minutes, no jump scares, no horror stingers, no existing-song references.

### 3. Yerleşim ve üretim — Hearth of the New Home
Instrumental only, no vocals. Original warm medieval-inspired settlement theme for a pixel-art survival world. Gentle plucked strings, wooden percussion, soft fiddle-like sustained notes, mellow flute, subtle hand drum, 84 BPM. Hopeful, grounded, communal and handcrafted; ancient atmosphere without sounding like a battle march. Seamless loop, 2 minutes, no recognizable existing melodies.

## Dosya yerleşimi
Suno'dan indirilen ve kullanım hakları kontrol edilen nihai MP3:
- Ana tema: `public/assets/audio/frontier-mystery.mp3`

Diğer biyom/gece temaları sonraki aşamada ayrı dosya olarak eklenebilir. Suno çıktısının ticari kullanım koşulları, plan ve üretim tarihine göre ayrıca kontrol edilmelidir.
