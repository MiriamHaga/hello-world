
/**
 * Método construtor. 
 * @param containerClass = Classe de identificação de todos os elementos que contem questões.
 * @param feedAcerto = Feedback de acerto.
 * @param feedErro = Feedback de erro.
 */
function AssociativaComLista( configScorm, containerClass, feedAcerto, feedErro, conferir, refazer ){
    
    var self = this;

    //Armazenando pâramentros.
    this.containerClass = "."+containerClass;
    this.feedAcerto = feedAcerto || "Certo.";
    this.feedErro = feedErro || "Erro.";
    this.configScorm = configScorm;
    //pegando a variavel de scorm do moodle
    this.scorm = window.parent.SCORM || null;

    this.countErros = 0;
    
    //Controle do botão conferir.       
    this.btnConferir = conferir ? $(conferir) : $('#btnConferir');
    this.btnConferir.bind( { 
                    'click':function (e) { self.checkActivity(); },
                    'keydown':function(e){ if( e.keyCode == 13 || e.keyCode == 32) self.checkActivity(); }
                });

    //Controle do botão refazer.
    this.btnRefazer = refazer ? $(refazer) : $('#btnRefazer');
    this.btnRefazer.bind( { 
                    'click':function (e) { self.refazer(); },
                    'keydown':function(e){ if( e.keyCode == 13 || e.keyCode == 32) self.refazer();  }
                });

    //Status dos campos.
    this.STATUS_NAO_RESPONDIDO = "Não respondido. Use 'Enter' ou 'Espaço' para selecionar uma opção.";
    this.STATUS_RESPONDIDO = "Respondido. Opção selecionada : ";
    this.STATUS_ERRADO = "Resposta errada! Opção selecionada : ";
    this.STATUS_CERTO = "Certa resposta! Opção selecionada : ";

    //Atribui descrição de não respondido em todos os campos.
    $(this.containerClass+' .status').text( this.STATUS_NAO_RESPONDIDO );

    //Estilizando o foco nos elementos selecionaveis.
    var _styleOutline = "#A4C6FD 2px solid";
    var elementosFocaveis = $( "[tabindex]" ).filter( function(){ return this.tabIndex > 0; } );
    elementosFocaveis.on('focus', function(e){ e.currentTarget.style.outline = _styleOutline; });
    elementosFocaveis.on('focusout', function(e){ e.currentTarget.style.outline = ""; });

    //Controle da popup de feedback.
    this.maskPopup = $('.mask-popup');
    this.closePopup = $('.close-popup');
    this.maskPopup.bind( 'click', function( e ){ e.preventDefault(); self.fecharPopup(e); } );
    this.closePopup.bind( 'click', function( e ){ e.preventDefault(); self.fecharPopup(e); } );
    this.maskPopup.bind( 'keydown', function( e ){ e.preventDefault(); if( e.keyCode == 13 || e.keyCode == 32)  self.fecharPopup(e); } );
    this.closePopup.bind( 'keydown', function( e ){ e.preventDefault(); if( e.keyCode == 13 || e.keyCode == 32)  self.fecharPopup(e); } );
    this.conteudoPopup = $("#ConteudoPopup");
    this.conteudoPopup.hide();

    //Controle de alternativas.
    this.alternativas = $( this.containerClass );
    this.alternativas.on("click", function(e){ self.selecionarCampo(e); });
    this.alternativas.on("keydown", function(e){ if( e.keyCode == 13 || e.keyCode == 32) self.selecionarCampo(e); } )

    //Controle de selects
    $(this.containerClass+' select').change( function(e){ self.selecionarOpcao( this ) } )

    if(this.configScorm.blockBtnNext) {
        var right = $(".right");
        right.unbind("click").attr('disabled', 'disabled').off('click').addClass('off');
    }
};

/**
 * Libera o botão para o cursista avançar pra proxima tela
 */
AssociativaComLista.prototype.releaseNextButton = function (){

     right.click(function (e) {
        e.preventDefault();
        var id = $(this).attr('data-option');
        id++;
				window.localStorage.setItem('startPage',true);
        var elem = $(window.parent.document).find(".yui3-treeview-row").eq(id);
        elem.click();
    }).removeAttr("disabled").removeClass('off');
}


AssociativaComLista.prototype.selecionarCampo = function( e ) {
   e.stopPropagation();
   var lista = $(e.currentTarget).find('select').focus();
};


