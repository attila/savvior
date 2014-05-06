# Savvior

[![Build Status](https://travis-ci.org/attila/savvior.svg?branch=prototype)](https://travis-ci.org/attila/savvior)

A Javascript solution for multicolumn layouts, an alternative to Salvattore or Masonry, without CSS driven configuration or absolute CSS positioning. A large part of the code is heavily inspired by the excellent [Salvattore](http://salvattore.com), however it fixes many of its quirks.

## Features

* __Requirements:__ Savvior depends on on `window.matchMedia` and [enquire.js](http://wicky.nillia.ms/enquire.js/).
* __Integrates easily:__ No automatic execution, init the script when YOU think it should happen. For further integration, custom events are dispatched after initialisation or redrawing the layout.
* __Sensible configuration:__ No CSS-driven configuration can make parsing CSS on a CDN troubled, just pass the element selector and a single config object to init() and it's done.
* __Lightweight:__ ~1.95KB minified and gzipped
* __Wide browser support:__ most modern devices/browsers and IE9+

## Usage

#### Load it synchronously

Just add these before your closing `<body>` tag.

````html
<!--[if IE 9]>
<script src="/path/to/media-match.js"></script>
<![endif]-->
<script src="/path/to/enquire.js"></script>
<script src="/path/to/savvior.js"></script>
````

#### Load it asynchronously

In the `<head>`:

##### using as an AMD module, for example via Require.js

````javascript
// Configure at least the paths for your modules
requirejs.config({
  paths: {
    enquire: 'path/to/enquire',
    savvior: 'path/to/savvior'
  }
});

require(['savvior', 'domReady!'], function(savvior) {
  // Enquire is a dependency of savvior so you can initialize it right here.
  // You'll need to load your own polyfills though.
  savvior.init('#myGrid', {
    "screen and (max-width: 20em)": { columns: 2 },
    "screen and (min-width: 20em)": { columns: 3 },
  });
});
````

##### using Modernizr

````html
<script type="text/javascript">
var mq = Modernizr.mq("only all");
Modernizr.load([{
  test: mq && !window.matchMedia, // Media query support wihtout matchMedia support.
  yep: "/path/to/media.match.js", // Load the polyfill for matchMedia
  complete: function() {
    (typeof window.matchMedia === "function") && Modernizr.load('/path/to/enquire.js');
  }
},
{
  load: '/path/to/savvior.js',
  complete: function() {
      // Initialise savvior here.
    }
  }
}]);
</script>
````


#### Initialise

````javascript
  savvior.init("#myGrid", {
    "screen and (max-width: 20em)": { columns: 2 },
    "screen and (min-width: 20em) and (max-width: 40em)": { columns: 3 },
    "screen and (min-width: 40em)": { columns: 4 },
  });
````

#### Get status

````javascript
  savvior.ready();
  // returns ["#myGrid"]
  savvior.ready("#myGrid");
  // returns true
````

#### Destroy

````javascript
  // destroy all instances
  savvior.destroy();
  // destroy specific instances
  savvior.ready(["#myGrid", "#anotherGrid"]);
````

#### And more...

Detailed documentation coming soon!

## Development

Development is sponsored by Dennis Interactive and Front Seed Labs

## License

License: MIT (http://www.opensource.org/licenses/mit-license.php)
