MapKnitter.Annotations.Toolbar = L.Control.Draw.extend({
  initialize: function(options) {
    if (L.version < '0.7') {
      throw new Error('Leaflet.draw 0.2.3+ requires Leaflet 0.7.0+. Download latest from https://github.com/Leaflet/Leaflet/');
    }

    L.Control.prototype.initialize.call(this, options);

    var id,
      toolbar;

    this._toolbars = {};

    /* Initialize toolbars for creating L.Illustrate objects. */
    if (L.Illustrate.Toolbar && this.options.draw) {
      toolbar = new MapKnitter.Annotations.DrawToolbar(this.options.draw);
      id = L.stamp(toolbar);
      this._toolbars[id] = toolbar;
      // Listen for when toolbar is enabled
      this._toolbars[id].on('enable', this._toolbarEnabled, this);
    }

    /* Initialize generic edit/delete toolbars. */
    if (L.EditToolbar && this.options.edit) {
      toolbar = new L.EditToolbar(this.options.edit);
      id = L.stamp(toolbar);
      this._toolbars[id] = toolbar;

      this._toolbars[id] = toolbar;

      // Listen for when toolbar is enabled
      this._toolbars[id].on('enable', this._toolbarEnabled, this);
    }
  }
});

MapKnitter.Annotations.DrawToolbar = L.DrawToolbar.extend({
  options: L.extend({}, { textbox: {} }, L.DrawToolbar.prototype.options),

  getModeHandlers: function(map) {
    return [{
      enabled: this.options.textbox,
      handler: new L.Illustrate.Create.Textbox(map, this.options.textbox),
      title: 'Add a textbox'
    }].concat(L.DrawToolbar.prototype.getModeHandlers.call(this, map));
  }
});
