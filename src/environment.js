/*
This file defines HYPERLAND elements, global settings

The HLEnvironment module inits scene, renderer, camera, effects, shaders, geometries, materials, meshes
*/

// HL Environment constants and parameters
var HLE = {
  WORLD_WIDTH:5000,
  WORLD_HEIGHT:400,
  WORLD_TILES:128,
  TILE_SIZE:null,
  SEA_TILES:32,
  SEA_TILE_SIZE:null,

  PIXEL_RATIO_SCALE:0.5,


  FOG:true,
  MIRROR:isWire===true?false: false,
  WATER:isWire===true?false: true,

  MAX_MOVE_SPEED: null,
  BASE_MOVE_SPEED: 0,
  CENTER_PATH:false, // true if you don't want terrain in the middle of the scene

  reactiveMoveSpeed:0, // changes programmatically - audio
  moveSpeed:0, // stores final computed move speed

  BASE_SEA_SPEED:2.5,
  CLOUDS_SPEED:1,

  MAX_MODELS_OUT:50,

  reactiveSeaHeight:0, // changes programmatically - audio

  landZeroPoint:0, // actually not a geometry, just a float to be multiplied to compute height
  landHeight:30, // actually not a geometry, just a float to be added to compute height
  landCliffFrequency:0.5,
  LAND_Y_SHIFT:0,
  LAND_IS_BUFFER:false,

  seaStepsCount:0,
  landStepsCount:0,

  CLOUDS_AMOUNT : 200,
  FLORA_AMOUNT : 1,
  MAX_FAUNA: 50,

  mobileConnected : 1, // this will represent mobile users, and will change live, so we set a MAX_FAUNA as top limit


  noiseSeed:0,
  noiseFrequency:1,
  noiseFrequency2:1,

  cameraHeight:0, // will change live
  smoothCameraHeight:10, // will change live
}


//HL Colors Library
var HLC = {
  horizon: new THREE.Color(0xffffff),
  land: new THREE.Color(0xff0000),
  sea: new THREE.Color(0x000611),

  underHorizon: new THREE.Color(.0, .02, .02),
  underLand: new THREE.Color(.1, .9, .9),
  underSea: new THREE.Color(.1, .9, .9),

  flora: new THREE.Color(1,1,0),
  fauna: new THREE.Color(1,0,0),
  clouds: new THREE.Color(1,1,1),

  gWhite: new THREE.Color(0xffffff),
}


// HL scene library
var HL = {
  scene:null,
  renderer:null,
  camera:null,
  stereoEffect:null,
  controls:null,
  clock:null,
  noise:null,

  geometries: {
    skybox:null,
    land:null,
    sea:null,
    seaHeights:null, // actually not a geometry, just an array of heights per row to be added to a sine motion
    clouds: null,
    fauna: null,
  },
  materials: {
    skybox:null,
    land:null,
    sea:null,
    water:null,
    mirror:null,
    clouds:null,
    flora:null,
    fauna:null,
    models:null,
  },
  textures: {
    skybox:"img/skybox2/skydome2.jpg",
    skymapcity:"img/skybox2/skymap_photo9.jpg",
    land:null,
    sea:null,
    clouds:null,
    flora:"img/tex_tree_82_128x128.png",
    fauna:null,
    water:"img/waternormals3.png",//wn5
    whale:"3dm/BL_WHALE/BL_WHALE2.jpg",
    whale2:null,
    ducky:"3dm/ducky/ducky.png",
  },
  dynamicTextures:{
    stars:null,
  },
  models: {
    whale:["3dm/BL_WHALE/BL_WHALE2.OBJ",50],
    ducky:["3dm/ducky/ducky.obj",50],
    whale2:["3dm/BL_WHALE/BL_WHALE2.OBJ",80],
  },
  dynamicModels:{length:0},
  // meshes
  skybox:null,
  land:null,
  sea:null,
  clouds:true,
  flora:null,
  fauna:null,

  lights:{
    ambient:null,
    directional:null,
    sun:null,
  },
}


