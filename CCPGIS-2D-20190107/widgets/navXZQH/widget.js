/* 2017-12-5 17:38:24   */
//模块：
L.widget.bindClass(L.widget.BaseWidget.extend({
    map: null,//框架会自动对map赋值
    options: {
        //弹窗
        view: {
            type: "window",
            url: "view.html",
            windowOptions: {
                width: 220,
                height: 440,
            }
        }
    },
    //初始化[仅执行1次]
    create: function () { 
      
    },
    viewWindow: null,
    //每个窗口创建完成后调用
    winCreateOK: function (opt, result) {
        this.viewWindow = result;
    },
    //打开激活
    activate: function () {

    },
    //关闭释放
    disable: function () {
        this.viewWindow = null;

    },
  
    //显示行政区划边界
    last_region: null,
    clearLastRegion: function () {
        if (this.last_region != null) {
            this.last_region.remove();
            this.last_region = null;
        }
        if (this.last_timetemp != -1) {
            clearTimeout(this.last_timetemp);
            this.last_timetemp = -1;
        }
    },
    last_timetemp: -1, 
    showRegionExtent: function (feature) {
        this.clearLastRegion();

        this.last_region = L.geoJson(feature, {
            style: {
                color: "#3388FF",
                weight: 1,
                opacity: 1,
                fillColor: "#3388FF",
                fillOpacity: 0.1
            }
        }).addTo(this.map);

        this.map.stop();
        this.map.fitBounds(this.last_region.getBounds());

        //定时清除
        var that = this; 
        this.last_timetemp = setTimeout(function () {
            that.clearLastRegion();
        }, 3000);
    },
    goHome: function () {
        this.map.goHomeExtent();
    }



}));