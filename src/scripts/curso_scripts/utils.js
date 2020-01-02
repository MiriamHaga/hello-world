$('.carousel').carousel({
  pause: true,
  interval: false
});

$('[data-toggle="popover"]').popover({
  trigger: 'focus',
  container: 'body',
  html: true
});

$('.interactive-image__btn[data-toggle="popover"]').popover({
  trigger: 'focus',
  container: 'body',
  html: true
}).on('shown.bs.popover', function () {
  $('.popover').find('button.popover-next').unbind("click").click(function (e) {
    $('[data-toggle="popover"][aria-describedby]').next('span').next('span').next('button').next('[data-toggle="popover"]').focus();
    $('[data-toggle="popover"][aria-describedby]').next('[data-toggle="popover"]').focus();
  });

  $('.popover').find('button.popover-back').unbind("click").click(function (e) {
    $('[data-toggle="popover"][aria-describedby]').prev('button').prev('span').prev('span').prev('[data-toggle="popover"]').focus();
    $('[data-toggle="popover"][aria-describedby]').prev('[data-toggle="popover"]').focus();
  });
});

// barra progresso que se fixa no topo com scroll
$('#unit-progress').each(function(){
  var distance = $('#unit-progress').offset().top,
      $window = $(window);

  $window.scroll(function() {
    if ( $window.scrollTop() >= distance ) {
      $('#unit-progress').addClass('progress-fixed');
    }else{
      $('#unit-progress').removeClass('progress-fixed');
    }
  });
});


// Progresso scroll tela unidade
//var scrollArea = $(window);
var scrollIndicator = $('#unit-progress .progress-bar__fill');
var scrollHeight = 0;
var scrollOffset = 0;
var scrollPercent = 0;
var indicatorPosition = scrollPercent;

window.animationFrame = (function(){
  return  window.requestAnimationFrame       ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame    ||
      window.oRequestAnimationFrame      ||
      window.msRequestAnimationFrame     ||
      function(/* function */ callback, /* DOMElement */ element){
        window.setTimeout(callback, 1000 / 60);
      };
})();

function loop() {
  scrollOffset = window.pageYOffset || window.scrollTop;
  scrollHeight = $('html').height() - window.innerHeight;
  scrollPercent = scrollOffset/scrollHeight || 0;
  indicatorPosition += (scrollPercent-indicatorPosition)*0.05;
  var widthString = indicatorPosition*100;
  scrollIndicator.css('width', widthString+'%');
  //console.log(scrollPercent);

  animationFrame(loop);
}
loop();

function resize() {
  scrollHeight = $('html').height() - window.innerHeight;
  //scrollArea.height = (window.innerHeight*5)+'px';
}
resize();
window.addEventListener('resize', resize);



