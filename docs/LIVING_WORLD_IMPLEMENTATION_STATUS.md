# Yaşayan Dünya — Uygulama Sırası ve Durum

Bu yedi aşamanın tamamı henüz bitmiş değildir. Mevcut oyun sistemlerini koruyarak her aşama ayrı, test edilebilir pull request'lerle geliştirilecektir. Tasarım belgelerinde yer alması tek başına bir özelliğin oyunda tamamlandığı anlamına gelmez.

## Geliştirme sırası

1. **Envanter:** Envanter ekranı, ekipman yuvaları, tam eşya kataloğu ve tamir sistemi.
2. **Meslekler:** Altı meslek ve uzmanlık XP sistemi.
3. **Görevler:** Kalıcı görev zincirleri ve ödüller.
4. **Dünya:** Yeni biyomlar, köyler, madenler ve antik kalıntılar.
5. **Sanat:** Gerçek karakter sprite paketleri ve karakter/çevre animasyonları.
6. **Kabileler:** Çok kuruculu kabileler, roller ve sancaklar.
7. **Bölgesel mücadeleler:** Çevrimdışı korumalı, isteğe bağlı bölgesel mücadeleler.

## Mevcut uygulama durumu

- [x] İlk envanter aşamasının araç dayanıklılığı altyapısı gerçek oyun koduna bağlandı.
- [x] Başarılı kaynak toplama işlemi dayanıklılık tüketir.
- [x] Başarısız veya envanter dolu toplama işlemi dayanıklılık tüketmez.
- [x] Dayanıklılığı biten araç güvenli biçimde kuşanılmış durumdan çıkarılır.
- [x] Dayanıklılık kuralları için birim ve entegrasyon testleri eklendi.
- [ ] Envanter ekranında dayanıklılık göstergeleri.
- [ ] Ekipman yuvaları ve tam eşya kataloğu.
- [ ] Tamir/onarım akışı.
- [ ] Altı meslek, kalıcı görev zincirleri ve sonraki aşamalar.

## Kabul ilkeleri

- Sunucu, eşya sahipliği, dayanıklılık, XP, görev ilerlemesi ve ödüller için tek otorite olacaktır.
- Eski kayıtlar ve mevcut oyun akışları geriye dönük uyumlu tutulacaktır.
- Her aşama kendi testleri ve CI kontrolleriyle doğrulanacaktır.
- Tarayıcı ve mümkün olduğunda iki ayrı cihaz testi yapılmadan tam üretim hazır olduğu iddia edilmeyecektir.
- Oyuncu kabileye katılmaya zorlanmayacak; solo ilerleme korunacaktır.
- Bölgesel mücadeleler isteğe bağlı olacak ve çevrimdışı oyuncular için koruma kuralları içerecektir.
