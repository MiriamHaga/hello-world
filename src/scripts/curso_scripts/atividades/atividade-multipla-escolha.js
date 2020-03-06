/**
 * Created by everton.ferreira on 26/04/2017.
 */
function MultiplaEscolha (idQuestContainer, answer, feedAcerto, feedErro, config) {

    //Id do elemento que contem todas as questão da atividade.
    this.idQuestContainer = idQuestContainer;
    this.feedAcerto = feedAcerto || "Parabéns! você acertou todas as alternativas.";
    this.feedErro = feedErro || "Existe(m) uma(s) alternativa(s) incorreta(s)";

    //Resposta da atividade.
    this.answer = answer;
    //variavel de configuração da atividade
    this.configAtv = config;
    //pegando a variavel de scorm do moodle
    this.scorm = window.parent.SCORM || null;

    this.btnConferir = $("#btnConferir");     // Pega o botão de Confirmação da Atividade
    this.btnRefazer = $("#btnRefazer");    // Pega o botão de Refazer
    this.btnLimpar = $("#btnLimpar");
    this.feedback = $("#feedback");     // Mensagem na tela

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

MultiplaEscolha.prototype.declareResetVariables = function __declareResetVariables() {

    completeOnExit = false;
    this.qtdSelect = 0;

    //Elemento que representa a laternativa selecionada.
    this.currentAlter = [];

    //Objeto com todos os elementos que definidos como alternativas.
    this.alternatives = $('#' + this.idQuestContainer + ' li[role=radio]');

    this.btnAlternatives = $('#' + this.idQuestContainer + ' div[role=radio]');
    this.countErros = 0;

    this.maskPopup = $('.mask-popup');
    this.closePopup = $('.close-popup');

    //Códigos das teclas de controle.
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

    this.configAtv.showBtnConferir ? this.btnConferir.show() : this.btnConferir.hide();

    //Configurações iniciais.
    this.init();
};

MultiplaEscolha.prototype.AddEventMultQuestions = function () {

    var i, max = this.idQuestContainer.length, self = this;
    this.alternatives = {};
    for (i = 0; i < max; i++) {

        //Objeto com todos os elementos que definidos como alternativas.
        this.alternatives["p" + i] = $('#' + this.idQuestContainer[i] + ' [role=radio]');

        //Adicionando listeners de click em todas os elementos alternativa.
        this.alternatives["p" + i].bind('click', function (e) {
            e.preventDefault();
            self.onClickAlternatives(e);
        });

        //Adicionando listeners de tecla em todas os elementos alternativa.
        this.alternatives["p" + i].bind('keydown', function (e) { self.onKeyDownAlternatives(e); });

        //Definindo a propriedade "aria-label" para todos os elementos alternativa.
        $.each(this.alternatives["p" + i], function (index, alternative) {
            $(alternative).attr('aria-label', $(alternative).text());
        });
    }
};

/**
 * Configurações iniciais da atividade.
 */
MultiplaEscolha.prototype.init = function __init() {

    //
    var self = this;

    if (this.configAtv.btnConfExist) {
        this.btnConferir.bind('keydown', function (e) { self.onClickBtnCheck(e) });
        this.btnConferir.bind('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            self.onClickBtnCheck(e);
        });
    }//if

    this.btnRefazer.bind('keydown', function (e) { self.onClickbtnRefazer(e); });
    //Adicionando listeners de click nos botões.
    this.btnRefazer.bind('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.onClickbtnRefazer(e);
    });

    this.maskPopup.bind('keydown', function (e) { self.modalClose(e); });
    this.maskPopup.bind('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.modalClose(e);
    });

    this.closePopup.bind('keydown', function (e) { self.modalClose(e); });
    this.closePopup.bind('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.modalClose(e);
    });

    if (this.configAtv.showBtnClear)
        this.btnLimpar.show();

    if (this.configAtv.showBtnConferir)
        this.btnConferir.show();

    this.setEvent();

};//init

