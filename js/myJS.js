$(function() {
    var BlurBGImage	= (function() {
        var $bxWrapper = $('#bx-wrapper'),
            $bxLoading = $bxWrapper.find('div.bx-loading'),
            $bxContainer = $bxWrapper.find('div.bx-container'),
            $bxImgs	= $bxContainer.children('img'),
            bxImgsCount	= $bxImgs.length,
            $thumbs	= $bxWrapper.find('div.bx-thumbs > a').hide(),
            $title = $bxWrapper.find('h2:first'),
            current	= 0,
            animOptions	= { speed : 700, variation : 2, blurFactor : 10 },
            isAnim = false,
            supportCanvas = Modernizr.canvas,

            init = function() {
                var loaded = 0;
                $bxImgs.each( function(i) {
                    var $bximg = $(this);
                    $('<img data-pos="' + $bximg.index() + '"/>').load(function() {
                        var $img = $(this),
                            dim	= getImageDim( $img.attr('src') ),
                            pos	= $img.data( 'pos' );
                        $.when( createCanvas( pos, dim ) ).done( function() {
                            ++loaded;
                            if( loaded === bxImgsCount ) {
                                $thumbs.fadeIn();
                                centerImageCanvas();
                                $bxLoading.hide();
                                initEvents();
                            }
                        });
                    }).attr( 'src', $bximg.attr('src') );
                });
            },
            createCanvas = function( pos, dim ) {
                return $.Deferred( function(dfd) {
                    if( !supportCanvas ) {
                        dfd.resolve();
                        return false;
                    }
                    var $img = $bxImgs.eq( pos ),
                        imgW = dim.width,
                        imgH = dim.height,
                        imgL = dim.left,
                        imgT = dim.top,
                        canvas = document.createElement('canvas');
                    canvas.className = 'bx-canvas';
                    canvas.width = imgW;
                    canvas.height = imgH;
                    canvas.style.width = imgW + 'px';
                    canvas.style.height = imgH + 'px';
                    canvas.style.left = imgL + 'px';
                    canvas.style.top = imgT + 'px';
                    canvas.style.visibility = 'hidden';
                    canvas.setAttribute('data-pos', pos);
                    $bxContainer.append( canvas );
                    stackBlurImage( $img.get(0), dim, canvas, animOptions.blurFactor, false, dfd.resolve );
                }).promise();
            },
            getImageDim	= function( img ) {
                var $img = new Image();
                $img.src = img;
                var $win = $( window ),
                    w_w	= $win.width(),
                    w_h	= $win.height(),
                    r_w	= w_h / w_w,
                    i_w	= $img.width,
                    i_h	= $img.height,
                    r_i	= i_h / i_w,
                    new_w, new_h, new_left, new_top;
                if( r_w > r_i ) {
                    new_h	= w_h;
                    new_w	= w_h / r_i;
                }
                else {
                    new_h	= w_w * r_i;
                    new_w	= w_w;
                }
                return {
                    width	: new_w,
                    height	: new_h,
                    left	: ( w_w - new_w ) / 2,
                    top		: ( w_h - new_h ) / 2
                };
            },
            initEvents			= function() {
                $( window ).on('resize.BlurBGImage', function( event ) {
                    centerImageCanvas();
                    return false;
                });
                $thumbs.on('click.BlurBGImage', function( event ) {
                    var $thumb	= $(this),
                        pos		= $thumb.index();
                    if( !isAnim && pos !== current ) {
                        $thumbs.removeClass('bx-thumbs-current');
                        $thumb.addClass('bx-thumbs-current');
                        isAnim = true;
                        showImage( pos );
                    }
                    return false;
                });
            },
            centerImageCanvas	= function() {
                $bxImgs.each( function(i) {
                    var $bximg = $(this),
                        dim	= getImageDim( $bximg.attr('src') ),
                        $currCanvas = $bxContainer.children('canvas[data-pos=' + $bximg.index() + ']'),
                        styleCSS = {
                            width: dim.width,
                            height: dim.height,
                            left: dim.left,
                            top: dim.top
                        };
                    $bximg.css( styleCSS );
                    if( supportCanvas )
                        $currCanvas.css( styleCSS );
                    if( i === current )
                        $bximg.show();
                });
            },
            showImage = function( pos ) {
                var $bxImage = $bxImgs.eq( current );
                $bxCanvas = $bxContainer.children('canvas[data-pos=' + $bxImage.index() + ']'),
                    $bxNextImage = $bxImgs.eq( pos ),
                    $bxNextCanvas = $bxContainer.children('canvas[data-pos='+$bxNextImage.index()+']');
                if( supportCanvas ) {
                    $.when( $title.fadeOut() ).done( function() {
                        $title.text( $bxNextImage.attr('title') );
                    });
                    $bxCanvas.css( 'z-index', 100 ).css('visibility','visible');
                    $.when( $bxImage.fadeOut( animOptions.speed ) ).done( function() {
                        switch( animOptions.variation ) {
                            case 1:
                                $title.fadeIn( animOptions.speed );
                                $.when( $bxNextImage.fadeIn( animOptions.speed ) ).done( function() {
                                    $bxCanvas.css( 'z-index', 1 ).css('visibility','hidden');
                                    current = pos;
                                    $bxNextCanvas.css('visibility','hidden');
                                    isAnim = false;
                                });
                                break;
                            case 2:
                                $bxNextCanvas.css('visibility','visible');
                                $.when( $bxCanvas.fadeOut( animOptions.speed * 1.5 ) ).done( function() {
                                    $(this).css({
                                        'z-index': 1,
                                        'visibility': 'hidden'
                                    }).show();
                                    $title.fadeIn( animOptions.speed );
                                    $.when( $bxNextImage.fadeIn( animOptions.speed ) ).done( function() {
                                        current = pos;
                                        $bxNextCanvas.css('visibility','hidden');
                                        isAnim 	= false;
                                    });
                                });
                                break;
                        }
                    });
                }
                else {
                    $title.hide().text( $bxNextImage.attr('title') ).fadeIn( animOptions.speed );
                    $.when( $bxNextImage.css( 'z-index', 102 ).fadeIn( animOptions.speed ) ).done( function() {
                        current = pos;
                        $bxImage.hide();
                        $(this).css( 'z-index', 101 );
                        isAnim = false;
                    });
                }
            };
        return {
            init: init
        };
    })();
    BlurBGImage.init();
});