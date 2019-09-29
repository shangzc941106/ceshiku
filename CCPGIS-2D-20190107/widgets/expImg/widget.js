/* 2017-10-9 13:57:09 */
//此方式：弹窗非iframe模式
var toolPrint = L.widget.bindClass(L.widget.BaseWidget.extend({
    map: null,//框架会自动对map赋值
    options: {
        resources: [
            'view.css',
            'lib/leaflet.latlng-graticule.js',
            'lib/dom-to-image.js',
            'lib/leaflet.ccpExpImg.js',
        ],
        view: [
            { type: "append", url: "view.html" },
        ],
    },
    $mapParentDiv: null,    //map地图的父级容器
    $mapDiv: null,          //map地图 容器
    expimgCrl: null,
    //初始化[仅执行1次]
    create: function () {
        this.$mapParentDiv = $("#centerDiv");
        this.$mapDiv = $("#" + this.map._container.id);


        var latlngLines = new L.latlngGraticule({
            showLabel: true,
            zoomInterval: [
                { start: 5, end: 6, interval: 2 },
                { start: 7, end: 7, interval: 1 },
                { start: 8, end: 9, interval: 0.5 },
                { start: 10, end: 12, interval: 0.2 },
                { start: 13, end: 14, interval: 0.2 }
            ]
        }).addTo(this.map);


        //IIS:      var preUrl = "proxy/proxy.ashx?";
        //Tomcat:   var preUrl = "proxy/proxy.jsp?";

        var preUrl = "/proxy/proxy.jsp?";//解决跨域问题


        this.expimgCrl = new L.ExpImgCrl({
            eleid: "centerDiv", //导出的div的id
            preUrl: preUrl,
            latlngControl: latlngLines,
        });
        this.expimgCrl.init(this.map);
    },
    winCreateOK: function (opt, result) {
        var that = this;

        this.expimgCrl._input_lat = $("#txt_print_tablecol")[0];
        this.expimgCrl._input_lon = $("#txt_print_tablerow")[0];

        $("#btn_expImg_table").click(function (event) {
            that.expimgCrl._printPortrait(event);
        });
        $("#btn_expImg_extent").click(function (event) {
            that.expimgCrl._printCustom(event);
        });
        $("#btn_expImg_all").click(function (event) {
            that.expimgCrl._printAuto(event);
        });

        $("#btn_expImg_close").click(function (event) {
            that.expimgCrl._printCancel(event);
            that.disableBase();
        });
    },
    //激活插件
    activate: function () {
        $(".toolBar").css({ right: '250px' });

    },
    //释放插件
    disable: function () {
        $(".toolBar").css({ right: '10px' });

    },


}));
