/* global GridHandler: true */
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
  var evt = new CustomEvent('savvior:destroy', {detail: {selectors: selectors}});
  var grids = (selectors === undefined || isEmpty(selectors)) ? Object.keys(this.grids) : selectors;
  var total = grids.length;
  var counter = 0;
  var done = function(args) {
    delete this.grids[grids[counter]];
    if (++counter === total) {
      window.dispatchEvent(evt);
      isFunction(callback) && callback.call(args, this);
    }
  }.bind(this);

  each(grids, function(selector) {
    (this.grids[selector]) && this.grids[selector].unregister(done);
  }, this);
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
      (this.grids[key].ready) && grids.push(key);
    }
    return (grids.length > 0) ? grids : false;
  }

  return (this.grids[selector]) ? this.grids[selector].ready : false;
};

/**
 * Add elements to a grid.
 *
 * @param  {String}   gridSelector The selector used to created the grid.
 * @param  {Mixed}    elements     A string, array of Nodes or a NodeList
 *   representing the elements to add to the grid.
 * @param  {Object}   options      An object of options. Optional.
 *   - method: can be 'append' or 'prepend' based on whether new items should be
 *     added to the front of the grid or the end. Default is append.
 *   - clone: set this to true when elements need copying not moving. Default is
 *     false
 * @param  {Function} callback     Callback function to execute after the
 *   elements are appended. The callback is called with the Grid instance.
 *   Optional.
 *
 * @return {Object}                GridDispatch instance.
 *
 * @see Grid.prototype.addItems
 */
GridDispatch.prototype.addItems = function (gridSelector, elements, options, callback) {
  var cb;
  var opts;
  var defaults = {
    clone: false,
    method: 'append'
  };

  // Check if the grid already exists.
  if (!this.grids[gridSelector]) {
    throw new TypeError('Grid does not exist.');
  }

  // If a selector is given, turn them into Element nodes.
  if (typeof elements === 'string') {
    elements = document.querySelectorAll(elements);
  }

  if (elements instanceof Array) {
    each(elements, function (el) {
      if (!(el instanceof Node)) {
        throw new TypeError('Supplied element in array is not instance of Node.');
      }
    }, this);
  }
  else if (!(elements instanceof Node) && !(elements instanceof NodeList)) {
    throw new TypeError('Supplied argument is not a Node or a NodeList.');
  }

  if (isFunction(options)) {
    cb = options;
    opts = defaults;
  }
  else {
    cb = callback;
    opts = extend(options, defaults);
  }

  each(this.grids[gridSelector].grids, function(grid) {
    grid.addItems(elements, opts, cb);
  });

  return this;
};
