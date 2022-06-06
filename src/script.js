import "./style.css";
import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import * as GUI from "babylonjs-gui";
import { ComputeShader, Vector3 } from "babylonjs";

var camera, light;
var palaceModel = [{}],
  button = [];
var modelLoaded = false;
var box, walkingAnime, boxCollide, boxCollideHand, parentMesh, sphere;
let line;
let tapSound, introSound;

// Canvas
const canvas = document.querySelector("canvas.webgl");

//Create a babylon engine
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

let collisionMeshes = ['back', 'front', 'left', 'right', 'pilars1', 'pilars2', 'pilars3', 'pilars4',
  'certain1', 'certain2', 'certain3', 'certain4', 'certain5', 'certain6', 'door_primitive0', 'door_primitive1', 'door_primitive2',
  'Floor', 'carpet_primitive0', 'carpet_primitive1'];
  //  'small_chair_primitive0', 'small_chair_primitive1', 'king_chair_primitive0', 'king_chair_primitive1'];


cameraSetup();
lightSetup();
setupAudio();
loadPalace();
loadKing();

// scene.debugLayer.show();

engine.runRenderLoop(() => {
  scene.render();
});

function unlockAudio() {
    BABYLON.Engine.audioEngine.unlock();
}

function changeTextureOnCollision() {

  let playAudio = false;  
  let goldMaterial = orignalTexture("Gold");
  //Walls
  for (let i = 0; i < 4; i++)
    if (boxCollideHand.intersectsMesh(palaceModel[1]._children[i], false)) {
      console.log("base intersects");
      if(palaceModel[1]._children[i].material.name !== "goldMaterial") {
        palaceModel[1]._children[i].material = goldMaterial;
        playAudio = true;
      }
        
    }

  //Skip - floor and carpet

  //Group objects 5 - Door
  if (
    boxCollideHand.intersectsMesh(
      palaceModel[1]._children[5]._children[0],
      false
    ) ||
    boxCollideHand.intersectsMesh(
      palaceModel[1]._children[5]._children[1],
      false
    ) ||
    boxCollideHand.intersectsMesh(
      palaceModel[1]._children[5]._children[2],
      false
    )
  ) {
    if(palaceModel[1]._children[5]._children[0].material.name !== "goldMaterial") {
        palaceModel[1]._children[5]._children[0].material = goldMaterial;
        palaceModel[1]._children[5]._children[1].material = goldMaterial;
        palaceModel[1]._children[5]._children[2].material = goldMaterial;
        playAudio = true;
    }  
  }

  //Chairs and carpet
  for (let i = 7; i < 9; i++) {
    if (
      boxCollideHand.intersectsMesh(
        palaceModel[1]._children[i]._children[0],
        false
      ) ||
      boxCollideHand.intersectsMesh(
        palaceModel[1]._children[i]._children[1],
        false
      )
    ) {
        if(palaceModel[1]._children[i]._children[0].material.name !== "goldMaterial") {
            palaceModel[1]._children[i]._children[0].material = goldMaterial;
            palaceModel[1]._children[i]._children[1].material = goldMaterial;
            playAudio = true;
        }
    }
  }

  //Rest of the objects - Pillars and curtains
  for (let i = 9; i < 19; i++)
    if (boxCollideHand.intersectsMesh(palaceModel[1]._children[i], false)) {
        if(palaceModel[1]._children[i].material.name !== "goldMaterial") {
            palaceModel[1]._children[i].material = goldMaterial;
            playAudio = true;
        }
    }

    if(playAudio) {
        tapSound.play();
        playAudio = false;
    }
    
}

function orignalTexture(folderName) {
  var roughnessTexture =
    "texture/" + folderName + "/" + folderName + "_Roughness.png";

  var normalTexture =
    "texture/" + folderName + "/" + folderName + "_Normal.png";

  var albedoTexture =
    "texture/" + folderName + "/" + folderName + "_Albedo.png";

  var pbrTemp = new BABYLON.PBRMetallicRoughnessMaterial("pbr", scene);
  pbrTemp.metallicRoughnessTexture = new BABYLON.Texture(
    roughnessTexture,
    scene
  );

  pbrTemp._albedoTexture = new BABYLON.Texture(albedoTexture, scene);

  pbrTemp.normalTexture = new BABYLON.Texture(normalTexture, scene);

  pbrTemp.name = "goldMaterial";

  return pbrTemp;
}

