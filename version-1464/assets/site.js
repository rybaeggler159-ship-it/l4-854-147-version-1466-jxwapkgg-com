(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (navButton && mobileNav) {
    navButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function run() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5600);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        run();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        run();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        run();
      });
    }
    run();
  }

  function normalizeText(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-button]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    if (!cards.length) {
      return;
    }
    var activeGroup = 'all';
    function currentQuery() {
      return normalizeText(inputs.map(function (input) {
        return input.value;
      }).join(' '));
    }
    function apply() {
      var query = currentQuery();
      cards.forEach(function (card) {
        var groupMatch = activeGroup === 'all' || card.getAttribute('data-group') === activeGroup;
        var haystack = normalizeText([
          card.getAttribute('data-title'),
          card.getAttribute('data-meta'),
          card.getAttribute('data-tags')
        ].join(' '));
        var queryMatch = !query || haystack.indexOf(query) !== -1;
        card.classList.toggle('is-hidden', !(groupMatch && queryMatch));
      });
    }
    inputs.forEach(function (input) {
      input.addEventListener('input', apply);
    });
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeGroup = button.getAttribute('data-filter-button') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        apply();
      });
    });
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && inputs.length) {
      inputs[0].value = q;
      apply();
    }
  }

  function setupPlayers() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    panels.forEach(function (panel) {
      var video = panel.querySelector('video');
      var trigger = panel.querySelector('.player-cover');
      var url = panel.getAttribute('data-play');
      var started = false;
      var hlsInstance = null;
      if (!video || !trigger || !url) {
        return;
      }
      function safePlay() {
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {});
        }
      }
      function begin() {
        if (started) {
          safePlay();
          return;
        }
        started = true;
        panel.classList.add('is-starting');
        trigger.disabled = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          video.addEventListener('loadedmetadata', safePlay, { once: true });
          panel.classList.add('is-playing');
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            panel.classList.add('is-playing');
            safePlay();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function () {
            panel.classList.add('is-playing');
          });
          return;
        }
        video.src = url;
        panel.classList.add('is-playing');
        safePlay();
      }
      trigger.addEventListener('click', begin);
      video.addEventListener('click', function () {
        if (!started) {
          begin();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
