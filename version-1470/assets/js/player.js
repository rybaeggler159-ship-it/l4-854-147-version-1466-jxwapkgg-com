(function () {
  window.initMoviePlayer = function (options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    var started = false;
    var hls = null;

    function attach() {
      if (started || !video) {
        return;
      }
      started = true;
      if (button) {
        button.classList.add("hidden");
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = options.src;
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(options.src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            try {
              hls.destroy();
            } catch (error) {}
            video.src = options.src;
          }
        });
      } else {
        video.src = options.src;
        video.play().catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", attach);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!started) {
          attach();
        }
      });
      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("hidden");
        }
      });
    }
  };
})();
