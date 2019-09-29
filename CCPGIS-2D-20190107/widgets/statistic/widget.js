/* 2018-10-10 */
//统计图：
//lcl
L.widget.bindClass(L.widget.BaseWidget.extend({
    map: null,//框架会自动对map赋值
    options: {
        //弹窗
        view: {
            type: "window",
            url: "view.html",
            windowOptions: {
                width: 210,
                height: 170
            }
        }
    },
    viewWindow: null,
    //每个窗口创建完成后调用
    winCreateOK: function (opt, result) {
        this.viewWindow = result;
    },
    markerXY: null,
    //激活插件
    activate: function () {

    },
    //释放插件
    disable: function () {
        this.viewWindow = null;
    },
    
}));


