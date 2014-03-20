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
   * @param  {Integer} columns The number of columns to create on init
   * @return {Object}          The Grid object instance
   */
  setup: function(columns) {
    // Do not act on hidden elements
    if (window.getComputedStyle(this.element).display === 'none') {
      return;
    }

    // Only process the grid once.
    if (!this.status) {
      // Retrieve the list of items from the grid itself.
      var range = document.createRange(),
        items = document.createElement('div');

      range.selectNodeContents(this.element);
      items.appendChild(range.extractContents());

      addToDataset(items, 'columns', 0);
      this.addColumns(items, columns);

      this.status = true;
      // console.log('  ✔︎ Grid.setup(): done.');
    }

    return this;
  },


  /**
   * Create columns with the configured classes and add a list of items to them.
   *
   * @param Object  items    The column element object
   * @param Integer columns  The column element object
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
   * @param  {Integer} newColumns The number of columns to transform the Grid
   *   element to.
   */
  redraw: function(newColumns) {
    var self = this;
    if (self.columns !== newColumns) {
      window.requestAnimationFrame(function() {
        var matchEvent = new CustomEvent('savvior:redraw', {detail: self.element});
        self.addColumns(self.removeColumns(), newColumns);
        window.dispatchEvent(matchEvent);
        // console.log('  ✔︎ redraw: redrawn to '+ newColumns);
      });
    }
    // else {
    //   console.log('  ✘ recreateColumns: no redraw needed.');
    // }
  },


  /**
   * Restore the Grid element to its original state
   *
   * @return {Object} The Grid object instance
   */
  restore: function() {
    if (!this.status) {
      return;
    }

    var self = this;

    window.requestAnimationFrame(function() {
      var fragment = document.createDocumentFragment(),
        container = self.removeColumns(),
        children = [],
        restoreEvent = new CustomEvent('savvior:restore', {detail: self.element});

      each(container.childNodes, function(item) {
        children.push(item);
      });
      children.forEach(function(child) {
        fragment.appendChild(child);
      });
      self.element.appendChild(fragment);
      self.element.removeAttribute('data-columns');

      window.dispatchEvent(restoreEvent);

      // console.log('  ✔︎ restore: done');
      return self;
    });
  }

};
