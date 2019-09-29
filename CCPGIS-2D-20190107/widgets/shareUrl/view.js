
var thisWidget;

//当前页面业务
function initWidgetView(_thisWidget) {
    thisWidget = _thisWidget;

    var url = thisWidget.getUrl();
    $("#txtUrl").val(url);

    $("#txtUrl").focus();
    $("#txtUrl").select();
}
