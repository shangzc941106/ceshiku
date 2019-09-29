/* 2017-9-27 08:02:34   */
//模块：
var mapSwipeWidget = L.widget.bindClass(L.widget.BaseWidget.extend({
    map: null,//框架会自动对map赋值
    options: {
        resources: [
            'view.css',
        ],
        //弹窗
        view: {
            type: "append",
            url: 'view.html',
            parent: 'body'
        },
    },
    //每个窗口创建完成后调用
    winCreateOK: function (opt, result) {
        var that = this;

        var inhtmlBaseLayer = "";
        var inhtmlSwipelayer = "";
        var arrLayers = this.getBaseMaps();
        for (var i = 0; i < arrLayers.length; i++) {
            var item = arrLayers[i];
            inhtmlBaseLayer += ' <li><a href="javascript:mapSwipeWidget.changeSelectBaseLayer(' + i + ',true)">' + item.name + '</a></li>';
            inhtmlSwipelayer += ' <li><a href="javascript:mapSwipeWidget.changeSelectSwipeLayer(' + i + ',true)">' + item.name + '</a></li>';
        }
        $("#ddl_basemap").html(inhtmlBaseLayer);
        $("#ddl_swipelayer").html(inhtmlSwipelayer);
        this.changeSelectBaseLayer(0, false);
        this.changeSelectSwipeLayer(1, false);

        if (arrLayers.length == 2) {
            $(".select-swiper-layer").hide();
        }

        $("#btn_mapSwipe_sp").click(function () {
            that.changeSwipe("2");
        });
        $("#btn_mapSwipe_cz").click(function () {
            that.changeSwipe("1");
        });

        $("#btn_mapSwipe_close").click(function () {
            that.disableBase();
        });
    },
    layerSwipe: null,
    layerBase: null,
    arrOldLayers: [],
    //激活插件
    activate: function () {
        $(".toolBar").css({ top: '60px' });

        this.swipeType = "1";

        var that = this;
        //上下屏对比
        this.mapPageCustomer.create({
            parent: "#centerDiv",
            onChange: function (val) {
                that.clip();
            }
        });

        //左右屏对比
        this.mapPageCustomer2.create({
            parent: "#centerDiv",
            onChange: function (val) {
                that.clip();
            }
        });
        this.mapPageCustomer2.hide();


        //记录图层
        var arrOldLayers = [];
        this.map.eachLayer(function (layer) {
            if (layer instanceof L.TileLayer)
                arrOldLayers.push(layer);
        });
        $.each(arrOldLayers, function (index, item) {
            that.map.removeLayer(item);
        });
        this.arrOldLayers = arrOldLayers;

        //恢复上次记录
        var layers = this.getBaseMaps();
        if (this.layerBase != null) {
            this.map.addLayer(this.layerBase);
        }
        else {
            this.layerBase = layers[0]._layer;
            this.map.addLayer(this.layerBase);
        }

        if (this.layerSwipe != null) {
            this.map.addLayer(this.layerSwipe);
        }
        else {
            this.layerSwipe = layers[1]._layer;
            this.map.addLayer(this.layerSwipe);
        }

        this.map.on('move', this.clip, this);
        this.clip();

        //在双屏对比后切换到该widget会不显示，下面代码解决此问题
        var that = this;
        setTimeout(function () {
            that.updateBaseLayer(that.layerBase);
        }, 500);


    },
    //释放插件
    disable: function () {
        $(".toolBar").css({ top: '10px' });

        this.map.off('move', this.clip, this);
        $("#map").height("100%");

        //清除记录 
        this.removeSwipeLayer();
        this.layerSwipe = null;
        this.layerBase = null;

        //恢复图层 
        var that = this;
        $.each(this.arrOldLayers, function (index, item) {
            that.map.addLayer(item);
        })
        this.arrOldLayers = [];


        this.mapPageCustomer.remove();
        this.mapPageCustomer2.remove();
    },
    removeSwipeLayer: function () {

        if (this.layerBase != null) {
            this.map.removeLayer(this.layerBase);
        }
        if (this.layerSwipe != null) {
            var nw = this.map.containerPointToLayerPoint([0, 0]),
                se = this.map.containerPointToLayerPoint(this.map.getSize());
            var rect = 'rect(' + [nw.y, se.x, se.y, nw.x].join('px,') + 'px)';

            this.clipLayer(this.layerSwipe, rect);
            this.map.removeLayer(this.layerSwipe);
        }
    },
    clip: function () {
        if (this.layerSwipe == null) return;

        var nw = this.map.containerPointToLayerPoint([0, 0]),
            se = this.map.containerPointToLayerPoint(this.map.getSize());

        var clipX, clipY;
        if (this.swipeType == "1") {
            clipX = se.x;
            clipY = nw.y + (se.y - nw.y) * Number(this.mapPageCustomer.$range.val());
        }
        else {
            clipX = nw.x + (se.x - nw.x) * Number(this.mapPageCustomer2.$range.val());
            clipY = se.y;
        }
        var rect = 'rect(' + [nw.y, clipX, clipY, nw.x].join('px,') + 'px)';

        this.clipLayer(this.layerSwipe, rect);
    },
    clipLayer: function (layerSw, rect) {
        var that = this;
        if (layerSw instanceof L.LayerGroup || layerSw instanceof L.FeatureGroup) {
            //图层数组时
            layerSw.eachLayer(function (layer) {
                that.clipLayer(layer, rect);
            });
        }
        else {//图层时
            var container = layerSw.getContainer()
            if (container && container.style)
                container.style.clip = rect;
        }
    },
    swipeType: "1",
    changeSwipe: function (swipeType) {
        this.swipeType = swipeType;
        if (swipeType == "1") {
            this.mapPageCustomer.show();
            this.mapPageCustomer2.hide();
        }
        else {
            this.mapPageCustomer.hide();
            this.mapPageCustomer2.show();
        }
        this.clip();
    },
    //上下屏
    mapPageCustomer: {
        onChangeFun: null,
        $parent: null,
        $drag: null,
        $range: null,
        create: function (param) {
            this.remove();

            this.$parent = $(param.parent);
            this.onChangeFun = param.onChange;

            var inhtml = '<div id="dragSwipe" style="position: absolute;left: 0px;height: 1px; background: rgb(214, 214, 214); width: 100%; border-top: 1px solid rgb(170, 170, 170); border-bottom: 1px solid rgb(170, 170, 170); z-index: 400;">'
                + '<div style="width: 168px; height: 5px; margin: auto; background: #999;cursor: s-resize;"></div>'
                + '<input id="rangeSwipe" class="range" type="range" min="0" max="1.0" step="any" style="display: none;z-index:-1;"></div>';
            this.$parent.append(inhtml);

            this.$drag = $("#dragSwipe");
            this.$range = $("#rangeSwipe");


            this.$drag.css({
                top: (this.$parent.height() / 2) + "px"
            });

            if (this.isMobile()) {
                this.targetMoveTBHandle();
            } else {
                this.targetMoveHandle();
            }

            var height = this.$parent.height();
            var offset_y = this.$drag[0].offsetTop;
            this.$range.val(offset_y / height);
        },
        show: function () {
            this.$drag.show();
        },
        hide: function () {
            this.$drag.hide();
        },
        remove: function () {
            if (this.$drag) {
                this.$drag.remove();
                this.$drag = null;
            }
            if (this.$range) {
                this.$range.remove();
                this.$range = null;
            }
        },
        isMobile: function () {
            if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
                return true;
            } else {
                return false;
            }
        },
        targetMoveHandle: function () {
            var that = this;
            this.$drag.bind("mousedown", function (event) {
                var height = that.$parent.height();
                var offset_y = that.$drag[0].offsetTop;
                var mouse_y = event.pageY;
                var h = 0; //纠偏值

                $(document).bind("mousemove", function (ev) {
                    var _y = ev.pageY - mouse_y;
                    var temp_y = offset_y + _y;

                    if (temp_y > 0 && temp_y < height - h) {
                        var now_y = (offset_y + _y) + h;
                        that.$drag.css({
                            top: now_y + "px"
                        });
                        that.$range.val(now_y / height);
                        that.onChangeFun();
                    }
                });
            });
            $(document).bind("mouseup", function () {
                $(this).unbind("mousemove");
            });
        },
        targetMoveTBHandle: function () {

            this.$drag.bind("touchstart", function (event) {

                var height = that.$parent.height();
                var offset_y = this.$drag[0].offsetTop;
                var _touch = event.originalEvent.targetTouches[0];
                var mouse_y = _touch.pageY;
                var h = 0; //纠偏值

                this.$drag.bind("touchmove", function (ev) {
                    var _touch = ev.originalEvent.targetTouches[0];
                    var _y = _touch.pageY - mouse_y;

                    var temp_y = offset_y + _y;
                    if (temp_y > 0 && temp_y < height - h) {
                        var now_y = (offset_y + _y) + h;
                        $(obj1).css({
                            top: now_y + "px"
                        });
                        that.$range.val(now_y / height);
                        that.onChangeFun();
                    }
                });
            });
            $(obj1).bind("touchup", function () {
                $(this).unbind("touchmove");
            });

        }
    },
    //左右屏
    mapPageCustomer2: {
        onChangeFun: null,
        $parent: null,
        $drag: null,
        $range: null,
        create: function (param) {
            this.remove();

            this.$parent = $(param.parent);
            this.onChangeFun = param.onChange;

            var inhtml = '<div id="dragSwipe2" style="position: absolute; top: 0px; width: 1px; background: rgb(214, 214, 214); height: 100%; border-left: 1px solid rgb(170, 170, 170); border-right: 1px solid rgb(170, 170, 170); z-index: 400; padding-top: 324px; display: block;">'
                + '<div style="height: 168px; width: 5px; margin: auto; background: #999;cursor: e-resize;"></div>'
                + '<input id="rangeSwipe2" class="range" type="range" min="0" max="1.0" step="any" style="display:none; z-index:-1;"></div>';
            this.$parent.append(inhtml);

            this.$drag = $("#dragSwipe2");
            this.$range = $("#rangeSwipe2");


            this.$drag.css({
                'padding-top': ((this.$parent.height() - 168) / 2) + "px",
                'left': (this.$parent.width() / 2) + "px"
            });


            if (this.isMobile()) {
                this.targetMoveTBHandle();
            } else {
                this.targetMoveHandle();
            }

            var height = this.$parent.width();
            var offset_y = this.$drag[0].offsetLeft;
            this.$range.val(offset_y / height);
        },
        show: function () {
            this.$drag.show();
        },
        hide: function () {
            this.$drag.hide();
        },
        remove: function () {
            if (this.$drag) {
                this.$drag.remove();
                this.$drag = null;
            }
            if (this.$range) {
                this.$range.remove();
                this.$range = null;
            }
        },
        isMobile: function () {
            if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
                return true;
            } else {
                return false;
            }
        },
        targetMoveHandle: function () {
            var that = this;
            this.$drag.bind("mousedown", function (event) {
                var height = that.$parent.width();
                var h = 0; //纠偏值

                var offset_y = that.$drag[0].offsetLeft;
                var mouse_y = event.pageX;

                $(document).bind("mousemove", function (ev) {
                    var _y = ev.pageX - mouse_y;
                    var temp_y = offset_y + _y;
                    if (temp_y > 0 && temp_y < height - h) {
                        var now_y = (offset_y + _y) + h;
                        that.$drag.css({
                            left: now_y + "px"
                        });

                        that.$range.val(now_y / height);
                        that.onChangeFun();
                    }
                });
            });
            $(document).bind("mouseup", function () {
                $(this).unbind("mousemove");
            });
        },
        targetMoveTBHandle: function (that, obj1, h) {
            var that = this;
            this.$drag.bind("touchstart", function (event) {
                var height = that.$parent.width();
                var h = 0; //纠偏值

                var offset_y = that.$drag[0].offsetLeft;
                var _touch = event.originalEvent.targetTouches[0];
                var mouse_y = _touch.pageX;

                that.$drag.bind("touchmove", function (ev) {
                    var _touch = ev.originalEvent.targetTouches[0];
                    var _y = _touch.pageX - mouse_y;

                    var temp_y = offset_y + _y;
                    if (temp_y > 0 && temp_y < height - h) {
                        var now_y = (offset_y + _y) + h;
                        that.$drag.css({
                            left: now_y + "px"
                        });

                        that.$range.val(now_y / height);
                        that.onChangeFun();
                    }
                });
            });
            $(obj1).bind("touchup", function () {
                $(this).unbind("touchmove");
            });

        }
    },


    _basemaps: null,
    getBaseMaps: function () {
        if (this._basemaps == null) {
            var layers = this.map.gisdata.config.basemaps;
            var newLayers = [];
            for (var i = 0; i < layers.length; i++) {
                var item = layers[i];
                if (item.type == "group" && item._layer == null) continue;
                if (item.crs == null || item.crs == this.map.gisdata.config.crs) {
                    newLayers.push(item);
                }
            }
            layers = this.map.gisdata.config.operationallayers;
            for (var i = 0; i < layers.length; i++) {
                var item = layers[i];
                if (item.type == "group" && item._layer == null) continue;

                if (item._layer instanceof L.TileLayer) {
                    newLayers.push(item);
                }
            }
            this._basemaps = newLayers;
        }
        return this._basemaps;
    },
    updateBaseLayer: function (layer) {
        //清除记录 
        this.removeSwipeLayer();

        this.layerBase = layer;

        this.map.addLayer(this.layerBase);
        if (this.layerSwipe != null)
            this.map.addLayer(this.layerSwipe);

        this.clip();
    },
    updateSwipeLayer: function (layer) {
        //清除记录 
        this.removeSwipeLayer();

        this.layerSwipe = layer;

        if (this.layerBase != null)
            this.map.addLayer(this.layerBase);
        this.map.addLayer(this.layerSwipe);

        this.clip();
    },
    //view界面控制
    _last_baselayer_id: null,
    _last_swipeLayer_id: null,
    changeSelectBaseLayer: function (id, ischange) {
        if (this._last_swipeLayer_id == id) {
            toastr.warning('底图与卷帘图层不能为同一图层！');
            return;
        }
        this._last_baselayer_id = id;

        var arrLayers = this.getBaseMaps();
        var thisLayer = arrLayers[id];
        $("#btnSelectBaseMap").html('已选:' + thisLayer.name + '<span class="caret"></span>');
        if (ischange)
            this.updateBaseLayer(thisLayer._layer);
    },
    changeSelectSwipeLayer: function (id, ischange) {
        if (this._last_baselayer_id == id) {
            toastr.warning('底图与卷帘图层不能为同一图层！');
            return;
        }
        this._last_swipeLayer_id = id;

        var arrLayers = this.getBaseMaps();
        var thisLayer = arrLayers[id];
        $("#btnSelectSwipelayer").html('已选:' + thisLayer.name + '<span class="caret"></span>');

        if (ischange)
            this.updateSwipeLayer(thisLayer._layer);
    },



}));