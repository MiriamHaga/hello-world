$('.carousel').carousel({
  pause: true,
  interval: false
})

$('[data-toggle="popover"]').popover({
  trigger: 'click',
  container: 'body',
  html: true
});

$('.interactive-image__btn[data-toggle="popover"]').popover({
  trigger: 'click',
  container: 'body',
  html: true
}).on('shown.bs.popover', function () {
  $('.interactive-image__btn[data-toggle="popover"]').removeClass('active');
  $(this).addClass('active');

  $('.popover').find('button.popover-next').unbind("click").click(function (e) {
    $('[data-toggle="popover"].active').click();
    $('[data-toggle="popover"].active').next('span').next('span').next('button').next('[data-toggle="popover"]').click();
  });

  $('.popover').find('button.popover-back').unbind("click").click(function (e) {
    $('[data-toggle="popover"].active').click();
    $('[data-toggle="popover"].active').prev('button').prev('span').prev('span').prev('[data-toggle="popover"]').click();
  });
});

jQuery(document).ready(function($) {
  // slider
  $('.my-slider').unslider({
    //infinite: true,
    nav: true,
  });

  // zoom img
  /*$('.img-zoom').each(function(){
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
  });*/
  $(document).on("click", ".img-zoom", function() {
    $(this).click(function(){
      $('.img-zoomin-area').remove();

      $('body').append("<div class='img-zoomin-area'></div>");
      $('body').css('overflow', 'hidden');
      $(this).addClass('img-zoomin');

      $(this).clone().appendTo('.img-zoomin-area');

      $(document).on("click", ".img-zoomin-area", function() {
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
  $('button[data-toggle="popover"]').each(function(){
    var popovertext = $(this).html();
    var popoverdesc = $(this).attr('data-content');
    var attr = $(this).attr('data-title');
    var popovertitle = '';

    if ( typeof attr !== typeof undefined && attr !== false ){
      popovertitle = $(this).attr('data-title');
    }

    $(this).before('<button class="sr-only popover-sr-button">' + popovertext + '</button>');
    $(this).after('<span tabindex="0" class="sr-only popover-sr-desc" style="display: none; position: static;">Detalhes do trecho: ' + popovertitle + ' ' + popoverdesc + '</span><span tabindex="0" class="sr-only popover-sr-end-button" style="display: none; position:relative;">Fim dos detalhes do trecho</span>');

    /*$('.popover-sr-button').click(function(){
      $(this).next('button').next('.popover-sr-desc').next('.popover-sr-end-button').show();
      $(this).next('button').next('.popover-sr-desc').show().focus();
    });

    $('.popover-sr-end-button').focus(function(){
      $(this).prev('.popover-sr-desc').hide();
      $(this).blur();
    });*/
    $(document).on("click", ".popover-sr-button", function() {
      $(this).next('button').next('.popover-sr-desc').next('.popover-sr-end-button').show();
      $(this).next('button').next('.popover-sr-desc').show().focus();
    });

    $(document).on("focus", ".popover-sr-end-button", function() {
      $(this).prev('.popover-sr-desc').hide();
      $(this).blur();
    });
  });


  // Ajustes acessibilidade abas/tabs
  var targettab;
  /*$('.nav-tabs-next').click(function(){
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
  });*/
  $(document).on("click", ".nav-tabs-next", function() {
    $(this).parent('.tab-pane').removeClass('active').removeClass('in');
    $(this).parent('.tab-pane').next().addClass('active in');

    targettab = $(this).attr('data-tab');
    $('.nav-tabs > li > a[href="#'+targettab+'"]').parent().siblings().removeClass('active');
    $('.nav-tabs > li > a[href="#'+targettab+'"]').parent().addClass('active');
    $('.nav-tabs > li > a[href="#'+targettab+'"]').parent().siblings().find('*[data-toggle="tab"]').attr('aria-expanded', false );
    $('.nav-tabs > li > a[href="#'+targettab+'"]').attr('aria-expanded', true);
  });

  $(document).on("click", ".nav-tabs-back", function() {
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
  /*$('.galeria-timeline .tab-next').click(function(e){
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

  $('.galeria-timeline .tab-back').click(function(e){
    e.preventDefault();

    if( !$(this).parent('li').next('li').hasClass('active') ){
      $(this).parents('.nav-tabs').find('.active').removeClass('active').prev('li').addClass('active');
      targetnexttab = $(this).parents('.nav-tabs').find('.active').children('a').attr('href');
      $(this).parents('.container-galeria').find('.tab-pane').removeClass('active').removeClass('in');
      $(targetnexttab).addClass('active in');
    }else {
      $(this).attr('disabled');
    }
  });*/
  $(document).on("click", ".galeria-timeline .tab-next", function(e) {
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

  $(document).on("click", ".galeria-timeline .tab-back", function(e) {
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
  /*$('.card-flip').click(function(){
    $(this).toggleClass('is-flipped');
  });*/
  $(document).on("click", ".card-flip", function() {
    $(this).toggleClass('is-flipped');
  });
});