jQuery(document).ready(function($) {
  // slider
  $('.my-slider').unslider({
    //infinite: true,
    nav: true,
  });

  // zoom img
  $('.img-zoom').each(function(){
    $(this).click(function(){
      $('.img-zoomin-area').remove();

      $('body').append("<div class='img-zoomin-area'></div>");
      $('body').css('overflow', 'hidden');
      $(this).addClass('img-zoomin');

      $(this).clone().appendTo('.img-zoomin-area');

      $('.img-zoomin-area').click(function(){
        $(this).addClass('img-zoomout');

        setTimeout(function(){
          $('.img-zoomin-area').remove();
          $('body').css('overflow', 'initial');
          $('.img-zoom').removeClass('img-zoomin');
        }, 200);

      });
    });
  });

  // Ajuste acessibilidade popover
  $('button[data-toggle="popover"]:not(.interactive-image__btn)').each(function(){
    var popovertext = $(this).html();
    var popoverdesc = $(this).attr('data-content');
    var attr = $(this).attr('data-title');
    var popovertitle = '';

    if ( typeof attr !== typeof undefined && attr !== false ){
      popovertitle = $(this).attr('data-title');
    }

    $(this).attr('aria-hidden', 'true');
    $(this).before('<button class="sr-only popover-sr-button">' + popovertext + '<span class="sr-only">Aperte ENTER para ler o conteúdo do trecho.</span></button>');
    $(this).after('<span class="sr-only popover-sr-continue" tabindex="0"> </span>');
    $(this).after('<span tabindex="0" class="sr-only popover-sr-desc" style="display: none; position: static;">' + popovertitle + ' ' + popoverdesc + '<a href="" class="popover-sr-end-button" style="position:relative;"> Fim do conteúdo, pressione ENTER para fechar o detalhe.</a></span>');

    $('.popover-sr-button').click(function(){
      //$(this).next('button').focus();
      $(this).next('button').next('.popover-sr-desc').next('.popover-sr-end-button').show();
      $(this).next('button').next('.popover-sr-desc').show();
      $(this).next('button').next('.popover-sr-desc').show().focus();
    });

    /*$('.popover-sr-end-button').focus(function(){
      $(this).prev('.popover-sr-desc').hide();
      $(this).blur();
    });*/

    $('.popover-sr-desc').click(function(){
      $(this).blur().hide();
      $(this).next('.popover-sr-continue').focus().attr("aria-live", "polite");
    });
  });


  // Ajustes acessibilidade abas/tabs
  var targettab;
  $('.nav-tabs-next').click(function(){
    $(this).parent('.tab-pane').removeClass('active').removeClass('in');
    $(this).parent('.tab-pane').next().addClass('active in');

    targettab = $(this).attr('data-tab');
    $('.nav-tabs > li > a[href="#'+targettab+'"]').parent().siblings().removeClass('active');
    $('.nav-tabs > li > a[href="#'+targettab+'"]').parent().addClass('active');
    $('.nav-tabs > li > a[href="#'+targettab+'"]').parent().siblings().find('*[data-toggle="tab"]').attr('aria-expanded', false );
    $('.nav-tabs > li > a[href="#'+targettab+'"]').attr('aria-expanded', true);
  });

  $('.nav-tabs-back').click(function(){
    $(this).parent('.tab-pane').removeClass('active').removeClass('in');
    $(this).parent('.tab-pane').prev().addClass('active in');

    targettab = $(this).attr('data-tab');
    $('.nav-tabs > li > a[href="#'+targettab+'"]').parent().siblings().removeClass('active');
    $('.nav-tabs > li > a[href="#'+targettab+'"]').parent().addClass('active');
    $('.nav-tabs > li > a[href="#'+targettab+'"]').parent().siblings().find('*[data-toggle="tab"]').attr('aria-expanded', false );
    $('.nav-tabs > li > a[href="#'+targettab+'"]').attr('aria-expanded', true);
  });

  // Navegacao abas como timeline
  var targetnexttab;
  $('.tab-next').click(function(e){
    e.preventDefault();

    if( !$(this).parent('li').prev('li').hasClass('active') ){
      $(this).parents('.nav-tabs').find('.active').removeClass('active').next('li').addClass('active');
      targetnexttab = $(this).parents('.nav-tabs').find('.active').children('a').attr('href');
      $(this).parents('.container-galeria').find('.tab-pane').removeClass('active').removeClass('in');
      $(targetnexttab).addClass('active in');
    } else {
      $(this).attr('disabled');
    }
  });

  $('.tab-back').click(function(e){
    e.preventDefault();

    if( !$(this).parent('li').next('li').hasClass('active') ){
      $(this).parents('.nav-tabs').find('.active').removeClass('active').prev('li').addClass('active');
      targetnexttab = $(this).parents('.nav-tabs').find('.active').children('a').attr('href');
      $(this).parents('.container-galeria').find('.tab-pane').removeClass('active').removeClass('in');
      $(targetnexttab).addClass('active in');
    }else {
      $(this).attr('disabled');
    }
  });


  // Ajuste acessibilidade slider
  $('.unslider-arrow').each(function(){
    $(this).attr('aria-hidden','true');
  });

  $('.unslider-nav').each(function(){
    $(this).attr('aria-hidden','true');
  });


  // flip cards
  $('.card-flip').click(function(){
    $(this).toggleClass('is-flipped');
  });

  // collapse
  $('a.collapsed[data-toggle="collapse"]').click(function(e){
    e.preventDefault();

    $(this).parents('.panel-group').attr("aria-live", "polite");
  });
});