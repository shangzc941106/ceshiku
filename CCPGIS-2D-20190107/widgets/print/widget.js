/* 2017-10-9 13:57:09   */
//此方式：弹窗非iframe模式
var toolPrint = L.widget.bindClass(L.widget.BaseWidget.extend({
    map: null,//框架会自动对map赋值
    options: {
        resources: [
            'view.css',
            'lib/print.js',
            'lib/dom-to-image.js'
        ],
        view: [
            { type: "append", url: "view.html" }, 
        ],
    },
    $mapParentDiv: null,    //map地图的父级容器
    $mapDiv: null,          //map地图 容器
    //初始化[仅执行1次]
    create: function () {
        this.$mapParentDiv = $("#centerDiv");
        this.$mapDiv = $("#" + this.map._container.id);
    },
    winCreateOK: function (opt, result) {
        var that = this;
        $("#view_print_type").hide();
        $("#btn_print_expimg").click(function () {
            that.expImg();
        });
        $("#btn_print_start").click(function () {
            that.printview();
        });
   
        $("#btn_print_close").click(function () {
            that.disableBase();
        });
    },
    //激活插件
    activate: function () {
        //隐藏div
        $(".leaflet-control").hide();
        $(".leaflet-control-scale").show();
        $(".no-print-view").hide();
         
         
        this.invalidateSize();
    },
    //释放插件
    disable: function () {
        //还原显示div
        $(".leaflet-control").show();
        $(".no-print-view").show();
         

        this.invalidateSize(); 
    },
    invalidateSize: function () {
        var map = this.map;
        setTimeout(function () {
            map.invalidateSize(false);
        }, 200);
    }, 
    

    printview: function () {
        var that = this;
        this.changeElStylForStart();

        this.$mapParentDiv.css({ border: "" }).print({
            noPrintSelector: ".no-print",
            deferred: $.Deferred().done(function () {
                that.changeElStylForEnd();
            })
        });
    },
    expImg: function () {
        var that = this;
        this.changeElStylForStart();

        //IIS:      domtoimage.preUrl = "proxy/proxy.ashx?";
        //Tomcat:   domtoimage.preUrl = "proxy/proxy.jsp?";

        //domtoimage.preUrl = "/proxy/proxy.jsp?";//解决跨域问题
         
        //此处应该加进度条
        ccputil.loading.show();

        var eleid = "centerDiv";
        var node = document.getElementById(eleid);
        domtoimage.toPng(node)
            .then(function (dataUrl) {
                ccputil.loading.hide();
                that.changeElStylForEnd();

                var blob = that._dataURItoBlob(dataUrl);
                ccputil.file.download("地图截图.png", blob);

                //此处应该关闭进度条
                toastr.success('导出完成');
            })
            .catch(function (error) {
                ccputil.loading.hide();
                that.changeElStylForEnd();
                console.error('oops, something went wrong!', error);
            });
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
    //修改节点样式，开始导出
    changeElStylForStart: function () { 
        $(".no-print").hide();
    },
    //修改节点样式，完成导出
    changeElStylForEnd: function () { 
        $(".no-print").show(); 
    },


}));
