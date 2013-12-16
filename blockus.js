var DEBUG = false;

function Point(x_, y_) {
	this.x = x_;
	this.y = y_;

	/**
	 * Takes this point and rotates it by the given angle about the optional
	 * given origin, default being (0,0), and returns the new point
	 * @param angle in radians
	 * @param originX default 0
	 * @param originY default 0
	 * @returns new Point
	 */
	this.rotate = function(angle, originX, originY) {
		if (typeof originX == 'undefined') { originX = 0; }
		if (typeof originY == 'undefined') { originY = 0; }
		var newX = Math.cos(angle) * (this.x - originX) - Math.sin(angle) * (this.y - originY) + originX;
		var newY = Math.sin(angle) * (this.x - originX) + Math.cos(angle) * (this.y - originY) + originY;
		return new Point(newX, newY);
	};

	this.equals = function(other) {
		return this.x == other.x && this.y == other.y;
	};
}

/**
 * A real piece that is drawn on the board
 * Can be positioned, rotated, and flipped
 */
function Piece(gl, shaderProgram, color, vertices, indices, pointsOfCenters) {
	var _gl = gl;
	var _shaderProgram = shaderProgram;
	var _color = color;

	var _loc = new Point(0,0);

	var self = this;

	var _flipped = false;
	var _rotation = 0;

	var _vertexBuffer;
	var _vertexColorBuffer;
	var _indexBuffer;

	var _pointsOfCenters = [];

	var _init = function(vertices, indices) {
		if (typeof pointsOfCenters != 'undefined') {
			for (var i = 0; i < pointsOfCenters.length; i += 2) {
				_pointsOfCenters = _pointsOfCenters.concat(
					new Point(pointsOfCenters[i], pointsOfCenters[i + 1])
				);
			}
		}

		// Vertex Buffer
		_vertexBuffer = _gl.createBuffer();
		_gl.bindBuffer(_gl.ARRAY_BUFFER, _vertexBuffer);

		_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertices), _gl.STATIC_DRAW);
		_vertexBuffer.itemSize = 3;
		_vertexBuffer.numItems = vertices.length;

		// Vertex Color buffer
		_vertexColorBuffer = _gl.createBuffer();
		_gl.bindBuffer(_gl.ARRAY_BUFFER, _vertexColorBuffer);

		var colors = [];
		var numVertices = vertices.length / _vertexBuffer.itemSize;
		for (var i = 0; i < numVertices; ++i) {
			colors = colors.concat(color);
		}

		_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(colors), _gl.STATIC_DRAW);
		_vertexColorBuffer.itemSize = 4;
		_vertexColorBuffer.numItems = colors.length;

		// Index buffer
		_indexBuffer = _gl.createBuffer();
		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, _indexBuffer);

		_gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), _gl.STATIC_DRAW);
		_indexBuffer.itemSize = 1;
		_indexBuffer.numItems = indices.length;

		_gl.bindBuffer(_gl.ARRAY_BUFFER, null);
		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, null);
	};

	/**
	 * @returns how many squares this piece has
	 */
	this.getNumSquares = function() {
		return _pointsOfCenters.length;
	};

	/**
	 * @returns the collection of squares this piece has
	 */
	this.getPointsOfCenters = function() {
		return _pointsOfCenters;
	}

	this.getColor = function() {
		return _color;
	};

	this.flip = function() {
		_flipped = !_flipped;
		_flipPointsOfCenters();
	};

	/**
	 * Keeps rotation angle between 0 and 2Pi
	 */
	this.rotateLeft = function() {
		_rotate(Math.PI / 2);
	};

	/**
	 * Keeps rotation angle between 0 and 2Pi
	 */
	this.rotateRight = function() {
		_rotate(- Math.PI / 2);
	};

	var _rotate = function(angle) {
		var coefficient = (_flipped ? -1 : 1);
		_rotation += coefficient * angle;
		if (_rotation == 2 * Math.PI) {
			_rotation = 0;
		}
		else if (_rotation == - Math.PI / 2) {
			_rotation = 3 * Math.PI / 2;
		}
		_rotatePointsOfCenters(angle);
	}

	/**
	 * @private
	 * Flips the points of centers along the y axis by inverting the x coordinates
	 */
	var _flipPointsOfCenters = function() {
		for (var i = 0; i < _pointsOfCenters.length; ++i) {
			_pointsOfCenters[i].x *= -1; 
		}
	};

	/**
	 * @private
	 */
	var _rotatePointsOfCenters = function(angle) {
		for (var i = 0; i < _pointsOfCenters.length; ++i) {
			var newPoint = _pointsOfCenters[i].rotate(angle);
			_pointsOfCenters[i].x = Math.round(newPoint.x);
			_pointsOfCenters[i].y = Math.round(newPoint.y);
		}
	};

	/**
	 * Removes any flips or rotations
	 */
	this.reset = function() {
		// First undo any flips
		if (_flipped) {
			this.flip();
		}

		// And then undo any rotations
		_rotatePointsOfCenters(-_rotation);	// Rotate back to zero
		_rotation = 0;
	};

	/**
	 * Moves the top left corner of the piece to the given location
	 * @param loc Point object
	 */
	this.setLocation = function(loc) {
		_loc = loc;
	};

	/**
	 * Returns the top left corner of the piece
	 */
	this.getLocation = function() {
		return _loc;
	};

	/**
	 * Sets the location of this piece at the mouse position,
	 * but depending on the rotation adjusts it to the next whole location
	 */
	this.placeAt = function(mousePos) {
		var newX = 0;
		var newY = 0;

		if (!_flipped) {
			if (_rotation == 0) {
				newX = Math.floor(mousePos.x);
				newY = Math.floor(mousePos.y);
			}
			else if (_rotation == 3 * Math.PI / 2) {
				newX = Math.floor(mousePos.x);
				newY = Math.ceil(mousePos.y);
			}
			else if (_rotation == Math.PI) {
				newX = Math.ceil(mousePos.x);
				newY = Math.ceil(mousePos.y);
			}
			else if (_rotation == Math.PI / 2) {
				newX = Math.ceil(mousePos.x);
				newY = Math.floor(mousePos.y);
			}
		}
		else {
			if (_rotation == 0) {
				newX = Math.ceil(mousePos.x);
				newY = Math.floor(mousePos.y);
			}
			else if (_rotation == 3 * Math.PI / 2) {
				newX = Math.ceil(mousePos.x);
				newY = Math.ceil(mousePos.y);
			}
			else if (_rotation == Math.PI) {
				newX = Math.floor(mousePos.x);
				newY = Math.ceil(mousePos.y);
			}
			else if (_rotation == Math.PI / 2) {
				newX = Math.floor(mousePos.x);
				newY = Math.floor(mousePos.y);
			}
		}

		this.setLocation(new Point(newX, newY));
	}

	/**
	 * Draws this piece at its location
	 */
	this.draw = function() {
		_drawAtLocation(_loc);
	};

	/**
	 * Draws this piece at the given mouse location
	 * @param position [x,y] location of the mouse, in world coordinates
	 */
	this.drawAtMouse = function(position) {
		// Offset the piece so that the bottom left square of the piece is centered
		// on the location of the mouse
		var coefficient = (_flipped ? -1 : 1);
		var offsetX = -0.5 * coefficient;
		if (_rotation >= Math.PI / 2 && _rotation <= Math.PI) {
			offsetX = 0.5 * coefficient;
		}
		var offsetY = -0.5;
		if (_rotation >= Math.PI && _rotation <= 3 * Math.PI / 2) {
			offsetY = 0.5;
		}
		_drawAtLocation(new Point(position.x + offsetX, position.y + offsetY));
	};

	/**
	 * @private
	 * Draws this piece at the given location
	 * @param position [x,y] location to draw the piece in world coordinates
	 */
	var _drawAtLocation = function(position) {
	 	_gl.bindBuffer(_gl.ARRAY_BUFFER, _vertexBuffer);
	 	_gl.vertexAttribPointer(_shaderProgram.vertexPositionAttribute, _vertexBuffer.itemSize, _gl.FLOAT, false, 0, 0);

		_gl.bindBuffer(_gl.ARRAY_BUFFER, _vertexColorBuffer);
		_gl.vertexAttribPointer(_shaderProgram.vertexColorAttribute, _vertexColorBuffer.itemSize, _gl.FLOAT, false, 0, 0);

		_gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _indexBuffer);

		mvPushMatrix();

		// Transformations have to be in the opposite order desired

		// 3) Move the piece to the given location
		mat4.translate(mvMatrix, mvMatrix, [position.x, position.y, 0.0]);
		
		// 2) Flips the piece in the Y axis
		if (_flipped) {
			mat4.rotate(mvMatrix, mvMatrix, Math.PI, [0, 1, 0]);
		}

		// 1) Rotates the piece
		mat4.rotate(mvMatrix, mvMatrix, _rotation, [0, 0, 1]);

		setMatrixUniforms();
		_gl.drawElements(gl.TRIANGLES, _indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

		mvPopMatrix();

		_gl.bindBuffer(_gl.ARRAY_BUFFER, null);
		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, null);
	};

	_init(vertices, indices, pointsOfCenters);
}

