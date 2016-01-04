(function (console, $global) { "use strict";
var $estr = function() { return js_Boot.__string_rec(this,''); };
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.indexOf = function(a,obj,i) {
	var len = a.length;
	if(i < 0) {
		i += len;
		if(i < 0) i = 0;
	}
	while(i < len) {
		if(a[i] === obj) return i;
		i++;
	}
	return -1;
};
var Main = function() {
	this.signal_windowResized = new msignal_Signal0();
	window.onload = $bind(this,this.onWindowLoaded);
};
Main.__name__ = true;
Main.main = function() {
	var main = new Main();
};
Main.prototype = {
	onWindowLoaded: function() {
		var _g = this;
		var gameDiv = window.document.createElement("attach");
		var glSupported = WebGLDetector.detect();
		if(glSupported != 0) {
			var unsupportedInfo = window.document.createElement("div");
			unsupportedInfo.style.position = "absolute";
			unsupportedInfo.style.top = "10px";
			unsupportedInfo.style.width = "100%";
			unsupportedInfo.style.textAlign = "center";
			unsupportedInfo.style.color = "#ffffff";
			switch(glSupported) {
			case 2:
				unsupportedInfo.innerHTML = "Your browser does not support WebGL. Click <a href=\"" + "https://github.com/Tw1ddle/Screen-Space-Ambient-Occlusion" + "\" target=\"_blank\">here for project info</a> instead.";
				break;
			case 1:
				unsupportedInfo.innerHTML = "Your browser supports WebGL, but the feature appears to be disabled. Click <a href=\"" + "https://github.com/Tw1ddle/Screen-Space-Ambient-Occlusion" + "\" target=\"_blank\">here for project info</a> instead.";
				break;
			default:
				unsupportedInfo.innerHTML = "Could not detect WebGL support. Click <a href=\"" + "https://github.com/Tw1ddle/Screen-Space-Ambient-Occlusion" + "\" target=\"_blank\">here for project info</a> instead.";
			}
			gameDiv.appendChild(unsupportedInfo);
			return;
		}
		this.gameAttachPoint = window.document.getElementById("game");
		this.gameAttachPoint.appendChild(gameDiv);
		this.renderer = new THREE.WebGLRenderer({ antialias : true});
		this.renderer.sortObjects = false;
		this.renderer.autoClear = false;
		this.renderer.setClearColor(new THREE.Color(16711680));
		this.renderer.setPixelRatio(window.devicePixelRatio);
		var width = window.innerWidth * this.renderer.getPixelRatio();
		var height = window.innerHeight * this.renderer.getPixelRatio();
		this.worldScene = new THREE.Scene();
		this.worldCamera = new THREE.PerspectiveCamera(75,width / height,100,700);
		this.worldCamera.position.z = 500;
		var depthShader = THREE.ShaderLib.depthRGBA;
		var depthUniforms = THREE.UniformsUtils.clone(depthShader.uniforms);
		this.depthMaterial = new THREE.ShaderMaterial({ vertexShader : depthShader.vertexShader, fragmentShader : depthShader.fragmentShader, uniforms : depthUniforms, blending : THREE.NoBlending});
		this.depthRenderTarget = new THREE.WebGLRenderTarget(width,height,{ minFilter : THREE.LinearFilter, magFilter : THREE.LinearFilter});
		this.ssaoPass = new THREE.ShaderPass({ vertexShader : shaders_BasicSSAO.vertexShader, fragmentShader : shaders_BasicSSAO.fragmentShader, uniforms : shaders_BasicSSAO.uniforms});
		this.ssaoPass.renderToScreen = false;
		this.ssaoPass.uniforms.tDepth.value = this.depthRenderTarget;
		this.ssaoPass.uniforms.near.value = this.worldCamera.near;
		this.ssaoPass.uniforms.far.value = this.worldCamera.far;
		this.aaPass = new THREE.ShaderPass({ vertexShader : shaders_BasicFXAA.vertexShader, fragmentShader : shaders_BasicFXAA.fragmentShader, uniforms : shaders_BasicFXAA.uniforms});
		this.aaPass.renderToScreen = true;
		this.aaPass.uniforms.resolution.value.set(width,height);
		this.composer = new THREE.EffectComposer(this.renderer);
		this.composer.addPass(this.ssaoPass);
		this.composer.addPass(this.aaPass);
		var group = new THREE.Object3D();
		this.worldScene.add(group);
		var geometry = new THREE.CubeGeometry(5,5,5);
		var _g1 = 0;
		while(_g1 < 500) {
			var i = _g1++;
			var mesh = new THREE.Mesh(geometry,this.depthMaterial);
			mesh.position.x = Math.random() * 400 - 200;
			mesh.position.y = Math.random() * 400 - 200;
			mesh.position.z = Math.random() * 400 - 200;
			mesh.rotation.x = Math.random();
			mesh.rotation.y = Math.random();
			mesh.rotation.z = Math.random();
			mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 10 + 1;
			group.add(mesh);
		}
		window.addEventListener("resize",function() {
			_g.signal_windowResized.dispatch();
		},true);
		window.addEventListener("contextmenu",function(event) {
			event.preventDefault();
		},true);
		this.setupGUI();
		this.signal_windowResized.add(function() {
			_g.worldCamera.aspect = window.innerWidth / window.innerHeight;
			_g.worldCamera.updateProjectionMatrix();
			_g.renderer.setSize(window.innerWidth,window.innerHeight);
		});
		this.signal_windowResized.add(function() {
			var pixelRatio = _g.renderer.getPixelRatio();
			var width1 = window.innerWidth * pixelRatio;
			var height1 = window.innerHeight * pixelRatio;
			_g.ssaoPass.uniforms.resolution.value.set(width1,height1);
			_g.depthRenderTarget.setSize(width1,height1);
			_g.aaPass.uniforms.resolution.value.set(width1,height1);
			_g.composer.setSize(width1,height1);
		});
		this.signal_windowResized.dispatch();
		gameDiv.appendChild(this.renderer.domElement);
		window.requestAnimationFrame($bind(this,this.animate));
	}
	,animate: function(time) {
		Main.dt = (time - Main.lastAnimationTime) * 0.001;
		Main.lastAnimationTime = time;
		this.renderer.render(this.worldScene,this.worldCamera,this.depthRenderTarget,true);
		this.composer.render();
		window.requestAnimationFrame($bind(this,this.animate));
	}
	,setupGUI: function() {
		var actual = this.sceneGUI;
		var expected = null;
		if(actual != expected) throw new js__$Boot_HaxeError("FAIL: values are not equal (expected: " + Std.string(expected) + ", actual: " + Std.string(actual) + ")");
		this.sceneGUI = new dat.GUI({ autoPlace : true});
		dat_ThreeObjectGUI.addItem(this.sceneGUI,this.worldCamera,"World Camera");
		dat_ThreeObjectGUI.addItem(this.sceneGUI,this.worldScene,"Scene");
		var actual1 = this.shaderGUI;
		var expected1 = null;
		if(actual1 != expected1) throw new js__$Boot_HaxeError("FAIL: values are not equal (expected: " + Std.string(expected1) + ", actual: " + Std.string(actual1) + ")");
		this.shaderGUI = new dat.GUI({ autoPlace : true});
		dat_ShaderGUI.generate(this.shaderGUI,"Basic SSAO",this.ssaoPass.uniforms,["resolution"]);
		dat_ShaderGUI.generate(this.shaderGUI,"Basic FXAA",this.aaPass.uniforms);
	}
	,__class__: Main
};
Math.__name__ = true;
var Reflect = function() { };
Reflect.__name__ = true;
Reflect.field = function(o,field) {
	try {
		return o[field];
	} catch( e ) {
		if (e instanceof js__$Boot_HaxeError) e = e.val;
		return null;
	}
};
Reflect.getProperty = function(o,field) {
	var tmp;
	if(o == null) return null; else if(o.__properties__ && (tmp = o.__properties__["get_" + field])) return o[tmp](); else return o[field];
};
Reflect.fields = function(o) {
	var a = [];
	if(o != null) {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		for( var f in o ) {
		if(f != "__id__" && f != "hx__closures__" && hasOwnProperty.call(o,f)) a.push(f);
		}
	}
	return a;
};
Reflect.isFunction = function(f) {
	return typeof(f) == "function" && !(f.__name__ || f.__ename__);
};
Reflect.compareMethods = function(f1,f2) {
	if(f1 == f2) return true;
	if(!Reflect.isFunction(f1) || !Reflect.isFunction(f2)) return false;
	return f1.scope == f2.scope && f1.method == f2.method && f1.method != null;
};
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
var dat_ShaderGUI = function() { };
dat_ShaderGUI.__name__ = true;
dat_ShaderGUI.generate = function(gui,folderName,uniforms,exclude) {
	var keys = Reflect.fields(uniforms);
	var folder = gui.addFolder(folderName);
	var _g = 0;
	while(_g < keys.length) {
		var key = keys[_g];
		++_g;
		var v = Reflect.getProperty(uniforms,key);
		if(exclude != null && HxOverrides.indexOf(exclude,key,0) != -1) continue;
		var type = v.type;
		var value = v.value;
		switch(type) {
		case "f":
			folder.add(v,"value").listen().name(key);
			break;
		case "i":
			folder.add(v,"value").listen().name(key);
			break;
		case "v2":
			var f = folder.addFolder(key);
			f.add(v.value,"x").listen().name(key + "_x");
			f.add(v.value,"y").listen().name(key + "_y");
			break;
		}
	}
};
var dat_ThreeObjectGUI = function() { };
dat_ThreeObjectGUI.__name__ = true;
dat_ThreeObjectGUI.addItem = function(gui,object,tag) {
	if(gui == null || object == null) return null;
	var folder = null;
	if(tag != null) folder = gui.addFolder(tag + " (" + dat_ThreeObjectGUI.guiItemCount++ + ")"); else {
		var name = Std.string(Reflect.field(object,"name"));
		if(name == null || name.length == 0) folder = gui.addFolder("Item (" + dat_ThreeObjectGUI.guiItemCount++ + ")"); else folder = gui.addFolder(Std.string(Reflect.getProperty(object,"name")) + " (" + dat_ThreeObjectGUI.guiItemCount++ + ")");
	}
	if(js_Boot.__instanceof(object,THREE.Scene)) {
		var scene = object;
		var _g = 0;
		var _g1 = scene.children;
		while(_g < _g1.length) {
			var object1 = _g1[_g];
			++_g;
			dat_ThreeObjectGUI.addItem(gui,object1);
		}
	}
	if(js_Boot.__instanceof(object,THREE.Object3D)) {
		var object3d = object;
		folder.add(object3d.position,"x",-5000.0,5000.0,2).listen();
		folder.add(object3d.position,"y",-5000.0,5000.0,2).listen();
		folder.add(object3d.position,"z",-20000.0,20000.0,2).listen();
		folder.add(object3d.rotation,"x",-Math.PI * 2,Math.PI * 2,0.01).listen();
		folder.add(object3d.rotation,"y",-Math.PI * 2,Math.PI * 2,0.01).listen();
		folder.add(object3d.rotation,"z",-Math.PI * 2,Math.PI * 2,0.01).listen();
		folder.add(object3d.scale,"x",0.0,10.0,0.01).listen();
		folder.add(object3d.scale,"y",0.0,10.0,0.01).listen();
		folder.add(object3d.scale,"z",0.0,10.0,0.01).listen();
	}
	if(js_Boot.__instanceof(object,THREE.PointLight)) {
		var light = object;
		folder.add(light,"intensity",0,3,0.01).listen();
	}
	return folder;
};
var js__$Boot_HaxeError = function(val) {
	Error.call(this);
	this.val = val;
	this.message = String(val);
	if(Error.captureStackTrace) Error.captureStackTrace(this,js__$Boot_HaxeError);
};
js__$Boot_HaxeError.__name__ = true;
js__$Boot_HaxeError.__super__ = Error;
js__$Boot_HaxeError.prototype = $extend(Error.prototype,{
	__class__: js__$Boot_HaxeError
});
var js_Boot = function() { };
js_Boot.__name__ = true;
js_Boot.getClass = function(o) {
	if((o instanceof Array) && o.__enum__ == null) return Array; else {
		var cl = o.__class__;
		if(cl != null) return cl;
		var name = js_Boot.__nativeClassName(o);
		if(name != null) return js_Boot.__resolveNativeClass(name);
		return null;
	}
};
js_Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str2 = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i1 = _g1++;
					if(i1 != 2) str2 += "," + js_Boot.__string_rec(o[i1],s); else str2 += js_Boot.__string_rec(o[i1],s);
				}
				return str2 + ")";
			}
			var l = o.length;
			var i;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js_Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			return "???";
		}
		if(tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js_Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
js_Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0;
		var _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js_Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js_Boot.__interfLoop(cc.__super__,cl);
};
js_Boot.__instanceof = function(o,cl) {
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Array:
		return (o instanceof Array) && o.__enum__ == null;
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) return true;
				if(js_Boot.__interfLoop(js_Boot.getClass(o),cl)) return true;
			} else if(typeof(cl) == "object" && js_Boot.__isNativeObj(cl)) {
				if(o instanceof cl) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
};
js_Boot.__nativeClassName = function(o) {
	var name = js_Boot.__toStr.call(o).slice(8,-1);
	if(name == "Object" || name == "Function" || name == "Math" || name == "JSON") return null;
	return name;
};
js_Boot.__isNativeObj = function(o) {
	return js_Boot.__nativeClassName(o) != null;
};
js_Boot.__resolveNativeClass = function(name) {
	return $global[name];
};
var msignal_Signal = function(valueClasses) {
	if(valueClasses == null) valueClasses = [];
	this.valueClasses = valueClasses;
	this.slots = msignal_SlotList.NIL;
	this.priorityBased = false;
};
msignal_Signal.__name__ = true;
msignal_Signal.prototype = {
	add: function(listener) {
		return this.registerListener(listener);
	}
	,addOnce: function(listener) {
		return this.registerListener(listener,true);
	}
	,addWithPriority: function(listener,priority) {
		if(priority == null) priority = 0;
		return this.registerListener(listener,false,priority);
	}
	,addOnceWithPriority: function(listener,priority) {
		if(priority == null) priority = 0;
		return this.registerListener(listener,true,priority);
	}
	,remove: function(listener) {
		var slot = this.slots.find(listener);
		if(slot == null) return null;
		this.slots = this.slots.filterNot(listener);
		return slot;
	}
	,removeAll: function() {
		this.slots = msignal_SlotList.NIL;
	}
	,registerListener: function(listener,once,priority) {
		if(priority == null) priority = 0;
		if(once == null) once = false;
		if(this.registrationPossible(listener,once)) {
			var newSlot = this.createSlot(listener,once,priority);
			if(!this.priorityBased && priority != 0) this.priorityBased = true;
			if(!this.priorityBased && priority == 0) this.slots = this.slots.prepend(newSlot); else this.slots = this.slots.insertWithPriority(newSlot);
			return newSlot;
		}
		return this.slots.find(listener);
	}
	,registrationPossible: function(listener,once) {
		if(!this.slots.nonEmpty) return true;
		var existingSlot = this.slots.find(listener);
		if(existingSlot == null) return true;
		if(existingSlot.once != once) throw new js__$Boot_HaxeError("You cannot addOnce() then add() the same listener without removing the relationship first.");
		return false;
	}
	,createSlot: function(listener,once,priority) {
		if(priority == null) priority = 0;
		if(once == null) once = false;
		return null;
	}
	,get_numListeners: function() {
		return this.slots.get_length();
	}
	,__class__: msignal_Signal
	,__properties__: {get_numListeners:"get_numListeners"}
};
var msignal_Signal0 = function() {
	msignal_Signal.call(this);
};
msignal_Signal0.__name__ = true;
msignal_Signal0.__super__ = msignal_Signal;
msignal_Signal0.prototype = $extend(msignal_Signal.prototype,{
	dispatch: function() {
		var slotsToProcess = this.slots;
		while(slotsToProcess.nonEmpty) {
			slotsToProcess.head.execute();
			slotsToProcess = slotsToProcess.tail;
		}
	}
	,createSlot: function(listener,once,priority) {
		if(priority == null) priority = 0;
		if(once == null) once = false;
		return new msignal_Slot0(this,listener,once,priority);
	}
	,__class__: msignal_Signal0
});
var msignal_Signal1 = function(type) {
	msignal_Signal.call(this,[type]);
};
msignal_Signal1.__name__ = true;
msignal_Signal1.__super__ = msignal_Signal;
msignal_Signal1.prototype = $extend(msignal_Signal.prototype,{
	dispatch: function(value) {
		var slotsToProcess = this.slots;
		while(slotsToProcess.nonEmpty) {
			slotsToProcess.head.execute(value);
			slotsToProcess = slotsToProcess.tail;
		}
	}
	,createSlot: function(listener,once,priority) {
		if(priority == null) priority = 0;
		if(once == null) once = false;
		return new msignal_Slot1(this,listener,once,priority);
	}
	,__class__: msignal_Signal1
});
var msignal_Signal2 = function(type1,type2) {
	msignal_Signal.call(this,[type1,type2]);
};
msignal_Signal2.__name__ = true;
msignal_Signal2.__super__ = msignal_Signal;
msignal_Signal2.prototype = $extend(msignal_Signal.prototype,{
	dispatch: function(value1,value2) {
		var slotsToProcess = this.slots;
		while(slotsToProcess.nonEmpty) {
			slotsToProcess.head.execute(value1,value2);
			slotsToProcess = slotsToProcess.tail;
		}
	}
	,createSlot: function(listener,once,priority) {
		if(priority == null) priority = 0;
		if(once == null) once = false;
		return new msignal_Slot2(this,listener,once,priority);
	}
	,__class__: msignal_Signal2
});
var msignal_Slot = function(signal,listener,once,priority) {
	if(priority == null) priority = 0;
	if(once == null) once = false;
	this.signal = signal;
	this.set_listener(listener);
	this.once = once;
	this.priority = priority;
	this.enabled = true;
};
msignal_Slot.__name__ = true;
msignal_Slot.prototype = {
	remove: function() {
		this.signal.remove(this.listener);
	}
	,set_listener: function(value) {
		if(value == null) throw new js__$Boot_HaxeError("listener cannot be null");
		return this.listener = value;
	}
	,__class__: msignal_Slot
	,__properties__: {set_listener:"set_listener"}
};
var msignal_Slot0 = function(signal,listener,once,priority) {
	if(priority == null) priority = 0;
	if(once == null) once = false;
	msignal_Slot.call(this,signal,listener,once,priority);
};
msignal_Slot0.__name__ = true;
msignal_Slot0.__super__ = msignal_Slot;
msignal_Slot0.prototype = $extend(msignal_Slot.prototype,{
	execute: function() {
		if(!this.enabled) return;
		if(this.once) this.remove();
		this.listener();
	}
	,__class__: msignal_Slot0
});
var msignal_Slot1 = function(signal,listener,once,priority) {
	if(priority == null) priority = 0;
	if(once == null) once = false;
	msignal_Slot.call(this,signal,listener,once,priority);
};
msignal_Slot1.__name__ = true;
msignal_Slot1.__super__ = msignal_Slot;
msignal_Slot1.prototype = $extend(msignal_Slot.prototype,{
	execute: function(value1) {
		if(!this.enabled) return;
		if(this.once) this.remove();
		if(this.param != null) value1 = this.param;
		this.listener(value1);
	}
	,__class__: msignal_Slot1
});
var msignal_Slot2 = function(signal,listener,once,priority) {
	if(priority == null) priority = 0;
	if(once == null) once = false;
	msignal_Slot.call(this,signal,listener,once,priority);
};
msignal_Slot2.__name__ = true;
msignal_Slot2.__super__ = msignal_Slot;
msignal_Slot2.prototype = $extend(msignal_Slot.prototype,{
	execute: function(value1,value2) {
		if(!this.enabled) return;
		if(this.once) this.remove();
		if(this.param1 != null) value1 = this.param1;
		if(this.param2 != null) value2 = this.param2;
		this.listener(value1,value2);
	}
	,__class__: msignal_Slot2
});
var msignal_SlotList = function(head,tail) {
	this.nonEmpty = false;
	if(head == null && tail == null) {
		if(msignal_SlotList.NIL != null) throw new js__$Boot_HaxeError("Parameters head and tail are null. Use the NIL element instead.");
		this.nonEmpty = false;
	} else if(head == null) throw new js__$Boot_HaxeError("Parameter head cannot be null."); else {
		this.head = head;
		if(tail == null) this.tail = msignal_SlotList.NIL; else this.tail = tail;
		this.nonEmpty = true;
	}
};
msignal_SlotList.__name__ = true;
msignal_SlotList.prototype = {
	get_length: function() {
		if(!this.nonEmpty) return 0;
		if(this.tail == msignal_SlotList.NIL) return 1;
		var result = 0;
		var p = this;
		while(p.nonEmpty) {
			++result;
			p = p.tail;
		}
		return result;
	}
	,prepend: function(slot) {
		return new msignal_SlotList(slot,this);
	}
	,append: function(slot) {
		if(slot == null) return this;
		if(!this.nonEmpty) return new msignal_SlotList(slot);
		if(this.tail == msignal_SlotList.NIL) return new msignal_SlotList(slot).prepend(this.head);
		var wholeClone = new msignal_SlotList(this.head);
		var subClone = wholeClone;
		var current = this.tail;
		while(current.nonEmpty) {
			subClone = subClone.tail = new msignal_SlotList(current.head);
			current = current.tail;
		}
		subClone.tail = new msignal_SlotList(slot);
		return wholeClone;
	}
	,insertWithPriority: function(slot) {
		if(!this.nonEmpty) return new msignal_SlotList(slot);
		var priority = slot.priority;
		if(priority >= this.head.priority) return this.prepend(slot);
		var wholeClone = new msignal_SlotList(this.head);
		var subClone = wholeClone;
		var current = this.tail;
		while(current.nonEmpty) {
			if(priority > current.head.priority) {
				subClone.tail = current.prepend(slot);
				return wholeClone;
			}
			subClone = subClone.tail = new msignal_SlotList(current.head);
			current = current.tail;
		}
		subClone.tail = new msignal_SlotList(slot);
		return wholeClone;
	}
	,filterNot: function(listener) {
		if(!this.nonEmpty || listener == null) return this;
		if(Reflect.compareMethods(this.head.listener,listener)) return this.tail;
		var wholeClone = new msignal_SlotList(this.head);
		var subClone = wholeClone;
		var current = this.tail;
		while(current.nonEmpty) {
			if(Reflect.compareMethods(current.head.listener,listener)) {
				subClone.tail = current.tail;
				return wholeClone;
			}
			subClone = subClone.tail = new msignal_SlotList(current.head);
			current = current.tail;
		}
		return this;
	}
	,contains: function(listener) {
		if(!this.nonEmpty) return false;
		var p = this;
		while(p.nonEmpty) {
			if(Reflect.compareMethods(p.head.listener,listener)) return true;
			p = p.tail;
		}
		return false;
	}
	,find: function(listener) {
		if(!this.nonEmpty) return null;
		var p = this;
		while(p.nonEmpty) {
			if(Reflect.compareMethods(p.head.listener,listener)) return p.head;
			p = p.tail;
		}
		return null;
	}
	,__class__: msignal_SlotList
	,__properties__: {get_length:"get_length"}
};
var shaders_BasicFXAA = function() { };
shaders_BasicFXAA.__name__ = true;
var shaders_BasicSSAO = function() { };
shaders_BasicSSAO.__name__ = true;
var util_FileReader = function() { };
util_FileReader.__name__ = true;
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
if(Array.prototype.indexOf) HxOverrides.indexOf = function(a,o,i) {
	return Array.prototype.indexOf.call(a,o,i);
};
String.prototype.__class__ = String;
String.__name__ = true;
Array.__name__ = true;
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
msignal_SlotList.NIL = new msignal_SlotList(null,null);
Main.REPO_URL = "https://github.com/Tw1ddle/Screen-Space-Ambient-Occlusion";
Main.WEBSITE_URL = "http://samcodes.co.uk/";
Main.TWITTER_URL = "https://twitter.com/Sam_Twidale";
Main.HAXE_URL = "http://haxe.org/";
Main.lastAnimationTime = 0.0;
Main.dt = 0.0;
dat_ThreeObjectGUI.guiItemCount = 0;
js_Boot.__toStr = {}.toString;
shaders_BasicFXAA.uniforms = { tDiffuse : { type : "t", value : null}, resolution : { type : "v2", value : new THREE.Vector2(1024,1024)}};
shaders_BasicFXAA.vertexShader = "varying vec2 vUv;\r\n\r\nvoid main()\r\n{\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
shaders_BasicFXAA.fragmentShader = "// Fast approximate anti-aliasing shader\r\n// Based on the three.js implementation: https://github.com/mrdoob/three.js/blob/master/examples/js/shaders/FXAAShader.js\r\n// Ported to three.js by alteredq: http://alteredqualia.com/ and davidedc: http://www.sketchpatch.net/\r\n// Ported to WebGL by @supereggbert: http://www.geeks3d.com/20110405/fxaa-fast-approximate-anti-aliasing-demo-glsl-opengl-test-radeon-geforce/\r\n// Originally implemented as NVIDIA FXAA by Timothy Lottes: http://timothylottes.blogspot.com/2011/06/fxaa3-source-released.html\r\n// Paper: http://developer.download.nvidia.com/assets/gamedev/files/sdk/11/FXAA_WhitePaper.pdf\r\n\r\n#define FXAA_REDUCE_MIN (1.0/128.0)\r\n#define FXAA_REDUCE_MUL (1.0/8.0)\r\n#define FXAA_SPAN_MAX 8.0\r\n\r\nvarying vec2 vUv;\r\n\r\nuniform sampler2D tDiffuse;\r\nuniform vec2 resolution;\r\n\r\nvoid main()\r\n{\r\n\tvec2 rres = vec2(1.0) / resolution;\r\n\t\r\n\t// Texture lookups to find RGB values in area of current fragment\r\n\tvec3 rgbNW = texture2D(tDiffuse, (gl_FragCoord.xy + vec2(-1.0, -1.0)) * rres).xyz;\r\n\tvec3 rgbNE = texture2D(tDiffuse, (gl_FragCoord.xy + vec2(1.0, -1.0)) * rres).xyz;\r\n\tvec3 rgbSW = texture2D(tDiffuse, (gl_FragCoord.xy + vec2(-1.0, 1.0)) * rres).xyz;\r\n\tvec3 rgbSE = texture2D(tDiffuse, (gl_FragCoord.xy + vec2(1.0, 1.0)) * rres).xyz;\r\n\tvec4 rgbaM = texture2D(tDiffuse, gl_FragCoord.xy  * rres);\r\n\tvec3 rgbM = rgbaM.xyz;\r\n\tfloat opacity = rgbaM.w;\r\n\t\r\n\t// Luminance estimates for colors around current fragment\r\n\tvec3 luma = vec3(0.299, 0.587, 0.114);\r\n\tfloat lumaNW = dot(rgbNW, luma);\r\n\tfloat lumaNE = dot(rgbNE, luma);\r\n\tfloat lumaSW = dot(rgbSW, luma);\r\n\tfloat lumaSE = dot(rgbSE, luma);\r\n\tfloat lumaM  = dot(rgbM, luma);\r\n\tfloat lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));\r\n\tfloat lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));\r\n\r\n\tfloat dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);\r\n\tvec2 dir;\r\n\tdir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));\r\n\tdir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));\r\n\t\r\n\tfloat rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);\r\n\tdir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX), max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX), dir * rcpDirMin)) * rres;\r\n\r\n\tvec3 rgbA = 0.5 * (texture2D(tDiffuse, gl_FragCoord.xy * rres + dir * (1.0 / 3.0 - 0.5 )).xyz + texture2D(tDiffuse, gl_FragCoord.xy * rres + dir * (2.0 / 3.0 - 0.5)).xyz);\r\n\tvec3 rgbB = rgbA * 0.5 + 0.25 * (texture2D(tDiffuse, gl_FragCoord.xy * rres + dir * -0.5).xyz + texture2D(tDiffuse, gl_FragCoord.xy * rres + dir * 0.5).xyz);\r\n\r\n\tfloat lumaB = dot(rgbB, luma);\r\n\t\r\n\tif ((lumaB < lumaMin) || (lumaB > lumaMax))\r\n\t{\r\n\t\tgl_FragColor = vec4(rgbA, opacity);\r\n\t}\r\n\telse\r\n\t{\r\n\t\tgl_FragColor = vec4(rgbB, opacity);\r\n\t}\r\n}";
shaders_BasicSSAO.uniforms = { 'tDepth' : { type : "t", value : null}, 'resolution' : { type : "v2", value : new THREE.Vector2(512,512)}, 'near' : { type : "f", value : 1}, 'far' : { type : "f", value : 100}, 'minDepth' : { type : "f", value : 0.3}, 'radius' : { type : "f", value : 5.0}, 'noiseAmount' : { type : "f", value : 0.0003}, 'diffArea' : { type : "f", value : 0.4}, 'gDisplace' : { type : "f", value : 0.4}, 'gArea' : { type : "f", value : 2.0}};
shaders_BasicSSAO.vertexShader = "varying vec2 vUv;\r\n\r\nvoid main()\r\n{\r\n\tvUv = uv;\r\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n}";
shaders_BasicSSAO.fragmentShader = "// Screen-space ambient occlusion shader\r\n// Adapted from the three.js example: http://threejs.org/examples/#webgl_postprocessing_ssao\r\n// Originally ported to three.js by alteredq: http://alteredqualia.com/\r\n// Based on SSAO GLSL shader v1.2 assembled by Martins Upitis (martinsh): http://devlog-martinsh.blogspot.co.uk/search/label/SSAO\r\n// Original technique by Arkano22: www.gamedev.net/topic/550699-ssao-no-halo-artifacts/\r\n\r\n#define E 2.71828182845904523536 // Eulers number\r\n#define GOLDEN_ANGLE 2.39996322972865332 // PI * (3.0 - sqrt(5.0)) radians. See: https://en.wikipedia.org/wiki/Golden_angle\r\nconst int samples = 16; // AO estimator samples\r\n\r\nvarying vec2 vUv; // UV coordinate of the pixel being processed in [0-1, 0-1]\r\n\r\nuniform sampler2D tDepth; // Depth buffer packed into texture in previous pass\r\nuniform vec2 resolution; // Render target width and height\r\nuniform float near; // Z-near\r\nuniform float far; // Z-far\r\nuniform float minDepth; // Depth clamp, reduces haloing at screen edges\r\nuniform float radius; // AO radius\r\nuniform float noiseAmount; // Noise amount\r\nuniform float diffArea; // Self-shadowing reduction\r\nuniform float gDisplace; // Gauss bell center\r\nuniform float gArea; // Gauss bell width\r\n\r\n// Unpack depth value packed in RGBA value\r\nfloat unpackDepth(const in vec4 rgba)\r\n{\r\n\tconst vec4 bitShift = vec4(1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0);\r\n\treturn dot(rgba, bitShift);\r\n}\r\n\r\n// Read from packed depth texture\r\nfloat readDepth(const in vec2 coord)\r\n{\r\n\tfloat depth = unpackDepth(texture2D(tDepth, coord));\r\n\t\r\n\t// Convert depth value to linear space\r\n\treturn (2.0 * near) / ((near + far) - (depth * (far - near)));\r\n}\r\n\r\nfloat compareDepths(const in float depth1, const in float depth2, inout int far)\r\n{\r\n\tfloat diff = clamp((depth1 - depth2) * 100.0, 0.0, 100.0); // Depth difference\r\n\tfloat area = gArea;\r\n\r\n\t// Reduce left bell width to avoid self-shadowing\r\n\tif (diff < gDisplace)\r\n\t{\r\n\t\tarea = diffArea;\r\n\t}\r\n\telse\r\n\t{\r\n\t\tfar = 1;\r\n\t}\r\n\r\n\tfloat dd = diff - gDisplace;\r\n\tfloat gauss = pow(E, -2.0 * dd * dd / (area * area));\r\n\treturn gauss;\r\n}\r\n\r\nfloat estimateAO(float depth, float dw, float dh)\r\n{\r\n\tfloat dd = radius - depth * radius;\r\n\tvec2 vv = vec2(dw, dh);\r\n\t\r\n\tvec2 coord1 = vUv + dd * vv;\r\n\tint far = 0;\r\n\tfloat temp1 = compareDepths(depth, readDepth(coord1), far);\r\n\t\r\n\t// Linear extrapolation to guess a second layer of depth at a discontinuity\r\n\tif (far > 0)\r\n\t{\r\n\t\tvec2 coord2 = vUv - dd * vv;\r\n\t\tfloat temp2 = compareDepths(depth, readDepth(coord2), far);\r\n\t\ttemp1 += (1.0 - temp1) * temp2;\r\n\t}\r\n\r\n\treturn temp1;\r\n}\r\n\r\n// Noise generation for dithering\r\nvec2 rand(const in vec2 coord)\r\n{\r\n\tfloat noiseX = dot(coord, vec2(12.9898, 78.233));\r\n\tfloat noiseY = dot(coord, vec2(12.9898, 78.233) * 2.0);\r\n\tvec2 noise = clamp(fract(sin(vec2(noiseX, noiseY)) * 43758.5453), 0.0, 1.0);\r\n\treturn (noise * 2.0 - 1.0) * noiseAmount;\r\n}\r\n\r\nvoid main()\r\n{\r\n\tfloat depth = readDepth(vUv);\r\n\tfloat ao = 1.0;\r\n\t\r\n\tif(depth < 1.00) // Avoid doing SSAO on sky\r\n\t{\r\n\t\tfloat tt = clamp(depth, minDepth, 1.0);\r\n\t\t\r\n\t\tvec2 noise = rand(vUv);\r\n\t\tfloat w = (1.0 / resolution.x)  / tt + (noise.x * (1.0 - noise.x));\r\n\t\tfloat h = (1.0 / resolution.y) / tt + (noise.y * (1.0 - noise.y));\r\n\t\t\r\n\t\t// Gets the average estimated AO across sample points on a sphere using golden section spiral method\r\n\t\tfloat dz = 1.0 / float(samples);\r\n\t\tfloat z = 1.0 - dz / 2.0;\r\n\t\tfloat l = 0.0;\r\n\t\tfor (int i = 0; i <= samples; i++)\r\n\t\t{\r\n\t\t\tfloat r = sqrt(1.0 - z);\r\n\t\t\tfloat pw = cos(l) * r;\r\n\t\t\tfloat ph = sin(l) * r;\r\n\t\t\tao += estimateAO(depth, pw * w, ph * h);\r\n\t\t\tz = z - dz;\r\n\t\t\tl = l + GOLDEN_ANGLE;\r\n\t\t}\r\n\t\tao /= float(samples);\r\n\t}\r\n\t\r\n\tao = 1.0 - ao;\r\n\tgl_FragColor = vec4(vec3(ao), 1.0);\r\n}";
Main.main();
})(typeof console != "undefined" ? console : {log:function(){}}, typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : this);
