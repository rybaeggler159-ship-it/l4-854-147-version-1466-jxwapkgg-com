
(function(){
  function ready(fn){if(document.readyState!=='loading')fn();else document.addEventListener('DOMContentLoaded',fn)}
  ready(function(){
    document.querySelectorAll('[data-player]').forEach(function(box){
      var video=box.querySelector('video'),overlay=box.querySelector('[data-play-overlay]'),loading=box.querySelector('[data-player-loading]'),playBtn=box.querySelector('[data-play-toggle]'),muteBtn=box.querySelector('[data-mute-toggle]'),fullBtn=box.querySelector('[data-fullscreen]'),hlsSrc=box.getAttribute('data-hls'),mp4Src=box.getAttribute('data-mp4'),hls=null;
      function hideLoading(){if(loading)loading.classList.add('hidden')}
      function showOverlay(){if(overlay)overlay.classList.remove('hidden')}
      function hideOverlay(){if(overlay)overlay.classList.add('hidden')}
      function loadMp4(){if(mp4Src){video.src=mp4Src;video.load();hideLoading()}}
      if(hlsSrc&&window.Hls&&window.Hls.isSupported()){
        hls=new window.Hls({enableWorker:true,lowLatencyMode:true});
        hls.loadSource(hlsSrc);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED,function(){hideLoading()});
        hls.on(window.Hls.Events.ERROR,function(evt,data){if(data&&data.fatal){try{hls.destroy()}catch(e){}loadMp4()}});
      }else if(hlsSrc&&video.canPlayType('application/vnd.apple.mpegurl')){video.src=hlsSrc;video.addEventListener('loadedmetadata',hideLoading,{once:true})}else{loadMp4()}
      video.addEventListener('canplay',hideLoading);
      video.addEventListener('play',hideOverlay);
      video.addEventListener('pause',showOverlay);
      function toggle(){if(video.paused){video.play().catch(function(){})}else{video.pause()}}
      if(overlay)overlay.addEventListener('click',toggle);
      if(playBtn)playBtn.addEventListener('click',toggle);
      video.addEventListener('click',toggle);
      if(muteBtn)muteBtn.addEventListener('click',function(){video.muted=!video.muted;muteBtn.textContent=video.muted?'取消静音':'静音'});
      if(fullBtn)fullBtn.addEventListener('click',function(){if(document.fullscreenElement){document.exitFullscreen()}else{box.requestFullscreen&&box.requestFullscreen()}});
    })
  })
})();