/**
 * Represents an individual player
 * @param name the Player's dispayable name
 * @param pieces a list of the pieces at this player's disposal
 * @param availableMoves a ready made container that is set up to store available moves
 * @param moveValidator a function that allows a player to check if a hypothetical move is valid
 */
function Player(name, pieces, availableMoves, moveValidator) {
	var _name = name;
	var _availablePieces = pieces;
	var NONE = -1;
	var _currentPiece = NONE;
	var _numAvailableMoves = 1;					// Convenience variable to keep track of how many available moves remain
	var _availableMoves = availableMoves;		// 2D Array of pieces, where the indices are the board locations
	var _score = 0;
	var _stillPlaying = true;
	var _moveValidator = moveValidator;			// function which checks if hypothetical moves are valid
	var _latestNumSquaresPlaced = 0;

	// DEBUG
	var _possibleMove;

	this.getPossibleMove = function() {
		return _possibleMove;
	};
	//

	this.getNumAvailablePieces = function() {
		return _availablePieces.length;
	};

	this.hasPieceSelected = function() {
		return _currentPiece != NONE;
	};

	this.getName = function() {
		return _name;
	};

	this.getScore = function() {
		return _score;
	};

	this.isStillPlaying = function() {
		return _stillPlaying;
	};

	this.getCurrentPiece = function() {
		return _availablePieces[_currentPiece];
	};

	/**
	 * If pased a valid piece #, resets the current one and sets to it
	 * If not, makes nothing selected
	 */
	this.setCurrentPiece = function(piece) {
		if (_currentPiece != NONE) {
			_availablePieces[_currentPiece].reset();
		}
		
		if (piece < _availablePieces.length) {
			_currentPiece = piece;
		}
		else {
			_currentPiece = NONE;
		}
	};

	/**
	 * Removes the current piece from the available pieces
	 * and returns it. Also updates the score
	 */
	this.placeCurrentPiece = function() {
		var piece = _availablePieces.splice(_currentPiece, 1)[0];
		_currentPiece = NONE;
		
		// Add piece's number of squares to the score
		_latestNumSquaresPlaced = piece.getNumSquares();
		_score += _latestNumSquaresPlaced;

		return piece;
	};

	/**
	 * Based off of various scenarios, determines if this player can no longer make any moves
	 */
	this.determineIfStillPlaying = function() {
		// Simplest scenario where the player is finished: if there are no more pieces to place,
		// or there is no place even the 1 square piece can fit
		if (_availablePieces.length != 0 && _numAvailableMoves != 0) {
			// If the above scenario isn't true, then check if any of the remaining pieces can fit
			// somewhere, if not then the player is done

			// NOTE: The following efficiency tricks assume that the available pieces array is sorted smallest to largest

			// If they still have their 1 piece, then no matter what if there are available moves then it can fit
			if (_availablePieces[0].getNumSquares() == 1) {
				return;
			}

			// TODO: Maybe do something simple for 2 piece?

			// Otherwise, go through all the pieces with the hope that one of the smallest pieces fit somewhere
			// Worst case is their last piece only fits in the last spot checked, so have to check all combinations (unlikely)
			for (var pieceI = 0; pieceI < _availablePieces.length; ++pieceI) {
				var piece = _availablePieces[pieceI];
				var numSquares = piece.getNumSquares();

				var boardSize = _availableMoves.length;
				var xOffset = 0;
				var yOffset = 0;
				var NUM_ROTATIONS = 4;
				var NUM_FLIPS = 1;
				var rotation = Math.PI / 2;

				// Loop through each available move (ie: a square that must be touched by any newly placed piece)
				for (var y = 0; y < boardSize; ++y) {
					for (var x = 0; x < boardSize; ++x) {
						if (_availableMoves[x][y] != null) {
							// Attempt all possible ways this piece can touch this spot. For each square of the piece,
							// attempt to have it touch the spot by trying all 4 rotations * 2 flip orientations
							// So for each available move the maximum number of checks is = numSquares * 4 * 2
							for (var squareI = 0; squareI < numSquares; ++squareI) {
								for (var i = 0; i < NUM_FLIPS; ++i) {
									for (var j = 0; j < NUM_ROTATIONS; ++j) {
										var squares = piece.getPointsOfCenters();		// Get the updated square locations
										var square = squares[squareI];					// Get the current square to place at (x,y)
										var firstSquare = squares[0];

										// Move validator expects the location of the first square, so
										// find out where it should go by taking the difference between the two
										xOffset = square.x - firstSquare.x;
										yOffset = square.y - firstSquare.y;

										if (_moveValidator(piece, x - xOffset, y - yOffset) == true) {
											// Can place this piece here in this orientation, player not finished

											// DEBUG!
											_possibleMove = {};
											_possibleMove.x = x;
											_possibleMove.y = y;
											_possibleMove.squareI = squareI;
											_possibleMove.pointsOfCenters = new Array(squares.length);
											for (var z = 0; z < squares.length; ++z) {
												_possibleMove.pointsOfCenters[z] = new Point(squares[z].x, squares[z].y);
											}

											piece.reset();		// Undo any changes
											return;
										}
										piece.rotateLeft(rotation);
									}
									piece.flip();
								}
							}
						}
					}
				}
				piece.reset();		// Undo any changes
			}
		}
		// If got to this point, then the player is done
		_stillPlaying = false;

		// If their last move was the 1 piece, double their score
		if (_latestNumSquaresPlaced == 1) {
			_score *= 2;
		}
		
		alert(_name + " has no more available moves");
	};

	this.rotateLeft = function() {
		if (_currentPiece != NONE) {
			_availablePieces[_currentPiece].rotateLeft();
		}
	};

	this.rotateRight = function() {
		if (_currentPiece != NONE) {
			_availablePieces[_currentPiece].rotateRight();
		}
	};

	this.flip = function() {
		if (_currentPiece != NONE) {
			_availablePieces[_currentPiece].flip();
		}
	};

	/**
	 * Arranges all the available pieces to the locations
	 * given
	 */
	this.arrangeAvailablePieces = function(locations) {
		for (var i = 0; i < _availablePieces.length; ++i) {
			_availablePieces[i].setLocation(locations[i]);
		}
	};

	/**
	 * Adds the given moves to the list of available moves if they don't already exist
	 */
	this.addNewAvailableMoves = function(moves) {
		for (var i = 0; i < moves.length; ++i) {
			var loc = moves[i].getLocation();
			if (_availableMoves[loc.x][loc.y] == null) {
				_availableMoves[loc.x][loc.y] = moves[i];
				++_numAvailableMoves;
			}
		}
	};

	/**
	 * Removes the available move stored at the given location
	 * If their number of available moves is now 0, they are no longer playing
	 */
	this.removeAvailableMove = function(pos) {
		if (_availableMoves[pos.x][pos.y] != null) {
			_availableMoves[pos.x][pos.y] = null;
			--_numAvailableMoves;
		}
	};

	/**
	 * Draws the current piece at the location of the mouse
	 */
	this.draw = function(mousePosition) {
		if (_currentPiece != NONE) {
			_availablePieces[_currentPiece].drawAtMouse(mousePosition);
		}
	};

	/**
	 * Draws all the available pieces on the right of the screen
	 */
	this.drawAvailablePieces = function() {
		for (var i = 0; i < _availablePieces.length; ++i) {
			if (i == _currentPiece) continue;
			_availablePieces[i].draw();
		}
	};

	/**
	 * Draws all the available moves this player has
	 */
	this.drawAvailableMoves = function() {
		for (var i = 0; i < _availableMoves.length; ++i) {
			for (var j = 0; j < _availableMoves[i].length; ++j) {
				if (_availableMoves[i][j] != null) {
					_availableMoves[i][j].draw();
				}
			}
		}
	};
}

