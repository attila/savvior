/**
 * Implements the handling of a grid element.
 *
 * This performs operations via registered enquire handlers
 *
 * @param {Object} GridHandler
 * @param {String} GridHandler.selector Stores the selector of the Grid
 *   instance element
 * @param {Object} GridHandler.options  Defines the number of columns a grid
 *   should have for each media query registered
 * @param {Array} GridHandler.queryHandlers  Stores all registered enquire
 *   handlers so they are unregisterable
 * @param {Object} GridHandler.grid  The Grid object reference
 * @param {Boolean} GridHandler.ready  Pointer to maintain the Grid status
 * @constructor
 */
function GridHandler(selector, options) {
  this.selector = selector;
  this.options = options;
  this.queryHandlers = [];
  this.grid = {};
  this.ready = false;
}

GridHandler.prototype = {

  /**
   * Register the Grid object instance and its enquire handlers
   */
  register: function() {
    var el = document.querySelector(this.selector);

    this.grid = new Grid(el, this.selector);

    for (var mq in this.options) {
      var handler = this.constructHandler(mq, this.options[mq]);
      this.queryHandlers.push(handler);
    }

    each(this.queryHandlers, function(h) {
      enquire.register(h.mq, h.handler);
    });

    this.ready = true;

    return this;
  },


  /**
   * Helper function to construct enquire handler objects
   *
   * @param  {String} mq The media query to register
   * @return {Object}    The handler object containing this.handler to
   *   register with enquire
   */
  constructHandler: function(mq) {
    var self = this;

    return {
      mq: mq,
      handler: {
        deferSetup: true,
        setup: function() {
          self.gridSetup(mq);
        },
        match: function() {
          self.gridMatch(mq);
        },
        destroy: function() {
          return;
        }
      }
    };
  },


  /**
   * Enquire setup callback
   *
   * @param  {[type]} mq The current query
   */
  gridSetup: function(mq) {
    var self = this;
    if (!self.grid.status) {
      self.grid.setup(self.options[mq].columns, function() {
        var eventDetails = {
            element: (self.grid) ? self.grid.element : null,
            columns: (self.grid) ? self.grid.columns : null,
          },
          evt = new CustomEvent('savvior:setup', {detail: eventDetails});
        window.dispatchEvent(evt);
      });
    }
  },


  /**
   * Enquire match callback
   *
   * @param  {[type]} mq The current query
   */
  gridMatch: function(mq) {
    var self = this,
      eventDetails = {
        element: self.grid.element,
        from: self.grid.columns,
        to: self.options[mq].columns,
        query: mq
      },
      evt = new CustomEvent('savvior:match', {detail: eventDetails});
    self.grid.redraw(self.options[mq].columns, function() {
      window.dispatchEvent(evt);
    });
  },


  /**
   * Restore the grid to its original state.
   *
   * This unregisters any previously registered enquire handlers and clears up
   * the object instance
   */
  unregister: function(callback) {
    each(this.queryHandlers, function(h) {
      enquire.unregister(h.mq, h.callbacks);
    });

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
