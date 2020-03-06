/**************************************************
 *
 * Atividades Acessíveis
 * EFAP
 * Click Click
 * Autor: Bognar
 *
 **************************************************/

function ClickClickGrupo (draggable, droppable, gabarito, feedAcerto, feedErro, config) {

  // Inicia algumas propriedades
  this.draggable = draggable;
  this.droppable = droppable;
  this.gabarito = gabarito;
  this.feedAcerto = feedAcerto || "Parabéns você acertou todas as atividades!";
  this.feedErro = feedErro || "Existem erros, por favor refaça a atividade!";

  //variavel de configuração da atividade
  this.configAtv = config;
  //pegando a variavel de scorm do moodle
  this.scorm = window.parent.SCORM || null;

  this.dropText;
  completeOnExit = false;

  this.btnConferir = $("#btnConferir");     // Pega o botão de Confirmação da Atividade
  this.btnRefazer = $("#btnRefazer");    // Pega o botão de Refazer
  this.btnLimpar = $("#btnLimpar");    // Pega o botão de Refazer
  this.feedClick = $("#feedClick");     // Mensagem na tela

  // valida se existe a variavel do scorm do moodle
  if( this.scorm ) {
    //conferindo se o usuário pode refazer atividade
    if(!this.scorm.isActivityLocked()) {
      //Função chamada apara iniciar as variáveis e também para resetar quando for jogar novamente
      this.declareResetVariables();
    }else{
      this.btnConferir.remove();
      this.btnRefazer.remove();
      this.btnLimpar.remove();
    }
  }else{
    //Função chamada apara iniciar as variáveis e também para resetar quando for jogar novamente
    this.declareResetVariables();
  }
}

ClickClickGrupo.prototype.declareResetVariables = function () {
  //Contador de respostas
  this.answerCount = 0;
  this.countErros = 0;
  this.dragGroup = [];
  this.dropGroup = [];
  this.dropText = [];

  this.firstSelection = true;
  this.flagActivityComplete = false;

  //Respostas
  this.answer = [];

  //Guarda apenas o texto que foi selecionado
  this.textDragged = "";

  //Guarda o objeto
  this.currentDrag = "";

  this.btnRemoveOptions = $(".remove-option");

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

  this.dropFull = false;

  this.dragGroup = $("." + this.draggable + " li[role=listitem]"); // Pega todos os drags que fazem parte da atividade.
  this.dropGroup = $("." + this.droppable + " .drop"); // Pega todos os drops que fazem parte da atividade.


  // Chama a função que inicializa a classe
  this.init();
};

ClickClickGrupo.prototype.init = function () {

  //Guarda os textos
  // this.dropText = $( "#"+ this.droppable + " li.drop" ).text();
  for (var i = 0; i < this.dropGroup.length; i++) {
    this.dropText[i] = $(this.dropGroup[i]).text();
  }
  ;

  //Limpa o texto do feed visual e a label do feed auditivo.
  this.feedClick.text("");

  //Atribui os valores do aria
  this.dropGroup.attr({"aria-dropeffect": "none"});
  this.btnConferir.attr({"aria-disable": "true"});
  this.btnRefazer.attr({"aria-disable": "true"});

  this.configAtv.showBtnConferir ? this.btnConferir.show() : this.btnConferir.addClass(' hide-confirm');
  this.configAtv.showBtnClear   ? this.btnLimpar.show()   : this.btnLimpar.hide();

  if(this.configAtv.blockBtnNext) {
    var right = $(".right");
    right.unbind("click").attr('disabled', 'disabled').off('click').addClass('off');
  }

  this.setEvents();
};

ClickClickGrupo.prototype.setEvents = function (e) {

  // Guarda uma referência da classe
  var self = this;

  this.dragGroup.bind('keydown', function (e) { self.selectDragKeydown(e); });
  this.dragGroup.bind('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    self.selectDragClick(e);
  });

  this.dropGroup.bind('keydown', function (e) { self.selectDropKeydown(e); });
  this.dropGroup.bind('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    self.selectDropClick(e);
  });

  // Adiciona onClick no botão envia
  this.btnConferir.bind('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    self.onClickConferir(e)
  });
  this.btnConferir.bind('keydown', function (e) { self.onKeydownConferir(e) });

  this.btnLimpar.bind('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    self.onClickLimpar(e)
  });
  this.btnLimpar.bind('keydown', function (e) { self.onKeydownLimpar(e) });

  // Adiciona onClick no botão refazer
  this.btnRefazer.bind('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    self.onClickRefazer(e)
  });
  this.btnRefazer.bind('keydown', function (e) { self.onKeydownRefazer(e) });

  if(this.configAtv.showRemoveOption){
    this.btnRemoveOptions.bind('click', function (e) {
      self.onRemoveOption(e)
    });
    this.btnRemoveOptions.bind('keydown', function (e) { self.onRemoveOption(e) });
  }

};

