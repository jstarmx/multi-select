var MultiView = (function(Backbone, $, window) {
  "use strict";

  return Backbone.View.extend({
    initialize: function() {
      this.$select = this.$el.find(".multi-select");
      this.findSelects();
    },

    findSelects: function() {
      window.multiSelects = [];

      this.$select.each(function() {
        $(this).wrap("<div class='multi'></div>");

        window.multiSelects.push(new MultiInstanceView({
          el: $(this).parent(),
          model: new Multi
        }));
      });
    }
  });
}(Backbone, jQuery, window));

$(document).ready(function() {
  window.multiView = new MultiView({ 
    el: $("body")
  });
});