/**
 * Libera o botão para o cursista avançar pra proxima tela
 */
MultiplaEscolha.prototype.releaseNextButton = function __releaseNextButton() {

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

/**
 * Adicionand evento nos elemento.
 */
MultiplaEscolha.prototype.setEvent = function (e) {

    var self = this;

    //Apaga o texto de feedback e remove o atributo "role".
    this.feedback.text('').removeAttr('role', 'alert');

    this.btnRefazer.hide();

    if(Array.isArray(this.idQuestContainer)){
        this.AddEventMultQuestions();
        return;
    }

    //CUSTOM - BUTTONS EM VEZ DE LIS
    if(this.btnAlternatives) {
        this.alternatives = this.btnAlternatives;
    }

    //Definindo a propriedade "aria-label" para todos os elementos alternativa.
    $.each(this.alternatives, function (index, alternative) {
        $(alternative).attr('aria-label', $(alternative).text());
    });

    //Adicionando listeners de tecla em todas os elementos alternativa.
    this.alternatives.bind('keydown', function (e) { self.onKeyDownAlternatives(e); });
    //Adicionando listeners de click em todas os elementos alternativa.
    this.alternatives.bind('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.onClickAlternatives(e);
    });

    //CUSTOM - SPANS DENTRO DAS ALTERNATIVAS EM LI
    var spanClicks = $('#' + this.idQuestContainer + ' span');
    spanClicks.bind('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var alt = $(e.target).data('alt');
        $("#alt_"+alt).trigger('click');

    });

};//setEvent

/**
 * Executa o feedback modal
 */
MultiplaEscolha.prototype.modalFeedBack = function __modalFeedBack(feed) {
    // remove todos os filhos do elemento text
    $(".text").children().remove();
    // add feed ao elemento text
    $(".text").append(feed);
    //comando que executa a chamada da pop-up
    Modal.launchWindow();
}//modalFeedBack

/**
 * Remove as opções que estiverem erradas deixando as certas selecionadas
 */
MultiplaEscolha.prototype.onClickBtnErradas = function __onClickBtnErradas(e) {

    var self = this, respCerta = [];

    for (var i = 0; i < this.currentAlter.length; i++) {

        if ($(this.currentAlter[i]).hasClass('feedErrado')) {
            //Remove possíveis feedbacks do texto da pripriedade "aria-label" do elemento selecionado.
            var ariaLabel = $(this.currentAlter[i]).attr('aria-label').replace(' Resposta certa.', '').replace(' Resposta errada.', '');
            this.qtdSelect--;
            //Remove classes css e atualiza propriedades WAI ARIA do elemento.
            $(this.currentAlter[i]).removeClass('ativo feedCerto feedErrado').attr({
                'aria-checked': 'false',
                'aria-label': ariaLabel
            });
        } else {
            respCerta.push(this.currentAlter[i]);
        }//else

    }//for

    this.currentAlter = [];
    this.currentAlter = respCerta;
    this.setEvent();
};//onClickBtnErradas

/**
 * Reinicia a atividade.
 */
MultiplaEscolha.prototype.onClickbtnRefazer = function __onClickbtnRefazer(e) {

    for (var i = 0; i < this.currentAlter.length; i++) {

        //Remove possíveis feedbacks do texto da pripriedade "aria-label" do elemento selecionado.
        var ariaLabel = $(this.currentAlter[i]).attr('aria-label').replace(' Resposta certa.', '').replace(' Resposta errada.', '');

        //Remove classes css e atualiza propriedades WAI ARIA do elemento.
        $(this.currentAlter[i]).removeClass('ativo feedCerto feedErrado').attr({
            'aria-checked': 'false',
            'aria-label': ariaLabel
        });
    }//for

    //Anula o objeto.
    this.currentAlter = [];
    this.qtdSelect = 0;
    this.setEvent();

};//onClickbtnRefazer

/**
 * Removendo elemento selecionado anteriormente
 */
