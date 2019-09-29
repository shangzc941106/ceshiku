/* 2017-11-16 14:40:45   */
//模块：
L.widget.bindClass(L.widget.BaseWidget.extend({
    map: null,//框架会自动对map赋值
    options: {
        resources: [
            'view.css',
            //'http://api.map.baidu.com/api?v=2.0&ak=3lyTGoSaiEo7Tt0803bfgMSN1FW53nws'
            'http://api.map.baidu.com/getscript?v=2.0&ak=3lyTGoSaiEo7Tt0803bfgMSN1FW53nws&services='
        ],
        //直接添加到index
        view: {
            type: "append",
            url: 'view.html',
            parent: 'body'
        },
    },
    //每个窗口创建完成后调用
    winCreateOK: function (opt, result) {
        var that = this;

        $("#btn_streetscapeBar_close").click(function () {
            that.disableBase();
        });
    },
    markerXY: null,
    //激活插件
    activate: function () {
        var inhtml = '<div id="streetscapeView" style="position:absolute;right:0px;top:0px;border:1px solid #ccc;top: 0px;bottom: 0px;width:50%;overflow: hidden;">'
            + '<div id="streetscapeMap" style="height:100%;width:100%;overflow: hidden;"></div>'
            + '</div>';
        $("body").append(inhtml);

        $("#centerDiv").css({
            position: "absolute",
            height: "100%",
            width: "50%"
        });
        $(".no-print-view").hide();

        this.invalidateSize();

        var that = this; 
        var idx = setInterval(function () { 
            if (window["BMap"] == null) return;

            clearInterval(idx);
            that.addSecondMap();
        }, 500);


        this.map.on("click", this.map_clickHandler, this);
        $('.leaflet-container').css('cursor', 'crosshair');
    },
    //释放插件
    disable: function () {
        this.map.off("click", this.map_clickHandler, this);
        if (this.markerXY) {
            this.markerXY.remove();
            this.markerXY = null;
        }
        this.panorama = null;
        $("#streetscapeView").remove();
        $('.leaflet-container').css('cursor', '');

        $("#centerDiv").css({
            position: "",
            height: "100%",
            width: "100%"
        });
        $(".no-print-view").show();
        this.invalidateSize();
    },
    invalidateSize: function () {
        var map = this.map;
        setTimeout(function () {
            map.invalidateSize(false);
        }, 100);
    },
    getBaiduPoint: function (latlng) {
        latlng = this.map.convert2wgs(latlng);
        var jd = latlng[1];
        var wd = latlng[0];

        point = L.ccp.pointconvert.wgs2bd([jd, wd]);
        jd = point[0];
        wd = point[1];

        return { x: jd, y: wd };
    },
    centerAt: function (_latlng) {
        var latlng = this.map.convert2map(_latlng);

        if (this.markerXY == null) {
            this.markerXY = L.marker(latlng, {
                icon: L.icon({
                    "iconUrl": this.path + "img/streetimg.png",
                    "iconSize": [26, 38],
                    "iconAnchor": [13, 38]
                })
            });
            this.map.addLayer(this.markerXY);
        } else {
            this.markerXY.setLatLng(latlng);
        }

        this.map.centerAt(latlng);
    },
    //增加街景的对象以及初始化以及相关街景事件
    panorama: null,
    addSecondMap: function () { 
        var that = this;
        var point = this.getBaiduPoint(this.map.getCenter());

        var panorama = new BMap.Panorama('streetscapeMap');
        panorama.setPosition(new BMap.Point(point.x, point.y)); //根据经纬度坐标展示全景图
        panorama.setPov({ heading: -40, pitch: 6 });
        panorama.addEventListener('position_changed', function (e) { //全景图位置改变后，普通地图中心点也随之改变
            var pos = panorama.getPosition();//街景变换返回触发的回调函数
            pos = L.ccp.pointconvert.bd2wgs([pos.lng, pos.lat]);

            that.centerAt([pos[1], pos[0]]);
        });
        this.panorama = panorama;
    },
    //点击地图的事件,触发街景改变
    map_clickHandler: function (event) {
        var point = this.getBaiduPoint(event.latlng);
        if (this.panorama) {
            this.panorama.setPosition(new BMap.Point(point.x, point.y)); //根据经纬度坐标展示全景图
        }
    }




}));