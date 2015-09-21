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

// var MultiView = (function(Backbone, $) {
//   return Backbone.View.extend({
//     initialize: function() {
//       var _self = this;
//       this.multiCollection = new MultiCollection;

//       this.listenTo(this.multiCollection, "add", this.addOne);

//       $.each($(".multi-select"), function() {
//         var id = $(this).attr("id");
//         _self.multiCollection.create({multiId: id});
//       });
//     },

//     addOne: function(model) {
//       var id = model.get("multiId");
//       var $select = this.$el.find("#" + id);
//       $select.wrap("<div class='multi'></div>");

//       var view = new MultiInstanceView({
//         el: $select.parent(),
//         model: model
//       });
//     }
//   });
// }(Backbone, jQuery));

// $(document).ready(function() {
//   window.multiView = new MultiView({ 
//     el: $("body")
//   });
// });
