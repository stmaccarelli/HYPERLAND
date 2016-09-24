var HLS ={

    // just a local for requestAnimationFrame
    raf: null,
    sceneStart:0,
    sceneProgress:0,

    //local debouncers
    shotFlora:true,

    // varie
    tempColor:0,
}

  HLS.startScene = function(sceneId){
    if(HLS[sceneId]!==undefined){
      // stop previous animation
      //destroy all running models
      HLH.destroyAllModels();
      //reset camera
  //    HL.camera.lookAt(new THREE.Vector3(0,0,-HLE.WORLD_WIDTH/2));

      // reset sea position and alpha
      HL.materials.water.material.uniforms.alpha.value = 0.9;
      HL.sea.position.y = 0;

      //reset materials maps
      HL.materials.skybox.map = HL.textures.skybox;
      HL.materials.skybox.needsUpdate = true;

      // reset models maps
      for(var i in HL.models){
        HL.models[i].material.map = (HL.textures[i]!==undefined?HL.textures[i]:null);
        HL.models[i].material.needsUpdate = true;
      }

      window.cancelAnimationFrame(HLS.raf);
      //init new scene
      if(HLS[sceneId+'init']!==undefined)
      HLS.raf =  window.requestAnimationFrame(HLS[sceneId+'init']);
      // supported: timer useful for timed scene switch from one to another like:
      //  if(frameCount-HLS.sceneStart>=600) HLR.startScene('scene2');
      HLS.sceneStart = frameCount;
      //start new animation
    }
  }

  HLS.scene1init = function(){
    if(hud!==undefined) hud.display('AUDIOREACTIVE SCENE',3, true);
    // HL.materials.skybox.map = HL.textures.skybox;
    // HL.materials.skybox.needsUpdate = true;
    //
    // HL.materials.land.wireframe=false;
    // HL.materials.land.uniforms.color.value = HLC.land.setHSL((frameCount/3600)%1+.25, .2, .1+HLR.fft3);
    // HL.materials.land.needsUpdate = true;
    //
    // HL.materials.water.material.uniforms.alpha.value = 0.90;
    // HL.materials.water.needsUpdate = true;

    HLS.raf = window.requestAnimationFrame(HLS.scene1);
  }

  HLS.scene1 = function(){
    HLS.raf = window.requestAnimationFrame(HLS.scene1);
    HLS.cameraRotation();


    HLS.sceneProgress=(frameCount - HLS.sceneStart)*0.001;


    // HL.land.material.uniforms.color.value = HLC.land.setHSL(0,0, .1+HLR.fft3*.3);

    HLE.noiseSeed = HLR.fft3*300;

    HL.materials.land.uniforms.buildFreq.value += Math.max(0,(HLR.fft1-0.96)) * 0.25 ;

    var lumi = HLR.fft3;
    HLC.horizon.setRGB(
      HLC.tempHorizon.r + lumi,
      HLC.tempHorizon.g + lumi,
      HLC.tempHorizon.b + lumi
    );

  }


  HLS.scene2init = function(){
    if(hud!==undefined) hud.display('NON REACTIVE SCENE',3,true);
    // HL.materials.skybox.map = null;
    // HL.materials.skybox.needsUpdate = true;
    // HL.materials.land.wireframe=true;
    // HL.materials.land.uniforms.color.value = HLC.land.setHSL(Math.random(),1,.5);//,.5+Math.random(),.5+Math.random());
    // // HL.materials.water
    // // HL.models.whale.material.map = HL.dynamicTextures.stars.texture;
    // // HL.models.whale.material.needsUpdate = true;
    //
    // HL.materials.water.material.uniforms.color.value = HLC.land.set(0x222222);
    // HL.materials.water.needsUpdate = true;
    HLS.raf = window.requestAnimationFrame(HLS.scene2);

  }

  HLS.scene2 = function(){
    HLS.raf = window.requestAnimationFrame(HLS.scene2);
      HLS.cameraRotation();
  }

  HLS.scene3init = function(){
    // if(hud!==undefined) hud.display('CHAPTER THREE.FLYING LIKE AN EAGLE IN A RIVER',3, true);
    HL.materials.skybox.map = null;
    HL.materials.skybox.needsUpdate = true;

    HL.materials.land.uniforms.color.value = HLC.land.setRGB(.08,.05,.4);//,.5+Math.random(),.5+Math.random());
    HL.materials.land.wireframe=false;
    HL.materials.land.needsUpdate = true;

    HL.materials.water.material.uniforms.alpha.value = 1;

    HL.sea.position.y = HLE.WORLD_HEIGHT*2;

    HL.models.whale.material.map = HL.dynamicTextures.stars.texture;
    HL.models.whale.material.needsUpdate = true;

    HLS.raf = window.requestAnimationFrame(HLS.scene3);

  }

  HLS.story = 'HYPEROCEAN NIAGARA'.split(' ');

  HLS.scene3 = function(){
    HLS.raf = window.requestAnimationFrame(HLS.scene3);
    HLS.cameraRotation();

    HLH.loopParticles(HL.geometries.clouds, HLE.WORLD_WIDTH, HLE.moveSpeed*4);

    HL.materials.land.uniforms.color.value = HLC.land.setRGB(HLR.fft4*.1,HLR.fft4*.1,HLR.fft4*.1);//,.5+Math.random(),.5+Math.random());
    HLC.horizon.setRGB(0+ HLR.fft3,.3+ HLR.fft3,.6 + HLR.fft3);


    HL.dynamicTextures.stars.c.clearRect(0,0,HL.dynamicTextures.stars.width,HL.dynamicTextures.stars.height);
    HL.dynamicTextures.stars.c.font=(64+HLR.fft4*10)+"px Arial";
    HL.dynamicTextures.stars.c.fillStyle = 'white';
    HL.dynamicTextures.stars.c.fillText(HLS.story[Math.floor(frameCount/20%HLS.story.length)],10, 256);
    HL.dynamicTextures.stars.texture.needsUpdate=true;




  }

  HLS.cameraRotation = function(){
    HL.camera.rotateY(HL.noise.nNoise(HLR.fft3*0.0002, HLR.fft1*0.0015,100));
    //HL.camera.rotateX(HL.noise.nNoise(HLR.fft5*0.00013, HLR.fft2*0.0005,100));
  }

  HLS.shootEverything = function(){
    HLH.startModel(HL.models[HL.modelsKeys[Math.floor(Math.random()*HL.modelsKeys.length)]],
     THREE.Math.randInt(-HLE.WORLD_WIDTH/4,HLE.WORLD_WIDTH/4),
     THREE.Math.randInt(HLE.WORLD_HEIGHT*0.4,HLE.WORLD_HEIGHT*3),
     0, 'xyz');    // shoot all models from a group
  }

  HLS.shootGroup = function(g,s,r,floating){
    HLH.startModel(HL.models[HL.mGroups[g][Math.floor(Math.random()*HL.mGroups[g].length)]],
     THREE.Math.randInt(-HLE.WORLD_WIDTH/4,HLE.WORLD_WIDTH/4),
     floating?0:THREE.Math.randInt(HLE.WORLD_HEIGHT*0.001,HLE.WORLD_HEIGHT*2),
     s, (r?'xyz':null) );    // shoot all models from a group
  }

  //
  // weird:['ducky','tiger','aurora'],
  // space:['mercury','aurora','airbus'],
  // sea:['whale','whale2'],
  //
  //
  HLS.modelshooting = function(k){
    if(k.keyCode==81)//q
      HLS.shootGroup('sea',0,false);
    if(k.keyCode==87)//w
      HLS.shootGroup('weird',1,true,true);
    if(k.keyCode==69)//e
      HLS.shootGroup('space',50,true);
    if(k.keyCode==65)//a
      HLS.shootEverything();

    if(k.keyCode==49)//1
      {HLS.startScene('scene1');}
    if(k.keyCode==50)//2
      {HLS.startScene('scene2');}
    // if(k.keyCode==51)//3
    //   {HLS.startScene('scene3');}

    if(k.keyCode==67){//c
      HLE.CENTER_PATH=!HLE.CENTER_PATH;
      HLE.cameraHeight = 0;
      HL.land.material.uniforms.withCenterPath.value = HLE.CENTER_PATH;
    }

  }
  window.addEventListener('keydown',HLS.modelshooting);
