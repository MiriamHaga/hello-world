/**************************************************
 *
 * Atividades Acessíveis
 * EFAP
 *
 * Verdadeiro ou Falso
 *
 **************************************************/

/**
 * Modelo para exercicio de Verdadeiro e Falso
 * @param questao Nome da atividade
 * @param gabarito Array (Gabarito) com as questões corretas
 */
function SelectOption (questao, gabarito, feedIndividual, feed, feedErro, config) {

  // Inicia algumas propriedades
  this.questao = questao;
  this.gabarito = gabarito;
  this.feedIndividual = feedIndividual || false;
  this.feed = feed ? feed : "Parabéns! Você acertou todas as repostas. Caso deseje, clique no botão \"Refazer\" para recomeçar a atividade.";
  this.feedErro = feedErro ? feedErro : "Você errou algumas afirmações! Clique no botão \"Refazer\" e tente novamente.";
  this.classe = config.classe ? config.classe : "ativ_objetiva";

  //variavel de configuração da atividade
  this.configAtv = config;
  //pegando a variavel de scorm do moodle
  this.scorm = window.parent.SCORM || null;

  this.btnConferir = $("#btnConferir");             // Pega o botão de Confirmação da Atividade
  this.btnRefazer = $("#btnRefazer");             // Pega o botão de Refazer
  this.feed_back = $("#feed_back");

  // valida se existe a variavel do scorm do moodle
  if( this.scorm ) {
    //conferindo se o usuário pode refazer atividade
    if(!this.scorm.isActivityLocked()) {
      this.declareResetVariables();
    }else{
      this.btnConferir.remove();
      this.btnRefazer.remove();
    }
  }else{
    this.declareResetVariables();
  }
}

SelectOption.prototype.declareResetVariables = function __declareResetVariables(){

  this.radioGroup = [];

  completeOnExit = false;

  // True - Refazer / False - Confirmar Resposta
  this.flagRefazer = false;
  this.radiosErrados = [];
  this.radiosCertos = [];
  this.allOption = $("." + this.classe).length;
  this.allCheck = 0;
  this.countErros = 0;

  // Código de teclas
  this.keys = {
    enter: 13,
    space: 32,
    left: 37,
    up: 38,
    right: 39,
    down: 40
  };

  //Feeds
  this.feedsCertos = $(".textoFeedCerto");
  this.feedErrados = $(".textoFeedErrado");

  this.feedsCertos.hide();
  this.feedErrados.hide();

  if(this.configAtv.blockBtnNext) {
    this.right = $(".right");
    this.right.unbind("click").attr('disabled', 'disabled').off('click').addClass('off');
  }

  this.configAtv.showBtnConferir ? this.btnConferir.show() : this.btnConferir.hide();
  this.init();

};

/**
 * Libera o botão para o cursista avançar pra proxima tela
 */
SelectOption.prototype.releaseNextButton = function () {

  this.right.click(function (e) {
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

/**
 * Inicializa a classe
 */
SelectOption.prototype.init = function __init() {

  /**
   * Pega o form onde estão as questões, pode qualquer tipo de container, que envolva toda a atividade,
   * uma div por exemplo, mas precisa de uma pequena alteração. Usar sempre esse como referencia para capturar os radios da questão,
   * assim não pega radios de outra atividade que estiver na mesma pagina, por exemplo
   */
  this.form = $("#" + this.questao);
  this.radioGroup = $("#" + this.questao + " span[role=radio]");
  this.altPrefixo = this.questao + "_alt";

  this.insertingAccessibleAttributes();
  this.setEvents();
};

SelectOption.prototype.insertingAccessibleAttributes  = function __setEvents(){
  // Guarda uma referência da classe
  var self = this;

  // Inserção dos atributos de acessibilidade
  $.each($("#" + this.questao + " ." + this.classe), function (i, v) {

    var _alt = self.altPrefixo + (++i),
        _label = "",
        element = $(this);

    element.attr("id", _alt);

    element.find("span[role=radio]").each(function () {
      var elem = $(this);
      var textHtml = elem.text().toLowerCase();
      var arrayId =  textHtml.split(" "),  text = "";

      if(arrayId.length > 1){
        for(var i = 0; i < arrayId.length; i++){
          text += textHtml.split(" ")[i];
        }
      }else {
        text =  textHtml.trim();
      }

      var _id = _alt + "_" + text,
          text = elem.parent().text(),
          prev, next;

      try {
        prev = text[0].trim(),
            next = text[1].trim();
        _label = prev + " " + elem.text() + " " + next;

        if (!elem.attr("aria-label")) {
          elem.attr("aria-label", _label);
        }

      } catch (e) {}

      elem.attr({"id": _id, "tabindex": 0, "aria-checked": false});
    });

  });
};

SelectOption.prototype.setEvents = function __setEvents(){

  // Guarda uma referência da classe
  var self = this;

  // Troca a seleção dos radios
  this.radioGroup.bind('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    self.selectClick(e);
  });

  this.radioGroup.bind('keydown', function (e) { self.selectKeydown(e); });

  // Adiciona onClick no botão envia
  this.btnConferir.bind('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    self.onClick(e)
  });

// Adiciona onClick no botão envia
  this.btnRefazer.bind('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    self.onClick(e)
  });

};

