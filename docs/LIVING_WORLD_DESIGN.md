# Yaşayan Dünya Sistem Tasarımı

Bu belge, Pixel Frontier'ın savaş merkezli olmayan; canlı oyuncuların emek, üretim, keşif, ticaret ve ortak yurt duygusuyla şekillendirdiği bir kadim dünya olmasını tanımlar. Bu dosya tasarım ve teknik kabul kriteridir; burada listelenen her sistemin oyunda tamamlandığı anlamına gelmez.

## 1. İnsan oyuncular ve gerçek topluluk

- Oyuncu listesi, çevrimiçi sayısı, kabile üye sayısı ve pazar etkinliği yalnızca doğrulanmış canlı oyuncu oturumlarından hesaplanır.
- Bot hesap, sahte çevrimiçi oyuncu, otomatik pazar satıcısı veya doluluk göstermek için üretilmiş karakter kesinlikle eklenmez.
- Hayvanlar çevresel vahşi yaşamdır; oyuncu gibi davranmaz, sohbet etmez, ticaret yapmaz, kabile kurmaz ve oyuncu sayısına dahil edilmez.
- Oyuncu bağlantısı kesildiğinde çevrimiçi sayısından çıkarılır. Kalıcı oyuncu kaydı, çevrimiçi oyuncu olarak gösterilmez.
- İleride moderasyon/test araçları gerekirse bunlar oyuncu gibi görünmeyen, açıkça yönetim aracı olarak etiketlenmiş araçlar olmalıdır.

## 2. Birden fazla geçerli yaşam yolu

Savaş zorunlu ilerleme kapısı olmayacak. Uzmanlıklar sınıf kilidi değil, zamanla gelişen ve değiştirilebilen meslek yolları olacak.

| Yol | Oyuncunun katkısı | Örnek ilerleme |
|---|---|---|
| Çiftçi | Topluluğun yiyecek ve tohum döngüsü | Tohum → ekim → bakım → hasat → pazar |
| Zanaatkâr | Alet, mobilya, yapı parçası ve ekipman | Tezgâh → tarif bilgisi → kalite → sipariş |
| Keşifçi | Harita, rota ve keşif bulguları | Patika → harita işareti → harabe → nadir buluntu |
| Tüccar | Yerleşimler arasında kaynak dolaşımı | Tezgâh/pazar → güvenilir ticaret → kervan rotası |
| İnşaatçı | Ortak yapı ve savunma altyapısı | Temel → duvar → kapı → bakım/onarım |
| Toplayıcı | Hammaddelerin sürdürülebilir toplanması | Biyom bilgisi → verimli toplama → kaynak yenilenmesi |

Her yol tek başına oynanabilir. İyi ekipler birbirine ihtiyaç duyar ama hiçbir meslek diğer oyuncunun ilerlemesini rehin alamaz. Tariflerin bir kısmı uzmanlıkla daha verimli olabilir; temel ihtiyaçlar tek bir mesleğe kilitlenmez.

## 3. Çalışma tezgâhı ve zanaat

- Çalışma tezgâhı, dünyaya yerleştirilen ve sunucuda sahipliği doğrulanan bir yapıdır.
- Oyuncu tezgâha yaklaşınca tarif kitabı açılır; tarifler malzeme, süre, çıktı ve gerekiyorsa meslek bilgisini açıkça gösterir.
- İlk tarif grupları: basit aletler, ip/tekstil, ahşap parçalar, taş parçalar, tarım araçları, depolama ve dekorasyon.
- Üretim girdileri sunucuda atomik olarak düşülür; istemci yalnızca istek yollar. Çift tıklama veya tekrar gönderim aynı üretimi iki kez tamamlayamaz.
- Tezgâh seviyesi kozmetik bir sayı olmamalı; yeni tarifler, daha iyi verim veya farklı malzeme işleme seçenekleri açmalıdır.
- Üretim kuyruğu çevrimdışı oyuncuyu cezalandırmamalı; bağlantı kesilmesi tamamlanmış üretimi kaybettirmemelidir.

## 4. Tarım ve bölgesel ekoloji

