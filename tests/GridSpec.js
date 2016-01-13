/* eslint-disable max-nested-callbacks*/
/* eslint-disable guard-for-in*/
(function (global, $) {
  'use strict';

  var selector;
  var element;
  var children;
  var columns;
  var grid;
  var spyEvent;

  jasmine.getFixtures().fixturesPath = './fixtures';

  describe('Grid', function () {

    beforeEach(function (done) {
      selector = '#myGrid';
      columns = 3;

      $(document).ready(function () {
        loadFixtures('grids.html');

        element = document.querySelector(selector);
        children = $(element).children().length;
        done();
      });
    });

    afterEach(function (done) {
      grid.restore(function () {
        done();
      });
    });

    describe('Constructor', function () {

      it('constructs properties', function () {
        // Arrange
        grid = new Grid(element);
        // Assert
        expect(grid.columns).toBe(null);
        expect(grid.element).toEqual(element);
        expect(grid.status).toBe(false);
      });

    });

    describe('behaviours', function () {

      beforeEach(function (done) {
        grid = new Grid(element);
        grid.setup({ columns: columns }, function () {
          done();
        });
      });

      it('prevents setting up a grid more than once', function () {
        // Act & Assert
        expect(grid.setup({ columns: 1 })).toBe(false);
      });

      it('sets data-columns attribute', function () {
        // Assert
        expect($(element).data('columns')).toEqual(3);
      });

      it('adds columns to grid', function () {
        // Assert
        var newChildren = $(selector).children().length;

        expect(newChildren).toEqual(columns);
        expect(newChildren).not.toEqual(children);
      });

      it('adds class names to grid columns', function () {
        // Arrange
        var classes = $(element).children().first().attr('class');
        // Assert
        expect(classes).toContain('column ');
        expect(classes).toContain(' size-1of' + columns);
      });

      it('dispatches event on redraw', function (done) {
        // Arrange
        spyEvent = spyOnEvent(global, 'savvior:redraw');
        // Act & Assert
        grid.redraw({ columns: 4 }, function () {
          expect(spyEvent).toHaveBeenTriggered();
          done();
        });
      });

      it('adds new columns when redrawing', function (done) {
        // Act & Assert
        grid.redraw({ columns: 4 }, function () {
          expect($(element).children().length).toEqual(4);
          done();
        });
      });

      it('does not redraw when columns are the same', function (done) {
        // Arrange
        spyOn(grid, 'addColumns').and.callThrough();
        // Act & Assert
        grid.redraw({ columns: columns }, function () {
          expect(grid.addColumns).not.toHaveBeenCalled();
          done();
        });
      });

      it('restores grid to its original state', function (done) {
        // Act & Assert
        grid.restore(function () {
          expect($(element).children().length).toEqual(children);
          done();
        });
      });

      it('dispatches event on restore', function (done) {
        // Arrange
        spyEvent = spyOnEvent(global, 'savvior:restore');
        // Act & Assert
        grid.restore(function () {
          expect(spyEvent).toHaveBeenTriggered();
          done();
        });
      });

    });

    describe('with filtering', function () {

      var columns = 3;
      var filter = '.filterme';

      beforeEach(function () {
        this.options = {
          columns: columns,
          filter: filter
        };

        grid = new Grid(element);
      });

      it('removes filtered elements from the grid', function (done) {
        // Arrange
        var filter = this.options.filter;
        var originalChildren = grid.element.querySelectorAll('.box').length;
        var filteredChildren = grid.element.querySelectorAll(filter).length;
        // Act & Assert
        grid.setup(this.options, function () {
          expect(element.querySelectorAll('.box').length).toEqual(originalChildren - filteredChildren);
          expect(element.querySelectorAll(filter).length).toEqual(0);
          expect(this.filtered.childNodes.length).toEqual(filteredChildren);
          done();
        });
      });

      it('restores filtered elements in their correct positions', function (done) {
        // Arrange
        var positions = [];
        var newPositions = [];
        $(element).find(filter).each(function (key, val) {
          positions.push($(val).index());
        });
        // Act & Assert
        grid.setup(this.options, function () {
          grid.restore(function () {
            $(element).find(filter).each(function (key, val) {
              newPositions.push($(val).index());
            });
            expect(positions).toEqual(newPositions);
            done();
          }, this);
        });
      });

    });

  });

}(window, jQuery));
