var backbone = require('backbone');
var $ = require('jquery');
var _ = require('underscore');
var deep = require('deep-diff');
var Promise = require('bluebird');
var request = require('superagent-bluebird-promise');

module.exports = {
  ListView: backbone.BaseListView.extend({
    events: {
      'change': function(event) {
        var id = this.$(this.options.container).val();


        request.get(this.collection.get(id).get('schema'))
          .then((function(R) {
            // Keys of entered fields
            var keys = _.keys(this.parent.layout.form.getCleanValue());

            var schemaData = JSON.parse(R.text);


            this.schemaData = schemaData;

            // If data can be lost - show confirmation message
            if(deep.diff(_.pick(schemaData.properties, keys), _.pick(this.parent.layout.form.schema.properties, keys)))
              return window.APP.layout.confirmationDialog
                .setMessage('Some data you have entered will be lost. Are you sure you want to change the Data Package Profile?')

                .setCallbacks({
                  yes: (function() {
                    this.selectedValue = id;
                    this.parent.reset(schemaData);
                    window.APP.layout.confirmationDialog.deactivate();
                    return false;
                  }).bind(this),

                  no: (function() {
                    this.$(this.options.container).val(this.selectedValue);
                    window.APP.layout.confirmationDialog.deactivate();
                    return false;
                  }).bind(this)
                })

                .activate();
            else
              this.selectedValue = id;

            this.parent.reset(schemaData);
          }).bind(this));
      }
    },

    // Returns schema object
    getSchema: function() { return this.schemaData; },

    // Returns schema URL
    getSelectedSchema: function() {
      return this.collection.get(this.$(this.options.container).val()).get('schema');
    },

    ItemView: backbone.BaseView.extend({
      render: function() {
        this.$el
          .attr('value', this.model.id)
          .html(this.model.get('title'));

        return this;
      },

      tagName: 'option'
    }),

    reset: function(collection) {
      backbone.BaseListView.prototype.reset.call(this, collection);
      return this.setSelected(this.collection.at(0).get('id'));
    },

    // Update selectbox and trigger change event
    setSelected: function(id) {
      this.$(this.options.container).val(id);

      // Used to restore previous value when user selects No in confirmation dialog
      this.selectedValue = id;

      return new Promise((function(RS, RJ) {
        var profile = this.collection.get(id);


        if(!profile) {
          RJ('Unknown profile ID');
          return false;
        }

        request
          .get(profile.get('schema'))

          .then((function(R) {
            this.schemaData = JSON.parse(R.text);
            this.parent.reset(this.schemaData);
            RS(this.schemaData);
          }).bind(this));
      }).bind(this));
    },

    tagName: 'select'
  })
};
