package;

import composer.ShaderPass;
import dat.GUI;
import dat.ShaderGUI;
import dat.ThreeObjectGUI;
import js.Browser;
import msignal.Signal.Signal0;
import shaders.BasicFXAA;
import shaders.BasicSSAO;
import stats.Stats;
import three.Blending;
import three.Color;
import three.CubeGeometry;
import three.Mesh;
import three.Object3D;
import three.PerspectiveCamera;
import three.postprocessing.EffectComposer;
import three.Scene;
import three.ShaderLib;
import three.ShaderMaterial;
import three.TextureFilter;
import three.UniformsUtils;
import three.WebGLRenderer;
import three.WebGLRenderTarget;
import webgl.Detector;

class Main {
	public static inline var REPO_URL:String = "https://github.com/Tw1ddle/Screen-Space-Ambient-Occlusion";
	public static inline var WEBSITE_URL:String = "http://samcodes.co.uk/";
	public static inline var TWITTER_URL:String = "https://twitter.com/Sam_Twidale";
	public static inline var HAXE_URL:String = "http://haxe.org/";
	
	public var signal_windowResized(default, null) = new Signal0();
	
	public var worldScene(default, null):Scene;
	public var worldCamera(default, null):PerspectiveCamera;
	
	private var gameAttachPoint:Dynamic;
	private var renderer:WebGLRenderer;
	private var composer:EffectComposer;
	private var depthMaterial:ShaderMaterial;
	private var depthRenderTarget:WebGLRenderTarget;
	
	private var ssaoPass:ShaderPass;
	private var aaPass:ShaderPass;
	
	private static var lastAnimationTime:Float = 0.0; // Last time from requestAnimationFrame
	private static var dt:Float = 0.0; // Frame delta time
	
	private var sceneGUI:GUI;
	private var shaderGUI:GUI;
	
	#if debug
	public var stats(default, null):Stats;
	#end
	
    private static function main():Void {
		var main = new Main();
	}
	
	private inline function new() {
		Browser.window.onload = onWindowLoaded;
	}
	
