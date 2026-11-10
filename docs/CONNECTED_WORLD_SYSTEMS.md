# Birbirine Bağlı Yaşayan Dünya: Tarım, Deniz Yolculuğu ve Hayvanlar

Bu belge, Pixel Frontier'ın yeni yaşam döngülerini tek bir ilerleme zinciri olarak tanımlar. Buradaki tasarım maddeleri tamamlanmış oyun özellikleri değildir; uygulama ve test kabul kriterleridir.

## Tasarım ilkesi

Yeni sistemler mevcut hareket, envanter, üretim, sandık, kayıt, chunk ve çok oyunculu akışlarını bozmadan eklenir. Eşya sahipliği, kaynak tüketimi, dünya değişiklikleri, büyüme zamanları ve ödüller sunucu tarafından doğrulanır. İstemci yalnızca oyuncu niyetini gönderir.

## 1. Tarım alanı ve toprak hazırlığı

Normal arazi ile ekilebilir parsel farklı dünya durumlarıdır. Çayır veya uygun düz zemin, kendi kendine tarla haline gelmez.

### Oynanış döngüsü

1. Oyuncu uygun araziyi bulur. Su, dik yamaç, kaya, bina, yol ve başka parsellerle çakışma kontrolleri yapılır.
2. Oyuncu gerekli hammaddeleri toplayıp çapa üretir.
3. Çapa kuşanılır; dayanıklılık kontrolü sunucuda yapılır.
4. Oyuncu uygun zemini sürerek sınırlı boyutta bir tarla parseli oluşturur. İşlem alet dayanıklılığı tüketir.
5. Oyuncu tohum eker. Tohum türü, mevsim/hava koşulu, toprak ve su gereksinimi doğrulanır.
6. Bitki gerçek zamanlı dünya saatine göre aşamalı büyür. Oyuncu çevrimdışıyken de büyüme devam edebilir.
7. Hasat yalnızca olgun üründen yapılır; ürün ve tohum geri dönüşü sunucu tarafından hesaplanır.

### Teknik kurallar

- Tarla parselleri chunk anahtarına bağlı, kalıcı dünya verisi olmalıdır; yalnızca istemci belleğinde tutulamaz.
- Parsel kimliği ve koordinatı sunucu tarafından belirlenir. Aynı hücreye ikinci kez sürme/ekim yapılamaz.
- Ekim, sulama, hasat ve alet dayanıklılığı işlemleri atomik olmalıdır; tekrar gönderilen istekler çift ödül oluşturmamalıdır.
- Büyüme her oyuncu için ayrı timer çalıştırarak değil, zaman damgası ve gerektiğinde hesaplama ile yapılmalıdır.
- Sulama yağmurla desteklenebilir; fakat her bitkinin gereksinimleri açık ve test edilebilir olmalıdır.
- Tarla bakımı ileride çiftçi mesleği XP'siyle bağlanabilir; meslek seçimi diğer meslekleri kilitlemez.

## 2. Yarımadalar, adalar ve deniz ulaşımı

Dünya yalnızca tek parça kara olmamalıdır. Ana kara, kıyı girintileri, yarımadalar, küçük adalar ve uzak büyük adalardan oluşan bir harita hedeflenir.

### Dünya üretimi

- Seed tabanlı üretim aynı dünya seed'i için aynı kıyı ve ada düzenini üretmelidir.
- Kara, kıyı/sığ su ve açık deniz ayrı arazi sınıflarıdır.
- Oyuncu su üzerinde yürüyemez; kara hareketi ve deniz taşıtı hareketi ayrı doğrulanır.
- Adalar arası mesafeler sefer süresi, tekne dayanıklılığı ve hazırlık ihtiyacıyla dengelenir.
- Chunk üretimi ve ilgi alanı yönetimi korunur; oyuncuya uzak adaların tüm nesneleri gönderilmez.

### Kayık ve sefer ilerlemesi

1. İlk kayık yakın kıyı keşifleri için üretilebilir; odun ve lif/ip gibi kaynaklar ister.
2. Tekne yalnızca uygun kıyıdan suya indirilebilir ve karaya uygun noktada çıkarılabilir.
3. Uzak/büyük ada seferleri daha gelişmiş tekne, yedek malzeme, yiyecek ve grup koordinasyonu isteyebilir.
4. Tekne durumu ve sahipliği sunucu tarafında tutulur. Hasar/onarım gibi mekanikler daha sonra eklenebilir.
5. Kabile seferleri grup kolaylığı sağlayabilir; ancak ada keşfi yalnız oyuncuya kapatılmaz.
6. Bağlantı kopması veya sunucu değişiminde oyuncu/tekne konumu güvenli biçimde kurtarılmalıdır.