/**
 * Represents the game board
 */
function Board(size) {
	var _gridSize = size;
	var _board = new Array(_gridSize);

	var self = this;

	var EMPTY 	= '#';
	var BLUE 	= 'B';
	var YELLOW	= 'Y';
	var RED 	= 'R';
	var GREEN 	= 'G';

	var _colorMap = {};			// RGB color -> color code
	var _startedMap = {};		// Color code -> First move or not
	var _firstPieceMap = {};	// Color code -> Location of first piece

	var _init = function() {
		_colorMap[[0.0, 0.0, 1.0, 1.0]] = BLUE;
		_colorMap[[1.0, 1.0, 0.0, 1.0]] = YELLOW;
		_colorMap[[1.0, 0.0, 0.0, 1.0]] = RED;
		_colorMap[[0.0, 1.0, 0.0, 1.0]] = GREEN;

		_startedMap[BLUE] = _startedMap[RED] = _startedMap[GREEN] = _startedMap[YELLOW] = false;

		_firstPieceMap[BLUE] 	= new Point(0, _gridSize - 1);					// Top left corner
		_firstPieceMap[YELLOW] 	= new Point(_gridSize - 1, _gridSize - 1);		// Top right corner
		_firstPieceMap[RED] 	= new Point(_gridSize - 1, 0);					// Bottom right corner
		_firstPieceMap[GREEN] 	= new Point(0, 0);								// Bottom right corner

		for (var i = 0; i < _gridSize; ++i) {
			_board[i] = new Array(_gridSize);
			for (var j = 0; j < _gridSize; ++j) {
				_board[i][j] = EMPTY;
			}
		}
	};

	/**
	 * @private
	 */
	var _getColorCode = function(piece) {
		return _colorMap[piece.getColor()];
	};

	/**
	 * @returns true if the given coordinates are out of bounds, else false
	 */
	this.isOutOfBounds = function(x, y) {
		return x < 0 || y < 0 || x >= _gridSize || y >= _gridSize;
	};

	/**
	 * @returns true if this is a valid move for this piece, false otherwise
	 */
	this.canPlacePiece = function(piece, x, y) {
		var color = _getColorCode(piece);
		var pointsOfCenters = piece.getPointsOfCenters();

		if (_startedMap[color]) {
			return _validateMove(color, pointsOfCenters, x, y);
		}
		else {
			return _checkFirstMove(color, pointsOfCenters, x, y);
		}
	};

	/**
	 * @private
	 * If this isn't the players first move, returns if a given move is valid
	 */
	var _validateMove = function(color, pointsOfCenters, x, y) {
		var touchedCorner = false;		// Must turn true to be a valid move

		// Go through each square of the piece
		for (var z = 0; z < pointsOfCenters.length; ++z) {
			var square = pointsOfCenters[z];
			var location = new Point(x + square.x, y + square.y);

			if (self.isOutOfBounds(location.x, location.y)) {
				return false;
			}

			// Check in all 8 surrounding directions for each square
			for (var j = 1; j > -2; --j) {
				for (var i = -1; i < 2; ++i) {
					var newX = location.x + i;
					var newY = location.y + j;

					// Check if outside the board, if so continue since no issue
					if (self.isOutOfBounds(newX, newY)) continue;

					// If checking self, make sure its empty
					if (i == 0 && j == 0) {
						if (_board[newX][newY] != EMPTY) {
							return false;
						}
					}
					// If 'x' direction, check to see if same color exists, needs to happen at least once to be a valid move
					else if (Math.abs(i) == Math.abs(j)) {
						if (touchedCorner) {
							continue;		// Don't bother checking
						}
						touchedCorner = (_board[newX][newY] == color);		// else
					}
					// If '+' direction, check to see if same same color exists, if so, that's an invalid move
					else if (_board[newX][newY] == color) {
						return false;
					}
				}
			}
		}

		return touchedCorner;
	};

	/**
	 * Every piece has a corner that their first move has to touch
	 * Check if any of the squares of this piece touch the first location
	 * as long as the piece didn't go out of bounds
	 */
	var _checkFirstMove = function(color, pointsOfCenters, x, y) {
		var firstPieceLocation = _firstPieceMap[color];
		var success = false;

		for (var z = 0; z < pointsOfCenters.length; ++z) {
			var square = pointsOfCenters[z];
			var location = new Point(x + square.x, y + square.y);
			if (self.isOutOfBounds(location.x, location.y)) {
				return false;
			}
			if (location.equals(firstPieceLocation)) {
				success = true;
			}
		}

		// If made it to the end without going out of bounds
		if (success) {
			_startedMap[color] = true;
		}
		return success;		// None of the squares touched the first location
	};

	/**
	 * Puts a piece on the game board
	 */
	this.placePiece = function(piece, x, y) {
		var color = _getColorCode(piece);
		var pointsOfCenters = piece.getPointsOfCenters();
		for (var i = 0; i < pointsOfCenters.length; ++i) {
			var piece = pointsOfCenters[i];
			_board[x + piece.x][y + piece.y] = color;
		}
		if (DEBUG) {
			this.printBoard();
		}
	};

	/**
	 * After a piece is placed, determine all the new available pieces that
	 * are now possible
	 */
	this.discoverNewAvailableMoves = function(piece, x, y) {
		var newMoves = [];
		var checkedSpots = [];		// Avoid redundant checks
		
		var color = _getColorCode(piece);
		var pointsOfCenters = piece.getPointsOfCenters();

		for (var z = 0; z < pointsOfCenters.length; ++z) {
			// For each square of a piece, check in X direction for empty space
			var square = pointsOfCenters[z];
			var location = new Point(x + square.x, y + square.y);

			for (var j = 1; j > -2; --j) {
				for (var i = -1; i < 2; ++i) {
					// If 'x' direction, check to see if the spot is empty
					if (Math.abs(i) == Math.abs(j)) {
						var newX = location.x + i;
						var newY = location.y + j;
						var newLoc = new Point(newX, newY);

						// Check if outside the board, if so not a new move
						if (self.isOutOfBounds(newX, newY)) continue;

						if (_board[newX][newY] == EMPTY) {
							// If it's empty, see if we've checked this spot before
							if (checkedSpots.indexOf(newLoc) > -1) {
								continue;
							}

							var newMoveWorks = true;

							// If not, then check this spot's + directions to see if it's adjacent to this piece's color
							for (var l = 1; l > -2; --l) {
								for (var k = -1; k < 2; ++k) {
									if (k != l && Math.abs(k) != Math.abs(l)) {
										var checkX = newX + k;
										var checkY = newY + l;

										// Check if outside the board, if so continue since no issue
										if (self.isOutOfBounds(checkX, checkY)) continue;

										if (_board[checkX][checkY] == color) {
											newMoveWorks = false;
											break;
										}
									}
								}
								if (!newMoveWorks) {
									break;
								}
							}

							// If made it this far, this is a new move
							if (newMoveWorks) {
								newMoves = newMoves.concat(newLoc);
							}

							// Make sure we don't check this spot again
							checkedSpots = checkedSpots.concat(newLoc);
						}
					}
				}
			}
		}

		return newMoves;
	}

	/**
	 * @debug
	 */
	this.printBoard = function() {
		for (var i = _gridSize - 1; i >= 0; --i) {
			var output = "";
			for (var j = 0; j < _gridSize; ++j) {
				output += _board[j][i] + " ";
			}
			console.log(output);
		}
	};

	_init();
}

