/* global jQuery: true, GridDispatch: true, GridHandler: true, jasmine: true, loadFixtures: true, describe: true, beforeEach: true, it: true, expect: true, spyOn:true, spyOnEvent:true */
(function(global, $) {
  'use strict';

  var savvior;
  var spyEvent;

  jasmine.getFixtures().fixturesPath = './fixtures';

  describe('GridDispatch', function() {

    beforeEach(function(done) {

      this.selector1 = '#myGrid';
      this.selector2 = '#anotherGrid';
      this.selector3 = '#hiddenGrid';
      this.selectorMultiple = '.grid';
      this.settings = {
        'screen and (max-width: 480px)': { columns: 2 },
        'screen and (min-width: 480px) and (max-width: 640px)': { columns: 3 },
        'screen and (min-width: 640px)': { columns: 4 }
      };

      $(document).ready(function() {
        loadFixtures('grids.html');
        savvior = new GridDispatch();
        done();
      });
    });

    describe('Constructor', function() {

      it('throws error if enquire is not present', function() {
        // Arrange
        this.enquire = window.enquire;
        window.enquire = undefined;
        // Act & assert
        expect(function() {
          new GridDispatch();
        }).toThrow();
        // Cleanup
        window.enquire = this.enquire;
      });

    });

    describe('init', function() {
      it('throws TypeError without selector', function() {
        // Act & Assert
        expect(function() {
          savvior.init();
        }).toThrow(new TypeError('Missing selector'));
      });

      it('throws TypeError when wrong type is given for selector', function() {
        // Act & Assert
        expect(function() {
          savvior.init([]);
        }).toThrow(new TypeError('Selector must be a string'));
      });

      it('throws TypeError without options', function() {
        // Arrange
        var selector = this.selector1;
        // Act & Assert
        expect(function() {
          savvior.init(selector);
        }).toThrow(new TypeError('Options must be an object'));
      });

      it('throws TypeError when wrong type is given as options', function() {
        // Arrange
        var selector = this.selector1;
        // Act & Assert
        expect(function() {
          savvior.init(selector, 'dummy string');
        })
        .toThrow(new TypeError('Options must be an object'));
      });

      it('does not set up the same grid more than once', function() {
        // Arrange
        savvior.grids[this.selector1] = {
          fake: true
        };
        // Act
        spyOn(GridHandler.prototype, 'register').and.callThrough();
        savvior.init(this.selector1, this.settings);
        // Assert
        expect(GridHandler.prototype.register).not.toHaveBeenCalled();
        expect(savvior.grids[this.selector1].fake).toBe(true);
      });

      it('does not create a handler if elements are missing', function() {
        // Arrange
        var fakeSelector = '.idontexist';
        // Act
        savvior.init(fakeSelector, this.settings);
        // Assert
        expect(savvior.grids[fakeSelector]).not.toBeDefined();
        expect(Object.keys(savvior.grids).length).toEqual(0);
      });

      it('constructs a handler', function() {
        // Arrange
        spyOn(GridHandler.prototype, 'register');
        // Act
        savvior.init(this.selector1, this.settings);
        // Assert
        expect(savvior.grids[this.selector1] instanceof GridHandler).toBe(true);
        expect(GridHandler.prototype.register).toHaveBeenCalled();
      });

      it('creates multiple grids where appropriate', function() {
        // Arrange
        var count = document.querySelectorAll('.grid').length;
        // Act & Assert
        expect(savvior.init(this.selectorMultiple, this.settings).grids['.grid'].grids.length).toEqual(count);
      });

      it('creates grid in a hidden container', function() {
        // Act
        savvior.init(this.selector3, this.settings);
        // Assert
        expect(savvior.ready()).toEqual([this.selector3]);
      });

      it('dispatches event when ready', function() {
        // Arrange
        spyEvent = spyOnEvent(window, 'savvior:init');
        // Act
        savvior.init(this.selector1, this.settings);
        // Assert
        expect(spyEvent).toHaveBeenTriggered();
      });

    });

    describe('destroy', function() {
      it('removes all handlers when destroyed without arguments', function(done) {
        // Arrange
        savvior.init(this.selector1, this.settings);
        savvior.init(this.selector2, this.settings);
        savvior.init(this.selector3, this.settings);
        // Act & Assert
        savvior.destroy([], function() {
          expect(Object.keys(savvior.grids).length).toEqual(0);
          done();
        });
      });

      it('removes selected handler when destroyed with argument', function(done) {
        // Arrange
        var self = this;
        savvior.init(this.selector1, this.settings);
        savvior.init(this.selector2, this.settings);
        // Act & Assert
        savvior.destroy([this.selector1], function() {
          expect(savvior.grids[self.selector1]).not.toBeDefined();
          expect(savvior.grids[self.selector2]).toBeDefined();
          done();
        });
      });

      it('dispatches event on destroy', function(done) {
        // Arrange
        spyEvent = spyOnEvent(global, 'savvior:destroy');
        savvior.init(this.selector1, this.settings);
        // Act & Assert
        savvior.destroy([], function() {
          expect(spyEvent).toHaveBeenTriggered();
          done();
        });
      });

    });

    describe('ready', function() {

      it('reports ready on grids', function() {
        // Act
        savvior.init(this.selector1, this.settings);
        savvior.init(this.selector2, this.settings);
        // Assert
        expect(savvior.ready()).toEqual([this.selector1, this.selector2]);
        expect(savvior.ready([this.selector1])).toBe(true);
        expect(savvior.ready([this.selector2])).toBe(true);
        expect(savvior.ready([this.selector3])).toBe(false);
      });

      it('reports false when no grids are ready', function() {
        // Assert
        expect(savvior.ready()).toBe(false);
      });

    });

  });

}(this, jQuery));
