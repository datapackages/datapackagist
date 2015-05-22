var backbone = require('backbone');
var backboneBase = require('backbone-base');
var descriptorEdit = require('./descriptoredit');
var DownloadView = require('./download');
var NavbarView = require('./navbar');
var registry = require('./registry');


module.exports = backbone.BaseView.extend({
  initialize: function(options) {
    backbone.BaseView.prototype.initialize.call(this, options);

    // Detect browser just once, during init
    this.browser = require('detect-browser');
  },

  render: function() {
    (this.layout.descriptorEdit = new descriptorEdit.DescriptorEditView({el: window.APP.$('#form-editor')})).render();
    this.layout.download = new DownloadView({el: window.APP.$('#download-data-package')});
    this.layout.navbar = new NavbarView({el: window.APP.$('#navbar')});
    this.layout.registryList = new registry.ListView({el: window.APP.$('#registry-list')});
    return this;
  }
});