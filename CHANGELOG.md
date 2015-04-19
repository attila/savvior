# Changes

## 0.5.x

_not yet released_

* #8 - Support for multiple grids with a single selector
* Tweaked init logic to throw errors instead of failing silently
* Use Function.prototype methods to maintain scope

### v0.4.2

Cleanup

### v0.4.1

Bug fix in tests

## v0.4.0

_Released 28 Feb 2015_

* #5 - Grids can now be created on hidden cointainers
* #2 - Added example CSS to the documentation

## v0.3.0

_Released 31 Mar 2014_

* Refactored the entire codebase to use the prototype pattern
* New events
* Uses `windows.requestAnimationFrame` on grid 'setup' and 'redraw'
* Callback support for all asynchronous operations
* Removed fully standalone version (may be added later)

### v0.2.1

_Released 10 Mar 2014_

Corrected version number in package

## v0.2.0

_Released 10 Mar 2014_

* Renamed events to use namespaces, e.g `savvior:match` instead of `savviorMatch`
* New `destroy` method
* Added Jasmine test suite

### v0.1.1

_Released 5 Mar 2014_

* Invoke `init` through a facade
* Updated development dependencies

## v0.1.0

_Released 12 Feb 2014_

Initial version
