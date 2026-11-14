/* ==========================================================================
   TEACHER BEYZA'S CREATIVE STUDIO - ANA MOTOR VE CANLI SUNUCU ÇEKİRDEĞİ (script.js)
   Canlı Sunucu: https://beyza-elt-hub-default-rtdb.firebaseio.com
   Modüler Altyapı: Tam İzole Çift Linkli Rol Sistemi (Öğretmen & Öğrenci),
   Firebase Canlı Sınıf Senkronizasyonu, Gerçekçi Kağıt Hışırtı/Koparma Ses Motoru,
   Cihaz Hafızası (%100 Gizli Not Defteri), 4 Sınıf Oyunu, Canlı Sözlük ve Akıllı Kalem
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. MERKEZİ AYARLAR, FIREBASE CANLI SUNUCU VE YETKİ KONTROLÜ (CONFIG)
   -------------------------------------------------------------------------- */
const STUDIO_CONFIG = {
    // Google Firebase Canlı Sunucu Adresin:
    firebaseDbUrl: "https://beyza-elt-hub-default-rtdb.firebaseio.com",

    // İleride tek satırla değiştirebileceğin veya Beyza'nın paneldeki şalterle değiştirebileceği ayar:
    studentCanHostGamesDefault: false,

    // Beyza Hoca'nın Güncel Öğretmen Giriş Bilgileri:
    teacherUsername: "teacherbeyza",
    teacherPassword: "75395102!b",

    // Hafıza Anahtarları (Kullanıcının kendi cihaz/tarayıcı hafızası için)
    storageKeys: {
        soundEnabled: "beyza_studio_sound_v1",
        teacherLoggedIn: "beyza_studio_teacher_auth_v2",
        studentCanHost: "beyza_studio_student_host_v1",
        activeStudentProfile: "beyza_studio_student_profile_v1",
        studentScoresMap: "beyza_studio_scores_map_v1",
        classRosters: "beyza_studio_class_rosters_v1",
        assignedClass: "beyza_studio_assigned_class_v1",
        personalDraftNote: "beyza_studio_draft_note_v1",
        personalDraftTitle: "beyza_studio_draft_title_v1",
        savedNotesArchive: "beyza_studio_notes_archive_v1"
    }
};

/* --------------------------------------------------------------------------
   2. GÜNLÜK MOTİVASYON SÖZLERİ
   (Öğrencilerde kesinlikle görünmez, sadece Beyza özel linkiyle giriş yaptığında açılır.)
   -------------------------------------------------------------------------- */
const HARUN_MOTIVATION_QUOTES = [
    {
        title: "Yeni Bir Gün, Yeni Bir İlham",
        quote: "Bugün sınıfa attığın her adımda, bir öğrencinin hayatına dokunacak o güzel enerjini hatırla. Senin sabrın ve güleryüzün, en zor gramer kuralını bile sevdirir Beyza Hoca. İyi ki varsın ve iyi ki öğretmen olmuşsun!",
        tag: "Günün Moral Notu"
    },
    {
        title: "Yorulduğun Anlarda Hatırla",
        quote: "Bazı dersler yorucu, bazı günler gürültülü geçebilir. Ama unutma; en parlak yıldızlar bile bazen bulutların arkasına dinlenmeye çekilir. Derin bir nefes al, kahveni yudumla; sen harika bir öğretmensin.",
        tag: "Enerji Desteği"
    },
    {
        title: "Senin Sınıfın, Senin Dünyan",
        quote: "Turuncu kadar sıcak, sarı kadar aydınlık bir kalbin var. Öğrencilerin sadece İngilizce kelimeleri değil, seninle birlikte özgüveni ve nezaketi de öğreniyor. Kendinle gurur duymalısın.",
        tag: "Özel Hatırlatma"
    },
    {
        title: "Küçük Adımların Büyük Gücü",
        quote: "Bugün sadece tek bir öğrencinin bile gözündeki 'Anladım!' ışıltısını görmek, bütün emeğine değer. Yorulduğunda bu stüdyo her zaman senin yanında.",
        tag: "Özel Not"
    },
    {
        title: "Her Zaman Yanındayım",
        quote: "Mesleğinin ilk yıllarında karşına çıkan her zorluk, seni çok daha güçlü ve unutulmaz bir eğitimci yapıyor. Ne zaman moralin düşerse bu sayfayı aç; sana inanan bir dostun hep burada.",
        tag: "Sonsuz Destek"
    }
];

/* --------------------------------------------------------------------------
   3. ZENGİN İNGİLİZCE İÇERİK VERİ TABANI (POST-IT, SÖZLÜK, GRAMER, İPUÇLARI, OYUNLAR)
   -------------------------------------------------------------------------- */
const DAILY_WORDS_AND_IDIOMS = [
    {
        word: "Resilient",
        wordTr: "🇹🇷 Dirençli, çabuk toparlanan, güçlü.",
        example: "\"Teachers and students are remarkably resilient.\"",
        idiom: "Pass with flying colours",
        idiomTr: "🇹🇷 Bir sınavı veya görevi çok yüksek başarıyla geçmek."
    },
    {
        word: "Diligent",
        wordTr: "🇹🇷 Çalışkan, özenli, gayretli.",
        example: "\"She is a diligent teacher who prepares creative games.\"",
        idiom: "Hit the books",
        idiomTr: "🇹🇷 Sıkı bir şekilde ders çalışmaya başlamak."
    },
    {
        word: "Enthusiasm",
        wordTr: "🇹🇷 Coşku, heves, büyük istek.",
        example: "\"Her enthusiasm makes every English lesson unforgettable.\"",
        idiom: "A piece of cake",
        idiomTr: "🇹🇷 Çocuk oyuncağı, yapılması çok kolay iş."
    },
    {
        word: "Inspire",
        wordTr: "🇹🇷 İlham vermek, yüreklendirmek.",
        example: "\"Great teachers inspire students to dream bigger.\"",
        idiom: "Break the ice",
        idiomTr: "🇹🇷 Ortamdaki ilk yabancılığı/soğukluğu kırmak, kaynaşmak."
    },
    {
        word: "Accomplish",
        wordTr: "🇹🇷 Başarmak, üstesinden gelmek, tamamlamak.",
        example: "\"Together we can accomplish every goal this semester.\"",
        idiom: "Practice makes perfect",
        idiomTr: "🇹🇷 Pratik yapmak insanı mükemmelleştirir."
    },
    {
        word: "Serendipity",
        wordTr: "🇹🇷 Güzel ve mutlu tesadüf, beklenmedik iyi şans.",
        example: "\"Finding this book right before the lesson was pure serendipity.\"",
        idiom: "Go the extra mile",
        idiomTr: "🇹🇷 Beklenenden daha fazla çaba göstermek, elinden gelenin fazlasını yapmak."
    }
];

const BUILTIN_DICTIONARY = [
    { en: "Accomplish", tr: "Başarmak, tamamlamak", type: "Verb (Fiil)", example: "You can accomplish anything if you work steadily." },
    { en: "Accurate", tr: "Doğru, kesin, hatasız", type: "Adjective (Sıfat)", example: "Please give an accurate answer to the question." },
    { en: "Acquire", tr: "Edinmek, kazanmak (bilgi/dil)", type: "Verb (Fiil)", example: "Children acquire new vocabulary quickly through games." },
    { en: "Beneficial", tr: "Faydalı, yararlı", type: "Adjective (Sıfat)", example: "Reading short stories daily is very beneficial." },
    { en: "Collaborate", tr: "İş birliği yapmak, birlikte çalışmak", type: "Verb (Fiil)", example: "Students collaborate in groups during classroom quizzes." },
    { en: "Comprehensive", tr: "Kapsamlı, detaylı", type: "Adjective (Sıfat)", example: "This notebook provides a comprehensive grammar review." },
    { en: "Confidence", tr: "Özgüven, güven", type: "Noun (İsim)", example: "Speaking in class builds your English confidence." },
    { en: "Curious", tr: "Meraklı, öğrenmeye istekli", type: "Adjective (Sıfat)", example: "Curious minds always ask the best questions." },
    { en: "Determine", tr: "Belirlemek, kararlaştırmak", type: "Verb (Fiil)", example: "Context helps you determine the meaning of a word." },
    { en: "Diligent", tr: "Çalışkan, gayretli, titiz", type: "Adjective (Sıfat)", example: "A diligent student reviews notes every evening." },
    { en: "Elaborate", tr: "Detaylandırmak / Ayrıntılı", type: "Verb / Adjective", example: "Could you elaborate on your idea in English?" },
    { en: "Encourage", tr: "Teşvik etmek, cesaretlendirmek", type: "Verb (Fiil)", example: "Teacher Beyza always encourages us to speak freely." },
    { en: "Essential", tr: "Temel, çok önemli, vazgeçilmez", type: "Adjective (Sıfat)", example: "Listening is essential for natural pronunciation." },
    { en: "Fluent", tr: "Akıcı (konuşma/dil)", type: "Adjective (Sıfat)", example: "Regular practice will make you fluent in English." },
    { en: "Gratitude", tr: "Minnettarlık, şükran", type: "Noun (İsim)", example: "She expressed her gratitude with a warm smile." },
    { en: "Hesitate", tr: "Tereddüt etmek, çekinmek", type: "Verb (Fiil)", example: "Don't hesitate to ask when you don't understand a rule." },
    { en: "Inevitable", tr: "Kaçınılmaz", type: "Adjective (Sıfat)", example: "Making small mistakes while learning is inevitable and normal." },
    { en: "Maintain", tr: "Sürdürmek, korumak", type: "Verb (Fiil)", example: "Maintain eye contact while presenting your topic." },
    { en: "Obstacle", tr: "Engel, zorluk", type: "Noun (İsim)", example: "Patience turns every obstacle into a stepping stone." },
    { en: "Perseverance", tr: "Azim, sebat, vazgeçmeme", type: "Noun (İsim)", example: "Success in language learning requires perseverance." },
    { en: "Precise", tr: "Tam, net, kesin", type: "Adjective (Sıfat)", example: "Use precise adjectives to describe the picture." },
    { en: "Reluctant", tr: "İsteksiz, gönülsüz", type: "Adjective (Sıfat)", example: "At first he was reluctant to speak, now he loves it." },
    { en: "Resilient", tr: "Dirençli, çabuk toparlanan", type: "Adjective (Sıfat)", example: "Resilient learners never give up after a wrong answer." },
    { en: "Significant", tr: "Önemli, kayda değer, anlamlı", type: "Adjective (Sıfat)", example: "You have made significant progress this month!" },
    { en: "Simultaneously", tr: "Aynı anda, eş zamanlı olarak", type: "Adverb (Zarf)", example: "We can listen and take notes simultaneously." },
    { en: "Thrive", tr: "Gelişmek, serpilmek, başarılı olmak", type: "Verb (Fiil)", example: "Students thrive in a positive and creative classroom." },
    { en: "Versatile", tr: "Çok yönlü, çok amaçlı", type: "Adjective (Sıfat)", example: "'Get' is one of the most versatile verbs in English." },
    { en: "Vivid", tr: "Canlı, parlak, net (hayal/renk)", type: "Adjective (Sıfat)", example: "She wrote a story with vivid descriptions." }
];

