(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function play() {
        clearInterval(timer);
        timer = setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          play();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          play();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          play();
        });
      }

      show(0);
      play();
    }

    var lists = Array.prototype.slice.call(document.querySelectorAll("[data-filter-list]"));

    lists.forEach(function (list) {
      var section = list.closest("section") || document;
      var input = section.querySelector(".site-search");
      var buttons = Array.prototype.slice.call(section.querySelectorAll(".filter-button"));
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
      var empty = section.querySelector("[data-empty-state]");
      var activeFilter = "all";

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;

        cards.forEach(function (card) {
          var matchesText = !keyword || (card.getAttribute("data-search") || "").indexOf(keyword) !== -1;
          var matchesFilter = activeFilter === "all" || card.getAttribute("data-category") === activeFilter;
          var showCard = matchesText && matchesFilter;
          card.style.display = showCard ? "" : "none";

          if (showCard) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeFilter = button.getAttribute("data-filter") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          apply();
        });
      });

      apply();
    });
  });

  window.MoviePlayer = {
    init: function (videoId, overlayId, url) {
      var video = document.getElementById(videoId);
      var overlay = document.getElementById(overlayId);
      var loaded = false;
      var hlsInstance = null;

      if (!video || !overlay || !url) {
        return;
      }

      function attemptPlay() {
        overlay.classList.add("is-hidden");
        video.controls = true;
        video.play().catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }

      function start() {
        if (!loaded) {
          loaded = true;

          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, attemptPlay);
          } else {
            video.src = url;
          }
        }

        attemptPlay();
      }

      overlay.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (!loaded) {
          start();
        }
      });
      video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
      });
      video.addEventListener("ended", function () {
        overlay.classList.remove("is-hidden");
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
          hlsInstance.destroy();
        }
      });
    }
  };
})();
