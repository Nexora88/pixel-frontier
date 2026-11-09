# Pixel Frontier — Game Design

## Kimlik: Kadim Sınırlar
Pixel Frontier, teknolojik bir arena değil; eski çağlardan esinlenen, yaşayan bir sınır dünyası. Görsel dilimiz erken yerleşimler, taş patikalar, ahşap yapılar, kabile sancakları, el yapımı aletler, sisli ormanlar ve unutulmuş kalıntılar üzerine kurulmalı. Tarihsel bir dönemi birebir kopyalamak yerine özgün, zamansız bir eski çağ atmosferi hedeflenir.

## Oyuncunun büyük amacı
Oyuncu bilinmeyen bir diyara tek başına gelen bir yolcu olarak başlar. Uzun vadeli hedef yalnızca kaynak biriktirmek değil:
1. Doğayı tanımak ve hayatta kalmak.
2. Aletlerini ve zanaat bilgisini geliştirmek.
3. İlk sığınağını ve erzak düzenini kurmak.
4. Başka oyuncularla kabile oluşturmak.
5. Totemlerle yurdunu işaretlemek, yollar ve ticaret noktaları kurmak.
6. Haritadaki eski kalıntıları keşfedip dünyanın geçmişini ortaya çıkarmak.
7. Kendi yerleşimini büyütürken diğer oyuncularla iş birliği yapmak, ticaret etmek ve ortak dünya olaylarına katılmak.

## İlk oynanabilir döngü
Keşfet → kaynakları topla → çantayı yönet → alet üret → sığınak kur → kabileye katıl/kur → yeni bölgelere açıl → ticaret ve keşif yap.

İlk görev zinciri: 15 odun ve 5 taş topla → tahta balta üret → erzak sandığı yerleştir → kabile kur. Bu görev oyuncuya mevcut sistemleri öğretir; ödül ekonomisi veya sunucu taraflı görev sistemi eklenene kadar istemci tarafında rehber niteliğindedir.

## Görsel sanat yönü
- Dünya: 16-bit/32-bit hissinde, okunaklı üstten görünüm; kare pikseller ve sınırlı palet.
- Renk: yosun yeşili, toprak kahvesi, taş grisi, solmuş keten, bronz ve ocak ateşi.
- Doğa: ağaç gölgesi, çimen kümeleri, taşlık alan, su parıltısı, sis ve mevsimsel tonlar.
- Yapılar: ayrı ayrı okunabilen ahşap kütük duvar, taş örgü duvar, sürgülü kapı, erzak sandığı, kabile totemi.
- Arayüz: eski parşömen, oyma ahşap, bronz kenar ve sade ikonografi. Mobil ekranda görev, çanta ve eylemler birbirini kapatmamalı.
- Animasyon: toplama geri bildirimi, alet kullanımı, inşa tozu, ateş titreşimi, su ve yaprak hareketi. Efektler kısa ve düşük maliyetli olmalı.

## Envanter ve zanaat ilkeleri
- 24 yuva ve sunucu otoriteli eşya miktarları korunur.
- Eşya kategorileri: kaynaklar, aletler/ekipman, ileride yiyecek, yapı parçaları ve nadir buluntular.
- Her eşyanın adı, ne işe yaradığı ve hangi tariflerde kullanıldığı açık olmalı.
- Çanta sıralama/taşıma, seçili eşya ayrıntısı, kuşanma ve sandık transferi anlaşılır olmalı.
- Tarifler oyuncuya maliyeti önceden göstermeli; malzeme yoksa açık ve tutarlı geri bildirim verilmeli.
- İstemci yalnızca arayüzdür; eşya, tarif, sahiplik ve sonuçların tek doğruluk kaynağı sunucudur.

## Uzun vadeli sistemler
- Meslekler: oduncu, taş ustası, izci, çiftçi, zanaatkâr ve tüccar. Kalıcı sınıf kilidi yerine değiştirilebilir uzmanlık.
- Yerleşim: ortak depo, üretim tezgâhları, tarlalar, yollar, işaret levhaları ve yerleşim kroniği.
- Keşif: harabe, mağara, eski yol, nadir kaynak ve bölgesel hikâyeler.
- Ekoloji: kaynakların yenilenmesi ve aşırı toplamaya karşı doğal toparlanma.
- Topluluk: kabile rolleri, davet, ortak hedefler, ticaret ve adil çevrimdışı koruma.
- Dünya olayları: mevsim geçişi, göç, pazar günü, keşif seferi ve ortak inşa hedefleri.

## Mimari ve adalet ilkeleri
1. **Sunucu otoritesi:** İstemci yalnızca niyet gönderir. Hareket, toplama, üretim, inşa, hasar ve sahiplik sunucuda doğrulanır.
2. **Chunk tabanlı ilgi yönetimi:** Oyuncu yalnızca yakın çevresinin güncellemelerini alır.
3. **Korunan başlangıç:** Yeni oyuncular için güvenli alan ve anlaşılır öğrenme akışı.
4. **Kalıcı dünya hafızası:** Yerleşimler, keşifler ve dünya olayları yedeklenebilir kalıcı depoda tutulur.
5. **Adil çok oyunculu:** Çevrimdışı koruma, izinler, toparlanma ve savaş dışı ilerleme temel özelliklerdir.
6. **Performans:** Efektler, sahne nesneleri, ağ paketleri ve sunucu işi sınırlı tutulur; kapasite ancak yük testleriyle ilan edilir.

## Savaş yaklaşımı
Savaş ana amaç değildir; keşif, üretim, yerleşim ve ticaret kadar önemli bir seçenek olabilir. Rekabet sistemleri ancak güvenli başlangıç, açık rıza, koruma pencereleri ve çevrimdışı adalet tasarlandıktan sonra açılmalıdır.