## 3. Vahşi ve evcilleştirilebilir hayvanlar

Hayvanlar çevresel canlılardır; oyuncu sayısına veya çevrimiçi nüfusa dahil edilmez.

### Tür sınıfları

- Vahşi türler: doğal biyomlarında dolaşır, oyuncu yaklaşınca kaçabilir ve çevre davranışı gösterir.
- Evcilleştirilebilir türler: yalnızca belirli türler, uygun yiyecek ve zaman isteyen güven kazanma süreciyle evcilleştirilebilir.
- Evcil hayvanlar: sahibine/yerleşime bağlanır; beslenme, barınak ve bakım ister. İleride çiftlik döngüsüne katkı sağlayabilir.

### Güvenlik ve performans

- Evcilleştirme istemcinin gönderdiği bir bayrakla tamamlanamaz; sunucu mesafe, tür, yiyecek, süre ve durum kontrollerini yapar.
- Hayvanlar oyuncu gibi Socket.IO oturumu veya sahte çevrimiçi sayısı üretmez.
- Her hayvana ayrı yüksek frekanslı yapay zekâ döngüsü çalıştırılmaz. Yakınlık/aktivite tabanlı düşük maliyetli güncelleme kullanılır.
- Hayvan nüfusu biyom ve chunk başına sınırlandırılır.

## 4. Sistemlerin birbirine bağlanması

Örnek ilerleme zinciri:

**Kaynak toplama → alet üretimi → tarla hazırlama → tohum ekme → sulama/büyüme → hasat → yiyecek ve ticaret**

İkinci zincir:

**Odun/lif toplama → kayık üretimi → kıyıdan denize açılma → ada keşfi → yeni kaynaklar → gelişmiş üretim ve yerleşim**

Üçüncü zincir:

**Biyom keşfi → vahşi hayvanı tanıma → uygun yiyecek hazırlama → güven kazanma → evcil hayvan bakımı → çiftlik ve yerleşim gelişimi**

Bu zincirler görevler ve meslek XP'siyle ileride bağlanır. Oyuncu bir zincire katılmaya zorlanmaz; solo ve topluluk oyun yolları birlikte desteklenir.

## 5. Uygulama sırası

1. **Tarım zemini:** ekilebilir zemin kuralları, çapa tarifi, sunucu taraflı sürme, kalıcı parsel ve testler.
2. **Tohum ve ürün:** tohum kataloğu, ekim, zaman damgalı büyüme, sulama ve hasat.
3. **Meslek bağlantısı:** çiftçi XP'si ve uzmanlıklar; diğer meslekleri kilitlemeden.
4. **Kıyı ve ada dünya üretimi:** seed tabanlı kıyı/ada haritası, su geçişi ve chunk senkronizasyonu.
5. **Kayık ve sefer:** tekne üretimi, su hareketi, kıyıya yanaşma, güvenli yeniden bağlanma.
6. **Hayvan davranışı:** vahşi türlerin biyom davranışı ve performans sınırları.
7. **Evcilleştirme ve bakım:** tür/yiyecek/süre kuralları, kalıcılık ve çiftlik bağlantısı.

Bu işler tamamlanmış kabul edilmeden önce birim/entegrasyon testleri, eski kayıtlarla geriye dönük uyumluluk, çok oyunculu eşzamanlılık testleri ve tarayıcı oynanış kontrolü gerekir.

## Kabul edilmeyecek kestirme yollar

- Her çayır karesini otomatik tarla saymak.
- Ekinleri yalnızca istemcide saklamak veya oyuncu çevrimdışıyken büyümeyi kaybetmek.
- Kayığı yalnızca dekoratif eşya yapmak ya da oyuncuyu deniz üzerinde yürütmek.
- Her hayvanı evcilleştirilebilir yapmak veya hayvanları sahte oyuncu gibi göstermek.
- Büyük adaları yalnızca harita görseli olarak ekleyip ulaşım/keşif döngüsünü kurmamak.
- Test edilmemiş oyuncu kapasitesi veya üretime hazır olma iddiasında bulunmak.
