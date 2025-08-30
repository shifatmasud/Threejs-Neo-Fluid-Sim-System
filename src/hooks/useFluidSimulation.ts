import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { AllParams } from '../types';
import { PRESSURE_ITERATIONS, REACTION_DIFFUSION_ITERATIONS } from '../constants';
import * as shaders from '../shaders';
import { QualitySettings } from '../components/FluidSimulation';

type PointerInfo = {
    id: number;
    x: number;
    y: number;
    dx: number;
    dy: number;
    button: number;
};

export const useFluidSimulation = (
    mountRef: React.RefObject<HTMLDivElement>,
    params: AllParams,
    quality: QualitySettings,
    backgroundColor: string,
    textColor: string
) => {
    const paramsRef = useRef(params);
    useEffect(() => {
        paramsRef.current = params;
    }, [params]);

    const sim = useRef({
        renderer: null as THREE.WebGLRenderer | null,
        scene: new THREE.Scene(),
        camera: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
        particleScene: new THREE.Scene(),
        mesh: new THREE.Mesh(new THREE.PlaneGeometry(2, 2)),
        startTime: 0,
        lastTime: 0,
        pointers: new Map<number, PointerInfo>(),
        fbo: {} as Record<string, any>,
        materials: {} as Record<string, THREE.Material>,
        simHeight: 0,
        config: { velocityDissipation: 0, densityDissipation: 0, temperatureDissipation: 0 },
    }).current;

    useEffect(() => {
        sim.config.velocityDissipation = params.waveDecay;
        sim.config.densityDissipation = params.densityDissipation;
        sim.config.temperatureDissipation = params.temperatureDissipation;
        if (sim.materials.compositing) {
            const compositingMaterial = sim.materials.compositing as THREE.ShaderMaterial;
            const finalPassMaterial = sim.materials.finalPass as THREE.ShaderMaterial;
            const reactionDiffusionMaterial = sim.materials.reactionDiffusion as THREE.ShaderMaterial;
            const reactionForceMaterial = sim.materials.reactionForce as THREE.ShaderMaterial;
            const vorticityMaterial = sim.materials.vorticity as THREE.ShaderMaterial;
            const surfaceTensionMaterial = sim.materials.surfaceTension as THREE.ShaderMaterial;
            const splatMaterial = sim.materials.splat as THREE.ShaderMaterial;
            const buoyancyMaterial = sim.materials.buoyancy as THREE.ShaderMaterial;
            const particleRenderMaterial = sim.materials.particleRender as THREE.ShaderMaterial;
            const particleUpdateMaterial = sim.materials.particleUpdate as THREE.ShaderMaterial;
            const flowMapMaterial = sim.materials.flowMap as THREE.ShaderMaterial;
            const ripplePropagateMaterial = sim.materials.ripplePropagate as THREE.ShaderMaterial;

            Object.keys(params).forEach(key => {
                const value = (params as any)[key];
                if (compositingMaterial.uniforms[key]) {
                    if (key === 'uSSR_Strength') {
                        compositingMaterial.uniforms[key].value = quality.enableSsr ? value : 0;
                    } else {
                        compositingMaterial.uniforms[key].value = value;
                    }
                }
                if (finalPassMaterial.uniforms[key]) {
                    finalPassMaterial.uniforms[key].value = value;
                }
                if (reactionDiffusionMaterial.uniforms[key]) {
                    reactionDiffusionMaterial.uniforms[key].value = value;
                }
                 if (reactionForceMaterial.uniforms[key]) {
                    reactionForceMaterial.uniforms[key].value = value;
                }
                 if (vorticityMaterial.uniforms[key]) {
                    vorticityMaterial.uniforms[key].value = value;
                }
                 if (surfaceTensionMaterial.uniforms[key]) {
                    surfaceTensionMaterial.uniforms[key].value = value;
                }
                if (buoyancyMaterial.uniforms[key]) {
                    buoyancyMaterial.uniforms[key].value = value;
                }
                if (splatMaterial.uniforms['uRadius'] && key === 'uWaveSize') {
                    splatMaterial.uniforms['uRadius'].value = value;
                }
                if (particleRenderMaterial && particleRenderMaterial.uniforms[key]) {
                     particleRenderMaterial.uniforms[key].value = value;
                }
                 if (particleUpdateMaterial && particleUpdateMaterial.uniforms[key]) {
                    particleUpdateMaterial.uniforms[key].value = value;
                }
                if (flowMapMaterial.uniforms[key]) {
                    flowMapMaterial.uniforms[key].value = value;
                }
                if (ripplePropagateMaterial.uniforms[key]) {
                    ripplePropagateMaterial.uniforms[key].value = value;
                }
            });
        }
    }, [params, sim, quality.enableSsr]);

    const createTextCanvas = (width: number, height: number, bgColor: string, txtColor: string): HTMLCanvasElement => {
        const textCanvas = document.createElement('canvas');
        textCanvas.width = width;
        textCanvas.height = height;
        const ctx = textCanvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = txtColor;
            const fontSize = Math.min(width, height) * 0.15;
            ctx.font = `900 ${fontSize}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('PLAY', width / 2, height / 2);
        }
        return textCanvas;
    };
    
    // Effect to update background/text color dynamically
    useEffect(() => {
        if (sim.renderer && sim.materials.scene) {
            const { width, height } = sim.renderer.getSize(new THREE.Vector2());
            const newTextCanvas = createTextCanvas(width, height, backgroundColor, textColor);
            const newSceneTexture = new THREE.CanvasTexture(newTextCanvas);
            const sceneMaterial = sim.materials.scene as THREE.MeshBasicMaterial;
            sceneMaterial.map?.dispose(); // Dispose of the old texture
            sceneMaterial.map = newSceneTexture;
        }
    }, [backgroundColor, textColor, sim.renderer, sim.materials.scene]);


    useEffect(() => {
        if (!mountRef.current) return;

        const createFBO = (width: number, height: number, format: THREE.PixelFormat = THREE.RGBAFormat) => {
            const fbo = new THREE.WebGLRenderTarget(width, height, {
                minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
                type: THREE.HalfFloatType, format: format,
            });
            const fbo2 = fbo.clone();
            return { read: fbo, write: fbo2, swap: function() { const temp = this.read; this.read = this.write; this.write = temp; } };
        };

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        mountRef.current.appendChild(renderer.domElement);
        sim.renderer = renderer;

        const { width, height } = renderer.getSize(new THREE.Vector2());
        const simWidth = quality.simResolution;
        const simHeight = Math.round(quality.simResolution / (width / height));
        sim.simHeight = simHeight;

        sim.fbo.velocity = createFBO(simWidth, simHeight);
        sim.fbo.density = createFBO(simWidth, simHeight);
        sim.fbo.temperature = createFBO(simWidth, simHeight);
        sim.fbo.pressure = createFBO(simWidth, simHeight);
        sim.fbo.flow = createFBO(simWidth, simHeight);
        sim.fbo.ripples = createFBO(simWidth, simHeight, THREE.RGFormat);
        if (quality.particleResolution > 0) {
            sim.fbo.particles = createFBO(quality.particleResolution, quality.particleResolution);
        }
        sim.fbo.divergence = new THREE.WebGLRenderTarget(simWidth, simHeight, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, type: THREE.HalfFloatType, format: THREE.RedFormat });
        sim.fbo.curl = new THREE.WebGLRenderTarget(simWidth, simHeight, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, type: THREE.HalfFloatType, format: THREE.RedFormat });
        sim.fbo.caustics = new THREE.WebGLRenderTarget(simWidth, simHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, type: THREE.HalfFloatType, format: THREE.RedFormat });
        sim.fbo.detailNormal = new THREE.WebGLRenderTarget(simWidth, simHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, type: THREE.HalfFloatType, format: THREE.RGBAFormat });
        sim.fbo.scene = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, type: THREE.HalfFloatType, format: THREE.RGBAFormat });
        sim.fbo.composited = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, type: THREE.HalfFloatType, format: THREE.RGBAFormat });
        sim.fbo.renderedFrame = createFBO(width, height);


        const simTexelSize = new THREE.Vector2(1 / simWidth, 1 / simHeight);
        const textCanvas = createTextCanvas(width, height, backgroundColor, textColor);
        const sceneTexture = new THREE.CanvasTexture(textCanvas);
        
        sim.materials = {
            clear: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.clearShader, uniforms: { uTexture: { value: null }, uValue: { value: 0.97 }, uClearColor: { value: new THREE.Vector3() }, uUseClearColor: { value: false } } }),
            copy: new THREE.MeshBasicMaterial({ map: null }),
            splat: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.splatShader, uniforms: { uTarget: { value: null }, uAspectRatio: { value: width/height }, uColor: { value: new THREE.Vector3() }, uCenter: { value: new THREE.Vector2() }, uRadius: { value: 0.05 } } }),
            erase: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.eraseShader, uniforms: { uTarget: { value: null }, uAspectRatio: { value: width/height }, uCenter: { value: new THREE.Vector2() }, uRadius: { value: 0.05 }, uStrength: { value: 0.1 } } }),
            radialPush: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.radialPushShader, uniforms: { uTarget: { value: null }, uAspectRatio: { value: width/height }, uCenter: { value: new THREE.Vector2() }, uRadius: { value: 0.05 }, uStrength: { value: 0.2 } } }),
            advection: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.advectionShader, uniforms: { uVelocity: { value: null }, uSource: { value: null }, uTexelSize: { value: simTexelSize }, uDt: { value: 0.0 }, uDissipation: { value: 1.0 } } }),
            divergence: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.divergenceShader, uniforms: { uVelocity: { value: null }, uTexelSize: { value: simTexelSize } } }),
            pressure: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.pressureShader, uniforms: { uPressure: { value: null }, uDivergence: { value: null }, uTexelSize: { value: simTexelSize } } }),
            gradientSubtract: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.gradientSubtractShader, uniforms: { uPressure: { value: null }, uVelocity: { value: null }, uTexelSize: { value: simTexelSize } } }),
            reactionDiffusion: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.reactionDiffusionShader, uniforms: { uChemicals: { value: null }, uTexelSize: { value: simTexelSize }, uFeedRate: { value: 0.0 }, uKillRate: { value: 0.0 } } }),
            curl: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.curlShader, uniforms: { uVelocity: { value: null }, uTexelSize: { value: simTexelSize } } }),
            vorticity: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.vorticityShader, uniforms: { uVelocity: { value: null }, uCurl: { value: null }, uVorticity: { value: 0.0 }, uDt: { value: 0.0 }, uTexelSize: { value: simTexelSize } } }),
            surfaceTension: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.surfaceTensionShader, uniforms: { uVelocity: { value: null }, uDensity: { value: null }, uSurfaceTension: { value: 0.0 }, uDt: { value: 0.0 }, uTexelSize: { value: simTexelSize } } }),
            reactionForce: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.reactionForceShader, uniforms: { uVelocity: { value: null }, uChemicals: { value: null }, uReactionForce: { value: 0.0 }, uTexelSize: { value: simTexelSize } } }),
            buoyancy: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.buoyancyShader, uniforms: { uVelocity: { value: null }, uTemperature: { value: null }, uBuoyancy: { value: 0.0 }, uAmbientTemperature: { value: 0.0 }, uDt: { value: 0.0 } } }),
            caustics: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.causticsShader, uniforms: { uDensityTexture: { value: null }, uTexelSize: { value: simTexelSize } } }),
            flowMap: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.flowMapShader, uniforms: { uVelocity: { value: null }, uFlowMap: { value: null }, uFlowSpeed: { value: 0.0 }, uDt: { value: 0.0 } } }),
            surfaceDetail: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.surfaceDetailShader, uniforms: { uDensityTexture: { value: null }, uFlowMapTexture: { value: null }, uTexelSize: { value: simTexelSize }, uTime: { value: 0.0 } } }),
            rippleSplat: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.rippleSplatShader, uniforms: { uTarget: { value: null }, uAspectRatio: { value: width/height }, uCenter: { value: new THREE.Vector2() }, uPrevCenter: { value: new THREE.Vector2() }, uRadius: { value: 0.05 }, uStrength: { value: 0.1 } } }),
            ripplePropagate: new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.ripplePropagateShader, uniforms: { uRippleTexture: { value: null }, uTexelSize: { value: simTexelSize }, uRippleSpeed: { value: 0.5 }, uRippleDamping: { value: 0.99 } } }),
            scene: new THREE.MeshBasicMaterial({ map: sceneTexture }),
            compositing: new THREE.ShaderMaterial({
                vertexShader: shaders.baseVertexShader, fragmentShader: shaders.compositingShader,
                uniforms: {
                    uSceneTexture: { value: null }, uVelocityTexture: { value: null }, uDensityTexture: { value: null }, uTemperatureTexture: { value: null }, uReflectionTexture: { value: null }, uDetailNormalTexture: { value: null }, uRippleTexture: { value: null }, uTexelSize: { value: simTexelSize },
                    uLight1Pos: { value: new THREE.Vector3(0.5, 0.5, 0.5) }, uLight1Color: { value: new THREE.Color(1.0, 1.0, 1.0) }, uLight2Pos: { value: new THREE.Vector3(-0.5, -0.5, 0.5) }, uLight2Color: { value: new THREE.Color(0.2, 0.5, 1.0) },
                    uDisplacementScale: { value: 0.0 }, uVelocityShiftScale: { value: 0.0 }, uDensityShiftScale: { value: 0.0 }, uWaterColor: { value: new THREE.Color(0.0, 0.0, 0.0) }, uVolumeFactor: { value: 0.0 }, uInkStrength: { value: 0.0 }, uShininess: { value: 0.0 }, uFresnelColor: { value: new THREE.Color(0.0, 0.0, 0.0) }, uFresnelIntensity: { value: 0.0 }, uGlowColor: { value: new THREE.Color(0.0, 0.0, 0.0) }, uGlowPower: { value: 0.0 }, uWaveSteepness: { value: 0.05 }, uWaveComplexity: { value: 0.0 }, uWaveDetail: { value: 0.0 }, uAmbientTemperature: { value: 0.0 }, uBorderThickness: { value: 0.0 }, uBorderColor: { value: new THREE.Color(0,0,0) }, uChiselStrength: { value: 0.0 }, uSSR_Strength: { value: 0.0 }, uSSR_Falloff: { value: 0.0 }, uSSR_Samples: { value: 0.0 }, uSurfaceDetailStrength: { value: 0.0 }, uRippleStrength: { value: 0.0 },
                }
            }),
            finalPass: new THREE.ShaderMaterial({
                vertexShader: shaders.baseVertexShader, fragmentShader: shaders.finalPassShader,
                uniforms: { uFluidResult: { value: null }, uSceneTexture: { value: null }, uDensityTexture: { value: null }, uCausticsTexture: { value: null }, uArtisticBlend: { value: 0.0 }, uCausticsIntensity: { value: 0.0 } }
            }),
        };

        if (quality.particleResolution > 0) {
            sim.materials.particleSplat = new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.particleSplatShader, uniforms: { uTarget: { value: null }, uCenter: { value: new THREE.Vector2() }, uRadius: { value: 0.05 }, uIntensity: { value: 0.0 } } });
            sim.materials.particleUpdate = new THREE.ShaderMaterial({ vertexShader: shaders.baseVertexShader, fragmentShader: shaders.particleUpdateShader, uniforms: { uParticles: { value: null }, uVelocity: { value: null }, uDt: { value: 0.0 }, uParticleAdvection: { value: 0.2 } } });
            sim.materials.particleRender = new THREE.ShaderMaterial({ vertexShader: shaders.particleRenderVS, fragmentShader: shaders.particleRenderFS, uniforms: { uParticles: { value: null }, uParticleColor: { value: new THREE.Color(1,1,1) }, uParticleSize: { value: 2.0 } }, transparent: true, blending: THREE.AdditiveBlending, depthTest: false });

            const particleCount = quality.particleResolution * quality.particleResolution;
            const particleGeometry = new THREE.BufferGeometry();
            const particleUvs = new Float32Array(particleCount * 2);
            for (let i = 0; i < quality.particleResolution; i++) {
                for (let j = 0; j < quality.particleResolution; j++) {
                    const index = (i * quality.particleResolution + j) * 2;
                    particleUvs[index] = j / (quality.particleResolution - 1);
                    particleUvs[index + 1] = i / (quality.particleResolution - 1);
                }
            }
            particleGeometry.setAttribute('a_uv', new THREE.BufferAttribute(particleUvs, 2));
            const particlePoints = new THREE.Points(particleGeometry, sim.materials.particleRender);
            sim.particleScene.add(particlePoints);
        }

        sim.scene.add(sim.mesh);
        
        const blit = (target: THREE.WebGLRenderTarget | null, material: THREE.Material) => {
            sim.mesh.material = material;
            sim.renderer!.setRenderTarget(target);
            sim.renderer!.render(sim.scene, sim.camera);
        };
        
        const clearMaterial = sim.materials.clear as THREE.ShaderMaterial;
        clearMaterial.uniforms.uUseClearColor.value = true;
        clearMaterial.uniforms.uClearColor.value.set(1.0, 0.0, 0.0);
        blit(sim.fbo.density.read, clearMaterial);
        blit(sim.fbo.density.write, clearMaterial);
        
        clearMaterial.uniforms.uClearColor.value.set(params.uAmbientTemperature, 0.0, 0.0);
        blit(sim.fbo.temperature.read, clearMaterial);
        blit(sim.fbo.temperature.write, clearMaterial);

        // Initialize ripples to zero
        clearMaterial.uniforms.uClearColor.value.set(0.0, 0.0, 0.0);
        blit(sim.fbo.ripples.read, clearMaterial);
        blit(sim.fbo.ripples.write, clearMaterial);
        
        if (quality.particleResolution > 0) {
            // Initialize particles as dead
            clearMaterial.uniforms.uClearColor.value.set(0.0, 0.0, 999, 999);
            blit(sim.fbo.particles.read, clearMaterial);
            blit(sim.fbo.particles.write, clearMaterial);
        }

        clearMaterial.uniforms.uUseClearColor.value = false;

        const update = () => {
            const now = Date.now();
            const dt = Math.min((now - sim.lastTime) / 1000, 0.0166);
            sim.lastTime = now;
            if (!sim.renderer) return;
            const elapsedTime = (now - sim.startTime) / 1000;
            
            sim.renderer.setViewport(0, 0, quality.simResolution, sim.simHeight);

            const advectionMaterial = sim.materials.advection as THREE.ShaderMaterial;
            advectionMaterial.uniforms.uDt.value = dt;
            advectionMaterial.uniforms.uVelocity.value = sim.fbo.velocity.read.texture;
            
            advectionMaterial.uniforms.uSource.value = sim.fbo.velocity.read.texture;
            advectionMaterial.uniforms.uDissipation.value = sim.config.velocityDissipation;
            blit(sim.fbo.velocity.write, advectionMaterial);
            sim.fbo.velocity.swap();
            
            advectionMaterial.uniforms.uSource.value = sim.fbo.density.read.texture;
            advectionMaterial.uniforms.uDissipation.value = sim.config.densityDissipation;
            blit(sim.fbo.density.write, advectionMaterial);
            sim.fbo.density.swap();

            advectionMaterial.uniforms.uSource.value = sim.fbo.temperature.read.texture;
            advectionMaterial.uniforms.uDissipation.value = sim.config.temperatureDissipation;
            blit(sim.fbo.temperature.write, advectionMaterial);
            sim.fbo.temperature.swap();

            const buoyancyMaterial = sim.materials.buoyancy as THREE.ShaderMaterial;
            buoyancyMaterial.uniforms.uVelocity.value = sim.fbo.velocity.read.texture;
            buoyancyMaterial.uniforms.uTemperature.value = sim.fbo.temperature.read.texture;
            buoyancyMaterial.uniforms.uDt.value = dt;
            blit(sim.fbo.velocity.write, buoyancyMaterial);
            sim.fbo.velocity.swap();

            for (const p of sim.pointers.values()) {
                const { button, dx, dy } = p;

                if (button === 2) { // Right-click (erase)
                    const eraseMaterial = sim.materials.erase as THREE.ShaderMaterial;
                    eraseMaterial.uniforms.uTarget.value = sim.fbo.density.read.texture;
                    eraseMaterial.uniforms.uCenter.value.set(p.x, p.y);
                    eraseMaterial.uniforms.uRadius.value = paramsRef.current.uWaveSize * 0.8;
                    eraseMaterial.uniforms.uStrength.value = 0.1;
                    blit(sim.fbo.density.write, eraseMaterial);
                    sim.fbo.density.swap();

                    const radialPushMaterial = sim.materials.radialPush as THREE.ShaderMaterial;
                    radialPushMaterial.uniforms.uTarget.value = sim.fbo.velocity.read.texture;
                    radialPushMaterial.uniforms.uCenter.value.set(p.x, p.y);
                    radialPushMaterial.uniforms.uRadius.value = paramsRef.current.uWaveSize * 1.2;
                    radialPushMaterial.uniforms.uStrength.value = 0.2;
                    blit(sim.fbo.velocity.write, radialPushMaterial);
                    sim.fbo.velocity.swap();

                } else if (Math.abs(dx) > 0 || Math.abs(dy) > 0 || button === 0) { // Hover or left-click (add)
                    const splatMaterial = sim.materials.splat as THREE.ShaderMaterial;
                    splatMaterial.uniforms.uCenter.value.set(p.x, p.y);
            
                    splatMaterial.uniforms.uTarget.value = sim.fbo.velocity.read.texture;
                    const forceMultiplier = button === 0 ? 2.0 : 1.0;
                    splatMaterial.uniforms.uColor.value.set(dx * 100 * forceMultiplier, dy * 100 * forceMultiplier, 0);
                    blit(sim.fbo.velocity.write, splatMaterial);
                    sim.fbo.velocity.swap();
                    
                    const speed = Math.sqrt(dx * dx + dy * dy);
                    const moveIntensity = Math.pow(Math.min(speed * 30.0, 1.0), 2.0) * forceMultiplier;
                    const clickIntensity = (button === 0) ? 0.15 : 0.0;
                    const intensity = moveIntensity + clickIntensity;

                    splatMaterial.uniforms.uTarget.value = sim.fbo.density.read.texture;
                    splatMaterial.uniforms.uColor.value.set(0, intensity * 0.5, 0);
                    blit(sim.fbo.density.write, splatMaterial);
                    sim.fbo.density.swap();
            
                    splatMaterial.uniforms.uTarget.value = sim.fbo.temperature.read.texture;
                    const splatTemp = paramsRef.current.uSplatTemperature;
                    splatMaterial.uniforms.uColor.value.set(splatTemp * intensity, 0, 0);
                    blit(sim.fbo.temperature.write, splatMaterial);
                    sim.fbo.temperature.swap();

                    if (paramsRef.current.uRippleStrength > 0) {
                        const rippleSplatMaterial = sim.materials.rippleSplat as THREE.ShaderMaterial;
                        rippleSplatMaterial.uniforms.uTarget.value = sim.fbo.ripples.read.texture;
                        rippleSplatMaterial.uniforms.uCenter.value.set(p.x, p.y);
                        
                        const prevX = (p.dx === 0 && p.dy === 0) ? p.x : p.x - p.dx;
                        const prevY = (p.dx === 0 && p.dy === 0) ? p.y : p.y - p.dy;
                        rippleSplatMaterial.uniforms.uPrevCenter.value.set(prevX, prevY);
                        
                        rippleSplatMaterial.uniforms.uRadius.value = paramsRef.current.uWaveSize;
                        
                        const hoverStrength = Math.min(speed * 8.0, 0.4); // Make wakes more prominent
                        const clickStrength = button === 0 ? 1.0 : 0; // Make clicks much stronger
                        rippleSplatMaterial.uniforms.uStrength.value = hoverStrength + clickStrength;
                        
                        blit(sim.fbo.ripples.write, rippleSplatMaterial);
                        sim.fbo.ripples.swap();
                    }

                    if (quality.particleResolution > 0) {
                        const particleRate = paramsRef.current.uParticleRate;
                        if (particleRate > 0) {
                            const particleSplatMaterial = sim.materials.particleSplat as THREE.ShaderMaterial;
                            const particleIntensity = (speed * particleRate) + (button === 0 ? particleRate * 0.5 : 0.0);
                            particleSplatMaterial.uniforms.uTarget.value = sim.fbo.particles.read.texture;
                            particleSplatMaterial.uniforms.uCenter.value.set(p.x, p.y);
                            particleSplatMaterial.uniforms.uRadius.value = paramsRef.current.uWaveSize;
                            particleSplatMaterial.uniforms.uIntensity.value = particleIntensity;
                            blit(sim.fbo.particles.write, particleSplatMaterial);
                            sim.fbo.particles.swap();
                        }
                    }
                }
                p.dx = 0;
                p.dy = 0;
            };
            
            if (quality.particleResolution > 0) {
                sim.renderer.setViewport(0, 0, quality.particleResolution, quality.particleResolution);
                const particleUpdateMaterial = sim.materials.particleUpdate as THREE.ShaderMaterial;
                particleUpdateMaterial.uniforms.uParticles.value = sim.fbo.particles.read.texture;
                particleUpdateMaterial.uniforms.uVelocity.value = sim.fbo.velocity.read.texture;
                particleUpdateMaterial.uniforms.uDt.value = dt;
                blit(sim.fbo.particles.write, particleUpdateMaterial);
                sim.fbo.particles.swap();
                sim.renderer.setViewport(0, 0, quality.simResolution, sim.simHeight);
            }


            const reactionDiffusionMaterial = sim.materials.reactionDiffusion as THREE.ShaderMaterial;
            reactionDiffusionMaterial.uniforms.uChemicals.value = sim.fbo.density.read.texture;
            for(let i = 0; i < REACTION_DIFFUSION_ITERATIONS; i++) {
                blit(sim.fbo.density.write, reactionDiffusionMaterial);
                sim.fbo.density.swap();
                reactionDiffusionMaterial.uniforms.uChemicals.value = sim.fbo.density.read.texture;
            }

            const reactionForceMaterial = sim.materials.reactionForce as THREE.ShaderMaterial;
            reactionForceMaterial.uniforms.uVelocity.value = sim.fbo.velocity.read.texture;
            reactionForceMaterial.uniforms.uChemicals.value = sim.fbo.density.read.texture;
            blit(sim.fbo.velocity.write, reactionForceMaterial);
            sim.fbo.velocity.swap();

            (sim.materials.curl as THREE.ShaderMaterial).uniforms.uVelocity.value = sim.fbo.velocity.read.texture;
            blit(sim.fbo.curl, sim.materials.curl);

            const vorticityMaterial = sim.materials.vorticity as THREE.ShaderMaterial;
            vorticityMaterial.uniforms.uVelocity.value = sim.fbo.velocity.read.texture;
            vorticityMaterial.uniforms.uCurl.value = sim.fbo.curl.texture;
            vorticityMaterial.uniforms.uDt.value = dt;
            blit(sim.fbo.velocity.write, vorticityMaterial);
            sim.fbo.velocity.swap();

            const surfaceTensionMaterial = sim.materials.surfaceTension as THREE.ShaderMaterial;
            surfaceTensionMaterial.uniforms.uVelocity.value = sim.fbo.velocity.read.texture;
            surfaceTensionMaterial.uniforms.uDensity.value = sim.fbo.density.read.texture;
            surfaceTensionMaterial.uniforms.uDt.value = dt;
            blit(sim.fbo.velocity.write, surfaceTensionMaterial);
            sim.fbo.velocity.swap();

            (sim.materials.divergence as THREE.ShaderMaterial).uniforms.uVelocity.value = sim.fbo.velocity.read.texture;
            blit(sim.fbo.divergence, sim.materials.divergence);
            
            const clearMaterial = sim.materials.clear as THREE.ShaderMaterial;
            clearMaterial.uniforms.uTexture.value = sim.fbo.pressure.read.texture;
            clearMaterial.uniforms.uValue.value = 0.0;
            blit(sim.fbo.pressure.write, clearMaterial);
            sim.fbo.pressure.swap();

            const pressureMaterial = sim.materials.pressure as THREE.ShaderMaterial;
            pressureMaterial.uniforms.uDivergence.value = sim.fbo.divergence.texture;
            for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
                pressureMaterial.uniforms.uPressure.value = sim.fbo.pressure.read.texture;
                blit(sim.fbo.pressure.write, pressureMaterial);
                sim.fbo.pressure.swap();
            }

            const gradientSubtractMaterial = sim.materials.gradientSubtract as THREE.ShaderMaterial;
            gradientSubtractMaterial.uniforms.uPressure.value = sim.fbo.pressure.read.texture;
            gradientSubtractMaterial.uniforms.uVelocity.value = sim.fbo.velocity.read.texture;
            blit(sim.fbo.velocity.write, gradientSubtractMaterial);
            sim.fbo.velocity.swap();

            // --- New Rendering Passes ---
            const ripplePropagateMaterial = sim.materials.ripplePropagate as THREE.ShaderMaterial;
            ripplePropagateMaterial.uniforms.uRippleTexture.value = sim.fbo.ripples.read.texture;
            blit(sim.fbo.ripples.write, ripplePropagateMaterial);
            sim.fbo.ripples.swap();

            const flowMapMaterial = sim.materials.flowMap as THREE.ShaderMaterial;
            flowMapMaterial.uniforms.uVelocity.value = sim.fbo.velocity.read.texture;
            flowMapMaterial.uniforms.uFlowMap.value = sim.fbo.flow.read.texture;
            flowMapMaterial.uniforms.uDt.value = dt;
            blit(sim.fbo.flow.write, flowMapMaterial);
            sim.fbo.flow.swap();

            const surfaceDetailMaterial = sim.materials.surfaceDetail as THREE.ShaderMaterial;
            surfaceDetailMaterial.uniforms.uTime.value = elapsedTime;
            surfaceDetailMaterial.uniforms.uDensityTexture.value = sim.fbo.density.read.texture;
            surfaceDetailMaterial.uniforms.uFlowMapTexture.value = sim.fbo.flow.read.texture;
            blit(sim.fbo.detailNormal, surfaceDetailMaterial);

            const causticsMaterial = sim.materials.caustics as THREE.ShaderMaterial;
            causticsMaterial.uniforms.uDensityTexture.value = sim.fbo.density.read.texture;
            blit(sim.fbo.caustics, causticsMaterial);
            
            // --- Main Rendering ---
            const { width, height } = sim.renderer.getSize(new THREE.Vector2());
            sim.renderer.setViewport(0, 0, width, height);
            blit(sim.fbo.scene, sim.materials.scene);
            
            const compositingMaterial = sim.materials.compositing as THREE.ShaderMaterial;
            compositingMaterial.uniforms.uSceneTexture.value = sim.fbo.scene.texture;
            compositingMaterial.uniforms.uVelocityTexture.value = sim.fbo.velocity.read.texture;
            compositingMaterial.uniforms.uDensityTexture.value = sim.fbo.density.read.texture;
            compositingMaterial.uniforms.uTemperatureTexture.value = sim.fbo.temperature.read.texture;
            compositingMaterial.uniforms.uReflectionTexture.value = sim.fbo.renderedFrame.read.texture;
            compositingMaterial.uniforms.uDetailNormalTexture.value = sim.fbo.detailNormal.texture;
            compositingMaterial.uniforms.uRippleTexture.value = sim.fbo.ripples.read.texture;
            blit(sim.fbo.composited, compositingMaterial);

            const finalPassMaterial = sim.materials.finalPass as THREE.ShaderMaterial;
            finalPassMaterial.uniforms.uFluidResult.value = sim.fbo.composited.texture;
            finalPassMaterial.uniforms.uSceneTexture.value = sim.fbo.scene.texture;
            finalPassMaterial.uniforms.uDensityTexture.value = sim.fbo.density.read.texture;
            finalPassMaterial.uniforms.uCausticsTexture.value = sim.fbo.caustics.texture;
            blit(sim.fbo.renderedFrame.write, finalPassMaterial);
            
            const copyMaterial = sim.materials.copy as THREE.MeshBasicMaterial;
            copyMaterial.map = sim.fbo.renderedFrame.write.texture;
            blit(null, copyMaterial);
            
            if (quality.particleResolution > 0) {
                (sim.materials.particleRender as THREE.ShaderMaterial).uniforms.uParticles.value = sim.fbo.particles.read.texture;
                renderer.autoClearColor = false;
                renderer.render(sim.particleScene, sim.camera);
                renderer.autoClearColor = true;
            }

            sim.fbo.renderedFrame.swap();
        };

        sim.startTime = sim.lastTime = Date.now();
        sim.pointers = new Map();

        const getPointerPos = (e: PointerEvent) => {
            const rect = (sim.renderer!.domElement as HTMLElement).getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = 1.0 - (e.clientY - rect.top) / rect.height;
            return { x, y };
        };

        const handlePointerDown = (e: PointerEvent) => {
            const { x, y } = getPointerPos(e);
            const pointer = sim.pointers.get(e.pointerId) || {
                id: e.pointerId,
                x: x, y: y, dx: 0, dy: 0,
                button: e.button,
            };
            pointer.button = e.button;
            pointer.x = x;
            pointer.y = y;
            sim.pointers.set(e.pointerId, pointer);
        };

        const handlePointerUp = (e: PointerEvent) => {
            sim.pointers.delete(e.pointerId);
        };
        
        const handlePointerMove = (e: PointerEvent) => {
            if (e.buttons === 0 && !e.isPrimary) return;

            const { x, y } = getPointerPos(e);
            let pointer = sim.pointers.get(e.pointerId);

            if (!pointer) {
                handlePointerDown(e);
                pointer = sim.pointers.get(e.pointerId);
            }
            
            if (pointer) {
                pointer.dx = x - pointer.x;
                pointer.dy = y - pointer.y;
                pointer.x = x;
                pointer.y = y;
                if(e.buttons === 0) {
                    pointer.button = -1;
                }
            }
        };
        
        window.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerUp);
        window.addEventListener('pointerleave', handlePointerUp);
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('contextmenu', e => e.preventDefault());

        let animationFrameId: number;
        const animate = () => {
            update();
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        const handleResize = () => {
            if (!mountRef.current || !sim.renderer) return;
            const { clientWidth, clientHeight } = mountRef.current;
            renderer.setSize(clientWidth, clientHeight);
            (sim.materials.splat as THREE.ShaderMaterial).uniforms.uAspectRatio.value = clientWidth / clientHeight;
            (sim.materials.erase as THREE.ShaderMaterial).uniforms.uAspectRatio.value = clientWidth / clientHeight;
            (sim.materials.radialPush as THREE.ShaderMaterial).uniforms.uAspectRatio.value = clientWidth / clientHeight;
            (sim.materials.rippleSplat as THREE.ShaderMaterial).uniforms.uAspectRatio.value = clientWidth / clientHeight;
            sim.fbo.scene.setSize(clientWidth, clientHeight);
            sim.fbo.composited.setSize(clientWidth, clientHeight);
            sim.fbo.renderedFrame.read.setSize(clientWidth, clientHeight);
            sim.fbo.renderedFrame.write.setSize(clientWidth, clientHeight);
            const newTextCanvas = createTextCanvas(clientWidth, clientHeight, backgroundColor, textColor);
            const newSceneTexture = new THREE.CanvasTexture(newTextCanvas);
            const sceneMaterial = sim.materials.scene as THREE.MeshBasicMaterial;
            sceneMaterial.map?.dispose();
            sceneMaterial.map = newSceneTexture;
        };
        window.addEventListener('resize', handleResize);
        
        // Initial param setup
        const firstParams = params;
         Object.keys(firstParams).forEach(key => {
            const value = (firstParams as any)[key];
             if ((sim.materials.compositing as THREE.ShaderMaterial).uniforms[key]) {
                 (sim.materials.compositing as THREE.ShaderMaterial).uniforms[key].value = value;
             }
             if ((sim.materials.finalPass as THREE.ShaderMaterial).uniforms[key]) {
                (sim.materials.finalPass as THREE.ShaderMaterial).uniforms[key].value = value;
             }
             if ((sim.materials.reactionDiffusion as THREE.ShaderMaterial).uniforms[key]) {
                (sim.materials.reactionDiffusion as THREE.ShaderMaterial).uniforms[key].value = value;
             }
             if ((sim.materials.reactionForce as THREE.ShaderMaterial).uniforms[key]) {
                (sim.materials.reactionForce as THREE.ShaderMaterial).uniforms[key].value = value;
             }
             if ((sim.materials.vorticity as THREE.ShaderMaterial).uniforms[key]) {
                (sim.materials.vorticity as THREE.ShaderMaterial).uniforms[key].value = value;
             }
             if ((sim.materials.surfaceTension as THREE.ShaderMaterial).uniforms[key]) {
                (sim.materials.surfaceTension as THREE.ShaderMaterial).uniforms[key].value = value;
             }
             if ((sim.materials.buoyancy as THREE.ShaderMaterial).uniforms[key]) {
                (sim.materials.buoyancy as THREE.ShaderMaterial).uniforms[key].value = value;
             }
             if((sim.materials.splat as THREE.ShaderMaterial).uniforms['uRadius'] && key === 'uWaveSize') {
                 (sim.materials.splat as THREE.ShaderMaterial).uniforms['uRadius'].value = value;
             }
             if (sim.materials.particleRender && (sim.materials.particleRender as THREE.ShaderMaterial).uniforms[key]) {
                (sim.materials.particleRender as THREE.ShaderMaterial).uniforms[key].value = value;
            }
             if (sim.materials.particleUpdate && (sim.materials.particleUpdate as THREE.ShaderMaterial).uniforms[key]) {
                (sim.materials.particleUpdate as THREE.ShaderMaterial).uniforms[key].value = value;
            }
         });


        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointercancel', handlePointerUp);
            window.removeEventListener('pointerleave', handlePointerUp);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('contextmenu', e => e.preventDefault());
            Object.values(sim.materials).forEach(material => { if (material) material.dispose(); });
            Object.values(sim.fbo).forEach(fbo => {
                if (fbo.read) fbo.read.dispose();
                if (fbo.write) fbo.write.dispose();
                if (fbo.dispose && typeof fbo.dispose === 'function') fbo.dispose();
            });
            (sim.materials.scene as THREE.MeshBasicMaterial).map?.dispose();
            renderer.dispose();
            if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};