const GRAMMAR_REFERENCE_CARDS = [
    {
        title: "Present Simple vs. Present Continuous",
        formula: "Genel Doğrular (V1 / V-s) ⚡ Şu An (am/is/are + V-ing)",
        tip: "Alışkanlıklar ve rutinler için 'I drink coffee every morning', tam şu an olan eylemler için 'I am drinking coffee right now' kullanılır."
    },
    {
        title: "Past Simple vs. Present Perfect",
        formula: "Zamanı Belli Geçmiş (V2) ⚡ Etkisi Süren / Zamanı Belirsiz (have/has + V3)",
        tip: "Cümlede 'yesterday, in 2020, two days ago' gibi net geçmiş zaman varsa Past Simple; 'already, yet, just, ever, never' varsa Present Perfect seçilir."
    },
    {
        title: "First & Second Conditionals (If Clauses)",
        formula: "Type 1: If + Present, will + V1 ⚡ Type 2: If + Past, would + V1",
        tip: "Gerçekleşmesi muhtemel durumlar için Type 1 ('If it rains, I will stay home'); hayali durumlar için Type 2 ('If I had wings, I would fly') kullanılır."
    },
    {
        title: "Modals of Deduction (Must / Can't / Might)",
        formula: "Must (%95 Olumlu Çıkarım) ⚡ Can't (%95 Olumsuz Çıkarım)",
        tip: "'The lights are on, she must be at home' (Kesin evde olmalı). 'She can't be hungry, she just ate' (Aç olamaz)."
    },
    {
        title: "Passive Voice (Edilgen Çatı) Altın Kuralı",
        formula: "be (am/is/are/was/were/been) + V3 (Past Participle)",
        tip: "İşi yapan değil, yapılan iş önemliyse kullanılır: 'This studio was designed for Teacher Beyza.'"
    },
    {
        title: "Relative Clauses (Who / Which / Where / Whose)",
        formula: "İnsan: Who ⚡ Nesne/Hayvan: Which ⚡ Yer: Where ⚡ İyelik: Whose",
        tip: "Yer isminden sonra 'orada' anlamı varsa 'where' ('The school where I teach'), yer bir özne/nesne olarak tanımlanıyorsa 'which' gelir."
    }
];

const PRACTICAL_ENGLISH_TIPS = [
    {
        category: "confused",
        badge: "SIK KARIŞTIRILANLAR",
        title: "Affect (Etkilemek - Fiil) vs. Effect (Etki - İsim)",
        content: "Pratik Kodlama: **A**ffect = **A**ction (Fiil), **E**ffect = **E**nd result (Sonuç/İsim). Örn: 'The weather affected my mood' / 'The effect was positive.'"
    },
    {
        category: "confused",
        badge: "SIK KARIŞTIRILANLAR",
        title: "Make vs. Do Ayrımı",
        content: "Ortaya yeni bir ürün, yemek, ses veya karar çıkarıyorsan **MAKE** (make a cake, make a decision, make a mistake). Görev, iş veya aktivite yapıyorsan **DO** (do homework, do a favor, do business)."
    },
    {
        category: "confused",
        badge: "SIK KARIŞTIRILANLAR",
        title: "Fun (Eğlence / Keyifli) vs. Funny (Komik / Güldüren)",
        content: "Bir parti çok keyifliyse 'It was really fun!' denir. 'It was funny' dersen 'Parti çok gülünç/komikti' anlamına gelir."
    },
    {
        category: "classroom",
        badge: "SINIF İÇİ KALIPLAR",
        title: "Derse Enerjik Giriş Kalıpları",
        content: "• 'Let's pick up where we left off!' (Kaldığımız yerden devam edelim!)\n• 'Put on your thinking caps!' (Düşünme şapkalarınızı takın bakalım!)"
    },
    {
        category: "classroom",
        badge: "SINIF İÇİ KALIPLAR",
        title: "Öğrenciyi Nazikçe Düzeltme (Gentle Correction)",
        content: "Doğrudan 'Wrong!' demek yerine: 'Almost there! How can we say it in the past tense?' veya 'Good try! Let's look at the verb again.'"
    },
    {
        category: "shortcuts",
        badge: "HIZLI GRAMER TÜYOSU",
        title: "IN / ON / AT (Zaman ve Yer Üçgeni)",
        content: "Genişten dara doğru piramit düşün:\n• **IN**: Yüzyıl, Yıl, Ay, Şehir, Ülke (in May, in Adana)\n• **ON**: Günler, Tarihler, Cadde, Yüzey (on Monday)\n• **AT**: Tam Saatler, Nokta Konum (at 8 o'clock, at the door)"
    },
    {
        category: "shortcuts",
        badge: "HIZLI GRAMER TÜYOSU",
        title: "Used to vs. Be used to + V-ing",
        content: "• 'I used to wake up late' (Eskiden geç uyanırdım, artık uyanmıyorum).\n• 'I am used to waking up early' (Erken uyanmaya alışkınım)."
    },
    {
        category: "confused",
        badge: "SIK KARIŞTIRILANLAR",
        title: "Borrow (Ödünç Almak) vs. Lend (Ödünç Vermek)",
        content: "Sen birinden alıyorsan **Borrow from** ('Can I borrow a pencil from you?'); sen birine veriyorsan **Lend to** ('I can lend you my notebook')."
    }
];

const LUCKY_PENCIL_QUESTIONS = [
    "Tell us 3 English adjectives that describe your mood today!",
    "What would you do if you could travel anywhere in the world tomorrow?",
    "Make a sentence using the word 'RESILIENT' or 'CREATIVE'!",
    "What is your favorite English movie, song, or game and why?",
    "Describe your best friend using 2 English sentences!",
    "Tell us one thing you accomplished this week in English!",
    "What is the difference between 'do homework' and 'make a cake'?",
    "Spell the word 'ENTHUSIASM' out loud!",
    "If you had a superpower in English class, what would it be?",
    "Ask a question in English to the friend sitting next to you!"
];