	private inline function onWindowLoaded():Void {
		var gameDiv = Browser.document.createElement("attach");
		
		// WebGL support check
		var glSupported:WebGLSupport = Detector.detect();
		if (glSupported != SUPPORTED_AND_ENABLED) {
			var unsupportedInfo = Browser.document.createElement('div');
			unsupportedInfo.style.position = 'absolute';
			unsupportedInfo.style.top = '10px';
			unsupportedInfo.style.width = '100%';
			unsupportedInfo.style.textAlign = 'center';
			unsupportedInfo.style.color = '#ffffff';
			
			switch(glSupported) {
				case WebGLSupport.NOT_SUPPORTED:
					unsupportedInfo.innerHTML = 'Your browser does not support WebGL. Click <a href="' + REPO_URL + '" target="_blank">here for project info</a> instead.';
				case WebGLSupport.SUPPORTED_BUT_DISABLED:
					unsupportedInfo.innerHTML = 'Your browser supports WebGL, but the feature appears to be disabled. Click <a href="' + REPO_URL + '" target="_blank">here for project info</a> instead.';
				default:
					unsupportedInfo.innerHTML = 'Could not detect WebGL support. Click <a href="' + REPO_URL + '" target="_blank">here for project info</a> instead.';
			}
			
			gameDiv.appendChild(unsupportedInfo);
			return;
		}
		
		// Attach game div
		gameAttachPoint = Browser.document.getElementById("game");
		gameAttachPoint.appendChild(gameDiv);
		
		// Setup WebGL renderer
        renderer = new WebGLRenderer({ antialias: true });
        renderer.sortObjects = false;
		renderer.autoClear = false;
		renderer.setClearColor(new Color(0xff0000));
		renderer.setPixelRatio(Browser.window.devicePixelRatio);
		
		var width = Browser.window.innerWidth * renderer.getPixelRatio();
		var height = Browser.window.innerHeight * renderer.getPixelRatio();
		
		// Setup scene
		worldScene = new Scene();
		
		// Setup cameras
        worldCamera = new PerspectiveCamera(75, width / height, 100, 700);
		worldCamera.position.z = 500;
		
		// Setup passes		
		var depthShader = ShaderLib.depthRGBA;
		var depthUniforms = UniformsUtils.clone(depthShader.uniforms);
		depthMaterial = new ShaderMaterial( { vertexShader: depthShader.vertexShader, fragmentShader: depthShader.fragmentShader, uniforms: depthUniforms, blending: Blending.NoBlending } );
		depthRenderTarget = new WebGLRenderTarget(width, height, { minFilter: TextureFilter.LinearFilter, magFilter: TextureFilter.LinearFilter } );
		
		// SSAO
		ssaoPass = new ShaderPass({ vertexShader: BasicSSAO.vertexShader, fragmentShader: BasicSSAO.fragmentShader, uniforms: BasicSSAO.uniforms});
		ssaoPass.renderToScreen = false;
		
		ssaoPass.uniforms.tDepth.value = depthRenderTarget;
		ssaoPass.uniforms.near.value = worldCamera.near;
		ssaoPass.uniforms.far.value = worldCamera.far;
		
		// FXAA
		aaPass = new ShaderPass({ vertexShader: BasicFXAA.vertexShader, fragmentShader: BasicFXAA.fragmentShader, uniforms: BasicFXAA.uniforms});
		aaPass.renderToScreen = true;
		
		aaPass.uniforms.resolution.value.set(width, height);
		
		// Setup composer
		composer = new EffectComposer(renderer);
		composer.addPass(ssaoPass);
		composer.addPass(aaPass);
		
		// Populate scene
		// Cloud of cubes
		var group = new Object3D();
		worldScene.add(group);
		var geometry = new CubeGeometry(5, 5, 5);
		for (i in 0...500) {			
			var mesh = new Mesh(geometry, depthMaterial);
			mesh.position.x = Math.random() * 400 - 200;
			mesh.position.y = Math.random() * 400 - 200;
			mesh.position.z = Math.random() * 400 - 200;
			mesh.rotation.x = Math.random();
			mesh.rotation.y = Math.random();
			mesh.rotation.z = Math.random();

			mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 10 + 1;
			group.add(mesh);
		}

		// Event setup
		// Window resize event
		Browser.window.addEventListener("resize", function():Void {
			signal_windowResized.dispatch();
		}, true);
		
		// Disable context menu opening
		Browser.window.addEventListener("contextmenu", function(event) {
			event.preventDefault();
		}, true);
		
		// Setup dat.gui
		setupGUI();
		
		#if debug
		// Setup performance stats
		setupStats();
		#end
		
		// Connect signals and slots
		signal_windowResized.add(function():Void {
			worldCamera.aspect = Browser.window.innerWidth / Browser.window.innerHeight;
			worldCamera.updateProjectionMatrix();
			renderer.setSize(Browser.window.innerWidth, Browser.window.innerHeight);
		});
		
		signal_windowResized.add(function():Void {
			var pixelRatio = renderer.getPixelRatio();
			var width = Browser.window.innerWidth * pixelRatio;
			var height = Browser.window.innerHeight * pixelRatio;
			
			ssaoPass.uniforms.resolution.value.set(width, height);
			depthRenderTarget.setSize(width, height);
			
			aaPass.uniforms.resolution.value.set(width, height);
			
			composer.setSize(width, height);
		});
		
		// Initial renderer setup
		signal_windowResized.dispatch();
		
		// Present game and start animation loop
		gameDiv.appendChild(renderer.domElement);
		Browser.window.requestAnimationFrame(animate);
	}
	
	private function animate(time:Float):Void {
		#if debug
		stats.begin();
		#end
		
		dt = (time - lastAnimationTime) * 0.001; // Seconds
		lastAnimationTime = time;
		
		// Render into depth texture
		renderer.render(worldScene, worldCamera, depthRenderTarget, true);
		
		// Render to screen
		composer.render();
		
		Browser.window.requestAnimationFrame(animate);
		
		#if debug
		stats.end();
		#end
	}
	
	private inline function setupGUI():Void {
		Sure.sure(sceneGUI == null);
		sceneGUI = new GUI( { autoPlace:true } );
		ThreeObjectGUI.addItem(sceneGUI, worldCamera, "World Camera");
		ThreeObjectGUI.addItem(sceneGUI, worldScene, "Scene");
		
		Sure.sure(shaderGUI == null);
		shaderGUI = new GUI( { autoPlace:true } );
		ShaderGUI.generate(shaderGUI, "Basic SSAO", ssaoPass.uniforms, [ "resolution" ]);
		ShaderGUI.generate(shaderGUI, "Basic FXAA", aaPass.uniforms);
	}
	
	#if debug
	private inline function setupStats(mode:Mode = Mode.MEM):Void {
		Sure.sure(stats == null);
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.left = '0px';
		stats.domElement.style.top = '0px';
		Browser.window.document.body.appendChild(stats.domElement);
	}
	#end
}