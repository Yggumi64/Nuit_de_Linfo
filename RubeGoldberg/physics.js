// --- CONFIGURATION ---
// Raccourcis pour rendre le code plus lisible
const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite,
      Events = Matter.Events;

// Initialisation du moteur
const engine = Engine.create();
const world = engine.world;

// Dimensions du mondecreerMurInvisible
const worldHeight = 5000; // La longueur totale de ta machine
const width = window.innerWidth;

// --- CRÉATION DU RENDU (CANVAS) ---
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: width,
        height: worldHeight,
        wireframes: false, // Met à true si tu veux voir les "lignes" de debug
        background: 'transparent'
    }
});


// --- 🛠️ KIT DE CONSTRUCTION RAPIDE (NUIT DE L'INFO) ---

// Une PLANCHE FIXE (Mur/Sol) ---
function creerMur(x, y, w, h, angle = 0, couleur = '#f0932b') {
    return Bodies.rectangle(x, y, w, h, {
        isStatic: true,
        angle: angle,
        render: { fillStyle: couleur }
    });
}


// LE BUMPER (Boule Fixe qui fait BOING) ---
function creerBumper(x, y, rayon) {
    return Bodies.circle(x, y, rayon, {
        isStatic: true, // Elle ne bouge pas
        restitution: 1.2, // Ça rebondit très fort (plus que 1 = trampoline)
        render: { fillStyle: '#e74c3c' } // Rouge
    });
}

// LA BALLE MOBILE (À pousser) ---
function creerBalleMobile(x, y, rayon) {
    return Bodies.circle(x, y, rayon, {
        isStatic: false, // Elle bouge !
        density: 0.04,   // Même poids que ta balle principale
        restitution: 0.3, // Rebondit un peu
        friction: 0.05,   // Roule bien
        render: { fillStyle: '#3498db' } // Bleu
    });
}

// MUR INVISIBLE ---
function creerMurInvisible(x, y, w, h) {
    return Bodies.rectangle(x, y, w, h, {
        isStatic: true, // Il ne bouge pas
        render: { 
            visible: false // C'est ici que la magie opère !
        }
    });
}


// Un objet qui tombe (ex: domino ou caisse) ---
function creerCaisse(x, y, w, h) {
    return Bodies.rectangle(x, y, w, h, {
        isStatic: false, // Il tombe !
        density: 0.05,
        friction: 0.1,
        render: { fillStyle: '#f9ca24' }
    });
}

// LE MOULIN (Obstacle rotatif complet en 1 ligne) ---
function creerMoulin(x, y, w, h) {
    const planche = Bodies.rectangle(x, y, w, h, { 
        isStatic: false, density: 0.1, render: { fillStyle: '#6ab04c' } 
    });
    const clou = Matter.Constraint.create({
        pointA: { x: x, y: y }, bodyB: planche, pointB: { x: 0, y: 0 },
        stiffness: 1, length: 0, render: { visible: true }
    });
    return [planche, clou]; // Retourne les deux d'un coup
}

// DECLENCHEUR INVISIBLE ---
// x, y : position
// w, h : taille de la zone
// idHtml : L'ID de l'élément HTML à faire apparaître (ex: 'titre-site')
function creerDeclencheur(x, y, w, h, idHtml) {
    return Bodies.rectangle(x, y, w, h, {
        isSensor: true, // IMPORTANT : La balle traverse !
        isStatic: true,
        label: idHtml, // On stocke l'ID ici pour le retrouver plus tard
        render: { 
            fillStyle: '#00ff00', // Vert fluo pour le voir en debug
            opacity: 0.3,         // Semi-transparent
            visible: true        // Mets à false à la fin pour le cacher totalement
        }
    });
}

    // MUR CASSABLE 🧊 ---
