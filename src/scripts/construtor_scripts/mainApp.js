var mainApp = angular.module("mainApp", []);

mainApp.controller('mainController', function($scope) {
    $scope.elements = [{
        name: "bloco",
        title: "Bloco destacado",
        interactive: false
    }, {
        name: "citacao",
        title: "Citação",
        interactive: false
    }, {
        name: "figura",
        title: "Figura",
        interactive: false
    }, {
        name: "lista",
        title: "Lista",
        interactive: false
    }, {
        name: "listanumerada",
        title: "Lista numerada",
        interactive: false
    }, {
        name: "tabela",
        title: "Tabela",
        interactive: false
    }, {
        name: "timeline",
        title: "Timeline",
        interactive: false
    }, {
        name: "videodiretiva",
        title: "Vídeo",
        interactive: false
    }, {
        name: "abas",
        title: "Abas (tabs)",
        interactive: true
    }, {
        name: "botao",
        title: "Botão (link)",
        interactive: true
    }, {
        name: "card",
        title: "Card",
        interactive: true
    }, {
        name: "carrossel",
        title: "Carrossel",
        interactive: true
    }, {
        name: "imageminterativa",
        title: "Imagem interativa",
        interactive: true
    }, {
        name: "modal",
        title: "Janela pop-up (modal)",
        interactive: true
    }, {
        name: "sanfona",
        title: "Sanfona (accordion)",
        interactive: true
    }, {
        name: "tooltip",
        title: "Tooltip",
        interactive: true
    }, {
        name: "associacaocolunas",
        title: "Associação de colunas",
        activity: true
    }];
    $scope.element = "";

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
        if ( $scope.timelineDate && $scope.timelineTexts) {
            $scope.timelineItems.push({
                timelineItemDate: $scope.timelineDate,
                timelineItemTitle: $scope.timelineTitle,
                timelineItemTexts: $scope.timelineTexts
            });
            $scope.timelineDate = '';
            $scope.timelineTitle = '';
            $scope.timelineTexts = [];
        }
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

    // VIDEO DEFAULT
    $scope.videoType = '1';

    $scope.setVideoIframe = function(source,id) {
        if ( source === 'yt'){
            return "https://www.youtube.com/embed/" + id;
        }

        if ( source === 'vm'){
            return "https://player.vimeo.com/video/" + id;
        }
    };

    // TABS ITEMS
    $scope.tabItems = [];

    $scope.addTab = function(){
        if ( $scope.tabTitle && $scope.tabTexts ){
            $scope.tabItems.push({
                tabItemTitle:$scope.tabTitle,
                tabItemTexts:$scope.tabTexts
            });
            $scope.tabTitle = '';
            $scope.tabTexts = [];
        }
    };

    $scope.deleteTab = function(tabItem){
        var index = $scope.tabItems.indexOf(tabItem);
        $scope.tabItems.splice(index, 1);
    };

    $scope.moveTab = function(direction, item){
        var index = $scope.tabItems.indexOf(item);

        if ( direction === 'up'){
            if (index <= 0){
                return;
            } else{
                // Remove value to replace
                var removed = $scope.tabItems.splice(index, 1);
                // Re-add removed value to the previous index
                $scope.tabItems.splice(index - 1, 0, removed[0]);
            }
        } else {
            if (index >= $scope.tabItems.length){
                return;
            } else{
                // Remove value to replace
                var removed = $scope.tabItems.splice(index, 1);
                // Re-add removed value to the previous index
                $scope.tabItems.splice(index + 1, 0, removed[0]);
            }
        }
    };

    // CAROUSEL ITEMS
    $scope.carouselItems = [];

    $scope.addCarouselItem = function(){
        if ( $scope.carouselTitle || $scope.carouselTexts) {
            $scope.carouselItems.push({
                carouselItemTitle: $scope.carouselTitle,
                carouselItemTexts: $scope.carouselTexts
            });
            $scope.carouselTitle = '';
            $scope.carouselTexts = [];
        }
    };

    $scope.deleteCarouselItem = function(carouselItem){
        var index = $scope.carouselItems.indexOf(carouselItem);
        $scope.carouselItems.splice(index, 1);
    };

    $scope.moveCarouselItem = function(direction, item){
        var index = $scope.carouselItems.indexOf(item);

        if ( direction === 'up'){
            if (index <= 0){
                return;
            } else{
                // Remove value to replace
                var removed = $scope.carouselItems.splice(index, 1);
                // Re-add removed value to the previous index
                $scope.carouselItems.splice(index - 1, 0, removed[0]);
            }
        } else {
            if (index >= $scope.carouselItems.length){
                return;
            } else{
                // Remove value to replace
                var removed = $scope.carouselItems.splice(index, 1);
                // Re-add removed value to the previous index
                $scope.carouselItems.splice(index + 1, 0, removed[0]);
            }
        }
    };

    // INTERACTIVE IMG ITEMS
    $scope.interactiveImgItems = [];

    $scope.addInteractiveImgItem = function(){
        if ( $scope.interactiveImgTitle || $scope.interactiveImgText) {
            $scope.interactiveImgItems.push({
                interactiveImgItemTitle: $scope.interactiveImgTitle,
                interactiveImgItemText: $scope.interactiveImgText,
                interactiveImgItemVertPosition: 0,
                interactiveImgItemHorPosition: 0
            });
            $scope.interactiveImgTitle = '';
            $scope.interactiveImgText = '';
        }
    };

    $scope.moveInteractiveImgBtn = function(position, interactiveImgItem){
        var index = $scope.interactiveImgItems.indexOf(interactiveImgItem);

        if ( position == 'top'){
            $scope.interactiveImgItems[index].interactiveImgItemVertPosition=$scope.interactiveImgItems[index].interactiveImgItemVertPosition-1;
        } else if ( position == 'bottom'){
            $scope.interactiveImgItems[index].interactiveImgItemVertPosition=$scope.interactiveImgItems[index].interactiveImgItemVertPosition+1;
        } else if ( position == 'left'){
            $scope.interactiveImgItems[index].interactiveImgItemHorPosition=$scope.interactiveImgItems[index].interactiveImgItemHorPosition-1;
        } else if ( position == 'right'){
            $scope.interactiveImgItems[index].interactiveImgItemHorPosition=$scope.interactiveImgItems[index].interactiveImgItemHorPosition+1;
        }
    };

    $scope.deleteInteractiveImgItem = function(interactiveImgItem){
        var index = $scope.interactiveImgItems.indexOf(interactiveImgItem);
        $scope.interactiveImgItems.splice(index, 1);
    };

    $scope.interactiveImgSrc = "";
    $scope.$on("fileProgress", function(e, progress) {
        $scope.progress = progress.loaded / progress.total;
    });

    // ACCORDION ITEMS
    $scope.accordionItems = [];

    $scope.addAccordion = function(){
        if ( $scope.accordionTitle && $scope.accordionTexts ){
            $scope.accordionItems.push({
                accordionItemTitle:$scope.accordionTitle,
                accordionItemTexts:$scope.accordionTexts
            });
            $scope.accordionTitle = '';
            $scope.accordionTexts = [];
        }
    };

    $scope.deleteAccordion = function(accordionItem){
        var index = $scope.accordionItems.indexOf(accordionItem);
        $scope.accordionItems.splice(index, 1);
    };

    $scope.moveAccordion = function(direction, item){
        var index = $scope.accordionItems.indexOf(item);

        if ( direction === 'up'){
            if (index <= 0){
                return;
            } else{
                // Remove value to replace
                var removed = $scope.accordionItems.splice(index, 1);
                // Re-add removed value to the previous index
                $scope.accordionItems.splice(index - 1, 0, removed[0]);
            }
        } else {
            if (index >= $scope.accordionItems.length){
                return;
            } else{
                // Remove value to replace
                var removed = $scope.accordionItems.splice(index, 1);
                // Re-add removed value to the previous index
                $scope.accordionItems.splice(index + 1, 0, removed[0]);
            }
        }
    };

    // COLUMNS ASSOCIATION ITENS
    $scope.associationColItens = [];
    $scope.associationColAnswersItens = [];
    $scope.associationColId = 0;

    $scope.addAssociationColItem = function(){
        if ( $scope.associationCol1Item && $scope.associationCol2Item ){
            $scope.associationColId++;

            $scope.associationColItens.push({
                associationColText:$scope.associationCol1Item,
                associationColAnswerId:$scope.associationColId
            });
            $scope.associationColAnswersItens.push({
                associationColText:$scope.associationCol1Item,
                associationColAnswer:$scope.associationCol2Item,
                associationColAnswerId:$scope.associationColId
            });
            $scope.associationCol1Item = '';
            $scope.associationCol2Item = '';
        }
    };

    $scope.deleteAssociationCol = function(associationItem){
        var index = $scope.associationColItens.indexOf(associationItem);
        $scope.associationColItens.splice(index, 1);

        var indexAnswer = $scope.associationColAnswersItens.indexOf(associationItem);
        $scope.associationColAnswersItens.splice(indexAnswer, 1);
    };

    $scope.moveAssociationCol = function(direction, associationItem){
        var indexAnswer = $scope.associationColAnswersItens.indexOf(associationItem);

        if ( direction === 'up'){
            if (indexAnswer <= 0){
                return;
            } else{
                // Remove value to replace
                var removed = $scope.associationColAnswersItens.splice(indexAnswer, 1);
                // Re-add removed value to the previous index
                $scope.associationColAnswersItens.splice(indexAnswer - 1, 0, removed[0]);
            }
        } else {
            if (indexAnswer >= $scope.associationColAnswersItens.length){
                return;
            } else{
                // Remove value to replace
                var removed = $scope.associationColAnswersItens.splice(indexAnswer, 1);
                // Re-add removed value to the previous index
                $scope.associationColAnswersItens.splice(indexAnswer + 1, 0, removed[0]);
            }
        }
    };
});

