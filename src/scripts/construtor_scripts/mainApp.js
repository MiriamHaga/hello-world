var mainApp = angular.module("mainApp", []);

mainApp.controller('mainController', function($scope) {
    $scope.elements = [{
        name: "bloco",
        title: "Bloco destacado"
    }, {
        name: "citacao",
        title: "Citação"
    }, {
        name: "figura",
        title: "Figura"
    }, {
        name: "lista",
        title: "Lista"
    }, {
        name: "listanumerada",
        title: "Lista numerada"
    }, {
        name: "tabela",
        title: "Tabela"
    }, {
        name: "timeline",
        title: "Timeline"
    }, {
        name: "videodiretiva",
        title: "Vídeo"
    }];
    $scope.element = "";

    $scope.interactiveElements = [{
        name: "abas",
        title: "Abas (tabs)"
    }, {
        name: "botao",
        title: "Botão (link)"
    }, {
        name: "card",
        title: "Card"
    }, {
        name: "carrossel",
        title: "Carrossel"
    }, {
        name: "imageminterativa",
        title: "Imagem interativa"
    }, {
        name: "modal",
        title: "Janela pop-up (modal)"
    }, {
        name: "sanfona",
        title: "Sanfona (accordion)"
    }, {
        name: "tooltip",
        title: "Tooltip"
    }];
    $scope.interactiveElement = "";

    // TABLE LINES
    $scope.tableLines = [];

    $scope.addTableLine = function(){
        if ( $scope.tableLinesContent.length === $scope.tableColumns.length ){
            $scope.tableLines.push({ tableLinesContents:$scope.tableLinesContent });
            //alert('ok');
            $scope.tableLinesContentError = false;
            $scope.tableLinesContent = '';
        } else{
            //alert('O número de itens na linha não coincide com o número de colunas.');
            $scope.tableLinesContentError = true;
        }
    };

    $scope.deleteTableLine = function(tableLine){
        var index = $scope.tableLines.indexOf(tableLine);
        $scope.tableLines.splice(index, 1);
    };

    $scope.moveTableLine = function(direction, item){
        var index = $scope.tableLines.indexOf(item);

        if ( direction === 'up'){
            if (index <= 0){
                return;
            } else{
                // Remove value to replace
                var removed = $scope.tableLines.splice(index, 1);
                // Re-add removed value to the previous index
                $scope.tableLines.splice(index - 1, 0, removed[0]);
            }
        } else {
            if (index >= $scope.tableLines.length){
                return;
            } else{
                // Remove value to replace
                var removed = $scope.tableLines.splice(index, 1);
                // Re-add removed value to the previous index
                $scope.tableLines.splice(index + 1, 0, removed[0]);
            }
        }
    };

    // TIMELINE ITEMS
    $scope.timelineItems = [];

    $scope.addTimelineItem = function(){
        $scope.timelineItems.push({
            timelineItemDate:$scope.timelineDate,
            timelineItemTitle:$scope.timelineTitle,
            timelineItemText:$scope.timelineText
        });
        $scope.timelineDate = '';
        $scope.timelineTitle = '';
        $scope.timelineText = '';
    };

    $scope.deleteTimelineItem = function(timelineItem){
        var index = $scope.timelineItems.indexOf(timelineItem);
        $scope.timelineItems.splice(index, 1);
    };

    $scope.moveTimelineItem = function(direction, item){
        var index = $scope.timelineItems.indexOf(item);

        if ( direction === 'up'){
            if (index <= 0){
                return;
            } else{
                // Remove value to replace
                var removed = $scope.timelineItems.splice(index, 1);
                // Re-add removed value to the previous index
                $scope.timelineItems.splice(index - 1, 0, removed[0]);
            }
        } else {
            if (index >= $scope.timelineItems.length){
                return;
            } else{
                // Remove value to replace
                var removed = $scope.timelineItems.splice(index, 1);
                // Re-add removed value to the previous index
                $scope.timelineItems.splice(index + 1, 0, removed[0]);
            }
        }
    };
});

// INTRODUCAO
mainApp.directive("introducao", function($rootScope) {
    return {
        restrict: "E",
        templateUrl: "directives/introducao.html",
        scope: false
    }
});

// BLOCO DESTACADO
mainApp.directive("bloco", function($rootScope) {
    return {
        restrict: "E",
        templateUrl: "directives/bloco.html",
        scope: false
    }
});

// CITACAO
mainApp.directive("citacao", function($rootScope) {
    return {
        restrict: "E",
        templateUrl: "directives/citacao.html",
        scope: false
    }
});

// FIGURA
mainApp.directive("figura", function($rootScope) {
    return {
        restrict: "E",
        templateUrl: "directives/figura.html",
        scope: false
    }
});

// LISTA
mainApp.directive("lista", function($rootScope) {
    return {
        restrict: "E",
        templateUrl: "directives/lista.html",
        scope: false
    }
});

// LISTA NUMERADA
mainApp.directive("listanumerada", function($rootScope) {
    return {
        restrict: "E",
        templateUrl: "directives/lista-numerada.html",
        scope: false
    }
});

// TABELA
mainApp.directive("tabela", function($rootScope) {
    return {
        restrict: "E",
        templateUrl: "directives/tabela.html",
        scope: false
    }
});

// TIMELINE
mainApp.directive("timeline", function($rootScope) {
    return {
        restrict: "E",
        templateUrl: "directives/timeline.html",
        scope: false
    }
});

// VIDEO
mainApp.directive("videodiretiva", function($rootScope) {
    return {
        restrict: "E",
        templateUrl: "directives/video-diretiva.html",
        scope: false
    }
});

// ABAS
mainApp.directive("abas", function($rootScope) {
    return {
        restrict: "E",
        templateUrl: "directives/abas.html",
        scope: false
    }
});

// BOTAO
mainApp.directive("botao", function($rootScope) {
    return {
        restrict: "E",
        templateUrl: "directives/botao.html",
        scope: false
    }
});

// CARD
mainApp.directive("card", function($rootScope) {
    return {
        restrict: "E",
        templateUrl: "directives/card.html",
        scope: false
    }
});

// CARROSSEL
mainApp.directive("carrossel", function($rootScope) {
    return {
        restrict: "E",
        templateUrl: "directives/carrossel.html",
        scope: false
    }
});

// IMAGEM INTERATIVA
mainApp.directive("imageminterativa", function($rootScope) {
    return {
        restrict: "E",
        templateUrl: "directives/imagem-interativa.html",
        scope: false
    }
});

// JANELA POP-UP
mainApp.directive("modal", function($rootScope) {
    return {
        restrict: "E",
        templateUrl: "directives/modal.html",
        scope: false
    }
});

// SANFONA - ACCORDION
mainApp.directive("sanfona", function($rootScope) {
    return {
        restrict: "E",
        templateUrl: "directives/sanfona.html",
        scope: false
    }
});

// TOOLTIP
mainApp.directive("tooltip", function($rootScope) {
    return {
        restrict: "E",
        templateUrl: "directives/tooltip.html",
        scope: false
    }
});