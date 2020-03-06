/**************************************************
 *
 * Atividades Acessíveis
 * EFAP
 * Click Click
 * Autor: Bognar
 *
 **************************************************/

function ClickClickAleatorioGrupo (draggable, droppable, gabarito, feedAcerto, feedErro) {

  // Inicia algumas propriedades
  this.draggable = draggable;
  this.droppable = droppable;
  this.gabarito = gabarito;
  this.feedAcerto = feedAcerto || "Parabéns você acertou todas as atividades!";
  this.feedErro = feedErro || "Existem erros, por favor refaça a atividade!";
  this.dropText = "";

  completeOnExit = false;

  var right = $(".right");
  right.unbind("click").attr('disabled', 'disabled').off('click').addClass('off');

  //Função chamada apara iniciar as variáveis e também para resetar quando for jogar novamente
  this.declareResetVariables();
}

ClickClickAleatorioGrupo.prototype.declareResetVariables = function () {
  //Contador de respostas
  this.answerCount = 0;
  this.countErros = 0;
  this.dragGroup = [];
  this.dropGroup = [];
  this.dropText = [];

  this.firstSelection = true;

  this.activityComplete = false;

  //Respostas
  this.answer = [];

  //Guarda apenas o texto que foi selecionado
  this.textDragged = "";

  //Guarda o objeto
  this.currentDrag = "";

  // True - Refazer / False - Confirmar Resposta
  this.flagRefazer = false;
  this.flagLimpar = false;
  this.flagConferir = false;

  // Código de teclas
  this.keys = {
    enter: 13,
    space: 32,
    left: 37,
    up: 38,
    right: 39,
    down: 40
  };

  // Chama a função que inicializa a classe
  this.init();
};

ClickClickAleatorioGrupo.prototype.init = function () {

  // Guarda uma referência da classe
  var self = this;

  this.dropFull = false;

  this.dragGroup = $("." + this.draggable + " li[role=listitem]"); // Pega todos os drags que fazem parte da atividade.
  this.dropGroup = $("." + this.droppable + " li.drop"); // Pega todos os drops que fazem parte da atividade.

  //Guarda os textos
  // this.dropText = $( "#"+ this.droppable + " li.drop" ).text();
  for (var i = 0; i < this.dropGroup.length; i++) {
    this.dropText[i] = $(this.dropGroup[i]).text();
  }

  this.btEnvia = $("#btnConferir");     // Pega o botão de Confirmação da Atividade
  this.btRefazer = $("#btnRefazer");    // Pega o botão de Refazer
  this.btnLimpar = $("#btnLimpar");    // Pega o botão de Refazer
  this.feedClick = $("#feedClick");     // Mensagem na tela

  //Limpa o texto do feed visual e a label do feed auditivo.
  this.feedClick.text("");

  this.dragGroup.bind('keydown', function (e) { self.selectDragKeydown(e); });
  this.dragGroup.bind('click', function (e) {
    e.preventDefault();
    self.selectDragClick(e);
  });

  this.dropGroup.bind('keydown', function (e) { self.selectDropKeydown(e); });
  this.dropGroup.bind('click', function (e) {
    e.preventDefault();
    self.selectDropClick(e);
  });

  // Adiciona onClick no botão envia
  this.btEnvia.bind('click', function (e) {
    e.preventDefault();
    self.onClickConferir(e)
  });
  this.btEnvia.bind('keydown', function (e) { self.onKeydownConferir(e) });

  this.btnLimpar.bind('click', function (e) {
    e.preventDefault();
    self.onClickLimpar(e)
  });
  this.btnLimpar.bind('keydown', function (e) { self.onKeydownLimpar(e) });

  // Adiciona onClick no botão refazer
  this.btRefazer.bind('click', function (e) {
    e.preventDefault();
    self.onClickRefazer(e)
  });
  this.btRefazer.bind('keydown', function (e) { self.onKeydownRefazer(e) });

  //Atribui os valores do aria
  $(this.dropGroup).attr({"aria-dropeffect": "none"});
  $(this.btEnvia).attr({"aria-disable": "true"});
  $(this.btRefazer).attr({"aria-disable": "true"});

  // Troca o botão para Confirmar
  this.btEnvia.show();
  this.btRefazer.hide();
};

