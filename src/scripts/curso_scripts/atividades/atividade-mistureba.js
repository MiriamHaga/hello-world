/**
 * Created by everton.ferreira on 22/05/2017.
 */
function AtividadeMistureba(configAtv, configScorm, feedAcerto){

    this.feedAcerto = feedAcerto;
    //variavel de configuração da atividade
    this.configAtv = configAtv;
    //variavel de configuração do escorm
    this.configScorm = configScorm;
    //pegando a variavel de scorm do moodle
    this.scorm = window.parent.SCORM || null;

    this.declareResetVariables();
}

AtividadeMistureba.prototype.declareResetVariables = function __declareResetVariables(){

    this.arrSilabas = [];
    this.buttonsWrapper = $("#buttons-wrapper");
    this.btnClear = $("#clean");
    this.respLabel = $(".check-answers");
    this.feedback = $("#feedback");
    this.elementAnswer = [];
    this.answer = "";
    this.silaba = "";
    this.btns = null;
    this.countAnswer = 0;
    this.maxConfigAtiv = this.configAtv.length;
    this.uniqueRandoms = [];

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

    this.createArrElements();
};

AtividadeMistureba.prototype.createArrElements = function __createElements(){

    var i, j, maxI = this.configAtv.length, elem;

    for(i = 0; i < maxI; i++){
        elem = this.configAtv[i].silabas.split("-");
        for(j = 0; j < elem.length; j++){
            this.arrSilabas.push(elem[j]);
        }
    }

    this.createElements();
};

AtividadeMistureba.prototype.createElements = function __createElements(){

    var i, max = this.arrSilabas.length, elem, btn = "";
    for(i = 0; i < max; i++){
        elem = this.arrSilabas[this.makeUniqueRandom(max)];
        btn += '<button tabindex="0" class="btnQuizPalavras" data-content="'+ elem +'" aria-label="'+ elem +'">'+ elem +'</button>'
    }

    this.buttonsWrapper.append(btn);

    if( this.scorm ) {
        //conferindo se o usuário pode refazer atividade
        if(!this.scorm.isActivityLocked()) {
            this.setEventsBtns();
        }
    }else{
        this.setEventsBtns();
    }

};

AtividadeMistureba.prototype.makeUniqueRandom = function __makeUniqueRandom(numRandoms){
    // refill the array if needed
    if (!this.uniqueRandoms.length) {
        for (var i = 0; i < numRandoms; i++) {
            this.uniqueRandoms.push(i);
        }
    }
    var index = Math.floor(Math.random() * this.uniqueRandoms.length);
    var val = this.uniqueRandoms[index];

    // now remove that value from the array
    this.uniqueRandoms.splice(index, 1);

    return val;
};

AtividadeMistureba.prototype.setEventsBtns = function __setEventsBtns(){
    // Guarda uma referência da classe
    var self = this;
    this.btns = $(".btnQuizPalavras");

    this.btns.bind('keydown', function (e) { self.selectBtnKeydown(e); });
    this.btns.bind('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.selectBtnClick(e);
    });

    this.btnClear.bind('keydown', function (e) { self.removeClearAnswerCorrectKeydown(e); });
    this.btnClear.bind('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.removeClearAnswerCorrect(e, false, null);
    });
};

AtividadeMistureba.prototype.removeClearAnswerCorrectKeydown = function __removeClearAnswerCorrectKeydown(e){

    switch (e.keyCode) {
        case this.keys.enter:
            this.removeClearAnswerCorrect(e, false, null);
        break;
    }
};

AtividadeMistureba.prototype.selectBtnKeydown = function __selectBtnKeydown(e) {

    //Elemento selecionado.
    var dragFocus = $(e.target);

    //Index de e.target entre os radios armazenados no objeto radioGroup.
    var index = this.btns.index(dragFocus);

    //Armazena o elemento anterior a e.target
    var prev_drag = this.btns[index - 1];

    //Armazena o elemento posterior a e.target
    var next_drag = this.btns[index + 1];

    //Ignora o restante do código caso a tecla alt ou a tecla shift estejam pressionadas. ( o motivo para essa condição é desconhecido )
    if (e.altKey || e.shiftKey) return;

    //Analizando qual tecla foi pressionada após o elemento e.target ser selecionado.
    switch (e.keyCode) {

        //Tecla espaço ou o enter
        case this.keys.space:
        case this.keys.enter:
            break;

        //Tecla seta para esquerda ou para cima, seleciona o elemento anterior a e.target.
        case this.keys.left:
        case this.keys.up:
            //caso o elemento seja visivel ele rebe foco.
            if ($(prev_drag).is(":visible")) prev_drag.focus();
            break;

        //Tecla seta para direita ou para baixo seleciona o elemento posterior a e.target.
        case this.keys.right:
            this.btns[index].focus();
            break;
        case this.keys.down:
            if ($(next_drag).is(":visible")) next_drag.focus();
            if ($(next_drag).attr("id") == undefined) {
                this.btns[0].focus();
            }

            break;
    }
};