function cameraSetup() {
  // This creates and positions a free camera (non-mesh)
  camera = new BABYLON.FollowCamera(
    "FollowCam",
    new BABYLON.Vector3(0, 3, 0),
    scene
  );

  // camera.rotation.y = Math.PI;

  // The goal distance of camera from target
  camera.radius = 5;

  // The goal height of camera above local origin (centre) of target
  camera.heightOffset = 4;

  // The goal rotation of camera around local origin (centre) of target in x y plane
  camera.rotationOffset = 180;

  // Acceleration of camera in moving from current to goal position
  //camera.cameraAcceleration = 0.005;

  // The speed at which acceleration is halted
  camera.maxCameraSpeed = 5;

  // This attaches the camera to the canvas
  camera.attachControl(canvas, true);

  console.log("camera inputs", camera.inputs);

  camera.inputs.attached.keyboard.detachControl();

  // camera.inputs.removeByType("FreeCameraKeyboardMoveInput");
}

function lightSetup() {
  light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0));

  light.intensity = 1;
}

function setupAudio() {
    tapSound = new BABYLON.Sound("tapSound", "audio/tapSound.mp3", scene, null, {
        loop: false,
        autoplay: false
    });
    introSound = new BABYLON.Sound("intro", "audio/intro.mp3", scene, null, {
        loop: false,
        autoplay: false
    });
    unlockAudio();

}

function loadPalace() {

  BABYLON.SceneLoader.ImportMeshAsync("", "./", "RoomOpNew.glb", scene).then(
    (result) => {

      console.log("result", result);


      for (var i of result.meshes) {
        console.log("i", i, i.name);
        palaceModel.push(i);
      }

      modelLoaded = true;

      scene.meshes.forEach((child) => {
        console.log("collisionMeshes", collisionMeshes, child.name);
        if(collisionMeshes.includes(child.name)) {
          console.log("child.name", child.name);
          child.checkCollisions = true;
        }
      });

      // for (let i = 0; i < 4; i++) {
      //   palaceModel[1]._children[i].checkCollisions = true;
      //   console.log("name", i, palaceModel[1]._children[i].name);
      // }

      // palaceModel[1]._children[5].checkCollisions = true;

      // for (let i = 7; i < 9; i++) {
      //   palaceModel[1]._children[i]._children[0].checkCollisions = true;
      //   palaceModel[1]._children[i]._children[1].checkCollisions = true;
      //   console.log("name", i, palaceModel[1]._children[i]._children[0].name, palaceModel[1]._children[i]._children[1].name);
      // }

      // for (let i = 9; i < 18; i++) {
      //   palaceModel[1]._children[i].checkCollisions = true;
      //   console.log("name", i, palaceModel[1]._children[i].name);
      // }

      // let front = scene.getMeshByName('front');
      // front.checkCollisions = true;

      // let back = scene.getMeshByName('back');
      // back.checkCollisions = true;

      // let left = scene.getMeshByName('left');
      // left.checkCollisions = true;

      // let right = scene.getMeshByName('right');
      // right.checkCollisions = true;

      // let pillars1 = scene.getMeshByName('pilars1');
      // pillars1.checkCollisions = true;

      // let pillars2 = scene.getMeshByName('pilars2');
      // pillars2.checkCollisions = true;

      // let pillars3 = scene.getMeshByName('pilars3');
      // pillars3.checkCollisions = true;

      // let pillars4 = scene.getMeshByName('pilars4');
      // pillars4.checkCollisions = true;

      // let chairNode = scene.getTransformNodeByName('small_chair');
      // chairNode.getChildMeshes().forEach((child) => {
      //   child.checkCollisions = true;
      // });

    }
  );
}

