/*global jQuery: true, describe: true, beforeEach: true, afterEach: true, it: true, expect: true, spyOn:true, spyOnEvent:true */
(function(global, $) {
  'use strict';

  var selector;
  var element;
  var children;
  var columns;
  var grid;

  describe('Grid in hidden container', function() {

    beforeEach(function(done) {
      selector = '#hiddenGrid';
      element = document.querySelector(selector),
      children = $(element).children().length,
      columns = 3;

      grid = new Grid(element);
      grid.setup(columns, function() {
        done();
      });
    });

    afterEach(function(done) {
      grid.restore(function() {
        done();
      });
    });

    it('adds columns to grid using a hidden container', function(done) {
      // Arrange
      var newChildren = $(selector).children().length;
      // Assert
      expect(newChildren).toEqual(columns);
      expect(newChildren).not.toEqual(children);
      done();
    });

    it('adds class names to grid columns in a hidden container', function() {
      // Arrange
      var classes = $(element).children().first().attr('class');
      // Assert
      expect(classes).toContain('column ');
      expect(classes).toContain(' size-1of'+ columns);
    });

    it('stores the number of columns in data attribute and in self a hidden container', function() {
      // Assert
      expect($(element).data('columns')).toEqual(columns);
      expect(grid.columns).toEqual(columns);
    });

    it('dispatches event on redraw on a hidden container', function(done) {
      // Arrange
      spyOnEvent(global, 'savvior:redraw');
      // Act & Assert
      grid.redraw(columns + 1, function() {
        expect('savvior:redraw').toHaveBeenTriggeredOn(global);
        done();
      });
    });

    it('adds new columns when redrawing a hidden container', function(done) {
      // Act & Assert
      grid.redraw(columns + 1, function() {
        expect($(element).children().length).toEqual(columns + 1);
        done();
      });
    });

    it('skips redrawing if columns are the same using a hidden container', function(done) {
      // Arrange
      spyOn(grid, 'addColumns').and.callThrough();
      // Act & Assert
      grid.redraw(columns, function() {
        expect(grid.addColumns).not.toHaveBeenCalled();
        done();
      });
    });

    it('dispatches event on restoring in a hidden container', function(done) {
      // Arrange
      spyOnEvent(global, 'savvior:restore');
      // Act & Assert
      grid.restore(function() {
        expect('savvior:restore').toHaveBeenTriggeredOn(global);
        done();
      });
    });

    it('restores grid to its original state in a hidden container', function(done) {
      // Act & Assert
      grid.restore(function() {
        expect($(element).children().length).toEqual(children);
        done();
      });
    });

  });

}(this, jQuery));
