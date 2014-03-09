(function(global) {
  "use strict";

  describe('Init', function() {
    var selector = "#myGrid",
      self;

    beforeEach(function() {
      this.mqs = {
        mq1: "screen and (min-width: 300px)",
      };
      this.settings = {};
      this.settings[selector] = {};
      this.settings[selector][this.mqs.mq1] = { columns: 2 };

      self = jasmine.createSpyObj('self', ['register', 'ready']);

      self.register();
      self.ready();

    });

    afterEach(function() {
      delete this.settings;
      delete this.savvior;
    });

    it('is not initialised without settings', function() {
      // Assert
      expect(savvior.init()).toEqual(false);
    });

    it('is initialised if settings are provided', function() {
      // Assert
      expect(savvior.init(this.settings)).toEqual(jasmine.objectContaining({
        ready: true
      }));
    });

    it('stores supplied configuration as is', function() {
      // Assert
      expect(savvior.init(this.settings)).toEqual(jasmine.objectContaining({
        settings: this.settings
      }));
    });

    it('calls register handler', function() {
      // Act
      savvior.init(this.settings);
      // Assert
      expect(self.register).toHaveBeenCalled();
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
