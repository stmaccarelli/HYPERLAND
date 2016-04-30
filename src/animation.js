/*
This module is for animations: moving objects, changing colors, etc
*/

var HLAnim = function(){

  // would calculate all the rows geometries, so the world won't start with zero heights
  function init(){
  }

  function sea(){
    // move
    HL.sea.position.z += HLE.moveSpeed - HLE.seaFriction;

    // if moved farther than 1 row
    if (HL.sea.position.z > HLE.WORLD_WIDTH / HL.geometries.sea.parameters.heightSegments) {
      HLE.seaStepsCount++;
      // put 1 row back
      HL.sea.position.z  -= HLE.WORLD_WIDTH / HL.geometries.sea.parameters.heightSegments;
      // shift sea heights for rows
      for(var i=HL.geometries.sea.parameters.heightSegments; i > 0; i--){
        HL.geometries.seaHeights[i] = HL.geometries.seaHeights[i-1];
      }
      // calculate new height ot first row
      HL.geometries.seaHeights[0] = HLE.reactiveSeaHeight;
    }
     // compute row-shifting basic sea waves
     HLH.seaMotion(HL.geometries.sea, HLE.seaStepsCount, HL.geometries.seaHeights, HLE.BASE_SEA_SPEED);

     // if we want to use shadows, we have to recalculate normals
     if(hasShadows){
       HL.geometries.sea.computeFaceNormals();
       HL.geometries.sea.computeVertexNormals();
     }
  }

  // function land(){
  //   // move
  //   // HL.land.position.z = (HL.land.position.z + HLE.moveSpeed * HLE.landFriction) % HLE.WORLD_WIDTH / HL.geometries.land.parameters.heightSegments;
  //   HLE.landStepsCount += (HLE.moveSpeed * HLE.landFriction);// / HLE.WORLD_TILES;
  //   HL.materials.land.uniforms.advance.value = HLE.landStepsCount;
  //   // if plane moved more than a row
  //   if (HL.land.position.z > HLE.WORLD_WIDTH / HL.geometries.land.parameters.heightSegments) {
  //     HLE.landStepsCount++;
  //     // put plane back 1 row, so it will look moving seamless
  //   //  HL.land.position.z -= HLE.WORLD_WIDTH / HL.geometries.land.parameters.heightSegments;
  //     //
  //     // // HL.materials.land.uniforms.step.value = HLE.landStepsCount;
  //     // //then shift land heights on next rows
  //     // HLH.shiftHeights(HL.geometries.land);
  //     // // then calculate LAND first row new heights with noise function
  //     // for ( var i = 0; i < (HL.geometries.land.parameters.widthSegments + 1); i++){
  //     //   HL.geometries.land.vertices[i].y = HLH.landHeightNoise(
  //     //     i / (HL.geometries.land.parameters.widthSegments),
  //     //     (HLE.landStepsCount / HLE.WORLD_TILES) );
  //     // }
  //     // // if we want to use shadows, we have to recalculate normals
  //     // if(hasShadows){
  //     //   HL.geometries.land.computeFaceNormals();
  //     //   HL.geometries.land.computeVertexNormals();
  //     // }
  //     HL.materials.land.uniforms.step.value = (HLE.landStepsCount / HLE.WORLD_TILES);
  //
  //   }
  //
  // }


  var advanceMod,pAdvanceMod,pos;
  function land(geometry){
    advanceMod = (HLE.advance)%(HLE.WORLD_WIDTH/HLE.WORLD_TILES);
    HL.land.position.z = advanceMod;
    pos=[0,0,0];
    for(var i=0;i<geometry.attributes.position.array.length; i+=3){
      pos[0] = geometry.attributes.position.array[i];
      pos[2] = geometry.attributes.position.array[i+2] + advanceMod;
      pos[1] = HL.noise.nNoise(
        ((pos[0] / HLE.WORLD_WIDTH)+0.5)  * 13.3,
        Math.abs(((pos[2] - HLE.advance) / HLE.WORLD_WIDTH)+0.5) * 13.3,
        100.0 )
         * 200.0;
      geometry.attributes.position.array[i+1]=pos[1];

      // if(i<10)
      // console.log( (((pos[2] - HLE.advance) / HLE.WORLD_WIDTH)+0.5)  );
    }
    // count a step
   if(pAdvanceMod>advanceMod){
     HLE.landStepsCount++;
     geometry.attributes.position.needsUpdate = true;
   }
   pAdvanceMod = advanceMod;
  }



function landGLSL(){
  HL.materials.land.uniforms.advance.value = HLE.advance;
//  HL.materials.land.uniforms.noiseFreq.value = HLE.noiseFrequency;
  HL.materials.land.uniforms.noiseFreq2.value = HLE.noiseFrequency2;
  HL.materials.land.uniforms.landHeight.value = HLE.landHeight;
  HL.materials.land.uniforms.landZeroPoint.value = HLE.landZeroPoint;

}

  // FOR CLOUDS, FLORA AND FAUNA
  function elements(){
    HLH.loopParticles(HL.geometries.clouds, HLE.WORLD_WIDTH, HLE.moveSpeed+HLE.CLOUDS_SPEED);
    HLH.bufSinMotion(HL.geometries.clouds, .4, .6);

    HLH.moveParticles(HL.geometries.flora, HLE.WORLD_WIDTH, HLE.moveSpeed);
    if(HLE.shotFlora) HLH.shotFloraCluster(HL.geometries.flora, HLE.landStepsCount, 1);

    // HLH.bufSinMotion(HL.geometries.fauna,.1,.1);

  }

  var colorsDebounce = true;
  function colors(){
    if(HL.camera.position.y > 0 && colorsDebounce){
      HL.renderer.setClearColor(HLC.horizon);
      if(HLE.fog && !isWire) HL.scene.fog.color = HLC.horizon;
      HL.materials.skybox.color = HLC.horizon;
      HL.materials.seabox.color = HLC.underHorizon;
      HL.materials.land.color = HLC.land;
      HL.materials.sea.color = HLC.sea;
      colorsDebounce=false;
      console.log('colors above');
    }
    else if(HL.camera.position.y < 0 && !colorsDebounce){
      HL.renderer.setClearColor(HLC.underHorizon);
      if(HLE.fog && !isWire) HL.scene.fog.color = HLC.underHorizon;
      HL.materials.skybox.color = HLC.underHorizon;
      HL.materials.seabox.color = HLC.horizon;
      HL.materials.land.color = HLC.underLand;
      HL.materials.sea.color = HLC.underSea;
      colorsDebounce=true;
      console.log('colors below');

    }
  }

  return{
    sea:function(){return sea()},
    land:function(a){return land(a)},
    elements:function(){return elements()},
    colors: function(){return colors()},
    init:init,
    landGLSL:landGLSL,

  }
}();