function creerMurCassable(x, y, w, h) {
    return Bodies.rectangle(x, y, w, h, {
        isStatic: true, // Il tient en l'air
        label: 'cassable', // C'est l'étiquette importante !
        render: { 
            fillStyle: '#74b9ff', // Bleu clair (Glace/Verre)
            strokeStyle: 'white',
            lineWidth: 2
        }
    });
}

// LE PENDULE (Boulet de démolition) 💣 ---
// x, y : Le point d'accroche (le clou au plafond)
// longueur : La longueur de la corde
// rayon : La taille de la boule au bout
function creerPendule(x, y, longueur, rayon) {
    // 1. On crée la boule (Le poids)
    // On la place décalée vers la droite (+ longueur) pour qu'elle commence déjà à se balancer !
    const boule = Bodies.circle(x + longueur, y - (longueur/2), rayon, { 
        density: 0.04,      // Assez lourd pour pousser ta balle
        frictionAir: 0.005, // Coupe très peu l'air (pour balancer longtemps)
        restitution: 0.9,   // Boing !
        render: { fillStyle: '#2c3e50' } // Gris foncé métal
    });

    // 2. On crée la corde (La contrainte)
    const corde = Matter.Constraint.create({
        pointA: { x: x, y: y }, // Le point fixe
        bodyB: boule,           // Le poids
        length: longueur,       // La longueur
        stiffness: 1,           // 1 = Corde d'acier (pas élastique)
        render: { 
            visible: true,
            lineWidth: 3,
            strokeStyle: '#2c3e50'
        }
    });

    return [boule, corde];
}

// LE PENDULE IMMOBILE (Sac de frappe) 🥊 ---
function creerPenduleImmobile(x, y, longueur, rayon) {
    // 1. La boule est placée VERTICALEMENT sous le point d'accroche
    const boule = Bodies.circle(x, y + longueur, rayon, { 
        density: 0.04,
        frictionAir: 0.005,
        restitution: 0.9,
        render: { fillStyle: '#7f8c8d' } // Gris clair (plus passif)
    });

    // 2. La corde
    const corde = Matter.Constraint.create({
        pointA: { x: x, y: y },
        bodyB: boule,
        length: longueur,
        stiffness: 1,
        render: { visible: true, lineWidth: 3, strokeStyle: '#7f8c8d' }
    });

    return [boule, corde];
}



// --- CRÉATION DES OBSTACLES ---
const obstacles = [];


// --- 🏗️ ZONE DE CONSTRUCTION DU NIVEAU ---

