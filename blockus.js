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
}

function Piece(gl, shaderProgram, color, vertices, indices, pointsOfCenters) {
	var _gl = gl;
	var _shaderProgram = shaderProgram;
	var _color = color;

	var _loc = new Point(0,0);

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
		for (var i = 0; i < vertices.length; ++i) {
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
	this.numSquares = function() {
		return _pointsOfCenters.length;
	};

	/**
	 *
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
		_flipped = false;
		_rotation = 0;
		_rotatePointsOfCenters(2 * Math.PI - _rotation);	// Rotate back to zero
	};

	/**
	 * Moves this piece at the given location
	 * @param loc Point object
	 */
	this.setLocation = function(loc) {
		_loc = loc;
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
		// Offset the piece so that the bottom left block of the piece is centered
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
 */
function Player(pieces) {
	var _availablePieces = pieces;
	var NONE = -1;
	var _currentPiece = NONE;
	var self = this;

	this.getNumAvailablePieces = function() {
		return _availablePieces.length;
	};

	this.hasPieceSelected = function() {
		return _currentPiece != NONE;
	};

	this.setCurrentPiece = function(piece) {
		_currentPiece = piece;
	};

	/**
	 * Removes the current piece from the available pieces
	 * and returns it
	 */
	this.placeCurrentPiece = function() {
		var piece = _availablePieces.splice(_currentPiece, 1)[0];
		_currentPiece = NONE;
		return piece;
	}

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

	this.reset = function() {
		if (_currentPiece != NONE) {
			_availablePieces[_currentPiece].reset();
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
}

/**
 * Represents the game board
 */
function Board(size) {
	var _gridSize = size;
	var _board = new Array(_gridSize);

	var EMPTY 	= '#';
	var BLUE 	= 'B';
	var RED 	= 'R';
	var GREEN 	= 'G';
	var YELLOW	= 'Y';

	var colorMap = {};

	var _init = function() {
		colorMap[[0.0, 0.0, 1.0, 1.0]] = BLUE;
		colorMap[[1.0, 0.0, 0.0, 1.0]] = RED;
		colorMap[[1.0, 1.0, 0.0, 1.0]] = YELLOW;
		colorMap[[0.0, 1.0, 0.0, 1.0]] = GREEN;

		for (var i = 0; i < _gridSize; ++i) {
			_board[i] = new Array(_gridSize);
			for (var j = 0; j < _gridSize; ++j) {
				_board[i][j] = EMPTY;
			}
		}
	};

	var _getColorCode = function(piece) {
		return colorMap[piece.getColor()];
	}

	/**
	 *
	 */
	this.placePiece = function(piece, x, y) {
		var color = _getColorCode(piece);
		var pointsOfCenters = piece.getPointsOfCenters();
		for (var i = 0; i < pointsOfCenters.length; ++i) {
			var piece = pointsOfCenters[i];
			_board[x + piece.x][y + piece.y] = color;
		}
		this.printBoard();
	};

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

	var _players = [];
	var _currentPlayer = 0;

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

	/**
	 * @private
	 * Initializes the game
	 */
	var _init = function(pieces) {
		_gameBoard = new Board(_gridSize);
		_initPlayers(pieces);
		_initBuffers();
		_mousePosition.x = 0;
		_mousePosition.y = 0;
	};

	/**
	 * @private
	 */
	var _initPlayers = function(pieces) {
		for (var i = 0; i < 4; ++i) {
			_players = _players.concat(new Player(pieces[i]));
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
		for (var i = 0; i < vertices.length; ++i) {
			// Black gridlines
			colors = colors.concat([0.0, 0.0, 0.0, 1.0]);
		}

		_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(colors), _gl.STATIC_DRAW);
		_gridVertexColors.itemSize = 4;
		_gridVertexColors.numItems = colors.length;

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
			_players[_currentPlayer].reset();
			_players[_currentPlayer].setCurrentPiece(rowNum * 2 + columnNum);
		}
		// Clicked on the board
		else {
			if (_players[_currentPlayer].hasPieceSelected()) {
				var row = Math.floor(_mousePosition.x);
				var column = Math.floor(_mousePosition.y);

				var placedPiece = _players[_currentPlayer].placeCurrentPiece();
				_gameBoard.placePiece(placedPiece, row, column);
				placedPiece.placeAt(new Point(_mousePosition.x, _mousePosition.y));
				_placedPieces = _placedPieces.concat(placedPiece);
				_arrangeAvailablePieces();

				// Next player
				_currentPlayer = (_currentPlayer + 1) % 4;
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

		_drawGrid();
		_drawScrollButtons();
		_players[_currentPlayer].draw(_mousePosition);
		_players[_currentPlayer].drawAvailablePieces();
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
	 */
	var _drawPlacedPieces = function() {
		for (var i = 0; i < _placedPieces.length; ++i) {
			_placedPieces[i].draw();
		}
	};

	_init(pieces);
}