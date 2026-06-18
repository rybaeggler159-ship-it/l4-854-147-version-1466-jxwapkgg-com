(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupPlayer(box) {
    var video = box.querySelector("video");
    var button = box.querySelector("[data-play-button]");
    var source = box.getAttribute("data-src");
    var loaded = false;
    var hls = null;

    function attachSource() {
      if (loaded || !video || !source) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        box.hls = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      attachSource();
      box.classList.add("playing");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          box.classList.remove("playing");
        });
      }
    }

    if (button) {
      button.addEventListener("click", playVideo);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
          box.classList.remove("playing");
        }
      });
      video.addEventListener("play", function () {
        box.classList.add("playing");
      });
      video.addEventListener("pause", function () {
        if (!video.seeking) {
          box.classList.remove("playing");
        }
      });
    }
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(setupPlayer);
  });
})();
