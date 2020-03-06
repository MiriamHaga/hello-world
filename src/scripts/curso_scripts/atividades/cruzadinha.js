/**
 *Created by everton.ferreira on 16/05/2017.
 *
 * @param {Int} _lin - Quantidade maxima de linhas que a cruzadinha terá
 * @param {Int} _col - Quantidade maxima de colunas que a cruzadinha terá
 *
 * @param {Object} _create - Objeto de configuração da cruzadinha
 * @param {String} _create.word - Palavra que sera add na cruzadinha
 * @param {Int} _create.col - Coluna em que a palavra ira começar
 * @param {Int} _create.lin - Linha em que a palavra ira começar
 * @param {String} _create.type - Posicionamento da palavra Ex: Horizontal ou Vertical
 * @param {Int} _create.emptySpace - quantidade de espaços vazius na palavra
 * @param {String} _create.feedAcerto - Feedback de acerto individual por palavra
 *
 * @param {String} _feedAcerto - feedback de acerto geral
 * @param {String} _feedErro - feedback de erro geral
 *
 * @param {Object} _config - objeto de configuração da cruzadinha
 * @param {Boolean} _config.showAnswer - destaca as resposta certa e erradas do usuario
 * @param {Boolean} _config.showGrid - mostra o grid para facilitar na montagem da cruzadinha
 * @param {Boolean} _config.showBtnConferir - se a cruzadinha terá verificação automatica ou per um botão de conferir
 * @param {Boolean} _config.saveNote - se ira salvar uma nota ou não no scorm do moodle
 * @param {Boolean} _config.makeAttempt - se teraá um numero de tentativas
 * @param {Int} _config.feedDelayTime - delay de tempo que irar aparecer a mensagem de feedback para o usuário
 * @param {Int} _config.note - nota a ser atribuida ao usuário no finalda tavidade
 *
 * @constructor
 */
var reg = /[a-zA-Z\u00C0-\u00FF ]+/i;
function CruzadinhaJs(_lin, _col, _create, _feedAcerto, _feedErro, _config){

    this.lin = _lin;
    this.col = _col;
    this.create = _create;
    this.feedAcerto = _feedAcerto || "Parabéns! você acertou todas as respostas da atividade!";
    this.feedErro = _feedErro || "Existem erros, por favor refaça a atividade!";
    this.configAtv = _config;
    this.acertos = 0;

    //pegando a variavel de scorm do moodle
    this.scorm = window.parent.SCORM || null;
    this.declareVariables();
}

/**
 * Criação das variaveis globais
 */
CruzadinhaJs.prototype.declareVariables = function __declareVariables(){

    this.contQuestions = 0;
    this.IdPerguntaSelected = null;
    this.eixos = null;
    this.btnRefazer = $("#btnRefazer");
    this.btnConferir = $("#btnConferir");
    this.feedback = $("#feedback");
    this.tbody = $("#cruzadinha tbody");

    this.btnConferir.hide();
    this.btnRefazer.removeAttr("style");
    this.btnRefazer.hide();

    this.createCruzadinhaJs();
};

/**
 * Cria uma matriz com campos inputs desabilitados dentro da tbody da table
 */
CruzadinhaJs.prototype.createCruzadinhaJs = function __createCruzadinhaJs(){

    var i, j, tr, td, id;

    for(i = 0; i < this.lin; i++){
        tr = '<tr>';
        td = "";

        for(j = 0; j < this.col; j++){
            id = i + "_" + j;
            //criando os td com os inputs
            td += '<td><input id=' + id + ' maxlength="1" class="remover" disabled></td>';
        }//for j

        tr += td + '</tr>';
        // add a linha toda no corpo da tabela
        this.tbody.append(tr);
    }//for i

    this.setWordCruzadinhaJs();
};

/**
 * Criando as palavras nas suas respequitivas posições
 */
