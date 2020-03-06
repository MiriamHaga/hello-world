/**
 * Created by everton.ferreira on 22/05/2017.
 */
'use strict';
function AtividadeAnagramas(configAtv, configScorm, feedPos, feedNeg){

    this.configAtv = configAtv;
    this.configScorm = configScorm;
    this.feedPos = feedPos;
    this.feedNeg = feedNeg;

    //pegando a variavel de scorm do moodle
    this.scorm = window.parent.SCORM || null;

    this.declareResetVariables();
}

AtividadeAnagramas.prototype.declareResetVariables = function __declareResetVariables(){

    this.vogais = this.configAtv.vogais.split("-");
    this.possibleWords = this.configAtv.possibleWords;
    this.letrasContainer = $("#letras");
    this.char = null;
    this.wordAnswer = $("#palavra"),
    this.answer = "";
    this.btnMix = $("#botao_misturar");
    this.btnClear = $("#botao_limpar");
    this.feedback = $("#feedback");
    this.countAnswer = 0;

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

    this.createWords();

};

AtividadeAnagramas.prototype.createWords = function __createWords(e){

    var i, max = this.vogais.length, spanChar = "";
    this.uniqueRandoms = [];

    for(i = 0; i < max; i++){
        var char = this.vogais[this.makeUniqueRandom(max)];
        spanChar += '<span class="letra" style="display: inline-block;" tabindex="0" aria-label="'+ char +'">'+ char +'</span>'
    }

    this.letrasContainer.empty();
    this.letrasContainer.append(spanChar);

    if( this.scorm ) {
        //conferindo se o usuário pode refazer atividade
        if(!this.scorm.isActivityLocked()) {
            this.setEventsBtns();
        }
    }else{
        this.setEventsBtns();
    }

};

AtividadeAnagramas.prototype.makeUniqueRandom = function __makeUniqueRandom(numRandoms){
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

AtividadeAnagramas.prototype.setEventsBtns = function __setEventsBtns(){

    var self = this;
    this.btnMix.bind('keydown', function (e) { self.createWordsKeydown(e); });
    this.btnMix.bind('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.createWords(e);
    });

    this.char = $(".letra");

    this.char.bind('keydown', function (e) { self.selectedCharKeydown(e); });
    this.char.bind('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.selectedChar(e);
    });

    this.btnClear.bind('keydown', function (e) { self.clearKeydown(e); });
    this.btnClear.bind('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.clearAnswer(e);
    });

};

AtividadeAnagramas.prototype.createWordsKeydown = function __createWordsKeydown(e){

    switch (e.keyCode) {
        case this.keys.enter:
            this.createWords(e);
            break;
    }
};

AtividadeAnagramas.prototype.selectedCharKeydown = function __selectedCharKeydown(e){
    switch (e.keyCode) {
        case this.keys.enter:
            this.createWords(e);
            break;
    }
};

AtividadeAnagramas.prototype.clearKeydown = function __clearKeydown(e){
    switch (e.keyCode) {
        case this.keys.enter:
            this.createWords(e);
            break;
    }
};

AtividadeAnagramas.prototype.clearAnswer = function __clearAnswer(e){

    this.wordAnswer.html("");
    this.wordAnswer.hide();
    this.btnClear.hide();
    this.btnMix.show();
    this.answer = "";
    this.char.show();

};

AtividadeAnagramas.prototype.selectedChar = function __selectedChar(e){

    var element = $(e.currentTarget);
    var char = element.html();

    element.hide();
    this.answer += char;
    this.wordAnswer.html(this.answer).show();
    this.btnMix.hide();
    this.btnClear.show();

    this.checkAnswer();

};

AtividadeAnagramas.prototype.checkAnswer = function __checkAnswer(e){

    var i, max = this.possibleWords.length, elem, elemWord;

    for(i = 0; i < max; i++){
        elem = this.possibleWords[i];
        elemWord = elem.word;

        if(elemWord == this.answer && !elem.status){
            elem.status = true;
            this.setAnswerCorrect(elem);
            break;
        }

    }

};

AtividadeAnagramas.prototype.setAnswerCorrect = function __setAnswerCorrect(elem){

    this.countAnswer++;

    $("#" + elem.idWord).html(elem.accentedWords ? elem.accentedWords : elem.word)
        .addClass("palavra-encontrada")
        .css("background-color", "transparent");
    this.clearAnswer();

    var label = elem.feedPos ? elem.feedPos : this.feedPos;

    this.feedback.empty();
    this.feedback.attr("aria-label", label);
    this.feedback.text(label);


    if(this.countAnswer == this.possibleWords.length){
        this.feedback.animate({opacity: 1}, 1000).attr("role", "alert");
        this.setScormStatus(true);
    }else{
        this.feedback.animate({opacity: 1}, 1000).attr("role", "alert");
        this.feedback.animate({opacity: 0}, this.configScorm.delayFeed).attr("role", "alert");
    }

};

AtividadeAnagramas.prototype.setScormStatus = function __setScormStatus(status) {

    if(this.scorm) {
        //caso usuário acerte todas as questões
        if(status) {
            // SCORM - altera o status da atividade como finalizada
            this.scorm.completePage();

            if (this.configScorm.saveNote) {

                if(!this.configScorm.note) {
                    var resp =  this.countAnswer;
                    var media = 10 / this.possibleWords.length;
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

                var labelFeed = this.configScorm.feedback || "Infelizmente sua resposta está incorreta e você não possui mais nenhuma tentativa para refaze-la! Finalizada a Disciplina você poderá verificar a resposta correta comentada, que estará disponível na Biblioteca do curso. <span style='color: red'> Anote suas respostas para comparar posteriormente com o gabarito.</span>";
            }

            this.feedback.empty();
            this.feedback.attr("aria-label",  label);
            this.feedback.append(label);
            this.feedback.animate({opacity: 1}, 1000).attr("role", "alert");
            this.feedback.animate({opacity: 0}, 5000).attr("role", "alert");

        }
    }

};