/**
 * Class mostly responsible for the drawing of the game and handling user interaction
 */
function Blockus(gl, shaderProgram, gridSize, pieces) {
	var _gl = gl;
	var _shaderProgram = shaderProgram;

	var _NUM_PLAYERS = 4;
	var _players = [];
	var _currentPlayer = 0;
	var _firstRound = true;		// Not all players have placed their first piece

	var _gameBoard;

	var _placedPieces = [];

	var self = this;

	// Grid variables
	var _gridSize = 20;		// 20 X 20 board
	var _halfGridSize = _gridSize * 0.5;		// 10 cells
	var _gridVertices;
	var _gridVertexColors;
	var _gridIndexBuffer;

	// Scroll buttons
	var _scrollVertices;
	var _scrollVertexColors;
	var _scrollTriangleIndices;
	var _scrollSquareIndices;
	var _scrollAmount = 0;

	var _rightPiecesMarginX = 6;
	var _rightPiecesMarginY = 4;

	var _mousePosition = [];	// Empty object

	var _lightPlayerColors;

	var _gameOver = false;

	/**
	 * @private
	 * Initializes the game
	 */
	var _init = function(pieces) {
		_gameBoard = new Board(_gridSize);

		_lightPlayerColors = [
			[0.0, 0.0, 1.0, 0.3],
			[1.0, 1.0, 0.0, 0.5],
			[1.0, 0.0, 0.0, 0.3],
			[0.0, 1.0, 0.0, 0.3]
		];

		_initPlayers(pieces);
		_initBuffers();
		_mousePosition.x = 0;
		_mousePosition.y = 0;
	};

	/**
	 * @private
	 * Convenience function to create a displayable piece
	 * that takes up one square
	 * Used for displaying hints as to where to place a piece
	 *
	 * @param color [r,g,b] of the piece to display
	 * @param pos either Point or array [x,y] position to display the top left corner of the piece
	 * @returns the created piece
	 */
	var _createSquarePiece = function(color, pos) {
		var p = new Piece(_gl, _shaderProgram, color,
			[
				0, 0, 0,
				1, 0, 0,
				0, 1, 0,
				1, 1, 0
			],
			[
				0, 3, 1,
				0, 2, 3
			]
		);
		if (pos instanceof Point) {
			p.setLocation(pos);
		}
		else {
			p.setLocation(new Point(pos[0], pos[1]));
		}
		return p;
	};

	/**
	 * @private
	 * Makes the next player who is still playing have their turn
	 */
	var _nextPlayer = function () {
		var numAttempts = 0;
		do {
			_currentPlayer = (_currentPlayer + 1) % 4;
			if (++numAttempts > _NUM_PLAYERS) {
				// Game is over
				var maxScore = 0;
				var winner;
				for (var i = 0; i < _NUM_PLAYERS; ++i) {
					var currentScore = _players[i].getScore();
					if (currentScore > maxScore) {
						maxScore = currentScore;
						winner = _players[i].getName();
					}
				}
				alert("Game is over! Winner is: " + winner);		// TODO: Announce the winner
				_gameOver = true;
				return;
			}
		}
		while (_players[_currentPlayer].isStillPlaying() == false);

		// See if this player actually has any moves left
		_players[_currentPlayer].determineIfStillPlaying();

		if (_players[_currentPlayer].isStillPlaying() == false) {
			_nextPlayer();		// Try again
		}
	};

	/**
	 * @private
	 * Creates and initializes all the players
	 * First it sets up the available moves for each player on startup
	 */
	var _initPlayers = function(pieces) {
		// Set up each player's first available moves
		var firstMoves = new Array(_NUM_PLAYERS);
		var positions = [
			[0, _gridSize - 1],
			[_gridSize - 1, _gridSize - 1],
			[_gridSize - 1, 0],
			[0, 0]
		];
		for (var i = 0; i < _NUM_PLAYERS; ++i) {
			firstMoves[i] = _createSquarePiece(_lightPlayerColors[i], positions[i]);
		}
		var names = ["Blue", "Yellow", "Red", "Green"];

		// Create each player, passing the necessary data
		for (var i = 0; i < _NUM_PLAYERS; ++i) {
			// Give each player a ready made 2D array
			var availableMoves = new Array(_gridSize);
			for (var j = 0; j < _gridSize; ++j) {
				availableMoves[j] = new Array(_gridSize);
			}
			// Give each player their first move
			availableMoves[positions[i][0]][positions[i][1]] = firstMoves[i];

			_players = _players.concat(new Player(names[i], pieces[i], availableMoves, _gameBoard.canPlacePiece));
			_arrangeAvailablePieces(i);
		}
	};

	/**
	 * @private
	 * Sets up the buffers for drawing
	 */
	var _initBuffers = function() {
		_initGridBuffers();
		_initScrollBuffers();
	};

	/**
	 * @private
	 * Sets the buffers for the grid
	 */
	var _initGridBuffers = function() {
		// Vertex buffer
		_gridVertices = _gl.createBuffer();
		_gl.bindBuffer(_gl.ARRAY_BUFFER, _gridVertices);

		var vertices = [];
		var numHorizontal 	= _gridSize;
		var numVertical 	= _gridSize + 1;		// Also want at the edge of the board
		// Horizontal Lines
		for (var i = 0; i < numHorizontal; ++i) {
			vertices = vertices.concat([0.0, i, 0.0]);
			vertices = vertices.concat([_gridSize, i, 0.0]);
		}
		// Vertical lines
		for (var i = 0; i < numVertical; ++i) {
			vertices = vertices.concat([i, 0.0, 0.0]);
			vertices = vertices.concat([i, _gridSize, 0.0]);
		}

		_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertices), _gl.STATIC_DRAW);
		_gridVertices.itemSize = 3;
		_gridVertices.numItems = vertices.length;

		// Vertex Color buffer
		_gridVertexColors = _gl.createBuffer();
		_gl.bindBuffer(_gl.ARRAY_BUFFER, _gridVertexColors);

		var colors = [];
		var numVertices = vertices.length / _gridVertices.itemSize;
		for (var i = 0; i < numVertices; ++i) {
			// Black gridlines
			colors = colors.concat([0.0, 0.0, 0.0, 1.0]);
		}

		_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(colors), _gl.STATIC_DRAW);
		_gridVertexColors.itemSize = 4;
		_gridVertexColors.numItems = numVertices;

		// Index Buffer
		_gridIndexBuffer = _gl.createBuffer();
		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, _gridIndexBuffer);

		var indices = [];
		for (var i = 0; i < numHorizontal + numVertical; ++i) {
			indices = indices.concat([(i*2), (i*2)+1]);
		}

		_gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), _gl.STATIC_DRAW);
		_gridIndexBuffer.itemSize = 1;
		_gridIndexBuffer.numItems = indices.length;

		_gl.bindBuffer(_gl.ARRAY_BUFFER, null);
		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, null);
	};

	/**
	 * @private
	 * Sets the buffers for the scroll button
	 */
	var _initScrollBuffers = function() {
		// Vertex buffer
		_scrollVertices = _gl.createBuffer();
		_gl.bindBuffer(_gl.ARRAY_BUFFER, _scrollVertices);

		var vertices = [
			// Arrow
			0.2, 0.7, 0.0,
			0.8, 0.7, 0.0,
			0.5, 0.2, 0.0,

			// Square for button
			0.0, 0.0, 0.0,
			0.0, 1.0, 0.0,
			1.0, 1.0, 0.0,
			1.0, 0.0, 0.0
		];

		_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertices), _gl.STATIC_DRAW);
		_scrollVertices.itemSize = 3;
		_scrollVertices.numItems = vertices.length;

		// Vertex Color buffer
		_scrollVertexColors = _gl.createBuffer();
		_gl.bindBuffer(_gl.ARRAY_BUFFER, _scrollVertexColors);

		var colors = [];
		for (var i = 0; i < vertices.length; ++i) {
			// Black gridlines
			colors = colors.concat([0.0, 0.0, 0.0, 1.0]);
		}

		_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(colors), _gl.STATIC_DRAW);
		_scrollVertexColors.itemSize = 4;
		_scrollVertexColors.numItems = colors.length;

		// Index Buffers
		_scrollTriangleIndices = _gl.createBuffer();
		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, _scrollTriangleIndices);

		var indices = [0, 1, 2];

		_gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), _gl.STATIC_DRAW);
		_scrollTriangleIndices.itemSize = 1;
		_scrollTriangleIndices.numItems = indices.length;

		_scrollSquareIndices = _gl.createBuffer();
		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, _scrollSquareIndices);

		indices = [
			3, 4,
			4, 5,
			5, 6,
			6, 3
		];

		_gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), _gl.STATIC_DRAW);
		_scrollSquareIndices.itemSize = 1;
		_scrollSquareIndices.numItems = indices.length;

		_gl.bindBuffer(_gl.ARRAY_BUFFER, null);
		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, null);
	};

	/**
	 * Event handler for keys being clicked
	 */
	this.onKeyReleased = function(event) {
		switch (event.keyCode) {
			case 37:
				// left cursor key
				_players[_currentPlayer].rotateLeft();
				break;
			case 39:
				// right cursor key
				_players[_currentPlayer].rotateRight();
				break;
			case 70:
				// 'f'
				_players[_currentPlayer].flip();
				break;
			// DEBUG
			case 71:
				// 'g'
				var move = _players[_currentPlayer].getPossibleMove();
				if (move == null) return;
				var str = "";
				for (var i = 0; i < move.pointsOfCenters.length; ++i) {
					str += "[" + move.pointsOfCenters[i].x + ", " + move.pointsOfCenters[i].y + "]";
				}

				console.log(str + "\n xy: " + move.x + ", " + move.y + " squareI: " + move.squareI);
				break;
		}
	};

	/**
	 * Updates the current mouse position
	 * Stores it in world coordinates as opposed to the pixel location on the canvas
	 */
	this.setMousePosition = function(pos) {
		var x = pos[0];
		var y = pos[1];

		// Convert to world coordinates
		x = (x / _gl.canvas.height) * _gridSize;	// Equivalent to (x / _gl.canvas.width) * (aspectRatio) * _gridSize);
		y = ((_gl.canvas.height - y) / _gl.canvas.height) * _gridSize;		// Start y at the bottom not the top of screen

		_mousePosition.x = x;
		_mousePosition.y = y;
	};

	/**
	 *
	 */
	this.mouseDown = function() {

	};

	/**
	 *
	 */
	this.mouseClicked = function() {
		if (_gameOver) {
			return;		// TODO: Make a nicer way of stopping the game from continuing
		}

		// Potentially clicked on the scroll button at edge of screen
		if (_mousePosition.x  > (_gl.canvas.width / _gl.canvas.height) * _gridSize - 1) {
			if (_mousePosition.y < 1) {
				// Scroll down
				var maxScroll = Math.ceil(_players[_currentPlayer].getNumAvailablePieces() / 4);
				_scrollAmount += 1;
				if (_scrollAmount > maxScroll) {
					_scrollAmount = maxScroll;
				}
				else {
					_arrangeAvailablePieces();
				}
			}
			else if (_mousePosition.y > _gridSize - 1) {
				// Scroll up
				_scrollAmount -= 1;
				if (_scrollAmount < 0) {
					_scrollAmount = 0;
				}
				else {
					_arrangeAvailablePieces();
				}
			}
		}
		// Clicked on the remaining pieces to select one
		else if (_mousePosition.x > _gridSize) {
			var columnNum = Math.floor((_mousePosition.x - _gridSize) / _rightPiecesMarginX);

			// Invert y since starting from top, and accoun for scroll
			var rowNum = Math.floor(	
				(_gridSize - (_mousePosition.y - _rightPiecesMarginY * _scrollAmount)) / _rightPiecesMarginY
			);
			_players[_currentPlayer].setCurrentPiece(rowNum * 2 + columnNum);
		}
		// Clicked on the board
		else {
			if (_players[_currentPlayer].hasPieceSelected()) {
				var row = Math.floor(_mousePosition.x);
				var column = Math.floor(_mousePosition.y);

				// Check if this is a valid move
				if (_gameBoard.canPlacePiece(_players[_currentPlayer].getCurrentPiece(), row, column)) {
					// Place the piece on the model of the board
					var placedPiece = _players[_currentPlayer].placeCurrentPiece();
					_gameBoard.placePiece(placedPiece, row, column);

					// Position the visual piece on the screen
					placedPiece.placeAt(new Point(_mousePosition.x, _mousePosition.y));

					// Update GUI
					_placedPieces = _placedPieces.concat(placedPiece);
					_scrollAmount = 0;
					_arrangeAvailablePieces();
					
					// Update the available moves list
					_removeAvailableMoves(placedPiece, row, column);
					_addNewAvailableMoves(_gameBoard.discoverNewAvailableMoves(placedPiece, row, column));

					if (DEBUG) {
						console.log("B: " + _players[0].getScore() + " Y: " + _players[1].getScore() + " R: " + 
							_players[2].getScore() + " G: " + _players[3].getScore());
					}

					_nextPlayer();
					if (_firstRound && _currentPlayer == 0) {
						_firstRound = false;
					}
				}
			}
		}
	};

	/**
	 *
	 */
	this.update = function() {

	};

	/**
	 * Draws the game board
	 */
	this.draw = function() {
		_gl.viewport(0, 0, _gl.viewportWidth, _gl.viewportHeight);
		_gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);

		var aspectRatio = _gl.viewportWidth / _gl.viewportHeight;
		mat4.perspective(pMatrix, degToRad(45), _gl.viewportWidth / _gl.viewportHeight, 0.1, 100.0);

		mat4.identity(mvMatrix);

		// Get the origin to be at the bottom left corner of the screen and have
		// 20 units in the y axis, regardless of the width of the canvas

		// pMatrix[0] takes the aspect ratio into account, ignore it
		// and multiply this value by half the grid size. If we zoom out this amount
		// the y axis will be -halfGridSize to halfGridSize
		var zOffset = pMatrix[0] * aspectRatio * _halfGridSize;

		// Shift down this amount to half the axis be 0 to gridSize
		var yOffset = _halfGridSize;

		// Determine how many units in the x axis we have, and shift left by half that
		// The following is equivalent to _gl.canvas.width / (_gl.canvas.height / _gridSize) * 0.5
		var xOffset = aspectRatio * _gridSize * 0.5;

		mat4.translate(mvMatrix, mvMatrix, [-xOffset, -yOffset, -zOffset]);

		// Draw the GUI
		_drawGrid();
		_drawScrollButtons();

		// Draw the player's currently selected piece, its remaining pieces and available moves
		_players[_currentPlayer].draw(_mousePosition);
		_players[_currentPlayer].drawAvailablePieces();

		if (!DEBUG) {
			_players[_currentPlayer].drawAvailableMoves();
		}
		else {
			// Draw all players' available moves
			for (var i = 0; i < _NUM_PLAYERS; ++i) {
				_players[i].drawAvailableMoves();
			}
		}
		
		// Draw all the pieces currently on the board
		_drawPlacedPieces();
	};

	/**
	 * @private
	 * Draws the gridlines of the board
	 * The size of the grid depends on the board dimensions, the number of cells is constant
	 */
	var _drawGrid = function() {
		_gl.bindBuffer(_gl.ARRAY_BUFFER, _gridVertices);
		_gl.vertexAttribPointer(_shaderProgram.vertexPositionAttribute, _gridVertices.itemSize, _gl.FLOAT, false, 0, 0);

		_gl.bindBuffer(_gl.ARRAY_BUFFER, _gridVertexColors);
		_gl.vertexAttribPointer(_shaderProgram.vertexColorAttribute, _gridVertexColors.itemSize, _gl.FLOAT, false, 0, 0);

		_gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _gridIndexBuffer);

		setMatrixUniforms();
		_gl.drawElements(gl.LINES, _gridIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

		_gl.bindBuffer(_gl.ARRAY_BUFFER, null);
		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, null);
	};

	/**
	* @private
	*/
	var _drawScrollButtons = function() {
		 _gl.bindBuffer(_gl.ARRAY_BUFFER, _scrollVertices);
		_gl.vertexAttribPointer(_shaderProgram.vertexPositionAttribute, _scrollVertices.itemSize, _gl.FLOAT, false, 0, 0);

		_gl.bindBuffer(_gl.ARRAY_BUFFER, _scrollVertexColors);
		_gl.vertexAttribPointer(_shaderProgram.vertexColorAttribute, _scrollVertexColors.itemSize, _gl.FLOAT, false, 0, 0);

		mvPushMatrix();

		var xOffsets = [(_gl.canvas.width / _gl.canvas.height) * _gridSize - 1, 1.0];
		var yOffsets = [0.0, _gridSize];
		var rotations = [0.0, Math.PI];

		for (var i = 0; i < yOffsets.length; ++i) {
			mat4.translate(mvMatrix, mvMatrix, [xOffsets[i], yOffsets[i], 0.0]);
			mat4.rotate(mvMatrix, mvMatrix, rotations[i], [0.0, 0.0, 1]);

			setMatrixUniforms();

			_gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _scrollSquareIndices);
			_gl.drawElements(gl.LINES, _scrollSquareIndices.numItems, gl.UNSIGNED_SHORT, 0);

			_gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _scrollTriangleIndices);
			_gl.drawElements(gl.TRIANGLES, _scrollTriangleIndices.numItems, gl.UNSIGNED_SHORT, 0);
		}
		mvPopMatrix();

		_gl.bindBuffer(_gl.ARRAY_BUFFER, null);
		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, null); 	
	};

	/**
	 * @private
	 */
	var _arrangeAvailablePieces = function(playerIndex_) {
		var multiplier = 1;
		var yMult = 0;
		var xStart = gridSize + 1;
		var yStart = gridSize - 3 + _scrollAmount * _rightPiecesMarginY;

		var numAvailablePieces = _players[_currentPlayer].getNumAvailablePieces();
		var newLocations = [];

		var playerIndex = (typeof playerIndex_ == 'undefined' ? _currentPlayer : playerIndex_);

		for (var i = 0; i < numAvailablePieces; ++i) {
			newLocations = newLocations.concat(new Point(
				xStart + (multiplier % 2 == 0 ? _rightPiecesMarginX : 0),
			 	yStart - (multiplier % 2 == 0 ? yMult++ * _rightPiecesMarginY : yMult * _rightPiecesMarginY))
			);
			++multiplier;
		}
		_players[playerIndex].arrangeAvailablePieces(newLocations);
	};

	/**
	 * @private
	 * Takes the given available moves, creates displayable pieces and gives them to the current player
	 */
	var _addNewAvailableMoves = function(moves) {
		var pieces = [];
		for (var i = 0; i < moves.length; ++i) {
			pieces = pieces.concat(_createSquarePiece(_lightPlayerColors[_currentPlayer], moves[i]));
		}
		_players[_currentPlayer].addNewAvailableMoves(pieces);
	};

	/**
	 * @private
	 * When a piece is placed, all of its squares are no longer an available move for any
	 * player. Attempts to remove them from every player's list
	 * As well, removes all possible moves for the current player that are adjacent
	 * to any of the squares of the recently placed piece
	 * @param pos the position of the placed piece
	 */
	var _removeAvailableMoves = function(piece, row, column) {
		var pointsOfCenters = piece.getPointsOfCenters();
		for (var i = 0; i < pointsOfCenters.length; ++i) {
			// Remove each square of this piece from all the player's possible moves
			var square = pointsOfCenters[i];
			var location = new Point(row + square.x, column + square.y);
			for (var j = 0; j < _NUM_PLAYERS; ++j) {
				_players[j].removeAvailableMove(location);
			}
			// Remove any adjacent available moves for this player in the + direction
			for (var k = 1; k > -2; --k) {
				for (var j = -1; j < 2; ++j) {
					if (j != k && Math.abs(j) != Math.abs(k)) {
						var newX = location.x + j;
						var newY = location.y + k;

						// Check if outside the board, if so continue since no issue
						if (_gameBoard.isOutOfBounds(newX, newY)) continue;

						_players[_currentPlayer].removeAvailableMove(new Point(newX, newY));
					}
				}
			}
		}
	};

	/**
	 * @private
	 */
	var _drawPlacedPieces = function() {
		for (var i = 0; i < _placedPieces.length; ++i) {
			_placedPieces[i].draw();
		}
	};

	_init(pieces);
}