ClickClickGrupo.prototype.onRemoveOption = function __onRemoveOption(e) {
  e.preventDefault();
  e.stopPropagation();

  var element = $(e.currentTarget);
  var idRemove = element.data("remove");
  var id = idRemove.substr(5, 2);
  var drop = $("#" + idRemove);
      
  drop.html("...").attr("aria-dropeffect", "copy");

  element.css("visibility", "hidden");

  $("#" + drop.data("drag")).removeClass("disabled").attr({"aria-grabbed": true, "aria-disabled": false, "aria-checked": false});

  this.configAtv.showBtnConferir ? this.btnConferir.show() : this.btnConferir.addClass(' hide-confirm');
  this.configAtv.showBtnClear   ? this.btnLimpar.show()   : this.btnLimpar.hide();

};

ClickClickGrupo.prototype.onClickConferir = function __onClickConferir(e) {
  this.flagConferir = true;
  this.onClick(e)
};

ClickClickGrupo.prototype.onKeydownConferir = function (e) {
  this.flagConferir = true;
  this.onKeydown(e)
};

ClickClickGrupo.prototype.onClickLimpar = function (e) {
  this.flagLimpar = true;
  this.onClick(e)
};

ClickClickGrupo.prototype.onKeydownLimpar = function (e) {
  this.flagLimpar = true;
  this.onKeydown(e)
};

ClickClickGrupo.prototype.onClickRefazer = function (e) {
  this.flagRefazer = true;
  this.onClick(e)
};

ClickClickGrupo.prototype.onKeydownRefazer = function (e) {
  this.flagRefazer = true;
  this.onKeydown(e)
};

/**
 * Libera o botão para o cursista avançar pra proxima tela
 */
ClickClickGrupo.prototype.releaseNextButton = function () {
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
}

ClickClickGrupo.prototype.selectDragKeydown = function (e) {

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
}

ClickClickGrupo.prototype.selectDragClick = function (e) {
  //Chama a função que realmente seleciona
  this.selectDrag(e);
}

ClickClickGrupo.prototype.selectDrag = function (e) {

  //verifica se o target pode ser selecionado
  if ($(e.target).attr("aria-grabbed") != "undefined") {

    if ($(this.currentDrag) != "") {
      $(this.currentDrag).removeClass('selected');
    }
    ;

    //Pega o texto do target
    this.textDragged = $(e.target).text()
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

      });
    }

  }

};

ClickClickGrupo.prototype.selectDropKeydown = function (e) {

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
    break;
  }
}

ClickClickGrupo.prototype.selectDropClick = function (e) {
  // Chama a função que faz o drop
  this.selectDrop(e);
}