/**
 * Adiciona e remove regras CSS dos radios conforme o click
 * @param e radio selecionado
 */
SelectOption.prototype.selectClick = function (e) {

  var target = $(e.target);

  // Remove do grupo dessa questão
  target.parent().find("span[role=radio]").removeClass('selected').attr({
    "aria-checked": "false",
    "tabindex": "-1"
  });

  // Adiciona a class css no label do radio selecionado
  target.addClass('selected').attr({"aria-checked": "true", "tabindex": "0"});

  //Forçando foco no elemento. Bug no IE/Firefox.
  target.focus();
};

/**
 * Adiciona e remove regras CSS dos radios conforme o click
 * @param e radio selecionado
 *
 * @note: As instruções desse método foram alteradas por Paulo H Inocencio em 24/07/2014.
 * O autor da versão original é desconhecido.
 */

SelectOption.prototype.selectKeydown = function (e) {

  //Elemento selecionado.
  var $radio = $(e.target);

  //Seleciona todos os "radios" visíveis que sem correção.
  var $visibleRadios = $("span[role=radio]:visible").not(".certo");

  //Index de e.target entre os radios armazenados no objeto radioGroup.
  var index = $visibleRadios.index($radio);

  //Armazena o elemento anterior a e.target
  var prev_radio = $visibleRadios[index - 1];

  //Armazena o elemento posterior a e.target
  var next_radio = $visibleRadios[index + 1];

  //Ignora o restante do código caso a tecla alt ou a tecla shift estejam pressionadas. ( o motivo para essa condição é desconhecido )
  if (e.altKey || e.shiftKey) return;

  //Analizando qual tecla foi pressionada após o elemento e.target ser selecionado.
  switch (e.keyCode) {

    //Tecla espaço ou o enter de código 13...
    case this.keys.space:
    case this.keys.enter:

      //Não executa as seguintes instruções caso a tecla ctrl esteja pressionada. ( o motivo para essa condição é desconhecido )
      if (e.ctrlkey) return;

      //Executa o método responsável pelo comportamento de seleção de alternativa.
      this.selectClick(e)

      //impede a propagação do evento atual.
      e.stopPropagation();

      break;

    //Tecla seta para esquerda ou para cima, foca o elemento anterior a e.target.
    case this.keys.left:
    case this.keys.up:
      prev_radio.focus();
      break;

    //Tecla seta para direita ou para baixo foca o elemento posterior a e.target.
    case this.keys.right:
    case this.keys.down:
      next_radio.focus();
      break;

  }
}

/**
* Evento onClick para o botão submit
* Controla as ações de Confirmar resposta / Refazer atividade
* @param {MouseEvents} e Evento de click
*/
SelectOption.prototype.onClick = function __onClick(e) {
  var self = this;    // Guarda uma referência da classe

  if (this.flagRefazer == false) {
    this.allCheck = 0;
    var elem;

    // Percorre os Radios, e verifica se algum qual está checkado
    for (var cont in this.gabarito) {
      elem = $("#" + self.altPrefixo + cont + " span[role=radio]");

      if(elem.length > 1){
        for(var i = 0, len = elem.length; i < len; i++){
          if ($(elem[i]).is("[aria-checked=true]")){
            this.allCheck++;
            break;
          }
        }
      }
      //else{
      //  //Verifica se todos os radios estão checkados, se algum não estiver, atribui false na flag
      //  if (!elem.is("[aria-checked=true]")) {
      //    allCheck = false;
      //    break;
      //  }
      //}

    }

    // Se todos estiverem checkados
    if (this.allOption == this.allCheck) {

      // Troca o botão para refazer
      this.btnConferir.hide();
      this.btnRefazer.show().attr("tabindex", "0");

      // Se todos estiverem checkados, remove o click do evento de seleção
      $(this.radioGroup).unbind('click');
      $(this.radioGroup).unbind('keydown');
      this.feedback(true);
    }else{
      // Envia para a função de feedback
      this.feedback(false);
    }


  } else {
    this.redoActivity();
  }

};

