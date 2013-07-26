
/**
 *
 */
function Blockus(gl, shaderProgram) {
	var _gl = gl;
	var _shaderProgram = shaderProgram;
	var self = this;

	/**
	 *
	 */
	this.init = function() {

	};

	/**
	 *
	 */
	 this.draw = function() {
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		mat4.perspective(pMatrix, degToRad(45), gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
	 };
}