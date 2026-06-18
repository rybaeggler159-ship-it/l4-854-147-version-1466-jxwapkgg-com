(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function move(step) {
      show(current + step);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        move(1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        move(1);
        restart();
      });
    }

    if (slides.length > 1) {
      restart();
    }
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-form]").forEach(function (form) {
      var scope = form.parentElement || document;
      var input = form.querySelector("[data-filter-input]");
      var genre = form.querySelector("[data-filter-genre]");
      var year = form.querySelector("[data-filter-year]");
      var reset = form.querySelector("[data-filter-reset]");
      var result = form.querySelector("[data-filter-result]");
      var list = scope.querySelector("[data-filter-list]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var genreValue = genre ? genre.value : "";
        var yearValue = year ? year.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var cardGenre = card.getAttribute("data-genre") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var matched = true;
          if (query && text.indexOf(query) === -1) {
            matched = false;
          }
          if (genreValue && cardGenre.indexOf(genreValue) === -1) {
            matched = false;
          }
          if (yearValue && cardYear !== yearValue) {
            matched = false;
          }
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (result) {
          result.textContent = visible + " 部影片";
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (genre) {
        genre.addEventListener("change", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
      if (reset) {
        reset.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (genre) {
            genre.value = "";
          }
          if (year) {
            year.value = "";
          }
          apply();
        });
      }
      apply();
    });
  }

  function setupImages() {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.remove();
      }, { once: true });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupImages();
  });
})();
