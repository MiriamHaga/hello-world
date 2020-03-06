/**
 * Created by paulo on 06/11/17.
 */

function CacaPalavras(options, _feedAcerto, _feedErro) {
    var self = this;

    this.scorm = window.parent.SCORM || null;
    this.op = options || {};

    this.op.saveNote = this.op.saveNote || false;
    this.op.makeAttempt = this.op.makeAttempt || false;
    this.op.note = this.op.note || 10;

    this.op.hasSpecialCharacters = this.op.hasSpecialCharacters || false;
    this.op.height = this.op.height || this.getBiggerWordSize(this.op.words);
    this.op.width = this.op.width || this.getBiggerWordSize(this.op.words);
    this.op.fillBlanks = this.op.fillBlanks || true;
    this.op.preferOverlap = this.op.preferOverlap || true;
    this.op.maxAttempts = this.op.maxAttempts || 3;

    this.op.words = this.op.words.map(function (x) {
            return x.toUpperCase();
        }) || [
            "JULGAMENTO",
            "DISCERNIMENTO",
            "ENVOLVIMENTO",
            "CRÍTICA",
            "INVESTIGAÇÃO",
            "INTERESSE",
            "VALORES",
            "CRENÇAS",
            "INTENCIONALIDADE",
            "COMPREENSÃO",
            "AUTORREALIZAÇÃO"
        ];

    /**
     * op.words will keep the words that was configured and wordsArray will be used through the script,
     * it will be spliced when user find a certain word, so we need to duplicate that in order to restart
     * the game with the same old words.
     * @type {Array.<T>}
     */
    this.op.wordsArray = this.op.words.slice(0);

    this.op.orientations = this.op.orientations || ['horizontal','vertical','diagonal'];

    this.op.letters = this.op.letters || ('A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,X,Y,Z').split(',');

    if(this.op.hasSpecialCharacters) {
        this.op.letters = this.op.letters.concat(('Ç,Á,É,Í,Ó,Ú,Â,Ê,Î,Ô,Û').split(','));
    }

    this.orientations = this.op.orientations || [
            'horizontal',
            //'horizontalBack',
            'vertical',
            //'verticalUp',
            'diagonal',
            //'diagonalUp',
            //'diagonalBack',
            //'diagonalUpBack'
        ];

    this.positiveFeedback = _feedAcerto || "Parabéns! você acertou todas as respostas da atividade!";
    this.negativeFeedback = _feedErro || "Existem erros, por favor refaça a atividade!";

    // valida se existe a variavel do scorm do moodle
    if( this.scorm ) {
        //conferindo se o usuário pode refazer atividade
        if(!this.scorm.isActivityLocked()) {
            this.declareVariables();
            //init wordFind
            WordFindLib(this.op).newPuzzle(function () {
                self.endGame(self);
            });
        }
    }else{
        this.declareVariables();
        //init wordFind
        var puzzle = WordFindLib(this.op).newPuzzle(function () {
            self.endGame(self);
        });
        //WordFindLib(this.op).solve(puzzle); //uncomment to solve puzzle
    }
}

CacaPalavras.prototype.declareVariables = function () {
    var self = this;
    this.hideFeedback();

    this.btnRefazer = $("#btnRefazer");
    this.feedback = $("#feedback");

    this.btnRefazer.removeAttr("style");
    this.btnRefazer.hide();

    this.btnRefazer.one("click keydown", function(e){
        e.preventDefault();
        e.stopPropagation();
        self.clearAnswers()
    });
};

CacaPalavras.prototype.clearAnswers = function () {
    console.log("a");
    $(this.op.wordsEl).html("");
    new CacaPalavras(this.op, this.positiveFeedback, this.negativeFeedback);
};

CacaPalavras.prototype.showFeedback = function (message, callback) {
    var feedbackSpan = $("#feedback");

    feedbackSpan.html(message);
    feedbackSpan.attr("role", "alert");
    feedbackSpan.fadeIn(1000, function () {
        if(callback) callback();
    });

    setTimeout(this.hideFeedback, 6000);
};

CacaPalavras.prototype.hideFeedback = function (callback) {
    var feedbackSpan = $("#feedback");

    feedbackSpan.fadeOut(1000, function () {
        if(callback) callback();
    })
};

