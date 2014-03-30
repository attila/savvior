/*global describe: true, beforeEach: true, afterEach: true, it: true, expect: true, spyOnEvent:true, GridDispatch: true */
(function(global) {
  'use strict';

  var savvior;

  describe('GridDispatch', function() {

    beforeEach(function() {
      this.selector1 = '#myGrid';
      this.selector2 = '#anotherGrid';
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

    it('is not initialised without arguments', function() {
      // Assert
      expect(savvior.init()).toEqual(false);
    });

    it('is initialised if correct arguments are provided', function() {
      // Act
      savvior.init(this.selector1, this.settings);
      // Assert
      expect(savvior.ready()).toEqual([this.selector1]);
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

  });

}(this));
