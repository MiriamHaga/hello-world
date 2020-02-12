

  // Animação de qualquer elemento
  //function reloadAnimate(){  
  //  $(".animaReload").css('opacity', 0);
  //  setTimeout( inicialAnimate,  1000 );
  //}
  //
  //function inicialAnimate(){
  //  
  //  var array = [0, 1500, 3500, 5500, 7500, 9500, 11500];
  //  
  //  for(var i = 1; i <= array.length; i++){
  //    
  //    $( ".animacao-geral-"+i ).delay(array[(i-1)]).animate({
  //      opacity: 1
  //      }, 1000, function() {
  //    });
  //    
  //  }
  //  setTimeout( reloadAnimate,  15000 );
  //}

  // Código de paginação para telas / por: willian.oliveira

  $(document).ready(function(){ var arrUrl = window.location.pathname.split("/"), arrNome = arrUrl[arrUrl.length-1].split("_"); $("#pagination").html(arrNome[arrNome.length-1].substring(1,3)); });

  // Elemento clica abre

  $( ".clica1" ).click(function() {
    $('.abre1').toggleClass('abre-element');
  }); 

  $( ".clica2" ).click(function() {
    $('.abre2').toggleClass('abre-element');
  }); 

  $( ".clica3" ).click(function() {
    $('.abre3').toggleClass('abre-element');
  }); 

  // abre submenu

  $( ".iconMenu" ).click(function() {
    $('.submenu').toggleClass('abre');
    $('.iconMenu').toggleClass('muda');
  }); 

  // acessibilidade

  $( ".btnContraste" ).click(function() {
    $('body').toggleClass('contraste');
  }); 

  $( ".btnMenor" ).click(function() {
    $('html').addClass('fontMenor');
    $('html').removeClass('fontNormal');
    $('html').removeClass('fontMaior');
  }); 

  $( ".btnNormal" ).click(function() {
    $('html').removeClass('fontMenor');
    $('html').removeClass('fontMaior');
  }); 

  $( ".btnMaior" ).click(function() {
    $('html').addClass('fontMaior');
    $('html').removeClass('fontNormal');
    $('html').removeClass('fontMenor');
  }); 

  // aba fixa

  $( ".aba-fixa span" ).click(function() {
    $('.aba-fixa').toggleClass('abre-aba');
  });

  /*menu moodle*/
  var lis = $(".submenu li");
  lis.each(function( index ) {  
    $(this).find("a").click(function (e) {
      e.preventDefault();
      var elem = $(window.parent.document).find(".yui3-treeview-row").eq(index);
      elem.click();
    });
  });

  /*ajuste scroll iframe scorm*/
  $(window.parent.document).find("#scorm_object").attr("onload", "this.style.height = this.contentDocument.body.scrollHeight +'px';");