MultiplaEscolha.prototype.removeElemento = function (element) {

    for (var i = 0; i < this.currentAlter.length; i++) {
        //remove se o elemento se ele foi igual o já existente dentro do array
        if (this.currentAlter[i] == element) {
            this.currentAlter.splice(i, 1);
        }//if
    }//for

};//removeElemento

/**
 * Fecha o feedback modal
 */
MultiplaEscolha.prototype.modalClose = function (e) {
    Modal.closeWindow(e);
};//modalClose

/**
 * Comportamento de teclas nas alternativas.
 */
MultiplaEscolha.prototype.onKeyDownAlternatives = function (e) {
    //impede a propagação do evento atual.
    e.stopPropagation();

    //Alternativa selecionada
    var $alternative = $(e.target);

    //Index da alternativa.
    var index = this.alternatives.index($alternative);

    //Alternativa anterior a questão selecionada.
    var prev_alter = this.alternatives[index - 1];

    //Alternativa posterior a questão selecionada.
    var next_alter = this.alternatives[index + 1];

    //Teclas ignoradas no código.
    if (e.altKey || e.shiftKey) return;

    switch (e.keyCode) {
        //Tecla espaço ou o enter de código 13...
        case this.keys.space:
        case this.keys.enter:

            //Não executa as seguintes instruções caso a tecla ctrl esteja pressionada.
            if (e.ctrlkey) return;

            //Executa o método responsável pelo comportamento de seleção de alternativa.
            this.onClickAlternatives(e);
        break;

        //Tecla seta para esquerda ou para cima, foca o elemento anterior a e.target.
        case this.keys.left:
        case this.keys.up:
            prev_alter.focus();
        break;

        //Tecla seta para direita ou para baixo foca o elemento posterior a e.target.
        case this.keys.right:
        case this.keys.down:
            next_alter.focus();
        break;
    }//switch

};//onKeyDownAlternatives


/**
 * Comportamento ao clicar em um elemento.
 */
MultiplaEscolha.prototype.onClickAlternatives = function (e) {

    var self = this;

    if ($(e.target).hasClass('ativo') && this.answer.length > 1) {
        //Se existir um elemento anteriormente selecionado, ele tera a class css ativo removida e aria-checked atualizada com false.
        $(e.target).removeClass('ativo').attr('aria-checked', 'false');
        this.qtdSelect--;
        this.removeElemento(e.target);

    } else if (this.answer.length == 1) {

        //Se existir um elemento anteriormente selecionado, ele tera a class css ativo removida e aria-checked atualizada com false.
        $(this.currentAlter[0]).removeClass('ativo').attr('aria-checked', 'false');
        //Armazena o elemento selecionado e adicionada class css ativo e atualiza aria-checked com true.
        $(e.target).addClass('ativo').attr('aria-checked', 'true');

        this.qtdSelect = 0;
        this.qtdSelect++;
        this.currentAlter = [];
        this.currentAlter.push(e.target);

    } else if (this.qtdSelect < this.answer.length) {
        //Armazena o elemento selecionado e adicionada class css ativo e atualiza aria-checked com true.
        $(e.target).addClass('ativo').attr('aria-checked', 'true')
        this.currentAlter.push(e.target);
        this.qtdSelect++;
    }//else



    if (this.answer.length == this.currentAlter.length) {

        if (this.configAtv.btnConfExist) {
            this.btnConferir.show();
            return;
        }
        self.onClickBtnCheck();

    }

};//onClickAlternatives

/**
* Correção da atividade.
*/
MultiplaEscolha.prototype.onClickBtnCheck = function (e) {

    if(Array.isArray(this.idQuestContainer)){
        this.checkMuitAnswer();
        return;
    }

    this.checkSingleAnswer();

};//onClickBtnCheck