SelectOption.prototype.redoActivity = function __redoActivity() {
  var radios, self = this;
  this.flagRefazer = false; // Atribui a flag de refazer para false;

  // Se houver perguntas erradas, pega apenas os radios das erradas
  if (this.radiosErrados.length > 1) {

    try {
      //Deletando prefixo de Incorrect answer da propriedade aria-label.
      $.each($(".errado"), function (index, value) {
        var _label = $(this).attr("aria-label").replace("Incorrect answer - ", "");
        $(this).attr("aria-label", _label);
      })
    }catch(e){}

    var option, dataGroup;
    for(var i = 0, len = this.radiosErrados.length; i < len; i++){
      option =  $(this.radiosErrados[i]);

      option.show().removeClass('errado').attr({"tabindex": 0, "aria-checked": false}).removeAttr("aria-invalid");

      option.bind('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.selectClick(e);
      }).bind('keydown', function (e) { self.selectKeydown(e); });

      if(this.configAtv.showDica){
        try {
          dataGroup = $(option.parent()).data("group").substr(5, 2);
          $(".dica" + dataGroup).show();
        }catch(e){}
      }

    }

    // Se cair aqui, quer dizer que todos estão checkados e o aluno quer refazer a atividade
  } else {


    radios = this.radioGroup;

    // Remove as regras css que deixam a caixa da pergunta e o texto do label verde
    //$( radios ).parents( ".alternativas" ).removeClass( 'respCorreta' );
    $(radios).removeClass('certo').attr({
      "tabindex": 0,
      "aria-checked": false
    }).removeAttr("aria-invalid").each(function () {
      if($(this).attr("aria-label")) {
        var _label = $(this).attr("aria-label").replace("Right answer - ", "").replace("Incorrect answer - ", "");
        $(this).attr("aria-label", _label);
      }
    });

    this.feedsCertos.hide();
    this.feedErrados.hide();

  }

  //Limpa o texto do feed visual e a label do feed auditivo.
  this.feed_back.html("");

  //Apenas o tabindex o feed auditivo é manipulado.
  this.feed_back.attr("tabindex", "-1");

  //Removendo o atributo de alert.
  this.feed_back.removeAttr("role", "alert");

  // Troca o botão para Confirmar
  this.btnConferir.show();
  this.btnRefazer.hide();

  // Tira o atributo Style do label ( onde está o display :none )
  $(radios).removeAttr('style');

  // Descked dos radios errados (ou o certos, se tiver acertados todos)
  $(radios).attr("aria-checked", false);

  // Reseta o tabindex dos radios para o Verdadeiro
  $(radios).parents(".radios").each(function () {
    $(this).find("span[role=radio]").first().attr("tabindex", 0);
  });

  // Garante que sempre a primeira opção 'V' estará com foco ao refazer a atividade
  $(radios).first().parent().find("[role=radio]").first().focus();

  // Adiciona a class da caixinha atrás dos labels dos radios
  //$( radios ).parents(".radios").addClass('fundo');

  // Coloca o evento de click dos radios, para habilitar a seleção
  $(radios).bind('click', function (e) {
    e.preventDefault();
    self.selectClick(e);
  });
  $(radios).bind('keydown', function (e) { self.selectKeydown(e); });
  // Coloca o evento de keydown nos radios certos, para não quebrar a navegação por setas
  this.radioGroup.parent().find(".correto").bind('keydown', function (e) { self.selectKeydown(e); });

  this.radiosErrados = [];
};


