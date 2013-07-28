
/**
 *
 */
function Blockus(gl, shaderProgram) {
	var _gl = gl;
	var _shaderProgram = shaderProgram;
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
		// Horizontal Lines
		for (var i = 0; i < _gridSize; ++i) {
			vertices = vertices.concat([0.0, i, 0.0]);
			vertices = vertices.concat([_gridSize, i, 0.0]);
		}
		// Vertical lines
		for (var i = 0; i < _gridSize; ++i) {
			vertices = vertices.concat([i, 0.0, 0.0]);
			vertices = vertices.concat([i, _gridSize, 0.0]);
		}

		_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertices), _gl.STATIC_DRAW);
		_gridVertices.itemSize = 3;
		_gridVertices.numItems = vertices.length;//3;

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
		_gridVertexColors.numItems = colors.length;//3;

		// Index buffers
		_gridIndexBuffer = _gl.createBuffer();
		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, _gridIndexBuffer);

		var indices = [];
		for (var i = 0; i < _gridSize * 2; ++i) {
			indices = indices.concat([(i*2), (i*2)+1]);
		}

		_gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), _gl.STATIC_DRAW);
		_gridIndexBuffer.itemSize = 1;
		_gridIndexBuffer.numItems = indices.length;

		_gl.bindBuffer(_gl.ARRAY_BUFFER, null);
		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, null);
	};

	/**
	 * Draws the game board
	 */
	this.draw = function() {
		_gl.viewport(0, 0, _gl.viewportWidth, _gl.viewportHeight);
		_gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);

		mat4.perspective(pMatrix, degToRad(45), _gl.viewportWidth / _gl.viewportHeight, 0.1, 100.0);

		mat4.identity(mvMatrix);

		// pMatrix[0] is how far to zoom to get -1 to 1 units of screen size
		// Zoom enough to get -_halfGridSize to _halfGridSize
		mat4.translate(mvMatrix, mvMatrix, [0.0, 0.0, -pMatrix[0] * _halfGridSize]);

		_drawGrid();
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

		mvPushMatrix();

		mat4.translate(mvMatrix, mvMatrix, [-_halfGridSize, -_halfGridSize, 0.0]);
		setMatrixUniforms();
		_gl.drawElements(gl.LINES, _gridIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

		mvPopMatrix();

		_gl.bindBuffer(_gl.ARRAY_BUFFER, null);
		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, null);
	 };
}