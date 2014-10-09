/**
 * Implements the handling of a grid element.
 *
 * This performs operations via registered enquire handlers
 *
 * @param {Object} LiteGridHandler
 * @param {String} LiteGridHandler.selector Stores the selector of the Grid
 *   instance element
 * @param {Object} LiteGridHandler.options  Defines the number of columns a grid
 *   should have for each media query registered
 * @param {Array} LiteGridHandler.queryHandlers  Stores all registered enquire
 *   handlers so they are unregisterable
 * @param {Object} LiteGridHandler.grid  The Grid object reference
 * @param {Boolean} LiteGridHandler.ready  Pointer to maintain the Grid status
 * @constructor
 */
function LiteGridHandler() {
  this.selector = null;
  this.options = null;
  this.grid = {};
  this.ready = false;
}

LiteGridHandler.prototype = {

  /**
   * Register the Grid object instance and its enquire handlers
   */
  init: function(selector, options) {
    if (selector === undefined || options === undefined) {
      return false;
    }

    var el = document.querySelector(selector);

    if (typeof window.getComputedStyle !== 'undefined' && window.getComputedStyle(el).display === 'none') {
      return;
    }

    this.options = options;
    this.selector = selector;
    this.grid = new Grid(el, this.selector);

    var self = this;
    if (!self.grid.status) {
      self.grid.setup(this.options.columns, function() {
        var eventDetails = {
            element: (self.grid) ? self.grid.element : null,
            columns: (self.grid) ? self.grid.columns : null,
          },
          evt = new CustomEvent('savvior-lite:init', {detail: eventDetails});

        window.dispatchEvent(evt);
      });
    }

    this.ready = true;

    return this;
  },


  /**
   * Restore the grid to its original state.
   *
   * This unregisters any previously registered enquire handlers and clears up
   * the object instance
   */
  destroy: function(callback) {
    var self = this;

    this.grid.restore(function() {
      // Cleanup
      self.queryHandlers = [];
      delete self.grid;
      self.ready = false;

      isFunction(callback) && callback(self);
    });
  }
};
