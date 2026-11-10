# Pixel Frontier

**Kadim sınır diyarında yaşayan çok oyunculu bir hayatta kalma ve yerleşim kurma oyunu.**

Oyuncular bilinmeyen bir dünyaya yolcu olarak gelir; kaynak toplar, zanaat yapar, çiftçilik ve keşifle ilerler, tek başına yaşayabilir veya bir topluluğa katılarak ortak bir yurt kurabilir. Görsel kimlik eski çağlardan esinlenen piksel sanatıdır: sisli ormanlar, taş kalıntılar, ahşap yapılar, bronz ve parşömen arayüz.

## Oynanabilir temel
- Phaser 3 tarayıcı istemcisi ve Node.js / Express / Socket.IO sunucusu.
- Sunucu otoriteli hareket, kaynak toplama, envanter, zanaat ve inşa.
- 24 gözlü çanta, alet kuşanma ve sandık depolama.
- Orman, göl, dağ ve çayır biyomları; gündüz/gece, hava ve çevresel canlılar.
- İsteğe bağlı PostgreSQL kalıcılığı.
- Chunk tabanlı oyuncu görünürlüğü ve süreç içi 50 kişilik mantıksal lobi.
- Kabile totemleri, 400×400 toprak sınırları ve hâkimiyet özeti.
- Oyuncu sayısı yalnızca canlı insan oturumlarını gösterir; bot oyuncu yoktur.

## Yerel çalıştırma
Node.js 20+ gerekir.

```bash
npm install
cp .env.example .env
# Kalıcı kayıt için .env içine DATABASE_URL ve SESSION_SECRET ekle.
npm run dev
```

Tarayıcıda http://localhost:3000 adresini aç. İki ayrı oyuncuyu test etmek için iki ayrı tarayıcı profili veya normal/gizli pencere kullan.

## Kontroller
- WASD / Ok tuşları — hareket
- E — yakındaki kaynağı topla
- F — yakındaki sandığı aç
- İnşa düğmesi — yapıyı seç, sonra dünyada yakındaki noktaya tıkla
- Envanterde bir yuvayı seç, ardından hedef yuvaya tıklayarak taşı
- Tahta balta veya taş kazma üret; çalışma tezgâhını yerleştir

## İlk hedef
15 odun ve 5 taş topla → tahta balta üret → çalışma tezgâhı kur → erzak sandığı yerleştir. Kabileye katılmak isteğe bağlıdır. Bu rehber henüz istemci tarafında tutulur; kalıcı sunucu görev sistemi yol haritasındadır.

## Güvenlik ve ölçek
Üretimde ALLOWED_ORIGINS değerini tam HTTPS origin listesiyle yapılandır. Mevcut lobi tahsisi süreç içidir; çoklu sunucu dünya parçalama sistemi değildir. Ayrıntılar için `docs/SCALING_ARCHITECTURE.md` ve `docs/PRODUCTION_SECURITY.md` dosyalarına bak.

DATABASE_URL olmadan dünya prototip amaçlı bellekte çalışır. Sunucu yeniden başlatmaları arasında kayıt için DATABASE_URL ve kararlı SESSION_SECRET gerekir.

## Proje yapısı
- `public/` — Phaser istemcisi ve arayüz
- `server/` — otoriter oyun sunucusu
- `tests/` — otomatik testler
- `docs/` — tasarım, dünya, ağ ve yol haritası

MIT License.
