/* 2017-12-5 14:29:36   */
//模块：
L.widget.bindClass(L.widget.BaseWidget.extend({
    map: null,//框架会自动对map赋值
    options: {
        //弹窗
        view: {
            type: "window",
            url: "view.html",
            windowOptions: {
                width: 250
            }
        },
    },
    workDraw: null,
    layerDraw: null,
    //初始化[仅执行1次]
    create: function () {
        var that = this;
        this.workDraw = new L.ccp.Draw({
            map: this.map,
            isOnly: false,
            hasDel: true,
            style: { color: '#ff0000', weight: 2 },
            onEvnet: false,
            onCreate: function (event) {
                //var layer = event.layer;

                that.viewWindow.plotlist.plotEnd();
            },
            onChange: function (event) {
                var layer = that.workDraw.currEditFeature;
                var latlngs = L.ccp.layer.getLatlngs(layer);

                if (layer.constructor === L.Circle)
                    that.startEditing(layer);
                else
                    that.viewWindow.plotEdit.updateLatlngsHtml(latlngs);
            },
            onStartEditing: function (layer) {
                that.startEditing(layer);
            },
            onStopEditing: function (layer) {
                that.stopEditing(layer);
            },
        });
        this.layerDraw = this.workDraw.getLayer();
         
        bindToLayerControl('标绘', this.layerDraw);
    },
    viewWindow: null,
    //每个窗口创建完成后调用
    winCreateOK: function (opt, result) {
        this.viewWindow = result;
    },
    //激活插件
    activate: function () {
        this.workDraw.onEvnet();
        this.map.addLayer(this.layerDraw);
    },
    //释放插件
    disable: function () {
        this.viewWindow = null;
        //unbindLayerControl(this.config.name); 
        //map.removeLayer(this.layerDraw);
        this.workDraw.destroy(true);
    },

    //开始标记
    startDraw: function (defval) {
        
        this.workDraw.startDraw(defval.type, defval);
    },
    _last_layer: null,
    startEditing: function (layer) {
        this._last_layer = layer;
        var latlngs = L.ccp.layer.getLatlngs(layer);
        if (this.viewWindow)
            this.viewWindow.plotEdit.startEditing(layer.properties, latlngs);
    },
    stopEditing: function (layer) {
        if (this.viewWindow)
            this.viewWindow.plotEdit.stopEditing();
    },
    updateAttr2map: function (attr) {
        this.workDraw.updateProperties(this._last_layer, attr);
    },
    //文件处理
    getGeoJson: function () {
        return this.workDraw.toJson();
    },
    jsonToLayer: function (json, isClear) {
        return this.workDraw.jsonToLayer(json, isClear,true);
    },
    deleteAll: function () {
        this.workDraw.clearDraw();
    },
    hasEdit: function (val) {
        this.workDraw.hasEdit(val);
    }


}));