ClickClickAleatorioGrupo.prototype.onClickConferir = function (e) {
  this.flagConferir = true;
  this.onClick(e)
};

ClickClickAleatorioGrupo.prototype.onKeydownConferir = function (e) {
  this.flagConferir = true;
  this.onKeydown(e)
};

ClickClickAleatorioGrupo.prototype.onClickLimpar = function (e) {
  this.flagLimpar = true;
  this.onClick(e)
};

ClickClickAleatorioGrupo.prototype.onKeydownLimpar = function (e) {
  this.flagLimpar = true;
  this.onKeydown(e)
};

ClickClickAleatorioGrupo.prototype.onClickRefazer = function (e) {
  this.flagRefazer = true;
  this.onClick(e)
};

ClickClickAleatorioGrupo.prototype.onKeydownRefazer = function (e) {
  this.flagRefazer = true;
  this.onKeydown(e)
};

/**
 * Libera o botão para o cursista avançar pra proxima tela
 */
ClickClickAleatorioGrupo.prototype.releaseNextButton = function () {

  right.click(function (e) {
    e.preventDefault();
    var id = $(this).attr('data-option');
    var storedId = window.localStorage.getItem(ATV_MODULE);
    id++;
    window.localStorage.setItem('startPage', true);
    if (id > storedId) window.localStorage.setItem(ATV_MODULE, id);
    var elem = $(window.parent.document).find(".yui3-treeview-row").eq(id);
    elem.click();
  }).removeAttr("disabled").removeClass('off');
};

ClickClickAleatorioGrupo.prototype.selectDragKeydown = function (e) {

  //Elemento selecionado.
  var dragFocus = $(e.target);

  //Index de e.target entre os radios armazenados no objeto radioGroup.
  var index = this.dragGroup.index(dragFocus);

  //Armazena o elemento anterior a e.target
  var prev_drag = this.dragGroup[index - 1];

  //Armazena o elemento posterior a e.target
  var next_drag = this.dragGroup[index + 1];

  //Ignora o restante do código caso a tecla alt ou a tecla shift estejam pressionadas. ( o motivo para essa condição é desconhecido )
  if (e.altKey || e.shiftKey) return;

  //Analizando qual tecla foi pressionada após o elemento e.target ser selecionado.
  switch (e.keyCode) {

    //Tecla espaço ou o enter
    case this.keys.space:
    case this.keys.enter:
      //Chama a função que realmente seleciona
      this.selectDrag(e);
      break;

    //Tecla seta para esquerda ou para cima, seleciona o elemento anterior a e.target.
    case this.keys.left:
    case this.keys.up:
      //caso o elemento seja visivel ele rebe foco.
      if ($(prev_drag).is(":visible")) prev_drag.focus();

      // if ($( prev_drag ).attr("id") == undefined) {
      //     this.btEnvia.focus();
      // };
      break;

    //Tecla seta para direita ou para baixo seleciona o elemento posterior a e.target.
    case this.keys.right:
      this.dropGroup[index].focus();
      break;
    case this.keys.down:
      if ($(next_drag).is(":visible")) next_drag.focus();
      if ($(next_drag).attr("id") == undefined) {
        this.dropGroup[0].focus();
      }

      break;
  }
// console.log(JSON.stringify($( e.target ).parent()))
};

ClickClickAleatorioGrupo.prototype.selectDragClick = function (e) {
  //Chama a função que realmente seleciona
  this.selectDrag(e);
};

ClickClickAleatorioGrupo.prototype.selectDrag = function (e) {

  //verifica se o target pode ser selecionado
  if ($(e.target).attr("aria-grabbed") != "undefined") {

    if ($(this.currentDrag) != "") {
      $(this.currentDrag).removeClass('selected');
    }


    //Pega o texto do target
    this.textDragged = $(e.target).text();
    this.currentDrag = $(e.target);

    //seta valor ao atributo
    $(this.currentDrag).addClass('selected').attr({"aria-grabbed": true, "aria-checked": true});

    //Testa se é a primeira seleção
    if (this.firstSelection == true) {
      //atribui ao aria-dropeffect o valor de copy
      $(this.dropGroup).attr({"aria-dropeffect": "copy"})
    } else {
      $(this.dropGroup).each(function () {
        if ($(this).attr("aria-dropeffect") != "none") {
          $(this).attr({"aria-dropeffect": "copy"})
        }

      })
    }

  }

};

