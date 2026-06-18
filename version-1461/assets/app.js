(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slider = qs('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = qsa('[data-hero-slide]', slider);
    var dots = qsa('[data-hero-dot]', slider);
    if (slides.length < 2) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot'));
        show(index);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function initFilters() {
    var panels = qsa('[data-filter-panel]');
    panels.forEach(function (panel) {
      var input = qs('[data-filter-input]', panel);
      var year = qs('[data-filter-year]', panel);
      var category = qs('[data-filter-category]', panel);
      var section = panel.closest('section') || document;
      var cards = qsa('[data-movie-card]', section);
      var empty = qs('[data-empty-state]', section);
      var preset = getQuery();
      if (input && preset) {
        input.value = preset;
      }

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var yearValue = year ? year.value : 'all';
        var categoryValue = category ? category.value : 'all';
        var visible = 0;
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.textContent
          ].join(' ').toLowerCase();
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesYear = yearValue === 'all' || card.getAttribute('data-year') === yearValue;
          var matchesCategory = categoryValue === 'all' || card.getAttribute('data-category') === categoryValue;
          var keep = matchesQuery && matchesYear && matchesCategory;
          card.classList.toggle('is-hidden', !keep);
          if (keep) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, year, category].forEach(function (element) {
        if (element) {
          element.addEventListener('input', apply);
          element.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function showPlayerMessage(shell, text) {
    var box = qs('[data-player-message]', shell);
    if (!box) {
      return;
    }
    box.textContent = text;
    box.classList.add('is-visible');
    window.setTimeout(function () {
      box.classList.remove('is-visible');
    }, 3600);
  }

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function initPlayer() {
    var shells = qsa('[data-player]');
    shells.forEach(function (shell) {
      var video = qs('[data-player-video]', shell);
      var button = qs('[data-player-button]', shell);
      var url = shell.getAttribute('data-video-url');
      var hlsInstance = null;
      if (!video || !button || !url) {
        return;
      }

      function play() {
        shell.classList.add('is-playing');
        if (hlsInstance || video.getAttribute('src')) {
          video.play().catch(function () {
            showPlayerMessage(shell, '请再次点击播放');
          });
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          video.play().catch(function () {
            showPlayerMessage(shell, '请再次点击播放');
          });
          return;
        }
        loadHls().then(function (Hls) {
          if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {
                showPlayerMessage(shell, '请再次点击播放');
              });
            });
            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                showPlayerMessage(shell, '播放暂时不可用');
              }
            });
          } else {
            video.src = url;
            video.play().catch(function () {
              showPlayerMessage(shell, '播放暂时不可用');
            });
          }
        }).catch(function () {
          video.src = url;
          video.play().catch(function () {
            showPlayerMessage(shell, '播放暂时不可用');
          });
        });
      }

      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.currentTime) {
          shell.classList.remove('is-playing');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
