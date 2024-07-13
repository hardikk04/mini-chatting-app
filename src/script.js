// Importing the libraries
import "remixicon/fonts/remixicon.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import GUI from "lil-gui";
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { TextPlugin } from "gsap/TextPlugin";
import overlayVertexShader from "./shaders/overlay/vertex.glsl";
import overlayFragmentShader from "./shaders/overlay/fragment.glsl";

// Scroll Trigger
gsap.registerPlugin(ScrollTrigger, TextPlugin, ScrollToPlugin);

// Clutter Animation
const clutterAnimation = (element) => {
  const htmlTag = document.querySelector(element);
  let clutter = "";

  // Splitting the text content into individual letters and wrapping each in a span with a class
  htmlTag.textContent.split("").forEach((word) => {
    clutter += `<div class="inline-block">${word}</div>`;
  });

  // Updating the HTML content of the element with the animated spans
  htmlTag.innerHTML = clutter;
};

const clutterWordAnimation = (element) => {
  const htmlTag = document.querySelector(element);
  let clutter = "";

  // Splitting the text content into individual letters and wrapping each in a span with a class
  htmlTag.textContent.split(" ").forEach((word) => {
    clutter += `<span>${word + " "}</span>`;
  });

  // Updating the HTML content of the element with the animated spans
  htmlTag.innerHTML = clutter;
};

// Lenis js

const lenisJs = () => {
  const lenis = new Lenis();

  lenis.on("scroll", (e) => {});

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 500);
  });

  gsap.ticker.lagSmoothing(0);
};
lenisJs();

