
/**
 *
 */
function Blockus(gl, shaderProgram) {
	var _gl = gl;
	var _shaderProgram = shaderProgram;
	var self = this;

	// Grid variables
	var _gridSize = 20;		// 20 X 20 board
	var _gridVertices;
	var _gridVertexColors;
	var _gridHIndexBuffer;
	var _gridVIndexBuffer;

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

		var vertices = [
			0.0,  0.0, 0.0,
			2.0,  0.0, 0.0,		// [0] and [1] form horizontal line
			0.0, -2.0, 0.0		// [0] and [2] form a vertical line
		];

		_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertices), _gl.STATIC_DRAW);
		_gridVertices.itemSize = 3;
		_gridVertices.numItems = 3;

		// Vertex Color buffer
		_gridVertexColors = _gl.createBuffer();
		_gl.bindBuffer(_gl.ARRAY_BUFFER, _gridVertexColors);

		var colors = [		// Black gridlines
			0.0, 0.0, 0.0, 1.0,
			0.0, 0.0, 0.0, 1.0,
			0.0, 0.0, 0.0, 1.0
		];

		_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(colors), _gl.STATIC_DRAW);
		_gridVertexColors.itemSize = 4;
		_gridVertexColors.numItems = 3;

		// Index buffers
		_gridHIndexBuffer = _gl.createBuffer();
		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, _gridHIndexBuffer);

		var horizontalIndices = [0, 1];

		_gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(horizontalIndices), _gl.STATIC_DRAW);
		_gridHIndexBuffer.itemSize = 1;
		_gridHIndexBuffer.numItems = 2;

		_gridVIndexBuffer = _gl.createBuffer();
		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, _gridVIndexBuffer);

		var verticalIndices = [0, 2];

		_gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(verticalIndices), _gl.STATIC_DRAW);
		_gridVIndexBuffer.itemSize = 1;
		_gridVIndexBuffer.numItems = 2;

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
		mat4.translate(mvMatrix, mvMatrix, [0.0, 0.0, -pMatrix[0]]);

		_drawGrid();
	};

	/**
	* @private
	* Draws the gridlines of the board
	* The size of the grid depends on the board dimensions, the number of cells is constant
	*/
	var _drawGrid = function() {
		var areaSize = 2.0 / _gridSize;		// Gridline length / num areas

		_gl.bindBuffer(_gl.ARRAY_BUFFER, _gridVertices);
		_gl.vertexAttribPointer(_shaderProgram.vertexPositionAttribute, _gridVertices.itemSize, _gl.FLOAT, false, 0, 0);

		_gl.bindBuffer(_gl.ARRAY_BUFFER, _gridVertexColors);
		_gl.vertexAttribPointer(_shaderProgram.vertexColorAttribute, _gridVertexColors.itemSize, _gl.FLOAT, false, 0, 0);

		mvPushMatrix();

		// Horizontal Lines
		mat4.translate(mvMatrix, mvMatrix, [-1.0, 1.0, 0.0]);

		_gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _gridHIndexBuffer);
		for (var i = 1; i < _gridSize; ++i) {		// Skip first line as its at the edge
			mvPushMatrix();
			mat4.translate(mvMatrix, mvMatrix, [0.0, -areaSize * i, 0.0]);
			setMatrixUniforms();

			_gl.drawElements(gl.LINES, _gridHIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
			mvPopMatrix();
		}

		// Vertical Lines
		_gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _gridVIndexBuffer);

		for (var i = 1; i < _gridSize; ++i) {		// Skip first line as its at the edge
			mvPushMatrix();
			mat4.translate(mvMatrix, mvMatrix, [areaSize * i, 0.0, 0.0]);
			setMatrixUniforms();

			_gl.drawElements(gl.LINES, _gridVIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
			mvPopMatrix();
		}
		
		mvPopMatrix();

		_gl.bindBuffer(_gl.ARRAY_BUFFER, null);
		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, null);
	 };
}