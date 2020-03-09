/**
 * Created by everton.ferreira on 26/04/2017.
 */
function columnAssociation (draggable, droppable, gabarito, feedAcerto, feedErro, config) {

    this.draggable = draggable;
    this.droppable = droppable;
    this.gabarito = gabarito;
    this.feedAcerto = feedAcerto || "Parabéns! você acertou todas as atividades!";
    this.feedErro = feedErro || "Existem erros, por favor refaça a atividade!";

    //variavel de configuração da atividade
    this.configAtv = config;
    //pegando a variavel de scorm do moodle
    this.scorm = window.parent.SCORM || null;

    this.btnConferir = $("#btnConferir");     // Pega o botão de Confirmação da Atividade
    this.btnRefazer = $("#btnRefazer");    // Pega o botão de Refazer
    this.btnLimpar = $(".btn-limpar-quiz");
    this.feedClick = $("#feedClick");     // Mensagem na tela
    this.removerOption = $(".remover-option");

    // valida se existe a variavel do scorm do moodle
    if( this.scorm ) {
        //conferindo se o usuário pode refazer atividade
        if(!this.scorm.isActivityLocked()) {
            this.declareResetVariables();
        }else{
            this.btnConferir.remove();
            this.btnRefazer.remove();
            this.btnLimpar.remove();
        }
    }else{
        this.declareResetVariables();
    }

}

columnAssociation.prototype.declareResetVariables = function __declareResetVariables() {

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

    if(this.configAtv.blockBtnNext) {
        var right = $(".right");
        right.unbind("click").attr('disabled', 'disabled').off('click').addClass('off');
    }

    // Chama a função que inicializa a classe
    this.init();

};

columnAssociation.prototype.init = function __init() {
// Guarda uma referência da classe
    var self = this;

    this.dropFull = false;

    this.dragGroup = $("#" + this.draggable + " li[role=listitem]"); // Pega todos os drags que fazem parte da atividade.
    this.dropGroup = $("#" + this.droppable + " li.drop"); // Pega todos os drops que fazem parte da atividade.

    //Guarda os textos
    // this.dropText = $( "#"+ this.droppable + " li.drop" ).text();
    for (var i = 0; i < this.dropGroup.length; i++) {
        this.dropText[i] = $(this.dropGroup[i]).text();
    }

    //Limpa o texto do feed visual e a label do feed auditivo.
    this.feedClick.text("");

    // Adiciona onClick no botão envia
    this.btnConferir.bind('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.onClickConferir(e)
    });
    this.btnConferir.bind('keydown', function (e) { self.onKeydownConferir(e) });

    // Adiciona onClick no botão refazer
    this.btnRefazer.bind('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.onClick(e)
    });
    this.btnRefazer.bind('keydown', function (e) { self.onKeydown(e) });

    this.btnLimpar.bind('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.onClick(e)
    });
    this.btnLimpar.bind('keydown', function (e) { self.onKeydown(e) });

    if(this.removerOption){

        this.removerOption.bind('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            self.removeAnOption(e)
        });

        this.removerOption.bind('keydown', function (e) { self.removeAnOption(e) });
    }


    //Atribui os valores do aria
    this.dropGroup.attr({"aria-dropeffect": "none"});
    this.btnConferir.attr({"aria-disable": "true"});
    this.btnRefazer.attr({"aria-disable": "true"});


    this.configAtv.showBtnConferir ? this.btnConferir.show() : this.btnConferir.addClass('hide-confirm');
    this.configAtv.showBtnClear   ? this.btnLimpar.show()   : this.btnLimpar.hide();
    this.btnRefazer.hide();

    this.setEvents();
    this.setAriaLabel();

    if(this.configAtv.flagSplitTwoColumns) {
        this.splitTwoColumns("prev");

        $(".btn-proximo").bind('keydown', function (e) { self.splitTwoColumns("next"); });

        $(".btn-proximo").bind('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            self.splitTwoColumns("next");
        });

        $(".btn-voltar").bind('keydown', function (e) { self.splitTwoColumns("prev"); });

        $(".btn-voltar").bind('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            self.splitTwoColumns("prev");
        });
    }else{
        $(".btn-voltar").hide();
        $(".btn-proximo").hide();
    }
};