CruzadinhaJs.prototype.setWordCruzadinhaJs = function __setWordCruzadinhaJs() {

    var i, j, maxWord, create,  max = this.create.length, id, char, elem, input;

    for(i = 0; i < max; i++){

        create = this.create[i];
        maxWord = create.word.length;

        for(j = 0; j < maxWord; j++){
            //pega uma letra da palavra
            char = create.word.substr(j, 1);

            //verifica a posição da palavra se é 'horizontal' ou 'vertical'
            if (create.type.toLowerCase() == "horizontal") {

                //Add numero da questão em um input inicial da palavra
                $("#" + create.row + "_" + (create.col - 1) ).removeClass("remover").attr("value", (i + 1));
                //Pegando o id do elemento input
                id = create.row + "_" + (create.col + j);

            } else if (create.type.toLowerCase() == "vertical") {

                //Add numero da questão em um input inicial da palavra
                $("#" + (create.row - 1) + "_" + create.col).removeClass("remover").attr("value", (i + 1));
                //Pegando o id do elemento input
                id = (create.row + j) + "_" + create.col;
            }

            //pegando o elemento
            elem = $("#" + id);
            //verificando se a letras da palavra não é um espaço vaziu
            if(char.trim()) {
                //se não existir um tipo add todas as suas propriedades no input
                if(!elem.data("type1")) {
                    elem.removeAttr("disabled").attr("tabindex", i + 1).removeClass("remover").addClass("event quest" + i).data("word", i).data("type1", create.type.toLowerCase()).data("template", char);
                }else {
                    //se já existir uma proriedade tipo, add a id pa segunda palavra
                    elem.data("word", elem.data("word") +"_" + i).data("type2", create.type.toLowerCase()).addClass("event quest" + i);
                }
                //add proriedade 'finish' na ultima letra da palavra
                if(j == (maxWord - 1))
                    elem.data("finish", create.type.toLowerCase());

                if(this.configAtv.showFeedBack || (this.scorm && this.scorm.isActivityLocked())){
                    elem.val(char).attr('disabled', 'disabled').addClass('correct');
                }

            }else{
                //se for espaço vaziu deixa o campo a mosta mais desabilitado
                elem.data("word", i).removeClass("remover").addClass("quest" + i);
            }

        }//for j
    }//for i

    this.wordsInputs = $(".event");

    //valida se tem a variavel do scorm do moodle
    if(this.scorm) {
        //conferindo se o usuário pode refazer atividade
        if (!this.scorm.isActivityLocked()) {
            this.setEventsCruzadinhaJs();
        } else {
            //desativa toda a cruzadinha
            this.wordsInputs.attr("disabled");
        }
    }else{
        this.setEventsCruzadinhaJs();
    }
};

/**
 * Add eventos nos inputs ativos da cruzadinha
 */
CruzadinhaJs.prototype.setEventsCruzadinhaJs = function __setEventsCruzadinhaJs(){

    var self = this;

    //verifica se o grid sera exibido ou não
    if (!this.configAtv.showGrid)
        $(".remover").remove();

    this.wordsInputs.on("keyup", function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.Keyup(e);
    });

    this.wordsInputs.keypress(function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.keyPressEvent(e);
    });


    this.btnRefazer.show().on("click", function(e){
        e.preventDefault();
        e.stopPropagation();
        self.clearAnswers(e)
    });

    this.btnRefazer.on('keydown', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.clearAnswers(e)
    });

};

/**
 *
 * @param {Event} e
 */
CruzadinhaJs.prototype.Keyup = function __Keyup(e){
    var element = $(e.currentTarget);

    if(e.keyCode == 8 || e.keyCode == 46)
        element.removeClass("worn confrim").val("");
};

CruzadinhaJs.prototype.onKeyup = function __onKeyup(e, caracter){
    var element = $(e.currentTarget);
    var char = element.val();
    element.val("");

    //valida se o keycode é uma letra ou um numero
    if( reg.test(char) || reg.test(caracter)){

        if(char != caracter){
            char = caracter;
            element.val(caracter);
        }else{
            element.val(char);
        }

        element.attr('aria-label', "Letra -" + char + "correta");
        this.onCheckAnswer(element, char);

        //verifica se é a ultima letra da plavra se não for vai pra próximo input
        if(!element.data("finish")) {
            this.nextInputTab(element, e);
        //se for a ultima letra de uma palavra mais sei eixo for diferente vai pra próximo input
        }else if(element.data("finish") != this.eixos){
            this.nextInputTab(element, e);
        }

    }else{
        //remove a class "worn" dos inputs errados
        element.removeClass("worn confrim");
    }
};

