/**
 * Implements the grid element and its internal manipulation features
 *
 * @param {Object} Grid
 * @param {String} Grid.columns  Stores the current number of columns
 * @param {Object} Grid.element  Stores the DOM object of the grid element
 * @param {Boolean} Grid.status  Pointer to maintain the Grid status
 * @constructor
 */
var Grid = function(element) {
  this.columns = null;
  this.element = element;
  this.filtered = document.createDocumentFragment();
  this.status = false;
  this.columnClasses = null;
};

/**
 * Set up the grid element and add columns
 *
 * @param  {Object}   options   Object containing configuration options.
 *                              Currently `columns` and `filter` are supported.
 * @param  {Function} callback  Optional. Callback function to call when done
 */
Grid.prototype.setup = function(options, callback) {
  // Run this only once on a grid.
  if (this.status) {
    return false;
  }

  // Retrieve the list of items from the grid itself.
  var range = document.createRange();
  var items = document.createElement('div');

  range.selectNodeContents(this.element);
  items.appendChild(range.extractContents());

  window.requestAnimationFrame(function() {
    addToDataset(items, 'columns', 0);

    this.addColumns(items, options);
    this.status = true;

    isFunction(callback) && callback.call(this);
  }.bind(this));
};

/**
 * Create columns with the configured classes and add a list of items to them.
 */
Grid.prototype.addColumns = function(items, options) {
  var columnClasses = options.columnClasses || ['column', 'size-1of'+ options.columns];
  var columnsFragment = document.createDocumentFragment();
  var columnsItems = [];
  var i = options.columns;
  var childSelector;
  var column, rowsFragment;

  // Filter out items when a filter is given.
  this.filterItems(items, options.filter);

  columnClasses = Array.isArray(columnClasses) ? columnClasses.join(' ') : columnClasses;

  while (i-- !== 0) {
    childSelector = '[data-columns] > *:nth-child(' + options.columns + 'n-' + i + ')';
    columnsItems.push(items.querySelectorAll(childSelector));
  }

  each(columnsItems, function(rows) {
    column = document.createElement('div');
    rowsFragment = document.createDocumentFragment();

    column.className = columnClasses;

    each(rows, function(row) {
      rowsFragment.appendChild(row);
    });
    column.appendChild(rowsFragment);
    columnsFragment.appendChild(column);
  });

  this.element.appendChild(columnsFragment);
  addToDataset(this.element, 'columns', options.columns);
  this.columns = options.columns;
  this.columnClasses = options.columnClasses;
};

/**
 * Filter items in a grid
 *
 * @param  {[type]} items  [description]
 * @param  {[type]} filter [description]
 * @return {[type]}        [description]
 */
Grid.prototype.filterItems = function(items, filter) {
  if (!filter) {
    return items;
  }

  var index, filtered, nodeList;

  nodeList = Array.prototype.slice.call(items.children);
  filtered = items.querySelectorAll('[data-columns] > ' + filter);
  each(filtered, function(item) {
    index = (nodeList.indexOf(item));
    this.filtered.appendChild(item);
    addToDataset(item, 'position', index);
  }, this);

  return items;
};

/**
 * Remove all the columns from a grid and prepare it for populating again.
 *
 * @param  Object grid The grid element object
 * @return Object      A list of items sorted by the ordering of columns
 */
Grid.prototype.removeColumns = function() {
  var range = document.createRange();
  var container = document.createElement('div');
  var sortedRows = [];
  var columns;

  range.selectNodeContents(this.element);

  columns = Array.prototype.filter.call(range.extractContents().childNodes, function filterElements(node) {
    return node instanceof window.HTMLElement;
  });

  sortedRows.length = columns[0].childNodes.length * columns.length;

  each(columns, function iterateColumns(column, columnIndex) {
    each(column.children, function iterateRows(row, rowIndex) {
      sortedRows[rowIndex * columns.length + columnIndex] = row;
    });
  });

  addToDataset(container, 'columns', 0);

  sortedRows.filter(function(child) {
    return !!child;
  })
  .forEach(function(child) {
    container.appendChild(child);
  });

  return container;
};

