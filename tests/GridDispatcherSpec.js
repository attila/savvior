/*global describe: true, beforeEach: true, it: true, expect: true, spyOnEvent:true, GridDispatch: true */
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

      // spyOn(enquire, 'register').and.callFake(function(mq, handler) {
      //   // console.log('fake enquire.register called on: '+ mq);
      //   return {
      //     mq: mq,
      //     handler: handler
      //   };
      // });

      savvior = new GridDispatch();
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
      // Act
      savvior.init(this.selector1, this.settings);
      // Assert
      expect('savvior:init').toHaveBeenTriggeredOn(global);
    });

    it('removes all GridHandler objects when destroyed without arguments', function() {
      // Arrange
      savvior.init(this.selector1, this.settings);
      savvior.init(this.selector2, this.settings);
      // Act
      var result = savvior.destroy();
      // Assert
      expect(result.grids).toEqual({});
    });

    it('removes selected GridHandler object when destroyed with argument', function() {
      // Arrange
      savvior.init(this.selector1, this.settings);
      savvior.init(this.selector2, this.settings);
      // Act
      var result = savvior.destroy(this.selector1);
      // Assert
      expect(result.grids[this.selector1]).not.toBeDefined();
      expect(result.grids[this.selector2]).toBeDefined();
    });

    it('dispatches event on destroy', function() {
      // Arrange
      spyOnEvent(global, 'savvior:destroy');
      savvior.init(this.selector1, this.settings);
      // Act
      savvior.destroy();
      // Assert
      expect('savvior:destroy').toHaveBeenTriggeredOn(global);
    });

  });

}(this));
