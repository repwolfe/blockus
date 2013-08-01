/**
 * All the code that initializes the pieces
 * @returns an array of 4 arrays of 21 pieces, one array per color
 */
function initializePieces(gl, shaderProgram, gridSize) {
	var pieces = [];
	var colors = [
		[0.0, 0.0, 1.0, 1.0],	// Blue
		[1.0, 1.0, 0.0, 1.0],	// Yellow
		[1.0, 0.0, 0.0, 1.0],	// Red
		[0.0, 1.0, 0.0, 1.0]	// Green
	];

	// Make 21 pieces per color
	for (var i = 0; i < colors.length; ++i) {
		var color = colors[i];
		var colorsPieces = [];

		// One Piece
		colorsPieces.push(new Piece(
			gl, shaderProgram, color,
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
		));
		// Two Piece
		colorsPieces.push(new Piece(
			gl, shaderProgram, color,
			[
				0, 0, 0,
				1, 0, 0,
				0, 1, 0,
				1, 1, 0,
				2, 0, 0,
				2, 1, 0
			],
			[
				0, 3, 1,
				0, 2, 3,
				1, 5, 4,
				1, 3, 5
			]
		));
		// Three L Piece
		colorsPieces.push(new Piece(
			gl, shaderProgram, color,
			[
				0, 0, 0,
				1, 0, 0,
				0, 1, 0,
				1, 1, 0,
				2, 0, 0,
				2, 1, 0,
				1, -1, 0,
				2, -1, 0
			],
			[
				0, 3, 1,
				0, 2, 3,
				1, 5, 4,
				1, 3, 5,
				1, 4, 6,
				6, 4, 7
			]
		));
		// Three Piece
		colorsPieces.push(new Piece(
			gl, shaderProgram, color,
			[
				0, 0, 0,
				1, 0, 0,
				0, 1, 0,
				1, 1, 0,
				2, 0, 0,
				2, 1, 0,
				3, 0, 0,
				3, 1, 0
			],
			[
				0, 3, 1,
				0, 2, 3,
				1, 5, 4,
				1, 3, 5,
				4, 5, 7,
				6, 4, 7
			]
		));
		// Four Square Piece
		colorsPieces.push(new Piece(
			gl, shaderProgram, color,
			[
				0, 0, 0,
				1, 0, 0,
				0, 1, 0,
				1, 1, 0,
				2, 0, 0,
				2, 1, 0,
				0, 2, 0,
				1, 2, 0,
				2, 2, 0
			],
			[
				0, 3, 1,
				0, 2, 3,
				1, 5, 4,
				1, 3, 5,
				2, 7, 3,
				2, 6, 7,
				3, 8, 5,
				3, 7, 8
			]
		));
		// Four _|_ Piece
		colorsPieces.push(new Piece(
			gl, shaderProgram, color,
			[
				0, 0, 0,
				1, 0, 0,
				0, 1, 0,
				1, 1, 0,
				2, 0, 0,
				2, 1, 0,
				3, 0, 0,
				3, 1, 0,
				1, 2, 0,
				2, 2, 0
			],
			[
				0, 3, 1,
				0, 2, 3,
				1, 5, 4,
				1, 3, 5,
				4, 7, 6,
				4, 5, 7,
				3, 9, 5,
				3, 8, 9
			]
		));
		// Four Straight Piece
		colorsPieces.push(new Piece(
			gl, shaderProgram, color,
			[
				0, 0, 0,
				1, 0, 0,
				0, 1, 0,
				1, 1, 0,
				2, 0, 0,
				2, 1, 0,
				3, 0, 0,
				3, 1, 0,
				4, 0, 0,
				4, 1, 0
			],
			[
				0, 3, 1,
				0, 2, 3,
				1, 5, 4,
				1, 3, 5,
				4, 7, 6,
				4, 5, 7,
				6, 9, 8,
				6, 7, 9
			]
		));
		// Five L Piece
		colorsPieces.push(new Piece(
			gl, shaderProgram, color,
			[
				0, 0, 0,
				1, 0, 0,
				0, 1, 0,
				1, 1, 0,
				2, 0, 0,
				2, 1, 0,
				3, 0, 0,
				3, 1, 0,
				2, 2, 0,
				3, 2, 0
			],
			[
				0, 3, 1,
				0, 2, 3,
				1, 5, 4,
				1, 3, 5,
				4, 7, 6,
				4, 5, 7,
				5, 9, 7,
				5, 8, 9
			]
		));
		// Four S Piece
		colorsPieces.push(new Piece(
			gl, shaderProgram, color,
			[
				0, 0, 0,
				1, 0, 0,
				0, 1, 0,
				1, 1, 0,
				2, 0, 0,
				2, 1, 0,
				1, 2, 0,
				2, 2, 0,
				3, 1, 0,
				3, 2, 0
			],
			[
				0, 3, 1,
				0, 2, 3,
				1, 5, 4,
				1, 3, 5,
				3, 7, 5,
				3, 6, 7,
				5, 9, 8,
				5, 7, 9
			]
		));
		// Five |_____ Piece
		colorsPieces.push(new Piece(
			gl, shaderProgram, color,
			[
				0, 0, 0,
				1, 0, 0,
				0, 1, 0,
				1, 1, 0,
				2, 0, 0,
				2, 1, 0,
				3, 0, 0,
				3, 1, 0,
				4, 0, 0,
				4, 1, 0,
				0, 2, 0,
				1, 2, 0
			],
			[
				0, 3, 1,
				0, 2, 3,
				1, 5, 4,
				1, 3, 5,
				4, 7, 6,
				4, 5, 7,
				6, 9, 8,
				6, 7, 9,
				2, 11, 3,
				2, 10, 11
			]
		));
		// Five T Piece
		colorsPieces.push(new Piece(
			gl, shaderProgram, color,
			[
				0, 0, 0,
				1, 0, 0,
				0, 1, 0,
				1, 1, 0,
				2, 0, 0,
				2, 1, 0,
				3, 0, 0,
				3, 1, 0,
				1, 2, 0,
				2, 2, 0,
				1, 3, 0,
				2, 3, 0
			],
			[
				0, 3, 1,
				0, 2, 3,
				1, 5, 4,
				1, 3, 5,
				4, 7, 6,
				4, 5, 7,
				3, 9, 5,
				3, 8, 9,
				8, 11, 9,
				8, 10, 11
			]
		));
		// Five L Piece
		colorsPieces.push(new Piece(
			gl, shaderProgram, color,
			[
				0, 0, 0,
				1, 0, 0,
				0, 1, 0,
				1, 1, 0,
				2, 0, 0,
				2, 1, 0,
				3, 0, 0,
				3, 1, 0,
				0, 2, 0,
				1, 2, 0,
				0, 3, 0,
				1, 3, 0
			],
			[
				0, 3, 1,
				0, 2, 3,
				1, 5, 4,
				1, 3, 5,
				4, 7, 6,
				4, 5, 7,
				2, 9, 3,
				2, 8, 9,
				8, 11, 9,
				8, 10, 11
			]
		));
		// Five L Piece
		colorsPieces.push(new Piece(
			gl, shaderProgram, color,
			[
				0, 0, 0,
				1, 0, 0,
				0, 1, 0,
				1, 1, 0,
				2, 0, 0,
				2, 1, 0,
				1, 2, 0,
				2, 2, 0,
				3, 1, 0,
				3, 2, 0,
				4, 1, 0,
				4, 2, 0
			],
			[
				0, 3, 1,
				0, 2, 3,
				1, 5, 4,
				1, 3, 5,
				3, 7, 5,
				3, 6, 7,
				5, 9, 8,
				5, 7, 9,
				8, 11, 10,
				8, 9, 11
			]
		));
		// Z Piece
		colorsPieces.push(new Piece(
		 	gl, shaderProgram, color,
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
		));
		// Five Straight Piece
		colorsPieces.push(new Piece(
			gl, shaderProgram, color,
			[
				0, 0, 0,
				1, 0, 0,
				0, 1, 0,
				1, 1, 0,
				2, 0, 0,
				2, 1, 0,
				3, 0, 0,
				3, 1, 0,
				4, 0, 0,
				4, 1, 0,
				5, 0, 0,
				5, 1, 0
			],
			[
				0, 3, 1,
				0, 2, 3,
				1, 5, 4,
				1, 3, 5,
				4, 7, 6,
				4, 5, 7,
				6, 9, 8,
				6, 7, 9,
				8, 11, 10,
				8, 9, 11
			]
		));
		// Five *
		//      ** piece
		//		**
		colorsPieces.push(new Piece(
			gl, shaderProgram, color,
			[
				0, 0, 0,
				1, 0, 0,
				0, 1, 0,
				1, 1, 0,
				2, 0, 0,
				2, 1, 0,
				0, 2, 0,
				1, 2, 0,
				2, 2, 0,
				0, 3, 0,
				1, 3, 0
			],
			[
				0, 3, 1,
				0, 2, 3,
				1, 5, 4,
				1, 3, 5,
				2, 7, 3,
				2, 6, 7,
				3, 8, 5,
				3, 7, 8,
				6, 10, 7,
				6, 9, 10
			]
		));
		// Five W piece
		colorsPieces.push(new Piece(
			gl, shaderProgram, color,
			[
				0, 0, 0,
				1, 0, 0,
				0, 1, 0,
				1, 1, 0,
				0, 2, 0,
				1, 2, 0,
				2, 1, 0,
				2, 2, 0,
				1, 3, 0,
				2, 3, 0,
				3, 2, 0,
				3, 3, 0
			],
			[
				0, 3, 1,
				0, 2, 3,
				2, 5, 3,
				2, 4, 5,
				3, 7, 6,
				3, 5, 7,
				5, 9, 7,
				5, 8, 9,
				7, 11, 10,
				7, 9, 11
			]
		));
		// 5 C Piece
		colorsPieces.push(new Piece(
			gl, shaderProgram, color,
			[
				0, 0, 0,
				1, 0, 0,
				0, 1, 0,
				1, 1, 0,
				2, 0, 0,
				2, 1, 0,
				0, 2, 0,
				1, 2, 0,
				0, 3, 0,
				1, 3, 0,
				2, 2, 0,
				2, 3, 0
			],
			[
				0, 3, 1,
				0, 2, 3,
				1, 5, 4,
				1, 3, 5,
				2, 7, 3,
				2, 6, 7,
				6, 9, 7,
				6, 8, 9,
				7, 11, 10,
				7, 9, 11
			]
		))
		// Five  **
		//      ** piece
		//		 *
		colorsPieces.push(new Piece(
			gl, shaderProgram, color,
			[
				0, 0, 0,
				1, 0, 0,
				0, 1, 0,
				1, 1, 0,
				2, 0, 0,
				2, 1, 0,
				1, -1, 0,
				2, -1, 0,
				1, 2, 0,
				2, 2, 0,
				3, 1, 0,
				3, 2, 0
			],
			[
				0, 3, 1,
				0, 2, 3,
				1, 5, 4,
				1, 3, 5,
				6, 1, 4,
				6, 4, 7,
				3, 8, 9,
				3, 9, 5,
				5, 11, 10,
				5, 9, 11
			]
		));
		// Five Cross Piece
		colorsPieces.push(new Piece(
			gl, shaderProgram, color,
			[
				0, 0, 0,
				1, 0, 0,
				0, 1, 0,
				1, 1, 0,
				2, 0, 0,
				2, 1, 0,
				1, -1, 0,
				2, -1, 0,
				1, 2, 0,
				2, 2, 0,
				3, 0, 0,
				3, 1, 0
			],
			[
				0, 3, 1,
				0, 2, 3,
				1, 5, 4,
				1, 3, 5,
				6, 1, 4,
				6, 4, 7,
				3, 8, 9,
				3, 9, 5,
				4, 11, 10,
				4, 5, 11
			]
		));
		// Five *
		//     **** Piece
				// Five Cross Piece
		colorsPieces.push(new Piece(
			gl, shaderProgram, color,
			[
				0, 0, 0,
				1, 0, 0,
				0, 1, 0,
				1, 1, 0,
				2, 0, 0,
				2, 1, 0,
				3, 0, 0,
				3, 1, 0,
				4, 0, 0,
				4, 1, 0,
				1, 2, 0,
				2, 2, 0
			],
			[
				0, 3, 1,
				0, 2, 3,
				1, 5, 4,
				1, 3, 5,
				4, 7, 6,
				4, 5, 7,
				6, 9, 8,
				6, 7, 9,
				3, 11, 5,
				3, 10, 11
			]
		));

		pieces.push(colorsPieces);
	}
	return pieces;
}