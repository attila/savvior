/*global jasmine: true, jQuery: true, describe: true, beforeEach: true, it: true, expect: true, spyOn: true */
(function(global, $) {
  'use strict';

  var handler;

  describe('GridHandler', function() {
    beforeEach(function() {
      this.selector = '#myGrid';
      this.settings = {
        'screen and (max-width: 480px)': { columns: 2 },
        'screen and (min-width: 480px) and (max-width: 640px)': { columns: 3 },
        'screen and (min-width: 640px)': { columns: 4 }
      };

      spyOn(enquire, 'register').and.callFake(function(mq, handler) {
        // console.log('fake enquire.register called on: '+ mq);
        return {
          mq: mq,
          handler: handler
        };
      });

      spyOn(enquire, 'unregister').and.callFake(function(handler) {
        // console.log('fake enquire.register called on: '+ mq);
        return handler;
      });

      handler = new GridHandler(this.selector, this.settings);
    });

    it('does not process hidden elements', function() {
      // Arrange
      $(this.selector).hide();
      // Act & Assert
      expect(handler.register()).toBeUndefined();
      // Cleanup
      $(this.selector).show();
    });

    it('constructs enquire handlers', function() {
      // Act
      handler.register();
      // Assert
      var i = 0;
      for (var mq in this.settings) {
        expect(handler.queryHandlers[i].mq).toEqual(mq);
        expect(handler.queryHandlers[i].handler.deferSetup).toBe(true);
        expect(handler.queryHandlers[i].handler.setup).toEqual(jasmine.any(Function));
        expect(handler.queryHandlers[i].handler.match).toEqual(jasmine.any(Function));
        expect(handler.queryHandlers[i].handler.destroy).toEqual(jasmine.any(Function));
        i++;
      }
      expect(handler.queryHandlers.length).toEqual(Object.keys(this.settings).length);
    });

    it('registers enquire handlers', function() {
      // Act
      handler.register();
      // Assert
      expect(enquire.register.calls.count()).toEqual(handler.queryHandlers.length);
    });

    it('returns instance', function() {
      // Act
      var result = handler.register();
      // Assert
      expect(result).toEqual(jasmine.objectContaining({
        ready: true
      }));
    });

    it('calls Grid.setup on setup', function() {
      // Arrange
      handler.register();
      spyOn(handler.grid, 'setup').and.callFake(function(columns) {
        return columns;
      });
      // Act
      handler.gridSetup(Object.keys(this.settings)[0]);
      // Assert
      expect(handler.grid.setup.calls.count()).toEqual(1);
    });

    it('calls Grid.redraw on match', function() {
      // Arrange
      handler.register();
      spyOn(handler.grid, 'redraw').and.callFake(function(columns) {
        return columns;
      });
      // Act
      handler.gridMatch(Object.keys(this.settings)[0]);
      // Assert
      expect(handler.grid.redraw.calls.count()).toEqual(1);
    });

    it('unregisters handlers', function() {
      // Arrange
      handler.register();
      var length = handler.queryHandlers.length;
      // Act
      handler.unregister();
      // Assert
      expect(handler.queryHandlers.length).toBe(0);
      expect(handler.ready).toBe(false);
      expect(handler.grid).toBeUndefined();
      expect(enquire.unregister.calls.count()).toEqual(length);
    });
  });

}(this, jQuery));
