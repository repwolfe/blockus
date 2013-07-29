/**
 * All the code that initializes the pieces
 */
function initializePieces(gl, shaderProgram) {
	var LPiece = new Piece(
	 	gl, shaderProgram,
	 	[0.0, 1.0, 0.0, 1.0],
	 	[
			0, 0, 0,
			1, 0, 0,
			0, 1, 0,
			1, 1, 0,

			0, 2, 0,
			1, 2, 0,

			2, 1, 0,
			2, 2, 0,

			3, 1, 0,
			3, 2, 0,

			2, 3, 0,
			3, 3, 0
		],
		[
			0, 3, 1,
			0, 2, 3,

			3, 2, 5,
			5, 2, 4,

			3, 5, 7,
			3, 7, 6,

			6, 7, 9,
			6, 9, 8,

			7, 10, 11,
			7, 11, 9
		]
	 );
	return LPiece;
}