// CSShake's `shake-base` keyframes as [x px, y px, rotate deg], one every 2% of a 100ms loop.
// Played with the Web Animations API rather than CSShake's classes, so the shake also reaches
// media rendered inside a shadow root (e.g. Video.js's <hls-video>), which page styles can't.
const SHAKE_STEPS = [
  [0, 0, 0], [-1.5, 1.5, 0.5], [-2.5, -1.5, -1.5], [-0.5, 1.5, -1.5], [1.5, -0.5, -1.5],
  [0.5, -0.5, -0.5], [0.5, -1.5, -0.5], [-0.5, 0.5, -1.5], [1.5, -0.5, 0.5], [1.5, 1.5, 0.5],
  [-2.5, 0.5, 0.5], [-0.5, 0.5, -0.5], [1.5, -1.5, 0.5], [-2.5, 1.5, -0.5], [-2.5, 0.5, -0.5],
  [1.5, 1.5, -0.5], [0.5, 1.5, 0.5], [1.5, 1.5, -0.5], [1.5, -1.5, -0.5], [-1.5, 1.5, 0.5],
  [0.5, -2.5, -0.5], [-2.5, -0.5, -0.5], [-2.5, -0.5, -0.5], [-1.5, -0.5, -0.5], [-2.5, 1.5, -0.5],
  [-0.5, -2.5, 0.5], [0.5, 1.5, -1.5], [-0.5, -2.5, 0.5], [-0.5, 0.5, -0.5], [-0.5, 1.5, 0.5],
  [0.5, -2.5, 0.5], [1.5, -2.5, 0.5], [-1.5, 1.5, -0.5], [-0.5, 1.5, -0.5], [-1.5, -0.5, 0.5],
  [0.5, 0.5, -0.5], [1.5, 1.5, 0.5], [1.5, -1.5, -1.5], [1.5, 1.5, -1.5], [-2.5, -1.5, -1.5],
  [0.5, 1.5, -0.5], [-2.5, -1.5, 0.5], [-0.5, -1.5, -0.5], [-1.5, 0.5, -0.5], [1.5, 0.5, -0.5],
  [0.5, -1.5, -1.5], [0.5, 0.5, -1.5], [1.5, 1.5, 0.5], [-1.5, -1.5, -1.5], [-2.5, -0.5, -1.5],
];

const SHAKE_KEYFRAMES = SHAKE_STEPS.map(([x, y, deg], i) => ({
  offset: i * 0.02,
  transform: `translate(${x}px, ${y}px) rotate(${deg}deg)`,
  easing: 'ease-in-out',
}));

const SHAKE_TIMING = { duration: 100, iterations: Infinity };

// Every <audio> and <video> under `root`, including ones inside open shadow roots, which is
// where media elements like Video.js's <hls-video> and <mux-video> render their <video>.
function findMedias(root) {
  const medias = [...root.querySelectorAll('audio, video')];

  root.querySelectorAll('*').forEach((el) => {
    if (el.shadowRoot) medias.push(...findMedias(el.shadowRoot));
  });

  return medias;
}

// A media can be routed through Web Audio only once, so woofers sharing one activate it once.
const ACTIVE_MEDIAS = new WeakSet();

class MediaWoofer extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // Medias are looked up when the woofer enables, not now: a player's media elements may not
    // have rendered their <video> yet when this element connects.
    const enableMedias = (evt) => {
      if (this.enabled) return;

      this.getMedias().forEach((media)=>{
        if (ACTIVE_MEDIAS.has(media)) return;

        ACTIVE_MEDIAS.add(media);
        this.activateMedia(media);
      });

      this.enabled = true;
      window.removeEventListener('click', enableMedias);
      document.removeEventListener('play', enableMedias, true);
    };

    window.addEventListener('click', enableMedias, false);
    // `play` doesn't bubble, so listen while it travels down to the media.
    document.addEventListener('play', enableMedias, true);
  }

  disconnectedCallback() {}

  // The `media` attribute's media, else the media in the nearest ancestor that has any (such as a
  // Video.js player around this element), else every media on the page.
  getMedias() {
    const mediaAttr = this.getAttribute('media');
    const media = mediaAttr && document.querySelector(mediaAttr);

    if (media) {
      return media instanceof HTMLMediaElement ? [media] : findMedias(media.shadowRoot || media);
    }

    for (let el = this.parentElement; el; el = el.parentElement) {
      const medias = findMedias(el);
      if (medias.length) return medias;
    }

    return findMedias(document);
  }

  activateMedia(media) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const audioSrc = ctx.createMediaElementSource(media);
    const analyser = ctx.createAnalyser();
    audioSrc.connect(analyser);
    analyser.connect(ctx.destination);
    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let shake = null;

    const stopShake = () => {
      if (shake) shake.cancel();
      shake = null;
    };

    const renderFrame = () => {
      if (media.paused) {
        stopShake();
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
        if (!shake) shake = media.animate(SHAKE_KEYFRAMES, SHAKE_TIMING);
        window.navigator.vibrate && window.navigator.vibrate(100);
      } else {
        stopShake();
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