CruzadinhaJs.prototype.keyPressEvent = function __keyPressEvent(e) {

    var output= {};

    e = (e) ? e : ((event) ? event : null);

    if (e) {
        output['keyCode']   = (e.keyCode) ? e.keyCode : 'N/A';
        output['charCode'] = (e.charCode) ? e.charCode : 'N/A';

        this.onKeyup(e, String.fromCharCode(output['charCode']));
    } else {
        return 'error';
    }
}

CruzadinhaJs.prototype.nextInputTab = function __nextInputTab(element, e){

    var arr = element.attr("id").split("_");
    var lin = parseInt(arr[0]);
    var col = parseInt(arr[1]);
    var el = null;

    if (element.data("type1") == "horizontal") {

        el = $("#" + lin + "_" + + (col + 1));

        if(!el.hasClass("correct")){
            //add o foco no proximo input
            this.wordsInputs.eq(this.wordsInputs.index(e.currentTarget) + 1).focus();
        }else{
            el = $("#" + lin + "_" + + (col + 2));

            if(!el.attr("disabled")) {
                //add o foco no proximo input
                this.wordsInputs.eq(this.wordsInputs.index(el)).focus();
            }else{
                el = $("#" + lin + "_" + + (col + 3));
                //add o foco no proximo input
                this.wordsInputs.eq(this.wordsInputs.index(el)).focus();
            }
        }

    } else  if (element.data("type1") == "vertical") {

        el = $("#" + (lin + 1 ) + "_" + col);

        //verifica se o proxima casa já foi corrigida e pula uma
        if(el.hasClass("correct")){
            el = $("#" + (lin + 2 ) + "_" + col);
        }
        //add o foco no proximo input
        this.wordsInputs.eq(this.wordsInputs.index(el)).focus();
    }
};

/**
 *
 * @param {Event} e
 * @param {String} char
 */
CruzadinhaJs.prototype.onCheckAnswer = function __onFocusOut(e, char){

    //pegando o caracter de gabarito
    var charTemp = e.data("template");
    //pegando o id da pergunta
    var idPergunta = e.data("word");

    //valida se id da pergunta tem mais que uma pergunta
    if(idPergunta.length > 1){

        var arr = idPergunta.split("_");

        if(this.IdPerguntaSelected != arr[0]){

            if(parseInt(idPergunta[2]))
                this.IdPerguntaSelected = parseInt(arr[1]);

            e.data("type1",  e.data("type2"));
            this.eixos = e.data("type2");
        }else if(this.IdPerguntaSelected != parseInt(arr[1])){

            this.IdPerguntaSelected = parseInt(arr[0]);
            e.data("type1", this.create[this.IdPerguntaSelected].type);
            this.eixos = this.create[this.IdPerguntaSelected].type;
        }

    }else{
        this.IdPerguntaSelected = idPergunta
    }

    //Conferir automaticamente a cruzadinha
    if(!this.configAtv.showBtnConferir) {

        //conferindo as resposta do gabarito com a do usuário
        if(charTemp == char){

            if(this.configAtv.showAnswer)
                e.removeClass("worn").addClass("correct").attr("disabled", "disabled");
            else
                e.removeClass("worn").attr("disabled", "disabled");

            this.feedBack(this.IdPerguntaSelected);

        }else{
            if(this.configAtv.showAnswer)
                e.addClass("worn");
            this.feedBack(this.IdPerguntaSelected);
        }
    }else{
        e.addClass("confrim");
        this.releaseConfirmButton();
    }

};

