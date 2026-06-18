(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var open = panel.hasAttribute("hidden");
        if (open) {
          panel.removeAttribute("hidden");
        } else {
          panel.setAttribute("hidden", "");
        }
        toggle.setAttribute("aria-expanded", String(open));
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length > 1) {
      var active = 0;
      var timer = null;
      var setActive = function (next) {
        slides[active].classList.remove("active");
        if (dots[active]) {
          dots[active].classList.remove("active");
        }
        active = (next + slides.length) % slides.length;
        slides[active].classList.add("active");
        if (dots[active]) {
          dots[active].classList.add("active");
        }
      };
      var start = function () {
        timer = window.setInterval(function () {
          setActive(active + 1);
        }, 5200);
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          window.clearInterval(timer);
          setActive(index);
          start();
        });
      });
      start();
    }

    var filterRoot = document.querySelector("[data-filter-root]");
    if (filterRoot) {
      var input = document.querySelector("[data-filter-input]");
      var year = document.querySelector("[data-filter-year]");
      var items = Array.prototype.slice.call(filterRoot.querySelectorAll(".movie-card"));
      var empty = document.querySelector(".empty-result");
      var filter = function () {
        var q = input ? input.value.trim().toLowerCase() : "";
        var y = year ? year.value : "";
        var shown = 0;
        items.forEach(function (item) {
          var haystack = [
            item.getAttribute("data-title"),
            item.getAttribute("data-genre"),
            item.getAttribute("data-region"),
            item.getAttribute("data-year")
          ].join(" ").toLowerCase();
          var ok = (!q || haystack.indexOf(q) !== -1) && (!y || item.getAttribute("data-year") === y);
          item.style.display = ok ? "" : "none";
          if (ok) {
            shown += 1;
          }
        });
        if (empty) {
          empty.style.display = shown ? "none" : "block";
        }
      };
      if (input) {
        input.addEventListener("input", filter);
      }
      if (year) {
        year.addEventListener("change", filter);
      }
      filter();
    }

    var searchRoot = document.querySelector("[data-search-results]");
    if (searchRoot && window.SEARCH_MOVIES) {
      var params = new URLSearchParams(window.location.search);
      var qValue = params.get("q") || "";
      var searchInput = document.querySelector("[data-global-search]");
      if (searchInput) {
        searchInput.value = qValue;
      }
      var render = function (query) {
        var q = query.trim().toLowerCase();
        var list = window.SEARCH_MOVIES.filter(function (movie) {
          if (!q) {
            return true;
          }
          return [movie.title, movie.region, movie.genre, movie.year, movie.tags].join(" ").toLowerCase().indexOf(q) !== -1;
        }).slice(0, 120);
        if (!list.length) {
          searchRoot.innerHTML = '<div class="empty-result" style="display:block">没有找到匹配影片</div>';
          return;
        }
        searchRoot.innerHTML = list.map(function (movie) {
          return '<article class="movie-card">' +
            '<a class="poster-link" href="movies/' + movie.file + '">' +
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="poster-meta">' + movie.score + '</span>' +
            '</a>' +
            '<div class="movie-card-body">' +
            '<a class="movie-title" href="movies/' + movie.file + '">' + escapeHtml(movie.title) + '</a>' +
            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="movie-info"><span>' + movie.year + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
            '<div class="tag-row">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join("") + '</div>' +
            '</div>' +
            '</article>';
        }).join("");
      };
      var form = document.querySelector("[data-search-form]");
      if (form && searchInput) {
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          var value = searchInput.value.trim();
          var url = value ? "search.html?q=" + encodeURIComponent(value) : "search.html";
          window.history.replaceState(null, "", url);
          render(value);
        });
      }
      render(qValue);
    }
  });

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