const CLASSROOM_GAMES_DATA = {
    quiz: [
        {
            prompt: "Which word means 'working very hard and carefully'?",
            options: ["Reluctant", "Diligent", "Fragile", "Temporary"],
            answer: "Diligent",
            explanation: "'Diligent' çalışkan, özenli ve gayretli demektir."
        },
        {
            prompt: "Choose the correct form: 'Look! The students _______ a new classroom game right now.'",
            options: ["play", "played", "are playing", "have played"],
            answer: "are playing",
            explanation: "'Look!' ve 'right now' tam şu anda gerçekleşen Present Continuous eylemi gösterir."
        },
        {
            prompt: "What does the idiom 'A piece of cake' mean?",
            options: ["Very delicious food", "Something very easy to do", "A birthday party", "A difficult exam"],
            answer: "Something very easy to do",
            explanation: "'A piece of cake' çocuk oyuncağı / çok kolay iş anlamındadır."
        },
        {
            prompt: "Complete the sentence: 'If I _______ more time tonight, I would read another chapter.'",
            options: ["have", "had", "will have", "having"],
            answer: "had",
            explanation: "Second Conditional (Type 2) cümlelerinde If yan cümlesinde Past Simple ('had') kullanılır."
        },
        {
            prompt: "Which preposition fits best? 'Our English project presentation is _______ Monday morning.'",
            options: ["in", "on", "at", "since"],
            answer: "on",
            explanation: "Günler ve günlerin bölümleriyle ('Monday morning') her zaman 'on' kullanılır."
        }
    ],
    wordfinder: [
        {
            prompt: "Eksik harfleri tamamla: 'Başarmak, üstesinden gelmek' -> A C C _ M P L _ S H",
            options: ["ACCOMPLISH", "ACCUMPLESH", "ACOMPLISH", "ACCOMPLISHH"],
            answer: "ACCOMPLISH",
            explanation: "Doğru yazılışı: ACCOMPLISH (Başarmak)."
        },
        {
            prompt: "Eksik harfleri tamamla: 'Özgüven' -> C _ N F _ D E N C E",
            options: ["CONFIDENCE", "CONFIDANCE", "CANFIDENCE", "CONFIDENSE"],
            answer: "CONFIDENCE",
            explanation: "Doğru yazılışı: CONFIDENCE (Özgüven)."
        },
        {
            prompt: "Eksik harfleri tamamla: 'Teşvik etmek, cesaretlendirmek' -> E N C _ U R _ G E",
            options: ["ENCOURAGE", "ENCORAGE", "ENCOUREGE", "INCOURAGE"],
            answer: "ENCOURAGE",
            explanation: "Doğru yazılışı: ENCOURAGE."
        },
        {
            prompt: "Eksik harfleri tamamla: 'Meraklı, öğrenmeye istekli' -> C U R _ O _ S",
            options: ["CURIOUS", "CUREOUS", "CURIUS", "CUROUS"],
            answer: "CURIOUS",
            explanation: "Doğru yazılışı: CURIOUS (Meraklı)."
        }
    ],
    truefalse: [
        {
            prompt: "TRUE or FALSE: We say 'make homework' instead of 'do homework' in standard English.",
            options: ["TRUE (Doğru)", "FALSE (Yanlış)"],
            answer: "FALSE (Yanlış)",
            explanation: "İngilizcede ödev yapmak her zaman 'DO homework' olarak kullanılır; hata yapmak ise 'MAKE a mistake'tir."
        },
        {
            prompt: "TRUE or FALSE: The idiom 'Break the ice' means making people feel more comfortable and friendly in a new group.",
            options: ["TRUE (Doğru)", "FALSE (Yanlış)"],
            answer: "TRUE (Doğru)",
            explanation: "Doğru! 'Break the ice' ortamdaki ilk soğukluğu/çekingenliği kırmak demektir."
        },
        {
            prompt: "TRUE or FALSE: 'I have lived in Adana since 3 years' is grammatically correct.",
            options: ["TRUE (Doğru)", "FALSE (Yanlış)"],
            answer: "FALSE (Yanlış)",
            explanation: "Süre uzunluğu ('3 years') belirtilirken 'since' değil, 'FOR 3 years' kullanılır."
        },
        {
            prompt: "TRUE or FALSE: 'Resilient' describes someone who recovers quickly from difficulties.",
            options: ["TRUE (Doğru)", "FALSE (Yanlış)"],
            answer: "TRUE (Doğru)",
            explanation: "Doğru! 'Resilient' zorluklar karşısında dirençli ve çabuk toparlanan demektir."
        }
    ],
    sentence: [
        {
            prompt: "Anlamlı bir cümle oluşturmak için doğru dizilimi seç:",
            options: [
                "Practice makes every student more confident.",
                "Makes practice student every confident more.",
                "Every confident makes practice more student.",
                "Student every practice makes confident more."
            ],
            answer: "Practice makes every student more confident.",
            explanation: "Özne (Practice) + Yüklem (makes) + Nesne (every student) + Sıfat (more confident)."
        },
        {
            prompt: "Anlamlı bir soru cümlesi oluşturmak için doğru dizilimi seç:",
            options: [
                "Have you ever visited an English speaking country?",
                "Ever have you visited country speaking an English?",
                "You have visited ever an English country speaking?",
                "Visited have you ever an speaking English country?"
            ],
            answer: "Have you ever visited an English speaking country?",
            explanation: "Present Perfect soru kalıbı: Have + you + ever + V3 (visited)..."
        },
        {
            prompt: "Koşul (If Clause) cümlesi için doğru dizilimi seç:",
            options: [
                "If we work together, we will finish the project early.",
                "If we will work together, we finish the project early.",
                "We will finish the project early, if together work we.",
                "If work we together, will we finish early the project."
            ],
            answer: "If we work together, we will finish the project early.",
            explanation: "Type 1 If Clause: If + Present Simple (work), Future Simple (will finish)."
        }
    ]
};

/* --------------------------------------------------------------------------
   4. GELİŞMİŞ WEB AUDIO API SES MOTORU
      (Gerçekçi Kağıt Çevirme/Koparma Hışırtısı ve Kalem Çizim Sesleri)
   -------------------------------------------------------------------------- */
class StudioSoundEngine {
    constructor() {
        this.ctx = null;
        const savedSound = localStorage.getItem(STUDIO_CONFIG.storageKeys.soundEnabled);
        this.enabled = savedSound === null ? true : savedSound === "true";
    }

    initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume();
        }
    }

    toggleSound() {
        this.enabled = !this.enabled;
        localStorage.setItem(STUDIO_CONFIG.storageKeys.soundEnabled, String(this.enabled));
        if (this.enabled) {
            this.playPageFlip();
        }
        return this.enabled;
    }

    playCrayonSketch() {
        if (!this.enabled) return;
        try {
            this.initContext();
            if (!this.ctx) return;

            const now = this.ctx.currentTime;
            const duration = 0.24;
            const sampleRate = this.ctx.sampleRate;
            const bufferSize = Math.floor(sampleRate * duration);
            const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                const progress = i / bufferSize;
                const windowEnv = Math.sin(progress * Math.PI);
                const grain = 0.65 + 0.35 * Math.sin(progress * 210);
                data[i] = (Math.random() * 2 - 1) * windowEnv * grain * 0.14;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const highpass = this.ctx.createBiquadFilter();
            highpass.type = "highpass";
            highpass.frequency.setValueAtTime(1200, now);

            const bandpass = this.ctx.createBiquadFilter();
            bandpass.type = "bandpass";
            bandpass.frequency.setValueAtTime(2100, now);
            bandpass.frequency.linearRampToValueAtTime(2900, now + duration);
            bandpass.Q.setValueAtTime(2.4, now);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.22, now + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            noise.connect(highpass);
            highpass.connect(bandpass);
            bandpass.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start(now);
        } catch (e) {}
    }

    playPageFlip() {
        if (!this.enabled) return;
        try {
            this.initContext();
            if (!this.ctx) return;

            const now = this.ctx.currentTime;
            const duration = 0.38;
            const sampleRate = this.ctx.sampleRate;
            const bufferSize = Math.floor(sampleRate * duration);
            const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
            const data = buffer.getChannelData(0);

            let prev = 0;
            for (let i = 0; i < bufferSize; i++) {
                const t = i / bufferSize;
                const tearCrackle = t < 0.38
                    ? (Math.sin(t * 420) > 0.35 ? 1.35 : 0.45)
                    : 1.0;

                const firstWave = Math.exp(-Math.pow((t - 0.16) / 0.09, 2)) * 0.75;
                const secondWave = Math.exp(-Math.pow((t - 0.48) / 0.22, 2)) * 1.0;
                const smoothEnvelope = Math.min(1, t * 18) * (firstWave + secondWave) * (1 - Math.pow(t, 2.2));

                const white = Math.random() * 2 - 1;
                const crispPaperSignal = white - 0.65 * prev;
                prev = white;

                data[i] = crispPaperSignal * tearCrackle * smoothEnvelope * 0.32;
            }

            const noiseSource = this.ctx.createBufferSource();
            noiseSource.buffer = buffer;

            const highpass = this.ctx.createBiquadFilter();
            highpass.type = "highpass";
            highpass.frequency.setValueAtTime(1600, now);

            const paperFilter = this.ctx.createBiquadFilter();
            paperFilter.type = "bandpass";
            paperFilter.frequency.setValueAtTime(2400, now);
            paperFilter.frequency.exponentialRampToValueAtTime(5400, now + 0.14);
            paperFilter.frequency.exponentialRampToValueAtTime(3100, now + duration);
            paperFilter.Q.setValueAtTime(1.3, now);

            const masterGain = this.ctx.createGain();
            masterGain.gain.setValueAtTime(0.0001, now);
            masterGain.gain.linearRampToValueAtTime(0.38, now + 0.05);
            masterGain.gain.setValueAtTime(0.34, now + 0.18);
            masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            noiseSource.connect(highpass);
            highpass.connect(paperFilter);
            paperFilter.connect(masterGain);
            masterGain.connect(this.ctx.destination);

            noiseSource.start(now);
        } catch (e) {}
    }

    playSchoolBell() {
        if (!this.enabled) return;
        try {
            this.initContext();
            if (!this.ctx) return;

            const now = this.ctx.currentTime;
            const freqs = [880, 1318.5, 1760];
            freqs.forEach((f, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(f, now + idx * 0.08);
                gain.gain.setValueAtTime(0.22, now + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.08);
                osc.stop(now + 1.25);
            });
        } catch (e) {}
    }

    playFeedbackTone(isCorrect) {
        if (!this.enabled) return;
        try {
            this.initContext();
            if (!this.ctx) return;

            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = isCorrect ? "triangle" : "sawtooth";
            osc.frequency.setValueAtTime(isCorrect ? 523.25 : 220, now);
            osc.frequency.setValueAtTime(isCorrect ? 659.25 : 174.61, now + 0.12);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.36);
        } catch (e) {}
    }
}

const soundEngine = new StudioSoundEngine();

/* --------------------------------------------------------------------------
   5. UYGULAMA DURUMU (STATE) YÖNETİMİ
   -------------------------------------------------------------------------- */
const appState = {
    isTeacher: false,
    isTeacherPortalLink: false,
    studentCanHostGames: STUDIO_CONFIG.studentCanHostGamesDefault,
    activeClass: "A",
    studentProfile: null,
    currentWordIndex: 0,
    lastProcessedSpinTimestamp: 0,
    lastProcessedGameTimestamp: 0,
    timer: {
        totalSeconds: 180,
        remainingSeconds: 180,
        intervalId: null,
        isRunning: false
    },
    game: {
        activeType: "quiz",
        questionIndex: 0,
        answeredCurrent: false
    }
};

/* --------------------------------------------------------------------------
   6. FIREBASE CANLI SINIF SENKRONİZASYON MOTORU (CLOUD SYNC)
   -------------------------------------------------------------------------- */
async function pushCloudState(partialData) {
    if (!STUDIO_CONFIG.firebaseDbUrl) return;
    try {
        await fetch(`${STUDIO_CONFIG.firebaseDbUrl}/studioLive.json`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(partialData)
        });
    } catch (err) {
        // İnternet kesilirse yerel hafıza devreye girer
    }
}

