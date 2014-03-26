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
    if (options === undefined || options === undefined) {
      return false;
    }

    var event = new CustomEvent('savvior:init'),
      grids = this.grids;

    if (!grids[selector]) {
      grids[selector] = new GridHandler(selector, options);
      grids[selector].selector = selector;
    }

    grids[selector].register(options);

    window.dispatchEvent(event);

    return this;
  },

  /**
   * Restores one or all of the grids into their original state
   *
   * @param  {String} selector Optional. The selector of the grid used in init()
   * @return {Object}          Returns the GridDispatch object instance if
   *   selector is provided or if omitted, false if the given selector does not
   *   exist.
   */
  destroy: function(selector) {
    var event = new CustomEvent('savvior:destroy');

    if (selector === undefined) {
      for (var key in this.grids) {
        this.grids[key].unregister();
        delete this.grids[key];
      }
      window.dispatchEvent(event);
      return this;
    }

    if (!this.grids[selector]) {
      return;
    }

    this.grids[selector].unregister();
    delete this.grids[selector];

    window.dispatchEvent(event);
    return this;
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
      return grids;
    }

    if (!this.grids[selector]) {
      return;
    }

    return this.grids[selector].ready;
  }
};
