# Savvior

A Javascript solution for multicolumn layouts, alternative to Salvattore or Masonry, but without CSS driven configuration or absolute CSS positioning. A large part of the code is heavily inspired by the excellent [Salvattore](http://salvattore.com), however it provides solutions to many of its quirks.

## Features

* __No requirements:__ Savvior can be used as a standalone script or, if the prerequisite scripts are already loaded, the script itself.
* __Requirements:__ Savvior relies on `window.matchMedia` and [enquire.js](http://wicky.nillia.ms/enquire.js/).
* __Integrates easily:__ No automatic execution, init the script when YOU think it should happen. For further integration, custom events are dispatched after initialisation or redrawing the layout.
* __Single object as configuration:__ No CSS-driven configuration can make parsing CSS on a CDN troubled, just pass a single object to init() and it's done.
* __Lightweight:__ ~1.4KB minified and gzipped (the standalone variant is ~3.4 KB)
* __Wide browser support:__ most modern browsers and IE9+

## Usage

Use the standalone version if you do not already load a polyfill for matchMedia and enquire.

#### Load it synchronously

````html
<script src="/path/to/savvior.js"></script>
````

#### Load it asynchronously

In this quick and dirty example, using Modernizr:

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
  savvior.init({
    "#myGrid": {
      "screen and (max-width: 20em)": { columns: 2 },
      "screen and (min-width: 20em) and (max-width: 40em)": { columns: 3 },
      "screen and (min-width: 40em)": { columns: 4 },
    }
  });
````

## Development

Development is sponsored by Dennis Interactive and Front Seed Labs

## License

License: MIT (http://www.opensource.org/licenses/mit-license.php)