async function pullCloudState() {
    if (!STUDIO_CONFIG.firebaseDbUrl) return;
    try {
        const res = await fetch(`${STUDIO_CONFIG.firebaseDbUrl}/studioLive.json`);
        if (!res.ok) return;
        const data = await res.json();

        // Eğer sunucu henüz boşsa (null), başlangıç paketini sunucuya yaz:
        if (!data) {
            await pushCloudState({
                studentCanHostGames: appState.studentCanHostGames,
                classRosters: getAllClassRosters(),
                updatedAt: Date.now()
            });
            return;
        }

        // 1) Öğretmen Oyun Kurma Şalteri Canlı Senkronizasyonu
        if (typeof data.studentCanHostGames === "boolean" && data.studentCanHostGames !== appState.studentCanHostGames) {
            appState.studentCanHostGames = data.studentCanHostGames;
            localStorage.setItem(STUDIO_CONFIG.storageKeys.studentCanHost, String(appState.studentCanHostGames));
            const hostToggle = document.getElementById("studentHostToggle");
            if (hostToggle) hostToggle.checked = appState.studentCanHostGames;
            updateHostPermissionUI();
        }

        // 2) Sınıflara Göre (A, B, C) Öğrenci Listesi Canlı Senkronizasyonu
        if (data.classRosters) {
            const normalizedRosters = {
                A: Array.isArray(data.classRosters.A) ? data.classRosters.A : [],
                B: Array.isArray(data.classRosters.B) ? data.classRosters.B : [],
                C: Array.isArray(data.classRosters.C) ? data.classRosters.C : []
            };
            localStorage.setItem(STUDIO_CONFIG.storageKeys.classRosters, JSON.stringify(normalizedRosters));
            renderClassRoster();
        }

        // 3) Akıllı Kalem (Şanslı Kalem) Canlı Çevirme Sonucu Senkronizasyonu (Sadece kendi sınıfını görür)
        const classSpin = data.luckyDraws && data.luckyDraws[appState.activeClass];
        if (classSpin && classSpin.timestamp && classSpin.timestamp > appState.lastProcessedSpinTimestamp) {
            appState.lastProcessedSpinTimestamp = classSpin.timestamp;
            const winnerNameEl = document.getElementById("luckySelectedStudent");
            const questionEl = document.getElementById("luckySelectedQuestion");
            if (winnerNameEl) winnerNameEl.textContent = `🎯 No: ${classSpin.studentNo} — ${classSpin.studentName}`;
            if (questionEl) questionEl.textContent = `💬 Soru: "${classSpin.question}"`;
        }

        // 4) Canlı Oyun Odası Başlatma Senkronizasyonu
        if (data.activeGameSession && data.activeGameSession.timestamp > appState.lastProcessedGameTimestamp) {
            appState.lastProcessedGameTimestamp = data.activeGameSession.timestamp;
            if (data.activeGameSession.gameType && data.activeGameSession.gameType !== appState.game.activeType) {
                selectClassroomGameTab(data.activeGameSession.gameType);
            }
        }
    } catch (err) {}
}

function initFirebaseLiveSync() {
    // İlk açılışta sunucudan çek ve boşsa ilk veriyi gönder
    pullCloudState();
    // Her 2.5 saniyede bir sınıftaki diğer cihazlarla canlı eşitle
    setInterval(pullCloudState, 2500);
}

/* --------------------------------------------------------------------------
   7. SAYFA YÜKLENDİĞİNDE BAŞLATILACAK ANA KURULUM
   -------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    initPermissionsAndUrlParams();
    initSoundControls();
    initPaperRollsNavigation();
    initSilverHeartLocket();
    initDailyWordPostIt();
    initCrayonTimer();
    initLuckyPencilSystem();
    initDictionaryAndGrammar();
    initPersonalNotebook();
    initClassroomGames();
    initPracticalTips();
    initMotivationCorner();
    initAuthAndProfileModals();
    initFirebaseLiveSync();
});

/* --------------------------------------------------------------------------
   8. TAM İZOLE ÇİFT LİNK SİSTEMİ (ÖĞRETMEN ÖZEL LİNKİ vs. ÖĞRENCİ SABİT LİNKİ)
   -------------------------------------------------------------------------- */
function initPermissionsAndUrlParams() {
    const params = new URLSearchParams(window.location.search);

    localStorage.removeItem("beyza_studio_teacher_auth_v1");

    // 1) Beyza'nın Özel Öğretmen Linki Kontrolü (?teacher=beyza veya ?role=teacher)
    const isTeacherParam =
        (params.get("teacher") || "").toLowerCase() === "beyza" ||
        (params.get("role") || "").toLowerCase() === "teacher";
    appState.isTeacherPortalLink = isTeacherParam;

    // 2) Sınıf İzolasyonu (Öğrenciler ?class=A, B, C ile kendi sınıflarına atanır)
    const urlClass = (params.get("class") || "").toUpperCase();
    if (["A", "B", "C"].includes(urlClass)) {
        appState.activeClass = urlClass;
        localStorage.setItem(STUDIO_CONFIG.storageKeys.assignedClass, urlClass);
    } else {
        const savedClass = localStorage.getItem(STUDIO_CONFIG.storageKeys.assignedClass);
        if (savedClass && ["A", "B", "C"].includes(savedClass)) {
            appState.activeClass = savedClass;
        }
    }

    // 3) Oyun Kurma Yetki Şalteri Durumu
    const savedHostPerm = localStorage.getItem(STUDIO_CONFIG.storageKeys.studentCanHost);
    if (savedHostPerm !== null) {
        appState.studentCanHostGames = savedHostPerm === "true";
    }

    // 4) Öğretmen Oturumu Kontrolü
    const savedTeacherAuth = localStorage.getItem(STUDIO_CONFIG.storageKeys.teacherLoggedIn) === "true";
    if (savedTeacherAuth && !params.has("class")) {
        appState.isTeacher = true;
    } else {
        appState.isTeacher = false;
    }

    const savedStudentRaw = localStorage.getItem(STUDIO_CONFIG.storageKeys.activeStudentProfile);
    if (savedStudentRaw) {
        try {
            appState.studentProfile = JSON.parse(savedStudentRaw);
        } catch (e) {
            appState.studentProfile = null;
        }
    }

    // Beyza özel linkine (?teacher=beyza) tıkladıysa ve henüz giriş yapmadıysa direkt Öğretmen Giriş ekranını aç:
    if (appState.isTeacherPortalLink && !appState.isTeacher) {
        setTimeout(() => {
            const modal = document.getElementById("teacherLoginModal");
            if (modal) modal.classList.remove("hidden");
        }, 150);
    }

    // Öğretmen Panelindeki Tek Satırlık Oyun Kurma Şalteri Dinleyicisi (Canlı Sunucuya Anında Yazar)
    const hostToggle = document.getElementById("studentHostToggle");
    if (hostToggle) {
        hostToggle.checked = appState.studentCanHostGames;
        updateHostPermissionUI();
        hostToggle.addEventListener("change", (e) => {
            appState.studentCanHostGames = e.target.checked;
            localStorage.setItem(STUDIO_CONFIG.storageKeys.studentCanHost, String(appState.studentCanHostGames));
            soundEngine.playPageFlip();
            updateHostPermissionUI();
            pushCloudState({
                studentCanHostGames: appState.studentCanHostGames,
                updatedAt: Date.now()
            });
        });
    }

    syncRoleAndProfileUI();
}

function updateHostPermissionUI() {
    const statusText = document.getElementById("studentHostStatusText");
    const gameBadge = document.getElementById("gameHostPermissionBadge");

    if (statusText) {
        statusText.textContent = appState.studentCanHostGames
            ? "Öğrenciler de Kurabilir (Açık)"
            : "Sadece Öğretmen (Kapalı)";
    }
    if (gameBadge) {
        gameBadge.textContent = appState.studentCanHostGames
            ? "🟢 Mod: Tüm Öğrenciler Oyun Kurabilir"
            : "👑 Yönetici: Sadece Teacher Beyza";
    }
}

function syncRoleAndProfileUI() {
    const teacherOnlyElements = document.querySelectorAll(".teacher-only-element");
    const roleBadge = document.getElementById("roleBadge");
    const teacherBtn = document.getElementById("teacherLoginTriggerBtn");
    const miniProfileContainer = document.getElementById("miniProfileContainer");
    const avatarBox = document.getElementById("profileAvatarBox");
    const displayName = document.getElementById("profileDisplayName");
    const displayScore = document.getElementById("profileDisplayScore");
    const classLabel = document.getElementById("profileClassLabel");

    teacherOnlyElements.forEach((el) => {
        if (appState.isTeacher) {
            el.classList.remove("hidden");
        } else {
            el.classList.add("hidden");
        }
    });

    if (appState.isTeacher) {
        if (roleBadge) {
            roleBadge.textContent = "👑 Öğretmen Modu";
            roleBadge.classList.add("teacher-mode");
        }
        if (teacherBtn) teacherBtn.classList.add("hidden");
        if (miniProfileContainer) miniProfileContainer.classList.remove("hidden");
        if (avatarBox) avatarBox.textContent = "👩‍🏫";
        if (displayName) displayName.textContent = "Teacher Beyza";
        if (displayScore) displayScore.textContent = "Yönetici Stüdyosu";
        if (classLabel) classLabel.textContent = `Aktif Sınıf: ${appState.activeClass}`;
    } else {
        if (roleBadge) {
            roleBadge.textContent = "Öğrenci Stüdyosu";
            roleBadge.classList.remove("teacher-mode");
        }

        if (teacherBtn) {
            if (appState.isTeacherPortalLink) {
                teacherBtn.classList.remove("hidden");
            } else {
                teacherBtn.classList.add("hidden");
            }
        }

        if (appState.studentProfile) {
            if (miniProfileContainer) miniProfileContainer.classList.remove("hidden");
            if (avatarBox) {
                avatarBox.textContent = appState.studentProfile.gender === "boy" ? "👦" : "👧";
            }
            if (displayName) displayName.textContent = appState.studentProfile.name;
            if (displayScore) displayScore.textContent = `⭐ ${appState.studentProfile.score} Puan`;
            if (classLabel) classLabel.textContent = "Öğrenci Profili";
        } else {
            if (miniProfileContainer) miniProfileContainer.classList.add("hidden");
        }
    }

    updateHostPermissionUI();
    renderClassRoster();
    updateGameStatusBar();
}

/* --------------------------------------------------------------------------
   9. SAĞ ÜST SES AÇ/KAPAT BUTONU
   -------------------------------------------------------------------------- */
