var DlyThree = function() {
	this.scene = null;
	this.camera = null;
	this.renderer = null;
	this.ambientLight = null;
	this.directionalLight = null;
	this.canvas = null;

	this.controls = null;
	
	this.isShowGrid = true;
	this.plane = null;
	this.planeSize = 250;
	this.boxSize = 5;
	
	this.onAnimate = null;

	this.meshes = [];

	this.zoom = 10;
};

DlyThree.prototype.Start = function(canvas) {
    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
	

	if (!this.InitThree(canvas)) {
		return false;
	}

	if (!this.InitCamera()) {
		return false;
	}

	if (!this.InitLights()) {
		return false;
	}
	
	if (!this.InitControls()) {
		return false;
	}

	
	// Grid

	this.size = this.planeSize / 2;
	
	var step = this.boxSize;

	var geometry = new THREE.Geometry();

	for (var i = -this.size; i <= this.size; i += step) {

		geometry.vertices.push(new THREE.Vector3(-this.size, i, 0));
		geometry.vertices.push(new THREE.Vector3(this.size, i, 0));

		geometry.vertices.push(new THREE.Vector3(i, -this.size, 0));
		geometry.vertices.push(new THREE.Vector3(i, this.size, 0));

	}

	var material = new THREE.LineBasicMaterial({
		color: 0x000000,
		opacity: 0.2,
		transparent: true
	});

	this.grid = new THREE.Line(geometry, material, THREE.LinePieces);
	this.scene.add(this.grid);
	this.grid.visible = this.isShowGrid;

	var parent = this;
        window.addEventListener('resize', function () {
            parent.Resize(canvas);
        }, false);

        
    this.animate();
	return true;
};

DlyThree.prototype.InitThree = function(canvas) {
	this.canvas = canvas;
    this.canvas.width = $(canvas).parent().width();
    this.canvas.height = $(canvas).parent().height();
    //console.log($(window).height(), $('#main-nav').outerHeight());
	if (!this.canvas || !this.canvas.getContext) {
		return false;
	}

	this.scene = new THREE.Scene();
	if (!this.scene) {
		return false;
	}

	var parameters = {
		canvas: this.canvas,
		antialias: true,
                preserveDrawingBuffer: true 
	};
	this.renderer = new THREE.WebGLRenderer(parameters);
	if (!this.renderer) {
		return false;
	}
	// 设置背景颜色  EAE3D2 F2F1EC A99c89
	this.renderer.setClearColor(new THREE.Color(0xeeeeee));
	this.renderer.setSize(this.canvas.width, this.canvas.height);
	return true;
};

DlyThree.prototype.InitCamera = function () {
	var scope = this;
    this.camera = new THREE.PerspectiveCamera( 45, this.canvas.width / this.canvas.height, 1, 10000 );
    this.camera.position.set(0,-100,150);
    // this.camera.rotation.set(1,0,0);
    this.camera.up.x = 0;
    this.camera.up.y = 0;
    this.camera.up.z = 5;
    
    this.scene.add(this.camera);
    
    return true;
};

DlyThree.prototype.InitLights = function () {
    // // this.scene.add( new THREE.HemisphereLight( 0x443333, 0x111122 ) );
    // // this.ambientLight = new THREE.AmbientLight(0x202020);
    // // this.camera.add(this.ambientLight);
    // this.scene.add( new THREE.HemisphereLight( 0x443333, 0x111222 ) );
    // // // 环境光源
    // this.ambientLight = new THREE.AmbientLight(0x202020);
    // this.camera.add(this.ambientLight);

    // // // 平行光源
    // this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
    // // this.directionalLight.position.x = 1;
    // // this.directionalLight.position.y = 1;
    // // this.directionalLight.position.z = 2;

    // this.directionalLight.position.x = 1;
    // this.directionalLight.position.y = 1;
    // this.directionalLight.position.z = 1;

    // this.directionalLight.position.normalize();
    // this.camera.add(this.directionalLight);
    // 点光源
    this.pointLight = new THREE.PointLight(0xffffff);
    // this.pointLight.position.x = 0;
    // this.pointLight.position.y = -25;
    // this.pointLight.position.z = 10;

    // this.pointLight.position.x = 0;
    // this.pointLight.position.y = 0;
    // this.pointLight.position.z = -2;
    this.pointLight.castShadow = true;
    this.pointLight.position.set(0, 0,50);
    // this.scene.add(this.pointLight);
    this.camera.add(this.pointLight);
    return true;
};


DlyThree.prototype.InitControls = function() {
	var scope = this;
	
	// CONTROLS
    this.controls = new THREE.OrbitControls(this.camera,this.canvas);
    //this.controls.enableRotate = false;
    this.controls.addEventListener('change', function(event) {
			// console.log(event+"change");
    	scope.render();
	}, false);
    return true;
}

DlyThree.prototype.Resize = function() {
	this.camera.aspect = this.canvas.width / this.canvas.height;
	this.camera.updateProjectionMatrix();
	this.renderer.setSize(this.canvas.width, this.canvas.height);
};

DlyThree.prototype.render = function() {
    //this.controls.update();
   	// console.log(this.camera.position);
    this.renderer.autoClear = false;
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
};

DlyThree.prototype.animate = function () {
    var parent = this;
    requestAnimationFrame(function () {
        parent.animate();
    });
    this.render();
    if (typeof parent.onAnimate == 'function') {
    	parent.onAnimate.call(this);
    }
};

