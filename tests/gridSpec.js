(function(global) {
  "use strict";

  describe('Grid', function() {
    var selector,
      fixture;

    beforeEach(function() {
      selector = "#myGrid";
      this.fixture = document.querySelector(selector);

      // Mock window.requestAnimationFrame as it's not supported by phantomjs.
      spyOn(window, 'requestAnimationFrame').and.callFake(function(callback) {
        callback();
      })
      // Mock enquire.js library
      spyOn(enquire, 'register').and.callFake(function(mq, handler) {
        // console.log("fake enquire.register called on: "+ mq);
        return {
          mq: mq,
          handler: handler
        };
      });

      this.mqs = {
        mq1: "screen and (max-width: 480px)",
        mq2: "screen and (min-width: 480px) and (max-width: 640px)",
        mq3: "screen and (min-width: 640px)"
      };
      this.settings = {};
      this.settings[selector] = {};
      this.settings[selector][this.mqs.mq1] = { columns: 2 };
      this.settings[selector][this.mqs.mq2] = { columns: 3 };
      this.settings[selector][this.mqs.mq3] = { columns: 4 };

      this.savvior = savvior;
    });

    afterEach(function() {
      savvior.destroy();
    });

    it('adds data-columns attribute to the grid', function() {
      // Arrange
      savvior.settings = this.settings;
      savvior.currentMQ = this.mqs.mq1;
      // Act
      savvior.registerGrid(this.fixture, selector);
      // Assert
      expect(this.fixture).toHaveData("columns");
    });

    it('stores handlers', function() {
      // Arrange
      savvior.handlers = [];
      // Act
      savvior.register(this.fixture, selector, this.mqs.mq2);
      var handler = savvior.handlers[0];
      // Assert
      expect(handler.selector).toEqual(selector);
      expect(handler.mq).toEqual(this.mqs.mq2);
      expect(handler.callbacks.setup).toEqual(jasmine.any(Function));
      expect(handler.callbacks.match).toEqual(jasmine.any(Function));
      expect(handler.callbacks.destroy).toEqual(jasmine.any(Function));
      expect(handler.callbacks).toEqual(jasmine.objectContaining({
        deferSetup: true
      }));
    });

    it('calls enquire with handlers', function() {
      // Arrange
      var count = Object.keys(this.settings[selector]).length;
      // Act
      savvior.init(this.settings);
      // Assert
      expect(enquire.register.calls.count()).toEqual(count);
    });

    it('generates columns in grid according to config', function() {
      // Arrange
      savvior.registered = {};
      savvior.currentMQ = this.mqs.mq1;
      // Act
      savvior.registerGrid(this.fixture, selector);
      // Assert
      expect(this.fixture.childNodes.length).toEqual(this.settings[selector][savvior.currentMQ].columns);
    });

    it('recreates columns if different config matches', function() {
      // Arrange
      savvior.registered = {};
      savvior.currentMQ = this.mqs.mq1;
      savvior.registerGrid(this.fixture, selector);
      // Act
      savvior.currentMQ = this.mqs.mq2;
      savvior.recreateColumns(this.fixture, selector);
      // Assert
      expect(this.fixture.childNodes.length).toEqual(this.settings[selector][savvior.currentMQ].columns);
    });

    it('dispatches event on redrawing columns', function() {
      // Arrange
      savvior.registered = {};
      savvior.currentMQ = this.mqs.mq1;
      savvior.registerGrid(this.fixture, selector);
      spyOnEvent(window, "savvior:match");
      // Act
      savvior.currentMQ = this.mqs.mq2;
      savvior.recreateColumns(this.fixture, selector);
      // Assert
      expect("savvior:match").toHaveBeenTriggeredOn(window);
    });

  });

}(this));
