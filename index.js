// Inject the shaking CSS into the parent dom
const cssTemplate = document.createElement('template');
cssTemplate.innerHTML = `
  <link rel="stylesheet" type="text/css" href="https://csshake.surge.sh/csshake.min.css">
`;
document.querySelector('head').appendChild(cssTemplate.content.cloneNode(true));


class MediaWoofer extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // const playerSelector = this.getAttribute('player');

    window.addEventListener('click', ()=>{
      if (window.wooferLoaded) {
        return;
      }
      window.wooferLoaded = true;

      document.querySelectorAll('audio, video').forEach((el)=>{
        this.activateMedia(el);
      });
    });

  }

  disconnectedCallback() {}

  activateMedia(media) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const audioSrc = ctx.createMediaElementSource(media);
    const analyser = ctx.createAnalyser();
    audioSrc.connect(analyser);
    analyser.connect(ctx.destination);
    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const renderFrame = () => {
      if (media.paused) {
        media.classList.remove(...['shake', 'shake-constant']);
        return;
      }

      requestAnimationFrame(renderFrame);

      analyser.getByteFrequencyData(dataArray);

      let bass = false;

      for(let i = 0; i < 8; i++) {
        if (dataArray[i] > 248) {
          bass = true;
        }
      }

      if (bass) {
        media.classList.add('shake', 'shake-constant');
        window.navigator.vibrate(100);
      } else {
        media.classList.remove('shake', 'shake-constant');
        window.navigator.vibrate(0);
      }
    }

    media.addEventListener('play', renderFrame);
    if (!media.paused) renderFrame();
  }
}

if (!window.customElements.get('media-woofer')) {
  window.customElements.define('media-woofer', MediaWoofer);
  window.MediaWoofer = MediaWoofer;
}

export default MediaWoofer;