CruzadinhaJs.prototype.checkAllAnswers = function __checkAllAnswers(e){

    this.btnConferir.hide().unbind("click");
    this.btnRefazer.show();

    var i, j, max = this.create.length, obj, quest, word, el;

    for(i = 0; i < max; i++){

        obj = this.create[i];
        quest = $(".quest" + i);
        word = obj.word;

        for(j = 0; j < quest.length; j++){

            el = $(quest[j]);
            if(el.val()) {
                if (el.val() == word.substr(j, 1)) {

                    if (this.configAtv.showAnswer)
                        el.removeClass("worn").addClass("correct").attr("disabled", "disabled");
                    else
                        el.removeClass("worn").attr("disabled", "disabled");

                } else {
                    if (this.configAtv.showAnswer)
                        el.addClass("worn");
                }
            }

        }
        this.feedBack(i);
    }

};

CruzadinhaJs.prototype.clearAnswers = function __clearAnswers(e){
    this.btnRefazer.hide();
    $(".worn").val("").removeClass("confrim worn");
};


CruzadinhaJs.prototype.releaseConfirmButton = function __releaseConfirmButton(){

    var completed = $(".confrim").length,
        self = this;
    this.ativos = $(".event").length;

    if(this.ativos == completed){

        this.btnConferir.show().on("click", function(e){
            e.preventDefault();
            e.stopPropagation();
            self.checkAllAnswers(e)
        });

        this.btnConferir.on('keydown', function (e) {
            e.preventDefault();
            e.stopPropagation();
            self.checkAllAnswers(e)
        });


    }else{
        this.btnConferir.hide().unbind("click");
    }

};

/**
 *
 * @param status
 * @param id
 */
CruzadinhaJs.prototype.feedBack = function __feedBack(id) {

    var obj = this.create[id], count = 0, idElem;
    var maxWord = obj.word.length;

    for(var j = 0; j < maxWord; j++) {

        if (obj.type.toLowerCase() == "vertical") {

            idElem = (obj.row + j) + "_" + obj.col;
            if($("#" + idElem).hasClass("correct")){
                count++;
            }

        } else if (obj.type.toLowerCase() == "horizontal"){
            idElem = obj.row + "_" + (obj.col + j);
            if($("#" + idElem).hasClass("correct")){
                count++;
            }
        }
    }

    if(count == (obj.word.length - obj.emptySpace)){

        var label = "";
        var mostraFeed = null;
        this.contQuestions++;

        if(obj.feedAcerto && !this.configAtv.showBtnConferir){
            label = this.create[id].feedAcerto;
            mostraFeed = false;
        }else if( this.create.length == this.contQuestions){
            label = this.feedAcerto;
            this.setScormStatusCruzadinhaJs(true);
            mostraFeed = true;
        }
        if(label) {
            this.feedback.attr("aria-label", label);
            this.feedback.text(label);
            this.feedback.animate({opacity: 1}, 1000).attr("role", "alert");

            if(!mostraFeed)
                this.feedback.animate({opacity: 0}, this.configAtv.feedDelayTime ? this.configAtv.feedDelayTime : 5000).attr("role", "alert");
        }

    }else if((this.create.length - 1) == id){

        this.setScormStatusCruzadinhaJs(false);
        this.feedback.attr("aria-label", this.feedErro);
        this.feedback.text(this.feedErro);
        this.feedback.animate({opacity: 1}, 1000).attr("role", "alert");
        this.feedback.animate({opacity: 0}, this.configAtv.feedDelayTime ? this.configAtv.feedDelayTime : 5000).attr("role", "alert");
    }
};

/**
 *
 * @param evt
 * @returns {string}
 */