ClickClickGrupo.prototype.onKeydown = function (e) {
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

ClickClickGrupo.prototype.selectDrop = function (e) {
  var element = $(e.target);
  //verifica se tem algum texto selecionado e se pode dropar o texto na caixa
  if (this.textDragged != "" && element.attr("aria-dropeffect") != "none") {

    this.btnLimpar.show();
    
    this.currentDrag
    element.data("drag", this.currentDrag.attr("id"));
    //Insere o texto dentro do HTML selecionado, adiciona a classe e altera para que
    //mais nenhum texto possa ser dropado na caixa
    element.text(this.textDragged).addClass('disabled').attr({"aria-dropeffect": "none"});

    //Altera o atributo para que o texto que já está dropado não possa ser selecionado novamente
    //Remove a classe selected e adiciona outra
    $(this.currentDrag).removeClass('selected').addClass('disabled').attr({
      "aria-grabbed": "undefined",
      "aria-disabled": true
    })

    //Limpa a variável
    this.textDragged = "";
    this.firstSelection = false;

    //Posiciona corretamente o elemento na array
    this.answer[$(e.target).attr("id").substr(5, 2) - 1] = $(this.currentDrag).attr("id");
    this.answerCount++;

    if(this.configAtv.showRemoveOption){
      var id = element.attr("id").substr(5, 2);
      $(".remove" + id).css("visibility", "visible");
    }

  }

  //Testa se todas as respostas estão preencidas
  if (this.answerCount == this.gabarito.length) {
    //Muda o atributo
    this.btnConferir.attr({"aria-disable": "false"}).removeClass('hide-confirm').show();
    this.dropFull = true;
  }
}

ClickClickGrupo.prototype.onClick = function (e) {

  //Guarda a referência da classe
  var self = this;

  // testa se é o primeiro clique
  if (!this.flagRefazer && this.flagConferir) {

    //testa se todos os campos foram dropados
    if (this.dropFull) {

      // Troca o botão para refazer
      this.btnConferir.hide();
      this.btnRefazer.show().attr("tabindex", "0");
      this.flagConferir = false;
      //Muda os atributos dos botões
      $(this.btnConferir).attr({"aria-disable": "true"});
      $(this.btnRefazer).attr({"aria-disable": "false"});

      //Retira os eventos dos drags e dos drops
      this.dragGroup.unbind('keydown');
      this.dragGroup.unbind('click');
      this.dropGroup.unbind('keydown');
      this.dropGroup.unbind('click');
    }

    //Chama a função de feed
    this.feedback(this.dropFull);

  } else if (this.flagRefazer && !this.flagLimpar) {

    this.btnConferir.addClass('hide-confirm');
    this.btnRefazer.hide();

    if (this.flagActivityComplete || !this.configAtv.showAnswer) {
      this.activityComplete();
    } else {
      this.redoActivity();
    }

  } else if (!this.flagRefazer && this.flagLimpar) {
    this.clearActivity();
  }
}

ClickClickGrupo.prototype.activityComplete = function __activityComplete(){

  this.removeEvents();
  var arrobj = this.dropGroup;

  for (var i = 0; i < arrobj.length; i++) {
    $(arrobj[i]).text(this.dropText[i]).attr('aria-label', $(arrobj[i]).attr('aria-label').split('-')[0].trim());
  }

  $(this.dragGroup).attr({"aria-grabbed": "none", "aria-disabled": "false"}).removeClass("disabled fix");
  $(this.dropGroup).attr({"aria-dropeffect": "none"}).removeClass("correct");
  //Função chamada apara iniciar as variáveis e também para resetar quando for jogar novamente
  this.declareResetVariables();

};

ClickClickGrupo.prototype.removeEvents = function __removeEvents(){

  //Retira os eventos dos drags e dos drops
  this.dragGroup.unbind('keydown');
  this.dragGroup.unbind('click');
  this.dropGroup.unbind('keydown');
  this.dropGroup.unbind('click');

  // Adiciona onClick no botão envia
  this.btnConferir.unbind('click');
  this.btnConferir.unbind('keydown');

  // Adiciona onClick no botão refazer
  this.btnRefazer.unbind('click');
  this.btnRefazer.unbind('keydown');
};

ClickClickGrupo.prototype.redoActivity = function __redoActivity(){

  this.removeEvents();

  this.flagRefazer = false; // Atribui a flag de refazer para false;
  this.dropFull = false;
  this.countErros = 0;
  //Limpa o texto do feed visual e a label do feed auditivo.
  this.feedClick.text("");

  //Apenas o tabindex o feed auditivo é manipulado.
  this.feedClick.attr("tabindex", "-1");

  //Removendo o atributo de alert.
  this.feedClick.removeAttr("role", "alert");

  this.btnConferir.attr({"aria-disable": "true"});

  var arrobj = this.dropGroup;

  for (var i = 0; i < arrobj.length; i++) {
    if ($(arrobj[i]).hasClass('wrong-error')) {
      $(arrobj[i]).text(this.dropText[i]).attr('aria-label', $(arrobj[i]).attr('aria-label').split('-')[0].trim());
    }
  }

  $(".containerDrop .wrong").attr({"aria-dropeffect": "copy"}).removeClass("wrong");
  $(".containerDrag .delete").attr({"aria-grabbed": "false"}).removeAttr("aria-disabled").removeClass("disabled delete");
  $(".containerDrag .fix").removeClass("fix");

  this.configAtv.showBtnConferir ? this.btnConferir.show() : this.btnConferir.addClass('hide-confirm');
  this.configAtv.showBtnClear   ? this.btnLimpar.show()   : this.btnLimpar.hide();
  this.setEvents();
  this.btnRefazer.hide();
};

ClickClickGrupo.prototype.checkActivity = function __checkActivity() {
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
      drop.removeClass('disabled').attr({"aria-label": textAux});
      drag.addClass("fix").addClass("ok");

      if(this.configAtv.showAnswer){
        drop.addClass('correct');
      }

    } else {

      textAux = drop.attr('aria-label') + " - Incorrect answer -" + drop.text();

      //remove a classe disabled e adiciona a classe correct
      drop.removeClass('disabled').addClass('wrong-error').attr({"aria-label": textAux});
      drag.addClass("delete");

      if(this.configAtv.showAnswer){
        drop.addClass('wrong');
      }

      //retira da array a resposta correta
      this.answer[i] = ""
      this.countErros++;
    }
  }

  this.answerCount -= this.countErros;
};

