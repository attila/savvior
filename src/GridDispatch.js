/**
 * Implements the top level registration of grid handlers and manages their
 * states.
 *
 * @param {Object} GridDispatch.grids  Collection of grid handlers
 * @constructor
 */
var GridDispatch = function() {
  if (!enquire) {
    throw new Error('enquire.js not present, please load it before calling any methods');
  }

  this.grids = {};
};

/**
 * Registers a single grid handler
 *
 * @param  {String} selector The selector of the grid element
 * @param  {Object} options  Defines the number of columns a grid should have
 *   for each media query registered.
 * @return {Object}          The dispatch object instance
 */
GridDispatch.prototype.init = function(selector, options) {
  if (!selector) {
    throw new TypeError('Missing selector');
  }

  if (typeof selector !== 'string') {
    throw new TypeError('Selector must be a string');
  }

  if (typeof options !== 'object') {
    throw new TypeError('Options must be an object');
  }

  // Prevent setting up the same grid selector more than once.
  if (this.grids[selector]) {
    return this;
  }

  // Do not act if element cannot be found.
  if (document.querySelectorAll(selector).length < 1) {
    return this;
  }

  // Construct GridHandlers and register them.
  this.grids[selector] = new GridHandler(selector, options);
  this.grids[selector].register(options);

  // Dispatch event.
  window.dispatchEvent(new CustomEvent('savvior:init'));

  return this;
};

/**
 * Restores one or all of the grids into their original state
 *
 * @param  {Array} selector     The selectors of the grids to destroy as given
 *   during the init call.
 * @param  {Function} callback  Optional. Callback function to call when done
 */
GridDispatch.prototype.destroy = function(selectors, callback) {
  var evt = new CustomEvent('savvior:destroy');
  var self = this;
  var grids = (selectors === undefined || isEmpty(selectors)) ? Object.keys(this.grids) : selectors;
  var total = grids.length;
  var counter = 0;
  var done = function(args) {
    delete self.grids[grids[counter]];
    if (++counter === total) {
      window.dispatchEvent(evt);
      isFunction(callback) && callback(args);
    }
  };

  each(grids, function(selector) {
    if (self.grids[selector] !== undefined) {
      self.grids[selector].unregister(done);
    }
  });
};

/**
 * Tells if one or all the grids are initialised
 *
 * @param  {String} selector Optional. The selector of the grid used in init()
 * @return {Boolean}         If selector is given, returns a boolean value, or
 *   undefined if selector does not exist. If called without an argument, an
 *   array of ready grids is returned.
 */
GridDispatch.prototype.ready = function(selector) {
  if (selector === undefined) {
    var grids = [];
    for (var key in this.grids) {
      if (this.grids[key].ready) {
        grids.push(key);
      }
    }
    return (grids.length > 0) ? grids : false;
  }

  return (this.grids[selector]) ? this.grids[selector].ready : false;
};