- Tarla parselleri, tohum türü, ekim zamanı, su durumu, büyüme evresi ve hasat durumu sunucu tarafında tutulur.
- İlk ürünler bölgeye uygun, kolay anlaşılır birkaç ürünle başlar. Tohum, hasat ve yeniden ekim döngüsü oyuncuya gösterilir.
- Büyüme gerçek zamanlı sunucu saatine bağlıdır; istemci saati değiştirilerek hasat hızlandırılamaz.
- Mevsim, su ve biyom büyümeyi etkiler. Her ürün her mevsimde aynı verimi vermez; sera/korunak gibi ileriki yapılar alternatif sunabilir.
- Hasat sonrası toprağın dinlenmesi ve kaynakların yenilenmesi teşvik edilir. Tarla sonsuz üretim makinesi değildir.
- Tarım savaş dışında güvenilir gelir ve topluluk katkısı sağlamalıdır.

## 5. Kalıcı görev ve oyuncu hikâyesi

- Görev ilerlemesi localStorage yerine PostgreSQL'de oyuncu kimliğiyle saklanır; farklı cihazdan girişte devam eder.
- Görev tanımları sürümlenir. Görev metni değişse bile tamamlanmış ilerleme kaybolmaz.
- Görev adımları sunucudaki gerçek olaylardan ilerler: eşya toplandı, tarif üretildi, tarla ekildi, ürün hasat edildi, keşif noktası bulundu.
- Aynı olayın tekrar gönderilmesi çift ödül vermez. Ödül ve görev ilerlemesi tek işlem olarak kaydedilir.
- Ana görevler keşif, yerleşim, zanaat ve topluluk yolları sunar. Kabile kurmak hiçbir ana görevde zorunlu değildir.
- Oyuncu görevleri atlayabilir; görevler savaş veya belirli bir kabileye katılmayı zorunlu kılmaz.

## 6. Kabile kurma ve toplumsal güven

Herkesin tek başına kabile kurması dünyayı küçük ve anlamsız gruplara böler. Kabile, isim yazıp düğmeye basmak değil, ortak bir topluluğun kuruluşu olmalıdır.

- Oyuncu önce mevcut kabileleri keşfedebilir, davet isteyebilir veya kabilesiz/solo yaşam yolunda kalabilir.
- Yeni kabile kuruluşu için önerilen temel: en az 3 farklı, doğrulanmış insan oyuncunun kurucu onayı; kuruluş kaynakları; kurucu sözleşmesi ve makul kuruluş bekleme süresi.
- Aynı oyuncunun çoklu hesaplarla kuruluş eşiğini aşmasını engellemek için hesap yaşı, oturum güveni ve oran sınırlaması değerlendirilmeli; kişisel veri toplanması minimumda tutulmalı.
- Kabile rolleri: kurucu/lider, yönetici, inşaatçı, zanaatkâr, çiftçi, tüccar ve üye. Yetkiler en az ayrıcalık ilkesiyle verilir.
- Liderlik devri, üyelikten ayrılma, davet iptali ve ortak depo erişimi açık kurallara sahip olmalıdır.
- Kabile üyesi olmak zorunlu değildir; solo oyuncu da ev, tarla, tezgâh, ticaret ve keşif ilerlemesini sürdürebilir.

## 7. Yurt aidiyeti, sancak ve millî duygu

Oyuncuların kendi yurtlarına, ortak tarihine ve sembollerine bağlılık hissetmesi hedeflenir. Bu duygu gerçek dünyadaki milletleri veya oyuncuları üstün/aşağı gösteren bir sisteme dönüşmemelidir.

- Her kabile kendi sancağını, renklerini, kısa tarihçesini, yerleşim adını ve ortak değerlerini belirler.
- Sancaklar haritada, kapılarda, pazar alanlarında ve tören/şenlik alanlarında görünür.
- Yerleşim kroniği; kurucuları, önemli yapıları, keşifleri, hasat şenliklerini ve ortak başarıları kaydeder.
- Oyuncular kendi yurtlarının dilini ve hikâyesini yaşatır; diğer topluluklarla diplomasi, ticaret ve karşılıklı saygı korunur.
- Gerçek ülke/etnik köken üstünlüğü, nefret sembolü veya ayrımcı puan sistemi kullanılmaz. Aidiyet; emek, ortak hafıza ve dayanışma üzerinden kurulur.

## 8. Surlar, mevsimler ve zamanla eskime

Dünya sabit bir inşaat ekranı değil; zamanın iz bıraktığı bir yer olmalı. Hiçbir sur sonsuza kadar ilk günkü gibi kalmamalı.