/**
 * Remove all the columns from the grid, and add them again if the number of
 * columns have changed.
 *
 * @param  {[type]}   newColumns The number of columns to transform the Grid
 *   element to.
 * @param  {Function} callback   Optional. Callback function to call when done
 * @return {[type]}              [description]
 */
Grid.prototype.redraw = function(newOptions, callback) {
  var evt = new CustomEvent('savvior:redraw', {
    detail: {
      element: this.element,
      from: this.columns,
      to: newOptions.columns,
      filter: newOptions.filter || null
    }
  });
  var items;

  window.requestAnimationFrame(function() {
    if (this.columns !== newOptions.columns || this.columnClasses !== newOptions.columnClasses) {
      items = this.restoreFiltered(this.removeColumns());
      this.addColumns(items, newOptions);
    }

    window.dispatchEvent(evt);
    isFunction(callback) && callback(this);
  }.bind(this));
};

/**
 * Restore filtered items in a grid
 *
 * @param  {[type]} container [description]
 * @return {[type]}           [description]
 */
Grid.prototype.restoreFiltered = function(container) {
  if (this.filtered.childNodes.length === 0) {
    return container;
  }

  var allItems = container;
  var pos;

  each(this.filtered.querySelectorAll('[data-position]'), function(item) {
    pos = Number(item.getAttribute('data-position'));
    item.removeAttribute('data-position');
    // Insert the element back to its original position. ReferenceNode is now
    // set to null if the element should become the last one.
    allItems.insertBefore(item, (allItems.children[pos] || null));
  });

  return container;
};

/**
 * Restore the Grid element to its original state
 *
 * @param  {Function} callback  Optional. Callback function to call when done
 */
Grid.prototype.restore = function(callback, scope) {
  if (!this.status) {
    isFunction(callback) && callback(false);
    return false;
  }

  var fragment = document.createDocumentFragment();
  var children = [];
  var container;
  var evt = new CustomEvent('savvior:restore', {
    detail: {
      element: this.element,
      from: this.columns
    }
  });

  window.requestAnimationFrame(function() {
    container = this.restoreFiltered(this.removeColumns());

    each(container.childNodes, function(item) {
      children.push(item);
    });

    children.forEach(function(child) {
      fragment.appendChild(child);
    });

    this.element.appendChild(fragment);
    this.element.removeAttribute('data-columns');

    window.dispatchEvent(evt);
    isFunction(callback) && callback.call(scope, scope || this);
  }.bind(this));
};

/**
 * Add items to a Grid.
 *
 * This triggers the event 'savvior:addItems' with the following object in
 * Event.detail:
 *   - element: the Grid instance element
 *   - grid: the Grid instance
 *
 * @param  {Mixed}   elements  A Node, array of Nodes or a NodeList representing
 *   the elements to add to the Grid.
 * @param  {Bool}    clone     Set this to true when the elements need copying,
 *   not moving. Optional.
 * @param  {Function} callback Callback function to execute after the
 *   elements are appended. The callback is called with the Grid instance.
 *   Optional.
 * @return {Grid}              Grid instance.
 */
Grid.prototype.addItems = function (elements, options, callback) {
  var evt = new CustomEvent('savvior:addItems', {
    detail: {
      element: this.element,
      grid: this
    }
  });
  var prepareElement = function(el) {
    return options.clone ? el.cloneNode(true) : el;
  };
  var methods = {
    append: function (el, items) {
      var newEl = prepareElement(el);
      items.appendChild(newEl);

      return items;
    },
    prepend: function (el, items) {
      var newEl = prepareElement(el);
      items.insertBefore(newEl, items.firstChild);

      return items;
    }
  };

  window.requestAnimationFrame(function () {
    // Reset the container, restoring any previously filtered items.
    var items = this.restoreFiltered(this.removeColumns());

    // If new elements is a NodeList or an array of Nodes, append each to items.
    if (elements instanceof NodeList || elements instanceof Array) {
      each(elements, function (el) {
        items = methods[options.method].call(null, el, items);
      });
    }
    else {
      items = methods[options.method].call(null, elements, items);
    }

    this.addColumns(items, {
      columns: this.columns,
      columnClasses: this.columnClasses,
      filter: this.filter
    });

    window.dispatchEvent(evt);
    isFunction(callback) && callback(this);
  }.bind(this));

};
