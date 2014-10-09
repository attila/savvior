(function(root, factory) {
    if(typeof exports === 'object') {
        module.exports = factory();
    }
    else if(typeof define === 'function' && define.amd) {
        define('savvior-lite', [], factory);
    }
    else {
        root['savvior-lite'] = factory();
    }
}(this, function() {

  /*jshint unused:false */

  function addToDataset(element, key, value) {
    // Use dataset function or a fallback for <IE10
    if (element.dataset) {
      element.dataset[key] = value;
    }
    else {
      element.setAttribute('data-'+ key, value);
    }

    return;
  }

  /**
   * Helper function for iterating over a collection
   *
   * @param collection
   * @param fn
   */
  function each(collection, fn) {
    var i = 0,
      length = collection.length,
      cont;

    for (i; i < length; i++) {
      cont = fn(collection[i], i);
      if(cont === false) {
        break; //allow early exit
      }
    }
  }

  /**
   * Helper function for determining whether target object is an array
   *
   * @param target the object under test
   * @return {Boolean} true if array, false otherwise
   */
  function isArray(target) {
    return Object.prototype.toString.apply(target) === '[object Array]';
  }

  /**
   * Helper function for determining whether target object is a function
   *
   * @param target the object under test
   * @return {Boolean} true if function, false otherwise
   */
  function isFunction(target) {
    return typeof target === 'function';
  }

  /**
   * Helper function to determine if an object or array is empty.
   *
   * @param  {[type]}  obj The object or array to check.
   * @return {Boolean}     TRUE if empty, FALSE if not.
   */
  function isEmpty(obj, p) {
    for (p in obj) {
      return !1;
    }
    return !0;
  }

  /**
   * CustomEvent polyfill
   */
  if (typeof window.CustomEvent !== 'function') {
    (function() {
      function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
       }

      window.CustomEvent = CustomEvent;

      CustomEvent.prototype = window.CustomEvent.prototype;
    })();
  }


  /**
   * requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
   *
   * @see http://paulirish.com/2011/requestanimationframe-for-smart-animating/
   * @see http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
   * @license MIT
   */
  (function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];

    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); },
          timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    }

    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
      };
    }
  }());
  /**
   * Implements the grid element and its internal manipulation features
   *
   * @param {Object} Grid
   * @param {String} Grid.columns  Stores the current number of columns
   * @param {Object} Grid.element  Stores the DOM object of the grid element
   * @param {Boolean} Grid.status  Pointer to maintain the Grid status
   * @constructor
   */
  function Grid(element) {
    this.columns = null;
    this.element = element;
    this.status = false;
  }

  Grid.prototype = {

    /**
     * Set up the grid element and add columns
     *
     * @param  {Integer} columns    The number of columns to create on init
     * @param  {Function} callback  Optional. Callback function to call when done
     */
    setup: function(columns, callback) {
      // Do not act on hidden elements or if set already
      if (!this.status || window.getComputedStyle(this.element).display !== 'none') {
        // Retrieve the list of items from the grid itself.
        var self = this,
          range = document.createRange(),
          items = document.createElement('div');

        range.selectNodeContents(this.element);
        items.appendChild(range.extractContents());

        window.requestAnimationFrame(function() {
          addToDataset(items, 'columns', 0);
          self.addColumns(items, columns);
          self.status = true;

          isFunction(callback) && callback(self);
        });
      }
    },


    /**
     * Create columns with the configured classes and add a list of items to them.
     */
    addColumns: function(items, columns) {
      var columnClasses = ['column', 'size-1of'+ columns],
        columnsFragment = document.createDocumentFragment(),
        columnsItems = [],
        i = columns,
        childSelector;

      while (i-- !== 0) {
        childSelector = '[data-columns] > *:nth-child(' + columns + 'n-' + i + ')';
        columnsItems.push(items.querySelectorAll(childSelector));
      }

      each(columnsItems, function(rows) {
        var column = document.createElement('div'),
          rowsFragment = document.createDocumentFragment();

        column.className = columnClasses.join(' ');

        each(rows, function(row) {
          rowsFragment.appendChild(row);
        });
        column.appendChild(rowsFragment);
        columnsFragment.appendChild(column);
      });

      this.element.appendChild(columnsFragment);
      addToDataset(this.element, 'columns', columns);
      this.columns = columns;
    },


    /**
     * Remove all the columns from a grid and prepare it for populating again.
     *
     * @param  Object grid The grid element object
     * @return Object      A list of items sorted by the ordering of columns
     */
    removeColumns: function() {
      var range = document.createRange(),
        grid = this.element,
        columns;

      range.selectNodeContents(grid);

      columns = Array.prototype.filter.call(range.extractContents().childNodes, function filterElements(node) {
        return node instanceof window.HTMLElement;
      });

      var numberOfColumns = columns.length,
        numberOfRowsInFirstColumn = columns[0].childNodes.length,
        sortedRows = new Array(numberOfRowsInFirstColumn * numberOfColumns);

      each(columns, function iterateColumns(column, columnIndex) {
        each(column.children, function iterateRows(row, rowIndex) {
          sortedRows[rowIndex * numberOfColumns + columnIndex] = row;
        });
      });

      var container = document.createElement('div');
      addToDataset(container, 'columns', 0);

      sortedRows.filter(function(child) {
        return !!child;
      }).forEach(function(child) {
        container.appendChild(child);
      });

      return container;
    },


    /**
     * Remove all the columns from the grid, and add them again if the number of
     * columns have changed.
     *
     * @param  {[type]}   newColumns The number of columns to transform the Grid
     *   element to.
     * @param  {Function} callback   Optional. Callback function to call when done
     * @return {[type]}              [description]
     */
    redraw: function(newColumns, callback) {
      var self = this,
        eventDetails = {
          element: self.element,
          from: self.columns,
          to: newColumns
        },
        matchEvent = new CustomEvent('savvior:redraw', {detail: eventDetails});

      window.requestAnimationFrame(function() {
        if (self.columns !== newColumns) {
          self.addColumns(self.removeColumns(), newColumns);
        }

        window.dispatchEvent(matchEvent);
        isFunction(callback) && callback(self);
      });
    },


    /**
     * Restore the Grid element to its original state
     *
     * @param  {Function} callback  Optional. Callback function to call when done
     */
    restore: function(callback) {
      if (!this.status) {
        isFunction(callback) && callback(false);
        return false;
      }

      var self = this,
        eventDetails = {
          element: self.element,
          from: self.columns
        };

      window.requestAnimationFrame(function() {
        var fragment = document.createDocumentFragment(),
          container = self.removeColumns(),
          children = [],
          restoreEvent = new CustomEvent('savvior:restore', {detail: eventDetails});

        each(container.childNodes, function(item) {
          children.push(item);
        });
        children.forEach(function(child) {
          fragment.appendChild(child);
        });
        self.element.appendChild(fragment);
        self.element.removeAttribute('data-columns');


        window.dispatchEvent(restoreEvent);
        isFunction(callback) && callback(self);
      });
    }
  };
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


  return new LiteGridHandler();

}));
