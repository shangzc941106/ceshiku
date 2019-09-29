/* 2017-12-7 13:23:59   */
//模块：
var widget_queryBaiduPOI = L.widget.bindClass(L.widget.BaseWidget.extend({
    map: null,//框架会自动对map赋值
    options: {
        resources: [
            'view.css'
        ],
        //直接添加到index
        view: {
            type: "append",
            url: 'view.html',
            parent: 'body'
        },
    },
    configBaidu: {
        "key": ["5BdfbH8G0acGrG8bvauqkc6RClTe64fz"],
        "url": "http://api.map.baidu.com/place/v2/search",
        "region": "全国"
    },
    //初始化[仅执行1次]
    create: function () {
        var that = this;

        $.getJSON(this.path + "config.json", function (data) {
            that.configBaidu = data;
        });
    },
    //每个窗口创建完成后调用
    winCreateOK: function (opt, result) {
        if (opt.type != "append") return;

        var that = this;

 

        var img = $('#map-querybar img');
        img.each(function (index, item) {
            $(item).attr('src', that.path + $(item).attr('src'));
        });

        if (that.config.position)
            $("#map-querybar").css(that.config.position);
        if (that.config.style)
            $("#map-querybar").css(that.config.style);

        // 搜索框获取焦点事件
        $("#txt_querypoi").focus(function () {
            // 文本框内容为空
            if ($.trim($(this).val()).length == 0) {
                that.hideAllQueryBarView();
                that.showHistoryList(); // 显示历史记录
            }
        });

        // 搜索框绑定文本框值发生变化,隐藏默认搜索信息栏,显示匹配结果列表
        $("#txt_querypoi").bind("input propertychange", function () {
            that.hideAllQueryBarView();

            that.clearLayers();

            var queryVal = $.trim($("#txt_querypoi").val());
            if (queryVal.length == 0) {
                // 文本框内容为空,显示历史记录
                that.showHistoryList();
            } else {

                that.autoTipList(queryVal, true);
            }
        });

        // 点击搜索查询按钮
        $("#btn_querypoi").click(function () {
            that.hideAllQueryBarView();

            var queryVal = $.trim($("#txt_querypoi").val());
            that.strartQueryPOI(queryVal, true);
        });
        //绑定回车键  
        $("#txt_querypoi").bind('keydown', function (event) {
            if (event.keyCode == "13") {
                $("#btn_querypoi").click();
            }
        });

        // 返回查询结果面板界面 
        $("#querybar_detail_back").click(function () {
            that.hideAllQueryBarView();
            $("#querybar_resultlist_view").show();
        });
    },
    //打开激活
    activate: function () {
        this.map.on("click", this.map_clickHandler, this);
    },
    //关闭释放
    disable: function () {
        this.map.off("click", this.map_clickHandler, this);

    },
    map_clickHandler: function () {
        // 点击地图区域,隐藏所有弹出框
        if ($.trim($("#txt_querypoi").val()).length == 0) {
            this.hideAllQueryBarView();
        }
    },

    hideAllQueryBarView: function () {
        $("#querybar_histroy_view").hide();
        $("#querybar_autotip_view").hide();
        $("#querybar_detail_view").hide();
        $("#querybar_resultlist_view").hide();
    },

    // 点击面板条目,自动填充搜索框,并展示搜索结果面板
    autoSearch: function (name) {
        $("#txt_querypoi").val(name);
        $("#btn_querypoi").trigger("click");
    },

    _key_index: 0,
    getKey: function () {
        var thisidx = (this._key_index++) % (this.configBaidu.key.length);
        return this.configBaidu.key[thisidx];
    },
    //===================与后台交互======================== 

    //显示智能提示搜索结果

    autoTipList: function (text, queryEx) {
        //查询外部widget
        if (this.hasExWidget() && queryEx) {
            var qylist = this.autoExTipList(text);
            return;
        }
        //查询外部widget

        var key = this.getKey();

        $.ajax({
            url: this.configBaidu.url,
            type: "GET",
            dataType: "jsonp",
            timeout: "5000",
            contentType: "application/json;utf-8",
            data: {
                "output": "json",
                "ak": key,
                "scope": 1,         //检索结果详细程度。取值为1 或空，则返回基本信息；取值为2，返回检索POI详细信息  
                "page_size": 10,
                "page_num": 0,
                "query": text,
                "city_limit": true,
                "region": this.config.region || this.configBaidu.region
            },
            success: function (data) {
                if (data.status !== 0) {
                    toastr.error("请求失败(" + data.status + ")：" + data.message);
                    return;
                }
                var pois = data.results;

                var inhtml = "";
                for (var index = 0; index < pois.length; index++) {
                    var name = pois[index].name;
                    var num = pois[index].num;
                    if (num > 0) continue;

                    inhtml += "<li><a href=\"javascript:widget_queryBaiduPOI.autoSearch('" + name + "');\">" + name + "</a></li>";
                }

                if (inhtml.length > 0) {
                    $("#querybar_ul_autotip").html(inhtml);
                    $("#querybar_autotip_view").show();
                }
            },
            error: function (data) {
                toastr.error("请求出错(" + data.status + ")：" + data.statusText);
            }
        });

    },


    // 根据输入框内容，查询显示列表 
    queryText: null,
    queryRegion: null,
    strartQueryPOI: function (text, queryEx) {
        if (text.length == 0) {
            toastr.warning('请输入搜索关键字！');
            return;
        }

        // TODO:根据文本框输入内容,从数据库模糊查询到所有匹配结果（分页显示）
        this.addHistory(text);

        this.hideAllQueryBarView();

        //查询外部widget
        if (this.hasExWidget() && queryEx) {
            var qylist = this.queryExPOI(text);
            return;
        }
        //查询外部widget


        this.thispage = 1;
        this.queryText = text;
        this.queryRegion = this.config.region || this.configBaidu.region;
        this.queryPOI();
    },
    queryPOIForCity: function (city) {
        this.thispage = 1;
        this.queryRegion = city;
        this.queryPOI();
    },
    queryPOI: function () {
        var that = this;
        var key = this.getKey();

        // 从数据库查询获取数据
        $.ajax({
            url: this.configBaidu.url,
            type: "GET",
            dataType: "jsonp",
            timeout: "5000",
            contentType: "application/json;utf-8",
            data: {
                "output": "json",
                "ak": key,
                "scope": 2,         //检索结果详细程度。取值为1 或空，则返回基本信息；取值为2，返回检索POI详细信息  
                "page_size": this.pageSize,
                "page_num": (this.thispage - 1),
                "query": this.queryText,
                "region": this.queryRegion
            },
            success: function (data) {
                if (!that.isActivate) return;

                if (data.status !== 0) {
                    toastr.error("请求失败(" + data.status + ")：" + data.message);
                    return;
                }
                var pois = data.results;
                if (pois && pois.length > 0 && pois[0].num > 0)
                    that.workShowCitys.showResult(pois);
                else
                    that.showPOIPage(pois, data.total);
            },
            error: function (data) {
                toastr.error("请求出错(" + data.status + ")：" + data.statusText);
            }
        });
    },
    //===================大数据时，显示城市列表结果========================  
    workShowCitys: {
        pageSize: 10,
        arrdata: [],
        counts: 0,
        allpage: 0,
        thispage: 0,
        showResult: function (data) {
            this.arrdata = data;
            this.counts = data.length;
            this.allpage = Math.ceil(this.counts / this.pageSize);
            this.thispage = 1;
            this.showPOIPage();
        },
        showPOIPage: function () {
            var inhtml = "";

            var startIdx = (this.thispage - 1) * this.pageSize;
            var endIdx = startIdx + this.pageSize;
            if (endIdx >= this.counts) {
                endIdx = this.counts;
            }

            for (var index = startIdx; index < endIdx; index++) {
                var item = this.arrdata[index];
                item.index = (index + 1);

                var _id = index;
                var _mc = item.name;

                inhtml += '<div class="querybar-site" onclick="widget_queryBaiduPOI.queryPOIForCity(\'' + _mc + '\')"> <div class="querybar-sitejj"> <div style=" float: left;">'
                    + _mc + '</div> <div style=" float: right;  ">约' + item.num + '个结果</div></div> </div>';
            };

            //分页信息
            inhtml += '<div class="querybar-page"><div class="querybar-fl">找到<strong>'
                + this.counts + '</strong>个结果</div><div class="querybar-ye querybar-fr">'
                + this.thispage + '/' + this.allpage + '页  <a href="javascript:widget_queryBaiduPOI.workShowCitys.showFirstPage()">首页</a> <a href="javascript:widget_queryBaiduPOI.workShowCitys.showPretPage()">&lt;</a>  <a href="javascript:widget_queryBaiduPOI.workShowCitys.showNextPage()">&gt;</a> </div></div>';

            $("#querybar_resultlist_view").html(inhtml);
            $("#querybar_resultlist_view").show();
        },
        showFirstPage: function () {
            this.thispage = 1;
            this.showPOIPage();
        },
        showNextPage: function () {
            this.thispage = this.thispage + 1;
            if (this.thispage > this.allpage)
                this.thispage = this.allpage;
            this.showPOIPage();
        },

        showPretPage: function () {
            this.thispage = this.thispage - 1;
            if (this.thispage < 1)
                this.thispage = 1;
            this.showPOIPage();
        }

    },

    //===================显示查询结果处理======================== 
    pageSize: 6,
    arrdata: [],
    counts: 0,
    allpage: 0,
    thispage: 0,
    showPOIPage: function (data, counts) {
        this.arrdata = data;
        this.counts = counts;
        if (this.counts < data.length) this.counts = data.length;
        this.allpage = Math.ceil(this.counts / this.pageSize);

        var inhtml = "";
        if (this.counts == 0) {
            inhtml += '<div class="querybar-page"><div class="querybar-fl">没有找到"<strong>' + this.queryText + '</strong>"相关结果</div></div>';
        }
        else {
            for (var index = 0; index < this.arrdata.length; index++) {
                var item = this.arrdata[index];
                var startIdx = (this.thispage - 1) * this.pageSize;
                item.index = startIdx + (index + 1);

                var _id = index;
                var _mc = item.name;

                inhtml += '<div class="querybar-site" onclick="widget_queryBaiduPOI.showDetail(\'' + _id + '\')"> <div class="querybar-sitejj"> <h3>'
                    + item.index + '、' + _mc + '</h3> <p>' + (item.address || '') + '</p> </div> </div>';

                this.objResultData[_id] = item;
            };

            //分页信息
            var _fyhtml;
            if (this.allpage > 1)
                _fyhtml = '<div class="querybar-ye querybar-fr">' + this.thispage + '/' + this.allpage + '页  <a href="javascript:widget_queryBaiduPOI.showFirstPage()">首页</a> <a href="javascript:widget_queryBaiduPOI.showPretPage()">&lt;</a>  <a href="javascript:widget_queryBaiduPOI.showNextPage()">&gt;</a> </div>';
            else
                _fyhtml = '';

            //底部信息
            inhtml += '<div class="querybar-page"><div class="querybar-fl">找到<strong>' + this.counts + '</strong>条结果</div>' + _fyhtml + '</div>';
        }
        $("#querybar_resultlist_view").html(inhtml);
        $("#querybar_resultlist_view").show();


        this.showPOIArr(this.arrdata);
        if (this.counts == 1) {
            this.showDetail('0');
        }
    },
    showFirstPage: function () {
        this.thispage = 1;
        this.queryPOI();
    },
    showNextPage: function () {
        this.thispage = this.thispage + 1;
        if (this.thispage > this.allpage) {
            this.thispage = this.allpage;
            toastr.warning('当前已是最后一页了');
            return;
        }
        this.queryPOI();
    },

    showPretPage: function () {
        this.thispage = this.thispage - 1;
        if (this.thispage < 1) {
            this.thispage = 1;
            toastr.warning('当前已是第一页了');
            return;
        }
        this.queryPOI();
    },
    //点击单个结果,显示详细
    objResultData: {},
    showDetail: function (id) {
        $("#querybar_resultlist_view").hide(); // 隐藏匹配结果列表
        $("#querybar_detail_view").show();

        var item = this.objResultData[id];

        //根据实际字段名修改。
        var name = item.name;
        if (name.length > 12)
            name = name.substring(0, 11) + "..";
        $("#lbl_poi_name").html(name);

        //==================构建查询详情div=================      
        var inHtml = '<p>名称：' + item.name + '</p>'; //详情   
        if (item.telephone)
            inHtml += '<p>电话：' + item.telephone + '</p>';
        if (item.address)
            inHtml += '<p>地址：' + item.address + '</p>';
        if (item.detail_info) {
            if (item.detail_info.tag)
                inHtml += '<p>类别：' + item.detail_info.tag + '</p>';


            //if (item.detail_info.detail_url)
            //    inHtml += '<p>详情：<a href="' + item.detail_info.detail_url + '"  target="_black">单击链接</a></p>';
        }

        //====================================================

        $("#poi_detail_info").html(inHtml);

        if (item.detail_info && item.detail_info.detail_url) {
            $("#btnShowDetail").show();
            $("#btnShowDetail").attr('href', item.detail_info.detail_url);
        }
        else {
            $("#btnShowDetail").hide();
        }

        if (item.layer)
            this.centerAt(item.layer);
        else
            toastr.warning('"' + name + '"无地理坐标信息！');
    },
    layerWork: null,
    getWorkLayer: function () {
        if (this.layerWork == null)
            this.layerWork = L.markerClusterGroup({
                chunkedLoading: true,       //间隔添加数据，以便页面不冻结。
                spiderfyOnMaxZoom: true,    //在地图最底层，不聚合可以看到所有的标记。
                disableClusteringAtZoom: 17 //此级别下不聚合
            }).addTo(this.map);
        return this.layerWork;
    },
    clearLayers: function () {
        if (this.layerWork == null) return;
        this.layerWork.clearLayers();
    },
    showPOIArr: function (arr) {
        var that = this;
        var layer = this.getWorkLayer();
        layer.clearLayers();

        $.each(arr, function (index, item) {
            var jd = item.location.lng;
            var wd = item.location.lat;

            if (jd > 0 && wd > 0) {
                var latlng;

                var wgsMpt = L.ccp.pointconvert.bd2wgs([jd, wd]);
                jd = wgsMpt[0];
                wd = wgsMpt[1];

                latlng = that.map.convert2map([wd, jd]);


                var marker = L.marker(latlng, {
                    //icon: L.ExtraMarkers.icon({
                    //    icon: 'fa-number',
                    //    shape: 'circle',
                    //    prefix: 'fa',
                    //    markerColor: 'orange-dark',
                    //    number: item.index
                    //})
                    icon: L.icon({
                        "iconUrl": that.path + "images/poi.png",
                        "iconSize": [16, 16],
                        "iconAnchor": [8, 8],
                        "popupAnchor": [0, -8]
                    })
                });
                marker.attributes = item;

                //popup
                //==================构建图上目标单击后显示div=================  
                var name;
                if (item.detail_info && item.detail_info.detail_url) {
                    name = '<a href="' + item.detail_info.detail_url + '"  target="_black" style="color: #ffffff; ">' + item.name + '</a>';
                }
                else {
                    name = item.name;
                }

                var inHtml = '<div class="ccp-popup-titile">' + name + '</div><div class="ccp-popup-content" >';

                var phone = $.trim(item.telephone);
                if (phone != '') inHtml += '<div><label>电话</label>' + phone + '</div>';

                var dz = $.trim(item.address);
                if (dz != '') inHtml += '<div><label>地址</label>' + dz + '</div>';

                if (item.detail_info) {
                    var fl = $.trim(item.detail_info.tag);
                    if (fl != '') inHtml += '<div><label>类别</label>' + fl + '</div>';

                }
                inHtml += '</div>';
                //==============================================================


                marker.bindPopup(inHtml);

                layer.addLayer(marker);

                item.layer = marker;
            }
        });
        if (layer.getLayers().length > 0)
            this.map.fitBounds(layer.getBounds());
    },
    centerAt: function (layer) {
        var latlng = layer.getLatLng();
        this.map.centerAt(latlng);

        layer.openPopup();
    },




    //===================历史记录相关========================

    cookieName: 'querypoi_gis',
    arrHistory: [],
    showHistoryList: function () {
        $("#querybar_histroy_view").hide();

        var lastcookie = ccputil.cookie.get(this.cookieName); //读取cookie值  
        if (lastcookie == null) return;

        this.arrHistory = eval(lastcookie);
        if (this.arrHistory == null || this.arrHistory.length == 0) return;

        var inhtml = "";
        for (var index = this.arrHistory.length - 1; index >= 0 ; index--) {
            var item = this.arrHistory[index];
            inhtml += "<li><a href=\"javascript:widget_queryBaiduPOI.autoSearch('" + item + "');\">" + item + "</a></li>";
        }
        $("#querybar_ul_history").html(inhtml);
        $("#querybar_histroy_view").show();
    },

    clearHistory: function () {
        this.arrHistory = [];
        ccputil.cookie.del(this.cookieName);

        $("#querybar_ul_history").html("");
        $("#querybar_histroy_view").hide();
    },

    //记录历史值 
    addHistory: function (data) {
        this.arrHistory = [];
        var lastcookie = ccputil.cookie.get(this.cookieName); //读取cookie值  
        if (lastcookie != null) {
            this.arrHistory = eval(lastcookie);
        }
        //先删除之前相同记录
        this.arrHistory.remove(data);

        this.arrHistory.push(data);

        if (this.arrHistory.length > 10)
            this.arrHistory.splice(0, 1);

        lastcookie = JSON.stringify(this.arrHistory);
        ccputil.cookie.add(this.cookieName, lastcookie);
    },


    //======================查询非百度poi，联合查询处理=================
    //外部widget是否存在或启用
    exWidget: null,
    hasExWidget: function () {
        return false;
        //if (window["widget_queryZfdxPOI"] == null)
        //    return false;
        //else {
        //    this.exWidget = widget_queryZfdxPOI;
        //    return true;
        //}
    },
    autoExTipList: function (text) {
        var that = this;
        this.exWidget.autoTipList(text, function () {
            that.autoTipList(text, false);
        });
    },
    //调用外部widget进行查询
    queryExPOI: function (text) {
        var layer = this.getWorkLayer();

        var that = this;
        this.exWidget.strartQueryPOI(text, layer, function () {
            that.strartQueryPOI(text, false);
        });
    }




}));