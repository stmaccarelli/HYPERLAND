var LandMat = {
  //uniforms:{ "baseColor" : { type: "c", value: new THREE.Color(0xff0000)} }
	// uniforms: { "mirrorColor": { type: "c", value: new THREE.Color( 0x7F7F7F ) },
	// 			"mirrorSampler": { type: "t", value: null },
	// 			"textureMatrix" : { type: "m4", value: new THREE.Matrix4() }
	// },
  uniforms: {
    "step" : {type:"f", value: 0}
  },
	vertexShader: sNoise_chunk+[ "\n",
    "uniform float step;",
    "varying float ccc;",
    " void main() {",
    "ccc = position.x / 500.0;",
    "gl_Position = projectionMatrix * modelViewMatrix * ",
    "vec4( vec3(position.x, snoise(vec3( (position.x / 1000.0) * 2.0 , (position.z / 1000.0 - step) *6.0, 100.0))*100.0, position.z) ,1.0) ;}"].join("\n"),

  fragmentShader: ["\n",
    "varying float ccc;",
    "void main() {",
    "gl_FragColor = vec4(ccc, 0.0, 0.0, 0.0);",
		"}"].join("\n")
};

THREE.LandMaterial = function(step){

this.material = new THREE.ShaderMaterial( {
  fragmentShader: LandMat.fragmentShader,
  vertexShader: LandMat.vertexShader,
  uniforms: THREE.UniformsUtils.clone( LandMat.uniforms ),
} );

 this.material.uniforms.step.value = step;
 console.log(this.material);
// this.material.uniforms.mirrorColor.value = mirrorColor;
// this.material.uniforms.textureMatrix.value = this.textureMatrix;

return this.material;
}
