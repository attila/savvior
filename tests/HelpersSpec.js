/* global jQuery: true, describe: true, it: true, expect: true */
(function(global, $) {
  'use strict';

  describe('Helpers', function() {

    describe('each', function() {

      it('iterates over a collection', function() {
        // Arrange
        var src = [1, 2, 3];
        var dest = [];
        // Act
        each(src, function(val) {
          dest.push(val);
        });
        // Assert
        expect(src).toEqual(dest);
      });

      it('allows early exit', function() {
        // Arrange
        var src = [1, 2, 3];
        var dest = [];
        // Act
        each(src, function(val, key) {
          if (key === src.length - 1) {
            return false;
          }
          dest.push(val);
        });
        // Assert
        expect(dest.length).toEqual(src.length - 1);
      });

    });

    describe('addToDataset', function() {

      it('calls setAttribute if HTMLElement.dataset is unavailable', function() {
        // Arrange
        var elem = document.createElement('div');
        // Act
        addToDataset(elem, 'test', 1, true);
        // Assert
        expect($(elem).data('test')).toEqual(1);
      });

    });

  });

}(window, jQuery));
