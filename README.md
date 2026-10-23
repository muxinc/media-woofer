# `<media-woofer>`

Kick up the bass of your media element! :sound:

Put this tag in the page with your `<video>` or `<audio>` tag and it will _shake_ the element along with the bass (using the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) and [CSShake](https://elrumordelaluz.github.io/csshake/)'s shake), and also vibrate mobile phones (currently Android only) using the [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API).

Becuz why not? `¯\_(ツ)_/¯`

## Example

```html
<html>
<head>
  <script type="module" src="https://unpkg.com/media-woofer"></script>
</head>
<body>

  <video src="https://woofer.media/site/videos/pony-sample.mp4" controls></video>
  <media-woofer></media-woofer>

</body>
</html>
```

## With Video.js

Put `<media-woofer>` inside a [Video.js](https://videojs.org) player and it shakes that player's media, including media elements that render their `<video>` in a shadow root, like `<hls-video>` and `<mux-video>`.

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@videojs/cdn@10.2.0/video.js"></script>
<script type="module" src="https://unpkg.com/media-woofer"></script>

<video-player>
  <video-skin>
    <video src="https://woofer.media/site/videos/pony-sample.mp4" crossorigin></video>
    <media-woofer></media-woofer>
  </video-skin>
</video-player>
```

With several players on a page, give each its own `<media-woofer>`. Use the `media` attribute (a CSS selector) to pick a media explicitly.

Cross-origin media needs `crossorigin` and CORS headers for its sound to be read.

## Installing

`<media-woofer>` is packaged as a javascript module (es6) only, which is supported by all evergreen browsers and Node v12+.

### Loading into your HTML using `<script>`

Note the `type="module"`, that's important.

> Modules are always loaded asynchronously by the browser, so it's ok to load them in the head :thumbsup:, and best for registering web components quickly.

```html
<head>
  <script type="module" src="https://unpkg.com/media-woofer"></script>
</head>
```

### Adding to your app via `npm`

```bash
npm install media-woofer --save
```
Or yarn
```bash
yarn add media-woofer
```

Include in your app javascript (e.g. src/App.js)
```js
import 'media-woofer';
```
This will register the custom elements with the browser so they can be used as HTML.
