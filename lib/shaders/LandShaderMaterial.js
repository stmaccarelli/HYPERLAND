var LandMat = {
  //uniforms:{ "baseColor" : { type: "c", value: new THREE.Color(0xff0000)} }
	// uniforms: { "mirrorColor": { type: "c", value: new THREE.Color( 0x7F7F7F ) },
	// 			"mirrorSampler": { type: "t", value: null },
	// 			"textureMatrix" : { type: "m4", value: new THREE.Matrix4() }
	// },
  uniforms: {
    "step" : {type:"f", value: 0},
    "advance" : {type:"f", value: 0}
  },
	vertexShader: sNoise_chunk+[ "\n",
    "uniform float step;",
    "uniform float advance;",
    "varying float ccc;",
    "void main() {",

    "float advanceMod = mod(advance,1000.0/200.0);",
    "float posZ = position.z + advanceMod; ",
    "ccc = 1.0-distance( vec2(0,0), vec2(position.x,position.z+advanceMod) ) / 500.0;",
    "float posY = (snoise(vec3( (position.x / 1000.0) * 2.0 , (position.z - advance + advanceMod)/1000.0 * 2.0, 200.0 ) )/1.0)*1.0 * ",
    "200.0;",
//    "snoise(vec3( (position.x / 1000.0) * 26.0, (advance-posZ)/1000.0 * 26.0, 100.0) ) * 200.0;",

    "gl_Position = projectionMatrix * modelViewMatrix * ",
    "vec4( vec3(position.x, posY+10.0, posZ ) ,1.0) ;}"].join("\n"),
//snoise(vec3( (position.x / 1000.0) * 2.0 , (posZ / 1000.0 - step / 1000.0) * 6.0, 100.0))*100.0
  fragmentShader: ["\n",
    "varying float ccc;",
    "void main() {",
    "gl_FragColor = vec4(ccc, 0.0, 0.0, 0.0);",
		"}"].join("\n")
};

THREE.LandMaterial = function(){

this.material = new THREE.ShaderMaterial( {
//  wireframe:true,
  fragmentShader: LandMat.fragmentShader,
  vertexShader: LandMat.vertexShader,
  uniforms: THREE.UniformsUtils.clone( LandMat.uniforms ),
} );

// this.material.uniforms.textureMatrix.value = this.textureMatrix;

return this.material;
}