AtividadeMistureba.prototype.selectBtnClick = function __selectBtnClick(e){
    // Guarda uma referência da classe
    var self = this;
    var element = $(e.currentTarget);
    var silaba = element.data("content");

    if(!this.silaba) {
        this.silaba += silaba;
    }else{
        this.silaba += "-" + silaba;
    }

    this.respLabel.html(this.silaba);
    this.answer += silaba;
    var arialabel = element.attr("aria-label");
    element.addClass("removed").attr("aria-label", "opção removida - " + arialabel).css("visibility", "hidden");
    this.elementAnswer.push(element);
    setTimeout(function(){self.checkAnswer();}, 50);

};

AtividadeMistureba.prototype.checkAnswer = function __checkAnswer(){
    var i,  max = this.configAtv.length, answer;

    for(i = 0; i < max; i++){
        answer = this.configAtv[i].answer.trim();
        if( this.answer == answer ){
            this.countAnswer++;
            this.removeClearAnswerCorrect(null, true, this.configAtv[i]);
            break;
        }
    }
};

AtividadeMistureba.prototype.removeClearAnswerCorrect = function __removeAnswerCorrect(e, remove, element){

    var i, max = this.elementAnswer.length;

    for(i = 0; i < max; i++){
        if(remove) {
            this.elementAnswer[i].removeClass("btn");
        }else {
            var ariaLabel = this.elementAnswer[i].attr("aria-label").split("-")[1].trim();
            this.elementAnswer[i].removeClass("removed").attr("aria-label", ariaLabel).removeAttr("style");
        }
    }

    if(element) {
        $("#" + element.idAnswer).html(this.answer);
        var label = element.feedPos || this.feedAcerto;

        if (this.countAnswer == this.maxConfigAtiv) {

            if (this.configScorm.blockBtnNext)
                this.releaseNextButton();

            this.setScormStatus(true);
        }
    }

    this.feedback.empty();
    this.feedback.attr("aria-label", label);
    this.feedback.text(label);
    this.feedback.animate({opacity: 1}, 1000).attr("role", "alert");
    this.feedback.animate({opacity: 0}, this.configScorm.delayFeed).attr("role", "alert");

    this.elementAnswer = [];
    this.answer = "";
    this.silaba = "";
    this.respLabel.html("");

};

AtividadeMistureba.prototype.setScormStatus = function __setScormStatus(status) {

    if(this.scorm) {
        //caso usuário acerte todas as questões
        if(status) {
            // SCORM - altera o status da atividade como finalizada
            this.scorm.completePage();

            if (this.configScorm.saveNote) {

                if(!this.configScorm.note) {
                    var resp =  this.countAnswer;
                    var media = 10 / this.maxConfigAtiv;
                    var nota = media * resp;

                    this.scorm.setSCOScore(nota.toFixed(2));
                }else {
                    this.scorm.setSCOScore(this.configScorm.note);
                }
            }

            if (this.configScorm.makeAttempt) {
                this.scorm.makeAttempt(true);
            }

        }else{

            if (this.configScorm.makeAttempt) this.scorm.makeAttempt(false);

            if(!this.scorm.isActivityLocked()){
                var labelFeed = this.feedErro;
            }else{

                this.feedErro = this.configScorm.feedback || "Infelizmente sua resposta está incorreta e você não possui mais nenhuma tentativa para refaze-la! Finalizada a Disciplina você poderá verificar a resposta correta comentada, que estará disponível na Biblioteca do curso. <span style='color: red'> Anote suas respostas para comparar posteriormente com o gabarito.</span>";
                var labelFeed = this.feedErro;
            }

            this.feedback.empty();
            this.feedback.attr("aria-label",  label);
            this.feedback.text(label);
            this.feedback.animate({opacity: 1}, 1000).attr("role", "alert");
            this.feedback.animate({opacity: 0}, 5000).attr("role", "alert");

        }
    }

};

/**
 * Libera o botão para o cursista avançar pra proxima tela
 */
AtividadeMistureba.prototype.releaseNextButton = function __releaseNextButton() {

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