// Three tesla model animation
const threeTeslaModelAnimation = () => {
  /**
   * Canvas
   */
  const canvas = document.querySelector(".modelS");

  /**
   * Gui
   */
  // const gui = new GUI();
  const object = {};
  object.renderColor = "#000000";
  object.carColor = "#ae0a0a";
  object.floorColor = "#969696";

  /**
   * Scene
   */
  const scene = new THREE.Scene();

  /**
   * Loader
   */
  const textureLoader = new THREE.TextureLoader();
  const gltfLoader = new GLTFLoader();
  const rgbeLoader = new RGBELoader();

  /**
   * DRACO Loader
   */
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  gltfLoader.setDRACOLoader(dracoLoader);

  /**
   * Environment map
   */

  /**
   * HDR (RGBE) equirectangular
   */
  rgbeLoader.load("/environment/withoutLight.hdr", (environmentMap) => {
    environmentMap.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = environmentMap;
  });

  rgbeLoader.load("/environment/sky.hdr", (environmentMap) => {
    environmentMap.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = environmentMap;
  });

  scene.environmentIntensity = 1;
  scene.backgroundIntensity = 1;

  const carColorMaterial = new THREE.MeshStandardMaterial({ color: "black" });
  const carMirrorMaterial = new THREE.MeshStandardMaterial({ color: "black" });

  const carRimsMaterial = new THREE.MeshStandardMaterial({ color: "white" });

  const floor = new THREE.MeshStandardMaterial();

  const updateMaterial = () => {
    scene.traverse((child) => {
      if (child.isMesh && child.material.isMeshStandardMaterial) {
        child.material.roughness = 0;
        child.material.metalness = 1;

        if (child.material.name !== "Concrete_Tiles") {
          child.castShadow = true;
        }

        if (
          child.material.name === "car_main_paint" ||
          child.material.name === "calipers" ||
          child.material.name === "Burner_red" ||
          child.material.name === "Material.003"
        ) {
          child.material = carColorMaterial;
        }

        if (child.material.name === "Glass_mid_tint") {
          child.material = carMirrorMaterial;
        }

        if (
          child.material.name === "Rims" ||
          child.material.name === "Material.010"
        ) {
          child.material = carRimsMaterial;
        }

        if (child.material.name === "Brake_Disc") {
          child.material = carColorMaterial;
        }

        if (child.material.name === "Concrete_Tiles") {
          child.material.roughness = 1;
          child.receiveShadow = true;
        }
      }
    });
  };

  // gui.addColor(object, "carColor").onChange(() => {
  //   carColorMaterial.color.set(object.carColor);
  // });

  // Loading the garage
  let garage = null;
  gltfLoader.load("/models/garage/garage.glb", (gltf) => {
    garage = gltf.scene;
    scene.add(garage);
    updateMaterial();
  });

  // Loading the models

  // Array of model paths
  const modelPaths = [
    "/models/model3/model3.glb",
    "/models/roadster/roadster.glb",
    "/models/cybertruck/cybertruck.glb",
  ];

  let models = [];
  modelPaths.forEach((model, index) => {
    gltfLoader.load(model, (gltf) => {
      models[index] = gltf.scene;
      if (index === 0) {
        scene.add(models[index]);
      }

      models[index].position.x = 0.25;

      models[index].rotation.y = -0.56;
      updateMaterial();
      updateMaterial();
    });
  });

  /**
   * Model Overlay
   */
  const displacementTexture = textureLoader.load("/images/d2.avif");
  const video = document.querySelector(".overlay-video");
  console.log(video);
  const videoTexture = new THREE.VideoTexture(video);

  const overlay = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2, 1, 1),
    new THREE.ShaderMaterial({
      vertexColors: overlayVertexShader,
      fragmentShader: overlayFragmentShader,
      uniforms: {
        uDisplacementTexture: new THREE.Uniform(displacementTexture),
        uOverlayVideo: new THREE.Uniform(videoTexture),
        uOffset: new THREE.Uniform(1),
      },
      // side: THREE.DoubleSide,
      transparent: true,
    })
  );
  overlay.position.y = 2;
  scene.add(overlay);

  const animationSound = new Audio("/sounds/animation.mp3");

  const select = document.querySelector("select");
  select.addEventListener("input", (event) => {
    if (select.value === "MODELS") {
      const tl = gsap.timeline();
      animationSound.play();
      animationSound.playbackRate = 1.8;
      tl.to(camera.position, {
        x: 14,
        y: 0,
        z: 0,
        ease: "expo.in",
        duration: 2,
        onStart: () => {
          gsap.to(".model-transition", {
            opacity: 0,
            stagger: {
              amount: 0.2,
            },
          });
        },
        onComplete: () => {
          gsap.to(".threejs-models>h1", {
            text: "MODEL S",
            duration: 0.5,
          });
          gsap.to(".model-transition", {
            opacity: 1,
            stagger: {
              amount: -0.2,
            },
          });
          scene.add(models[0]);
          scene.remove(models[1]);
          scene.remove(models[2]);
        },
      });
      tl.to(camera.position, {
        x: 0,
        y: 0,
        z: 4,
        ease: "expo.out",
        duration: 2,
      });
    } else if (select.value === "ROADSTER") {
      const tl = gsap.timeline();
      animationSound.play();
      animationSound.playbackRate = 1.8;
      tl.to(camera.position, {
        x: 14,
        y: 0,
        z: 0,
        ease: "expo.in",
        duration: 2,
        onStart: () => {
          gsap.to(".model-transition", {
            opacity: 0,
            stagger: {
              amount: 0.2,
            },
          });
        },
        onComplete: () => {
          gsap.to(".threejs-models>h1", {
            text: "ROADSTER",
            duration: 0.5,
          });
          gsap.to(".model-transition", {
            opacity: 1,
            stagger: {
              amount: -0.2,
            },
          });
          scene.remove(models[0]);
          scene.add(models[1]);
          scene.remove(models[2]);
          updateMaterial();
        },
      });
      tl.to(camera.position, {
        x: 0,
        y: 0,
        z: 4,
        ease: "expo.out",
        duration: 2,
      });
    } else if (select.value === "CYBERTRUCK") {
      const tl = gsap.timeline();
      animationSound.play();
      animationSound.playbackRate = 1.8;
      tl.to(camera.position, {
        x: 14,
        y: 0,
        z: 0,
        ease: "expo.in",
        duration: 2,
        onStart: () => {
          gsap.to(".model-transition", {
            opacity: 0,
            stagger: {
              amount: 0.2,
            },
          });
        },
        onComplete: () => {
          gsap.to(".threejs-models>h1", {
            text: "CYBERTRUCK",
            duration: 0.5,
          });
          gsap.to(".model-transition", {
            opacity: 1,
            stagger: {
              amount: -0.2,
            },
          });
          scene.remove(models[0]);
          scene.remove(models[1]);
          scene.add(models[2]);
          updateMaterial();
        },
      });
      tl.to(camera.position, {
        x: 0,
        y: 0,
        z: 4,
        ease: "expo.out",
        duration: 2,
      });
    }
  });

  /**
   * Fog
   */
  const fog = new THREE.Fog("#040b10", 3, 8);
  scene.fog = fog;

  /**
   * Sizes
   */
  const sizes = {};
  sizes.widht = window.innerWidth;
  sizes.height = window.innerHeight;

  /**
   * Camera
   */

  const camera = new THREE.PerspectiveCamera(
    75,
    sizes.widht / sizes.height,
    1,
    100
  );
  camera.position.z = 3.8;

  scene.add(camera);

  /**
   * Resize
   */
  window.addEventListener("resize", () => {
    sizes.widht = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.widht / sizes.height;
    camera.position.z = 4.0;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.widht, sizes.height);
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  });

  // gui.add(camera.position, "x").min(-10).max(10).step(0.01).name("camera x");
  // gui.add(camera.position, "y").min(-10).max(10).step(0.01).name("camera y");
  // gui.add(camera.position, "z").min(-10).max(20).step(0.01).name("camera z");

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".threejs-models",
      scroller: "body",
      start: "top 0",
      end: "top -50%",
      // scrub: true,
      // markers: true,
      pin: true,
    },
  });

  tl.from(camera.position, {
    x: -10,
    duration: 2,
    ease: "expo.in",
    onStart: () => {
      controls.enabled = false;
    },
    onComplete: () => {
      controls.enabled = true;
    },
  });

  tl.from(".model-transition", {
    opacity: 0,
    stagger: {
      amount: 0.5,
    },
  });

  /**
   * Lights
   */

  // Directional Light
  const directionalLight = new THREE.DirectionalLight("#ffffff", 5);
  directionalLight.castShadow = true;
  // directionalLight.position.set(0, 0.1, -10);
  scene.add(directionalLight);
  object.LightColor = "#b4a26e";

  // gui.addColor(object, "LightColor").onChange(() => {
  //   scene.fog.color = new THREE.Color(object.LightColor);
  // });

  // gui
  //   .add(directionalLight.position, "x")
  //   .min(-30)
  //   .max(30)
  //   .step(0.001)
  //   .name("directionalLight X");
  // gui
  //   .add(directionalLight.position, "y")
  //   .min(-30)
  //   .max(30)
  //   .step(0.001)
  //   .name("directionalLight Y");
  // gui
  //   .add(directionalLight.position, "z")
  //   .min(-30)
  //   .max(30)
  //   .step(0.001)
  //   .name("directionalLight Z");

  // Shadow
  directionalLight.shadow.mapSize.set(1024, 1024);
  directionalLight.shadow.camera.near = 0;
  directionalLight.shadow.camera.far = 2;
  directionalLight.shadow.camera.top = 3;
  directionalLight.shadow.camera.right = 3;
  directionalLight.shadow.camera.bottom = -3;
  directionalLight.shadow.camera.left = -3;
  const directionalLightCameraHelper = new THREE.CameraHelper(
    directionalLight.shadow.camera
  );
  // scene.add(directionalLightCameraHelper);

  /**
   * Renderer
   */

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(sizes.widht, sizes.height);
  renderer.setClearColor(object.renderColor);
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // gui.addColor(object, "renderColor").onChange(() => {
  //   renderer.setClearColor(new THREE.Color(object.renderColor));
  //   scene.fog.color.setHex(new THREE.Color(object.renderColor));
  // });

  /**
   * Controls
   */
  const controls = new OrbitControls(camera, canvas);
  controls.enableZoom = false;

  controls.enableDamping = true;
  controls.maxPolarAngle = -Math.PI;
  controls.minPolarAngle = Math.PI / 2;
  controls.target.y = 0.85;

  /**
   * Clock
   */

  let time = Date.now();

  /**
   * Animation
   */
  let loop360AnimationRotationFlag = true;
  let speed = 0.25;
  const tick = () => {
    const currentTime = Date.now();
    const deltaTime = currentTime - time;
    time = currentTime;

    // Sky Environment rotation
    scene.environmentRotation.y -= Math.sin(deltaTime * 0.00005) * 2;

    if (loop360AnimationRotationFlag) {
      speed -= deltaTime * 0.000025;
    } else {
      speed += deltaTime * 0.000025;
    }

    if (models[0] && models[1] && models[2]) {
      models[0].rotation.y = speed;
      models[1].rotation.y = speed;
      models[2].rotation.y = speed;
      garage.rotation.y = speed;
    }

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };
  tick();

  /**
   * Mouse cursor change
   */
  canvas.addEventListener("mousedown", () => {
    canvas.style.cursor = "grabbing";
  });

  const screenHalfWidth = window.innerWidth / 2;
  let lastX = 0;
  canvas.addEventListener("mouseup", (event) => {
    canvas.style.cursor = "grab";
    if (lastX < event.clientX) {
      loop360AnimationRotationFlag = false;
    } else {
      loop360AnimationRotationFlag = true;
    }
    lastX = event.clientX;
  });

  canvas.addEventListener("mouseenter", () => {
    canvas.style.cursor = "grab";
  });

  const colorChangeAnimation = () => {
    const colorPickerElem = document.querySelectorAll(".color-picker-elem");
    const allColorPicker = document.querySelectorAll(
      ".color-picker-elem input"
    );

    colorPickerElem.forEach((elem, index) => {
      elem.addEventListener("click", () => {
        allColorPicker[index].click();

        allColorPicker[index].addEventListener("input", function () {
          const colorValue = allColorPicker[index].value;
          if (index === 0) {
            carColorMaterial.color = new THREE.Color(colorValue);
            gsap.to(colorPickerElem[index], {
              backgroundColor: colorValue,
            });
          } else {
            carRimsMaterial.color = new THREE.Color(colorValue);
            gsap.to(colorPickerElem[index], {
              backgroundColor: colorValue,
            });
          }
        });
      });
    });
  };
  colorChangeAnimation();
};
threeTeslaModelAnimation();
