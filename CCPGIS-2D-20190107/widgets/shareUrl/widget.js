/* 2017-9-26 17:24:33   */
//模块：
L.widget.bindClass(L.widget.BaseWidget.extend({
    map: null,//框架会自动对map赋值
    options: {
        //弹窗
        view: {
            type: "window",
            url: "view.html",
            windowOptions: {
                width: 650,
                height: 110
            }
        }
    },
    viewWindow: null,
    //每个窗口创建完成后调用
    winCreateOK: function (opt, result) {
        this.viewWindow = result;
    }, 
    //激活插件
    activate: function () {
    
    },
    //释放插件
    disable: function () {
        this.viewWindow = null;
      
    }, 
    getUrl: function () {
        var latlng = this.map.convert2wgs(this.map.getCenter());
        var x = latlng[1];
        var y = latlng[0];
        var z = this.map.getZoom();


        var lasturl = window.location.href;
        if (lasturl.lastIndexOf('#') != -1) {
            lasturl = lasturl.replace(window.location.hash, "").replace("#", "");
        }
        var idx = lasturl.lastIndexOf('?');
        if (idx != -1) {
            lasturl = lasturl.substring(0, idx);
        } 

        var url = lasturl + "?x=" + x + "&y=" + y + "&z=" + z;
        var req = ccputil.system.getRequest();
        for (var key in req) {
            if (key == "x" || key == "y" || key == "z") continue;
            url += "&" + key + "=" + req[key];
        }
         
        return url;
    }, 



}));
