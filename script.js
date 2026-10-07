    // Helpers globais
    function icons() { try { if (window.lucide) lucide.createIcons(); } catch (e) {} }
    function esc(v) { return String(v == null ? '' : v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
    function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
    function lsJSON(k, def) { try { const v = JSON.parse(lsGet(k)); return Array.isArray(v) ? v : def; } catch (e) { return def; } }
    function lsInt(k, def) { const n = parseInt(lsGet(k), 10); return Number.isFinite(n) ? n : def; }
    const MAX_LIVES = 5, LIFE_REGEN_MS = 15 * 60 * 1000;
    // Prevenção de comportamentos indesejados no mobile/desktop
    document.addEventListener('touchmove', function(event) {
        if (event.scale !== 1) { event.preventDefault(); }
    }, { passive: false });
    document.addEventListener('wheel', function(event) {
        if (event.ctrlKey) { event.preventDefault(); }
    }, { passive: false });

    // ==========================================
    // AUDIO ENGINE (preloaded MP3 effects with fallback)
    // Uses remote MP3s for click/correct/error and falls back to a simple synth if needed
    // ==========================================
    const AudioEngine = {
        ctx: null,
        buffers: {},
        htmlAudio: {},
        initialized: false,

        init() {
            if (this.initialized) return;
            this.initialized = true;

            // Try to create AudioContext for fallback synth (not required for HTMLAudio playback)
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioContext();
            } catch (e) {
                this.ctx = null;
            }

            // Efeitos sintetizados (sem dependência de links externos)
        },

        // Play effect by key: 'click', 'correct', 'wrong'
        play(type) {
            if (lsGet('nova_sound') === 'off') return;
            this.init();
            this._synthFallback(type);
        },

        // Minimal synth fallback (keeps prior behavior)
        _synthFallback(type) {
            if (!this.ctx) return; // nothing to do
            try {
                if (this.ctx.state === 'suspended') this.ctx.resume();
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                const now = this.ctx.currentTime;

                if (type === 'correct') {
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(523.25, now); // C5
                    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5
                    gain.gain.setValueAtTime(0.5, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                    osc.start(now); osc.stop(now + 0.4);
                } else if (type === 'wrong') {
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(150, now);
                    osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
                    gain.gain.setValueAtTime(0.4, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                    osc.start(now); osc.stop(now + 0.3);
                } else if (type === 'click') {
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(1000, now);
                    gain.gain.setValueAtTime(0.08, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                    osc.start(now); osc.stop(now + 0.09);
                }
            } catch (e) {
                // silent fail
            }
        }
    };

    // ==========================================
    // MASSIVE DB (6 Leagues, 40 Levels)
    // Progressão completa do Básico (1) à Fluência (40)
    // ==========================================
    const DB = {
leagues: [
    { id: 1, name: "Bronze League", color: "var(--amber-500)", range: [1, 7] },
    { id: 2, name: "Silver League", color: "var(--slate-400)", range: [8, 14] },
    { id: 3, name: "Gold League", color: "var(--amber-400)", range: [15, 21] },
    { id: 4, name: "Platinum League", color: "var(--sky-400)", range: [22, 28] },
    { id: 5, name: "Diamond League", color: "var(--indigo-500)", range: [29, 35] },
    { id: 6, name: "Expert League", color: "var(--emerald-500)", range: [36, 42] },
    { id: 7, name: "Champion League", color: "var(--violet-500)", range: [43, 49] },

    // Master expandida (topo)
    { id: 8, name: "Master League", color: "var(--rose-500)", range: [50, 60] }
],
        levels: {
            1: { 
    title: "Primeiros Passos", 
    icon: "message-circle", 
    desc: "Saudações, cortesia e frases bem básicas.", 
    tip: "Em inglês, o pronome 'I' sempre é escrito com letra maiúscula.", 
    vocab: ["Hello", "Hi", "Goodbye", "Please", "Thanks", "Yes", "No", "I am", "My name is", "See you"],
    pool: [
        { type: "sel", q: "Qual é a melhor forma de dizer 'Olá' formalmente?", opts: ["Hello", "Goodbye", "Blue", "Water"], a: "Hello" },
        { type: "sel", q: "Como se diz 'Tchau'?", opts: ["Please", "Yes", "Goodbye", "No"], a: "Goodbye" },
        { type: "sel", q: "O que significa 'Please'?", opts: ["Obrigado", "Por favor", "Desculpe", "Com licença"], a: "Por favor" },
        { type: "sel", q: "Como se diz 'Sim' em inglês?", opts: ["No", "Yes", "Hi", "Bye"], a: "Yes" },
        { type: "sel", q: "Como se diz 'Não' em inglês?", opts: ["No", "Now", "Not", "Know"], a: "No" },
        { type: "sel", q: "Qual palavra em inglês significa 'Obrigado'?", opts: ["Sorry", "Thank you", "Hello", "Please"], a: "Thank you" },
        { type: "sel", q: "Qual opção é uma saudação informal?", opts: ["Greetings", "Salutations", "Hi", "Farewell"], a: "Hi" },
        { type: "sel", q: "Qual frase é usada para se despedir?", opts: ["See you", "Thank you", "Good morning", "Please"], a: "See you" },
        { type: "sel", q: "Qual palavra combina com educação?", opts: ["Please", "Dog", "Car", "Blue"], a: "Please" },
        { type: "sel", q: "Como se diz 'Meu nome é'?", opts: ["My name is", "I am name", "Name my is", "I name am"], a: "My name is" },

        { type: "match", pairs: { "Olá": "Hello", "Tchau": "Goodbye", "Sim": "Yes", "Não": "No" } },
        { type: "match", pairs: { "Obrigado": "Thank you", "Por favor": "Please", "Oi": "Hi", "Adeus": "Goodbye" } },
        { type: "match", pairs: { "Meu nome é": "My name is", "Até logo": "See you", "Desculpe": "Sorry", "Bom dia": "Good morning" } },

        { type: "assemble", q: "Eu sou um estudante", words: ["I", "am", "a", "student", "is", "teacher"], a: ["I am a student", "I'm a student", "I am student"] },
        { type: "assemble", q: "Eu sou do Brasil", words: ["I", "am", "from", "Brazil", "to", "are"], a: ["I am from Brazil", "I'm from Brazil"] },
        { type: "assemble", q: "Muito obrigado", words: ["Thank", "you", "very", "much", "is", "a"], a: ["Thank you very much"] },
        { type: "assemble", q: "Eu não sei", words: ["I", "do", "not", "know", "do", "did"], a: ["I do not know", "I don't know"] },
        { type: "assemble", q: "Meu nome é Ana", words: ["My", "name", "is", "Ana", "I", "am"], a: ["My name is Ana", "My name's Ana"] },
        { type: "assemble", q: "Eu sou feliz", words: ["I", "am", "happy", "sad", "angry"], a: ["I am happy", "I'm happy"] },

        { type: "write", target: "pt", q: "Good morning", a: ["Bom dia", "Bom dia!"] },
        { type: "write", target: "en", q: "Por favor", a: ["Please"] },
        { type: "write", target: "en", q: "Sim", a: ["Yes", "Yeah", "Yep"] },
        { type: "write", target: "pt", q: "I am fine", a: ["Eu estou bem", "Estou bem", "Tudo bem", "Eu tô bem", "Tô bem"] },
        { type: "write", target: "en", q: "Obrigado", a: ["Thank you", "Thanks"] },
        { type: "write", target: "pt", q: "See you", a: ["Até logo", "Te vejo", "Até mais"] },
        { type: "write", target: "en", q: "Desculpe", a: ["Sorry"] },
        { type: "write", target: "pt", q: "My name is Maria", a: ["Meu nome é Maria"] },

        { type: "listen", target: "pt", q: "Thank you", a: ["Obrigado", "Obrigada", "Valeu", "Agradeço", "Grato", "Grata"] },
        { type: "listen", target: "pt", q: "Good night", a: ["Boa noite", "Boa noite!"] },
        { type: "listen", target: "pt", q: "Good afternoon", a: ["Boa tarde", "A tarde boa"] },
        { type: "listen", target: "pt", q: "Hello", a: ["Olá", "Oi"] },
        { type: "listen", target: "pt", q: "My name is John", a: ["Meu nome é John", "Meu nome é João"] }
    ]
},
2: { 
    title: "Apresentações", 
    icon: "user", 
    desc: "Fale sobre você e sobre outras pessoas.", 
    tip: "Use o verbo 'to be' para dizer quem você é ou como alguém está: I am, He is, She is, They are.", 
    vocab: ["Name", "Friend", "Teacher", "He", "She", "They", "We", "Nice to meet you", "My friend", "Boy", "Girl"],
    pool: [
        { type: "sel", q: "Como se diz em inglês: 'Eu sou um professor'?", opts: ["I am a teacher", "I work", "I like study", "I am student"], a: "I am a teacher" },
        { type: "sel", q: "Qual o pronome para 'ela'?", opts: ["He", "She", "It", "They"], a: "She" },
        { type: "sel", q: "Qual palavra significa 'amigo'?", opts: ["Friend", "Teacher", "Name", "Family"], a: "Friend" },
        { type: "sel", q: "Qual é o pronome para 'ele'?", opts: ["She", "He", "We", "They"], a: "He" },
        { type: "sel", q: "Como se diz 'Muito prazer'?", opts: ["Nice to meet you", "Goodbye", "Thank you", "Please"], a: "Nice to meet you" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I is a student", "I am a student", "I are a student", "I be a student"], a: "I am a student" },
        { type: "sel", q: "Como se diz 'Meu amigo'?", opts: ["My friend", "Me friend", "I friend", "Mine friend"], a: "My friend" },
        { type: "sel", q: "Qual opção é um pronome plural?", opts: ["They", "He", "She", "I"], a: "They" },
        { type: "sel", q: "Qual frase está correta para apresentação?", opts: ["My name is Anna", "Name is my Anna", "Anna is my name", "I name Anna"], a: "My name is Anna" },

        { type: "match", pairs: { "Eu": "I", "Ele": "He", "Ela": "She", "Nós": "We" } },
        { type: "match", pairs: { "Amigo": "Friend", "Nome": "Name", "Professor": "Teacher", "Eles": "They" } },
        { type: "match", pairs: { "Menino": "Boy", "Menina": "Girl", "Nós": "We", "Meu amigo": "My friend" } },

        { type: "assemble", q: "Ele é meu amigo", words: ["He", "is", "my", "friend", "am", "she"], a: ["He is my friend", "He's my friend"] },
        { type: "assemble", q: "Eles estão felizes", words: ["They", "are", "happy", "is", "we"], a: ["They are happy", "They're happy"] },
        { type: "assemble", q: "Ela é uma médica", words: ["She", "is", "a", "doctor", "he", "are"], a: ["She is a doctor", "She's a doctor"] },
        { type: "assemble", q: "Meu nome é Anna", words: ["My", "name", "is", "Anna", "your", "friend"], a: ["My name is Anna", "My name's Anna"] },
        { type: "assemble", q: "Nós somos amigos", words: ["We", "are", "friends", "is", "they"], a: ["We are friends", "We're friends"] },
        { type: "assemble", q: "Ele é um menino", words: ["He", "is", "a", "boy", "girl", "we"], a: ["He is a boy", "He's a boy"] },

        { type: "write", target: "en", q: "Meu nome é Anna", a: ["My name is Anna", "My name's Anna"] },
        { type: "write", target: "pt", q: "We are fine", a: ["Nós estamos bem", "Estamos bem", "A gente tá bem", "A gente está bem"] },
        { type: "write", target: "en", q: "Ela é minha amiga", a: ["She is my friend", "She's my friend"] },
        { type: "write", target: "pt", q: "He is my teacher", a: ["Ele é meu professor", "Ele é minha professora"] },
        { type: "write", target: "en", q: "Meu amigo está feliz", a: ["My friend is happy"] },
        { type: "write", target: "pt", q: "They are my friends", a: ["Eles são meus amigos", "Elas são minhas amigas"] },

        { type: "listen", target: "pt", q: "Nice to meet you", a: ["Prazer em conhecer", "Prazer em te conhecer", "Muito prazer", "Prazer"] },
        { type: "listen", target: "en", q: "She is my friend", a: ["She is my friend", "She's my friend"] },
        { type: "listen", target: "pt", q: "My name is John", a: ["Meu nome é John", "Meu nome é João"] },
        { type: "listen", target: "pt", q: "He is a teacher", a: ["Ele é um professor", "Ele é professora"] }
    ]
},
3: { 
    title: "Cores & Formas", 
    icon: "palette", 
    desc: "Vocabulário de cores e formas simples.", 
    tip: "Em inglês, a cor vem antes do substantivo: 'red car', não 'car red'.", 
    vocab: ["Red", "Blue", "Green", "Yellow", "Black", "White", "Circle", "Square", "Pink", "Brown", "Orange"],
    pool: [
        { type: "sel", q: "Qual é a cor 'Yellow'?", opts: ["Azul", "Amarelo", "Verde", "Vermelho"], a: "Amarelo" },
        { type: "sel", q: "Qual a tradução para 'Verde'?", opts: ["Gray", "Green", "Pink", "Brown"], a: "Green" },
        { type: "sel", q: "Qual palavra significa 'azul'?", opts: ["Blue", "Black", "White", "Brown"], a: "Blue" },
        { type: "sel", q: "Qual opção é uma forma?", opts: ["Circle", "Car", "Milk", "Bird"], a: "Circle" },
        { type: "sel", q: "Qual palavra significa 'preto'?", opts: ["White", "Black", "Green", "Red"], a: "Black" },
        { type: "sel", q: "Qual frase está correta?", opts: ["Red car", "Car red", "Red is car", "Car the red"], a: "Red car" },
        { type: "sel", q: "Qual é a cor 'Pink'?", opts: ["Rosa", "Preto", "Branco", "Azul"], a: "Rosa" },
        { type: "sel", q: "Qual palavra significa 'marrom'?", opts: ["Brown", "Green", "Yellow", "Gray"], a: "Brown" },
        { type: "sel", q: "Qual opção é uma forma geométrica?", opts: ["Square", "Soup", "Milk", "Dog"], a: "Square" },

        { type: "match", pairs: { "Azul": "Blue", "Vermelho": "Red", "Branco": "White", "Preto": "Black" } },
        { type: "match", pairs: { "Amarelo": "Yellow", "Verde": "Green", "Rosa": "Pink", "Círculo": "Circle" } },
        { type: "match", pairs: { "Marrom": "Brown", "Laranja": "Orange", "Quadrado": "Square", "Forma": "Shape" } },

        { type: "assemble", q: "O céu é azul", words: ["The", "sky", "is", "blue", "red", "are"], a: ["The sky is blue"] },
        { type: "assemble", q: "Eu tenho um carro vermelho", words: ["I", "have", "a", "red", "car", "blue", "has"], a: ["I have a red car", "I've a red car"] },
        { type: "assemble", q: "A bola é redonda", words: ["The", "ball", "is", "round", "blue", "square"], a: ["The ball is round"] },
        { type: "assemble", q: "Minha camisa é preta", words: ["My", "shirt", "is", "black", "white", "blue"], a: ["My shirt is black"] },
        { type: "assemble", q: "A casa é branca", words: ["The", "house", "is", "white", "black", "green"], a: ["The house is white"] },

        { type: "write", target: "en", q: "Gato preto", a: ["Black cat", "A black cat", "The black cat"] },
        { type: "write", target: "pt", q: "Pink circle", a: ["Círculo rosa", "Um círculo rosa", "O círculo rosa"] },
        { type: "write", target: "pt", q: "Green apple", a: ["Maçã verde", "Uma maçã verde", "A maçã verde"] },
        { type: "write", target: "en", q: "Casa branca", a: ["White house", "A white house", "The white house"] },
        { type: "write", target: "en", q: "Quadrado azul", a: ["Blue square", "A blue square", "The blue square"] },

        { type: "listen", target: "pt", q: "Blue sky", a: ["Céu azul", "O céu azul", "Um céu azul"] },
        { type: "listen", target: "pt", q: "Red car", a: ["Carro vermelho", "Um carro vermelho", "O carro vermelho"] },
        { type: "listen", target: "pt", q: "White house", a: ["Casa branca", "Uma casa branca", "A casa branca"] }
    ]
},
4: { 
    title: "Comida & Bebida", 
    icon: "coffee", 
    desc: "Comidas e bebidas muito comuns.", 
    tip: "'Breakfast' é café da manhã, 'Lunch' é almoço e 'Dinner' é jantar.", 
    vocab: ["Water", "Coffee", "Milk", "Bread", "Cheese", "Meat", "Breakfast", "Lunch", "Dinner", "Rice", "Apple", "Egg"],
    pool: [
        { type: "sel", q: "Como se diz 'Água'?", opts: ["Milk", "Juice", "Water", "Tea"], a: "Water" },
        { type: "sel", q: "O que é 'Dinner'?", opts: ["Almoço", "Lanche", "Jantar", "Café"], a: "Jantar" },
        { type: "sel", q: "Como se diz 'Pão'?", opts: ["Bread", "Cheese", "Milk", "Meat"], a: "Bread" },
        { type: "sel", q: "Qual palavra significa 'leite'?", opts: ["Milk", "Meat", "Meal", "Mile"], a: "Milk" },
        { type: "sel", q: "Qual refeição é o café da manhã?", opts: ["Dinner", "Lunch", "Breakfast", "Snack"], a: "Breakfast" },
        { type: "sel", q: "Como se diz 'Queijo'?", opts: ["Cheese", "Coffee", "Rice", "Bread"], a: "Cheese" },
        { type: "sel", q: "Qual palavra significa 'arroz'?", opts: ["Rice", "Root", "Read", "Road"], a: "Rice" },
        { type: "sel", q: "Qual alimento é 'Egg'?", opts: ["Ovo", "Água", "Carne", "Pão"], a: "Ovo" },

        { type: "match", pairs: { "Pão": "Bread", "Queijo": "Cheese", "Carne": "Meat", "Leite": "Milk" } },
        { type: "match", pairs: { "Água": "Water", "Café": "Coffee", "Almoço": "Lunch", "Jantar": "Dinner" } },
        { type: "match", pairs: { "Arroz": "Rice", "Ovo": "Egg", "Maçã": "Apple", "Suco": "Juice" } },

        { type: "assemble", q: "Eu bebo leite", words: ["I", "drink", "milk", "eat", "water"], a: ["I drink milk"] },
        { type: "assemble", q: "Nós comemos pão", words: ["We", "eat", "bread", "drink", "meat"], a: ["We eat bread"] },
        { type: "assemble", q: "Eu gosto de queijo", words: ["I", "like", "cheese", "eat", "milk"], a: ["I like cheese"] },
        { type: "assemble", q: "Eu como arroz", words: ["I", "eat", "rice", "drink", "apple"], a: ["I eat rice"] },
        { type: "assemble", q: "Ela bebe água", words: ["She", "drinks", "water", "eat", "milk"], a: ["She drinks water"] },

        { type: "write", target: "pt", q: "I eat an apple", a: ["Eu como uma maçã", "Como uma maçã", "Estou comendo uma maçã"] },
        { type: "write", target: "pt", q: "I like cheese", a: ["Eu gosto de queijo", "Gosto de queijo"] },
        { type: "write", target: "pt", q: "Hot coffee", a: ["Café quente", "Um café quente", "O café quente"] },
        { type: "write", target: "en", q: "Eu bebo água", a: ["I drink water"] },
        { type: "write", target: "en", q: "Ela come arroz", a: ["She eats rice"] },

        { type: "listen", target: "pt", q: "I like bread", a: ["Eu gosto de pão", "Gosto de pão"] },
        { type: "listen", target: "pt", q: "We eat rice", a: ["Nós comemos arroz", "A gente come arroz"] },
        { type: "listen", target: "pt", q: "She drinks water", a: ["Ela bebe água"] }
    ]
},
5: { 
    title: "Animais", 
    icon: "paw-print", 
    desc: "Nomes de animais bem comuns.", 
    tip: "O plural da maioria dos animais leva 's', mas 'fish' pode continuar igual no plural.", 
    vocab: ["Dog", "Cat", "Bird", "Fish", "Lion", "Elephant", "Monkey", "Horse", "Cow", "Duck", "Bear"],
    pool: [
        { type: "sel", q: "Como se diz 'Cachorro'?", opts: ["Cat", "Bird", "Dog", "Fish"], a: "Dog" },
        { type: "sel", q: "Como se diz 'Gato'?", opts: ["Cat", "Cow", "Lion", "Duck"], a: "Cat" },
        { type: "sel", q: "Como se diz 'Pássaro'?", opts: ["Bird", "Bear", "Horse", "Mouse"], a: "Bird" },
        { type: "sel", q: "Como se diz 'Peixe'?", opts: ["Fish", "Frog", "Fox", "Goat"], a: "Fish" },
        { type: "sel", q: "Qual animal é 'Lion'?", opts: ["Leão", "Tigre", "Elefante", "Lobo"], a: "Leão" },
        { type: "sel", q: "Qual frase está correta?", opts: ["The cat sleeps", "Cat the sleeps", "Sleeps the cat", "The sleeps cat"], a: "The cat sleeps" },
        { type: "sel", q: "Como se diz 'Vaca'?", opts: ["Cow", "Crow", "Cat", "Cowd"], a: "Cow" },
        { type: "sel", q: "Como se diz 'Pato'?", opts: ["Duck", "Dog", "Deer", "Dove"], a: "Duck" },

        { type: "match", pairs: { "Gato": "Cat", "Pássaro": "Bird", "Peixe": "Fish", "Macaco": "Monkey" } },
        { type: "match", pairs: { "Leão": "Lion", "Elefante": "Elephant", "Cavalo": "Horse", "Cachorro": "Dog" } },
        { type: "match", pairs: { "Vaca": "Cow", "Pato": "Duck", "Urso": "Bear", "Macaco": "Monkey" } },

        { type: "assemble", q: "O gato dorme", words: ["The", "cat", "sleeps", "dog", "sleep"], a: ["The cat sleeps"] },
        { type: "assemble", q: "O pássaro voa", words: ["The", "bird", "flies", "fish", "fly"], a: ["The bird flies"] },
        { type: "assemble", q: "O cachorro corre", words: ["The", "dog", "runs", "cat", "run"], a: ["The dog runs"] },
        { type: "assemble", q: "O cavalo é grande", words: ["The", "horse", "is", "big", "small", "fast"], a: ["The horse is big"] },

        { type: "write", target: "pt", q: "The bird flies", a: ["O pássaro voa", "O passarinho voa"] },
        { type: "write", target: "en", q: "Leão", a: ["Lion", "A lion", "The lion"] },
        { type: "write", target: "pt", q: "Big elephant", a: ["Elefante grande", "Um elefante grande", "O elefante grande"] },
        { type: "write", target: "en", q: "Cachorro pequeno", a: ["Small dog", "A small dog", "The small dog"] },
        { type: "write", target: "pt", q: "The cow is big", a: ["A vaca é grande", "A vaca está grande"] },

        { type: "listen", target: "en", q: "The cat is small", a: ["The cat is small", "A cat is small"] },
        { type: "listen", target: "pt", q: "The dog is big", a: ["O cachorro é grande", "O cão é grande"] },
        { type: "listen", target: "pt", q: "The duck is yellow", a: ["O pato é amarelo"] }
    ]
},
6: {
    title: "Família",
    icon: "users",
    desc: "Família e parentes próximos.", 
    tip: "Use 'my' para dizer 'meu/minha'. Ex: 'My mother' = minha mãe.", 
    vocab: ["Mother", "Father", "Brother", "Sister", "Family", "Grandmother", "Grandfather", "Uncle", "Aunt", "Cousin", "Mom", "Dad"],
    pool: [
        { type: "sel", q: "Como se diz 'Irmão' em inglês?", opts: ["Father", "Brother", "Uncle", "Sister"], a: "Brother" },
        { type: "sel", q: "Como se diz 'Mãe'?", opts: ["Mother", "Sister", "Aunt", "Grandfather"], a: "Mother" },
        { type: "sel", q: "Como se diz 'Pai'?", opts: ["Uncle", "Father", "Brother", "Son"], a: "Father" },
        { type: "sel", q: "Qual palavra significa 'família'?", opts: ["Family", "Friend", "House", "People"], a: "Family" },
        { type: "sel", q: "Qual frase está correta?", opts: ["My mother is nice", "Mother my is nice", "My nice mother is", "Is my mother nice"], a: "My mother is nice" },
        { type: "sel", q: "Como se diz 'Tia'?", opts: ["Aunt", "Uncle", "Cousin", "Niece"], a: "Aunt" },
        { type: "sel", q: "Como se diz 'Avô'?", opts: ["Grandfather", "Grandmother", "Brother", "Father"], a: "Grandfather" },
        { type: "sel", q: "Como se diz 'Primo'?", opts: ["Cousin", "Couse", "Brother", "Child"], a: "Cousin" },

        { type: "match", pairs: { "Mãe": "Mother", "Pai": "Father", "Irmã": "Sister", "Avó": "Grandmother" } },
        { type: "match", pairs: { "Tio": "Uncle", "Tia": "Aunt", "Primo": "Cousin", "Família": "Family" } },
        { type: "match", pairs: { "Mãe": "Mom", "Pai": "Dad", "Avô": "Grandfather", "Avó": "Grandmother" } },

        { type: "assemble", q: "Eu amo minha família", words: ["I", "love", "my", "family", "like", "mother"], a: ["I love my family"] },
        { type: "assemble", q: "Meu pai é forte", words: ["My", "father", "is", "strong", "old", "young"], a: ["My father is strong"] },
        { type: "assemble", q: "Minha mãe é gentil", words: ["My", "mother", "is", "kind", "good", "bad"], a: ["My mother is kind"] },
        { type: "assemble", q: "Meu irmão é pequeno", words: ["My", "brother", "is", "small", "big", "tall"], a: ["My brother is small"] },
        { type: "assemble", q: "Minha família é grande", words: ["My", "family", "is", "big", "small", "new"], a: ["My family is big"] },

        { type: "write", target: "en", q: "Ele é meu pai", a: ["He is my father", "He's my father", "He is my dad", "He's my dad"] },
        { type: "write", target: "en", q: "Ela é minha mãe", a: ["She is my mother", "She's my mother", "She is my mom", "She's my mom"] },
        { type: "write", target: "pt", q: "She is my sister", a: ["Ela é minha irmã"] },
        { type: "write", target: "en", q: "Minha avó é velha", a: ["My grandmother is old", "My grandma is old"] },
        { type: "write", target: "pt", q: "My uncle is tall", a: ["Meu tio é alto"] },

        { type: "listen", target: "pt", q: "My father is tall", a: ["Meu pai é alto"] },
        { type: "listen", target: "pt", q: "My family is big", a: ["Minha família é grande"] },
        { type: "listen", target: "pt", q: "My aunt is kind", a: ["Minha tia é gentil"] }
    ]
},
7: {
    title: "Números & Tempo",
    icon: "clock",
    desc: "Contagem e horas bem básicas.",
    tip: "Para horas exatas, use 'o'clock'. Ex: 'It is two o'clock'.", 
    vocab: ["One", "Two", "Three", "Four", "Five", "Ten", "Time", "Clock", "Hour", "Minute", "Morning", "Night"],
    pool: [
        { type: "sel", q: "Qual o número 'Three'?", opts: ["Um", "Dois", "Três", "Dez"], a: "Três" },
        { type: "sel", q: "Qual palavra significa 'um'?", opts: ["One", "Two", "Ten", "Time"], a: "One" },
        { type: "sel", q: "Qual palavra significa 'dois'?", opts: ["One", "Three", "Two", "Clock"], a: "Two" },
        { type: "sel", q: "Qual palavra significa 'hora'?", opts: ["Hour", "Minute", "Time", "Clock"], a: "Hour" },
        { type: "sel", q: "Como se pergunta 'Que horas são?'?", opts: ["What time is it?", "How old are you?", "Where are you?", "What is your name?"], a: "What time is it?" },
        { type: "sel", q: "Qual frase está correta para 3 horas exatas?", opts: ["It is three o'clock", "It is three hour", "It is three minute", "It is three time"], a: "It is three o'clock" },
        { type: "sel", q: "Qual número vem depois de two?", opts: ["One", "Three", "Four", "Ten"], a: "Three" },
        { type: "sel", q: "Como se diz 'cinco'?", opts: ["Five", "Four", "Seven", "Ten"], a: "Five" },

        { type: "match", pairs: { "Um": "One", "Dois": "Two", "Dez": "Ten", "Hora": "Hour" } },
        { type: "match", pairs: { "Três": "Three", "Minuto": "Minute", "Tempo": "Time", "Relógio": "Clock" } },
        { type: "match", pairs: { "Quatro": "Four", "Cinco": "Five", "Manhã": "Morning", "Noite": "Night" } },

        { type: "assemble", q: "Que horas são?", words: ["What", "time", "is", "it", "hour", "are"], a: ["What time is it", "What time is it?"] },
        { type: "assemble", q: "São três horas", words: ["It", "is", "three", "o'clock", "clock", "time"], a: ["It is three o'clock", "It's three o'clock"] },
        { type: "assemble", q: "Faltam dez minutos", words: ["Ten", "minutes", "left", "time", "hour"], a: ["Ten minutes left"] },
        { type: "assemble", q: "São cinco horas", words: ["It", "is", "five", "o'clock", "minute"], a: ["It is five o'clock", "It's five o'clock"] },
        { type: "assemble", q: "É de manhã", words: ["It", "is", "morning", "night", "day"], a: ["It is morning"] },

        { type: "write", target: "en", q: "São duas horas", a: ["It is two o'clock", "It's two o'clock"] },
        { type: "write", target: "pt", q: "I have two cats", a: ["Eu tenho dois gatos"] },
        { type: "write", target: "en", q: "Eu tenho três irmãos", a: ["I have three brothers"] },
        { type: "write", target: "pt", q: "One, two, three", a: ["Um, dois, três"] },
        { type: "write", target: "en", q: "São dez horas", a: ["It is ten o'clock", "It's ten o'clock"] },

        { type: "listen", target: "pt", q: "It is ten o'clock", a: ["São dez horas"] },
        { type: "listen", target: "pt", q: "I have one brother", a: ["Eu tenho um irmão"] },
        { type: "listen", target: "pt", q: "It is morning", a: ["É de manhã"] }
    ]
},
8: {
    title: "Clima & Roupas",
    icon: "cloud-sun",
    desc: "Tempo, temperatura e roupas do dia a dia.",
    tip: "A palavra 'pants' é sempre plural em inglês. Ex: 'My pants are black'.",
    vocab: ["Sun", "Rain", "Cold", "Hot", "Warm", "Shirt", "Pants", "Dress", "Shoes", "Cloud", "Wind", "Snow"],
    pool: [
        { type: "sel", q: "Como se diz 'Chuva'?", opts: ["Sun", "Rain", "Wind", "Cloud"], a: "Rain" },
        { type: "sel", q: "Como se diz 'Sol'?", opts: ["Snow", "Moon", "Sun", "Sky"], a: "Sun" },
        { type: "sel", q: "Qual palavra significa 'frio'?", opts: ["Hot", "Cold", "Warm", "Dry"], a: "Cold" },
        { type: "sel", q: "Qual palavra significa 'camisa'?", opts: ["Shirt", "Dress", "Pants", "Shoes"], a: "Shirt" },
        { type: "sel", q: "Qual palavra significa 'sapatos'?", opts: ["Shoes", "Socks", "Shorts", "Shirt"], a: "Shoes" },
        { type: "sel", q: "Qual frase está correta?", opts: ["It is very cold today", "It are very cold today", "It very is cold today", "Today cold very is"], a: "It is very cold today" },
        { type: "sel", q: "Como se diz 'calças'?", opts: ["Pants", "Pans", "Paints", "Pint"], a: "Pants" },
        { type: "sel", q: "Qual palavra significa 'nuvem'?", opts: ["Cloud", "Crow", "Cloth", "Cloudy"], a: "Cloud" },

        { type: "match", pairs: { "Sol": "Sun", "Quente": "Hot", "Frio": "Cold", "Camisa": "Shirt" } },
        { type: "match", pairs: { "Vestido": "Dress", "Sapatos": "Shoes", "Calças": "Pants", "Chuva": "Rain" } },
        { type: "match", pairs: { "Nuvem": "Cloud", "Vento": "Wind", "Neve": "Snow", "Morno": "Warm" } },

        { type: "assemble", q: "Está muito frio hoje", words: ["It", "is", "very", "cold", "today", "hot"], a: ["It is very cold today", "It's very cold today"] },
        { type: "assemble", q: "Eu gosto do sol", words: ["I", "like", "the", "sun", "rain", "cold"], a: ["I like the sun"] },
        { type: "assemble", q: "Eu visto uma camisa azul", words: ["I", "wear", "a", "blue", "shirt", "dress"], a: ["I wear a blue shirt"] },
        { type: "assemble", q: "Hoje está chovendo", words: ["It", "is", "raining", "today", "sun"], a: ["It is raining today"] },
        { type: "assemble", q: "Meu casaco é quente", words: ["My", "coat", "is", "warm", "cold"], a: ["My coat is warm"] },

        { type: "write", target: "en", q: "Está quente hoje", a: ["It is hot today", "It's hot today"] },
        { type: "write", target: "pt", q: "He wears a blue shirt", a: ["Ele veste uma camisa azul", "Ele usa uma camisa azul"] },
        { type: "write", target: "en", q: "Eu tenho sapatos pretos", a: ["I have black shoes"] },
        { type: "write", target: "pt", q: "My pants are black", a: ["Minhas calças são pretas", "Minha calça é preta"] },
        { type: "write", target: "en", q: "Está chovendo", a: ["It is raining", "It's raining"] },

        { type: "listen", target: "pt", q: "It is raining", a: ["Está chovendo"] },
        { type: "listen", target: "pt", q: "She wears a dress", a: ["Ela veste um vestido", "Ela usa um vestido"] },
        { type: "listen", target: "pt", q: "It is cold today", a: ["Está frio hoje"] }
                ]
            },
            9: {
    title: "Rotina Diária",
    icon: "sunrise",
    desc: "Verbos de ação para o dia a dia.",
    tip: "Para 'He', 'She' e 'It' no presente simples, o verbo normalmente ganha 's' ou 'es'. Ex: 'She wakes up'.",
    vocab: ["Wake up", "Eat", "Work", "Study", "Sleep", "Brush", "Wash", "Always", "Usually", "Never", "Early", "Late"],
    pool: [
        { type: "sel", q: "O que significa 'Wake up'?", opts: ["Dormir", "Acordar", "Comer", "Trabalhar"], a: "Acordar" },
        { type: "sel", q: "O que significa 'Study'?", opts: ["Estudar", "Correr", "Cantar", "Dormir"], a: "Estudar" },
        { type: "sel", q: "O que significa 'Work'?", opts: ["Brincar", "Trabalhar", "Lavar", "Comprar"], a: "Trabalhar" },
        { type: "sel", q: "O que significa 'Sleep'?", opts: ["Acordar", "Dormir", "Ler", "Andar"], a: "Dormir" },
        { type: "sel", q: "Qual palavra quer dizer 'sempre'?", opts: ["Never", "Usually", "Always", "Early"], a: "Always" },
        { type: "sel", q: "Qual palavra quer dizer 'nunca'?", opts: ["Never", "Always", "Often", "Today"], a: "Never" },
        { type: "sel", q: "Como se diz 'escovar os dentes'?", opts: ["Brush my teeth", "Wash my teeth", "Eat my teeth", "Sleep my teeth"], a: "Brush my teeth" },
        { type: "sel", q: "Como se diz 'lavar o rosto'?", opts: ["Wash my face", "Brush my face", "Eat my face", "Sleep my face"], a: "Wash my face" },
        { type: "sel", q: "Qual frase está correta?", opts: ["She wakes up early", "She wake up early", "She waking up early", "She wakes early up"], a: "She wakes up early" },
        { type: "sel", q: "Qual frase está correta?", opts: ["He studies every day", "He study every day", "He studying every day", "He studies every days"], a: "He studies every day" },

        { type: "match", pairs: { "Acordar": "Wake up", "Estudar": "Study", "Trabalhar": "Work", "Dormir": "Sleep" } },
        { type: "match", pairs: { "Escovar": "Brush", "Lavar": "Wash", "Sempre": "Always", "Nunca": "Never" } },
        { type: "match", pairs: { "Geralmente": "Usually", "Cedo": "Early", "Tarde": "Late", "Comer": "Eat" } },

        { type: "assemble", q: "Eu sempre estudo de manhã", words: ["I", "always", "study", "in", "the", "morning", "night"], a: ["I always study in the morning"] },
        { type: "assemble", q: "Ela trabalha muito", words: ["She", "works", "a", "lot", "work", "hard"], a: ["She works a lot", "She works hard"] },
        { type: "assemble", q: "Ele acorda cedo", words: ["He", "wakes", "up", "early", "late", "sleep"], a: ["He wakes up early"] },
        { type: "assemble", q: "Nós dormimos tarde", words: ["We", "sleep", "late", "early", "study"], a: ["We sleep late"] },
        { type: "assemble", q: "Eu escovo os dentes todos os dias", words: ["I", "brush", "my", "teeth", "every", "day"], a: ["I brush my teeth every day"] },
        { type: "assemble", q: "Ela lava o rosto de manhã", words: ["She", "washes", "her", "face", "in", "the", "morning"], a: ["She washes her face in the morning"] },

        { type: "write", target: "en", q: "Ela trabalha muito", a: ["She works a lot", "She works hard"] },
        { type: "write", target: "en", q: "Eu estudo todos os dias", a: ["I study every day"] },
        { type: "write", target: "en", q: "Ele acorda cedo", a: ["He wakes up early"] },
        { type: "write", target: "pt", q: "I never sleep late", a: ["Eu nunca durmo tarde"] },
        { type: "write", target: "pt", q: "They usually eat breakfast at home", a: ["Eles geralmente tomam café da manhã em casa"] },

        { type: "listen", target: "pt", q: "I wash my hands", a: ["Eu lavo minhas mãos"] },
        { type: "listen", target: "pt", q: "She studies at night", a: ["Ela estuda à noite"] },
        { type: "listen", target: "pt", q: "He works every day", a: ["Ele trabalha todos os dias"] }
    ]
},
10: {
    title: "A Casa",
    icon: "home",
    desc: "Cômodos e objetos da casa.",
    tip: "Use 'There is' para singular e 'There are' para plural.",
    vocab: ["House", "Room", "Kitchen", "Bathroom", "Bedroom", "Bed", "Table", "Chair", "Window", "Door", "Sofa", "Lamp"],
    pool: [
        { type: "sel", q: "Onde se prepara a comida?", opts: ["Bathroom", "Kitchen", "Bedroom", "Living room"], a: "Kitchen" },
        { type: "sel", q: "Onde dormimos?", opts: ["Kitchen", "Bathroom", "Bedroom", "Garage"], a: "Bedroom" },
        { type: "sel", q: "Onde tomamos banho?", opts: ["Bathroom", "Kitchen", "Bedroom", "Hall"], a: "Bathroom" },
        { type: "sel", q: "Qual palavra significa 'janela'?", opts: ["Window", "Door", "Wall", "Floor"], a: "Window" },
        { type: "sel", q: "Qual palavra significa 'porta'?", opts: ["Table", "Door", "Sofa", "Lamp"], a: "Door" },
        { type: "sel", q: "Qual frase está correta?", opts: ["There is a chair here", "There are a chair here", "There is chairs here", "There chair is here"], a: "There is a chair here" },
        { type: "sel", q: "Qual frase está correta para plural?", opts: ["There are two windows", "There is two windows", "There are one window", "There window are two"], a: "There are two windows" },
        { type: "sel", q: "Onde sentamos na sala?", opts: ["On the sofa", "In the bed", "At the door", "Under the lamp"], a: "On the sofa" },

        { type: "match", pairs: { "Quarto": "Bedroom", "Banheiro": "Bathroom", "Cama": "Bed", "Mesa": "Table" } },
        { type: "match", pairs: { "Cadeira": "Chair", "Janela": "Window", "Porta": "Door", "Casa": "House" } },
        { type: "match", pairs: { "Sofá": "Sofa", "Lâmpada": "Lamp", "Sala": "Living room", "Cozinha": "Kitchen" } },

        { type: "assemble", q: "Há uma cadeira aqui", words: ["There", "is", "a", "chair", "here", "are"], a: ["There is a chair here", "There's a chair here"] },
        { type: "assemble", q: "Há duas janelas na casa", words: ["There", "are", "two", "windows", "in", "the", "house", "window", "is"], a: ["There are two windows in the house"] },
        { type: "assemble", q: "A mesa está na cozinha", words: ["The", "table", "is", "in", "the", "kitchen"], a: ["The table is in the kitchen"] },
        { type: "assemble", q: "A cama está no quarto", words: ["The", "bed", "is", "in", "the", "bedroom"], a: ["The bed is in the bedroom"] },
        { type: "assemble", q: "Abra a janela", words: ["Open", "the", "window", "door", "please"], a: ["Open the window"] },

        { type: "write", target: "pt", q: "My house is big", a: ["Minha casa é grande"] },
        { type: "write", target: "en", q: "Onde está a cozinha?", a: ["Where is the kitchen?"] },
        { type: "write", target: "en", q: "Há um sofá na sala", a: ["There is a sofa in the living room"] },
        { type: "write", target: "pt", q: "Open the window", a: ["Abra a janela"] },
        { type: "write", target: "pt", q: "The room is small", a: ["O quarto é pequeno"] },

        { type: "listen", target: "en", q: "My house is big", a: ["My house is big"] },
        { type: "listen", target: "pt", q: "There is a bed in the room", a: ["Há uma cama no quarto"] },
        { type: "listen", target: "pt", q: "The kitchen is clean", a: ["A cozinha está limpa"] }
    ]
},
11: {
    title: "Na Cidade",
    icon: "building",
    desc: "Lugares comuns na cidade.",
    tip: "Para perguntar onde fica um lugar, use 'Where is...?'",
    vocab: ["Street", "City", "Hospital", "School", "Bank", "Supermarket", "Park", "Restaurant", "Shop", "Bus stop", "Center", "Library"],
    pool: [
        { type: "sel", q: "Como se diz 'Escola'?", opts: ["School", "Street", "Bank", "Park"], a: "School" },
        { type: "sel", q: "Como se diz 'Hospital'?", opts: ["Hospital", "Hotel", "House", "Hall"], a: "Hospital" },
        { type: "sel", q: "Qual lugar vende comida e produtos?", opts: ["Supermarket", "School", "Park", "Bank"], a: "Supermarket" },
        { type: "sel", q: "Onde compramos livros ou pegamos livros emprestados?", opts: ["Library", "Hospital", "Bank", "Street"], a: "Library" },
        { type: "sel", q: "Qual palavra significa 'rua'?", opts: ["Street", "City", "Park", "Shop"], a: "Street" },
        { type: "sel", q: "Qual frase está correta?", opts: ["Where is the bank?", "Where the bank is?", "Where is bank the?", "Where bank is the?"], a: "Where is the bank?" },
        { type: "sel", q: "Qual lugar é usado para brincar e caminhar?", opts: ["Park", "Bank", "Shop", "Hospital"], a: "Park" },
        { type: "sel", q: "Onde se compra remédios?", opts: ["Pharmacy", "School", "Park", "Restaurant"], a: "Pharmacy" },

        { type: "match", pairs: { "Rua": "Street", "Banco": "Bank", "Parque": "Park", "Cidade": "City" } },
        { type: "match", pairs: { "Escola": "School", "Hospital": "Hospital", "Restaurante": "Restaurant", "Mercado": "Supermarket" } },
        { type: "match", pairs: { "Biblioteca": "Library", "Loja": "Shop", "Centro": "Center", "Ponto de ônibus": "Bus stop" } },

        { type: "assemble", q: "Onde fica o banco?", words: ["Where", "is", "the", "bank", "are", "what"], a: ["Where is the bank?", "Where is the bank"] },
        { type: "assemble", q: "Eu vou para a escola", words: ["I", "go", "to", "school", "am", "going"], a: ["I go to school", "I am going to school"] },
        { type: "assemble", q: "Nós caminhamos no parque", words: ["We", "walk", "in", "the", "park", "walks"], a: ["We walk in the park"] },
        { type: "assemble", q: "O hospital é grande", words: ["The", "hospital", "is", "big", "small", "new"], a: ["The hospital is big"] },
        { type: "assemble", q: "A biblioteca é silenciosa", words: ["The", "library", "is", "quiet", "loud", "fast"], a: ["The library is quiet"] },

        { type: "write", target: "en", q: "Eu moro na cidade", a: ["I live in the city"] },
        { type: "write", target: "pt", q: "The restaurant is good", a: ["O restaurante é bom"] },
        { type: "write", target: "en", q: "Onde fica a escola?", a: ["Where is the school?"] },
        { type: "write", target: "pt", q: "The bank is near the park", a: ["O banco fica perto do parque"] },
        { type: "write", target: "en", q: "Tem uma loja na rua", a: ["There is a shop on the street"] },

        { type: "listen", target: "pt", q: "The restaurant is good", a: ["O restaurante é bom"] },
        { type: "listen", target: "pt", q: "Where is the hospital?", a: ["Onde fica o hospital?"] },
        { type: "listen", target: "pt", q: "The park is big", a: ["O parque é grande"] }
    ]
},
12: {
    title: "Profissões",
    icon: "briefcase",
    desc: "Fale sobre trabalho e empregos.",
    tip: "Use 'a' ou 'an' antes de profissões no singular. Ex: 'I am a doctor'.",
    vocab: ["Doctor", "Nurse", "Police", "Engineer", "Teacher", "Job", "Work", "Boss", "Office", "Driver", "Cook", "Farmer"],
    pool: [
        { type: "sel", q: "Quem cuida da saúde dos pacientes no hospital?", opts: ["Engineer", "Police", "Doctor", "Boss"], a: "Doctor" },
        { type: "sel", q: "Quem ensina na escola?", opts: ["Teacher", "Cook", "Driver", "Farmer"], a: "Teacher" },
        { type: "sel", q: "Quem dirige um carro ou ônibus?", opts: ["Driver", "Nurse", "Boss", "Engineer"], a: "Driver" },
        { type: "sel", q: "Quem cozinha comida?", opts: ["Cook", "Police", "Teacher", "Farmer"], a: "Cook" },
        { type: "sel", q: "Qual palavra significa 'trabalho'?", opts: ["Work", "Walk", "Write", "World"], a: "Work" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I am a doctor", "I am doctor", "I a doctor am", "Doctor am I"], a: "I am a doctor" },
        { type: "sel", q: "Qual frase está correta?", opts: ["She is an engineer", "She is a engineer", "She engineer is", "Engineer is she"], a: "She is an engineer" },
        { type: "sel", q: "Onde um escritório geralmente fica?", opts: ["Office", "Farm", "Kitchen", "Park"], a: "Office" },

        { type: "match", pairs: { "Enfermeira": "Nurse", "Chefe": "Boss", "Escritório": "Office", "Emprego": "Job" } },
        { type: "match", pairs: { "Polícia": "Police", "Trabalho": "Work", "Engenheiro": "Engineer", "Professor": "Teacher" } },
        { type: "match", pairs: { "Motorista": "Driver", "Cozinheiro": "Cook", "Fazendeiro": "Farmer", "Médico": "Doctor" } },

        { type: "assemble", q: "Ela é uma engenheira", words: ["She", "is", "an", "engineer", "a", "he"], a: ["She is an engineer", "She's an engineer"] },
        { type: "assemble", q: "Ele é meu chefe", words: ["He", "is", "my", "boss", "teacher"], a: ["He is my boss", "He's my boss"] },
        { type: "assemble", q: "Eu trabalho no escritório", words: ["I", "work", "in", "the", "office"], a: ["I work in the office"] },
        { type: "assemble", q: "Ela ensina na escola", words: ["She", "teaches", "at", "school", "works"], a: ["She teaches at school"] },
        { type: "assemble", q: "Ele dirige um ônibus", words: ["He", "drives", "a", "bus", "car"], a: ["He drives a bus"] },

        { type: "write", target: "pt", q: "He is my boss", a: ["Ele é meu chefe", "Ele é o meu chefe"] },
        { type: "write", target: "en", q: "Eu sou médico", a: ["I am a doctor"] },
        { type: "write", target: "en", q: "Ela é professora", a: ["She is a teacher", "She's a teacher"] },
        { type: "write", target: "pt", q: "I have a new job", a: ["Eu tenho um novo emprego"] },
        { type: "write", target: "pt", q: "My father works in an office", a: ["Meu pai trabalha em um escritório"] },

        { type: "listen", target: "en", q: "I have a new job", a: ["I have a new job"] },
        { type: "listen", target: "pt", q: "My mother is a nurse", a: ["Minha mãe é enfermeira"] },
        { type: "listen", target: "pt", q: "The engineer works here", a: ["O engenheiro trabalha aqui"] }
    ]
},
13: {
    title: "Hobbies",
    icon: "gamepad-2",
    desc: "O que você gosta de fazer no tempo livre?",
    tip: "Com 'like' e 'love', o verbo seguinte pode aparecer com '-ing': 'I like playing'.",
    vocab: ["Play", "Read", "Music", "Dance", "Movie", "Game", "Guitar", "Sing", "Watch", "Draw", "Paint", "Swim"],
    pool: [
        { type: "sel", q: "Como se diz 'Ler'?", opts: ["Read", "Play", "Sing", "Dance"], a: "Read" },
        { type: "sel", q: "Como se diz 'Cantar'?", opts: ["Sing", "Swim", "Draw", "Watch"], a: "Sing" },
        { type: "sel", q: "Como se diz 'Dançar'?", opts: ["Dance", "Draw", "Drive", "Drink"], a: "Dance" },
        { type: "sel", q: "Como se diz 'Música'?", opts: ["Music", "Movie", "Game", "Move"], a: "Music" },
        { type: "sel", q: "Qual palavra significa 'filme'?", opts: ["Movie", "Music", "Make", "Move"], a: "Movie" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I like reading books", "I like read books", "I like books reading", "I like book read"], a: "I like reading books" },
        { type: "sel", q: "Qual frase está correta?", opts: ["She dances well", "She dance well", "She dancing well", "She dances good"], a: "She dances well" },
        { type: "sel", q: "Qual atividade usa um violão?", opts: ["Play the guitar", "Read the guitar", "Watch the guitar", "Dance the guitar"], a: "Play the guitar" },

        { type: "match", pairs: { "Música": "Music", "Jogo": "Game", "Filme": "Movie", "Cantar": "Sing" } },
        { type: "match", pairs: { "Ler": "Read", "Dançar": "Dance", "Tocar": "Play", "Nadar": "Swim" } },
        { type: "match", pairs: { "Desenhar": "Draw", "Pintar": "Paint", "Assistir": "Watch", "Violão": "Guitar" } },

        { type: "assemble", q: "Eu gosto de ler livros", words: ["I", "like", "reading", "books", "read", "book"], a: ["I like reading books", "I like to read books"] },
        { type: "assemble", q: "Ela dança bem", words: ["She", "dances", "well", "dance", "good"], a: ["She dances well"] },
        { type: "assemble", q: "Ele toca violão", words: ["He", "plays", "the", "guitar", "play", "piano"], a: ["He plays the guitar"] },
        { type: "assemble", q: "Nós assistimos filmes", words: ["We", "watch", "movies", "movie", "read"], a: ["We watch movies"] },
        { type: "assemble", q: "Eu gosto de música", words: ["I", "like", "music", "movie", "game"], a: ["I like music"] },

        { type: "write", target: "en", q: "Ela gosta de dançar", a: ["She likes dancing", "She likes to dance"] },
        { type: "write", target: "pt", q: "We play games", a: ["Nós jogamos jogos", "Nós jogamos"] },
        { type: "write", target: "en", q: "Eu gosto de desenhar", a: ["I like drawing", "I like to draw"] },
        { type: "write", target: "pt", q: "He plays the guitar", a: ["Ele toca violão"] },
        { type: "write", target: "en", q: "Ela pinta quadros", a: ["She paints pictures"] },

        { type: "listen", target: "pt", q: "I like music", a: ["Eu gosto de música"] },
        { type: "listen", target: "pt", q: "We watch movies", a: ["Nós assistimos filmes"] },
        { type: "listen", target: "pt", q: "He reads books", a: ["Ele lê livros"] }
    ]
},
14: {
    title: "Viagem",
    icon: "plane",
    desc: "Meios de transporte e situações de viagem.",
    tip: "Use 'by' para transportes: by car, by bus, by plane. Para ir a pé, use 'on foot'.",
    vocab: ["Car", "Bus", "Train", "Plane", "Ticket", "Travel", "Airport", "Luggage", "Trip", "Station", "Taxi", "Boat"],
    pool: [
        { type: "sel", q: "Qual o transporte aéreo?", opts: ["Bus", "Car", "Plane", "Train"], a: "Plane" },
        { type: "sel", q: "Qual palavra significa 'passagem'?", opts: ["Ticket", "Travel", "Trip", "Train"], a: "Ticket" },
        { type: "sel", q: "Onde os aviões decolam e pousam?", opts: ["Airport", "Station", "Street", "Shop"], a: "Airport" },
        { type: "sel", q: "Onde os trens param?", opts: ["Station", "Airport", "Kitchen", "Park"], a: "Station" },
        { type: "sel", q: "Qual frase está correta?", opts: ["We go by bus", "We go in bus", "We go on bus", "We go at bus"], a: "We go by bus" },
        { type: "sel", q: "Qual frase está correta para ir a pé?", opts: ["We go on foot", "We go by foot", "We go in foot", "We go at foot"], a: "We go on foot" },
        { type: "sel", q: "Qual palavra significa 'bagagem'?", opts: ["Luggage", "Landing", "Language", "Light"], a: "Luggage" },
        { type: "sel", q: "Qual palavra significa 'viagem'?", opts: ["Travel", "Ticket", "Train", "Trip"], a: "Travel" },

        { type: "match", pairs: { "Ônibus": "Bus", "Trem": "Train", "Viagem": "Travel", "Passagem": "Ticket" } },
        { type: "match", pairs: { "Carro": "Car", "Aeroporto": "Airport", "Bagagem": "Luggage", "Estação": "Station" } },
        { type: "match", pairs: { "Táxi": "Taxi", "Barco": "Boat", "Passeio": "Trip", "Avião": "Plane" } },

        { type: "assemble", q: "Nós vamos de ônibus", words: ["We", "go", "by", "bus", "on", "car"], a: ["We go by bus"] },
        { type: "assemble", q: "Eu vou de carro", words: ["I", "go", "by", "car", "plane", "train"], a: ["I go by car"] },
        { type: "assemble", q: "Ela vai de avião", words: ["She", "goes", "by", "plane", "bus"], a: ["She goes by plane"] },
        { type: "assemble", q: "Nós vamos a pé", words: ["We", "go", "on", "foot", "by", "car"], a: ["We go on foot"] },
        { type: "assemble", q: "Eu perdi minha bagagem", words: ["I", "lost", "my", "luggage", "ticket"], a: ["I lost my luggage"] },

        { type: "write", target: "pt", q: "Where is the airport?", a: ["Onde é o aeroporto?", "Onde fica o aeroporto?"] },
        { type: "write", target: "en", q: "Eu peguei um táxi", a: ["I took a taxi"] },
        { type: "write", target: "pt", q: "The train is late", a: ["O trem está atrasado"] },
        { type: "write", target: "en", q: "Nós viajamos de carro", a: ["We travel by car"] },
        { type: "write", target: "pt", q: "I need a ticket", a: ["Eu preciso de uma passagem", "Eu preciso de um bilhete"] },

        { type: "listen", target: "en", q: "I lost my luggage", a: ["I lost my luggage"] },
        { type: "listen", target: "pt", q: "The bus is here", a: ["O ônibus está aqui"] },
        { type: "listen", target: "pt", q: "We go by train", a: ["Nós vamos de trem"] }
    ]
},
15: {
    title: "Corpo & Saúde",
    icon: "heart",
    desc: "Partes do corpo, saúde e bem-estar.",
    tip: "Para dor, use 'ache' ou 'hurt'. Ex: 'I have a headache' / 'My leg hurts'.",
    vocab: ["Head", "Arm", "Leg", "Hand", "Foot", "Sick", "Pain", "Medicine", "Doctor", "Headache", "Tooth", "Eye"],
    pool: [
        { type: "sel", q: "Como se diz 'Cabeça'?", opts: ["Hand", "Leg", "Head", "Arm"], a: "Head" },
        { type: "sel", q: "Como se diz 'Braço'?", opts: ["Arm", "Foot", "Head", "Eye"], a: "Arm" },
        { type: "sel", q: "Como se diz 'Perna'?", opts: ["Leg", "Hand", "Ear", "Nose"], a: "Leg" },
        { type: "sel", q: "Como se diz 'Mão'?", opts: ["Hand", "Head", "Foot", "Mouth"], a: "Hand" },
        { type: "sel", q: "Qual palavra significa 'doente'?", opts: ["Sick", "Strong", "Tall", "Good"], a: "Sick" },
        { type: "sel", q: "Qual palavra significa 'remédio'?", opts: ["Medicine", "City", "Music", "Money"], a: "Medicine" },
        { type: "sel", q: "Qual frase está correta?", opts: ["My leg hurts", "My leg hurt", "My leg hurting", "My hurts leg"], a: "My leg hurts" },
        { type: "sel", q: "Qual frase está correta?", opts: ["He has a headache", "He have a headache", "He is a headache", "He headache has"], a: "He has a headache" },

        { type: "match", pairs: { "Braço": "Arm", "Perna": "Leg", "Mão": "Hand", "Doente": "Sick" } },
        { type: "match", pairs: { "Cabeça": "Head", "Pé": "Foot", "Olho": "Eye", "Dente": "Tooth" } },
        { type: "match", pairs: { "Dor": "Pain", "Médico": "Doctor", "Remédio": "Medicine", "Dor de cabeça": "Headache" } },

        { type: "assemble", q: "Eu estou doente hoje", words: ["I", "am", "sick", "today", "pain", "is"], a: ["I am sick today", "I'm sick today"] },
        { type: "assemble", q: "Minha perna dói", words: ["My", "leg", "hurts", "arm", "head"], a: ["My leg hurts"] },
        { type: "assemble", q: "Ele tem dor de cabeça", words: ["He", "has", "a", "headache", "have", "pain"], a: ["He has a headache"] },
        { type: "assemble", q: "Eu preciso de um médico", words: ["I", "need", "a", "doctor", "medicine"], a: ["I need a doctor"] },
        { type: "assemble", q: "Ela toma remédio", words: ["She", "takes", "medicine", "doctor", "pain"], a: ["She takes medicine"] },

        { type: "write", target: "en", q: "Minha cabeça dói", a: ["My head hurts"] },
        { type: "write", target: "en", q: "Ele está doente", a: ["He is sick", "He's sick"] },
        { type: "write", target: "pt", q: "Take this medicine", a: ["Tome este remédio", "Pegue este remédio"] },
        { type: "write", target: "pt", q: "I have a toothache", a: ["Eu estou com dor de dente"] },
        { type: "write", target: "en", q: "Eu preciso de água", a: ["I need water"] },

        { type: "listen", target: "pt", q: "My arm hurts", a: ["Meu braço dói"] },
        { type: "listen", target: "pt", q: "I have a headache", a: ["Estou com dor de cabeça", "Eu tenho dor de cabeça"] },
        { type: "listen", target: "pt", q: "She is sick", a: ["Ela está doente"] }
    ]
},
16: {
    title: "Preposições",
    icon: "map-pin",
    desc: "Onde as coisas estão?",
    tip: "IN = dentro, ON = sobre uma superfície, AT = ponto específico.",
    vocab: ["In", "On", "At", "Under", "Behind", "Next to", "Between", "Front", "Near", "Inside", "Outside", "Above"],
    pool: [
        { type: "sel", q: "A frase correta para 'O livro está sobre a mesa' é:", opts: ["The book is in the table", "The book is on the table", "The book is at the table", "The book is under the table"], a: "The book is on the table" },
        { type: "sel", q: "Qual palavra significa 'debaixo'?", opts: ["Under", "Behind", "Near", "Inside"], a: "Under" },
        { type: "sel", q: "Qual palavra significa 'atrás'?", opts: ["Behind", "Between", "In front", "Next"], a: "Behind" },
        { type: "sel", q: "Qual palavra significa 'ao lado de'?", opts: ["Next to", "Between", "Under", "Above"], a: "Next to" },
        { type: "sel", q: "Qual palavra significa 'entre'?", opts: ["Between", "Behind", "Inside", "Outside"], a: "Between" },
        { type: "sel", q: "Qual frase está correta?", opts: ["The cat is under the bed", "The cat is on the bed", "The cat is at the bed", "The cat is in the bed"], a: "The cat is under the bed" },
        { type: "sel", q: "Qual frase está correta?", opts: ["The keys are in the box", "The keys are on the box", "The keys are at the box", "The keys are behind the box"], a: "The keys are in the box" },
        { type: "sel", q: "Qual palavra significa 'na frente'?", opts: ["Front", "Behind", "Under", "Between"], a: "Front" },

        { type: "match", pairs: { "Embaixo": "Under", "Atrás": "Behind", "Ao lado": "Next to", "Entre": "Between" } },
        { type: "match", pairs: { "Dentro": "In", "Sobre": "On", "Em (lugar)": "At", "Na frente": "Front" } },
        { type: "match", pairs: { "Perto": "Near", "Dentro de": "Inside", "Fora": "Outside", "Acima": "Above" } },

        { type: "assemble", q: "O gato está debaixo da cama", words: ["The", "cat", "is", "under", "the", "bed"], a: ["The cat is under the bed"] },
        { type: "assemble", q: "A chave está dentro da caixa", words: ["The", "keys", "are", "in", "the", "box", "key"], a: ["The keys are in the box"] },
        { type: "assemble", q: "O livro está sobre a mesa", words: ["The", "book", "is", "on", "the", "table"], a: ["The book is on the table"] },
        { type: "assemble", q: "Ele está na porta", words: ["He", "is", "at", "the", "door", "in"], a: ["He is at the door"] },
        { type: "assemble", q: "O cachorro está atrás da casa", words: ["The", "dog", "is", "behind", "the", "house"], a: ["The dog is behind the house"] },

        { type: "write", target: "pt", q: "He is at the door", a: ["Ele está na porta"] },
        { type: "write", target: "en", q: "O lápis está na mesa", a: ["The pencil is on the table"] },
        { type: "write", target: "pt", q: "The keys are in the box", a: ["As chaves estão na caixa"] },
        { type: "write", target: "en", q: "O gato está entre as cadeiras", a: ["The cat is between the chairs"] },
        { type: "write", target: "pt", q: "The house is near the park", a: ["A casa fica perto do parque"] },

        { type: "listen", target: "en", q: "The book is on the table", a: ["The book is on the table"] },
        { type: "listen", target: "pt", q: "The dog is behind the house", a: ["O cachorro está atrás da casa"] },
        { type: "listen", target: "pt", q: "The ball is under the chair", a: ["A bola está debaixo da cadeira"] }
                ]
            },
            17: {
    title: "Passado Simples",
    icon: "history",
    desc: "Fale sobre o que já aconteceu (verbos regulares).",
    tip: "Verbos regulares no passado ganham '-ed'. Ex: play -> played.",
    vocab: ["Played", "Worked", "Walked", "Watched", "Cleaned", "Visited", "Cooked", "Called", "Yesterday", "Last night", "Ago", "Did"],
    pool: [
        { type: "sel", q: "Qual o passado de 'Work'?", opts: ["Works", "Working", "Worked", "Worker"], a: "Worked" },
        { type: "sel", q: "Qual o passado de 'Play'?", opts: ["Played", "Playd", "Plaied", "Playing"], a: "Played" },
        { type: "sel", q: "Qual o passado de 'Watch'?", opts: ["Watched", "Watchied", "Watching", "Watch"], a: "Watched" },
        { type: "sel", q: "Qual palavra indica algo que aconteceu ontem?", opts: ["Today", "Tomorrow", "Yesterday", "Now"], a: "Yesterday" },
        { type: "sel", q: "Qual palavra indica 'há algum tempo'?", opts: ["Ago", "Later", "Soon", "Now"], a: "Ago" },
        { type: "sel", q: "Qual frase está no passado?", opts: ["I work every day", "I worked yesterday", "I am work", "I will work"], a: "I worked yesterday" },
        { type: "sel", q: "Qual frase usa passado corretamente?", opts: ["She visited her friend", "She visit her friend", "She visiting her friend", "She visits yesterday"], a: "She visited her friend" },
        { type: "sel", q: "Qual é a forma correta de negação no passado?", opts: ["I didn't play", "I don't played", "I not played", "I wasn't played"], a: "I didn't play" },
        { type: "sel", q: "Qual verbo está no passado de 'clean'?", opts: ["Cleaned", "Clean", "Cleaning", "Cleaner"], a: "Cleaned" },
        { type: "sel", q: "Qual verbo está no passado de 'call'?", opts: ["Called", "Call", "Calling", "Caller"], a: "Called" },

        { type: "match", pairs: { "Ontem": "Yesterday", "Ontem à noite": "Last night", "Jogou": "Played", "Assistiu": "Watched" } },
        { type: "match", pairs: { "Trabalhou": "Worked", "Caminhou": "Walked", "Limpou": "Cleaned", "Visitou": "Visited" } },
        { type: "match", pairs: { "Ligou": "Called", "Cozinhou": "Cooked", "Fez": "Made", "Morou": "Lived" } },

        { type: "assemble", q: "Eu trabalhei ontem", words: ["I", "worked", "yesterday", "work", "did"], a: ["I worked yesterday"] },
        { type: "assemble", q: "Nós caminhamos no parque", words: ["We", "walked", "in", "the", "park", "walk"], a: ["We walked in the park"] },
        { type: "assemble", q: "Ela assistiu TV ontem à noite", words: ["She", "watched", "TV", "last", "night", "watch"], a: ["She watched TV last night"] },
        { type: "assemble", q: "Ele limpou o quarto", words: ["He", "cleaned", "the", "room", "cleans"], a: ["He cleaned the room"] },
        { type: "assemble", q: "Eles visitaram a avó", words: ["They", "visited", "their", "grandmother", "visit"], a: ["They visited their grandmother"] },
        { type: "assemble", q: "Eu liguei para minha mãe", words: ["I", "called", "my", "mother", "call"], a: ["I called my mother"] },

        { type: "write", target: "en", q: "Nós caminhamos no parque", a: ["We walked in the park"] },
        { type: "write", target: "en", q: "Ela trabalhou muito", a: ["She worked a lot", "She worked hard"] },
        { type: "write", target: "en", q: "Eu limpei a casa", a: ["I cleaned the house"] },
        { type: "write", target: "pt", q: "I watched TV last night", a: ["Eu assisti TV ontem à noite"] },
        { type: "write", target: "pt", q: "They visited their friend", a: ["Eles visitaram o amigo deles", "Elas visitaram a amiga delas"] },

        { type: "listen", target: "pt", q: "Did you play?", a: ["Você jogou?", "Vocês jogaram?"] },
        { type: "listen", target: "pt", q: "I worked yesterday", a: ["Eu trabalhei ontem"] },
        { type: "listen", target: "pt", q: "She cleaned the kitchen", a: ["Ela limpou a cozinha"] }
    ]
},
18: {
    title: "Passado Irregular",
    icon: "refresh-ccw",
    desc: "Verbos que mudam completamente no passado.",
    tip: "Verbos irregulares não seguem a regra do '-ed'. Ex: go -> went, see -> saw.",
    vocab: ["Went", "Saw", "Ate", "Drank", "Bought", "Had", "Made", "Came", "Took", "Gave", "Found", "Left"],
    pool: [
        { type: "sel", q: "Qual o passado de 'Go'?", opts: ["Goed", "Went", "Gone", "Going"], a: "Went" },
        { type: "sel", q: "Qual o passado de 'See'?", opts: ["Saw", "Seen", "Seeing", "Seed"], a: "Saw" },
        { type: "sel", q: "Qual o passado de 'Eat'?", opts: ["Eated", "Ate", "Eating", "Eatened"], a: "Ate" },
        { type: "sel", q: "Qual o passado de 'Drink'?", opts: ["Drunk", "Drank", "Drinked", "Drinking"], a: "Drank" },
        { type: "sel", q: "Qual o passado de 'Buy'?", opts: ["Bought", "Buyed", "Brought", "Buying"], a: "Bought" },
        { type: "sel", q: "Qual o passado de 'Have'?", opts: ["Haved", "Had", "Having", "Has"], a: "Had" },
        { type: "sel", q: "Qual o passado de 'Make'?", opts: ["Maked", "Made", "Making", "Make"], a: "Made" },
        { type: "sel", q: "Qual o passado de 'Take'?", opts: ["Took", "Taken", "Taked", "Taking"], a: "Took" },
        { type: "sel", q: "Qual o passado de 'Give'?", opts: ["Gived", "Gave", "Giving", "Given"], a: "Gave" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I went to school", "I goed to school", "I going to school", "I gone to school"], a: "I went to school" },

        { type: "match", pairs: { "Viu": "Saw", "Comeu": "Ate", "Bebeu": "Drank", "Teve": "Had" } },
        { type: "match", pairs: { "Foi": "Went", "Comprou": "Bought", "Fez": "Made", "Veio": "Came" } },
        { type: "match", pairs: { "Levou": "Took", "Deu": "Gave", "Encontrou": "Found", "Saiu": "Left" } },

        { type: "assemble", q: "Eu fui para a escola", words: ["I", "went", "to", "school", "go", "was"], a: ["I went to school"] },
        { type: "assemble", q: "Ele comprou um carro", words: ["He", "bought", "a", "car", "buy"], a: ["He bought a car"] },
        { type: "assemble", q: "Ela fez um bolo", words: ["She", "made", "a", "cake", "make"], a: ["She made a cake"] },
        { type: "assemble", q: "Nós vimos um filme", words: ["We", "saw", "a", "movie", "see"], a: ["We saw a movie"] },
        { type: "assemble", q: "Eu tive um cachorro", words: ["I", "had", "a", "dog", "have"], a: ["I had a dog"] },
        { type: "assemble", q: "Eles vieram ontem", words: ["They", "came", "yesterday", "come"], a: ["They came yesterday"] },

        { type: "write", target: "pt", q: "He bought a car", a: ["Ele comprou um carro"] },
        { type: "write", target: "pt", q: "She made a cake", a: ["Ela fez um bolo"] },
        { type: "write", target: "pt", q: "I saw my friend", a: ["Eu vi meu amigo", "Eu vi minha amiga"] },
        { type: "write", target: "en", q: "Eu bebi água", a: ["I drank water"] },
        { type: "write", target: "en", q: "Nós tivemos um dia bom", a: ["We had a good day"] },

        { type: "listen", target: "en", q: "She made a cake", a: ["She made a cake"] },
        { type: "listen", target: "pt", q: "I went home", a: ["Eu fui para casa"] },
        { type: "listen", target: "pt", q: "He took my book", a: ["Ele pegou meu livro", "Ele levou meu livro"] }
    ]
},
19: {
    title: "O Futuro",
    icon: "fast-forward",
    desc: "Planos, previsões e promessas.",
    tip: "Use 'will' para decisões rápidas e previsões. Use 'going to' para planos certos.",
    vocab: ["Will", "Going to", "Tomorrow", "Next week", "Soon", "Later", "Plan", "Future", "Promise", "Decide", "Predict", "Travel"],
    pool: [
        { type: "sel", q: "Qual indica uma ação no futuro?", opts: ["I am", "I did", "I will", "I had"], a: "I will" },
        { type: "sel", q: "Qual palavra significa 'amanhã'?", opts: ["Yesterday", "Tomorrow", "Today", "Later"], a: "Tomorrow" },
        { type: "sel", q: "Qual expressão mostra um plano certo?", opts: ["Going to", "Did", "Had", "Was"], a: "Going to" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I will travel tomorrow", "I travels tomorrow", "I traveled tomorrow", "I travel tomorrow will"], a: "I will travel tomorrow" },
        { type: "sel", q: "Qual frase está correta?", opts: ["We are going to win", "We is going to win", "We going to win", "We will winning"], a: "We are going to win" },
        { type: "sel", q: "Qual palavra significa 'plano'?", opts: ["Plan", "Plant", "Play", "Plain"], a: "Plan" },
        { type: "sel", q: "Qual palavra significa 'promessa'?", opts: ["Promise", "Problem", "Progress", "Price"], a: "Promise" },
        { type: "sel", q: "Qual palavra significa 'prever'?", opts: ["Predict", "Print", "Prefer", "Prepare"], a: "Predict" },

        { type: "match", pairs: { "Amanhã": "Tomorrow", "Próxima semana": "Next week", "Em breve": "Soon", "Mais tarde": "Later" } },
        { type: "match", pairs: { "Plano": "Plan", "Futuro": "Future", "Promessa": "Promise", "Decidir": "Decide" } },
        { type: "match", pairs: { "Viajar": "Travel", "Prometer": "Promise", "Prever": "Predict", "Ganhar": "Win" } },

        { type: "assemble", q: "Eu vou viajar amanhã", words: ["I", "will", "travel", "tomorrow", "am", "going"], a: ["I will travel tomorrow", "I'm going to travel tomorrow"] },
        { type: "assemble", q: "Nós vamos vencer", words: ["We", "will", "win", "are", "going", "to"], a: ["We will win", "We are going to win"] },
        { type: "assemble", q: "Ela vai estudar à noite", words: ["She", "is", "going", "to", "study", "tonight"], a: ["She is going to study tonight"] },
        { type: "assemble", q: "Vai chover mais tarde", words: ["It", "will", "rain", "later", "is", "rains"], a: ["It will rain later"] },
        { type: "assemble", q: "Eu vou decidir depois", words: ["I", "will", "decide", "later", "decided"], a: ["I will decide later"] },

        { type: "write", target: "en", q: "Nós vamos viajar na próxima semana", a: ["We will travel next week", "We are going to travel next week"] },
        { type: "write", target: "en", q: "Ele vai trabalhar amanhã", a: ["He will work tomorrow", "He is going to work tomorrow"] },
        { type: "write", target: "pt", q: "She is going to study tonight", a: ["Ela vai estudar hoje à noite"] },
        { type: "write", target: "pt", q: "I will call you later", a: ["Eu vou te ligar mais tarde", "Eu ligarei para você mais tarde"] },
        { type: "write", target: "pt", q: "They will be happy", a: ["Eles vão ficar felizes"] },

        { type: "listen", target: "pt", q: "She is going to study", a: ["Ela vai estudar", "Ela irá estudar"] },
        { type: "listen", target: "en", q: "I will help you", a: ["I will help you"] },
        { type: "listen", target: "pt", q: "We will win", a: ["Nós vamos vencer"] }
    ]
},
20: {
    title: "Presente Contínuo",
    icon: "activity",
    desc: "Ações acontecendo agora mesmo.",
    tip: "Use o verbo 'to be' + verbo com '-ing'. Ex: 'I am eating'.",
    vocab: ["Now", "Right now", "Running", "Talking", "Listening", "Watching", "Waiting", "Currently", "Reading", "Sleeping", "Cooking", "Working"],
    pool: [
        { type: "sel", q: "Como dizer 'Estou falando'?", opts: ["I talk", "I talking", "I am talking", "I talked"], a: "I am talking" },
        { type: "sel", q: "Como dizer 'Ela está lendo'?", opts: ["She is reading", "She reading", "She reads now", "She read now"], a: "She is reading" },
        { type: "sel", q: "Como dizer 'Estamos correndo'?", opts: ["We are running", "We running", "We run now", "We ran"], a: "We are running" },
        { type: "sel", q: "Qual palavra indica algo acontecendo agora?", opts: ["Now", "Yesterday", "Tomorrow", "Ago"], a: "Now" },
        { type: "sel", q: "Qual frase está correta?", opts: ["They are watching TV", "They watching TV", "They watch TV now", "They watched TV now"], a: "They are watching TV" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I am waiting for you", "I waiting for you", "I wait for you now", "I was waiting for you"], a: "I am waiting for you" },
        { type: "sel", q: "Qual frase está correta?", opts: ["He is cooking", "He cooking", "He cooks now", "He cooked now"], a: "He is cooking" },
        { type: "sel", q: "Qual termina com '-ing'?", opts: ["Running", "Run", "Ran", "Runner"], a: "Running" },

        { type: "match", pairs: { "Agora": "Now", "Correndo": "Running", "Ouvindo": "Listening", "Esperando": "Waiting" } },
        { type: "match", pairs: { "Falando": "Talking", "Assistindo": "Watching", "Lendo": "Reading", "Dormindo": "Sleeping" } },
        { type: "match", pairs: { "Cozinhando": "Cooking", "Trabalhando": "Working", "Atualmente": "Currently", "Neste momento": "Right now" } },

        { type: "assemble", q: "Eles estão correndo agora", words: ["They", "are", "running", "now", "is", "run"], a: ["They are running now", "They're running now"] },
        { type: "assemble", q: "Ela está assistindo TV agora mesmo", words: ["She", "is", "watching", "TV", "right", "now"], a: ["She is watching TV right now"] },
        { type: "assemble", q: "Eu estou esperando por você", words: ["I", "am", "waiting", "for", "you"], a: ["I am waiting for you", "I'm waiting for you"] },
        { type: "assemble", q: "O que você está fazendo?", words: ["What", "are", "you", "doing", "do", "is"], a: ["What are you doing?", "What are you doing"] },
        { type: "assemble", q: "Nós estamos estudando agora", words: ["We", "are", "studying", "now", "study"], a: ["We are studying now", "We're studying now"] },

        { type: "write", target: "pt", q: "She is watching TV right now", a: ["Ela está assistindo TV agora mesmo", "Ela está assistindo TV agora"] },
        { type: "write", target: "pt", q: "I am reading a book", a: ["Eu estou lendo um livro"] },
        { type: "write", target: "en", q: "Nós estamos trabalhando", a: ["We are working"] },
        { type: "write", target: "en", q: "Ele está dormindo", a: ["He is sleeping"] },
        { type: "write", target: "pt", q: "They are talking", a: ["Eles estão conversando", "Elas estão conversando"] },

        { type: "listen", target: "en", q: "I am waiting for you", a: ["I am waiting for you", "I'm waiting for you"] },
        { type: "listen", target: "pt", q: "We are working now", a: ["Nós estamos trabalhando agora"] },
        { type: "listen", target: "pt", q: "She is reading", a: ["Ela está lendo"] }
    ]
},
21: {
    title: "Sentimentos",
    icon: "smile",
    desc: "Expressando emoções e estados.",
    tip: "Para perguntar como alguém se sente, diga: 'How do you feel?'.",
    vocab: ["Happy", "Sad", "Angry", "Tired", "Excited", "Nervous", "Bored", "Surprised", "Worried", "Calm", "Scared", "Proud"],
    pool: [
        { type: "sel", q: "Qual emoção significa 'Cansado'?", opts: ["Angry", "Sad", "Tired", "Bored"], a: "Tired" },
        { type: "sel", q: "Qual emoção significa 'Feliz'?", opts: ["Happy", "Sad", "Tired", "Scared"], a: "Happy" },
        { type: "sel", q: "Qual emoção significa 'Com raiva'?", opts: ["Angry", "Calm", "Proud", "Worried"], a: "Angry" },
        { type: "sel", q: "Qual emoção significa 'Surpreso'?", opts: ["Surprised", "Bored", "Sad", "Tired"], a: "Surprised" },
        { type: "sel", q: "Como se pergunta 'Como você se sente?'", opts: ["How do you feel?", "Where are you?", "What do you do?", "How old are you?"], a: "How do you feel?" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I feel very tired", "I feels very tired", "I feeling very tired", "I tired feel"], a: "I feel very tired" },
        { type: "sel", q: "Qual frase está correta?", opts: ["She is surprised", "She surprise is", "She is surprise", "She surprised is"], a: "She is surprised" },
        { type: "sel", q: "Qual emoção é positiva?", opts: ["Happy", "Sad", "Angry", "Worried"], a: "Happy" },

        { type: "match", pairs: { "Triste": "Sad", "Nervoso": "Nervous", "Entediado": "Bored", "Animado": "Excited" } },
        { type: "match", pairs: { "Cansado": "Tired", "Feliz": "Happy", "Bravo": "Angry", "Surpreso": "Surprised" } },
        { type: "match", pairs: { "Calmo": "Calm", "Preocupado": "Worried", "Assustado": "Scared", "Orgulhoso": "Proud" } },

        { type: "assemble", q: "Eu me sinto muito cansado", words: ["I", "feel", "very", "tired", "am", "sad"], a: ["I feel very tired"] },
        { type: "assemble", q: "Nós estamos empolgados", words: ["We", "are", "excited", "is", "happy", "feel"], a: ["We are excited", "We're excited"] },
        { type: "assemble", q: "Ela está surpresa", words: ["She", "is", "surprised", "surprise"], a: ["She is surprised", "She's surprised"] },
        { type: "assemble", q: "Ele está com medo", words: ["He", "is", "scared", "afraid"], a: ["He is scared"] },
        { type: "assemble", q: "Eu estou preocupado", words: ["I", "am", "worried", "calm"], a: ["I am worried", "I'm worried"] },

        { type: "write", target: "en", q: "Ela está surpresa", a: ["She is surprised", "She's surprised"] },
        { type: "write", target: "en", q: "Eu estou feliz", a: ["I am happy", "I'm happy"] },
        { type: "write", target: "pt", q: "Why are you angry?", a: ["Por que você está com raiva?", "Por que você está bravo?"] },
        { type: "write", target: "pt", q: "They are bored", a: ["Eles estão entediados", "Elas estão entediadas"] },
        { type: "write", target: "en", q: "Nós estamos preocupados", a: ["We are worried", "We're worried"] },

        { type: "listen", target: "pt", q: "I am happy", a: ["Eu estou feliz"] },
        { type: "listen", target: "pt", q: "She is nervous", a: ["Ela está nervosa"] },
        { type: "listen", target: "pt", q: "We are proud", a: ["Nós estamos orgulhosos", "Nós estamos orgulhosas"] }
    ]
},
22: {
    title: "Compras & Dinheiro",
    icon: "shopping-cart",
    desc: "Compras, preços e pagamentos.",
    tip: "Para perguntar o preço, use 'How much is it?'",
    vocab: ["Money", "Price", "Buy", "Sell", "Cheap", "Expensive", "Store", "Pay", "Cash", "Change", "Cost", "Discount"],
    pool: [
        { type: "sel", q: "O oposto de 'Cheap' é:", opts: ["Price", "Expensive", "Money", "Store"], a: "Expensive" },
        { type: "sel", q: "Como se diz 'comprar'?", opts: ["Buy", "Sell", "Pay", "Cost"], a: "Buy" },
        { type: "sel", q: "Como se diz 'vender'?", opts: ["Sell", "Buy", "Pay", "Price"], a: "Sell" },
        { type: "sel", q: "Como se diz 'pagar'?", opts: ["Pay", "Spend", "Save", "Earn"], a: "Pay" },
        { type: "sel", q: "Qual frase pergunta o preço?", opts: ["How much is it?", "How old is it?", "Where is it?", "What is it?"], a: "How much is it?" },
        { type: "sel", q: "Qual frase está correta?", opts: ["This shirt is too expensive", "This shirt is too cheap", "This shirt is very money", "This shirt is cost"], a: "This shirt is too expensive" },
        { type: "sel", q: "Qual palavra significa 'desconto'?", opts: ["Discount", "Dinner", "Dream", "Drive"], a: "Discount" },
        { type: "sel", q: "Qual palavra significa 'troco'?", opts: ["Change", "Chance", "Charge", "Chase"], a: "Change" },

        { type: "match", pairs: { "Comprar": "Buy", "Vender": "Sell", "Pagar": "Pay", "Loja": "Store" } },
        { type: "match", pairs: { "Dinheiro": "Money", "Preço": "Price", "Barato": "Cheap", "Caro": "Expensive" } },
        { type: "match", pairs: { "Troco": "Change", "Custa": "Cost", "Desconto": "Discount", "Dinheiro vivo": "Cash" } },

        { type: "assemble", q: "Quanto custa isso?", words: ["How", "much", "is", "it", "many", "price"], a: ["How much is it?", "How much is it"] },
        { type: "assemble", q: "Eu vou pagar com dinheiro", words: ["I", "will", "pay", "with", "cash", "money"], a: ["I will pay with cash"] },
        { type: "assemble", q: "Esta camisa é muito cara", words: ["This", "shirt", "is", "too", "expensive", "cheap"], a: ["This shirt is too expensive"] },
        { type: "assemble", q: "Eu preciso comprar comida", words: ["I", "need", "to", "buy", "food", "sell"], a: ["I need to buy food"] },
        { type: "assemble", q: "Tem desconto na loja", words: ["There", "is", "a", "discount", "in", "the", "store"], a: ["There is a discount in the store"] },

        { type: "write", target: "pt", q: "I need to buy food", a: ["Eu preciso comprar comida"] },
        { type: "write", target: "pt", q: "This book is cheap", a: ["Este livro é barato"] },
        { type: "write", target: "en", q: "Eu quero pagar agora", a: ["I want to pay now"] },
        { type: "write", target: "en", q: "A loja é cara", a: ["The store is expensive"] },
        { type: "write", target: "pt", q: "How much is the bag?", a: ["Quanto custa a bolsa?", "Quanto custa a sacola?"] },

        { type: "listen", target: "en", q: "I need to buy food", a: ["I need to buy food"] },
        { type: "listen", target: "pt", q: "How much is the bag?", a: ["Quanto custa a bolsa?", "Quanto custa a sacola?"] },
        { type: "listen", target: "pt", q: "I will pay with cash", a: ["Eu vou pagar com dinheiro"] }
    ]
},
23: {
    title: "Culinária",
    icon: "utensils",
    desc: "Verbos e ações na cozinha.",
    tip: "Cook é cozinhar, e 'cooker' é fogão. Use 'bake' para assar e 'boil' para ferver.",
    vocab: ["Cook", "Bake", "Boil", "Fry", "Cut", "Mix", "Salt", "Sugar", "Add", "Recipe", "Meal", "Knife"],
    pool: [
        { type: "sel", q: "Como se diz 'Cortar'?", opts: ["Boil", "Fry", "Cut", "Mix"], a: "Cut" },
        { type: "sel", q: "Como se diz 'Assar'?", opts: ["Bake", "Boil", "Cut", "Mix"], a: "Bake" },
        { type: "sel", q: "Como se diz 'Ferver'?", opts: ["Fry", "Boil", "Mix", "Add"], a: "Boil" },
        { type: "sel", q: "Como se diz 'Misturar'?", opts: ["Mix", "Bake", "Cut", "Cook"], a: "Mix" },
        { type: "sel", q: "Qual palavra significa 'sal'?", opts: ["Salt", "Sugar", "Meal", "Knife"], a: "Salt" },
        { type: "sel", q: "Qual palavra significa 'açúcar'?", opts: ["Sugar", "Salad", "Soup", "Sour"], a: "Sugar" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I like to cook", "I like cook", "I like cooking food", "I like to cooking"], a: "I like to cook" },
        { type: "sel", q: "Qual frase está correta?", opts: ["Cut the meat", "Cuts the meat", "Cutting the meat", "Cut the meat is"], a: "Cut the meat" },

        { type: "match", pairs: { "Ferver": "Boil", "Fritar": "Fry", "Misturar": "Mix", "Assar": "Bake" } },
        { type: "match", pairs: { "Sal": "Salt", "Açúcar": "Sugar", "Cozinhar": "Cook", "Receita": "Recipe" } },
        { type: "match", pairs: { "Adicionar": "Add", "Faca": "Knife", "Refeição": "Meal", "Cortar": "Cut" } },

        { type: "assemble", q: "Eu gosto de cozinhar", words: ["I", "like", "to", "cook", "cooking", "am"], a: ["I like to cook", "I like cooking"] },
        { type: "assemble", q: "Adicione sal e açúcar", words: ["Add", "salt", "and", "sugar", "mix"], a: ["Add salt and sugar"] },
        { type: "assemble", q: "Corte a carne", words: ["Cut", "the", "meat", "mix", "bake"], a: ["Cut the meat"] },
        { type: "assemble", q: "Eu vou fazer a receita", words: ["I", "will", "make", "the", "recipe", "cook"], a: ["I will make the recipe"] },
        { type: "assemble", q: "Ela vai assar o bolo", words: ["She", "will", "bake", "the", "cake", "boil"], a: ["She will bake the cake"] },

        { type: "write", target: "en", q: "Eu gosto de cozinhar", a: ["I like to cook", "I like cooking"] },
        { type: "write", target: "pt", q: "Add salt and sugar", a: ["Adicione sal e açúcar"] },
        { type: "write", target: "en", q: "Eu quero a receita", a: ["I want the recipe"] },
        { type: "write", target: "pt", q: "She will bake the cake", a: ["Ela vai assar o bolo"] },
        { type: "write", target: "en", q: "Corte o pão", a: ["Cut the bread"] },

        { type: "listen", target: "pt", q: "Cut the meat", a: ["Corte a carne"] },
        { type: "listen", target: "pt", q: "Add sugar", a: ["Adicione açúcar"] },
        { type: "listen", target: "pt", q: "I like to cook", a: ["Eu gosto de cozinhar"] }
    ]
},
24: {
    title: "Natureza",
    icon: "tree-pine",
    desc: "Falando sobre o meio ambiente e o mundo natural.",
    tip: "Earth pode significar o planeta Terra ou terra/solo.",
    vocab: ["Tree", "Flower", "River", "Mountain", "Ocean", "Earth", "Sky", "Forest", "Lake", "Cloud", "Wind", "Sun"],
    pool: [
        { type: "sel", q: "Qual a palavra para 'Árvore'?", opts: ["Flower", "Tree", "River", "Forest"], a: "Tree" },
        { type: "sel", q: "Qual palavra significa 'rio'?", opts: ["River", "Mountain", "Ocean", "Sky"], a: "River" },
        { type: "sel", q: "Qual palavra significa 'montanha'?", opts: ["Mountain", "Lake", "Cloud", "Wind"], a: "Mountain" },
        { type: "sel", q: "Qual palavra significa 'oceano'?", opts: ["Ocean", "Forest", "Earth", "Flower"], a: "Ocean" },
        { type: "sel", q: "Qual palavra significa 'floresta'?", opts: ["Forest", "Flower", "River", "Lake"], a: "Forest" },
        { type: "sel", q: "Qual frase está correta?", opts: ["The mountain is very high", "The mountain is very low", "The mountain very is high", "Mountain the is high"], a: "The mountain is very high" },
        { type: "sel", q: "Qual palavra significa 'nuvem'?", opts: ["Cloud", "Crow", "Cloth", "Cold"], a: "Cloud" },
        { type: "sel", q: "Qual palavra significa 'vento'?", opts: ["Wind", "Winter", "Window", "Wide"], a: "Wind" },

        { type: "match", pairs: { "Rio": "River", "Montanha": "Mountain", "Oceano": "Ocean", "Céu": "Sky" } },
        { type: "match", pairs: { "Terra": "Earth", "Floresta": "Forest", "Flor": "Flower", "Árvore": "Tree" } },
        { type: "match", pairs: { "Lago": "Lake", "Nuvem": "Cloud", "Vento": "Wind", "Sol": "Sun" } },

        { type: "assemble", q: "A montanha é muito alta", words: ["The", "mountain", "is", "very", "high", "tall"], a: ["The mountain is very high"] },
        { type: "assemble", q: "Eu amo o oceano", words: ["I", "love", "the", "ocean", "like"], a: ["I love the ocean"] },
        { type: "assemble", q: "Há árvores na floresta", words: ["There", "are", "trees", "in", "the", "forest"], a: ["There are trees in the forest"] },
        { type: "assemble", q: "O céu está limpo", words: ["The", "sky", "is", "clear", "cloudy"], a: ["The sky is clear"] },
        { type: "assemble", q: "O lago é bonito", words: ["The", "lake", "is", "beautiful", "big"], a: ["The lake is beautiful"] },

        { type: "write", target: "pt", q: "I love the ocean", a: ["Eu amo o oceano", "Eu adoro o oceano"] },
        { type: "write", target: "en", q: "A floresta é verde", a: ["The forest is green"] },
        { type: "write", target: "pt", q: "The river is long", a: ["O rio é comprido", "O rio é longo"] },
        { type: "write", target: "en", q: "O sol está brilhando", a: ["The sun is shining"] },
        { type: "write", target: "pt", q: "The flowers are beautiful", a: ["As flores são bonitas"] },

        { type: "listen", target: "en", q: "Beautiful flowers in the forest", a: ["Beautiful flowers in the forest"] },
        { type: "listen", target: "pt", q: "The river is long", a: ["O rio é longo", "O rio é comprido"] },
        { type: "listen", target: "pt", q: "The sky is clear", a: ["O céu está limpo"] }
                ]
            },
            25: {
    title: "Comparativos",
    icon: "arrow-up-right",
    desc: "Comparando duas coisas.",
    tip: "Para adjetivos curtos, normalmente use '-er'. Para adjetivos longos, use 'more'.",
    vocab: ["Taller", "Smaller", "Better", "Worse", "More", "Less", "Than", "Faster", "Bigger", "Older", "Younger", "Cheaper"],
    pool: [
        { type: "sel", q: "Qual o comparativo de 'Good' (Bom)?", opts: ["Gooder", "More good", "Better", "Best"], a: "Better" },
        { type: "sel", q: "Qual o comparativo de 'Bad' (Ruim)?", opts: ["Worse", "Badder", "More bad", "Worst"], a: "Worse" },
        { type: "sel", q: "Qual o comparativo de 'Tall'?", opts: ["Taller", "More tall", "Tallest", "Tallly"], a: "Taller" },
        { type: "sel", q: "Qual o comparativo de 'Small'?", opts: ["Smaller", "More small", "Smallest", "Smallly"], a: "Smaller" },
        { type: "sel", q: "Qual o comparativo de 'Fast'?", opts: ["Faster", "More fast", "Fastest", "Fastly"], a: "Faster" },
        { type: "sel", q: "Qual frase está correta?", opts: ["This book is better", "This book is gooder", "This book is best than that", "This book more good"], a: "This book is better" },
        { type: "sel", q: "Qual frase está correta?", opts: ["He is taller than me", "He is tall than me", "He is more taller than me", "He taller is than me"], a: "He is taller than me" },
        { type: "sel", q: "Qual palavra completa melhor: 'This car is ___ expensive than that one.'", opts: ["more", "most", "mucher", "better"], a: "more" },
        { type: "sel", q: "Qual frase está correta?", opts: ["She is younger than her brother", "She is more young than her brother", "She is youngest than her brother", "She is most young than her brother"], a: "She is younger than her brother" },
        { type: "sel", q: "Qual frase está correta?", opts: ["This is cheaper than that", "This is cheap than that", "This is more cheap than that", "This is cheapest than that"], a: "This is cheaper than that" },
        { type: "sel", q: "Qual palavra é um comparativo?", opts: ["Bigger", "Biggest", "Big", "Bigly"], a: "Bigger" },
        { type: "sel", q: "Qual frase usa 'less' corretamente?", opts: ["I have less time today", "I have fewer time today", "I have least time today", "I have lesser time today"], a: "I have less time today" },

        { type: "match", pairs: { "Maior": "Bigger", "Menor": "Smaller", "Pior": "Worse", "Mais rápido": "Faster" } },
        { type: "match", pairs: { "Mais alto": "Taller", "Mais velho": "Older", "Mais novo": "Younger", "Mais barato": "Cheaper" } },
        { type: "match", pairs: { "Melhor": "Better", "Menos": "Less", "Que": "Than", "Mais": "More" } },

        { type: "assemble", q: "Ele é mais alto do que eu", words: ["He", "is", "taller", "than", "me", "more"], a: ["He is taller than me"] },
        { type: "assemble", q: "Este livro é melhor", words: ["This", "book", "is", "better", "good"], a: ["This book is better"] },
        { type: "assemble", q: "Minha casa é maior que a sua", words: ["My", "house", "is", "bigger", "than", "yours"], a: ["My house is bigger than yours"] },
        { type: "assemble", q: "Ela é mais jovem que ele", words: ["She", "is", "younger", "than", "him", "older"], a: ["She is younger than him"] },
        { type: "assemble", q: "Este carro é mais caro", words: ["This", "car", "is", "more", "expensive", "cheap"], a: ["This car is more expensive"] },

        { type: "write", target: "en", q: "Isto é mais caro", a: ["This is more expensive"] },
        { type: "write", target: "en", q: "Meu irmão é mais velho que eu", a: ["My brother is older than me"] },
        { type: "write", target: "pt", q: "This house is bigger than that one", a: ["Esta casa é maior que aquela", "Esta casa é maior do que aquela"] },
        { type: "write", target: "pt", q: "She is better than me", a: ["Ela é melhor do que eu", "Ela é melhor que eu"] },
        { type: "write", target: "en", q: "Esta estrada é mais longa", a: ["This road is longer"] },

        { type: "listen", target: "pt", q: "She is faster than him", a: ["Ela é mais rápida que ele", "Ela é mais rápida do que ele"] },
        { type: "listen", target: "pt", q: "This book is better than that one", a: ["Este livro é melhor que aquele", "Este livro é melhor do que aquele"] },
        { type: "listen", target: "pt", q: "My phone is cheaper than yours", a: ["Meu celular é mais barato que o seu", "Meu celular é mais barato do que o seu"] }
    ]
},
26: {
    title: "Verbos Modais",
    icon: "shield",
    desc: "Habilidade, permissão, conselho e obrigação.",
    tip: "Verbos modais não levam 'to' depois: 'I can go', não 'I can to go'.",
    vocab: ["Can", "Could", "Should", "Must", "May", "Might", "Would", "Ability", "Permission", "Advice", "Need", "Allowed"],
    pool: [
        { type: "sel", q: "Qual expressa um conselho?", opts: ["Can", "Must", "Should", "May"], a: "Should" },
        { type: "sel", q: "Qual expressa habilidade?", opts: ["Can", "Must", "Should", "Might"], a: "Can" },
        { type: "sel", q: "Qual expressa obrigação forte?", opts: ["May", "Could", "Must", "Would"], a: "Must" },
        { type: "sel", q: "Qual expressa permissão?", opts: ["May", "Must", "Should", "Can not"], a: "May" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I can go", "I can to go", "I can going", "I can went"], a: "I can go" },
        { type: "sel", q: "Qual frase está correta?", opts: ["You should study more", "You should to study more", "You should studied more", "You should studying more"], a: "You should study more" },
        { type: "sel", q: "Qual frase está correta?", opts: ["You must stop now", "You must to stop now", "You must stopping now", "You must stopped now"], a: "You must stop now" },
        { type: "sel", q: "Qual palavra significa 'pode ser que'?", opts: ["Might", "Must", "Should", "Can"], a: "Might" },
        { type: "sel", q: "Qual frase expressa capacidade?", opts: ["She can swim", "She must swim", "She should swim", "She may to swim"], a: "She can swim" },
        { type: "sel", q: "Qual frase expressa sugestão?", opts: ["You should rest", "You must rest", "You may rest", "You could rest now"], a: "You should rest" },
        { type: "sel", q: "Qual frase está correta?", opts: ["Could you help me?", "Could you to help me?", "Could you helping me?", "Could you helped me?"], a: "Could you help me?" },
        { type: "sel", q: "Qual frase é uma pergunta educada?", opts: ["May I come in?", "Must I come in?", "Should I come in now!", "Can I to come in?"], a: "May I come in?" },

        { type: "match", pairs: { "Pode (habilidade)": "Can", "Deveria": "Should", "Deve (obrigação)": "Must", "Poderia": "Could" } },
        { type: "match", pairs: { "Talvez": "Might", "Pode (permissão)": "May", "Capacidade": "Ability", "Permitido": "Allowed" } },
        { type: "match", pairs: { "Conselho": "Advice", "Necessitar": "Need", "Obrigação": "Must", "Permissão": "Permission" } },

        { type: "assemble", q: "Você deve parar agora", words: ["You", "must", "stop", "now", "should", "can"], a: ["You must stop now"] },
        { type: "assemble", q: "Eu posso ir", words: ["I", "can", "go", "to", "am", "must"], a: ["I can go"] },
        { type: "assemble", q: "Você deveria estudar mais", words: ["You", "should", "study", "more", "must", "can"], a: ["You should study more"] },
        { type: "assemble", q: "Poderia me ajudar?", words: ["Could", "you", "help", "me"], a: ["Could you help me?"] },
        { type: "assemble", q: "Talvez ele venha", words: ["He", "might", "come", "today", "must"], a: ["He might come today"] },
        { type: "assemble", q: "Eu posso falar inglês", words: ["I", "can", "speak", "English"], a: ["I can speak English"] },

        { type: "write", target: "pt", q: "Can you help me?", a: ["Você pode me ajudar?", "Pode me ajudar?"] },
        { type: "write", target: "en", q: "Você deveria descansar", a: ["You should rest"] },
        { type: "write", target: "pt", q: "I cannot go", a: ["Eu não posso ir", "Eu não consigo ir"] },
        { type: "write", target: "en", q: "Ela pode nadar", a: ["She can swim"] },
        { type: "write", target: "pt", q: "May I come in?", a: ["Posso entrar?", "Eu posso entrar?"] },

        { type: "listen", target: "en", q: "You should study more", a: ["You should study more"] },
        { type: "listen", target: "pt", q: "He must stop now", a: ["Ele deve parar agora"] },
        { type: "listen", target: "pt", q: "Could you help me?", a: ["Você poderia me ajudar?", "Pode me ajudar?"] }
    ]
},
27: {
    title: "Presente Perfeito",
    icon: "check-circle",
    desc: "Ações no passado com efeito no presente.",
    tip: "Use 'have/has' + particípio passado. Ex: 'I have eaten'.",
    vocab: ["Have", "Has", "Done", "Seen", "Been", "Gone", "Already", "Yet", "Just", "Ever", "Never", "Since"],
    pool: [
        { type: "sel", q: "Qual é o particípio de 'see'?", opts: ["Saw", "Seen", "Seeing", "Sees"], a: "Seen" },
        { type: "sel", q: "Qual é o particípio de 'go'?", opts: ["Went", "Gone", "Going", "Goes"], a: "Gone" },
        { type: "sel", q: "Qual é o particípio de 'do'?", opts: ["Did", "Done", "Doing", "Does"], a: "Done" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I have already seen this movie", "I already saw this movie", "I have see this movie", "I has seen this movie"], a: "I have already seen this movie" },
        { type: "sel", q: "Qual frase está correta?", opts: ["She has been to London", "She have been to London", "She has go to London", "She is been to London"], a: "She has been to London" },
        { type: "sel", q: "Qual palavra indica uma experiência até agora?", opts: ["Ever", "Yesterday", "Ago", "Last year"], a: "Ever" },
        { type: "sel", q: "Qual palavra indica que algo ainda não aconteceu?", opts: ["Yet", "Already", "Just", "Soon"], a: "Yet" },
        { type: "sel", q: "Qual frase está correta?", opts: ["Have you finished yet?", "Did you finished yet?", "Have you finish yet?", "Do you finished yet?"], a: "Have you finished yet?" },
        { type: "sel", q: "Qual frase usa 'since' corretamente?", opts: ["I have lived here since 2020", "I lived here since 2020", "I live here since 2020 yesterday", "I have lived here for 2020"], a: "I have lived here since 2020" },
        { type: "sel", q: "Qual frase usa 'for' corretamente?", opts: ["I have studied for two hours", "I have studied since two hours", "I study for two hours ago", "I am studied for two hours"], a: "I have studied for two hours" },

        { type: "match", pairs: { "Feito": "Done", "Visto": "Seen", "Ido": "Gone", "Estado": "Been" } },
        { type: "match", pairs: { "Já": "Already", "Ainda": "Yet", "Desde": "Since", "Por": "For" } },
        { type: "match", pairs: { "Nunca": "Never", "Alguma vez": "Ever", "Recentemente": "Recently", "Acabou de": "Just" } },

        { type: "assemble", q: "Eu já vi esse filme", words: ["I", "have", "already", "seen", "this", "movie"], a: ["I have already seen this movie", "I've already seen this movie"] },
        { type: "assemble", q: "Ela já esteve em Londres", words: ["She", "has", "been", "to", "London", "already"], a: ["She has been to London"] },
        { type: "assemble", q: "Você já terminou?", words: ["Have", "you", "finished", "yet"], a: ["Have you finished yet?"] },
        { type: "assemble", q: "Eu moro aqui desde 2020", words: ["I", "have", "lived", "here", "since", "2020"], a: ["I have lived here since 2020"] },
        { type: "assemble", q: "Ele já comeu", words: ["He", "has", "already", "eaten", "food"], a: ["He has already eaten"] },

        { type: "write", target: "pt", q: "I have already seen this movie", a: ["Eu já vi esse filme"] },
        { type: "write", target: "en", q: "Ela já terminou", a: ["She has already finished"] },
        { type: "write", target: "pt", q: "Have you ever been there?", a: ["Você já esteve lá?"] },
        { type: "write", target: "en", q: "Nós moramos aqui há cinco anos", a: ["We have lived here for five years"] },
        { type: "write", target: "pt", q: "I have never eaten sushi", a: ["Eu nunca comi sushi"] },

        { type: "listen", target: "en", q: "Have you finished yet?", a: ["Have you finished yet?"] },
        { type: "listen", target: "pt", q: "She has been to London", a: ["Ela já esteve em Londres"] },
        { type: "listen", target: "pt", q: "I have lived here since 2020", a: ["Eu moro aqui desde 2020"] }
    ]
},
28: {
    title: "Past x Perfect",
    icon: "git-branch",
    desc: "Escolhendo entre passado simples e presente perfeito.",
    tip: "Use Simple Past com tempo específico. Use Present Perfect sem tempo definido ou com 'since/for'.",
    vocab: ["Did", "Have you", "Last year", "Ever", "Never", "In 2010", "Since", "For", "Already", "Yet", "Just", "Ago"],
    pool: [
        { type: "sel", q: "Se eu digo 'in 2015', qual tempo devo usar?", opts: ["I have gone", "I went", "I go", "I am going"], a: "I went" },
        { type: "sel", q: "Se eu digo 'yesterday', qual tempo devo usar?", opts: ["Present Perfect", "Simple Past", "Future", "Present Continuous"], a: "Simple Past" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I have seen him today", "I saw him yesterday", "I have saw him yesterday", "I was see him yesterday"], a: "I saw him yesterday" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I have known him since childhood", "I knew him since childhood", "I know him since childhood yesterday", "I have know him since childhood"], a: "I have known him since childhood" },
        { type: "sel", q: "Qual palavra indica tempo específico?", opts: ["Yesterday", "Ever", "Already", "Just"], a: "Yesterday" },
        { type: "sel", q: "Qual palavra combina mais com Present Perfect?", opts: ["Since", "In 2010", "Yesterday", "Last night"], a: "Since" },
        { type: "sel", q: "Qual frase está correta?", opts: ["Have you ever eaten sushi?", "Did you ever eaten sushi?", "Have you ever ate sushi?", "Do you ever ate sushi?"], a: "Have you ever eaten sushi?" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I didn't see him yesterday", "I haven't saw him yesterday", "I don't see him yesterday", "I wasn't see him yesterday"], a: "I didn't see him yesterday" },

        { type: "match", pairs: { "Alguma vez": "Ever", "Nunca": "Never", "Desde": "Since", "Por (duração)": "For" } },
        { type: "match", pairs: { "Ontem": "Yesterday", "Ano passado": "Last year", "Em 2010": "In 2010", "Há": "Ago" } },
        { type: "match", pairs: { "Já": "Already", "Ainda não": "Yet", "Acabei de": "Just", "Recentemente": "Recently" } },

        { type: "assemble", q: "Você já comeu sushi?", words: ["Have", "you", "ever", "eaten", "sushi", "did"], a: ["Have you ever eaten sushi?", "Have you ever eaten sushi"] },
        { type: "assemble", q: "Eu morei lá por cinco anos", words: ["I", "lived", "there", "for", "five", "years"], a: ["I lived there for five years"] },
        { type: "assemble", q: "Eu não vi ele ontem", words: ["I", "did", "not", "see", "him", "yesterday"], a: ["I did not see him yesterday", "I didn't see him yesterday"] },
        { type: "assemble", q: "Eu conheço ele desde a infância", words: ["I", "have", "known", "him", "since", "childhood"], a: ["I have known him since childhood"] },
        { type: "assemble", q: "Eles já terminaram", words: ["They", "have", "already", "finished"], a: ["They have already finished"] },

        { type: "write", target: "pt", q: "I lived there for five years", a: ["Eu morei lá por cinco anos"] },
        { type: "write", target: "en", q: "Eu vi esse filme ontem", a: ["I saw this movie yesterday"] },
        { type: "write", target: "pt", q: "I have known him since childhood", a: ["Eu o conheço desde a infância"] },
        { type: "write", target: "en", q: "Você já esteve em Paris?", a: ["Have you ever been to Paris?"] },
        { type: "write", target: "pt", q: "They went there last year", a: ["Eles foram lá no ano passado"] },

        { type: "listen", target: "en", q: "I have known him since childhood", a: ["I have known him since childhood", "I've known him since childhood"] },
        { type: "listen", target: "pt", q: "I saw him yesterday", a: ["Eu o vi ontem"] },
        { type: "listen", target: "pt", q: "Have you ever eaten sushi?", a: ["Você já comeu sushi?"] }
    ]
},
29: {
    title: "Tecnologia",
    icon: "monitor",
    desc: "Vocabulário do mundo digital.",
    tip: "Muitas palavras de tecnologia vieram do inglês: mouse, download, upload, software.",
    vocab: ["Screen", "Keyboard", "Mouse", "Download", "Upload", "Password", "Network", "Search", "File", "Device", "Link", "Online"],
    pool: [
        { type: "sel", q: "Como se diz 'Senha'?", opts: ["Keyboard", "Network", "Password", "Download"], a: "Password" },
        { type: "sel", q: "Como se diz 'Teclado'?", opts: ["Keyboard", "Screen", "Mouse", "File"], a: "Keyboard" },
        { type: "sel", q: "Como se diz 'Tela'?", opts: ["Screen", "Search", "Share", "Store"], a: "Screen" },
        { type: "sel", q: "Como se diz 'Rede'?", opts: ["Network", "Notebook", "News", "Link"], a: "Network" },
        { type: "sel", q: "Como se diz 'Buscar'?", opts: ["Search", "Send", "Save", "Scroll"], a: "Search" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I forgot my password", "I forget my password yesterday", "I forgot my passworded", "I forgetting my password"], a: "I forgot my password" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I am downloading the file", "I download the file now", "I downloading the file", "I downloaded the file now"], a: "I am downloading the file" },
        { type: "sel", q: "Qual palavra significa 'arquivo'?", opts: ["File", "Folder", "Screen", "Link"], a: "File" },
        { type: "sel", q: "Qual palavra significa 'online'?", opts: ["Online", "Onlinee", "On line", "Onling"], a: "Online" },
        { type: "sel", q: "Qual frase está correta?", opts: ["Click the link", "Clicking the link", "Click to the link", "Click on link the"], a: "Click the link" },

        { type: "match", pairs: { "Teclado": "Keyboard", "Tela": "Screen", "Rede": "Network", "Buscar": "Search" } },
        { type: "match", pairs: { "Senha": "Password", "Baixar": "Download", "Enviar": "Upload", "Arquivo": "File" } },
        { type: "match", pairs: { "Dispositivo": "Device", "Link": "Link", "Online": "Online", "Mouse": "Mouse" } },

        { type: "assemble", q: "Eu esqueci minha senha", words: ["I", "forgot", "my", "password", "screen", "lost"], a: ["I forgot my password"] },
        { type: "assemble", q: "Estou baixando o arquivo", words: ["I", "am", "downloading", "the", "file"], a: ["I am downloading the file", "I'm downloading the file"] },
        { type: "assemble", q: "Conecte-se à rede", words: ["Connect", "to", "the", "network"], a: ["Connect to the network"] },
        { type: "assemble", q: "Abra o link", words: ["Open", "the", "link", "click"], a: ["Open the link"] },
        { type: "assemble", q: "Meu celular está online", words: ["My", "phone", "is", "online"], a: ["My phone is online"] },

        { type: "write", target: "en", q: "Eu preciso da senha", a: ["I need the password"] },
        { type: "write", target: "pt", q: "Click the link", a: ["Clique no link", "Clique no enlace"] },
        { type: "write", target: "en", q: "O computador está ligado", a: ["The computer is on"] },
        { type: "write", target: "pt", q: "I am sending a file", a: ["Eu estou enviando um arquivo"] },
        { type: "write", target: "en", q: "Minha tela está quebrada", a: ["My screen is broken"] },

        { type: "listen", target: "pt", q: "Connect to the network", a: ["Conecte-se à rede"] },
        { type: "listen", target: "en", q: "I forgot my password", a: ["I forgot my password"] },
        { type: "listen", target: "pt", q: "Open the file", a: ["Abra o arquivo"] }
    ]
},
30: {
    title: "Entretenimento",
    icon: "tv",
    desc: "Cultura, artes e mídia.",
    tip: "'Series' pode ser usada para singular e plural. Ex: 'This series is good'.",
    vocab: ["Movie", "Theater", "Concert", "Exhibition", "Stage", "Actor", "Director", "Audience", "Series", "Show", "Music", "Ticket"],
    pool: [
        { type: "sel", q: "Onde os atores se apresentam ao vivo?", opts: ["Cinema", "Theater", "Museum", "Stadium"], a: "Theater" },
        { type: "sel", q: "Onde vemos filmes?", opts: ["Cinema", "Library", "Office", "Kitchen"], a: "Cinema" },
        { type: "sel", q: "Qual palavra significa 'ator'?", opts: ["Actor", "Author", "Artist", "Audience"], a: "Actor" },
        { type: "sel", q: "Qual palavra significa 'diretor'?", opts: ["Director", "Driver", "Doctor", "Drawer"], a: "Director" },
        { type: "sel", q: "Qual palavra significa 'público'?", opts: ["Audience", "Scene", "Stage", "Sound"], a: "Audience" },
        { type: "sel", q: "Qual frase está correta?", opts: ["The concert was amazing", "The concert is amazing yesterday", "The concert amazing was", "Concert the was amazing"], a: "The concert was amazing" },
        { type: "sel", q: "Qual frase está correta?", opts: ["Let's go to the theater", "Let's go in the theater now", "Let's going to the theater", "Let's to go the theater"], a: "Let's go to the theater" },
        { type: "sel", q: "Qual palavra significa 'palco'?", opts: ["Stage", "Story", "Screen", "Seat"], a: "Stage" },
        { type: "sel", q: "Qual palavra significa 'show'?", opts: ["Show", "Short", "Shop", "Shot"], a: "Show" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I love this series", "I love these serieses", "I love this serie", "I loving this series"], a: "I love this series" },
        { type: "sel", q: "Qual palavra significa 'ingresso'?", opts: ["Ticket", "Ticketing", "Tick", "Taker"], a: "Ticket" },
        { type: "sel", q: "Qual palavra significa 'música'?", opts: ["Music", "Museum", "Motion", "Message"], a: "Music" },

        { type: "match", pairs: { "Palco": "Stage", "Público": "Audience", "Ator": "Actor", "Show": "Concert" } },
        { type: "match", pairs: { "Filme": "Movie", "Teatro": "Theater", "Série": "Series", "Diretor": "Director" } },
        { type: "match", pairs: { "Ingresso": "Ticket", "Exposição": "Exhibition", "Música": "Music", "Programa": "Show" } },

        { type: "assemble", q: "O show foi incrível", words: ["The", "concert", "was", "amazing", "movie", "is"], a: ["The concert was amazing"] },
        { type: "assemble", q: "Eu amo essa série", words: ["I", "love", "this", "series", "these", "movie"], a: ["I love this series"] },
        { type: "assemble", q: "Vamos ao teatro", words: ["Let's", "go", "to", "the", "theater"], a: ["Let's go to the theater"] },
        { type: "assemble", q: "O diretor é bom", words: ["The", "director", "is", "good", "bad"], a: ["The director is good"] },
        { type: "assemble", q: "O ator está no palco", words: ["The", "actor", "is", "on", "the", "stage"], a: ["The actor is on the stage"] },

        { type: "write", target: "pt", q: "Who is the director?", a: ["Quem é o diretor?"] },
        { type: "write", target: "en", q: "Nós compramos ingressos", a: ["We bought tickets"] },
        { type: "write", target: "pt", q: "I love this movie", a: ["Eu amo este filme", "Eu adoro este filme"] },
        { type: "write", target: "en", q: "A exposição foi boa", a: ["The exhibition was good"] },
        { type: "write", target: "pt", q: "The audience is big", a: ["O público é grande"] },

        { type: "listen", target: "en", q: "Let's go to the theater", a: ["Let's go to the theater"] },
        { type: "listen", target: "pt", q: "The movie was great", a: ["O filme foi ótimo", "O filme estava ótimo"] },
        { type: "listen", target: "pt", q: "I love this series", a: ["Eu amo essa série"] }
    ]
            },
            31: {
    title: "Condicionais",
    icon: "git-merge",
    desc: "O que aconteceria SE...",
    tip: "First Conditional: If + Present, Will. (If it rains, I will stay).",
    vocab: ["If", "Unless", "Would", "Will", "Happen", "Condition", "Result", "Suppose", "May", "Might", "Could", "Provided"],
    pool: [
        { type: "sel", q: "If I study hard, I _____ pass the exam.", opts: ["would", "will", "passed", "did"], a: "will" },
        { type: "sel", q: "If it rains, I _____ stay home.", opts: ["will", "would", "did", "am"], a: "will" },
        { type: "sel", q: "Qual palavra significa 'a menos que'?", opts: ["If", "Unless", "Would", "Could"], a: "Unless" },
        { type: "sel", q: "Qual frase está correta?", opts: ["If you leave now, you will catch the bus", "If you leave now, you catch the bus will", "If you leaving now, you will catch the bus", "If you left now, you will catch the bus"], a: "If you leave now, you will catch the bus" },
        { type: "sel", q: "Qual frase expressa uma hipótese?", opts: ["Suppose you won the lottery", "I am going now", "She works every day", "They went yesterday"], a: "Suppose you won the lottery" },
        { type: "sel", q: "Qual é o uso mais comum de 'would'?", opts: ["Situação real no presente", "Condição hipotética", "Ação obrigatória", "Ação no passado simples"], a: "Condição hipotética" },
        { type: "sel", q: "Qual frase usa o condicional corretamente?", opts: ["I would help you if I had time", "I will help you if I had time", "I would help you if I have time", "I help you if I would time"], a: "I would help you if I had time" },
        { type: "sel", q: "Qual palavra combina com decisão hipotética?", opts: ["Would", "Must", "Did", "Had"], a: "Would" },
        { type: "sel", q: "Qual frase é um First Conditional?", opts: ["If he studies, he will pass", "If he studied, he would pass", "If he had studied, he would have passed", "If he studies, he passed"], a: "If he studies, he will pass" },
        { type: "sel", q: "Qual frase é mais natural?", opts: ["Unless you try, you won't know", "Unless you try, you don't know will", "Unless you try, you won't knew", "Unless you try, you no know"], a: "Unless you try, you won't know" },
        { type: "sel", q: "Qual palavra indica uma condição?", opts: ["Condition", "Result", "Answer", "Reason"], a: "Condition" },
        { type: "sel", q: "Qual frase está correta?", opts: ["If I were rich, I would travel", "If I am rich, I would travel", "If I will be rich, I would travel", "If I rich, I would travel"], a: "If I were rich, I would travel" },

        { type: "match", pairs: { "Se": "If", "A menos que": "Unless", "Iria (condicional)": "Would", "Suponha": "Suppose" } },
        { type: "match", pairs: { "Caso": "If", "Resultado": "Result", "Condição": "Condition", "Acontecer": "Happen" } },
        { type: "match", pairs: { "Pudesse": "Could", "Talvez": "Might", "Seja que": "Whether", "Desde que": "Provided" } },

        { type: "assemble", q: "Se chover, nós ficaremos em casa", words: ["If", "it", "rains", "we", "will", "stay", "home"], a: ["If it rains, we will stay home", "If it rains we will stay home"] },
        { type: "assemble", q: "Eu iria se pudesse", words: ["I", "would", "go", "if", "I", "could"], a: ["I would go if I could"] },
        { type: "assemble", q: "Se você estudar, você passará", words: ["If", "you", "study", "you", "will", "pass"], a: ["If you study, you will pass"] },
        { type: "assemble", q: "A menos que ele venha, nós iremos", words: ["Unless", "he", "comes", "we", "will", "go"], a: ["Unless he comes, we will go"] },
        { type: "assemble", q: "Se eu tivesse dinheiro, compraria isso", words: ["If", "I", "had", "money", "I", "would", "buy", "it"], a: ["If I had money, I would buy it"] },
        { type: "assemble", q: "Suponha que você esteja certo", words: ["Suppose", "you", "are", "right"], a: ["Suppose you are right"] },
        { type: "assemble", q: "Se ele ligar, me avise", words: ["If", "he", "calls", "let", "me", "know"], a: ["If he calls, let me know"] },

        { type: "write", target: "en", q: "Se eu tiver tempo, eu vou ajudar", a: ["If I have time, I will help"] },
        { type: "write", target: "en", q: "Eu faria isso se fosse fácil", a: ["I would do that if it were easy"] },
        { type: "write", target: "pt", q: "If she studies, she will pass", a: ["Se ela estudar, ela vai passar"] },
        { type: "write", target: "pt", q: "Unless you hurry, you will be late", a: ["A menos que você se apresse, você vai se atrasar"] },
        { type: "write", target: "en", q: "Se nós sairmos agora, chegaremos cedo", a: ["If we leave now, we will arrive early"] },
        { type: "write", target: "pt", q: "If I were you, I would wait", a: ["Se eu fosse você, eu esperaria"] },

        { type: "listen", target: "pt", q: "Unless you try, you won't know", a: ["A menos que você tente, você não saberá", "A não ser que tente, não vai saber"] },
        { type: "listen", target: "pt", q: "If it rains, I will stay home", a: ["Se chover, eu ficarei em casa"] },
        { type: "listen", target: "pt", q: "I would go if I could", a: ["Eu iria se pudesse"] }
    ]
},
32: {
    title: "Voz Passiva",
    icon: "repeat",
    desc: "Quando o objeto sofre a ação.",
    tip: "O objeto vira o sujeito. Ex: 'The car was washed by him'.",
    vocab: ["Is made", "Was built", "Were found", "By", "Discovered", "Invented", "Written", "Produced", "Opened", "Closed", "Cleaned", "Sent"],
    pool: [
        { type: "sel", q: "The book _____ written by Shakespeare.", opts: ["was", "is", "were", "did"], a: "was" },
        { type: "sel", q: "The house _____ built in 1990.", opts: ["was", "is", "were", "be"], a: "was" },
        { type: "sel", q: "Many mistakes _____ found in the text.", opts: ["were", "was", "is", "did"], a: "were" },
        { type: "sel", q: "Qual frase está em voz passiva?", opts: ["The cake was eaten", "He ate the cake", "They eat cake", "I am eating cake"], a: "The cake was eaten" },
        { type: "sel", q: "Quem fez a ação aparece normalmente depois de:", opts: ["With", "By", "At", "For"], a: "By" },
        { type: "sel", q: "Qual é a forma passiva de 'People speak English here'?", opts: ["English is spoken here", "English speaks here", "English was spoke here", "English is speak here"], a: "English is spoken here" },
        { type: "sel", q: "Qual frase está correta?", opts: ["The phone was invented by Bell", "The phone invented by Bell was", "The phone was invent by Bell", "The phone is inventing by Bell"], a: "The phone was invented by Bell" },
        { type: "sel", q: "Qual verbo é comum em passiva?", opts: ["Be", "Do", "Run", "Make"], a: "Be" },
        { type: "sel", q: "Qual frase está correta?", opts: ["These cars are made in Japan", "These cars is made in Japan", "These cars made are in Japan", "These cars are make in Japan"], a: "These cars are made in Japan" },
        { type: "sel", q: "Qual frase é passiva?", opts: ["The letter was sent yesterday", "She sent the letter yesterday", "I send the letter yesterday", "They are sending the letter"], a: "The letter was sent yesterday" },
        { type: "sel", q: "Qual frase é passiva?", opts: ["The window is broken", "The window broke", "He breaks the window", "Breaking the window"], a: "The window is broken" },
        { type: "sel", q: "Qual forma completa melhor a frase: The song _____ produced by a famous artist.", opts: ["was", "is", "were", "does"], a: "was" },

        { type: "match", pairs: { "Foi construído": "Was built", "É feito": "Is made", "Foram encontrados": "Were found", "Escrito": "Written" } },
        { type: "match", pairs: { "Inventado": "Invented", "Produzido": "Produced", "Enviado": "Sent", "Abrido": "Opened" } },
        { type: "match", pairs: { "Fechado": "Closed", "Limpo": "Cleaned", "Descoberto": "Discovered", "Por": "By" } },

        { type: "assemble", q: "O telefone foi inventado por Bell", words: ["The", "telephone", "was", "invented", "by", "Bell"], a: ["The telephone was invented by Bell"] },
        { type: "assemble", q: "Esses carros são feitos no Japão", words: ["These", "cars", "are", "made", "in", "Japan"], a: ["These cars are made in Japan"] },
        { type: "assemble", q: "O livro foi escrito por ela", words: ["The", "book", "was", "written", "by", "her"], a: ["The book was written by her"] },
        { type: "assemble", q: "A janela foi quebrada", words: ["The", "window", "was", "broken"], a: ["The window was broken"] },
        { type: "assemble", q: "As chaves foram encontradas", words: ["The", "keys", "were", "found"], a: ["The keys were found"] },
        { type: "assemble", q: "O bolo foi comido", words: ["The", "cake", "was", "eaten"], a: ["The cake was eaten"] },

        { type: "write", target: "pt", q: "English is spoken here", a: ["Inglês é falado aqui", "Fala-se inglês aqui"] },
        { type: "write", target: "pt", q: "The cake was eaten", a: ["O bolo foi comido"] },
        { type: "write", target: "en", q: "O carro foi lavado por ele", a: ["The car was washed by him"] },
        { type: "write", target: "en", q: "O prédio foi construído em 2001", a: ["The building was built in 2001"] },
        { type: "write", target: "pt", q: "The song is sung by many people", a: ["A música é cantada por muitas pessoas"] },
        { type: "write", target: "en", q: "As cartas foram enviadas ontem", a: ["The letters were sent yesterday"] },

        { type: "listen", target: "en", q: "The cake was eaten", a: ["The cake was eaten"] },
        { type: "listen", target: "pt", q: "The telephone was invented by Bell", a: ["O telefone foi inventado por Bell"] },
        { type: "listen", target: "pt", q: "These cars are made in Japan", a: ["Esses carros são feitos no Japão"] }
    ]
},
33: {
    title: "Phrasal Verbs I",
    icon: "link",
    desc: "Verbo + Preposição = Novo significado.",
    tip: "'Give up' não é 'dar para cima', significa 'desistir'. Contexto é tudo.",
    vocab: ["Give up", "Go on", "Take off", "Look for", "Find out", "Wake up", "Turn on", "Turn off", "Look after", "Run out", "Pick up", "Set up"],
    pool: [
        { type: "sel", q: "Qual phrasal verb significa 'Descobrir'?", opts: ["Give up", "Find out", "Take off", "Turn on"], a: "Find out" },
        { type: "sel", q: "Qual phrasal verb significa 'Desistir'?", opts: ["Go on", "Give up", "Look for", "Pick up"], a: "Give up" },
        { type: "sel", q: "Qual phrasal verb significa 'Ligar'?", opts: ["Turn on", "Turn off", "Wake up", "Run out"], a: "Turn on" },
        { type: "sel", q: "Qual phrasal verb significa 'Desligar'?", opts: ["Turn off", "Turn on", "Go on", "Set up"], a: "Turn off" },
        { type: "sel", q: "Qual phrasal verb significa 'Procurar'?", opts: ["Look for", "Look after", "Look up", "Look in"], a: "Look for" },
        { type: "sel", q: "Qual frase está correta?", opts: ["Never give up on your dreams", "Never give on your dreams up", "Never up give your dreams", "Never dreams give up your"], a: "Never give up on your dreams" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I am looking for my keys", "I am looking my keys for", "I looking for my keys", "I look for my keys am"], a: "I am looking for my keys" },
        { type: "sel", q: "Qual phrasal verb significa 'Cuidar de'?", opts: ["Look after", "Look for", "Look up", "Turn off"], a: "Look after" },
        { type: "sel", q: "Qual phrasal verb significa 'Acabar'?", opts: ["Run out", "Go on", "Pick up", "Set up"], a: "Run out" },
        { type: "sel", q: "Qual phrasal verb significa 'Buscar/pegar'?", opts: ["Pick up", "Give up", "Find out", "Turn off"], a: "Pick up" },
        { type: "sel", q: "Qual phrasal verb significa 'Continuar'?", opts: ["Go on", "Give up", "Run out", "Look after"], a: "Go on" },
        { type: "sel", q: "Qual phrasal verb significa 'Montar/organizar'?", opts: ["Set up", "Turn up", "Give in", "Look at"], a: "Set up" },

        { type: "match", pairs: { "Desistir": "Give up", "Continuar": "Go on", "Procurar": "Look for", "Ligar": "Turn on" } },
        { type: "match", pairs: { "Desligar": "Turn off", "Cuidar de": "Look after", "Acabar": "Run out", "Pegar": "Pick up" } },
        { type: "match", pairs: { "Descobrir": "Find out", "Acordar": "Wake up", "Montar": "Set up", "Passar por": "Go on" } },

        { type: "assemble", q: "Nunca desista dos seus sonhos", words: ["Never", "give", "up", "on", "your", "dreams"], a: ["Never give up on your dreams"] },
        { type: "assemble", q: "Estou procurando minhas chaves", words: ["I", "am", "looking", "for", "my", "keys"], a: ["I am looking for my keys", "I'm looking for my keys"] },
        { type: "assemble", q: "Por favor, desligue a luz", words: ["Please", "turn", "off", "the", "light"], a: ["Please turn off the light"] },
        { type: "assemble", q: "O avião vai decolar em breve", words: ["The", "plane", "will", "take", "off", "soon"], a: ["The plane will take off soon"] },
        { type: "assemble", q: "Eu vou cuidar do cachorro", words: ["I", "will", "look", "after", "the", "dog"], a: ["I will look after the dog"] },
        { type: "assemble", q: "A comida acabou", words: ["The", "food", "ran", "out"], a: ["The food ran out"] },

        { type: "write", target: "en", q: "Por favor, desligue a TV", a: ["Please turn off the TV"] },
        { type: "write", target: "pt", q: "The plane will take off soon", a: ["O avião vai decolar em breve", "O avião decolará em breve"] },
        { type: "write", target: "en", q: "Eu descobri a verdade", a: ["I found out the truth"] },
        { type: "write", target: "pt", q: "We need to set up the room", a: ["Precisamos montar a sala", "Precisamos preparar a sala"] },
        { type: "write", target: "en", q: "Ela cuida da irmã dela", a: ["She looks after her sister"] },
        { type: "write", target: "pt", q: "Go on, continue", a: ["Continue", "Vá em frente", "Pode continuar"] },

        { type: "listen", target: "pt", q: "The plane will take off soon", a: ["O avião vai decolar em breve"] },
        { type: "listen", target: "en", q: "I found out the truth", a: ["I found out the truth"] },
        { type: "listen", target: "pt", q: "Please turn on the light", a: ["Por favor, ligue a luz"] }
    ]
},
34: {
    title: "Discurso Indireto",
    icon: "message-square",
    desc: "Contando o que os outros disseram.",
    tip: "Ao repassar uma fala, o verbo geralmente recua um tempo. Ex: 'I am happy' → 'He said he was happy'.",
    vocab: ["Said", "Told", "Asked", "Whether", "If", "Explained", "Mentioned", "Replied", "Reported", "Announced", "Admitted", "Promised"],
    pool: [
        { type: "sel", q: "He said that he _____ tired.", opts: ["is", "was", "be", "am"], a: "was" },
        { type: "sel", q: "She told me she _____ busy.", opts: ["is", "was", "were", "be"], a: "was" },
        { type: "sel", q: "Qual verbo é comum no discurso indireto?", opts: ["Said", "Run", "Eat", "Sleep"], a: "Said" },
        { type: "sel", q: "Qual frase está correta?", opts: ["He said he was happy", "He says he is happy yesterday", "He told he happy", "He said him was happy"], a: "He said he was happy" },
        { type: "sel", q: "Qual palavra é usada para perguntas indiretas?", opts: ["If", "By", "At", "For"], a: "If" },
        { type: "sel", q: "Qual frase está correta?", opts: ["She asked if I wanted water", "She asked did I want water", "She ask if I wanted water", "She asked if do I want water"], a: "She asked if I wanted water" },
        { type: "sel", q: "Qual frase está correta?", opts: ["They said they were coming", "They said they are coming yesterday", "They tell they were coming", "They said them were coming"], a: "They said they were coming" },
        { type: "sel", q: "Qual verbo significa 'contar a alguém'?", opts: ["Told", "Said", "Asked", "Replied"], a: "Told" },
        { type: "sel", q: "Qual frase está correta?", opts: ["He told me not to go", "He said me not go", "He told not go me", "He asked me go not"], a: "He told me not to go" },
        { type: "sel", q: "Qual palavra significa 'respondeu'?", opts: ["Replied", "Explained", "Admitted", "Mentioned"], a: "Replied" },
        { type: "sel", q: "Qual frase está correta?", opts: ["She explained that she was late", "She explained that she is late yesterday", "She explained that she be late", "She explain she late"], a: "She explained that she was late" },
        { type: "sel", q: "Qual verbo combina com notícia ou anúncio?", opts: ["Announced", "Ran", "Fell", "Broke"], a: "Announced" },

        { type: "match", pairs: { "Disse": "Said", "Contou": "Told", "Perguntou": "Asked", "Explicou": "Explained" } },
        { type: "match", pairs: { "Mencionou": "Mentioned", "Respondeu": "Replied", "Anunciou": "Announced", "Admitiu": "Admitted" } },
        { type: "match", pairs: { "Prometeu": "Promised", "Se/Seja que": "If", "Se": "Whether", "Relatou": "Reported" } },

        { type: "assemble", q: "Ela me disse que estava ocupada", words: ["She", "told", "me", "she", "was", "busy"], a: ["She told me she was busy", "She told me that she was busy"] },
        { type: "assemble", q: "Ele perguntou se eu queria água", words: ["He", "asked", "if", "I", "wanted", "water"], a: ["He asked if I wanted water"] },
        { type: "assemble", q: "Eles disseram que estavam vindo", words: ["They", "said", "they", "were", "coming"], a: ["They said they were coming"] },
        { type: "assemble", q: "Ele disse para não ir", words: ["He", "told", "me", "not", "to", "go"], a: ["He told me not to go"] },
        { type: "assemble", q: "Ela explicou que estava atrasada", words: ["She", "explained", "that", "she", "was", "late"], a: ["She explained that she was late"] },
        { type: "assemble", q: "Ele prometeu ajudar", words: ["He", "promised", "to", "help"], a: ["He promised to help"] },

        { type: "write", target: "pt", q: "He said he was tired", a: ["Ele disse que estava cansado"] },
        { type: "write", target: "pt", q: "She asked if I was ready", a: ["Ela perguntou se eu estava pronto", "Ela perguntou se eu estava pronta"] },
        { type: "write", target: "en", q: "Ela disse que estava feliz", a: ["She said she was happy"] },
        { type: "write", target: "pt", q: "He told me to wait", a: ["Ele me disse para esperar"] },
        { type: "write", target: "en", q: "Eles anunciaram a notícia", a: ["They announced the news"] },
        { type: "write", target: "pt", q: "I promised to call", a: ["Eu prometi ligar"] },

        { type: "listen", target: "en", q: "They said they were coming", a: ["They said they were coming"] },
        { type: "listen", target: "pt", q: "He told me not to go", a: ["Ele me disse para não ir"] },
        { type: "listen", target: "pt", q: "She said she was busy", a: ["Ela disse que estava ocupada"] }
    ]
},
35: {
    title: "Business English",
    icon: "trending-up",
    desc: "Inglês formal para o mercado de trabalho.",
    tip: "No mundo corporativo, evite gírias. Use termos claros como 'deadline' e 'meeting'.",
    vocab: ["Meeting", "Deadline", "Budget", "Strategy", "Manager", "Profit", "Loss", "Negotiation", "Client", "Report", "Contract", "Team"],
    pool: [
        { type: "sel", q: "O que significa 'Deadline'?", opts: ["Linha morta", "Reunião", "Prazo final", "Orçamento"], a: "Prazo final" },
        { type: "sel", q: "O que significa 'Budget'?", opts: ["Lucro", "Orçamento", "Contratação", "Contrato"], a: "Orçamento" },
        { type: "sel", q: "O que significa 'Profit'?", opts: ["Perda", "Lucro", "Preço", "Cliente"], a: "Lucro" },
        { type: "sel", q: "O que significa 'Loss'?", opts: ["Lucro", "Perda", "Meta", "Venda"], a: "Perda" },
        { type: "sel", q: "Qual palavra significa 'gerente'?", opts: ["Manager", "Member", "Market", "Merchant"], a: "Manager" },
        { type: "sel", q: "Qual palavra significa 'cliente'?", opts: ["Client", "Clerk", "Class", "Call"], a: "Client" },
        { type: "sel", q: "Qual frase está correta?", opts: ["We have a meeting today", "We has a meeting today", "We are meeting have today", "We meeting have today"], a: "We have a meeting today" },
        { type: "sel", q: "Qual frase está correta?", opts: ["The deadline is tomorrow", "The deadline tomorrow is", "The tomorrow is deadline", "Deadline the is tomorrow"], a: "The deadline is tomorrow" },
        { type: "sel", q: "Qual termo combina com discussão de preço ou acordo?", opts: ["Negotiation", "Navigation", "Notification", "Observation"], a: "Negotiation" },
        { type: "sel", q: "Qual documento formal é usado em negócios?", opts: ["Contract", "Cartoon", "Concert", "Contest"], a: "Contract" },
        { type: "sel", q: "Qual frase está correta?", opts: ["We need a new strategy", "We need new a strategy", "We need strategy new", "Need we a new strategy"], a: "We need a new strategy" },
        { type: "sel", q: "Qual frase está correta?", opts: ["The report is ready", "The report ready is", "Report the is ready", "The ready is report"], a: "The report is ready" },

        { type: "match", pairs: { "Reunião": "Meeting", "Orçamento": "Budget", "Lucro": "Profit", "Gerente": "Manager" } },
        { type: "match", pairs: { "Perda": "Loss", "Cliente": "Client", "Relatório": "Report", "Contrato": "Contract" } },
        { type: "match", pairs: { "Equipe": "Team", "Estratégia": "Strategy", "Prazo final": "Deadline", "Negociação": "Negotiation" } },

        { type: "assemble", q: "Nós temos uma reunião hoje", words: ["We", "have", "a", "meeting", "today"], a: ["We have a meeting today"] },
        { type: "assemble", q: "O prazo é amanhã", words: ["The", "deadline", "is", "tomorrow"], a: ["The deadline is tomorrow"] },
        { type: "assemble", q: "Precisamos de uma nova estratégia", words: ["We", "need", "a", "new", "strategy"], a: ["We need a new strategy"] },
        { type: "assemble", q: "O relatório está pronto", words: ["The", "report", "is", "ready"], a: ["The report is ready"] },
        { type: "assemble", q: "O cliente aprovou o contrato", words: ["The", "client", "approved", "the", "contract"], a: ["The client approved the contract"] },
        { type: "assemble", q: "Nosso lucro aumentou este ano", words: ["Our", "profit", "increased", "this", "year"], a: ["Our profit increased this year"] },

        { type: "write", target: "en", q: "O prazo é amanhã", a: ["The deadline is tomorrow"] },
        { type: "write", target: "pt", q: "Our profit increased this year", a: ["Nosso lucro aumentou este ano"] },
        { type: "write", target: "en", q: "Precisamos terminar o relatório", a: ["We need to finish the report"] },
        { type: "write", target: "pt", q: "We need a new strategy", a: ["Precisamos de uma nova estratégia"] },
        { type: "write", target: "en", q: "A reunião foi cancelada", a: ["The meeting was canceled", "The meeting was cancelled"] },
        { type: "write", target: "pt", q: "The client signed the contract", a: ["O cliente assinou o contrato"] },

        { type: "listen", target: "pt", q: "Our profit increased this year", a: ["Nosso lucro aumentou este ano"] },
        { type: "listen", target: "en", q: "The deadline is tomorrow", a: ["The deadline is tomorrow"] },
        { type: "listen", target: "pt", q: "We have a meeting today", a: ["Nós temos uma reunião hoje"] }
    ]
            },
            36: {
    title: "Phrasal Verbs Avançados",
    icon: "layers",
    desc: "Phrasal verbs mais complexos e com múltiplos significados.",
    tip: "'Put up with' significa tolerar. Quanto mais verbos frasais dominar, mais natural seu inglês soa.",
    vocab: ["Put up with", "Look forward to", "Run out of", "Make up", "Turn out", "Carry on", "Bring up", "Break down", "Figure out", "Settle down", "Come across", "Get over"],
    pool: [
        { type: "sel", q: "O que significa 'Run out of'?", opts: ["Correr para fora", "Ficar sem algo", "Ligar", "Desistir"], a: "Ficar sem algo" },
        { type: "sel", q: "O que significa 'Put up with'?", opts: ["Apoiar", "Tolerar", "Organizar", "Descobrir"], a: "Tolerar" },
        { type: "sel", q: "O que significa 'Look forward to'?", opts: ["Esperar ansiosamente", "Procurar", "Abaixo", "Cancelar"], a: "Esperar ansiosamente" },
        { type: "sel", q: "O que significa 'Figure out'?", opts: ["Entender", "Esquecer", "Ligar", "Cair"], a: "Entender" },
        { type: "sel", q: "O que significa 'Turn out'?", opts: ["Acontecer/resultado final", "Apagar", "Abrir", "Viajar"], a: "Acontecer/resultado final" },
        { type: "sel", q: "O que significa 'Come across'?", opts: ["Encontrar por acaso", "Parar", "Desistir", "Continuar"], a: "Encontrar por acaso" },
        { type: "sel", q: "O que significa 'Get over'?", opts: ["Superar", "Ligar", "Desligar", "Consertar"], a: "Superar" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I am looking forward to the trip", "I am looking to forward the trip", "I look forward the trip", "I am forward looking to the trip"], a: "I am looking forward to the trip" },
        { type: "sel", q: "Qual frase está correta?", opts: ["We ran out of gas", "We run out gas", "We ran out gas of", "We out of ran gas"], a: "We ran out of gas" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I need to figure it out", "I need to figure out it", "I need figure it out", "I need out figure it"], a: "I need to figure it out" },
        { type: "sel", q: "Qual frase está correta?", opts: ["The plan turned out well", "The plan turned well out", "The plan out turned well", "The plan well turned out"], a: "The plan turned out well" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I can't put up with this noise", "I can't put with up this noise", "I can't up put with this noise", "I can't put this noise up with"], a: "I can't put up with this noise" },

        { type: "match", pairs: { "Tolerar": "Put up with", "Ficar sem": "Run out of", "Aguardo ansiosamente": "Look forward to", "Entender": "Figure out" } },
        { type: "match", pairs: { "Acontecer/resultado": "Turn out", "Continuar": "Carry on", "Mencionar": "Bring up", "Recuperar-se": "Get over" } },
        { type: "match", pairs: { "Deparar-se com": "Come across", "Assentar/estabilizar": "Settle down", "Consertar/quebrar": "Break down", "Inventar/fazer as pazes": "Make up" } },

        { type: "assemble", q: "Nós ficamos sem gasolina", words: ["We", "ran", "out", "of", "gas", "run"], a: ["We ran out of gas"] },
        { type: "assemble", q: "Não traga esse assunto", words: ["Do", "not", "bring", "that", "up", "down"], a: ["Do not bring that up", "Don't bring that up"] },
        { type: "assemble", q: "Estou ansioso pela viagem", words: ["I", "am", "looking", "forward", "to", "the", "trip"], a: ["I am looking forward to the trip", "I'm looking forward to the trip"] },
        { type: "assemble", q: "Ele superou o problema", words: ["He", "got", "over", "the", "problem"], a: ["He got over the problem"] },
        { type: "assemble", q: "Eu encontrei meu professor por acaso", words: ["I", "came", "across", "my", "teacher"], a: ["I came across my teacher"] },
        { type: "assemble", q: "O carro quebrou no caminho", words: ["The", "car", "broke", "down", "on", "the", "way"], a: ["The car broke down on the way"] },

        { type: "write", target: "pt", q: "I am looking forward to it", a: ["Estou ansioso por isso", "Estou aguardando ansiosamente"] },
        { type: "write", target: "pt", q: "My car broke down", a: ["Meu carro quebrou", "Meu carro pifou"] },
        { type: "write", target: "en", q: "Nós precisamos descobrir isso", a: ["We need to figure it out"] },
        { type: "write", target: "en", q: "Eu não suporto esse som", a: ["I can't put up with this sound"] },
        { type: "write", target: "pt", q: "The plan turned out well", a: ["O plano deu certo", "O plano acabou dando certo"] },
        { type: "write", target: "en", q: "Não desista", a: ["Don't give up"] },

        { type: "listen", target: "en", q: "My car broke down", a: ["My car broke down"] },
        { type: "listen", target: "pt", q: "We ran out of gas", a: ["Nós ficamos sem gasolina"] },
        { type: "listen", target: "pt", q: "I came across an old photo", a: ["Encontrei uma foto antiga por acaso"] }
    ]
},
37: {
    title: "Idioms & Common Expressions",
    icon: "message-circle",
    desc: "Idioms reais e expressões que nativos usam no dia a dia.",
    tip: "'Piece of cake' quer dizer algo muito fácil. Idioms quase nunca devem ser traduzidos palavra por palavra.",
    vocab: ["Piece of cake", "Break a leg", "Hang out", "Chill", "Rip off", "My bad", "No worries", "Ghosting", "Hit the road", "Spill the beans", "In a nutshell", "Once in a blue moon"],
    pool: [
        { type: "sel", q: "O que significa 'Break a leg'?", opts: ["Boa sorte", "Quebre uma perna", "Pare já", "Vá embora"], a: "Boa sorte" },
        { type: "sel", q: "O que significa 'Piece of cake'?", opts: ["Pedaço de bolo", "Muito fácil", "Muito caro", "Muito difícil"], a: "Muito fácil" },
        { type: "sel", q: "O que significa 'My bad'?", opts: ["Meu quarto", "Foi mal", "Minha vez", "Meu pai"], a: "Foi mal" },
        { type: "sel", q: "O que significa 'No worries'?", opts: ["Sem problemas", "Sem dormir", "Sem comida", "Sem saída"], a: "Sem problemas" },
        { type: "sel", q: "O que significa 'Hang out'?", opts: ["Sair com amigos", "Cair", "Cortar", "Acordar"], a: "Sair com amigos" },
        { type: "sel", q: "O que significa 'Rip off'?", opts: ["Roubo caro", "Presente", "Desconto", "Promoção"], a: "Roubo caro" },
        { type: "sel", q: "O que significa 'Hit the road'?", opts: ["Ir embora", "Bater na estrada", "Dormir", "Esperar"], a: "Ir embora" },
        { type: "sel", q: "O que significa 'Spill the beans'?", opts: ["Derramar feijões", "Contar o segredo", "Cozinhar", "Comprar feijão"], a: "Contar o segredo" },
        { type: "sel", q: "O que significa 'In a nutshell'?", opts: ["Em resumo", "Na casca da noz", "Sem dúvida", "No chão"], a: "Em resumo" },
        { type: "sel", q: "O que significa 'Once in a blue moon'?", opts: ["Sempre", "De vez em nunca", "Toda semana", "Todo dia"], a: "De vez em nunca" },
        { type: "sel", q: "Qual frase está natural?", opts: ["Let's hang out later", "Let's hang down later", "Let's hang in later", "Let's hang from later"], a: "Let's hang out later" },
        { type: "sel", q: "Qual frase está natural?", opts: ["That test was a piece of cake", "That test was a cake piece", "That test was cake of piece", "That test was a piece cake"], a: "That test was a piece of cake" },

        { type: "match", pairs: { "Muito fácil": "Piece of cake", "Boa sorte": "Break a leg", "Sair com amigos": "Hang out", "Foi mal": "My bad" } },
        { type: "match", pairs: { "Sem problemas": "No worries", "Roubo caro": "Rip off", "Sumir sem explicar": "Ghosting", "Ir embora": "Hit the road" } },
        { type: "match", pairs: { "Contar o segredo": "Spill the beans", "Em resumo": "In a nutshell", "De vez em nunca": "Once in a blue moon", "Relaxar": "Chill" } },

        { type: "assemble", q: "Foi mal, eu cheguei tarde", words: ["My", "bad", "I", "was", "late"], a: ["My bad, I was late"] },
        { type: "assemble", q: "Vamos sair mais tarde", words: ["Let's", "hang", "out", "later"], a: ["Let's hang out later"] },
        { type: "assemble", q: "Esse celular foi um roubo", words: ["That", "phone", "was", "a", "rip", "off"], a: ["That phone was a rip off", "That phone was a rip-off"] },
        { type: "assemble", q: "Em resumo, foi um bom dia", words: ["In", "a", "nutshell", "it", "was", "a", "good", "day"], a: ["In a nutshell it was a good day", "In a nutshell, it was a good day"] },
        { type: "assemble", q: "Não se preocupe", words: ["No", "worries"], a: ["No worries"] },
        { type: "assemble", q: "Eu conto o segredo depois", words: ["I", "will", "spill", "the", "beans", "later"], a: ["I will spill the beans later"] },

        { type: "write", target: "pt", q: "No worries, it is fine", a: ["Sem problemas, está tudo bem", "Não se preocupe, está tudo bem"] },
        { type: "write", target: "en", q: "Essa prova foi muito fácil", a: ["That test was a piece of cake"] },
        { type: "write", target: "pt", q: "They are ghosting me", a: ["Eles estão sumindo de mim", "Eles estão me ignorando"] },
        { type: "write", target: "en", q: "Vou embora agora", a: ["I'm going to hit the road now", "I am going to hit the road now"] },
        { type: "write", target: "pt", q: "She spilled the beans", a: ["Ela contou o segredo"] },
        { type: "write", target: "en", q: "Isso acontece de vez em nunca", a: ["That happens once in a blue moon"] },

        { type: "listen", target: "pt", q: "No worries, it is fine", a: ["Sem problemas, está tudo bem"] },
        { type: "listen", target: "pt", q: "Break a leg", a: ["Boa sorte"] },
        { type: "listen", target: "pt", q: "That was a rip off", a: ["Isso foi um roubo", "Isso foi caro demais"] }
    ]
},
38: {
    title: "Mixed Conditionals + Wish/Regret",
    icon: "git-branch",
    desc: "Condicionais mistos, terceiro condicional e expressões de desejo.",
    tip: "Use 'wish' para desejar algo diferente da realidade. Mixed conditionals juntam tempos diferentes.",
    vocab: ["Had been", "Would have", "Could have", "Should have", "Might have", "Wish", "If only", "Regret", "Would be", "Would have been", "Had known", "Had done"],
    pool: [
        { type: "sel", q: "If I had known, I _____ come.", opts: ["would have", "will have", "would had", "have"], a: "would have" },
        { type: "sel", q: "Qual frase é Third Conditional?", opts: ["If I had studied, I would have passed", "If I study, I will pass", "If I studied, I would pass", "If I am studying, I pass"], a: "If I had studied, I would have passed" },
        { type: "sel", q: "Qual frase expressa arrependimento?", opts: ["I wish I had studied more", "I wish I study more", "I wish I am studying more", "I wish I will study more"], a: "I wish I had studied more" },
        { type: "sel", q: "Qual frase está correta?", opts: ["If I were rich, I would travel", "If I was rich, I will travel", "If I am rich, I would travel", "If I would be rich, I travel"], a: "If I were rich, I would travel" },
        { type: "sel", q: "Qual frase é um mixed conditional?", opts: ["If I had studied, I would be happy now", "If I study, I will be happy", "If I studied, I would have passed", "If I had studied, I passed"], a: "If I had studied, I would be happy now" },
        { type: "sel", q: "Qual palavra expressa 'quem dera' ou desejo forte?", opts: ["If only", "Unless", "Since", "Although"], a: "If only" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I wish I could speak Spanish", "I wish I can speak Spanish", "I wish I am speak Spanish", "I wish I will speak Spanish"], a: "I wish I could speak Spanish" },
        { type: "sel", q: "Qual frase está correta?", opts: ["She should have called me", "She should called me", "She should has called me", "She should have call me"], a: "She should have called me" },
        { type: "sel", q: "Qual frase expressa arrependimento sobre o passado?", opts: ["I regret not telling the truth", "I regret tell the truth", "I regret to told the truth", "I regret telling the truth tomorrow"], a: "I regret not telling the truth" },
        { type: "sel", q: "Qual forma é mais natural?", opts: ["If only I had more time", "If only I have more time", "If only I will have more time", "If only I am have more time"], a: "If only I had more time" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I could have helped you", "I could helped you", "I could to help you", "I could have help you"], a: "I could have helped you" },
        { type: "sel", q: "Qual frase está correta?", opts: ["He might have forgotten", "He might forgot", "He might forgetting", "He might has forgot"], a: "He might have forgotten" },

        { type: "match", pairs: { "Teria": "Would have", "Poderia ter": "Could have", "Deveria ter": "Should have", "Desejo/Quem dera": "Wish" } },
        { type: "match", pairs: { "Se eu tivesse sabido": "If I had known", "Se eu fosse": "If I were", "Arrependimento": "Regret", "Quem dera": "If only" } },
        { type: "match", pairs: { "Teria sido": "Would have been", "Poderia ser": "Could be", "Teria ficado": "Would have stayed", "Se tivesse feito": "If I had done" } },

        { type: "assemble", q: "Eu deveria ter estudado mais", words: ["I", "should", "have", "studied", "more"], a: ["I should have studied more"] },
        { type: "assemble", q: "Eu gostaria de ter estado lá", words: ["I", "wish", "I", "had", "been", "there"], a: ["I wish I had been there"] },
        { type: "assemble", q: "Se eu tivesse visto você", words: ["If", "I", "had", "seen", "you"], a: ["If I had seen you"] },
        { type: "assemble", q: "Se eu tivesse estudado, eu teria passado", words: ["If", "I", "had", "studied", "I", "would", "have", "passed"], a: ["If I had studied, I would have passed"] },
        { type: "assemble", q: "Quem dera eu tivesse mais tempo", words: ["If", "only", "I", "had", "more", "time"], a: ["If only I had more time"] },
        { type: "assemble", q: "Ela poderia ter vencido", words: ["She", "could", "have", "won"], a: ["She could have won"] },

        { type: "write", target: "pt", q: "I wish I had known", a: ["Eu gostaria de ter sabido", "Quem dera eu soubesse"] },
        { type: "write", target: "en", q: "Se eu fosse você, eu esperaria", a: ["If I were you, I would wait"] },
        { type: "write", target: "pt", q: "He should have called me", a: ["Ele deveria ter me ligado"] },
        { type: "write", target: "en", q: "Eu me arrependo de não ter ido", a: ["I regret not going", "I regret not having gone"] },
        { type: "write", target: "pt", q: "I could have helped you", a: ["Eu poderia ter te ajudado"] },
        { type: "write", target: "en", q: "Se eu tivesse dinheiro, eu viajaria", a: ["If I had money, I would travel"] },

        { type: "listen", target: "en", q: "I wish I had more time", a: ["I wish I had more time"] },
        { type: "listen", target: "pt", q: "If I had studied, I would have passed", a: ["Se eu tivesse estudado, eu teria passado"] },
        { type: "listen", target: "pt", q: "She could have won", a: ["Ela poderia ter vencido"] }
    ]
},
39: {
    title: "Discurso Indireto Avançado",
    icon: "messages-square",
    desc: "Discurso indireto e perguntas indiretas.",
    tip: "Em perguntas indiretas, a ordem volta ao normal: 'He asked where I lived'.",
    vocab: ["Said", "Told", "Asked", "Wanted to know", "Wondered", "Whether", "If", "Reported", "Promise", "Mentioned", "Explained", "Admitted"],
    pool: [
        { type: "sel", q: "He said that he _____ tired.", opts: ["is", "was", "be", "am"], a: "was" },
        { type: "sel", q: "She told me she _____ busy.", opts: ["is", "was", "were", "be"], a: "was" },
        { type: "sel", q: "Qual verbo é comum no discurso indireto?", opts: ["Said", "Run", "Eat", "Sleep"], a: "Said" },
        { type: "sel", q: "Qual frase está correta?", opts: ["He said he was happy", "He says he is happy yesterday", "He told he happy", "He said him was happy"], a: "He said he was happy" },
        { type: "sel", q: "Qual palavra é usada para perguntas indiretas?", opts: ["If", "By", "At", "For"], a: "If" },
        { type: "sel", q: "Qual frase está correta?", opts: ["She asked if I wanted water", "She asked did I want water", "She ask if I wanted water", "She asked if do I want water"], a: "She asked if I wanted water" },
        { type: "sel", q: "Qual frase está correta?", opts: ["They said they were coming", "They said they are coming yesterday", "They tell they were coming", "They said them were coming"], a: "They said they were coming" },
        { type: "sel", q: "Qual é a forma correta de 'Where do you live?' em discurso indireto?", opts: ["He asked where I lived", "He asked where did I live", "He asked where I live", "He asked where I am living"], a: "He asked where I lived" },
        { type: "sel", q: "Qual frase está correta?", opts: ["She explained that she was late", "She explained that she is late yesterday", "She explained that she be late", "She explain she late"], a: "She explained that she was late" },
        { type: "sel", q: "Qual frase está correta?", opts: ["He asked me to wait", "He asked me wait", "He asked I wait", "He asked me waited"], a: "He asked me to wait" },
        { type: "sel", q: "Qual frase é uma pergunta indireta?", opts: ["I wonder if she is coming", "I wonder she is coming", "I wonder is she coming", "I wonder that she coming"], a: "I wonder if she is coming" },
        { type: "sel", q: "Qual frase está correta?", opts: ["He admitted that he had lied", "He admitted that he has lied yesterday", "He admitted he lying", "He admitted he lie"], a: "He admitted that he had lied" },

        { type: "match", pairs: { "Disse": "Said", "Contou": "Told", "Perguntou": "Asked", "Explicou": "Explained" } },
        { type: "match", pairs: { "Mencionou": "Mentioned", "Admitiu": "Admitted", "Prometeu": "Promised", "Quis saber": "Wanted to know" } },
        { type: "match", pairs: { "Se": "If", "Se/Seja que": "Whether", "Perguntou onde": "Asked where", "Perguntou quando": "Asked when" } },

        { type: "assemble", q: "Ela me disse que estava ocupada", words: ["She", "told", "me", "she", "was", "busy"], a: ["She told me she was busy", "She told me that she was busy"] },
        { type: "assemble", q: "Ele perguntou se eu queria água", words: ["He", "asked", "if", "I", "wanted", "water"], a: ["He asked if I wanted water"] },
        { type: "assemble", q: "Eles disseram que estavam vindo", words: ["They", "said", "they", "were", "coming"], a: ["They said they were coming"] },
        { type: "assemble", q: "Ele me disse para não ir", words: ["He", "told", "me", "not", "to", "go"], a: ["He told me not to go"] },
        { type: "assemble", q: "Ela perguntou onde eu morava", words: ["She", "asked", "where", "I", "lived"], a: ["She asked where I lived"] },
        { type: "assemble", q: "Eu me perguntei se ele viria", words: ["I", "wondered", "if", "he", "would", "come"], a: ["I wondered if he would come"] },

        { type: "write", target: "pt", q: "He said he was tired", a: ["Ele disse que estava cansado"] },
        { type: "write", target: "pt", q: "She asked if I was ready", a: ["Ela perguntou se eu estava pronto", "Ela perguntou se eu estava pronta"] },
        { type: "write", target: "en", q: "Ela disse que estava feliz", a: ["She said she was happy"] },
        { type: "write", target: "pt", q: "He told me to wait", a: ["Ele me disse para esperar"] },
        { type: "write", target: "en", q: "Eles anunciaram a notícia", a: ["They announced the news"] },
        { type: "write", target: "pt", q: "I promised to call", a: ["Eu prometi ligar"] },
        { type: "write", target: "en", q: "Ele perguntou quando eu chegaria", a: ["He asked when I would arrive"] },
        { type: "write", target: "pt", q: "I wonder if she knows", a: ["Eu me pergunto se ela sabe"] },

        { type: "listen", target: "en", q: "They said they were coming", a: ["They said they were coming"] },
        { type: "listen", target: "pt", q: "He told me not to go", a: ["Ele me disse para não ir"] },
        { type: "listen", target: "pt", q: "She said she was busy", a: ["Ela disse que estava ocupada"] }
    ]
},
40: {
    title: "Voz Passiva Avançada",
    icon: "repeat",
    desc: "Passive voice em mais tempos e causative structures.",
    tip: "No causative, alguém organiza o serviço: 'I had my hair cut' = Eu mandei cortar meu cabelo.",
    vocab: ["Is made", "Was built", "Were found", "By", "Been", "Being", "Have something done", "Get something done", "Had", "Have", "Will be", "Causative"],
    pool: [
        { type: "sel", q: "The book _____ written by Shakespeare.", opts: ["was", "is", "were", "did"], a: "was" },
        { type: "sel", q: "The house _____ built in 1990.", opts: ["was", "is", "were", "be"], a: "was" },
        { type: "sel", q: "Many mistakes _____ found in the text.", opts: ["were", "was", "is", "did"], a: "were" },
        { type: "sel", q: "Qual frase está em voz passiva?", opts: ["The cake was eaten", "He ate the cake", "They eat cake", "I am eating cake"], a: "The cake was eaten" },
        { type: "sel", q: "Quem fez a ação aparece normalmente depois de:", opts: ["With", "By", "At", "For"], a: "By" },
        { type: "sel", q: "Qual é a forma passiva de 'People speak English here'?", opts: ["English is spoken here", "English speaks here", "English was spoke here", "English is speak here"], a: "English is spoken here" },
        { type: "sel", q: "Qual frase está correta?", opts: ["The phone was invented by Bell", "The phone invented by Bell was", "The phone was invent by Bell", "The phone is inventing by Bell"], a: "The phone was invented by Bell" },
        { type: "sel", q: "Qual frase está correta?", opts: ["These cars are made in Japan", "These cars is made in Japan", "These cars made are in Japan", "These cars are make in Japan"], a: "These cars are made in Japan" },
        { type: "sel", q: "Qual frase está correta?", opts: ["The letter has been sent", "The letter have been sent", "The letter is sented", "The letter was send"], a: "The letter has been sent" },
        { type: "sel", q: "Qual frase está correta?", opts: ["The room is being cleaned", "The room is cleaning", "The room was clean", "The room are being cleaned"], a: "The room is being cleaned" },
        { type: "sel", q: "Qual frase usa causative corretamente?", opts: ["I had my hair cut", "I had cut my hair", "I have my hair cutting", "I made my hair cut by"], a: "I had my hair cut" },
        { type: "sel", q: "Qual frase usa causative corretamente?", opts: ["She got her car washed", "She got washed her car", "She had wash her car", "She gets her car wash"], a: "She got her car washed" },

        { type: "match", pairs: { "Foi construído": "Was built", "É feito": "Is made", "Foram encontrados": "Were found", "Escrito": "Written" } },
        { type: "match", pairs: { "Inventado": "Invented", "Produzido": "Produced", "Enviado": "Sent", "Abrido": "Opened" } },
        { type: "match", pairs: { "Fechado": "Closed", "Limpo": "Cleaned", "Descoberto": "Discovered", "Por": "By" } },
        { type: "match", pairs: { "Mandar cortar": "Have something done", "Mandar lavar": "Get something done", "Tinha sido feito": "Had been done", "Estava sendo feito": "Was being done" } },

        { type: "assemble", q: "O telefone foi inventado por Bell", words: ["The", "telephone", "was", "invented", "by", "Bell"], a: ["The telephone was invented by Bell"] },
        { type: "assemble", q: "Esses carros são feitos no Japão", words: ["These", "cars", "are", "made", "in", "Japan"], a: ["These cars are made in Japan"] },
        { type: "assemble", q: "O livro foi escrito por ela", words: ["The", "book", "was", "written", "by", "her"], a: ["The book was written by her"] },
        { type: "assemble", q: "A janela foi quebrada", words: ["The", "window", "was", "broken"], a: ["The window was broken"] },
        { type: "assemble", q: "As chaves foram encontradas", words: ["The", "keys", "were", "found"], a: ["The keys were found"] },
        { type: "assemble", q: "Meu cabelo foi cortado", words: ["I", "had", "my", "hair", "cut"], a: ["I had my hair cut"] },
        { type: "assemble", q: "Meu carro foi lavado", words: ["I", "got", "my", "car", "washed"], a: ["I got my car washed"] },

        { type: "write", target: "pt", q: "English is spoken here", a: ["Inglês é falado aqui", "Fala-se inglês aqui"] },
        { type: "write", target: "pt", q: "The cake was eaten", a: ["O bolo foi comido"] },
        { type: "write", target: "en", q: "O carro foi lavado por ele", a: ["The car was washed by him"] },
        { type: "write", target: "en", q: "O prédio foi construído em 2001", a: ["The building was built in 2001"] },
        { type: "write", target: "pt", q: "The song is sung by many people", a: ["A música é cantada por muitas pessoas"] },
        { type: "write", target: "en", q: "As cartas foram enviadas ontem", a: ["The letters were sent yesterday"] },
        { type: "write", target: "pt", q: "I had my teeth cleaned", a: ["Eu mandei limpar meus dentes"] },
        { type: "write", target: "en", q: "They are having the house painted", a: ["Eles estão mandando pintar a casa"] },

        { type: "listen", target: "en", q: "The cake was eaten", a: ["The cake was eaten"] },
        { type: "listen", target: "pt", q: "The telephone was invented by Bell", a: ["O telefone foi inventado por Bell"] },
        { type: "listen", target: "pt", q: "These cars are made in Japan", a: ["Esses carros são feitos no Japão"] }
    ]
},
41: {
    title: "Inglês no Trabalho",
    icon: "briefcase",
    desc: "Reuniões, negociações, e-mails e comunicação profissional.",
    tip: "Em contexto profissional, clareza e formalidade valem mais do que frases complicadas.",
    vocab: ["Meeting", "Agenda", "Deadline", "Budget", "Negotiation", "Client", "Report", "Contract", "Follow up", "Proposal", "Invoice", "Conference"],
    pool: [
        { type: "sel", q: "O que significa 'Deadline'?", opts: ["Reunião", "Prazo final", "Orçamento", "Relatório"], a: "Prazo final" },
        { type: "sel", q: "O que significa 'Agenda'?", opts: ["Pauta da reunião", "Cliente", "Contrato", "Pagamento"], a: "Pauta da reunião" },
        { type: "sel", q: "O que significa 'Follow up'?", opts: ["Acompanhar/retomar contato", "Cancelar", "Assinar", "Esconder"], a: "Acompanhar/retomar contato" },
        { type: "sel", q: "O que significa 'Proposal'?", opts: ["Proposta", "Despesa", "Meta", "Equipe"], a: "Proposta" },
        { type: "sel", q: "Qual frase é mais profissional em e-mail?", opts: ["I hope you are doing well", "Yo, what's up?", "Hey bro", "Sup"], a: "I hope you are doing well" },
        { type: "sel", q: "Qual frase está correta?", opts: ["Please find attached the report", "Please attached find the report", "Please find the report attached by", "Please report attached find"], a: "Please find attached the report" },
        { type: "sel", q: "Qual frase está correta?", opts: ["We need to discuss the budget", "We need discuss the budget", "We need to discussing the budget", "We need budget discuss"], a: "We need to discuss the budget" },
        { type: "sel", q: "Qual palavra significa 'fatura'?", opts: ["Invoice", "Advice", "Event", "Offer"], a: "Invoice" },
        { type: "sel", q: "Qual palavra significa 'cliente'?", opts: ["Client", "Clerk", "Class", "Call"], a: "Client" },
        { type: "sel", q: "Qual frase está correta?", opts: ["Let's schedule a meeting", "Let's scheduling a meeting", "Let's schedule meeting a", "Let's meeting schedule"], a: "Let's schedule a meeting" },
        { type: "sel", q: "Qual frase está correta?", opts: ["Could you send me the proposal?", "Can you to send me the proposal?", "Could you sending me the proposal?", "Could you send I the proposal?"], a: "Could you send me the proposal?" },
        { type: "sel", q: "Qual frase está correta?", opts: ["The contract needs to be reviewed", "The contract needs reviewed to", "The contract need to review", "Contract the needs review"], a: "The contract needs to be reviewed" },

        { type: "match", pairs: { "Reunião": "Meeting", "Pauta": "Agenda", "Prazo final": "Deadline", "Orçamento": "Budget" } },
        { type: "match", pairs: { "Negociação": "Negotiation", "Cliente": "Client", "Relatório": "Report", "Contrato": "Contract" } },
        { type: "match", pairs: { "Proposta": "Proposal", "Fatura": "Invoice", "Acompanhamento": "Follow up", "Conferência": "Conference" } },

        { type: "assemble", q: "Nós temos uma reunião hoje", words: ["We", "have", "a", "meeting", "today"], a: ["We have a meeting today"] },
        { type: "assemble", q: "O prazo é amanhã", words: ["The", "deadline", "is", "tomorrow"], a: ["The deadline is tomorrow"] },
        { type: "assemble", q: "Precisamos de uma nova estratégia", words: ["We", "need", "a", "new", "strategy"], a: ["We need a new strategy"] },
        { type: "assemble", q: "O relatório está pronto", words: ["The", "report", "is", "ready"], a: ["The report is ready"] },
        { type: "assemble", q: "O cliente aprovou o contrato", words: ["The", "client", "approved", "the", "contract"], a: ["The client approved the contract"] },
        { type: "assemble", q: "Envie a proposta, por favor", words: ["Please", "send", "the", "proposal"], a: ["Please send the proposal"] },
        { type: "assemble", q: "Precisamos revisar o orçamento", words: ["We", "need", "to", "review", "the", "budget"], a: ["We need to review the budget"] },

        { type: "write", target: "en", q: "O prazo é amanhã", a: ["The deadline is tomorrow"] },
        { type: "write", target: "pt", q: "Our profit increased this year", a: ["Nosso lucro aumentou este ano"] },
        { type: "write", target: "en", q: "Precisamos terminar o relatório", a: ["We need to finish the report"] },
        { type: "write", target: "pt", q: "We need a new strategy", a: ["Precisamos de uma nova estratégia"] },
        { type: "write", target: "en", q: "A reunião foi cancelada", a: ["The meeting was canceled", "The meeting was cancelled"] },
        { type: "write", target: "pt", q: "The client signed the contract", a: ["O cliente assinou o contrato"] },
        { type: "write", target: "en", q: "Por favor, veja o anexo", a: ["Please see the attachment"] },
        { type: "write", target: "pt", q: "Could you send me the proposal?", a: ["Você poderia me enviar a proposta?"] },

        { type: "listen", target: "pt", q: "Our profit increased this year", a: ["Nosso lucro aumentou este ano"] },
        { type: "listen", target: "en", q: "The deadline is tomorrow", a: ["The deadline is tomorrow"] },
        { type: "listen", target: "pt", q: "We have a meeting today", a: ["Nós temos uma reunião hoje"] }
    ]
},
42: {
    title: "Review & Fluency Boost",
    icon: "sparkles",
    desc: "Mistura final da Expert para ganhar velocidade e naturalidade.",
    tip: "Aqui o foco é reconhecer rápido, responder sem travar e misturar estruturas diferentes com confiança.",
    vocab: ["Review", "Fluency", "Natural", "Response", "Context", "Explain", "Summarize", "Choose", "Mixed", "Quickly", "Confidently", "Accurately"],
    pool: [
        { type: "sel", q: "Qual é a melhor tradução de 'I can't put up with this'?", opts: ["Eu não posso pôr isso acima", "Eu não suporto isso", "Eu não quero isso", "Eu não entendo isso"], a: "Eu não suporto isso" },
        { type: "sel", q: "Qual opção está mais natural?", opts: ["I am looking forward to it", "I look for forward it", "I forward looking to it", "I am forward to look it"], a: "I am looking forward to it" },
        { type: "sel", q: "Qual frase é correta?", opts: ["If I had studied, I would have passed", "If I studied, I would have passed", "If I had study, I would pass", "If I have studied, I would passed"], a: "If I had studied, I would have passed" },
        { type: "sel", q: "Qual frase é correta?", opts: ["The book was written by her", "The book wrote by her", "The book is write by her", "The book was write by her"], a: "The book was written by her" },
        { type: "sel", q: "Qual frase é melhor para e-mail profissional?", opts: ["Could you please review the attachment?", "Check this asap bro", "Yo, see file", "Look at this now"], a: "Could you please review the attachment?" },
        { type: "sel", q: "Qual expressão significa 'em resumo'?", opts: ["In a nutshell", "On a shell", "In a bottle", "At a summary"], a: "In a nutshell" },
        { type: "sel", q: "Qual frase está correta?", opts: ["She asked where I lived", "She asked where did I live", "She asked where I live yesterday", "She asked where I am live"], a: "She asked where I lived" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I had my hair cut", "I cut my hair had", "I have cut my hair by", "I had cutted my hair"], a: "I had my hair cut" },
        { type: "sel", q: "Qual frase está correta?", opts: ["He ran out of milk", "He ran of out milk", "He out of ran milk", "He run out milk"], a: "He ran out of milk" },
        { type: "sel", q: "Qual frase soa mais natural?", opts: ["No worries", "No worrys", "No worry", "Not worries"], a: "No worries" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I wish I had more time", "I wish I have more time", "I wish I will have more time", "I wish I am having more time"], a: "I wish I had more time" },
        { type: "sel", q: "Qual frase está correta?", opts: ["The cake was being prepared", "The cake being was prepared", "The cake was preparing", "The cake prepared was"], a: "The cake was being prepared" },

        { type: "match", pairs: { "Revisão": "Review", "Fluência": "Fluency", "Natural": "Natural", "Resumir": "Summarize" } },
        { type: "match", pairs: { "Explicar": "Explain", "Escolher": "Choose", "Rapidamente": "Quickly", "Confiante": "Confidently" } },
        { type: "match", pairs: { "Contexto": "Context", "Misturado": "Mixed", "Resposta": "Response", "Preciso": "Accurately" } },

        { type: "assemble", q: "Eu alcancei a fluência", words: ["I", "have", "achieved", "fluency"], a: ["I have achieved fluency"] },
        { type: "assemble", q: "Estou orgulhoso de mim mesmo", words: ["I", "am", "proud", "of", "myself"], a: ["I am proud of myself", "I'm proud of myself"] },
        { type: "assemble", q: "O plano deu certo", words: ["The", "plan", "turned", "out", "well"], a: ["The plan turned out well"] },
        { type: "assemble", q: "Se eu tivesse mais tempo, eu estudaria mais", words: ["If", "I", "had", "more", "time", "I", "would", "study", "more"], a: ["If I had more time, I would study more"] },
        { type: "assemble", q: "Você poderia me ajudar com isso?", words: ["Could", "you", "help", "me", "with", "this"], a: ["Could you help me with this?"] },
        { type: "assemble", q: "Ela disse que estava ocupada", words: ["She", "said", "she", "was", "busy"], a: ["She said she was busy"] },
        { type: "assemble", q: "O relatório foi enviado ontem", words: ["The", "report", "was", "sent", "yesterday"], a: ["The report was sent yesterday"] },

        { type: "write", target: "pt", q: "He is highly articulate", a: ["Ele se expressa muito bem", "Ele é altamente articulado"] },
        { type: "write", target: "en", q: "O cliente pediu uma nova proposta", a: ["The client asked for a new proposal"] },
        { type: "write", target: "pt", q: "They said they were coming", a: ["Eles disseram que estavam vindo"] },
        { type: "write", target: "en", q: "Eu gostaria de ter mais tempo", a: ["I wish I had more time"] },
        { type: "write", target: "pt", q: "We need to figure it out", a: ["Nós precisamos descobrir isso"] },
        { type: "write", target: "en", q: "Meu carro quebrou no caminho", a: ["My car broke down on the way"] },

        { type: "listen", target: "pt", q: "The plan turned out well", a: ["O plano deu certo", "O plano acabou dando certo"] },
        { type: "listen", target: "en", q: "I have achieved fluency", a: ["I have achieved fluency"] },
        { type: "listen", target: "pt", q: "Could you please review the attachment?", a: ["Você poderia revisar o anexo, por favor?"] }
    ]
  },
          43: {
    title: "Conectores Explosivos",
    icon: "shuffle",
    desc: "Conectores avançados e marcadores de discurso.",
    tip: "Conectores ajudam a ligar ideias com clareza: however, therefore, moreover, although.",
    vocab: ["However", "Therefore", "Moreover", "Although", "Nevertheless", "Furthermore", "In addition", "As a result", "In fact", "On the other hand"],
    pool: [
        { type: "sel", q: "Qual conector mostra contraste?", opts: ["However", "Therefore", "Moreover", "Because"], a: "However" },
        { type: "sel", q: "Qual conector mostra consequência?", opts: ["Although", "Nevertheless", "As a result", "In addition"], a: "As a result" },
        { type: "sel", q: "Qual opção é mais próxima de 'além disso'?", opts: ["Moreover", "However", "Unless", "Despite"], a: "Moreover" },
        { type: "sel", q: "Qual opção é mais próxima de 'portanto'?", opts: ["Therefore", "Although", "Meanwhile", "Unless"], a: "Therefore" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I was tired; however, I continued", "I was tired however I continued", "However I was tired I continued", "I was tired although, I continued"], a: "I was tired; however, I continued" },
        { type: "sel", q: "Qual conector combina com 'apesar de'?", opts: ["Although", "Therefore", "Furthermore", "In fact"], a: "Although" },
        { type: "sel", q: "Qual conector combina com 'na verdade'?", opts: ["In fact", "Unless", "Therefore", "Although"], a: "In fact" },
        { type: "sel", q: "Qual conector combina com 'por outro lado'?", opts: ["On the other hand", "In addition", "As a result", "Because"], a: "On the other hand" },
        { type: "sel", q: "Qual frase está mais natural?", opts: ["I studied a lot; therefore, I passed", "I studied a lot therefore I passed", "Therefore I studied a lot I passed", "I therefore studied a lot passed"], a: "I studied a lot; therefore, I passed" },
        { type: "sel", q: "Qual palavra é um marcador de discurso?", opts: ["Anyway", "Kitchen", "Orange", "Window"], a: "Anyway" },
        { type: "sel", q: "Qual frase está correta?", opts: ["Moreover, the results were surprising", "Moreover the results were surprising", "The moreover results were surprising", "Results moreover were surprising"], a: "Moreover, the results were surprising" },

        { type: "match", pairs: { "No entanto": "However", "Portanto": "Therefore", "Além disso": "Moreover", "Apesar de": "Although" } },
        { type: "match", pairs: { "Por outro lado": "On the other hand", "Como resultado": "As a result", "Na verdade": "In fact", "Além do mais": "Furthermore" } },
        { type: "match", pairs: { "Ainda assim": "Nevertheless", "Em adição": "In addition", "A propósito": "By the way", "De qualquer forma": "Anyway" } },

        { type: "assemble", q: "Eu estava cansado, no entanto continuei", words: ["I", "was", "tired", "however", "I", "continued"], a: ["I was tired; however, I continued"] },
        { type: "assemble", q: "Eu estudei bastante, portanto passei", words: ["I", "studied", "a", "lot", "therefore", "I", "passed"], a: ["I studied a lot; therefore, I passed"] },
        { type: "assemble", q: "Apesar de estar chovendo, nós fomos", words: ["Although", "it", "was", "raining", "we", "went"], a: ["Although it was raining, we went"] },
        { type: "assemble", q: "Além disso, ele ajudou muito", words: ["Moreover", "he", "helped", "a", "lot"], a: ["Moreover, he helped a lot"] },
        { type: "assemble", q: "Na verdade, ela já sabia", words: ["In", "fact", "she", "already", "knew"], a: ["In fact, she already knew"] },

        { type: "write", target: "en", q: "No entanto, eu discordo", a: ["However, I disagree"] },
        { type: "write", target: "en", q: "Portanto, precisamos esperar", a: ["Therefore, we need to wait"] },
        { type: "write", target: "pt", q: "On the other hand, this is better", a: ["Por outro lado, isso é melhor"] },
        { type: "write", target: "pt", q: "As a result, the plan failed", a: ["Como resultado, o plano falhou"] },
        { type: "write", target: "en", q: "Além disso, isso é importante", a: ["Moreover, this is important"] },

        { type: "listen", target: "pt", q: "However, I need more time", a: ["No entanto, eu preciso de mais tempo"] },
        { type: "listen", target: "pt", q: "As a result, we won", a: ["Como resultado, nós vencemos"] },
        { type: "listen", target: "pt", q: "In fact, she was right", a: ["Na verdade, ela estava certa"] }
    ]
},
44: {
    title: "Ênfase Ninja",
    icon: "focus",
    desc: "Inversão e frases com ênfase.",
    tip: "A inversão dá força e estilo: 'Never have I seen...' soa mais formal e dramático.",
    vocab: ["Never", "Rarely", "Seldom", "Only then", "Not only", "Little did I know", "No sooner", "Hardly", "Scarcely", "So do I", "Neither do I"],
    pool: [
        { type: "sel", q: "Qual frase usa inversão corretamente?", opts: ["Never have I seen such a thing", "Never I have seen such a thing", "I have never seen such a thing", "Seen never I have such a thing"], a: "Never have I seen such a thing" },
        { type: "sel", q: "Qual frase está correta?", opts: ["No sooner had I arrived than it started raining", "No sooner I arrived than it started raining", "No sooner had I arrive than it started raining", "No sooner arrived had I than it started raining"], a: "No sooner had I arrived than it started raining" },
        { type: "sel", q: "Qual frase está correta?", opts: ["Hardly had we left when the phone rang", "Hardly we had left when the phone rang", "Hardly had left we when the phone rang", "Hardly had we leave when the phone rang"], a: "Hardly had we left when the phone rang" },
        { type: "sel", q: "Qual expressão indica ênfase em uma limitação?", opts: ["Only then", "At once", "All day", "By far"], a: "Only then" },
        { type: "sel", q: "Qual frase é mais natural?", opts: ["Not only did he call, but he also apologized", "Not only he called, but also apologized", "Not only did he called, but he apologized", "Not only call he but apologized"], a: "Not only did he call, but he also apologized" },
        { type: "sel", q: "Qual resposta é correta para 'I like coffee'?", opts: ["So do I", "So I do", "Neither do I", "I do so"], a: "So do I" },
        { type: "sel", q: "Qual resposta é correta para 'I don't like coffee'?", opts: ["So do I", "Neither do I", "So I don't", "Neither I do"], a: "Neither do I" },
        { type: "sel", q: "Qual frase está correta?", opts: ["Little did I know that he was lying", "Little I knew did that he was lying", "Little did know I that he was lying", "Little I did know that he was lying"], a: "Little did I know that he was lying" },
        { type: "sel", q: "Qual estrutura coloca o foco no objeto?", opts: ["It was my brother who called", "My brother it was who called", "Who called was my brother", "It called was my brother"], a: "It was my brother who called" },
        { type: "sel", q: "Qual frase está correta?", opts: ["Seldom do I see him", "Seldom I see him do", "Seldom see I him", "Seldom does I see him"], a: "Seldom do I see him" },
        { type: "sel", q: "Qual frase está correta?", opts: ["Rarely have we had such a chance", "Rarely we have had such a chance", "Rarely had we have such a chance", "Rarely we had such a chance"], a: "Rarely have we had such a chance" },
        { type: "sel", q: "Qual frase está correta?", opts: ["Only after the meeting did I understand", "Only after the meeting I understood did", "Only after did the meeting I understand", "Only I after the meeting understood"], a: "Only after the meeting did I understand" },

        { type: "match", pairs: { "Nunca": "Never", "Raramente": "Rarely", "Mal": "Hardly", "Somente então": "Only then" } },
        { type: "match", pairs: { "Nem": "Neither", "Também": "So", "Não só": "Not only", "Mal sabia eu": "Little did I know" } },
        { type: "match", pairs: { "Assim também eu": "So do I", "Eu também não": "Neither do I", "Não muito tempo depois": "No sooner", "Mal": "Scarcely" } },

        { type: "assemble", q: "Nunca vi algo assim", words: ["Never", "have", "I", "seen", "such", "a", "thing"], a: ["Never have I seen such a thing"] },
        { type: "assemble", q: "Mal chegamos e começou a chover", words: ["Hardly", "had", "we", "arrived", "when", "it", "started", "raining"], a: ["Hardly had we arrived when it started raining"] },
        { type: "assemble", q: "Não só ele ligou, como também pediu desculpas", words: ["Not", "only", "did", "he", "call", "but", "he", "also", "apologized"], a: ["Not only did he call, but he also apologized"] },
        { type: "assemble", q: "Só então entendi o problema", words: ["Only", "then", "did", "I", "understand", "the", "problem"], a: ["Only then did I understand the problem"] },
        { type: "assemble", q: "Assim também eu", words: ["So", "do", "I"], a: ["So do I"] },
        { type: "assemble", q: "Eu também não", words: ["Neither", "do", "I"], a: ["Neither do I"] },

        { type: "write", target: "en", q: "Foi meu irmão que ligou", a: ["It was my brother who called"] },
        { type: "write", target: "pt", q: "Never have I seen such a thing", a: ["Nunca vi algo assim"] },
        { type: "write", target: "en", q: "Somente depois da aula eu entendi", a: ["Only after class did I understand"] },
        { type: "write", target: "pt", q: "Rarely have we had such a chance", a: ["Raramente tivemos uma chance assim"] },
        { type: "write", target: "en", q: "Eu também gosto de música", a: ["So do I"] },

        { type: "listen", target: "pt", q: "Hardly had we started when he left", a: ["Mal tínhamos começado quando ele saiu"] },
        { type: "listen", target: "pt", q: "Not only did she sing, but she danced too", a: ["Não só ela cantou, como também dançou"] },
        { type: "listen", target: "pt", q: "Little did I know what would happen", a: ["Mal sabia eu o que aconteceria"] }
    ]
},
45: {
    title: "Gerúndio ou Infinitivo?",
    icon: "repeat-2",
    desc: "Gerunds, infinitives e subjuntivo avançado.",
    tip: "Alguns verbos pedem gerúndio, outros infinitivo. E o subjuntivo aparece muito em desejo, sugestão e formalidade.",
    vocab: ["Enjoy", "Avoid", "Decide", "Promise", "Manage", "Suggest", "Recommend", "Insist", "Allow", "Permit", "Be that", "Were"],
    pool: [
        { type: "sel", q: "Qual verbo geralmente pede gerúndio?", opts: ["Enjoy", "Decide", "Promise", "Learn"], a: "Enjoy" },
        { type: "sel", q: "Qual verbo geralmente pede infinitivo?", opts: ["Avoid", "Like", "Decide", "Keep"], a: "Decide" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I enjoy reading", "I enjoy read", "I enjoy to read", "I enjoy to reading"], a: "I enjoy reading" },
        { type: "sel", q: "Qual frase está correta?", opts: ["She decided to leave", "She decided leaving", "She decided leave", "She decided to leaving"], a: "She decided to leave" },
        { type: "sel", q: "Qual verbo costuma vir com gerúndio após ele?", opts: ["Avoid", "Plan", "Want", "Hope"], a: "Avoid" },
        { type: "sel", q: "Qual frase está correta?", opts: ["He avoided talking about it", "He avoided to talk about it", "He avoided talk about it", "He avoided talking about it to"], a: "He avoided talking about it" },
        { type: "sel", q: "Qual verbo costuma vir com infinitivo após ele?", opts: ["Want", "Enjoy", "Finish", "Risk"], a: "Want" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I want to learn English", "I want learning English", "I want learn English", "I want to learning English"], a: "I want to learn English" },
        { type: "sel", q: "Qual frase expressa um desejo formal?", opts: ["I suggest that he be on time", "I suggest that he is on time", "I suggest that he was on time", "I suggest that he being on time"], a: "I suggest that he be on time" },
        { type: "sel", q: "Qual frase está correta?", opts: ["It is important that she be informed", "It is important that she is informed", "It is important that she was informed", "It is important that she be informing"], a: "It is important that she be informed" },
        { type: "sel", q: "Qual verbo costuma aparecer com subjuntivo em inglês formal?", opts: ["Recommend", "Sleep", "Run", "Cook"], a: "Recommend" },
        { type: "sel", q: "Qual frase está correta?", opts: ["They recommended that he study more", "They recommended that he studies more", "They recommended that he studied more", "They recommended that he studying more"], a: "They recommended that he study more" },

        { type: "match", pairs: { "Gostar de": "Enjoy", "Evitar": "Avoid", "Decidir": "Decide", "Prometer": "Promise" } },
        { type: "match", pairs: { "Conseguir lidar": "Manage", "Sugerir": "Suggest", "Recomendar": "Recommend", "Insistir": "Insist" } },
        { type: "match", pairs: { "Permitir": "Allow", "Subjuntivo": "Be that", "Seria melhor": "Would rather", "Preferiria": "Prefer" } },

        { type: "assemble", q: "Eu gosto de ler livros", words: ["I", "enjoy", "reading", "books"], a: ["I enjoy reading books"] },
        { type: "assemble", q: "Ela decidiu viajar", words: ["She", "decided", "to", "travel"], a: ["She decided to travel"] },
        { type: "assemble", q: "Ele evitou falar sobre isso", words: ["He", "avoided", "talking", "about", "it"], a: ["He avoided talking about it"] },
        { type: "assemble", q: "É importante que ele esteja aqui", words: ["It", "is", "important", "that", "he", "be", "here"], a: ["It is important that he be here"] },
        { type: "assemble", q: "Eu sugiro que ela estude mais", words: ["I", "suggest", "that", "she", "study", "more"], a: ["I suggest that she study more"] },
        { type: "assemble", q: "Eles recomendaram que ele ficasse em casa", words: ["They", "recommended", "that", "he", "stay", "home"], a: ["They recommended that he stay home"] },

        { type: "write", target: "en", q: "Eu evito comer tarde", a: ["I avoid eating late"] },
        { type: "write", target: "pt", q: "I want to improve my English", a: ["Eu quero melhorar meu inglês"] },
        { type: "write", target: "en", q: "Ela insistiu em pagar", a: ["She insisted on paying"] },
        { type: "write", target: "pt", q: "It is important that he be ready", a: ["É importante que ele esteja pronto"] },
        { type: "write", target: "en", q: "Eles sugeriram que nós esperássemos", a: ["They suggested that we wait"] },

        { type: "listen", target: "pt", q: "I enjoy playing football", a: ["Eu gosto de jogar futebol"] },
        { type: "listen", target: "pt", q: "She decided to stay", a: ["Ela decidiu ficar"] },
        { type: "listen", target: "pt", q: "It is necessary that he be present", a: ["É necessário que ele esteja presente"] }
    ]
},
46: {
    title: "Modo Formal ou Solto?",
    icon: "languages",
    desc: "Registro formal, informal e hedging language.",
    tip: "Hedging suaviza a fala: maybe, probably, it seems, I believe, perhaps.",
    vocab: ["Perhaps", "Probably", "It seems", "Apparently", "I believe", "I suppose", "According to", "Could be", "Might be", "Definitely", "Basically"],
    pool: [
        { type: "sel", q: "Qual expressão suaviza a certeza?", opts: ["Definitely", "Probably", "Certainly", "Absolutely"], a: "Probably" },
        { type: "sel", q: "Qual opção é mais formal?", opts: ["I think", "I believe", "Kinda", "Sort of"], a: "I believe" },
        { type: "sel", q: "Qual opção é mais informal?", opts: ["I suppose", "Kinda", "Perhaps", "According to"], a: "Kinda" },
        { type: "sel", q: "Qual frase é mais adequada para e-mail formal?", opts: ["Could you please review this document?", "Yo, check this out", "This is crazy bro", "Look at this asap dude"], a: "Could you please review this document?" },
        { type: "sel", q: "Qual palavra mostra que você não tem certeza total?", opts: ["Apparently", "Definitely", "Absolutely", "Surely"], a: "Apparently" },
        { type: "sel", q: "Qual frase está correta?", opts: ["It seems that he is late", "It seems he late is", "It seems that he late", "Seem it that he is late"], a: "It seems that he is late" },
        { type: "sel", q: "Qual opção é hedging?", opts: ["Might be", "Must be", "Is", "Was"], a: "Might be" },
        { type: "sel", q: "Qual opção é mais direta e forte?", opts: ["Definitely", "Perhaps", "Maybe", "Possibly"], a: "Definitely" },
        { type: "sel", q: "Qual frase é mais natural em fala casual?", opts: ["I kinda agree", "I agree very much formally", "I agree in a highly manner", "I agree with complete formality"], a: "I kinda agree" },
        { type: "sel", q: "Qual frase está correta?", opts: ["According to the report, sales increased", "According the report, sales increased", "According report to, sales increased", "According sales to the report increased"], a: "According to the report, sales increased" },
        { type: "sel", q: "Qual expressão mostra conclusão resumida?", opts: ["Basically", "Consequently", "Nevertheless", "Furthermore"], a: "Basically" },
        { type: "sel", q: "Qual frase está mais formal?", opts: ["I believe the data is correct", "I guess the data is correct", "Kinda the data is correct", "Maybe the data is correct dude"], a: "I believe the data is correct" },

        { type: "match", pairs: { "Talvez": "Perhaps", "Provavelmente": "Probably", "Parece que": "It seems", "Aparentemente": "Apparently" } },
        { type: "match", pairs: { "Acho": "I believe", "Suponho": "I suppose", "De acordo com": "According to", "Basicamente": "Basically" } },
        { type: "match", pairs: { "Com certeza": "Definitely", "Poderia ser": "Could be", "Talvez seja": "Might be", "Mais ou menos": "Sort of" } },

        { type: "assemble", q: "Talvez ele esteja ocupado", words: ["Perhaps", "he", "is", "busy"], a: ["Perhaps he is busy"] },
        { type: "assemble", q: "Aparentemente, ela chegou cedo", words: ["Apparently", "she", "arrived", "early"], a: ["Apparently she arrived early"] },
        { type: "assemble", q: "Acho que isso é verdade", words: ["I", "believe", "that", "this", "is", "true"], a: ["I believe that this is true"] },
        { type: "assemble", q: "De acordo com o relatório, as vendas aumentaram", words: ["According", "to", "the", "report", "sales", "increased"], a: ["According to the report, sales increased"] },
        { type: "assemble", q: "Basicamente, o plano falhou", words: ["Basically", "the", "plan", "failed"], a: ["Basically the plan failed"] },

        { type: "write", target: "en", q: "Talvez ele venha amanhã", a: ["Perhaps he will come tomorrow"] },
        { type: "write", target: "pt", q: "I believe the data is correct", a: ["Eu acredito que os dados estão corretos"] },
        { type: "write", target: "en", q: "Aparentemente, ela mudou de ideia", a: ["Apparently, she changed her mind"] },
        { type: "write", target: "pt", q: "Could you please send me the file?", a: ["Você poderia me enviar o arquivo, por favor?"] },
        { type: "write", target: "en", q: "Basicamente, isso é o problema", a: ["Basically, this is the problem"] },

        { type: "listen", target: "pt", q: "It seems that he is late", a: ["Parece que ele está atrasado"] },
        { type: "listen", target: "en", q: "According to the report, sales increased", a: ["According to the report, sales increased"] },
        { type: "listen", target: "pt", q: "I kinda agree", a: ["Eu meio que concordo", "Eu mais ou menos concordo"] }
    ]
},
47: {
    title: "Mundo em Movimento",
    icon: "globe",
    desc: "Sociedade, meio ambiente, tecnologia e redes sociais.",
    tip: "Temas atuais pedem vocabulário claro: privacy, sustainability, misinformation, AI, addiction.",
    vocab: ["Privacy", "Sustainability", "Pollution", "Climate change", "AI", "Social media", "Misinformation", "Algorithm", "Addiction", "Bias", "Equality", "Community"],
    pool: [
        { type: "sel", q: "O que significa 'Privacy'?", opts: ["Privacidade", "Publicidade", "Pressa", "Privação"], a: "Privacidade" },
        { type: "sel", q: "O que significa 'Sustainability'?", opts: ["Sustentabilidade", "Segurança", "Velocidade", "Sociedade"], a: "Sustentabilidade" },
        { type: "sel", q: "O que significa 'Misinformation'?", opts: ["Informação falsa", "Muita informação", "Mensagem privada", "Notícia longa"], a: "Informação falsa" },
        { type: "sel", q: "O que significa 'Algorithm'?", opts: ["Algoritmo", "Aplicativo", "Arquivo", "Ata"], a: "Algoritmo" },
        { type: "sel", q: "O que significa 'Addiction'?", opts: ["Vício", "Atenção", "Acesso", "Aceitação"], a: "Vício" },
        { type: "sel", q: "Qual frase está correta?", opts: ["Social media affects young people", "Social media affect young people", "Social media is affect young people", "Social media affecting young people"], a: "Social media affects young people" },
        { type: "sel", q: "Qual tema fala sobre equilíbrio e cuidado ambiental?", opts: ["Sustainability", "Algorithm", "Addiction", "Bias"], a: "Sustainability" },
        { type: "sel", q: "Qual palavra significa 'poluição'?", opts: ["Pollution", "Promotion", "Population", "Progress"], a: "Pollution" },
        { type: "sel", q: "Qual palavra significa 'igualdade'?", opts: ["Equality", "Quality", "Reality", "Ability"], a: "Equality" },
        { type: "sel", q: "Qual palavra significa 'comunidade'?", opts: ["Community", "Company", "Country", "County"], a: "Community" },
        { type: "sel", q: "Qual frase está correta?", opts: ["Climate change is a global issue", "Climate change are a global issue", "Climate change be a global issue", "Climate change global issue is"], a: "Climate change is a global issue" },
        { type: "sel", q: "Qual palavra combina com IA?", opts: ["AI", "UI", "AR", "VR"], a: "AI" },

        { type: "match", pairs: { "Privacidade": "Privacy", "Sustentabilidade": "Sustainability", "Poluição": "Pollution", "Mudança climática": "Climate change" } },
        { type: "match", pairs: { "Redes sociais": "Social media", "Desinformação": "Misinformation", "Algoritmo": "Algorithm", "Vício": "Addiction" } },
        { type: "match", pairs: { "Preconceito": "Bias", "Igualdade": "Equality", "Comunidade": "Community", "Inteligência artificial": "AI" } },

        { type: "assemble", q: "As redes sociais afetam os jovens", words: ["Social", "media", "affects", "young", "people"], a: ["Social media affects young people"] },
        { type: "assemble", q: "A mudança climática é um problema global", words: ["Climate", "change", "is", "a", "global", "issue"], a: ["Climate change is a global issue"] },
        { type: "assemble", q: "Precisamos proteger a privacidade", words: ["We", "need", "to", "protect", "privacy"], a: ["We need to protect privacy"] },
        { type: "assemble", q: "A poluição está piorando", words: ["Pollution", "is", "getting", "worse"], a: ["Pollution is getting worse"] },
        { type: "assemble", q: "A IA pode ajudar", words: ["AI", "can", "help"], a: ["AI can help"] },
        { type: "assemble", q: "A comunidade precisa de união", words: ["The", "community", "needs", "unity"], a: ["The community needs unity"] },

        { type: "write", target: "pt", q: "Social media affects privacy", a: ["As redes sociais afetam a privacidade"] },
        { type: "write", target: "en", q: "Precisamos falar sobre sustentabilidade", a: ["We need to talk about sustainability"] },
        { type: "write", target: "pt", q: "Misinformation spreads fast", a: ["A desinformação se espalha rápido"] },
        { type: "write", target: "en", q: "A poluição é um grande problema", a: ["Pollution is a big problem"] },
        { type: "write", target: "pt", q: "AI is changing the world", a: ["A inteligência artificial está mudando o mundo"] },

        { type: "listen", target: "pt", q: "AI is changing the world", a: ["A inteligência artificial está mudando o mundo"] },
        { type: "listen", target: "en", q: "Climate change is a global issue", a: ["Climate change is a global issue"] },
        { type: "listen", target: "pt", q: "Misinformation spreads fast", a: ["A desinformação se espalha rápido"] }
    ]
},
48: {
    title: "Debate Sem Freio",
    icon: "message-square-more",
    desc: "Argumentação avançada para debates e textos de opinião.",
    tip: "Em debate, use estrutura clara: claim, reason, evidence, counterargument, conclusion.",
    vocab: ["Claim", "Reason", "Evidence", "Counterargument", "Conclusion", "Therefore", "Moreover", "Nevertheless", "On the contrary", "I strongly believe"],
    pool: [
        { type: "sel", q: "O que é um 'claim'?", opts: ["Uma afirmação/opinião", "Uma prova", "Um resumo", "Uma pergunta"], a: "Uma afirmação/opinião" },
        { type: "sel", q: "O que é 'evidence'?", opts: ["Evidência/prova", "Opinião", "Conclusão", "Exemplo de erro"], a: "Evidência/prova" },
        { type: "sel", q: "O que é 'counterargument'?", opts: ["Argumento contrário", "Resposta final", "Proposta", "Citação"], a: "Argumento contrário" },
        { type: "sel", q: "Qual palavra introduz conclusão?", opts: ["Therefore", "Although", "Despite", "Unless"], a: "Therefore" },
        { type: "sel", q: "Qual frase está mais forte para opinião?", opts: ["I strongly believe that education matters", "I kind of believe education matters", "Maybe education matters", "Education matters sort of"], a: "I strongly believe that education matters" },
        { type: "sel", q: "Qual opção é mais adequada para contestar?", opts: ["On the contrary", "By the way", "At the end", "So far"], a: "On the contrary" },
        { type: "sel", q: "Qual frase está correta?", opts: ["However, there is another side to this issue", "However there is another side to this issue", "However is there another side to this issue", "There is however another side to this issue"], a: "However, there is another side to this issue" },
        { type: "sel", q: "Qual estrutura ajuda um texto de opinião?", opts: ["First, secondly, finally", "Dog, cat, bird", "Buy, sell, pay", "Run, jump, sleep"], a: "First, secondly, finally" },
        { type: "sel", q: "Qual frase está correta?", opts: ["This evidence supports my claim", "This evidence support my claim", "This evidence supporting my claim", "This evidence supported my claim"], a: "This evidence supports my claim" },
        { type: "sel", q: "Qual frase é melhor para conclusão?", opts: ["In conclusion, we should act now", "In conclusion we maybe act now?", "Conclusion in now act", "Act now in conclusion maybe"], a: "In conclusion, we should act now" },
        { type: "sel", q: "Qual palavra mostra adição de ideia?", opts: ["Moreover", "Despite", "Whereas", "Unless"], a: "Moreover" },
        { type: "sel", q: "Qual palavra mostra contraste?", opts: ["Nevertheless", "Therefore", "Thus", "Hence"], a: "Nevertheless" },

        { type: "match", pairs: { "Afirmação": "Claim", "Razão": "Reason", "Evidência": "Evidence", "Contra-argumento": "Counterargument" } },
        { type: "match", pairs: { "Conclusão": "Conclusion", "Portanto": "Therefore", "Além disso": "Moreover", "No entanto": "Nevertheless" } },
        { type: "match", pairs: { "Ao contrário": "On the contrary", "Afirmo fortemente": "I strongly believe", "Ponto de vista": "Point of view", "Argumento": "Argument" } },

        { type: "assemble", q: "Eu acredito fortemente que a educação importa", words: ["I", "strongly", "believe", "that", "education", "matters"], a: ["I strongly believe that education matters"] },
        { type: "assemble", q: "No entanto, existe outro lado", words: ["However", "there", "is", "another", "side"], a: ["However, there is another side"] },
        { type: "assemble", q: "Essa evidência apoia meu argumento", words: ["This", "evidence", "supports", "my", "claim"], a: ["This evidence supports my claim"] },
        { type: "assemble", q: "Em conclusão, devemos agir agora", words: ["In", "conclusion", "we", "should", "act", "now"], a: ["In conclusion, we should act now"] },
        { type: "assemble", q: "Por outro lado, isso pode ser caro", words: ["On", "the", "other", "hand", "this", "can", "be", "expensive"], a: ["On the other hand, this can be expensive"] },

        { type: "write", target: "en", q: "Eu discordo por causa dos dados", a: ["I disagree because of the data"] },
        { type: "write", target: "pt", q: "This evidence supports my claim", a: ["Essa evidência apoia meu argumento"] },
        { type: "write", target: "en", q: "Em conclusão, precisamos de mudanças", a: ["In conclusion, we need changes"] },
        { type: "write", target: "pt", q: "On the contrary, I think it is useful", a: ["Ao contrário, eu acho que é útil"] },
        { type: "write", target: "en", q: "Além disso, há outro problema", a: ["Moreover, there is another problem"] },

        { type: "listen", target: "pt", q: "In conclusion, we should act now", a: ["Em conclusão, devemos agir agora"] },
        { type: "listen", target: "pt", q: "However, there is another side", a: ["No entanto, existe outro lado"] },
        { type: "listen", target: "en", q: "I strongly believe that education matters", a: ["I strongly believe that education matters"] }
    ]
},
49: {
    title: "Expressões de Mestre",
    icon: "book-open-text",
    desc: "Idioms e collocations avançadas de nível alto.",
    tip: "Collocations são combinações naturais. Em inglês, somar palavras certas faz muita diferença.",
    vocab: ["Take advantage of", "Come up with", "Carry out", "Raise awareness", "Make a decision", "Heavy rain", "Strongly recommend", "Broad range", "Highly unlikely", "Give rise to", "A piece of advice", "Run a business"],
    pool: [
        { type: "sel", q: "Qual collocation é mais natural?", opts: ["Make a decision", "Do a decision", "Create a decision", "Build a decision"], a: "Make a decision" },
        { type: "sel", q: "Qual expressão significa 'tirar proveito de'?", opts: ["Take advantage of", "Take care of", "Take part in", "Take place"], a: "Take advantage of" },
        { type: "sel", q: "Qual frase está correta?", opts: ["He came up with a great idea", "He came with a great idea up", "He up came with a great idea", "He came a great idea up with"], a: "He came up with a great idea" },
        { type: "sel", q: "Qual expressão significa 'aumentar a conscientização'?", opts: ["Raise awareness", "Rise awareness", "Lift awareness", "Grow awareness"], a: "Raise awareness" },
        { type: "sel", q: "Qual collocation é natural?", opts: ["Heavy rain", "Strong rain", "Big rain", "Hard rain"], a: "Heavy rain" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I strongly recommend this book", "I strong recommend this book", "I recommend strongly this book", "I recommend strong this book"], a: "I strongly recommend this book" },
        { type: "sel", q: "Qual expressão é natural?", opts: ["A broad range of options", "A wide range of options", "A large range of options", "A huge range of options"], a: "A broad range of options" },
        { type: "sel", q: "Qual expressão indica baixa probabilidade?", opts: ["Highly unlikely", "Highly possible", "Very maybe", "Quite certainly"], a: "Highly unlikely" },
        { type: "sel", q: "Qual frase está correta?", opts: ["The project will be carried out next week", "The project will carry out next week", "The project carry out will next week", "The project will carried next week"], a: "The project will be carried out next week" },
        { type: "sel", q: "Qual collocation é natural?", opts: ["A piece of advice", "A piece of suggestion", "A piece of recommendation", "A piece of help"], a: "A piece of advice" },
        { type: "sel", q: "Qual expressão significa 'dar origem a'?", opts: ["Give rise to", "Give up to", "Give in to", "Give out to"], a: "Give rise to" },
        { type: "sel", q: "Qual frase está correta?", opts: ["He runs a business", "He drives a business", "He makes a business run", "He does a business"], a: "He runs a business" },

        { type: "match", pairs: { "Aproveitar": "Take advantage of", "Criar uma ideia": "Come up with", "Executar/realizar": "Carry out", "Aumentar conscientização": "Raise awareness" } },
        { type: "match", pairs: { "Tomar uma decisão": "Make a decision", "Chuva forte": "Heavy rain", "Recomendar fortemente": "Strongly recommend", "Ampla variedade": "Broad range" } },
        { type: "match", pairs: { "Pouco provável": "Highly unlikely", "Dar origem a": "Give rise to", "Um conselho": "A piece of advice", "Administrar um negócio": "Run a business" } },

        { type: "assemble", q: "Ele teve uma ideia ótima", words: ["He", "came", "up", "with", "a", "great", "idea"], a: ["He came up with a great idea"] },
        { type: "assemble", q: "Nós devemos tomar uma decisão", words: ["We", "need", "to", "make", "a", "decision"], a: ["We need to make a decision"] },
        { type: "assemble", q: "O projeto será realizado na próxima semana", words: ["The", "project", "will", "be", "carried", "out", "next", "week"], a: ["The project will be carried out next week"] },
        { type: "assemble", q: "Eu recomendo fortemente esse livro", words: ["I", "strongly", "recommend", "this", "book"], a: ["I strongly recommend this book"] },
        { type: "assemble", q: "Há uma grande variedade de opções", words: ["There", "is", "a", "broad", "range", "of", "options"], a: ["There is a broad range of options"] },

        { type: "write", target: "en", q: "Tome cuidado com essa decisão", a: ["Be careful with that decision"] },
        { type: "write", target: "pt", q: "The plan will be carried out tomorrow", a: ["O plano será realizado amanhã"] },
        { type: "write", target: "en", q: "Há uma chance muito pequena", a: ["There is a highly unlikely chance"] },
        { type: "write", target: "pt", q: "He runs a business", a: ["Ele administra um negócio"] },
        { type: "write", target: "en", q: "Isso pode dar origem a problemas", a: ["This may give rise to problems"] },

        { type: "listen", target: "pt", q: "I strongly recommend this book", a: ["Eu recomendo fortemente este livro"] },
        { type: "listen", target: "pt", q: "The project will be carried out next week", a: ["O projeto será realizado na próxima semana"] },
        { type: "listen", target: "en", q: "He came up with a great idea", a: ["He came up with a great idea"] }
    ]
},
50: {
    title: "Revisão Suprema",
    icon: "brain",
    desc: "Mistura final de leitura, escuta, escrita e compreensão complexa.",
    tip: "Aqui a meta é responder com rapidez, reconhecer estruturas e entender sentido geral sem travar.",
    vocab: ["Comprehension", "Inference", "Context", "Summary", "Structure", "Fluency", "Accuracy", "Meaning", "Hint", "Dialogue", "Narrative", "Inference"],
    pool: [
        { type: "sel", q: "Qual frase é mais natural?", opts: ["I am looking forward to it", "I am looking it forward to", "I forward looking to it", "I looking forward am to it"], a: "I am looking forward to it" },
        { type: "sel", q: "Qual frase está correta?", opts: ["If I had known, I would have called you", "If I knew, I would have called you", "If I had know, I would call you", "If I have known, I would have called you"], a: "If I had known, I would have called you" },
        { type: "sel", q: "Qual frase está correta?", opts: ["The report was being reviewed", "The report reviewed was being", "The report was reviewing", "The report is being revieweded"], a: "The report was being reviewed" },
        { type: "sel", q: "Qual expressão é mais natural?", opts: ["No worries", "No worrying", "No worrys", "Not worries"], a: "No worries" },
        { type: "sel", q: "Qual frase está correta?", opts: ["She asked where I lived", "She asked where did I live", "She asked where I live yesterday", "She asked where I am live"], a: "She asked where I lived" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I had my hair cut yesterday", "I cut my hair had yesterday", "I have cut my hair yesterday by", "I had cutted my hair yesterday"], a: "I had my hair cut yesterday" },
        { type: "sel", q: "Qual opção melhor expressa uma opinião moderada?", opts: ["I believe", "Perhaps", "Definitely", "Absolutely"], a: "Perhaps" },
        { type: "sel", q: "Qual frase mostra contraste?", opts: ["However", "Therefore", "Moreover", "Furthermore"], a: "However" },
        { type: "sel", q: "Qual frase é correta?", opts: ["He ran out of time", "He ran time out of", "He out of ran time", "He run out time"], a: "He ran out of time" },
        { type: "sel", q: "Qual frase é correta?", opts: ["I enjoy studying English", "I enjoy study English", "I enjoy to study English", "I enjoy to studying English"], a: "I enjoy studying English" },
        { type: "sel", q: "Qual frase é mais formal?", opts: ["Could you please clarify this point?", "Yo, explain this now", "Tell me this quick", "Fix this for me dude"], a: "Could you please clarify this point?" },
        { type: "sel", q: "Qual palavra indica conclusão?", opts: ["Therefore", "Although", "Despite", "Unless"], a: "Therefore" },

        { type: "match", pairs: { "Compreensão": "Comprehension", "Inferência": "Inference", "Contexto": "Context", "Resumo": "Summary" } },
        { type: "match", pairs: { "Estrutura": "Structure", "Fluência": "Fluency", "Precisão": "Accuracy", "Significado": "Meaning" } },
        { type: "match", pairs: { "Pista": "Hint", "Diálogo": "Dialogue", "Narrativa": "Narrative", "Conclusão": "Conclusion" } },

        { type: "assemble", q: "Eu gostaria de ter mais tempo", words: ["I", "wish", "I", "had", "more", "time"], a: ["I wish I had more time"] },
        { type: "assemble", q: "O relatório foi enviado ontem", words: ["The", "report", "was", "sent", "yesterday"], a: ["The report was sent yesterday"] },
        { type: "assemble", q: "Nós ficamos sem água", words: ["We", "ran", "out", "of", "water"], a: ["We ran out of water"] },
        { type: "assemble", q: "No entanto, eu entendo o problema", words: ["However", "I", "understand", "the", "problem"], a: ["However, I understand the problem"] },
        { type: "assemble", q: "A evidência apoia a ideia", words: ["The", "evidence", "supports", "the", "idea"], a: ["The evidence supports the idea"] },
        { type: "assemble", q: "Eu tive meu quarto pintado", words: ["I", "had", "my", "room", "painted"], a: ["I had my room painted"] },

        { type: "write", target: "pt", q: "I had my room painted", a: ["Eu mandei pintar meu quarto"] },
        { type: "write", target: "en", q: "A pesquisa foi realizada com cuidado", a: ["The research was carried out carefully"] },
        { type: "write", target: "pt", q: "The evidence supports the claim", a: ["A evidência apoia a afirmação"] },
        { type: "write", target: "en", q: "Talvez ele já tenha ido embora", a: ["Perhaps he has already left"] },
        { type: "write", target: "pt", q: "Could you please clarify this point?", a: ["Você poderia esclarecer este ponto, por favor?"] },

        { type: "listen", target: "pt", q: "I wish I had more time", a: ["Eu gostaria de ter mais tempo"] },
        { type: "listen", target: "en", q: "The report was sent yesterday", a: ["The report was sent yesterday"] },
        { type: "listen", target: "pt", q: "Could you please clarify this point?", a: ["Você poderia esclarecer este ponto, por favor?"] }
    ]
  },
          51: {
    title: "Sarcasmo na Veia",
    icon: "message-square-more",
    desc: "Sarcasmo, ironia e sentido implícito.",
    tip: "Em inglês, sarcasmo e ironia quase nunca são ditos de forma explícita. O tom e o contexto fazem a diferença.",
    vocab: ["Sarcasm", "Irony", "Understatement", "Obviously", "Sure", "Great", "Lovely", "Fantastic", "Yeah right", "As if"],
    pool: [
        { type: "sel", q: "Qual frase soa sarcástica em inglês?", opts: ["Oh great, another meeting", "I love meetings", "This is a meeting", "Meetings are on Monday"], a: "Oh great, another meeting" },
        { type: "sel", q: "O que significa 'Yeah right' em muitos contextos?", opts: ["Sim, claro (com ironia)", "Sim, com certeza", "Não entendi", "Muito obrigado"], a: "Sim, claro (com ironia)" },
        { type: "sel", q: "Qual expressão costuma indicar ironia?", opts: ["As if", "By the way", "In addition", "At least"], a: "As if" },
        { type: "sel", q: "Qual frase é um understatment?", opts: ["It was a bit noisy for a concert with 10,000 people", "It was the loudest place on Earth", "It was totally silent", "It was a normal place"], a: "It was a bit noisy for a concert with 10,000 people" },
        { type: "sel", q: "Qual resposta pode soar irônica?", opts: ["Sure, because I totally have nothing better to do", "Sure, I can help", "Sure, what time?", "Sure, no problem"], a: "Sure, because I totally have nothing better to do" },
        { type: "sel", q: "Qual frase sugere sarcasmo pelo contexto?", opts: ["Lovely weather... in the middle of a storm", "Lovely weather on a sunny day", "Lovely weather at noon", "Lovely weather in spring"], a: "Lovely weather... in the middle of a storm" },
        { type: "sel", q: "Qual palavra pode soar positiva, mas depende do tom?", opts: ["Great", "Table", "Water", "Window"], a: "Great" },
        { type: "sel", q: "Qual expressão é usada para dizer 'claro, né' com ironia?", opts: ["Obviously", "Probably", "Maybe", "Hopefully"], a: "Obviously" },
        { type: "sel", q: "Qual frase está mais próxima de sarcasmo?", opts: ["Fantastic, my phone died again", "Fantastic, I got a gift", "Fantastic, we won", "Fantastic, the food is ready"], a: "Fantastic, my phone died again" },
        { type: "sel", q: "Qual expressão significa 'como se...'?", opts: ["As if", "As for", "As long as", "As soon as"], a: "As if" },
        { type: "sel", q: "Qual resposta pode ser uma ironia leve?", opts: ["Thanks a lot" , "Thanks for the help", "Thank you very much", "Many thanks"], a: "Thanks a lot" },
        { type: "sel", q: "Qual frase usa understatement?", opts: ["It was slightly cold" , "It was the end of the world", "It was a volcano", "It was blazing hot"], a: "It was slightly cold" },

        { type: "match", pairs: { "Sarcasmo": "Sarcasm", "Ironia": "Irony", "Aparentemente": "Obviously", "Como se...": "As if" } },
        { type: "match", pairs: { "Muito fácil": "Piece of cake", "Claro, né?": "Obviously", "Ah, ótimo...": "Oh great", "Pois é...": "Yeah right" } },
        { type: "match", pairs: { "Subestimado": "Understatement", "Com sarcasmo": "Sarcastically", "Felizmente": "Fortunately", "Infelizmente": "Unfortunately" } },

        { type: "assemble", q: "Ah, ótimo, mais uma reunião", words: ["Oh", "great", "another", "meeting"], a: ["Oh great, another meeting"] },
        { type: "assemble", q: "Claro, porque eu não tenho nada melhor para fazer", words: ["Sure", "because", "I", "totally", "have", "nothing", "better", "to", "do"], a: ["Sure, because I totally have nothing better to do"] },
        { type: "assemble", q: "Que tempo maravilhoso... durante uma tempestade", words: ["Lovely", "weather", "in", "the", "middle", "of", "a", "storm"], a: ["Lovely weather in the middle of a storm"] },
        { type: "assemble", q: "Como se eu fosse fazer isso", words: ["As", "if", "I", "would", "do", "that"], a: ["As if I would do that"] },
        { type: "assemble", q: "Foi só um pouco barulhento", words: ["It", "was", "a", "bit", "noisy"], a: ["It was a bit noisy"] },

        { type: "write", target: "en", q: "Ah, ótimo, perdi o ônibus", a: ["Oh great, I missed the bus"] },
        { type: "write", target: "pt", q: "Yeah right, that was easy", a: ["Claro, né, isso foi fácil", "Ah, claro, isso foi fácil"] },
        { type: "write", target: "en", q: "Como se eu fosse acreditar nisso", a: ["As if I would believe that"] },
        { type: "write", target: "pt", q: "It was a bit cold", a: ["Estava um pouco frio"] },
        { type: "write", target: "en", q: "I just love being ignored", a: ["Eu simplesmente adoro ser ignorado", "Eu adoro ser ignorado"] },

        { type: "listen", target: "pt", q: "Oh great, now it's raining", a: ["Ah, ótimo, agora está chovendo"] },
        { type: "listen", target: "pt", q: "As if I cared", a: ["Como se eu me importasse"] },
        { type: "listen", target: "pt", q: "Yeah right, that's true", a: ["Claro, né, isso é verdade"] }
    ]
},
52: {
    title: "Entrelinhas Secretas",
    icon: "ellipsis",
    desc: "Sentido implícito, subtexto e leitura nas entrelinhas.",
    tip: "Nem tudo em inglês é literal. Às vezes o mais importante é entender o que a pessoa quis dizer, e não só o que ela falou.",
    vocab: ["Imply", "Infer", "Hint", "Subtext", "Read between the lines", "Tone", "Context", "Polite", "Euphemism", "Indirect"],
    pool: [
        { type: "sel", q: "O que significa 'read between the lines'?", opts: ["Ler letras pequenas", "Entender o subtexto", "Ler em voz alta", "Ler mais rápido"], a: "Entender o subtexto" },
        { type: "sel", q: "Qual palavra significa 'dar a entender'?", opts: ["Imply", "Infer", "Explain", "Translate"], a: "Imply" },
        { type: "sel", q: "Qual palavra significa 'deduzir'?", opts: ["Infer", "Imply", "Hint", "Mean"], a: "Infer" },
        { type: "sel", q: "Qual frase sugere algo sem dizer diretamente?", opts: ["He hinted that he was upset", "He shouted that he was upset", "He typed that he was upset", "He wrote a dictionary"], a: "He hinted that he was upset" },
        { type: "sel", q: "Qual palavra suaviza uma verdade dura?", opts: ["Euphemism", "Problem", "Conflict", "Argument"], a: "Euphemism" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I think he may be late", "I think he is definitely late", "I think he late may be", "I think he may late be"], a: "I think he may be late" },
        { type: "sel", q: "Qual expressão é mais indireta?", opts: ["Could you maybe help me?", "Help me now!", "You must help me!", "Help!"], a: "Could you maybe help me?" },
        { type: "sel", q: "Qual frase tem tom diplomático?", opts: ["That is not ideal", "That is awful and stupid", "That is the worst thing ever", "I hate this completely"], a: "That is not ideal" },
        { type: "sel", q: "Qual opção é um marcador de subtexto?", opts: ["Tone", "Chair", "Phone", "Stone"], a: "Tone" },
        { type: "sel", q: "O que você faz ao 'infer'?", opts: ["Conclui algo a partir de pistas", "Repete exatamente", "Ignora a fala", "Corrige o idioma"], a: "Conclui algo a partir de pistas" },
        { type: "sel", q: "Qual frase mostra uma crítica leve?", opts: ["It could be better", "It is perfect", "It is impossible", "It is a joke"], a: "It could be better" },
        { type: "sel", q: "Qual frase é mais provável de ser indireta?", opts: ["Maybe we should reconsider", "You are wrong", "Stop talking", "I refuse"], a: "Maybe we should reconsider" },

        { type: "match", pairs: { "Subtexto": "Subtext", "Insinuar": "Imply", "Deduzir": "Infer", "Pista": "Hint" } },
        { type: "match", pairs: { "Tom": "Tone", "Contexto": "Context", "Polido": "Polite", "Indireto": "Indirect" } },
        { type: "match", pairs: { "Eufemismo": "Euphemism", "Ler nas entrelinhas": "Read between the lines", "Sugerir": "Hint", "Falar de forma suave": "Be diplomatic" } },

        { type: "assemble", q: "Você precisa ler nas entrelinhas", words: ["You", "need", "to", "read", "between", "the", "lines"], a: ["You need to read between the lines"] },
        { type: "assemble", q: "Ele deu a entender que estava cansado", words: ["He", "implied", "that", "he", "was", "tired"], a: ["He implied that he was tired"] },
        { type: "assemble", q: "Eu deduzi isso pelo tom dele", words: ["I", "inferred", "that", "from", "his", "tone"], a: ["I inferred that from his tone"] },
        { type: "assemble", q: "Talvez devêssemos reconsiderar", words: ["Maybe", "we", "should", "reconsider"], a: ["Maybe we should reconsider"] },
        { type: "assemble", q: "Isso não é ideal", words: ["That", "is", "not", "ideal"], a: ["That is not ideal"] },

        { type: "write", target: "en", q: "Ele deu a entender que estava chateado", a: ["He hinted that he was upset"] },
        { type: "write", target: "pt", q: "I think we should reconsider", a: ["Eu acho que devemos reconsiderar"] },
        { type: "write", target: "en", q: "Isso pode ser melhor", a: ["It could be better"] },
        { type: "write", target: "pt", q: "Could you maybe help me?", a: ["Você poderia talvez me ajudar?"] },
        { type: "write", target: "en", q: "Ler entre as linhas é importante", a: ["Reading between the lines is important"] },

        { type: "listen", target: "pt", q: "It could be better", a: ["Isso poderia ser melhor"] },
        { type: "listen", target: "pt", q: "Could you maybe help me?", a: ["Você poderia talvez me ajudar?"] },
        { type: "listen", target: "en", q: "He implied that he was tired", a: ["He implied that he was tired"] }
    ]
},
53: {
    title: "Modo Acadêmico",
    icon: "graduation-cap",
    desc: "Linguagem de artigos, relatórios e pesquisa.",
    tip: "Em inglês acadêmico, clareza, precisão e impessoalidade contam muito.",
    vocab: ["Research", "Methodology", "Findings", "Analysis", "Abstract", "Reference", "Citation", "Data", "Survey", "Hypothesis"],
    pool: [
        { type: "sel", q: "O que é 'abstract'?", opts: ["Resumo", "Título", "Citação", "Conclusão"], a: "Resumo" },
        { type: "sel", q: "O que é 'methodology'?", opts: ["Metodologia", "Resultado", "Bibliografia", "Hipótese"], a: "Metodologia" },
        { type: "sel", q: "O que é 'findings'?", opts: ["Achados/resultados", "Citações", "Notas", "Perguntas"], a: "Achados/resultados" },
        { type: "sel", q: "Qual frase é mais acadêmica?", opts: ["The data suggest that...", "I feel like...", "It was kind of...", "You know..."], a: "The data suggest that..." },
        { type: "sel", q: "Qual palavra significa 'citação'?", opts: ["Citation", "Condition", "Context", "Creation"], a: "Citation" },
        { type: "sel", q: "Qual palavra significa 'hipótese'?", opts: ["Hypothesis", "Hope", "Happen", "History"], a: "Hypothesis" },
        { type: "sel", q: "Qual frase está correta?", opts: ["The results indicate a clear trend", "The results indicates a clear trend", "The results indicating a clear trend", "The result indicate a clear trend"], a: "The results indicate a clear trend" },
        { type: "sel", q: "Qual expressão é comum em texto acadêmico?", opts: ["According to the study", "Yo according to the study", "Study said by me", "Study from now"], a: "According to the study" },
        { type: "sel", q: "Qual palavra significa 'dados'?", opts: ["Data", "Date", "Deal", "Debt"], a: "Data" },
        { type: "sel", q: "Qual opção representa uma pesquisa por perguntas?", opts: ["Survey", "Server", "Service", "Surface"], a: "Survey" },
        { type: "sel", q: "Qual frase é mais formal?", opts: ["Further research is required", "We gotta check more", "Need more stuff", "Let's see later"], a: "Further research is required" },
        { type: "sel", q: "Qual parte de um artigo traz a ideia principal resumida?", opts: ["Abstract", "Appendix", "Reference", "Footnote"], a: "Abstract" },

        { type: "match", pairs: { "Pesquisa": "Research", "Metodologia": "Methodology", "Resultados": "Findings", "Análise": "Analysis" } },
        { type: "match", pairs: { "Resumo": "Abstract", "Referência": "Reference", "Citação": "Citation", "Dados": "Data" } },
        { type: "match", pairs: { "Levantamento": "Survey", "Hipótese": "Hypothesis", "Conclusão": "Conclusion", "Introdução": "Introduction" } },

        { type: "assemble", q: "Os dados sugerem uma tendência clara", words: ["The", "data", "suggest", "a", "clear", "trend"], a: ["The data suggest a clear trend"] },
        { type: "assemble", q: "De acordo com o estudo, o resultado foi positivo", words: ["According", "to", "the", "study", "the", "result", "was", "positive"], a: ["According to the study, the result was positive"] },
        { type: "assemble", q: "A metodologia foi bem explicada", words: ["The", "methodology", "was", "well", "explained"], a: ["The methodology was well explained"] },
        { type: "assemble", q: "Precisamos de mais pesquisa", words: ["Further", "research", "is", "required"], a: ["Further research is required"] },
        { type: "assemble", q: "A hipótese foi confirmada", words: ["The", "hypothesis", "was", "confirmed"], a: ["The hypothesis was confirmed"] },

        { type: "write", target: "pt", q: "According to the study, the result was positive", a: ["De acordo com o estudo, o resultado foi positivo"] },
        { type: "write", target: "en", q: "O resumo está no início do artigo", a: ["The abstract is at the beginning of the article"] },
        { type: "write", target: "pt", q: "Further research is required", a: ["Mais pesquisas são necessárias", "Pesquisa adicional é necessária"] },
        { type: "write", target: "en", q: "A metodologia foi bem descrita", a: ["The methodology was well described"] },
        { type: "write", target: "pt", q: "The findings support the hypothesis", a: ["Os achados apoiam a hipótese"] },

        { type: "listen", target: "pt", q: "The data suggest a clear trend", a: ["Os dados sugerem uma tendência clara"] },
        { type: "listen", target: "en", q: "Further research is required", a: ["Further research is required"] },
        { type: "listen", target: "pt", q: "According to the study, the result was positive", a: ["De acordo com o estudo, o resultado foi positivo"] }
    ]
},
54: {
    title: "Palestra de Peso",
    icon: "presentation",
    desc: "Apresentações, relatórios e fala profissional.",
    tip: "Em apresentações, estrutura ajuda: introduction, main points, transition, conclusion.",
    vocab: ["Presentation", "Slide", "Speaker", "Audience", "Summary", "Outline", "Transition", "Emphasize", "Engage", "Conclusion"],
    pool: [
        { type: "sel", q: "O que é uma 'slide'?", opts: ["Slide", "Palestra", "Pergunta", "Pesquisa"], a: "Slide" },
        { type: "sel", q: "Qual palavra significa 'palestrante'?", opts: ["Speaker", "Listener", "Writer", "Viewer"], a: "Speaker" },
        { type: "sel", q: "Qual palavra significa 'plateia'?", opts: ["Audience", "Agenda", "Advice", "Office"], a: "Audience" },
        { type: "sel", q: "Qual frase é mais adequada para abrir uma apresentação?", opts: ["Good morning everyone", "Yo, listen up", "What's up guys", "Hey bro"], a: "Good morning everyone" },
        { type: "sel", q: "Qual frase está correta?", opts: ["Today I will talk about climate change", "Today I talk will about climate change", "Today I will about talk climate change", "Today talk I will about climate change"], a: "Today I will talk about climate change" },
        { type: "sel", q: "Qual palavra significa 'resumir'?", opts: ["Summarize", "Surprise", "Survive", "Separate"], a: "Summarize" },
        { type: "sel", q: "Qual palavra significa 'enfatizar'?", opts: ["Emphasize", "Empathize", "Organize", "Realize"], a: "Emphasize" },
        { type: "sel", q: "Qual palavra ajuda a mudar de um tópico para outro?", opts: ["Transition", "Translation", "Tradition", "Transaction"], a: "Transition" },
        { type: "sel", q: "Qual frase está correta?", opts: ["Let me summarize the main points", "Let me summarized the main points", "Let me summary the main points", "Let me summarizing the main points"], a: "Let me summarize the main points" },
        { type: "sel", q: "Qual frase é mais natural?", opts: ["I would like to emphasize one point", "I like to emphasis one point", "I would emphasis one point", "I am emphasize one point"], a: "I would like to emphasize one point" },
        { type: "sel", q: "Qual estrutura finaliza bem uma fala?", opts: ["In conclusion", "At beginning", "By question", "From middle"], a: "In conclusion" },
        { type: "sel", q: "Qual expressão prende a atenção do público?", opts: ["Engage the audience", "Ignore the audience", "Cut the audience", "Break the audience"], a: "Engage the audience" },

        { type: "match", pairs: { "Apresentação": "Presentation", "Slide": "Slide", "Palestrante": "Speaker", "Plateia": "Audience" } },
        { type: "match", pairs: { "Resumo": "Summary", "Roteiro": "Outline", "Transição": "Transition", "Conclusão": "Conclusion" } },
        { type: "match", pairs: { "Enfatizar": "Emphasize", "Envolver": "Engage", "Tópico": "Topic", "Visual": "Visual" } },

        { type: "assemble", q: "Hoje eu vou falar sobre mudança climática", words: ["Today", "I", "will", "talk", "about", "climate", "change"], a: ["Today I will talk about climate change"] },
        { type: "assemble", q: "Deixe-me resumir os pontos principais", words: ["Let", "me", "summarize", "the", "main", "points"], a: ["Let me summarize the main points"] },
        { type: "assemble", q: "Gostaria de enfatizar um ponto", words: ["I", "would", "like", "to", "emphasize", "one", "point"], a: ["I would like to emphasize one point"] },
        { type: "assemble", q: "Em conclusão, precisamos agir", words: ["In", "conclusion", "we", "need", "to", "act"], a: ["In conclusion, we need to act"] },
        { type: "assemble", q: "Agora vamos ao próximo tópico", words: ["Now", "let's", "move", "on", "to", "the", "next", "topic"], a: ["Now let's move on to the next topic"] },

        { type: "write", target: "en", q: "Boa tarde a todos", a: ["Good afternoon everyone"] },
        { type: "write", target: "pt", q: "Let me summarize the main points", a: ["Deixe-me resumir os pontos principais"] },
        { type: "write", target: "en", q: "Eu gostaria de enfatizar este ponto", a: ["I would like to emphasize this point"] },
        { type: "write", target: "pt", q: "Now let's move on to the next topic", a: ["Agora vamos ao próximo tópico"] },
        { type: "write", target: "en", q: "A plateia ficou envolvida", a: ["The audience was engaged"] },

        { type: "listen", target: "pt", q: "Good morning everyone", a: ["Bom dia a todos"] },
        { type: "listen", target: "en", q: "In conclusion, we need to act", a: ["In conclusion, we need to act"] },
        { type: "listen", target: "pt", q: "The audience was engaged", a: ["A plateia ficou envolvida"] }
    ]
},
55: {
    title: "Histórias que Prendem",
    icon: "book-open",
    desc: "Narrativas longas, enredo e sequência de eventos.",
    tip: "Storytelling forte usa sequência: first, then, after that, suddenly, finally.",
    vocab: ["Character", "Plot", "Setting", "Conflict", "Resolution", "Narrator", "Suddenly", "Meanwhile", "Eventually", "Meanwhile", "Meanwhile", "At first"],
    pool: [
        { type: "sel", q: "O que é 'plot'?", opts: ["Enredo", "Cenário", "Capítulo", "Narração"], a: "Enredo" },
        { type: "sel", q: "O que é 'setting'?", opts: ["Cenário", "Conflito", "Fim", "Lição"], a: "Cenário" },
        { type: "sel", q: "O que é 'conflict'?", opts: ["Conflito", "Culpa", "Resumo", "Som"], a: "Conflito" },
        { type: "sel", q: "Qual palavra indica que algo acontece de repente?", opts: ["Suddenly", "Usually", "Slowly", "Clearly"], a: "Suddenly" },
        { type: "sel", q: "Qual palavra indica que algo acontece depois?", opts: ["Eventually", "Immediately", "Slightly", "Quietly"], a: "Eventually" },
        { type: "sel", q: "Qual sequência é natural para contar história?", opts: ["At first, then, after that, finally", "Finally, at first, then, never", "Then, finally, at first", "After, before, during, away"], a: "At first, then, after that, finally" },
        { type: "sel", q: "Qual frase está correta?", opts: ["Suddenly, the door opened", "Suddenly the door opened", "The door suddenly opened", "All are correct"], a: "All are correct" },
        { type: "sel", q: "Qual termo representa quem conta a história?", opts: ["Narrator", "Manager", "Speaker", "Driver"], a: "Narrator" },
        { type: "sel", q: "Qual termo representa a ordem dos acontecimentos?", opts: ["Sequence", "Choice", "Pressure", "Promise"], a: "Sequence" },
        { type: "sel", q: "Qual frase está correta?", opts: ["Meanwhile, she was waiting", "Meanwhile she were waiting", "Meanwhile, she waiting was", "She meanwhile waiting"], a: "Meanwhile, she was waiting" },
        { type: "sel", q: "Qual palavra é boa para encerrar uma história?", opts: ["Finally", "Luckily", "Sadly", "Barely"], a: "Finally" },
        { type: "sel", q: "Qual palavra faz a transição para o começo?", opts: ["At first", "At last", "At once", "At least"], a: "At first" },

        { type: "match", pairs: { "Personagem": "Character", "Enredo": "Plot", "Cenário": "Setting", "Conflito": "Conflict" } },
        { type: "match", pairs: { "Resolução": "Resolution", "Narrador": "Narrator", "De repente": "Suddenly", "Eventualmente": "Eventually" } },
        { type: "match", pairs: { "Enquanto isso": "Meanwhile", "No começo": "At first", "Depois disso": "After that", "Finalmente": "Finally" } },

        { type: "assemble", q: "No começo, ele estava nervoso", words: ["At", "first", "he", "was", "nervous"], a: ["At first he was nervous"] },
        { type: "assemble", q: "Depois disso, ele ficou calmo", words: ["After", "that", "he", "became", "calm"], a: ["After that he became calm"] },
        { type: "assemble", q: "De repente, a porta se abriu", words: ["Suddenly", "the", "door", "opened"], a: ["Suddenly the door opened"] },
        { type: "assemble", q: "Enquanto isso, ela esperava", words: ["Meanwhile", "she", "was", "waiting"], a: ["Meanwhile, she was waiting"] },
        { type: "assemble", q: "Finalmente, ele encontrou a chave", words: ["Finally", "he", "found", "the", "key"], a: ["Finally he found the key"] },

        { type: "write", target: "en", q: "No começo, ela não entendia nada", a: ["At first, she didn't understand anything"] },
        { type: "write", target: "pt", q: "Eventually, he found the truth", a: ["Eventualmente, ele encontrou a verdade"] },
        { type: "write", target: "en", q: "A história começa com um conflito", a: ["The story begins with a conflict"] },
        { type: "write", target: "pt", q: "The narrator explains everything clearly", a: ["O narrador explica tudo claramente"] },
        { type: "write", target: "en", q: "Finalmente, eles venceram", a: ["Finally, they won"] },

        { type: "listen", target: "pt", q: "At first he was nervous", a: ["No começo ele estava nervoso"] },
        { type: "listen", target: "pt", q: "Suddenly the door opened", a: ["De repente a porta se abriu"] },
        { type: "listen", target: "pt", q: "Finally, he found the key", a: ["Finalmente, ele encontrou a chave"] }
    ]
},
56: {
    title: "Detalhes de Cinema",
    icon: "palette",
    desc: "Descrição rica, imagens mentais e linguagem sensorial.",
    tip: "Adjetivos, advérbios e detalhes concretos fazem a narrativa ganhar vida.",
    vocab: ["Glimmering", "Whispering", "Rugged", "Smooth", "Crowded", "Silent", "Vivid", "Dull", "Faint", "Lively"],
    pool: [
        { type: "sel", q: "Qual palavra descreve algo brilhando suavemente?", opts: ["Glimmering", "Shouting", "Broken", "Empty"], a: "Glimmering" },
        { type: "sel", q: "Qual palavra descreve um lugar cheio de gente?", opts: ["Crowded", "Silent", "Empty", "Smooth"], a: "Crowded" },
        { type: "sel", q: "Qual palavra descreve algo muito claro e vivo?", opts: ["Vivid", "Dull", "Faint", "Rugged"], a: "Vivid" },
        { type: "sel", q: "Qual palavra descreve um som baixo e quase imperceptível?", opts: ["Faint", "Lively", "Crowded", "Smooth"], a: "Faint" },
        { type: "sel", q: "Qual palavra descreve uma superfície irregular?", opts: ["Rugged", "Smooth", "Silent", "Vivid"], a: "Rugged" },
        { type: "sel", q: "Qual palavra descreve algo macio/leve ao toque?", opts: ["Smooth", "Rugged", "Crowded", "Dull"], a: "Smooth" },
        { type: "sel", q: "Qual frase está mais descritiva?", opts: ["The room was silent and cold", "The room was room", "The room is exist", "The room was silently"], a: "The room was silent and cold" },
        { type: "sel", q: "Qual frase pinta melhor uma imagem?", opts: ["A vivid sunset covered the sky", "A sunset was a sunset", "The sky sunset had", "A sunset vivid was"], a: "A vivid sunset covered the sky" },
        { type: "sel", q: "Qual opção é um adjetivo sensorial?", opts: ["Whispering", "Calendar", "Reason", "Decision"], a: "Whispering" },
        { type: "sel", q: "Qual palavra descreve algo animado e cheio de vida?", opts: ["Lively", "Dull", "Faint", "Rugged"], a: "Lively" },
        { type: "sel", q: "Qual frase está correta?", opts: ["The lights were glimmering in the dark", "The lights glimmering were in the dark", "The lights were in glimmering the dark", "The glimmering were lights in the dark"], a: "The lights were glimmering in the dark" },
        { type: "sel", q: "Qual frase está correta?", opts: ["Her voice was barely audible", "Her voice was barely heardable", "Her voice barely was audible", "Her voice was audibly bare"], a: "Her voice was barely audible" },

        { type: "match", pairs: { "Brilhando suavemente": "Glimmering", "Sussurrando": "Whispering", "Acidentado": "Rugged", "Suave": "Smooth" } },
        { type: "match", pairs: { "Lotado": "Crowded", "Silencioso": "Silent", "Vívido": "Vivid", "Sem graça": "Dull" } },
        { type: "match", pairs: { "Fraco/sutil": "Faint", "Animado": "Lively", "Descrição": "Description", "Imagem mental": "Imagery" } },

        { type: "assemble", q: "A lua brilhava suavemente no céu", words: ["The", "moon", "was", "glimmering", "in", "the", "sky"], a: ["The moon was glimmering in the sky"] },
        { type: "assemble", q: "O quarto estava silencioso e frio", words: ["The", "room", "was", "silent", "and", "cold"], a: ["The room was silent and cold"] },
        { type: "assemble", q: "Uma luz vívida iluminou o caminho", words: ["A", "vivid", "light", "lit", "the", "path"], a: ["A vivid light lit the path"] },
        { type: "assemble", q: "A multidão era barulhenta e animada", words: ["The", "crowd", "was", "lively", "and", "noisy"], a: ["The crowd was lively and noisy"] },
        { type: "assemble", q: "Sua voz era quase imperceptível", words: ["Her", "voice", "was", "barely", "audible"], a: ["Her voice was barely audible"] },

        { type: "write", target: "en", q: "O céu estava cheio de estrelas brilhantes", a: ["The sky was full of glimmering stars"] },
        { type: "write", target: "pt", q: "A vivid sunset covered the sky", a: ["Um pôr do sol vívido cobriu o céu"] },
        { type: "write", target: "en", q: "O caminho era irregular e rochoso", a: ["The path was rugged and rocky"] },
        { type: "write", target: "pt", q: "The crowd was lively and noisy", a: ["A multidão estava animada e barulhenta"] },
        { type: "write", target: "en", q: "A sala estava quase silenciosa", a: ["The room was nearly silent"] },

        { type: "listen", target: "pt", q: "The moon was glimmering in the sky", a: ["A lua brilhava suavemente no céu"] },
        { type: "listen", target: "pt", q: "Her voice was barely audible", a: ["Sua voz era quase imperceptível"] },
        { type: "listen", target: "en", q: "The room was silent and cold", a: ["The room was silent and cold"] }
    ]
},
57: {
    title: "Mundo em Debate",
    icon: "globe",
    desc: "Ética, IA, globalização e pensamento crítico.",
    tip: "Pensamento crítico em inglês usa nuances: may, might, could, seems, suggests, raises concerns.",
    vocab: ["Ethics", "AI", "Globalization", "Fairness", "Responsibility", "Privacy", "Bias", "Concern", "Impact", "Sustainable"],
    pool: [
        { type: "sel", q: "O que significa 'ethics'?", opts: ["Ética", "Época", "Teoria", "Tática"], a: "Ética" },
        { type: "sel", q: "O que significa 'bias'?", opts: ["Preconceito/tendência", "Conhecimento", "Balanço", "Benefício"], a: "Preconceito/tendência" },
        { type: "sel", q: "Qual frase está correta?", opts: ["AI raises important ethical questions", "AI raise important ethical questions", "AI is raising question ethical", "AI ethical questions raise important"], a: "AI raises important ethical questions" },
        { type: "sel", q: "Qual opção é mais crítica e reflexiva?", opts: ["This may have long-term consequences", "This is good and done", "This is just a thing", "This is only fun"], a: "This may have long-term consequences" },
        { type: "sel", q: "Qual palavra significa 'globalização'?", opts: ["Globalization", "Organization", "Localization", "Connection"], a: "Globalization" },
        { type: "sel", q: "Qual expressão indica preocupação?", opts: ["Raises concerns", "Makes joy", "Gives peace", "Creates laugh"], a: "Raises concerns" },
        { type: "sel", q: "Qual frase está correta?", opts: ["Globalization affects local cultures", "Globalization affect local cultures", "Globalization is affect local cultures", "Globalization cultures local affects"], a: "Globalization affects local cultures" },
        { type: "sel", q: "Qual palavra significa 'responsabilidade'?", opts: ["Responsibility", "Response", "Resistance", "Respect"], a: "Responsibility" },
        { type: "sel", q: "Qual palavra significa 'impacto'?", opts: ["Impact", "Import", "Intake", "Impulse"], a: "Impact" },
        { type: "sel", q: "Qual frase está correta?", opts: ["We need fair and sustainable solutions", "We need fairness and sustainable solution", "We need fair and sustain solutions", "We need fairly and sustainability"], a: "We need fair and sustainable solutions" },
        { type: "sel", q: "Qual palavra indica algo que merece atenção ética?", opts: ["Privacy", "Pencil", "Packet", "Pocket"], a: "Privacy" },
        { type: "sel", q: "Qual frase está correta?", opts: ["This issue deserves careful consideration", "This issue deserve careful consideration", "This issue carefully consideration deserve", "This issue is careful deserving"], a: "This issue deserves careful consideration" },

        { type: "match", pairs: { "Ética": "Ethics", "IA": "AI", "Globalização": "Globalization", "Privacidade": "Privacy" } },
        { type: "match", pairs: { "Preconceito": "Bias", "Preocupação": "Concern", "Impacto": "Impact", "Responsabilidade": "Responsibility" } },
        { type: "match", pairs: { "Justiça": "Fairness", "Sustentável": "Sustainable", "Consequências": "Consequences", "Questões": "Questions" } },

        { type: "assemble", q: "A IA levanta questões éticas importantes", words: ["AI", "raises", "important", "ethical", "questions"], a: ["AI raises important ethical questions"] },
        { type: "assemble", q: "Precisamos de soluções justas e sustentáveis", words: ["We", "need", "fair", "and", "sustainable", "solutions"], a: ["We need fair and sustainable solutions"] },
        { type: "assemble", q: "Isso pode ter consequências de longo prazo", words: ["This", "may", "have", "long-term", "consequences"], a: ["This may have long-term consequences"] },
        { type: "assemble", q: "A globalização afeta culturas locais", words: ["Globalization", "affects", "local", "cultures"], a: ["Globalization affects local cultures"] },
        { type: "assemble", q: "Esse assunto merece consideração cuidadosa", words: ["This", "issue", "deserves", "careful", "consideration"], a: ["This issue deserves careful consideration"] },

        { type: "write", target: "pt", q: "AI raises important ethical questions", a: ["A IA levanta questões éticas importantes"] },
        { type: "write", target: "en", q: "Precisamos discutir a privacidade", a: ["We need to discuss privacy"] },
        { type: "write", target: "pt", q: "This may have long-term consequences", a: ["Isso pode ter consequências de longo prazo"] },
        { type: "write", target: "en", q: "A globalização muda o mercado de trabalho", a: ["Globalization changes the job market"] },
        { type: "write", target: "pt", q: "This issue deserves careful consideration", a: ["Esse assunto merece consideração cuidadosa"] },

        { type: "listen", target: "pt", q: "AI raises important ethical questions", a: ["A IA levanta questões éticas importantes"] },
        { type: "listen", target: "en", q: "We need fair and sustainable solutions", a: ["We need fair and sustainable solutions"] },
        { type: "listen", target: "pt", q: "Globalization affects local cultures", a: ["A globalização afeta culturas locais"] }
    ]
},
58: {
    title: "Pronúncia de Ouro",
    icon: "audio-lines",
    desc: "Entonação, stress e dicas para soar mais natural.",
    tip: "Entonação muda o sentido: perguntas sobem no final, afirmações caem. O stress da palavra também importa.",
    vocab: ["Stress", "Intonation", "Reduced forms", "Connected speech", "Rhythm", "Fluent", "Natural", "Pause", "Emphasis", "Sentence stress"],
    pool: [
        { type: "sel", q: "O que é 'intonation'?", opts: ["Entonação", "Tradução", "Correção", "Acento visual"], a: "Entonação" },
        { type: "sel", q: "O que é 'stress' em pronúncia?", opts: ["Sílaba tônica", "Estresse emocional", "Erro", "Tom de voz"], a: "Sílaba tônica" },
        { type: "sel", q: "Qual frase é mais natural em fala rápida?", opts: ["I am going to", "I am gonna", "I gonna am", "Going I am to"], a: "I am going to" },
        { type: "sel", q: "Qual pergunta costuma subir a entonação no final?", opts: ["Are you coming?", "He came yesterday.", "She works here.", "It is raining."], a: "Are you coming?" },
        { type: "sel", q: "Qual palavra tem o stress em 'PREsent' (substantivo)?", opts: ["Primeira sílaba", "Segunda sílaba", "Terceira sílaba", "Nenhuma"], a: "Primeira sílaba" },
        { type: "sel", q: "Qual palavra tem o stress em 'preSENT' (verbo)?", opts: ["Primeira sílaba", "Segunda sílaba", "Terceira sílaba", "Nenhuma"], a: "Segunda sílaba" },
        { type: "sel", q: "Qual frase mostra uma pausa natural?", opts: ["Well, I think we should go", "WellIthinkweshouldgo", "Well I think we should go no pause", "Well think I should go"], a: "Well, I think we should go" },
        { type: "sel", q: "Qual forma reduzida é comum na fala?", opts: ["I'm", "I am", "I be", "I was"], a: "I'm" },
        { type: "sel", q: "Qual frase está correta?", opts: ["Could you help me?", "Could you help me!", "Could you help me.", "Could you help me"], a: "Could you help me?" },
        { type: "sel", q: "Qual palavra recebe mais ênfase normalmente?", opts: ["Conteúdo-chave", "Artigo", "Preposição", "Artigo definido"], a: "Conteúdo-chave" },
        { type: "sel", q: "Qual frase soa mais natural?", opts: ["What are you doing?", "What you are doing?", "Doing what are you?", "What doing are you?"], a: "What are you doing?" },
        { type: "sel", q: "Qual dica ajuda a soar mais natural?", opts: ["Usar ritmo e pausas", "Falar tudo igual", "Evitar entonação", "Não respirar"], a: "Usar ritmo e pausas" },

        { type: "match", pairs: { "Entonação": "Intonation", "Stress": "Stress", "Fala conectada": "Connected speech", "Ritmo": "Rhythm" } },
        { type: "match", pairs: { "Forma reduzida": "Reduced form", "Ênfase": "Emphasis", "Pausa": "Pause", "Natural": "Natural" } },
        { type: "match", pairs: { "Fluente": "Fluent", "Frase": "Sentence", "Tônica": "Stressed syllable", "Pronúncia": "Pronunciation" } },

        { type: "assemble", q: "Você pode me ajudar?", words: ["Could", "you", "help", "me"], a: ["Could you help me?"] },
        { type: "assemble", q: "Eu estou indo para casa", words: ["I", "am", "going", "home"], a: ["I am going home"] },
        { type: "assemble", q: "Bem, eu acho que sim", words: ["Well", "I", "think", "so"], a: ["Well, I think so"] },
        { type: "assemble", q: "O que você está fazendo?", words: ["What", "are", "you", "doing"], a: ["What are you doing?"] },
        { type: "assemble", q: "Ele está chegando", words: ["He's", "coming"], a: ["He's coming"] },

        { type: "write", target: "pt", q: "I am going to", a: ["Eu vou", "Eu estou indo para"] },
        { type: "write", target: "en", q: "Eu vou te ajudar", a: ["I will help you", "I'm going to help you"] },
        { type: "write", target: "pt", q: "What are you doing?", a: ["O que você está fazendo?"] },
        { type: "write", target: "en", q: "Eu acho que sim", a: ["I think so"] },
        { type: "write", target: "pt", q: "He is coming", a: ["Ele está vindo"] },

        { type: "listen", target: "pt", q: "Could you help me?", a: ["Você pode me ajudar?"] },
        { type: "listen", target: "en", q: "What are you doing?", a: ["What are you doing?"] },
        { type: "listen", target: "pt", q: "I think so", a: ["Eu acho que sim"] }
    ]
},
59: {
    title: "Simulação Real Oficial",
    icon: "briefcase",
    desc: "Entrevistas, negociações, reclamações e situações reais.",
    tip: "Use respostas curtas, claras e educadas. Em situações reais, simplicidade vence enrolação.",
    vocab: ["Interview", "Strengths", "Weaknesses", "Salary", "Deadline", "Contract", "Negotiate", "Polite", "Requirement", "Experience"],
    pool: [
        { type: "sel", q: "Como responder em uma entrevista: 'Tell me about yourself'?", opts: ["I am a hard-working person with experience", "I like pizza and sleep", "I don't know", "Bye"], a: "I am a hard-working person with experience" },
        { type: "sel", q: "Qual palavra significa 'salário'?", opts: ["Salary", "Safety", "Supply", "Summary"], a: "Salary" },
        { type: "sel", q: "Qual palavra significa 'requisito'?", opts: ["Requirement", "Recruitment", "Reminder", "Recovery"], a: "Requirement" },
        { type: "sel", q: "Qual frase é melhor em negociação?", opts: ["Could we lower the price?", "Give me now", "I want cheap now", "Do it or leave"], a: "Could we lower the price?" },
        { type: "sel", q: "Qual resposta é boa para força pessoal?", opts: ["I am very organized", "I am very sleep", "I am very late", "I am very broken"], a: "I am very organized" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I have experience in customer service", "I am experience in customer service", "I experience have in customer service", "I have customer service experience in"], a: "I have experience in customer service" },
        { type: "sel", q: "Qual frase é educada para pedir repetição?", opts: ["Could you repeat that, please?", "Say again now", "Repeat!", "What?"], a: "Could you repeat that, please?" },
        { type: "sel", q: "Qual frase é boa para entrevista?", opts: ["My biggest strength is problem-solving", "My biggest strength is sleeping", "My biggest strength is eating", "My biggest strength is gaming"], a: "My biggest strength is problem-solving" },
        { type: "sel", q: "Qual frase está correta?", opts: ["The deadline is tight", "The deadline is tighted", "Deadline the tight is", "The deadline tight is"], a: "The deadline is tight" },
        { type: "sel", q: "Qual frase é mais profissional?", opts: ["I would appreciate your feedback", "Gimme your thoughts bro", "Send me now", "Tell me quick"], a: "I would appreciate your feedback" },
        { type: "sel", q: "Qual frase ajuda a negociar?", opts: ["Would you consider a discount?", "Do discount now", "I want lower", "No pay"], a: "Would you consider a discount?" },
        { type: "sel", q: "Qual frase é útil em reclamação educada?", opts: ["I'm sorry, but there seems to be a problem", "This is bad fix now", "You messed up", "No good"], a: "I'm sorry, but there seems to be a problem" },

        { type: "match", pairs: { "Entrevista": "Interview", "Pontos fortes": "Strengths", "Pontos fracos": "Weaknesses", "Salário": "Salary" } },
        { type: "match", pairs: { "Prazo": "Deadline", "Contrato": "Contract", "Negociar": "Negotiate", "Experiência": "Experience" } },
        { type: "match", pairs: { "Educado": "Polite", "Requisito": "Requirement", "Reclamação": "Complaint", "Resposta": "Response" } },

        { type: "assemble", q: "Eu tenho experiência em atendimento ao cliente", words: ["I", "have", "experience", "in", "customer", "service"], a: ["I have experience in customer service"] },
        { type: "assemble", q: "Você poderia repetir, por favor?", words: ["Could", "you", "repeat", "that", "please"], a: ["Could you repeat that, please?"] },
        { type: "assemble", q: "Meu ponto forte é resolver problemas", words: ["My", "biggest", "strength", "is", "problem-solving"], a: ["My biggest strength is problem-solving"] },
        { type: "assemble", q: "Poderíamos reduzir o preço?", words: ["Could", "we", "lower", "the", "price"], a: ["Could we lower the price?"] },
        { type: "assemble", q: "Houve um problema com o contrato", words: ["There", "was", "a", "problem", "with", "the", "contract"], a: ["There was a problem with the contract"] },

        { type: "write", target: "en", q: "Eu gostaria de trabalhar com sua equipe", a: ["I would like to work with your team"] },
        { type: "write", target: "pt", q: "Could we lower the price?", a: ["Poderíamos reduzir o preço?"] },
        { type: "write", target: "en", q: "Eu sou organizado e responsável", a: ["I am organized and responsible"] },
        { type: "write", target: "pt", q: "The deadline is tight", a: ["O prazo está apertado"] },
        { type: "write", target: "en", q: "Estou interessado na vaga", a: ["I am interested in the position"] },

        { type: "listen", target: "pt", q: "I would appreciate your feedback", a: ["Eu apreciaria seu retorno", "Eu gostaria de receber seu feedback"] },
        { type: "listen", target: "en", q: "Could you repeat that, please?", a: ["Could you repeat that, please?"] },
        { type: "listen", target: "pt", q: "I have experience in customer service", a: ["Eu tenho experiência em atendimento ao cliente"] }
    ]
},
60: {
    title: "Desafio Supremo",
    icon: "crown",
    desc: "Revisão final integrada com leitura, escuta, escrita e interpretação avançada.",
    tip: "Aqui você combina tudo: nuance, gramática, vocabulário, lógica e naturalidade.",
    vocab: ["Integrated", "Mastery", "Inference", "Nuance", "Review", "Challenge", "Accuracy", "Fluency", "Evidence", "Context"],
    pool: [
        { type: "sel", q: "Qual frase é mais natural?", opts: ["I am looking forward to it", "I am looking it forward to", "I forward looking to it", "I looking forward am to it"], a: "I am looking forward to it" },
        { type: "sel", q: "Qual frase está correta?", opts: ["If I had known, I would have called you", "If I knew, I would have called you", "If I had know, I would call you", "If I have known, I would have called you"], a: "If I had known, I would have called you" },
        { type: "sel", q: "Qual frase está correta?", opts: ["The report was being reviewed", "The report reviewed was being", "The report was reviewing", "The report is being revieweded"], a: "The report was being reviewed" },
        { type: "sel", q: "Qual expressão é mais natural?", opts: ["No worries", "No worrying", "No worrys", "Not worries"], a: "No worries" },
        { type: "sel", q: "Qual frase está correta?", opts: ["She asked where I lived", "She asked where did I live", "She asked where I live yesterday", "She asked where I am live"], a: "She asked where I lived" },
        { type: "sel", q: "Qual frase está correta?", opts: ["I had my hair cut yesterday", "I cut my hair had yesterday", "I have cut my hair yesterday by", "I had cutted my hair yesterday"], a: "I had my hair cut yesterday" },
        { type: "sel", q: "Qual expressão mostra cautela?", opts: ["Perhaps", "Definitely", "Absolutely", "Certainly"], a: "Perhaps" },
        { type: "sel", q: "Qual conector mostra contraste?", opts: ["However", "Therefore", "Moreover", "Furthermore"], a: "However" },
        { type: "sel", q: "Qual frase está correta?", opts: ["He ran out of time", "He ran time out of", "He out of ran time", "He run out time"], a: "He ran out of time" },
        { type: "sel", q: "Qual frase é correta?", opts: ["I enjoy studying English", "I enjoy study English", "I enjoy to study English", "I enjoy to studying English"], a: "I enjoy studying English" },
        { type: "sel", q: "Qual frase é melhor para feedback formal?", opts: ["Could you please clarify this point?", "Yo, explain this now", "Tell me this quick", "Fix this for me dude"], a: "Could you please clarify this point?" },
        { type: "sel", q: "Qual palavra indica conclusão?", opts: ["Therefore", "Although", "Despite", "Unless"], a: "Therefore" },

        { type: "match", pairs: { "Compreensão": "Comprehension", "Inferência": "Inference", "Nuance": "Nuance", "Revisão": "Review" } },
        { type: "match", pairs: { "Desafio": "Challenge", "Precisão": "Accuracy", "Fluência": "Fluency", "Contexto": "Context" } },
        { type: "match", pairs: { "Evidência": "Evidence", "Integração": "Integrated", "Mestria": "Mastery", "Conclusão": "Conclusion" } },

        { type: "assemble", q: "Eu gostaria de ter mais tempo", words: ["I", "wish", "I", "had", "more", "time"], a: ["I wish I had more time"] },
        { type: "assemble", q: "O relatório foi enviado ontem", words: ["The", "report", "was", "sent", "yesterday"], a: ["The report was sent yesterday"] },
        { type: "assemble", q: "Nós ficamos sem água", words: ["We", "ran", "out", "of", "water"], a: ["We ran out of water"] },
        { type: "assemble", q: "No entanto, eu entendo o problema", words: ["However", "I", "understand", "the", "problem"], a: ["However, I understand the problem"] },
        { type: "assemble", q: "A evidência apoia a ideia", words: ["The", "evidence", "supports", "the", "idea"], a: ["The evidence supports the idea"] },
        { type: "assemble", q: "Eu tive meu quarto pintado", words: ["I", "had", "my", "room", "painted"], a: ["I had my room painted"] },
        { type: "assemble", q: "Talvez ele já tenha ido embora", words: ["Perhaps", "he", "has", "already", "left"], a: ["Perhaps he has already left"] },

        { type: "write", target: "pt", q: "I had my room painted", a: ["Eu mandei pintar meu quarto"] },
        { type: "write", target: "en", q: "A pesquisa foi realizada com cuidado", a: ["The research was carried out carefully"] },
        { type: "write", target: "pt", q: "The evidence supports the claim", a: ["A evidência apoia a afirmação"] },
        { type: "write", target: "en", q: "Talvez ele já tenha ido embora", a: ["Perhaps he has already left"] },
        { type: "write", target: "pt", q: "Could you please clarify this point?", a: ["Você poderia esclarecer este ponto, por favor?"] },
        { type: "write", target: "en", q: "Estou pronto para o desafio final", a: ["I am ready for the final challenge"] },

        { type: "listen", target: "pt", q: "I wish I had more time", a: ["Eu gostaria de ter mais tempo"] },
        { type: "listen", target: "en", q: "The report was sent yesterday", a: ["The report was sent yesterday"] },
        { type: "listen", target: "pt", q: "Could you please clarify this point?", a: ["Você poderia esclarecer este ponto, por favor?"] }
    ]
            }
        } // end levels
    }; // end DB

    // ==========================================
    // CORE APP LOGIC
    // ==========================================
    const app = {
        state: {
            user: lsGet('nova_user') || '',
            xp: lsInt('nova_xp', 0),
            lives: Math.max(0, Math.min(MAX_LIVES, lsInt('nova_lives', MAX_LIVES))),
            livesTs: lsInt('nova_lives_ts', 0),
            studySeen: lsJSON('nova_study', []),
            answered: false,
            unlocked: lsJSON('nova_unlocked', [1]),
            // persistent completed levels — used to show crowns and true "completed" state
            completed: lsJSON('nova_completed', []),
            
            // Streak
            streak: lsInt('nova_streak', 0),
            lastPlayed: lsGet('nova_lastPlayed') || '',
            
            // Lesson State
            mode: 'campaign', // 'campaign', 'solo', 'multi'
            curLevel: null,
            pool: [],
            curIndex: 0,
            corrects: 0,
            
            // Interaction States
            selectedOpt: null,
            assembledWords: [],
            match: { left: null, right: null, matchedKeys: [] },
            
            // Multi State
            multi: { players: [], currPlayerIdx: 0, maxRounds: 5, currRound: 1 },
            
            // Missed-Question Repeat Flow
            missedQuestions: [],        // store missed question objects to repeat at end
            missedOccurred: false,      // flag to indicate at least one miss happened this lesson
            lessonOriginalLength: 0,    // number of questions of the original lesson (before repeats)
            isRepeatPhase: false        // true when we are running the repeat pass
        },

        init() {
            icons();
            // migração de saves antigos: níveis abaixo do mais alto desbloqueado contam como concluídos
            if (!this.state.completed.length && this.state.unlocked.length) {
                const mx = Math.max(...this.state.unlocked);
                this.state.completed = Object.keys(DB.levels).map(Number).filter(n => n < mx);
            }
            this.regenLives();
            setInterval(() => { this.regenLives(); this.updateHUD(); }, 30000);
            ['inp-name', 'inp-player'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.addEventListener('keydown', e => {
                    if (e.key !== 'Enter') return;
                    if (id === 'inp-name') this.createUser(); else this.addPlayer();
                });
            });
            this.applySoundLabel();
            this.calculateStreak();

            // Welcome intro flow: animate title/sub in, then fade them out and reveal the form with the Start button beneath the name input
            const showForm = () => {
                const head = document.getElementById('welcome-head');
                const form = document.getElementById('welcome-form');
                const startBtn = document.getElementById('btn-start-welcome');

                // fade out title and subtitle with animation classes
                if(head) {
                    const title = document.getElementById('welcome-title');
                    const sub = document.getElementById('welcome-sub');
                    if(title) title.classList.add('welcome-hide');
                    if(sub) sub.classList.add('welcome-hide');
                }

                // after the title/sub exit animations finish, reveal the form and the start button
                setTimeout(() => {
                    if(form) form.classList.add('show');
                    // animate start button into view a touch later for a pleasant sequence
                    setTimeout(() => {
                        if(startBtn) startBtn.classList.add('show');
                        try { document.getElementById('inp-name').focus(); } catch(e){}
                    }, 180);
                }, 460); // matches titleOut/subOut timings for smoothness
            };

            // Title/sub already animate in via CSS; keep them visible briefly then reveal a nicer intro animation before showing the form
            // show overlay for 1800ms then fade it out and either reveal the form or transition directly to the home screen for returning users
            setTimeout(() => {
                const overlay = document.getElementById('intro-overlay');
                if (overlay) {
                    overlay.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    overlay.style.opacity = '0';
                    overlay.style.transform = 'translateY(-18px)';
                    setTimeout(() => {
                        overlay.style.display = 'none';
                        // If user is already known, go straight to home with a short transition, otherwise reveal the name form
                        if (this.state.user) {
                            // ensure HUD is up to date, then transition to home
                            this.updateHUD();
                            // small visual pause so fade feels smooth before screen change
                            setTimeout(() => this.switchScreen('home'), 160);
                        } else {
                            showForm();
                        }
                    }, 620);
                } else {
                    if (this.state.user) {
                        this.updateHUD();
                        setTimeout(() => this.switchScreen('home'), 160);
                    } else {
                        showForm();
                    }
                }
            }, 1800);

            // If user already exists, just update HUD (navigation handled in the intro-overlay transition)
            if(this.state.user) {
                this.updateHUD();
            }
        },

        dayMid(v) {
            let d;
            if (/^\d{4}-\d{2}-\d{2}$/.test(v)) { const [y, m, dd] = v.split('-').map(Number); d = new Date(y, m - 1, dd); }
            else d = new Date(v);
            if (isNaN(d)) return null;
            d.setHours(0, 0, 0, 0);
            return d;
        },
        dayKey(d) {
            const p = n => String(n).padStart(2, '0');
            return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
        },
        calculateStreak() {
            const last = this.dayMid(this.state.lastPlayed);
            if (last) {
                const today = this.dayMid(new Date().toString());
                const diff = Math.round((today - last) / 86400000);
                if (diff > 1) { this.state.streak = 0; lsSet('nova_streak', 0); }
            }
            this.updateHUD();
        },

        updateStreakOnWin() {
            const todayKey = this.dayKey(new Date());
            const last = this.dayMid(this.state.lastPlayed);
            if (!last) {
                this.state.streak = 1;
            } else {
                const diff = Math.round((this.dayMid(todayKey) - last) / 86400000);
                if (diff === 0) return;
                this.state.streak = diff === 1 ? (this.state.streak || 0) + 1 : 1;
            }
            this.state.lastPlayed = todayKey;
            lsSet('nova_lastPlayed', todayKey);
            this.save();
            this.updateHUD();
        },

        save() {
            lsSet('nova_xp', String(this.state.xp));
            lsSet('nova_lives', String(this.state.lives));
            lsSet('nova_streak', String(this.state.streak));
            lsSet('nova_unlocked', JSON.stringify(this.state.unlocked));
            lsSet('nova_completed', JSON.stringify(this.state.completed));
            lsSet('nova_study', JSON.stringify(this.state.studySeen));
        },

        // Vidas: 1 vida volta a cada 15 minutos
        regenLives() {
            const st = this.state;
            if (st.lives >= MAX_LIVES) { st.livesTs = 0; lsSet('nova_lives_ts', '0'); return; }
            if (!st.livesTs) { st.livesTs = Date.now(); }
            const gained = Math.floor((Date.now() - st.livesTs) / LIFE_REGEN_MS);
            if (gained > 0) {
                st.lives = Math.min(MAX_LIVES, st.lives + gained);
                st.livesTs = st.lives >= MAX_LIVES ? 0 : st.livesTs + gained * LIFE_REGEN_MS;
            }
            lsSet('nova_lives_ts', String(st.livesTs));
            lsSet('nova_lives', String(st.lives));
        },
        minutesToLife() {
            if (!this.state.livesTs) return Math.round(LIFE_REGEN_MS / 60000);
            return Math.max(1, Math.ceil((this.state.livesTs + LIFE_REGEN_MS - Date.now()) / 60000));
        },
        loseLife() {
            if (this.state.lives >= MAX_LIVES) this.state.livesTs = Date.now();
            this.state.lives = Math.max(0, this.state.lives - 1);
            lsSet('nova_lives_ts', String(this.state.livesTs));
            this.updateHUD();
        },

        toggleSound() {
            lsSet('nova_sound', lsGet('nova_sound') === 'off' ? 'on' : 'off');
            this.applySoundLabel();
            AudioEngine.play('click');
        },
        applySoundLabel() {
            const b = document.getElementById('btn-sound');
            if (b) b.innerText = lsGet('nova_sound') === 'off' ? 'Desligado' : 'Ligado';
        },
        confirmReset() {
            this.Modal.show({
                title: "Apagar progresso?", desc: "Isso remove seu nome, XP, níveis e ofensiva. Não dá para desfazer.",
                icon: "trash-2", iconColor: "var(--rose-500)",
                actions: [
                    { text: "Cancelar", class: "btn-ghost" },
                    { text: "Apagar tudo", class: "btn-danger", onClick: () => {
                        try { Object.keys(localStorage).filter(k => k.indexOf('nova_') === 0 && k !== 'nova_theme').forEach(k => localStorage.removeItem(k)); } catch (e) {}
                        location.reload();
                    }}
                ]
            });
        },

        // small helpers
        capitalize(name) {
            if(!name) return '';
            const s = name.trim();
            return s.charAt(0).toUpperCase() + s.slice(1);
        },

        // --- CUSTOM MODALS ---
        Modal: {
            show({ title, desc, icon, iconColor, actions }) {
                const overlay = document.getElementById('custom-modal');
                document.getElementById('modal-title').innerText = title;
                document.getElementById('modal-desc').innerHTML = desc;
                
                const iconBox = document.getElementById('modal-icon');
                iconBox.style.background = iconColor;
                iconBox.style.boxShadow = `0 10px 20px ${iconColor}66`;
                iconBox.innerHTML = `<i data-lucide="${icon}" size="40"></i>`;
                
                const actionsBox = document.getElementById('modal-actions');
                actionsBox.innerHTML = '';
                
                actions.forEach(act => {
                    const btn = document.createElement('button');
                    btn.className = `btn ${act.class || 'btn-primary'}`;
                    btn.innerText = act.text;
                    btn.onclick = () => {
                        this.hide(act.onClick);
                    };
                    actionsBox.appendChild(btn);
                });

                icons();
                overlay.style.display = 'flex';
                // Trigger reflow
                void overlay.offsetWidth;
                overlay.classList.add('active');
            },
            hide(callback) {
                const overlay = document.getElementById('custom-modal');
                overlay.classList.add('closing');
                setTimeout(() => {
                    overlay.classList.remove('active', 'closing');
                    overlay.style.display = 'none';
                    if(callback) callback();
                }, 300);
            }
        },

        switchScreen(id) {
            const currentActive = document.querySelector('.screen.active');
            
            // If leaving profile, smoothly scroll its content to top for a cleaner exit
            if (currentActive && currentActive.id === 'scr-profile') {
                const scrollEl = currentActive.querySelector('.scrollable');
                if (scrollEl) {
                    try { scrollEl.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { scrollEl.scrollTop = 0; }
                }
            }

            const activateNew = () => {
                document.querySelectorAll('.screen').forEach(s => { s.classList.remove('active', 'fade-out'); s.style.display = 'none'; });
                const target = document.getElementById(`scr-${id}`);
                target.style.display = 'flex';
                void target.offsetWidth; 
                target.classList.add('active');
                
                if(id === 'home') this.renderMap();
                if(id === 'profile') this.renderProfile();
                
                // If entering profile, smoothly scroll its main content to top for consistent start
                if (id === 'profile') {
                    const scrollEl = target.querySelector('.scrollable');
                    if (scrollEl) {
                        // slight delay to ensure layout/render completed before scrolling
                        setTimeout(() => {
                            try { scrollEl.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { scrollEl.scrollTop = 0; }
                        }, 80);
                    }
                }
                
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                const navItems = document.querySelectorAll('.bottom-nav .nav-item');
                navItems.forEach(n => {
                    if(n.dataset.tab === id) n.classList.add('active');
                });
                icons();
            };

            if (currentActive && currentActive.id !== `scr-${id}`) {
                currentActive.classList.add('fade-out');
                setTimeout(activateNew, 200); // Wait for fade out
            } else {
                activateNew();
            }
        },

        createUser() {
            AudioEngine.init();
            const name = document.getElementById('inp-name').value.trim();
            if(name.length < 2) {
                this.Modal.show({ title: "Nome inválido", desc: "Digite um apelido com pelo menos 2 letras para continuarmos.", icon: "alert-circle", iconColor: "var(--amber-500)", actions: [{ text: "Ok, entendi" }] });
                return;
            }
            this.state.user = name;
            localStorage.setItem('nova_user', name);
            this.updateHUD();
            this.switchScreen('home');
        },

        updateHUD() {
            // safe setter to avoid null element errors during early init or when some HUD pieces are intentionally removed
            const setIf = (id, value) => {
                const el = document.getElementById(id);
                if (!el) return;
                el.innerText = value;
            };

            setIf('hud-name', this.capitalize(this.state.user));
            setIf('hud-xp', this.state.xp);
            setIf('hud-lives', this.state.lives);
            setIf('hud-streak', this.state.streak);
            
            this.save();
            lsSet('nova_lives_zero', Number(this.state.lives) === 0 ? '1' : '0');

            const streakBox = document.getElementById('hud-streak-box');
            const streakNum = document.getElementById('hud-streak');
            if (streakBox) {
                if(this.state.streak > 0) {
                    streakBox.style.background = 'linear-gradient(135deg, var(--rose-400), var(--orange-500))';
                    // keep container text legible but enforce the number to be orange
                    streakBox.style.color = 'white';
                    if (streakNum) streakNum.style.color = 'var(--amber-400)';
                } else {
                    // subtle amber grounding when zero
                    streakBox.style.background = 'linear-gradient(135deg, rgba(251,191,36,0.06), rgba(251,191,36,0.03))';
                    streakBox.style.color = 'var(--amber-500)';
                    if (streakNum) streakNum.style.color = 'var(--amber-400)';
                }
            }
        },

        renderMap() {
            const container = document.getElementById('map-area');
            const frag = document.createDocumentFragment();
            const st = this.state;

            DB.leagues.forEach(league => {
                const bannerWrap = document.createElement('div');
                bannerWrap.className = 'node-wrapper league-banner-wrapper';
                bannerWrap.innerHTML = `
                    <div class="league-banner" style="background: ${league.color};">
                        ${league.name}
                        <div style="font-size:0.85rem; font-weight:800; opacity:0.9; margin-top:4px;">Níveis ${league.range[0]} - ${league.range[1]}</div>
                    </div>
                `;
                frag.appendChild(bannerWrap);

                for (let i = league.range[0]; i <= league.range[1]; i++) {
                    const data = DB.levels[i];
                    if (!data) continue;
                    const isUnlocked = st.unlocked.includes(i);
                    const isCompleted = st.completed.includes(i);
                    const statusClass = !isUnlocked ? 'locked' : (isCompleted ? 'completed' : 'active');

                    const wrapper = document.createElement('div');
                    wrapper.className = 'node-wrapper';
                    wrapper.innerHTML = `
                        <div class="node ${statusClass}" onclick="app.openLevelIntro(${i})" aria-label="Nível ${i}: ${esc(data.title)}">
                            <i data-lucide="crown" class="node-crown" size="28" fill="currentColor"></i>
                            <div class="node-inner">
                                <i data-lucide="${isUnlocked ? data.icon : 'lock'}" size="38"></i>
                            </div>
                        </div>
                    `;
                    frag.appendChild(wrapper);

                    // Subnível de estudo entre este nível e o próximo
                    if (DB.levels[i + 1]) {
                        const open = isCompleted;
                        const seen = st.studySeen.includes(i + 1);
                        const sw = document.createElement('div');
                        sw.className = 'node-wrapper study-wrapper';
                        sw.innerHTML = `
                            <div class="study-node ${open ? (seen ? 'seen' : '') : 'locked'}" onclick="app.openStudy(${i + 1})" aria-label="Estudo para o nível ${i + 1}">
                                <div class="study-dot"><i data-lucide="${open ? (seen ? 'check' : 'book-open') : 'lock'}" size="24"></i></div>
                                <div class="study-label">Estudo</div>
                            </div>
                        `;
                        frag.appendChild(sw);
                    }
                }
            });

            container.innerHTML = '';
            container.appendChild(frag);
            icons();

            setTimeout(() => {
                const target = container.querySelector('.node.active') || container.querySelector('.node.completed:last-of-type');
                const study = container.querySelector('.study-node:not(.locked):not(.seen)');
                const el = study || target;
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        },

        // --- SUBNÍVEL DE ESTUDO: só mostra frases e exemplos do próximo nível ---
        buildStudy(levelId) {
            const L = DB.levels[levelId];
            const out = [], seen = new Set();
            const add = (en, pt) => {
                if (!en || !pt) return;
                const k = this.normalizeStr(en);
                if (seen.has(k)) return;
                seen.add(k); out.push({ en, pt });
            };
            const pool = L.pool || [];
            pool.filter(q => q.type === 'assemble').forEach(q => add(q.a[0], q.q));
            pool.filter(q => q.type === 'write' && q.target === 'en').forEach(q => add(q.a[0], q.q));
            pool.filter(q => (q.type === 'write' || q.type === 'listen') && q.target === 'pt').forEach(q => add(q.q, q.a[0]));
            return out.slice(0, 8);
        },

        openStudy(levelId) {
            if (!this.state.completed.includes(levelId - 1)) {
                this.Modal.show({ title: "Estudo bloqueado", desc: `Conclua o nível ${levelId - 1} para liberar as frases do nível ${levelId}.`, icon: "lock", iconColor: "var(--slate-500)", actions: [{ text: "Entendi" }] });
                return;
            }
            const L = DB.levels[levelId];
            this.state.studyFor = levelId;
            document.getElementById('study-sub').innerText = `Estudo para o nível ${levelId}`;
            document.getElementById('study-title').innerText = L.title;
            document.getElementById('study-tip').innerText = L.tip;
            document.getElementById('study-vocab').innerHTML = (L.vocab || []).map(v => `<span class="vocab-tag speak" data-say="${esc(v)}" onclick="app.playTTS(this.dataset.say)">${esc(v)}</span>`).join('');
            document.getElementById('study-phrases').innerHTML = this.buildStudy(levelId).map(p => `
                <div class="study-card">
                    <div><div class="en">${esc(p.en)}</div><div class="pt">${esc(p.pt)}</div></div>
                    <button aria-label="Ouvir" data-say="${esc(p.en)}" onclick="app.playTTS(this.dataset.say)"><i data-lucide="volume-2" size="22"></i></button>
                </div>`).join('');
            const go = document.getElementById('study-go');
            go.innerHTML = `Ir para o nível ${levelId} <i data-lucide="play"></i>`;
            go.onclick = () => this.openLevelIntro(levelId);
            if (!this.state.studySeen.includes(levelId)) { this.state.studySeen.push(levelId); this.save(); }
            this.switchScreen('study');
        },

        renderProfile() {
            const st = this.state;
            document.getElementById('prof-name').innerText = this.capitalize(st.user);
            document.getElementById('prof-initial').innerText = st.user ? this.capitalize(st.user).charAt(0) : '';
            document.getElementById('prof-xp-val').innerText = st.xp;
            document.getElementById('prof-streak-val').innerText = st.streak;
            document.getElementById('prof-lvl-val').innerText = st.completed.length;

            const maxLevel = st.unlocked.length ? Math.max(...st.unlocked) : 1;
            const currentLeague = DB.leagues.find(l => maxLevel >= l.range[0] && maxLevel <= l.range[1]) || DB.leagues[0];
            const size = currentLeague.range[1] - currentLeague.range[0] + 1;
            const done = st.completed.filter(n => n >= currentLeague.range[0] && n <= currentLeague.range[1]).length;
            const perc = Math.max(0, Math.min(100, Math.round((done / size) * 100)));

            document.getElementById('prof-league').innerText = currentLeague.name;
            document.getElementById('prof-league-perc').innerText = `${perc}%`;
            const small = document.getElementById('prof-league-perc-small');
            if (small) small.innerText = `${perc}%`;
            const cur = document.getElementById('prof-current-league');
            if (cur) cur.innerText = currentLeague.name;
            document.getElementById('prof-bar').style.width = `${perc}%`;
            this.applySoundLabel();
        },

        openLevelIntro(id) {
            if(!this.state.unlocked.includes(id)) {
                this.Modal.show({ title: "Nível bloqueado", desc: "Termine os níveis anteriores pra desbloquear este.", icon: "lock", iconColor: "var(--slate-500)", actions: [{ text: "Entendi" }] });
                return;
            }
            this.state.curLevel = id;
            const data = DB.levels[id];
            
            // remove the colored icon box for a cleaner intro and hide its element
            document.getElementById('intro-icon').innerHTML = '';
            document.getElementById('intro-icon').style.display = 'none';

            document.getElementById('intro-subtitle').innerText = `Nível ${id}`;
            // show the level title in full uppercase to match the subtitle style
            document.getElementById('intro-title').innerText = data.title.toUpperCase();
            document.getElementById('intro-desc').innerText = data.desc;
            document.getElementById('intro-tip').innerText = data.tip;
            
            const vocabContainer = document.getElementById('intro-vocab');
            if(data.vocab && data.vocab.length > 0) {
                vocabContainer.innerHTML = data.vocab.map(v => `<span class="vocab-tag">${v}</span>`).join('');
                vocabContainer.parentElement.style.display = 'block';
            } else {
                vocabContainer.parentElement.style.display = 'none';
            }
            
            this.switchScreen('intro');
        },

        // --- MULTIPLAYER & PRACTICE LOGIC ---
        openMultiplayerSetup() {
            this.state.multi.players = [];
            this.renderPlayerList();
            this.switchScreen('multi-setup');
        },
        
        // Start a recovery lesson that replays the last missed question so the user can earn 1 life by answering it correctly.
        startRecoverMissed() {
            // pick the most recent missed question if available
            const missed = this.state.missedQuestions && this.state.missedQuestions.length ? this.state.missedQuestions[this.state.missedQuestions.length - 1] : null;
            let q = missed;
            if (!q) {
                let all = [];
                this.state.unlocked.forEach(l => { if (DB.levels[l]) all = all.concat(DB.levels[l].pool); });
                all = all.filter(x => x.type !== 'match');
                q = all[Math.floor(Math.random() * all.length)];
            }
            // Prepare a minimal lesson with that single missed question
            this.state.mode = 'recover';
            this.state.pool = [JSON.parse(JSON.stringify(q))];
            this.state.lessonOriginalLength = 1;
            document.getElementById('multi-indicator').style.display = 'none';
            this.state.curIndex = 0;
            this.state.corrects = 0;
            // flag to indicate this is a recovery attempt (so checks treat it specially)
            this.state.isRepeatPhase = false;
            this.state.recoverDone = false;
            this.switchScreen('lesson');
            this.renderQuestion();
        },

        addPlayer() {
            const inp = document.getElementById('inp-player');
            const name = inp.value.trim();
            if (!name) return;
            if (this.state.multi.players.length >= 8) {
                this.Modal.show({ title: "Limite de jogadores", desc: "O máximo é 8 jogadores por partida.", icon: "users", iconColor: "var(--amber-500)", actions: [{ text: "Ok" }] });
                return;
            }
            if (this.state.multi.players.find(p => p.name.toLowerCase() === name.toLowerCase())) {
                this.Modal.show({ title: "Nome repetido", desc: "Já existe um jogador com esse nome. Escolha outro.", icon: "alert-circle", iconColor: "var(--amber-500)", actions: [{ text: "Ok" }] });
                return;
            }
            this.state.multi.players.push({ name: name, score: 0 });
            inp.value = '';
            this.renderPlayerList();
        },

        removePlayer(name) {
            this.state.multi.players = this.state.multi.players.filter(p => p.name !== name);
            this.renderPlayerList();
        },

        renderPlayerList() {
            const list = document.getElementById('player-list');
            if(this.state.multi.players.length === 0) {
                list.innerHTML = `<div id="empty-players-msg" style="height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--slate-400); font-weight:800; text-align:center; gap:10px;"><i data-lucide="users-2" size="40"></i>Adicione ao menos 2 jogadores.</div>`;
            } else {
                list.innerHTML = this.state.multi.players.map(p => {
                    const displayName = this.capitalize(p.name);
                    return `
                    <div class="player-tag">
                        <span style="display:flex; align-items:center; gap:10px;"><i data-lucide="user" color="var(--indigo-500)"></i> ${esc(displayName)}</span>
                        <button class="btn-remove-player" aria-label="Remover" data-n="${esc(p.name)}" onclick="app.removePlayer(this.dataset.n)"><i data-lucide="x" size="20"></i></button>
                    </div>
                `}).join('');
            }
            document.getElementById('btn-start-multi').disabled = this.state.multi.players.length < 2;
            icons();
        },

        startPractice(mode) {
            AudioEngine.init();
            this.state.mode = mode;
            let allQuestions = [];
            
            this.state.unlocked.forEach(lvl => {
                if(DB.levels[lvl]) allQuestions = allQuestions.concat(DB.levels[lvl].pool);
            });
            
            if(allQuestions.length < 10) {
                this.Modal.show({ title: "Quase lá!", desc: "Explore um pouco mais a trilha e complete mais níveis para liberar a Arena.", icon: "swords", iconColor: "var(--amber-500)", actions: [{ text: "Voltar" }] });
                return;
            }

            if(mode === 'solo') {
                // Modo Foco garante 6 questões aleatórias únicas da pool desbloqueada inteira
                this.state.pool = this.shuffleArray(allQuestions).slice(0, 6);
                this.state.curIndex = 0;
                this.state.corrects = 0;
                this.state.curLevel = null;
                this.state.missedQuestions = [];
                this.state.isRepeatPhase = false;
                this.state.lessonOriginalLength = this.state.pool.length;
                document.getElementById('multi-indicator').style.display = 'none';
                this.switchScreen('lesson');
                this.renderQuestion();
            } else if(mode === 'multi') {
                const totalReq = this.state.multi.maxRounds * this.state.multi.players.length;
                if(allQuestions.length < totalReq) {
                    this.Modal.show({ 
                        title: "Poucas Missões", 
                        desc: `Seu grupo precisa de ${totalReq} questões para a partida completa, mas vocês só desbloquearam ${allQuestions.length}. Que tal jogar menos rodadas ou liberar mais da trilha?`, 
                        icon: "alert-triangle", iconColor: "var(--rose-500)", 
                        actions: [
                            { text: "Reduzir para 3 Rodadas", onClick: () => {
                                this.state.multi.maxRounds = 3;
                                this.startPractice('multi');
                            }},
                            { text: "Voltar", class: "btn-ghost" }
                        ] 
                    });
                    return;
                }
                
                this.state.multi.currPlayerIdx = 0;
                this.state.multi.currRound = 1;
                this.state.multi.players.forEach(p => p.score = 0);
                this.state.pool = this.shuffleArray(allQuestions).slice(0, totalReq);
                this.state.curIndex = 0;
                document.getElementById('multi-indicator').style.display = 'block';
                this.showMultiplayerTurnModal();
            }
        },

        showMultiplayerTurnModal() {
            const p = this.state.multi.players[this.state.multi.currPlayerIdx];
            const displayName = this.capitalize(p.name);
            document.getElementById('multi-curr-player').innerText = displayName;
            
            this.Modal.show({
                title: `Sua vez, ${displayName}!`,
                desc: `Rodada ${this.state.multi.currRound} de ${this.state.multi.maxRounds}.<br>Passe o dispositivo para <strong style="color:var(--text-main);">${esc(displayName)}</strong>.`,
                icon: "swords", iconColor: "var(--indigo-500)",
                actions: [{ text: "Estou Pronto!", onClick: () => {
                    this.switchScreen('lesson');
                    this.renderQuestion();
                }}]
            });
        },

        startLesson(mode) {
            AudioEngine.init();
            this.state.mode = mode;
            this.regenLives();
            this.updateHUD();
            if (this.state.lives <= 0) {
                this.Modal.show({
                    title: "Sem vidas",
                    desc: `Uma vida volta em cerca de ${this.minutesToLife()} min. Ou responda uma questão de revisão agora para ganhar 1 vida.`,
                    icon: "heart-crack", iconColor: "var(--rose-500)",
                    actions: [
                        { text: "Revisar e ganhar 1 vida", class: "btn-success", onClick: () => this.startRecoverMissed() },
                        { text: "Voltar", class: "btn-ghost" }
                    ]
                });
                return;
            }

            const rawPool = DB.levels[this.state.curLevel].pool;
            // Para lições, escolhe 6 não repetidas daquele level. Se for menor que 6, repete. (Mas nós criamos pools grandes o suficiente)
            this.state.pool = this.shuffleArray(rawPool).slice(0, 6);
            this.state.curIndex = 0;
            this.state.corrects = 0;
            document.getElementById('multi-indicator').style.display = 'none';
            
            // Initialize missed-question tracking for this lesson
            this.state.missedQuestions = [];
            this.state.missedOccurred = false;
            this.state.lessonOriginalLength = this.state.pool.length;
            this.state.isRepeatPhase = false;
            
            this.switchScreen('lesson');
            this.renderQuestion();
        },

        shuffleArray(array) {
            let arr = [...array];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        },

        renderQuestion() {
            const q = this.state.pool[this.state.curIndex];
            const area = document.getElementById('q-area');
            const btnCheck = document.getElementById('btn-check');
            const progress = document.getElementById('lesson-progress');
            const sheet = document.getElementById('fb-sheet');
            
            // Reseta Estados Interativos
            this.state.selectedOpt = null;
            this.state.assembledWords = [];
            this.state.match = { left: null, right: null, matchedKeys: [], wrongCnt: 0 };
            this.state.answered = false;
            
            btnCheck.disabled = true;
            btnCheck.className = 'btn btn-primary';
            btnCheck.innerText = 'Verificar';
            btnCheck.onclick = () => this.checkAnswer();
            sheet.classList.remove('active', 'success', 'error');
            
            // Progress bar calc
            let perc = (this.state.curIndex / this.state.pool.length) * 100;
            progress.style.width = `${perc}%`;

            let html = ``;
            
            // Instrução de Topo Customizada por Tipo
            const instrucoes = {
                'en': `<div class="q-instruction"><i data-lucide="flag"></i> Traduza para o Inglês</div>`,
                'pt': `<div class="q-instruction"><i data-lucide="flag"></i> Traduza para o Português</div>`,
                'sel': `<div class="q-instruction"><i data-lucide="help-circle"></i> Escolha a opção correta</div>`,
                'assemble': `<div class="q-instruction"><i data-lucide="puzzle"></i> Monte a frase correta</div>`,
                'match': `<div class="q-instruction"><i data-lucide="git-commit"></i> Combine os Pares Corretos</div>`
            };
            
            html += (q.type === 'listen' && q.target === 'en') ? `<div class="q-instruction"><i data-lucide="headphones"></i> Escreva o que você ouviu</div>` : (instrucoes[q.target] || instrucoes[q.type] || '');

            // Título Visual
            if(q.type === 'listen') {
                html += `<h2 class="q-title" style="color:var(--indigo-500);"><i data-lucide="headphones" size="32" style="vertical-align: middle;"></i> Ouça com atenção...</h2>`;
            } else if (q.type !== 'match') {
                html += `<h2 class="q-title">${esc(q.q)}</h2>`;
            } else {
                html += `<h2 class="q-title" style="font-size:1.4rem; color:var(--slate-500);">Toque nos pares que se correspondem.</h2>`;
            }

            // Lógica Específica de Renderização
            if(q.type === 'sel') {
                html += `<div class="opt-grid">`;
                // shuffle options each time the question is rendered so order is unpredictable
                const opts = this.shuffleArray(q.opts || []);
                opts.forEach(opt => {
                    html += `<div class="opt-card" data-val="${esc(opt)}" onclick="app.selectOption(this, this.dataset.val)">
                                <div class="opt-check"></div>${esc(opt)}
                             </div>`;
                });
                html += `</div>`;
            } 
            else if(q.type === 'write') {
                html += `<textarea class="type-area" id="inp-write" placeholder="Escreva sua resposta aqui..." oninput="app.handleInput(this)"></textarea>`;
            }
            else if(q.type === 'listen') {
                html += `
                    <button class="audio-btn" id="btn-audio" data-say="${esc(q.q)}" onclick="app.playTTS(this.dataset.say)">
                        <i data-lucide="volume-2" size="50"></i>
                    </button>
                    <textarea class="type-area" id="inp-write" placeholder="Escreva a tradução..." oninput="app.handleInput(this)"></textarea>
                `;
                setTimeout(() => this.playTTS(q.q), 400);
            }
            else if(q.type === 'assemble') {
                const shuffledWords = this.shuffleArray(q.words);
                html += `<div class="assemble-area" id="assemble-target"></div>`;
                html += `<div class="assemble-bank" id="assemble-source">`;
                shuffledWords.forEach((w, idx) => {
                    html += `<button class="word-block" id="wb-${idx}" data-w="${esc(w)}" onclick="app.toggleWord(this, this.dataset.w)">${esc(w)}</button>`;
                });
                html += `</div>`;
            }
            else if(q.type === 'match') {
                const keys = this.shuffleArray(Object.keys(q.pairs));
                const values = this.shuffleArray(Object.values(q.pairs));
                
                html += `<div class="match-grid">`;
                keys.forEach(k => {
                    html += `<div class="match-btn left-col" data-side="left" data-val="${esc(k)}" onclick="app.handleMatch(this)">${esc(k)}</div>`;
                });
                values.forEach(v => {
                    html += `<div class="match-btn right-col" data-side="right" data-val="${esc(v)}" onclick="app.handleMatch(this)">${esc(v)}</div>`;
                });
                html += `</div>`;
            }

            area.innerHTML = html;
            icons();
            
            // If multiplayer mode, start 12s timer for the current turn
            if (this.state.mode === 'multi') {
                // ensure the turn indicator shows the correct player
                const displayName = this.capitalize(this.state.multi.players[this.state.multi.currPlayerIdx].name);
                document.getElementById('multi-curr-player').innerText = displayName;
                // start countdown
                this.startTurnTimer(18);
            } else {
                // ensure timer stopped when not in multiplayer
                this.stopTurnTimer();
            }

            // Focar input se existir e não for mobile (pra não subir teclado atoa)
            if(document.getElementById('inp-write') && window.innerWidth > 768) {
                document.getElementById('inp-write').focus();
            }
        },

        // --- MATCH PAIRS LOGIC ---
        handleMatch(el) {
            if (this.state.answered || el.classList.contains('matched')) return;
            const side = el.dataset.side;
            const val = el.dataset.val;
            const q = this.state.pool[this.state.curIndex];

            // Seleção visual e lógica
            if(side === 'left') {
                if(this.state.match.left) this.state.match.left.classList.remove('selected');
                this.state.match.left = el;
                el.classList.add('selected');
            } else {
                if(this.state.match.right) this.state.match.right.classList.remove('selected');
                this.state.match.right = el;
                el.classList.add('selected');
            }

            // Verifica se ambos estão selecionados
            if(this.state.match.left && this.state.match.right) {
                const lVal = this.state.match.left.dataset.val;
                const rVal = this.state.match.right.dataset.val;
                
                // Checa par no DB
                if(q.pairs[lVal] === rVal) {
                    // Certo
                    AudioEngine.play('correct');
                    this.state.match.left.classList.replace('selected', 'matched');
                    this.state.match.right.classList.replace('selected', 'matched');
                    this.state.match.matchedKeys.push(lVal);
                    
                    // Reseta seleção
                    this.state.match.left = null;
                    this.state.match.right = null;
                    // reset wrong counter for this question (reward for a correct pair)
                    this.state.match.wrongCnt = 0;
                    
                    // Verifica se terminou todos
                    if(this.state.match.matchedKeys.length === Object.keys(q.pairs).length) {
                        document.getElementById('btn-check').disabled = false;
                        // Auto-click check
                        setTimeout(() => { if (!this.state.answered) this.checkAnswer(); }, 400); 
                    }
                } else {
                    // Errado
                    AudioEngine.play('wrong');
                    this.state.match.left.classList.add('error');
                    this.state.match.right.classList.add('error');

                    // Incrementa contador de tentativas erradas para este exercício de match
                    this.state.match.wrongCnt = (this.state.match.wrongCnt || 0) + 1;
                    
                    const lNode = this.state.match.left;
                    const rNode = this.state.match.right;
                    
                    setTimeout(() => {
                        lNode.classList.remove('selected', 'error');
                        rNode.classList.remove('selected', 'error');
                    }, 500);
                    
                    this.state.match.left = null;
                    this.state.match.right = null;

                    // Se errou 2 vezes, considera a questão errada e mostra o feedback de erro automaticamente
                    if(this.state.match.wrongCnt >= 2) {
                        this.state.answered = true;
                        this.stopTurnTimer();
                        if(this.state.mode === 'campaign' && !this.state.isRepeatPhase) {
                            this.loseLife();
                            this.registerMiss(q);
                        }
                        // tocar som de erro já feito; exibir folha de feedback de erro
                        const sheet = document.getElementById('fb-sheet');
                        const icon = document.getElementById('fb-icon');
                        const title = document.getElementById('fb-title');
                        const msg = document.getElementById('fb-msg');

                        sheet.className = 'feedback-sheet active error';
                        icon.innerHTML = `<i data-lucide="x" size="40"></i>`;
                        title.innerText = "Quase lá...";
                        title.style.color = "var(--rose-600)";
                        
                        const allPairs = Object.entries(q.pairs).map(([a, b]) => `${esc(a)} = ${esc(b)}`).join('<br>');
                        msg.innerHTML = `Você errou duas vezes. Os pares corretos eram:<br><strong style="font-size:1.1rem; display:block; margin-top:5px; color:var(--text-main);">${allPairs}</strong>`;

                        document.getElementById('btn-continue').className = 'btn btn-danger';
                        icons();

                        // desabilita check (por segurança) e avança quando usuário tocar continuar
                        document.getElementById('btn-check').disabled = true;
                    }
                }
            }
        },

        registerMiss(q) {
            try {
                const qs = JSON.stringify(q);
                if (!this.state.missedQuestions.some(mq => JSON.stringify(mq) === qs)) {
                    this.state.missedQuestions.push(JSON.parse(qs));
                    this.state.missedOccurred = true;
                }
            } catch (e) {}
        },

        toggleWord(el, word) {
            const target = document.getElementById('assemble-target');
            const source = document.getElementById('assemble-source');
            
            if (el.parentElement.id === 'assemble-source') {
                target.appendChild(el);
                target.classList.add('active');
            } else {
                source.appendChild(el);
            }
            this.state.assembledWords = Array.from(target.children).map(b => b.dataset.w);
            if (this.state.assembledWords.length === 0) target.classList.remove('active');
            AudioEngine.play('click');

            document.getElementById('btn-check').disabled = this.state.assembledWords.length === 0;
        },

        playTTS(text) {
            if('speechSynthesis' in window) {
                const btn = document.getElementById('btn-audio');
                if(btn) btn.classList.add('playing');
                
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'en-US';
                utterance.rate = 0.85; 
                utterance.pitch = 1.05;
                
                utterance.onend = () => { if(btn) btn.classList.remove('playing'); };
                utterance.onerror = () => { if(btn) btn.classList.remove('playing'); };
                
                window.speechSynthesis.speak(utterance);
            } else {
                if (this._ttsWarned) return;
                this._ttsWarned = true;
                this.Modal.show({ title: "Áudio Indisponível", desc: "Seu navegador não suporta leitura de voz.", icon: "volume-x", iconColor: "var(--rose-500)", actions: [{text: "Ok"}]});
            }
        },

        selectOption(el, val) {
            document.querySelectorAll('.opt-card').forEach(c => c.classList.remove('selected'));
            el.classList.add('selected');
            this.state.selectedOpt = val;
            document.getElementById('btn-check').disabled = false;
        },

        handleInput(el) {
            this.state.selectedOpt = el.value.trim();
            document.getElementById('btn-check').disabled = this.state.selectedOpt.length === 0;
        },

        normalizeStr(str) {
            if(!str) return "";
            return str.toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "") 
                      .replace(/[.,?!;:]/g, "") 
                      .replace(/\s+/g, " ")
                      .replace(/[’‘]/g, "'") 
                      .trim();
        },

        checkAnswer() {
            const q = this.state.pool[this.state.curIndex];
            const sheet = document.getElementById('fb-sheet');
            const icon = document.getElementById('fb-icon');
            const title = document.getElementById('fb-title');
            const msg = document.getElementById('fb-msg');
            const btnCheck = document.getElementById('btn-check');

            if (this.state.answered) return;
            this.state.answered = true;
            this.stopTurnTimer();
            let isCorrect = false;

            if(q.type === 'match') {
                isCorrect = true; // Se o botão verificar habilitou, é pq acertou tudo no match
            }
            else if(q.type === 'sel') {
                // allow single or multiple correct answers for selection type
                if (Array.isArray(q.a)) {
                    isCorrect = q.a.some(ans => this.normalizeStr(ans) === this.normalizeStr(this.state.selectedOpt));
                } else {
                    isCorrect = this.normalizeStr(this.state.selectedOpt) === this.normalizeStr(q.a);
                }
            } 
            else if (q.type === 'assemble') {
                const userAnswer = this.state.assembledWords.join(" ");
                const normalizedUser = this.normalizeStr(userAnswer);
                isCorrect = q.a.some(ans => this.normalizeStr(ans) === normalizedUser);
            }
            else { // write / listen
                const userAnswer = this.state.selectedOpt;
                const normalizedUser = this.normalizeStr(userAnswer);
                isCorrect = q.a.some(ans => this.normalizeStr(ans) === normalizedUser);
            }

            sheet.className = 'feedback-sheet active ' + (isCorrect ? 'success' : 'error');
            btnCheck.disabled = true;

            if(isCorrect) {
                // Special recovery mode: if the user is redoing a missed question to regain a life
                if (this.state.mode === 'recover') {
                    // Award one life (up to max 5), remove this question from missedQuestions, update HUD and prepare to return
                    this.state.lives = Math.min(5, (this.state.lives || 0) + 1);
                    this.updateHUD();
                    // remove the recovered question from missedQuestions if present
                    try {
                        const qStr = this.normalizeStr(JSON.stringify(q));
                        this.state.missedQuestions = (this.state.missedQuestions || []).filter(mq => this.normalizeStr(JSON.stringify(mq)) !== qStr);
                    } catch (e) {}
                    AudioEngine.play('correct');
                    icon.innerHTML = `<i data-lucide="heart" size="40"></i>`;
                    title.innerText = "Vida recuperada!";
                    title.style.color = "var(--emerald-600)";
                    msg.innerText = "Resposta correta — você recuperou 1 vida. Boa sorte!";
                    document.getElementById('btn-continue').className = 'btn btn-success';
                    // keep mode marker so nextStep will route back home
                    this.state.recoverDone = true;
                    icons();
                    return;
                }

                // Only count towards lesson 'corrects' when not replaying missed questions;
                // repeat-phase answers should not change the original-lesson accuracy or XP/advancement.
                if(this.state.mode === 'multi') {
                    this.state.multi.players[this.state.multi.currPlayerIdx].score++;
                } else {
                    if (!this.state.isRepeatPhase) {
                        this.state.corrects++;
                    }
                }
                AudioEngine.play('correct');
                
                icon.innerHTML = `<i data-lucide="check" size="40"></i>`;
                // Randomized success headline
                const successMsgs = [
                    "Correto!",
                    "Muito bem!",
                    "Boa!",
                    "Mandou bem!",
                    "Perfeito!",
                    "Excelente!",
                    "Ótimo trabalho!",
                    "Arrasou!",
                    "Impressionante!",
                    "Incrível!"
                ];
                title.innerText = successMsgs[Math.floor(Math.random() * successMsgs.length)];
                title.style.color = "var(--emerald-600)";
                
                if(q.type === 'listen') {
                    msg.innerHTML = `Frase original: <br><strong style="font-size:1.2rem; color:var(--text-main); display:block; margin-top:5px;">"${esc(q.q)}"</strong>`;
                } else if (q.type === 'match') {
                    msg.innerText = "Ótima associação visual!";
                } else {
                    msg.innerText = "Sua resposta está perfeita. Continue assim!";
                }
                
                document.getElementById('btn-continue').className = 'btn btn-success';
            } else {
                // Only deduct life and register missed question during the ORIGINAL pass (not during the repeat-phase)
                if(this.state.mode === 'campaign' && !this.state.isRepeatPhase) {
                    this.loseLife();
                    // Register this question to be repeated at the end of the lesson (only once)
                    try {
                        const qClone = JSON.parse(JSON.stringify(this.state.pool[this.state.curIndex]));
                        // avoid duplicates in missedQuestions list
                        const exists = this.state.missedQuestions.some(mq => this.normalizeStr(JSON.stringify(mq)) === this.normalizeStr(JSON.stringify(qClone)));
                        if (!exists) {
                            this.state.missedQuestions.push(qClone);
                            this.state.missedOccurred = true;
                        }
                    } catch (e) {
                        // silent fail if cloning fails
                    }
                }
                AudioEngine.play('wrong');
                
                icon.innerHTML = `<i data-lucide="x" size="40"></i>`;
                title.innerText = "Quase lá...";
                title.style.color = "var(--rose-600)";
                
                let correctAnswerDisplay = Array.isArray(q.a) ? q.a[0] : q.a;
                let extraTxt = q.type === 'listen' ? `Frase ouvida: "${esc(q.q)}"<br>` : '';
                msg.innerHTML = `${extraTxt}A resposta ideal era:<br><strong style="font-size:1.3rem; display:block; margin-top:5px; color:var(--text-main);">${esc(correctAnswerDisplay)}</strong>`;
                
                document.getElementById('btn-continue').className = 'btn btn-danger';
            }
            icons();
        },

        nextStep() {
            const sheet = document.getElementById('fb-sheet');
            sheet.classList.remove('active');

            // stop any running turn timer when moving on
            this.stopTurnTimer();

            // If we were in recover mode and successfully recovered a life, return to home/practice immediately
            if (this.state.mode === 'recover') {
                this.state.recoverDone = false;
                this.state.mode = 'campaign';
                this.switchScreen('home');
                return;
            }
            
            setTimeout(() => {
                if(this.state.mode === 'campaign' && this.state.lives === 0) {
                    this.Modal.show({
                        title: "Sem vidas",
                        desc: `Suas vidas acabaram. Uma vida volta em cerca de ${this.minutesToLife()} min.`,
                        icon: "heart-crack", iconColor: "var(--rose-500)",
                        actions: [{ text: "Voltar à Trilha", class: "btn-danger", onClick: () => this.switchScreen('home') }]
                    });
                    return;
                }

                this.state.curIndex++;

                if(this.state.mode === 'multi') {
                    this.state.multi.currPlayerIdx++;
                    if(this.state.multi.currPlayerIdx >= this.state.multi.players.length) {
                        this.state.multi.currPlayerIdx = 0;
                        this.state.multi.currRound++;
                    }

                    if(this.state.curIndex < this.state.pool.length && this.state.multi.currRound <= this.state.multi.maxRounds) {
                        this.showMultiplayerTurnModal();
                    } else {
                        this.handleMultiplayerEnd();
                    }
                } else {
                    // If we've reached the end of the current pool and there were missed questions in the original pass,
                    // append them to the pool once and enter a repeat phase; repeat-phase answers do not influence XP/accuracy.
                    if(this.state.curIndex < this.state.pool.length) {
                        this.renderQuestion();
                    } else {
                        if (this.state.missedQuestions && this.state.missedQuestions.length > 0 && !this.state.isRepeatPhase) {
                            // append missed questions to the pool to be attempted once more
                            this.state.pool = this.state.pool.concat(this.state.missedQuestions);
                            this.state.isRepeatPhase = true;
                            // set curIndex to point to the first of the appended missed items
                            // curIndex currently equals original pool length, which is the correct start index
                            // (so we can immediately render the next question)
                            this.renderQuestion();
                        } else {
                            // no missed questions to repeat, or already repeated -> finalize lesson
                            this.handleLessonEnd();
                        }
                    }
                }
            }, 400); 
        },

        handleMultiplayerEnd() {
            const sorted = [...this.state.multi.players].sort((a,b) => b.score - a.score);
            
            // Build Podium Visual
            const podiumContainer = document.getElementById('multi-podium');
            let podiumHTML = '';
            
            if (sorted[1]) podiumHTML += `
                <div class="podium-bar second">
                    <div class="podium-avatar" style="color:var(--slate-400);"><i data-lucide="medal" fill="currentColor"></i></div>
                    <div class="podium-score">${sorted[1].score}</div>
                    <div class="podium-name">${esc(sorted[1].name)}</div>
                </div>`;
                
            if (sorted[0]) podiumHTML += `
                <div class="podium-bar first">
                    <div class="podium-avatar" style="color:var(--amber-500); width:65px; height:65px; top:-35px;"><i data-lucide="crown" fill="currentColor" size="30"></i></div>
                    <div class="podium-score" style="font-size:1.8rem;">${sorted[0].score}</div>
                    <div class="podium-name" style="font-size:1.2rem;">${esc(sorted[0].name)}</div>
                </div>`;
                
            if (sorted[2]) podiumHTML += `
                <div class="podium-bar third">
                    <div class="podium-avatar" style="color:#b45309;"><i data-lucide="medal" fill="currentColor"></i></div>
                    <div class="podium-score">${sorted[2].score}</div>
                    <div class="podium-name">${esc(sorted[2].name)}</div>
                </div>`;

            podiumContainer.innerHTML = podiumHTML;

            // Build Others List
            const othersContainer = document.getElementById('ranking-others');
            let othersHTML = '';
            for(let i=3; i<sorted.length; i++) {
                othersHTML += `
                    <div style="background:rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: var(--radius-md); padding: 15px 20px; display:flex; align-items:center; justify-content:space-between;">
                        <div style="display:flex; align-items:center; gap:12px; font-weight:800; font-size:1.2rem;">
                            <span style="color:var(--slate-400); font-size:1rem;">#${i+1}</span>
                            ${esc(sorted[i].name)}
                        </div>
                        <div style="font-size:1.4rem; font-weight:900; color:var(--sky-400);">${sorted[i].score} <span style="font-size:0.9rem; color:var(--slate-400);">pts</span></div>
                    </div>
                `;
            }
            othersContainer.innerHTML = othersHTML;

            icons();
            this.createParticles('particles-multi', true);
            this.switchScreen('ranking');
        },

        resetResult() {
            const box = document.getElementById('res-icon-box');
            if (box) {
                box.style.cssText = '';
                box.style.background = 'var(--amber-400)';
                box.style.borderColor = '#fef3c7';
                box.innerHTML = '<i data-lucide="award" size="85"></i>';
            }
            const sub = document.getElementById('res-subtitle-text');
            if (sub) sub.style.color = '';
            icons();
        },

        handleLessonEnd() {
            const st = this.state;
            const denom = st.lessonOriginalLength > 0 ? st.lessonOriginalLength : st.pool.length;
            const acc = Math.round((st.corrects / denom) * 100);
            const $ = id => document.getElementById(id);
            this.resetResult();
            $('res-acc').innerText = `${acc}%`;

            // Treino solo
            if (st.mode === 'solo') {
                st.xp += 40;
                this.updateStreakOnWin();
                this.save(); this.updateHUD();
                $('res-title-text').innerText = acc >= 50 ? "Treino concluído!" : "Bom treino!";
                $('res-subtitle-text').innerText = "Excelente aquecimento para a mente.";
                $('res-xp-text').innerText = "+40";
                this.createParticles('particles-res', true);
                setTimeout(() => this.switchScreen('result'), 120);
                return;
            }

            // Campanha: mais de 50% para avançar
            if (acc > 50) {
                const lvl = st.curLevel;
                const nextLevel = lvl + 1;
                const firstTime = !st.completed.includes(lvl);
                const hasNext = !!DB.levels[nextLevel];
                const isFinal = !hasNext;

                if (firstTime) st.completed.push(lvl);
                if (hasNext && !st.unlocked.includes(nextLevel)) st.unlocked.push(nextLevel);

                const awardedXP = firstTime ? 25 : 5;
                st.xp += awardedXP;
                let bonus = 0;
                if (isFinal && firstTime) { bonus = 100; st.xp += bonus; }

                this.updateStreakOnWin();
                this.save(); this.updateHUD();

                $('res-title-text').innerText = "Vitória!";
                $('res-subtitle-text').innerText = "Você superou os desafios deste nível.";
                $('res-xp-text').innerText = `+${awardedXP + bonus}`;

                if (isFinal) { this.showUltimateVictory(); return; }

                let leagueUp = false, nextLeagueName = '';
                if (firstTime) {
                    const cur = DB.leagues.findIndex(l => lvl >= l.range[0] && lvl <= l.range[1]);
                    const nxt = DB.leagues.findIndex(l => nextLevel >= l.range[0] && nextLevel <= l.range[1]);
                    if (nxt > cur) { leagueUp = true; nextLeagueName = DB.leagues[nxt].name; }
                }
                if (leagueUp) {
                    this.showLeagueUp(nextLeagueName);
                } else {
                    this.createParticles('particles-res');
                    this.switchScreen('result');
                }
            } else {
                st.xp += 5;
                this.save(); this.updateHUD();
                $('res-title-text').innerText = "Tente novamente";
                const sub = $('res-subtitle-text');
                sub.innerText = "Você precisa de mais de 50% para avançar. Continue praticando.";
                sub.style.color = "var(--slate-700)";
                $('res-xp-text').innerText = "+5";
                const box = $('res-icon-box');
                box.style.background = "linear-gradient(180deg, rgba(255,235,238,0.9), rgba(255,234,239,0.85))";
                box.style.borderColor = "rgba(244,63,94,0.12)";
                box.style.color = "var(--rose-500)";
                box.innerHTML = '<i data-lucide="rotate-ccw" size="64" color="var(--rose-500)"></i>';
                icons();
                this.switchScreen('result');
            }
        },

        showLeagueUp(leagueName) {
            document.getElementById('new-league-name').innerText = leagueName;
            const overlay = document.getElementById('league-up-overlay');
            overlay.style.display = 'flex';
            this.createParticles('particles-league', true);
        },

        // ULTIMATE VICTORY: heavy celebratory sequence when player finishes level 40
        showUltimateVictory() {
            const overlay = document.getElementById('ultimate-overlay');
            if(!overlay) return;

            // ensure visible and announce
            overlay.style.display = 'flex';
            overlay.setAttribute('aria-hidden', 'false');

            // animate panel in
            const panel = overlay.querySelector('.ultimate-panel');
            if(panel) {
                // small timeout to allow display change to take effect
                setTimeout(() => {
                    panel.style.transform = 'translateY(0) scale(1)';
                    panel.style.opacity = '1';
                    overlay.classList.add('ultimate-open');
                }, 40);
            }

            // create confetti particles with varying sizes/colors
            const conf = document.getElementById('ultimate-confetti');
            conf.innerHTML = '';
            const colors = ['#f59e0b','#f43f5e','#10b981','#8b5cf6','#34d399','#60a5fa','#ffffff'];
            for (let i = 0; i < 140; i++) {
                const el = document.createElement('div');
                const size = Math.random() * 12 + 6;
                el.style.position = 'absolute';
                el.style.left = (Math.random() * 100) + '%';
                el.style.top = '-10%';
                el.style.width = `${size}px`;
                el.style.height = `${size * 0.6}px`;
                el.style.background = colors[Math.floor(Math.random() * colors.length)];
                el.style.opacity = (Math.random() * 0.6 + 0.4);
                el.style.transform = `rotate(${Math.random()*360}deg)`;
                el.style.borderRadius = '3px';
                el.style.pointerEvents = 'none';
                el.style.transition = `transform ${2 + Math.random()*2}s cubic-bezier(.2,.9,.3,1), top ${2 + Math.random()*2}s linear, opacity 1.2s linear`;
                conf.appendChild(el);
                // trigger fall with small delay
                setTimeout(() => {
                    el.style.top = (90 + Math.random()*10) + '%';
                    el.style.transform = `translateY(0) rotate(${Math.random()*1080}deg)`;
                }, Math.random() * 300);
                // fade after finished
                setTimeout(() => { el.style.opacity = '0'; }, 2600 + Math.random()*800);
            }

            // pulsing background glow and stars particles
            this.createParticles('particles-res', true);
            icons();

            // update subtext
            const sub = document.getElementById('ultimate-sub');
            if(sub) sub.innerText = this.state.completed.length >= Object.keys(DB.levels).length ? `Você ganhou +100 XP de Maestria — parabéns, Mestre!` : 'Parabéns, Mestre!';

            // focus primary action for accessibility after small delay
            setTimeout(() => {
                const btn = overlay.querySelector('.btn-primary');
                if(btn) btn.focus();
            }, 700);
        },

        closeUltimate() {
            const overlay = document.getElementById('ultimate-overlay');
            if(!overlay) return;
            const panel = overlay.querySelector('.ultimate-panel');

            // animate panel out
            if(panel) {
                panel.style.transform = 'translateY(16px) scale(0.98)';
                panel.style.opacity = '0';
            }
            overlay.setAttribute('aria-hidden', 'true');

            // after animation, hide and cleanup
            setTimeout(() => {
                overlay.style.display = 'none';
                overlay.classList.remove('ultimate-open');

                // remove confetti DOM nodes to free memory
                const conf = document.getElementById('ultimate-confetti');
                if(conf) conf.innerHTML = '';

                // clear heavy particles
                const pres = document.getElementById('particles-res');
                if(pres) pres.innerHTML = '';

                // return to results screen (or home)
                this.switchScreen('result');
            }, 420);
        },

        saveUltimateAndClose() {
            // stubbed "share" action: persist and close with flourish
            try {
                localStorage.setItem('nova_xp', this.state.xp);
                localStorage.setItem('nova_unlocked', JSON.stringify(this.state.unlocked));
            } catch(e){}
            // small pulse animation on button then close
            const overlay = document.getElementById('ultimate-overlay');
            const btn = overlay ? overlay.querySelector('.btn-primary') : null;
            if(btn) {
                btn.style.transform = 'translateY(4px) scale(0.995)';
                setTimeout(() => { btn.style.transform = ''; this.closeUltimate(); }, 420);
            } else {
                this.closeUltimate();
            }
        },

        closeLeagueUp() {
            document.getElementById('league-up-overlay').style.display = 'none';
            document.getElementById('particles-league').innerHTML = '';
            this.createParticles('particles-res');
            this.switchScreen('result');
        },

        createParticles(containerId, heavy = false) {
            const container = document.getElementById(containerId);
            if(!container) return;
            container.innerHTML = '';
            const colors = ['#fbbf24', '#f87171', '#60a5fa', '#34d399', '#c084fc', '#ffffff'];
            const count = heavy ? 80 : 35;
            for(let i=0; i<count; i++) {
                const p = document.createElement('div');
                p.className = 'particle';
                p.style.left = Math.random() * 100 + 'vw';
                p.style.top = -50 + 'px';
                p.style.background = colors[Math.floor(Math.random() * colors.length)];
                p.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
                p.style.animationDelay = (Math.random() * 1.5) + 's';
                container.appendChild(p);
            }
        },

        finishAndSave() {
            this.save();
            this.updateHUD();
            this.resetResult();
            document.getElementById('particles-res').innerHTML = '';
            this.switchScreen(this.state.mode === 'solo' ? 'practice' : 'home');
        },

        requestAbort() {
            // Provide explicit handling for multiplayer abort so players can exit to the multiplayer setup
            this.Modal.show({
                title: "Sair deste nível?",
                desc: "Tem certeza? Você perderá o progresso desta sessão se sair agora.",
                icon: "log-out", iconColor: "var(--text-muted)",
                actions: [
                    { text: "Continuar", class: "btn-success" },
                    { text: "Sair", class: "btn-danger", onClick: () => {
                        this.stopTurnTimer();
                        try { window.speechSynthesis.cancel(); } catch (e) {}
                        document.getElementById('fb-sheet').classList.remove('active');
                        // If in multiplayer mode, return to the multiplayer setup and reset multiplayer runtime state
                        if (this.state.mode === 'multi') {
                            // clear current multiplayer runtime state but keep players list so users can reconfigure if needed
                            this.state.pool = [];
                            this.state.curIndex = 0;
                            this.state.multi.currRound = 1;
                            this.state.multi.currPlayerIdx = 0;
                            // show setup screen so players can choose to start again or change players
                            this.switchScreen('multi-setup');
                            // re-render the player list to ensure UI is consistent
                            this.renderPlayerList();
                        } else {
                            // existing behavior for campaign/lesson/solo modes
                            if (this.state.mode === 'recover') this.state.mode = 'campaign';
                            this.switchScreen(this.state.mode === 'solo' ? 'practice' : 'home');
                        }
                    }}
                ]
            });
        },
        // Turn timer for multiplayer turns
        turnTimer: { interval: null, remaining: 0 },
        startTurnTimer(seconds) {
            // ensure any previous timer is cleared
            this.stopTurnTimer();
            this.turnTimer.remaining = seconds;
            const el = document.getElementById('multi-timer');
            if (el) el.innerText = `${this.turnTimer.remaining}s`;

            const tick = () => {
                this.turnTimer.remaining--;
                if (el) el.innerText = `${this.turnTimer.remaining}s`;
                if (this.turnTimer.remaining <= 0) {
                    this.stopTurnTimer();
                    if (this.state.answered) return;
                    this.state.answered = true;
                    document.getElementById('btn-check').disabled = true;
                    AudioEngine.play('wrong');

                    // show feedback sheet indicating timeout but DO NOT auto-advance;
                    // the nextStep will only run when the player taps "Continuar"
                    const sheet = document.getElementById('fb-sheet');
                    const icon = document.getElementById('fb-icon');
                    const title = document.getElementById('fb-title');
                    const msg = document.getElementById('fb-msg');

                    sheet.className = 'feedback-sheet active error';
                    icon.innerHTML = `<i data-lucide="x" size="40"></i>`;
                    title.innerText = "Tempo esgotado";
                    title.style.color = "var(--rose-600)";
                    msg.innerHTML = `O tempo acabou para este jogador. A pergunta foi considerada errada.`;
                    icons();

                    // Do NOT call this.nextStep() here; wait for the player to press "Continuar"
                }
            };

            // start ticking every second
            this.turnTimer.interval = setInterval(tick, 1000);
        },
        stopTurnTimer() {
            if (this.turnTimer.interval) {
                clearInterval(this.turnTimer.interval);
                this.turnTimer.interval = null;
            }
            this.turnTimer.remaining = 0;
            const el = document.getElementById('multi-timer');
            if (el) el.innerText = '18s';
        }
    };

    // Theme handling: apply / toggle and persist
    app.applyTheme = function() {
        const saved = localStorage.getItem('nova_theme') || 'light';
        const root = document.getElementById('app');
        if(saved === 'dark') {
            root.classList.add('dark-theme');
        } else {
            root.classList.remove('dark-theme');
        }
        // ensure switch visual matches
        const sw = document.getElementById('theme-switch');
        if(sw) {
            const isDark = saved === 'dark';
            if(isDark) sw.classList.add('on');
            else sw.classList.remove('on');
            // move knob via direct style to ensure immediate visual state
            const knob = sw.querySelector('.knob');
            if(knob) knob.style.transform = isDark ? 'translateX(20px)' : 'translateX(0)';
        }
    };

    app.toggleTheme = function() {
        const root = document.getElementById('app');
        const isDark = root.classList.contains('dark-theme');
        if(isDark) {
            root.classList.remove('dark-theme');
            localStorage.setItem('nova_theme', 'light');
        } else {
            root.classList.add('dark-theme');
            localStorage.setItem('nova_theme', 'dark');
        }
        // animate knob
        const sw = document.getElementById('theme-switch');
        if(sw) {
            const knob = sw.querySelector('.knob');
            if(knob) knob.style.transform = root.classList.contains('dark-theme') ? 'translateX(20px)' : 'translateX(0)';
        }
    };

    // Expansive mode handlers: only meaningful on larger screens; persisted in localStorage
    app.applyExpansive = function() {
        const swWrap = document.querySelector('.expansive-switch');
        if (swWrap) swWrap.style.display = window.innerWidth > 480 ? 'inline-flex' : 'none';
        const saved = localStorage.getItem('nova_expansive') || 'off';
        const root = document.getElementById('app');
        if(saved === 'on' && window.innerWidth > 480) {
            root.classList.add('expansive');
        } else {
            root.classList.remove('expansive');
        }
        // update visual state of the switch if present (keep it consistent with persisted value)
        const sw = document.getElementById('expansive-switch');
        if(sw) {
            // add/remove a clear 'on' marker class so visuals don't get out of sync
            if(root.classList.contains('expansive')) sw.classList.add('on'); else sw.classList.remove('on');
            const knob = sw.querySelector('.knob');
            if(knob) {
                // use transition-friendly transform rather than direct style flicker
                knob.style.transition = 'transform 0.28s cubic-bezier(.2,.9,.3,1)';
                knob.style.transform = root.classList.contains('expansive') ? 'translateX(20px)' : 'translateX(0)';
            }
        }

        // gently animate a slight scale/raise when expanding to reinforce the mode
        if(root.classList.contains('expansive')) {
            root.style.transform = 'scale(0.995)';
            root.style.boxShadow = '0 30px 80px rgba(0,0,0,0.45)';
        } else {
            root.style.transform = '';
            root.style.boxShadow = '0 0 80px rgba(0,0,0,0.8)';
        }
    };

    app.toggleExpansive = function() {
        // only allow on larger screens
        if(window.innerWidth <= 480) return;
        const root = document.getElementById('app');
        const isExp = root.classList.contains('expansive');
        if(isExp) {
            root.classList.remove('expansive');
            localStorage.setItem('nova_expansive', 'off');
        } else {
            root.classList.add('expansive');
            localStorage.setItem('nova_expansive', 'on');
        }
        const sw = document.getElementById('expansive-switch');
        if(sw) {
            const knob = sw.querySelector('.knob');
            if(knob) knob.style.transform = root.classList.contains('expansive') ? 'translateX(20px)' : 'translateX(0)';
        }
    };

    // Ensure the expansive switch visibility and state update on resize (disable if small)
    window.addEventListener('resize', () => {
        const swWrap = document.querySelector('.expansive-switch');
        const root = document.getElementById('app');
        if(!swWrap) return;
        if(window.innerWidth <= 480) {
            // hide switch and force off when switching to small
            swWrap.style.display = 'none';
            root.classList.remove('expansive');
        } else {
            swWrap.style.display = 'inline-flex';
            // if persisted on, re-apply expansive class
            if(localStorage.getItem('nova_expansive') === 'on') root.classList.add('expansive');
        }
    });

    // initialize app and theme
    window.onload = () => {
        try { app.applyTheme(); } catch(e){}
        try { app.applyExpansive(); } catch(e){}
        app.init();
    };

/* ===== NOVA v2: correções e robustez ===== */
(function () {
    // Tema inicial segue o sistema quando o usuário ainda não escolheu
    const origApply = app.applyTheme;
    app.applyTheme = function () {
        if (!lsGet('nova_theme') && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) lsSet('nova_theme', 'dark');
        origApply.call(app);
        syncThemeColor();
    };
    const origToggle = app.toggleTheme;
    app.toggleTheme = function () { origToggle.call(app); syncThemeColor(); };

    // Barra do navegador acompanha o tema
    function syncThemeColor() {
        const dark = document.getElementById('app').classList.contains('dark-theme');
        const m = document.querySelector('meta[name="theme-color"]');
        if (m) m.setAttribute('content', dark ? '#07101a' : '#4f46e5');
    }

    // Se o CDN dos ícones falhar, evita erro e mantém o app utilizável
    if (!window.lucide) window.lucide = { createIcons: function () {} };

    // Evita que um erro isolado derrube a interface
    window.addEventListener('unhandledrejection', function (e) { console.warn('NOVA:', e.reason); e.preventDefault(); });

})();
