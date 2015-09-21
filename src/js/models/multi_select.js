var Multi = (function(Backbone) {
  "use strict";

  return Backbone.Model.extend({
    defaults: {
      selected: []
    }
  });
}(Backbone));
