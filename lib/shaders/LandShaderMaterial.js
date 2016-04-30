var LandMat = {
  //uniforms:{ "baseColor" : { type: "c", value: new THREE.Color(0xff0000)} }
	// uniforms: { "mirrorColor": { type: "c", value: new THREE.Color( 0x7F7F7F ) },
	// 			"mirrorSampler": { type: "t", value: null },
	// 			"textureMatrix" : { type: "m4", value: new THREE.Matrix4() }
	// },
  uniforms: {
    "advance" : {type:"f", value: 0},
    "worldWidth" : {type:"f", value: 0},
    "worldTiles" : {type:"f", value: 0},
    "noiseFreq"  : {type:"f", value: 2.0},
    "noiseFreq2"  : {type:"f", value: 2.0},
    "landHeight"  : {type:"f", value: 1.0},
    "landZeroPoint"  : {type:"f", value: 1.0},

  },
	vertexShader: noise3d+[ "\n",
    "uniform float worldWidth;",
    "uniform float worldTiles;",
    "uniform float advance;",
    "uniform float noiseFreq;",
    "uniform float noiseFreq2;",
    "uniform float landHeight;",
    "uniform float landZeroPoint;",

    "varying float ccc;",
    "void main() {",

    "float advanceMod = mod(advance,worldWidth/worldTiles);",
    "float posZ = position.z + advanceMod; ",
    "ccc = 1.0-distance( vec2(0,0), vec2(position.x,position.z+advanceMod) ) / 500.0;",
    "float posY = floor(snoise(vec3( (position.x / worldWidth) * 2.0 , (posZ - advance)/worldWidth * 2.0, 100.0 ) )/0.07)*0.07",
    "* landHeight + landZeroPoint",
    "+ snoise(vec3( (position.x / worldWidth) * 20.0 , (posZ - advance)/worldWidth * 20.0, 100.0 ) )",
    "* landHeight * 0.5;",
    "gl_Position = projectionMatrix * modelViewMatrix * ",
    "vec4( vec3(position.x, posY+10.0, posZ ) ,1.0) ;}"].join("\n"),
  fragmentShader: ["\n",
    "varying float ccc;",
    "void main() {",
    "gl_FragColor = vec4(ccc, 0.0, 0.0, ccc);",
		"}"].join("\n")
};

THREE.LandMaterial = function(_worldWidth,_worldTiles){

this.material = new THREE.ShaderMaterial( {
//  wireframe:true,
  fragmentShader: LandMat.fragmentShader,
  vertexShader: LandMat.vertexShader,
  uniforms: THREE.UniformsUtils.clone( LandMat.uniforms ),
} );

this.material.uniforms.worldWidth.value = _worldWidth;
this.material.uniforms.worldTiles.value = _worldTiles;

return this.material;
}
