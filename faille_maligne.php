<?php
// faille_maligne.php
// DÉFI : "La Porte Ouverte"
// TYPE : Command Injection (RCE) leading to Reverse Shell

$output = "";
$ip_cible = "";

if (isset($_POST['ip'])) {
    $ip_cible = $_POST['ip'];

    // --- LA FAILLE EST ICI ---
    // Le code prend l'entrée utilisateur et la colle directement dans une commande shell.
    // L'opérateur ";" permet d'exécuter une deuxième commande après le ping.
    
    // Windows utilise 'ping -n', Linux utilise 'ping -c'
    // On détecte l'OS pour que le ping marche, mais la faille reste la même.
    if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
        $cmd = "ping -n 3 " . $ip_cible;
    } else {
        $cmd = "ping -c 3 " . $ip_cible;
    }

    // shell_exec exécute la commande et retourne le résultat complet (texte)
    // 2>&1 permet de voir aussi les erreurs (utile pour le debug/hack)
    $output = shell_exec($cmd . " 2>&1");
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Goliath Admin Tool</title>
    <style>
        body { background-color: #1a1a1a; color: #00ff00; font-family: 'Courier New', monospace; padding: 50px; }
        .container { max-width: 800px; margin: 0 auto; border: 2px solid #00ff00; padding: 20px; box-shadow: 0 0 15px #00ff00; }
        h1 { text-align: center; text-transform: uppercase; border-bottom: 1px dashed #00ff00; padding-bottom: 10px; }
        input[type="text"] { width: 70%; padding: 10px; background: black; border: 1px solid #00ff00; color: #00ff00; font-family: inherit; }
        button { width: 25%; padding: 10px; background: #00ff00; color: black; border: none; font-weight: bold; cursor: pointer; }
        button:hover { background: #ccffcc; }
        pre { background: black; border: 1px solid #333; padding: 15px; white-space: pre-wrap; margin-top: 20px; }
        .warning { color: red; font-size: 0.8em; text-align: center; margin-top: 10px; }
    </style>
</head>
<body>

<div class="container">
    <h1>System Diagnostic Tool</h1>
    <p>Vérification de la connectivité serveur.</p>

    <form method="POST">
        <input type="text" name="ip" placeholder="Entrez une IP (ex: 8.8.8.8)" value="<?= htmlspecialchars($ip_cible) ?>" required autocomplete="off">
        <button type="submit">EXECUTE</button>
    </form>

    <?php if ($output): ?>
        <pre><?= htmlspecialchars($output) ?></pre>
    <?php endif; ?>

    <div class="warning">
        AUTHORIZED PERSONNEL ONLY - MONITORING ACTIVE
    </div>
</div>

</body>
</html>