var HLEnvironment = function(){

  var imagesCounter=0,imagesLoaded=0;
  function imageLoaded(){
    imagesLoaded++;
    console.log("image loaded "+imagesLoaded+"/"+imagesCounter);
    if(imagesLoaded==imagesCounter) { console.timeEnd('images'); initMaterials();}
  }
  function loadTextures(){
    console.time('images');
    var loader = new THREE.TextureLoader();
    for (var key in HL.textures)
      if(HL.textures[key]!=null){
        imagesCounter++;
        HL.textures[key] = loader.load( HL.textures[key], imageLoaded , null,function(i){console.error(i)});
      }
  }

  function initDynamicTextures(){
    console.time('dyn textures');

    for(var k in HL.dynamicTextures){
      HL.dynamicTextures[k] = document.createElement('canvas');
      HL.dynamicTextures[k].width = 512;
      HL.dynamicTextures[k].height = 512;
      HL.dynamicTextures[k]['c'] = HL.dynamicTextures[k].getContext('2d');
      HL.dynamicTextures[k]['texture'] = new THREE.Texture(HL.dynamicTextures[k]);
    }
    console.timeEnd('dyn textures');
  }

  function init(){
    console.time('HL environment');

    initEnvironment();
    initLights();
    initGeometries();
    initDynamicTextures();
    loadTextures();
    // loadTextures() calls initMaterials() once all images are loaded
    // initMaterials() calls initMeshes()
    // initMeshes() is the last call, so it dispatches HLEload event

    // start clock;
    HL.clock.start();
  }

  function initEnvironment(){
    console.time('environment');

    // SET CONSTANTS
    HLE.TILE_SIZE = HLE.WORLD_WIDTH / HLE.WORLD_TILES;
    HLE.SEA_TILE_SIZE = HLE.WORLD_WIDTH / HLE.SEA_TILES;
    HLE.LAND_Y_SHIFT = -HLE.WORLD_HEIGHT*0.1;
    HLE.MAX_MOVE_SPEED = Math.min(20,HLE.TILE_SIZE);
    HLE.BASE_MOVE_SPEED = HLE.WORLD_WIDTH/HLE.WORLD_TILES/2;

    // init clock
    HL.clock = new THREE.Clock();

    //init noise
    HLE.noiseSeed = Math.random() * 1000;
    HL.noise = new ImprovedNoise();

    // SCENE
    HL.scene = new THREE.Scene();

    if(HLE.FOG && !isWire){
      HL.scene.fog = new THREE.Fog(HLC.horizon, HLE.WORLD_WIDTH * HLE.CENTER_PATH?0.25:0.20, HLE.WORLD_WIDTH * 0.45);
      HL.scene.fog.color = HLC.horizon;
    }


    // CAMERA
    if(isVR){
    HL.camera = new THREE.PerspectiveCamera(17.5, window.innerWidth / window.innerHeight, 3, HLE.WORLD_WIDTH*3);
    HL.camera.focus = HLE.WORLD_WIDTH * 1; // USED ONLY IN StereoCamera, if any
    }
    else
      HL.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.5, 3000000);

    // TODO check filmGauge and filmOffset effects
    // HL.camera.filmGauge = 1;
    // HL.camera.filmOffset = 100;
    HL.camera.position.y = 40;


    // RENDERER
    // TODO: The easyest method to spedup FPS on slow mobile, is to reduce resolution
    // we can do this by settind pixel ratio to fraction of devicePixelRatio
    // for now we lock this to 1; NOTE: this will not render to retina resolutions
    // use     HL.renderer.setPixelRatio(window.devicePixelRatio); for retina rendering

    if(HLE.PIXEL_RATIO_SCALE && HLE.PIXEL_RATIO_SCALE<1 && HLE.PIXEL_RATIO_SCALE>0){
      HL.renderer = new THREE.WebGLRenderer({antialias: false});
      HL.renderer.setSize(window.innerWidth, window.innerHeight, true);
      HL.renderer.setPixelRatio(window.devicePixelRatio * HLE.PIXEL_RATIO_SCALE);
      HL.renderer.domElement.style.imageRendering = 'pixelated';
      HL.renderer.domElement.style.imageRendering += '-webkit-crisp-edges';
      HL.renderer.domElement.style.imageRendering += '-moz-crisp-edges';
    }
    else {
      HL.renderer = new THREE.WebGLRenderer({antialias: true});
      HL.renderer.setSize(window.innerWidth, window.innerHeight);
      HL.renderer.setPixelRatio(window.devicePixelRatio);
    }
    // HL.renderer.shadowMap.enabled = true;
    //HL.renderer.sortObjects = false;
    document.body.appendChild(HL.renderer.domElement);


    // EFFECT AND CONTROLS
    if(isVR){
      HL.stereoEffect = new THREE.StereoEffect(HL.renderer);
      HL.stereoEffect.setSize(window.innerWidth, window.innerHeight);
    }

    if (isMobile){
      HL.controls = new THREE.DeviceOrientationControls(HL.camera);
    }
    else if(isFPC){
      HL.controls = new THREE.FirstPersonControls(HL.camera);
		  HL.controls.movementSpeed = 10;
		  HL.controls.lookSpeed = 0.1;
    }
    else if(isNoiseCam){
      HL.controls = new THREE.NoiseCameraMove(HL.camera);
    }
    else if(isOrbit){
      HL.controls = new THREE.OrbitControls(HL.camera);
    }

    console.timeEnd('environment');
  }


  function initGeometries(){
    console.time('geometries');

  //  HL.geometries.skybox = new THREE.BoxGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH, HLE.WORLD_WIDTH-HLE.TILE_SIZE);
  //  HL.geometries.skybox.translate(0,0, HLE.TILE_SIZE*0.5);
    HL.geometries.skybox = new THREE.SphereBufferGeometry(HLE.WORLD_WIDTH*3-10,10,10);
    // SphereBufferGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength)

    if(HLE.LAND_IS_BUFFER)
    HL.geometries.land = new THREE.PlaneBufferGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH,
      HLE.WORLD_TILES , HLE.WORLD_TILES);
    else
      HL.geometries.land = new THREE.PlaneGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH,
        HLE.WORLD_TILES , HLE.WORLD_TILES);
    HL.geometries.land.rotateX(-Math.PI / 2); // gotta rotate because Planes in THREE are created vertical
    HL.geometries.land.dynamic = true;

    if(HLE.WATER)
      HL.geometries.sea = new THREE.PlaneBufferGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH,
      1,1);
    if(HLE.MIRROR)
      HL.geometries.sea = new THREE.PlaneBufferGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH,
        HLE.SEA_TILES ,  HLE.SEA_TILES);
    else
      HL.geometries.sea = new THREE.PlaneGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH,
        HLE.SEA_TILES ,  HLE.SEA_TILES);

    HL.geometries.sea.rotateX(-Math.PI / 2); // gotta rotate because Planes in THREE are created vertical
    //HL.geometries.sea.dynamic = true;

    HL.geometries.seaHeights = [];
    for(var i=0; i<HLE.WORLD_TILES;i++)
      HL.geometries.seaHeights[i]=1;

    // init and set oarticle systems geometries
    HL.geometries.clouds = new THREE.BufferGeometry();
    HLH.initBufParticleSystem(HL.geometries.clouds, HLE.WORLD_WIDTH*2, HLE.WORLD_HEIGHT, HLE.CLOUDS_AMOUNT, true, true);
    HL.geometries.flora = new THREE.BufferGeometry();
    HLH.initBufParticleSystem(HL.geometries.flora , HLE.WORLD_WIDTH, HLE.WORLD_HEIGHT, HLE.FLORA_AMOUNT, false, true);
    HL.geometries.fauna = new THREE.BufferGeometry();
    HLH.initBufParticleSystem(HL.geometries.fauna , HLE.WORLD_WIDTH, HLE.WORLD_HEIGHT*0.5, HLE.MAX_FAUNA, true, true);

    console.timeEnd('geometries');
  }


  function initMaterials(){
    console.time('materials');

    HL.materials.skybox = new THREE.MeshBasicMaterial({
      color: HLC.horizon,
      fog: false,
      side: THREE.BackSide,
      wireframe: false,//isWire,
      wireframeLinewidth: 2,
      map:isWire?null:HL.textures.skybox,
    });
    HL.materials.skybox.color = HLC.horizon; // set by reference
    // HL.textures.skybox.wrapS = HL.textures.skybox.wrapT = THREE.RepeatWrapping;
    // HL.textures.skybox.repeat.set( 3, 1);
    //  HL.materials.skybox = new THREE.SkyboxMaterial('img/skybox1/','.jpg').material;


    // HL.materials.land = new THREE.MeshBasicMaterial({
    //   color: HLC.land,
    //   side: THREE.FrontSide,
    //   fog: true,
    //   wireframe: isWire,
    //   wireframeLinewidth: 2,
    //   opacity: 1,
    //   transparent:false,
    //   //shading: THREE.FlatShading,
    //     map: new THREE.TextureLoader().load( "img/blur-400x400.png" ),
    // //  normalMap: rockNormalMap,
    // });
    // HL.materials.land.color = HLC.land; // set by reference
    //   HL.materials.land.map.wrapS = THREE.RepeatWrapping;
    //   HL.materials.land.map.wrapT = THREE.RepeatWrapping;
    //   HL.materials.land.map.repeat.set( 1, HLE.WORLD_TILES);


     HL.materials.land = new THREE.LandDepthMaterial({
       color:HLC.land,
       waterColor: 0x444444,
       wireframe:isWire,
       wireframeLinewidth:2,
       map:isWire?null:HL.textures.land,
       fog:true,
       landHeight:HLE.WORLD_HEIGHT * 0.5,
    });

    if(!HLE.WATER && !HLE.MIRROR){
      HL.materials.sea = new THREE.MeshBasicMaterial({
        color: HLC.sea,
        //side: THREE.DoubleSide,
        fog: true,
        wireframe: isWire,
        wireframeLinewidth: 2,
         transparent:false,
         opacity:0.80,
         alphaTest: 0.5,
         map:isWire?null:HL.textures.sea
      });
      HL.materials.sea.color = HLC.sea; // set by reference

      if(!isWire && HL.textures.sea!=null){
          HL.textures.sea.wrapS = THREE.RepeatWrapping;
          HL.textures.sea.wrapT = THREE.RepeatWrapping;
          HL.textures.sea.repeat.set( HLE.WORLD_TILES*4, 1);
      }
    }

    if(HLE.MIRROR) {
      HL.materials.mirror = new THREE.Mirror( HL.renderer, HL.camera,
        { clipBias: 0,//0.0003,
          textureWidth: 512,
          textureHeight: 512,
          color: 0x111111,//666666,
          fog: true,
          side: THREE.DoubleSide,
          worldWidth: HLE.WORLD_WIDTH,
          transparent:false,
          opacity:1,//0.657,
          wireframe:isWire,
          wireframeLinewidth:2,
         }
      );
      HL.materials.mirror.rotateX( - Math.PI / 2 );
    }

   if(HLE.WATER) {

      // Load textures
  		HL.textures.water.wrapS = HL.textures.water.wrapT = THREE.RepeatWrapping;
      HL.textures.water.repeat.set( 1, 3);

  		// Create the water effect
  		HL.materials.water = new THREE.Water(HL.renderer, HL.camera, HL.scene, {
  			textureWidth: 512,
  			textureHeight: 512,
  			waterNormals: HL.textures.water,
        noiseScale: 2.14,
  			sunDirection: HL.lights.sun.position.normalize(),
//        sunDirection: new THREE.Vector3(0,HLE.WORLD_HEIGHT, -HLE.WORLD_WIDTH*0.25).normalize(),
  			sunColor: 0x7f7f66,
  			// color: HLC.sea,
  			// betaVersion: 1,
        fog: true,
        side: THREE.DoubleSide,
        wireframe:isWire,
        wireframeLinewidth:2,
  		});
    }



    HL.materials.clouds = new THREE.PointsMaterial({
      color: HLC.clouds,
      side: THREE.DoubleSide,
      opacity:.5,
      transparent: false,
      size: 20,
      fog: true,
      sizeAttenuation: true,
      //alphaTest: 0.5,
      depthWrite: false,
      map:isWire?null:HL.textures.clouds,
    });
    HL.materials.clouds.color = HLC.clouds; // set by reference


    HL.materials.flora = new THREE.PointsMaterial({
      color: HLC.flora,
      side: THREE.DoubleSide,
      opacity: 0.5,
      transparent: true,
      size: 100,
      fog: true,
      //blending:THREE.AdditiveBlending,
      sizeAttenuation: true,
      alphaTest: 0.1,
      map:isWire?null:HL.textures.flora,
      //depthTest:false,
    });
    HL.materials.flora.color = HLC.flora; // set by reference


    HL.materials.fauna = new THREE.PointsMaterial({
      color: HLC.fauna,
      // side: THREE.DoubleSide,
      opacity: .6,
      transparent: false,
      size: 10,
      fog: true,
      sizeAttenuation: true,
      map:isWire?null:HL.textures.fauna,
      alphaTest: 0.5,
      //blending: THREE.AdditiveBlending,
    });
    HL.materials.fauna.color = HLC.fauna; // set by reference


    //create materials for each model
    for(var k in HL.models){
      HL.materials[k] = new THREE.MeshLambertMaterial({
        color:HL.textures[k]!==undefined?0xffffff:(isWire?0xff0000:0x7f7f7f),
        map:isWire?null:(HL.textures[k]!==undefined?HL.textures[k]:null),
        fog:true,
        wireframe:isWire,
        wireframeLinewidth:2,
        side:THREE.FrontSide,
      });
    }


    console.timeEnd('materials');

    initModels();

    initMeshes();
  }

  function initModels(){
    console.time('models');

    var loader = new THREE.OBJLoader(), modelPath, modelScale, counter=0;
    var keys = {};
    // load a resource
    for (var key in HL.models){
      if(HL.models[key]!==null){
        modelPath = HL.models[key][0];
        modelScale = HL.models[key][1];
        loader.load(
          // resource URL
          modelPath,
          // Function when resource is loaded
          // use the closure trick to dereference and pass key to the delayed out onLoad funtion
        //  (function(i) { return function() { alert( i ) } })(i);
          (function ( nK , modelScale) {
            return function( object ){
            HL.models[nK]=object.children[0];
            HL.models[nK].name = nK;
            HL.models[nK].geometry.scale(modelScale,modelScale,modelScale);
//            HL.models[key].geometry.rotateX(Math.PI*0.5);
            HL.models[nK].geometry.computeBoundingBox();
            HL.models[nK]['size']=HL.models[nK].geometry.boundingBox.size();
            HL.models[nK].material = HL.materials[nK];
          //  HL.models[nK].material.color = HLC.horizon; // set by reference

            HL.scene.add( HL.models[nK] );
            HLH.resetModel(HL.models[nK] );
            }
          })(key, modelScale)
        );
      }
    }

    console.timeEnd('models');
  };


  function initLights(){
    console.time('lights');

     HL.lights.ambient = new THREE.AmbientLight( 0xbbbbbb );
     HL.scene.add( HL.lights.ambient );
  //
  //   HL.lights.directional = new THREE.DirectionalLight( 0xffffff, 10);
  //   HL.lights.directional.color = HLC.horizon;
  //   HL.lights.directional.position.set(0,HLE.WORLD_HEIGHT, -HLE.WORLD_WIDTH*0.5);
  // //  HL.lights.directional.castShadows = false;
  //   HL.scene.add( HL.lights.directional );

     HL.lights.sun = new THREE.DirectionalLight( 0xffffff, .5);
     HL.lights.sun.color = HLC.horizon;
     HL.lights.sun.position.set(0,HLE.WORLD_HEIGHT*4, -HLE.WORLD_WIDTH*2);
     //  HL.lights.sun.castShadows = false;
     HL.scene.add( HL.lights.sun );


     HL.lights['moon'] = new THREE.DirectionalLight( 0xdddd77, .5);
     HL.lights.moon.position.set(0,HLE.WORLD_HEIGHT*4, 0);
     //  HL.lights.sun.castShadows = false;
     HL.scene.add( HL.lights.moon );


     console.timeEnd('lights');

  }


  function initMeshes(){
    console.time('meshes');

    HL.skybox = new THREE.Mesh(HL.geometries.skybox, HL.materials.skybox);
    HL.skybox.name = "skybox";
    HL.scene.add(HL.skybox);

    HL.land = new THREE.Mesh(HL.geometries.land, HL.materials.land);
    HL.land.position.y = HLE.LAND_Y_SHIFT; //hardset land at lower height, so we easily see sea
    HL.land.name = "land";
    // HL.land.castShadows = true;
    // HL.land.receiveShadows = true;
    HL.scene.add(HL.land);




    if(HLE.MIRROR) {
      HL.sea = new THREE.Mesh( HL.geometries.sea, HL.materials.mirror.material );
      HL.sea.add( HL.materials.mirror );
    }
    else if(HLE.WATER){
      HL.sea = new THREE.Mesh( new THREE.PlaneBufferGeometry(HLE.WORLD_WIDTH,HLE.WORLD_WIDTH,1,1), HL.materials.water.material );
      HL.sea.add(HL.materials.water);
      HL.sea.rotateX(-Math.PI * .5);
    } else {
      HL.sea = new THREE.Mesh(HL.geometries.sea, HL.materials.sea);
    }
    HL.sea.name = "sea";
    HL.scene.add(HL.sea);
    // HL.sea.receiveShadows = true;




    HL.clouds = new THREE.Points(HL.geometries.clouds, HL.materials.clouds);
    HL.clouds.name = "clouds";
    HL.clouds.frustumCulled = false;
    HL.scene.add(HL.clouds);

    HL.flora = new THREE.Points(HL.geometries.flora, HL.materials.flora);
    HL.flora.name = "flora";
    HL.flora.frustumCulled = false;
    HL.scene.add(HL.flora);

    // HL.fauna = new THREE.Points(HL.geometries.fauna, HL.materials.fauna);
    // HL.fauna.name = "fauna";
    // HL.scene.add(HL.fauna);
    console.timeEnd('meshes');


    var HLEload = new Event("HLEload");
    window.dispatchEvent(HLEload);
    console.timeEnd('HL environment');
  }

  return {
    init:init
  }
}();
