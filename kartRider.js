import { Application } from './engine/Application.js';

import { Renderer } from './Renderer.js';
import { Physics } from './Physics.js';
import { Camera } from './Camera.js';
import { Model } from './Model.js'
import { SceneLoader } from './SceneLoader.js';
import { SceneBuilder } from './SceneBuilder.js';
import { mat4 } from './lib/gl-matrix-module.js';

class App extends Application {

    async start() {
        const gl = this.gl;

        this.renderer = new Renderer(gl);
        this.aspect = 1;
        


        this.pathGhost = [[-30, 1, -5],[-30, 1, -30],[1, 1, -30],[1, 1, -5]];
        this.pathGhostRotation = [[0, Math.PI/2, 0],[0, Math.PI, 0],[0, -Math.PI/2, 0],[0, 0, 0]]
        await this.load('scene.json');
        this.casZacetka = Date.now()
        this.casElement = document.getElementById("cas");
        this.canvas.addEventListener('click', e => this.canvas.requestPointerLock());
        document.addEventListener('pointerlockchange', e => {
            if (document.pointerLockElement === this.canvas) {

                this.camera.enable();
            } else {
                this.camera.disable();
            }
        });

        this.time = performance.now();
        this.startTime = this.time;
    }

    async load(uri) {
        const scene = await new SceneLoader().loadScene(uri);
        const builder = new SceneBuilder(scene);
        this.scene = builder.build();
        this.physics = new Physics(this.scene);

        // Find first camera.
        this.camera = null;
        this.scene.traverse(node => {
            if (node instanceof Camera) {
                this.camera = node;
            }
        });

        this.camera.aspect = this.aspect;
        this.camera.updateProjection();
        this.renderer.prepare(this.scene);
    }

    update() {
        const t = this.time = performance.now();

        const d = new Date(Date.now() - this.casZacetka);
        this.casElement.innerHTML = d.toString()[19] + d.toString()[20] + d.toString()[21] + d.toString()[22] + d.toString()[23]
        this.casElement.innerHTML = this.casElement.innerHTML + ":" + d.getMilliseconds()

        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;

        //// Duhec pot in rotatcija
        this.duhec = this.scene.nodes[this.scene.nodes.length-2];

        let rotacija = Math.round(this.duhec.rotation[1] * (180/Math.PI))
        let ciljnaRotacija = Math.round(this.pathGhostRotation[this.duhec.pathIndex][1] * (180/Math.PI))

        if (Math.round(this.duhec.translation[0]) === this.pathGhost[this.duhec.pathIndex][0] && Math.round(this.duhec.translation[2]) === this.pathGhost[this.duhec.pathIndex][2]) {
            if (rotacija === ciljnaRotacija) {
                this.duhec.pathIndex++
                if (this.duhec.pathIndex === this.pathGhost.length) {
                    this.duhec.pathIndex = 0;
                }
            }
        }

        if (Math.round(this.duhec.translation[0]) === this.pathGhost[this.duhec.pathIndex][0]) {
            this.duhec.translation[0] = Math.round(this.duhec.translation[0])
        } else if (this.duhec.translation[0] > this.pathGhost[this.duhec.pathIndex][0]) {
            this.duhec.translation[0] -= 8*dt
        } else if (this.duhec.translation[0] < this.pathGhost[this.duhec.pathIndex][0]){
            this.duhec.translation[0] += 8*dt
        }

        if (Math.round(this.duhec.translation[2]) === this.pathGhost[this.duhec.pathIndex][2]) {
            this.duhec.translation[2] = Math.round(this.duhec.translation[2])
        } else if (this.duhec.translation[2] > this.pathGhost[this.duhec.pathIndex][2]) {
            this.duhec.translation[2] -= 8*dt
        } else if (this.duhec.translation[2] < this.pathGhost[this.duhec.pathIndex][2]){
            this.duhec.translation[2] += 8*dt
        }
        ///// Duhec rotacija
        const razdalja = Math.sqrt(((this.pathGhost[this.duhec.pathIndex][0]-this.duhec.translation[0])*(this.pathGhost[this.duhec.pathIndex][0]-this.duhec.translation[0])) + ((this.duhec.translation[2]-this.pathGhost[this.duhec.pathIndex][2])*(this.duhec.translation[2]-this.pathGhost[this.duhec.pathIndex][2])))
        if (Math.round(razdalja) === 0) {
            this.duhec.rotation[1] = this.pathGhostRotation[this.duhec.pathIndex][1]
        }
        if (razdalja < 10) {
            rotacija = Math.round(this.duhec.rotation[1] * (180/Math.PI))
            ciljnaRotacija = Math.round(this.pathGhostRotation[this.duhec.pathIndex][1] * (180/Math.PI))
            if (rotacija === ciljnaRotacija) {
                this.duhec.rotation = this.duhec.rotation
            } else if (rotacija > ciljnaRotacija) {
                this.duhec.rotation[1] -= 1*Math.PI/180;
            } else if (rotacija < ciljnaRotacija){
                this.duhec.rotation[1] += 1*Math.PI/180
            }
        }
        ////////

        this.camera.update(dt, this.scene.nodes[1]);
        this.camera.updateModel(dt, this.scene.nodes[1])
        this.physics.update(dt);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        this.aspect = w / h;
        if (this.camera) {
            this.camera.aspect = this.aspect;
            this.camera.updateProjection();
        }
    }

}

const canvas = document.querySelector('canvas');
const app = new App(canvas);
await app.init();
document.querySelector('.loader-container').remove();
