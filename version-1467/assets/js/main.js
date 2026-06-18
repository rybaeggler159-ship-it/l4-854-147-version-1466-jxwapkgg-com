(function () {
  var body = document.body;
  var root = body ? body.getAttribute("data-root") || "" : "";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
      toggle.textContent = panel.classList.contains("open") ? "×" : "☰";
    });
  }

  function initHeaderSearch() {
    document.querySelectorAll("[data-header-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = root + "search.html";
        if (value) {
          target += "?q=" + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        schedule();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        schedule();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot") || 0));
        schedule();
      });
    });
    show(0);
    schedule();
  }

  function initFilter() {
    var input = document.querySelector("[data-filter-input]");
    var clear = document.querySelector("[data-filter-clear]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    if (!input || !cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (query) {
      input.value = query;
    }

    function apply() {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-tags") || "")).toLowerCase();
        card.classList.toggle("hidden", value && haystack.indexOf(value) === -1);
      });
    }

    input.addEventListener("input", apply);
    if (clear) {
      clear.addEventListener("click", function () {
        input.value = "";
        apply();
        input.focus();
      });
    }
    apply();
  }

  function initPlayers() {
    document.querySelectorAll("[data-video-card]").forEach(function (card) {
      var video = card.querySelector("video");
      var trigger = card.querySelector("[data-play-trigger]");
      if (!video) {
        return;
      }
      var source = video.querySelector("source");
      var stream = source ? source.getAttribute("src") : video.currentSrc || video.src;
      var started = false;
      var hls = null;

      function attach() {
        if (started || !stream) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            maxBufferLength: 30,
            backBufferLength: 30
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        started = true;
      }

      function play() {
        attach();
        card.classList.add("is-playing");
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      if (trigger) {
        trigger.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        card.classList.add("is-playing");
      });
      window.addEventListener("beforeunload", function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHeaderSearch();
    initHero();
    initFilter();
    initPlayers();
  });
})();
