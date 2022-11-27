import { vec3, mat4 } from './lib/gl-matrix-module.js';

import { Utils } from './Utils.js';
import { Node } from './Node.js';

export class Camera extends Node {

    constructor(options) {
        super(options);
        Utils.init(this, this.constructor.defaults, options);

        this.projection = mat4.create();
        this.updateProjection();

        this.pointermoveHandler = this.pointermoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);
        this.keys = {};
    }

    updateProjection() {
        mat4.perspective(this.projection, this.fov, this.aspect, this.near, this.far);
    }

    updateModel(dt, model) {

        const c = model;

        const forward = vec3.set(vec3.create(),
            -Math.sin(c.rotation[1]), 0, -Math.cos(c.rotation[1]));
        const right = vec3.set(vec3.create(),
            Math.cos(c.rotation[1]), 0, -Math.sin(c.rotation[1]));

        const rotRight = vec3.set(vec3.create(),
            0, Math.PI/128, 0);

        // 1: add movement acceleration
        const acc = vec3.create();
        const rot = vec3.create();
        if (this.keys['KeyW']) {
            vec3.add(acc, acc, forward);
        }
        if (this.keys['KeyS']) {
            vec3.sub(acc, acc, forward);
        }
        if (this.keys['KeyD']) {
            //vec3.add(acc, acc, right);
            vec3.sub(rot, rot, rotRight);
        }
        if (this.keys['KeyA']) {
            //vec3.sub(acc, acc, right);
            vec3.add(rot, rot, rotRight);
        }

        vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);
        vec3.scaleAndAdd(c.rotation, c.rotation, rot, 1)
        //console.log(c.velocity, c.translation, c.rotation)
        const i = vec3.set(vec3.create(), 0, 0, -1)
        const test = vec3.set(vec3.create(), 0, 0, 0)
        const normalize_velocity = vec3.set(vec3.create(), 0, 0, 0)

        vec3.normalize(test, vec3.rotateY(test, i, test , c.rotation[1]))
        vec3.normalize(normalize_velocity, c.velocity)
        //console.log(c.velocity)
        //console.log(vec3.dot(c.velocity, test) / c.maxSpeed)
        //vec3.scale(c.velocity, c.velocity, 1 - c.frictionY);
        // 3: if no movement, apply friction
        const scale = Math.abs(vec3.dot(normalize_velocity, test))
        if (scale > 0.8) {
            vec3.scale (c.velocity, c.velocity, 1 - 0.01)
        } else {
            vec3.scale(c.velocity, c.velocity, 1 - scale/32)
        }
        if (!this.keys['KeyW'] &&
            !this.keys['KeyS'])
        {

            //vec3.rotateX(c.velocity, vec3.set(vec3.create(), 1, 0, 0), c.translation, c.rotation[1])
            //console.log(c.velocity)
            //console.log(vec3.dot(vec3.normalize(c.velocity,c.velocity),vec3.set(vec3.create(), 1, 0, 0)));
            //c.velocity[2] = c.velocity[2] * (1 - c.frictionX)
            //c.velocity[0] = c.velocity[0] * (1 - c.frictionY)

        }

        // 4: limit speed
        const len = vec3.len(c.velocity);
        if (len > c.maxSpeed) {
            vec3.scale(c.velocity, c.velocity, c.maxSpeed / len);
        }
    }

    update(dt, model) {
        const c = this;
        c.rotation[0] = -Math.PI/8; c.rotation[1] = model.rotation[1]; c.rotation[2] = model.rotation[2];
        c.translation[0] = model.translation[0]; c.translation[1] = model.translation[1] +2; c.translation[2] = model.translation[2];
    }

    enable() {
        document.addEventListener('pointermove', this.pointermoveHandler);
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }

    disable() {
        document.removeEventListener('pointermove', this.pointermoveHandler);
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);

        for (const key in this.keys) {
            this.keys[key] = false;
        }
    }

    pointermoveHandler(e) {
        const dx = e.movementX;
        const dy = e.movementY;
        const c = this;

        c.rotation[0] -= dy * c.pointerSensitivity;
        c.rotation[1] -= dx * c.pointerSensitivity;

        const pi = Math.PI;
        const twopi = pi * 2;
        const halfpi = pi / 2;

        if (c.rotation[0] > halfpi) {
            c.rotation[0] = halfpi;
        }
        if (c.rotation[0] < -halfpi) {
            c.rotation[0] = -halfpi;
        }

        c.rotation[1] = ((c.rotation[1] % twopi) + twopi) % twopi;
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }

}

Camera.defaults = {
    aspect           : 1,
    fov              : 1.5,
    near             : 0.01,
    far              : 100,
    velocity         : [0, 0, 0],
    pointerSensitivity : 0.002,
    maxSpeed         : 3,
    friction         : 0.2,
    acceleration     : 20
};