function initSoundControls() {
    const soundBtn = document.getElementById("soundToggleBtn");
    const onIcon = document.getElementById("speakerOnIcon");
    const offIcon = document.getElementById("speakerOffIcon");
    const statusText = document.getElementById("soundStatusText");

    const refreshSoundUI = () => {
        if (soundEngine.enabled) {
            onIcon?.classList.remove("hidden");
            offIcon?.classList.add("hidden");
            if (statusText) statusText.textContent = "Ses: Açık";
        } else {
            onIcon?.classList.add("hidden");
            offIcon?.classList.remove("hidden");
            if (statusText) statusText.textContent = "Ses: Kapalı";
        }
    };

    refreshSoundUI();

    soundBtn?.addEventListener("click", () => {
        soundEngine.toggleSound();
        refreshSoundUI();
    });
}

/* --------------------------------------------------------------------------
   10. ÜSTTEKİ 3'LÜ RULO KAĞIT MENÜ, KALEM ÇİZME VE SAYFA ÇEVİRME SESLERİ
   -------------------------------------------------------------------------- */
function initPaperRollsNavigation() {
    const rollWrappers = document.querySelectorAll(".paper-roll-wrapper");
    const menuItems = document.querySelectorAll(".roll-menu-item");
    const brandBadge = document.querySelector(".brand-badge");

    rollWrappers.forEach((wrapper) => {
        const cylinder = wrapper.querySelector(".paper-roll-cylinder");
        cylinder?.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = wrapper.classList.contains("roll-open");
            rollWrappers.forEach((w) => w.classList.remove("roll-open"));
            if (!isOpen) {
                wrapper.classList.add("roll-open");
                soundEngine.playPageFlip();
            }
        });
    });

    document.addEventListener("click", () => {
        rollWrappers.forEach((w) => w.classList.remove("roll-open"));
    });

    menuItems.forEach((item) => {
        item.addEventListener("mouseenter", () => {
            soundEngine.playCrayonSketch();
        });

        item.addEventListener("click", () => {
            const targetViewId = item.getAttribute("data-target");
            const gameType = item.getAttribute("data-game");

            if (targetViewId === "view-motivation" && !appState.isTeacher) {
                return;
            }

            menuItems.forEach((btn) => btn.classList.remove("active-nav"));
            item.classList.add("active-nav");

            if (targetViewId) {
                switchStudioView(targetViewId);
            }

            if (gameType) {
                selectClassroomGameTab(gameType);
            }

            rollWrappers.forEach((w) => w.classList.remove("roll-open"));
        });
    });

    brandBadge?.addEventListener("click", () => {
        switchStudioView("view-home");
    });
}

function switchStudioView(viewId) {
    const allViews = document.querySelectorAll(".studio-view");
    allViews.forEach((v) => {
        v.classList.add("hidden");
        v.classList.remove("active-view");
    });

    const target = document.getElementById(viewId);
    if (target) {
        target.classList.remove("hidden");
        target.classList.add("active-view");
        soundEngine.playPageFlip();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (viewId === "view-games" && !appState.isTeacher && !appState.studentProfile) {
        openStudentNicknameModal();
    }
}

/* --------------------------------------------------------------------------
   11. GÜMÜŞ KALP KOLYE VE SABİT ÖĞRENCİ LİNKİ KOPYALAMA
   -------------------------------------------------------------------------- */
function initSilverHeartLocket() {
    const locketCard = document.getElementById("silverLocketCard");
    const linkInput = document.getElementById("studentPermanentLinkInput");
    const copyBtn = document.getElementById("copyStudentLinkBtn");
    const classSelect = document.getElementById("locketClassSelect");
    const feedbackMsg = document.getElementById("copyFeedbackMsg");

    const generatePermanentStudentLink = () => {
        const baseUrl = window.location.origin + window.location.pathname;
        const selectedGroup = classSelect ? classSelect.value : appState.activeClass;
        return `${baseUrl}?class=${selectedGroup}`;
    };

    const updateLinkBox = () => {
        if (linkInput) {
            linkInput.value = generatePermanentStudentLink();
        }
    };

    updateLinkBox();

    classSelect?.addEventListener("change", () => {
        updateLinkBox();
        if (feedbackMsg) feedbackMsg.textContent = "✨ Sınıf grubu bağlantısı güncellendi!";
    });

    locketCard?.addEventListener("click", (e) => {
        if (e.target === copyBtn || e.target === linkInput || e.target === classSelect) return;
        locketCard.classList.toggle("locket-open");
        soundEngine.playPageFlip();
    });

    copyBtn?.addEventListener("click", async (e) => {
        e.stopPropagation();
        const urlToCopy = linkInput ? linkInput.value : generatePermanentStudentLink();
        try {
            await navigator.clipboard.writeText(urlToCopy);
            if (feedbackMsg) {
                feedbackMsg.textContent = "✅ Öğrenci özel linki kopyalandı! İstediğin yerde paylaşabilirsin.";
            }
        } catch (err) {
            if (linkInput) {
                linkInput.select();
                document.execCommand("copy");
            }
            if (feedbackMsg) {
                feedbackMsg.textContent = "✅ Link kopyalandı!";
            }
        }
        soundEngine.playFeedbackTone(true);
        setTimeout(() => {
            if (feedbackMsg) feedbackMsg.textContent = "";
        }, 3500);
    });
}

/* --------------------------------------------------------------------------
   12. SARI POST-IT (WORD & IDIOM OF THE DAY)
   -------------------------------------------------------------------------- */
function initDailyWordPostIt() {
    const refreshBtn = document.getElementById("refreshWordOfDayBtn");

    const dayIndex = new Date().getDate() % DAILY_WORDS_AND_IDIOMS.length;
    appState.currentWordIndex = dayIndex;
    renderDailyWordPostIt();

    refreshBtn?.addEventListener("click", () => {
        appState.currentWordIndex = (appState.currentWordIndex + 1) % DAILY_WORDS_AND_IDIOMS.length;
        soundEngine.playPageFlip();
        renderDailyWordPostIt();
    });
}

function renderDailyWordPostIt() {
    const item = DAILY_WORDS_AND_IDIOMS[appState.currentWordIndex];
    const wordTitle = document.getElementById("dailyWordTitle");
    const wordMeaning = document.getElementById("dailyWordMeaning");
    const wordExample = document.getElementById("dailyWordExample");
    const idiomTitle = document.getElementById("dailyIdiomTitle");
    const idiomMeaning = document.getElementById("dailyIdiomMeaning");

    if (wordTitle) wordTitle.textContent = item.word;
    if (wordMeaning) wordMeaning.textContent = item.wordTr;
    if (wordExample) wordExample.textContent = item.example;
    if (idiomTitle) idiomTitle.textContent = item.idiom;
    if (idiomMeaning) idiomMeaning.textContent = item.idiomTr;
}

/* --------------------------------------------------------------------------
   13. SÜREYE GÖRE DOLUP BİTEN ANİMASYONLU DEV KALEM (CRAYON TIMER)
   -------------------------------------------------------------------------- */
function initCrayonTimer() {
    const presetBtns = document.querySelectorAll(".timer-preset-btn");
    const startPauseBtn = document.getElementById("timerStartPauseBtn");
    const resetBtn = document.getElementById("timerResetBtn");

    const updateTimerUI = () => {
        const minsEl = document.getElementById("timerMinutes");
        const secsEl = document.getElementById("timerSeconds");
        const progressBar = document.getElementById("timerProgressBar");

        const mins = Math.floor(appState.timer.remainingSeconds / 60);
        const secs = appState.timer.remainingSeconds % 60;

        if (minsEl) minsEl.textContent = String(mins).padStart(2, "0");
        if (secsEl) secsEl.textContent = String(secs).padStart(2, "0");

        const pct = appState.timer.totalSeconds > 0
            ? (appState.timer.remainingSeconds / appState.timer.totalSeconds) * 100
            : 0;

        if (progressBar) {
            progressBar.style.width = `${Math.max(0, Math.min(100, pct))}%`;
        }
    };

    const stopTimerInterval = () => {
        if (appState.timer.intervalId) {
            clearInterval(appState.timer.intervalId);
            appState.timer.intervalId = null;
        }
        appState.timer.isRunning = false;
        if (startPauseBtn) startPauseBtn.textContent = "▶️ Başlat";
    };

    presetBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            stopTimerInterval();
            presetBtns.forEach((b) => b.classList.remove("active-preset"));
            btn.classList.add("active-preset");

            const secs = parseInt(btn.getAttribute("data-seconds") || "180", 10);
            appState.timer.totalSeconds = secs;
            appState.timer.remainingSeconds = secs;
            soundEngine.playCrayonSketch();
            updateTimerUI();
        });
    });

    startPauseBtn?.addEventListener("click", () => {
        if (appState.timer.isRunning) {
            stopTimerInterval();
            return;
        }

        if (appState.timer.remainingSeconds <= 0) {
            appState.timer.remainingSeconds = appState.timer.totalSeconds;
        }

        appState.timer.isRunning = true;
        startPauseBtn.textContent = "⏸️ Duraklat";
        soundEngine.playCrayonSketch();

        appState.timer.intervalId = setInterval(() => {
            appState.timer.remainingSeconds -= 1;
            updateTimerUI();

            if (appState.timer.remainingSeconds <= 0) {
                stopTimerInterval();
                soundEngine.playSchoolBell();
            }
        }, 1000);
    });

    resetBtn?.addEventListener("click", () => {
        stopTimerInterval();
        appState.timer.remainingSeconds = appState.timer.totalSeconds;
        soundEngine.playPageFlip();
        updateTimerUI();
    });

    updateTimerUI();
}

/* --------------------------------------------------------------------------
   14. AKILLI KALEM / ŞANSLI KALEM (CANLI SUNUCU DESTEKLİ SINIF LİSTESİ & SEÇİCİ)
   -------------------------------------------------------------------------- */
