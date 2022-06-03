import "./style.css";
import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import * as GUI from "babylonjs-gui";
import { ComputeShader } from "babylonjs";

var camera, light;
var palaceModel = [{}],
  button = [];
var modelLoaded = false;
var box, walkingAnime, boxCollide, boxCollideHand, parentMesh, sphere;

// Canvas
const canvas = document.querySelector("canvas.webgl");

//Create a babylon engine
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

cameraSetup();
lightSetup();
loadPalace();
loadKing();

engine.runRenderLoop(() => {
  scene.render();
});

function changeTextureOnCollision() {
  //Walls
  for (let i = 0; i < 4; i++)
    if (boxCollideHand.intersectsMesh(palaceModel[1]._children[i], false)) {
      console.log("base intersects");
      palaceModel[1]._children[i].material = orignalTexture("Gold");
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
    palaceModel[1]._children[5]._children[0].material = orignalTexture("Gold");
    palaceModel[1]._children[5]._children[1].material = orignalTexture("Gold");
    palaceModel[1]._children[5]._children[2].material = orignalTexture("Gold");
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
      palaceModel[1]._children[i]._children[0].material =
        orignalTexture("Gold");
      palaceModel[1]._children[i]._children[1].material =
        orignalTexture("Gold");
    }
  }

  //Rest of the objects - Pillars and curtains
  for (let i = 9; i < 19; i++)
    if (boxCollideHand.intersectsMesh(palaceModel[1]._children[i], false)) {
      palaceModel[1]._children[i].material = orignalTexture("Gold");
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

  return pbrTemp;
}

function cameraSetup() {
  // This creates and positions a free camera (non-mesh)
  camera = new BABYLON.FollowCamera(
    "FollowCam",
    new BABYLON.Vector3(0, 3, 0),
    scene
  );

  // The goal distance of camera from target
  camera.radius = 8;

  // The goal height of camera above local origin (centre) of target
  camera.heightOffset = 5;

  // The goal rotation of camera around local origin (centre) of target in x y plane
  camera.rotationOffset = 0;

  // Acceleration of camera in moving from current to goal position
  //camera.cameraAcceleration = 0.005;

  // The speed at which acceleration is halted
  camera.maxCameraSpeed = 3;

  // This attaches the camera to the canvas
  camera.attachControl(canvas, true);

  camera.inputs.removeByType("FreeCameraKeyboardMoveInput");
}

function lightSetup() {
  light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0));

  light.intensity = 1;
}

function loadPalace() {
  BABYLON.SceneLoader.ImportMeshAsync("", "./", "RoomOpNew.glb", scene).then(
    (result) => {
      for (var i of result.meshes) {
        palaceModel.push(i);
      }
      console.log(palaceModel[1]._children);
      modelLoaded = true;

      for (let i = 0; i < 4; i++)
        palaceModel[1]._children[i].checkCollisions = true;

      for (let i = 7; i < 9; i++) {
        palaceModel[1]._children[i]._children[0].checkCollisions = true;
        palaceModel[1]._children[i]._children[1].checkCollisions = true;
      }

      for (let i = 9; i < 18; i++)
        palaceModel[1]._children[i].checkCollisions = true;
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

      //scene.collisionsEnabled = true;

      // targetMesh created here.
      camera.lockedTarget = box;
      parentMesh = new BABYLON.Mesh("parent", scene);
      parentMesh.addChild(box);
      //parentMesh.addChild(boxCollide);
      parentMesh.addChild(boxCollideHand);
      parentMesh.collisionsEnabled = true;
    }
  );

  const input = {
    forward: false,
    left: false,
    right: false,
  };

  scene.onKeyboardObservable.add((kbInfo) => {
    switch (kbInfo.type) {
      case BABYLON.KeyboardEventTypes.KEYDOWN:
        switch (kbInfo.event.key) {
          case "w":
            input.forward = true;
            walkingAnime.play();
            break;

          case "a":
            input.left = true;
            walkingAnime.play();
            break;

          case "d":
            input.right = true;
            walkingAnime.play();
            break;
        }
        break;
      case BABYLON.KeyboardEventTypes.KEYUP:
        switch (kbInfo.event.key) {
          case "w":
            input.forward = false;
            walkingAnime.stop();
            break;

          case "a":
            input.left = false;
            walkingAnime.stop();
            break;

          case "d":
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
  scene.registerBeforeRender((e) => {
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
    if (box && palaceModel[1]) {
      parentMesh.rotation.y += rotation.y;
      //box.locallyTranslate(translation);
      BABYLON.Vector3.TransformNormalToRef(
        translation,
        parentMesh.getWorldMatrix(),
        translation
      );
      parentMesh.position.addInPlace(translation);
      changeTextureOnCollision();
    }
  });
}
