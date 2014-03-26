/*global jQuery: true, describe: true, beforeEach: true, it: true, expect: true */
(function(global, $) {
  'use strict';

  var selector,
    settings,
    element,
    grid;

  describe('Grid', function() {
    beforeEach(function() {
      selector = '#myGrid';
      settings = {
        'screen and (max-width: 480px)': { columns: 2 },
        'screen and (min-width: 480px) and (max-width: 640px)': { columns: 3 },
        'screen and (min-width: 640px)': { columns: 4 }
      };
      element = document.querySelector(selector);

      grid = new Grid(element);
    });

    it('stores the number of columns in the data-columns attribute', function() {
      // Arrange
      grid.setup(2);
      // Act
      var columns = $(element).data('columns');
      // Assert
      expect(columns).toBeDefined();
      // Cleanup
      grid.restore();
    });

  });

}(this, jQuery));
