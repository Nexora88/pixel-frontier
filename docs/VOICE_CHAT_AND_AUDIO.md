# Yakın Sesli Sohbet — İlk Uygulama Aşaması

Bu PR, gerçek oyuncular arasında opt-in WebRTC bas-konuş için istemci ve sunucu sinyalleşme temelini ekler.

## Çalışan kod kapsamı
- Mikrofon varsayılan olarak kapalıdır; kullanıcı açıkça etkinleştirmeden `getUserMedia` çağrılmaz.
- Mikrofon izni alındıktan sonra ses kanalı yine kapalı başlar. Ses yalnızca ekrandaki bas-konuş düğmesi basılıyken veya V tuşu tutulurken gönderilir.
- Sunucu, iki oyuncunun da sesli sohbeti açmış olmasını ve aralarındaki mesafenin 360 dünya birimini aşmamasını doğrular.
- Sunucu her oyuncu için en fazla en yakın 6 ses eşini listeler; sinyalleşme yalnızca sunucunun izin verdiği eşlere iletilir.
- Oyuncu başına sessize alma ve yerel engelleme tarayıcıda saklanır.
- ICE adayları erken gelirse uzak açıklama kurulana kadar sırada bekletilir.
- Sinyal mesajları tür, boyut ve hız sınırlarından geçirilir. Ses veya mikrofon kaydı sunucuya gönderilmez.

## Üretim öncesi tamamlanması gerekenler
- Bu ilk sürüm Google STUN kullanır; TURN hizmeti ve kısa ömürlü kimlik bilgileri yapılandırılmamıştır. Bazı NAT/ağ koşullarında iki oyuncu arasında bağlantı kurulamaması mümkündür. Üretimde TURN zorunlu kabul edilmelidir.
- Altı eş sınırı ve 50–60 kişilik dünya hedefi gerçek cihazlarda ölçülmelidir. Kalabalık bir alanda mesh bağlantılarının CPU/ağ maliyeti test edilmeden kapasite garantisi verilmez.
- Tarayıcılar arası test, Android fiziksel cihaz testi, kulaklık/mikrofon yankı testi ve ağ değişimi testleri yapılmalıdır.
- Engelleme şu an yerel istemci davranışıdır; hesaplar arası kalıcı moderasyon/şikâyet altyapısı değildir.
- Oyuncuların sesli sohbeti açması ayrı ayrı gerekir. Varsayılan kapalıdır; oyuna giren kimse otomatik olarak mikrofona bağlanmaz.

## Test planı
1. İki ayrı tarayıcı profiliyle giriş yap.
2. İki oyuncuda da sesli sohbeti manuel etkinleştir ve mikrofon izni ver.
3. Yakın mesafede V tuşuyla konuş; tuş bırakılınca sesin kesildiğini doğrula.
4. Bir oyuncuyu sessize al ve engelle; sesin tekrar gelmediğini doğrula.
5. 360 dünya birimi dışına çık; eş bağlantısının kapandığını doğrula.
6. Mikrofon iznini reddet, bağlantıyı kes/yeniden bağlan ve mobil tarayıcıda dene.
7. 6'dan fazla yakın oyuncuyla eş sınırını, CPU ve ağ trafiğini ölç.

# Suno müzik entegrasyonu

Önceki PR'daki `WorldAudio` doğa seslerini ve kısa oyun efektlerini üretir; Suno müziği değildir. Bu depoda henüz lisans koşulları kontrol edilmiş Suno MP3 dosyası bulunmuyor. Müzik entegrasyonunu gerçek sayabilmek için kullanıcı tarafından Suno'dan üretilip indirilen dosyaların eklenmesi gerekir.

Önerilen dosyalar:
- `public/assets/audio/frontier-mystery.mp3` — ana keşif
- `public/assets/audio/whispers-beneath-pines.mp3` — gece ormanı
- `public/assets/audio/hearth-of-the-new-home.mp3` — yerleşim

Dosyalar eklenmeden müzik oynatma testi başarılı sayılmamalıdır. Suno planının üretim tarihindeki kullanım/ticari hakları ayrıca kontrol edilmelidir.

## Birleştirme kapısı

Bu modül temel entegrasyon aşamasıdır. `npm run check` ve `npm test` geçmeden birleştirilmemelidir. Gerçek oyuncularla iki ayrı cihazda ses iletimi, mikrofon izni reddi, yeniden bağlanma, engelleme ve mobil tarayıcı kontrolleri ayrıca yapılmalıdır. Üretim yayını öncesinde TURN yapılandırması ve kalabalık bölgede ağ/CPU ölçümü zorunludur.