mainApp.filter('trustAsResourceUrl', ['$sce', function ($sce) {
    return function (val) {
        return $sce.trustAsResourceUrl(val);
    };
}]);

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

// ASSOCIACAO COLUNAS
mainApp.directive("associacaocolunas", function($rootScope) {
    return {
        restrict: "E",
        templateUrl: "directives/associacao-colunas.html",
        scope: false
    }
});



// -- UPLOAD DE IMAGENS --
mainApp.directive("ngFileSelect", function(fileReader, $timeout) {
    return {
        scope: {
            ngModel: '='
        },
        link: function($scope, el) {
            function getFile(file) {
                fileReader.readAsDataUrl(file, $scope)
                    .then(function(result) {
                        $timeout(function() {
                            $scope.ngModel = result;
                        });
                    });
            }

            el.bind("change", function(e) {
                var file = (e.srcElement || e.target).files[0];
                getFile(file);
            });
        }
    };
});

mainApp.factory("fileReader", function($q, $log) {
    var onLoad = function(reader, deferred, scope) {
        return function() {
            scope.$apply(function() {
                deferred.resolve(reader.result);
            });
        };
    };

    var onError = function(reader, deferred, scope) {
        return function() {
            scope.$apply(function() {
                deferred.reject(reader.result);
            });
        };
    };

    var onProgress = function(reader, scope) {
        return function(event) {
            scope.$broadcast("fileProgress", {
                total: event.total,
                loaded: event.loaded
            });
        };
    };

    var getReader = function(deferred, scope) {
        var reader = new FileReader();
        reader.onload = onLoad(reader, deferred, scope);
        reader.onerror = onError(reader, deferred, scope);
        reader.onprogress = onProgress(reader, scope);
        return reader;
    };

    var readAsDataURL = function(file, scope) {
        var deferred = $q.defer();

        var reader = getReader(deferred, scope);
        reader.readAsDataURL(file);

        return deferred.promise;
    };

    return {
        readAsDataUrl: readAsDataURL
    };
});