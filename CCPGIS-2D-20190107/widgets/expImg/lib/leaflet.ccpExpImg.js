//地图导出图片控件

L.ExpImgCrl = L.Class.extend({
    options: {
        title: '地图导出图片',
        position: 'topleft',
        printModes: ["Portrait", "Landscape", "Custom"],
        printModesNames: { Portrait: "外框", Auto: "全屏", Cancel: "取消", Custom: "出图" },
        latlngControl: {}
    },

    initialize: function (options) {
        //this._appendControlStyles();
        L.setOptions(this, options);
    },
    init: function (map) {
        this.$mapParentDiv = $("#" + this.options.eleid);
        this._map = map;

        this._isContainerRemove = true;
        //this._waterLineGroup = new L.LayerGroup();
    },
    onAdd: function () {
        this.$mapParentDiv = $("#" + this.options.eleid);

        var container = L.DomUtil.create('div', 'leaflet-control-browser-print leaflet-bar leaflet-control'); // container
        L.DomEvent.disableClickPropagation(container);

        var icon = L.DomUtil.create('a', '', container);
        this.link = icon;
        this.link.id = "leaflet-browser-print";
        this.link.title = this.options.title;

        L.DomEvent.addListener(container, 'mouseover', this._displayPageSizeButtons, this);
        L.DomEvent.addListener(container, 'mouseout', this._hidePageSizeButtons, this);

        this.holder = L.DomUtil.create('ul', 'browser-print-holder', container); // holder

        var domPrintModes = [];

        for (var i = 0; i < this.options.printModes.length; i++) {
            var mode = this.options.printModes[i];
            var normalizedName = mode[0].toUpperCase() + mode.substring(1).toLowerCase();

            if (this["_print" + normalizedName]) {
                if (normalizedName == "Portrait") { //外框模式

                    var form = this._form = L.DomUtil.create('form', 'leaflet-control-position-form', this.holder);
                    form.style.display = "none";
                    var input_lon = this._input_lon = document.createElement('input');
                    input_lon.className = 'leaflet-control-position-form-input-lon';
                    input_lon.name = "lon";
                    input_lon.type = "number";
                    input_lon.placeholder = "经度网格数";
                    input_lon.style.width = '70px';
                    input_lon.style.height = '30px';

                    var input_lat = this._input_lat = document.createElement('input');
                    input_lat.className = 'leaflet-control-position-form-input-lat';
                    input_lat.type = "number";
                    input_lat.name = "lat";
                    input_lat.placeholder = "纬度网格数";
                    input_lat.style.width = '70px';
                    input_lat.style.height = '30px';

                    this._placeholder(input_lat, '#999');
                    this._placeholder(input_lon, '#999');

                    var domMode = L.DomUtil.create('li', 'browser-print-mode'); //domMode

                    domMode.innerHTML = this.options.printModesNames ? this.options.printModesNames[normalizedName] : normalizedName;

                    form.appendChild(input_lat);
                    form.appendChild(input_lon);
                    form.appendChild(domMode);

                    L.DomEvent.addListener(domMode, 'click', this["_print" + normalizedName], this);

                }
                else {
                    var domMode = L.DomUtil.create('li', 'browser-print-mode', this.holder); //domMode

                    domMode.innerHTML = this.options.printModesNames ? this.options.printModesNames[normalizedName] : normalizedName;

                    L.DomEvent.addListener(domMode, 'click', this["_print" + normalizedName], this);
                }
                domPrintModes.push(domMode);
            }
        }

        this.options.printModes = domPrintModes;

        setTimeout(function () {
            container.className += parseInt(L.version) ? " v1" : " v0-7"; // parseInt(L.version) returns 1 for v1.0.3 and 0 for 0.7.7;
        }, 10);
        this._isContainerRemove = true;
        //this._waterLineGroup = new L.LayerGroup();
        return container;
    },
    _placeholder: function (nodes, pcolor) {

        if (!('placeholder' in document.createElement('input'))) {
            var self = nodes,
                placeholder = self.placeholder;
            self.onfocus = function () {

                if (self.value == placeholder) {

                    self.value = '';
                    self.style.color = "";
                }
            }
            self.onblur = function () {

                if (self.value == '') {

                    self.value = placeholder;
                    self.style.color = pcolor;
                }
            }
            self.value = placeholder;
            self.style.color = pcolor;
        }
    },
    _displayPageSizeButtons: function () {

        this.holder.style.marginTop = "-" + this.link.clientHeight - 1 + "px";

        if (this.options.position.indexOf("left") > 0) {

            this.link.style.borderTopRightRadius = "0px";
            this.link.style.borderBottomRightRadius = "0px";

            this.holder.style.marginLeft = this.link.clientWidth + "px";

        } else {

            this.link.style.borderTopLeftRadius = "0px";
            this.link.style.borderBottomLeftRadius = "0px";
            this.holder.style.marginRight = this.link.clientWidth + "px";
        }
        this.options.printModes.forEach(function (mode) {
            mode.style.display = "inline-block";
        });
        this._form.style.display = "inline-block";
    },

    _hidePageSizeButtons: function () {

        this.holder.style.marginTop = "";

        if (this.options.position.indexOf("left") > 0) {

            this.link.style.borderTopRightRadius = "";
            this.link.style.borderBottomRightRadius = "";
            this.holder.style.marginLeft = "";

        } else {

            this.link.style.borderTopLeftRadius = "";
            this.link.style.borderBottomLeftRadius = "";
            this.holder.style.marginRight = "";
        }

        this.options.printModes.forEach(function (mode) {
            mode.style.display = "";
        });
        this._form.style.display = "none";
    },
    _printCancel: function () { //取消所有操作

        this._map.off('mousedown', this._startPortraitPoligon, this);
        this._map.off('mousedown', this._startAutoPoligon, this);
        this._endPortrait();
        this._endCustom();
        if (this.options.portrait) {   //画外框之后点取消
            this.options.portrait = undefined;
            this._map.off('resize', this._reset, this);
            this._map.off('viewreset', this._reset, this);
            this._map.off('move', this._reset, this);
            this._map.off('moveend', this._reset, this);
            this._map.fire('moveend');
        }
    },
    _printLandscape: function () {
        this._endCustom();
        this._print("Landscape");
    },

    _printAuto: function () {
        this._endCustom();
        this._print("Auto");
    },

    _printCustom: function () {
        this._endCustom();
        this._map.on('mousedown', this._startAutoPoligon, this);
        this._map.on('mouseup', this._endAutoPoligon, this);
        $('.leaflet-container').css('cursor', 'crosshair');
    },

    _printPortrait: function (event) {
        L.DomEvent.preventDefault(event);
        this._endCustom();
         
        if (this.options.portrait) {   //再次画框时清除上次画框
            this.options.portrait = undefined;
            this._map.off('resize', this._reset, this);
            this._map.off('viewreset', this._reset, this);
            this._map.off('move', this._reset, this);
            this._map.off('moveend', this._reset, this);
            this._map.fire('moveend');//触发moveend清除画框
        }
        this._map.on('mousedown', this._startPortraitPoligon, this);
        this._map.on('mouseup', this._endPortraitPoligon, this);

    },
    _reset: function () {
        //console.log("_reset");
        if (this.options.portrait) {
            var autoBounds = this.options.portrait.rectangle.getBounds();
            this._print("Portrait", autoBounds);
        }
    },
    _addPrintClassToContainer: function (map, printClassName) {
        var container = map.getContainer();

        if (container.className.indexOf(printClassName) === -1) {
            container.className += " " + printClassName;
        }
    },

    _removePrintClassFromContainer: function (map, printClassName) {
        var container = map.getContainer();

        if (container.className && container.className.indexOf(printClassName) > -1) {
            container.className = container.className.replace(" " + printClassName, "");
        }
    },

    _startAutoPoligon: function (e) {
        e.originalEvent.preventDefault();

        this._map.dragging.disable();
        this._map
        this._map.off('mousedown', this._startAutoPoligon, this);
        this._map.off('viewreset', this._reset, this); //关闭画外框监听
        this._map.off('resize', this._reset, this);
        this._map.off('move', this._reset, this);
        this._map.off('moveend', this._reset, this);
        this.options.custom = { start: e.latlng };
        this._map.on('mousemove', this._moveAutoPoligon, this);
    },

    _moveAutoPoligon: function (e) {
        if (this.options.custom) {
            e.originalEvent.preventDefault();
            if (this.options.custom.rectangle) {
                this._map.removeLayer(this.options.custom.rectangle);
            }

            this.options.custom.rectangle = L.rectangle([this.options.custom.start, e.latlng], { color: "gray", dashArray: '5, 10' });
            this.options.custom.rectangle.addTo(this._map);
        }
    },

    _endAutoPoligon: function (e) {

        e.originalEvent.preventDefault();
        this._endCustom();
        this._map.dragging.enable();
        if (this.options.custom) {

            this._map.removeLayer(this.options.custom.rectangle);

            var autoBounds = this.options.custom.rectangle.getBounds();

            this.options.custom = undefined;

            this._print("Custom", autoBounds);
        }

    },
    _startPortraitPoligon: function (e) {
        e.originalEvent.preventDefault();

        this._map.dragging.disable();

        this._map.off('mousedown', this._startPortraitPoligon, this);

        this.options.portrait = { start: e.latlng };
        this._map.on('mousemove', this._movePortraitPoligon, this);
    },

    _movePortraitPoligon: function (e) {
        if (this.options.portrait) {
            e.originalEvent.preventDefault();
            if (this.options.portrait.rectangle) {
                this._map.removeLayer(this.options.portrait.rectangle);
            }
            this.options.portrait.rectangle = L.rectangle([this.options.portrait.start, e.latlng], { color: "gray", dashArray: '5, 10' });
            this.options.portrait.rectangle.addTo(this._map);
        }
    },
    _endPortraitPoligon: function (e) {

        e.originalEvent.preventDefault();

        this._endPortrait();
        if (this.options.portrait) {
            this._map.removeLayer(this.options.portrait.rectangle);
        }

        this._map.dragging.enable();
        if (this.options.portrait) {
            var autoBounds = this.options.portrait.rectangle.getBounds();

            //this.options.custom = undefined;  //自定义出图时要用到此范围

            this._print("Portrait", autoBounds);

            this._map.on('resize', this._reset, this);
            this._map.on('viewreset', this._reset, this);
            this._map.on('move', this._reset, this);
            this._map.on('moveend', this._reset, this);
        }

    },
    _endPortrait: function () {
        this._map.off('mousemove', this._movePortraitPoligon, this);
        this._map.off('mouseup', this._endPortraitPoligon, this);
        $('.leaflet-container').css('cursor', '');
    },
    _endCustom: function () {
        this._map.off('mousemove', this._moveAutoPoligon, this);
        this._map.off('mouseup', this._endAutoPoligon, this);
        $('.leaflet-container').css('cursor', '');
    },
    _appendControlStyles: function () {
        var printControlStyleSheet = document.createElement('style');
        printControlStyleSheet.setAttribute('type', 'text/css');

        printControlStyleSheet.innerHTML += " .leaflet-control-browser-print a { background: #fff url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gcCCi8Vjp+aNAAAAGhJREFUOMvFksENgDAMA68RC7BBN+Cf/ZU33QAmYAT6BolAGxB+RrrIsg1BpfNBVXcPMLMDI/ytpKozMHWwK7BJJ7yYWQbGdBea9wTIkRDzKy0MT7r2NiJACRgotCzxykFI34QY2Ea7KmtxGJ+uX4wfAAAAAElFTkSuQmCC') no-repeat 5px; background-size: 16px 16px; display: block; border-radius: 4px; }";

        printControlStyleSheet.innerHTML += " .v0-7.leaflet-control-browser-print a#leaflet-browser-print { width: 30px; height: 30px; } .v1.leaflet-control-browser-print a#leaflet-browser-print { background-position-x: 7px; }";
        printControlStyleSheet.innerHTML += " .browser-print-holder { margin: 0px; padding: 0px; list-style: none; white-space: nowrap; } .browser-print-holder-left li:last-child { border-top-right-radius: 2px; border-bottom-right-radius: 2px; } .browser-print-holder-right li:first-child { border-top-left-radius: 2px; border-bottom-left-radius: 2px; }";
        printControlStyleSheet.innerHTML += " .browser-print-mode { display: none; background-color: #919187; color: #FFF; font: 11px/19px 'Helvetica Neue', Arial, Helvetica, sans-serif; text-decoration: none; padding: 4px 10px; text-align: center; } .v1 .browser-print-mode { padding: 6px 10px; } .browser-print-mode:hover { background-color: #757570; cursor: pointer; }";
        printControlStyleSheet.innerHTML += " .leaflet-browser-print--custom, .leaflet-browser-print--custom path { cursor: crosshair!important; }";
        printControlStyleSheet.innerHTML += " .leaflet-print-overlay { width: 100%; height: 100%; position: absolute; top: 0; background-color: white; left: 0; z-index: 1001; display: block!important; } ";
        printControlStyleSheet.innerHTML += " .leaflet--printing { overflow: hidden!important; margin: 0px!important; padding: 0px!important; } body.leaflet--printing > * { display: none; }";

        var head = document.getElementsByTagName('head')[0];
        head.appendChild(printControlStyleSheet);
    },

    _print: function (type, bounds) {
        var that = this;
        if (type == "Portrait") {
            //console.log("1112");
            //console.log("5879");
            if (bounds._southWest.lat < bounds._northEast.lat) {
                var b_lat = bounds._southWest.lat;
                var t_lat = bounds._northEast.lat;
            }
            if (bounds._southWest.lng < bounds._northEast.lng) {
                var l_lon = bounds._southWest.lng;
                var r_lon = bounds._northEast.lng;
            }
            var lat_num = Number(this._input_lat.value);
            var lon_num = Number(this._input_lon.value);
            if (lat_num == "" || isNaN(lat_num)) {
                lat_num =0; 
            }
            if (lon_num == "" || isNaN(lon_num)) {
                lon_num = 0;
            }
             
            that.__draw_frame_stick(this.options.latlngControl, t_lat, l_lon, b_lat, r_lon, lat_num, lon_num, 2, 10, 5, 1, true);

        } else {
            this.changeElStylForStart(type, bounds);
            if (this.options.portrait) { //若存在经纬框
                var $that = this;
                var innerBounds = this.options.portrait.rectangle.getBounds();//inner
                var outerBounds = bounds; //outer
                if (outerBounds.contains(innerBounds)) { //若外框包含经纬框

                    var flag = false; //只判断存在一次即可，排除重复判断

                    //Object.keys(this.options.layerGroup).forEach(function (key) {

                    //    if (map.hasLayer($that.options.layerGroup[key]) && flag == false) { //若地图上存在海图图层

                    //        $that.options.layerGroup[key].removeFrom(map);

                    //        var bbox = innerBounds.toBBoxString(); //内框边界
                    //        $.ajax({
                    //            url: "http://localhost:45730//home/getsql",
                    //            type: "POST",
                    //            data: { layerID: 6220000, bounds: bbox },
                    //            datatype: "JSON", 
                    //            success: function (data) {
                    //                $.each(data.features, function (index, item) {
                    //                    var onStyle = {
                    //                        "color": 'black',
                    //                        "weight": 1,
                    //                        "opacity": 1
                    //                    };
                    //                    L.geoJson(item, {
                    //                        style: onStyle
                    //                    }).addTo($that._waterLineGroup);
                    //                    $that._waterLineGroup.addTo(map);
                    //                });
                    //            },
                    //            error: function (XMLHttpRequest, textStatus, errorThrown) {
                    //                alert("错误！");
                    //            }
                    //        })
                    //        flag = true;
                    //    }
                    //});
                    that.__draw_outer_frame(this.options.latlngControl, outerBounds, innerBounds, 5);    //边界留白，重画经纬框                                          
                }
            }

            if (!that._map.isLoading) {
                that._map.isLoading = function () { return this._tilesToLoad || this._tileLayersToLoad; };
            }
            var interval = setInterval(function () {
                if (!that._map.isLoading()) {
                    clearInterval(interval);
                    domtoimage.preUrl = that.options.preUrl; //解决跨域问题
                    var eleid = that.options.eleid;
                    var node = document.getElementById(eleid);
                    //that.changeElStylForEnd();
                    //that._clearRect();
                    domtoimage.toPng(node)
                        .then(function (dataUrl) {
                            that.changeElStylForEnd();
                            var blob = that._dataURItoBlob(dataUrl);
                            that._downloadFile("地图截图.png", blob);
                            that._clearRect();
                        })
                        .catch(function (error) {
                            that.changeElStylForEnd();
                            console.error('oops, something went wrong!', error);
                        });
                }
            }, 50);
        }
    },
    //修改节点样式，开始导出
    changeElStylForStart: function (type, bounds) {
        $(".leaflet-control").hide();
        $(".leaflet-control-scale").show();
        $(".no-print").hide();

        //修改css
        $("html").css({
            "overflow": "auto",
            "background-color": "#888"
        });
        $("body").css({
            "overflow": "auto",
            "background-color": "#888"
        });
        this.$mapParentDiv.css({
            "background-color": "#ffffff",
            "left": "0"
        });
        switch (type) {
            default:
            case "Auto":
                break;
            case "Landscape":
                this.$mapParentDiv.css({
                    width: "1040px",
                    height: "715px"
                });
                break;
            case "Portrait":
                this.$mapParentDiv.css({
                    width: "850px",
                    height: "1100px"
                });
                break;
            case "Custom":

                var pt1 = this._map.latLngToLayerPoint(bounds.getNorthWest());
                var pt2 = this._map.latLngToLayerPoint(bounds.getSouthEast());
                var width = Math.abs(pt2.x - pt1.x);
                var height = Math.abs(pt2.y - pt1.y);
                this.$mapParentDiv.css({
                    width: width + "px",
                    height: height + "px"
                });
                this._map.invalidateSize(false);
                this._map.fitBounds(bounds, { animate: false });
                break;
        }

        //this.$mapDiv.removeClass('map').addClass('map_print').css({ "position": "absolute" });
        this.invalidateSize();
    },
    //修改节点样式，完成导出
    changeElStylForEnd: function () {
        $(".leaflet-control").show();
        $(".no-print").show();

        //修改css
        $("html").css({
            "overflow": "hidden",
            "background-color": "#ffffff"
        });
        $("body").css({
            "overflow": "hidden",
            "background-color": ""
        });
        this.$mapParentDiv.css({
            "background-color": "",
            "border": "",
            "position": "",
            "top": "0",
            "bottom": "0",
            "left": "0",
            "right": "0",
            "height": "100%",
            "width": "100%"
        });
        this.invalidateSize();
    },

    invalidateSize: function () {
        this._map.invalidateSize(false);
    },
    _dataURItoBlob: function (dataURI) {
        var byteString = atob(dataURI.split(',')[1]);
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        var ab = new ArrayBuffer(byteString.length);
        var dw = new DataView(ab);
        for (var i = 0; i < byteString.length; i++) {
            dw.setUint8(i, byteString.charCodeAt(i));
        }
        return new Blob([ab], { type: mimeString });
    },
    _downloadFile: function (fileName, blob) {
        var aLink = document.createElement('a');
        aLink.download = fileName;
        aLink.href = URL.createObjectURL(blob);
        document.body.appendChild(aLink);
        aLink.click();
        document.body.removeChild(aLink);
    },
    _clearRect: function () {
        this._input_lon.value = '';
        this._input_lat.value = '';
        this.options.portrait = undefined;
        if (this.options.latlngControl._container) {
            try {
                this._map.getPanes().overlayPane.removeChild(this.options.latlngControl._container);
            } catch (e) { }
            this._isContainerRemove = true;

            this._map.off('viewreset', this.options.latlngControl._reset, this.options.latlngControl);
            this._map.off('move', this.options.latlngControl._reset, this.options.latlngControl);
            this._map.off('moveend', this.options.latlngControl._reset, this.options.latlngControl);

            if (this._map.options.zoomAnimation) {
                this._map.off('zoomanim', this.options.latlngControl._animateZoom, this.options.latlngControl);
            }
        }

        //this._waterLineGroup.removeFrom(map);
    },
    __draw_outer_frame: function (self, outerBounds, innerBounds, frame_width) {

        //画外框矩形
        outerBounds;
        if (outerBounds._southWest.lat < outerBounds._northEast.lat) {
            var _lat_b_rect = outerBounds._southWest.lat;
            var _lat_t_rect = outerBounds._northEast.lat;
        }
        if (outerBounds._southWest.lng < outerBounds._northEast.lng) {
            var _lon_l_rect = outerBounds._southWest.lng;
            var _lon_r_rect = outerBounds._northEast.lng;
        }
        var _lt_rect = self._latLngToCanvasPoint(L.latLng(_lat_t_rect, _lon_l_rect));
        var _rt_rect = self._latLngToCanvasPoint(L.latLng(_lat_t_rect, _lon_r_rect));
        var _lb_rect = self._latLngToCanvasPoint(L.latLng(_lat_b_rect, _lon_l_rect));
        var _rb_rect = self._latLngToCanvasPoint(L.latLng(_lat_b_rect, _lon_r_rect));

        if (innerBounds._southWest.lat < innerBounds._northEast.lat) {
            var _lat_b_inner = innerBounds._southWest.lat;
            var _lat_t_inner = innerBounds._northEast.lat;
        }
        if (innerBounds._southWest.lng < innerBounds._northEast.lng) {
            var _lon_l_inner = innerBounds._southWest.lng;
            var _lon_r_inner = innerBounds._northEast.lng;
        }
        var _lt_inner = self._latLngToCanvasPoint(L.latLng(_lat_t_inner, _lon_l_inner));
        var _rt_inner = self._latLngToCanvasPoint(L.latLng(_lat_t_inner, _lon_r_inner));
        var _lb_inner = self._latLngToCanvasPoint(L.latLng(_lat_b_inner, _lon_l_inner));
        var _rb_inner = self._latLngToCanvasPoint(L.latLng(_lat_b_inner, _lon_r_inner));

        var ctx = self._canvas.getContext('2d');
        ctx.fillStyle = "white";
        ctx.fillRect(_lt_rect.x - 1, _lt_rect.y + 1, _rb_rect.x - _lt_rect.x + 2, _rb_rect.y - _lt_rect.y - 2);
        ctx.clearRect(_lt_inner.x - 1, _lt_inner.y + 1, _rb_inner.x - _lt_inner.x + 2, _rb_inner.y - _lt_inner.y - 2);  //挖空    

        var lat_num = Number(this._input_lat.value);
        var lon_num = Number(this._input_lon.value);
        if (lat_num == "" || isNaN(lat_num)) {
            lat_num = 0;
        }
        if (lon_num == "" || isNaN(lon_num)) {
            lon_num = 0; 
        }
        //画经纬度框
        this.__draw_frame_stick(this.options.latlngControl, _lat_t_inner, _lon_l_inner, _lat_b_inner, _lon_r_inner, lat_num, lon_num, 2, 10, 5, 1, true)


    },
    /*__draw_frame_stick:function(self, t_lat, l_lon, b_lat, r_lon, label_number_lat, label_number_lon, stick_width, stick_length, frame_width ) {

        
        var _lat_b_rect = b_lat,
            _lat_t_rect = t_lat;
        var _lon_l_rect = l_lon,
            _lon_r_rect = r_lon;
        //self._map= this._map
        var _lt_rect = self._latLngToCanvasPoint(L.latLng(_lat_t_rect, _lon_l_rect));
        var _rt_rect = self._latLngToCanvasPoint(L.latLng(_lat_t_rect, _lon_r_rect));
        var _lb_rect = self._latLngToCanvasPoint(L.latLng(_lat_b_rect, _lon_l_rect));
        var _rb_rect = self._latLngToCanvasPoint(L.latLng(_lat_b_rect, _lon_r_rect));

        //this._container = L.DomUtil.create('canvas', 'leaflet-image-layer');
        //this._canvas = L.DomUtil.create('canvas', '');      
        //this._container.appendChild(this._canvas);
        //self._canvas.ZIndex = "9999";


        var ctx = self._canvas.getContext('2d');

        ctx.beginPath();
        ctx.moveTo(_lt_rect.x-1, _lt_rect.y+1 );
        ctx.lineTo(_rt_rect.x+1, _rt_rect.y-1 );
        ctx.lineTo(_rb_rect.x+1, _rb_rect.y-1 );
        ctx.lineTo(_lb_rect.x-1, _lb_rect.y+1 );
        ctx.lineTo(_lt_rect.x-1, _lt_rect.y+1 );
        ctx.closePath();
        ctx.lineWidth = frame_width;
        ctx.strokeStyle = "black";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(_lt_rect.x - 7, _lt_rect.y - 7);
        ctx.lineTo(_rt_rect.x + 7, _rt_rect.y - 7);
        ctx.lineTo(_rb_rect.x + 7, _rb_rect.y + 7);
        ctx.lineTo(_lb_rect.x - 7, _lb_rect.y + 7);
        ctx.lineTo(_lt_rect.x - 7, _lt_rect.y - 7);
        ctx.closePath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
        ctx.stroke();
          
        var label_interval_lat = (t_lat - b_lat) / label_number_lat;
        var label_interval_lon = (r_lon - l_lon) / label_number_lon;

        for (var j = b_lat; j <= t_lat; j+=label_interval_lat)
        {
            var lngstr = this.__format_lat_dfs(j);
            var txtWidth = ctx.measureText(lngstr).width;
            var bb = self._latLngToCanvasPoint(L.latLng(j,l_lon));
            ctx.beginPath();
            ctx.moveTo(bb.x , bb.y)
            ctx.lineTo(bb.x - 7 - stick_length, bb.y);
            ctx.lineWidth = stick_width;
            ctx.strokeStyle = "black";
                
            ctx.stroke();
            ctx.font = "10px Verdana";
            ctx.save();
            ctx.translate((bb.x - stick_length - 5 - 15 ), bb.y);
            ctx.rotate(Math.PI / 2);
            ctx.fillStyle = "black";
            ctx.fillText(lngstr, -txtWidth / 2, 0);               
            ctx.restore();
        }

        for (var j = l_lon; j <= r_lon; j += label_interval_lon) {
            var lonstr = this.__format_lon_dfs(j);
            var txtWidth = ctx.measureText(lonstr).width;
            var bb = self._latLngToCanvasPoint(L.latLng(b_lat, j));
            ctx.beginPath();
            ctx.moveTo(bb.x , bb.y)
            ctx.lineTo(bb.x, bb.y + 7 + stick_length);
            ctx.lineWidth = stick_width;
            ctx.strokeStyle = "black";
            ctx.stroke();
            ctx.font = "10px Verdana";           
            ctx.fillStyle = "black";
            ctx.fillText(lonstr, bb.x-txtWidth / 2, bb.y+stick_length+5+15);
            ctx.restore();
        }               
    },*/
    __draw_frame_stick: function (self, t_lat, l_lon, b_lat, r_lon, label_number_lat, label_number_lon, stick_width, stick_length, frame_width, latlon_width, isDraw_latlon_line) {


        var _lat_b_rect = b_lat,
            _lat_t_rect = t_lat;
        var _lon_l_rect = l_lon,
            _lon_r_rect = r_lon;//modified by xie

        if (this._isContainerRemove == true) { //remove onadd + finish
            if (!self._map) {
                self._map = this._map;
            }
            if (!self._container) {
                self._initCanvas();
            }

            this._map._panes.overlayPane.appendChild(self._container);

            this._isContainerRemove = false;
            map.on('viewreset', self._reset, self);
            map.on('move', self._reset, self);
            map.on('moveend', self._reset, self);
            if (map.options.zoomAnimation && L.Browser.any3d) {
                map.on('zoomanim', self._animateZoom, self);
            }
            self._reset();

        }
        var _lt_rect = self._latLngToCanvasPoint(L.latLng(_lat_t_rect, _lon_l_rect));
        var _rt_rect = self._latLngToCanvasPoint(L.latLng(_lat_t_rect, _lon_r_rect));
        var _lb_rect = self._latLngToCanvasPoint(L.latLng(_lat_b_rect, _lon_l_rect));
        var _rb_rect = self._latLngToCanvasPoint(L.latLng(_lat_b_rect, _lon_r_rect));

        var ctx = self._canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(_lt_rect.x - 1, _lt_rect.y + 1);
        ctx.lineTo(_rt_rect.x + 1, _rt_rect.y - 1);
        ctx.lineTo(_rb_rect.x + 1, _rb_rect.y - 1);
        ctx.lineTo(_lb_rect.x - 1, _lb_rect.y + 1);
        ctx.lineTo(_lt_rect.x - 1, _lt_rect.y + 1);
        ctx.closePath();
        ctx.lineWidth = frame_width;
        ctx.strokeStyle = "black";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(_lt_rect.x - 7, _lt_rect.y - 7);
        ctx.lineTo(_rt_rect.x + 7, _rt_rect.y - 7);
        ctx.lineTo(_rb_rect.x + 7, _rb_rect.y + 7);
        ctx.lineTo(_lb_rect.x - 7, _lb_rect.y + 7);
        ctx.lineTo(_lt_rect.x - 7, _lt_rect.y - 7);
        ctx.closePath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "black";
        ctx.stroke();

        var label_interval_lat = (t_lat - b_lat) / label_number_lat;
        var label_interval_lon = (r_lon - l_lon) / label_number_lon;

        for (var j = b_lat; j < t_lat; j += label_interval_lat) {
            var lngstr = this.__format_lat_dfs(j);
            var txtWidth = ctx.measureText(lngstr).width;
            var bb = self._latLngToCanvasPoint(L.latLng(j, l_lon));
            var cc = self._latLngToCanvasPoint(L.latLng(j, r_lon));
            if (isDraw_latlon_line) {
                ctx.beginPath();
                ctx.lineWidth = latlon_width;
                ctx.moveTo(bb.x, bb.y);
                ctx.lineTo(cc.x, cc.y);
                ctx.strokeStyle = "grey";
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.moveTo(bb.x, bb.y)
            ctx.lineTo(bb.x - 7 - stick_length, bb.y);
            ctx.lineWidth = stick_width;
            ctx.strokeStyle = "black";

            ctx.stroke();
            ctx.font = "10px Verdana";
            ctx.save();
            ctx.translate((bb.x - stick_length - 5 - 15), bb.y);
            ctx.rotate(-Math.PI / 2);
            ctx.fillStyle = "black";
            ctx.fillText(lngstr, -txtWidth / 2, 0);

            ctx.restore();
        }
        {
            var lngstr = this.__format_lat_dfs(t_lat);
            var txtWidth = ctx.measureText(lngstr).width;
            var bb = self._latLngToCanvasPoint(L.latLng(t_lat, l_lon));

            ctx.beginPath();
            ctx.moveTo(bb.x, bb.y)
            ctx.lineTo(bb.x - 7 - stick_length, bb.y);
            ctx.lineWidth = stick_width;
            ctx.strokeStyle = "black";

            ctx.stroke();
            ctx.font = "10px Verdana";
            ctx.save();
            ctx.translate((bb.x - stick_length - 5 - 15), bb.y);
            ctx.rotate(-Math.PI / 2);
            ctx.fillStyle = "black";
            ctx.fillText(lngstr, -txtWidth / 2, 0);

            ctx.restore();

        }

        for (var j = l_lon; j < r_lon; j += label_interval_lon) {
            var lonstr = this.__format_lon_dfs(j);
            var txtWidth = ctx.measureText(lonstr).width;
            var bb = self._latLngToCanvasPoint(L.latLng(b_lat, j));
            var cc = self._latLngToCanvasPoint(L.latLng(t_lat, j));

            if (isDraw_latlon_line) {
                ctx.beginPath();
                ctx.lineWidth = latlon_width;
                ctx.moveTo(bb.x, bb.y);
                ctx.lineTo(cc.x, cc.y);
                ctx.strokeStyle = "grey";
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.moveTo(bb.x, bb.y)
            ctx.lineTo(bb.x, bb.y + 7 + stick_length);
            ctx.lineWidth = stick_width;
            ctx.strokeStyle = "black";

            ctx.stroke();
            ctx.font = "10px Verdana";
            ctx.fillStyle = "black";
            ctx.fillText(lonstr, bb.x - txtWidth / 2 + 5, bb.y + stick_length + 5 + 15);

        }
        {
            var lonstr = this.__format_lon_dfs(r_lon);
            var txtWidth = ctx.measureText(lonstr).width;
            var bb = self._latLngToCanvasPoint(L.latLng(b_lat, r_lon));
            ctx.beginPath();
            ctx.moveTo(bb.x, bb.y)
            ctx.lineTo(bb.x, bb.y + 7 + stick_length);
            ctx.lineWidth = stick_width;
            ctx.strokeStyle = "black";

            ctx.stroke();
            ctx.font = "10px Verdana";
            ctx.fillStyle = "black";
            ctx.fillText(lonstr, bb.x - txtWidth / 2 + 5, bb.y + stick_length + 5 + 15);
        }
    },
    __format_degree_dfs: function (value) {
        ///<summary>将度转换成为度分秒</summary>  

        //value = Math.abs(value);  
        var v1 = Math.floor(value);//度  
        var v2 = Math.floor((value - v1) * 60);//分  
        var v3 = Math.round((value - v1) * 3600 % 60);//秒  
        return v1 + '°' + v2 + '\'' + v3 + '"';
    },

    __format_lat_dfs: function (lat) {

        // todo: format type of float
        if (lat < 0) {
            return this.__format_degree_dfs(lat * -1) + 'S';
        }
        else if (lat > 0) {
            return this.__format_degree_dfs(lat) + 'N';
        }
        return this.__format_degree_dfs(lat);
    },

    __format_lon_dfs: function (lng) {
        if (lng > 180) {
            return this.__format_degree_dfs(360 - lng) + 'W';
        }
        else if (lng > 0 && lng < 180) {
            return this.__format_degree_dfs(lng) + 'E';
        }
        else if (lng < 0 && lng > -180) {
            return this.__format_degree_dfs(lng * -1) + 'W';
        }
        else if (lng == -180) {
            return '' + this.__format_degree_dfs(lng * -1);
        }
        else if (lng < -180) {
            return '' + this.__format_degree_dfs(360 + lng) + 'W';
        }
        return this.__format_degree_dfs(lng);

    }
});