CacaPalavras.prototype.getBiggerWordSize = function (words) {
    for(var i = 0, j = words.length; i < j; i++) {
        var bigger = words[i].length;

        if(words[i].length > bigger)
            bigger = words[i].length;
    }

    return bigger;
};

CacaPalavras.prototype.endGame = function (scope) {
    console.log("acabou");
    this.showFeedback(scope.positiveFeedback);
    $(".cross-word-letter").off();
    this.setScormStatus(scope.op.saveNote);
};

//**************** WORD FIND LIBRARY *******************************
/*
* Lib adaptada de https://github.com/bunkat/wordfind, para usar:
* WordFindLib(this.op).newPuzzle(this.endGame);
*
* this.op é a variavel de configurações que foi passada na inicialização da atividade e this.endGame
* é a função chamada quando todas as palavras são encontradas.
*
* WordFindLib contém a parte do core do jogo, onde o caça palavras é criado;
* WordFindGame contém a parte do client, este recebe o caça palavras e o renderiza, aplicando também os
* eventos do usuário e controlando o jogo.
*
*/

/**
 * Wordfind.js 0.0.1
 * (c) 2012 Bill, BunKat LLC.
 * Wordfind is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/wordfind
 */


var WordFindLib = function (options) {
    // Letters used to fill blank spots in the puzzle
    var letters = options.letters;
    var words = options.wordsArray;

    /**
     * Definitions for all the different orientations in which words can be
     * placed within a puzzle. New orientation definitions can be added and they
     * will be automatically available.
     */

    // The list of all the possible orientations
    var allOrientations = options.orientations;

    // The definition of the orientation, calculates the next square given a
    // starting square (x,y) and distance (i) from that square.
    var orientations = {
        horizontal:     function(x,y,i) { return {x: x+i, y: y  }; },
        horizontalBack: function(x,y,i) { return {x: x-i, y: y  }; },
        vertical:       function(x,y,i) { return {x: x,   y: y+i}; },
        verticalUp:     function(x,y,i) { return {x: x,   y: y-i}; },
        diagonal:       function(x,y,i) { return {x: x+i, y: y+i}; },
        diagonalBack:   function(x,y,i) { return {x: x-i, y: y+i}; },
        diagonalUp:     function(x,y,i) { return {x: x+i, y: y-i}; },
        diagonalUpBack: function(x,y,i) { return {x: x-i, y: y-i}; }
    };

    // Determines if an orientation is possible given the starting square (x,y),
    // the height (h) and width (w) of the puzzle, and the length of the word (l).
    // Returns true if the word will fit starting at the square provided using
    // the specified orientation.
    var checkOrientations = {
        horizontal:     function(x,y,h,w,l) { return w >= x + l; },
        horizontalBack: function(x,y,h,w,l) { return x + 1 >= l; },
        vertical:       function(x,y,h,w,l) { return h >= y + l; },
        verticalUp:     function(x,y,h,w,l) { return y + 1 >= l; },
        diagonal:       function(x,y,h,w,l) { return (w >= x + l) && (h >= y + l); },
        diagonalBack:   function(x,y,h,w,l) { return (x + 1 >= l) && (h >= y + l); },
        diagonalUp:     function(x,y,h,w,l) { return (w >= x + l) && (y + 1 >= l); },
        diagonalUpBack: function(x,y,h,w,l) { return (x + 1 >= l) && (y + 1 >= l); }
    };

    // Determines the next possible valid square given the square (x,y) was ]
    // invalid and a word lenght of (l).  This greatly reduces the number of
    // squares that must be checked. Returning {x: x+1, y: y} will always work
    // but will not be optimal.
    var skipOrientations = {
        horizontal:     function(x,y,l) { return {x: 0,   y: y+1  }; },
        horizontalBack: function(x,y,l) { return {x: l-1, y: y    }; },
        vertical:       function(x,y,l) { return {x: 0,   y: y+100}; },
        verticalUp:     function(x,y,l) { return {x: 0,   y: l-1  }; },
        diagonal:       function(x,y,l) { return {x: 0,   y: y+1  }; },
        diagonalBack:   function(x,y,l) { return {x: l-1, y: x>=l-1?y+1:y    }; },
        diagonalUp:     function(x,y,l) { return {x: 0,   y: y<l-1?l-1:y+1  }; },
        diagonalUpBack: function(x,y,l) { return {x: l-1, y: x>=l-1?y+1:y  }; }
    };

    /**
     * Initializes the puzzle and places words in the puzzle one at a time.
     *
     * Returns either a valid puzzle with all of the words or null if a valid
     * puzzle was not found.
     *
     * @param {[String]} words: The list of words to fit into the puzzle
     * @param {[Options]} options: The options to use when filling the puzzle
     */
    var fillPuzzle = function (words, options) {

        var puzzle = [], i, j, len;

        // initialize the puzzle with blanks
        for (i = 0; i < options.height; i++) {
            puzzle.push([]);
            for (j = 0; j < options.width; j++) {
                puzzle[i].push('');
            }
        }

        // add each word into the puzzle one at a time
        for (i = 0, len = words.length; i < len; i++) {
            if (!placeWordInPuzzle(puzzle, options, words[i])) {
                // if a word didn't fit in the puzzle, give up
                return null;
            }
        }

        // return the puzzle
        return puzzle;
    };

    /**
     * Adds the specified word to the puzzle by finding all of the possible
     * locations where the word will fit and then randomly selecting one. Options
     * controls whether or not word overlap should be maximized.
     *
     * Returns true if the word was successfully placed, false otherwise.
     *
     * @param {[[String]]} puzzle: The current state of the puzzle
     * @param {[Options]} options: The options to use when filling the puzzle
     * @param {String} word: The word to fit into the puzzle.
     */
    var placeWordInPuzzle = function (puzzle, options, word) {

        // find all of the best locations where this word would fit
        var locations = findBestLocations(puzzle, options, word);

        if (locations.length === 0) {
            return false;
        }

        // select a location at random and place the word there
        var sel = locations[Math.floor(Math.random() * locations.length)];
        placeWord(puzzle, word, sel.x, sel.y, orientations[sel.orientation]);

        return true;
    };

    /**
     * Iterates through the puzzle and determines all of the locations where
     * the word will fit. Options determines if overlap should be maximized or
     * not.
     *
     * Returns a list of location objects which contain an x,y cooridinate
     * indicating the start of the word, the orientation of the word, and the
     * number of letters that overlapped with existing letter.
     *
     * @param {[[String]]} puzzle: The current state of the puzzle
     * @param {[Options]} options: The options to use when filling the puzzle
     * @param {String} word: The word to fit into the puzzle.
     */
    var findBestLocations = function (puzzle, options, word) {

        var locations = [],
            height = options.height,
            width = options.width,
            wordLength = word.length,
            maxOverlap = 0; // we'll start looking at overlap = 0

        // loop through all of the possible orientations at this position
        for (var k = 0, len = options.orientations.length; k < len; k++) {

            var orientation = options.orientations[k],
                check = checkOrientations[orientation],
                next = orientations[orientation],
                skipTo = skipOrientations[orientation],
                x = 0, y = 0;

            // loop through every position on the board
            while( y < height ) {

                // see if this orientation is even possible at this location
                if (check(x, y, height, width, wordLength)) {

                    // determine if the word fits at the current position
                    var overlap = calcOverlap(word, puzzle, x, y, next);

                    // if the overlap was bigger than previous overlaps that we've seen
                    if (overlap >= maxOverlap || (!options.preferOverlap && overlap > -1)) {
                        maxOverlap = overlap;
                        locations.push({x: x, y: y, orientation: orientation, overlap: overlap});
                    }

                    x++;
                    if (x >= width) {
                        x = 0;
                        y++;
                    }
                }
                else {
                    // if current cell is invalid, then skip to the next cell where
                    // this orientation is possible. this greatly reduces the number
                    // of checks that we have to do overall
                    var nextPossible = skipTo(x,y,wordLength);
                    x = nextPossible.x;
                    y = nextPossible.y;
                }

            }
        }

        // finally prune down all of the possible locations we found by
        // only using the ones with the maximum overlap that we calculated
        return options.preferOverlap ?
            pruneLocations(locations, maxOverlap) :
            locations;
    };

    /**
     * Determines whether or not a particular word fits in a particular
     * orientation within the puzzle.
     *
     * Returns the number of letters overlapped with existing words if the word
     * fits in the specified position, -1 if the word does not fit.
     *
     * @param {String} word: The word to fit into the puzzle.
     * @param {[[String]]} puzzle: The current state of the puzzle
     * @param {int} x: The x position to check
     * @param {int} y: The y position to check
     * @param {function} fnGetSquare: Function that returns the next square
     */
    var calcOverlap = function (word, puzzle, x, y, fnGetSquare) {
        var overlap = 0;

        // traverse the squares to determine if the word fits
        for (var i = 0, len = word.length; i < len; i++) {

            var next = fnGetSquare(x, y, i),
                square = puzzle[next.y][next.x];

            // if the puzzle square already contains the letter we
            // are looking for, then count it as an overlap square
            if (square === word[i]) {
                overlap++;
            }
            // if it contains a different letter, than our word doesn't fit
            // here, return -1
            else if (square !== '' ) {
                return -1;
            }
        }

        // if the entire word is overlapping, skip it to ensure words aren't
        // hidden in other words
        return overlap;
    };

    /**
     * If overlap maximization was indicated, this function is used to prune the
     * list of valid locations down to the ones that contain the maximum overlap
     * that was previously calculated.
     *
     * Returns the pruned set of locations.
     *
     * @param {[Location]} locations: The set of locations to prune
     * @param {int} overlap: The required level of overlap
     */
    var pruneLocations = function (locations, overlap) {

        var pruned = [];
        for(var i = 0, len = locations.length; i < len; i++) {
            if (locations[i].overlap >= overlap) {
                pruned.push(locations[i]);
            }
        }

        return pruned;
    };

    /**
     * Places a word in the puzzle given a starting position and orientation.
     *
     * @param {[[String]]} puzzle: The current state of the puzzle
     * @param {String} word: The word to fit into the puzzle.
     * @param {int} x: The x position to check
     * @param {int} y: The y position to check
     * @param {function} fnGetSquare: Function that returns the next square
     */
    var placeWord = function (puzzle, word, x, y, fnGetSquare) {
        for (var i = 0, len = word.length; i < len; i++) {
            var next = fnGetSquare(x, y, i);
            puzzle[next.y][next.x] = word[i];
        }
    };

    return {

        /**
         * Returns the list of all of the possible orientations.
         * @api public
         */
        validOrientations: allOrientations,

        /**
         * Returns the orientation functions for traversing words.
         * @api public
         */
        orientations: orientations,

        /**
         * Generates a new word find (word search) puzzle.
         *
         * Settings:
         *
         * height: desired height of the puzzle, default: smallest possible
         * width:  desired width of the puzzle, default: smallest possible
         * orientations: list of orientations to use, default: all orientations
         * fillBlanks: true to fill in the blanks, default: true
         * maxAttempts: number of tries before increasing puzzle size, default:3
         * preferOverlap: maximize word overlap or not, default: true
         *
         * Returns the puzzle that was created.
         *
         * @param {[String]} words: List of words to include in the puzzle
         * @param {options} settings: The options to use for this puzzle
         * @api public
         */
        newPuzzle: function(endGameCallback) {
            var wordList, puzzle, attempts = 0;

            // add the words to the puzzle
            // since puzzles are random, attempt to create a valid one up to
            // maxAttempts and then increase the puzzle size and try again
            while (!puzzle) {
                while (!puzzle && attempts++ < options.maxAttempts) {
                    puzzle = fillPuzzle(options.wordsArray, options);
                }

                if (!puzzle) {
                    options.height++;
                    options.width++;
                    attempts = 0;
                }
            }

            // fill in empty spaces with random letters
            if (options.fillBlanks) {
                this.fillBlanks(puzzle, options);
            }

            //this.print(puzzle); //uncomment for debugging

            WordFindGame(options, orientations, endGameCallback).create(puzzle);

            return puzzle;
        },

        /**
         * Fills in any empty spaces in the puzzle with random letters.
         *
         * @param {[[String]]} puzzle: The current state of the puzzle
         * @api public
         */
        fillBlanks: function (puzzle) {
            for (var i = 0, height = puzzle.length; i < height; i++) {
                var row = puzzle[i];
                for (var j = 0, width = row.length; j < width; j++) {

                    if (!puzzle[i][j]) {
                        var randomLetter = Math.floor(Math.random() * letters.length);
                        puzzle[i][j] = letters[randomLetter];
                    }
                }
            }
        },

        /**
         * Returns the starting location and orientation of the specified words
         * within the puzzle. Any words that are not found are returned in the
         * notFound array.
         *
         * Returns
         *   x position of start of word
         *   y position of start of word
         *   orientation of word
         *   word
         *   overlap (always equal to word.length)
         *
         * @param {[[String]]} puzzle: The current state of the puzzle
         * @api public
         */
        solve: function (puzzle) {
            var options = {
                    height:       puzzle.length,
                    width:        puzzle[0].length,
                    orientations: allOrientations,
                    preferOverlap: true
                },
                found = [],
                notFound = [];

            for(var i = 0, len = words.length; i < len; i++) {
                var word = words[i],
                    locations = findBestLocations(puzzle, options, word);

                if (locations.length > 0 && locations[0].overlap === word.length) {
                    locations[0].word = word;
                    found.push(locations[0]);
                }
                else {
                    notFound.push(word);
                }
            }

            WordFindGame(options, orientations)
                .solve(puzzle, options.wordsArray, { found: found, notFound: notFound }, this);

            return { found: found, notFound: notFound };
        },

        /**
         * Outputs a puzzle to the console, useful for debugging.
         * Returns a formatted string representing the puzzle.
         *
         * @param {[[String]]} puzzle: The current state of the puzzle
         * @api public
         */
        print: function (puzzle) {
            var puzzleString = '';
            for (var i = 0, height = puzzle.length; i < height; i++) {
                var row = puzzle[i];
                for (var j = 0, width = row.length; j < width; j++) {
                    puzzleString += (row[j] === '' ? ' ' : row[j]) + ' ';
                }
                puzzleString += '\n';
            }

            console.log(puzzleString);
            return puzzleString;
        }
    };
};


