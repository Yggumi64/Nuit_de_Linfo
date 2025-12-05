document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    let score = Number(params.get('score')) || 0;

    const scoreSpan = document.getElementById('score');
    if (scoreSpan) scoreSpan.textContent = score;

    function updateNavLinks(newScore) {
        // Update all nav buttons that use data-href
        document.querySelectorAll('.nav-btn').forEach(btn => {
            const href = btn.dataset.href;
            if (!href) return;
            try {
                const target = new URL(href, window.location.href);
                target.searchParams.set('score', String(newScore));
                btn.dataset.fullHref = target.toString();
            } catch (e) {
                // ignore invalid URLs
            }
        });

        // Update anchor tags with class preserve-score
        document.querySelectorAll('a.preserve-score').forEach(a => {
            const href = a.getAttribute('href');
            if (!href) return;
            try {
                const target = new URL(href, window.location.href);
                target.searchParams.set('score', String(newScore));
                a.setAttribute('href', target.toString());
            } catch (e) {}
        });
    }

    // Wire up nav buttons to navigate while preserving score
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const href = btn.dataset.href;
            if (!href) return;
            const target = new URL(href, window.location.href);
            target.searchParams.set('score', String(score));
            window.location.href = target.toString();
        });
    });

    // expose helper to update score from other scripts
    window.updateScoreNav = function(newScore) {
        score = Number(newScore) || 0;
        if (scoreSpan) scoreSpan.textContent = score;
        updateNavLinks(score);
    };

    // initialize link HREFs
    updateNavLinks(score);
});
