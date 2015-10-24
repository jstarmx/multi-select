var MultiView = (function(Backbone, $, window) {
  "use strict";

  return Backbone.View.extend({
    initialize: function() {
      var _self = this;
      this.$select = this.$el.find(".multi-select");
      this.findSelects();
      
      $(document).on('click', function(event) {
        _self.closeDropDowns(event);
      });
    },

    findSelects: function() {
      window.multiSelects = [];

      this.$select.each(function() {
        $(this).wrap("<div class='multi'></div>");

        window.multiSelects.push(new MultiInstanceView({
          el: $(this).parent().get(0),
          model: new Multi()
        }));
      });
    },
    
    closeDropDowns: function(event) {
      _.each(window.multiSelects, function(multiSelect) {
        multiSelect.closeDropDown(event);
      });
    }
  });
}(Backbone, jQuery, window));

$(document).ready(function() {
  window.multiView = new MultiView({
    el: $("body")
  });
});
