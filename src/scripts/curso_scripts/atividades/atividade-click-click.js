/**
 * Created by everton.ferreira on 25/04/2017.
 ** Atividades Acessíveis
 */
function CustomClickClick (draggable, droppable, feedAcerto, feedErro, config) {

    // Inicia algumas propriedades
    this.draggable = draggable;
    this.droppable = droppable;
    this.feedAcerto = feedAcerto || "Parabéns! você acertou todas as atividades!";
    this.feedErro = feedErro || "Existem erros, por favor refaça a atividade!";

    //variavel de configuração da atividade
    this.configAtv = config;
    //pegando a variavel de scorm do moodle
    this.scorm = window.parent.SCORM || null;

    this.btnConferir = $("#btnConferir");     // Pega o botão de Confirmação da Atividade
    this.btnRefazer = $("#btnRefazer");    // Pega o botão de Refazer
    this.btnLimpar = $("#btnLimpar");
    this.feedClick = $("#feedClick");     // Mensagem na tela
    this.clear = $(".clear-quiz");

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

CustomClickClick.prototype.declareResetVariables = function __declareResetVariables() {

    this.countErros = 0;
    this.dragGroup = [];
    this.dropGroup = [];
    this.dropText = [];
    this.dragsResp = [];
    this.dropsResp = [];
    this.dragSelected = null;
    this.dropFull = false;

    this.firstSelection = true;
    this.flagActivityComplete = false;

    //Respostas
    this.answer = [];

    //Guarda apenas o texto que foi selecionado
    this.textDragged = "";

    //Guarda o objeto
    this.currentDrag = "";

    // Código de teclas
    this.keys = {
        enter: 13,
        space: 32,
        left: 37,
        up: 38,
        right: 39,
        down: 40
    };

    // True - Refazer / False - Confirmar Resposta
    this.flagRefazer = false;
    this.flagLimpar = false;
    this.flagConferir = false;

    this.dragGroup = $(this.draggable); // Pega todos os drags que fazem parte da atividade.
    this.dropGroup = $(this.droppable); // Pega todos os drops que fazem parte da atividade.

    //Limpa o texto do feed visual e a label do feed auditivo.
    this.feedClick.text("");

    if(this.configAtv.blockBtnNext) {
        var right = $(".right");
        right.unbind("click").attr('disabled', 'disabled').off('click').addClass('off');
    }

    // Chama a função que inicializa a classe
    this.init();

};

CustomClickClick.prototype.init = function __init() {

    // Guarda uma referência da classe
    var self = this;

    this.btnConferir.bind('keydown', function (e) { self.onKeydownConferir(e) });
    // Adiciona onClick no botão envia
    this.btnConferir.bind('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.onClickConferir(e);
    });

    this.btnRefazer.bind('keydown', function (e) { self.onKeydown(e) });
    // Adiciona onClick no botão refazer
    this.btnRefazer.bind('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.onClick(e);
    });

    this.btnLimpar.bind('keydown', function (e) { self.onKeydown(e) });
    this.btnLimpar.bind('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.onClick(e);
    });

    //Atribui os valores do aria
    this.dropGroup.attr({"aria-dropeffect": "none"});
    this.btnConferir.attr({"aria-disable": "true"});
    this.btnRefazer.attr({"aria-disable": "true"});

    this.setEvents();
    this.setAriaLabel();

    this.configAtv.showBtnConferir ? this.btnConferir.show() : this.btnConferir.addClass('hide-confirm');
    this.configAtv.showBtnClear   ? this.btnLimpar.show()   : this.btnLimpar.hide();
    this.btnRefazer.hide();
};

/**
 * Libera o botão para o cursista avançar pra proxima tela
 */
