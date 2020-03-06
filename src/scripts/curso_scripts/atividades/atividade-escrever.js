/**
 * Created by everton.ferreira on 19/01/2017.
 */
/**************************************************
 *
 * Atividades Acessíveis
 * EFAP
 * Escrever
 * Autor: everton.ferreira
 *
 **************************************************/
function Escrever (gabarito, feedAcerto, feedErro, lowerCase, configScorm) {

  this.gabarito = gabarito;
  this.feedAcerto = feedAcerto || "Parabéns! você acertou todas as atividades!";
  this.feedErro = feedErro || "Existem erros, por favor refaça a atividade!";
  this.lowerCase = lowerCase ? lowerCase : false;
  this.configScorm = configScorm;

  //pegando a variavel de scorm do moodle
  this.scorm = window.parent.SCORM || null;

  completeOnExit = false;

  this.btEnvia = $("#btnConferir");     // Pega o botão de Confirmação da Atividade
  this.btRefazer = $("#btnRefazer");    // Pega o botão de Refazer
  this.btnLimpar = $("#btnLimpar");

  // valida se existe a variavel do scorm do moodle
  if( this.scorm ) {
    //conferindo se o usuário pode refazer atividade
    if(!this.scorm.isActivityLocked()) {
      //Função chamada apara iniciar as variáveis e também para resetar quando for jogar novamente
      this.declareResetVariables();
    }else{
      this.removeButtons();
    }
  }else{
    //Função chamada apara iniciar as variáveis e também para resetar quando for jogar novamente
    this.declareResetVariables();
  }
}

Escrever.prototype.declareResetVariables = function () {
  //Contador de respostas
  this.answerCount = 0;
  this.countErros = 0;

  this.firstSelection = true;

  this.activityComplete = false;

  //Respostas
  this.answer = [];

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

  if(this.configScorm.blockBtnNext) {
    var right = $(".right");
    right.unbind("click").attr('disabled', 'disabled').off('click').addClass('off');
  }

  // Chama a função que inicializa a classe
  this.init();
};

Escrever.prototype.init = function () {

  // Guarda uma referência da classe
  var self = this;

  this.dropFull = false;

  this.dragGroup = $(this.draggable); // Pega todos os drags que fazem parte da atividade.
  this.dropGroup = $(this.droppable); // Pega todos os drops que fazem parte da atividade.

  //Guarda os textos
  // this.dropText = $( "#"+ this.droppable + " li.drop" ).text();
  for (var i = 0; i < this.dropGroup.length; i++) {
    this.dropText[i] = $(this.dropGroup[i]).text();
  }

  this.feedClick = $("#feedClick");     // Mensagem na tela
  this.txt = $(".resposta");

  //Limpa o texto do feed visual e a label do feed auditivo.
  this.feedClick.text("");

  this.txt.bind('keyup', function (e) { self.setAriaLabel(e); });

  // Adiciona onClick no botão envia
  this.btEnvia.bind('click', function (e) {
    e.preventDefault();
    self.onClickConferir(e)
  });
  this.btEnvia.bind('keydown', function (e) { self.onKeydownConferir(e) });

  // Adiciona onClick no botão refazer
  this.btRefazer.bind('click', function (e) {
    e.preventDefault();
    self.onClick(e)
  });
  this.btRefazer.bind('keydown', function (e) { self.onKeydown(e) });

  this.btnLimpar.bind('click', function (e) {
    e.preventDefault();
    self.onClickLimpar(e)
  });
  this.btnLimpar.bind('keydown', function (e) { self.onKeydownLimpar(e) });

  //Atribui os valores do aria
  $(this.dropGroup).attr({"aria-dropeffect": "none"});
  $(this.btEnvia).attr({"aria-disable": "true"});
  $(this.btRefazer).attr({"aria-disable": "true"});

  // Troca o botão para Confirmar
  this.btRefazer.hide();

  this.configScorm.showBtnConferir ? this.btEnvia.show() : this.btEnvia.hide();
  this.configScorm.showBtnClear    ? this.btnLimpar.show() : this.btnLimpar.hide();
};

