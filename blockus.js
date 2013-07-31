function Piece(gl, shaderProgram, color, vertices, indices, loc) {
	var _gl = gl;
	var _shaderProgram = shaderProgram;
	var _color = color;

	var _loc = (typeof loc !== 'undefined' ? loc : [0,0]);

	var _flipped = false;
	var _rotation = 0;

	var _vertexBuffer;
	var _vertexColorBuffer;
	var _indexBuffer;

	var _init = function(vertices, indices) {
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

	this.flip = function() {
		_flipped = !_flipped;
	};

	/**
	 * Keeps rotation angle between 0 and 2Pi
	 */
	this.rotateLeft = function() {
		_rotation += Math.PI / 2;
		if (_rotation == 2 * Math.PI) {
			_rotation = 0;
		}
	};

	/**
	 * Keeps rotation angle between 0 and 2Pi
	 */
	this.rotateRight = function() {
		_rotation -= Math.PI / 2;
		if (_rotation == - Math.PI / 2) {
			_rotation = 3 * Math.PI / 2;
		}
	};

	/**
	 * Moves this piece at the given location
	 */
	this.setLocation = function(loc) {
		_loc = loc;
	};

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
		_drawAtLocation([position[0] + offsetX, position[1] + offsetY]);
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
		mat4.translate(mvMatrix, mvMatrix, [position[0], position[1], 0.0]);
		
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

	_init(vertices, indices);
}

/**
 *
 */
function Blockus(gl, shaderProgram, gridSize, pieces) {
	var _gl = gl;
	var _shaderProgram = shaderProgram;

	// Piece variables
	var _pieces = pieces;
	var _availablePieces = _pieces[0];
	var _currentPiece = _availablePieces[_availablePieces.length - 1];

	var self = this;

	// Grid variables
	var _gridSize = 20;		// 20 X 20 board
	var _halfGridSize = _gridSize * 0.5;		// 10 cells
	var _gridVertices;
	var _gridVertexColors;
	var _gridIndexBuffer;

	/**
	 * Initializes the game
	 */
	this.init = function() {
		_initBuffers();
	};

	/**
	 * @private
	 * Sets up the buffers for drawing
	 */
	var _initBuffers = function() {
		_initGridBuffers();
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
	 * Event handler for keys being clicked
	 */
	this.onKeyReleased = function(event) {
		switch (event.keyCode) {
			case 37:
				// left cursor key
				_currentPiece.rotateLeft();
				break;
			case 39:
				// right cursor key
				_currentPiece.rotateRight();
				break;
			case 70:
				// 'f'
				_currentPiece.flip();
				break;
		}
	};

	var _mousePosition = [0, 0];

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

		_mousePosition = [x, y];
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
		_currentPiece.drawAtMouse(_mousePosition);
		_drawAvailablePieces();
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
	var _drawAvailablePieces = function() {
		var index = _availablePieces.indexOf(_currentPiece);

		for (var i = 0; i < _availablePieces.length; ++i) {
			if (i == index) continue;
			_availablePieces[i].draw();
		}
	};
}