var MultiCollection = (function(Backbone) {
  "use strict";

  return Backbone.Collection.extend({
    model: Multi,
    localStorage: new Store("multis")
  });
}(Backbone));