ClickClickAleatorioGrupo.prototype.selectDropKeydown = function (e) {

  //Elemento selecionado.
  var $dropFocus = $(e.target);

  //Index de e.target entre os radios armazenados no objeto radioGroup.
  var index = this.dropGroup.index($dropFocus);

  //Armazena o elemento anterior a e.target
  var prev_drop = this.dropGroup[index - 1];

  //Armazena o elemento posterior a e.target
  var next_drop = this.dropGroup[index + 1];

  //Ignora o restante do código caso a tecla alt ou a tecla shift estejam pressionadas. ( o motivo para essa condição é desconhecido )
  if (e.altKey || e.shiftKey) return;

  //Analizando qual tecla foi pressionada após o elemento e.target ser selecionado.
  switch (e.keyCode) {

    //Tecla espaço ou o enter
    case this.keys.space:
    case this.keys.enter:
      // Chama a função que faz o drop
      this.selectDrop(e);
      break;

    //Tecla seta para esquerda ou para cima, seleciona o elemento anterior a e.target.
    case this.keys.left:
      this.dragGroup[index].focus();
      break;
    case this.keys.up:

      //caso o elemento seja visivel ele rebe foco.
      if ($(prev_drop).is(":visible")) prev_drop.focus();

      if ($(prev_drop).attr("id") == undefined) {
        this.dragGroup[this.dragGroup.length - 1].focus();
      }

      break;

    //Tecla seta para direita ou para baixo seleciona o elemento posterior a e.target.
    case this.keys.right:
    case this.keys.down:
      if ($(next_drop).is(":visible")) next_drop.focus();

      // if ($( next_drop ).attr("id") == undefined) {
      //     this.btEnvia.focus();
      // };

      break;
  }
};

ClickClickAleatorioGrupo.prototype.selectDropClick = function (e) {
  // Chama a função que faz o drop
  this.selectDrop(e);
};

ClickClickAleatorioGrupo.prototype.selectDrop = function (e) {

  //verifica se tem algum texto selecionado e se pode dropar o texto na caixa
  if (this.textDragged != "" && $(e.target).attr("aria-dropeffect") != "none") {

    this.btnLimpar.show();

    //Insere o texto dentro do HTML selecionado, adiciona a classe e altera para que
    //mais nenhum texto possa ser dropado na caixa
    $(e.target).text(this.textDragged).addClass('disabled').attr({"aria-dropeffect": "none"});

    //Altera o atributo para que o texto que já está dropado não possa ser selecionado novamente
    //Remove a classe selected e adiciona outra
    $(this.currentDrag).removeClass('selected').addClass('disabled').attr({
      "aria-grabbed": "undefined",
      "aria-disabled": true
    });

    //Limpa a variável
    this.textDragged = "";
    this.firstSelection = false;

    //Posiciona corretamente o elemento na array
    this.answer[$(e.target).attr("id").substr(5, 2) - 1] = $(this.currentDrag).attr("id");
    this.answerCount++;
  }

  //Testa se todas as respostas estão preencidas
  if (this.answerCount == this.gabarito.length) {

    //Muda o atributo
    $(this.btEnvia).attr({"aria-disable": "false"}).removeClass('disabled-check');
    this.dropFull = true;
  }

};

