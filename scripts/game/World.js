//Copyright (C) 2021 Jose Ignacio Ferrer Vera
'use strict';

import Physics from '../libs/Physics.js';
import Level from './Level.js';

const TIMESTEP = 1/60;
const VELOCITY = 10;
const POSITION = 10;

export default class World {
    constructor( $el ){
        let gravity = new Physics.Vec2(0, Physics.GRAVITY);

        this.level = new Level(); //TODO: Get Level Object 
        this.entityList = [] //List of game Objects

        this.$gameArea = $el;
        this.model = new Physics.World(gravity);

        this.level.load()
            .then(levelData => JSON.parse(levelData))
            .then(levelData => {
                this._populateWorld(levelData);
            })

        this.addListener();
    }

    addListener(){
        const listener = new Physics.Listener; 

        listener.BeginContact = contact =>{
            //when things touch

            let itemA = contact.GetFixtureA().GetBody().GetUserData();
            let itemB = contact.GetFixtureB().GetBody().GetUserData();

            if ((itemA == null) || (itemB == null))
            return;

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

    //Populates the world and all objects in it
    _populateWorld( levelData ){

    }
}