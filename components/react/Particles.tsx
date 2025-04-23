"use client";

import React, { useEffect, useRef } from "react";
import { Renderer, Camera, Geometry, Program, Mesh } from "ogl";

interface ParticlesProps {
  particleCount?: number;
  particleSpread?: number;
  speed?: number;
  particleColors?: string[];
  moveParticlesOnHover?: boolean;
  particleHoverFactor?: number;
  alphaParticles?: boolean;
  particleBaseSize?: number;
  sizeRandomness?: number;
  cameraDistance?: number;
  disableRotation?: boolean;
  className?: string;
}

const defaultColors = ["#3b82f6", "#6366f1", "#8b5cf6"]; // Blue, Indigo, Purple

const hexToRgb = (hex: string): [number, number, number] => {
  hex = hex.replace(/^#/, "");
  const bigint = parseInt(hex, 16);
  return [
    ((bigint >> 16) & 255) / 255,
    ((bigint >> 8) & 255) / 255,
    (bigint & 255) / 255,
  ];
};

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;
  
  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;
  uniform vec2 uMouse;
  uniform float uHoverFactor;
  
  varying vec4 vRandom;
  varying vec3 vColor;
  
  void main() {
    vRandom = random;
    vColor = color;
    
    vec3 pos = position * uSpread;
    pos.z *= 10.0;
    
    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    float t = uTime;
    
    // Base animation
    mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
    mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
    mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);
    
    // Mouse interaction
    float mouseDist = distance(mPos.xy, uMouse * uSpread * 2.0);
    float mouseEffect = smoothstep(0.0, 1.0, 1.0 - mouseDist / (uSpread * 0.5));
    mPos.xy += normalize(mPos.xy - uMouse * uSpread * 2.0) * mouseEffect * uHoverFactor;
    
    vec4 mvPos = viewMatrix * mPos;
    gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / (1.0 + length(mvPos.xyz));
    gl_Position = projectionMatrix * mvPos;
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  
  uniform float uTime;
  uniform float uAlphaParticles;
  varying vec4 vRandom;
  varying vec3 vColor;
  
  void main() {
    vec2 uv = gl_PointCoord.xy;
    float d = length(uv - vec2(0.5));
    
    if (uAlphaParticles < 0.5) {
      if (d > 0.5) discard;
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
    } else {
      float circle = smoothstep(0.5, 0.4, d) * 0.8;
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
    }
  }
`;

const Particles = ({
  particleCount = 200,
  particleSpread = 10,
  speed = 0.2,
  particleColors = defaultColors,
  moveParticlesOnHover = true,
  particleHoverFactor = 2,
  alphaParticles = true,
  particleBaseSize = 80,
  sizeRandomness = 0.8,
  cameraDistance = 15,
  disableRotation = false,
  className = "",
}: ParticlesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const renderer = new Renderer({
      depth: false,
      alpha: true,
      antialias: true,
    });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 0);

    const camera = new Camera(gl, { fov: 15 });
    camera.position.z = cameraDistance;

    function handleResize() {
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.perspective({
        aspect: gl.canvas.width / gl.canvas.height,
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: -(((e.clientY - rect.top) / rect.height) * 2 - 1),
      };
    };

    if (moveParticlesOnHover) {
      container.addEventListener("mousemove", handleMouseMove);
    }

    // Create particles
    const count = particleCount;
    const position = new Float32Array(count * 3);
    const random = new Float32Array(count * 4);
    const color = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      position.set(
        [
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
        ],
        i * 3
      );
      random.set(
        [
          Math.random(),
          Math.random(),
          Math.random(),
          Math.random(),
        ],
        i * 4
      );
      const col = hexToRgb(
        particleColors[Math.floor(Math.random() * particleColors.length)]
      );
      color.set(col, i * 3);
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: position },
      random: { size: 4, data: random },
      color: { size: 3, data: color },
    });

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: particleSpread },
        uBaseSize: { value: particleBaseSize },
        uSizeRandomness: { value: sizeRandomness },
        uAlphaParticles: { value: alphaParticles ? 1 : 0 },
        uMouse: { value: [0, 0] },
        uHoverFactor: { value: particleHoverFactor },
      },
      transparent: true,
      depthTest: false,
    });

    const mesh = new Mesh(gl, { geometry, program, mode: gl.POINTS });

    let animationId: number;
    let lastTime = 0;

    const animate = (time: number) => {
      if (!lastTime) lastTime = time;
      const delta = time - lastTime;
      lastTime = time;

      program.uniforms.uTime.value += delta * 0.001 * speed;
      program.uniforms.uMouse.value = [mouseRef.current.x, mouseRef.current.y];

      if (!disableRotation) {
        mesh.rotation.x = Math.sin(program.uniforms.uTime.value * 0.5) * 0.1;
        mesh.rotation.y = Math.cos(program.uniforms.uTime.value * 0.3) * 0.15;
        mesh.rotation.z += 0.001 * speed;
      }

      renderer.render({ scene: mesh, camera });
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      if (moveParticlesOnHover) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
    };
  }, [
    particleCount,
    particleSpread,
    speed,
    particleColors,
    moveParticlesOnHover,
    particleHoverFactor,
    alphaParticles,
    particleBaseSize,
    sizeRandomness,
    cameraDistance,
    disableRotation,
  ]);

  return <div ref={containerRef} className={`absolute inset-0 ${className}`} />;
};

export default Particles;