columnAssociation.prototype.removeAnOption = function __removeAnOption(e) {

    $(e.currentTarget).addClass("disabled-remove");

    var id = $(e.currentTarget).data("option");
    var drop = $("#drop_" + id);
    var idDrag = drop.find("span").html();

    drop.find("span").empty().removeClass("disabled").attr("aria-dropeffect", "copy");
    drop.removeClass("disabled").attr("aria-dropeffect", "copy");

    $("#drag_" + idDrag).removeClass("disabled").attr({"aria-grabbed": false, "aria-checked": false, "aria-disabled": false});

    this.answerCount--;
    this.btnConferir.attr({"aria-disable": "true"}).addClass('disebled-check');
    this.dropFull = false;

};

columnAssociation.prototype.setAriaLabel = function __setAriaLabel() {

    this.dragGroup.each(function () {
        $(this).attr('aria-label', $(this).text());
    });

    this.dropGroup.each(function () {
        $(this).attr('aria-label', $(this).text());
    });

};

columnAssociation.prototype.splitTwoColumns = function __splitTwoColumns(type) {

    var i, max, half = this.dragGroup.length / 2;


    if( type == "next" ){
        i = 0;
        max = half;
    }else{
        i = half;
        max = this.dragGroup.length;
    }
    this.dragGroup.show();
    this.dropGroup.show();

    for(i; i < max; i++){
        $(this.dragGroup[i]).hide();
        $(this.dropGroup[i]).hide();
    }

};

columnAssociation.prototype.setEvents = function __setEvents() {

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
};

columnAssociation.prototype.onClickConferir = function (e) {
    this.flagConferir = true;
    this.onClick(e)
};

columnAssociation.prototype.onKeydownConferir = function (e) {
    this.flagConferir = true;
    this.onKeydown(e)
};

columnAssociation.prototype.selectDragClick = function (e) {
    //Chama a função que realmente seleciona
    this.selectDrag(e);
};

columnAssociation.prototype.selectDropClick = function (e) {
    // Chama a função que faz o drop
    this.selectDrop(e);
};

columnAssociation.prototype.selectDragKeydown = function __selectDragKeydown(e) {

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
};

columnAssociation.prototype.selectDropKeydown = function __selectDropKeydown(e) {

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
};

