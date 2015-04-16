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
  this.grids = [];
  this.ready = false;
}

GridHandler.prototype = {

  /**
   * Register the Grid object instances and their enquire handlers.
   */
  register: function() {
    var elements = document.querySelectorAll(this.selector);
    var self = this;

    each(elements, function(el) {
      self.grids.push(new Grid(el));
    });

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
    each(this.grids, function(grid) {
      grid.setup(self.options[mq].columns, function() {
        var eventDetails = {
            element: (grid) ? grid.element : null,
            columns: (grid) ? grid.columns : null,
          },
          evt = new CustomEvent('savvior:setup', {detail: eventDetails});
        window.dispatchEvent(evt);
      });
    });
  },


  /**
   * Enquire match callback
   *
   * @param  {[type]} mq The current query
   */
  gridMatch: function(mq) {
    var self = this;

    each(this.grids, function(grid) {
      var eventDetails = {
        element: grid.element,
        from: grid.columns,
        to: self.options[mq].columns,
        query: mq
      };
      var evt = new CustomEvent('savvior:match', {detail: eventDetails});

      grid.redraw(self.options[mq].columns, function() {
        window.dispatchEvent(evt);
      });
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
      var cb = h.callbacks ? h.callbacks : undefined;
      enquire.unregister(h.mq, cb);
    });

    var self = this;
    each(this.grids, function(grid) {
      grid.restore(function() {
        // Cleanup
        self.queryHandlers = [];
        self.ready = false;

        isFunction(callback) && callback(self);
      });
    });
    self.grids = [];
  }
};
