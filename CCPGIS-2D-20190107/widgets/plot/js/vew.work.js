/* 2017-12-4 15:37:20   */
var thisWidget;
 
//当前页面业务  
function initWidgetView(_thisWidget) {
    thisWidget = _thisWidget;
    //清除所有标号
    $("#btn_plot_delall").click(function () {
        thisWidget.deleteAll();
        plotEdit.stopEditing();
    });

    //是否可以编辑
    var isedit = true;
    $("#btn_plot_isedit").click(function () {
        isedit = !isedit;

        if (isedit) {
            $(this).removeClass("active");
            $(this).children().removeClass("fa-lock").addClass("fa-unlock");
        }
        else {
            $(this).addClass("active");
            $(this).children().removeClass("fa-unlock").addClass("fa-lock");
        }
        thisWidget.hasEdit(isedit);
    });


    plotFile.initEvent();
    plotEdit.loadConfig();
}

//文件处理
var plotFile = {
    initEvent: function () {
        var that = this;

        var isClearForOpenFile;
        $("#btn_plot_openfile").click(function () {
            isClearForOpenFile = true;
            $("#input_plot_file").click();
        });

        $("#btn_plot_openfile2").click(function () {
            isClearForOpenFile = false;
            $("#input_plot_file").click();
        });
        $("#btn_plot_savefile").click(function () {
            var data = thisWidget.getGeoJson();
            if(data == null||data==""){
                toastr.warning("当前未标绘任何数据！");
            }else{
            	ccputil.file.downloadFile("我的标注.json", data);
            }
        });

        $("#input_plot_file").change(function (e) {
            var file = this.files[0];

            var fileName = file.name;
            var fileType = (fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length)).toLowerCase();
            if (fileType != "json") {
                toastr.error('文件类型不合法,请选择json格式标注文件！');
                that.clearPlotFile();
                return;
            }


            if (window.FileReader) {
                var reader = new FileReader();
                reader.readAsText(file, 'UTF-8');
                reader.onloadend = function (e) {
                    var strjson = this.result;
                    thisWidget.jsonToLayer(strjson, isClearForOpenFile);
                    that.clearPlotFile();
                };
            }
        });
    },
    clearPlotFile: function () {
        if (!window.addEventListener) {
            document.getElementById('input_plot_file').outerHTML += '';  //IE
        } else {
            document.getElementById('input_plot_file').value = "";   //FF
        }
    }
};


