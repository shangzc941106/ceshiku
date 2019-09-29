/* 2017-11-16 14:40:45   */
//模块：
L.widget.bindClass(L.widget.BaseWidget.extend({
    map: null,//框架会自动对map赋值
    options: {
        resources: [
            'view.css',
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
        $("#btn_mapCompare_sp").click(function () {
            $("#centerDiv").css({
                height: "100%",
                width: "50%"
            });
            $("#centerDivEx").css({
                top: "0px",
                bottom: "0px",
                right: "0px",
                height: "100%",
                width: "50%"
            });
            that.invalidateSize();
            that.mapEx.invalidateSize(false);
        });
        $("#btn_mapCompare_cz").click(function () {
            $("#centerDiv").css({
                height: "50%",
                width: "100%"
            });
            $("#centerDivEx").css({
                top: "50%",
                bottom: "0px",
                right: "0px",
                height: "50%",
                width: "100%"
            });
            that.invalidateSize();
            that.mapEx.invalidateSize(false);
        });

        $("#btn_mapCompare_close").click(function () {
            that.disableBase();
        });
    },
    mapEx: null,
    //激活插件
    activate: function () {
        $(".toolBar").css({right:'250px'});

        var inhtml = '<div id="centerDivEx" style="position:absolute;right:0px;top:0px;border:1px solid #ccc;top: 0px;bottom: 0px;width:50%;overflow: hidden;">'
            + '<div id="mapEx" style="height:100%;width:100%;overflow: hidden;"></div>'
            + '</div>';
        $("body").append(inhtml);

        $("#centerDiv").css({
            position: "absolute",
            height: "100%",
            width: "50%"
        });
        this.invalidateSize();

        var configdata = ccputil.system.clone(this.map.gisdata.config);
         
        this.mapEx = L.ccp.createMap({
            id: "mapEx",
            layerToMap: layerToMap,
            data: configdata
        });

        for (var i in this.mapEx.gisdata.baselayers) {
            var item = this.mapEx.gisdata.baselayers[i];

            if (item.config.visible) continue;
            if (item.config.crs == null || item.config.crs == configdata.crs) {
                this.mapEx.addLayer(item);
                break;
            }
        }

        if (!this.mapEx.gisdata.controls.layer) {
            L.control.layers(this.mapEx.gisdata.baselayers, this.mapEx.gisdata.overlayers, { position: "topleft" }).addTo(this.mapEx);
        }

        this.map.on("movestart", this._map_movestartHandler, this);
        this.mapEx.on("movestart", this._mapEx_movestartHandler, this);

        this.mapEx.setView(this.map.getCenter(), this.map.getZoom(), { animate: false, noMoveStart: true });
    },
    //释放插件
    disable: function () {
        $(".toolBar").css({ right: '10px' });

        this.map.off("movestart", this._map_movestartHandler, this);
        this.map.off("moveend", this._map_moveendHandler, this);

        this.mapEx.off("movestart", this._mapEx_movestartHandler, this);
        this.mapEx.off("moveend", this._mapEx_moveendHandler, this);
        this.mapEx.remove();
        this.mapEx = null;

        $("#centerDivEx").remove();
        $("#btnMapComType").remove();

        $("#centerDiv").css({
            position: "",
            height: "100%",
            width: "100%"
        });
        this.invalidateSize();
    },
    invalidateSize: function () {
        var map = this.map;
        var mapEx = this.mapEx;
        setTimeout(function () {
            map.invalidateSize(false);
            if (mapEx)
                mapEx.invalidateSize(false);
        }, 100);
    },

    _map_movestartHandler: function (e) {
        this.map.on("moveend", this._map_moveendHandler, this);
    }, 
    _map_moveendHandler: function (e) {
        this.map.off("moveend", this._map_moveendHandler, this);
        this.mapEx.setView(this.map.getCenter(), this.map.getZoom(), { animate: false, noMoveStart: true });
    }, 
    _mapEx_movestartHandler: function (e) {
        this.mapEx.on("moveend", this._mapEx_moveendHandler, this);
    }, 
    _mapEx_moveendHandler: function (e) {
        this.mapEx.off("moveend", this._mapEx_moveendHandler, this);
        this.map.setView(this.mapEx.getCenter(), this.mapEx.getZoom(), { animate: false, noMoveStart: true });
    }


}));