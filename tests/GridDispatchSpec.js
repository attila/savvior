/*global describe: true, beforeEach: true, afterEach: true, it: true, expect: true, spyOnEvent:true, GridDispatch: true */
(function(global) {
  'use strict';

  var savvior;

  describe('GridDispatch', function() {

    beforeEach(function() {
      this.selector1 = '#myGrid';
      this.selector2 = '#anotherGrid';
      this.selector3 = '#hiddenGrid';
      this.selectorMultiple = '.grid';
      this.settings = {
        'screen and (max-width: 480px)': { columns: 2 },
        'screen and (min-width: 480px) and (max-width: 640px)': { columns: 3 },
        'screen and (min-width: 640px)': { columns: 4 }
      };

      savvior = new GridDispatch();
    });

    // Grids are destroyed using window.requestAnimationFrame so a minimum
    // amount of waiting time is required before executing the next scenario.
    afterEach(function(done) {
      if (savvior.ready() !== false) {
        savvior.destroy([], function() {
          done();
        });
      }
      else {
        done();
      }
    });

    it('throws error if enquire is not present', function() {
      // Arrange
      this.enquire = global.enquire;
      global.enquire = undefined;
      // Act & assert
      expect(function() {
        new GridDispatch();
      }).toThrow();
      // Cleanup
      global.enquire = this.enquire;
    });

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

    it('throws TypeError when wrong type is given for options', function() {
      // Arrange
      var selector = this.selector1;
      // Act & Assert
      expect(function() {
        savvior.init(selector, 'dummy string');
      }).toThrow(new TypeError('Options must be an object'));
    });

    it('does not set up the same grid more than once', function() {
      // Arrange
      var initEventSpy = spyOnEvent(global, 'savvior:init');
      // Act
      savvior.init(this.selector1, {'screen': {columns: 1}});
      initEventSpy.reset();
      savvior.init(this.selector1, this.settings);
      // Assert
      expect(initEventSpy).not.toHaveBeenTriggeredOn(global);
    });

    it('does not create a GridHandler if elements cannot be found', function() {
      // Arrange
      var fakeSelector = '.idontexist';
      // Act
      savvior.init(fakeSelector, this.settings);
      // Assert
      expect(savvior.grids[fakeSelector]).not.toBeDefined();
      expect(Object.keys(savvior.grids).length).toEqual(0);
    });

    it('constructs GridHandler', function() {
      // Arrange
      spyOn(GridHandler.prototype, 'register').and.callThrough();
      // Act
      savvior.init(this.selector1, this.settings);
      // Assert
      expect(savvior.grids[this.selector1] instanceof GridHandler).toBe(true);
      expect(GridHandler.prototype.register).toHaveBeenCalled();
    });

    it('is initialises on multiple grids with class selector', function() {
      // Arrange
      var count = document.querySelectorAll('.grid').length;
      // Act & Assert
      expect(savvior.init(this.selectorMultiple, this.settings).grids['.grid'].grids.length).toEqual(count);
    });

    it('is initialised on a hidden container', function() {
      // Act
      savvior.init(this.selector3, this.settings);
      // Assert
      expect(savvior.ready()).toEqual([this.selector3]);
    });

    it('dispatches event when ready', function() {
      // Arrange
      spyOnEvent(global, 'savvior:init');
      savvior.init(this.selector1, this.settings);
      // Act & Assert
      expect('savvior:init').toHaveBeenTriggeredOn(global);
    });

    it('removes all GridHandler objects when destroyed without grid selectors', function(done) {
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

    it('removes selected GridHandler object when destroyed with argument', function(done) {
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

    it('removes selected GridHandler object on a hidden container when destroyed', function(done) {
      // Arrange
      var self = this;
      savvior.init(this.selector1, this.settings);
      savvior.init(this.selector3, this.settings);
      // Act & Assert
      savvior.destroy([this.selector3], function() {
        expect(savvior.grids[self.selector3]).not.toBeDefined();
        expect(savvior.grids[self.selector1]).toBeDefined();
        done();
      });
    });

    it('dispatches event on destroy', function(done) {
      // Arrange
      spyOnEvent(global, 'savvior:destroy');
      savvior.init(this.selector1, this.settings);
      // Act & Assert
      savvior.destroy([], function() {
        expect('savvior:destroy').toHaveBeenTriggeredOn(global);
        done();
      });
    });

    it('reports ready on grids', function() {
      // Act
      savvior.init(this.selector1, this.settings);
      savvior.init(this.selector2, this.settings);
      // Assert
      expect(savvior.ready()).toEqual([this.selector1, this.selector2]);
      expect(savvior.ready([this.selector1])).toBe(true);
      expect(savvior.ready([this.selector2])).toBe(true);
      expect(savvior.ready([this.selector3])).not.toBe(true);
    });

  });

}(this));