MultiplaEscolha.prototype.checkSingleAnswer = function __checkSingleAnswer() {
    $(this.feedback).attr('opacity', '0');

    //Se alguma atividade foi selecionada.
    if (this.currentAlter.length > 0) {

        this.correto = 0;
        var resp, select_alter, label = "";

        for (var j = 0; j < this.answer.length; j++) {

            select_alter = this.alternatives.index(this.currentAlter[j]) + 1;

            resp = $(this.currentAlter[j]);
            //Armazenando o valor da propriedade aria-label.
            var ariaLabel = resp.attr('aria-label');

            for (var i = 0; i < this.answer.length; i++) {

                if (select_alter == this.answer[i]) {
                    if(this.configAtv.showAnswer)
                        resp.attr('aria-label', ariaLabel + ' Resposta certa.').removeClass('ativo').addClass('feedCerto');
                    else
                        resp.removeClass('ativo');
                    this.correto++;
                }//if

            }//for i

            if (resp.hasClass('ativo')) {
                if(this.configAtv.showAnswer)
                    resp.attr('aria-label', ariaLabel + ' Resposta errada.').removeClass('ativo').addClass('feedErrado');
                else
                    resp.removeClass('ativo');
            }//if

        }//for j

        // //Se a resposta for certa ou errada, tanto a propriedade aria-label quanto o feedback serão atualizados com essa informação.
        if (this.correto == this.answer.length) {

            label = this.feedAcerto;

            if(this.configAtv.blockBtnNext)
                this.releaseNextButton();

            this.setScormStatus(true);

        } else {
            this.setScormStatus(false);
            label = this.feedErro;
        }//else

        //Esconde o botão de corrigir e exibe o de refazer.
        this.btnConferir.hide();
        this.btnRefazer.show();
        this.alternatives.unbind('click').unbind('keydown');

    } else {

        //Se nenhum elemento foi selecionado, o usuario recebe um alerta por feedback.
        this.feedback.text('Selecione uma alternativa.');
    }//else
    this.activeFeed(label, select_alter);
};

MultiplaEscolha.prototype.checkMuitAnswer = function __checkMuitAnswer() {
    $(this.feedback).attr('opacity', '0');
    var id, select_alter, ariaLabel, elem, label = "", self = this;
    //Se alguma atividade foi selecionada.
    if (this.currentAlter.length > 0) {

        this.correto = 0;

        for (var j = 0; j < this.answer.length; j++) {
            //Index da atividade selecionado acrescido em 1.( Por questão de praticidade para o gabarito. )
            // var select_alter = $( this.currentAlter[j] ).attr("data-opcao");
            id = $(this.currentAlter[j]).parent().data("option");

            select_alter = this.alternatives['p' + id].index(this.currentAlter[j]) + 1;

            //Armazenando o valor da propriedade aria-label.
            ariaLabel = $(this.currentAlter[j]).attr('aria-label');

            for (var i = 0; i < this.answer[i].length; i++) {
                elem = $(this.currentAlter[j]);
                id = elem.parent().data("option");
                if (select_alter == this.answer[id][i]) {

                    if(this.configAtv.showAnswer)
                        elem.attr('aria-label', ariaLabel + ' Resposta certa.').removeClass('ativo').addClass('feedCerto');
                    else
                        elem.removeClass('ativo');
                    this.correto++;
                }//if

            }//for i

            if (elem.hasClass('ativo')) {
                elem.attr('aria-label', ariaLabel + ' Resposta errada.').removeClass('ativo').addClass('feedErrado');
            }//if

        }//for j

        //console.log(this.correto, this.answer.length, "fim");
        // //Se a resposta for certa ou errada, tanto a propriedade aria-label quanto o feedback serão atualizados com essa informação.
        if (this.correto == this.answer.length) {

            label = this.feedAcerto;

            if(this.configAtv.blockBtnNext)
                this.releaseNextButton();

            this.setScormStatus(true);
            this.addEventBtnRefazer(true);

        } else {
            this.addEventBtnRefazer(false);
            label = this.feedErro;
            this.setScormStatus(false);
        }//else

        //Esconde o botão de corrigir e exibe o de refazer.
        this.btnConferir.hide();
        this.btnRefazer.show();

        $(".alternativa").unbind('click').unbind('keydown');
    } else {
        //Se nenhum elemento foi selecionado, o usuario recebe um alerta por feedback.
        this.feedback.text('Selecione uma alternativa.');
    }//else

    this.activeFeed(label);
};

