/* global jQuery: true, GridHandler: true, jasmine: true, loadFixtures: true, describe: true, beforeEach: true, it: true, expect: true, spyOn: true */
(function(global, $) {
  'use strict';

  var handler;
  var columns = 2;
  var selector = '#myGrid';
  var selectorMultiple = '.grid';

  jasmine.getFixtures().fixturesPath = './fixtures';

  describe('GridHandler', function() {

    beforeEach(function(done) {
      this.selector = selector;
      this.selectorMultiple = selectorMultiple;
      this.settings = { 'screen': { columns: columns } };

      spyOn(enquire, 'register').and.callFake(function(mq, handler) {
        return {
          mq: mq,
          handler: handler
        };
      });

      spyOn(enquire, 'unregister').and.callFake(function(handler) {
        return handler;
      });

      handler = new GridHandler(this.selector, this.settings);

      $(document).ready(function() {
        loadFixtures('grids.html');
        done();
      });
    });

    describe('Constructor', function() {

      it('constructs object with required properties', function() {
        // Assert
        expect(handler.selector).toEqual(this.selector);
        expect(handler.options).toEqual(this.settings);
        expect(handler.queryHandlers).toEqual([]);
        expect(handler.grids).toEqual([]);
        expect(handler.ready).toBe(false);
      });

    });

    describe('register, constructHandler', function() {

      it('generates Grid instances', function() {
        // Arrange
        var count = document.querySelectorAll(this.selectorMultiple).length;
        handler = new GridHandler(this.selectorMultiple, this.settings);
        // Act
        handler.register();
        // Assert
        expect(handler.grids.length).toEqual(count);
      });

      it('constructs enquire handlers', function() {
        // Act
        handler.register();
        // Assert
        var i = 0;
        for (var mq in this.settings) {
          expect(handler.queryHandlers[i]).toEqual(jasmine.any(Object));
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
        // Act & Assert
        expect(handler.register()).toEqual(jasmine.objectContaining({
          ready: true
        }));
      });

    });

    describe('gridSetup', function() {

      it('sets up grid', function() {
        // Arrange
        handler.register();
        spyOn(handler.grids[0], 'setup').and.callFake(function(columns) {
          return columns;
        });
        // Act
        handler.gridSetup(Object.keys(this.settings)[0]);
        // Assert
        expect(handler.grids[0].setup.calls.count()).toEqual(1);
      });

    });

    describe('gridMatch', function() {

      it('calls Grid.prototype.redraw on match', function() {
        // Arrange
        handler.register();
        spyOn(handler.grids[0], 'redraw').and.callFake(function(columns) {
          return columns;
        });
        // Act
        handler.gridMatch(Object.keys(this.settings)[0]);
        // Assert
        expect(handler.grids[0].redraw.calls.any()).toBe(true);
        expect(handler.grids[0].redraw.calls.argsFor(0)).toContain(this.settings[Object.keys(this.settings)[0]]);
      });

    });

    describe('unregister', function() {

      it('unregisters handlers', function(done) {
        // Arrange
        handler.register();
        handler.grids[0].setup({columns: 2}, function() {
          var length = handler.queryHandlers.length;
          // Act & Assert
          handler.unregister(function() {
            expect(handler.queryHandlers.length).toBe(0);
            expect(handler.ready).toBe(false);
            expect(enquire.unregister.calls.count()).toEqual(length);
            done();
          });
        });
      });

    });

  });

}(this, jQuery));
