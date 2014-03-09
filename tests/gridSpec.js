(function(global) {
  "use strict";

  describe('Grid', function() {
    var selector = "#myGrid",
      fixture;

    jasmine.getFixtures().fixturesPath = './tests/fixtures';

    beforeEach(function() {
      loadFixtures("grid.html");
      this.fixture = document.querySelector(selector);

      this.mqs = {
        mq1: "screen and (min-width: 300px)",
      };
      this.settings = {};
      this.settings[selector] = {};
      this.settings[selector][this.mqs.mq1] = { columns: 2 };

      this.savvior = savvior.init(this.settings);
    });

    afterEach(function() {
      enquire.unregister(this.savvior.currentMQ);
      delete this.mqs;
      delete this.settings;
      delete this.savvior;
    });

    it('should add data-columns attribute to the grid', function() {
      // Arrange
      this.savvior.currentMQ = this.mqs.mq1;
      // Act
      this.savvior.registerGrid(this.fixture, selector);
      // Assert
      expect(this.fixture).toHaveAttr("data-columns", "2");
    });

  });

}(this));