/**
 * Libera o botão para o cursista avançar pra proxima tela
 */
Escrever.prototype.releaseNextButton = function () {

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

Escrever.prototype.setAriaLabel = function (e) {
  var element = $(e.currentTarget)
  element.attr('aria-label', element.val());
  this.checkInputWrite();
};

Escrever.prototype.checkInputWrite = function () {

  var i, count = 0, max = this.txt.length;
  for (i = 0; i < max; i++) {
    if ($(this.txt[i]).val() != "") {
      count++;
    }
  }

  if (count == this.gabarito.length) {
    this.btEnvia.show();
  } else {
    this.btEnvia.hide();
    this.btnLimpar.show();
  }

};

Escrever.prototype.onClickConferir = function (e) {
  this.flagConferir = true;
  this.onClick(e)
};

Escrever.prototype.onKeydownConferir = function (e) {
  this.flagConferir = true;
  this.onKeydown(e)
};

Escrever.prototype.onClickLimpar = function (e) {
  this.flagLimpar = true;
  this.onClick(e)
};

Escrever.prototype.onKeydownLimpar = function (e) {
  this.flagLimpar = true;
  this.onKeydown(e)
};

Escrever.prototype.onClick = function (e) {

  //Guarda a referência da classe
  var element, self = this;

  // testa se é o primeiro clique
  if (!this.flagRefazer && this.flagConferir) {
    this.flagConferir = false;
    //testa se todos os campos foram dropados

    //esconde botão de limpar
    this.btnLimpar.hide();
    // Troca o botão para refazer
    this.btEnvia.hide();
    this.btRefazer.show().attr("tabindex", "0");
    //Muda os atributos dos botões
    $(this.btEnvia).attr({"aria-disable": "true"});
    $(this.btRefazer).attr({"aria-disable": "false"});

    //Chama a função de feed
    this.feedback(true);

  } else {

    if (this.activityComplete == true) {

      // Adiciona onClick no botão envia
      for (var i = 0; i < this.txt.length; i++) {
        $(this.txt[i]).attr('aria-label', '').val("").removeClass('disabled certo errado').removeAttr('disabled');
      }

      this.activityComplete = false;
      this.feedClick.hide();
      this.btEnvia.hide();
      this.btRefazer.hide();

      this.flagConferir = false;
      this.flagLimpar = false;
      this.flagRefazer = false;

    } else if (!this.flagRefazer && this.flagLimpar) {

      for (var i = 0; i < this.txt.length; i++) {
        element = $(this.txt[i]);
        if (!element.hasClass('disabled'))
          element.attr('aria-label', '').val("").removeClass('disabled errado').removeAttr('disabled');
      }

      this.answerCount = $(".disabled").length;
      this.flagConferir = false;
      this.flagLimpar = false;
      this.btnLimpar.hide();

    } else if (this.flagRefazer) {

      //habilita o botão de limpar
      this.btnLimpar.show();
      this.flagConferir = false;
      this.flagLimpar = false;
      this.flagRefazer = false; // Atribui a flag de refazer para false;

      for (var j = 0; j < this.gabarito.length; j++) {
        element = $(this.txt[j]);
        if (element.val().trim() != this.gabarito[j].trim()) {
          element.attr('aria-label', '').val("").removeAttr('disabled').removeClass('disabled').removeClass("errado");
        }
      }

      this.countErros = 0;
      this.answerCount = $(".disabled").length;
      //Limpa o texto do feed visual e a label do feed auditivo.
      this.feedClick.text("");

      //Apenas o tabindex o feed auditivo é manipulado.
      this.feedClick.attr("tabindex", "-1");

      //Removendo o atributo de alert.
      this.feedClick.removeAttr("role", "alert");

      this.btRefazer.hide();
      $(this.btEnvia).attr({"aria-disable": "true"});
      this.btEnvia.hide();

    }

  }

};

Escrever.prototype.onKeydown = function (e) {
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

Escrever.prototype.feedback = function (e) {
  //Guarda a referência da classe
  var self = this;

  //Define a opacidade do feed visual em 0.
  this.feedClick.show().css("opacity", "0");

  //testa se todos os campos foram dropados
  if (!e) {

    // Da um feedbak para o aluno selecionar as perguntas
    this.feedClick.text("Ainda existem campos que não foram relacionados na atividade!");

    //Flag necessária para exibição do botão refazer ou conferir.
    this.flagRefazer = false
    this.activityComplete = false;

    // Anima o alpha do texto de feedback
    this.feedClick.animate({opacity: 1}, 1000);
    this.feedClick.animate({opacity: 0}, 1000);
    this.feedClick.animate({opacity: 1}, 1000);
    this.feedClick.attr("role", "alert");

  } else {

    this.checkActivity();

    //Conta se existem questões erradas
    if (this.countErros == 0) {
      //Exibe mensagem
      this.feedClick.text(this.feedAcerto);
      this.activityComplete = true;
      this.releaseNextButton();

      this.setScormStatus(true);

      //Flag necessária para exibição do botão refazer ou conferir.
      this.flagRefazer = true

    } else {
      //Exibe mensage
      this.feedClick.text(this.feedErro);

      //Flag necessária para exibição do botão refazer ou conferir.
      this.flagRefazer = true;
      this.activityComplete = false;

      this.setScormStatus(false);
    }

    //Anima e adiciona atributo
    this.feedClick.animate({opacity: 1}, 1000).attr("role", "alert");
  }

};

Escrever.prototype.checkActivity = function __checkActivity() {
  var element, resposta, gabarito;

  //varre as arrays
  for (var i = 0; i < this.gabarito.length; i++) {
    element = $(this.txt[i]);

    resposta = this.lowerCase ? element.val() : element.val().toLocaleLowerCase();
    gabarito = this.lowerCase ? this.gabarito[i] : this.gabarito[i].toLocaleLowerCase();

    if (resposta.trim() == gabarito.trim()) {
      element.attr('disabled', 'disabled').addClass('disabled').removeClass('errado');

      if(this.configScorm.showAnswer)
        element.addClass('certo');

    } else {
      this.countErros++;

      element.attr('disabled', 'disabled').addClass('disabled');
      if(this.configScorm.showAnswer)
        element.addClass('errado');
    }
  }
};

Escrever.prototype.removeButtons = function __removeButtons() {
  this.btEnvia.remove();
  this.btRefazer.remove();
  this.btnLimpar.remove();
};

Escrever.prototype.setScormStatus = function __setScormStatus(status) {

  if(this.scorm) {
    //caso usuário acerte todas as questões
    if(status) {
      // SCORM - altera o status da atividade como finalizada
      this.scorm.completePage();

      if (this.configScorm.saveNote) {

        if(!this.configScorm.note) {
          if(this.countErros < 0) this.countErros = 0;
          var resp = this.txt.length - this.countErros;
          var media = 10 / this.txt.length;
          var nota = media * resp;

          this.scorm.setSCOScore(nota.toFixed(2));
        }else {
          this.scorm.setSCOScore(this.configScorm.note);
        }
      }

      if (this.configScorm.makeAttempt) {
        this.scorm.makeAttempt(true);
        this.removeButtons();
      }else{
        this.btRefazer.show();
      }

      //Flag necessária para exibição do botão refazer ou conferir.
      this.flagRefazer = true;
    }else{

      if (this.configScorm.makeAttempt)
        this.scorm.makeAttempt(false);

      if(!this.scorm.isActivityLocked())
        this.btRefazer.show().attr("tabindex", "0");
      else{
        this.removeButtons();
        this.feedErro = "Você não possui mais nenhuma tentativa de resposta! Finalizada a Disciplina você poderá verificar a resposta correta comentada, que estará disponível na Biblioteca do curso.";
        this.feedClick.text(this.feedErro);
      }

    }
  }
};