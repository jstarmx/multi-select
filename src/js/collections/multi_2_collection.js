// var Multi2 = (function(Backbone) {
//   return Backbone.Model.extend({
//     defaults: {
//       selected: []
//     }
//   });
// }(Backbone));

// var Multi2Collection = (function(Backbone) {
//   return Backbone.Collection.extend({
//     model: Multi2,
//     localStorage: new Store("multis")
//   });
// }(Backbone));

// var Multi2InstanceView = (function(Backbone, $) {
//   return Backbone.View.extend({
//     initialize: function() {
//       console.log("el", this.$el);
//       this.listenTo(this.model, "change:selected", function() {
//         console.log(this.model.get("selected"));
//       });
//     },

//     events: {
//       "change .multi-select": "updateModel"
//     },

//     render: function() {
//       this.$el.append("<p class'model'></p>");
//       return this;
//     },

//     updateModel: function() {
//       var selected = $(event.target).find(":selected").text();
//       this.model.set("selected", selected);
//     }
//   });
// }(Backbone, jQuery));

// var Multi2View = (function(Backbone, $) {
//   return Backbone.View.extend({
//     initialize: function() {
//       var _self = this;
//       console.log("hello");
//       this.multi2Collection = new Multi2Collection;

//       this.listenTo(this.multi2Collection, "add", this.addOne);

//       $.each($(".multi-select"), function() {
//         var id = $(this).attr("id");
//         _self.multi2Collection.create({multiId: id});
//       });
//     },

//     addOne: function(model) {
//       var id = model.get("multiId");
//       var $select = this.$el.find("#" + id);
//       $select.wrap("<div class='multi'></div>");

//       var view = new Multi2InstanceView({
//         el: $select.parent(),
//         model: model
//       });
//       view.render().el;
//     }
//   });
// }(Backbone, jQuery));

// $(document).ready(function() {
//   window.multi2View = new Multi2View({ 
//     el: $("body")
//   });
// });