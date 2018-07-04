# NPMPak

Easy Browserify CDN for fast prototyping. It supports bundle and standalone.

##### How does it work?

1.  It runs npm show
2.  It checks if up to date cached version exists.
3.  If it doesn't, it downloads the package from npm.
4.  Then it runs browserify on the package.
5.  It saves the result to file, and sends.

## API

#### GET /:package

Get module in bundled mode.
Demo: [https://npmpak.scratchyone.com/uuid](https://npmpak.scratchyone.com/uuid)

#### GET /:package?:name

Get module in standalone mode.
Demo: [https://npmpak.scratchyone.com/uuid?uuidv1](https://npmpak.scratchyone.com/uuid?uuidv1)
