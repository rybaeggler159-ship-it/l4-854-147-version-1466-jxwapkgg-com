(function () {
    var mobileButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (mobileButton && mobilePanel) {
        mobileButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeSlide);
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            showSlide(dotIndex);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupFilters() {
        var grid = document.querySelector('[data-filter-grid]');
        if (!grid) {
            return;
        }

        var searchInput = document.querySelector('[data-filter-search]');
        var regionSelect = document.querySelector('[data-filter-region]');
        var categorySelect = document.querySelector('[data-filter-category]');
        var noResults = document.querySelector('[data-no-results]');
        var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-title]'));

        function applyFilters() {
            var query = normalize(searchInput ? searchInput.value : '');
            var region = regionSelect ? regionSelect.value : '';
            var category = categorySelect ? categorySelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matchesQuery = !query || haystack.indexOf(query) !== -1;
                var matchesRegion = !region || card.getAttribute('data-region') === region;
                var matchesCategory = !category || card.getAttribute('data-category') === category;
                var isVisible = matchesQuery && matchesRegion && matchesCategory;

                card.style.display = isVisible ? '' : 'none';
                if (isVisible) {
                    visible += 1;
                }
            });

            if (noResults) {
                noResults.classList.toggle('is-visible', visible === 0);
            }
        }

        [searchInput, regionSelect, categorySelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');
        if (initialQuery && searchInput) {
            searchInput.value = initialQuery;
        }

        applyFilters();
    }

    setupFilters();
})();

function initMoviePlayer(videoId, sourceUrl) {
    var video = document.getElementById(videoId);
    if (!video) {
        return;
    }

    var shell = video.closest('.player-shell');
    var overlay = shell ? shell.querySelector('.play-overlay') : null;
    var hasLoaded = false;

    function attachSource() {
        if (hasLoaded) {
            return;
        }

        hasLoaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
    }

    function startVideo() {
        attachSource();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener('click', startVideo);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startVideo();
        }
    });

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });
}
