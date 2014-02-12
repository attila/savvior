// https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent

if (typeof window.CustomEvent !== "function") {
  (function() {
    function CustomEvent(event, params) {
      params = params || { bubbles: false, cancelable: false, detail: undefined };
      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
     }

    CustomEvent.prototype = window.CustomEvent.prototype;

    window.CustomEvent = CustomEvent;
  })();
}
;var savvior = (function(global, document, undefined) {
  "use strict";

  var self = {},
    addToDataset = function(element, key, value) {
      // Use dataset function or a fallback for <IE10
      if (element.dataset) {
        element.dataset[key] = value;
      }
      else {
        element.setAttribute("data-"+ key, value);
      }

      return;
    };

  self.settings = self.settings || {};

  self.ready = self.ready || false;

  self.registered = self.registered || {};

  self.currentMQ = self.currentMQ || null;


  /**
   * Create columns with the configured classes and add a list of items to them.
   * @param {[type]} grid     [description]
   * @param {[type]} items    [description]
   * @param {[type]} selector [description]
   */
  self.addColumns = function addColumns(grid, items, selector) {
    var numberOfColumns = self.settings[selector][self.currentMQ].columns,
      columnClasses = ["column", "column-"+ numberOfColumns],
      columnsItems = new Array(+numberOfColumns),
      columnsFragment = document.createDocumentFragment(),
      i = numberOfColumns,
      childSelector;

    while (i-- !== 0) {
      childSelector = "[data-columns] > *:nth-child(" + numberOfColumns + "n-" + i + ")";
      columnsItems.push(items.querySelectorAll(childSelector));
    }

    columnsItems.forEach(function appendToGridFragment(rows) {
      var column = document.createElement("div"),
        rowsFragment = document.createDocumentFragment();

      column.className = columnClasses.join(" ");

      Array.prototype.forEach.call(rows, function appendToColumn(row) {
        rowsFragment.appendChild(row);
      });
      column.appendChild(rowsFragment);
      columnsFragment.appendChild(column);
    });

    grid.appendChild(columnsFragment);
    addToDataset(grid, 'columns', numberOfColumns);
  };


  /**
   * Remove all the columns from a grid and return a list of items sorted by the
   * ordering of columns.
   *
   * @param  {[type]} grid [description]
   * @return {[type]}      [description]
   */
  self.removeColumns = function removeColumns(grid) {
    var range = document.createRange();
    range.selectNodeContents(grid);

    var columns = Array.prototype.filter.call(range.extractContents().childNodes, function filterElements(node) {
      return node instanceof global.HTMLElement;
    });

    var numberOfColumns = columns.length,
      numberOfRowsInFirstColumn = columns[0].childNodes.length,
      sortedRows = new Array(numberOfRowsInFirstColumn * numberOfColumns);

    Array.prototype.forEach.call(columns, function iterateColumns(column, columnIndex) {
      Array.prototype.forEach.call(column.children, function iterateRows(row, rowIndex) {
        sortedRows[rowIndex * numberOfColumns + columnIndex] = row;
      });
    });

    var container = document.createElement("div");
    addToDataset(container, 'columns', 0);

    sortedRows.filter(function filterNonNull(child) {
      return !!child;
    }).forEach(function appendRow(child) {
      container.appendChild(child);
    });

    return container;
  };


  /**
   * Remove all the columns from the grid, and adds them again.
   * This is useful when the number of columns change.
   *
   * @param  {[type]} grid [description]
   * @return {[type]}      [description]
   */
  self.recreateColumns = function recreateColumns(grid, selector) {
    global.requestAnimationFrame(function renderOnChange() {
      var newColumns = self.settings[selector][self.currentMQ].columns,
        oldColumns = parseInt(grid.getAttribute("data-columns"));

      if (newColumns !== oldColumns) {
        var savviorMatch = new CustomEvent("savviorMatch", {detail: grid});
        self.addColumns(grid, self.removeColumns(grid), selector);
        global.dispatchEvent(savviorMatch);
      }
    });
  };


  /**
   * Register the grid
   * @param  {[type]} grid [description]
   * @return {[type]}      [description]
   */
  self.registerGrid = function registerGrid(grid, selector) {
    if (global.getComputedStyle(grid).display === "none") {
      return;
    }

    // Only process the grid once.
    if (typeof self.registered[selector] === "undefined") {
      // Retrieve the list of items from the grid itself.
      var range = document.createRange(),
        items = document.createElement("div");

      range.selectNodeContents(grid);
      items.appendChild(range.extractContents());

      addToDataset(items, 'columns', 0);
      self.addColumns(grid, items, selector);
      self.registered[selector] = true;
    }
  };


  /**
   * [register description]
   * @param  {[type]} grid     [description]
   * @param  {[type]} selector [description]
   * @param  {[type]} mq       [description]
   * @return {[type]}          [description]
   */
  self.register = function register(grid, selector, mq) {
    enquire.register(mq, {
      deferSetup: true,

      setup: function savviorSetup() {
        self.currentMQ = mq;
        self.registerGrid(grid, selector);
      },

      match: function savviorMatch() {
        if (self.currentMQ !== mq) {
          self.currentMQ = mq;
        }

        if (self.registered[selector] === true) {
          self.recreateColumns(grid, selector);
        }
      }
    });
  };


  /**
   * Initialisation
   * @return {[type]} [description]
   */
  self.init = function init(settings) {
    if (typeof settings === "undefined") {
      return false;
    }

    var savviorInit = new CustomEvent("savviorInit"),
      gridElements = [];

    self.settings = settings;

    // Iterate over each selector from settings.
    for (var selector in self.settings) {
      // Get all elements matching the selector.
      gridElements = document.querySelectorAll(selector);
      // Register each grid element for each media query change.
      Array.prototype.forEach.call(gridElements, function processMediaQueries(grid) {
        for (var mq in self.settings[selector]) {
          self.register(grid, selector, mq);
        }
      });
    }

    self.ready = true;
    global.dispatchEvent(savviorInit);
  };

  return {
    init: self.init,
    ready: function() {
      return self.ready;
    }
  };

})(window, window.document);
