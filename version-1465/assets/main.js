(function () {
    function onReady(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide") || 0));
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function initFilters() {
        var input = document.querySelector(".filter-input");
        var select = document.querySelector(".filter-select");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-grid .movie-card"));
        if (!input || !cards.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        if (q) {
            input.value = q;
        }

        function apply() {
            var keyword = normalize(input.value);
            var year = select ? normalize(select.value) : "";
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var yearText = normalize(card.getAttribute("data-year"));
                var matched = (!keyword || haystack.indexOf(keyword) !== -1) && (!year || yearText.indexOf(year) !== -1);
                card.classList.toggle("hidden-by-filter", !matched);
            });
        }

        input.addEventListener("input", apply);
        if (select) {
            select.addEventListener("change", apply);
        }
        apply();
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
        players.forEach(function (shell) {
            var video = shell.querySelector("video");
            var button = shell.querySelector(".play-overlay");
            var stream = shell.getAttribute("data-stream");
            var loaded = false;

            function attach() {
                if (loaded || !video || !stream) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls) {
                    var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    shell.hlsInstance = hls;
                } else {
                    video.src = stream;
                }
                loaded = true;
            }

            function play() {
                attach();
                shell.classList.add("is-playing");
                if (video) {
                    var promise = video.play();
                    if (promise && promise.catch) {
                        promise.catch(function () {});
                    }
                }
            }

            if (button) {
                button.addEventListener("click", play);
            }

            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        play();
                    }
                });
                video.addEventListener("play", function () {
                    shell.classList.add("is-playing");
                });
            }
        });
    }

    onReady(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