obstacles.push(

    // Quand la balle traverse ce truc vert, la pop-up saute au visage !


    /*
    // Une pile de caisses à renverser
    creerMur(window.innerWidth/2 - 100, 800, 200, 10), // Le sol des caisses
    creerCaisse(window.innerWidth/2 - 150, 750, 40, 40),
    creerCaisse(window.innerWidth/2 - 100, 750, 40, 40),
    creerCaisse(window.innerWidth/2 - 50, 750, 40, 40),
    */

    // --- MAIN ---

    // Mur Invisible GAUCHE (x=0)
    // On le décale un peu à gauche (-50) pour qu'il ne gêne pas le visuel
    creerMurInvisible(-50, worldHeight / 2, 100, worldHeight), 

    // Mur Invisible DROITE (x=Largeur écran)
    // On le décale un peu à droite (+50)
    creerMurInvisible(window.innerWidth + 50, worldHeight / 2, 100, worldHeight),

    // Sol de fin
    creerMur(window.innerWidth/2, 5000, 3000, 50, 0),
    //creerMurCassable(window.innerWidth/2, 5000, 3000, 20),
    //creerDeclencheur(window.innerWidth/2, 4800, 3000, 50, 'section-info'),
    creerDeclencheur(window.innerWidth/2, 4700, 3000, 50, 'ma-popup'),


    // Plafond
    creerMur(window.innerWidth/2, 0, 3000, 20, 0),

    // --- LV 1 ---

    


    creerBalleMobile(window.innerWidth/2 - 180, 1400,15),
    creerMur(window.innerWidth/2 - 180, 1500, 100, 10, Math.PI / 2),

    creerBalleMobile(window.innerWidth/2 - 180, 1575,15),
    creerMur(window.innerWidth/2 - 180, 1675, 100, 10, Math.PI / 2),

    creerBalleMobile(window.innerWidth/2 - 100, 1575,15),
    creerMur(window.innerWidth/2 - 100, 1500, 100, 10, Math.PI / 2),

    creerBalleMobile(window.innerWidth/2 - 100, 1750,15),
    creerMur(window.innerWidth/2 - 100, 1850, 100, 10, Math.PI / 2),

    creerBalleMobile(window.innerWidth/2 - 180, 1750,15),
    creerMur(window.innerWidth/2 - 180, 1850, 100, 10, Math.PI / 2),

    creerBalleMobile(window.innerWidth/2 - 100, 1400,15),
    creerMur(window.innerWidth/2 - 100, 1875, 500, 10, Math.PI / 2),

    creerMur(window.innerWidth/2 - 100, 2048, 100, 20,-(Math.PI / 12)),
    creerMur(window.innerWidth/2 + 300, 2048, 700, 20,-(Math.PI / 6)),
    creerMur(window.innerWidth/2 - 600, 2000, 1000, 20,-(11*Math.PI / 6)),


    creerMur(window.innerWidth/2 - 300, 2250, 200, 20, -5),
    creerMur(window.innerWidth/2, 2250, 300, 20,-(Math.PI / 6)),
    creerMur(window.innerWidth/2 -100, 2450, 400, 20,-(11*Math.PI / 6)),

    creerMur(window.innerWidth/2 + 200, 2550, 200, 20, 5),
    creerMur(window.innerWidth/2 + 100, 2650, 200, 20,-(Math.PI / 12)),
    //creerMur(window.innerWidth/2 - 75, 2700, 75, 20,-(Math.PI / 12)),
    //creerMur(window.innerWidth/2 - 200, 2750, 75, 20,-(Math.PI / 12)),

    creerMur(window.innerWidth/2 -525, 1900, 200, 20, Math.PI/2),
    creerMur(window.innerWidth/2 - 50, 2180, 200, 20, Math.PI/2),
    creerMur(window.innerWidth/2 - 400, 1800, 400, 20),


    creerMurCassable(window.innerWidth/2 -125, 3005, 100, 20, 0),

    creerMur(window.innerWidth/2 - 200, 3110, 200, 20, (Math.PI/12)),

    creerMur(window.innerWidth/2 + 50, 3412, 200, 20, -(Math.PI/2.5)),
    creerMur(window.innerWidth/2, 3600, 200, 20, 5),
    creerMur(window.innerWidth/2 -50, 3700, 200, 20, -(Math.PI/3)),
    creerMur(window.innerWidth/2 -100, 3750, 200, 20, -(Math.PI/4)),
    creerMur(window.innerWidth/2 -150, 3775, 200, 20, -(Math.PI/6)),
    creerMur(window.innerWidth/2 -250, 3775, 200, 20),
    creerMur(window.innerWidth/2 -300, 3775, 200, 20, (Math.PI/6)),

    /*
    creerCaisse(window.innerWidth/2 - 850, 4900, 60, 60),
    creerCaisse(window.innerWidth/2 - 700, 4900, 60, 60),
    creerCaisse(window.innerWidth/2 - 800, 4900, 60, 60),
    creerCaisse(window.innerWidth/2 - 750, 4900, 60, 60),
    creerCaisse(window.innerWidth/2 - 850, 4850, 60, 60),
    creerCaisse(window.innerWidth/2 - 700, 4850, 60, 60),
    creerCaisse(window.innerWidth/2 - 800, 4850, 60, 60),
    creerCaisse(window.innerWidth/2 - 750, 4850, 60, 60),
    */
    









    creerMur(window.innerWidth/2 + 40, 500, 200, 20),
    
    
    // Un pendule accroché au milieu, corde de 200px, boule de 40px
    ...creerPendule(window.innerWidth/2, 200, 200, 40),
    ...creerPenduleImmobile(700, 300, 150, 25),
    ...creerPenduleImmobile(750, 300, 150, 25), // 350 = 300 + (25*2) donc ils se collent
    ...creerPenduleImmobile(800, 300, 150, 25)
    



    
    /* Declencheur

    // Un déclencheur juste avant le premier obstacle
    creerDeclencheur(window.innerWidth/2, 250, 400, 50, 'titre-site'),

    // Un autre plus bas
    creerDeclencheur(window.innerWidth/2, 700, 400, 50, 'section-info'),
    */
);