CustomClickClick.prototype.releaseNextButton = function () {

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

CustomClickClick.prototype.setEvents = function() {

    // Guarda uma referência da classe
    var self = this;

    this.clear.bind('keydown', function (e) { self.clearTable(e); });
    this.clear.bind('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.clearTable(e);
    });

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

CustomClickClick.prototype.clearTable = function(e){
    var elem = $(e.currentTarget), i, j, id, arrElemDrop, arrElemDrag, span;
    id = elem.attr("id");
    arrElemDrop = $("." + id).find('td');
    arrElemDrag = $(".drag" + id.substr(4, 1)).find('span');

    for(i = 0; i < arrElemDrop.length; i++){
        span = $($(arrElemDrop[i]).find('span'));

        if(span.length > 1){
            for(var j = 0, len = span.length; j < len; j++){
                var obj = $(span[j])
                if(obj.hasClass("disabled") && !obj.hasClass("certo")){
                    obj.removeClass("disabled").attr("aria-dropeffect", "copy").empty();
                    this.clearArrayResp(obj, this.dropsResp);
                }
            }
        }else{
            if(span.hasClass("disabled") && !span.hasClass("certo")){
                span.removeClass("disabled").attr("aria-dropeffect", "copy").empty();
                this.clearArrayResp(span, this.dropsResp);
            }
        }
    }

    for(j = 0, len = arrElemDrag.length; j < len; j++){
        span = $(arrElemDrag[j]);
        if(span.hasClass("disabled") && !span.hasClass("ok")){
            span.removeClass("disabled droped").removeAttr("aria-grabbed aria-checked aria-disabled");
            this.clearArrayResp(span, this.dragsResp);
        }
    }

    if ($(".droped").length != this.dropGroup.length) {
        //Muda o atributo
        this.btnConferir.attr({"aria-disable": "true"}).addClass("hide-confirm");
        this.dropFull = false;
    }
};

CustomClickClick.prototype.clearArrayResp = function __clearArrayResp(dragdrop, arrDragdrop) {

    var i, max = arrDragdrop.length;
    console.log(max)
    for(i = 0; i < max; i++){
        if( arrDragdrop[i].option == $(dragdrop[0]).data("option")){
            arrDragdrop.splice(i, 1);
            console.log(arrDragdrop.length)
            break;
        }
    }

};

CustomClickClick.prototype.setAriaLabel = function __setAriaLabel(){

    var i, j, maxDrag = this.dragGroup.length, maxDrop = this.dropGroup.length, elemDrag, elemDrop;

    for (i = 0; i < maxDrag; i++) {
        elemDrag = $(this.dragGroup[i]);
        if(!elemDrag.attr('aria-label'))
            elemDrag.attr('aria-label', elemDrag.text());
    }

    for (j = 0; j < maxDrop; j++) {
        elemDrop = $(this.dropGroup[j]);
        if(!elemDrop.attr('aria-label'))
            elemDrop.attr('aria-label', elemDrop.attr('aria-label').split('-')[0]);
    }

};

CustomClickClick.prototype.onClickConferir = function __onClickConferir(e) {
    this.flagConferir = true;
    this.onClick(e);
};

CustomClickClick.prototype.onKeydownConferir = function __onClickConferir(e) {
    this.flagConferir = true;
    this.onKeydown(e);
};

CustomClickClick.prototype.selectDragClick = function __onClickConferir(e) {
    //Chama a função que realmente seleciona
    this.selectDrag(e);
};

CustomClickClick.prototype.selectDropClick = function __onClickConferir(e) {
    // Chama a função que faz o drop
    this.selectDrop(e);
};

CustomClickClick.prototype.selectDropKeydown = function (e) {

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

CustomClickClick.prototype.onKeydown = function __onKeydown(e) {
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

CustomClickClick.prototype.selectDragKeydown = function __selectDragKeydown(e) {

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

CustomClickClick.prototype.selectDrag = function __selectDrag(e) {

    var elem = $(e.currentTarget);

    //verifica se o target pode ser selecionado
    if (elem.attr("aria-grabbed") != "undefined") {

        this.dragSelected = elem.parent().attr('class').split("text-center ")[1] || elem.parent().attr('class').split("text-center ")[0];
        this.currentDrag = $(this.currentDrag);
        if ($(this.currentDrag) != "") {
            this.currentDrag.removeClass('selected');
        }

        //Pega o texto do target
        this.textDragged = elem.text();
        this.currentDrag = elem;

        //seta valor ao atributo
        this.currentDrag.addClass('selected').attr({"aria-grabbed": true, "aria-checked": true});

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

CustomClickClick.prototype.selectDrop = function __selectDrop(e) {

    var elem = $(e.currentTarget);
    var id = elem.parent().parent().attr('class');

    //verifica se tem algum texto selecionado e se pode dropar o texto na caixa
    if (this.textDragged != "" && elem.attr("aria-dropeffect") != "none" && id.substr(4, 2) == this.dragSelected.substr(4, 2)) {

        this.dragsResp.push({elem: this.currentDrag, option: this.currentDrag.data("option")});
        this.dropsResp.push({elem: elem, option: elem.data("option")});
        this.btnLimpar.show();

        //libera ação do botão limpar
        this.flagLimpar = true;
        //Insere o texto dentro do HTML selecionado, adiciona a classe e altera para que
        //mais nenhum texto possa ser dropado na caixa
        //$(e.target).text( this.textDragged ).addClass('disabled').attr({"aria-dropeffect" : "none"});
        elem.text(this.textDragged).addClass('disabled').attr({"aria-dropeffect": "none"});

        //Altera o atributo para que o texto que já está dropado não possa ser selecionado novamente
        //Remove a classe selected e adiciona outra
        this.currentDrag.removeClass('selected').addClass('disabled droped').attr({
            "aria-grabbed": "undefined",
            "aria-disabled": true
        });

        //Limpa a variável
        this.textDragged = "";
        this.firstSelection = false;
    }

    //Testa se todas as respostas estão preencidas
    if ($(".droped").length == this.dropGroup.length) {
        //Muda o atributo
        this.btnConferir.attr({"aria-disable": "false"}).removeClass("hide-confirm").show();
        this.dropFull = true;
    }

};

CustomClickClick.prototype.onClick = function __onClick(e) {

    // testa se é o primeiro clique
    if (!this.flagRefazer && this.flagConferir) {
        this.flagConferir = false;
        //testa se todos os campos foram dropados
        if (this.dropFull) {
            //esconde botão de limpar
            this.btnLimpar.hide();
            // Troca o botão para refazer
            this.btnConferir.hide();
            this.btnRefazer.show().attr("tabindex", "0");
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

CustomClickClick.prototype.activityComplete = function __activityComplete(){

    //Retira os eventos dos drags e dos drops
    this.dragGroup.unbind('keydown');
    this.dragGroup.unbind('click');

    this.dropGroup.unbind('keydown');
    this.dropGroup.unbind('click');

    this.btnConferir.unbind('click');
    this.btnConferir.unbind('keydown');

    this.btnRefazer.unbind('click');
    this.btnRefazer.unbind('keydown');

    this.btnLimpar.unbind('click');
    this.btnLimpar.unbind('keydown');

    var i, j, maxDrop = this.dropGroup.length, maxDrag = this.dragGroup.length;

    for (i = 0; i < maxDrop; i++) {
        $(this.dropGroup[i]).text("").removeClass("disabled");
    }

    for (j = 0; j < maxDrag; j++) {
        $(this.dragGroup[j]).removeClass("disabled droped");
    }

    this.dragGroup.attr({"aria-grabbed": "none", "aria-disabled": "false"}).removeClass("disabled fix ok droped");
    this.dropGroup.attr({"aria-dropeffect": "none"}).removeClass("certo");
    this.dropGroup.html("");


    //Função chamada para resetar a atividade e iniciar as variáveis
    this.declareResetVariables();
};

CustomClickClick.prototype.clearActivity = function __clearActivity(){
    var i, j, maxDrag = this.dragGroup.length, drag;

    for (i = 0; i < maxDrag; i++) {
        drag = $(this.dragGroup[i]);
        if (!drag.hasClass('ok')) {
            drag.attr('aria-grabbed', 'false').removeClass('disabled droped');
            drag.attr('aria-disabled', 'false');
            drag.attr('aria-checked', 'false');
        }
    }

    for (j = 0; j < this.dragsResp.length; j++) {

        if (!this.dragsResp[j].elem.hasClass('ok')) {
            this.dragsResp.splice(j, 1);
            this.dropsResp.splice(j, 1);
            j--;
        }
    }

    var arrobj = this.dropGroup, drop;

    for (var i = 0; i < arrobj.length; i++) {
        drop = $(arrobj[i]);
        drop.removeClass('errado');
        if (drop.hasClass('disabled') && !drop.hasClass('certo')) {
            drop.text("").removeClass("disabled");
            drop.attr('aria-dropeffect', '');
        }
    }

    this.flagConferir = false;
    this.flagLimpar = false;

    this.configAtv.showBtnConferir ? this.btnConferir.show() : this.btnConferir.addClass('hide-confirm');
    this.configAtv.showBtnClear   ? this.btnLimpar.show()   : this.btnLimpar.hide();
};

CustomClickClick.prototype.redoActivity = function __redoActivity(){

    $(".delete").removeClass('droped');
    //habilita o botão de limpar
    this.btnLimpar.show();
    this.flagConferir = false;
    this.flagLimpar = false;
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
    this.btnConferir.show();
    this.btnRefazer.hide();
    this.btnConferir.attr({"aria-disable": "true"});

    this.setEvents();

    $(this.dropGroup).each(function () {
        var label = $(this).attr("aria-label").split('-')[0];
        $(this).attr("aria-label", label);
    });

    var maxDrop = this.dropGroup.length, drop;

    for (var i = 0; i < maxDrop; i++) {
        drop = $(this.dropGroup[i]);
        if (drop.hasClass('errado')) {
            drop.text("").removeClass("disabled").attr('aria-label', drop.attr('aria-label').split('-')[0]);

            if(this.configAtv.showDica){
                try {
                    var group = $($(drop.parent())[0]).data('group').substr(5, 2);
                    $(".dica" + group).show();
                }catch(e){}
            }

        }else if(drop.hasClass('remover')){
            drop.text("").removeClass("disabled remover").attr({"aria-dropeffect": "copy"}).attr('aria-label', drop.attr('aria-label').split('-')[0]);
        }
    }

    var maxDrag = this.dragGroup.length, drag;

    for (var j = 0; j < maxDrag; j++) {
        drag = $(this.dragGroup[j]);

        if(!drag.hasClass('ok')){
            drag.removeClass("disabled droped").attr({"aria-grabbed": "false"});
        }

        if(!this.configAtv.showAnswer) {
            drag.removeClass("ok");
        }
    }

    $(".errado").attr({"aria-dropeffect": "copy"}).removeClass("errado");
    $(".delete").attr({"aria-grabbed": "false"}).removeAttr("aria-disabled").removeClass("disabled delete");
    $(".fix").removeClass("fix");
    
    this.configAtv.showBtnConferir ? this.btnConferir.show() : this.btnConferir.addClass('hide-confirm');
    this.configAtv.showBtnClear   ? this.btnLimpar.show()   : this.btnLimpar.hide();

};

CustomClickClick.prototype.feedback = function __feedback(e) {
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
        this.feedClick.animate({opacity: 1}, 1000);
        this.feedClick.animate({opacity: 0}, 1000);
        this.feedClick.animate({opacity: 1}, 1000);
        this.feedClick.attr("role", "alert");

    } else {

        this.checkActivity();

        //Conta se existem questões erradas
        if (this.countErros == 0) {
            //Exibe mensagem
            labelFeed = this.feedAcerto
            this.feedClick.text(labelFeed);
            this.flagActivityComplete = true;

            if(this.configAtv.blockBtnNext)
                this.releaseNextButton();
            this.setScormStatus(true);

        } else {

            //Flag necessária para exibição do botão refazer ou conferir.
            this.flagRefazer = true;
            this.flagActivityComplete = false;
            this.setScormStatus(false);

            //Exibe mensage
            labelFeed = this.feedErro// || "Existem erros, por favor refaça a atividade!";
            this.feedClick.text(labelFeed);

        }

        //Anima e adiciona atributo
        this.feedClick.animate({opacity: 1}, 1000).attr("role", "alert");
    }
    
};

CustomClickClick.prototype.checkActivity = function __checkActivity() {

    var drop = null, drag = null, textAux;
    this.countErros = 0;
    //varre as arrays
    for (var i = 0; i < this.dragsResp.length; i++) {

        drop = this.dropsResp[i];
        drag = this.dragsResp[i];

        if(this.configAtv.showAnswer) {

            if (drag.option == drop.option) {

                textAux = drop.elem.attr('aria-label') + "- " + drop.elem.text();
                //remove a classe disabled e adiciona a classe certo
                drop.elem.removeClass('disabled').addClass('certo').attr({"aria-label": textAux});
                drag.elem.addClass("fix").addClass("ok");

                if(this.configAtv.showDica){
                    try {
                        var group = $($(drop.elem).parent()[0]).data("group").substr(5, 2);
                        $(".dica" + group).hide();
                    }catch(e){}
                }

            } else {
                textAux = drop.elem.attr('aria-label') + "- " + drop.elem.text();

                //remove a classe disabled e adiciona a classe certo
                drop.elem.removeClass('disabled').addClass('delete errado').attr({"aria-label": textAux});
                this.countErros++;
                this.dragsResp.splice(i, 1);
                this.dropsResp.splice(i, 1);
                i--;
            }

        }else{

            if (drag.option != drop.option) {
                this.countErros++;
            }

            textAux = drop.elem.attr('aria-label') + "- " + drop.elem.text();
            //remove a classe disabled e adiciona a classe certo
            drop.elem.removeClass('disabled').addClass('remover').attr({"aria-label": textAux});

            textAux = drop.elem.attr('aria-label') + "- " + drop.elem.text();
            //remove a classe disabled e adiciona a classe certo
            drop.elem.removeClass('disabled').addClass('delete remover').attr({"aria-label": textAux});

        }
    }

    if(!this.configAtv.showAnswer) {
        this.dragsResp = [];
        this.dropsResp = [];
    }

};

CustomClickClick.prototype.setScormStatus = function __setScormStatus(status) {

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

            //Flag necessária para exibição do botão refazer ou conferir.
            this.flagRefazer = true;
        }else{

            if (this.configAtv.makeAttempt) this.scorm.makeAttempt(false);

            if(!this.scorm.isActivityLocked())
                this.btnRefazer.show().attr("tabindex", "0");
            else{
                this.btnConferir.remove();
                this.btnRefazer.remove();
                this.btnLimpar.remove();

                this.feedErro = "Você não possui mais nenhuma tentativa de resposta! Finalizada a Disciplina você poderá verificar a resposta correta comentada, que estará disponível na Biblioteca do curso.";
            }

        }
    }
};




