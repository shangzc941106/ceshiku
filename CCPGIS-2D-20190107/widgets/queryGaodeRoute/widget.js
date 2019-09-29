/* 2017-11-6 10:18:04   */
//此方式：弹窗非iframe模式
L.widget.bindClass(L.widget.BaseWidget.extend({
    map: null,//框架会自动对map赋值
    options: {
        //resources: ['style.css'],
        //view: [
        //    { type: "append", url: "view.html" }
        //],
    },
    serverUrl: {
        "key": [
               "c95467d0ed2a3755836e37dc27369f97",
               "4320dda936d909d73ab438b4e29cf2a2",
               "e64a96ed7e361cbdc0ebaeaf3818c564",
               "df3247b7df64434adecb876da94755d7",
               "d4375ec477cb0a473c448fb1f83be781",
               "13fdd7b2b90a9d326ae96867ebcc34ce",
               "c34502450ae556f42b21760faf6695a0",
               "57f8ebe12797a73fc5b87f5d4ef859b1"
        ],
        "route_bus_url": "http://restapi.amap.com/v3/direction/transit/integrated",
        "route_car_url": "http://restapi.amap.com/v3/direction/driving",
    },
    layerWork: null,
    iconDot: null,
    //初始化[仅执行1次]
    create: function () {
        this.layerWork = L.featureGroup();

        this.iconDot = L.divIcon({
            className: "",
            html: '<div style="background: #ffffff;border-radius: 50%;border: #3388ff 2px solid;width:100%;height:100%;"></div>',
            iconSize: [8, 8]
        });
    },
    //每个窗口创建完成后调用
    winCreateOK: function (viewopt, html) {
    },
    _key_index: 0,
    getKey: function () {
        var thisidx = (this._key_index++) % (this.serverUrl.key.length);
        return this.serverUrl.key[thisidx];
    },
    startMarker: null,
    endMarker: null,
    //激活插件
    activate: function () {
        var that = this;
        this.map.addLayer(this.layerWork);
         
        this.map.contextmenu.insertItem('-', 0);
        this.map.contextmenu.insertItem({
            id: "route-end",
            text: '清除路线规划',
            iconCls: 'fa fa-trash-o',
            callback: function (e) { 
                that.clear();
            }
        }, 0);
        this.map.contextmenu.insertItem({
            id: "route-end",
            text: '设为终点',
            iconCls: 'fa fa-flag-checkered',
            callback: function (e) {
                that.addEndPoint(e.latlng);
                that.query();
            }
        }, 0);
        this.map.contextmenu.insertItem({
            id: "route-start",
            text: '设为起点',
            iconCls: 'fa fa-flag-o',
            callback: function (e) {
                that.addStartPoint(e.latlng);
                that.query();
            }
        }, 0);

         
    },
    //释放插件
    disable: function () {
        this.map.removeLayer(this.layerWork);

        this.map.contextmenu.removeItem(0);
        this.map.contextmenu.removeItem(0);
        this.map.contextmenu.removeItem(0);
        this.map.contextmenu.removeItem(0);

    },
    clear: function () {
        this.startMarker = null;
        this.endMarker = null;
        this.layerWork.clearLayers(); 
    },
    addStartPoint: function (latlng) {
        if (latlng == null) return;

        this.startMarker = L.marker(latlng, {
            draggable:true,
            icon: L.icon({
                iconUrl: this.path + '/img/start.png',
                iconSize: [30, 42],
                iconAnchor: [15, 32],
                popupAnchor: [0, -24],
                tooltipAnchor: [0, -24]
            })
        }).bindTooltip("<b>起点</b>", { className: 'jsondatalayer-tooltip', direction: 'top' }).addTo(this.layerWork);
        this.startMarker.on("moveend", this.query, this);
        
    },
    addEndPoint: function (latlng) {
        if (latlng == null) return;

        this.endMarker = L.marker(latlng, {
            draggable: true,
            icon: L.icon({
                iconUrl: this.path + 'img/end.png',
                iconSize: [30, 42],
                iconAnchor: [15, 32],
                popupAnchor: [0, -24],
                tooltipAnchor: [0, -24]
            })
        }).bindTooltip("<b>终点</b>", { className: 'jsondatalayer-tooltip', direction: 'top' }).addTo(this.layerWork);
        this.endMarker.on("moveend", this.query, this);
    },

    //传入起点和终点的经纬度信息 【传入的为地图相同坐标系的坐标数据】
    query: function () {
        if (this.startMarker == null || this.endMarker == null) return;

        this.layerWork.clearLayers();
        this.layerWork.addLayer(this.startMarker);
        this.layerWork.addLayer(this.endMarker);

        var startLatlng = this.startMarker.getLatLng();
        var endLatlng = this.endMarker.getLatLng();

        //转换坐标数据为gcj坐标系  
        var startLatlng_wgs = this.map.convert2wgs(startLatlng);
        var endLatlng_wgs = this.map.convert2wgs(endLatlng);

        startLatlng = L.ccp.pointconvert.wgs2gcj([startLatlng_wgs[1], startLatlng_wgs[0]]);
        endLatlng = L.ccp.pointconvert.wgs2gcj([endLatlng_wgs[1], endLatlng_wgs[0]]);

        var str_start_jwd = startLatlng[0] + "," + startLatlng[1];
        var str_end_jwd = endLatlng[0] + "," + endLatlng[1];
        var key = this.getKey();

        ccputil.loading.show('正在分析路线......');
        var that = this;
        $.ajax({
            url: this.serverUrl.route_car_url,
            type: "GET",
            dataType: "jsonp", 
            timeout: "5000",
            contentType: "application/json;utf-8",
            data: {
                "output": "json",
                "extensions": "all",
                "key": key,
                "origin": str_start_jwd,           //起点  规则： lon，lat（经度，纬度）
                "destination": str_end_jwd,        //终点  
            },
            success: function (json) {
                ccputil.loading.hide();

                if (!that.isActivate) return;

                var data = eval(json);
                if (data.status == 0) {
                    toastr.error("请求失败(" + data.infocode + ")：" + data.info);
                    return;
                }

                if (data.route.paths.length == 0) {
                    toastr.success("未查询到驾车路线！");
                    return;
                }
                var paths0 = data.route.paths[0];

                var info = {};
                info.strategy = paths0.strategy;     //导航策略
                info.taxi_cost = Number(data.route.taxi_cost).toFixed(0) + "元";      //打车费用 
                info.duration = ccputil.str.formatTime(paths0.duration);        //预计行驶时间 
                info.distance = ccputil.str.formatLength(paths0.distance);      //行驶距离 
                info.traffic_lights = paths0.traffic_lights;                    //红绿灯
                if (paths0.tolls > 0) {
                    info.tolls = Number(paths0.tolls).toFixed(0) + "元";              //道路收费
                    info.toll_distance = ccputil.str.formatLength(paths0.toll_distance);   //收费道路长度
                }

                that.addRouteCar(paths0.steps, info);

            },
            error: function (data) {
                ccputil.loading.hide();
                toastr.error("请求出错(" + data.status + ")：" + data.statusText);
            }
        });
    },
    objStepLine: {},
    //添加自驾路线方法
    addRouteCar: function (arrSteps, info) {
        var that = this;

        that.objStepLine = {};
        //预处理数据 
        var arrRoute = [];
        var strRemark = "";
        var lastLalng = this.startMarker.getLatLng();
        for (var i = 0; i < arrSteps.length; i++) {
            var stepitem = arrSteps[i];


            //途径道路 集合
            if (stepitem.road && arrRoute.indexOf(stepitem.road) == -1)
                arrRoute.push(stepitem.road);

            //坐标
            var stepLine = [];
            var mpts = stepitem.polyline.split(';');
            $.each(mpts, function (index, mpt) {
                var temp = mpt.split(',');
                if (temp.length != 2) return;

                var jd = Number(temp[0]);
                var wd = Number(temp[1]);
                var lnglat = L.ccp.pointconvert.gcj2wgs([jd, wd])
                var result = that.map.convert2map([lnglat[1], lnglat[0]]);
                stepLine.push(result);
            });
            if (stepLine.length == 0) continue;

            //添加 点 到图层
            var pointMarker = L.marker(stepLine[stepLine.length - 1], { icon: this.iconDot });
            that.layerWork.addLayer(pointMarker);
             
            //优化显示效果：连接上一步骤线段 
            stepLine.insert(lastLalng,0);
            if (i == arrSteps.length - 1) {
                stepLine.push(this.endMarker.getLatLng());
            }
            lastLalng = stepLine[stepLine.length - 1];//记录
             
            //添加路线到图层
            var polyline = L.polyline(stepLine, { color: '#3388ff', weight: 5, opacity: 0.8 }).addTo(that.layerWork);
            var remark = (i + 1) + ". " + stepitem.instruction;
            polyline.bindTooltip(remark, { className: 'jsondatalayer-tooltip', direction: 'top' });

            that.objStepLine[i] = polyline; //记录值，用于定位

            //合并所有步骤提示
            strRemark += "<br/>&nbsp;&nbsp;&nbsp;&nbsp;" + remark;

        }



        //提示信息
        var inHtml = "<div style='font-size:14px;' >"  + info.distance + " | 驾车约" + info.duration + " | 红绿灯"
            + info.traffic_lights + "个 | 打车约" + info.taxi_cost;

        if (info.tolls) {
            inHtml += "<br/>道路收费" + info.tolls + " | " + info.toll_distance;
        }

        inHtml += "<br/>途径：" + arrRoute.join('&gt;');
        inHtml += "<br/>步骤：" + strRemark + "</div>";


        for (var i in that.objStepLine) {
            var polyline = that.objStepLine[i];
            polyline.bindPopup(inHtml, { maxWidth: 450 });
        }


        map.fitBounds(that.layerWork.getBounds());
    },


}));
