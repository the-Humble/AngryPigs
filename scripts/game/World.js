//Copyright (C) 2021 Jose Ignacio Ferrer Vera
'use strict';

import Physics from './libs/Physics.js';
import GameObject from './GameObject.js';

const TIMESTEP = 1/60;
const VELOCITY = 10;
const POSITION = 10;

export default class World {
    constructor( $el ){
        let gravity = new Physics.Vec2(0, Physics.GRAVITY);

        this.entityList = [] //A list of GameObjects

        this.$gameArea = $el;
        this.model = new Physics.World(gravity);

        this.addListener();
    }

    addListener(){
        const listener = new Physics.listener; 

        listener.BeginContact = contact =>{
            //when things touch

            let itemA = contact.GetFixtureA().GetBody().GetUserData();
            let itemB = contact.GetFixtureB().GetBody().GetUserData();

            //If colliding with boxes or environement do nothing
            //TODO: If Player hit enemy, do something 
            

        };

        listener.EndContact = contact =>{
            //Things no longer touching
        };
        
        listener.PreSolve = (contact, oldManifold) =>{
            //Called after collision but before physics happen
        };
        
        listener.PreSolve = (contact, impulse) =>{
            //Called after collision but before physics happen
            //Place your stuff
            //TODO: WIN/LOSE Flags

        };
        
        this.model.SetContactListener(listener);
        
    }

    update(){
        this.model.Step(TIMESTEP, VELOCITY, POSITION);
        this.model.ClearForces();
    }

    render(){
        //H

        this.entityList.forEach(gameObj =>{
            gameObj.render();
        })
    }

    getModel() { return this.model; }
}