//标号列表相关
var plotlist = {
    //绑定标号列表切换下拉框
    bindSelList: function () {
        var that = this;
        var $sel_plot_list = $("#sel_plot_list");
        $.getJSON("config/plotlist.json", function (plotlist) {
            var inhtml = '';
            var defval;
            for (var i in plotlist) {
                inhtml += '<option value="' + i + '">' + i + '(' + plotlist[i].length + ')</option>';
                if (defval == null) defval = i;
            }
            if (defval) {
                that.showPlotList(plotlist[defval]);
                $sel_plot_list.attr('data-value', defval);
            }

            $sel_plot_list.html(inhtml);
            $sel_plot_list.select();
            $sel_plot_list.change(function () {
                var val = $(this).attr('data-value');
                var list = plotlist[val];
                that.showPlotList(list);
            });

        });
    },
    _listData: null,
    showPlotList: function (list) {
        this._listData = list;

        var inhtml = '';
        for (var i = 0; i < list.length; i++) {
            var item = list[i];

            //使用图片图标
            var image;
            if (plotEdit.defval[item.type]) {
                var defval = plotEdit.defval[item.type];
                image = defval.style.iconUrl;
            }
            if (item.iconUrl) {
                image = item.iconUrl;
            }
            if (item.style && item.style.iconUrl) {
                image = item.style.iconUrl;
            }

            if (image) {
                inhtml += ' <li onclick="plotlist.startPlot(' + i + ',this)"> <i title="'
                    + item.name + '"  > <img src="../../' + image + '" style="max-width: 50px;max-height: 50px;" /></i></li>';
            }
            else {
                //使用字体图标 
                var icon;
                var clr = "#000000";
                if (plotEdit.defval[item.type]) {
                    var defval = plotEdit.defval[item.type];
                    icon = defval.style.iconClass;
                    clr = defval.style.color;
                }
                if (item.iconClass) {
                    icon = item.iconClass;
                }
                if (item.style && item.style.iconClass) {
                    icon = item.style.iconClass;
                }

                if (item.color) {
                    clr = item.color;
                }
                if (item.style && item.style.color) {
                    clr = item.style.color;
                }
                if (icon) {
                    inhtml += '<li onclick="plotlist.startPlot(' + i + ',this)"><i title="'
                        + item.name + '"  class="' + icon + '" style="color:' + clr + '"></i></li>';
                }
            }
        }
        $("#plotlist").html(inhtml);
    },
    //激活标绘
    _lastLi: null,
    //开始绘制
    startPlot: function (idx, li) {
        var _thisli = $(li);
        _thisli.addClass('markon');
        if (this._lastLi)
            this._lastLi.removeClass('markon');
        this._lastLi = _thisli;

        var item = this._listData[idx];
        var defval = ccputil.system.clone(plotEdit.defval[item.type] || {});
        if (item.style) {
            for (var i in item.style) {
                defval.style[i] = item.style[i];
            }
        }
        if (item.attr) {
            for (var i in item.attr) {
                defval.attr[i] = item.attr[i];
            }
        }

        defval.name = defval.name || item.name;

        thisWidget.startDraw(defval);
    },
    //绘制结束
    plotEnd: function () {
        //取消选中状态
        if (this._lastLi)
            this._lastLi.removeClass('markon');
    }
};


