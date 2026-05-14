(() => {
  const DEFAULT_KEY = "hakkimizda";
  const FOOTER_PATHNAME_TO_KEY = Object.freeze({
    "/hakkimizda.html": "hakkimizda",
    "/iletisim.html": "iletisim",
    "/sss.html": "sss",
    "/ingilizce-sozluk.html": "ingilizce-sozluk",
    "/kvkk.html": "kvkk",
    "/gizlilik-politikasi.html": "gizlilik",
    "/kullanim-kosullari.html": "kosullar",
    "/eski-turkce-yeni-turkce-sozluk.html": "eski-turkce-sozluk",
    "/cerez-politikasi.html": "cerez",
    "/yer-ekle.html": "yer-ekle",
    "/donusturme.html": "donusturme",
  });
  const FOOTER_PAGE_TEXT = Object.freeze({
    EN: {
      "İş ortaklığı": "Partnership",
      "Mobil uygulama": "Mobile app",
      "Destek": "Support",
      "Yardım": "Help",
      "Yasal": "Legal",
      "Sosyal": "Social",
      "Kısa not": "Quick note",
      "Yeni bir işletme veya hizmet noktası eklemek için aşağıdaki formu doldurup gönder tuşuna basınız.":
        "Fill in the form below and press submit to add a new business or service location.",
      "Bilgiler alındı. Adres alanlarını PTT kaynağıyla eşleştirdiysen inceleme daha hızlı ilerler.":
        "Details were received. If you matched the address fields with the PTT source, review will move faster.",
      "Aramabul, kullanıcının bir yeri ararken, en kısa yoldan ve net bilgi bulmasını amaçlayan sade tasarımlı bir yardımcıdır.":
        "Aramabul is a simple guide designed to help users find a place through the shortest path with clear information.",
      "İnsanlar çoğu zaman bir yerin adını değil, ihtiyacını bilir. Biz de aramayı ihtiyaçtan başlatıyoruz.":
        "People often know their need, not the name of the place. So we start the search from the need.",
      "Amaç, gereksiz kalabalığı ve çabayı azaltarak, ihtiyaç duyduğunuz hizmet ve ürüne daha hızlı ulaşmanızı sağlamak.":
        "The goal is to reduce clutter and effort so you can reach the service or product you need faster.",
      "Kategori, şehir ve ilçe katmanları sırasıyla, önce alt kategoriler, son olarak da hizmet mekanları seçenekleri ile sizi buluşturuyoruz.":
        "Category, city and district layers bring you first to subcategories and then to venue options.",
      "Bilgiyi kutu yapısında sunarak, kullanıcıyı uzun sayfalarda dolaştırmadan net karar alanına ulaştırıyoruz. İhtiyaç duyduğunuz hizmeti alacağınız mekanı, tüm ulaşım ve iletişim bilgileri ile, en kullanıcı dostu biçimde görmenizi sağlıyoruz.":
        "We present information in boxed sections so users reach a clear decision area without wandering through long pages. We help you view the place you need, with transport and contact details, in the most user-friendly way.",
      "Basit arayüz": "Simple interface",
      "Açık bilgi": "Clear information",
      "Hızlı ve ayrıntılı yönlendirme": "Fast and detailed guidance",
      "Soru, öneri ve iş talepleriniz için aşağıdaki formu doldurunuz.":
        "Fill in the form below for your questions, suggestions and business requests.",
      "Mesajın hazırlandı. İlgili ekibe en kısa sürede yönlendireceğiz.":
        "Your message is ready. We will route it to the relevant team as soon as possible.",
      "Mesajını konu ve kısa bağlamla gönderirsen doğru ekibe daha hızlı yönlendirebiliriz.":
        "If you send your message with a topic and short context, we can route it faster to the right team.",
      "En çok sorulan temel konuları kısa ve kolay anlaşılır cevaplarla bir araya getirdik.":
        "We gathered the most common core questions with short and clear answers.",
      "Nasıl arama yaparım?": "How do I search?",
      "Üst arama alanından doğrudan mekan adı yazabilir ya da anasayfadan kategori seçebilirsin.":
        "You can type a venue name directly in the top search field or choose a category from the home page.",
      "Kategori sayfalarında şehir ve ilçe adımı ile sonuçları daraltabilirsin.":
        "On category pages, you can narrow results with the city and district steps.",
      "Bilgi yanlışsa ne yapmalıyım?": "What should I do if the information is wrong?",
      "Bize sayfa bağlantısı ile birlikte doğru bilgiyi gönder.": "Send us the correct information together with the page link.",
      "İnceleme sonrası içerik güncellenir.": "The content is updated after review.",
      "Hesap şart mı?": "Is an account required?",
      "Temel gezinme için hesap gerekmez.": "An account is not needed for basic browsing.",
      "Favori, kayıt ve kişisel tercih akışları için hesap alanı sonraki adımlarda daha görünür hale gelecek.":
        "The account area will become more visible in later steps for favorites, saved items and personal preferences.",
      "Bu metin, kullanıcı verisine nasıl yaklaştığımızı sade dil ile anlatan ilk çerçevedir.":
        "This text is the first simple outline of how we approach user data.",
      "Hangi veriler olabilir?": "What data may be involved?",
      "Neden işlenir?": "Why is it processed?",
      "Kullanıcı hakları": "User rights",
      "Ad ve e-posta gibi temel hesap bilgileri": "Basic account details such as name and email",
      "Tercih ve dil ayarları": "Preference and language settings",
      "Hata ve kullanım kayıtları": "Error and usage records",
      "Hesabı çalıştırmak, tercihleri korumak ve hizmeti iyileştirmek için sınırlı veri kullanılır.":
        "Limited data is used to run the account, keep preferences and improve the service.",
      "İhtiyaç dışı veri toplamak ana yaklaşımımız değildir.": "Collecting unnecessary data is not our main approach.",
      "Bilgi isteme, düzeltme talep etme ve silme isteği gönderme hakkın vardır.":
        "You have the right to request information, ask for corrections and request deletion.",
      "Gizlilik yaklaşımımız, gereksiz veri toplamadan temel hizmeti açık biçimde sunmaktır.":
        "Our privacy approach is to provide the core service clearly without collecting unnecessary data.",
      "Topladığımız veriler": "Data we collect",
      "Toplamadığımız şeyler": "What we do not collect",
      "Paylaşım ilkesi": "Sharing policy",
      "Hesap alanı kullanılırsa temel profil bilgileri tutulabilir.": "If the account area is used, basic profile details may be stored.",
      "Yerel ayarlar ve dil tercihi gibi küçük bilgiler cihaz tarafında saklanabilir.":
        "Small details such as local settings and language preference may be stored on the device.",
      "Gereksiz kişisel profil verisi, ilgisiz belge veya kapsam dışı hassas bilgi istemeyiz.":
        "We do not ask for unnecessary personal profile data, irrelevant documents or unrelated sensitive information.",
      "Yasal zorunluluk olmadıkça kullanıcı verisini açık ve sınırsız biçimde üçüncü taraflara açmayız.":
        "Unless legally required, we do not openly and broadly share user data with third parties.",
      "Kullanım sınırları": "Usage limits",
      "Yanıltıcı bilgi göndermeme": "Do not send misleading information",
      "Sistemi bozacak yoğun kötü kullanım yapmama": "Do not abuse the system in a disruptive way",
      "Başkalarına ait içeriği izinsiz kopyalamama": "Do not copy other people's content without permission",
      "İçerik güncellemeleri": "Content updates",
      "Sayfadaki içerikler zaman içinde güncellenebilir, taşınabilir veya yeniden düzenlenebilir.":
        "The content on this page may be updated, moved or reorganized over time.",
      "Bu sayfa, sitemizde kullanılan çerezlerin ne işe yaradığını, ne kadar süre kaldığını ve tercihlerini nasıl yönetebileceğini sade dille açıklar.":
        "This page explains in simple language what the cookies on our site do, how long they stay and how you can manage your preferences.",
      "Çerez nedir?": "What is a cookie?",
      "Kullandığımız başlıca türler": "Main types we use",
      "Hangi amaçlarla kullanılır?": "What are they used for?",
      "Saklama süresi ve üçüncü taraflar": "Storage period and third parties",
      "Kontrol sende": "You are in control",
      "Çerezler, ziyaret sırasında tarayıcına bırakılan küçük veri dosyalarıdır.":
        "Cookies are small data files placed in your browser during a visit.",
      "Bazı ayarlar ise çerez yerine tarayıcının yerel kayıt alanında tutulabilir. Amaç, siteyi her seferinde baştan kurmadan daha düzenli çalıştırmaktır.":
        "Some settings may be stored in the browser's local storage instead of cookies. The aim is to keep the site running smoothly without setting everything up again each time.",
      "Zorunlu çerezler: oturum, güvenlik ve temel sayfa akışı için":
        "Required cookies: for session, security and the basic page flow",
      "Tercih çerezleri: dil, tema ve benzer seçimleri hatırlamak için":
        "Preference cookies: to remember language, theme and similar choices",
      "Ölçüm çerezleri: hangi alanların daha çok kullanıldığını anlamak için":
        "Measurement cookies: to understand which areas are used more",
      "Üçüncü taraf çerezleri: harici bir araç kullanılırsa o hizmetin teknik kaydı için":
        "Third-party cookies: for the technical records of an external service if one is used",
      "Dil tercihini hatırlamak": "Remember language preference",
      "Tema seçimini korumak": "Keep theme selection",
      "Oturum akışını yönetmek": "Manage the session flow",
      "Sayfa hatalarını ve performans sorunlarını görmek": "See page errors and performance issues",
      "Kötüye kullanımı sınırlamaya yardımcı olmak": "Help limit abuse",
      "Bazı çerezler sadece oturum açıkken kalır, bazıları ise belirli bir süre cihazında tutulur. Süre, çerezin amacına göre değişir.":
        "Some cookies remain only while the session is open, while others stay on your device for a set time. The period depends on the purpose of the cookie.",
      "Harici bir analiz, giriş veya medya aracı kullanılırsa ilgili hizmet kendi çerezini oluşturabilir. Bu durumda o hizmetin kendi politikası da devreye girer.":
        "If an external analytics, login or media tool is used, that service may create its own cookies. In that case, that service's own policy also applies.",
      "Tarayıcı ayarlarından çerezleri silebilir, engelleyebilir veya sadece belirli siteler için izin verebilirsin.":
        "You can delete, block or allow cookies only for certain sites from your browser settings.",
      "Çerezleri kapatman halinde bazı tercih alanları sıfırlanabilir ve bazı sayfa işlevleri beklenen gibi çalışmayabilir.":
        "If you disable cookies, some preference fields may reset and some page functions may not work as expected.",
      "Zorunlu olmayan yeni çerezler eklenirse bu metni ve varsa tercih ekranını aynı anda güncelleriz.":
        "If new non-essential cookies are added, we update this text and the preference screen at the same time, if available.",
      "Gönder": "Submit",
      "Ad Soyad": "Full name",
      "E-posta": "Email",
      "Konu": "Subject",
      "Genel Konular": "General Topics",
      "İş Birliği": "Partnership",
      "İçerik Düzeltmeleri": "Content Corrections",
      "Alan kodu": "Area code",
      "Telefon numarası": "Phone number",
      "Mesaj": "Message",
      "Telefon bilgisi": "Phone details",
      "İşletme adı": "Business name",
      "İl": "Province",
      "İlçe": "District",
      "Mahalle": "Neighborhood",
      "Sokak / Cadde / Bulvar": "Street / Avenue / Boulevard",
      "Bina no / Kapı no": "Building no / Door no",
      "Sokak / Cadde": "Street / Avenue",
      "Bina / Kapı no": "Building / Door no",
      "Posta kodu": "Postal code",
      "Web sitesi (varsa)": "Website (optional)",
      "Lütfen ad, e-posta, konu ve mesaj alanlarını doldur.": "Please fill in the name, email, subject and message fields.",
      "Lütfen konu seçimini tamamla.": "Please complete the subject selection.",
      "İl, ilçe ve mahalle için veri kaynağı tanımlanmadı.": "No data source is defined for province, district and neighborhood.",
      "İl, ilçe veya mahalle verisi yüklenemedi. Adresi PTT kaynağından kontrol ederek elle tamamlamalısın.":
        "Province, district or neighborhood data could not be loaded. You should check the address from the PTT source and complete it manually.",
      "Lütfen zorunlu alanları eksiksiz doldur, adres seçimlerini tamamla ve posta kodu otomatik gelmezse 5 hane olarak gir.":
        "Please fill in the required fields, complete the address selections and enter the postal code as 5 digits if it does not fill automatically.",
      "AramaBul ücretsiz mi?": "Is AramaBul free?",
      "Evet, tüm mekan arama ve bilgi görüntüleme özellikleri tamamen ücretsizdir.":
        "Yes, all venue search and information viewing features are completely free.",
      "Yeni mekan nasıl ekletebilirim?": "How can I add a new venue?",
      "Footer alanındaki 'Yer ekle' bağlantısından mekan ekleme formunu kullanabilirsin.":
        "You can use the venue submission form from the 'Add a place' link in the footer area.",
      "Mekan adı, adresi ve kategorisi gibi temel bilgileri paylaşman yeterlidir.":
        "Sharing basic details such as the venue name, address and category is sufficient.",
      "Hakkında": "About",
      "Neden var?": "Why does it exist?",
      "Nasıl çalışır?": "How does it work?",
      "Temel yaklaşımımız": "Our core approach",
      "Aramabul, kullanıcının ihtiyaç duyduğu kategorideki mekana, istediği ilçe ve mahalle bilgisi ile kısa yoldan ulaşmasını sağlar.":
        "Aramabul helps users quickly find places in their desired category by entering district and neighborhood information.",
      "Kategoriler, kullanıcı ihtiyacına göre; yeme-içme, gezi, hizmet, sağlık, kültür ve sanat başlıkları altında oluşturulmuştur. Mekân listeleri karar vermeyi hızlandıracak ihtiyaca göre filtrelenerek, sade ve kullanıcı dostu bir biçimde sunulur.":
        "Categories are organized under food & drink, travel, services, health, culture, and art. Place lists are filtered by need and presented in a simple, user-friendly way.",
      "Seçtiğiniz mekanın, adres, telefon, varsa web sitesi ve Instagram sayfası bilgileri, haritadaki yeri ve Google veri tabanındaki kullanıcıların değerlendirme puan ve adetleri ile son üç adet yorum gibi ayrıntılı bilgileri gösterilir.":
        "It shows detailed information such as address, phone, website and Instagram page (if available), map location, Google user ratings and the latest three reviews.",
      "Gizlilik Politikası": "Privacy Policy",
      "Son güncelleme: 8 Mayıs 2026\n\nAramaBul (\"biz\", \"platform\" veya \"site\") olarak kişisel verilerinizin korunmasına büyük önem veriyoruz. Bu gizlilik politikası, aramabul.com adresini ziyaret ettiğinizde hangi bilgilerin toplandığını, nasıl kullanıldığını ve haklarınızı açıklamaktadır.":
        "Last updated: May 8, 2026\n\nAt AramaBul (\"we\", \"platform\" or \"site\"), we take your personal data protection very seriously. This privacy policy explains what information is collected when you visit aramabul.com, how it is used, and your rights.",
      "1. Toplanan Bilgiler": "1. Information Collected",
      "Otomatik olarak toplanan bilgiler: Sitemizi ziyaret ettiğinizde IP adresiniz, tarayıcı türünüz, işletim sisteminiz, ziyaret ettiğiniz sayfalar, ziyaret saatleri ve süreleri gibi bilgiler otomatik olarak kaydedilir.":
        "Automatically collected information: When you visit our site, your IP address, browser type, operating system, pages visited, visit times and durations are automatically recorded.",
      "Hesap bilgileri: Hesap oluşturduğunuzda e-posta adresiniz, görünen adınız ve şifreniz (şifrelenmiş olarak) saklanır.":
        "Account information: When you create an account, your email address, display name and password (encrypted) are stored.",
      "Çerezler: Oturum yönetimi, tercih hatırlama ve analitik amaçlı çerezler kullanılmaktadır. Detaylar için Çerez Politikası sayfamızı inceleyiniz.":
        "Cookies: Cookies are used for session management, preference recall and analytics purposes. Please see our Cookie Policy page for details.",
      "2. Bilgilerin Kullanım Amaçları": "2. Purposes of Information Use",
      "Toplanan bilgiler aşağıdaki amaçlarla kullanılır:": "Collected information is used for the following purposes:",
      "Hizmetlerimizi sunmak ve iyileştirmek": "To provide and improve our services",
      "Kullanıcı deneyimini kişiselleştirmek": "To personalize the user experience",
      "Site güvenliğini sağlamak ve kötüye kullanımı önlemek": "To ensure site security and prevent abuse",
      "Yasal yükümlülüklerimizi yerine getirmek": "To fulfill our legal obligations",
      "İstatistiksel analizler ve performans ölçümleri yapmak": "To perform statistical analysis and performance measurements",
      "3. Üçüncü Taraf Hizmetleri": "3. Third-Party Services",
      "Sitemizde aşağıdaki üçüncü taraf hizmetleri kullanılmaktadır:": "The following third-party services are used on our site:",
      "Google AdSense: Reklam sunmak amacıyla çerezler kullanır. Google'ın gizlilik politikası için: policies.google.com/privacy":
        "Google AdSense: Uses cookies for ad serving. For Google's privacy policy: policies.google.com/privacy",
      "Google Maps Platform: Mekan bilgileri ve harita verileri için kullanılır.": "Google Maps Platform: Used for venue information and map data.",
      "Google Fonts: Yazı tipi sunumu için kullanılır.": "Google Fonts: Used for font delivery.",
      "3a. Mobil Uygulama": "3a. Mobile App",
      "AramaBul mobil uygulaması, yakınındaki mekanları gösterebilmek için cihazınızın konum bilgisine erişim izni isteyebilir. Konum bilginiz yalnızca yakındaki mekanları listeleme amacıyla kullanılır ve sunucularımızda saklanmaz.":
        "The AramaBul mobile app may request access to your device's location to show nearby venues. Your location is used only for listing nearby venues and is not stored on our servers.",
      "Mobil uygulama, web sitemizi bir WebView aracılığıyla görüntüler. Web sitemizdeki gizlilik uygulamalarının tümü mobil uygulama için de geçerlidir.":
        "The mobile app displays our website through a WebView. All privacy practices on our website also apply to the mobile app.",
      "4. Veri Paylaşımı": "4. Data Sharing",
      "Kişisel verileriniz, yasal zorunluluklar dışında üçüncü taraflarla satılmaz, kiralanmaz veya paylaşılmaz. Yalnızca hizmet sağlayıcılarımızla (sunucu, analitik) sınırlı ve gerekli ölçüde paylaşım yapılır.":
        "Your personal data is not sold, rented or shared with third parties except for legal obligations. Sharing is limited and necessary only with our service providers (server, analytics).",
      "5. Veri Güvenliği": "5. Data Security",
      "Verilerinizi korumak için endüstri standardı güvenlik önlemleri (SSL şifreleme, şifre hashleme, güvenlik duvarları) uygulanmaktadır. Ancak internet üzerinden hiçbir veri iletimi %100 güvenli değildir.":
        "Industry-standard security measures (SSL encryption, password hashing, firewalls) are applied to protect your data. However, no data transmission over the internet is 100% secure.",
      "6. Haklarınız": "6. Your Rights",
      "6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında aşağıdaki haklara sahipsiniz:":
        "Under the Personal Data Protection Law (KVKK) No. 6698, you have the following rights:",
      "Kişisel verilerinizin işlenip işlenmediğini öğrenme": "To learn whether your personal data is being processed",
      "Verilerinizin düzeltilmesini veya silinmesini talep etme": "To request correction or deletion of your data",
      "Verilerinizin hangi amaçla kullanıldığını öğrenme": "To learn for what purpose your data is used",
      "Verilerinizin üçüncü kişilere aktarılıp aktarılmadığını öğrenme": "To learn whether your data is transferred to third parties",
      "7. Politika Değişiklikleri": "7. Policy Changes",
      "Bu gizlilik politikası zaman zaman güncellenebilir. Değişiklikler bu sayfada yayımlanır. Siteyi kullanmaya devam etmeniz, güncellenmiş politikayı kabul ettiğiniz anlamına gelir.":
        "This privacy policy may be updated from time to time. Changes are published on this page. Continuing to use the site means you accept the updated policy.",
      "8. İletişim": "8. Contact",
      "Gizlilik politikamızla ilgili sorularınız için: info@aramabul.com": "For questions about our privacy policy: info@aramabul.com",
      "Bu haklarınızı kullanmak için İletişim sayfamızdan bize ulaşabilirsiniz.": "You can contact us via our Contact page to exercise these rights.",
      "Çerez Politikası": "Cookie Policy",
      "Bu çerez politikası, aramabul.com web sitesinde (\"Platform\") kullanılan çerezler hakkında bilgi vermektedir.":
        "This cookie policy provides information about the cookies used on the aramabul.com website (\"Platform\").",
      "1. Çerez Nedir?": "1. What is a Cookie?",
      "Çerezler, web siteleri tarafından tarayıcınıza yerleştirilen küçük metin dosyalarıdır. Çerezler, siteyi tekrar ziyaret ettiğinizde sizi tanımak, tercihlerinizi hatırlamak ve size daha iyi bir deneyim sunmak için kullanılır.":
        "Cookies are small text files placed in your browser by websites. They are used to recognize you when you revisit the site, remember your preferences and provide a better experience.",
      "2. Kullanılan Çerez Türleri": "2. Cookie Types Used",
      "Zorunlu çerezler: Platformun düzgün çalışması için gereklidir. Oturum yönetimi ve güvenlik doğrulaması gibi temel işlevleri sağlar. Bu çerezler devre dışı bırakılamaz.":
        "Required cookies: Necessary for the platform to function properly. They provide basic functions such as session management and security verification. These cookies cannot be disabled.",
      "Tercih çerezleri: Dil tercihi, tema seçimi ve favori mekanlar gibi kullanıcı tercihlerini hatırlamak için kullanılır.":
        "Preference cookies: Used to remember user preferences such as language, theme selection and favorite venues.",
      "Analitik çerezler: Ziyaretçi istatistiklerini toplamak, sayfa performansını ölçmek ve kullanıcı deneyimini iyileştirmek amacıyla kullanılır.":
        "Analytics cookies: Used to collect visitor statistics, measure page performance and improve user experience.",
      "Reklam çerezleri: Google AdSense tarafından kullanıcıya uygun reklamlar göstermek amacıyla kullanılır. Bu çerezler üçüncü taraf çerezleridir.":
        "Advertising cookies: Used by Google AdSense to show relevant ads to users. These are third-party cookies.",
      "3. Üçüncü Taraf Çerezleri": "3. Third-Party Cookies",
      "Google AdSense: Reklam kişiselleştirme ve ölçüm amacıyla çerez kullanır.":
        "Google AdSense: Uses cookies for ad personalization and measurement.",
      "Google Fonts: Yazı tipi sunumu sırasında teknik çerezler kullanılabilir.":
        "Google Fonts: Technical cookies may be used during font delivery.",
      "Kişiselleştirilmiş reklam tercihlerinizi yönetmek için Google Reklam Ayarları sayfasını ziyaret edebilirsiniz.":
        "You can visit the Google Ad Settings page to manage your personalized ad preferences.",
      "4. Çerezleri Yönetme": "4. Managing Cookies",
      "Tarayıcı ayarlarınızdan çerezleri yönetebilir veya silebilirsiniz. Ancak çerezleri devre dışı bırakmanız, platformun bazı özelliklerinin düzgün çalışmamasına neden olabilir.":
        "You can manage or delete cookies from your browser settings. However, disabling cookies may cause some features of the platform to not work properly.",
      "Chrome: Ayarlar → Gizlilik ve Güvenlik → Çerezler": "Chrome: Settings → Privacy and Security → Cookies",
      "Firefox: Ayarlar → Gizlilik ve Güvenlik → Çerezler": "Firefox: Settings → Privacy and Security → Cookies",
      "Safari: Tercihler → Gizlilik → Çerezleri Yönet": "Safari: Preferences → Privacy → Manage Cookies",
      "Edge: Ayarlar → Gizlilik → Çerezler": "Edge: Settings → Privacy → Cookies",
      "5. Değişiklikler": "5. Changes",
      "Bu çerez politikası zaman zaman güncellenebilir. Güncellemeler bu sayfada yayımlanır.":
        "This cookie policy may be updated from time to time. Updates are published on this page.",
      "6. İletişim": "6. Contact",
      "Çerez politikamızla ilgili sorularınız için: info@aramabul.com": "For questions about our cookie policy: info@aramabul.com"
    },
    RU: {
      "İş ortaklığı": "Партнерство",
      "Destek": "Поддержка",
      "Yardım": "Помощь",
      "Yasal": "Правовая информация",
      "Sosyal": "Соцсети",
      "Kısa not": "Короткая заметка",
      "Yeni bir işletme veya hizmet noktası eklemek için aşağıdaki formu doldurup gönder tuşuna basınız.":
        "Заполните форму ниже и нажмите отправить, чтобы добавить новый бизнес или точку услуги.",
      "Aramabul, kullanıcının bir yeri ararken, en kısa yoldan ve net bilgi bulmasını amaçlayan sade tasarımlı bir yardımcıdır.":
        "Aramabul — это простой помощник, который помогает быстро находить место и получать понятную информацию.",
      "İnsanlar çoğu zaman bir yerin adını değil, ihtiyacını bilir. Biz de aramayı ihtiyaçtan başlatıyoruz.":
        "Люди чаще знают свою потребность, а не название места. Поэтому мы начинаем поиск с потребности.",
      "Amaç, gereksiz kalabalığı ve çabayı azaltarak, ihtiyaç duyduğunuz hizmet ve ürüne daha hızlı ulaşmanızı sağlamak.":
        "Наша цель — уменьшить лишнюю нагрузку и помочь быстрее добраться до нужной услуги или товара.",
      "Kategori, şehir ve ilçe katmanları sırasıyla, önce alt kategoriler, son olarak da hizmet mekanları seçenekleri ile sizi buluşturuyoruz.":
        "Слои категории, города и района последовательно приводят вас сначала к подкатегориям, а затем к вариантам мест.",
      "Bilgiyi kutu yapısında sunarak, kullanıcıyı uzun sayfalarda dolaştırmadan net karar alanına ulaştırıyoruz. İhtiyaç duyduğunuz hizmeti alacağınız mekanı, tüm ulaşım ve iletişim bilgileri ile, en kullanıcı dostu biçimde görmenizi sağlıyoruz.":
        "Мы показываем информацию в карточках, чтобы пользователь быстро дошел до решения без долгого просмотра страниц. Так вы видите нужное место со всей транспортной и контактной информацией в удобной форме.",
      "Basit arayüz": "Простой интерфейс",
      "Açık bilgi": "Понятная информация",
      "Hızlı ve ayrıntılı yönlendirme": "Быстрое и подробное направление",
      "Soru, öneri ve iş talepleriniz için aşağıdaki formu doldurunuz.":
        "Заполните форму ниже для вопросов, предложений и деловых запросов.",
      "En çok sorulan temel konuları kısa ve kolay anlaşılır cevaplarla bir araya getirdik.":
        "Мы собрали самые частые основные вопросы с короткими и понятными ответами.",
      "Nasıl arama yaparım?": "Как выполнить поиск?",
      "Üst arama alanından doğrudan mekan adı yazabilir ya da anasayfadan kategori seçebilirsin.":
        "Вы можете сразу ввести название места в верхней строке поиска или выбрать категорию на главной странице.",
      "Kategori sayfalarında şehir ve ilçe adımı ile sonuçları daraltabilirsin.":
        "На страницах категорий можно сузить результаты, выбрав город и район.",
      "Bilgi yanlışsa ne yapmalıyım?": "Что делать, если информация неверная?",
      "Bize sayfa bağlantısı ile birlikte doğru bilgiyi gönder.":
        "Отправьте нам правильную информацию вместе со ссылкой на страницу.",
      "İnceleme sonrası içerik güncellenir.": "После проверки содержимое обновляется.",
      "Hesap şart mı?": "Нужен ли аккаунт?",
      "Temel gezinme için hesap gerekmez.": "Для обычного просмотра аккаунт не нужен.",
      "Favori, kayıt ve kişisel tercih akışları için hesap alanı sonraki adımlarda daha görünür hale gelecek.":
        "Раздел аккаунта станет заметнее на следующих этапах для избранного, сохраненных элементов и личных настроек.",
      "Bu metin, kullanıcı verisine nasıl yaklaştığımızı sade dil ile anlatan ilk çerçevedir.":
        "Этот текст — простое первое объяснение того, как мы подходим к данным пользователя.",
      "Hangi veriler olabilir?": "Какие данные могут быть?",
      "Ad ve e-posta gibi temel hesap bilgileri": "Базовые данные аккаунта, такие как имя и электронная почта",
      "Tercih ve dil ayarları": "Настройки предпочтений и языка",
      "Hata ve kullanım kayıtları": "Записи об ошибках и использовании",
      "Neden işlenir?": "Зачем обрабатываются данные?",
      "Hesabı çalıştırmak, tercihleri korumak ve hizmeti iyileştirmek için sınırlı veri kullanılır.":
        "Ограниченный объем данных используется для работы аккаунта, сохранения предпочтений и улучшения сервиса.",
      "İhtiyaç dışı veri toplamak ana yaklaşımımız değildir.":
        "Сбор лишних данных не является нашим основным подходом.",
      "Kullanıcı hakları": "Права пользователя",
      "Bilgi isteme, düzeltme talep etme ve silme isteği gönderme hakkın vardır.":
        "Вы имеете право запрашивать информацию, просить исправления и отправлять запрос на удаление.",
      "Gizlilik yaklaşımımız, gereksiz veri toplamadan temel hizmeti açık biçimde sunmaktır.":
        "Наш подход к конфиденциальности — предоставлять основной сервис понятно, не собирая лишние данные.",
      "Topladığımız veriler": "Какие данные мы собираем",
      "Hesap alanı kullanılırsa temel profil bilgileri tutulabilir.":
        "При использовании раздела аккаунта могут храниться базовые данные профиля.",
      "Yerel ayarlar ve dil tercihi gibi küçük bilgiler cihaz tarafında saklanabilir.":
        "Небольшие данные, такие как локальные настройки и выбор языка, могут храниться на устройстве.",
      "Toplamadığımız şeyler": "Что мы не собираем",
      "Gereksiz kişisel profil verisi, ilgisiz belge veya kapsam dışı hassas bilgi istemeyiz.":
        "Мы не запрашиваем лишние персональные данные профиля, несвязанные документы или чувствительную информацию вне области сервиса.",
      "Paylaşım ilkesi": "Принцип передачи данных",
      "Yasal zorunluluk olmadıkça kullanıcı verisini açık ve sınırsız biçimde üçüncü taraflara açmayız.":
        "Если этого не требует закон, мы не передаем пользовательские данные третьим лицам открыто и без ограничений.",
      "Kullanım sınırları": "Ограничения использования",
      "Yanıltıcı bilgi göndermeme": "Не отправлять вводящую в заблуждение информацию",
      "Sistemi bozacak yoğun kötü kullanım yapmama": "Не злоупотреблять сервисом так, чтобы нарушать его работу",
      "Başkalarına ait içeriği izinsiz kopyalamama": "Не копировать чужой контент без разрешения",
      "İçerik güncellemeleri": "Обновления контента",
      "Sayfadaki içerikler zaman içinde güncellenebilir, taşınabilir veya yeniden düzenlenebilir.":
        "Содержимое страницы со временем может обновляться, переноситься или перестраиваться.",
      "Bu sayfa, sitemizde kullanılan çerezlerin ne işe yaradığını, ne kadar süre kaldığını ve tercihlerini nasıl yönetebileceğini sade dille açıklar.":
        "На этой странице простым языком объясняется, для чего нужны cookie на нашем сайте, как долго они хранятся и как вы можете управлять своими настройками.",
      "Çerez nedir?": "Что такое cookie?",
      "Çerezler, ziyaret sırasında tarayıcına bırakılan küçük veri dosyalarıdır.":
        "Cookie — это небольшие файлы данных, которые сохраняются в вашем браузере во время посещения сайта.",
      "Bazı ayarlar ise çerez yerine tarayıcının yerel kayıt alanında tutulabilir. Amaç, siteyi her seferinde baştan kurmadan daha düzenli çalıştırmaktır.":
        "Некоторые настройки могут храниться не в cookie, а в локальном хранилище браузера. Это нужно, чтобы сайт работал стабильнее без повторной настройки при каждом визите.",
      "Kullandığımız başlıca türler": "Основные типы, которые мы используем",
      "Zorunlu çerezler: oturum, güvenlik ve temel sayfa akışı için":
        "Обязательные cookie: для сессии, безопасности и базовой работы страниц",
      "Tercih çerezleri: dil, tema ve benzer seçimleri hatırlamak için":
        "Cookie предпочтений: чтобы запоминать язык, тему и похожие выборы",
      "Ölçüm çerezleri: hangi alanların daha çok kullanıldığını anlamak için":
        "Измерительные cookie: чтобы понимать, какие разделы используются чаще",
      "Üçüncü taraf çerezleri: harici bir araç kullanılırsa o hizmetin teknik kaydı için":
        "Cookie третьих сторон: для технической работы внешнего сервиса, если он используется",
      "Hangi amaçlarla kullanılır?": "Для чего они используются?",
      "Dil tercihini hatırlamak": "Запомнить выбор языка",
      "Tema seçimini korumak": "Сохранить выбор темы",
      "Oturum akışını yönetmek": "Управлять ходом сессии",
      "Sayfa hatalarını ve performans sorunlarını görmek": "Видеть ошибки страниц и проблемы с производительностью",
      "Kötüye kullanımı sınırlamaya yardımcı olmak": "Помогать ограничивать злоупотребления",
      "Saklama süresi ve üçüncü taraflar": "Срок хранения и третьи стороны",
      "Bazı çerezler sadece oturum açıkken kalır, bazıları ise belirli bir süre cihazında tutulur. Süre, çerezin amacına göre değişir.":
        "Некоторые cookie хранятся только во время открытой сессии, а другие остаются на устройстве определенное время. Срок зависит от назначения cookie.",
      "Harici bir analiz, giriş veya medya aracı kullanılırsa ilgili hizmet kendi çerezini oluşturabilir. Bu durumda o hizmetin kendi politikası da devreye girer.":
        "Если используется внешний сервис аналитики, входа или медиа, он может создавать свои cookie. В этом случае также действует политика самого сервиса.",
      "Kontrol sende": "Контроль у вас",
      "Tarayıcı ayarlarından çerezleri silebilir, engelleyebilir veya sadece belirli siteler için izin verebilirsin.":
        "В настройках браузера вы можете удалить cookie, заблокировать их или разрешить только для определенных сайтов.",
      "Çerezleri kapatman halinde bazı tercih alanları sıfırlanabilir ve bazı sayfa işlevleri beklenen gibi çalışmayabilir.":
        "Если отключить cookie, часть настроек может сброситься, а некоторые функции сайта могут работать не так, как ожидается.",
      "Zorunlu olmayan yeni çerezler eklenirse bu metni ve varsa tercih ekranını aynı anda güncelleriz.":
        "Если будут добавлены новые необязательные cookie, мы одновременно обновим этот текст и, если есть, экран настроек.",
      "Gönder": "Отправить",
      "Ad Soyad": "Имя и фамилия",
      "E-posta": "Эл. почта",
      "Konu": "Тема",
      "Genel Konular": "Общие вопросы",
      "İş Birliği": "Сотрудничество",
      "İçerik Düzeltmeleri": "Исправление контента",
      "Alan kodu": "Код",
      "Telefon numarası": "Номер телефона",
      "Mesaj": "Сообщение",
      "Telefon bilgisi": "Телефон",
      "İşletme adı": "Название бизнеса",
      "İl": "Область",
      "İlçe": "Район",
      "Mahalle": "Квартал",
      "Posta kodu": "Почтовый индекс",
      "AramaBul ücretsiz mi?": "AramaBul бесплатный?",
      "Evet, tüm mekan arama ve bilgi görüntüleme özellikleri tamamen ücretsizdir.":
        "Да, все функции поиска мест и просмотра информации полностью бесплатны.",
      "Yeni mekan nasıl ekletebilirim?": "Как добавить новое место?",
      "Footer alanındaki 'Yer ekle' bağlantısından mekan ekleme formunu kullanabilirsin.":
        "Можно воспользоваться формой по ссылке 'Добавить место' внизу страницы.",
      "Mekan adı, adresi ve kategorisi gibi temel bilgileri paylaşman yeterlidir.":
        "Достаточно указать название, адрес и категорию места.",
      "Hakkında": "О нас",
      "Neden var?": "Зачем мы нужны?",
      "Nasıl çalışır?": "Как это работает?",
      "Temel yaklaşımımız": "Наш основной подход",
      "Aramabul, kullanıcının ihtiyaç duyduğu kategorideki mekana, istediği ilçe ve mahalle bilgisi ile kısa yoldan ulaşmasını sağlar.":
        "Aramabul помогает быстро найти нужное место, указав район и махалле.",
      "Kategoriler, kullanıcı ihtiyacına göre; yeme-içme, gezi, hizmet, sağlık, kültür ve sanat başlıkları altında oluşturulmuştur. Mekân listeleri karar vermeyi hızlandıracak ihtiyaca göre filtrelenerek, sade ve kullanıcı dostu bir biçimde sunulur.":
        "Категории: еда и напитки, путешествия, услуги, здоровье, культура и искусство. Списки мест фильтруются по потребностям и представлены в удобном виде.",
      "Seçtiğiniz mekanın, adres, telefon, varsa web sitesi ve Instagram sayfası bilgileri, haritadaki yeri ve Google veri tabanındaki kullanıcıların değerlendirme puan ve adetleri ile son üç adet yorum gibi ayrıntılı bilgileri gösterilir.":
        "Показывает подробную информацию: адрес, телефон, сайт, страницу Instagram (при наличии), расположение на карте, рейтинг Google и последние три отзыва.",
      "Gizlilik Politikası": "Политика конфиденциальности",
      "Son güncelleme: 8 Mayıs 2026\n\nAramaBul (\"biz\", \"platform\" veya \"site\") olarak kişisel verilerinizin korunmasına büyük önem veriyoruz. Bu gizlilik politikası, aramabul.com adresini ziyaret ettiğinizde hangi bilgilerin toplandığını, nasıl kullanıldığını ve haklarınızı açıklamaktadır.":
        "Последнее обновление: 8 мая 2026\n\nМы в AramaBul серьёзно относимся к защите ваших персональных данных. Эта политика объясняет, какие данные собираются при посещении aramabul.com, как они используются и какие у вас есть права.",
      "1. Toplanan Bilgiler": "1. Собираемые данные",
      "Otomatik olarak toplanan bilgiler: Sitemizi ziyaret ettiğinizde IP adresiniz, tarayıcı türünüz, işletim sisteminiz, ziyaret ettiğiniz sayfalar, ziyaret saatleri ve süreleri gibi bilgiler otomatik olarak kaydedilir.":
        "Автоматически собираемые данные: при посещении сайта автоматически записываются IP-адрес, тип браузера, ОС, посещённые страницы, время и длительность визитов.",
      "Hesap bilgileri: Hesap oluşturduğunuzda e-posta adresiniz, görünen adınız ve şifreniz (şifrelenmiş olarak) saklanır.":
        "Данные аккаунта: при создании аккаунта сохраняются email, отображаемое имя и пароль (в зашифрованном виде).",
      "Çerezler: Oturum yönetimi, tercih hatırlama ve analitik amaçlı çerezler kullanılmaktadır. Detaylar için Çerez Politikası sayfamızı inceleyiniz.":
        "Cookie: используются для управления сессиями, сохранения предпочтений и аналитики. Подробнее — на странице Политики Cookie.",
      "2. Bilgilerin Kullanım Amaçları": "2. Цели использования данных",
      "Toplanan bilgiler aşağıdaki amaçlarla kullanılır:": "Собранные данные используются в следующих целях:",
      "Hizmetlerimizi sunmak ve iyileştirmek": "Предоставлять и улучшать наши услуги",
      "Kullanıcı deneyimini kişiselleştirmek": "Персонализировать пользовательский опыт",
      "Site güvenliğini sağlamak ve kötüye kullanımı önlemek": "Обеспечивать безопасность сайта и предотвращать злоупотребления",
      "Yasal yükümlülüklerimizi yerine getirmek": "Выполнять наши юридические обязательства",
      "İstatistiksel analizler ve performans ölçümleri yapmak": "Проводить статистический анализ и измерение производительности",
      "3. Üçüncü Taraf Hizmetleri": "3. Сторонние сервисы",
      "Sitemizde aşağıdaki üçüncü taraf hizmetleri kullanılmaktadır:": "На нашем сайте используются следующие сторонние сервисы:",
      "Google AdSense: Reklam sunmak amacıyla çerezler kullanır. Google'ın gizlilik politikası için: policies.google.com/privacy":
        "Google AdSense: использует cookie для показа рекламы. Политика конфиденциальности Google: policies.google.com/privacy",
      "Google Maps Platform: Mekan bilgileri ve harita verileri için kullanılır.": "Google Maps Platform: используется для данных о местах и картах.",
      "Google Fonts: Yazı tipi sunumu için kullanılır.": "Google Fonts: используется для загрузки шрифтов.",
      "3a. Mobil Uygulama": "3a. Мобильное приложение",
      "AramaBul mobil uygulaması, yakınındaki mekanları gösterebilmek için cihazınızın konum bilgisine erişim izni isteyebilir. Konum bilginiz yalnızca yakındaki mekanları listeleme amacıyla kullanılır ve sunucularımızda saklanmaz.":
        "Мобильное приложение AramaBul может запрашивать доступ к местоположению для показа ближайших мест. Данные о местоположении используются только для этой цели и не хранятся на наших серверах.",
      "Mobil uygulama, web sitemizi bir WebView aracılığıyla görüntüler. Web sitemizdeki gizlilik uygulamalarının tümü mobil uygulama için de geçerlidir.":
        "Мобильное приложение отображает наш сайт через WebView. Все правила конфиденциальности сайта распространяются и на приложение.",
      "4. Veri Paylaşımı": "4. Передача данных",
      "Kişisel verileriniz, yasal zorunluluklar dışında üçüncü taraflarla satılmaz, kiralanmaz veya paylaşılmaz. Yalnızca hizmet sağlayıcılarımızla (sunucu, analitik) sınırlı ve gerekli ölçüde paylaşım yapılır.":
        "Ваши данные не продаются, не сдаются в аренду и не передаются третьим лицам, кроме случаев, предусмотренных законом.",
      "5. Veri Güvenliği": "5. Безопасность данных",
      "Verilerinizi korumak için endüstri standardı güvenlik önlemleri (SSL şifreleme, şifre hashleme, güvenlik duvarları) uygulanmaktadır. Ancak internet üzerinden hiçbir veri iletimi %100 güvenli değildir.":
        "Для защиты данных применяются стандартные меры безопасности (SSL, хеширование паролей, файрволы). Однако ни одна передача данных через интернет не является на 100% безопасной.",
      "6. Haklarınız": "6. Ваши права",
      "6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında aşağıdaki haklara sahipsiniz:":
        "В соответствии с Законом о защите персональных данных (KVKK) № 6698 вы имеете следующие права:",
      "Kişisel verilerinizin işlenip işlenmediğini öğrenme": "Узнать, обрабатываются ли ваши данные",
      "Verilerinizin düzeltilmesini veya silinmesini talep etme": "Запросить исправление или удаление данных",
      "Verilerinizin hangi amaçla kullanıldığını öğrenme": "Узнать, для каких целей используются ваши данные",
      "Verilerinizin üçüncü kişilere aktarılıp aktarılmadığını öğrenme": "Узнать, передаются ли ваши данные третьим лицам",
      "7. Politika Değişiklikleri": "7. Изменения политики",
      "Bu gizlilik politikası zaman zaman güncellenebilir. Değişiklikler bu sayfada yayımlanır. Siteyi kullanmaya devam etmeniz, güncellenmiş politikayı kabul ettiğiniz anlamına gelir.":
        "Эта политика может обновляться. Изменения публикуются на этой странице. Продолжая пользоваться сайтом, вы принимаете обновлённую политику.",
      "8. İletişim": "8. Контакты",
      "Gizlilik politikamızla ilgili sorularınız için: info@aramabul.com": "По вопросам конфиденциальности: info@aramabul.com",
      "Bu haklarınızı kullanmak için İletişim sayfamızdan bize ulaşabilirsiniz.": "Для реализации ваших прав свяжитесь с нами через страницу Контакты.",
      "Çerez Politikası": "Политика Cookie",
      "Bu çerez politikası, aramabul.com web sitesinde (\"Platform\") kullanılan çerezler hakkında bilgi vermektedir.":
        "Эта политика Cookie содержит информацию о файлах cookie, используемых на сайте aramabul.com.",
      "1. Çerez Nedir?": "1. Что такое Cookie?",
      "Çerezler, web siteleri tarafından tarayıcınıza yerleştirilen küçük metin dosyalarıdır. Çerezler, siteyi tekrar ziyaret ettiğinizde sizi tanımak, tercihlerinizi hatırlamak ve size daha iyi bir deneyim sunmak için kullanılır.":
        "Cookie — это небольшие текстовые файлы, размещаемые в вашем браузере. Они используются для распознавания вас при повторном визите, запоминания предпочтений и улучшения опыта.",
      "2. Kullanılan Çerez Türleri": "2. Типы используемых Cookie",
      "Zorunlu çerezler: Platformun düzgün çalışması için gereklidir. Oturum yönetimi ve güvenlik doğrulaması gibi temel işlevleri sağlar. Bu çerezler devre dışı bırakılamaz.":
        "Обязательные cookie: необходимы для корректной работы платформы. Обеспечивают управление сессиями и проверку безопасности. Эти cookie нельзя отключить.",
      "Tercih çerezleri: Dil tercihi, tema seçimi ve favori mekanlar gibi kullanıcı tercihlerini hatırlamak için kullanılır.":
        "Cookie предпочтений: используются для запоминания языка, темы и избранных мест.",
      "Analitik çerezler: Ziyaretçi istatistiklerini toplamak, sayfa performansını ölçmek ve kullanıcı deneyimini iyileştirmek amacıyla kullanılır.":
        "Аналитические cookie: используются для сбора статистики, измерения производительности и улучшения опыта.",
      "Reklam çerezleri: Google AdSense tarafından kullanıcıya uygun reklamlar göstermek amacıyla kullanılır. Bu çerezler üçüncü taraf çerezleridir.":
        "Рекламные cookie: используются Google AdSense для показа релевантной рекламы. Это сторонние cookie.",
      "3. Üçüncü Taraf Çerezleri": "3. Сторонние Cookie",
      "Google AdSense: Reklam kişiselleştirme ve ölçüm amacıyla çerez kullanır.":
        "Google AdSense: использует cookie для персонализации и измерения рекламы.",
      "Google Fonts: Yazı tipi sunumu sırasında teknik çerezler kullanılabilir.":
        "Google Fonts: при загрузке шрифтов могут использоваться технические cookie.",
      "Kişiselleştirilmiş reklam tercihlerinizi yönetmek için Google Reklam Ayarları sayfasını ziyaret edebilirsiniz.":
        "Для управления персонализированной рекламой посетите страницу настроек рекламы Google.",
      "4. Çerezleri Yönetme": "4. Управление Cookie",
      "Tarayıcı ayarlarınızdan çerezleri yönetebilir veya silebilirsiniz. Ancak çerezleri devre dışı bırakmanız, platformun bazı özelliklerinin düzgün çalışmamasına neden olabilir.":
        "Вы можете управлять cookie или удалять их в настройках браузера. Однако отключение cookie может повлиять на работу некоторых функций.",
      "Chrome: Ayarlar → Gizlilik ve Güvenlik → Çerezler": "Chrome: Настройки → Конфиденциальность → Cookie",
      "Firefox: Ayarlar → Gizlilik ve Güvenlik → Çerezler": "Firefox: Настройки → Конфиденциальность → Cookie",
      "Safari: Tercihler → Gizlilik → Çerezleri Yönet": "Safari: Настройки → Конфиденциальность → Управление Cookie",
      "Edge: Ayarlar → Gizlilik → Çerezler": "Edge: Настройки → Конфиденциальность → Cookie",
      "5. Değişiklikler": "5. Изменения",
      "Bu çerez politikası zaman zaman güncellenebilir. Güncellemeler bu sayfada yayımlanır.":
        "Эта политика Cookie может обновляться. Обновления публикуются на этой странице.",
      "6. İletişim": "6. Контакты",
      "Çerez politikamızla ilgili sorularınız için: info@aramabul.com": "По вопросам политики Cookie: info@aramabul.com"
    },
    DE: {
      "İş ortaklığı": "Partnerschaft",
      "Destek": "Support",
      "Yardım": "Hilfe",
      "Yasal": "Rechtliches",
      "Sosyal": "Sozial",
      "Kısa not": "Kurze Notiz",
      "Yeni bir işletme veya hizmet noktası eklemek için aşağıdaki formu doldurup gönder tuşuna basınız.":
        "Füllen Sie das Formular unten aus und klicken Sie auf Senden, um ein neues Unternehmen oder einen Servicepunkt hinzuzufügen.",
      "Aramabul, kullanıcının bir yeri ararken, en kısa yoldan ve net bilgi bulmasını amaçlayan sade tasarımlı bir yardımcıdır.":
        "Aramabul ist ein schlicht gestalteter Helfer, der Nutzern dabei hilft, einen Ort auf dem kürzesten Weg mit klaren Informationen zu finden.",
      "İnsanlar çoğu zaman bir yerin adını değil, ihtiyacını bilir. Biz de aramayı ihtiyaçtan başlatıyoruz.":
        "Menschen kennen oft nicht den Namen eines Ortes, sondern ihr Bedürfnis. Deshalb starten wir die Suche beim Bedarf.",
      "Amaç, gereksiz kalabalığı ve çabayı azaltarak, ihtiyaç duyduğunuz hizmet ve ürüne daha hızlı ulaşmanızı sağlamak.":
        "Das Ziel ist, unnötige Komplexität und Aufwand zu reduzieren, damit Sie schneller den gewünschten Service oder das gewünschte Produkt erreichen.",
      "Kategori, şehir ve ilçe katmanları sırasıyla, önce alt kategoriler, son olarak da hizmet mekanları seçenekleri ile sizi buluşturuyoruz.":
        "Die Ebenen Kategorie, Stadt und Bezirk führen Sie zuerst zu Unterkategorien und dann zu passenden Orten.",
      "Bilgiyi kutu yapısında sunarak, kullanıcıyı uzun sayfalarda dolaştırmadan net karar alanına ulaştırıyoruz. İhtiyaç duyduğunuz hizmeti alacağınız mekanı, tüm ulaşım ve iletişim bilgileri ile, en kullanıcı dostu biçimde görmenizi sağlıyoruz.":
        "Wir zeigen Informationen in klaren Boxen, damit Nutzer ohne lange Seiten direkt zu einer klaren Entscheidung gelangen. So sehen Sie den passenden Ort mit allen Kontakt- und Anfahrtsinfos in benutzerfreundlicher Form.",
      "Basit arayüz": "Einfache Oberfläche",
      "Açık bilgi": "Klare Informationen",
      "Hızlı ve ayrıntılı yönlendirme": "Schnelle und detaillierte Orientierung",
      "Soru, öneri ve iş talepleriniz için aşağıdaki formu doldurunuz.":
        "Füllen Sie das Formular unten für Fragen, Vorschläge und geschäftliche Anfragen aus.",
      "En çok sorulan temel konuları kısa ve kolay anlaşılır cevaplarla bir araya getirdik.":
        "Wir haben die häufigsten Grundfragen mit kurzen und leicht verständlichen Antworten gesammelt.",
      "Nasıl arama yaparım?": "Wie suche ich?",
      "Üst arama alanından doğrudan mekan adı yazabilir ya da anasayfadan kategori seçebilirsin.":
        "Sie können direkt oben nach einem Ort suchen oder auf der Startseite eine Kategorie auswählen.",
      "Kategori sayfalarında şehir ve ilçe adımı ile sonuçları daraltabilirsin.":
        "Auf Kategorieseiten können Sie die Ergebnisse über Stadt und Bezirk eingrenzen.",
      "Bilgi yanlışsa ne yapmalıyım?": "Was soll ich tun, wenn die Information falsch ist?",
      "Bize sayfa bağlantısı ile birlikte doğru bilgiyi gönder.":
        "Senden Sie uns die korrekte Information zusammen mit dem Seitenlink.",
      "İnceleme sonrası içerik güncellenir.": "Nach der Prüfung wird der Inhalt aktualisiert.",
      "Hesap şart mı?": "Ist ein Konto erforderlich?",
      "Temel gezinme için hesap gerekmez.": "Für die grundlegende Nutzung ist kein Konto nötig.",
      "Favori, kayıt ve kişisel tercih akışları için hesap alanı sonraki adımlarda daha görünür hale gelecek.":
        "Der Kontobereich wird in den nächsten Schritten für Favoriten, gespeicherte Elemente und persönliche Einstellungen sichtbarer.",
      "Bu metin, kullanıcı verisine nasıl yaklaştığımızı sade dil ile anlatan ilk çerçevedir.":
        "Dieser Text ist der erste einfache Rahmen dafür, wie wir mit Nutzerdaten umgehen.",
      "Hangi veriler olabilir?": "Welche Daten können anfallen?",
      "Ad ve e-posta gibi temel hesap bilgileri": "Grundlegende Kontodaten wie Name und E-Mail",
      "Tercih ve dil ayarları": "Präferenz- und Spracheinstellungen",
      "Hata ve kullanım kayıtları": "Fehler- und Nutzungsprotokolle",
      "Neden işlenir?": "Warum wird sie verarbeitet?",
      "Hesabı çalıştırmak, tercihleri korumak ve hizmeti iyileştirmek için sınırlı veri kullanılır.":
        "Es werden nur begrenzte Daten verwendet, um das Konto zu betreiben, Einstellungen zu erhalten und den Dienst zu verbessern.",
      "İhtiyaç dışı veri toplamak ana yaklaşımımız değildir.":
        "Das Sammeln unnötiger Daten ist nicht unser Hauptansatz.",
      "Kullanıcı hakları": "Rechte der Nutzer",
      "Bilgi isteme, düzeltme talep etme ve silme isteği gönderme hakkın vardır.":
        "Sie haben das Recht, Auskunft zu verlangen, Korrekturen anzufordern und eine Löschung zu verlangen.",
      "Gizlilik yaklaşımımız, gereksiz veri toplamadan temel hizmeti açık biçimde sunmaktır.":
        "Unser Datenschutzansatz ist, den Kerndienst klar bereitzustellen, ohne unnötige Daten zu sammeln.",
      "Topladığımız veriler": "Welche Daten wir erfassen",
      "Hesap alanı kullanılırsa temel profil bilgileri tutulabilir.":
        "Wenn der Kontobereich genutzt wird, können grundlegende Profildaten gespeichert werden.",
      "Yerel ayarlar ve dil tercihi gibi küçük bilgiler cihaz tarafında saklanabilir.":
        "Kleine Angaben wie lokale Einstellungen und die Sprachwahl können auf dem Gerät gespeichert werden.",
      "Toplamadığımız şeyler": "Was wir nicht erfassen",
      "Gereksiz kişisel profil verisi, ilgisiz belge veya kapsam dışı hassas bilgi istemeyiz.":
        "Wir verlangen keine unnötigen persönlichen Profildaten, keine irrelevanten Dokumente und keine sensiblen Informationen außerhalb des nötigen Rahmens.",
      "Paylaşım ilkesi": "Grundsatz der Weitergabe",
      "Yasal zorunluluk olmadıkça kullanıcı verisini açık ve sınırsız biçimde üçüncü taraflara açmayız.":
        "Sofern keine gesetzliche Pflicht besteht, geben wir Nutzerdaten nicht offen und unbegrenzt an Dritte weiter.",
      "Kullanım sınırları": "Nutzungsgrenzen",
      "Yanıltıcı bilgi göndermeme": "Keine irreführenden Informationen senden",
      "Sistemi bozacak yoğun kötü kullanım yapmama": "Den Dienst nicht durch intensiven Missbrauch stören",
      "Başkalarına ait içeriği izinsiz kopyalamama": "Keine Inhalte anderer ohne Erlaubnis kopieren",
      "İçerik güncellemeleri": "Inhaltsaktualisierungen",
      "Sayfadaki içerikler zaman içinde güncellenebilir, taşınabilir veya yeniden düzenlenebilir.":
        "Die Inhalte auf dieser Seite können im Laufe der Zeit aktualisiert, verschoben oder neu geordnet werden.",
      "Bu sayfa, sitemizde kullanılan çerezlerin ne işe yaradığını, ne kadar süre kaldığını ve tercihlerini nasıl yönetebileceğini sade dille açıklar.":
        "Diese Seite erklärt in einfacher Sprache, wofür die Cookies auf unserer Website genutzt werden, wie lange sie bleiben und wie Sie Ihre Einstellungen verwalten können.",
      "Çerez nedir?": "Was ist ein Cookie?",
      "Çerezler, ziyaret sırasında tarayıcına bırakılan küçük veri dosyalarıdır.":
        "Cookies sind kleine Datendateien, die während eines Besuchs in Ihrem Browser gespeichert werden.",
      "Bazı ayarlar ise çerez yerine tarayıcının yerel kayıt alanında tutulabilir. Amaç, siteyi her seferinde baştan kurmadan daha düzenli çalıştırmaktır.":
        "Einige Einstellungen können statt in Cookies im lokalen Speicher des Browsers abgelegt werden. Ziel ist es, die Website stabiler zu betreiben, ohne alles bei jedem Besuch neu einzurichten.",
      "Kullandığımız başlıca türler": "Die wichtigsten Arten, die wir nutzen",
      "Zorunlu çerezler: oturum, güvenlik ve temel sayfa akışı için":
        "Erforderliche Cookies: für Sitzung, Sicherheit und den grundlegenden Seitenablauf",
      "Tercih çerezleri: dil, tema ve benzer seçimleri hatırlamak için":
        "Präferenz-Cookies: um Sprache, Design und ähnliche Auswahl zu merken",
      "Ölçüm çerezleri: hangi alanların daha çok kullanıldığını anlamak için":
        "Mess-Cookies: um zu verstehen, welche Bereiche häufiger genutzt werden",
      "Üçüncü taraf çerezleri: harici bir araç kullanılırsa o hizmetin teknik kaydı için":
        "Cookies von Drittanbietern: für die technische Funktion eines externen Dienstes, falls ein solcher genutzt wird",
      "Hangi amaçlarla kullanılır?": "Wofür werden sie verwendet?",
      "Dil tercihini hatırlamak": "Die Sprachwahl merken",
      "Tema seçimini korumak": "Die Designwahl beibehalten",
      "Oturum akışını yönetmek": "Den Sitzungsablauf steuern",
      "Sayfa hatalarını ve performans sorunlarını görmek": "Seitenfehler und Leistungsprobleme erkennen",
      "Kötüye kullanımı sınırlamaya yardımcı olmak": "Dabei helfen, Missbrauch zu begrenzen",
      "Saklama süresi ve üçüncü taraflar": "Speicherdauer und Dritte",
      "Bazı çerezler sadece oturum açıkken kalır, bazıları ise belirli bir süre cihazında tutulur. Süre, çerezin amacına göre değişir.":
        "Einige Cookies bleiben nur während der offenen Sitzung bestehen, andere werden für einen bestimmten Zeitraum auf dem Gerät gespeichert. Die Dauer hängt vom Zweck des Cookies ab.",
      "Harici bir analiz, giriş veya medya aracı kullanılırsa ilgili hizmet kendi çerezini oluşturabilir. Bu durumda o hizmetin kendi politikası da devreye girer.":
        "Wenn ein externer Analyse-, Login- oder Mediendienst genutzt wird, kann dieser eigene Cookies setzen. Dann gilt zusätzlich die Richtlinie dieses Dienstes.",
      "Kontrol sende": "Sie behalten die Kontrolle",
      "Tarayıcı ayarlarından çerezleri silebilir, engelleyebilir veya sadece belirli siteler için izin verebilirsin.":
        "In den Browsereinstellungen können Sie Cookies löschen, blockieren oder nur für bestimmte Websites erlauben.",
      "Çerezleri kapatman halinde bazı tercih alanları sıfırlanabilir ve bazı sayfa işlevleri beklenen gibi çalışmayabilir.":
        "Wenn Sie Cookies deaktivieren, können einige Einstellungen zurückgesetzt werden und manche Seitenfunktionen arbeiten möglicherweise nicht wie erwartet.",
      "Zorunlu olmayan yeni çerezler eklenirse bu metni ve varsa tercih ekranını aynı anda güncelleriz.":
        "Wenn neue nicht notwendige Cookies hinzukommen, aktualisieren wir diesen Text und, falls vorhanden, gleichzeitig auch den Einstellungsbildschirm.",
      "Gönder": "Senden",
      "Ad Soyad": "Vollständiger Name",
      "E-posta": "E-Mail",
      "Konu": "Betreff",
      "Genel Konular": "Allgemeine Themen",
      "İş Birliği": "Zusammenarbeit",
      "İçerik Düzeltmeleri": "Inhaltskorrekturen",
      "Alan kodu": "Vorwahl",
      "Telefon numarası": "Telefonnummer",
      "Mesaj": "Nachricht",
      "Telefon bilgisi": "Telefonangaben",
      "İşletme adı": "Name des Unternehmens",
      "İl": "Provinz",
      "İlçe": "Bezirk",
      "Mahalle": "Viertel",
      "Posta kodu": "Postleitzahl",
      "AramaBul ücretsiz mi?": "Ist AramaBul kostenlos?",
      "Evet, tüm mekan arama ve bilgi görüntüleme özellikleri tamamen ücretsizdir.":
        "Ja, alle Funktionen zur Ortssuche und Informationsanzeige sind vollständig kostenlos.",
      "Yeni mekan nasıl ekletebilirim?": "Wie kann ich einen neuen Ort hinzufügen?",
      "Footer alanındaki 'Yer ekle' bağlantısından mekan ekleme formunu kullanabilirsin.":
        "Du kannst das Formular über den Link 'Ort hinzufügen' im Fußbereich nutzen.",
      "Mekan adı, adresi ve kategorisi gibi temel bilgileri paylaşman yeterlidir.":
        "Es reicht, grundlegende Angaben wie Name, Adresse und Kategorie des Ortes zu teilen.",
      "Hakkında": "Über uns",
      "Neden var?": "Warum gibt es uns?",
      "Nasıl çalışır?": "Wie funktioniert es?",
      "Temel yaklaşımımız": "Unser Kernansatz",
      "Aramabul, kullanıcının ihtiyaç duyduğu kategorideki mekana, istediği ilçe ve mahalle bilgisi ile kısa yoldan ulaşmasını sağlar.":
        "Aramabul hilft dir, Orte in der gewünschten Kategorie schnell zu finden, indem du Bezirk und Stadtviertel eingibst.",
      "Kategoriler, kullanıcı ihtiyacına göre; yeme-içme, gezi, hizmet, sağlık, kültür ve sanat başlıkları altında oluşturulmuştur. Mekân listeleri karar vermeyi hızlandıracak ihtiyaca göre filtrelenerek, sade ve kullanıcı dostu bir biçimde sunulur.":
        "Die Kategorien sind in Essen & Trinken, Reise, Dienstleistungen, Gesundheit, Kultur und Kunst unterteilt. Ortslisten werden nach Bedarf gefiltert und übersichtlich dargestellt.",
      "Seçtiğiniz mekanın, adres, telefon, varsa web sitesi ve Instagram sayfası bilgileri, haritadaki yeri ve Google veri tabanındaki kullanıcıların değerlendirme puan ve adetleri ile son üç adet yorum gibi ayrıntılı bilgileri gösterilir.":
        "Es zeigt detaillierte Informationen wie Adresse, Telefon, Website und Instagram-Seite (falls vorhanden), Kartenstandort, Google-Bewertungen und die letzten drei Rezensionen.",
      "Gizlilik Politikası": "Datenschutzrichtlinie",
      "Son güncelleme: 8 Mayıs 2026\n\nAramaBul (\"biz\", \"platform\" veya \"site\") olarak kişisel verilerinizin korunmasına büyük önem veriyoruz. Bu gizlilik politikası, aramabul.com adresini ziyaret ettiğinizde hangi bilgilerin toplandığını, nasıl kullanıldığını ve haklarınızı açıklamaktadır.":
        "Letzte Aktualisierung: 8. Mai 2026\n\nBei AramaBul nehmen wir den Schutz Ihrer persönlichen Daten sehr ernst. Diese Datenschutzrichtlinie erklärt, welche Daten beim Besuch von aramabul.com erhoben werden, wie sie verwendet werden und welche Rechte Sie haben.",
      "1. Toplanan Bilgiler": "1. Erhobene Daten",
      "Otomatik olarak toplanan bilgiler: Sitemizi ziyaret ettiğinizde IP adresiniz, tarayıcı türünüz, işletim sisteminiz, ziyaret ettiğiniz sayfalar, ziyaret saatleri ve süreleri gibi bilgiler otomatik olarak kaydedilir.":
        "Automatisch erhobene Daten: Beim Besuch unserer Website werden IP-Adresse, Browsertyp, Betriebssystem, besuchte Seiten, Besuchszeiten und -dauer automatisch erfasst.",
      "Hesap bilgileri: Hesap oluşturduğunuzda e-posta adresiniz, görünen adınız ve şifreniz (şifrelenmiş olarak) saklanır.":
        "Kontodaten: Bei der Kontoerstellung werden E-Mail, Anzeigename und Passwort (verschlüsselt) gespeichert.",
      "Çerezler: Oturum yönetimi, tercih hatırlama ve analitik amaçlı çerezler kullanılmaktadır. Detaylar için Çerez Politikası sayfamızı inceleyiniz.":
        "Cookies: Cookies werden für Sitzungsverwaltung, Einstellungen und Analysen verwendet. Details finden Sie auf unserer Cookie-Richtlinienseite.",
      "2. Bilgilerin Kullanım Amaçları": "2. Zwecke der Datenverwendung",
      "Toplanan bilgiler aşağıdaki amaçlarla kullanılır:": "Die erhobenen Daten werden für folgende Zwecke verwendet:",
      "Hizmetlerimizi sunmak ve iyileştirmek": "Unsere Dienste bereitstellen und verbessern",
      "Kullanıcı deneyimini kişiselleştirmek": "Das Nutzererlebnis personalisieren",
      "Site güvenliğini sağlamak ve kötüye kullanımı önlemek": "Die Sicherheit der Website gewährleisten und Missbrauch verhindern",
      "Yasal yükümlülüklerimizi yerine getirmek": "Unsere gesetzlichen Pflichten erfüllen",
      "İstatistiksel analizler ve performans ölçümleri yapmak": "Statistische Analysen und Leistungsmessungen durchführen",
      "3. Üçüncü Taraf Hizmetleri": "3. Drittanbieter-Dienste",
      "Sitemizde aşağıdaki üçüncü taraf hizmetleri kullanılmaktadır:": "Auf unserer Website werden folgende Drittanbieter-Dienste genutzt:",
      "Google AdSense: Reklam sunmak amacıyla çerezler kullanır. Google'ın gizlilik politikası için: policies.google.com/privacy":
        "Google AdSense: Verwendet Cookies zur Anzeigenschaltung. Googles Datenschutzrichtlinie: policies.google.com/privacy",
      "Google Maps Platform: Mekan bilgileri ve harita verileri için kullanılır.": "Google Maps Platform: Wird für Ortsinformationen und Kartendaten verwendet.",
      "Google Fonts: Yazı tipi sunumu için kullanılır.": "Google Fonts: Wird für die Schriftbereitstellung verwendet.",
      "3a. Mobil Uygulama": "3a. Mobile App",
      "AramaBul mobil uygulaması, yakınındaki mekanları gösterebilmek için cihazınızın konum bilgisine erişim izni isteyebilir. Konum bilginiz yalnızca yakındaki mekanları listeleme amacıyla kullanılır ve sunucularımızda saklanmaz.":
        "Die AramaBul-App kann auf Ihren Standort zugreifen, um nahe Orte anzuzeigen. Ihr Standort wird nur dafür verwendet und nicht auf unseren Servern gespeichert.",
      "Mobil uygulama, web sitemizi bir WebView aracılığıyla görüntüler. Web sitemizdeki gizlilik uygulamalarının tümü mobil uygulama için de geçerlidir.":
        "Die mobile App zeigt unsere Website über eine WebView an. Alle Datenschutzpraktiken der Website gelten auch für die App.",
      "4. Veri Paylaşımı": "4. Datenweitergabe",
      "Kişisel verileriniz, yasal zorunluluklar dışında üçüncü taraflarla satılmaz, kiralanmaz veya paylaşılmaz. Yalnızca hizmet sağlayıcılarımızla (sunucu, analitik) sınırlı ve gerekli ölçüde paylaşım yapılır.":
        "Ihre Daten werden nicht verkauft, vermietet oder an Dritte weitergegeben, es sei denn, es besteht eine gesetzliche Pflicht.",
      "5. Veri Güvenliği": "5. Datensicherheit",
      "Verilerinizi korumak için endüstri standardı güvenlik önlemleri (SSL şifreleme, şifre hashleme, güvenlik duvarları) uygulanmaktadır. Ancak internet üzerinden hiçbir veri iletimi %100 güvenli değildir.":
        "Zum Schutz Ihrer Daten werden branchenübliche Sicherheitsmaßnahmen (SSL, Passwort-Hashing, Firewalls) eingesetzt. Keine Datenübertragung im Internet ist jedoch zu 100% sicher.",
      "6. Haklarınız": "6. Ihre Rechte",
      "6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında aşağıdaki haklara sahipsiniz:":
        "Gemäß dem Datenschutzgesetz (KVKK) Nr. 6698 haben Sie folgende Rechte:",
      "Kişisel verilerinizin işlenip işlenmediğini öğrenme": "Zu erfahren, ob Ihre Daten verarbeitet werden",
      "Verilerinizin düzeltilmesini veya silinmesini talep etme": "Berichtigung oder Löschung Ihrer Daten verlangen",
      "Verilerinizin hangi amaçla kullanıldığını öğrenme": "Zu erfahren, zu welchem Zweck Ihre Daten verwendet werden",
      "Verilerinizin üçüncü kişilere aktarılıp aktarılmadığını öğrenme": "Zu erfahren, ob Ihre Daten an Dritte weitergegeben werden",
      "7. Politika Değişiklikleri": "7. Richtlinienänderungen",
      "Bu gizlilik politikası zaman zaman güncellenebilir. Değişiklikler bu sayfada yayımlanır. Siteyi kullanmaya devam etmeniz, güncellenmiş politikayı kabul ettiğiniz anlamına gelir.":
        "Diese Richtlinie kann aktualisiert werden. Änderungen werden auf dieser Seite veröffentlicht.",
      "8. İletişim": "8. Kontakt",
      "Gizlilik politikamızla ilgili sorularınız için: info@aramabul.com": "Bei Fragen zum Datenschutz: info@aramabul.com",
      "Bu haklarınızı kullanmak için İletişim sayfamızdan bize ulaşabilirsiniz.": "Kontaktieren Sie uns über unsere Kontaktseite, um Ihre Rechte auszuüben.",
      "Çerez Politikası": "Cookie-Richtlinie",
      "Bu çerez politikası, aramabul.com web sitesinde (\"Platform\") kullanılan çerezler hakkında bilgi vermektedir.":
        "Diese Cookie-Richtlinie informiert über die auf aramabul.com verwendeten Cookies.",
      "1. Çerez Nedir?": "1. Was ist ein Cookie?",
      "Çerezler, web siteleri tarafından tarayıcınıza yerleştirilen küçük metin dosyalarıdır. Çerezler, siteyi tekrar ziyaret ettiğinizde sizi tanımak, tercihlerinizi hatırlamak ve size daha iyi bir deneyim sunmak için kullanılır.":
        "Cookies sind kleine Textdateien, die von Websites in Ihrem Browser gespeichert werden. Sie dienen dazu, Sie wiederzuerkennen, Einstellungen zu merken und ein besseres Erlebnis zu bieten.",
      "2. Kullanılan Çerez Türleri": "2. Verwendete Cookie-Typen",
      "Zorunlu çerezler: Platformun düzgün çalışması için gereklidir. Oturum yönetimi ve güvenlik doğrulaması gibi temel işlevleri sağlar. Bu çerezler devre dışı bırakılamaz.":
        "Erforderliche Cookies: Notwendig für die ordnungsgemäße Funktion der Plattform. Sie ermöglichen Sitzungsverwaltung und Sicherheitsprüfung und können nicht deaktiviert werden.",
      "Tercih çerezleri: Dil tercihi, tema seçimi ve favori mekanlar gibi kullanıcı tercihlerini hatırlamak için kullanılır.":
        "Präferenz-Cookies: Zum Speichern von Sprache, Design und Lieblingsorten.",
      "Analitik çerezler: Ziyaretçi istatistiklerini toplamak, sayfa performansını ölçmek ve kullanıcı deneyimini iyileştirmek amacıyla kullanılır.":
        "Analyse-Cookies: Zum Sammeln von Besucherstatistiken, Leistungsmessung und Verbesserung des Nutzererlebnisses.",
      "Reklam çerezleri: Google AdSense tarafından kullanıcıya uygun reklamlar göstermek amacıyla kullanılır. Bu çerezler üçüncü taraf çerezleridir.":
        "Werbe-Cookies: Von Google AdSense zur Anzeige relevanter Werbung verwendet. Dies sind Drittanbieter-Cookies.",
      "3. Üçüncü Taraf Çerezleri": "3. Drittanbieter-Cookies",
      "Google AdSense: Reklam kişiselleştirme ve ölçüm amacıyla çerez kullanır.":
        "Google AdSense: Verwendet Cookies zur Personalisierung und Messung von Werbung.",
      "Google Fonts: Yazı tipi sunumu sırasında teknik çerezler kullanılabilir.":
        "Google Fonts: Bei der Schriftbereitstellung können technische Cookies verwendet werden.",
      "Kişiselleştirilmiş reklam tercihlerinizi yönetmek için Google Reklam Ayarları sayfasını ziyaret edebilirsiniz.":
        "Besuchen Sie die Google-Anzeigeneinstellungen, um Ihre personalisierten Werbeeinstellungen zu verwalten.",
      "4. Çerezleri Yönetme": "4. Cookies verwalten",
      "Tarayıcı ayarlarınızdan çerezleri yönetebilir veya silebilirsiniz. Ancak çerezleri devre dışı bırakmanız, platformun bazı özelliklerinin düzgün çalışmamasına neden olabilir.":
        "Sie können Cookies in Ihren Browsereinstellungen verwalten oder löschen. Das Deaktivieren kann jedoch einige Funktionen beeinträchtigen.",
      "Chrome: Ayarlar → Gizlilik ve Güvenlik → Çerezler": "Chrome: Einstellungen → Datenschutz → Cookies",
      "Firefox: Ayarlar → Gizlilik ve Güvenlik → Çerezler": "Firefox: Einstellungen → Datenschutz → Cookies",
      "Safari: Tercihler → Gizlilik → Çerezleri Yönet": "Safari: Einstellungen → Datenschutz → Cookies verwalten",
      "Edge: Ayarlar → Gizlilik → Çerezler": "Edge: Einstellungen → Datenschutz → Cookies",
      "5. Değişiklikler": "5. Änderungen",
      "Bu çerez politikası zaman zaman güncellenebilir. Güncellemeler bu sayfada yayımlanır.":
        "Diese Cookie-Richtlinie kann aktualisiert werden. Aktualisierungen werden auf dieser Seite veröffentlicht.",
      "6. İletişim": "6. Kontakt",
      "Çerez politikamızla ilgili sorularınız için: info@aramabul.com": "Bei Fragen zur Cookie-Richtlinie: info@aramabul.com"
    },
    ZH: {
      "İş ortaklığı": "合作伙伴",
      "Mobil uygulama": "移动应用",
      "Destek": "支持",
      "Yardım": "帮助",
      "Yasal": "法律",
      "Sosyal": "社交",
      "Kısa not": "简短说明",
      "Yeni bir işletme veya hizmet noktası eklemek için aşağıdaki formu doldurup gönder tuşuna basınız.":
        "如需新增商家或服务点，请填写下方表单并点击提交。",
      "Bilgiler alındı. Adres alanlarını PTT kaynağıyla eşleştirdiysen inceleme daha hızlı ilerler.":
        "信息已收到。如已按 PTT 地址源匹配地址字段，审核会更快。",
      "Aramabul, kullanıcının bir yeri ararken, en kısa yoldan ve net bilgi bulmasını amaçlayan sade tasarımlı bir yardımcıdır.":
        "Aramabul 是一个简洁工具，帮助用户用最短路径找到地点并获得清晰信息。",
      "İnsanlar çoğu zaman bir yerin adını değil, ihtiyacını bilir. Biz de aramayı ihtiyaçtan başlatıyoruz.":
        "很多人先知道需求，而不是地点名称。我们从需求开始搜索。",
      "Amaç, gereksiz kalabalığı ve çabayı azaltarak, ihtiyaç duyduğunuz hizmet ve ürüne daha hızlı ulaşmanızı sağlamak.":
        "我们的目标是减少不必要的复杂与操作，让你更快到达所需服务或产品。",
      "Kategori, şehir ve ilçe katmanları sırasıyla, önce alt kategoriler, son olarak da hizmet mekanları seçenekleri ile sizi buluşturuyoruz.":
        "通过分类、城市和区县分层，先到子分类，再到具体服务地点。",
      "Bilgiyi kutu yapısında sunarak, kullanıcıyı uzun sayfalarda dolaştırmadan net karar alanına ulaştırıyoruz. İhtiyaç duyduğunuz hizmeti alacağınız mekanı, tüm ulaşım ve iletişim bilgileri ile, en kullanıcı dostu biçimde görmenizi sağlıyoruz.":
        "我们用卡片方式展示信息，避免在长页面中来回查找，帮助你更快做决定。你可清晰看到目标地点及其交通与联系方式。",
      "Basit arayüz": "简洁界面",
      "Açık bilgi": "清晰信息",
      "Hızlı ve ayrıntılı yönlendirme": "快速且详细的指引",
      "Soru, öneri ve iş talepleriniz için aşağıdaki formu doldurunuz.":
        "如有问题、建议或商务需求，请填写下方表单。",
      "Mesajın hazırlandı. İlgili ekibe en kısa sürede yönlendireceğiz.":
        "消息已准备好，我们会尽快转给相关团队。",
      "Mesajını konu ve kısa bağlamla gönderirsen doğru ekibe daha hızlı yönlendirebiliriz.":
        "如果你附上主题和简短背景，我们可以更快转到正确团队。",
      "En çok sorulan temel konuları kısa ve kolay anlaşılır cevaplarla bir araya getirdik.":
        "我们将最常见问题整理为简短易懂的回答。",
      "Nasıl arama yaparım?": "如何搜索？",
      "Üst arama alanından doğrudan mekan adı yazabilir ya da anasayfadan kategori seçebilirsin.":
        "你可以在顶部搜索框直接输入地点名称，或在首页选择分类。",
      "Kategori sayfalarında şehir ve ilçe adımı ile sonuçları daraltabilirsin.":
        "在分类页可通过城市和区县步骤缩小结果范围。",
      "Bilgi yanlışsa ne yapmalıyım?": "如果信息有误怎么办？",
      "Bize sayfa bağlantısı ile birlikte doğru bilgiyi gönder.": "请把正确信息连同页面链接发给我们。",
      "İnceleme sonrası içerik güncellenir.": "审核后会更新内容。",
      "Hesap şart mı?": "必须要账户吗？",
      "Temel gezinme için hesap gerekmez.": "基础浏览不需要账户。",
      "Favori, kayıt ve kişisel tercih akışları için hesap alanı sonraki adımlarda daha görünür hale gelecek.":
        "后续版本中，账户区域会更突出，用于收藏、保存和个性偏好。",
      "Bu metin, kullanıcı verisine nasıl yaklaştığımızı sade dil ile anlatan ilk çerçevedir.":
        "这段文字是我们如何处理用户数据的第一版简明说明。",
      "Hangi veriler olabilir?": "可能涉及哪些数据？",
      "Neden işlenir?": "为何处理这些数据？",
      "Kullanıcı hakları": "用户权利",
      "Ad ve e-posta gibi temel hesap bilgileri": "姓名、邮箱等基础账户信息",
      "Tercih ve dil ayarları": "偏好和语言设置",
      "Hata ve kullanım kayıtları": "错误与使用记录",
      "Hesabı çalıştırmak, tercihleri korumak ve hizmeti iyileştirmek için sınırlı veri kullanılır.":
        "我们仅使用有限数据来运行账户、保留偏好并改进服务。",
      "İhtiyaç dışı veri toplamak ana yaklaşımımız değildir.": "收集非必要数据不是我们的原则。",
      "Bilgi isteme, düzeltme talep etme ve silme isteği gönderme hakkın vardır.":
        "你有权申请查询、更正和删除数据。",
      "Gizlilik yaklaşımımız, gereksiz veri toplamadan temel hizmeti açık biçimde sunmaktır.":
        "我们的隐私原则是在不收集不必要数据的前提下清晰提供核心服务。",
      "Topladığımız veriler": "我们收集的数据",
      "Toplamadığımız şeyler": "我们不收集的内容",
      "Paylaşım ilkesi": "共享原则",
      "Hesap alanı kullanılırsa temel profil bilgileri tutulabilir.": "若使用账户区，可能会保存基础资料信息。",
      "Yerel ayarlar ve dil tercihi gibi küçük bilgiler cihaz tarafında saklanabilir.":
        "如本地设置和语言偏好等小型信息可能保存在设备端。",
      "Gereksiz kişisel profil verisi, ilgisiz belge veya kapsam dışı hassas bilgi istemeyiz.":
        "我们不会索取不必要的个人资料、无关文件或范围外敏感信息。",
      "Yasal zorunluluk olmadıkça kullanıcı verisini açık ve sınırsız biçimde üçüncü taraflara açmayız.":
        "除法律要求外，我们不会公开、无限制地向第三方共享用户数据。",
      "Kullanım sınırları": "使用边界",
      "Yanıltıcı bilgi göndermeme": "不得提交误导信息",
      "Sistemi bozacak yoğun kötü kullanım yapmama": "不得以滥用方式影响系统稳定",
      "Başkalarına ait içeriği izinsiz kopyalamama": "未经许可不得复制他人内容",
      "İçerik güncellemeleri": "内容更新",
      "Sayfadaki içerikler zaman içinde güncellenebilir, taşınabilir veya yeniden düzenlenebilir.":
        "本页内容可能会随时间更新、迁移或重新整理。",
      "Bu sayfa, sitemizde kullanılan çerezlerin ne işe yaradığını, ne kadar süre kaldığını ve tercihlerini nasıl yönetebileceğini sade dille açıklar.":
        "本页用简明语言说明本站 Cookie 的用途、保存时长及你如何管理偏好。",
      "Çerez nedir?": "什么是 Cookie？",
      "Kullandığımız başlıca türler": "我们主要使用的类型",
      "Hangi amaçlarla kullanılır?": "用于哪些目的？",
      "Saklama süresi ve üçüncü taraflar": "保存时长与第三方",
      "Kontrol sende": "控制权在你手中",
      "Çerezler, ziyaret sırasında tarayıcına bırakılan küçük veri dosyalarıdır.":
        "Cookie 是访问网站时写入浏览器的小型数据文件。",
      "Bazı ayarlar ise çerez yerine tarayıcının yerel kayıt alanında tutulabilir. Amaç, siteyi her seferinde baştan kurmadan daha düzenli çalıştırmaktır.":
        "部分设置会存于浏览器本地存储而非 Cookie，目的是让网站无需每次重置也能稳定运行。",
      "Zorunlu çerezler: oturum, güvenlik ve temel sayfa akışı için":
        "必要 Cookie：用于会话、安全和基础页面流程",
      "Tercih çerezleri: dil, tema ve benzer seçimleri hatırlamak için":
        "偏好 Cookie：用于记住语言、主题和类似选择",
      "Ölçüm çerezleri: hangi alanların daha çok kullanıldığını anlamak için":
        "分析 Cookie：用于了解哪些区域使用更多",
      "Üçüncü taraf çerezleri: harici bir araç kullanılırsa o hizmetin teknik kaydı için":
        "第三方 Cookie：使用外部工具时用于该服务的技术记录",
      "Dil tercihini hatırlamak": "记住语言偏好",
      "Tema seçimini korumak": "保留主题选择",
      "Oturum akışını yönetmek": "管理会话流程",
      "Sayfa hatalarını ve performans sorunlarını görmek": "查看页面错误与性能问题",
      "Kötüye kullanımı sınırlamaya yardımcı olmak": "帮助限制滥用行为",
      "Bazı çerezler sadece oturum açıkken kalır, bazıları ise belirli bir süre cihazında tutulur. Süre, çerezin amacına göre değişir.":
        "有些 Cookie 仅在会话期间有效，有些会在设备上保留一段时间，时长取决于用途。",
      "Harici bir analiz, giriş veya medya aracı kullanılırsa ilgili hizmet kendi çerezini oluşturabilir. Bu durumda o hizmetin kendi politikası da devreye girer.":
        "若使用外部分析、登录或媒体工具，该服务可能写入自己的 Cookie，此时其自身政策也适用。",
      "Tarayıcı ayarlarından çerezleri silebilir, engelleyebilir veya sadece belirli siteler için izin verebilirsin.":
        "你可在浏览器设置中删除、屏蔽 Cookie，或仅对特定站点放行。",
      "Çerezleri kapatman halinde bazı tercih alanları sıfırlanabilir ve bazı sayfa işlevleri beklenen gibi çalışmayabilir.":
        "关闭 Cookie 后，部分偏好可能被重置，某些页面功能可能无法按预期工作。",
      "Zorunlu olmayan yeni çerezler eklenirse bu metni ve varsa tercih ekranını aynı anda güncelleriz.":
        "若新增非必要 Cookie，我们会同步更新本说明及（若有）偏好设置页。",
      "Gönder": "提交",
      "Ad Soyad": "姓名",
      "E-posta": "邮箱",
      "Konu": "主题",
      "Genel Konular": "一般问题",
      "İş Birliği": "合作",
      "İçerik Düzeltmeleri": "内容修正",
      "Alan kodu": "区号",
      "Telefon numarası": "电话号码",
      "Mesaj": "消息",
      "Telefon bilgisi": "电话信息",
      "İşletme adı": "商家名称",
      "İl": "省",
      "İlçe": "区县",
      "Mahalle": "街区",
      "Sokak / Cadde / Bulvar": "街道 / 大道",
      "Bina no / Kapı no": "楼号 / 门牌号",
      "Sokak / Cadde": "街道 / 大道",
      "Bina / Kapı no": "楼号 / 门牌号",
      "Posta kodu": "邮编",
      "Web sitesi (varsa)": "网站（可选）",
      "Lütfen ad, e-posta, konu ve mesaj alanlarını doldur.": "请填写姓名、邮箱、主题和消息。",
      "Lütfen konu seçimini tamamla.": "请完成主题选择。",
      "İl, ilçe ve mahalle için veri kaynağı tanımlanmadı.": "省、区县和街区未配置数据源。",
      "İl, ilçe veya mahalle verisi yüklenemedi. Adresi PTT kaynağından kontrol ederek elle tamamlamalısın.":
        "省、区县或街区数据加载失败。请根据 PTT 地址源手动补全地址。",
      "Lütfen zorunlu alanları eksiksiz doldur, adres seçimlerini tamamla ve posta kodu otomatik gelmezse 5 hane olarak gir.":
        "请完整填写必填项并完成地址选择；若邮编未自动填入，请手动输入 5 位数字。",
      "AramaBul ücretsiz mi?": "AramaBul 免费吗？",
      "Evet, tüm mekan arama ve bilgi görüntüleme özellikleri tamamen ücretsizdir.":
        "是的，所有地点搜索和信息查看功能完全免费。",
      "Yeni mekan nasıl ekletebilirim?": "如何添加新地点？",
      "Footer alanındaki 'Yer ekle' bağlantısından mekan ekleme formunu kullanabilirsin.":
        "可以使用页脚'添加地点'链接中的提交表单。",
      "Mekan adı, adresi ve kategorisi gibi temel bilgileri paylaşman yeterlidir.":
        "只需提供地点名称、地址和分类等基本信息即可。",
      "Hakkında": "关于我们",
      "Neden var?": "为什么存在？",
      "Nasıl çalışır?": "如何运作？",
      "Temel yaklaşımımız": "我们的核心方法",
      "Aramabul, kullanıcının ihtiyaç duyduğu kategorideki mekana, istediği ilçe ve mahalle bilgisi ile kısa yoldan ulaşmasını sağlar.":
        "Aramabul 帮助用户通过输入区和街区信息，快速找到所需类别的地点。",
      "Kategoriler, kullanıcı ihtiyacına göre; yeme-içme, gezi, hizmet, sağlık, kültür ve sanat başlıkları altında oluşturulmuştur. Mekân listeleri karar vermeyi hızlandıracak ihtiyaca göre filtrelenerek, sade ve kullanıcı dostu bir biçimde sunulur.":
        "分类涵盖餐饮、出行、服务、健康、文化和艺术。地点列表按需求筛选，以简洁友好的方式呈现。",
      "Seçtiğiniz mekanın, adres, telefon, varsa web sitesi ve Instagram sayfası bilgileri, haritadaki yeri ve Google veri tabanındaki kullanıcıların değerlendirme puan ve adetleri ile son üç adet yorum gibi ayrıntılı bilgileri gösterilir.":
        "显示详细信息：地址、电话、网站和 Instagram 页面（如有）、地图位置、Google 用户评分和最近三条评论。"
    },
  });

  function footerPageLanguage() {
    return typeof window.ARAMABUL_GET_LANGUAGE === "function"
      ? String(window.ARAMABUL_GET_LANGUAGE() || "TR").trim().toUpperCase()
      : "TR";
  }

  function footerT(value) {
    const source = String(value || "");
    if (!source) {
      return source;
    }

    const lang = footerPageLanguage();
    const localPack = FOOTER_PAGE_TEXT[lang];
    if (localPack && typeof localPack[source] === "string") {
      return localPack[source];
    }

    const headerI18n = window.ARAMABUL_HEADER_I18N;
    if (headerI18n && typeof headerI18n.getStaticUiTranslation === "function") {
      return headerI18n.getStaticUiTranslation(source, lang) || source;
    }

    return source;
  }
  const PLACE_SUBMISSION_CONTENT = {
    hideHero: true,
    eyebrow: "İş ortaklığı",
    title: "Yer ekle",
    lead: "Yeni bir işletme veya hizmet noktası eklemek için aşağıdaki formu doldurup gönder tuşuna basınız.",
    cards: [],
    form: {
      title: "Yer ekle",
      description: "Yeni bir işletme veya hizmet noktası eklemek için aşağıdaki formu doldurup gönder tuşuna basınız.",
      submitLabel: "Gönder",
      successText:
        "Bilgiler alındı. Adres alanlarını PTT kaynağıyla eşleştirdiysen inceleme daha hızlı ilerler.",
      districtsUrl: "data/districts.json",
      neighborhoodsUrl: "data/location-neighborhoods.json",
      postcodesUrl: "data/location-postcodes.json",
    },
  };
  const TRANSFORMATION_CONTENT = {
    ...PLACE_SUBMISSION_CONTENT,
    title: "Dönüştürme",
    lead: "",
    cards: [
      {
        title: "Belge",
        paragraphs: [],
        href: "belge-donusturucu.html",
      },
      {
        title: "Görsel",
        paragraphs: [],
        href: "goruntu.html",
      },
    ],
    form: null,
  };
  const PAGE_CONTENT = Object.freeze({
    "app-store": {
      eyebrow: "Mobil uygulama",
      title: "App Store sayfası",
      lead: "iPhone ve iPad için hazırladığımız uygulama akışını burada önden anlatıyoruz.",
      cards: [
        {
          title: "Neleri hedefliyoruz?",
          paragraphs: [
            "App Store sürümünde arama, kategori takibi ve favori kaydetme akışını tek ekranda toplamak istiyoruz.",
            "İlk sürümde hızlı arama, konuma yakın sonuç ve sade profil alanı ana odak olacak.",
          ],
        },
        {
          title: "Yayın planı",
          bullets: [
            "Kapalı test ile küçük bir kullanıcı grubunda başlayacağız.",
            "Geri bildirimleri topladıktan sonra açık yayına geçeceğiz.",
            "Sürüm notlarını bu sayfada sade biçimde paylaşacağız.",
          ],
        },
      ],
      strip: {
        title: "İlk not",
        text: "iOS sürümü hazırlıkta. Yayın tarihi netleşince bu alanı güncelleyeceğiz.",
      },
    },
    "google-play": {
      eyebrow: "Mobil uygulama",
      title: "Google Play sayfası",
      lead: "Android kullanıcıları için hafif, hızlı ve kolay gezinilen bir deneyim planlıyoruz.",
      cards: [
        {
          title: "Android öncelikleri",
          paragraphs: [
            "Düşük donanımlı cihazlarda da akıcı çalışan bir yapı kuruyoruz.",
            "Kategori geçişleri, harita açılışı ve profil ayarları kısa adımlarla kullanılacak.",
          ],
        },
        {
          title: "Erken sürümde olacaklar",
          bullets: [
            "Temel kategori arama",
            "Kayıt ve giriş akışı",
            "Kaydedilen içerikler için basit takip alanı",
          ],
        },
      ],
      strip: {
        title: "Güncel durum",
        text: "Android dağıtımı için temel yapı hazır. İlk beta yayımlandığında bu sayfadan duyuracağız.",
      },
    },
    hakkimizda: {
      eyebrow: "",
      title: "Hakkında",
      lead: "Aramabul, kullanıcının bir yeri ararken, en kısa yoldan ve net bilgi bulmasını amaçlayan sade tasarımlı bir yardımcıdır.",
      cards: [
        {
          title: "Neden var?",
          paragraphs: [
            "İnsanlar çoğu zaman bir yerin adını değil, ihtiyacını bilir. Biz de aramayı ihtiyaçtan başlatıyoruz.",
            "Amaç, gereksiz kalabalığı ve çabayı azaltarak, ihtiyaç duyduğunuz hizmet ve ürüne daha hızlı ulaşmanızı sağlamak.",
          ],
        },
        {
          title: "Nasıl çalışır?",
          paragraphs: [
            "Aramabul, kullanıcının ihtiyaç duyduğu kategorideki mekana, istediği ilçe ve mahalle bilgisi ile kısa yoldan ulaşmasını sağlar.",
            "Kategoriler, kullanıcı ihtiyacına göre; yeme-içme, gezi, hizmet, sağlık, kültür ve sanat başlıkları altında oluşturulmuştur. Mekân listeleri karar vermeyi hızlandıracak ihtiyaca göre filtrelenerek, sade ve kullanıcı dostu bir biçimde sunulur.",
            "Seçtiğiniz mekanın, adres, telefon, varsa web sitesi ve Instagram sayfası bilgileri, haritadaki yeri ve Google veri tabanındaki kullanıcıların değerlendirme puan ve adetleri ile son üç adet yorum gibi ayrıntılı bilgileri gösterilir.",
          ],
        },
        {
          title: "Temel yaklaşımımız",
          bullets: [
            "Basit arayüz",
            "Açık bilgi",
            "Hızlı ve ayrıntılı yönlendirme",
          ],
        },
      ],
    },
    iletisim: {
      eyebrow: "Destek",
      title: "İletişim",
      lead: "Soru, öneri ve iş talepleriniz için aşağıdaki formu doldurunuz.",
      form: {
        kind: "contact",
        title: "",
        description: "",
        submitLabel: "Gönder",
        successText: "Mesajın hazırlandı. İlgili ekibe en kısa sürede yönlendireceğiz.",
      },
      cards: [],
    },
    sss: {
      eyebrow: "Yardım",
      title: "Sıkça Sorulan Sorular",
      lead: "En çok sorulan temel konuları kısa ve kolay anlaşılır cevaplarla bir araya getirdik.",
      cards: [
        {
          title: "Nasıl arama yaparım?",
          paragraphs: [
            "Üst arama alanından doğrudan mekan adı yazabilir ya da anasayfadan kategori seçebilirsin.",
            "Kategori sayfalarında şehir ve ilçe adımı ile sonuçları daraltabilirsin.",
          ],
        },
        {
          title: "Bilgi yanlışsa ne yapmalıyım?",
          paragraphs: [
            "Bize sayfa bağlantısı ile birlikte doğru bilgiyi gönder.",
            "İnceleme sonrası içerik güncellenir.",
          ],
        },
        {
          title: "Hesap şart mı?",
          paragraphs: [
            "Temel gezinme için hesap gerekmez.",
            "Favori, kayıt ve kişisel tercih akışları için hesap alanı sonraki adımlarda daha görünür hale gelecek.",
          ],
        },
        {
          title: "AramaBul ücretsiz mi?",
          paragraphs: [
            "Evet, tüm mekan arama ve bilgi görüntüleme özellikleri tamamen ücretsizdir.",
          ],
        },
        {
          title: "Yeni mekan nasıl ekletebilirim?",
          paragraphs: [
            "Footer alanındaki 'Yer ekle' bağlantısından mekan ekleme formunu kullanabilirsin.",
            "Mekan adı, adresi ve kategorisi gibi temel bilgileri paylaşman yeterlidir.",
          ],
        },
      ],
    },
    "ingilizce-sozluk": {
      hideHero: true,
      eyebrow: "Sözlük",
      title: "İngilizce Sözlük",
      lead: "",
      cards: [],
      form: {
        kind: "dictionary",
        title: "İngilizce Sözlük",
        description: "",
        submitLabel: "Ara",
        defaultWord: "",
      },
    },
    "eski-turkce-sozluk": {
      hideHero: true,
      eyebrow: "Sözlük",
      title: "TDK Sözlük",
      lead: "",
      cards: [],
      form: {
        kind: "old-turkic-dictionary",
        title: "TDK Sözlük",
        description: "",
        submitLabel: "Ara",
        defaultWord: "",
      },
    },
    kvkk: {
      eyebrow: "Yasal",
      title: "Kişisel Verilerin Korunması",
      lead: "Bu metin, kullanıcı verisine nasıl yaklaştığımızı sade dil ile anlatan ilk çerçevedir.",
      cards: [
        {
          title: "Hangi veriler olabilir?",
          bullets: [
            "Ad ve e-posta gibi temel hesap bilgileri",
            "Tercih ve dil ayarları",
            "Hata ve kullanım kayıtları",
          ],
        },
        {
          title: "Neden işlenir?",
          paragraphs: [
            "Hesabı çalıştırmak, tercihleri korumak ve hizmeti iyileştirmek için sınırlı veri kullanılır.",
            "İhtiyaç dışı veri toplamak ana yaklaşımımız değildir.",
          ],
        },
        {
          title: "Kullanıcı hakları",
          paragraphs: [
            "Bilgi isteme, düzeltme talep etme ve silme isteği gönderme hakkın vardır.",
          ],
        },
      ],
    },
    gizlilik: {
      eyebrow: "Yasal",
      title: "Gizlilik Politikası",
      lead: "Son güncelleme: 8 Mayıs 2026\n\nAramaBul (\"biz\", \"platform\" veya \"site\") olarak kişisel verilerinizin korunmasına büyük önem veriyoruz. Bu gizlilik politikası, aramabul.com adresini ziyaret ettiğinizde hangi bilgilerin toplandığını, nasıl kullanıldığını ve haklarınızı açıklamaktadır.",
      cards: [
        {
          title: "1. Toplanan Bilgiler",
          paragraphs: [
            "Otomatik olarak toplanan bilgiler: Sitemizi ziyaret ettiğinizde IP adresiniz, tarayıcı türünüz, işletim sisteminiz, ziyaret ettiğiniz sayfalar, ziyaret saatleri ve süreleri gibi bilgiler otomatik olarak kaydedilir.",
            "Hesap bilgileri: Hesap oluşturduğunuzda e-posta adresiniz, görünen adınız ve şifreniz (şifrelenmiş olarak) saklanır.",
            "Çerezler: Oturum yönetimi, tercih hatırlama ve analitik amaçlı çerezler kullanılmaktadır. Detaylar için Çerez Politikası sayfamızı inceleyiniz.",
          ],
        },
        {
          title: "2. Bilgilerin Kullanım Amaçları",
          paragraphs: [
            "Toplanan bilgiler aşağıdaki amaçlarla kullanılır:",
          ],
          bullets: [
            "Hizmetlerimizi sunmak ve iyileştirmek",
            "Kullanıcı deneyimini kişiselleştirmek",
            "Site güvenliğini sağlamak ve kötüye kullanımı önlemek",
            "Yasal yükümlülüklerimizi yerine getirmek",
            "İstatistiksel analizler ve performans ölçümleri yapmak",
          ],
        },
        {
          title: "3. Üçüncü Taraf Hizmetleri",
          paragraphs: [
            "Sitemizde aşağıdaki üçüncü taraf hizmetleri kullanılmaktadır:",
            "Google AdSense: Reklam sunmak amacıyla çerezler kullanır. Google'ın gizlilik politikası için: policies.google.com/privacy",
            "Google Maps Platform: Mekan bilgileri ve harita verileri için kullanılır.",
            "Google Fonts: Yazı tipi sunumu için kullanılır.",
          ],
        },
        {
          title: "3a. Mobil Uygulama",
          paragraphs: [
            "AramaBul mobil uygulaması, yakınındaki mekanları gösterebilmek için cihazınızın konum bilgisine erişim izni isteyebilir. Konum bilginiz yalnızca yakındaki mekanları listeleme amacıyla kullanılır ve sunucularımızda saklanmaz.",
            "Mobil uygulama, web sitemizi bir WebView aracılığıyla görüntüler. Web sitemizdeki gizlilik uygulamalarının tümü mobil uygulama için de geçerlidir.",
          ],
        },
        {
          title: "4. Veri Paylaşımı",
          paragraphs: [
            "Kişisel verileriniz, yasal zorunluluklar dışında üçüncü taraflarla satılmaz, kiralanmaz veya paylaşılmaz. Yalnızca hizmet sağlayıcılarımızla (sunucu, analitik) sınırlı ve gerekli ölçüde paylaşım yapılır.",
          ],
        },
        {
          title: "5. Veri Güvenliği",
          paragraphs: [
            "Verilerinizi korumak için endüstri standardı güvenlik önlemleri (SSL şifreleme, şifre hashleme, güvenlik duvarları) uygulanmaktadır. Ancak internet üzerinden hiçbir veri iletimi %100 güvenli değildir.",
          ],
        },
        {
          title: "6. Haklarınız",
          paragraphs: [
            "6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında aşağıdaki haklara sahipsiniz:",
          ],
          bullets: [
            "Kişisel verilerinizin işlenip işlenmediğini öğrenme",
            "Verilerinizin düzeltilmesini veya silinmesini talep etme",
            "Verilerinizin hangi amaçla kullanıldığını öğrenme",
            "Verilerinizin üçüncü kişilere aktarılıp aktarılmadığını öğrenme",
          ],
        },
        {
          title: "7. Politika Değişiklikleri",
          paragraphs: [
            "Bu gizlilik politikası zaman zaman güncellenebilir. Değişiklikler bu sayfada yayımlanır. Siteyi kullanmaya devam etmeniz, güncellenmiş politikayı kabul ettiğiniz anlamına gelir.",
          ],
        },
        {
          title: "8. İletişim",
          paragraphs: [
            "Gizlilik politikamızla ilgili sorularınız için: info@aramabul.com",
            "Bu haklarınızı kullanmak için İletişim sayfamızdan bize ulaşabilirsiniz.",
          ],
        },
      ],
    },
    kosullar: {
      eyebrow: "Yasal",
      title: "Kullanım Koşulları",
      lead: "",
      cards: [
        {
          title: "Kullanım sınırları",
          bullets: [
            "Yanıltıcı bilgi göndermeme",
            "Sistemi bozacak yoğun kötü kullanım yapmama",
            "Başkalarına ait içeriği izinsiz kopyalamama",
          ],
        },
        {
          title: "İçerik güncellemeleri",
          paragraphs: [
            "Sayfadaki içerikler zaman içinde güncellenebilir, taşınabilir veya yeniden düzenlenebilir.",
          ],
        },
      ],
    },
    cerez: {
      eyebrow: "Yasal",
      title: "Çerez Politikası",
      lead: "Bu çerez politikası, aramabul.com web sitesinde (\"Platform\") kullanılan çerezler hakkında bilgi vermektedir.",
      cards: [
        {
          title: "1. Çerez Nedir?",
          paragraphs: [
            "Çerezler, web siteleri tarafından tarayıcınıza yerleştirilen küçük metin dosyalarıdır. Çerezler, siteyi tekrar ziyaret ettiğinizde sizi tanımak, tercihlerinizi hatırlamak ve size daha iyi bir deneyim sunmak için kullanılır.",
          ],
        },
        {
          title: "2. Kullanılan Çerez Türleri",
          paragraphs: [
            "Zorunlu çerezler: Platformun düzgün çalışması için gereklidir. Oturum yönetimi ve güvenlik doğrulaması gibi temel işlevleri sağlar. Bu çerezler devre dışı bırakılamaz.",
            "Tercih çerezleri: Dil tercihi, tema seçimi ve favori mekanlar gibi kullanıcı tercihlerini hatırlamak için kullanılır.",
            "Analitik çerezler: Ziyaretçi istatistiklerini toplamak, sayfa performansını ölçmek ve kullanıcı deneyimini iyileştirmek amacıyla kullanılır.",
            "Reklam çerezleri: Google AdSense tarafından kullanıcıya uygun reklamlar göstermek amacıyla kullanılır. Bu çerezler üçüncü taraf çerezleridir.",
          ],
        },
        {
          title: "3. Üçüncü Taraf Çerezleri",
          paragraphs: [
            "Google AdSense: Reklam kişiselleştirme ve ölçüm amacıyla çerez kullanır.",
            "Google Fonts: Yazı tipi sunumu sırasında teknik çerezler kullanılabilir.",
            "Kişiselleştirilmiş reklam tercihlerinizi yönetmek için Google Reklam Ayarları sayfasını ziyaret edebilirsiniz.",
          ],
        },
        {
          title: "4. Çerezleri Yönetme",
          paragraphs: [
            "Tarayıcı ayarlarınızdan çerezleri yönetebilir veya silebilirsiniz. Ancak çerezleri devre dışı bırakmanız, platformun bazı özelliklerinin düzgün çalışmamasına neden olabilir.",
          ],
          bullets: [
            "Chrome: Ayarlar → Gizlilik ve Güvenlik → Çerezler",
            "Firefox: Ayarlar → Gizlilik ve Güvenlik → Çerezler",
            "Safari: Tercihler → Gizlilik → Çerezleri Yönet",
            "Edge: Ayarlar → Gizlilik → Çerezler",
          ],
        },
        {
          title: "5. Değişiklikler",
          paragraphs: [
            "Bu çerez politikası zaman zaman güncellenebilir. Güncellemeler bu sayfada yayımlanır.",
          ],
        },
        {
          title: "6. İletişim",
          paragraphs: [
            "Çerez politikamızla ilgili sorularınız için: info@aramabul.com",
          ],
        },
      ],
    },
    "yer-ekle": PLACE_SUBMISSION_CONTENT,
    donusturme: TRANSFORMATION_CONTENT,
    "fiyat-ekle": PLACE_SUBMISSION_CONTENT,
    instagram: {
      eyebrow: "Sosyal",
      title: "Instagram",
      lead: "Instagram tarafında daha çok görsel anlatım, kısa keşif listeleri ve yeni özellik duyuruları paylaşmayı hedefliyoruz.",
      cards: [
        {
          title: "Burada ne olur?",
          bullets: [
            "Yeni kategori duyuruları",
            "Kısa içerik kartları",
            "Arayüz yenilikleri",
          ],
        },
        {
          title: "Takip edenler ne beklemeli?",
          paragraphs: [
            "Daha sık ama kısa paylaşımlar. Hızlı özet ve net görsel öncelikli olur.",
          ],
        },
      ],
    },
    x: {
      eyebrow: "Sosyal",
      title: "X",
      lead: "X sayfası, kısa ürün güncellemeleri, hata notları ve hızlı duyurular için düşünülür.",
      cards: [
        {
          title: "Kullanım amacı",
          paragraphs: [
            "Kısa güncellemeler, bakım notları ve topluluk geri bildirimlerine hızlı dönüş için bu kanal daha uygun olur.",
          ],
        },
        {
          title: "Paylaşım tipi",
          bullets: [
            "Sürüm notları",
            "Kısa yol haritası notları",
            "Anlık bilgilendirme",
          ],
        },
      ],
    },
    facebook: {
      eyebrow: "Sosyal",
      title: "Facebook",
      lead: "Facebook tarafında daha açıklayıcı gönderiler, topluluk güncellemeleri ve duyuru arşivi yer alabilir.",
      cards: [
        {
          title: "İçerik tipi",
          paragraphs: [
            "Biraz daha uzun açıklamalı duyurular ve topluluk odaklı gönderiler bu alan için daha uygundur.",
          ],
        },
        {
          title: "Topluluk kuralı",
          bullets: [
            "Saygılı dil",
            "Açık geri bildirim",
            "Kısa ve konuya uygun yorum",
          ],
        },
      ],
    },
  });

  function currentKey() {
    const pathname = String(window.location.pathname || "").trim();
    if (FOOTER_PATHNAME_TO_KEY[pathname]) {
      return FOOTER_PATHNAME_TO_KEY[pathname];
    }
    const params = new URLSearchParams(window.location.search);
    return String(params.get("sayfa") || params.get("page") || DEFAULT_KEY).trim();
  }

  function pageContent() {
    return PAGE_CONTENT[currentKey()] || PAGE_CONTENT[DEFAULT_KEY];
  }

  function setText(id, value) {
    const node = document.querySelector(id);
    if (node) {
      node.textContent = footerT(value);
    }
  }

  function renderCards(cards) {
    const grid = document.querySelector("#contentPageGrid");
    if (!(grid instanceof HTMLElement)) {
      return;
    }

    grid.innerHTML = "";
    grid.hidden = !Array.isArray(cards) || cards.length === 0;

    if (grid.hidden) {
      return;
    }

    cards.forEach((cardData) => {
      const href = typeof cardData.href === "string" ? cardData.href.trim() : "";
      const card = document.createElement(href ? "a" : "article");
      card.className = "content-page-card";
      if (href) {
        card.href = href;
      }

      const title = document.createElement("h2");
      title.textContent = footerT(cardData.title);
      card.append(title);

      const paragraphs = Array.isArray(cardData.paragraphs) ? cardData.paragraphs : [];
      paragraphs.forEach((text) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = footerT(text);
        card.append(paragraph);
      });

      const bullets = Array.isArray(cardData.bullets) ? cardData.bullets : [];
      if (bullets.length > 0) {
        const list = document.createElement("ul");
        list.className = "content-page-list";
        bullets.forEach((text) => {
          const item = document.createElement("li");
          item.textContent = footerT(text);
          list.append(item);
        });
        card.append(list);
      }

      grid.append(card);
    });
  }

  function renderSubmissionForm(formConfig) {
    const wrap = document.querySelector("#contentPageFormSection");
    if (!(wrap instanceof HTMLElement)) {
      return;
    }

    wrap.innerHTML = "";
    wrap.hidden = true;

    if (!formConfig || typeof formConfig !== "object") {
      return;
    }

    const title = footerT(String(formConfig.title || "").trim());
    const description = footerT(String(formConfig.description || "").trim());
    const formKind = String(formConfig.kind || "place").trim();
    const submitLabel = footerT(String(formConfig.submitLabel || "Gönder").trim());
    const note = footerT(String(formConfig.note || "").trim());
    const successText = footerT(String(formConfig.successText || "Bilgiler hazırlandı.").trim());
    const districtsUrl = String(formConfig.districtsUrl || "").trim();
    const neighborhoodsUrl = String(formConfig.neighborhoodsUrl || "").trim();
    const postcodesUrl = String(formConfig.postcodesUrl || "").trim();
    const districtsByCity = {};
    const neighborhoodsByLocation = {};
    let postalCodeByLocation = {};

    const card = document.createElement("section");
    card.className = "content-page-form-card";

    if (title) {
      const heading = document.createElement("h2");
      heading.textContent = title;
      card.append(heading);
    }

    if (description) {
      const text = document.createElement("p");
      text.textContent = description;
      card.append(text);
    }

    const form = document.createElement("form");
    form.className = "content-page-form";
    form.noValidate = true;

    const grid = document.createElement("div");
    grid.className = "content-page-form-grid";

    function buildField(labelText, control, span = "half") {
      const label = document.createElement("label");
      label.className = "content-page-field";
      label.dataset.span = span;
      label.append(control);
      return label;
    }

    function buildInput(type, name, placeholder, required, autocomplete = "") {
      const input = document.createElement("input");
      input.type = type;
      input.name = name;
      input.placeholder = footerT(placeholder);
      input.required = required;
      if (autocomplete) {
        input.autocomplete = autocomplete;
      }
      return input;
    }

    function lockPlaceholderTranslation(control) {
      control.setAttribute("data-no-static-translate", "true");
      return control;
    }

    function finalizeForm(actionsNode, statusNode) {
      form.append(grid);
      form.append(actionsNode);
      form.append(statusNode);
      card.append(form);
      wrap.append(card);
      wrap.hidden = false;
    }

    if (formKind === "dictionary") {
      const searchInput = buildInput("text", "dictionaryQuery", "Kelime yaz", true, "off");
      const toolbar = document.createElement("div");
      toolbar.className = "dictionary-toolbar";

      const searchField = document.createElement("label");
      searchField.className = "content-page-field";
      searchField.dataset.span = "full";
      searchField.append(searchInput);

      const submitButton = document.createElement("button");
      submitButton.type = "submit";
      submitButton.className = "content-page-form-button";
      submitButton.textContent = submitLabel;

      toolbar.append(submitButton);

      const status = document.createElement("p");
      status.className = "content-page-form-status";
      status.setAttribute("aria-live", "polite");

      const resultsWrap = document.createElement("section");
      resultsWrap.className = "dictionary-results";
      resultsWrap.hidden = true;

      function createTextNode(tagName, className, value) {
        const node = document.createElement(tagName);
        node.className = className;
        node.textContent = value;
        return node;
      }

      function renderDictionaryResults(payload) {
        resultsWrap.innerHTML = "";

        const summaryCard = document.createElement("article");
        summaryCard.className = "dictionary-summary-card";

        const wordRow = document.createElement("div");
        wordRow.className = "dictionary-word-row";

        wordRow.append(
          createTextNode("h3", "dictionary-word", String(payload.word || "").trim()),
        );

        if (payload.translation) {
          wordRow.append(createTextNode("span", "dictionary-translation-chip", String(payload.translation)));
        }

        summaryCard.append(wordRow);

        if (payload.phonetic) {
          summaryCard.append(createTextNode("p", "dictionary-phonetic", String(payload.phonetic)));
        }

        resultsWrap.append(summaryCard);

        const meanings = Array.isArray(payload.meanings) ? payload.meanings : [];
        meanings.forEach((meaning) => {
          const meaningCard = document.createElement("article");
          meaningCard.className = "dictionary-meaning-card";

          meaningCard.append(
            createTextNode("h4", "dictionary-meaning-title", String(meaning.partOfSpeech || "").trim()),
          );

          const definitions = document.createElement("ol");
          definitions.className = "dictionary-definition-list";

          (Array.isArray(meaning.definitions) ? meaning.definitions : []).forEach((definition) => {
            const item = document.createElement("li");
            item.className = "dictionary-definition-item";

            item.append(createTextNode("p", "dictionary-definition-text", String(definition.text || "").trim()));

            if (definition.example) {
              item.append(createTextNode("p", "dictionary-definition-example", String(definition.example)));
            }

            definitions.append(item);
          });

          meaningCard.append(definitions);
          resultsWrap.append(meaningCard);
        });

        resultsWrap.hidden = false;
      }

      async function loadDictionary(query) {
        const term = String(query || "").trim().replace(/\s+/g, " ");
        if (!term) {
          status.dataset.state = "error";
          status.textContent = footerT("Arama için bir kelime yaz.");
          resultsWrap.hidden = true;
          return;
        }

        status.dataset.state = "";
        status.textContent = `${footerT("Sonuç yükleniyor")}: ${term}`;

        try {
          const response = await fetch(`/api/dictionary/lookup?q=${encodeURIComponent(term)}`, { cache: "no-store" });
          const payload = await response.json();
          if (!response.ok) {
            throw new Error(String(payload?.error || "Sözlük sonucu alınamadı."));
          }

          renderDictionaryResults(payload);
          status.dataset.state = "success";
          status.textContent = `${footerT("Sonuç hazır")}: ${term}`;
        } catch (error) {
          resultsWrap.hidden = true;
          status.dataset.state = "error";
          status.textContent = error instanceof Error ? error.message : footerT("Sözlük sonucu alınamadı.");
        }
      }

      form.append(searchField);
      form.append(toolbar);
      card.append(form);
      card.append(status);
      card.append(resultsWrap);
      wrap.append(card);
      wrap.hidden = false;

      searchInput.value = String(formConfig.defaultWord || "").trim();

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        loadDictionary(searchInput.value);
      });

      if (searchInput.value) {
        loadDictionary(searchInput.value);
      }
      return;
    }

    if (formKind === "ottoman-dictionary") {
      const searchInput = buildInput("text", "ottomanDictionaryQuery", "Kelime yaz", true, "off");
      const toolbar = document.createElement("div");
      toolbar.className = "dictionary-toolbar";
      const helper = document.createElement("p");
      helper.className = "dictionary-helper";
      helper.textContent = "Örnek: کتاب, kitab, aşk, devlet, su";

      const searchField = document.createElement("label");
      searchField.className = "content-page-field";
      searchField.dataset.span = "full";
      searchField.append(searchInput);

      const submitButton = document.createElement("button");
      submitButton.type = "submit";
      submitButton.className = "content-page-form-button";
      submitButton.textContent = submitLabel;

      toolbar.append(submitButton);

      const status = document.createElement("p");
      status.className = "content-page-form-status";
      status.setAttribute("aria-live", "polite");

      const resultsWrap = document.createElement("section");
      resultsWrap.className = "dictionary-results";
      resultsWrap.hidden = true;

      let dictionaryEntries = null;

      function normalizeQueryText(value) {
        return String(value || "")
          .trim()
          .toLocaleLowerCase("tr-TR")
          .normalize("NFKD")
          .replace(/[\u0300-\u036f]/g, "");
      }

      function createTextNode(tagName, className, value) {
        const node = document.createElement(tagName);
        node.className = className;
        node.textContent = value;
        return node;
      }

      async function loadOttomanDictionaryData() {
        if (Array.isArray(dictionaryEntries)) {
          return dictionaryEntries;
        }

        const response = await fetch("data/osmanlica-sozluk.json", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Sözlük verisi yüklenemedi.");
        }

        const payload = await response.json();
        dictionaryEntries = Array.isArray(payload) ? payload : [];
        return dictionaryEntries;
      }

      function renderOttomanResults(entries) {
        resultsWrap.innerHTML = "";

        entries.forEach((entry) => {
          const cardNode = document.createElement("article");
          cardNode.className = "dictionary-summary-card";

          const row = document.createElement("div");
          row.className = "dictionary-word-row";
          row.append(createTextNode("h3", "dictionary-word", String(entry.ottoman || "").trim()));
          cardNode.append(row);

          if (entry.latin) {
            cardNode.append(createTextNode("p", "dictionary-phonetic", `Okunuş: ${String(entry.latin).trim()}`));
          }

          const translations = Array.isArray(entry.turkish) ? entry.turkish : [];
          if (translations.length > 0) {
            const chipRow = document.createElement("div");
            chipRow.className = "dictionary-chip-row";
            translations.forEach((meaning) => {
              chipRow.append(createTextNode("span", "dictionary-translation-chip", String(meaning).trim()));
            });
            cardNode.append(chipRow);
          }

          if (entry.note) {
            cardNode.append(createTextNode("p", "dictionary-definition-example", String(entry.note).trim()));
          }

          resultsWrap.append(cardNode);
        });

        resultsWrap.hidden = false;
      }

      function renderOttomanShowcase(entries) {
        renderOttomanResults(entries);
        status.dataset.state = "";
        status.textContent = "Öne çıkan kelimeler gösteriliyor.";
      }

      async function loadOttomanDictionary(query) {
        const term = String(query || "").trim().replace(/\s+/g, " ");
        if (!term) {
          const entries = await loadOttomanDictionaryData();
          renderOttomanShowcase(entries.slice(0, 12));
          return;
        }

        status.dataset.state = "";
        status.textContent = `Sonuç yükleniyor: ${term}`;

        try {
          const entries = await loadOttomanDictionaryData();
          const normalizedTerm = normalizeQueryText(term);
          const matches = entries.filter((entry) => {
            const ottomanText = String(entry.ottoman || "").trim();
            const latinText = normalizeQueryText(entry.latin || "");
            const turkishText = (Array.isArray(entry.turkish) ? entry.turkish : [])
              .map((item) => normalizeQueryText(item))
              .join(" ");
            return (
              ottomanText.includes(term)
              || latinText.includes(normalizedTerm)
              || turkishText.includes(normalizedTerm)
            );
          }).slice(0, 24);

          if (matches.length === 0) {
            throw new Error("Bu kelime için sonuç bulunamadı.");
          }

          renderOttomanResults(matches);
          status.dataset.state = "success";
          status.textContent = `Sonuç hazır: ${term}`;
        } catch (error) {
          resultsWrap.hidden = true;
          status.dataset.state = "error";
          status.textContent = error instanceof Error ? error.message : "Sözlük sonucu alınamadı.";
        }
      }

      form.append(searchField);
      form.append(toolbar);
      card.append(form);
      card.append(helper);
      card.append(status);
      card.append(resultsWrap);
      wrap.append(card);
      wrap.hidden = false;

      searchInput.value = String(formConfig.defaultWord || "").trim();

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        loadOttomanDictionary(searchInput.value);
      });
      loadOttomanDictionary("");
      return;
    }

    if (formKind === "old-turkic-dictionary") {
      const searchInput = buildInput("text", "turkceDictionaryQuery", "Kelime yaz", true, "off");
      const toolbar = document.createElement("div");
      toolbar.className = "dictionary-toolbar";
      const helper = document.createElement("p");
      helper.className = "dictionary-helper";
      helper.textContent = "";

      const searchField = document.createElement("label");
      searchField.className = "content-page-field";
      searchField.dataset.span = "full";
      searchField.append(searchInput);

      const submitButton = document.createElement("button");
      submitButton.type = "submit";
      submitButton.className = "content-page-form-button";
      submitButton.textContent = submitLabel;

      toolbar.append(submitButton);

      const status = document.createElement("p");
      status.className = "content-page-form-status";
      status.setAttribute("aria-live", "polite");

      const resultsWrap = document.createElement("section");
      resultsWrap.className = "dictionary-results";
      resultsWrap.hidden = true;

      function createTextNode(tagName, className, value) {
        const node = document.createElement(tagName);
        node.className = className;
        node.textContent = value;
        return node;
      }

      function renderTurkishDictionaryResults(entries) {
        resultsWrap.innerHTML = "";

        entries.forEach((entry) => {
          const summaryCard = document.createElement("article");
          summaryCard.className = "dictionary-summary-card";

          const wordRow = document.createElement("div");
          wordRow.className = "dictionary-word-row";
          wordRow.append(createTextNode("h3", "dictionary-word", String(entry.word || "").trim()));
          summaryCard.append(wordRow);

          if (entry.pronunciation) {
            summaryCard.append(createTextNode("p", "dictionary-phonetic", `Telaffuz: ${String(entry.pronunciation).trim()}`));
          }

          if (entry.origin) {
            summaryCard.append(createTextNode("p", "dictionary-phonetic", `Köken: ${String(entry.origin).trim()}`));
          }

          const compounds = Array.isArray(entry.compounds) ? entry.compounds : [];
          if (compounds.length > 0) {
            const chipRow = document.createElement("div");
            chipRow.className = "dictionary-chip-row";
            compounds.slice(0, 8).forEach((meaning) => {
              chipRow.append(createTextNode("span", "dictionary-translation-chip", String(meaning).trim()));
            });
            summaryCard.append(chipRow);
          }

          const phrases = Array.isArray(entry.phrases) ? entry.phrases : [];
          if (phrases.length > 0) {
            summaryCard.append(createTextNode("p", "dictionary-definition-example", `Deyimler ve atasözleri: ${phrases.join(" • ")}`));
          }

          resultsWrap.append(summaryCard);

          const meanings = Array.isArray(entry.meanings) ? entry.meanings : [];
          meanings.forEach((meaning) => {
            const meaningCard = document.createElement("article");
            meaningCard.className = "dictionary-meaning-card";

            meaningCard.append(
              createTextNode("h4", "dictionary-meaning-title", String(meaning.partOfSpeech || "").trim() || "Anlam"),
            );

            const definitions = document.createElement("ol");
            definitions.className = "dictionary-definition-list";

            (Array.isArray(meaning.definitions) ? meaning.definitions : []).forEach((definition) => {
              const item = document.createElement("li");
              item.className = "dictionary-definition-item";
              item.append(createTextNode("p", "dictionary-definition-text", String(definition.text || "").trim()));

              if (definition.example) {
                item.append(createTextNode("p", "dictionary-definition-example", String(definition.example).trim()));
              }

              definitions.append(item);
            });

            meaningCard.append(definitions);
            resultsWrap.append(meaningCard);
          });
        });

        resultsWrap.hidden = false;
      }

      async function loadTurkishDictionary(query) {
        const term = String(query || "").trim().replace(/\s+/g, " ");
        if (!term) {
          status.dataset.state = "error";
          status.textContent = "Arama için bir kelime yaz.";
          resultsWrap.hidden = true;
          return;
        }

        status.dataset.state = "";
        status.textContent = `Sonuç yükleniyor: ${term}`;

        try {
          const response = await fetch(`/api/tdk-dictionary/lookup?q=${encodeURIComponent(term)}`, { cache: "no-store" });
          const rawText = await response.text();
          const normalizedText = rawText.trim();

          if (normalizedText.startsWith("<")) {
            throw new Error("Türkçe Sözlük servisi şu anda hazır değil.");
          }

          const payload = JSON.parse(normalizedText);
          if (!response.ok) {
            throw new Error(String(payload?.error || "Sözlük sonucu alınamadı."));
          }

          renderTurkishDictionaryResults(Array.isArray(payload.entries) ? payload.entries : []);
          status.dataset.state = "success";
          status.textContent = `Sonuç hazır: ${term}`;
        } catch (error) {
          resultsWrap.hidden = true;
          status.dataset.state = "error";
          status.textContent = error instanceof Error ? error.message : "Sözlük sonucu alınamadı.";
        }
      }

      form.append(searchField);
      form.append(toolbar);
      card.append(form);
      card.append(helper);
      card.append(status);
      card.append(resultsWrap);
      wrap.append(card);
      wrap.hidden = false;

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        loadTurkishDictionary(searchInput.value);
      });
      return;
    }

    if (formKind === "contact") {
      const contactTargets = Object.freeze({
        destek: {
          label: footerT("Genel Konular"),
          address: "destek@aramabul.com",
          subject: footerT("Genel Konular"),
        },
        ortaklik: {
          label: footerT("İş Birliği"),
          address: "destek@aramabul.com",
          subject: footerT("İş Birliği"),
        },
        icerik: {
          label: footerT("İçerik Düzeltmeleri"),
          address: "destek@aramabul.com",
          subject: footerT("İçerik Düzeltmeleri"),
        },
      });
      const fullName = lockPlaceholderTranslation(buildInput("text", "fullName", "Ad Soyad", true, "name"));
      const email = buildInput("email", "email", "E-posta", true, "email");
      const subjectSelect = document.createElement("select");
      const phoneAreaCode = buildInput("text", "phoneAreaCode", "Alan kodu", false, "tel-area-code");
      const phoneNumber = buildInput("tel", "phoneNumber", "Telefon numarası", false, "tel-local");
      const message = lockPlaceholderTranslation(document.createElement("textarea"));

      subjectSelect.name = "topic";
      subjectSelect.required = true;

      message.name = "message";
      message.placeholder = footerT("Mesaj");
      message.required = true;

      phoneAreaCode.inputMode = "numeric";
      phoneAreaCode.maxLength = 3;
      phoneAreaCode.pattern = "\\d{3}";
      phoneNumber.inputMode = "numeric";
      phoneNumber.maxLength = 7;
      phoneNumber.pattern = "\\d{7}";

      fillSelect(
        subjectSelect,
        footerT("Konu"),
        Object.entries(contactTargets).map(([key, target]) => ({
          value: key,
          label: target.label,
        }))
      );

      const phoneGroup = document.createElement("div");
      phoneGroup.className = "content-page-phone-group";

      const countryCode = document.createElement("span");
      countryCode.className = "content-page-phone-prefix";
      countryCode.textContent = "+90";

      phoneGroup.append(countryCode, phoneAreaCode, phoneNumber);

      grid.append(buildField(footerT("Ad Soyad"), fullName, "full"));
      grid.append(buildField(footerT("E-posta"), email, "full"));
      grid.append(buildField(footerT("Konu"), subjectSelect, "full"));
      grid.append(buildField(footerT("Telefon bilgisi"), phoneGroup, "full"));
      grid.append(buildField(footerT("Mesaj"), message, "full"));

      const actions = document.createElement("div");
      actions.className = "content-page-form-actions";

      const submitButton = document.createElement("button");
      submitButton.type = "submit";
      submitButton.className = "content-page-form-button";
      submitButton.textContent = submitLabel;
      actions.append(submitButton);

      if (note) {
        const noteNode = document.createElement("p");
        noteNode.className = "content-page-form-note";
        noteNode.textContent = note;
        actions.append(noteNode);
      }

      const status = document.createElement("p");
      status.className = "content-page-form-status";
      status.setAttribute("aria-live", "polite");

      subjectSelect.addEventListener("change", () => {
        syncSelectState(subjectSelect);
      });

      form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!form.checkValidity()) {
          form.reportValidity();
          status.dataset.state = "error";
          status.textContent = footerT("Lütfen ad, e-posta, konu ve mesaj alanlarını doldur.");
          return;
        }

        const selectedTarget = contactTargets[subjectSelect.value];
        if (!selectedTarget) {
          status.dataset.state = "error";
          status.textContent = footerT("Lütfen konu seçimini tamamla.");
          return;
        }

        const messageLines = [
          `Ad Soyad: ${fullName.value.trim()}`,
          `E-posta: ${email.value.trim()}`,
        ];
        const areaCode = phoneAreaCode.value.trim();
        const localNumber = phoneNumber.value.trim();
        if (areaCode || localNumber) {
          messageLines.push(`Telefon: +90 ${areaCode} ${localNumber}`.trim());
        }
        messageLines.push("", message.value.trim());

        const mailtoHref =
          `mailto:${selectedTarget.address}`
          + `?subject=${encodeURIComponent(selectedTarget.subject)}`
          + `&body=${encodeURIComponent(messageLines.join("\n"))}`;

        status.dataset.state = "success";
        status.textContent = `${successText} ${selectedTarget.address}`;
        window.location.href = mailtoHref;
      });

      finalizeForm(actions, status);
      return;
    }

    function normalizeLocationToken(value) {
      return String(value || "")
        .replace(/\s+/g, " ")
        .trim()
        .toLocaleLowerCase("tr-TR")
        .replace(/\bmah(allesi)?\b/gi, "mah")
        .replace(/\bkoy(u)?\b/gi, "koy")
        .replace(/\bköy(ü)?\b/gi, "köy")
        .replace(/[^a-z0-9çğıöşü]+/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    function formatNeighborhoodName(value) {
      return String(value || "")
        .replace(/Mah\.\.+/gi, "Mah.")
        .replace(/\.\.+/g, ".")
        .replace(/\s+/g, " ")
        .trim();
    }

    function locationKey(...parts) {
      return parts.map((part) => normalizeLocationToken(part)).join("|");
    }

    function syncSelectState(selectNode) {
      selectNode.dataset.empty = selectNode.value ? "false" : "true";
    }

    function fillSelect(selectNode, placeholder, values) {
      selectNode.innerHTML = "";

      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = footerT(placeholder);
      selectNode.append(defaultOption);

      values.forEach((value) => {
        const option = document.createElement("option");
        if (value && typeof value === "object") {
          option.value = String(value.value || "");
          option.textContent = footerT(String(value.label || value.value || ""));
        } else {
          option.value = value;
          option.textContent = footerT(value);
        }
        selectNode.append(option);
      });

      selectNode.value = "";
      syncSelectState(selectNode);
    }

    const businessName = buildInput("text", "businessName", "İşletme adı", true, "organization");
    const citySelect = document.createElement("select");
    const districtSelect = document.createElement("select");
    const neighborhoodSelect = document.createElement("select");
    const street = buildInput("text", "street", "Sokak / Cadde / Bulvar", true, "street-address");
    const doorNumber = buildInput("text", "doorNumber", "Bina no / Kapı no", true, "address-line2");
    const postalCode = buildInput("text", "postalCode", "Posta kodu", true, "postal-code");
    const phoneAreaCode = buildInput("text", "phoneAreaCode", "Alan kodu", true, "tel-area-code");
    const phoneNumber = buildInput("tel", "phoneNumber", "Telefon numarası", true, "tel-local");
    const website = buildInput("url", "website", "https://ornek.com", false, "url");

    postalCode.inputMode = "numeric";
    postalCode.maxLength = 5;
    postalCode.pattern = "\\d{5}";
    phoneAreaCode.inputMode = "numeric";
    phoneAreaCode.maxLength = 3;
    phoneAreaCode.pattern = "\\d{3}";
    phoneNumber.inputMode = "numeric";
    phoneNumber.maxLength = 7;
    phoneNumber.pattern = "\\d{7}";

    citySelect.name = "city";
    citySelect.required = true;
    districtSelect.name = "district";
    districtSelect.required = true;
    neighborhoodSelect.name = "neighborhood";
    neighborhoodSelect.required = true;
    districtSelect.disabled = true;
    neighborhoodSelect.disabled = true;
    citySelect.disabled = true;

    postalCode.readOnly = true;

    fillSelect(citySelect, "İl", []);
    fillSelect(districtSelect, "İlçe", []);
    fillSelect(neighborhoodSelect, "Mahalle", []);

    function syncPostalCode() {
      const selectedCity = citySelect.value;
      const selectedDistrict = districtSelect.value;
      const selectedNeighborhood = neighborhoodSelect.value;
      const hasFullSelection = Boolean(selectedCity && selectedDistrict && selectedNeighborhood);
      const key = hasFullSelection ? locationKey(selectedCity, selectedDistrict, selectedNeighborhood) : "";
      const matchedPostalCode = key ? String(postalCodeByLocation[key] || "").trim() : "";

      postalCode.value = matchedPostalCode;
      postalCode.readOnly = !hasFullSelection || Boolean(matchedPostalCode);
      postalCode.placeholder = !hasFullSelection
        ? footerT("Posta kodu")
        : matchedPostalCode
          ? footerT("Posta kodu")
          : footerT("Posta kodu");
    }

    function updateNeighborhoods() {
      const selectedCity = citySelect.value;
      const selectedDistrict = districtSelect.value;
      const key = selectedCity && selectedDistrict ? locationKey(selectedCity, selectedDistrict) : "";
      const neighborhoods = key ? neighborhoodsByLocation[key] || [] : [];

      fillSelect(neighborhoodSelect, "Mahalle", neighborhoods);
      neighborhoodSelect.disabled = neighborhoods.length === 0;
      syncSelectState(neighborhoodSelect);
      syncPostalCode();
    }

    function updateDistricts() {
      const selectedCity = citySelect.value;
      const districts = selectedCity ? districtsByCity[selectedCity] || [] : [];

      fillSelect(districtSelect, "İlçe", districts);
      districtSelect.disabled = districts.length === 0;
      fillSelect(neighborhoodSelect, "Mahalle", []);
      neighborhoodSelect.disabled = true;
      syncSelectState(districtSelect);
      syncSelectState(neighborhoodSelect);
      syncPostalCode();
    }

    citySelect.addEventListener("change", () => {
      syncSelectState(citySelect);
      updateDistricts();
    });
    districtSelect.addEventListener("change", () => {
      syncSelectState(districtSelect);
      updateNeighborhoods();
    });
    neighborhoodSelect.addEventListener("change", () => {
      syncSelectState(neighborhoodSelect);
      syncPostalCode();
    });

    grid.append(buildField(footerT("İşletme adı"), businessName, "full"));
    grid.append(buildField(footerT("İl"), citySelect, "full"));
    grid.append(buildField(footerT("İlçe"), districtSelect, "full"));
    grid.append(buildField(footerT("Mahalle"), neighborhoodSelect, "full"));
    grid.append(buildField(footerT("Sokak / Cadde"), street));
    grid.append(buildField(footerT("Bina / Kapı no"), doorNumber));
    const phoneGroup = document.createElement("div");
    phoneGroup.className = "content-page-phone-group";

    const countryCode = document.createElement("span");
    countryCode.className = "content-page-phone-prefix";
    countryCode.textContent = "+90";

    phoneGroup.append(countryCode, phoneAreaCode, phoneNumber);

    grid.append(buildField(footerT("Posta kodu"), postalCode));
    grid.append(buildField(footerT("Telefon bilgisi"), phoneGroup, "full"));
    grid.append(buildField(footerT("Web sitesi (varsa)"), website, "full"));
    const actions = document.createElement("div");
    actions.className = "content-page-form-actions";

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.className = "content-page-form-button";
    submitButton.textContent = submitLabel;
    actions.append(submitButton);

    if (note) {
      const noteNode = document.createElement("p");
      noteNode.className = "content-page-form-note";
      noteNode.textContent = note;
      actions.append(noteNode);
    }

    const status = document.createElement("p");
    status.className = "content-page-form-status";
    status.setAttribute("aria-live", "polite");

    async function loadDistricts() {
      if (!districtsUrl || !neighborhoodsUrl) {
        fillSelect(citySelect, "İl", []);
        fillSelect(districtSelect, "İlçe", []);
        fillSelect(neighborhoodSelect, "Mahalle", []);
        status.dataset.state = "error";
        status.textContent = footerT("İl, ilçe ve mahalle için veri kaynağı tanımlanmadı.");
        return;
      }

      try {
        const [districtResponse, neighborhoodResponse, postcodeResponse] = await Promise.all([
          fetch(districtsUrl, { cache: "no-store" }),
          fetch(neighborhoodsUrl, { cache: "no-store" }),
          postcodesUrl ? fetch(postcodesUrl, { cache: "no-store" }) : null,
        ]);

        if (!districtResponse.ok || !neighborhoodResponse.ok) {
          throw new Error("location fetch failed");
        }

        const [districtPayload, neighborhoodPayload, postcodePayload] = await Promise.all([
          districtResponse.json(),
          neighborhoodResponse.json(),
          postcodeResponse && postcodeResponse.ok ? postcodeResponse.json() : {},
        ]);

        if (!districtPayload || typeof districtPayload !== "object" || Array.isArray(districtPayload)) {
          throw new Error("invalid payload");
        }

        if (!neighborhoodPayload || typeof neighborhoodPayload !== "object" || Array.isArray(neighborhoodPayload)) {
          throw new Error("invalid neighborhood payload");
        }

        if (postcodePayload && typeof postcodePayload === "object" && !Array.isArray(postcodePayload)) {
          postalCodeByLocation = postcodePayload;
        }

        const cities = Object.keys(districtPayload).sort((left, right) => left.localeCompare(right, "tr"));
        cities.forEach((city) => {
          const districts = Array.isArray(districtPayload[city]) ? districtPayload[city] : [];
          districtsByCity[city] = [...districts].sort((left, right) => left.localeCompare(right, "tr"));
        });

        Object.keys(neighborhoodPayload).forEach((city) => {
          const districtMap = neighborhoodPayload[city];
          if (!districtMap || typeof districtMap !== "object" || Array.isArray(districtMap)) {
            return;
          }

          Object.keys(districtMap).forEach((district) => {
            const rawNeighborhoods = Array.isArray(districtMap[district]) ? districtMap[district] : [];
            const cleaned = rawNeighborhoods
              .map((item) => formatNeighborhoodName(item))
              .filter(Boolean)
              .filter((item, index, source) => source.indexOf(item) === index)
              .sort((left, right) => left.localeCompare(right, "tr"));

            neighborhoodsByLocation[locationKey(city, district)] = cleaned;
          });
        });

        fillSelect(citySelect, "İl", cities);
        citySelect.disabled = cities.length === 0;
        fillSelect(districtSelect, "İlçe", []);
        districtSelect.disabled = true;
        fillSelect(neighborhoodSelect, "Mahalle", []);
        neighborhoodSelect.disabled = true;
        syncSelectState(citySelect);
        syncSelectState(districtSelect);
        syncSelectState(neighborhoodSelect);
        status.dataset.state = "";
        status.textContent = "";
      } catch (_error) {
        fillSelect(citySelect, "İl", []);
        fillSelect(districtSelect, "İlçe", []);
        fillSelect(neighborhoodSelect, "Mahalle", []);
        citySelect.disabled = true;
        districtSelect.disabled = true;
        neighborhoodSelect.disabled = true;
        status.dataset.state = "error";
        status.textContent =
          footerT("İl, ilçe veya mahalle verisi yüklenemedi. Adresi PTT kaynağından kontrol ederek elle tamamlamalısın.");
      }
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        status.dataset.state = "error";
        status.textContent =
          footerT("Lütfen zorunlu alanları eksiksiz doldur, adres seçimlerini tamamla ve posta kodu otomatik gelmezse 5 hane olarak gir.");
        return;
      }

      status.dataset.state = "success";
      status.textContent = successText;
    });

    finalizeForm(actions, status);
    loadDistricts();
  }

  function renderStrip(strip) {
    const wrap = document.querySelector("#contentPageStrip");
    const titleNode = document.querySelector("#contentPageStripTitle");
    const textNode = document.querySelector("#contentPageStripText");

    if (!(wrap instanceof HTMLElement) || !(titleNode instanceof HTMLElement) || !(textNode instanceof HTMLElement)) {
      return;
    }

    titleNode.textContent = strip && strip.title ? footerT(strip.title) : "";
    textNode.textContent = strip && strip.text ? footerT(strip.text) : "";
    wrap.hidden = !(strip && (strip.title || strip.text));
  }

  function applyFooterPageTranslations() {
    const headerI18n = window.ARAMABUL_HEADER_I18N;
    if (!headerI18n || typeof headerI18n !== "object") {
      return;
    }

    if (typeof headerI18n.applyStaticPageTranslations === "function") {
      headerI18n.applyStaticPageTranslations();
    }

    if (typeof headerI18n.normalizeFooterUi === "function") {
      headerI18n.normalizeFooterUi();
    }
  }

  function applyPageContent() {
    const rawKey = currentKey();
    const key = PAGE_CONTENT[rawKey] ? rawKey : DEFAULT_KEY;
    const content = PAGE_CONTENT[key];
    const title = String(content.title || "Bilgi Sayfası").trim();
    const lead = String(content.lead || "").trim();
    const shell = document.querySelector(".content-page-shell");
    const eyebrowNode = document.querySelector("#contentPageEyebrow");
    const heroNode = document.querySelector(".content-page-hero");

    if (shell instanceof HTMLElement) {
      shell.dataset.pageKey = key;
    }

    if (heroNode instanceof HTMLElement) {
      heroNode.hidden = Boolean(content.hideHero);
    }

    if (eyebrowNode instanceof HTMLElement) {
      eyebrowNode.textContent = "";
      eyebrowNode.hidden = true;
    }
    setText("#contentPageTitle", title);
    setText("#contentPageLead", lead);
    setText("#contentPageBreadcrumb", title);

    document.title = "AramaBul";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription instanceof HTMLMetaElement) {
      metaDescription.setAttribute("content", footerT(lead || `${title} bilgi sayfası.`));
    }

    renderCards(Array.isArray(content.cards) ? content.cards : []);
    renderSubmissionForm(content.form);
    renderStrip(content.strip);
    applyFooterPageTranslations();
  }

  applyPageContent();
  document.addEventListener("aramabul:languagechange", () => {
    applyPageContent();
  });
})();