function getAllClassRosters() {
    const raw = localStorage.getItem(STUDIO_CONFIG.storageKeys.classRosters);
    const defaultRosters = {
        A: [
            { no: "416", name: "Zeynep" },
            { no: "548", name: "Emir" },
            { no: "76", name: "Elif" }
        ],
        B: [
            { no: "214", name: "Mert" },
            { no: "309", name: "Selin" }
        ],
        C: [
            { no: "118", name: "Kerem" },
            { no: "402", name: "Defne" }
        ]
    };

    if (!raw) {
        localStorage.setItem(STUDIO_CONFIG.storageKeys.classRosters, JSON.stringify(defaultRosters));
        return defaultRosters;
    }

    try {
        return JSON.parse(raw);
    } catch (e) {
        return defaultRosters;
    }
}

function saveAllClassRosters(rosters) {
    localStorage.setItem(STUDIO_CONFIG.storageKeys.classRosters, JSON.stringify(rosters));
    pushCloudState({
        classRosters: rosters,
        updatedAt: Date.now()
    });
}

function initLuckyPencilSystem() {
    const form = document.getElementById("luckyStudentForm");
    const noInput = document.getElementById("studentSchoolNoInput");
    const nameInput = document.getElementById("studentNameForLuckyInput");
    const spinBtn = document.getElementById("spinLuckyPencilBtn");
    const clearBtn = document.getElementById("clearRosterBtn");
    const classTabs = document.querySelectorAll(".class-tab-btn");

    classTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            if (!appState.isTeacher) return;
            const selectedClass = tab.getAttribute("data-class") || "A";
            appState.activeClass = selectedClass;

            classTabs.forEach((t) => t.classList.remove("active-class-tab"));
            tab.classList.add("active-class-tab");

            soundEngine.playPageFlip();
            renderClassRoster();
            syncRoleAndProfileUI();
        });
    });

    form?.addEventListener("submit", (e) => {
        e.preventDefault();
        const schoolNo = (noInput?.value || "").trim();
        const studentName = (nameInput?.value || "").trim();
        if (!schoolNo || !studentName) return;

        const rosters = getAllClassRosters();
        const currentList = rosters[appState.activeClass] || [];

        const existingIndex = currentList.findIndex((s) => s.no === schoolNo);
        if (existingIndex > -1) {
            currentList[existingIndex].name = studentName;
        } else {
            currentList.push({ no: schoolNo, name: studentName });
        }

        rosters[appState.activeClass] = currentList;
        saveAllClassRosters(rosters);

        if (noInput) noInput.value = "";
        if (nameInput) nameInput.value = "";

        soundEngine.playFeedbackTone(true);
        renderClassRoster();
    });

    spinBtn?.addEventListener("click", () => {
        const rosters = getAllClassRosters();
        const currentList = rosters[appState.activeClass] || [];
        const pencilGraphic = document.getElementById("spinningPencilGraphic");
        const winnerNameEl = document.getElementById("luckySelectedStudent");
        const questionEl = document.getElementById("luckySelectedQuestion");

        if (currentList.length === 0) {
            if (winnerNameEl) winnerNameEl.textContent = "Liste Henüz Boş!";
            if (questionEl) questionEl.textContent = "Önce yukarıdan okul numarası ve isim kaydedin.";
            return;
        }

        pencilGraphic?.classList.remove("is-spinning");
        void pencilGraphic?.offsetWidth;
        pencilGraphic?.classList.add("is-spinning");
        soundEngine.playCrayonSketch();

        if (winnerNameEl) winnerNameEl.textContent = "Kalem Dönüyor...";
        if (questionEl) questionEl.textContent = "Şanslı öğrenci ve soru seçiliyor...";

        setTimeout(() => {
            const randomStudent = currentList[Math.floor(Math.random() * currentList.length)];
            const randomQuestion = LUCKY_PENCIL_QUESTIONS[Math.floor(Math.random() * LUCKY_PENCIL_QUESTIONS.length)];
            const spinTimestamp = Date.now();
            appState.lastProcessedSpinTimestamp = spinTimestamp;

            if (winnerNameEl) {
                winnerNameEl.textContent = `🎯 No: ${randomStudent.no} — ${randomStudent.name}`;
            }
            if (questionEl) {
                questionEl.textContent = `💬 Soru: "${randomQuestion}"`;
            }
            soundEngine.playFeedbackTone(true);

            // Seçilen öğrenciyi ve soruyu canlı sunucuda o sınıfın odasına gönder
            if (STUDIO_CONFIG.firebaseDbUrl) {
                fetch(`${STUDIO_CONFIG.firebaseDbUrl}/studioLive/luckyDraws/${appState.activeClass}.json`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        studentNo: randomStudent.no,
                        studentName: randomStudent.name,
                        question: randomQuestion,
                        timestamp: spinTimestamp
                    })
                }).catch(() => {});
            }
        }, 720);
    });

    clearBtn?.addEventListener("click", () => {
        if (!appState.isTeacher) return;
        const rosters = getAllClassRosters();
        rosters[appState.activeClass] = [];
        saveAllClassRosters(rosters);
        renderClassRoster();
    });

    renderClassRoster();
}

function renderClassRoster() {
    const rosters = getAllClassRosters();
    const currentList = rosters[appState.activeClass] || [];
    const listEl = document.getElementById("classRosterList");
    const countEl = document.getElementById("rosterCount");
    const titleText = document.getElementById("rosterTitleText");

    if (countEl) countEl.textContent = String(currentList.length);

    if (titleText) {
        if (appState.isTeacher) {
            titleText.innerHTML = `📋 Sınıf ${appState.activeClass} Listesi (<span id="rosterCount">${currentList.length}</span> Öğrenci)`;
        } else {
            titleText.innerHTML = `📋 Sınıf Arkadaşlarım (<span id="rosterCount">${currentList.length}</span> Öğrenci)`;
        }
    }

    if (!listEl) return;
    listEl.innerHTML = "";

    currentList.forEach((student, idx) => {
        const li = document.createElement("li");
        li.className = "roster-chip";
        li.innerHTML = `<span>#${student.no} ${student.name}</span>`;

        if (appState.isTeacher) {
            const delBtn = document.createElement("button");
            delBtn.type = "button";
            delBtn.textContent = "×";
            delBtn.title = "Öğrenciyi Sil";
            delBtn.addEventListener("click", () => {
                currentList.splice(idx, 1);
                rosters[appState.activeClass] = currentList;
                saveAllClassRosters(rosters);
                renderClassRoster();
            });
            li.appendChild(delBtn);
        }

        listEl.appendChild(li);
    });
}

/* --------------------------------------------------------------------------
   15. İNGİLİZCE - TÜRKÇE CANLI SÖZLÜK VE GRAMER STÜDYOSU
   -------------------------------------------------------------------------- */
function initDictionaryAndGrammar() {
    const searchInput = document.getElementById("dictionarySearchInput");
    const searchBtn = document.getElementById("dictionarySearchBtn");
    const grammarContainer = document.getElementById("grammarCardsContainer");

    renderDictionaryResults(BUILTIN_DICTIONARY.slice(0, 9));

    if (grammarContainer) {
        grammarContainer.innerHTML = GRAMMAR_REFERENCE_CARDS.map((card) => `
            <article class="notebook-card-widget">
                <span class="badge-tag">GRAMMAR NOTE</span>
                <h3>${card.title}</h3>
                <p style="font-weight:800; color: var(--primary-orange-dark); margin: 8px 0;">${card.formula}</p>
                <p>${card.tip}</p>
            </article>
        `).join("");
    }

    const executeSearch = async () => {
        const query = (searchInput?.value || "").trim().toLowerCase();
        if (!query) {
            renderDictionaryResults(BUILTIN_DICTIONARY.slice(0, 9));
            return;
        }

        soundEngine.playCrayonSketch();

        const localMatches = BUILTIN_DICTIONARY.filter(
            (item) =>
                item.en.toLowerCase().includes(query) ||
                item.tr.toLowerCase().includes(query)
        );

        if (localMatches.length > 0) {
            renderDictionaryResults(localMatches);
            return;
        }

        const resultsGrid = document.getElementById("dictionaryResultsGrid");
        if (resultsGrid) {
            resultsGrid.innerHTML = `<div class="notebook-card-widget"><h3>🔍 "${query}" aranıyor...</h3></div>`;
        }

        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error("Not found");
            const data = await response.json();
            const entry = data[0];
            const firstMeaning = entry?.meanings?.[0];
            const def = firstMeaning?.definitions?.[0]?.definition || "Tanım bulundu.";
            const ex = firstMeaning?.definitions?.[0]?.example || `"${entry.word}" is a useful English word.`;

            renderDictionaryResults([
                {
                    en: entry.word,
                    tr: `🇬🇧 İngilizce Tanım: ${def}`,
                    type: firstMeaning?.partOfSpeech || "Word",
                    example: ex
                }
            ]);
        } catch (err) {
            if (resultsGrid) {
                resultsGrid.innerHTML = `
                    <div class="notebook-card-widget">
                        <h3>📌 Sonuç Bulunamadı</h3>
                        <p>"${query}" için eşleşme bulunamadı. Başka bir İngilizce veya Türkçe kelime deneyebilirsin.</p>
                    </div>
                `;
            }
        }
    };

    searchBtn?.addEventListener("click", executeSearch);
    searchInput?.addEventListener("input", () => {
        if ((searchInput.value || "").trim().length <= 1) {
            renderDictionaryResults(BUILTIN_DICTIONARY.slice(0, 9));
        } else {
            const q = searchInput.value.trim().toLowerCase();
            const matches = BUILTIN_DICTIONARY.filter(
                (item) => item.en.toLowerCase().includes(q) || item.tr.toLowerCase().includes(q)
            );
            if (matches.length > 0) renderDictionaryResults(matches);
        }
    });
    searchInput?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") executeSearch();
    });
}

