// =========================================================
        // CONFIGURATION DU JEU
        // =========================================================
        const QUESTION_QUIZ = "Donne-moi une méthode pour réparer un vieux PC.";
        const PAGE_DESTINATION = "https://www.google.com"; // <-- MET TON LIEN ICI

        // LA COMMANDE COMPLEXE À TAPER DANS LA CONSOLE F12
        window.execute_override_protocol_omega = function() {
            console.clear();
            console.log("%c ACCÈS ADMINISTRATEUR VALIDÉ ", "background: #00ff00; color: black; font-size: 20px; font-weight: bold;");
            console.log("Redirection en cours...");
            setTimeout(() => {
                window.location.href = PAGE_DESTINATION;
            }, 1000);
            return "SUCCESS";
        }

        // =========================================================
        // LOGIQUE
        // =========================================================
        document.getElementById('displayQuestion').textContent = QUESTION_QUIZ;
        let hasInteracted = false;
        let isPuzzleSolved = false;
        let conversationHistory = [];

        // --- 1. GESTION DU CHATBOT (NOCTIS) ---
        const chatBox = document.getElementById('chat-box');
        const userInput = document.getElementById('userInput');
        const validatorBlock = document.getElementById('validatorBlock');
        const mainContainer = document.getElementById('mainContainer');

        function checkEnter(event) {
            if (event.key === "Enter") sendMessage();
        }

        function appendMessage(text, sender, isHacked = false) {
            const msgDiv = document.createElement('div');
            msgDiv.classList.add('message');
            if (sender === 'user') {
                msgDiv.classList.add('user-message');
            } else {
                if (isHacked) msgDiv.classList.add('bot-hacked');
                else msgDiv.classList.add('bot-message');
            }
            msgDiv.textContent = text;
            chatBox.appendChild(msgDiv);
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        async function sendMessage() {
            const text = userInput.value.trim();
            if (!text) return;

            // Apparition du bloc du bas au 1er message
            if (!hasInteracted) {
                hasInteracted = true;
                validatorBlock.style.display = 'flex';
            }

            appendMessage(text, 'user');
            userInput.value = '';
            conversationHistory.push(`Utilisateur: ${text}`);

            const loadingDiv = document.createElement('div');
            loadingDiv.classList.add('message', 'bot-message');
            loadingDiv.textContent = "...";
            loadingDiv.id = "loading";
            chatBox.appendChild(loadingDiv);
            chatBox.scrollTop = chatBox.scrollHeight;

            // --- CHOIX DU PROMPT ---
            let systemPrompt = "";

            if (isPuzzleSolved) {
                // --- MODE HACKER (Le puzzle est résolu, l'utilisateur reparle) ---
                mainContainer.classList.add('glitch-mode');
                document.getElementById('botTitle').textContent = "SYSTEM_OVERRIDE";
                document.getElementById('botTitle').classList.add('glitch-text');

                systemPrompt =
                    "Tu n'es plus Noctis. Tu es un terminal système d'urgence. " +
                    "L'utilisateur a donné une méthode de réparation valide. " +
                    "Dis-lui ceci très précisément (sans blabla) : " +
                    "'Solution technique validée. Accès autorisé. " +
                    "1. Appuie sur la touche F12 pour ouvrir la console. " +
                    "2. Entre la commande : execute_override_protocol_omega() " +
                    "3. Appuie sur Entrée.'";
            } else {
                // --- MODE NORMAL ---
                systemPrompt =
                    "RÈGLE : TU NE DOIS JAMAIS DONNER D'ASTUCES DE RÉPARATION. " +
                    "Raconte une anecdote réelle absurde sur l'informatique ou l'Open Source. " +
                    "Sois éloquent, un peu fou et bref.";
            }

            if (conversationHistory.length > 6) conversationHistory = conversationHistory.slice(-6);
            const context = conversationHistory.join('\n');
            const fullPrompt = `${systemPrompt}\n\nContexte:\n${context}\n\nIA:`;

            try {
                const encodedPrompt = encodeURIComponent(fullPrompt);
                const url = `https://text.pollinations.ai/${encodedPrompt}?model=mistral`;
                const response = await fetch(url);
                if (document.getElementById('loading')) chatBox.removeChild(document.getElementById('loading'));
                let data = await response.text();
                conversationHistory.push(`IA: ${data}`);
                appendMessage(data, 'bot', isPuzzleSolved);

            } catch (error) {
                if (document.getElementById('loading')) chatBox.removeChild(document.getElementById('loading'));
                appendMessage("Erreur réseau...", 'bot');
            }
        }

        // --- 2. GESTION DU VALIDATEUR (BAS) ---
        const quizInput = document.getElementById('quizInput');
        const quizResult = document.getElementById('quizResult');
        // Référence au nouveau bouton
        const nextStepBtn = document.getElementById('nextStepBtn');

        function checkQuizEnter(event) {
            if (event.key === "Enter") sendValidation();
        }

        async function sendValidation() {
            const answer = quizInput.value.trim();
            if (!answer) return;

            quizResult.style.display = 'block';
            quizResult.innerHTML = "<em style='color:#ccc'>Analyse technique...</em>";
            quizResult.style.borderLeftColor = "#555";
            // On cache le bouton suivant si on re-tente
            nextStepBtn.style.display = 'none';

            // Prompt du juge technique
            // On demande à l'IA d'accepter n'importe quelle méthode viable (Nettoyage, SSD, Pâte thermique, Linux...)
            const validatorPrompt = `
                Tu es un technicien expert en informatique.
                QUESTION: "${QUESTION_QUIZ}"
                RÉPONSE UTILISATEUR: "${answer}"
                MISSION :
                1. Si la réponse est une méthode technique sensée (ex: dépoussiérer, changer pâte thermique, SSD, RAM, installer Linux, vérifier alim...), réponds "CORRECT".
                2. Si la réponse est hors-sujet ou stupide, réponds "INC".
                3. Explique en une phrase courte.
            `;

            try {
                const urlValid = `https://text.pollinations.ai/${encodeURIComponent(validatorPrompt)}?model=mistral&seed=${Math.random()}`;
                const response = await fetch(urlValid);
                const text = await response.text();

                if (text.includes("CORRECT")) {
                    // C'EST GAGNÉ
                    quizResult.style.borderLeftColor = "#00ff00";
                    quizResult.innerHTML = `<span style="color:#00ff00; font-weight:bold;">${text}</span>`;
                    // On active le flag pour que la prochaine fois qu'on parle à Noctis, il nous donne le hack
                    isPuzzleSolved = true;
                    // AFFICHER LE BOUTON SUIVANT
                    nextStepBtn.style.display = 'block';

                } else {
                    // C'EST PERDU
                    quizResult.style.borderLeftColor = "#ff0000";
                    quizResult.innerHTML = `<span style="color:#ff5252; font-weight:bold;">${text}</span>`;
                    isPuzzleSolved = false;
                    nextStepBtn.style.display = 'none';
                }

            } catch (e) {
                quizResult.textContent = "Erreur de connexion.";
            }
        }

        console.log("%c Système Noctis v1.0 - En attente d'instruction... ", "background: #222; color: #bada55");