columnAssociation.prototype.selectDrag = function __selectDrag(e) {

    //verifica se o target pode ser selecionado
    if ($(e.currentTarget).attr("aria-grabbed") != "undefined") {

        if ($(this.currentDrag) != "") {
            $(this.currentDrag).removeClass('selected');
        }

        //Pega o texto do target
        //this.textDragged = $( e.target ).text()
        this.textDragged = $($(e.currentTarget).children()[0]).text();
        this.currentDrag = $(e.currentTarget);

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

columnAssociation.prototype.selectDrop = function __selectDrop(e) {

    //verifica se tem algum texto selecionado e se pode dropar o texto na caixa
    if (this.textDragged != "" && $(e.currentTarget).attr("aria-dropeffect") != "none") {

        var element = $(e.currentTarget);
        var id = element.attr("id").substr(5, 1);

        $("#remove" + id).removeClass("disabled-remove");

        //libera ação do botão limpar
        this.flagLimpar = true;
        this.btnLimpar.css('display', 'inline-block');
        //Insere o texto dentro do HTML selecionado, adiciona a classe e altera para que
        //mais nenhum texto possa ser dropado na caixa
        //$(e.target).text( this.textDragged ).addClass('disabled').attr({"aria-dropeffect" : "none"});
        element.addClass('disabled').attr("aria-dropeffect", "none");
        $(element.children()[0]).text(this.textDragged).addClass('disabled').attr({"aria-dropeffect": "none"});

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
        this.answer[$(e.currentTarget).attr("id").substr(5, 2) - 1] = $(this.currentDrag).attr("id");
        this.answerCount++;
    }
    
    //Testa se todas as respostas estão preencidas
    if (this.answerCount == this.gabarito.length) {
        //Muda o atributo
        this.btnConferir.attr({"aria-disable": "false"}).removeClass('disebled-check');
        this.dropFull = true;
    }
};

columnAssociation.prototype.onKeydown = function __onKeydown(e) {
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

/**
 * Libera o botão para o cursista avançar pra proxima tela
 */
columnAssociation.prototype.releaseNextButton = function __releaseNextButton() {

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

columnAssociation.prototype.onClick = function __onClick(e) {

    // testa se é o primeiro clique
    if (!this.flagRefazer && this.flagConferir) {
        this.flagConferir = false;
        //testa se todos os campos foram dropados
        if (this.dropFull) {

            this.removerOption.addClass("disabled-remove");
            //esconde botão de limpar
            this.btnLimpar.hide();
            // Troca o botão para refazer
            this.btnConferir.hide();
            this.btnRefazer.css('display', 'inline-block').attr("tabindex", "0");
            //Muda os atributos dos botões
            this.btnConferir.attr({"aria-disable": "true"});
            this.btnRefazer.attr({"aria-disable": "false"});

            //Retira os eventos dos drags e dos drops
            this.dragGroup.unbind('keydown');
            this.dragGroup.unbind('click');
            this.dropGroup.unbind('keydown');
            this.dropGroup.unbind('click');
        }

        //Chama a função de feed
        this.feedback(this.dropFull);

    } else {

        if (this.flagActivityComplete) {

            this.activityComplete();

        } else if (!this.flagRefazer && this.flagLimpar) {

            this.clearActivity();

        } else if (this.flagRefazer) {

            this.redoActivity();

        }
    }
};

columnAssociation.prototype.activityComplete = function __activityComplete(){
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

    var arrobj = $("#containerDrop > .drop");

    for (var i = 0; i < arrobj.length; i++) {
        // $(arrobj[i]).text(this.dropText[i])
        $($(arrobj[i]).children()[0]).text("").removeClass("disabled");
    }

    $(this.dragGroup).attr({"aria-grabbed": "none", "aria-disabled": "false"}).removeClass("disabled fix");
    $(this.dropGroup).attr({"aria-dropeffect": "none"}).removeAttr("aria-label").removeClass("certo");
    //Função chamada apara iniciar as variáveis e também para resetar quando for jogar novamente
    this.declareResetVariables();
};

columnAssociation.prototype.clearActivity = function __clearActivity(){

    this.removerOption.addClass("disabled-remove");

    var arrDrag = this.dragGroup, drag;

    for (var i = 0; i < arrDrag.length; i++) {
        drag = $(arrDrag[i]);
        if(this.configAtv.showAnswer ) {
            if (!drag.hasClass('ok')) {
                drag.attr({
                    'aria-grabbed': 'false',
                    'aria-disabled': 'false',
                    'aria-checked': 'false'
                }).removeClass('disabled');
            }
        }else{
            drag.attr({
                'aria-grabbed': 'false',
                'aria-disabled': 'false',
                'aria-checked': 'false'
            }).removeClass('disabled');
        }
    }

    var arrobj = this.dropGroup, drop;

    for (var j = 0; j < arrobj.length; j++) {
        drop = $(arrobj[j]);

        if(this.configAtv.showAnswer ){
            drop.removeClass('errado');
            if ($(drop.children()[0]).hasClass('disabled') && !drop.hasClass('certo')) {
                $(drop.children()[0]).text("").removeClass("disabled");
                drop.attr({"aria-dropeffect": "copy"}).removeClass("disabled");
            }
        }else{
            $(drop.children()[0]).text("").removeClass("disabled");
            drop.attr({"aria-dropeffect": "copy"}).removeClass("disabled");
        }
    }
    this.answerCount = $(".certo").length;
    this.flagConferir = false;
    this.flagLimpar = false;
    this.configAtv.showBtnClear   ? this.btnLimpar.show()   : this.btnLimpar.hide();

};

columnAssociation.prototype.redoActivity = function __redoActivity(){

    this.flagConferir = false;
    this.flagLimpar = false;
    this.flagRefazer = false; // Atribui a flag de refazer para false;

    this.dropFull = false;
    this.countErros = 0;
    this.answerCount = $(".certo").length;
    //Limpa o texto do feed visual e a label do feed auditivo.
    this.feedClick.text("");

    //Apenas o tabindex o feed auditivo é manipulado.
    this.feedClick.attr("tabindex", "-1");

    //Removendo o atributo de alert.
    this.feedClick.removeAttr("role", "alert");

    this.btnRefazer.hide();
    this.btnConferir.attr({"aria-disable": "true"});

    this.setEvents();

    $(this.dropGroup).each(function () {
        var label = $(this).attr("aria-label").replace("Incorrect answer - ", "");
        $(this).attr("aria-label", label);
    });

    var arrDrag = this.dragGroup;

    for (var i = 0; i < arrDrag.length; i++) {
        if(this.configAtv.showAnswer ) {
            if (!$(arrDrag[i]).hasClass('ok')) {
                $(arrDrag[i]).removeClass("disabled");
            }
        }else{
            $(arrDrag[i]).removeClass("disabled").attr({'aria-grabbed': false, 'aria-checked': false}).removeAttr('aria-disabled');
        }
    }

    var arrDrop = this.dropGroup, drop;

    for (var j = 0; j < arrDrop.length; j++) {
        drop = $(arrDrop[j]);

        if(this.configAtv.showAnswer ) {
            if (drop.hasClass('errado')) {
                //(arrobj[i]).text(this.dropText[i])
                $(drop.children()[0]).text("").removeClass("disabled");
            }
        }else{
            $(drop.children()[0]).text("").removeClass("disabled").attr('aria-dropeffect', 'copy');
            drop.removeClass("disabled").attr('aria-dropeffect', 'copy');
        }
    }

    $("#containerDrop .errado").attr({"aria-dropeffect": "copy"}).removeClass("errado");
    $("#containerDrag .delete").attr({"aria-grabbed": "false"}).removeAttr("aria-disabled").removeClass("disabled delete");
    $("#containerDrag .fix").removeClass("fix");

    this.configAtv.showBtnConferir ? this.btnConferir.show() : this.btnConferir.addClass('disebled-check');
    this.configAtv.showBtnClear   ? this.btnLimpar.show()   : this.btnLimpar.hide();

};

columnAssociation.prototype.feedback = function __feedback(e) {
    //Guarda a referência da classe
    var self = this;
    var labelFeed;
    //Define a opacidade do feed visual em 0.
    this.feedClick.show().css("opacity", "0");

    //testa se todos os campos foram dropados
    if (!e) {

        labelFeed = "Ainda existem campos que não foram relacionados na atividade!";

        // Da um feedbak para o aluno selecionar as perguntas
        this.feedClick.text("");
        this.feedClick.text(labelFeed);

        //Flag necessária para exibição do botão refazer ou conferir.
        this.flagRefazer = false;
        this.flagActivityComplete = false;

        // Anima o alpha do texto de feedback
        this.feedClick.animate({opacity: 1}, 1000);
        this.feedClick.animate({opacity: 0}, 1000);
        this.feedClick.animate({opacity: 1}, 1000);
        this.feedClick.attr("role", "alert");

    } else {
        this.checkActivity();
        //Conta se existem questões erradas
        if (this.countErros == 0) {

            
            this.flagActivityComplete = true;

            //Flag necessária para exibição do botão refazer ou conferir.
            this.flagRefazer = true

            if(this.configAtv.blockBtnNext)
                this.releaseNextButton();
            this.setScormStatus(true);

            var labelFeed = this.feedAcerto;

        } else {

            //Flag necessária para exibição do botão refazer ou conferir.
            this.flagRefazer = true;
            this.flagActivityComplete = false;

            this.setScormStatus(false);

            var labelFeed = this.feedErro;

        }
        this.btnConferir.addClass("disebled-check");

        if(!this.scorm){
            this.feedClick.empty();
            this.feedClick.append(labelFeed);
            //Anima e adiciona atributo
            this.feedClick.animate({opacity: 1}, 1000).attr("role", "alert");
        }
    }

};

columnAssociation.prototype.checkActivity = function __checkActivity() {

    var textAux, drop;

    //varre as arrays
    for (var i = 0; i < this.answer.length; i++) {
        drop = $("#drop_" + ( i + 1 ));
        //testa se as respostas são equivalentes com o gabarito
        if (this.answer[i] == this.gabarito[i]) {

            if(this.configAtv.showAnswer) {

                textAux = "resposta correta - " + drop.text();

                //remove a classe disabled e adiciona a classe certo
                drop.removeClass('disabled').addClass('certo').attr({"aria-label": textAux});
                $("#" + this.answer[i]).addClass("fix").addClass("ok");

            }else{
                drop.removeClass('disabled');
            }

        } else {

            if(this.configAtv.showAnswer) {

                textAux = "resposta incorreta - " + drop.text();

                //remove a classe disabled e adiciona a classe certo
                drop.removeClass('disabled').addClass('errado').attr({"aria-label": textAux});
                $("#" + this.answer[i]).addClass("delete");
            }else{
                drop.removeClass('disabled');
            }

            //retira da array a resposta correta
            this.answer[i] = "";
            this.countErros++;
        }
    }

    this.answerCount -= this.countErros;
}

columnAssociation.prototype.setScormStatus = function __setScormStatus(status) {

    if(this.scorm) {
        //caso usuário acerte todas as questões
        if(status) {
            // SCORM - altera o status da atividade como finalizada
            this.scorm.completePage();

            if (this.configAtv.saveNote) {

                if(!this.configAtv.note) {
                    if(this.countErros < 0) this.countErros = 0;
                    var resp = this.dropGroup.length - this.countErros;
                    var media = 10 / this.dropGroup.length;
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
                this.btnLimpar.remove();
            }else{
                this.btnRefazer.show();
            }
						//Exibe mensagem
            var labelFeed = this.feedAcerto; //|| "Parabéns você acertou todas as atividades!";
            //Flag necessária para exibição do botão refazer ou conferir.
            this.flagRefazer = true;
        }else{

            if (this.configAtv.makeAttempt) this.scorm.makeAttempt(false);

            if(!this.scorm.isActivityLocked()){
                this.btnRefazer.show().attr("tabindex", "0");
                var labelFeed = this.feedErro;
            }else{
                this.btnConferir.remove();
                this.btnRefazer.remove();
                this.btnLimpar.remove();

                this.feedErro = this.configAtv.feedback || "Infelizmente sua resposta está incorreta e você não possui mais nenhuma tentativa para refaze-la! Finalizada a Disciplina você poderá verificar a resposta correta comentada, que estará disponível na Biblioteca do curso. <span style='color: red'> Anote suas respostas para comparar posteriormente com o gabarito.</span>";
                var labelFeed = this.feedErro;
            }


        }

        this.feedClick.empty();
        this.feedClick.append(labelFeed);
        //Anima e adiciona atributo
        this.feedClick.animate({opacity: 1}, 1000).attr("role", "alert");

    }

};