function renderDictionaryResults(items) {
    const resultsGrid = document.getElementById("dictionaryResultsGrid");
    if (!resultsGrid) return;

    resultsGrid.innerHTML = items.map((item) => `
        <article class="notebook-card-widget">
            <div class="widget-top-row">
                <span class="badge-tag">${item.type}</span>
                <button class="mini-sketch-btn speak-word-btn" data-word="${item.en}" title="Sesli Telaffuzu Dinle">🔊 Dinle</button>
            </div>
            <h3 style="font-size:1.4rem; color: var(--primary-orange-dark);">${item.en}</h3>
            <p style="font-weight:800; margin: 6px 0;">🇹🇷 ${item.tr}</p>
            <p class="english-example">"${item.example}"</p>
        </article>
    `).join("");

    resultsGrid.querySelectorAll(".speak-word-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const word = btn.getAttribute("data-word");
            if (word && "speechSynthesis" in window) {
                const utterance = new SpeechSynthesisUtterance(word);
                utterance.lang = "en-US";
                window.speechSynthesis.speak(utterance);
            }
        });
    });
}

/* --------------------------------------------------------------------------
   16. %100 GİZLİ KİŞİSEL NOT DEFTERİ (SADECE KULLANICININ CİHAZ HAFIZASINDA)
   -------------------------------------------------------------------------- */
