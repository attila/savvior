(function(global) {
  "use strict";

  describe('Init', function() {
    var selector,
      fixture;

    beforeEach(function() {
      selector = "#myGrid";
      this.fixture = document.querySelector(selector);

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
      for (var mq in this.mqs) {
        enquire.unregister(mq);
      }
    });

    it('is not initialised without settings', function() {
      // Assert
      expect(savvior.init()).toEqual(false);
    });

    it('is initialised if settings are provided', function() {
      // Act
      savvior.init(this.settings);
      // Assert
      expect(savvior.ready).toEqual(true);
    });

    it('stores supplied configuration as is', function() {
      // Act
      savvior.init(this.settings);
      // Assert
      expect(savvior.settings).toEqual(this.settings);
    });

    it('calls register handler', function() {
      // Arrange
      spyOn(savvior, 'register').and.callThrough();
      // Act
      savvior.init(this.settings);
      // Assert
      expect(savvior.register).toHaveBeenCalled();
    });

    it('dispatches event when ready', function() {
      // Arrange
      var spyEvent = spyOnEvent(window, "savvior:init");
      // Act
      savvior.init(this.settings);
      // Assert
      expect("savvior:init").toHaveBeenTriggeredOn(window);
    });

  });

}(this));
