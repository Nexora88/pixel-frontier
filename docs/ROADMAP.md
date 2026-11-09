# Pixel Frontier — 90 Günlük Geliştirme Yol Haritası

## Aşama 0 — Görsel temel ve anlaşılır başlangıç (şimdi)
- [x] Kadim sınırlar sanat yönü: parşömen, ahşap, taş ve bronz arayüz.
- [x] Türkçe HUD ve temel oyun terimleri.
- [x] İlk yerleşim rehberi: kaynak → balta → çalışma tezgâhı → sandık.\n- [x] Kabileye katılmayı isteğe bağlı hale getirme; solo ilerleme seçeneği.\n- [x] Çalışma tezgâhı için sunucu taraflı yapı tanımı ve piksel tarzı çizim.\n- [x] Yakın ağaç taçlarında düşük maliyetli rüzgâr hareketi.
- [x] Envanter filtreleri, eşya açıklaması ve seçili eşya görünümü.
- [x] Biyomlarda deterministik zemin ayrıntıları ve eski taş kalıntıları.
- [x] Ahşap/taş duvar, kapı, sandık ve totem için daha ayırt edilebilir çizimler.
- [ ] Masaüstü ve gerçek telefon ekranında görsel QA; ölçek, taşma ve okunabilirlik.
- [ ] Toplama, üretim, sandık transferi ve inşa akışını iki ayrı oyuncuyla doğrulama.

## Aşama 1 — Kalıcı ilerleme ve ilk 30 dakika (1–2. hafta)
- [ ] Görev ilerlemesini PostgreSQL üzerinde sunucu tarafında kalıcı hale getirme; istemci yalnızca görüntülesin.\n- [ ] Görev ödüllerini tekrar gönderime karşı idempotent hale getirme; farklı cihazdan devam testi.
- [ ] Başlangıç rehberi: hareket, kaynak, envanter, üretim, inşa ve güvenli bölge.
- [ ] Oyuncunun ilk 30 dakikada tamamlayabileceği 3 bölüm ve anlaşılır ödül döngüsü.
- [ ] Çalışma tezgâhını tarif doğrulaması ve tarif kitabıyla tamamlamak.\n- [ ] Yeni tarifler: kamp ateşi, yatak/istirahat noktası, işaret levhası ve tarım araçları.
- [ ] Kaynak yenilenmesi ve çanta doluluğu için anlaşılır geri bildirim.
- [ ] Görev ve üretim maliyetleri için ekonomi dengelemesi.

## Aşama 2 — Kadim dünya ve sanat paketi (2–4. hafta)
- [ ] Özgün 32×32 karakter seti: en az 4 yön, idle/yürüme/toplama/inşa klipleri.
- [ ] 64×64 ağaçlar, çalılar, taşlar ve biyom bitki örtüsü.
- [ ] Orman, çayır, göl, dağ ve harabe için tutarlı tile set.
- [ ] Ahşap/taş yapı modülleri, kapı açılma ve sandık animasyonu.
- [ ] Gün doğumu/batımı, sis, yağmur, su ve ateş efektleri.
- [ ] Ses paketi: adım, toplama, taş/odun, zanaat, kapı, sandık ve ortam sesleri.
- [ ] Düşük donanım profili; efekt yoğunluğu ve nesne havuzları.

## Aşama 3 — Yerleşim, meslek ve keşif (4–6. hafta)
- [ ] Çalışma tezgâhı ve tarif ağacı.
- [ ] Meslek uzmanlıkları; sınıf kilidi olmadan değiştirilebilir ilerleme.
- [ ] Tarım, tohum, sulama, büyüme evreleri, hasat ve yiyecek hazırlama.\n- [ ] Mevsimlere göre ürün takvimi ve toprak dinlenmesi.
- [ ] Harabe/mağara/antik yol keşif noktaları ve küçük çevresel hikâyeler.
- [ ] Yerleşim kroniği, tabela ve oyuncu yapımı yollar.
- [ ] Kaynak yenilenmesi ve bölgesel ekoloji.

## Aşama 4 — Kabileler ve ortak dünya (6–8. hafta)
- [ ] Kabile kuruluşunda en az 3 farklı canlı insan oyuncu için kurucu onayı; kabilesiz ilerleme korunur.\n- [ ] Kabile rolleri, davet ve izinler.\n- [ ] Yurt sancakları, yerleşim kroniği ve topluluk aidiyeti; ayrımcı/üstünlükçü sistem yok.
- [ ] Ortak depo, kabile görevleri ve katkı panosu.
- [ ] 400×400 toprak sahipliği için görsel harita katmanı ve anlaşılır sınırlar.
- [ ] Korunan başlangıç, çevrimdışı koruma ve adil rekabet kuralları.\n- [ ] Mevsimsel yapı yıpranması: yeni → kullanılmış → yıpranmış → hasarlı → harabe.\n- [ ] Bakım/onarım, uzun tolerans ve çevrimdışı oyuncu koruması.
- [ ] Pazar/emanet ticaret ve çevrimdışı satış akışı.
- [ ] Düzenli ortak dünya etkinlikleri.

## Aşama 5 — Ölçek ve yayın hazırlığı (8–12. hafta)
- [ ] PostgreSQL kalıcılık, yedekleme ve geri yükleme tatbikatı.
- [ ] Redis koordinasyonu ve gerçek çoklu süreç dünya sahipliği.
- [ ] 50–60 oyunculu dünya testi; ardından çoklu dünya testleri.
- [ ] 1/10/30/60 oyuncu senaryoları, CPU/RAM/ağ/gecikme ölçümleri.
- [ ] Mobil/masaüstü tarayıcı regresyonu ve bağlantı kopma testleri.
- [ ] Gözlemlenebilirlik, oran sınırlama, moderasyon ve yayın kontrol listesi.

## İnsan oyuncu ilkesi\n- Oyuncu sayısı yalnızca canlı, doğrulanmış insan oturumlarını gösterir. Bot oyuncu, sahte çevrimiçi nüfus veya otomatik pazar katılımcısı eklenmez.\n- Çevresel vahşi yaşam oyuncu değildir ve çevrimiçi oyuncu sayısına dahil edilmez.\n- Yük testlerindeki sentetik istemciler test metriği olarak ayrı etiketlenir.\n\n## Ölçüm ve çıkış kriterleri
- Mevcut 50 oyunculuk lobi tahsisi süreç içidir; çok sunuculu kapasite anlamına gelmez.
- 2.000–5.000 eşzamanlı oyuncu hedefi ölçülmüş kapasite değildir.
- Görsel efektler chunk dışına taşmamalı; gereksiz dünya geneli yayın yapılmamalı.
- Her aşama test ve gerçek cihaz kontrolü tamamlanmadan bitmiş sayılmaz.
