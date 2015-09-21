var Multi = (function(Backbone) {
  "use strict";

  return Backbone.Model.extend({
    defaults: {
      selected: []
    }

    // initialize: function() {
    //   console.log(this.cid);
    //   this.on('all', this.alert, this);
    // },

    // alert: function() {
    //   console.log(this.cid, "I'm changing!!");
    // }
  });
}(Backbone));
