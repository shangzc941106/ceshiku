
/**
 * 自定义地图导航控件
*/
L.control.slider = function (options) {
    var _map = options.map;

    var minzoom = _map.getMinZoom() || 0;
    var maxzoom = _map.getMaxZoom() || 18;
    var zoom = _map.getZoom();
    var center = _map.getCenter();

    var config_slider = {
        targetId: _map._container.id,
        minValue: 0,
        maxValue: maxzoom - minzoom,
        startValue: zoom,
        toolbarCss: ["map_slider_toobar", "map_slider_toobar_button", "map_slider_toobar_slider", "map_slider_toobar_mark"],
        marksShow: {
            countryLevel: options.countryLevel,     //4,
            provinceLevel: options.provinceLevel,   //7,
            cityLevel: options.cityLevel,           //10,
            streetLevel: options.streetLevel,       //14
        }
    }
    var toolBar = new MapNavigationToolbar(config_slider);
 
    /* 地图上移 */
    toolBar.onMoveUp = function () { _map.panBy([0, -100]); };
    /* 地图下移 */
    toolBar.onMoveDown = function () { _map.panBy([0, 100]); };
    /* 地图左移 */
    toolBar.onMoveLeft = function () { _map.panBy([-100, 0]); };
    /* 地图右移 */
    toolBar.onMoveRight = function () { _map.panBy([100, 0]); };
    /* 地图全图 */
    toolBar.onFullMap = function () { _map.setView(center,zoom); };
    /* 地图放大 */
    toolBar.onZoomIn = function () { _map.zoomIn(); };
    /* 地图缩小 */
    toolBar.onZoomOut = function () { _map.zoomOut(); };
    /* 滑动条滑动结束 */
    toolBar.onSliderEnd = function () { _map.setZoom(toolBar.getValue() + minzoom); };

    /* 地图级别标记-街道 */
    toolBar.onMark_Street = function () { _map.setZoom(config_slider.marksShow.streetLevel); };
    /* 地图级别标记-城市 */
    toolBar.onMark_City = function () { _map.setZoom(config_slider.marksShow.cityLevel); };
    /* 地图级别标记-省级 */
    toolBar.onMark_Province = function () { _map.setZoom(config_slider.marksShow.provinceLevel); };
    /* 地图级别标记-国家 */
    toolBar.onMark_Country = function () { _map.setZoom(config_slider.marksShow.countryLevel); };

    toolBar.create();

    _map.on("zoomend ", function () {
        toolBar.setValue(_map.getZoom() - minzoom);
    });

    switch (options.position) { 
        case "topleft":
            $(".map_slider_toobar").css("top", "10px");
            $(".map_slider_toobar").css("left", "10px");
            break;
        case "topright":
            $(".map_slider_toobar").css("top", "10px");
            $(".map_slider_toobar").css("right", "10px");
            break;
        case "bottomleft":
            $(".map_slider_toobar").css("bottom", "10px");
            $(".map_slider_toobar").css("left", "10px");
            break;
        case "bottomright":
            $(".map_slider_toobar").css("bottom", "10px");
            $(".map_slider_toobar").css("right", "10px");
            break;
    }
    if (options.style)
        $(".map_slider_toobar").css(options.style);


    return toolBar;
}

