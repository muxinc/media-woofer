# `<media-woofer>`

Kick up the bass of your media element! :sound:

Shakes the element and vibrates the mobile phone (Android only). Because why not?

## Example

```html
<html>
<head>
  <script type="module" src="https://unpkg.com/media-woofer"></script>
</head>
<body>

  <video src="" controls></video>
  <media-woofer></media-woofer>

</body>
</html>
```

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
