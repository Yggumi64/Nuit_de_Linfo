function snake() {
  if (!window.konamiUnlocked) {
    console.clear();
    console.log("⛔ Vous n'avez pas encore entré le code Konami !");
    console.log("Faites l'enchainement de touches du code Konami sur la page Web pour jouer au Snake");
    return;
  }

  console.clear();
  console.log("🐍 Snake va démarrer dans 10 secondes !");
  console.log("⚠ Cliquez sur la page web pour reprendre le focus et contrôler le serpent !");
  console.log("Touches : Flèches directionnelles");

  setTimeout(() => {

    console.clear();
    console.log("🐍 Snake lancé !");
    console.log("⚠ Cliquez sur la page web si nécessaire pour contrôler le serpent !");
    console.log("Touches : Flèches directionnelles");

    const size = 15;
    let grid = [];
    let snake = [{ x: 7, y: 7 }];
    let direction = { x: 0, y: -1 };
    let food = spawnFood();
    let gameOver = false;
    let inputLocked = false;

    function snakeKeyHandler(event) {
      event.preventDefault();

      if (inputLocked) return;
      inputLocked = true;
      setTimeout(() => (inputLocked = false), 50);

      const key = event.key.toLowerCase();

      if (key === "arrowup") direction = { x: 0, y: -1 };
      if (key === "arrowdown") direction = { x: 0, y: 1 };
      if (key === "arrowleft") direction = { x: -1, y: 0 };
      if (key === "arrowright") direction = { x: 1, y: 0 };
    }

    document.addEventListener("keydown", snakeKeyHandler, { passive: false });

    const loop = setInterval(() => {
      if (gameOver) {
        clearInterval(loop);
        document.removeEventListener("keydown", snakeKeyHandler);
        console.log("💀 GAME OVER");
        console.log("⬇ Tapez : snake() pour recommencer");
        return;
      }

      update();
      draw();
    }, 250);

    // --- Fonctions du jeu ---
    function update() {
      const head = snake[0];
      const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
      };

      if (newHead.x < 0 || newHead.x >= size || newHead.y < 0 || newHead.y >= size) {
        gameOver = true;
        return;
      }

      if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        gameOver = true;
        return;
      }

      snake.unshift(newHead);

      if (newHead.x === food.x && newHead.y === food.y) {
        food = spawnFood();
      } else {
        snake.pop();
      }
    }

    function spawnFood() {
      let pos;
      do {
        pos = {
          x: Math.floor(Math.random() * size),
          y: Math.floor(Math.random() * size)
        };
      } while (snake.some(seg => seg.x === pos.x && seg.y === pos.y));
      return pos;
    }

    function draw() {
      console.clear();
      grid = [];

      for (let y = 0; y < size; y++) {
        let row = "";
        for (let x = 0; x < size; x++) {
          if (snake[0].x === x && snake[0].y === y) row += "🟩";
          else if (snake.some(seg => seg.x === x && seg.y === y)) row += "🟢";
          else if (food.x === x && food.y === y) row += "🍎";
          else row += "⬛";
        }
        grid.push(row);
      }

      console.log(grid.join("\n"));
    }

  }, 10000);
}