SelectOption.prototype.checkAnswers = function () {

  // Guarda uma referência da classe
  var self = this;

  this.flagRefazer = true;

  for (var cont in this.gabarito) {

    // Pega os radios chekados e não chekados
    var radioSelected = $("#" + self.altPrefixo + cont + " span[aria-checked=true]")[0],
        radiosNoSelected = $("#" + self.altPrefixo + cont + " span[aria-checked=false]"),
        jqRadioSelected = $(radioSelected);

    // Dá um display none no label do radio que não está checkado
    if(this.configAtv.showAnswer )
      $(radiosNoSelected).hide();

    $(radiosNoSelected).parents(".radios").removeClass("fundo");

    var resp = this.gabarito[cont];

    if (jqRadioSelected.text().toLowerCase().trim() == resp.toLowerCase().trim())  {

      if (this.feedIndividual) { $(this.feedsCertos[cont - 1]).show(); }//if

      // Adiciona as regras css que deixam a caixa da pergunta e o texto do label verde
      if (!jqRadioSelected.hasClass("correto")) {

        if(this.configAtv.showAnswer ) jqRadioSelected.addClass('certo');

        if(this.configAtv.showDica){
          try {
            $(".dica" + $(jqRadioSelected.parent()).data("group").substr(5, 2) ).hide();
          }catch(e){}
        }

        jqRadioSelected.removeClass('selected').attr("tabindex", 0).each(function () {

          try {
            //Antes de adicionar o prefixo "Right answer, é necessario remover, se esse existir, o prefixo "Incorrect answer" .
            var _label = $(this).attr("aria-label");
            _label.replace("Incorrect answer - ", "");
            _label = "Right answer - " + _label.replace("Right answer - ", "");
            $(this).attr("aria-label", _label);
          }catch(e){}

        });
        jqRadioSelected.parents(".alternativas").addClass('respCorreta');
      }
    }
    else {

      $(this.feedErrados[cont - 1]).show();
      this.radiosErrados.push(radioSelected);
      this.radiosErrados.push(radiosNoSelected);

      // Adiciona as regras css que deixam a caixa da pergunta e o texto do label vermelho
      jqRadioSelected.removeClass('selected').attr("aria-invalid", "true");
      jqRadioSelected.parents(".alternativas").addClass('respIncorreta');

      if(this.configAtv.showAnswer )jqRadioSelected.addClass('errado');
      this.countErros++;
      try {
        //adicionando o prefixo de "Incorrect answer" na label.
        var _label = jqRadioSelected.attr("aria-label");
        _label.replace("Incorrect answer - ", "");
        _label = "Incorrect answer - " + _label;
        jqRadioSelected.attr("aria-label", _label);
      }catch(e){}
    }

    var len = radioSelected.id.length;
    if (radioSelected.id.substr(len - 1, 1) == 'f') {

      jqRadioSelected.addClass("direita");

    }
  } // For
};


SelectOption.prototype.feedback = function (e) {

  //Define a opacidade do feed visual em 0.
  this.feed_back.show().css("opacity", "0");

  // Se as questões não estiver todas preenchidas, mostra uma mensagem de erro
  if (!e) {
    // Da um feedbak para o aluno selecionar as perguntas
    this.feed_back.html("Selecione uma das opções em cada frase.");

    // Anima o alpha do texto de feedback
    this.feed_back.animate({opacity: 1}, 1000);
    this.feed_back.animate({opacity: 0}, 1000);
    this.feed_back.animate({opacity: 1}, 1000);
  // Se todas foram checkadas
  }else {

    this.checkAnswers();

    // Se não houver pergunta errada, dá um feedback positivo
    if (this.radiosErrados.length == 0) {

      // Da um feedbak para o aluno selecionar as perguntas
      this.feed_back.html(this.feed);

      if(this.configAtv.blockBtnNext)
        this.releaseNextButton();

      this.setScormStatus(true);

    } else {

      this.feed_back.html(this.feedErro);
      this.setScormStatus(false);
    }

  }// Else AllCheck

  this.feed_back.animate({opacity: 1}, 1000);

  this.feed_back.attr("role", "alert");

};// feedback()

SelectOption.prototype.setScormStatus = function __setScormStatus(status) {

  if(this.scorm) {
    //caso usuário acerte todas as questões
    if(status) {
      // SCORM - altera o status da atividade como finalizada
      this.scorm.completePage();

      if (this.configAtv.saveNote) {

        if(!this.configAtv.note) {
          if(this.countErros < 0) this.countErros = 0;
          var max = $("."+ this.classe).length;
          var resp = max - this.countErros;
          var media = 10 / max;
          var nota = media * resp;

          this.scorm.setSCOScore(nota.toFixed(2));
        }else {
          this.scorm.setSCOScore(this.configAtv.note);
        }
      }

      if (this.configAtv.makeAttempt) {
        this.scorm.makeAttempt(true);
        this.btnConferir.remove();
        this.btnRefazer.remove();
      }else{
        this.btnRefazer.show();
      }

      //Flag necessária para exibição do botão refazer ou conferir.
      this.flagRefazer = true;
    }else{

      if (this.configAtv.makeAttempt) this.scorm.makeAttempt(false);

      if(!this.scorm.isActivityLocked())
        this.btnRefazer.show().attr("tabindex", "0");
      else{
        this.btnConferir.remove();
        this.btnRefazer.remove();

        this.feedErro = "Você não possui mais nenhuma tentativa de resposta! Finalizada a Disciplina você poderá verificar a resposta correta comentada, que estará disponível na Biblioteca do curso.";
      }
    }
  }

};