CruzadinhaJs.prototype.convertKeyCode = function __convertKeyCode(evt, keyCode) {
    var chara = "";
    var shift = evt.shiftKey;
console.log(keyCode);
    // Alphanumeric
    if (keyCode == 48)
        chara = (shift) ? ")" : "0";
    if (keyCode == 49)
        chara = (shift) ? "!" : "1";
    if (keyCode == 50)
        chara = (shift) ? "@" : "2";
    if (keyCode == 51)
        chara = (shift) ? "#" : "3";
    if (keyCode == 52)
        chara = (shift) ? "$" : "4";
    if (keyCode == 53)
        chara = (shift) ? "%" : "5";
    if (keyCode == 54)
        chara = (shift) ? "^" : "6";
    if (keyCode == 55)
        chara = (shift) ? "&" : "7";
    if (keyCode == 56)
        chara = (shift) ? "*" : "8";
    if (keyCode == 57)
        chara = (shift) ? "(" : "9";

    if (keyCode == 65)
        chara = (shift) ? "A" : "a";
    if (keyCode == 66)
        chara = (shift) ? "B" : "b";
    if (keyCode == 67)
        chara = (shift) ? "C" : "c";
    if (keyCode == 68)
        chara = (shift) ? "D" : "d";
    if (keyCode == 69)
        chara = (shift) ? "E" : "e";
    if (keyCode == 70)
        chara = (shift) ? "F" : "f";
    if (keyCode == 71)
        chara = (shift) ? "G" : "g";
    if (keyCode == 72)
        chara = (shift) ? "H" : "h";
    if (keyCode == 73)
        chara = (shift) ? "I" : "i";
    if (keyCode == 74)
        chara = (shift) ? "J" : "j";
    if (keyCode == 75)
        chara = (shift) ? "K" : "k";
    if (keyCode == 76)
        chara = (shift) ? "L" : "l";
    if (keyCode == 77)
        chara = (shift) ? "M" : "m";
    if (keyCode == 78)
        chara = (shift) ? "N" : "n";
    if (keyCode == 79)
        chara = (shift) ? "O" : "o";
    if (keyCode == 80)
        chara = (shift) ? "P" : "p";
    if (keyCode == 81)
        chara = (shift) ? "Q" : "q";
    if (keyCode == 82)
        chara = (shift) ? "R" : "r";
    if (keyCode == 83)
        chara = (shift) ? "S" : "s";
    if (keyCode == 84)
        chara = (shift) ? "T" : "t";
    if (keyCode == 85)
        chara = (shift) ? "U" : "u";
    if (keyCode == 86)
        chara = (shift) ? "V" : "v";
    if (keyCode == 87)
        chara = (shift) ? "W" : "w";
    if (keyCode == 88)
        chara = (shift) ? "X" : "x";
    if (keyCode == 89)
        chara = (shift) ? "Y" : "y";
    if (keyCode == 90)
        chara = (shift) ? "Z" : "z";

    return chara;

};

CruzadinhaJs.prototype.completeActivity = function __completeActivity() {
    this.setScormStatusCruzadinhaJs(true);
};

/**
 *
 * @param status
 */
CruzadinhaJs.prototype.setScormStatusCruzadinhaJs = function __setScormStatusCruzadinhaJs(status) {

    if(this.scorm) {
        //caso usuário acerte todas as questões
        if(status) {
            // SCORM - altera o status da atividade como finalizada
            this.scorm.completePage();

            if (this.configAtv.saveNote) {

                if(!this.configAtv.note) {
                    var media = 10 / this.create.length;
                    var nota = media * this.create.length;

                    this.scorm.setSCOScore(nota.toFixed(2));
                }else {
                    this.scorm.setSCOScore(this.configAtv.note);
                }
            }

            if (this.configAtv.makeAttempt) {
                this.scorm.makeAttempt(true);
            }

        }else{

            if (this.configAtv.makeAttempt)
                this.scorm.makeAttempt(false);

            if(this.scorm.isActivityLocked()) {
                this.feedErro = "Você não possui mais nenhuma tentativa de resposta! Finalizada a Disciplina você poderá verificar a resposta correta comentada, que estará disponível na Biblioteca do curso.";
                this.feedback.attr("aria-label",  this.feedErro);
                this.feedback.text(this.feedErro);
                this.feedback.animate({opacity: 1}, 1000).attr("role", "alert");
            }
        }
    }

};



