import React, { useRef, useEffect, useState } from 'react'
import * as THREE from "three";
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

const sphere_vertex_shader = /* glsl */ `



`

export function THREE_App(props: {
	childrens?: React.ReactNode
}) {
	const	divRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
    const	renderer = new THREE.WebGLRenderer({alpha: true});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);


    const sphere_geometry = new THREE.IcosahedronGeometry(3, 100)
    const sphere_material = new THREE.ShaderMaterial({
      vertexShader: "",

    })
    const sphere_mesh = new THREE.Mesh(sphere_geometry)


		function mainloop() {
			requestAnimationFrame(mainloop);
		}

		mainloop();

    return (() => {
			divRef.current?.removeChild(renderer.domElement)
			renderer.dispose()
		});
	}, []);
	
	return (
		<div ref={divRef} id="Canvas">
      {props.childrens}
    </div>
	);
}