/* 配置导航条相关参数 */
MapNavigationToolbar = function (cfg) {
    if ((typeof cfg) != "object") {
        alert("配置参数错误，请重新配置参数！"); return;
    }
    this.targetId = cfg.targetId;/* 容器ID */
    this.minValue = cfg.minValue ? cfg.minValue : 0;/* 滑动条最小值 */
    this.maxValue = cfg.maxValue ? cfg.maxValue : 12;/* 滑动条最大值 */
    this.startValue = cfg.startValue ? cfg.startValue : 0;/* 滑动条起始值 */
    this.toolbarCss = cfg.toolbarCss ? cfg.toolbarCss : ["toolBar", "toolBar_button", "toolBar_slider", "toolBar_mark", ];/* 导航条样式 */
    this.marksShow = cfg.marksShow ? cfg.marksShow : { countryLevel: null, provinceLevel: null, cityLevel: null, streetLevel: null }; /* 地图级别标记-是否显示 */

    this.onMoveUp = null;/* 地图上移 */
    this.onMoveDown = null;/* 地图下移 */
    this.onMoveLeft = null;/* 地图左移 */
    this.onMoveRight = null;/* 地图右移 */
    this.onFullMap = null;/* 地图全图 */
    this.onZoomIn = null;/* 地图放大 */
    this.onZoomOut = null;/* 地图缩小 */
    this.onSliderEnd = null;/* 滑动条滑动结束 */
    this.onMark_Street = null;/* 地图级别标记-街道 */
    this.onMark_City = null;/* 地图级别标记-城市 */
    this.onMark_Province = null;/* 地图级别标记-省级 */
    this.onMark_Country = null;/* 地图级别标记-国家 */
    this._initializer.apply(this);/* 配置导航条相关参数 */
}
/* 导航条具体实现 */
MapNavigationToolbar.prototype = {
    /* 初始化 */
    _initializer: function () {
        this._button = {};
        this._slider = {};
        this._mark = {};
        //this._target  = document.getElementById(this.targetId);
        this._target = document.createElement("DIV");

        document.getElementById(this.targetId).parentNode.appendChild(this._target);

        if (this.minValue > this.maxValue) { var x = this.minValue; this.minValue = this.maxValue; this.maxValue = x; }
        if (this.minValue > this.startValue) { this.startValue = this.minValue; }
        this._value = this.startValue;
    }, /* 创建工具条 */
    create: function () {
        this._createToolbar();
    }, /* 显示工具条 */
    show: function () {
        this._target.style.display = "block";
    }, /* 隐藏工具条 */
    hide: function () {
        this._target.style.display = "none";
    }, /* 释放资源 */
    dispose: function () {
        //virtual function
    }, /* 创建导航工具栏 */
    _createToolbar: function () {
        with (this) {
            _target.className = toolbarCss[0];
            disableSelection(_target);
            _createButton();
            _createSlider();
            _createMark();
        }
    }, /* 创建导航按钮 */
    _createButton: function () {
        with (this) {
            var _self = this._button;
            /* 导航按钮-容器 */
            _self._container = document.createElement("DIV");
            _target.appendChild(_self._container);
            _self._container.className = toolbarCss[1];
            /* 导航按钮-上移（北） */
            _self._north = document.createElement("DIV");
            _self._container.appendChild(_self._north);
            _self._north.id = targetId + "_button_north";
            _self._north.title = "向上平移";
            _self._north.className = toolbarCss[1] + "_north";
            _self._north.onclick = function (event) { onMoveUp.call(this); }
            _self._north.onmouseover = function (event) { _self._container.className = toolbarCss[1] + "_Nover"; }
            _self._north.onmouseout = function (event) { _self._container.className = toolbarCss[1] }
            /* 导航按钮-左移（西） */
            _self._west = document.createElement("DIV");
            _self._container.appendChild(_self._west);
            _self._west.id = targetId + "_button_west";
            _self._west.title = "向左平移";
            _self._west.className = toolbarCss[1] + "_west";
            _self._west.onclick = function (event) { onMoveLeft.call(this); }
            _self._west.onmouseover = function (event) { _self._container.className = toolbarCss[1] + "_Wover"; }
            _self._west.onmouseout = function (event) { _self._container.className = toolbarCss[1] }
            /* 导航按钮-局中（全图） */
            _self._center = document.createElement("DIV");
            _self._container.appendChild(_self._center);
            _self._center.id = targetId + "_button_center";
            _self._center.title = "查看全图";
            _self._center.className = toolbarCss[1] + "_center";
            _self._center.onclick = function (event) { onFullMap.call(this); }
            /* 导航按钮-右移（东） */
            _self._east = document.createElement("DIV");
            _self._container.appendChild(_self._east);
            _self._east.id = targetId + "_button_east";
            _self._east.title = "向右平移";
            _self._east.className = toolbarCss[1] + "_east";
            _self._east.onclick = function (event) { onMoveRight.call(this); }
            _self._east.onmouseover = function (event) { _self._container.className = toolbarCss[1] + "_Eover"; }
            _self._east.onmouseout = function (event) { _self._container.className = toolbarCss[1] }
            /* 添加空层使div隔离 */
            _self._clear = document.createElement("DIV");
            _self._container.appendChild(_self._clear);
            _self._clear.style.clear = "both";
            /* 导航按钮-下移（南） */
            _self._south = document.createElement("DIV");
            _self._container.appendChild(_self._south);
            _self._south.id = targetId + "_button_south";
            _self._south.title = "向下平移";
            _self._south.className = toolbarCss[1] + "_south";
            _self._south.onclick = function (event) { onMoveDown.call(this); }
            _self._south.onmouseover = function (event) { _self._container.className = toolbarCss[1] + "_Sover"; }
            _self._south.onmouseout = function (event) { _self._container.className = toolbarCss[1] }
        }
    }, /* 创建滑动条 */
    _createSlider: function () {
        with (this) {
            var _self = this._slider;
            /* 滑动条-容器 */
            _self._container = document.createElement("DIV");
            _target.appendChild(_self._container);
            _self._container.onmouseover = function (event) { _mark._container.style.display = "block"; }
            _self._container.onmouseout = function (event) { setTimeout(function () { _mark._container.style.display = "none"; }, 2000) }
            _self._container.className = toolbarCss[2];
            /* 滑动条-放大 */
            _self._zoomIn = document.createElement("DIV");
            _self._container.appendChild(_self._zoomIn);
            _self._zoomIn.id = targetId + "_slider_zoomIn";
            _self._zoomIn.title = "放大一级";
            _self._zoomIn.className = toolbarCss[2] + "_zoomIn";
            _self._zoomIn.onclick = function (event) { _zoomIn(event); }
            /* 滑动条-标尺 */
            _self._ticks = document.createElement("DIV");
            _self._container.appendChild(_self._ticks);
            _self._ticks.id = targetId + "_slider_ticks";
            _self._ticks.title = "缩放到此级别";
            _self._ticks.style.height = ((maxValue - minValue + 1) * 6) + "px";
            _self._ticks.className = toolbarCss[2] + "_ticks";
            _self._ticks.onclick = function (event) { _moveTo(event); _moveEnd(event); }
            /* 滑动条-已选中标尺 */
            _self._ticksSel = document.createElement("DIV");
            _self._ticks.appendChild(_self._ticksSel);
            _self._ticksSel.id = targetId + "_slider_ticksSel";
            _self._ticksSel.title = "缩放到此级别";
            _self._ticksSel.style.height = startValue == 0 ? 0 : ((startValue - 1) * 6) + "px";
            _self._ticksSel.className = toolbarCss[2] + "_ticksSel";
            _self._ticksSel.onclick = function (event) { _moveTo(event); _moveEnd(event); }
            /* 滑动条-滑块 */
            _self._float = document.createElement("DIV");
            _self._ticks.appendChild(_self._float);
            _self._float.id = targetId + "_slider_float";
            _self._float.title = "拖动缩放";
            _self._float.className = toolbarCss[2] + "_float_nonactivated";
            _self._float.style.bottom = ((startValue - (minValue == 0 ? 1 : minValue)) * 6) + "px";
            _self._float.onmouseover = function (event) { _self._float.className = toolbarCss[2] + "_float_activated"; }
            _self._float.onmouseout = function (event) { _self._float.className = toolbarCss[2] + "_float_nonactivated"; }
            _self._float.onmousedown = function (event) {
                event = event ? event : window.event;
                document.onmousemove = function (event) { _moveTo(event); }
                document.onmouseup = function (event) { _moveEnd(event); }
            }
            /* 滑动条-缩小 */
            _self._zoomOut = document.createElement("DIV");
            _self._container.appendChild(_self._zoomOut);
            _self._zoomOut.id = targetId + "_slider_zoomOut";
            _self._zoomOut.title = "缩小一级";
            _self._zoomOut.className = toolbarCss[2] + "_zoomOut";
            _self._zoomOut.onclick = function (event) { _zoomOut(event); }
        }
    }, /* 创建地图级别标记 */
    _createMark: function () {
        with (this) {
            var _self = this._mark;
            /* 地图级别标记-容器 */
            _self._container = document.createElement("DIV");
            _target.appendChild(_self._container);
            _self._container.id = targetId + "_mark";
            _self._container.style.display = "none";
            _self._container.className = toolbarCss[3];
            /* 地图级别标记-街道 */
            if (marksShow.streetLevel != null && marksShow.streetLevel >= minValue && marksShow.streetLevel <= maxValue) {
                _self._street = document.createElement("DIV");
                _self._container.appendChild(_self._street);
                _self._street.id = targetId + "_mark_street";
                _self._street.title = "缩放到街道";
                _self._street.className = toolbarCss[3] + "_street";
                _self._street.style.top = ((maxValue - marksShow.streetLevel) * 6) + "px";
                _self._street.onclick = function (event) { onMark_Street.call(this); }
            }
            /* 地图级别标记-城市 */
            if (marksShow.cityLevel != null && marksShow.cityLevel >= minValue && marksShow.cityLevel <= maxValue) {
                _self._city = document.createElement("DIV");
                _self._container.appendChild(_self._city);
                _self._city.id = targetId + "_mark_city";
                _self._city.title = "缩放到城市";
                _self._city.className = toolbarCss[3] + "_city";
                //_self._city.style.top = ((maxValue - marksShow.cityLevel) * 6) + "px";
                _self._city.style.top = "47px";
                _self._city.onclick = function (event) { onMark_City.call(this); }
            }
            /* 地图级别标记-省级 */
            if (marksShow.provinceLevel != null && marksShow.provinceLevel >= minValue && marksShow.provinceLevel <= maxValue) {
                _self._province = document.createElement("DIV");
                _self._container.appendChild(_self._province);
                _self._province.id = targetId + "_mark_province";
                _self._province.title = "缩放到省";
                _self._province.className = toolbarCss[3] + "_province";
                //_self._province.style.top = ((maxValue - marksShow.provinceLevel) * 6) + "px";
                _self._province.style.top = "64px";
                _self._province.onclick = function (event) { onMark_Province.call(this); }
            }
            /* 地图级别标记-国家 */
            if (marksShow.countryLevel != null && marksShow.countryLevel >= minValue && marksShow.countryLevel <= maxValue) {
                _self._country = document.createElement("DIV");
                _self._container.appendChild(_self._country);
                _self._country.id = targetId + "_mark_country";
                _self._country.title = "缩放到国家";
                _self._country.className = toolbarCss[3] + "_country";
                //_self._country.style.top = ((maxValue - marksShow.countryLevel) * 6)  + "px";
                _self._country.style.top = "87px";
                _self._country.onclick = function (event) { onMark_Country.call(this); }
            }
        }
    }, /* 事件-点击滑动条使滑动块移动到点击位置 */
    _moveTo: function (event) {
        var _self = this;
        with (_self._slider) {
            event = event ? event : window.event;
            var ticks_Top = getElCoordinate(_ticks).top;
            var ticks_Height = _ticks.offsetHeight - _float.offsetHeight;
            var ticks_Bottom = ticks_Top + _ticks.offsetHeight;
            var ticks_ValuePx = ticks_Height / (_self.maxValue - _self.minValue);
            var x = ticks_Bottom - event.clientY - Math.round(_float.offsetHeight / 2);
            x = (x == 0) ? 0 : (Math.round(x / ticks_ValuePx) * ticks_ValuePx);
            x = (x <= 0) ? 0 : ((x >= ticks_Height) ? ticks_Height : x);
            _float.style.bottom = x + "px";
            _self._slider._ticksSel.style.height = x + "px";
            _self._value = x / ticks_ValuePx + _self.minValue;
        }
    }, /* 事件-滑动块移动结束 */
    _moveEnd: function (event) {
        document.onmousemove = null;
        document.onmouseup = null;
        this.onSliderEnd.call(this);
    }, /* 事件-放大 */
    _zoomIn: function (event) {
        with (this) {
            var v = getValue();
            ++v;
            setValue(v);
            onZoomIn.call(this);
        }
    }, /* 事件-缩小 */
    _zoomOut: function (event) {
        with (this) {
            var v = getValue();
            --v;
            setValue(v);
            onZoomOut.call(this);
        }
    }, /* 事件-设置滑块值 */
    setValue: function (value) {
        with (this) {
            if (!_slider._float) { return; }
            value = Number(value);
            value = value > maxValue ? maxValue : (value < minValue ? minValue : value);
            var ticks_Height = _slider._ticks.offsetHeight - _slider._float.offsetHeight;
            var ticks_ValuePx = ticks_Height / (maxValue - minValue);
            var x = (value - minValue) * ticks_ValuePx;
            x = (x <= 0) ? 0 : ((x >= ticks_Height) ? ticks_Height : x);
            _slider._float.style.bottom = parseInt(x) + "px";
            _slider._ticksSel.style.height = parseInt(x) + "px";
            _value = value;
            //if (map) {
            //    var curLevel = map.map.getLevel();
            //    this._slider._float.title = "当前级别为" + curLevel;
            //}
        }
    }, /* 事件-获取当前滑块值 */
    getValue: function () {
        return this._value;
    }
}
/* 事件-获取指定div的坐标 */
function getElCoordinate(e) {
    var t = e.offsetTop;
    var l = e.offsetLeft;
    var w = e.offsetWidth;
    var h = e.offsetHeight;
    while (e = e.offsetParent) {
        t += e.offsetTop;
        l += e.offsetLeft;
    }; return {
        top: t,
        left: l,
        width: w,
        height: h,
        bottom: t + h,
        right: l + w
    }
}

/* 事件-取消div选中 */
function disableSelection(target) {
    if (typeof target.onselectstart != "undefined") /* IE route */
        target.onselectstart = function () { return false }
    else if (typeof target.style.MozUserSelect != "undefined")/* Firefox route */
        target.style.MozUserSelect = "none"
    else //All other route (ie: Opera)   
        target.onmousedown = function () { return false }
    target.style.cursor = "default"
}