//**************** WORD FIND LIBRARY *******************************

//**************** WORD FIND GAME **********************************
/*
 * WordFindGame tem a função Create que é chamada automaticamente pelo WordFindLib.newPuzzle quando esta gera
 * o caça palavras.
 * Também cria a lista de palavras a serem achadas automaticamente, aplica as classes corretas quando as
 * palavras são achadas, tanto no tabuleiro quanto na lista de palavras a serem achadas.
 * Quando todas as palavras foram achadas o endGameCallback é chamado, acionando a função endGame.
 */

/**
 * WordFindGame tem a função Create que é chamada automaticamente pelo WordFindLib.newPuzzle quando esta gera
 * o caça palavras.
 * Também cria a lista de palavras a serem achadas automaticamente, aplica as classes corretas quando as
 * palavras são achadas, tanto no tabuleiro quanto na lista de palavras a serem achadas.
 * Quando todas as palavras foram achadas o endGameCallback é chamado, acionando a função endGame.
 *
 * @param options é a variavel de configuração fornecida no início da atividade
 * @param orientations é um objeto com as funções que definem cada orientação, criado pelo WordFindLib
 * @param endGameCallback
 * @returns {{create: create}} renderiza o jogo e aplica os eventos e controles
 * @constructor
 */
var WordFindGame = function(options, orientations, endGameCallback) {
    /**
     * Draws the puzzle by inserting rows of buttons into el.
     *
     * @param {String} el: The jQuery element to write the puzzle to
     * @param {[[String]]} puzzle: The puzzle to draw
     */
    var drawPuzzle = function (el, puzzle) {

        var output = '';
        // for each row in the puzzle
        for (var i = 0, height = puzzle.length; i < height; i++) {
            // append a div to represent a row in the puzzle
            var row = puzzle[i];
            output += '<div>';
            // for each element in that row
            for (var j = 0, width = row.length; j < width; j++) {
                // append our button with the appropriate class
                output += '<div class="cross-word-letter" x="' + j + '" y="' + i + '">';
                output += row[j] || '&nbsp;';
                output += '</div>';
            }
            // close our div that represents a row
            output += '</div>';
        }

        $(el).html(output);
    };

    /**
     * Draws the words by inserting an list into el.
     *
     * @param {String} el: The jQuery element to write the words to
     * @param {[String]} words: The words to draw
     */
    var drawWords = function (el, words) {
        var col1 = document.createElement('ul');
        //var col2 = document.createElement('ul');

        for (var i = 0, len = words.length; i < len; i++) {
            var word = words[i];

            //place elements on two columns
            //bitwise to check if is odd
            //if(!(i & 1)) {
                col1.innerHTML += '<li class="word" data-word="' + word + '">' + word;
            //}
            //else {
                //col2.innerHTML += '<li class="word ' + word + '">' + word;
            //}
        }

        $(el).append(col1);
        //$(el).append(col2);
    };


    /**
     * Game play events.
     *
     * The following events handle the turns, word selection, word finding, and
     * game end.
     *
     */

    // Game state
    var startSquare, selectedSquares = [], curOrientation, curWord = '';

    /**
     * Event that handles mouse down on a new square. Initializes the game state
     * to the letter that was selected.
     *
     */
    var startTurn = function () {
        $(this).addClass('selected');
        startSquare = this;
        selectedSquares.push(this);
        curWord = $(this).text();
    };



    /**
     * Event that handles mouse over on a new square. Ensures that the new square
     * is adjacent to the previous square and the new square is along the path
     * of an actual word.
     *
     */
    var select = function (target) {
        // if the user hasn't started a word yet, just return
        if (!startSquare) {
            return;
        }

        // if the new square is actually the previous square, just return
        var lastSquare = selectedSquares[selectedSquares.length-1];
        if (lastSquare == target) {
            return;
        }

        // see if the user backed up and correct the selectedSquares state if
        // they did
        var backTo;
        for (var i = 0, len = selectedSquares.length; i < len; i++) {
            if (selectedSquares[i] == target) {
                backTo = i+1;
                break;
            }
        }

        while (backTo < selectedSquares.length) {
            $(selectedSquares[selectedSquares.length-1]).removeClass('selected');
            selectedSquares.splice(backTo,1);
            curWord = curWord.substr(0, curWord.length-1);
        }


        // see if this is just a new orientation from the first square
        // this is needed to make selecting diagonal words easier
        var newOrientation = calcOrientation(
            $(startSquare).attr('x')-0,
            $(startSquare).attr('y')-0,
            $(target).attr('x')-0,
            $(target).attr('y')-0
        );

        if (newOrientation) {
            selectedSquares = [startSquare];
            curWord = $(startSquare).text();
            if (lastSquare !== startSquare) {
                $(lastSquare).removeClass('selected');
                lastSquare = startSquare;
            }
            curOrientation = newOrientation;
        }

        // see if the move is along the same orientation as the last move
        var orientation = calcOrientation(
            $(lastSquare).attr('x')-0,
            $(lastSquare).attr('y')-0,
            $(target).attr('x')-0,
            $(target).attr('y')-0
        );

        // if the new square isn't along a valid orientation, just ignore it.
        // this makes selecting diagonal words less frustrating
        if (!orientation) {
            return;
        }

        // finally, if there was no previous orientation or this move is along
        // the same orientation as the last move then play the move
        if (!curOrientation || curOrientation === orientation) {
            curOrientation = orientation;
            playTurn(target);
        }

    };

    var touchMove = function(e) {
        var xPos = e.originalEvent.touches[0].pageX;
        var yPos = e.originalEvent.touches[0].pageY;
        var targetElement = document.elementFromPoint(xPos, yPos);
        select(targetElement)
    };

    var mouseMove = function() {
        select(this);
    };

    /**
     * Updates the game state when the previous selection was valid.
     *
     * @param {el} square: The jQuery element that was played
     */
    var playTurn = function (square) {

        // make sure we are still forming a valid word
        for (var i = 0, len = options.wordsArray.length; i < len; i++) {
            if (options.wordsArray[i].indexOf(curWord + $(square).text()) === 0) {
                $(square).addClass('selected');
                selectedSquares.push(square);
                curWord += $(square).text();
                break;
            }
        }
    };

    /**
     * Event that handles mouse up on a square. Checks to see if a valid word
     * was created and updates the class of the letters and word if it was. Then
     * resets the game state to start a new word.
     *
     */
    var endTurn = function () {

        // see if we formed a valid word
        for (var i = 0, len = options.wordsArray.length; i < len; i++) {

            if (options.wordsArray[i] === curWord) {
                $('.selected').addClass('found');
                options.wordsArray.splice(i,1);
                $('[data-word="' + curWord + '"]').addClass('wordFound');
            }

            if (options.wordsArray.length === 0) {
                //$('.puzzleSquare').addClass('complete');
                endGameCallback();
            }
        }

        // reset the turn
        $('.selected').removeClass('selected');
        startSquare = null;
        selectedSquares = [];
        curWord = '';
        curOrientation = null;
    };

    /**
     * Given two points, ensure that they are adjacent and determine what
     * orientation the second point is relative to the first
     *
     * @param {int} x1: The x coordinate of the first point
     * @param {int} y1: The y coordinate of the first point
     * @param {int} x2: The x coordinate of the second point
     * @param {int} y2: The y coordinate of the second point
     */
    var calcOrientation = function (x1, y1, x2, y2) {

        for (var orientation in orientations) {
            var nextFn = orientations[orientation];
            var nextPos = nextFn(x1, y1, 1);

            if (nextPos.x === x2 && nextPos.y === y2) {
                return orientation;
            }
        }

        return null;
    };

    return {

        /**
         * Creates a new word find game and draws the board and words.
         *
         * Returns the puzzle that was created.
         *
         * @param {[String]} words: The words to add to the puzzle
         * @param {String} puzzleEl: Selector to use when inserting the puzzle
         * @param {String} wordsEl: Selector to use when inserting the word list
         * @param {Options} options: WordFind options to use when creating the puzzle
         */
        create: function(puzzle) {
            // draw out all of the words
            drawPuzzle(options.puzzleEl, puzzle);
            drawWords(options.wordsEl, options.wordsArray);

            var puzzleLetters = $(".cross-word-letter");

            // attach events to the buttons
            // optimistically add events for windows 8 touch
            if (window.navigator.msPointerEnabled) {
                puzzleLetters.on('MSPointerDown', startTurn);
                puzzleLetters.on('MSPointerOver', select);
                puzzleLetters.on('MSPointerUp', endTurn);
            }
            else {
                puzzleLetters.mousedown(startTurn);
                puzzleLetters.mouseenter(mouseMove);
                puzzleLetters.mouseup(endTurn);
                puzzleLetters.on("touchstart", startTurn);
                puzzleLetters.on("touchmove", touchMove);
                puzzleLetters.on("touchend", endTurn);
            }

            return puzzle;
        },

        /**
         * Solves an existing puzzle.
         * @param puzzle
         * @param words
         * @param answers
         * @param wordFindLib
         */
        solve: function(puzzle, words, answers, wordFindLib) {
            var solution = answers.found;

            for( var i = 0, len = solution.length; i < len; i++) {
                var word = solution[i].word,
                    orientation = solution[i].orientation,
                    x = solution[i].x,
                    y = solution[i].y,
                    next = wordFindLib.orientations[orientation];

                if (!$('.' + word).hasClass('wordFound')) {
                    for (var j = 0, size = word.length; j < size; j++) {
                        var nextPos = next(x, y, j);
                        $('[x="' + nextPos.x + '"][y="' + nextPos.y + '"]').addClass('solved');
                    }

                    $('.' + word).addClass('wordFound');
                }
            }
        }
    };
};

//**************** WORD FIND GAME **********************************

//**************** SCORM *******************************************

CacaPalavras.prototype.setScormStatus = function (status) {

    if(this.scorm) {
        //caso usuário acerte todas as questões
        if(status) {
            // SCORM - altera o status da atividade como finalizada
            this.scorm.completePage();

            if (this.op.saveNote) {
                this.scorm.setSCOScore(this.op.note);
            }

            if (this.op.makeAttempt) {
                this.scorm.makeAttempt(true);
                this.btnRefazer.remove();
            }else{
                this.btnRefazer.show();
            }
        }else{

            if (this.op.makeAttempt) this.scorm.makeAttempt(false);

            if(!this.scorm.isActivityLocked())
                this.btnRefazer.show().attr("tabindex", "0");
            else{
                this.btnRefazer.remove();
                this.showFeedback("Você não possui mais nenhuma tentativa de resposta! Finalizada a Disciplina você poderá verificar a resposta correta comentada, que estará disponível na Biblioteca do curso.");
            }
        }
    }
};

//**************** SCORM *******************************************