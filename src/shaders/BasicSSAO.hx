package shaders;

import three.Vector2;
import util.FileReader;

class BasicSSAO {	
	public static var uniforms = {
		"tDepth": { type: "t", value: null },
		"size": { type: "v2", value: new Vector2(512, 512) },
		"near": { type: "f", value: 1 },
		"far": { type: "f", value: 100 },
		"minDepth": { type: "f", value: 0.3 },
		"radius": { type: "f", value: 5.0 },
		"noiseAmount": { type: "f", value: 0.0003 },
		"diffArea": { type: "f", value: 0.4 },
		"gDisplace": { type: "f", value: 0.4 },
		"gArea": { type: "f", value: 2.0 }
	};
	public static var vertexShader = FileReader.readFile("shaders/basic_ssao.vertex");
	public static var fragmentShader = FileReader.readFile("shaders/basic_ssao.fragment");
}