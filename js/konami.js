const konamiCode = [
  "arrowup","arrowup",
  "arrowdown","arrowdown",
  "arrowleft","arrowright",
  "arrowleft","arrowright",
  "b","a"
];

let position = 0;
window.konamiUnlocked = false

document.addEventListener("keydown", function (event) {
  const key = String(event.key).toLowerCase();

  if (key === konamiCode[position]) {
    position++;

    if (position === konamiCode.length) {
      window.konamiUnlocked = true;
      alert("Ouvrez la console (F12) et tapez snake() pour jouer !");
      console.log("✔ Code Konami validé !");
      console.log("Tapez maintenant : snake()");
      position = 0;
    }
  } else {
    position = 0;
    if (key === konamiCode[0]) {
      position = 1;
    }
  }
});
