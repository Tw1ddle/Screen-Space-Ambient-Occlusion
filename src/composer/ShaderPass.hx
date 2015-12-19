package composer;
import three.Camera;
import three.Color;
import three.Material;
import three.Renderer;
import three.Scene;
import three.Shader;

@:native("THREE.ShaderPass") extern class ShaderPass {
	public function new(shader:Dynamic, ?textureID:Dynamic):Void;
	public function render(renderer:Renderer, writeBuffer:Dynamic, readBuffer:Dynamic):Void;
	
	public var uniforms:Dynamic;
	public var renderToScreen:Bool;
}