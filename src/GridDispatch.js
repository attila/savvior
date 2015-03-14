/**
 * Implements the top level registration of grid handlers and manages their
 * states.
 *
 * @param {Object} GridDispatch.grids  Collection of grid handlers
 * @constructor
 */
function GridDispatch() {
  if (!enquire) {
    throw new Error('enquire.js not present, please load it before calling any methods');
  }

  this.grids = {};
}

GridDispatch.prototype = {

  /**
   * Registers a single grid handler
   *
   * @param  {String} selector The selector of the grid element
   * @param  {Object} options  Defines the number of columns a grid should have
   *   for each media query registered.
   * @return {Object}          The dispatch object instance
   */
  init: function(selector, options) {
    if (typeof selector !== 'string') {
      throw new Error('Selector must be a string');
    }

    if (typeof options !== 'object') {
      throw new Error('Options must be an object');
    }

    var evt = new CustomEvent('savvior:init'),
      grids = this.grids;

    grids[selector] = new GridHandler(selector, options);
    grids[selector].selector = selector;
    grids[selector].register(options);

    window.dispatchEvent(evt);

    return this;
  },

  /**
   * Restores one or all of the grids into their original state
   *
   * @param  {Array} selector     The selectors of the grids to destroy as given
   *   during the init call.
   * @param  {Function} callback  Optional. Callback function to call when done
   */
  destroy: function(selectors, callback) {
    var evt = new CustomEvent('savvior:destroy'),
      self = this,
      grids = (selectors === undefined || isEmpty(selectors)) ? Object.keys(this.grids) : selectors,
      total = grids.length,
      counter = 0,
      done = function(args) {
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
  },

  /**
   * Tells if one or all the grids are initialised
   *
   * @param  {String} selector Optional. The selector of the grid used in init()
   * @return {Boolean}         If selector is given, returns a boolean value, or
   *   undefined if selector does not exist. If called without an argument, an
   *   array of ready grids is returned.
   */
  ready: function(selector) {
    if (selector === undefined) {
      var grids = [];
      for (var key in this.grids) {
        if (this.grids[key].ready) {
          grids.push(key);
        }
      }
      return (grids.length > 0) ? grids : false;
    }

    if (!this.grids[selector]) {
      return false;
    }

    return this.grids[selector].ready;
  }
};
