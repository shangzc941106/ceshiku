/* 2017-9-27 08:15:41   */
//模块：
var addmarkerWidget = L.widget.bindClass(L.widget.BaseWidget.extend({
    map: null,//框架会自动对map赋值
    options: {
        resources: ['map.css'],
        //弹窗
        view: {
            type: "window",
            url: "view.html",
            windowOptions: {
                width: 300,
                height: 400
            }
        }
    },
    layerGroup: null,
    layerDraw: null,
    layerDrawTip: null,
    markerControl: null,
    //初始化[仅执行1次]
    create: function () {
        this.layerGroup = L.featureGroup();
        this.layerDraw = L.featureGroup().addTo(this.layerGroup);
        this.layerDrawTip = L.featureGroup().addTo(this.layerGroup);

        this.markerControl = new L.Draw.Marker(this.map, {
            icon: L.icon({
                iconUrl: this.path + 'img/marker.png',
                iconSize: [40, 40],
                iconAnchor: [15, 37],
                popupAnchor: [5, -30],
            })
        });

        bindToLayerControl('我的标记', this.layerGroup);
    },
    viewWindow: null,
    //每个窗口创建完成后调用
    winCreateOK: function (opt, result) {
        this.viewWindow = result;
    },
    //激活插件
    activate: function () {
        this.map.addLayer(this.layerGroup);

        this.map.on('draw:created', this._map_draw_createdHndler, this);
        this.map.on("draw:editmove", this._map_draw_changeHandler, this);
        this.map.on("zoomend", this._map_zoomendHandler, this);
        this._map_zoomendHandler();
        this.hasEdit(true);
    },
    //释放插件
    disable: function () {
        this.viewWindow = null;
        this.stopDraw();
        //this.map.removeLayer(this.layerGroup); 
        this.hasEdit(false);

        this.map.off('draw:created', this._map_draw_createdHndler, this);
        this.map.off("draw:editmove", this._map_draw_changeHandler, this);
        this.map.off("zoomend", this._map_zoomendHandler, this);
    },
    _map_zoomendHandler: function (e) {
        var zoom = this.map.getZoom();
        if (this.editable && zoom > 14) {
            this.layerGroup.addLayer(this.layerDrawTip);
        }
        else {
            this.layerGroup.removeLayer(this.layerDrawTip);
        }
    },
    stopDraw: function () {
        this.markerControl.disable();
    },
    drawPoint: function () {
        this.stopDraw();
        this.markerControl.enable();
    },
    _marker_id: 0,
    objResultFeature: {},
    _map_draw_createdHndler: function (event) {
        var layer = event.layer;

        this.bindMarkerEx(layer);
        layer.openPopup();
        this.viewWindow.refMarkerList();
    },
    _map_draw_changeHandler: function (event) {
        var layer = event.layer;
        if (layer._textMarker) {
            layer._textMarker.setLatLng(layer.getLatLng());
        }
    },

    bindMarkerEx: function (layer) {
        var that = this;
        if (layer.attr == null)
            layer.attr = { id: (++this._marker_id), name: '', remark: '' };

        this.layerDraw.addLayer(layer);
        this.objResultFeature[layer.attr.id] = layer;

        if (this.editable)
            layer.editing.enable();

        layer.bindPopup(function (evt) {
            var attr = evt.attr;
            var id = attr.id;
            var inhtml;


            if (that.editable) {
                inhtml = '<div class="addmarker-popup-titile">添加标记</div><div class="addmarker-popup-content" ><form >'
                        + ' <div class="form-group">  <label for="addmarker_attr_name">名称</label><input type="text" id="addmarker_attr_name" class="form-control" value="' + attr.name + '" placeholder="请输入标记名称"    /> </div>'
                        + ' <div class="form-group">  <label for="addmarker_attr_remark">备注</label><textarea id="addmarker_attr_remark" class="form-control" rows="4" style="resize: none;" placeholder="请输入备注（可选填）"   >' + attr.remark + '</textarea></div>'
                        + '<div class="form-group" style="text-align: center;"><input type="button" class="btn btn-primary  btn-sm" value="保存" onclick="addmarkerWidget.saveEditFeature(' + id + ')" />'
                        + '&nbsp;&nbsp;<input type="button" class="btn btn-danger  btn-sm" value="删除" onclick="addmarkerWidget.deleteEditFeature(' + id + ')" /></div>'
                        + '</form></div>';
            }
            else {
                inhtml = '<div class="addmarker-popup-titile">我的标记</div><div class="addmarker-popup-content" ><form >'
                    + '<div class="form-group"><label>名称</label>：' + attr.name + '</div>'
                    + ' <div class="form-group"><label>备注</label>：' + attr.remark + '</div>'
                    + '</form></div>';
            }
            return inhtml;
        },{maxWidth:400});
    },
    bindMarkerTip: function (layer) {
      if (!this.editable) return;

        var id = layer.attr.id;

        if (layer.attr.name == "")
            layer.attr.name = "我的标记";

        var editbtn = '<i class="fa fa-pencil" onclick="addmarkerWidget.openEditFeature(' + id + ',event)"></i>'
                + ' <i class="fa fa-close"  onclick="addmarkerWidget.deleteEditFeature(' + id + ')"></i> ';

        var text = '<div><span class="name">' + layer.attr.name + '</span>' + editbtn + ' </div>'
            + '<div>' + layer.attr.remark + '</div>';

        if (layer._textMarker) {
            if (layer._textMarker._icon)
                layer._textMarker._icon.innerHTML = text;
            else
                layer._textMarker.setIcon(L.divIcon({
                    className: "leaflet-addmarker-result",
                    html: text,
                    iconSize: [null, 55],
                    iconAnchor: [-30, 55]
                }));
        }
        else {
            layer._textMarker = L.marker(layer.getLatLng(), {
                icon: L.divIcon({
                    className: "leaflet-addmarker-result",
                    html: text,
                    iconSize: [null, 55],
                    iconAnchor: [-30, 55]
                })
            }).addTo(this.layerDrawTip);
        }
    },
    //========================   
    saveEditFeature: function (id) {
        var layer = this.objResultFeature[id];
        if (layer == null) return;

        layer.attr.name = $.trim($("#addmarker_attr_name").val());
        layer.attr.remark = $.trim($("#addmarker_attr_remark").val());
        this.bindMarkerTip(layer);

        layer.closePopup();
        this.viewWindow.refMarkerList();
    },
    openEditFeature: function (id, e) {
        var layer = this.objResultFeature[id];
        if (layer == null) return;
        layer.openPopup();

        L.DomEvent.stopPropagation(e);
    },
    deleteEditFeature: function (id) {
        var layer = this.objResultFeature[id];
        if (layer == null) return;
        layer.closePopup();
        if (layer._textMarker)
            this.layerDrawTip.removeLayer(layer._textMarker);
        this.layerDraw.removeLayer(layer);

        this.objResultFeature[id] = null;
        this.viewWindow.refMarkerList();
    },
    getMarkerDataList: function () {
        var arr = [];
        var layers = this.layerDraw.getLayers();
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];

            arr.push(layer.attr);
        }
        return arr;
    },
    centerAt: function (id) {
        var layer = this.objResultFeature[id];
        if (layer == null) return;
        this.map.centerAtLayer(layer);
    },
    deleteAll: function () {
        this.layerDraw.clearLayers();
        this.layerDrawTip.clearLayers();
        this.objResultFeature = {};
        this._marker_id = 0;
    },
    getJsonData: function () {
        var arr = [];
        var layers = this.layerDraw.getLayers();
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            var latlng = layer.getLatLng();
            layer.attr.lat = Number(latlng.lat.toFixed(6));
            layer.attr.lng = Number(latlng.lng.toFixed(6));

            arr.push(layer.attr);
        }
        if (layers.length == 0)
            return null;
        else
            return JSON.stringify(arr);
    },
    jsonToLayer: function (json, isclear) {
        var arr = JSON.parse(json);
        if (arr == null || arr.length == 0) return;

        if (isclear) {
            this.deleteAll();
        }

        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];

            var layer = L.marker([item.lat, item.lng], this.markerControl.options);
            layer.attr = item;
            if (item.id > this._marker_id)
                this._marker_id = item.id;

            this.bindMarkerEx(layer);
            this.bindMarkerTip(layer);
        }
        this.map.fitBounds(this.layerDraw.getBounds());
        this.viewWindow.refMarkerList();
    },
    editable: true,
    hasEdit: function (val) {
        this.editable = val;
        this._map_zoomendHandler();

        var layers = this.layerDraw.getLayers();
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            layer.closePopup();

            if (this.editable)
                layer.editing.enable();
            else
                layer.editing.disable();
            this.bindMarkerTip(layer);
        }
    }



}));