AssociativaComLista.prototype.selecionarOpcao = function( _select ){

    //Variáveis para definição da resposta do usuário e status da questão. 
    var userAnswer = _select.selectedIndex;
    var answer = $(_select).attr("answer");
    var result = userAnswer == answer ? "1" : "0";
    var container = $(_select).closest(this.containerClass);
    var status =  container.find('.status');
    var campo = container.find('.campo');

    //Atualizando a resposta do usuário e o resultado da resposta.
    $(_select).attr("userAnswer", ""+_select.selectedIndex  );
    $(_select).attr("result", result);
    
    //Atualizando a descrição da questão para acessibilidade.
    if( _select.selectedIndex != 0  ) status.text(this.STATUS_RESPONDIDO+_select.value );
    else status.text(this.STATUS_NAO_RESPONDIDO);
    
    //Devolvendo o foco para o campo relacionado ao select.
    campo.focus();
};

AssociativaComLista.prototype.checkActivity = function() {
    //Referencia do objeto.
    var allSelected = true;
    //Seleciona apenas as questões ativas na atividade.
    var questoesAtivas = $( this.containerClass ).filter( function () { return !$(this).attr("disabled"); });

    //Percorre cada questão ativa para corrigilas e definir suas configurações.
    $( questoesAtivas ).each( function () {

        //Elementos manipulados de cada questões.
        var status = $(this).find('.status');
        var select = $(this).find('select ');
        var campo = $(this).find('.campo');

        if( select.attr("userAnswer") == "0" ){
            allSelected = false;
            return false;
        }

    });
    if(allSelected) {
        this.conferir();
    }else{
        this.conteudoPopup.html( "Você ainda não realizou todo o exercício." );
        var self = this;
        self.conteudoPopup.show();
        setTimeout(function(){
            self.conteudoPopup.hide();
        },6000);

        //Exibe o popup de feedback.
        this.closePopup.focus();
        try {
            Modal.launchWindow();
        }catch(e){}
    }
};

AssociativaComLista.prototype.conferir = function() {

    //Flags de controle
    var terminou = true;
    var emBranco = false;

    //Referencia do objeto.
    var self = this;

    //Seleciona apenas as questões ativas na atividade.
    var questoesAtivas = $( this.containerClass ).filter( function () { return !$(this).attr("disabled"); });

    //Percorre cada questão ativa para corrigilas e definir suas configurações.
    $( questoesAtivas ).each( function () {

        //Elementos manipulados de cada questões.
        var status = $(this).find('.status');
        var select = $(this).find('select ');
        var campo = $(this).find('.campo');

        //Se a resposta estiver certa.
        if( select.attr("result") == "1" ){
           campo.attr("disbabled", true).removeClass('wrong');
           select.attr("disabled", true ).removeClass('wrong');

            if(self.configScorm.showAnswer) {
                campo.addClass('correct');
                select.addClass("correct");
            }

           $(this).attr("disabled", true );
           status.text( self.STATUS_CERTO + select[0].value );
        }
        else{

            //Se a resposta estiver errada.
            if( select.attr("userAnswer") != "0" ){

                if(self.configScorm.showAnswer) {
                    campo.addClass('wrong');
                    select.addClass("wrong");
                }
               status.text(self.STATUS_ERRADO + select[0].value );
                self.countErros++;
            }
            else{
               //Se o usuário não selecionou uma opção válida 
               campo.removeClass("wrong");
               select.removeClass("wrong");
               emBranco = true;
               status.text(self.STATUS_NAO_RESPONDIDO);
            }
           
           terminou = false;
        }

        console.log(terminou);
    });
    
    //Se respodeu e acertou todas as questões.
    if( terminou ){

        //Definindo feedback de acerto para a popup.
        this.conteudoPopup.html( this.feedAcerto );
        self.conteudoPopup.show();

        //Habilitando o botão de refazer.
        var tabindexBtnRefazer = this.btnRefazer.attr("tabindex");
        var tabindexBtnConferir = this.btnConferir.attr("tabindex");
        this.btnRefazer.show().attr("tabindex", tabindexBtnConferir);
        this.btnConferir.hide().attr("tabindex", tabindexBtnRefazer);

        if(this.configScorm.blockBtnNext)this.releaseNextButton();
        this.setScormStatus(true);

    }else{

        //
        if( emBranco ) this.conteudoPopup.html( "Você ainda não realizou todo o exercício." );

        //
        else this.conteudoPopup.html( this.feedErro );

        self.conteudoPopup.show();
        setTimeout(function(){
            self.conteudoPopup.hide();
        },6000);
    }

    //Exibe o popup de feedback.
     this.closePopup.focus();
    try {
        Modal.launchWindow();
    }catch(e){}
};


