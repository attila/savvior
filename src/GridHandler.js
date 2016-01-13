/**
 * [GridHandler description]
 * @param {[type]} selector [description]
 * @param {[type]} options  [description]
 */
var GridHandler = function (selector, options) {
  this.selector = selector;
  this.options = options;
  this.queryHandlers = [];
  this.grids = [];
  this.ready = false;
};

/**
 * Register the Grid object instances and their enquire handlers.
 *
 * @return {[type]} [description]
 */
GridHandler.prototype.register = function () {
  each(document.querySelectorAll(this.selector), function (el) {
    this.grids.push(new Grid(el, this.options));
  }, this);

  for (var mq in this.options) {
    if ({}.hasOwnProperty.call(this.options, mq)) {
      this.queryHandlers.push(this.constructHandler(mq, this.options[mq]));
    }
  }

  each(this.queryHandlers, function (h) {
    enquire.register(h.mq, h.handler);
  });

  this.ready = true;

  return this;
};

/**
 * Helper function to construct enquire handler objects
 *
 * @param  {String} mq The media query to register
 * @return {Object}    The handler object containing this.handler to
 *   register with enquire
 */
GridHandler.prototype.constructHandler = function (mq) {
  return {
    mq: mq,
    handler: {
      deferSetup: true,

      setup: function () {
        this.gridSetup(mq);
      }.bind(this),

      match: function () {
        this.gridMatch(mq);
      }.bind(this),

      destroy: function () {
        return;
      }
    }
  };
};

/**
 * Enquire setup callback
 *
 * @param  {[type]} mq The current query
 */
GridHandler.prototype.gridSetup = function (mq) {
  var evt;

  each(this.grids, function (grid) {
    grid.setup(this.options[mq], function () {
      evt = new CustomEvent('savvior:setup', {
        detail: {
          element: grid.element,
          columns: grid.columns,
          filter: this.filter
        }
      });
      window.dispatchEvent(evt);
    });
  }, this);
};

/**
 * Enquire match callback
 *
 * @param  {[type]} mq The current query
 */
GridHandler.prototype.gridMatch = function (mq) {
  var evt;

  each(this.grids, function (grid) {
    evt = new CustomEvent('savvior:match', {
      detail: {
        element: grid.element,
        from: grid.columns,
        to: this.options[mq].columns,
        query: mq
      }
    });

    grid.redraw(this.options[mq], function () {
      window.dispatchEvent(evt);
    });
  }, this);
};

/**
 * Restore the grid to its original state.
 *
 * This unregisters any previously registered enquire handlers and clears up
 * the object instance.
 *
 * @param  {Function} callback [description]
 * @param  {[type]}   scope    [description]
 */
GridHandler.prototype.unregister = function (callback, scope) {
  each(this.queryHandlers, function (h) {
    enquire.unregister(h.mq);
  });

  each(this.grids, function (grid) {
    grid.restore(function () {
      // Cleanup
      this.queryHandlers = [];
      this.ready = false;

      if (isFunction(callback)) {
        callback.call(this, scope || this);
      }
    }, this);
  }, this);

  this.grids = [];
};
