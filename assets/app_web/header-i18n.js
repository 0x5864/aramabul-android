(() => {
  const runtime = window.ARAMABUL_RUNTIME;
  const FOOTER_HEADINGS = {
    TR: { discover: "Keşfet", help: "Yardım", partners: "Kurumsal" },
    EN: { discover: "Discover", help: "Help", partners: "Corporate" },
    RU: { discover: "Обзор", help: "Помощь", partners: "Корпоративное" },
    DE: { discover: "Entdecken", help: "Hilfe", partners: "Unternehmen" },
    ZH: { discover: "探索", help: "帮助", partners: "企业" },
  };
  const FOOTER_PAGE_GROUPS = [
    ["footer-page.html?sayfa=app-store", "footer-page.html?sayfa=google-play"],
    [
      "footer-page.html?sayfa=hakkimizda",
      "footer-page.html?sayfa=yer-ekle",
      "footer-page.html?sayfa=iletisim",
    ],
    [
      "footer-page.html?sayfa=kosullar",
      "footer-page.html?sayfa=kvkk",
      "footer-page.html?sayfa=gizlilik",
    ],
    [
      "footer-page.html?sayfa=sss",
      "footer-page.html?sayfa=cerez",
    ],
  ];
  const FOOTER_SOCIAL_PAGES = [
    "footer-page.html?sayfa=instagram",
    "footer-page.html?sayfa=x",
    "footer-page.html?sayfa=facebook",
  ];
  const FOOTER_SOCIAL_LABELS = ["Instagram", "X", "Facebook"];
  const STATIC_UI_TRANSLATIONS = {
    TR: {},
    EN: {
      "Anasayfa": "Home",
      "Ayarlar": "Settings",
      "Dil Ayarları": "Language Settings",
      "Dil seçenekleri": "Language options",
      "Dil seç": "Choose language",
      "Uygulama metinleri bu seçime göre güncellenir.": "App text updates based on this selection.",
      "Hesap": "Account",
      "Diller": "Languages",
      "Geribildirim": "Feedback",
      "Mesajını konu seçerek hızlıca iletebilirsin.": "You can quickly send your message by selecting a subject.",
      "Yardım": "Help",
      "Hakkında": "About",
      "Çıkış yap": "Sign out",
      "Misafir": "Guest",
      "Kayıt ol": "Sign up",
      "Hesabını oluştur ve ayarlarını kaydet.": "Create your account and save your settings.",
      "Ad Soyad": "Full name",
      "E-posta": "Email",
      "Şifre": "Password",
      "Şifre tekrar": "Repeat password",
      "Hesap bilgileri": "Account details",
      "Adını ve e-postanı burada güncelleyebilirsin.": "You can update your name and email here.",
      "Kaydet": "Save",
      "Gönder": "Send",
      "Ne Nerede?": "What and where?",
      "Yemek": "Food",
      "Kafe": "Cafe",
      "Kuaför": "Hairdresser",
      "Veteriner": "Veterinarian",
      "Eczane": "Pharmacy",
      "Market": "Market",
      "Akaryakıt": "Fuel",
      "Hastane": "Hospital",
      "Banka": "Bank",
      "Otel": "Hotel",
      "Kargo Şubeleri": "Cargo Branches",
      "Noter": "Notary",
      "Aile Sağlığı Merkezi": "Family Health Center",
      "Diş Klinikleri": "Dental Clinics",
      "Duraklar": "Stops",
      "Otopark": "Parking",
      "Yeme-İçme": "Food & Drink",
      "Gezi": "Travel",
      "Hizmetler": "Services",
      "Sağlık": "Health",
      "Kültür": "Culture",
      "Sanat": "Art",
      "Opera ve Bale": "Opera and Ballet",
      "Devlet Tiyatroları": "State Theaters",
      "Şehir Tiyatroları": "City Theaters",
      "Özel Tiyatrolar": "Private Theaters",
      "Müzeler": "Museums",
      "Mağaralar": "Caves",
      "Ören yerleri": "Archaeological Sites",
      "Camiler": "Mosques",
      "Tarihi Camiler": "Historic Mosques",
      "Şelaleler": "Waterfalls",
      "Galeriler": "Galleries",
      "Yeme-İçme alt kategorileri": "Food & Drink subcategories",
      "Kültür alt kategorileri": "Culture subcategories",
      "Kültür Mekanları": "Culture venues",
      "Sanat alt kategorileri": "Art subcategories",
      "Sanat Mekanları": "Art venues",
      "Meyhane": "Tavern",
      "Meyhaneler": "Taverns",
      "Ocakbaşı": "Grill House",
      "Ev Yemekleri": "Home Cooking",
      "Çorba": "Soup",
      "Lahmacun": "Lahmacun",
      "Pide": "Pide",
      "Köfte": "Meatballs",
      "Çiğ Köfte": "Cig Kofte",
      "Mantı": "Manti",
      "Deniz Ürünleri": "Seafood",
      "Sokak Lezzetleri": "Street Food",
      "Dondurma": "Ice Cream",
      "Tatlı": "Desserts",
      "Kahvaltı": "Breakfast",
      "Vegan": "Vegan",
      "Vejetaryen": "Vegetarian",
      "Glutensiz": "Gluten Free",
      "Asya": "Asia",
      "Asya Mutfağı": "Asia",
      "İtalyan": "Italian",
      "Mangal": "Barbecue",
      "Noodle": "Noodles",
      "Tost": "Toast",
      "Döner": "Doner",
      "Kebap": "Kebab",
      "Börek": "Borek",
      "Restoranlar": "Restaurants",
      "Lokantalar": "Eateries",
      "Kahvaltı Mekanları": "Breakfast Places",
      "Kebapçılar": "Kebab Restaurants",
      "Kafeler": "Cafes",
      "Dönerciler": "Doner Restaurants",
      "Pide ve Lahmacun": "Pide and Lahmacun",
      "Çiğ Köfteciler": "Cig Kofte Shops",
      "Pub&Bar": "Pub & Bar",
      "Kuaförler": "Hairdressers",
      "Veterinerler": "Veterinarians",
      "Eczaneler": "Pharmacies",
      "Nöbetçi Eczaneler": "On-duty Pharmacies",
      "Akaryakıt İstasyonları": "Fuel Stations",
      "Kamp Alanları": "Camp Sites",
      "Pansiyonlar": "Guesthouses",
      "Mekan Türleri": "Place Types",
      "Hizmet Türleri": "Service Types",
      "Sağlık Türleri": "Health Types",
      "Gezi Türleri": "Travel Types",
      "ATM / Bankamatik": "ATM / Cash Machine",
      "Otobüs / Metro / Tramvay Durakları": "Bus / Metro / Tram Stops",
      "Yer ekle": "Add place",
      "İletişim": "Contact",
      "Çerez Politikası": "Cookie Policy",
      "Kullanım Koşulları": "Terms of Use",
      "Kişisel Verilerin Korunması": "Personal Data Protection",
      "Gizlilik Politikası": "Privacy Policy",
      "Kurumsal": "Corporate",
      "Keşfet": "Discover",
      "Yardım mı lazım?": "Need help?",
      "İl": "Province",
      "İli": "Province",
      "İlçe": "District",
      "İlçesi": "District",
      "İlçeler": "Districts",
      "İller": "Provinces",
      "Mekan": "Place",
      "Mekanlar": "Places",
      "İlçe Mekanları": "District Places",
      "Yakındaki {title}": "Nearby {title}",
      "Konumunu kullanmama izin ver, sana en yakın {title} listeleyeyim.":
        "Allow me to use your location, and I will list the nearest {title}.",
      "Listele": "List",
      "Konum alınıyor...": "Getting location...",
      "Listelenecek mekan bulunmamıştır.": "No places were found to list.",
      "Liste penceresi açılamadı.": "The list window could not be opened.",
      "{location} çevresine göre sıralandı": "Sorted around {location}",
      "Konumuna göre sıralandı": "Sorted by your location",
      "Konum bulunamadı.": "Location could not be found.",
      "Haritada Önizle": "Preview on map",
      "Yakındaki Öneriler": "Nearby Suggestions",
      "Yakındaki Mekanlar": "Nearby Places",
      "Yakındaki mekanlar penceresini kapat": "Close nearby places window",
      "Kapat": "Close",
      "Tarayıcı konum özelliği desteklenmiyor.": "Browser location feature is not supported.",
      "Konum izni kapalı. Tarayıcıdan izin verip tekrar dene.": "Location permission is off. Allow it in your browser and try again.",
      "Konum alınamadı. Bağlantını kontrol edip tekrar dene.": "Location could not be retrieved. Check your connection and try again.",
      "Konum bilgisi alınamadı.": "Location information could not be retrieved.",
      "Türler": "Types",
      "Şarj İstasyonları": "Charging Stations",
      "Otoparklar": "Parking Areas",
      "Diğer Ulaşım Noktaları": "Other Transport Points",
      "Aile Sağlığı Merkezleri": "Family Health Centers",
      "Hastaneler": "Hospitals",
      "Hakkımızda": "About us",
      "Sıkça Sorulan Sorular": "FAQ",
      "Çıkış için giriş yap": "Sign in to sign out",
      "Kayıtlı oturum yok. Önce kayıt ol.": "No active session. Sign up first.",
      "Kayıt ol penceresi yakında burada açılacak.": "The sign-up window will be available here soon.",
      "Ad soyad en az 2 karakter olmalı.": "Full name must be at least 2 characters.",
      "Geçerli bir e-posta gir.": "Enter a valid email.",
      "Bu e-posta başka bir hesapta kayıtlı.": "This email is already used by another account.",
      "Hesap bilgileri kaydedildi.": "Account details saved.",
      "E-posta adresin doğrulandı.": "Your email address has been verified.",
      "Hesap güvenliği doğrulanamadı. Lütfen çıkış yapıp yeniden giriş yap.":
        "Account security could not be verified. Please sign out and sign in again.",
      "Lütfen ad, e-posta, konu ve mesaj alanlarını doldur.": "Please fill in name, email, subject, and message.",
      "Mesajın seçilen konuya göre hazırlandı.": "Your message is prepared for the selected topic.",
      "Konu": "Subject",
      "Genel Konular": "General Topics",
      "İş Birliği": "Partnership",
      "İçerik Düzeltmeleri": "Content Corrections",
      "Alan kodu": "Area code",
      "Telefon numarası": "Phone number",
      "Mesaj": "Message",
      "En çok sorulan temel konuları kısa cevaplarla burada topladık.": "We gathered the most common questions here with short answers.",
      "Nasıl arama yaparım?": "How do I search?",
      "Üst arama alanından doğrudan mekan adı yazabilir ya da anasayfadan kategori seçebilirsin.":
        "You can type a place name in the top search box or choose a category from the home page.",
      "Bilgi yanlışsa ne yapmalıyım?": "What should I do if information is wrong?",
      "Geribildirim sekmesinden kısa bir not bırakabilir ya da iletişim sayfasından bize yazabilirsin.":
        "You can leave a short note in the feedback tab or contact us from the contact page.",
      "Hesap şart mı?": "Is an account required?",
      "Temel gezinme için hesap gerekmez. Kayıtlı kullanıcı ayarları için hesap alanını kullanabilirsin.":
        "You do not need an account for basic browsing. Use the account area for saved user settings.",
      "Aramabul uygulamasının yaklaşımını ve çalışma mantığını burada bulabilirsin.":
        "You can find Aramabul's approach and how it works here.",
      "Aramabul, kullanıcının bir yeri ararken, en kısa yoldan ve net bilgi bulmasını amaçlayan sade tasarımlı bir yardımcıdır.":
        "Aramabul is a simple helper designed to help users find clear location information quickly.",
      "Neden var?": "Why does it exist?",
      "İnsanlar çoğu zaman bir yerin adını değil, ihtiyacını bilir. Biz de aramayı ihtiyaçtan başlatıyoruz.":
        "People often know their need, not the place name. So we start search from the need.",
      "Amaç, gereksiz kalabalığı ve çabayı azaltarak, ihtiyaç duyduğunuz hizmet ve ürüne daha hızlı ulaşmanızı sağlamak.":
        "The goal is to reduce clutter and effort so you can reach the service or product you need faster.",
      "Nasıl çalışır?": "How does it work?",
      "Kategori, şehir ve ilçe katmanları sırasıyla, önce alt kategoriler, son olarak da hizmet mekanları seçenekleri ile sizi buluşturuyoruz.":
        "We guide you through category, city, and district layers, then present subcategories and service places.",
      "Bilgiyi kutu yapısında sunarak, kullanıcıyı uzun sayfalarda dolaştırmadan net karar alanına ulaştırıyoruz. İhtiyaç duyduğunuz hizmeti alacağınız mekanı, tüm ulaşım ve iletişim bilgileri ile, en kullanıcı dostu biçimde görmenizi sağlıyoruz.":
        "We present information in card format so users can reach a clear decision area without scrolling long pages. We show the right place with full transport and contact details in a user-friendly way.",
      "Temel yaklaşımımız": "Our core approach",
      "Basit arayüz": "Simple interface",
      "Açık bilgi": "Clear information",
      "Hızlı ve ayrıntılı yönlendirme": "Fast and detailed guidance",
      "Konum": "Location",
      "Tüm ilçeler": "All districts",
      "Mahalle": "Neighborhood",
      "Önce ilçe seç": "Select district first",
      "Kategori": "Category",
      "Tüm kategoriler": "All categories",
      "Bütçe": "Budget",
      "Tüm bütçeler": "All budgets",
      "Mekan ara": "Search venue",
      "Ne bulmamı istersin?": "What would you like me to find?",
      "Bul": "Find",
      "Yakındaki mekanlar": "Nearby places",
      "mekan listeleniyor": "venues listed",
      "mekan yakında bulundu": "nearby venues found",
      "Bu filtrelerle mekan bulunamadı.": "No venues found with these filters.",
      "Konum seç": "Select location",
      "Mahalle seç": "Select neighborhood",
      "Kategori seç": "Select category",
      "Bütçe seç": "Select budget",
    },
    RU: {
      "Anasayfa": "Главная",
      "Ayarlar": "Настройки",
      "Dil Ayarları": "Настройки языка",
      "Dil seçenekleri": "Языковые настройки",
      "Dil seç": "Выберите язык",
      "Uygulama metinleri bu seçime göre güncellenir.": "Тексты приложения обновляются по этому выбору.",
      "Hesap": "Аккаунт",
      "Diller": "Языки",
      "Geribildirim": "Обратная связь",
      "Mesajını konu seçerek hızlıca iletebilirsin.": "Вы можете быстро отправить сообщение, выбрав тему.",
      "Yardım": "Помощь",
      "Hakkında": "О приложении",
      "Çıkış yap": "Выйти",
      "Misafir": "Гость",
      "Kayıt ol": "Регистрация",
      "Hesabını oluştur ve ayarlarını kaydet.": "Создайте аккаунт и сохраните настройки.",
      "Ad Soyad": "Имя и фамилия",
      "E-posta": "Эл. почта",
      "Şifre": "Пароль",
      "Şifre tekrar": "Повторите пароль",
      "Hesap bilgileri": "Данные аккаунта",
      "Adını ve e-postanı burada güncelleyebilirsin.": "Здесь можно обновить имя и почту.",
      "Kaydet": "Сохранить",
      "Gönder": "Отправить",
      "Ne Nerede?": "Что и где?",
      "Yemek": "Еда",
      "Kafe": "Кафе",
      "Kuaför": "Парикмахер",
      "Veteriner": "Ветеринар",
      "Eczane": "Аптека",
      "Market": "Маркет",
      "Akaryakıt": "Топливо",
      "Hastane": "Больница",
      "Banka": "Банк",
      "Otel": "Отель",
      "Kargo Şubeleri": "Отделения доставки",
      "Noter": "Нотариус",
      "Aile Sağlığı Merkezi": "Семейный медцентр",
      "Diş Klinikleri": "Стоматологии",
      "Duraklar": "Остановки",
      "Otopark": "Парковка",
      "Yeme-İçme": "Еда и напитки",
      "Gezi": "Путешествия",
      "Hizmetler": "Услуги",
      "Sağlık": "Здоровье",
      "Kültür": "Культура",
      "Sanat": "Искусство",
      "Opera ve Bale": "Опера и балет",
      "Devlet Tiyatroları": "Государственные театры",
      "Şehir Tiyatroları": "Городские театры",
      "Özel Tiyatrolar": "Частные театры",
      "Müzeler": "Музеи",
      "Mağaralar": "Пещеры",
      "Ören yerleri": "Археологические памятники",
      "Camiler": "Мечети",
      "Tarihi Camiler": "Исторические мечети",
      "Şelaleler": "Водопады",
      "Galeriler": "Галереи",
      "Yeme-İçme alt kategorileri": "Подкатегории еды и напитков",
      "Kültür alt kategorileri": "Подкатегории культуры",
      "Kültür Mekanları": "Культурные площадки",
      "Sanat alt kategorileri": "Подкатегории искусства",
      "Sanat Mekanları": "Площадки искусства",
      "Meyhane": "Таверна",
      "Meyhaneler": "Таверны",
      "Ocakbaşı": "Гриль",
      "Ev Yemekleri": "Домашняя кухня",
      "Çorba": "Суп",
      "Lahmacun": "Лахмаджун",
      "Pide": "Пиде",
      "Köfte": "Кёфте",
      "Çiğ Köfte": "Чиг кёфте",
      "Mantı": "Манты",
      "Deniz Ürünleri": "Морепродукты",
      "Sokak Lezzetleri": "Уличная еда",
      "Dondurma": "Мороженое",
      "Tatlı": "Десерты",
      "Kahvaltı": "Завтрак",
      "Vegan": "Веган",
      "Vejetaryen": "Вегетарианское",
      "Glutensiz": "Без глютена",
      "Asya": "Азия",
      "Asya Mutfağı": "Азия",
      "İtalyan": "Итальянская кухня",
      "Mangal": "Барбекю",
      "Noodle": "Лапша",
      "Tost": "Тост",
      "Döner": "Донер",
      "Kebap": "Кебаб",
      "Börek": "Бёрек",
      "Restoranlar": "Рестораны",
      "Lokantalar": "Локанты",
      "Kahvaltı Mekanları": "Места для завтрака",
      "Kebapçılar": "Кебабные",
      "Kafeler": "Кафе",
      "Dönerciler": "Донерные",
      "Pide ve Lahmacun": "Пиде и лахмаджун",
      "Çiğ Köfteciler": "Заведения чиг кёфте",
      "Pub&Bar": "Пабы и бары",
      "Kuaförler": "Парикмахерские",
      "Veterinerler": "Ветеринары",
      "Eczaneler": "Аптеки",
      "Nöbetçi Eczaneler": "Дежурные аптеки",
      "Akaryakıt İstasyonları": "АЗС",
      "Kamp Alanları": "Кемпинги",
      "Pansiyonlar": "Гостевые дома",
      "Mekan Türleri": "Типы мест",
      "Hizmet Türleri": "Типы услуг",
      "Sağlık Türleri": "Типы здоровья",
      "Gezi Türleri": "Типы поездок",
      "ATM / Bankamatik": "Банкоматы",
      "Otobüs / Metro / Tramvay Durakları": "Остановки автобуса / метро / трамвая",
      "Yer ekle": "Добавить место",
      "İletişim": "Контакты",
      "Çerez Politikası": "Политика cookies",
      "Kullanım Koşulları": "Условия использования",
      "Kişisel Verilerin Korunması": "Защита персональных данных",
      "Gizlilik Politikası": "Политика конфиденциальности",
      "Kurumsal": "Корпоративное",
      "Keşfet": "Обзор",
      "Yardım mı lazım?": "Нужна помощь?",
      "İl": "Область",
      "İli": "Область",
      "İlçe": "Район",
      "İlçesi": "Район",
      "İlçeler": "Районы",
      "İller": "Области",
      "Mekan": "Место",
      "Mekanlar": "Места",
      "İlçe Mekanları": "Места района",
      "Yakındaki {title}": "{title} рядом с вами",
      "Konumunu kullanmama izin ver, sana en yakın {title} listeleyeyim.":
        "Разрешите доступ к геолокации, и я покажу ближайшие {title}.",
      "Listele": "Показать",
      "Konum alınıyor...": "Определяем местоположение...",
      "Listelenecek mekan bulunmamıştır.": "Подходящих мест не найдено.",
      "Liste penceresi açılamadı.": "Не удалось открыть окно списка.",
      "{location} çevresine göre sıralandı": "Отсортировано по району: {location}",
      "Konumuna göre sıralandı": "Отсортировано по вашей геолокации",
      "Konum bulunamadı.": "Не удалось определить местоположение.",
      "Haritada Önizle": "Предпросмотр на карте",
      "Yakındaki Öneriler": "Рекомендации рядом",
      "Yakındaki Mekanlar": "Места рядом",
      "Yakındaki mekanlar penceresini kapat": "Закрыть окно мест рядом",
      "Kapat": "Закрыть",
      "Tarayıcı konum özelliği desteklenmiyor.": "Функция геолокации в браузере не поддерживается.",
      "Konum izni kapalı. Tarayıcıdan izin verip tekrar dene.": "Доступ к геолокации отключён. Разрешите его в браузере и попробуйте снова.",
      "Konum alınamadı. Bağlantını kontrol edip tekrar dene.": "Не удалось получить геолокацию. Проверьте соединение и попробуйте снова.",
      "Konum bilgisi alınamadı.": "Не удалось получить данные о геолокации.",
      "Türler": "Типы",
      "Şarj İstasyonları": "Зарядные станции",
      "Otoparklar": "Парковки",
      "Diğer Ulaşım Noktaları": "Другие точки транспорта",
      "Aile Sağlığı Merkezleri": "Центры семейного здоровья",
      "Hastaneler": "Больницы",
      "Hakkımızda": "О нас",
      "Sıkça Sorulan Sorular": "Частые вопросы",
      "Çıkış için giriş yap": "Войдите, чтобы выйти",
      "Kayıtlı oturum yok. Önce kayıt ol.": "Нет активной сессии. Сначала зарегистрируйтесь.",
      "Kayıt ol penceresi yakında burada açılacak.": "Окно регистрации скоро будет доступно здесь.",
      "Ad soyad en az 2 karakter olmalı.": "Имя и фамилия должны быть не короче 2 символов.",
      "Geçerli bir e-posta gir.": "Введите корректный e-mail.",
      "Bu e-posta başka bir hesapta kayıtlı.": "Этот e-mail уже используется в другом аккаунте.",
      "Hesap bilgileri kaydedildi.": "Данные аккаунта сохранены.",
      "E-posta adresin doğrulandı.": "Ваш адрес электронной почты подтвержден.",
      "Hesap güvenliği doğrulanamadı. Lütfen çıkış yapıp yeniden giriş yap.":
        "Безопасность аккаунта не подтверждена. Выйдите и войдите снова.",
      "Lütfen ad, e-posta, konu ve mesaj alanlarını doldur.": "Заполните поля: имя, e-mail, тема и сообщение.",
      "Mesajın seçilen konuya göre hazırlandı.": "Сообщение подготовлено по выбранной теме.",
      "Konu": "Тема",
      "Genel Konular": "Общие вопросы",
      "İş Birliği": "Сотрудничество",
      "İçerik Düzeltmeleri": "Исправления контента",
      "Alan kodu": "Код зоны",
      "Telefon numarası": "Номер телефона",
      "Mesaj": "Сообщение",
      "En çok sorulan temel konuları kısa cevaplarla burada topladık.": "Здесь мы собрали самые частые вопросы с краткими ответами.",
      "Nasıl arama yaparım?": "Как выполнить поиск?",
      "Üst arama alanından doğrudan mekan adı yazabilir ya da anasayfadan kategori seçebilirsin.":
        "Вы можете ввести название места в верхней строке поиска или выбрать категорию на главной.",
      "Bilgi yanlışsa ne yapmalıyım?": "Что делать, если информация неверная?",
      "Geribildirim sekmesinden kısa bir not bırakabilir ya da iletişim sayfasından bize yazabilirsin.":
        "Оставьте короткую заметку во вкладке обратной связи или напишите нам через страницу контактов.",
      "Hesap şart mı?": "Нужен ли аккаунт?",
      "Temel gezinme için hesap gerekmez. Kayıtlı kullanıcı ayarları için hesap alanını kullanabilirsin.":
        "Для обычного просмотра аккаунт не нужен. Для сохраненных настроек используйте раздел аккаунта.",
      "Aramabul uygulamasının yaklaşımını ve çalışma mantığını burada bulabilirsin.":
        "Здесь вы найдете подход Aramabul и принцип его работы.",
      "Aramabul, kullanıcının bir yeri ararken, en kısa yoldan ve net bilgi bulmasını amaçlayan sade tasarımlı bir yardımcıdır.":
        "Aramabul — это простой сервис, помогающий быстро находить точную информацию о местах.",
      "Neden var?": "Зачем это нужно?",
      "İnsanlar çoğu zaman bir yerin adını değil, ihtiyacını bilir. Biz de aramayı ihtiyaçtan başlatıyoruz.":
        "Чаще всего люди знают свою потребность, а не название места. Поэтому поиск начинается с потребности.",
      "Amaç, gereksiz kalabalığı ve çabayı azaltarak, ihtiyaç duyduğunuz hizmet ve ürüne daha hızlı ulaşmanızı sağlamak.":
        "Наша цель — уменьшить лишнюю сложность и помочь быстрее найти нужную услугу или товар.",
      "Nasıl çalışır?": "Как это работает?",
      "Kategori, şehir ve ilçe katmanları sırasıyla, önce alt kategoriler, son olarak da hizmet mekanları seçenekleri ile sizi buluşturuyoruz.":
        "Мы ведем вас по уровням: категория, город, район, затем подкатегории и варианты мест услуг.",
      "Bilgiyi kutu yapısında sunarak, kullanıcıyı uzun sayfalarda dolaştırmadan net karar alanına ulaştırıyoruz. İhtiyaç duyduğunuz hizmeti alacağınız mekanı, tüm ulaşım ve iletişim bilgileri ile, en kullanıcı dostu biçimde görmenizi sağlıyoruz.":
        "Мы показываем информацию в карточках, чтобы вы быстрее приняли решение без длинной прокрутки. Вы видите подходящее место со всеми контактами и данными проездa в удобном формате.",
      "Temel yaklaşımımız": "Наш основной подход",
      "Basit arayüz": "Простой интерфейс",
      "Açık bilgi": "Понятная информация",
      "Hızlı ve ayrıntılı yönlendirme": "Быстрое и подробное направление",
      "Konum": "Местоположение",
      "Tüm ilçeler": "Все районы",
      "Mahalle": "Квартал",
      "Önce ilçe seç": "Сначала выберите район",
      "Kategori": "Категория",
      "Tüm kategoriler": "Все категории",
      "Bütçe": "Бюджет",
      "Tüm bütçeler": "Все бюджеты",
      "Mekan ara": "Искать место",
      "Ne bulmamı istersin?": "Что вы хотите найти?",
      "Bul": "Найти",
      "Yakındaki mekanlar": "Ближайшие места",
      "mekan listeleniyor": "мест в списке",
      "mekan yakında bulundu": "мест поблизости",
      "Bu filtrelerle mekan bulunamadı.": "Мест с такими фильтрами не найдено.",
      "Konum seç": "Выбрать место",
      "Mahalle seç": "Выбрать квартал",
      "Kategori seç": "Выбрать категорию",
      "Bütçe seç": "Выбрать бюджет",
    },
    DE: {
      "Anasayfa": "Startseite",
      "Ayarlar": "Einstellungen",
      "Dil Ayarları": "Spracheinstellungen",
      "Dil seçenekleri": "Sprachoptionen",
      "Dil seç": "Sprache wählen",
      "Uygulama metinleri bu seçime göre güncellenir.": "Die App-Texte werden nach dieser Auswahl aktualisiert.",
      "Hesap": "Konto",
      "Diller": "Sprachen",
      "Geribildirim": "Feedback",
      "Mesajını konu seçerek hızlıca iletebilirsin.": "Du kannst deine Nachricht schnell senden, indem du ein Thema auswählst.",
      "Yardım": "Hilfe",
      "Hakkında": "Info",
      "Çıkış yap": "Abmelden",
      "Misafir": "Gast",
      "Kayıt ol": "Registrieren",
      "Hesabını oluştur ve ayarlarını kaydet.": "Erstelle dein Konto und speichere deine Einstellungen.",
      "Ad Soyad": "Vollständiger Name",
      "E-posta": "E-Mail",
      "Şifre": "Passwort",
      "Şifre tekrar": "Passwort wiederholen",
      "Hesap bilgileri": "Kontodaten",
      "Adını ve e-postanı burada güncelleyebilirsin.": "Hier kannst du deinen Namen und deine E-Mail aktualisieren.",
      "Kaydet": "Speichern",
      "Gönder": "Senden",
      "Ne Nerede?": "Was und wo?",
      "Yemek": "Essen",
      "Kafe": "Café",
      "Kuaför": "Friseur",
      "Veteriner": "Tierarzt",
      "Eczane": "Apotheke",
      "Market": "Markt",
      "Akaryakıt": "Kraftstoff",
      "Hastane": "Krankenhaus",
      "Banka": "Bank",
      "Otel": "Hotel",
      "Kargo Şubeleri": "Filialen",
      "Noter": "Notar",
      "Aile Sağlığı Merkezi": "Familiengesundheitszentrum",
      "Diş Klinikleri": "Zahnkliniken",
      "Duraklar": "Haltestellen",
      "Otopark": "Parkplatz",
      "Yeme-İçme": "Essen & Trinken",
      "Gezi": "Reise",
      "Hizmetler": "Dienstleistungen",
      "Sağlık": "Gesundheit",
      "Kültür": "Kultur",
      "Sanat": "Kunst",
      "Opera ve Bale": "Oper und Ballett",
      "Devlet Tiyatroları": "Staatstheater",
      "Şehir Tiyatroları": "Stadttheater",
      "Özel Tiyatrolar": "Private Theater",
      "Müzeler": "Museen",
      "Mağaralar": "Höhlen",
      "Ören yerleri": "Ausgrabungsstätten",
      "Camiler": "Moscheen",
      "Tarihi Camiler": "Historische Moscheen",
      "Şelaleler": "Wasserfälle",
      "Galeriler": "Galerien",
      "Yeme-İçme alt kategorileri": "Unterkategorien für Essen & Trinken",
      "Kültür alt kategorileri": "Kultur-Unterkategorien",
      "Kültür Mekanları": "Kulturorte",
      "Sanat alt kategorileri": "Kunst-Unterkategorien",
      "Sanat Mekanları": "Kunstorte",
      "Meyhane": "Taverne",
      "Meyhaneler": "Tavernen",
      "Ocakbaşı": "Grillhaus",
      "Ev Yemekleri": "Hausmannskost",
      "Çorba": "Suppe",
      "Lahmacun": "Lahmacun",
      "Pide": "Pide",
      "Köfte": "Köfte",
      "Çiğ Köfte": "Cig Köfte",
      "Mantı": "Manti",
      "Deniz Ürünleri": "Meeresfrüchte",
      "Sokak Lezzetleri": "Streetfood",
      "Dondurma": "Eis",
      "Tatlı": "Desserts",
      "Kahvaltı": "Frühstück",
      "Vegan": "Vegan",
      "Vejetaryen": "Vegetarisch",
      "Glutensiz": "Glutenfrei",
      "Asya": "Asien",
      "Asya Mutfağı": "Asien",
      "İtalyan": "Italienisch",
      "Mangal": "Grill",
      "Noodle": "Nudeln",
      "Tost": "Toast",
      "Döner": "Döner",
      "Kebap": "Kebab",
      "Börek": "Börek",
      "Restoranlar": "Restaurants",
      "Lokantalar": "Lokale",
      "Kahvaltı Mekanları": "Frühstücksorte",
      "Kebapçılar": "Kebab-Restaurants",
      "Kafeler": "Cafés",
      "Dönerciler": "Döner-Läden",
      "Pide ve Lahmacun": "Pide und Lahmacun",
      "Çiğ Köfteciler": "Cig-Köfte-Läden",
      "Pub&Bar": "Pubs und Bars",
      "Kuaförler": "Friseure",
      "Veterinerler": "Tierärzte",
      "Eczaneler": "Apotheken",
      "Nöbetçi Eczaneler": "Notdienst-Apotheken",
      "Akaryakıt İstasyonları": "Tankstellen",
      "Kamp Alanları": "Campingplätze",
      "Pansiyonlar": "Pensionen",
      "Mekan Türleri": "Ortstypen",
      "Hizmet Türleri": "Dienstleistungstypen",
      "Sağlık Türleri": "Gesundheitstypen",
      "Gezi Türleri": "Reisetypen",
      "ATM / Bankamatik": "Geldautomat",
      "Otobüs / Metro / Tramvay Durakları": "Bus- / Metro- / Tramhaltestellen",
      "Yer ekle": "Ort hinzufügen",
      "İletişim": "Kontakt",
      "Çerez Politikası": "Cookie-Richtlinie",
      "Kullanım Koşulları": "Nutzungsbedingungen",
      "Kişisel Verilerin Korunması": "Datenschutz personenbezogener Daten",
      "Gizlilik Politikası": "Datenschutzrichtlinie",
      "Kurumsal": "Unternehmen",
      "Keşfet": "Entdecken",
      "Yardım mı lazım?": "Brauchst du Hilfe?",
      "İl": "Provinz",
      "İli": "Provinz",
      "İlçe": "Bezirk",
      "İlçesi": "Bezirk",
      "İlçeler": "Bezirke",
      "İller": "Provinzen",
      "Mekan": "Ort",
      "Mekanlar": "Orte",
      "İlçe Mekanları": "Orte im Bezirk",
      "Yakındaki {title}": "{title} in deiner Nähe",
      "Konumunu kullanmama izin ver, sana en yakın {title} listeleyeyim.":
        "Erlaube den Standortzugriff, dann liste ich dir die nächstgelegenen {title}.",
      "Listele": "Auflisten",
      "Konum alınıyor...": "Standort wird abgerufen...",
      "Listelenecek mekan bulunmamıştır.": "Keine Orte zum Anzeigen gefunden.",
      "Liste penceresi açılamadı.": "Das Listenfenster konnte nicht geöffnet werden.",
      "{location} çevresine göre sıralandı": "Nach Umgebung von {location} sortiert",
      "Konumuna göre sıralandı": "Nach deinem Standort sortiert",
      "Konum bulunamadı.": "Standort konnte nicht ermittelt werden.",
      "Haritada Önizle": "Auf Karte ansehen",
      "Yakındaki Öneriler": "Empfehlungen in der Nähe",
      "Yakındaki Mekanlar": "Orte in der Nähe",
      "Yakındaki mekanlar penceresini kapat": "Fenster mit Orten in der Nähe schließen",
      "Kapat": "Schließen",
      "Tarayıcı konum özelliği desteklenmiyor.": "Die Standortfunktion des Browsers wird nicht unterstützt.",
      "Konum izni kapalı. Tarayıcıdan izin verip tekrar dene.": "Standortzugriff ist deaktiviert. Erlaube ihn im Browser und versuche es erneut.",
      "Konum alınamadı. Bağlantını kontrol edip tekrar dene.": "Standort konnte nicht abgerufen werden. Prüfe die Verbindung und versuche es erneut.",
      "Konum bilgisi alınamadı.": "Standortdaten konnten nicht abgerufen werden.",
      "Türler": "Typen",
      "Şarj İstasyonları": "Ladestationen",
      "Otoparklar": "Parkplätze",
      "Diğer Ulaşım Noktaları": "Weitere Verkehrspunkte",
      "Aile Sağlığı Merkezleri": "Familiengesundheitszentren",
      "Hastaneler": "Krankenhäuser",
      "Hakkımızda": "Über uns",
      "Sıkça Sorulan Sorular": "FAQ",
      "Çıkış için giriş yap": "Zum Abmelden bitte anmelden",
      "Kayıtlı oturum yok. Önce kayıt ol.": "Keine aktive Sitzung. Bitte zuerst registrieren.",
      "Kayıt ol penceresi yakında burada açılacak.": "Das Registrierungsfenster wird hier bald verfügbar sein.",
      "Ad soyad en az 2 karakter olmalı.": "Der vollständige Name muss mindestens 2 Zeichen haben.",
      "Geçerli bir e-posta gir.": "Bitte gib eine gültige E-Mail ein.",
      "Bu e-posta başka bir hesapta kayıtlı.": "Diese E-Mail wird bereits von einem anderen Konto verwendet.",
      "Hesap bilgileri kaydedildi.": "Kontodaten gespeichert.",
      "E-posta adresin doğrulandı.": "Deine E-Mail-Adresse wurde bestätigt.",
      "Hesap güvenliği doğrulanamadı. Lütfen çıkış yapıp yeniden giriş yap.":
        "Kontosicherheit konnte nicht bestätigt werden. Bitte abmelden und erneut anmelden.",
      "Lütfen ad, e-posta, konu ve mesaj alanlarını doldur.": "Bitte fülle Name, E-Mail, Betreff und Nachricht aus.",
      "Mesajın seçilen konuya göre hazırlandı.": "Deine Nachricht wurde für das gewählte Thema vorbereitet.",
      "Konu": "Betreff",
      "Genel Konular": "Allgemeine Themen",
      "İş Birliği": "Zusammenarbeit",
      "İçerik Düzeltmeleri": "Inhaltskorrekturen",
      "Alan kodu": "Vorwahl",
      "Telefon numarası": "Telefonnummer",
      "Mesaj": "Nachricht",
      "En çok sorulan temel konuları kısa cevaplarla burada topladık.": "Hier haben wir die häufigsten Fragen mit kurzen Antworten gesammelt.",
      "Nasıl arama yaparım?": "Wie suche ich?",
      "Üst arama alanından doğrudan mekan adı yazabilir ya da anasayfadan kategori seçebilirsin.":
        "Du kannst den Ort direkt im oberen Suchfeld eingeben oder auf der Startseite eine Kategorie wählen.",
      "Bilgi yanlışsa ne yapmalıyım?": "Was soll ich tun, wenn Informationen falsch sind?",
      "Geribildirim sekmesinden kısa bir not bırakabilir ya da iletişim sayfasından bize yazabilirsin.":
        "Du kannst im Feedback-Tab eine kurze Notiz hinterlassen oder uns über die Kontaktseite schreiben.",
      "Hesap şart mı?": "Ist ein Konto erforderlich?",
      "Temel gezinme için hesap gerekmez. Kayıtlı kullanıcı ayarları için hesap alanını kullanabilirsin.":
        "Für die normale Nutzung ist kein Konto nötig. Für gespeicherte Einstellungen kannst du den Kontobereich nutzen.",
      "Aramabul uygulamasının yaklaşımını ve çalışma mantığını burada bulabilirsin.":
        "Hier findest du den Ansatz und die Funktionsweise von Aramabul.",
      "Aramabul, kullanıcının bir yeri ararken, en kısa yoldan ve net bilgi bulmasını amaçlayan sade tasarımlı bir yardımcıdır.":
        "Aramabul ist ein einfaches Tool, das dir hilft, beim Suchen eines Ortes schnell klare Informationen zu finden.",
      "Neden var?": "Warum gibt es das?",
      "İnsanlar çoğu zaman bir yerin adını değil, ihtiyacını bilir. Biz de aramayı ihtiyaçtan başlatıyoruz.":
        "Menschen kennen oft ihr Bedürfnis, aber nicht den Ortsnamen. Deshalb starten wir die Suche beim Bedarf.",
      "Amaç, gereksiz kalabalığı ve çabayı azaltarak, ihtiyaç duyduğunuz hizmet ve ürüne daha hızlı ulaşmanızı sağlamak.":
        "Ziel ist es, unnötige Komplexität zu reduzieren und dich schneller zum passenden Service oder Produkt zu führen.",
      "Nasıl çalışır?": "Wie funktioniert es?",
      "Kategori, şehir ve ilçe katmanları sırasıyla, önce alt kategoriler, son olarak da hizmet mekanları seçenekleri ile sizi buluşturuyoruz.":
        "Wir führen dich durch Kategorien, Stadt und Bezirk, dann zu Unterkategorien und passenden Service-Orten.",
      "Bilgiyi kutu yapısında sunarak, kullanıcıyı uzun sayfalarda dolaştırmadan net karar alanına ulaştırıyoruz. İhtiyaç duyduğunuz hizmeti alacağınız mekanı, tüm ulaşım ve iletişim bilgileri ile, en kullanıcı dostu biçimde görmenizi sağlıyoruz.":
        "Wir zeigen Informationen in Karten, damit du ohne lange Seiten schneller entscheiden kannst. So siehst du den passenden Ort mit allen Kontakt- und Wegdaten in nutzerfreundlicher Form.",
      "Temel yaklaşımımız": "Unser Kernansatz",
      "Basit arayüz": "Einfache Oberfläche",
      "Açık bilgi": "Klare Informationen",
      "Hızlı ve ayrıntılı yönlendirme": "Schnelle und detaillierte Navigation",
      "Konum": "Standort",
      "Tüm ilçeler": "Alle Bezirke",
      "Mahalle": "Viertel",
      "Önce ilçe seç": "Zuerst Bezirk wählen",
      "Kategori": "Kategorie",
      "Tüm kategoriler": "Alle Kategorien",
      "Bütçe": "Budget",
      "Tüm bütçeler": "Alle Budgets",
      "Mekan ara": "Ort suchen",
      "Ne bulmamı istersin?": "Was möchtest du finden?",
      "Bul": "Finden",
      "Yakındaki mekanlar": "Orte in der Nähe",
      "mekan listeleniyor": "Orte aufgelistet",
      "mekan yakında bulundu": "Orte in der Nähe gefunden",
      "Bu filtrelerle mekan bulunamadı.": "Mit diesen Filtern wurden keine Orte gefunden.",
      "Konum seç": "Standort wählen",
      "Mahalle seç": "Viertel wählen",
      "Kategori seç": "Kategorie wählen",
      "Bütçe seç": "Budget wählen",
    },
    ZH: {
      "Anasayfa": "首页",
      "Ayarlar": "设置",
      "Dil Ayarları": "语言设置",
      "Dil seçenekleri": "语言选项",
      "Dil seç": "选择语言",
      "Uygulama metinleri bu seçime göre güncellenir.": "应用文本会根据该选择更新。",
      "Hesap": "账户",
      "Diller": "语言",
      "Geribildirim": "反馈",
      "Mesajını konu seçerek hızlıca iletebilirsin.": "你可以通过选择主题快速发送消息。",
      "Yardım": "帮助",
      "Hakkında": "关于",
      "Çıkış yap": "退出",
      "Misafir": "访客",
      "Kayıt ol": "注册",
      "Hesabını oluştur ve ayarlarını kaydet.": "创建账户并保存设置。",
      "Ad Soyad": "姓名",
      "E-posta": "电子邮件",
      "Şifre": "密码",
      "Şifre tekrar": "再次输入密码",
      "Hesap bilgileri": "账户信息",
      "Adını ve e-postanı burada güncelleyebilirsin.": "你可以在这里更新姓名和邮箱。",
      "Kaydet": "保存",
      "Gönder": "发送",
      "Ne Nerede?": "找什么？在哪里？",
      "Yemek": "美食",
      "Kafe": "咖啡馆",
      "Kuaför": "理发店",
      "Veteriner": "兽医",
      "Eczane": "药房",
      "Market": "超市",
      "Akaryakıt": "加油站",
      "Hastane": "医院",
      "Banka": "银行",
      "Otel": "酒店",
      "Kargo Şubeleri": "快递网点",
      "Noter": "公证处",
      "Aile Sağlığı Merkezi": "家庭健康中心",
      "Diş Klinikleri": "牙科诊所",
      "Duraklar": "站点",
      "Otopark": "停车场",
      "Yeme-İçme": "餐饮",
      "Gezi": "出行",
      "Hizmetler": "服务",
      "Sağlık": "健康",
      "Kültür": "文化",
      "Sanat": "艺术",
      "Opera ve Bale": "歌剧与芭蕾",
      "Devlet Tiyatroları": "国家剧院",
      "Şehir Tiyatroları": "城市剧院",
      "Özel Tiyatrolar": "私营剧院",
      "Müzeler": "博物馆",
      "Mağaralar": "洞穴",
      "Ören yerleri": "考古遗址",
      "Camiler": "清真寺",
      "Tarihi Camiler": "历史清真寺",
      "Şelaleler": "瀑布",
      "Galeriler": "画廊",
      "Yeme-İçme alt kategorileri": "餐饮子分类",
      "Kültür alt kategorileri": "文化子分类",
      "Kültür Mekanları": "文化场馆",
      "Sanat alt kategorileri": "艺术子分类",
      "Sanat Mekanları": "艺术场馆",
      "Meyhane": "小酒馆",
      "Meyhaneler": "小酒馆",
      "Ocakbaşı": "炭火餐馆",
      "Ev Yemekleri": "家常菜",
      "Çorba": "汤品",
      "Lahmacun": "土耳其薄饼",
      "Pide": "皮德饼",
      "Köfte": "肉丸",
      "Çiğ Köfte": "生科夫特",
      "Mantı": "土耳其饺子",
      "Deniz Ürünleri": "海鲜",
      "Sokak Lezzetleri": "街头美食",
      "Dondurma": "冰淇淋",
      "Tatlı": "甜点",
      "Kahvaltı": "早餐",
      "Vegan": "纯素",
      "Vejetaryen": "素食",
      "Glutensiz": "无麸质",
      "Asya": "亚洲",
      "Asya Mutfağı": "亚洲",
      "İtalyan": "意大利菜",
      "Mangal": "烧烤",
      "Noodle": "面食",
      "Tost": "吐司",
      "Döner": "旋转烤肉",
      "Kebap": "烤肉",
      "Börek": "博雷克",
      "Restoranlar": "餐厅",
      "Lokantalar": "食堂",
      "Kahvaltı Mekanları": "早餐店",
      "Kebapçılar": "烤肉店",
      "Kafeler": "咖啡馆",
      "Dönerciler": "旋转烤肉店",
      "Pide ve Lahmacun": "皮德和土耳其薄饼",
      "Çiğ Köfteciler": "生科夫特店",
      "Pub&Bar": "酒吧",
      "Kuaförler": "理发店",
      "Veterinerler": "兽医",
      "Eczaneler": "药房",
      "Nöbetçi Eczaneler": "值班药房",
      "Akaryakıt İstasyonları": "加油站",
      "Kamp Alanları": "露营地",
      "Pansiyonlar": "旅馆民宿",
      "Mekan Türleri": "地点类型",
      "Hizmet Türleri": "服务类型",
      "Sağlık Türleri": "健康类型",
      "Gezi Türleri": "出行类型",
      "ATM / Bankamatik": "自动取款机",
      "Otobüs / Metro / Tramvay Durakları": "公交 / 地铁 / 电车站",
      "Yer ekle": "添加地点",
      "İletişim": "联系",
      "Çerez Politikası": "Cookie 政策",
      "Kullanım Koşulları": "使用条款",
      "Kişisel Verilerin Korunması": "个人数据保护",
      "Gizlilik Politikası": "隐私政策",
      "Kurumsal": "企业",
      "Keşfet": "探索",
      "Yardım mı lazım?": "需要帮助吗？",
      "İl": "省",
      "İli": "省",
      "İlçe": "区",
      "İlçesi": "区",
      "İlçeler": "区列表",
      "İller": "省列表",
      "Mekan": "地点",
      "Mekanlar": "地点",
      "İlçe Mekanları": "区内地点",
      "Yakındaki {title}": "你附近的{title}",
      "Konumunu kullanmama izin ver, sana en yakın {title} listeleyeyim.":
        "请允许使用你的位置，我来为你列出最近的{title}。",
      "Listele": "列出",
      "Konum alınıyor...": "正在获取位置...",
      "Listelenecek mekan bulunmamıştır.": "未找到可列出的地点。",
      "Liste penceresi açılamadı.": "无法打开列表窗口。",
      "{location} çevresine göre sıralandı": "已按 {location} 周边排序",
      "Konumuna göre sıralandı": "已按你的位置排序",
      "Konum bulunamadı.": "未找到位置信息。",
      "Haritada Önizle": "地图预览",
      "Yakındaki Öneriler": "附近推荐",
      "Yakındaki Mekanlar": "附近地点",
      "Yakındaki mekanlar penceresini kapat": "关闭附近地点窗口",
      "Kapat": "关闭",
      "Tarayıcı konum özelliği desteklenmiyor.": "当前浏览器不支持定位功能。",
      "Konum izni kapalı. Tarayıcıdan izin verip tekrar dene.": "定位权限已关闭。请在浏览器中允许后重试。",
      "Konum alınamadı. Bağlantını kontrol edip tekrar dene.": "无法获取位置。请检查网络后重试。",
      "Konum bilgisi alınamadı.": "无法获取位置信息。",
      "Türler": "类型",
      "Şarj İstasyonları": "充电站",
      "Otoparklar": "停车场",
      "Diğer Ulaşım Noktaları": "其他出行点",
      "Aile Sağlığı Merkezleri": "家庭健康中心",
      "Hastaneler": "医院",
      "Hakkımızda": "关于我们",
      "Sıkça Sorulan Sorular": "常见问题",
      "Çıkış için giriş yap": "请先登录再退出",
      "Kayıtlı oturum yok. Önce kayıt ol.": "没有已登录会话。请先注册。",
      "Kayıt ol penceresi yakında burada açılacak.": "注册窗口很快会在这里提供。",
      "Ad soyad en az 2 karakter olmalı.": "姓名至少需要 2 个字符。",
      "Geçerli bir e-posta gir.": "请输入有效邮箱。",
      "Bu e-posta başka bir hesapta kayıtlı.": "该邮箱已被其他账号使用。",
      "Hesap bilgileri kaydedildi.": "账户信息已保存。",
      "E-posta adresin doğrulandı.": "你的电子邮件地址已验证。",
      "Hesap güvenliği doğrulanamadı. Lütfen çıkış yapıp yeniden giriş yap.":
        "无法验证账户安全。请退出后重新登录。",
      "Lütfen ad, e-posta, konu ve mesaj alanlarını doldur.": "请填写姓名、邮箱、主题和消息。",
      "Mesajın seçilen konuya göre hazırlandı.": "你的消息已按所选主题准备好。",
      "Konu": "主题",
      "Genel Konular": "一般问题",
      "İş Birliği": "合作",
      "İçerik Düzeltmeleri": "内容修正",
      "Alan kodu": "区号",
      "Telefon numarası": "电话号码",
      "Mesaj": "消息",
      "En çok sorulan temel konuları kısa cevaplarla burada topladık.": "这里汇总了最常见问题并提供简短回答。",
      "Nasıl arama yaparım?": "如何搜索？",
      "Üst arama alanından doğrudan mekan adı yazabilir ya da anasayfadan kategori seçebilirsin.":
        "你可以在顶部搜索框直接输入地点名称，或在首页选择分类。",
      "Bilgi yanlışsa ne yapmalıyım?": "如果信息有误怎么办？",
      "Geribildirim sekmesinden kısa bir not bırakabilir ya da iletişim sayfasından bize yazabilirsin.":
        "你可以在反馈标签留下简短说明，或通过联系页面给我们留言。",
      "Hesap şart mı?": "必须要账号吗？",
      "Temel gezinme için hesap gerekmez. Kayıtlı kullanıcı ayarları için hesap alanını kullanabilirsin.":
        "基础浏览不需要账号。若要使用已保存设置，请使用账号区域。",
      "Aramabul uygulamasının yaklaşımını ve çalışma mantığını burada bulabilirsin.":
        "你可以在这里了解 Aramabul 的理念和工作方式。",
      "Aramabul, kullanıcının bir yeri ararken, en kısa yoldan ve net bilgi bulmasını amaçlayan sade tasarımlı bir yardımcıdır.":
        "Aramabul 是一个简洁的助手，帮助用户在找地点时快速获得清晰信息。",
      "Neden var?": "为什么存在？",
      "İnsanlar çoğu zaman bir yerin adını değil, ihtiyacını bilir. Biz de aramayı ihtiyaçtan başlatıyoruz.":
        "很多时候人们知道的是需求，而不是地点名称。因此我们从需求开始搜索。",
      "Amaç, gereksiz kalabalığı ve çabayı azaltarak, ihtiyaç duyduğunuz hizmet ve ürüne daha hızlı ulaşmanızı sağlamak.":
        "目标是减少不必要的复杂和操作，让你更快找到所需服务和产品。",
      "Nasıl çalışır?": "如何运作？",
      "Kategori, şehir ve ilçe katmanları sırasıyla, önce alt kategoriler, son olarak da hizmet mekanları seçenekleri ile sizi buluşturuyoruz.":
        "我们按分类、城市、区县逐层引导，再提供子分类和服务地点选项。",
      "Bilgiyi kutu yapısında sunarak, kullanıcıyı uzun sayfalarda dolaştırmadan net karar alanına ulaştırıyoruz. İhtiyaç duyduğunuz hizmeti alacağınız mekanı, tüm ulaşım ve iletişim bilgileri ile, en kullanıcı dostu biçimde görmenizi sağlıyoruz.":
        "我们用卡片方式展示信息，避免在长页面中反复查找，帮助你更快做决定。你能以友好方式查看目标地点及完整交通和联系方式。",
      "Temel yaklaşımımız": "我们的核心方法",
      "Basit arayüz": "简洁界面",
      "Açık bilgi": "清晰信息",
      "Hızlı ve ayrıntılı yönlendirme": "快速且详细的引导",
      "Konum": "位置",
      "Tüm ilçeler": "所有区县",
      "Mahalle": "街区",
      "Önce ilçe seç": "先选择区县",
      "Kategori": "分类",
      "Tüm kategoriler": "所有分类",
      "Bütçe": "预算",
      "Tüm bütçeler": "所有预算",
      "Mekan ara": "搜索地点",
      "Ne bulmamı istersin?": "你想找什么？",
      "Bul": "搜索",
      "Yakındaki mekanlar": "附近地点",
      "mekan listeleniyor": "个地点已列出",
      "mekan yakında bulundu": "个附近地点",
      "Bu filtrelerle mekan bulunamadı.": "使用这些筛选条件未找到地点。",
      "Konum seç": "选择位置",
      "Mahalle seç": "选择街区",
      "Kategori seç": "选择分类",
      "Bütçe seç": "选择预算",
    },
  };

  // ── Sayfa bazlı uzun metin çevirileri (data-i18n-key ile eşleşir) ──
  const PAGE_TRANSLATIONS = {
    EN: {
      // index.html
      "home.hero.title": "Everything you're looking for in Istanbul is here!",
      "home.hero.p1": "Aramabul helps users quickly find places in their desired category by selecting \"Nearby Places\" or by choosing district and neighborhood information.",
      "home.hero.p2": "Categories are organized under food & drink, travel, services, health, culture, and art. Place lists are filtered by need to speed up decision making and presented in a simple, user-friendly way.",
      "home.hero.p3": "It shows detailed information such as address, phone, website and Instagram page (if available), map location, Google user ratings and the latest reviews.",
      // yeme-icme.html
      "yemeicme.hero.p1": "The Food & Drink section helps users who are looking for a pleasant venue or a meeting place quickly find the right spot by selecting \"Nearby Places\" or entering district and neighborhood information.",
      "yemeicme.hero.p2": "Place lists are filtered by need to speed up decision making and presented in a simple, user-friendly way.",
      "yemeicme.hero.p3": "It shows detailed information such as address, phone, website and Instagram page (if available), and map location.",
      // gezi.html
      "gezi.hero.p1": "The Travel section helps users looking for accommodation and places to visit quickly find what they need by entering district and neighborhood information.",
      "gezi.hero.p2": "Place lists are filtered by need to speed up decision making and presented in a simple, user-friendly way.",
      "gezi.hero.p3": "It shows detailed information such as address, phone, website and Instagram page (if available), and map location.",
      // hizmetler.html
      "hizmetler.hero.p1": "The Services section helps users quickly find businesses they need in their daily lives by selecting \"Nearby Places\" or entering district and neighborhood information.",
      "hizmetler.hero.p2": "Place lists are filtered by need to speed up decision making and presented in a simple, user-friendly way.",
      "hizmetler.hero.p3": "It shows detailed information such as address, phone, website and Instagram page (if available), and map location.",
      // saglik.html
      "saglik.hero.p1": "The Health section helps users quickly find healthcare businesses they need by selecting \"Nearby Places\" or entering district and neighborhood information.",
      "saglik.hero.p2": "Place lists are filtered by need to speed up decision making and presented in a simple, user-friendly way.",
      "saglik.hero.p3": "It shows detailed information such as address, phone, website and Instagram page (if available), and map location.",
      // kultur.html
      "kultur.hero.p1": "The Culture section helps users quickly find museums, archaeological sites, historic mosques, and similar public cultural points by selecting \"Nearby Places\" or entering district and neighborhood information.",
      "kultur.hero.p2": "Place lists are filtered by need to speed up decision making and presented in a simple, user-friendly way.",
      // sanat.html
      "sanat.hero.p1": "The Art section helps users who want to explore event-oriented venues like theaters and galleries quickly find what they need by selecting \"Nearby Places\" or choosing a district.",
      "sanat.hero.p2": "Place lists are filtered by need to speed up decision making and presented in a simple, user-friendly way.",
      "sanat.hero.p3": "It shows detailed information such as address, phone, website and Instagram page (if available), and map location.",
      // venue-detail.html
      "venue.loading": "Loading place information.",
      "venue.search": "Search in Food & Drink",
      "venue.back": "Back to list",
      "venue.phone": "Phone",
      "venue.website": "Website",
      "venue.instagram": "Instagram",
      "venue.menu": "Menu",
      "venue.services": "Services",
      "venue.atmosphere": "Atmosphere",
      "venue.map": "Map and links",
      "venue.writeReview": "Write a review",
      "venue.yourReview": "Your review",
      "venue.submitReview": "Submit review",
      "venue.reviews": "Reviews",
      "venue.yourName": "Your name (optional)",
      // Shared
      "shared.placesLoading": "Loading places",
      "shared.save": "Save",
      "shared.share": "Share",
      // about-settings.html
      "about.title": "About",
      "about.intro": "Aramabul is a simply designed helper that aims to help users find clear information in the shortest way when searching for a place.",
      "about.why": "Why does it exist?",
      "about.why.p1": "People often know their need, not the name of the place. So we start the search from the need.",
      "about.why.p2": "The goal is to reduce unnecessary clutter and effort, helping you reach the service or product you need faster.",
      "about.how": "How does it work?",
      "about.how.p1": "Aramabul helps users quickly reach places in the category they need, by entering the district and neighborhood they want.",
      "about.how.p2": "Categories are organized under food & drink, travel, services, health, culture, and art. Place lists are filtered by need to speed up decision making and presented in a simple, user-friendly way.",
      "about.how.p3": "It shows detailed information such as address, phone, website and Instagram page (if available), map location, Google user ratings and the latest three reviews.",
      "about.approach": "Our core approach",
      "about.approach.simple": "Simple interface",
      "about.approach.clear": "Clear information",
      "about.approach.fast": "Fast and detailed navigation",
    },
    DE: {
      "home.hero.title": "Alles, was du in Istanbul suchst, ist hier!",
      "home.hero.p1": "Aramabul hilft dir, Orte in der gewünschten Kategorie schnell zu finden — über 'Orte in der Nähe' oder durch Auswahl von Bezirk und Stadtviertel.",
      "home.hero.p2": "Die Kategorien sind in Essen & Trinken, Reise, Dienstleistungen, Gesundheit, Kultur und Kunst unterteilt. Ortslisten werden nach Bedarf gefiltert und übersichtlich dargestellt.",
      "home.hero.p3": "Es zeigt detaillierte Informationen wie Adresse, Telefon, Website und Instagram-Seite (falls vorhanden), Kartenstandort, Google-Bewertungen und aktuelle Rezensionen.",
      "yemeicme.hero.p1": "Der Bereich Essen & Trinken hilft dir, schnell den richtigen Ort zu finden — über 'Orte in der Nähe' oder durch Eingabe von Bezirk und Stadtviertel.",
      "yemeicme.hero.p2": "Ortslisten werden nach Bedarf gefiltert und übersichtlich dargestellt.",
      "yemeicme.hero.p3": "Es zeigt detaillierte Informationen wie Adresse, Telefon, Website und Instagram-Seite (falls vorhanden) sowie den Kartenstandort.",
      "gezi.hero.p1": "Der Bereich Reise hilft dir, schnell Unterkünfte und Sehenswürdigkeiten zu finden, indem du Bezirk und Stadtviertel eingibst.",
      "gezi.hero.p2": "Ortslisten werden nach Bedarf gefiltert und übersichtlich dargestellt.",
      "gezi.hero.p3": "Es zeigt detaillierte Informationen wie Adresse, Telefon, Website und Instagram-Seite (falls vorhanden) sowie den Kartenstandort.",
      "hizmetler.hero.p1": "Der Bereich Dienstleistungen hilft dir, schnell Geschäfte für den Alltag zu finden — über 'Orte in der Nähe' oder durch Eingabe von Bezirk und Stadtviertel.",
      "hizmetler.hero.p2": "Ortslisten werden nach Bedarf gefiltert und übersichtlich dargestellt.",
      "hizmetler.hero.p3": "Es zeigt detaillierte Informationen wie Adresse, Telefon, Website und Instagram-Seite (falls vorhanden) sowie den Kartenstandort.",
      "saglik.hero.p1": "Der Bereich Gesundheit hilft dir, schnell Gesundheitseinrichtungen zu finden — über 'Orte in der Nähe' oder durch Eingabe von Bezirk und Stadtviertel.",
      "saglik.hero.p2": "Ortslisten werden nach Bedarf gefiltert und übersichtlich dargestellt.",
      "saglik.hero.p3": "Es zeigt detaillierte Informationen wie Adresse, Telefon, Website und Instagram-Seite (falls vorhanden) sowie den Kartenstandort.",
      "kultur.hero.p1": "Der Bereich Kultur hilft dir, schnell Museen, Ausgrabungsstätten, historische Moscheen und ähnliche öffentliche Kulturorte zu finden.",
      "kultur.hero.p2": "Ortslisten werden nach Bedarf gefiltert und übersichtlich dargestellt.",
      "sanat.hero.p1": "Der Bereich Kunst hilft dir, veranstaltungsorientierte Orte wie Theater und Galerien schnell zu finden — über 'Orte in der Nähe' oder durch Auswahl eines Bezirks.",
      "sanat.hero.p2": "Ortslisten werden nach Bedarf gefiltert und übersichtlich dargestellt.",
      "sanat.hero.p3": "Es zeigt detaillierte Informationen wie Adresse, Telefon, Website und Instagram-Seite (falls vorhanden) sowie den Kartenstandort.",
      "venue.loading": "Ortsinformationen werden geladen.",
      "venue.search": "In Essen & Trinken suchen",
      "venue.back": "Zurück zur Liste",
      "venue.phone": "Telefon",
      "venue.website": "Webseite",
      "venue.instagram": "Instagram",
      "venue.menu": "Speisekarte",
      "venue.services": "Dienstleistungen",
      "venue.atmosphere": "Atmosphäre",
      "venue.map": "Karte und Links",
      "venue.writeReview": "Bewertung schreiben",
      "venue.yourReview": "Deine Bewertung",
      "venue.submitReview": "Bewertung senden",
      "venue.reviews": "Bewertungen",
      "venue.yourName": "Dein Name (optional)",
      "shared.placesLoading": "Orte werden geladen",
      "shared.save": "Speichern",
      "shared.share": "Teilen",
      // about-settings.html
      "about.title": "Über uns",
      "about.intro": "Aramabul ist ein einfach gestalteter Helfer, der darauf abzielt, bei der Suche nach einem Ort auf kürzestem Weg klare Informationen zu liefern.",
      "about.why": "Warum gibt es das?",
      "about.why.p1": "Menschen kennen oft ihr Bedürfnis, aber nicht den Ortsnamen. Deshalb starten wir die Suche beim Bedarf.",
      "about.why.p2": "Ziel ist es, unnötige Komplexität zu reduzieren und dich schneller zum passenden Service oder Produkt zu führen.",
      "about.how": "Wie funktioniert es?",
      "about.how.p1": "Aramabul hilft dir, schnell Orte in der gewünschten Kategorie zu finden, indem du Bezirk und Stadtviertel eingibst.",
      "about.how.p2": "Die Kategorien sind in Essen & Trinken, Reise, Dienstleistungen, Gesundheit, Kultur und Kunst unterteilt. Ortslisten werden nach Bedarf gefiltert und übersichtlich dargestellt.",
      "about.how.p3": "Es zeigt detaillierte Informationen wie Adresse, Telefon, Website und Instagram-Seite (falls vorhanden), Kartenstandort, Google-Bewertungen und die letzten drei Rezensionen.",
      "about.approach": "Unser Kernansatz",
      "about.approach.simple": "Einfache Oberfläche",
      "about.approach.clear": "Klare Informationen",
      "about.approach.fast": "Schnelle und detaillierte Navigation",
    },
    RU: {
      "home.hero.title": "Всё, что вы ищете в Стамбуле — здесь!",
      "home.hero.p1": "Aramabul помогает быстро найти нужное место через «Места рядом» или выбрав район и махалле.",
      "home.hero.p2": "Категории: еда и напитки, путешествия, услуги, здоровье, культура и искусство. Списки мест фильтруются по потребностям и представлены в простом удобном виде.",
      "home.hero.p3": "Показывает подробную информацию: адрес, телефон, сайт, страницу Instagram (при наличии), расположение на карте, рейтинг Google и последние отзывы.",
      "yemeicme.hero.p1": "Раздел «Еда и напитки» помогает быстро найти подходящее заведение через «Места рядом» или введя район и махалле.",
      "yemeicme.hero.p2": "Списки мест фильтруются по потребностям и представлены в удобном виде.",
      "yemeicme.hero.p3": "Показывает адрес, телефон, сайт, страницу Instagram (при наличии) и расположение на карте.",
      "gezi.hero.p1": "Раздел «Путешествия» помогает найти жильё и достопримечательности, указав район и махалле.",
      "gezi.hero.p2": "Списки мест фильтруются по потребностям и представлены в удобном виде.",
      "gezi.hero.p3": "Показывает адрес, телефон, сайт, страницу Instagram (при наличии) и расположение на карте.",
      "hizmetler.hero.p1": "Раздел «Услуги» помогает быстро найти нужные заведения через «Места рядом» или указав район и махалле.",
      "hizmetler.hero.p2": "Списки мест фильтруются по потребностям и представлены в удобном виде.",
      "hizmetler.hero.p3": "Показывает адрес, телефон, сайт, страницу Instagram (при наличии) и расположение на карте.",
      "saglik.hero.p1": "Раздел «Здоровье» помогает быстро найти медицинские учреждения через «Места рядом» или указав район и махалле.",
      "saglik.hero.p2": "Списки мест фильтруются по потребностям и представлены в удобном виде.",
      "saglik.hero.p3": "Показывает адрес, телефон, сайт, страницу Instagram (при наличии) и расположение на карте.",
      "kultur.hero.p1": "Раздел «Культура» помогает быстро найти музеи, археологические памятники, исторические мечети и другие культурные объекты.",
      "kultur.hero.p2": "Списки мест фильтруются по потребностям и представлены в удобном виде.",
      "sanat.hero.p1": "Раздел «Искусство» помогает найти театры, галереи и другие площадки через «Места рядом» или указав район.",
      "sanat.hero.p2": "Списки мест фильтруются по потребностям и представлены в удобном виде.",
      "sanat.hero.p3": "Показывает адрес, телефон, сайт, страницу Instagram (при наличии) и расположение на карте.",
      "venue.loading": "Информация о месте загружается.",
      "venue.search": "Искать в Еде и напитках",
      "venue.back": "Вернуться к списку",
      "venue.phone": "Телефон",
      "venue.website": "Веб-сайт",
      "venue.instagram": "Instagram",
      "venue.menu": "Меню",
      "venue.services": "Услуги",
      "venue.atmosphere": "Атмосфера",
      "venue.map": "Карта и ссылки",
      "venue.writeReview": "Написать отзыв",
      "venue.yourReview": "Ваш отзыв",
      "venue.submitReview": "Отправить отзыв",
      "venue.reviews": "Отзывы",
      "venue.yourName": "Ваше имя (необязательно)",
      "shared.placesLoading": "Загрузка мест",
      "shared.save": "Сохранить",
      "shared.share": "Поделиться",
      // about-settings.html
      "about.title": "О приложении",
      "about.intro": "Aramabul — это простой помощник, который помогает быстро найти чёткую информацию при поиске места.",
      "about.why": "Зачем он нужен?",
      "about.why.p1": "Люди чаще всего знают свою потребность, а не название места. Поэтому мы начинаем поиск с потребности.",
      "about.why.p2": "Цель — сократить лишние усилия и помочь быстрее найти нужный сервис или продукт.",
      "about.how": "Как это работает?",
      "about.how.p1": "Aramabul помогает быстро найти место в нужной категории, указав район и махалле.",
      "about.how.p2": "Категории: еда и напитки, путешествия, услуги, здоровье, культура и искусство. Списки мест фильтруются по потребностям и представлены в удобном виде.",
      "about.how.p3": "Показывает подробную информацию: адрес, телефон, сайт, страницу Instagram (при наличии), расположение на карте, рейтинг Google и последние три отзыва.",
      "about.approach": "Наш подход",
      "about.approach.simple": "Простой интерфейс",
      "about.approach.clear": "Чёткая информация",
      "about.approach.fast": "Быстрая и подробная навигация",
    },
    ZH: {
      "home.hero.title": "在伊斯坦布尔，你想找的一切都在这里！",
      "home.hero.p1": "Aramabul 帮助用户通过选择「附近地点」或输入区和街区信息，快速找到所需类别的地点。",
      "home.hero.p2": "分类涵盖餐饮、出行、服务、健康、文化和艺术。地点列表按需求筛选，以简洁友好的方式呈现。",
      "home.hero.p3": "显示详细信息：地址、电话、网站和 Instagram 页面（如有）、地图位置、Google 用户评分和最新评论。",
      "yemeicme.hero.p1": "餐饮板块帮助用户通过「附近地点」或输入区和街区信息，快速找到合适的场所。",
      "yemeicme.hero.p2": "地点列表按需求筛选，以简洁友好的方式呈现。",
      "yemeicme.hero.p3": "显示地址、电话、网站和 Instagram 页面（如有）以及地图位置等详细信息。",
      "gezi.hero.p1": "出行板块帮助用户通过输入区和街区信息，快速找到住宿和旅游景点。",
      "gezi.hero.p2": "地点列表按需求筛选，以简洁友好的方式呈现。",
      "gezi.hero.p3": "显示地址、电话、网站和 Instagram 页面（如有）以及地图位置等详细信息。",
      "hizmetler.hero.p1": "服务板块帮助用户通过「附近地点」或输入区和街区信息，快速找到日常所需的商家。",
      "hizmetler.hero.p2": "地点列表按需求筛选，以简洁友好的方式呈现。",
      "hizmetler.hero.p3": "显示地址、电话、网站和 Instagram 页面（如有）以及地图位置等详细信息。",
      "saglik.hero.p1": "健康板块帮助用户通过「附近地点」或输入区和街区信息，快速找到医疗机构。",
      "saglik.hero.p2": "地点列表按需求筛选，以简洁友好的方式呈现。",
      "saglik.hero.p3": "显示地址、电话、网站和 Instagram 页面（如有）以及地图位置等详细信息。",
      "kultur.hero.p1": "文化板块帮助用户快速找到博物馆、考古遗址、历史清真寺等公共文化场所。",
      "kultur.hero.p2": "地点列表按需求筛选，以简洁友好的方式呈现。",
      "sanat.hero.p1": "艺术板块帮助用户通过「附近地点」或选择区县，快速找到剧院、画廊等活动场所。",
      "sanat.hero.p2": "地点列表按需求筛选，以简洁友好的方式呈现。",
      "sanat.hero.p3": "显示地址、电话、网站和 Instagram 页面（如有）以及地图位置等详细信息。",
      "venue.loading": "正在加载地点信息。",
      "venue.search": "在餐饮中搜索",
      "venue.back": "返回列表",
      "venue.phone": "电话",
      "venue.website": "网站",
      "venue.instagram": "Instagram",
      "venue.menu": "菜单",
      "venue.services": "服务",
      "venue.atmosphere": "氛围",
      "venue.map": "地图和链接",
      "venue.writeReview": "写评论",
      "venue.yourReview": "您的评论",
      "venue.submitReview": "提交评论",
      "venue.reviews": "评论",
      "venue.yourName": "您的名字（可选）",
      "shared.placesLoading": "正在加载地点",
      "shared.save": "收藏",
      "shared.share": "分享",
      // about-settings.html
      "about.title": "关于",
      "about.intro": "Aramabul 是一个简洁的助手，帮助用户在找地点时快速获得清晰信息。",
      "about.why": "为什么存在？",
      "about.why.p1": "很多时候人们知道的是需求，而不是地点名称。因此我们从需求开始搜索。",
      "about.why.p2": "目标是减少不必要的复杂和操作，让你更快找到所需服务和产品。",
      "about.how": "如何运作？",
      "about.how.p1": "Aramabul 帮助用户通过输入区和街区信息，快速找到所需类别的地点。",
      "about.how.p2": "分类涵盖餐饮、出行、服务、健康、文化和艺术。地点列表按需求筛选，以简洁友好的方式呈现。",
      "about.how.p3": "显示详细信息：地址、电话、网站和 Instagram 页面（如有）、地图位置、Google 用户评分和最新三条评论。",
      "about.approach": "我们的核心方法",
      "about.approach.simple": "简洁界面",
      "about.approach.clear": "清晰信息",
      "about.approach.fast": "快速且详细的引导",
    },
  };
  const PAGE_KEY_ORIGINALS = new WeakMap();
  const STATIC_TEXT_NODE_ORIGINALS = new WeakMap();
  const STATIC_ATTRIBUTE_ORIGINALS = new WeakMap();
  const BOTTOM_NAV_TEXT = {
    TR: {
      nav: "Alt menü",
      home: "Anasayfa",
      favorites: "Favorilerim",
      search: "Ara",
      signup: "Kayıt",
      profile: "Ayarlar",
      searchPlaceholder: "Ne bulmamı istersin?",
    },
    EN: {
      nav: "Bottom menu",
      home: "Home",
      favorites: "Favorites",
      search: "Search",
      signup: "Sign up",
      profile: "Settings",
      searchPlaceholder: "What should I find?",
    },
    RU: {
      nav: "Нижнее меню",
      home: "Главная",
      favorites: "Избранное",
      search: "Поиск",
      signup: "Регистрация",
      profile: "Настройки",
      searchPlaceholder: "Что мне найти?",
    },
    DE: {
      nav: "Unteres Menü",
      home: "Start",
      favorites: "Favoriten",
      search: "Suche",
      signup: "Registrieren",
      profile: "Einstellungen",
      searchPlaceholder: "Was soll ich finden?",
    },
    ZH: {
      nav: "底部菜单",
      home: "首页",
      favorites: "收藏",
      search: "搜索",
      signup: "注册",
      profile: "设置",
      searchPlaceholder: "你想让我找什么？",
    },
  };
  const DESKTOP_AUTH_TEXT = {
    TR: {
      nav: "Hesap bağlantıları",
      signup: "Kayıt ol",
      signin: "Giriş yap",
      favorites: "Favorilerim",
      settings: "Ayarlar",
    },
    EN: {
      nav: "Account links",
      signup: "Sign up",
      signin: "Sign in",
      favorites: "Favorites",
      settings: "Settings",
    },
    RU: {
      nav: "Ссылки аккаунта",
      signup: "Регистрация",
      signin: "Войти",
      favorites: "Избранное",
      settings: "Настройки",
    },
    DE: {
      nav: "Kontolinks",
      signup: "Registrieren",
      signin: "Anmelden",
      favorites: "Favoriten",
      settings: "Einstellungen",
    },
    ZH: {
      nav: "账户链接",
      signup: "注册",
      signin: "登录",
      favorites: "收藏",
      settings: "设置",
    },
  };

  function currentLanguage() {
    return typeof window.ARAMABUL_GET_LANGUAGE === "function"
      ? window.ARAMABUL_GET_LANGUAGE()
      : runtime.getStoredLanguage();
  }

  /** Türkçe arayüz: keşfet / kategori sayfalarında "İlçe" ifadesini "Konum" diline hizala */
  const STATIC_UI_TURKISH_NORMALIZE = {
    "İlçeye göre ara": "Konuma göre ara",
    "İlçe seçimini aç": "Konum seçimini aç",
    "İlçe Mekanları": "Konum mekanları",
    "İlçe listesi": "Konum listesi",
    "İlçe seçenekleri": "Konum seçenekleri",
    "İlçe bazlı veteriner listesi": "Konum bazlı veteriner listesi",
    "İlçe bazlı kuaför listesi": "Konum bazlı kuaför listesi",
    "İlçe bazında veteriner klinikleri": "Konum bazında veteriner klinikleri",
    "İlçe bazında kuaför salonları": "Konum bazında kuaför salonları",
    "Bu il için ilçe verisi bulunamadı.": "Bu il için konum verisi bulunamadı.",
    "Bu ilçe için mekan verisi bulunamadı.": "Bu konum için mekan verisi bulunamadı.",
    "İlçeler": "Konumlar",
    "İlçe": "Konum",
    "İlçesi": "bölgesi",
  };

  function getStaticUiTranslation(sourceText, lang) {
    const normalizedText = String(sourceText || "").trim();
    if (!normalizedText) {
      return "";
    }
    const langKey = String(lang || "TR").toUpperCase();
    if (langKey === "TR" && Object.prototype.hasOwnProperty.call(STATIC_UI_TURKISH_NORMALIZE, normalizedText)) {
      return STATIC_UI_TURKISH_NORMALIZE[normalizedText];
    }
    if (langKey === "TR") {
      return normalizedText;
    }

    const translations = STATIC_UI_TRANSLATIONS[lang] || STATIC_UI_TRANSLATIONS.TR;
    return translations[normalizedText] || normalizedText;
  }

  function translatePreservingWhitespace(sourceText, lang) {
    const rawText = String(sourceText || "");
    const leadingWhitespace = rawText.match(/^\s*/u)?.[0] || "";
    const trailingWhitespace = rawText.match(/\s*$/u)?.[0] || "";
    const coreText = rawText.trim();
    if (!coreText) {
      return rawText;
    }

    const translatedCore = getStaticUiTranslation(coreText, lang);
    return `${leadingWhitespace}${translatedCore}${trailingWhitespace}`;
  }

  function shouldSkipStaticTextNode(node) {
    const parent = node.parentElement;
    if (!parent) {
      return true;
    }

    const tagName = parent.tagName;
    if (tagName === "SCRIPT" || tagName === "STYLE" || tagName === "NOSCRIPT" || tagName === "TEXTAREA") {
      return true;
    }

    if (
      parent.closest(
        ".yr-logo, .brand-wordmark, .header-search, .language-option-code, script, style, noscript, textarea",
      )
    ) {
      return true;
    }

    return false;
  }

  function applyStaticPageTranslations() {
    const lang =
      typeof window.ARAMABUL_GET_LANGUAGE === "function"
        ? window.ARAMABUL_GET_LANGUAGE()
        : runtime.getStoredLanguage();

    if (!document.body) {
      return;
    }

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node || !String(node.nodeValue || "").trim()) {
          return NodeFilter.FILTER_REJECT;
        }

        return shouldSkipStaticTextNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      },
    });

    let currentNode = walker.nextNode();
    while (currentNode) {
      const originalText = STATIC_TEXT_NODE_ORIGINALS.get(currentNode) || currentNode.nodeValue;
      STATIC_TEXT_NODE_ORIGINALS.set(currentNode, originalText);
      const translatedText = translatePreservingWhitespace(originalText, lang);
      if (currentNode.nodeValue !== translatedText) {
        currentNode.nodeValue = translatedText;
      }
      currentNode = walker.nextNode();
    }

    const attributeTargets = [...document.querySelectorAll("[placeholder], [aria-label], [title]")];
    attributeTargets.forEach((element) => {
      if (element.hasAttribute("data-no-static-translate")) {
        return;
      }

      const originalValues = STATIC_ATTRIBUTE_ORIGINALS.get(element) || {};

      ["placeholder", "aria-label", "title"].forEach((attributeName) => {
        if (!element.hasAttribute(attributeName)) {
          return;
        }

        const sourceValue =
          typeof originalValues[attributeName] === "string"
            ? originalValues[attributeName]
            : element.getAttribute(attributeName) || "";

        originalValues[attributeName] = sourceValue;
        const translatedValue = translatePreservingWhitespace(sourceValue, lang);
        if (translatedValue !== sourceValue || lang === "TR") {
          element.setAttribute(attributeName, translatedValue);
        }
      });

      STATIC_ATTRIBUTE_ORIGINALS.set(element, originalValues);
    });

    if (!document.documentElement.dataset.originalTitle) {
      document.documentElement.dataset.originalTitle = document.title;
    }

    const originalTitle = document.documentElement.dataset.originalTitle || "";
    if (originalTitle) {
      const [brandPrefix, rawSuffix] = originalTitle.split("|").map((part) => part.trim());
      if (brandPrefix && rawSuffix) {
        document.title = "AramaBul";
      }
    }

    // ── data-i18n-key attribute tabanlı çeviri ──
    const pageDict = PAGE_TRANSLATIONS[lang];
    const keyElements = document.querySelectorAll("[data-i18n-key]");
    keyElements.forEach((el) => {
      const key = el.getAttribute("data-i18n-key");
      if (!key) {
        return;
      }
      // Orijinal Türkçe metni sakla (ilk seferde)
      if (!PAGE_KEY_ORIGINALS.has(el)) {
        PAGE_KEY_ORIGINALS.set(el, el.textContent);
      }
      if (lang === "TR" || !pageDict) {
        // Türkçeye dönüşte orijinal metni geri koy
        const original = PAGE_KEY_ORIGINALS.get(el);
        if (original != null) {
          el.textContent = original;
        }
      } else {
        const translation = pageDict[key];
        if (translation) {
          el.textContent = translation;
        }
      }
    });
  }

  function normalizeFooterUi() {
    const lang =
      typeof window.ARAMABUL_GET_LANGUAGE === "function"
        ? window.ARAMABUL_GET_LANGUAGE()
        : runtime.getStoredLanguage();
    const headings = FOOTER_HEADINGS[lang] || FOOTER_HEADINGS.TR;
    const footerGrids = [...document.querySelectorAll(".yr-footer-grid")];

    footerGrids.forEach((grid) => {
      const columns = [...grid.querySelectorAll(":scope > .yr-footer-col")];
      if (columns.length > 4) {
        columns.slice(4).forEach((column) => {
          column.remove();
        });
      }

      if (
        !grid.dataset.footerColumnsReordered &&
        columns[2] &&
        columns[3] &&
        columns[2].parentNode === grid
      ) {
        grid.insertBefore(columns[3], columns[2]);
        grid.dataset.footerColumnsReordered = "true";
      }

      const visibleColumns = [...grid.querySelectorAll(":scope > .yr-footer-col")];
      FOOTER_PAGE_GROUPS.forEach((group, columnIndex) => {
        const links = [...(visibleColumns[columnIndex]?.querySelectorAll("a") || [])];
        links.forEach((link, linkIndex) => {
          const nextHref = group[linkIndex];
          if (nextHref) {
            link.setAttribute("href", nextHref);
          }
        });
      });

      const footerInner = grid.closest(".yr-footer-inner");
      const socialLinks = footerInner
        ? [...footerInner.querySelectorAll(".yr-footer-social a")]
        : [];
      socialLinks.forEach((link, index) => {
        const nextHref = FOOTER_SOCIAL_PAGES[index];
        if (nextHref) {
          link.setAttribute("href", nextHref);
        }
        const nextLabel = FOOTER_SOCIAL_LABELS[index];
        if (nextLabel) {
          link.setAttribute("aria-label", nextLabel);
        }
      });

      const firstTitle = visibleColumns[0]?.querySelector("h4");
      if (firstTitle) {
        firstTitle.remove();
      }

      const discoverTitle = visibleColumns[1]?.querySelector("h4");
      if (discoverTitle) {
        discoverTitle.textContent = headings.discover;
      }

      const partnersTitle = visibleColumns[2]?.querySelector("h4");
      if (partnersTitle) {
        partnersTitle.textContent = headings.partners;
      }

      const helpTitle = visibleColumns[3]?.querySelector("h4");
      if (helpTitle) {
        helpTitle.textContent = headings.help;
      }
    });
  }

  function getBottomNavLabels() {
    const lang = currentLanguage();
    return BOTTOM_NAV_TEXT[lang] || BOTTOM_NAV_TEXT.TR;
  }

  function getDesktopAuthLabels() {
    const lang = currentLanguage();
    return DESKTOP_AUTH_TEXT[lang] || DESKTOP_AUTH_TEXT.TR;
  }

  window.ARAMABUL_HEADER_I18N = {
    getStaticUiTranslation,
    translatePreservingWhitespace,
    applyStaticPageTranslations,
    normalizeFooterUi,
    getBottomNavLabels,
    getDesktopAuthLabels,
  };
})();
