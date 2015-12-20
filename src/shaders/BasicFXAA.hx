package shaders;

import three.Vector2;
import util.FileReader;

class BasicFXAA {	
	public static var uniforms = {
		tDiffuse: { type: "t", value: null },
		resolution: { type: "v2", value: new Vector2(1024, 1024) }
	};
	public static var vertexShader = FileReader.readFile("shaders/basic_fxaa.vertex");
	public static var fragmentShader = FileReader.readFile("shaders/basic_fxaa.fragment");
}