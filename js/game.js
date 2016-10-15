// game planning
//
// objects:
// - Piece(symbol)
//		var String:symbol
//		placeAt(Position): places the game piece at that position
// - Board
//		var String:board[r][c]: 2d array 
//		newBoard(): resets the board array
//		getSymbolOfPieceAt(): gets the symbol of the players piece at (row, col)
//		placePiece(row, col, symbol): places a piece at (row, col)
//		containsWin(): determines if there is a winning configuration
//		render(): draws the board configuration
// - Game
//		const var int:PVP = 0
//		const var int:PVC = 1
//		var gameMode
//		start(): starts the game
//		restart(): resets the game
//		setGameMode(mode): sets game mode to PvP or PvC

var Modes = {
	PVP: 0,
	PVC: 1,
}
var emptySymbol = "&nbsp;";

var Piece = function(symbol) {
	this.symbol = symbol;
}
Piece.prototype.placeAt = function(position) {
	this.position = position;
};
Piece.prototype.getSymbol = function() { return this.symbol; }

var gameBoard = {
	numOccupiedSquares: 0,
	board: function() {
		return newBoard();
	},
	newBoard: function() {
		var b = [];
		for(var i = 0; i < 3; i++) {
			b.push([new Piece(emptySymbol), new Piece(emptySymbol), new Piece(emptySymbol)]);
		}
		return b;
	},
	getSymbolOfPieceAt: function(r, c) {
		return gameBoard.board[r][c].getSymbol();
	},
	placePieceAt: function(r, c, symbol) {
		gameBoard.board[r][c] = new Piece(symbol);
		gameBoard.numOccupiedSquares++;
	},
	render: function() {
		$("#grid").html("");
		for(var r = 0; r < 3; r++) {
			var row = "<div class='row' id='r"+r+"'>";
			for(var c = 0; c < 3; c++) {
				var symbol = this.getSymbolOfPieceAt(r, c);
				row += "<div class='box' id='c"+c+"'>" + symbol + "</div>";
			}
			row += "</div>";
			$("#grid").append(row);
		}
	},
	containsWin: function() {
		function lookAtStraightWin(vertical) {
			for(var c = 0; c < 3; c++) {
				var win = true;
				var symbol = vertical ? gameBoard.getSymbolOfPieceAt(0,c) : gameBoard.getSymbolOfPieceAt(c,0);
				for(var r = 0; r < 3; r++) {
					var currentPiece = vertical ? gameBoard.getSymbolOfPieceAt(r,c) : gameBoard.getSymbolOfPieceAt(c,r);
					if((currentPiece === emptySymbol) || (currentPiece !== symbol)) {		
						win = false;
					}
				}
				if(win) return true;
			}
			return false;
		}

		function lookAtDiagonalFromLeft(leftToRight) {
			var r = leftToRight ? 0 : 2;
			var win = true;
			var symbol = gameBoard.getSymbolOfPieceAt(r,0);
			for(var c = 0; c < 3; c++) {
				var currentPiece = gameBoard.getSymbolOfPieceAt(r,c);
				if((currentPiece === emptySymbol) || (currentPiece !== symbol)) win = false;
				r = leftToRight ? r+1 : r-1;		
			}
			return win;
		}

		function lookAtCols() {
			return lookAtStraightWin(true);
		}
		function lookAtRows() {
			return lookAtStraightWin(false);
		}
		function lookAtDiagonal() {
			return lookAtDiagonalFromLeft(true) || lookAtDiagonalFromLeft(false);
		}

		return lookAtCols() || lookAtRows() || lookAtDiagonal();
	}
}

var game = {
	gameMode: Modes.PVC,
	over: false,
	start: function() {
		game.restart();
		gameBoard.render();
	},
	restart: function() {
		gameBoard.board = gameBoard.newBoard();
		game.over = false;
		gameBoard.numOccupiedSquares = 0;
		gameBoard.render();
	},
	setGameMode: function(mode) {
		gameMode = mode;
	}
}	

$(document).ready(function() {
	var isPlayer1Turn = true;
	var col, row;
	var player1Symbol = "X", player2Symbol = "O";

	$("#gameover").hide();
	$("#turn").html("Player 1's turn.");
	game.start();

	function getTurn() {
		var symbol = "";
		if(isPlayer1Turn) {
			symbol = player1Symbol;
			$("#turn").html("Player 2's turn.");
			isPlayer1Turn = false;
		} else {
			symbol = player2Symbol;
			$("#turn").html("Player 1's turn.");
			isPlayer1Turn = true;
		}
		gameBoard.placePieceAt(row, col, symbol);
		gameBoard.render();

		if(gameBoard.containsWin()) {
			if(isPlayer1Turn) gameOver("Player 2 wins!");
			else gameOver("Player 1 wins!");
		} else if(gameBoard.numOccupiedSquares === 9) {
			gameOver("Tie game!");
		}
	}

	function restart() {
		isPlayer1Turn = true;
		game.restart();
	}

	function gameOver(winner) {
		game.over = true;
		$("#gameover #winner").html(winner);
		$("#gameover").show();
	}

	$("#grid").on("click", ".box", function() {
		if(!game.over) {
			col = parseInt($(this).attr('id').charAt(1));
			row = parseInt($(this).parent().attr('id').charAt(1));

			if(gameBoard.getSymbolOfPieceAt(row, col) === emptySymbol) {
				getTurn();
			}
		}
	});

	$("#gameover #close").click(function() {
		$("#gameover").hide();
	});

	$("#gameover #restart").click(function() {
		restart();
		$("#gameover").hide();
	});
});