// Ajout de tous les obstacles au monde
Composite.add(world, obstacles);

// --- INTERACTION ET DÉMARRAGE ---
const startBtn = document.getElementById('start-btn');

startBtn.addEventListener('click', function() {

    // 1. On cache le bouton
    //startBtn.style.display = 'none';

    // On ajoute la classe CSS qui fait partir le bouton vers le haut
    startBtn.classList.add('decollage');

    // 2. On crée la balle (Héros)
    const ball = Bodies.circle(width / 2, 100, 30, {
        restitution: 0.5, // Ça rebondit bien
        density: 0.04,    // Assez lourd
        frictionAir: 0.005, // Résistance de l'air
        render: { fillStyle: '#ff4757' }
    });
    Composite.add(world, ball);

    // 3. On lance le moteur
    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // 4. SYSTÈME DE CAMÉRA (Suivi automatique)
    Events.on(engine, 'afterUpdate', function() {
        // On calcule où la fenêtre doit scroller pour centrer la balle
        // "position de la balle" - "moitié de la hauteur de l'écran"
        let targetScroll = ball.position.y - (window.innerHeight / 2);
        
        // On applique le scroll
        window.scrollTo(0, targetScroll);

        // Optionnel : Vérifier si la balle est arrivée en bas
        if(ball.position.y >= worldHeight - 100) {
            console.log("Arrivée !");
        }
    });


// --- 🚑 MODE DÉBUG (A supprimer avant de rendre le projet) ---

document.addEventListener('click', function(e) {
    // Calcule la position réelle dans le monde (en prenant en compte le scroll)
    const x = Math.round(e.clientX);
    const y = Math.round(e.clientY + window.scrollY); // Important !
    
    const code = `creerMur(${x}, ${y}, 200, 20, 0),`;
    console.log(`%c COPIE ÇA : `, 'background: #222; color: #bada55');
    console.log(code);

// --- GESTION DES COLLISIONS (CERVEAU V2) ---

Events.on(engine, 'collisionStart', function(event) {
    const pairs = event.pairs;

    pairs.forEach(function(pair) {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        // 1. GESTION DES DÉCLENCHEURS (Texte qui apparaît)
        checkTrigger(bodyA);
        checkTrigger(bodyB);

        // 2. GESTION DES MURS CASSABLES 🧊
        // Si l'objet A est cassable, on le supprime
        if (bodyA.label === 'cassable') {
            Composite.remove(world, bodyA);
        }
        // Si l'objet B est cassable, on le supprime
        if (bodyB.label === 'cassable') {
            Composite.remove(world, bodyB);
        }
    });
});

function checkTrigger(body) {
    // Si l'objet a un label et que ce label correspond à un élément HTML existant
    if (body.label && document.getElementById(body.label)) {
        const element = document.getElementById(body.label);
        
        // On ajoute la classe CSS qui fait apparaître l'élément
        element.classList.add('element-visible');
        element.classList.remove('element-cache');
        
        // Optionnel : On change la couleur du capteur pour dire "Validé"
        body.render.fillStyle = '#fab1a0';
    }
}

    });
});