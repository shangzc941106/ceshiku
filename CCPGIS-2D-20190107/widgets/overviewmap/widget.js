//模块：鹰眼地图
L.widget.bindClass(L.widget.BaseWidget.extend({
    map: null,//框架会自动对map赋值
    options: {
        resources: [
          '../lib/leafletPlugins/_controls/overviewmap/Control.MiniMap.css',
          '../lib/leafletPlugins/_controls/overviewmap/Control.MiniMap.js',
        ],
    },
    miniMap:null,
    //初始化[仅执行1次]
    create: function () {

        //添加鹰眼地图
        var layersCfg = this.map.gisdata.config.basemaps;
        var layerBase;
        for (var i = layersCfg.length - 1; i >= 0; i--) {
            var item = layersCfg[i];
            if (item._layer == null) continue;
            if (item.hasOwnProperty("visible") && item.visible) {
                layerBase = item._layer
                break;
            }
        }
        layerBase = L.ccp.layer.cloneLayer(layerBase);
        var miniMap = new L.Control.MiniMap(layerBase, {
            position: 'bottomleft',
            toggleDisplay: true,
            minimized: false,
            aimingRectOptions: { color: "#ff1100", weight: 2 },
            shadowRectOptions: { color: "#0000AA", weight: 1, opacity: 0, fillOpacity: 0 },
        }).addTo(this.map);

        this.map.on('baselayerchange', function (e) {
            
            //更改导航图坐标系
            //if (e.layer.config.crs == 'EPSG4326') {//影像底图 
            //    miniMap._layer._map.options.crs = L.CRS.EPSG4326; 
            //} else { 
            //    miniMap._layer._map.options.crs = L.CRS.EPSG3857;
            //}
            //更改导航图坐标系 end

            var layer = L.ccp.layer.cloneLayer(e.layer); 
            miniMap.changeLayer(layer); 
        })

        this.miniMap = miniMap;
    },
    //打开激活
    activate: function () {


    },
    //关闭释放
    disable: function () {


    },


   

}));