MultiplaEscolha.prototype.activeFeed = function __activeFeed(label, alt) {

    if (this.configAtv.feedModal) {
        $(".title-popup").addClass("activeFeed");
        this.modalFeedBack(label);
    } else {
        if(Array.isArray(label)){
            this.feedback.html(label[alt-1]);
        }
        else {
            this.feedback.html(label);
        }
    }//else


    // Anima o alpha do texto de feedback
    this.feedback.animate({opacity: 1}, 1000);
    this.feedback.animate({opacity: 0}, 1000);
    this.feedback.animate({opacity: 1}, 1000);

    //Atualizando a propriedade "role" do elemento com o valor alert. Isso faz o leitor de tela focar no alerta.
    this.feedback.attr('role', 'alert');
};

MultiplaEscolha.prototype.addEventBtnRefazer = function __addEventBtnRefazer(flag) {
    var self = this;
    this.btnRefazer.unbind('click');
    if(!flag){
        this.btnRefazer.bind('click', function (e) {
            e.preventDefault();
            self.onClickBtnErradas(e);
        });
    }else{
        this.btnRefazer.bind('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            self.onClickbtnRefazer(e);
        });
    }

};

/**
 * Remove as opções que estiverem erradas deixando as certas selecionadas
 */
MultiplaEscolha.prototype.onClickBtnErradas = function (e) {

    this.btnRefazer.hide();
    this.feedback.animate({opacity: 0}, 0);

    var self = this, respCerta = [], max = this.currentAlter.length, elem;

    for (var i = 0; i < max; i++) {

        if ($(this.currentAlter[i]).hasClass('feedErrado')) {
            this.countErros++;

            //Remove possíveis feedbacks do texto da pripriedade "aria-label" do elemento selecionado.
            var ariaLabel = $(this.currentAlter[i]).attr('aria-label').replace(' Resposta certa.', '').replace(' Resposta errada.', '');
            this.qtdSelect--;
            //Remove classes css e atualiza propriedades WAI ARIA do elemento.
            $(this.currentAlter[i]).removeClass('ativo feedCerto feedErrado').attr({
                'aria-checked': 'false',
                'aria-label': ariaLabel
            });

            var id = $(this.currentAlter[i]).parent().data("option");

            this.alternatives["p" + id] = $('#' + this.idQuestContainer[id] + ' [role=radio]');

            elem = $(this.alternatives["p" + id]);
            elem.unbind('click').unbind('keydown');

            //Adicionando listeners de click em todas os elementos alternativa.
            elem.bind('click', function (e) {
                e.preventDefault();
                self.onClickAlternatives(e);
            });
            //Adicionando listeners de tecla em todas os elementos alternativa.
            elem.bind('keydown', function (e) { self.onKeyDownAlternatives(e); });

            //Definindo a propriedade "aria-label" para todos os elementos alternativa.
            $.each(this.alternatives["p" + i], function (index, alternative) {
                $(alternative).attr('aria-label', $(alternative).text());
            });

            this.currentAlter.splice(i, 1);
            i = i - 1;
        } else {
            respCerta.push(this.currentAlter[i]);
        }//else

    }//for
};


MultiplaEscolha.prototype.setScormStatus = function __setScormStatus(status) {

    if(this.scorm) {
        //caso usuário acerte todas as questões
        if(status) {
            // SCORM - altera o status da atividade como finalizada
            this.scorm.completePage();

            if (this.configAtv.saveNote) {

                if(!this.configAtv.note) {

                    if(this.countErros < 0) this.countErros = 0;

                    var resp = this.alternatives.length - this.countErros;
                    var media = 10 / this.alternatives.length;
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