ClickClickGrupo.prototype.clearActivity = function __clearActivity(){
  this.btnConferir.removeClass(' hide-confirm');

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

  this.configAtv.showBtnConferir ? this.btnConferir.show() : this.btnConferir.addClass('hide-confirm');
  this.configAtv.showBtnClear   ? this.btnLimpar.show()   : this.btnLimpar.hide();
  
  if(this.configAtv.showRemoveOption) 
    this.btnRemoveOptions.css("visibility", "hidden");
  
};

ClickClickGrupo.prototype.feedback = function (e) {
  //Guarda a referência da classe
  var self = this;
  var labelFeed;
  //Define a opacidade do feed visual em 0.
  this.feedClick.show().css("opacity", "0");

  //testa se todos os campos foram dropados
  if (!e) {

    labelFeed = "Ainda existem campos que não foram relacionados na atividade!";

    // Da um feedbak para o aluno selecionar as perguntas
    this.feedClick.text(labelFeed);

    //Flag necessária para exibição do botão refazer ou conferir.
    this.flagRefazer = false
    this.flagActivityComplete = false;

    // Anima o alpha do texto de feedback
    this.feedClick.animate({opacity: 0}, 1000);
    this.feedClick.animate({opacity: 1}, 1000);
    this.feedClick.animate({opacity: 1}, 1000);
    this.feedClick.attr("role", "alert");

  } else {

    this.checkActivity();

    //Conta se existem questões erradas
    if (this.countErros == 0) {
      //Exibe mensagem
      labelFeed = this.feedAcerto //|| "Parabéns você acertou todas as atividades!";
      this.feedClick.text(labelFeed);
      this.flagActivityComplete = true;

      //Flag necessária para exibição do botão refazer ou conferir.
      this.flagRefazer = true

      if(this.configAtv.blockBtnNext)
        this.releaseNextButton();

      this.setScormStatus(true);

    } else {
      //Exibe mensage
      labelFeed = this.feedErro// || "Existem erros, por favor refaça a atividade!";
      this.feedClick.text(labelFeed);

      //Flag necessária para exibição do botão refazer ou conferir.
      this.flagRefazer = true;
      this.flagActivityComplete = false;
      this.setScormStatus(false);
    }
    this.flagConferir = false;
    this.flagLimpar = false;
    this.btnLimpar.hide();
    //Anima e adiciona atributo
    this.feedClick.animate({opacity: 1}, 1000).attr("role", "alert");
  }

};

ClickClickGrupo.prototype.setScormStatus = function __setScormStatus(status) {

  if (this.scorm) {
    //caso usuário acerte todas as questões
    if (status) {
      // SCORM - altera o status da atividade como finalizada
      this.scorm.completePage();

      if (this.configAtv.saveNote) {

        if (!this.configAtv.note) {
          if(this.countErros < 0) this.countErros = 0;
          var resp = this.dropGroup.length - this.countErros;
          var media = 10 / this.dropGroup.length;
          var nota = media * resp;

          this.scorm.setSCOScore(nota.toFixed(2));
        } else {
          this.scorm.setSCOScore(this.configAtv.note);
        }
      }

      if (this.configAtv.makeAttempt) {
        this.scorm.makeAttempt(true);
        this.btnConferir.remove();
        this.btnRefazer.remove();
        this.btnLimpar.remove();
      } else {
        this.btnRefazer.show();
      }

      //Flag necessária para exibição do botão refazer ou conferir.
      this.flagRefazer = true;
    } else {

      if (this.configAtv.makeAttempt) this.scorm.makeAttempt(false);

      if (!this.scorm.isActivityLocked())
        this.btnRefazer.show().attr("tabindex", "0");
      else {
        this.btnConferir.remove();
        this.btnRefazer.remove();
        this.btnLimpar.remove();

        this.feedErro = "Você não possui mais nenhuma tentativa de resposta! Finalizada a Disciplina você poderá verificar a resposta correta comentada, que estará disponível na Biblioteca do curso.";
      }

    }
  }
}