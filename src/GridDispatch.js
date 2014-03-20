/**
 * Allows for registration of grid handlers.
 * Manages the state of the grid handler.
 *
 * @constructor
 */
function GridDispatch() {
  if (!enquire) {
    throw new Error('enquire.js not present, please load it before calling any methods');
  }

  this.grids = {};
}

GridDispatch.prototype = {

  init: function(selector, options) {
    if (typeof options === undefined) {
      return false;
    }

    var initEvent = new CustomEvent('savvior:init'),
      grids = this.grids;

    if (!grids[selector]) {
      grids[selector] = new GridHandler(selector, options);
      grids[selector].selector = selector;
    }

    grids[selector].register(options);

    window.dispatchEvent(initEvent);

    return this;
  },

  destroy: function(selector) {

    if (!this.grids[selector]) {
      return false;
    }
    this.grids[selector].unregister();
    delete this.grids[selector];

    return this;
  },

  ready: function(selector) {
    if (!this.grids[selector]) {
      return;
    }

    return this.grids[selector].ready;
  }
};