ClickClickAleatorioGrupo.prototype.onClick = function (e) {

  //Guarda a referência da classe
  var self = this;

  // testa se é o primeiro clique
  if (!this.flagRefazer && this.flagConferir) {

    //testa se todos os campos foram dropados
    if (this.dropFull) {

      // Troca o botão para refazer
      this.btEnvia.hide();
      this.btRefazer.show().attr("tabindex", "0");
      this.flagConferir = false;
      //Muda os atributos dos botões
      $(this.btEnvia).attr({"aria-disable": "true"});
      $(this.btRefazer).attr({"aria-disable": "false"});

      //Retira os eventos dos drags e dos drops
      this.dragGroup.unbind('keydown');
      this.dragGroup.unbind('click');
      this.dropGroup.unbind('keydown');
      this.dropGroup.unbind('click');
    }


    //Chama a função de feed
    this.feedback(this.dropFull);

  } else if (this.flagRefazer && !this.flagLimpar) {

    this.btEnvia.addClass('disabled-check');

    if (this.activityComplete == true) {

      //Retira os eventos dos drags e dos drops
      this.dragGroup.unbind('keydown');
      this.dragGroup.unbind('click');
      this.dropGroup.unbind('keydown');
      this.dropGroup.unbind('click');

      // Adiciona onClick no botão envia
      this.btEnvia.unbind('click');
      this.btEnvia.unbind('keydown');

      // Adiciona onClick no botão refazer
      this.btRefazer.unbind('click');
      this.btRefazer.unbind('keydown');

      var arrobj = this.dropGroup;

      for (var i = 0; i < arrobj.length; i++) {
        $(arrobj[i]).text(this.dropText[i]).attr('aria-label', $(arrobj[i]).attr('aria-label').split('-')[0].trim());
      }


      $(this.dragGroup).attr({"aria-grabbed": "none", "aria-disabled": "false"}).removeClass("disabled fix");
      $(this.dropGroup).attr({"aria-dropeffect": "none"}).removeClass("correct");
      //Função chamada apara iniciar as variáveis e também para resetar quando for jogar novamente
      this.declareResetVariables();

    } else {
      this.flagRefazer = false; // Atribui a flag de refazer para false;
      this.dropFull = false;
      this.countErros = 0;
      //Limpa o texto do feed visual e a label do feed auditivo.
      this.feedClick.text("");

      //Apenas o tabindex o feed auditivo é manipulado.
      this.feedClick.attr("tabindex", "-1");

      //Removendo o atributo de alert.
      this.feedClick.removeAttr("role", "alert");

      // Troca o botão para Confirmar
      this.btEnvia.show();
      this.btRefazer.hide();
      $(this.btEnvia).attr({"aria-disable": "true"});

      $(this.dragGroup).bind('keydown', function (e) { self.selectDragKeydown(e); });
      $(this.dragGroup).bind('click', function (e) {
        e.preventDefault();
        self.selectDragClick(e);
      });

      $(this.dropGroup).bind('keydown', function (e) { self.selectDropKeydown(e); });
      $(this.dropGroup).bind('click', function (e) {
        e.preventDefault();
        self.selectDropClick(e);
      });

      //$( this.dropGroup ).each( function(){
      //        var label = $(this).attr("aria-label").replace("Resposta incorreta - ", "" );
      //        $(this).attr("aria-label", label);
      //})

      var arrobj = this.dropGroup;

      for (var i = 0; i < arrobj.length; i++) {
        if ($(arrobj[i]).hasClass('wrong')) {
          $(arrobj[i]).text(this.dropText[i]).attr('aria-label', $(arrobj[i]).attr('aria-label').split('-')[0].trim());
        }

      }


      $(".containerDrop .wrong").attr({"aria-dropeffect": "copy"}).removeClass("wrong");
      $(".containerDrag .delete").attr({"aria-grabbed": "false"}).removeAttr("aria-disabled").removeClass("disabled delete");
      $(".containerDrag .fix").removeClass("fix");
    }

  } else if (!this.flagRefazer && this.flagLimpar) {

    this.btEnvia.removeClass('disabled-check');

    var arrDrag = this.dragGroup, drag;

    for (var i = 0; i < arrDrag.length; i++) {
      drag = $(arrDrag[i]);
      if (!drag.hasClass('ok')) {
        drag.attr('aria-grabbed', 'false').removeClass('disabled');
        drag.attr('aria-disabled', 'false');
        drag.attr('aria-checked', 'false');
      }

    }


    var arrobj = this.dropGroup, drop;

    for (var i = 0; i < arrobj.length; i++) {
      drop = $(arrobj[i]);
      drop.removeClass('errado');
      if (drop.hasClass('disabled') && !$(arrobj[i]).hasClass('correct')) {
        drop.text("...").removeClass("disabled").attr('aria-label', drop.attr('aria-label').split('-')[0].trim());
        drop.attr('aria-dropeffect', '');
      }

    }

    this.answerCount = $(".correct").length;
    this.flagConferir = false;
    this.flagLimpar = false;
    this.flagRefazer = false;
    this.btEnvia.addClass('disabled-check');
    this.btnLimpar.hide();
  }
};