AssociativaComLista.prototype.refazer = function(e) {
    this.conteudoPopup.hide();

    $( this.containerClass ).each( function () {

        var select = $(this).find('select');
        var campo = $(this).find('.campo');
        var status = $(this).find('.status');

        select.removeClass('wrong correct').attr({"userAnswer":"0", "result":"0", "disabled":false })[0].selectedIndex = 0;
        campo.removeClass('wrong correct').attr("disabled", false );
        status.text(this.STATUS_NAO_RESPONDIDO);
        $(this).attr("disabled", false );
    });
    
    //Habilitando mecânica de conferir.
    var tabindexBtnRefazer = this.btnRefazer.attr("tabindex");
    var tabindexBtnConferir = this.btnConferir.attr("tabindex");
    this.btnRefazer.hide().attr("tabindex", tabindexBtnConferir);
    this.btnConferir.show().attr("tabindex", tabindexBtnRefazer);
};

AssociativaComLista.prototype.fecharPopup = function(e){

    //Seleciona uma questão ativa na atividade.
    var questaoAtiva = $( this.containerClass ).filter( function () { return !$(this).attr("disabled"); }).first();

    //Após o fechamento da popup verifica em qual elemento da pagina recebera foco.
    //Se a atividade não foi finalizada atribui o foco no primeiro elemento ativo.
    if( questaoAtiva ) Modal.closeWindow(e, questaoAtiva.find(".campo") ); 

    //Se atividade foi finalizada o foco vai para o botão refazer.
    else try{Modal.closeWindow( e, this.btnRefazer );}catch(e){}
};

/**
 * Libera o botão para o cursista avançar pra proxima tela
 */
AssociativaComLista.prototype.releaseNextButton = function __releaseNextButton() {

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

AssociativaComLista.prototype.setScormStatus = function __setScormStatus(status) {

    if(this.scorm) {
        //caso usuário acerte todas as questões
        if(status) {
            // SCORM - altera o status da atividade como finalizada
            this.scorm.completePage();

            if (this.configScorm.saveNote) {

                if(!this.configScorm.note) {
                    var resp = this.alternativas.length - this.countErros;
                    var media = 10 / this.alternativas.length;
                    var nota = media * resp;

                     this.scorm.setSCOScore(nota.toFixed(2));
                }else {
                     this.scorm.setSCOScore(this.configScorm.note);
                }
            }

            if (this.configScorm.makeAttempt) {
                this.scorm.makeAttempt(true);
                this.btnConferir.remove();
                this.btnRefazer.remove();
                //this.btnLimpar.remove();
            }else{
                this.btnRefazer.show();
            }
            //Exibe mensagem
            var labelFeed = this.feedAcerto; //|| "Parabéns você acertou todas as atividades!";
            //Flag necessária para exibição do botão refazer ou conferir.
            this.flagRefazer = true;
        }else{

            if (this.configScorm.makeAttempt) this.scorm.makeAttempt(false);

            if(!this.scorm.isActivityLocked()){
                this.btnRefazer.show().attr("tabindex", "0");
                var labelFeed = this.feedErro;
            }else{
                this.btnConferir.remove();
                this.btnRefazer.remove();
                this.btnLimpar.remove();

                this.feedErro = this.configScorm.feedback || "Infelizmente sua resposta está incorreta e você não possui mais nenhuma tentativa para refaze-la! Finalizada a Disciplina você poderá verificar a resposta correta comentada, que estará disponível na Biblioteca do curso. <span style='color: red'> Anote suas respostas para comparar posteriormente com o gabarito.</span>";
                var labelFeed = this.feedErro;
            }


        }

        //this.feedClick.empty();
        //this.feedClick.append(labelFeed);
        ////Anima e adiciona atributo
        //this.feedClick.animate({opacity: 1}, 1000).attr("role", "alert");

    }

};