DlyThree.prototype.toggleGrid = function () {
	this.isShowGrid = !this.isShowGrid;
	this.grid.visible = this.isShowGrid;
};


DlyThree.prototype.addMesh = function (meth) {
	this.meshes.push(meth);
	this.scene.add(meth);
};

DlyThree.prototype.delMeth = function(meth) {
	this.scene.remove(meth);
	for (var i in this.meshes) {
		if (this.meshes[i] == meth) {
			this.meshes.splice(i, 1);
		}
	}
};


/** 导出场景里所有的数据 */
DlyThree.prototype.exportAllBinarySTL = function () {
	var vector = new THREE.Vector3();
	var normalMatrixWorld = new THREE.Matrix3();


	// We collect objects first, as we may need to convert from BufferGeometry to Geometry
	var objects = [];
	var triangles = 0;
	for (var key in this.meshes) {
		var object = this.meshes[key];


		if ( ! ( object instanceof THREE.Mesh ) ) continue;

		var geometry = object.geometry;
		if ( geometry instanceof THREE.BufferGeometry ) {

			geometry = new THREE.Geometry().fromBufferGeometry( geometry );

		}

		if ( ! ( geometry instanceof THREE.Geometry ) ) continue;
		triangles += geometry.faces.length;

		objects.push( {

			geometry: geometry,
			matrix: object.matrixWorld

		} );

	}

	var offset = 80; // skip header
	var bufferLength = triangles * 2 + triangles * 3 * 4 * 4 + 80 + 4;
	var arrayBuffer = new ArrayBuffer( bufferLength );
	var output = new DataView( arrayBuffer );
	output.setUint32( offset, triangles, true ); offset += 4;

	// Traversing our collected objects
	objects.forEach( function ( object ) {

		var vertices = object.geometry.vertices;
		var faces = object.geometry.faces;

		normalMatrixWorld.getNormalMatrix( object.matrix );

		for ( var i = 0, l = faces.length; i < l; i ++ ) {

			var face = faces[ i ];

			vector.copy( face.normal ).applyMatrix3( normalMatrixWorld ).normalize();

			output.setFloat32( offset, vector.x, true ); offset += 4; // normal
			output.setFloat32( offset, vector.y, true ); offset += 4;
			output.setFloat32( offset, vector.z, true ); offset += 4;

			var indices = [ face.a, face.b, face.c ];

			for ( var j = 0; j < 3; j ++ ) {

				vector.copy( vertices[ indices[ j ] ] ).applyMatrix4( object.matrix );

				output.setFloat32( offset, vector.x, true ); offset += 4; // vertices
				output.setFloat32( offset, vector.y, true ); offset += 4;
				output.setFloat32( offset, vector.z, true ); offset += 4;

			}

			output.setUint16( offset, 0, true ); offset += 2; // attribute byte count

		}

	} );

	return output;

};


var Detector = {
	canvas: !! window.CanvasRenderingContext2D,
	webgl: ( function () {
		try {
			var canvas = document.createElement( 'canvas' ); return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) );
		} catch ( e ) {
			return false;
		}
	} )(),
	workers: !! window.Worker,
	fileapi: window.File && window.FileReader && window.FileList && window.Blob,
	getWebGLErrorMessage: function () {
		var element = document.createElement( 'div' );
		element.id = 'webgl-error-message';

		if ( ! this.webgl ) {
             element.innerHTML = window.WebGLRenderingContext ? [
                '<i style="font-size: 48px" class="icondyl" style="color: #fff">&#xe60b;</i><br />Your graphics card does not seem to support <a target="_parent" href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#f00">WebGL</a>.<br />',
                'Find out how to get it <a target="_parent" href="http://get.webgl.org/" style="color:#f00">here</a>.<br /><br />',
                '很抱歉，您的显卡不支持或浏览器未开启 <a target="_parent" href="http://get.webgl.org/" style="color:#f00">3D渲染效果</a>.<br />',
                '请升级您的浏览器至 Chrome谷歌浏览器、火狐浏览器等其他非IE浏览器.<br/><a target="_parent" style="color:#f00;font-size:28px;padding-top:20px" href="http://rj.baidu.com/soft/detail/14744.html?ald">谷歌浏览器下载地址</a><br />',
                '如果使用谷歌浏览器依然无法使用3D渲染，请联系网站技术客服帮您解决！'
            ].join( '\n' ) : [
                    '<i style="font-size: 48px" class="icondyl" style="color: #fff">&#xe60b;</i><br />Your browser does not seem to support <a target="_parent" href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#f00">WebGL</a>.<br/>',
                    'Find out how to get it <a target="_parent" href="http://get.webgl.org/" style="color:#f00">here</a>.<br /><br />',
                    '很抱歉，您的浏览器太老了，不支持 <span style="color:#f00">3D渲染效果</span>.<br />',
                    '请升级您的浏览器至 Chrome谷歌浏览器、火狐浏览器、360浏览器、QQ浏览器等其他非IE浏览器.<br/><a target="_parent" style="color:#f00;font-size:28px;padding-top:20px" href="http://rj.baidu.com/soft/detail/14744.html?ald">谷歌浏览器下载地址</a>'
            ].join( '\n' );
		}
		return element;
	},

	addGetWebGLMessage: function ( parameters ) {

		var parent, id, element;

		parameters = parameters || {};

		parent = parameters.parent !== undefined ? parameters.parent : document.body;
		id = parameters.id !== undefined ? parameters.id : 'oldie';

		element = Detector.getWebGLErrorMessage();
		element.id = id;

		parent.appendChild( element );

	}

};
