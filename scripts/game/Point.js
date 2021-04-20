//Copyright (C) Jose Ignacio Ferrer Vera
'use strict';

import Physics from '../libs/Physics.js';

export default class GameObject { 
    //(x,y) = world space, (top, left) == screen space
    
    constructor(x, y, origin = {top:0, left:0}){
        this.dx;
        this.dy;
        this.pos={x, y}

        this.origin = {...origin};
    }

    get x(){return this.d.x};
    get y(){return this.d.y};

    get top() { return origin.top - Math.floor(this.d.y*Physics.WORLD_SCALE); }
    get left(){ return Math.floor(this.d.x*Physics.WORLD_SCALE) - this.origin.left;}

    asScreen(...coords) {

        return {top, left}
    }



}