//属性编辑相关 
var plotEdit = {
    config: {},
    defval: {},
    loadConfig: function () {
        var that = this;
        $.getJSON("config/attr.json", function (data) {
            that.config = data;

            for (var i in data) {
                var defstyle = {};
                for (var idx = 0; idx < data[i].style.length; idx++) {
                    var item = data[i].style[idx];
                    defstyle[item.name] = item.defval;
                }
                var defattr = {};
                for (var idx = 0; idx < data[i].attr.length; idx++) {
                    var item = data[i].attr[idx];
                    defattr[item.name] = item.defval;
                }

                that.defval[i] = {
                    type: i,
                    name: data[i].name,
                    style: defstyle,
                    attr: defattr
                };
            }
            plotlist.bindSelList();
        });
    },
    _last_attr: null,
    //选中标号，激活属性面板
    startEditing: function (attr, latlngs) {
        this._last_attr = attr;
        var config = this.config[attr.type];

        this.updateLatlngsHtml(latlngs);

        var arrFun = [];
        //==============style==================
        var parname = "plot_attr_style_";
        var inHtml = '<tr><td class="nametd">类型：</td><td>' + (config.name || attr.name) + '</td></tr>';
        for (var idx = 0; idx < config.style.length; idx++) {
            var edit = config.style[idx];
            if (edit.type == "hidden") continue;

            var attrName = edit.name;
            var attrVal = attr.style[attrName];

            var input = this.getAttrInput(parname, attrName, attrVal, edit);
            if (input.fun)
                arrFun.push({ parname: parname, name: attrName, value: attrVal, edit: edit, fun: input.fun });

            inHtml += '<tr  id="' + parname + 'tr_' + attrName + '" > <td class="nametd">'
                + edit.label + '</td>  <td>' + input.html + '</td>  </tr>';
        }
        $("#talbe_style").html(inHtml);

        //==============attr==================
        parname = "plot_attr_attr_";
        inHtml = '';
        for (var idx = 0; idx < config.attr.length; idx++) {
            var edit = config.attr[idx];
            if (edit.type == "hidden") continue;

            var attrName = edit.name;
            var attrVal = attr.attr[attrName];

            var input = this.getAttrInput(parname, attrName, attrVal, edit);
            if (input.fun)
                arrFun.push({ parname: parname, name: attrName, value: attrVal, edit: edit, fun: input.fun });

            inHtml += '<tr  id="' + parname + 'tr_' + attrName + '" > <td class="nametd">'
                + edit.label + '</td>  <td>' + input.html + '</td>  </tr>';
        }
        $("#talbe_attr").html(inHtml);

        //执行各方法
        for (var idx = 0; idx < arrFun.length; idx++) {
            var item = arrFun[idx];
            item.fun(item.parname, item.name, item.value, item.edit);
        }

        tab2attr();//切换面板
    },
    updateLatlngsHtml: function (latlngs) {
        //显示坐标信息 
        var inHtml = ''; 
        if (!latlngs || latlngs.length == 0) {

        }
        else if (latlngs.length == 1) {
            var latlng = latlngs[0];
            var jd = latlng.lng.toFixed(6);
            var wd = latlng.lat.toFixed(6);

            inHtml += ' <div class="mp_attr" style=" margin-top: 10px;"><table>'
                + ' <tr> <td class="nametd">经度：</td> <td><input id="plot_attr_jd_' + idx + '" type="number" class="mp_input" readonly="readonly" value="' + jd + '"></td>  </tr> '
                + '<tr>  <td class="nametd">纬度：</td> <td><input id="plot_attr_wd_' + idx + '" type="number" class="mp_input" readonly="readonly" value="' + wd + '"></td> </tr> '
                + ' </table> </div>';
        }
        else {
            for (var idx = 0; idx < latlngs.length; idx++) {
                var latlng = latlngs[idx];

                var jd = latlng.lng.toFixed(6);
                var wd = latlng.lat.toFixed(6);

                inHtml += '<div><div class="open"><i class="tree_icon">-</i>第' + (idx + 1) + '点</div><div class="mp_attr"><table>'
                    + ' <tr> <td class="nametd">经度：</td> <td><input id="plot_attr_jd_' + idx + '" type="number" class="mp_input" readonly="readonly" value="' + jd + '"></td>  </tr> '
                    + '<tr>  <td class="nametd">纬度：</td> <td><input id="plot_attr_wd_' + idx + '" type="number" class="mp_input" readonly="readonly" value="' + wd + '"></td> </tr> '
                    + ' </table> </div> </div>';
            }
        } 
        $("#view_latlngs").html(inHtml);
        $('#view_latlngs .open').click(changeOpenShowHide);
    },
    //单击地图空白，释放属性面板
    stopEditing: function () {
        tab2plot();//切换面板

        $("#talbe_style").html('');
        $("#talbe_attr").html('');
        this._last_attr = null;
    },
    //获取各属性的编辑html和change方法
    getAttrInput: function (parname, attrName, attrVal, edit) {
        var that = this;

        var inHtml = '';
        var fun = null;
        switch (edit.type) {
            default:
            case "label":
                inHtml = attrVal;
                break;
            case "text":
                inHtml = '<input id="' + parname + attrName + '" type="text" value="' + attrVal + '"   class="mp_input" />';

                fun = function (parname, attrName, attrVal, edit) {
                    $('#' + parname + attrName).on("input propertychange", function (e) {
                        var attrVal = $(this).val();
                        that.updateAttr(parname, attrName, attrVal);
                    });
                };
                break;
            case "textarea":
                attrVal = attrVal.replace(new RegExp("<br />", "gm"), "\n");
                inHtml = '<textarea  id="' + parname + attrName + '"     class="mp_input" style="height:50px;resize: none;" >' + attrVal + '</textarea>';

                fun = function (parname, attrName, attrVal, edit) {
                    $('#' + parname + attrName).on("input propertychange", function (e) {
                        var attrVal = $(this).val();
                        if (attrVal.length == 0) attrVal = "文字";
                        attrVal = attrVal.replace(/\n/g, "<br />");

                        that.updateAttr(parname, attrName, attrVal);
                    });
                };
                break;
            case "number":
                inHtml = '<input id="' + parname + attrName + '" type="number" value="' + attrVal + '"    class="mp_input"/>';
                fun = function (parname, attrName, attrVal, edit) {
                    $('#' + parname + attrName).on("input propertychange", function (e) {
                        var attrVal = Number($(this).val());

                        that.updateAttr(parname, attrName, attrVal);
                    });
                };
                break;

            case "combobox":
                inHtml = '<select id="' + parname + attrName + '" class="mp_select"    data-value="' + attrVal + '" >';
                for (var jj = 0; jj < edit.data.length; jj++) {
                    var temp = edit.data[jj];
                    inHtml += '<option value="' + temp.value + '">' + temp.text + '</option>';
                }
                inHtml += '</select>';

                fun = function (parname, attrName, attrVal, edit) {
                    $('#' + parname + attrName).select();   //绑定样式
                    $('#' + parname + attrName).change(function () {
                        var attrVal = $(this).attr('data-value');

                        that.updateAttr(parname, attrName, attrVal);
                    });
                };
                break;

            case "radio":
                inHtml = '<input   name="' + parname + attrName + '" type="radio" value="1"  ' + (attrVal ? 'checked="checked"' : '') + ' style="width:15px;" >是  &nbsp;&nbsp; '
                    + '<input  name="' + parname + attrName + '" type="radio" value="2"  ' + (attrVal ? '' : 'checked="checked"') + ' style="width:15px;" >否';

                fun = function (parname, attrName, attrVal, edit) {
                    $('input:radio[name="' + parname + attrName + '"]').change(function () {
                        var attrVal = $(this).val() == "1";
                        that.updateAttr(parname, attrName, attrVal);

                        that.changeViewByAttr(parname, edit.impact, attrVal);
                    });
                    that.changeViewByAttr(parname, edit.impact, attrVal);
                };
                break;
            case "color":
                inHtml = '<input id="' + parname + attrName + '" type="text" class="mp_input" style="width: 100%;"  value="' + attrVal + '" />';

                fun = function (parname, attrName, attrVal, edit) {
                    $('#' + parname + attrName).minicolors({
                        position: "bottom right",
                        control: "saturation",
                        change: function (hex, opacity) {
                            that.updateAttr(parname, attrName, hex);
                        }
                    });
                };
                break;
            case "slider":
                inHtml = '<input id="' + parname + attrName + '"  type="text" value="' + (attrVal * 100) + '" />';
                fun = function (parname, attrName, attrVal, edit) {
                    var _width = $('.mp_tab_card').width() * 0.7 - 30;
                    $('#' + parname + attrName).progress(_width);   //绑定样式 
                    $('#' + parname + attrName).change(function () {
                        var attrVal = Number($(this).val()) / 100;

                        that.updateAttr(parname, attrName, attrVal);
                    });
                };
                break;
        }
        return { html: inHtml, fun: fun };
    },
    //联动属性控制
    changeViewByAttr: function (parname, arrimpact, visible) {
        if (arrimpact && arrimpact.length > 0) {
            for (var jj = 0; jj < arrimpact.length; jj++) {
                var attrName = arrimpact[jj];
                if (visible) {
                    $('#' + parname + 'tr_' + attrName).show();
                }
                else {
                    $('#' + parname + 'tr_' + attrName).hide();
                }
            }
        }
    },
    //属性面板值修改后触发此方法
    updateAttr: function (parname, attrName, attrVal) {
        switch (parname) {
            case "plot_attr_style_":
                this._last_attr.style[attrName] = attrVal;
                break;
            case "plot_attr_attr_":
                this._last_attr.attr[attrName] = attrVal;
                break;
        }
        thisWidget.updateAttr2map(this._last_attr);
    }

};
