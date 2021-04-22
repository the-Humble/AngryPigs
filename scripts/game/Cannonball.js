//Copyright (C) Jose Ignacio Ferrer Vera and Ana Carolina Arellano
'use strict';

import GameObject from './GameObject.js'

export default class Cannonball extends GameObject{
    //create cannon ball object with its physic properties and fixed position
    constructor(world, id){
        let element = {
            pos:{
                x:25,
                y:650
            },
            entity:{
                type:2,
                name:"Cannonball",
                height:50,
                width:50,
                shape:"circle",
                texture: "../images/sprites/Cannonball.webp",
                friction:1,
                mass:100,
                restitution:0
            }
        }
        //it is controlled by the world
        let controller = world;
        super(controller, element, id);
    }
}