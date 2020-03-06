/**
 * Created by everton.ferreira on 23/05/2017.
 */
function AtividadeForca(configAtv, configScorm, feedPos, feedNeg){

    this.configAtv = configAtv;
    this.configScorm = configScorm;
    this.feedPos = feedPos;
    this.feedNeg = feedNeg;

    this.declareResetVariables();
}

AtividadeForca.prototype.declareResetVariables = function __declareResetVariables(){

    this.words = $("#words");
    this.stickman = $("#stickman");
    this.btns = $(".btn");
    this.btnRefazer = $("#btnRefazer");
    this.feedback = $("#feedback");
    this.btnRefazer.hide();

    this.countError = 0;
    this.countAcerto = 0;

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

AtividadeForca.prototype.createWords = function __createWords(){

    var i, j, max = this.configAtv.length, span = "", word, text = "";

    for(i = 0; i < max; i++){
        span += '<span id="span'+ i +'">';
        word = this.configAtv[i].word;
        for(j = 0; j < word.length; j++){

            if(word[j] != " "){
                text += "_";
            } else{
                text += " ";
            }
        }

        span += text + '</span>';
        text = "";
    }
    this.words.empty();
    this.words.append(span);

    // valida se existe a variavel do scorm do moodle
    if( this.scorm ) {
        //conferindo se o usuário pode refazer atividade
        if(!this.scorm.isActivityLocked()) {
            this.setEventsBtns();
        }
    }else{
        this.setEventsBtns();
    }

};

AtividadeForca.prototype.setEventsBtns = function __setEventsBtns(){

    // Guarda uma referência da classe
    var self = this;

    this.btns.bind('keydown', function (e) { self.selectBtnKeydown(e); });
    this.btns.bind('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.selectBtnClick(e);
    });

};

AtividadeForca.prototype.selectBtnKeydown = function __selectBtnKeydown(e){

    switch (e.keyCode) {
        case this.keys.enter:
            this.selectBtnClick(e);
            break;
    }
};

AtividadeForca.prototype.redoActivityKeydown = function __redoActivityKeydown(e){

    switch (e.keyCode) {
        case this.keys.enter:
            this.redoActivity(e);
            break;
    }
};

AtividadeForca.prototype.selectBtnClick = function __selectBtnClick(e){
    var element = $(e.currentTarget);
    var char = element.html();
    this.checkAnswer(element, char);
};

AtividadeForca.prototype.checkAnswer = function __checkAnswer(element, char){

    var i, j, max = this.configAtv.length, obj, word, span, text;
    var flagCheckAnswer = false;
    var label = null;

    for(i = 0; i < max; i++){
        obj = this.configAtv[i];
        word = obj.word;

        for(j = 0; j < word.length; j++){

            if(obj.status)break;

            if (word[j].toUpperCase() == char.toUpperCase()) {
                span = $("#span" + i);
                text = span.html();
                text = this.setCharAt(text, j, char);
                span.html(text);
                flagCheckAnswer = true;

                if (text.split("_").length == 1) {
                    obj.status = true;
                    label = obj.feedPos ? obj.feedPos : this.feedPos;
                    this.countAcerto++;

                    this.feedback.empty();
                    this.feedback.attr("aria-label", label);
                    this.feedback.text(label);
                    this.feedback.animate({opacity: 1}, 1000).attr("role", "alert");
                    this.feedback.animate({opacity: 0}, 5000).attr("role", "alert");
                }
            }
        }
    }

    if(flagCheckAnswer){

        element.addClass("success").attr("disabled", "disabled");

        if(this.countAcerto == this.configAtv.length){
            this.setScormStatus(true);
            this.setRedoActivity();
        }

    }else{

        element.addClass("danger").attr("disabled", "disabled");
        this.countError++;
        this.stickman.removeAttr("class").addClass("error-" + this.countError);

        if(this.countError >= 6){

            this.setScormStatus(false);

          this.setRedoActivity();
        }
    }
};

AtividadeForca.prototype.setRedoActivity = function __setRedoActivity() {

    this.btns.unbind('keydown').unbind('click');
    this.btnRefazer.show();

    var self = this;

    this.btnRefazer.bind('keydown', function (e) { self.redoActivityKeydown(e); });
    this.btnRefazer.bind('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.redoActivity(e);
    });

};
AtividadeForca.prototype.redoActivity = function __redoActivity(e) {

    $(e.currentTarget).unbind("click").unbind('keydown').hide();
    this.btns.removeClass("success danger").removeAttr("disabled");
    this.stickman.removeAttr("class").addClass("error-0");
    this.countError = 0;
    this.countAcerto = 0;
    this.createWords();
};

AtividadeForca.prototype.setCharAt = function __setCharAt(str,index,chr) {

    if(index > str.length-1)
        return str;

    return str.substr(0,index) + chr + str.substr(index+1);

};

AtividadeForca.prototype.setScormStatus = function __setScormStatus(status) {
    var label = "";
    if(this.scorm) {
        //caso usuário acerte todas as questões
        if(status) {
            // SCORM - altera o status da atividade como finalizada
            this.scorm.completePage();

            if (this.configScorm.saveNote) {

                if(!this.configScorm.note) {
                    var resp =  this.countAcerto;
                    var media = 10 / this.configAtv.length;
                    var nota = media * resp;

                    this.scorm.setSCOScore(nota.toFixed(2));
                }else {
                    this.scorm.setSCOScore(this.configScorm.note);
                }
            }

            if (this.configScorm.makeAttempt) {
                this.scorm.makeAttempt(true);
            }
            return;
        }else{

            if (this.configScorm.makeAttempt) this.scorm.makeAttempt(false);

            if(!this.scorm.isActivityLocked()){
                label = this.feedNeg;
            }else{

                this.feedNeg = this.configScorm.feedback || "Infelizmente sua resposta está incorreta e você não possui mais nenhuma tentativa para refaze-la! Finalizada a Disciplina você poderá verificar a resposta correta comentada, que estará disponível na Biblioteca do curso. <span style='color: red'> Anote suas respostas para comparar posteriormente com o gabarito.</span>";
                label = this.feedNeg;
            }

        }
    }

    if(!status) {
        var text = label ? label : this.feedNeg;
        this.feedback.empty();
        this.feedback.attr("aria-label", text);
        this.feedback.html(text);
        this.feedback.animate({opacity: 1}, 1000).attr("role", "alert");
        this.feedback.animate({opacity: 0}, 5000).attr("role", "alert");
    }

};