ClickClickAleatorioGrupo.prototype.onKeydown = function (e) {
  //Analizando qual tecla foi pressionada após o elemento e.target ser selecionado.
  switch (e.keyCode) {
    //Tecla espaço ou o enter
    case this.keys.space:
    case this.keys.enter:
      this.onClick(e);
      break;

    //Tecla seta para esquerda ou para cima, seleciona o elemento anterior a e.target.
    case this.keys.left:
    case this.keys.up:
      this.dropGroup[this.dragGroup.length - 1].focus();
      break;

    //Tecla seta para direita ou para baixo seleciona o elemento posterior a e.target.
    case this.keys.right:
    case this.keys.down:
      // this.dragGroup[0].focus();
      break;
  }
};

ClickClickAleatorioGrupo.prototype.feedback = function (e) {

  //Define a opacidade do feed visual em 0.
  this.feedClick.show().css("opacity", "0");

  //testa se todos os campos foram dropados
  if (!e) {

    // Da um feedbak para o aluno selecionar as perguntas
    this.feedClick.text("Ainda existem campos que não foram relacionados na atividade!");

    //Flag necessária para exibição do botão refazer ou conferir.
    this.flagRefazer = false;
    this.activityComplete = false;

    // Anima o alpha do texto de feedback
    this.feedClick.animate({opacity: 1}, 1000);
    this.feedClick.animate({opacity: 0}, 1000);
    this.feedClick.animate({opacity: 1}, 1000);
    this.feedClick.attr("role", "alert");

  } else {

    var drop = null, textAux = null, drag = null;

    //varre as arrays
    for (var i = 0; i < this.answer.length; i++) {

      drop = $("#drop_" + ( i + 1 ));
      drag = $("#" + this.answer[i]);

      //testa se as respostas são equivalentes com o gabarito
      //if ( this.answer[i] == this.gabarito[i]) {
      if (drag.attr("answer") && drag.attr("group") == drop.attr("group")) {
        textAux = drop.attr('aria-label') + " - right answer -" + drop.text();

        //remove a classe disabled e adiciona a classe correct
        drop.removeClass('disabled').addClass('correct').attr({"aria-label": textAux});
        drag.addClass("fix").addClass("ok");

      } else {

        textAux = drop.attr('aria-label') + " - Incorrect answer -" + drop.text();

        //remove a classe disabled e adiciona a classe correct
        drop.removeClass('disabled').addClass('wrong').attr({"aria-label": textAux});
        drag.addClass("delete");

        //retira da array a resposta correta
        this.answer[i] = "";
        this.countErros++;
      }
    }

    this.answerCount -= this.countErros;
    //Conta se existem questões erradas
    if (this.countErros == 0) {
      //Exibe mensagem
      this.feedClick.text(this.feedAcerto);
      this.activityComplete = true;

      //Flag necessária para exibição do botão refazer ou conferir.
      this.flagRefazer = true;
      this.releaseNextButton();

      // SCORM - altera o status da atividade como finalizada
      window.parent.SCORM && window.parent.SCORM.completePage()

    } else {
      //Exibe mensage
      this.feedClick.text(this.feedErro);

      //Flag necessária para exibição do botão refazer ou conferir.
      this.flagRefazer = true;
      this.activityComplete = false;
    }
    this.flagConferir = false;
    this.flagLimpar = false;
    this.btnLimpar.hide();
    //Anima e adiciona atributo
    this.feedClick.animate({opacity: 1}, 1000).attr("role", "alert");
  }

};