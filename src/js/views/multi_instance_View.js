var MultiInstanceView = (function(Backbone, $) {
  "use strict";

  var classes = {
    multi: "multi",
    containerExpanded: "multi-container--expanded",
    summary: {
      selected: "multi-summary--selected",
      selectedItem: "multi-summary__selected-item",
      removeItem: "multi-summary__remove-item"
    },
    dropdown: {
      expanded: "multi-dropdown--expanded",
      option: "multi-dropdown__option",
      optionHighlight: "multi-dropdown__option--highlight",
      optionSelected: "multi-dropdown__option--selected",
      optionDisabled: "multi-dropdown__option--disabled",
    }
  };

  return Backbone.View.extend({
    multiTemplate: _.template($('#multi-template').html()),
    multiItemTemplate: _.template($('#multi-item-template').html()),
    
    initialize: function() {
      var _self = this;
      this.$multiSelect = this.$el.find(".multi-select");
      this.$el.attr("data-model-id", this.model.cid);
      this.multiExpanded = false;
      this.mobileCheck();
      this.convertSelect();

      this.listenTo(this.model, "change", this.updateSelected);
    },

    events: {
      "click .multi-dropdown__option": "addItem",
      "change .multi-select": "addItem",
      "mouseenter .multi-dropdown__option": "hoverOverOption",
      "click .multi-summary .multi-summary__remove-item": "removeItem",
      "click .multi-summary": "openDropDown",
      "keyup .multi-summary__search-input": "keyboardInteract"
    },

    render: function() {
      var placeholder = this.$multiSelect.data("placeholder");

      var html = this.multiTemplate({
        data: this.selectObj,
        placeholder: placeholder
      });
      this.$el.append(html);

      this.$multiContainer = this.$el.find(".multi-container");
      this.$multiSummary = this.$el.find(".multi-summary");
      this.$multiInput = this.$el.find(".multi-summary__search-input");
      this.$multiDropdown = this.$el.find(".multi-dropdown");
      this.setCurrentOption();

      return this;
    },

    keyboardInteract: function(event) {
      var openDropDownKeys = [13, 40];
      $.merge(openDropDownKeys, _.range(48, 57));
      $.merge(openDropDownKeys, _.range(65, 90));
      $.merge(openDropDownKeys, _.range(96, 105));
      if (this.multiExpanded) {
        switch (event.which) {
          case 40:
            this.highlightSiblingOption("next");
            break;
          case 38:
            this.highlightSiblingOption("prev");
            break;
          case 13:
            this.addItem();
            break;
          case 27:
            this.closeDropDown();
            break;
          default:
            this.filterList();
        }
      } else if (openDropDownKeys.indexOf(event.which) > -1) {
        this.openDropDown();
      }
    },

    filterList: function() {
      var _self = this;
      var searchString = this.$multiInput.val().toLowerCase();

      _.each(this.selectObj, function(child) {
        if (child.isGroup) {
          var $optgroup = _self.$multiDropdown.find("[data-key='" + child.key + "']");
          var optgroupContainsSearchString = Boolean(child.group.toLowerCase().indexOf(searchString) > -1);
          var count = 0;

          if (searchString === "" || !optgroupContainsSearchString) {
            _.each(child.items, function(item) {
              _self.findOptionToHighlight(searchString, item, count);
            });
          }

          if (count === 0 && !optgroupContainsSearchString) {
            $optgroup.addClass("hidden");
          } else {
            $optgroup.removeClass("hidden");
          }

          if (optgroupContainsSearchString) {
            _self.highlightSelection($optgroup, searchString);
          } else {
            _self.removeHighlight($optgroup);
          }
        } else {
          _self.findOptionToHighlight(searchString, child);
        }
      });

      this.setCurrentOption();
    },

    findOptionToHighlight: function(searchString, option, count) {
      var $option = this.$multiDropdown.find("[data-key='" + option.key + "']");

      if (option.label.toLowerCase().indexOf(searchString) === -1) {
        $option.addClass("hidden");
      } else {
        $option.removeClass("hidden");
        this.highlightSelection($option, searchString);
        if (count !== undefined) {
          count++;
        }
      }
    },

    highlightSelection: function($option, searchString) {
      var optionText = $option.text();
      var startPos = optionText.toLowerCase().indexOf(searchString);
      var endPos = startPos + searchString.length;
      var output = [optionText.slice(0, startPos), "<span class='" + classes.dropdown.optionHighlight + "'>", optionText.slice(startPos, endPos), "</span>", optionText.slice(endPos)].join('');
      $option.html(output);
    },

    removeHighlight: function($option) {
      var $highlightedText = $option.find("." + classes.dropdown.optionHighlight).contents().unwrap();
    },

    setCurrentOption: function() {
      var $newOption = this.$multiDropdown.find("." + classes.dropdown.option).not("." + classes.dropdown.optionDisabled).not(".hidden").first();
      this.hightlightNewOption($newOption);
    },

    hoverOverOption: function(event) {
      var $target = $(event.target);
      if ($target.data("key") != this.$currentOption.data("key")) {
        this.hightlightNewOption($target);
      }
    },

    highlightSiblingOption: function(direction) {
      var $newOption = null;
      
      if (direction === "next") {
        $newOption = this.$currentOption.nextAll("." + classes.dropdown.option).not("." + classes.dropdown.optionDisabled).not(".hidden").first();
      } else if (direction === "prev") {
        $newOption = this.$currentOption.prevAll("." + classes.dropdown.option).not("." + classes.dropdown.optionDisabled).not(".hidden").first();
      }

      if ($newOption.length) {
        this.hightlightNewOption($newOption);
      }

      if (!this.optionVisible()) {
        this.scrollToOption(direction);
      }
    },

    hightlightNewOption: function($newOption) {
      if (this.$currentOption) {
        this.$currentOption.removeClass(classes.dropdown.optionSelected);
      }
      this.$currentOption = $newOption;
      this.$currentOption.addClass(classes.dropdown.optionSelected);
    },

    optionVisible: function() {
      var containerBottom = this.$multiDropdown.height();
      var optionTop = this.$currentOption.position().top;
      var optionBottom = optionTop + this.$currentOption.height();
      return ((optionBottom <= containerBottom) && (optionTop >= 0));
    },

    scrollToOption: function(direction) {
      var optionOffset = this.$currentOption.position().top;
      var optionHeight = this.$currentOption.innerHeight();
      var dropdownScroll = this.$multiDropdown.scrollTop();
      var dropdownHeight = this.$multiDropdown.innerHeight();
      var position = 0;

      if (direction === "next") {
        position = optionOffset + optionHeight + dropdownScroll - dropdownHeight;
      } else if (direction === "prev") {
        position = optionOffset + dropdownScroll;
      }

      this.$multiDropdown.scrollTop(position);
    },

    openDropDown: function(event) {
      if (!this.isMobile()) {
        if (!event ||
            this.multiExpanded === false &&
            !$(event.target).hasClass(classes.summary.removeItem)) {
              this.toggleDropDown(true);
              this.$multiDropdown.scrollTop(0);
              this.setCurrentOption();
              this.filterList();
        }
        this.$multiInput.focus();
      }
    },

    closeDropDown: function(event) {
      if (!event || !this.clicked($(event.target))) {
        this.toggleDropDown(false);
      }
    },
    
    toggleDropDown: function(open) {
      this.$multiContainer.toggleClass(classes.containerExpanded, open);
      this.$multiSummary.toggleClass(classes.summary.selected, open);
      this.$multiDropdown.toggleClass(classes.dropdown.expanded, open);
      this.multiExpanded = open;
    },
    
    clicked: function($target) {
      return $target.parents("." + classes.multi).data("model-id") == this.model.cid ||
             $target.parent("." + classes.summary.selectedItem).data("model-id") == this.model.cid;
    },

    updateSelected: function(itemText) {
      this.$multiSummary.find("." + classes.summary.selectedItem).remove();
      var html = this.multiItemTemplate({
        data: this.model.get("selected"),
        model: this.model.cid
      });
      this.$multiSummary.prepend(html);
    },

    addItem: function() {
      var selectedCurrent = [];
      
      if (this.isMobile()) {
        _.each(this.$multiSelect.find(":selected"), function(child) {
          var $child = $(child);
          var itemText = $child.text();
          var itemKey = $child.data("key");
          var itemVal = $child.val();

          selectedCurrent.push({
            key: itemKey,
            val: itemVal,
            label: itemText
          });
        });
        
        this.model.set({selected: selectedCurrent});
      } else {
        var $target = this.$multiDropdown.find("." + classes.dropdown.optionSelected);
        
        if (!$target.hasClass(classes.dropdown.optionDisabled)) {
          var itemText = $target.text();
          var itemKey = $target.data("key");
          var itemVal = $target.data("value");
          selectedCurrent = _.clone(this.model.get("selected"));

          selectedCurrent.push({
            key: itemKey,
            val: itemVal,
            label: itemText
          });

          $target.addClass(classes.dropdown.optionDisabled);
          this.model.set({selected: selectedCurrent});
          this.$multiSelect.find("option[data-key='" + itemKey + "']").attr("selected", "selected");
          this.$multiDropdown.children().removeClass(classes.dropdown.optionSelected);
          this.$multiInput.focus().val("");
          this.closeDropDown();
        }
      }
    },

    removeItem: function(event) {
      var itemKey = $(event.target).parent().data("key");
      var selectedCurrent = _.clone(this.model.get("selected"));

      for(var i in selectedCurrent) {
        if(selectedCurrent.hasOwnProperty(i) && selectedCurrent[i].key == itemKey) {
          selectedCurrent.splice(i,1);
        }
      }

      this.model.set({selected: selectedCurrent});
      this.$multiDropdown.find("[data-key='" + itemKey + "']").removeClass(classes.dropdown.optionDisabled);
      this.$multiSelect.find("option[data-key='" + itemKey + "']").attr("selected", false);
      this.$multiInput.focus();
    },

    convertSelect: function() {
      var _self = this;
      this.selectObj = [];
      var i = 1;

      _.each(this.$multiSelect.children(), function(child) {
        var $child = $(child);
        if ($child.is("optgroup")) {
          var options = [];
          var j = i;

          _.each($child.find("option"), function(option) {
            i++;
            var $option = $(option);
            $option.attr("data-key", i);
            options.push({
              key: i,
              val: $option.val(),
              label: $option.text()
            });
          });

          _self.selectObj.push({
            key: j,
            group: $child.attr("label"),
            items: options,
            isGroup: true
          });

          i++;
        } else if ($child.is("option")) {
          $child.attr("data-key", i);
          _self.selectObj.push({
            key: i,
            val: $child.val(),
            label: $child.text()
          });
          i++;
        }
      });

      this.render();
    },

    mobileCheck: function() {
      if (this.isMobile()) {
        this.$el.addClass("multi--mobile");
      }
    },

    isMobile: function() {
      var check = false;
      (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true;})(navigator.userAgent||navigator.vendor||window.opera);
      return check;
    }
  });
}(Backbone, jQuery));
