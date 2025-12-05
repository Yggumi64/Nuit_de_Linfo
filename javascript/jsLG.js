// --- Variables d'état du jeu ---
let moneySaved = 0;
let successCount = 0;
const MAX_SUCCESSES = 3;

// Définition des questions et réponses possibles (avec mots-clés pour la vérification)
const questionsData = [
    {
        question: "Le PC ne démarre plus et un écran bleu apparaît. Avant de le jeter, que devrais-je vérifier pour le reconditionner à moindre coût ?",
        correctKeywords: ["mémoire", "ram", "barrette", "memoire"],
        saveAmount: 80,
        nextImage: "img/numbers.png"
    },
    {
        question: "L'ordinateur est très lent, surtout au démarrage. Quel composant de stockage peut être facilement remplacé et reconditionné pour améliorer significativement la vitesse ?",
        correctKeywords: ["ssd", "disque dur", "stockage", "disque"],
        saveAmount: 120,
        nextImage: "img/screen.png"
    },
    {
        question: "Le système est à jour, mais certains programmes récents ne fonctionnent pas bien. Le PC a 8 ans. Quel composant essentiel pourrait être reconditionné (ou remplacé par un modèle reconditionné) pour un gain de performance général ?",
        correctKeywords: ["processeur", "cpu", "carte mère", "carte graphique", "gpu"],
        saveAmount: 250,
        nextImage: "img/good.png"
    },
    // Ajoutez plus de questions si vous le souhaitez
];

let currentQuestionIndex = 0;

// --- Références aux éléments du DOM ---
const moneySavedEl = document.getElementById('money-saved');
const successCountEl = document.getElementById('success-count');
const pcStatusImageEl = document.getElementById('pc-status-image');
const currentQuestionEl = document.getElementById('current-question');
const answerForm = document.getElementById('answer-form');
const userAnswerInput = document.getElementById('user-answer');
const feedbackEl = document.getElementById('feedback');
const reponseSection = document.getElementById('reponse-section');
const questionSection = document.querySelector('.question');
const resetButton = document.getElementById('reset-button');


// --- Fonctions du jeu ---

/**
 * Charge et affiche la question actuelle.
 */
function loadQuestion() {
    if (currentQuestionIndex < questionsData.length) {
        currentQuestionEl.textContent = questionsData[currentQuestionIndex].question;
        userAnswerInput.value = ''; // Réinitialiser le champ de réponse
        feedbackEl.textContent = ''; // Effacer le feedback
        feedbackEl.className = 'feedback-message';
    } else {
        // Cela ne devrait pas arriver si checkWin est appelé correctement
        currentQuestionEl.textContent = "Fin des questions. En attente de validation...";
    }
}

/**
 * Met à jour l'affichage des scores.
 */
function updateScoreDisplay() {
    moneySavedEl.textContent = moneySaved;
    successCountEl.textContent = successCount;
}

/**
 * Vérifie si la réponse de l'utilisateur contient un mot-clé correct.
 * @param {string} userAnswer - La réponse soumise par l'utilisateur.
 * @returns {boolean} Vrai si la réponse est correcte.
 */
function checkAnswer(userAnswer) {
    const keywords = questionsData[currentQuestionIndex].correctKeywords;
    const normalizedAnswer = userAnswer.toLowerCase().trim();
    
    // Vérifie si un des mots-clés est inclus dans la réponse
    return keywords.some(keyword => normalizedAnswer.includes(keyword));
}

/**
 * Gère la soumission du formulaire de réponse.
 */
function handleAnswerSubmit(event) {
    event.preventDefault(); // Empêche le rechargement de la page

    const userAnswer = userAnswerInput.value;
    const currentQuestion = questionsData[currentQuestionIndex];

    if (checkAnswer(userAnswer)) {
        // Bonne réponse
        feedbackEl.textContent = `Correct ! Vous avez économisé ${currentQuestion.saveAmount} € en reconditionnant.`;
        feedbackEl.className = 'feedback-message correct';
        
        // Mettre à jour les stats
        moneySaved += currentQuestion.saveAmount;
        successCount++;
        updateScoreDisplay();

        // Réparer le PC (changer l'image)
        pcStatusImageEl.src = currentQuestion.nextImage;
        pcStatusImageEl.alt = "Ordinateur partiellement réparé";
        
        // Passer à la question suivante après un court délai
        currentQuestionIndex++;
        
        // Vérifier si le défi est terminé
        setTimeout(checkWin, 1500);

    } else {
        // Mauvaise réponse
        feedbackEl.textContent = "Mauvaise réponse. Pensez 'reconditionnement' et 'pièces' ! Réessayez.";
        feedbackEl.className = 'feedback-message incorrect';
    }
}

/**
 * Vérifie si le joueur a gagné le défi.
 */
function checkWin() {
    if (successCount >= MAX_SUCCESSES) {
        // Le joueur a gagné
        pcStatusImageEl.src = "pc_fini_placeholder.png";
        pcStatusImageEl.alt = "Ordinateur complètement réparé !";

        questionSection.classList.add('hidden');
        reponseSection.classList.remove('hidden');
        
        document.getElementById('challenge-message').innerHTML = `
            <p style="color:#28a745;">🎉 **VICTOIRE !** Vous avez totalement reconditionné le PC et économisé un total de ${moneySaved} € !</p>
        `;

    } else {
        // Charger la prochaine question
        loadQuestion();
    }
}

/**
 * Réinitialise le jeu.
 */
function resetGame() {
    moneySaved = 0;
    successCount = 0;
    currentQuestionIndex = 0;
    
    updateScoreDisplay();
    
    pcStatusImageEl.src = "pc_casse_placeholder.png";
    pcStatusImageEl.alt = "Ordinateur cassé";

    document.getElementById('challenge-message').innerHTML = '<p>Répondez correctement aux questions pour réparer le PC et économiser de l\'argent !</p>';

    questionSection.classList.remove('hidden');
    reponseSection.classList.add('hidden');
    
    loadQuestion();
}


// --- Événements ---
answerForm.addEventListener('submit', handleAnswerSubmit);
resetButton.addEventListener('click', resetGame);

// --- Initialisation ---
document.addEventListener('DOMContentLoaded', () => {
    loadQuestion();
    updateScoreDisplay();
});

