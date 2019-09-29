
var map;

$(document).ready(function () {
    initMap();
});

function initMap() {
    var request = ccputil.system.getRequest();
    var configfile = "config.json";
    if (request.config)
        configfile = '../leaflet-example/config/' + request.config + ".json";

    ccputil.loading.show();
    L.ccp.createMap({
        id: "map",
        url: configfile + "?time=20180929",
        layerToMap: layerToMap,
        success: function (_map, gisdata, jsondata) {
            ccputil.loading.hide();

            map = _map;

            //如果配置默认有图层控制控件，移除（与widget功能重复）
            if (gisdata.controls && gisdata.controls.layers) {
                map.removeControl(gisdata.controls.layers);
            }

            //初始化widget管理器
            if (ccputil.isutil.isNotNull(request.widget)) {
                jsondata.widget.widgetsAtStart = [];
            }
            L.widget.init(_map, jsondata.widget);


            //如果url传参，激活对应widget 
            if (ccputil.isutil.isNotNull(request.widget))
                L.widget.activate(request.widget);

            //如果有xyz传参，进行定位 
            if (ccputil.isutil.isNotNull(request.x)
                && ccputil.isutil.isNotNull(request.y)
                && ccputil.isutil.isNotNull(request.z)) {
                var x = Number(request.x);
                var y = Number(request.y);
                var z = Number(request.z);
                map.setView([y, x], z);
            }

            initWork();
        }
    });
}

//当前页面业务相关
function initWork() {
    
}


//自定义图层添加方法
//lcl
function layerToMap(config, layer) {
    if (config.type == "wfs") {
        layer =L.wfsLayer(config);//wfs插件
        return layer;
    }
    if (config.type == "gaode_tile") {
        layer = L.tileLayer('http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', { subdomains: "1234" });
        return layer;
    }
    if (config.type == "gaode_yx") {
        layer = L.layerGroup([
            L.tileLayer('http://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', { subdomains: "1234" }),
            L.tileLayer('http://webst0{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8', { subdomains: "1234" })
        ])
        return layer;
    }
    if (config.type == "google_tile") {
        layer = L.tileLayer('http://mt1.google.cn/vt/lyrs=m@207000000&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=Galile');
        return layer;
    }
    if (config.type == "google_yx") {
        layer = L.layerGroup([
            L.tileLayer('http://mt1.google.cn/vt/lyrs=s&hl=zh-CN&gl=CN&x={x}&y={y}&z={z}&s=Gali'),
            L.tileLayer('http://mt1.google.cn/vt/imgtp=png32&lyrs=h@207000000&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Galil')
        ])
        return layer;
    }

    if (config.type == "tdt_dz") {
        /*layer = L.tileLayer('http://t{s}.tianditu.cn/DataServer?T=vec_w&X={x}&Y={y}&L={z}&tk=313cd4b28ed520472e8b43de00b2de56',{
            subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"]
        });*/

        layer = L.layerGroup([
            L.tileLayer('http://t{s}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=6c99c7793f41fccc4bd595b03711913e',{
                subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"]
            })/*,
            L.tileLayer('http://t{s}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=0ebd57f93a114d146a954da4ecae1e67',{
                subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"]
            })*/
        ])
        return layer;
    }
    
};

//绑定图层管理
function bindToLayerControl(name, layer) {
    if (map.gisdata.controls && map.gisdata.controls.layers) {
        map.gisdata.controls.layers.addOverlay(layer, name);
    }

    var childitem = {
        name: name,
        _layer: layer
    };
    layer.config = childitem;

    var manageLayersWidget = L.widget.getClass('widgets/manageLayers/widget.js');
    if (manageLayersWidget) {
        manageLayersWidget.addOverlay(childitem);
    }
    else {
        map.gisdata.config.operationallayers.push(childitem);
    }
}
function unbindLayerControl(name) {
    if (map.gisdata.controls && map.gisdata.controls.layers) {


        var operationallayersCfg = map.gisdata.config.operationallayers;
        for (var i = 0; i < operationallayersCfg.length; i++) {
            var item = operationallayersCfg[i];
            if (item.name == name) {
                map.gisdata.controls.layers.removeLayer(item._layer);
                break;
            }
        }
    }

    var manageLayersWidget = L.widget.getClass('widgets/manageLayers/widget.js');
    if (manageLayersWidget) {
        manageLayersWidget.removeLayer(name);
    } else {
        var operationallayersCfg = map.gisdata.config.operationallayers;
        for (var i = 0; i < operationallayersCfg.length; i++) {
            var item = operationallayersCfg[i];
            if (item.name == name) {
                operationallayersCfg.splice(i, 1);
                break;
            }
        }
    }
}


//外部页面调用
function activateWidget(item) {
    L.widget.activate(item);
}
function activateFunByMenu(fun) {
    eval(fun);
}