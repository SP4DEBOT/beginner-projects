import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function OasisGarden({ footprintTons, commitments = [], renewablePercentage = 0, level = 1 }) {
  const mountRef = useRef(null);
  const [healthScore, setHealthScore] = useState(100);
  const [errorMsg, setErrorMsg] = useState(null);

  const maxFootprint = 18;
  const targetFootprint = 2.0;
  const computedHealth = Math.max(
    0,
    Math.min(
      100,
      Math.round(((maxFootprint - footprintTons) / (maxFootprint - targetFootprint)) * 100)
    )
  );

  useEffect(() => {
    setHealthScore(computedHealth);
  }, [computedHealth]);

  const treeCount = Math.min(6, commitments.length);
  const hasSolar = commitments.includes('solar_home') || renewablePercentage > 30;
  const hasRecycling = commitments.includes('recycle_all') || commitments.includes('zero_waste');
  const hasElectricCar = commitments.includes('ev_upgrade');
  const hasGreenEnergy = commitments.includes('green_energy');

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 600;
    const height = mountRef.current.clientHeight || 380;

    const scene = new THREE.Scene();

    const smogColor = new THREE.Color(healthScore < 45 ? 0xbac2d1 : 0xe0f2fe);
    const fogDensity = Math.max(0, (100 - healthScore) / 100 * 0.08);
    scene.fog = new THREE.FogExp2(smogColor, fogDensity);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 9, 13);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);
    } catch (e) {
      console.error(e);
      setErrorMsg("WebGL not supported.");
      return;
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 6;
    controls.maxDistance = 22;
    controls.target.set(0, 0.5, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.25);
    sunLight.position.set(6, 12, 4);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xf02fc2, 0.8);
    fillLight.position.set(-6, 4, -6);
    scene.add(fillLight);

    const sideLight = new THREE.DirectionalLight(0x00f2fe, 0.8);
    sideLight.position.set(6, -4, 6);
    scene.add(sideLight);

    const islandGroup = new THREE.Group();
    scene.add(islandGroup);

    const grassColor = healthScore < 35 ? 0x2e113a : healthScore < 68 ? 0x3d144c : 0x47165c;
    const grassGeo = new THREE.CylinderGeometry(4.2, 4.4, 0.7, 8);
    const grassMat = new THREE.MeshLambertMaterial({ color: grassColor, flatShading: true });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.receiveShadow = true;
    grass.castShadow = true;
    islandGroup.add(grass);

    const dirtGeo = new THREE.CylinderGeometry(4.4, 0.8, 3.2, 8);
    const dirtMat = new THREE.MeshLambertMaterial({ color: 0x12041d, flatShading: true });
    const dirt = new THREE.Mesh(dirtGeo, dirtMat);
    dirt.position.y = -1.95;
    islandGroup.add(dirt);

    const rockCount = level > 1 ? 7 : 4;
    for (let i = 0; i < rockCount; i++) {
      const rockGeo = new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.4, 0);
      const rockMat = new THREE.MeshLambertMaterial({ color: 0x0c0214, flatShading: true });
      const rock = new THREE.Mesh(rockGeo, rockMat);
      const angle = (i / rockCount) * Math.PI * 2;
      rock.position.set(Math.cos(angle) * (2.0 + Math.random() * 0.5), -3.2 - Math.random() * 0.5, Math.sin(angle) * (2.0 + Math.random() * 0.5));
      islandGroup.add(rock);
    }

    const riverGeo = new THREE.BoxGeometry(1.3, 0.75, 8.8);
    const waterColor = healthScore < 35 ? 0x3d2b45 : healthScore < 70 ? 0x00a2d4 : 0x00f2fe;
    const riverMat = new THREE.MeshLambertMaterial({
      color: waterColor,
      transparent: true,
      opacity: 0.95,
      flatShading: true
    });
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.position.set(-0.3, -0.01, 0);
    river.receiveShadow = true;
    islandGroup.add(river);

    const houseGroup = new THREE.Group();
    houseGroup.position.set(1.8, 0.35, 1.8);
    islandGroup.add(houseGroup);

    const baseGeo = new THREE.BoxGeometry(1.2, 0.9, 1.2);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x0c1020, flatShading: true });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.castShadow = true;
    base.receiveShadow = true;
    base.position.y = 0.45;
    houseGroup.add(base);

    const roofGeo = new THREE.ConeGeometry(1.05, 0.8, 4);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0xf02fc2, flatShading: true });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 1.3;
    roof.castShadow = true;
    houseGroup.add(roof);

    const doorGeo = new THREE.BoxGeometry(0.3, 0.55, 0.05);
    const doorMat = new THREE.MeshLambertMaterial({ color: 0x00f2fe });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 0.275, 0.601);
    houseGroup.add(door);

    const winGeo = new THREE.BoxGeometry(0.35, 0.35, 0.05);
    const winMat = new THREE.MeshLambertMaterial({ color: healthScore > 40 ? 0xf02fc2 : 0x000000 });
    const win = new THREE.Mesh(winGeo, winMat);
    win.position.set(-0.601, 0.5, 0);
    win.rotation.y = Math.PI / 2;
    houseGroup.add(win);

    if (hasSolar) {
      const solarGroup = new THREE.Group();
      solarGroup.position.set(0.3, 1.15, 0.3);
      solarGroup.rotation.set(0.4, Math.PI / 4, 0);
      
      const panelGeo = new THREE.BoxGeometry(0.7, 0.04, 0.45);
      const panelMat = new THREE.MeshStandardMaterial({ color: 0x00f2fe, roughness: 0.1, metalness: 0.8 });
      const panel = new THREE.Mesh(panelGeo, panelMat);
      panel.castShadow = true;
      solarGroup.add(panel);

      const gridHelper = new THREE.GridHelper(0.65, 3, 0xf02fc2, 0xf02fc2);
      gridHelper.rotation.x = Math.PI / 2;
      gridHelper.position.y = 0.021;
      solarGroup.add(gridHelper);

      houseGroup.add(solarGroup);
    }

    if (hasElectricCar) {
      const chargerGroup = new THREE.Group();
      chargerGroup.position.set(-0.8, 0, 0.6);

      const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6);
      const postMat = new THREE.MeshLambertMaterial({ color: 0x00f2fe });
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.y = 0.3;
      chargerGroup.add(post);

      const headGeo = new THREE.BoxGeometry(0.18, 0.25, 0.18);
      const headMat = new THREE.MeshLambertMaterial({ color: 0xf02fc2 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 0.65;
      chargerGroup.add(head);

      const chargerIndicatorGeo = new THREE.SphereGeometry(0.04, 8, 8);
      const chargerIndicatorMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
      const chargerIndicator = new THREE.Mesh(chargerIndicatorGeo, chargerIndicatorMat);
      chargerIndicator.position.set(0, 0.68, 0.1);
      chargerGroup.add(chargerIndicator);

      houseGroup.add(chargerGroup);
    }

    let turbineBlades;
    if (hasGreenEnergy) {
      const turbineGroup = new THREE.Group();
      turbineGroup.position.set(-2.2, 0.35, -2.2);
      islandGroup.add(turbineGroup);

      const towerGeo = new THREE.CylinderGeometry(0.06, 0.14, 3.8, 8);
      const towerMat = new THREE.MeshLambertMaterial({ color: 0x00f2fe, flatShading: true });
      const tower = new THREE.Mesh(towerGeo, towerMat);
      tower.position.y = 1.9;
      tower.castShadow = true;
      turbineGroup.add(tower);

      const hubGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.28, 8);
      const hubMat = new THREE.MeshLambertMaterial({ color: 0xf02fc2 });
      const hub = new THREE.Mesh(hubGeo, hubMat);
      hub.rotation.x = Math.PI / 2;
      hub.position.set(0, 3.8, 0.12);
      turbineGroup.add(hub);

      turbineBlades = new THREE.Group();
      turbineBlades.position.set(0, 3.8, 0.28);
      turbineGroup.add(turbineBlades);

      for (let j = 0; j < 3; j++) {
        const bladeGeo = new THREE.BoxGeometry(0.08, 1.4, 0.02);
        const bladeMat = new THREE.MeshLambertMaterial({ color: 0xf02fc2 });
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.geometry.translate(0, 0.65, 0);
        blade.rotation.z = (j * Math.PI * 2) / 3;
        turbineBlades.add(blade);
      }
    }

    const treePositions = [
      { x: -2.3, z: 1.6, scale: 0.9 },
      { x: 2.3, z: -1.7, scale: 0.8 },
      { x: -1.1, z: 2.5, scale: 0.75 },
      { x: 2.6, z: 0.4, scale: 0.95 },
      { x: -2.7, z: -0.6, scale: 0.85 },
      { x: 0.2, z: -2.5, scale: 0.7 }
    ];

    const trees = [];
    for (let k = 0; k < treeCount; k++) {
      const pos = treePositions[k];
      const treeGroup = new THREE.Group();
      treeGroup.position.set(pos.x, 0.35, pos.z);
      treeGroup.scale.set(0.01, 0.01, 0.01);
      islandGroup.add(treeGroup);

      const trunkGeo = new THREE.CylinderGeometry(0.07, 0.13, 0.8, 6);
      const trunkMat = new THREE.MeshLambertMaterial({ color: 0x12041d, flatShading: true });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.4;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      const leafColor = k % 2 === 0 ? 0xf02fc2 : 0x00f2fe;
      const leavesLowerGeo = new THREE.DodecahedronGeometry(0.62, 0);
      const leavesMat = new THREE.MeshLambertMaterial({ color: leafColor, flatShading: true });
      const leavesLower = new THREE.Mesh(leavesLowerGeo, leavesMat);
      leavesLower.position.y = 1.05;
      leavesLower.castShadow = true;
      treeGroup.add(leavesLower);

      const leavesUpperGeo = new THREE.DodecahedronGeometry(0.44, 0);
      const leavesUpper = new THREE.Mesh(leavesUpperGeo, leavesMat);
      leavesUpper.position.y = 1.5;
      leavesUpper.castShadow = true;
      treeGroup.add(leavesUpper);

      trees.push({ group: treeGroup, targetScale: pos.scale });
    }

    if (hasRecycling) {
      const flowerColors = [0xf02fc2, 0x00f2fe, 0x7f00ff, 0xffffff];
      const flowerCount = level > 1 ? 14 : 8;
      for (let f = 0; f < flowerCount; f++) {
        const flowerGroup = new THREE.Group();
        const angle = Math.random() * Math.PI * 2;
        const rad = 1.4 + Math.random() * 2.3;
        flowerGroup.position.set(Math.cos(angle) * rad, 0.35, Math.sin(angle) * rad);
        
        const stemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 4);
        const stemMat = new THREE.MeshLambertMaterial({ color: 0x00f2fe });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 0.125;
        flowerGroup.add(stem);

        const petalGeo = new THREE.DodecahedronGeometry(0.07, 0);
        const petalMat = new THREE.MeshLambertMaterial({ color: flowerColors[f % flowerColors.length], flatShading: true });
        const petal = new THREE.Mesh(petalGeo, petalMat);
        petal.position.y = 0.26;
        flowerGroup.add(petal);

        islandGroup.add(flowerGroup);
      }
    }

    const clouds = [];
    const cloudMat = new THREE.MeshLambertMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.8, flatShading: true });
    const cloudCount = level > 1 ? 3 : 2;
    
    for (let c = 0; c < cloudCount; c++) {
      const cloudGroup = new THREE.Group();
      const offsetZ = c === 0 ? -1.5 : c === 1 ? 1.5 : 0;
      const offsetX = c === 0 ? -3 : c === 1 ? 3 : -1;
      cloudGroup.position.set(offsetX, 4.5 + Math.random() * 0.8, offsetZ);
      scene.add(cloudGroup);

      const centerNode = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7, 0), cloudMat);
      cloudGroup.add(centerNode);

      const sideNode1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 0), cloudMat);
      sideNode1.position.set(-0.55, -0.1, 0);
      cloudGroup.add(sideNode1);

      const sideNode2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 0), cloudMat);
      sideNode2.position.set(0.5, -0.15, 0.1);
      cloudGroup.add(sideNode2);

      const sideNode3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4, 0), cloudMat);
      sideNode3.position.set(0, -0.1, 0.4);
      cloudGroup.add(sideNode3);

      clouds.push(cloudGroup);
    }

    let clock = new THREE.Clock();
    let reqId;

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      
      const time = clock.getElapsedTime();

      if (turbineBlades) {
        turbineBlades.rotation.z += 0.055 + (level * 0.01);
      }

      islandGroup.position.y = Math.sin(time * 0.7) * 0.12 - 0.2;
      islandGroup.rotation.y = time * (0.02 + level * 0.01);

      trees.forEach(t => {
        if (t.group.scale.x < t.targetScale) {
          const s = Math.min(t.targetScale, t.group.scale.x + 0.04);
          t.group.scale.set(s, s, s);
        }
      });

      clouds.forEach((cloud, idx) => {
        cloud.position.x += 0.0035 + (level * 0.0005);
        cloud.position.y += Math.sin(time * 0.5 + idx * Math.PI) * 0.001;
        if (cloud.position.x > 8) {
          cloud.position.x = -8;
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current || !renderer) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
      
      scene.traverse(node => {
        if (node.isMesh) {
          node.geometry.dispose();
          if (Array.isArray(node.material)) {
            node.material.forEach(m => m.dispose());
          } else {
            node.material.dispose();
          }
        }
      });
      controls.dispose();
    };

  }, [healthScore, treeCount, hasSolar, hasElectricCar, hasGreenEnergy, hasRecycling, level]);

  return (
    <div className="garden-panel glass-panel p-3">
      <div className="flex-space mb-4">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>3D Eco-Oasis</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Real-time interactive 3D simulation. Level up to see your island thrive!
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Oasis Health</div>
          <span 
            style={{ 
              fontSize: '1.35rem', 
              fontWeight: 800, 
              color: healthScore > 70 ? 'var(--text-primary)' : healthScore > 40 ? 'var(--accent-purple)' : 'var(--accent-red)' 
            }}
          >
            {healthScore}%
          </span>
        </div>
      </div>

      <div 
        className="garden-view" 
        style={{ 
          position: 'relative', 
          height: '380px', 
          overflow: 'hidden', 
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(180deg, #e0f2fe 0%, #bae6fd 100%)'
        }}
      >
        {errorMsg ? (
          <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>
            {errorMsg}
          </div>
        ) : (
          <div 
            ref={mountRef} 
            style={{ width: '100%', height: '100%', cursor: 'grab' }} 
          />
        )}

        {healthScore < 45 && (
          <div 
            style={{ 
              position: 'absolute', 
              bottom: '1rem', 
              left: '1rem', 
              background: 'rgba(255, 0, 127, 0.15)', 
              border: '1px solid var(--accent-red)', 
              padding: '0.4rem 0.8rem', 
              borderRadius: '6px', 
              fontSize: '0.75rem',
              color: 'var(--accent-red)',
              fontWeight: 600,
              pointerEvents: 'none',
              backdropFilter: 'blur(4px)'
            }}
          >
            ⚠️ High Smog Density
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: hasSolar ? 'var(--accent-mint)' : '#1b1b36' }} />
          Solar Power
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: hasGreenEnergy ? 'var(--accent-mint)' : '#1b1b36' }} />
          Wind Energy
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: hasRecycling ? 'var(--accent-mint)' : '#1b1b36' }} />
          Zero Waste
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: treeCount > 0 ? 'var(--accent-mint)' : '#1b1b36' }} />
          {treeCount}/6 Trees Planted
        </div>
      </div>
    </div>
  );
}