- Yapılar durum taşır: yeni, kullanılmış, yıpranmış, hasarlı, harabe. Durum görsel olarak da anlaşılır.
- Yağmur, don, sıcaklık, nem, malzeme türü ve geçen oyun mevsimleri yıpranmayı etkiler.
- Ahşap dış yüzeyler hava koşullarından daha fazla etkilenir; taş yapılar daha yavaş yıpranır ama tamamen bakım gerektirmez hale gelmez.
- Oyuncular bakım malzemesi ve emek harcayarak yapıyı onarabilir, güçlendirebilir veya yenileyebilir.
- Bakımı ihmal edilen surlar bir anda silinmez: önce renk/çatlak/kaplama değişimi, sonra işlevsel dayanıklılık kaybı, en son harabeye dönüşme aşaması gelir.
- Harabe, dünyanın tarihini gösteren bir iz olarak kalabilir; kaynak geri kazanımı sınırlı ve kontrollü olmalıdır.
- Çevrimdışı oyuncuların yapıları kısa sürede yok edilmez. Yıpranma için uzun tolerans, bakım bildirimi ve güvenli toparlanma süresi gerekir.
- Mevsim geçişi yalnızca görsel filtre değildir: tarım takvimi, su/yağış, bitki örtüsü, yapı bakımı ve ticaret talebini etkiler.
- Mevsim uzunluğu, yıpranma hızı ve bakım maliyeti oyuncu testleriyle ayarlanır; gerçek zamanlı takvim henüz kararlaştırılmış değildir.

## 9. Savunma ve güvenli rekabet

- Surlar, kapılar ve savunma yapıları yerleşimi korumaya yarar; sürekli çevrimiçi kalmayı zorunlu kılan bir baskı yaratmaz.
- Başlangıç bölgeleri, yeni oyuncular ve çevrimdışı yerleşimler için koruma kuralları sunucu tarafında uygulanır.
- Kabileler arası rekabet; ticaret, keşif, ortak etkinlik ve sınırlı/önceden ilan edilmiş rekabet alanlarıyla çeşitlenir.
- Hasar, kuşatma ve yağma sistemleri ancak izinler, koruma pencereleri, kayıp sınırları ve geri dönüş yolları tasarlandıktan sonra açılır.
- Savaş dışı oyuncuların emekle kurduğu çiftlik ve atölyeler tek bir baskınla yok edilemez.

## 10. Pixel-art sanat standardı

- Dünya ve karakterler net piksel ızgarasında çizilir; bulanık vektör/filtre görünümü kullanılmaz.
- Karakter hedefi 32×32 temel hücre, en az dört yön ve ayrı idle/yürüme/toplama/üretim animasyonlarıdır.
- Ağaçlar katmanlı çizilir: gövde, yaprak tacı ve gölge. Rüzgâr animasyonu az kareli ve düşük maliyetli olmalıdır.
- Mevsim varyantları aynı silüeti koruyup yaprak/renk/zemin katmanlarını değiştirir.
- Tezgâh, tarla, tohum, büyüme evreleri, hasat, sur aşınması ve sancaklar aynı palet ve perspektife uymalıdır.
- Sprite atlasları tek bir hücre ölçüsü ve isimlendirme standardı kullanır; animasyon kareleri testle doğrulanır.
- Oyuncu, yapı ve kaynaklar için depth sorting korunur. Ağaç tacı oyuncunun önündeyken yarı saydam olur.
- Düşük donanım için parçacık, animasyon ve çevresel nesne sayısı sınırlandırılır.

## 11. Teknik kabul kriterleri

- İstemci yalnızca oyuncu niyeti gönderir; görev, tarım, üretim, kabile, yapı durumu ve ödül sunucuda doğrulanır.
- PostgreSQL kayıtları şema/migration ile sürümlenir; yeniden başlatma ve yedekten dönüş test edilir.
- Her yeni sistem için birim testleri, tekrar gönderim/idempotency testleri ve çok oyunculu entegrasyon testi eklenir.
- Chunk ilgi yönetimi korunur; yalnızca ilgili çevredeki oyuncular ve dünya nesneleri güncellenir.
- Bot oyuncu veya yapay çevrimiçi nüfus testi yoktur. Yük testleri sentetik istemci bağlantılarını açıkça test trafiği olarak etiketler ve gerçek oyuncu sayısına karıştırmaz.
- 1/10/30/60 gerçek istemci senaryoları ve birden fazla dünya testi ölçülmeden kapasite iddiası yapılmaz.
