// Inject the shaking CSS into the parent dom
const cssTemplate = document.createElement('template');
cssTemplate.innerHTML = `
  <link rel="stylesheet" type="text/css" href="https://csshake.surge.sh/csshake.min.css">
`;
document.querySelector('head').appendChild(cssTemplate.content.cloneNode(true));

let WOOFER_ENABLED = false;

class MediaWoofer extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const mediaAttr = this.getAttribute('media');
    const media = mediaAttr && document.querySelector(mediaAttr);
    let medias = media ? [media] : document.querySelectorAll('audio, video');

    const enableMedias = (evt) => {
      if (WOOFER_ENABLED) return;

      medias.forEach((media)=>{
        this.activateMedia(media);
      });

      WOOFER_ENABLED = true;
      window.removeEventListener('click', enableMedias);
      medias.forEach((media)=>{
        media.removeEventListener('play', enableMedias);
      });
    };

    window.addEventListener('click', enableMedias, false);
    medias.forEach((media)=>{
      media.addEventListener('play', enableMedias, false);
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
        const vibrateTime = window.MEDIA_WOOFER_VIBRATE || 100;
        media.classList.add('shake', 'shake-constant');
        window.navigator.vibrate && window.navigator.vibrate(100);
      } else {
        media.classList.remove('shake', 'shake-constant');
        window.navigator.vibrate && window.navigator.vibrate(0);
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
