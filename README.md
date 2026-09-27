# Son Hat — Klavye & Mouse Antrenmanı

**Kelimeleri yaz, robotları durdur. Hedefleri yakala, mouse kontrolünü çalış.**

Son Hat, yazma hızı ve mouse kontrolü üzerine kısa antrenmanlar sunan, tarayıcıda çalışan bir oyun projesidir. Klavye bölümünde yaklaşan robotları üzerlerindeki Türkçe kelimeleri yazarak durdurur; mouse bölümünde isabet ve hareketli hedef takibi çalışırsın.

## Klavye: Kelime Savunması

Üç boyutlu görünüme sahip animasyonlu robotlar sana doğru ilerler. Bir robotun kelimesini doğru tamamladığında otomatik ateş edilir; Enter tuşuna basman gerekmez.

| Mod | Amaç |
| --- | --- |
| Hayatta kal | 3 canla 60 saniye boyunca hattı koru. Sana ulaşan her robot bir can götürür. |
| Hız turu | Sınırsız canla 60 saniyede olabildiğince çok kelime yaz. Kaçan robotlar turu bitirmez. |

Her iki modda da **Kolay, Orta ve Zor** seçenekleri bulunur.

Tur sonunda doğru kelime, hatalı deneme, kaçırılan kelime ve saniye başına yazılan kelime sayısını görebilirsin. Yazma hızı, tamamlanan kelime sayısının aktif oyun süresine bölünmesiyle hesaplanır. Bir denemedeki yanlış harfler tek hata sayılır.

## Mouse Antrenmanı

| Egzersiz | Nasıl oynanır? |
| --- | --- |
| Hedef avı | Farklı noktalarda beliren dairelere sol tıkla. İsabet ve hızlı hedef değiştirme çalış. |
| Akıcı takip | Tıklamadan, imlecini hareketli dairenin üzerinde tut. Kesintisiz takip çalış. |

**Kolay, Orta ve Zor** seviyeleriyle **30, 60 veya 90 saniyelik** turlar seçebilirsin.

Hedef avında isabetler, boşa tıklamalar, kaçırılan hedefler ve tepki süresi; akıcı takipte hedefin üzerinde kalma süresi ve oranı gösterilir. Antrenman, mevcut mouse hassasiyetinle çalışır; sisteminin DPI veya hassasiyet ayarlarını değiştirmez.

## Kontroller

- **Klavye:** Robotun üzerindeki kelimeyi yaz; hataları Backspace ile düzelt.
- **Mouse:** Hedef avında sol tıkla; akıcı takipte imleci hedefin üzerinde tut.
- **ESC:** Oyunu duraklat veya devam ettir.
- **Üst menü:** Klavye ve mouse bölümleri arasında geçiş yap.
- **Animasyon düğmesi:** Arayüz animasyonlarını aç veya kapat.
- **Ses düğmesi:** Klavye oyunundaki sesleri aç veya kapat.

Masaüstünde fiziksel klavye ve mouse ya da trackpad ile oynamak için tasarlanmıştır.

## Yerel olarak çalıştırma

Depoyu indir veya klonla, ardından `index.html` dosyasını tarayıcıda aç. Mouse bölümüne üst menüden ya da `mouse.html` dosyasından ulaşabilirsin.

Bu GitHub Pages sürümünde Node.js kurulumu, paket yükleme veya derleme adımı gerekmez.

## Kullanılan teknolojiler

- HTML ve CSS
- Saf JavaScript
- Canvas üzerinde perspektif çizimi ve animasyonlar
- GitHub Pages ile statik yayınlama

## Dosyalar

| Dosya | Görevi |
| --- | --- |
| `index.html` | Klavye oyununun arayüzü |
| `game.js` | Robotlar, oyun akışı ve klavye sonuçları |
| `mouse.html` | Mouse antrenmanının arayüzü |
| `mouse-engine.js` | Mouse egzersizlerinin mantığı ve ölçümleri |
| `mouse.js` | Mouse arayüzü ve kullanıcı etkileşimleri |
| `style.css`, `mouse.css` | Ortak tasarım ve mouse bölümünün stilleri |
| `motion.js`, `motion.css` | Arayüz animasyonları ve sayfa geçişleri |

## Geri bildirim

Bir hata fark edersen veya yeni bir egzersiz fikrin varsa [Issues bölümünden](https://github.com/ahmetsen532/Klavye-Mouse-Oyunu/issues) paylaşabilirsin. Hata bildirimine kullandığın tarayıcıyı, oyun modunu ve sorunun nasıl oluştuğunu eklemen yardımcı olur.