function loadKing() {
  BABYLON.SceneLoader.ImportMeshAsync("", "./", "king_new.glb", scene).then(
    (result) => {
      //console.log(result.meshes);
      //console.log(result.meshes[0]);
      box = result.meshes[0];
      box.scaling.scaleInPlace(1.5);

      walkingAnime = scene.getAnimationGroupByName(
        "ArmatureLayer0_Armature.001"
      );
      console.log(walkingAnime);
      walkingAnime.stop();
      box.rotationQuaternion = undefined;
      box.rotation.y = Math.PI;

      //console.log(box._children[0]._children[0]);
      //box._children[0]._children[2].setEnabled(true);
      //box._children[0]._children[2].showBoundingBox = true;

      // boxCollide = new BABYLON.CreateBox(
      //   "boxCollide",
      //   { width: 0.3, height: 0.5, depth: 0.5 },
      //   scene
      // );
      var material = new BABYLON.StandardMaterial("material", scene);
      // boxCollide.material = material;
      // boxCollide.material.wireframe = true;

      boxCollideHand = new BABYLON.CreateBox(
        "boxCollideHand",
        { size: 0.3 },
        scene
      );
      boxCollideHand.material = material;
      material.alpha = 0;
      boxCollideHand.material.wireframe = true;
      boxCollideHand.position = new BABYLON.Vector3(0.25, 2, 1);
      //boxCollide1.showBoundingBox = true;

      scene.collisionsEnabled = true;

      // targetMesh created here.
      camera.lockedTarget = box;
      parentMesh = new BABYLON.Mesh("parent", scene);
      parentMesh.addChild(box);
      //parentMesh.addChild(boxCollide);
      parentMesh.addChild(boxCollideHand);

      introSound.play();

      let offsetY = 1.25;
      parentMesh.ellipsoid = new BABYLON.Vector3(0.5, 0.05, 0.75);
      const a = parentMesh.ellipsoid.x;
      const b = parentMesh.ellipsoid.y;
      const points = [];
      for(let theta = -Math.PI/2; theta < Math.PI/2; theta += Math.PI/36) {
          points.push(new BABYLON.Vector3(0, b * Math.sin(theta) + offsetY, a * Math.cos(theta)));
      }

      // const ellipse = [];
      // ellipse[0] = BABYLON.MeshBuilder.CreateLines("e", {points:points}, scene);
      // ellipse[0].color = BABYLON.Color3.Red();
      // ellipse[0].parent = parentMesh;
      // const steps = 12;
      // const dTheta = 2 * Math.PI / steps; 
      // for(let i = 1; i < steps; i++) {
      //         ellipse[i] = ellipse[0].clone("el" + i);
      //         ellipse[i].parent = parentMesh;
      //         ellipse[i].rotation.y = i * dTheta;
      // }

      parentMesh.collisionsEnabled = true;
    }
  );

  const input = {
    forward: false,
    left: false,
    right: false,
  };

  const forward = new BABYLON.Vector3(0, 0, 1);
  let angle = 0;
  let matrix = BABYLON.Matrix.Identity();


  scene.onKeyboardObservable.add((kbInfo) => {
    switch (kbInfo.type) {
      case BABYLON.KeyboardEventTypes.KEYDOWN:
        switch (kbInfo.event.key) {
          case "ArrowUp":
            input.forward = true;
            walkingAnime.play();
            break;

          case "ArrowDown":
            input.backward = true;
            walkingAnime.play();
            break;
  
          case "ArrowLeft":
            input.left = true;
            walkingAnime.play();
            break;

          case "ArrowRight":
            input.right = true;
            walkingAnime.play();
            break;
        }
        break;
      case BABYLON.KeyboardEventTypes.KEYUP:
        switch (kbInfo.event.key) {
          case "ArrowUp":
            input.forward = false;
            walkingAnime.stop();
            break;

          case "ArrowDown":
            input.backward = false;
            walkingAnime.stop();
            break;

          case "ArrowLeft":
            input.left = false;
            walkingAnime.stop();
            break;

          case "ArrowRight":
            input.right = false;
            walkingAnime.stop();
            break;
        }
        break;
    }
  });

  let delta = 0;
  const linearSpeed = 2;
  const angularSpeed = 1;
  const translation = new BABYLON.Vector3(0, 0, 0);
  const rotation = new BABYLON.Vector3(0, 0, 0);


  console.log("parentMesh", parentMesh);

  scene.registerBeforeRender((e) => {

    if(parentMesh) {

      let matrix = parentMesh.getWorldMatrix();

      delta = e.deltaTime ? e.deltaTime / 1000 : 0;
      translation.set(0, 0, 0);
      rotation.set(0, 0, 0);
      if (input.forward) {
        translation.z = linearSpeed * delta;
      }
      if (input.backward) {
        translation.z = -linearSpeed * delta;
      }
      if (input.left) {
        rotation.y = -angularSpeed * delta;
      }
      if (input.right) {
        rotation.y = angularSpeed * delta;
      }
  
    }

    if (box && palaceModel[1]) {
      parentMesh.rotation.y += rotation.y;
      //box.locallyTranslate(translation);
      BABYLON.Vector3.TransformNormalToRef(
        translation,
        parentMesh.getWorldMatrix(),
        translation
      );

      parentMesh.moveWithCollisions(translation);
      // parentMesh.position.addInPlace(translation);
      changeTextureOnCollision();
    }
  });
}