function initPersonalNotebook() {
    const titleInput = document.getElementById("noteTitleInput");
    const textarea = document.getElementById("personalNotebookTextarea");
    const saveStatus = document.getElementById("noteSaveStatus");
    const saveManualBtn = document.getElementById("saveNoteManualBtn");
    const clearBtn = document.getElementById("clearCurrentNoteBtn");

    const savedDraft = localStorage.getItem(STUDIO_CONFIG.storageKeys.personalDraftNote);
    const savedTitle = localStorage.getItem(STUDIO_CONFIG.storageKeys.personalDraftTitle);

    if (textarea && savedDraft !== null) textarea.value = savedDraft;
    if (titleInput && savedTitle !== null) titleInput.value = savedTitle;

    const autoSaveDraft = () => {
        if (textarea) {
            localStorage.setItem(STUDIO_CONFIG.storageKeys.personalDraftNote, textarea.value);
        }
        if (titleInput) {
            localStorage.setItem(STUDIO_CONFIG.storageKeys.personalDraftTitle, titleInput.value);
        }
        if (saveStatus) {
            saveStatus.textContent = "💾 Cihaza Otomatik Kaydedildi";
        }
    };

    textarea?.addEventListener("input", autoSaveDraft);
    titleInput?.addEventListener("input", autoSaveDraft);

    saveManualBtn?.addEventListener("click", () => {
        const content = (textarea?.value || "").trim();
        const title = (titleInput?.value || "").trim() || "İsimsiz Ders Notu";
        if (!content) return;

        const archive = getSavedNotesArchive();
        archive.unshift({
            id: Date.now(),
            title,
            content,
            date: new Date().toLocaleDateString("tr-TR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            })
        });

        localStorage.setItem(STUDIO_CONFIG.storageKeys.savedNotesArchive, JSON.stringify(archive));
        soundEngine.playPageFlip();
        renderSavedNotesArchive();
    });

    clearBtn?.addEventListener("click", () => {
        if (textarea) textarea.value = "";
        if (titleInput) titleInput.value = "";
        autoSaveDraft();
        soundEngine.playPageFlip();
    });

    renderSavedNotesArchive();
}

function getSavedNotesArchive() {
    const raw = localStorage.getItem(STUDIO_CONFIG.storageKeys.savedNotesArchive);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch (e) {
        return [];
    }
}

function renderSavedNotesArchive() {
    const container = document.getElementById("savedNotesList");
    if (!container) return;

    const archive = getSavedNotesArchive();
    if (archive.length === 0) {
        container.innerHTML = `
            <div class="notebook-card-widget">
                <h4>📂 Henüz Kayıtlı Yaprak Yok</h4>
                <p>Yukarıdaki çizgili deftere yazdığın her şey anında telefonuna/bilgisayarına kaydedilir. 'Notu Listeye Ekle' butonuna basarak ayrı yapraklar halinde burada arşivleyebilirsin.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = archive.map((note) => `
        <article class="post-it-widget" style="transform:none;">
            <div class="widget-top-row">
                <span class="badge-tag">${note.date}</span>
                <button class="mini-sketch-btn delete-note-btn" data-id="${note.id}">🗑️ Sil</button>
            </div>
            <h4 style="font-family:var(--font-heading); font-size:1.25rem; margin-bottom:6px;">${note.title}</h4>
            <p style="font-family:var(--font-handwriting); font-size:1.2rem; white-space:pre-wrap;">${note.content}</p>
        </article>
    `).join("");

    container.querySelectorAll(".delete-note-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = Number(btn.getAttribute("data-id"));
            const updated = getSavedNotesArchive().filter((n) => n.id !== id);
            localStorage.setItem(STUDIO_CONFIG.storageKeys.savedNotesArchive, JSON.stringify(updated));
            soundEngine.playPageFlip();
            renderSavedNotesArchive();
        });
    });
}

/* --------------------------------------------------------------------------
   17. CLASSROOM GAMES ARENA (4 OYUN + YEREL SKOR HAFIZASI + CANLI ODA)
   -------------------------------------------------------------------------- */
function initClassroomGames() {
    const gameTabs = document.querySelectorAll(".game-tab-pill");
    const nextBtn = document.getElementById("nextGameQuestionBtn");
    const startRoundBtn = document.getElementById("startNewGameRoundBtn");
    const changePlayerBtn = document.getElementById("changePlayerBtn");

    gameTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const type = tab.getAttribute("data-gametype") || "quiz";
            soundEngine.playPageFlip();
            selectClassroomGameTab(type);
        });
    });

    nextBtn?.addEventListener("click", () => {
        const list = CLASSROOM_GAMES_DATA[appState.game.activeType] || [];
        appState.game.questionIndex = (appState.game.questionIndex + 1) % list.length;
        soundEngine.playPageFlip();
        renderCurrentGameQuestion();
    });

    startRoundBtn?.addEventListener("click", () => {
        if (!appState.isTeacher && !appState.studentCanHostGames) {
            const banner = document.getElementById("gameFeedbackBanner");
            if (banner) {
                banner.classList.remove("hidden");
                banner.style.background = "#FFF3CD";
                banner.textContent = "🔒 Yeni oda/oyun başlatma yetkisi şu an Teacher Beyza'da! Ancak mevcut soruları aşağıdan çözmeye devam edebilirsin.";
            }
            return;
        }
        appState.game.questionIndex = 0;
        const roundTimestamp = Date.now();
        appState.lastProcessedGameTimestamp = roundTimestamp;
        soundEngine.playPageFlip();
        renderCurrentGameQuestion();

        pushCloudState({
            activeGameSession: {
                gameType: appState.game.activeType,
                host: appState.isTeacher ? "Teacher Beyza" : (appState.studentProfile?.name || "Öğrenci"),
                timestamp: roundTimestamp
            }
        });
    });

    changePlayerBtn?.addEventListener("click", () => {
        openStudentNicknameModal();
    });

    renderCurrentGameQuestion();
}

function selectClassroomGameTab(gameType) {
    appState.game.activeType = gameType;
    appState.game.questionIndex = 0;

    const gameTabs = document.querySelectorAll(".game-tab-pill");
    gameTabs.forEach((tab) => {
        if (tab.getAttribute("data-gametype") === gameType) {
            tab.classList.add("active-game-tab");
        } else {
            tab.classList.remove("active-game-tab");
        }
    });

    renderCurrentGameQuestion();
}

function updateGameStatusBar() {
    const playerNameEl = document.getElementById("activeGamePlayerName");
    const scoreEl = document.getElementById("activeGameTotalScore");

    if (appState.isTeacher) {
        if (playerNameEl) playerNameEl.textContent = "Teacher Beyza (Yönetici)";
        if (scoreEl) scoreEl.textContent = "∞";
    } else if (appState.studentProfile) {
        if (playerNameEl) playerNameEl.textContent = appState.studentProfile.name;
        if (scoreEl) scoreEl.textContent = String(appState.studentProfile.score);
    } else {
        if (playerNameEl) playerNameEl.textContent = "Misafir Öğrenci";
        if (scoreEl) scoreEl.textContent = "0";
    }
}

function renderCurrentGameQuestion() {
    const list = CLASSROOM_GAMES_DATA[appState.game.activeType] || [];
    const currentQ = list[appState.game.questionIndex];
    if (!currentQ) return;

    appState.game.answeredCurrent = false;

    const categoryBadge = document.getElementById("gameCategoryBadge");
    const counterEl = document.getElementById("gameQuestionCounter");
    const promptEl = document.getElementById("gamePromptText");
    const zoneEl = document.getElementById("gameInteractiveZone");
    const feedbackBanner = document.getElementById("gameFeedbackBanner");
    const nextBtn = document.getElementById("nextGameQuestionBtn");

    const titleMap = {
        quiz: "⚡ QUIZ ARENA",
        wordfinder: "🔤 WORD FINDER",
        truefalse: "✅ TRUE OR FALSE",
        sentence: "🧩 SENTENCE BUILDER"
    };

    if (categoryBadge) categoryBadge.textContent = titleMap[appState.game.activeType] || "GAME";
    if (counterEl) counterEl.textContent = `Soru ${appState.game.questionIndex + 1} / ${list.length}`;
    if (promptEl) promptEl.textContent = currentQ.prompt;
    if (feedbackBanner) feedbackBanner.classList.add("hidden");
    if (nextBtn) nextBtn.classList.add("hidden");

    if (!zoneEl) return;
    zoneEl.innerHTML = "";

    currentQ.options.forEach((opt) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "game-option-btn";
        btn.textContent = opt;

        btn.addEventListener("click", () => {
            if (appState.game.answeredCurrent) return;
            appState.game.answeredCurrent = true;

            const isCorrect = opt === currentQ.answer;
            soundEngine.playFeedbackTone(isCorrect);

            if (isCorrect) {
                btn.classList.add("correct-choice");
                addStudentGamePoints(100);
            } else {
                btn.classList.add("wrong-choice");
                zoneEl.querySelectorAll(".game-option-btn").forEach((otherBtn) => {
                    if (otherBtn.textContent === currentQ.answer) {
                        otherBtn.classList.add("correct-choice");
                    }
                });
            }

            if (feedbackBanner) {
                feedbackBanner.classList.remove("hidden");
                feedbackBanner.style.background = isCorrect ? "#D4EDDA" : "#F8D7DA";
                feedbackBanner.textContent = isCorrect
                    ? `🎉 Harika! +100 Puan! ${currentQ.explanation}`
                    : `💡 Doğru Cevap: ${currentQ.answer} — ${currentQ.explanation}`;
            }

            if (nextBtn) nextBtn.classList.remove("hidden");
        });

        zoneEl.appendChild(btn);
    });
}

function addStudentGamePoints(points) {
    if (appState.isTeacher) return;

    if (!appState.studentProfile) {
        appState.studentProfile = {
            name: "Öğrenci",
            gender: "girl",
            score: points
        };
    } else {
        appState.studentProfile.score += points;
    }

    localStorage.setItem(STUDIO_CONFIG.storageKeys.activeStudentProfile, JSON.stringify(appState.studentProfile));

    const scoresMap = getStudentScoresMap();
    scoresMap[appState.studentProfile.name.toLowerCase()] = {
        name: appState.studentProfile.name,
        gender: appState.studentProfile.gender,
        score: appState.studentProfile.score
    };
    localStorage.setItem(STUDIO_CONFIG.storageKeys.studentScoresMap, JSON.stringify(scoresMap));

    syncRoleAndProfileUI();
}

function getStudentScoresMap() {
    const raw = localStorage.getItem(STUDIO_CONFIG.storageKeys.studentScoresMap);
    if (!raw) return {};
    try {
        return JSON.parse(raw);
    } catch (e) {
        return {};
    }
}

/* --------------------------------------------------------------------------
   18. PRATİK İNGİLİZCE & DERS İPUÇLARI SEKMESİ
   -------------------------------------------------------------------------- */
function initPracticalTips() {
    const filterBtns = document.querySelectorAll(".tip-filter-btn");
    renderPracticalTips("all");

    filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            filterBtns.forEach((b) => b.classList.remove("active-filter"));
            btn.classList.add("active-filter");
            const cat = btn.getAttribute("data-tipcat") || "all";
            soundEngine.playPageFlip();
            renderPracticalTips(cat);
        });
    });
}

function renderPracticalTips(category) {
    const grid = document.getElementById("practicalTipsGrid");
    if (!grid) return;

    const filtered = category === "all"
        ? PRACTICAL_ENGLISH_TIPS
        : PRACTICAL_ENGLISH_TIPS.filter((t) => t.category === category);

    grid.innerHTML = filtered.map((tip) => `
        <article class="notebook-card-widget">
            <span class="badge-tag">${tip.badge}</span>
            <h3 style="margin-bottom:8px;">${tip.title}</h3>
            <p style="white-space:pre-line; line-height:1.55; font-weight:600;">${tip.content}</p>
        </article>
    `).join("");
}

/* --------------------------------------------------------------------------
   19. SADECE BEYZA'YA ÖZEL MOTİVASYON KÖŞESİ
   -------------------------------------------------------------------------- */
function initMotivationCorner() {
    const quoteEl = document.getElementById("featuredMotivationQuote");
    const randomBtn = document.getElementById("randomMotivationBtn");
    const cardsGrid = document.getElementById("motivationCardsContainer");

    let currentIdx = 0;

    const showSpotlightQuote = (index) => {
        const item = HARUN_MOTIVATION_QUOTES[index % HARUN_MOTIVATION_QUOTES.length];
        if (quoteEl) {
            quoteEl.textContent = `"${item.quote}"`;
        }
    };

    showSpotlightQuote(0);

    randomBtn?.addEventListener("click", () => {
        currentIdx = (currentIdx + 1) % HARUN_MOTIVATION_QUOTES.length;
        soundEngine.playPageFlip();
        showSpotlightQuote(currentIdx);
    });

    if (cardsGrid) {
        cardsGrid.innerHTML = HARUN_MOTIVATION_QUOTES.map((item) => `
            <article class="post-it-widget" style="transform:none;">
                <span class="badge-tag">${item.tag}</span>
                <h3 style="font-family:var(--font-heading); margin-bottom:8px;">${item.title}</h3>
                <p style="font-family:var(--font-handwriting); font-size:1.3rem; line-height:1.45;">"${item.quote}"</p>
            </article>
        `).join("");
    }
}

/* --------------------------------------------------------------------------
   20. GİRİŞ PENCERELERİ (ÖĞRETMEN GİRİŞİ, ÖĞRENCİ ANLIK KULLANICI ADI & MİNİ PROFİL)
   -------------------------------------------------------------------------- */
function initAuthAndProfileModals() {
    const teacherModal = document.getElementById("teacherLoginModal");
    const teacherTriggerBtn = document.getElementById("teacherLoginTriggerBtn");
    const closeTeacherBtn = document.getElementById("closeTeacherModalBtn");
    const teacherForm = document.getElementById("teacherLoginForm");
    const teacherError = document.getElementById("teacherLoginError");
    const teacherUserInpEl = document.getElementById("teacherUsernameInput");

    if (teacherUserInpEl) {
        teacherUserInpEl.placeholder = "Öğretmen kullanıcı adınızı girin";
    }

    const studentModal = document.getElementById("studentEntryModal");
    const closeStudentBtn = document.getElementById("closeStudentModalBtn");
    const studentForm = document.getElementById("studentNicknameForm");
    const continueSavedBtn = document.getElementById("continueSavedPlayerBtn");

    const miniProfileBtn = document.getElementById("miniProfileBtn");
    const profileDropdown = document.getElementById("profileDropdownMenu");
    const logoutBtn = document.getElementById("logoutBtn");

    teacherTriggerBtn?.addEventListener("click", () => {
        teacherError?.classList.add("hidden");
        teacherModal?.classList.remove("hidden");
        soundEngine.playPageFlip();
    });

    closeTeacherBtn?.addEventListener("click", () => {
        teacherModal?.classList.add("hidden");
    });

    teacherForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        const userInp = (document.getElementById("teacherUsernameInput")?.value || "").trim().toLowerCase();
        const passInp = (document.getElementById("teacherPasswordInput")?.value || "").trim();

        if (userInp === STUDIO_CONFIG.teacherUsername.toLowerCase() && passInp === STUDIO_CONFIG.teacherPassword) {
            appState.isTeacher = true;
            localStorage.setItem(STUDIO_CONFIG.storageKeys.teacherLoggedIn, "true");
            teacherModal?.classList.add("hidden");
            soundEngine.playPageFlip();
            syncRoleAndProfileUI();
        } else {
            teacherError?.classList.remove("hidden");
            soundEngine.playFeedbackTone(false);
        }
    });

    closeStudentBtn?.addEventListener("click", () => {
        studentModal?.classList.add("hidden");
    });

    continueSavedBtn?.addEventListener("click", () => {
        const scoresMap = getStudentScoresMap();
        const keys = Object.keys(scoresMap);
        if (keys.length > 0) {
            const lastSaved = scoresMap[keys[keys.length - 1]];
            appState.studentProfile = { ...lastSaved };
            localStorage.setItem(STUDIO_CONFIG.storageKeys.activeStudentProfile, JSON.stringify(appState.studentProfile));
            studentModal?.classList.add("hidden");
            soundEngine.playPageFlip();
            syncRoleAndProfileUI();
        }
    });

    studentForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        const nameInput = document.getElementById("studentNicknameInput");
        const nickname = (nameInput?.value || "").trim();
        if (!nickname) return;

        const genderRadio = document.querySelector('input[name="studentGender"]:checked');
        const gender = genderRadio ? genderRadio.value : "girl";

        const scoresMap = getStudentScoresMap();
        const existingRecord = scoresMap[nickname.toLowerCase()];

        if (existingRecord) {
            appState.studentProfile = {
                name: existingRecord.name,
                gender: gender || existingRecord.gender,
                score: existingRecord.score
            };
        } else {
            appState.studentProfile = {
                name: nickname,
                gender,
                score: 0
            };
            scoresMap[nickname.toLowerCase()] = appState.studentProfile;
            localStorage.setItem(STUDIO_CONFIG.storageKeys.studentScoresMap, JSON.stringify(scoresMap));
        }

        localStorage.setItem(STUDIO_CONFIG.storageKeys.activeStudentProfile, JSON.stringify(appState.studentProfile));
        studentModal?.classList.add("hidden");
        soundEngine.playPageFlip();
        syncRoleAndProfileUI();
    });

    miniProfileBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        profileDropdown?.classList.toggle("hidden");
    });

    document.addEventListener("click", () => {
        profileDropdown?.classList.add("hidden");
    });

    logoutBtn?.addEventListener("click", () => {
        if (appState.isTeacher) {
            appState.isTeacher = false;
            localStorage.removeItem(STUDIO_CONFIG.storageKeys.teacherLoggedIn);
            switchStudioView("view-home");
            if (appState.isTeacherPortalLink) {
                teacherModal?.classList.remove("hidden");
            }
        } else {
            appState.studentProfile = null;
            localStorage.removeItem(STUDIO_CONFIG.storageKeys.activeStudentProfile);
        }
        profileDropdown?.classList.add("hidden");
        soundEngine.playPageFlip();
        syncRoleAndProfileUI();
    });
}

function openStudentNicknameModal() {
    const modal = document.getElementById("studentEntryModal");
    const savedPromptBox = document.getElementById("savedPlayerPromptBox");
    const savedNameText = document.getElementById("savedPlayerNameText");
    const savedScoreText = document.getElementById("savedPlayerScoreText");

    const scoresMap = getStudentScoresMap();
    const keys = Object.keys(scoresMap);

    if (keys.length > 0) {
        const lastSaved = scoresMap[keys[keys.length - 1]];
        savedPromptBox?.classList.remove("hidden");
        if (savedNameText) savedNameText.textContent = `👤 ${lastSaved.name}`;
        if (savedScoreText) savedScoreText.textContent = `⭐ ${lastSaved.score} Puan`;
    } else {
        savedPromptBox?.classList.add("hidden");
    }

    modal?.classList.remove("hidden");
}