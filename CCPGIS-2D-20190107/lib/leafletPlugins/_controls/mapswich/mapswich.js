L.control.mapswich = function (options) {
    var inhtml = ' <div class="pnui-maptype ' + (options.pano ? '' : 'maplitwo') + '">'
          + '        <div class="pos-re">'
          + '            <div class="pnui-mapli pnui-mapnormal ' + (options.map2d == "img" ? 'pnui-mapnormal-img' : '') + ' active" data-type="map2d"><span>地图</span></div>'
          + '            <div class="pnui-mapli pnui-mapearth" data-type="map3d"><span>三维</span></div>'
          + '            <div class="pnui-mapli pnui-mappanorama" data-type="pano"><span>全景</span></div>'
          + '        </div>'
          + '    </div>';
    $("body").prepend(inhtml);

    $('.pnui-maptype').hover(function () {
        $(this).addClass('expand');
    }, function () {
        $(this).removeClass('expand');
    });

    var map2dvec = true;
    var lasttype = (options.map2d == "img" ? 'img' : 'vec');
    $('.pnui-mapli').click(function () {
        $(this).addClass('active').siblings().removeClass('active');
        var maptype = $(this).attr('data-type');
        if (maptype == "map2d") {
            if (lasttype == "vec" || lasttype == "img")
                map2dvec = !map2dvec;

            if (map2dvec) {
                $(this).removeClass('pnui-mapnormal-img');
                maptype = "vec";
            } else {
                $(this).addClass('pnui-mapnormal-img');
                maptype = "img";
            }
        }
        if (maptype == lasttype) return;

        options.change(maptype);
        lasttype = maptype;
    });

    function change2type(type) {
        $('.pnui-mapli').each(function () {
            var maptype = $(this).attr('data-type');
            if (maptype == type) {
                $(this).click();
            }
        });
    }

    return { change: change2type }; 
};