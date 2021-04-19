//Copyright (C) 2021 Jose Ignacio Ferrer Vera
'use strict';

import Physics from '../libs/Physics.js';
import GameObject from './GameObject.js';
import Level from './Level.js';

const TIMESTEP = 1/60;
const VELOCITY = 3;
const POSITION = 3;


export default class World {
    constructor( $el ){
        let gravity = new Physics.Vec2(0, Physics.GRAVITY);

        this.level = new Level(); //TODO: Get Level Object 
        this.entityList = [] //List of game Objects

        this.$gameArea = $el;
        this.model = new Physics.World(gravity);

        this._createBoundaries();

        this.level.load()
            .then(levelData => JSON.parse(levelData))
            .then(levelData => JSON.parse(levelData.payload))
            .then(levelData => {
                this._populateEntityList(levelData);
            })
            .catch(err=>{
                console.log(err);
            })

        this.addListener();
    }

    addListener(){
        const listener = new Physics.Listener(); 

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

    update(dt){
        this.model.Step(TIMESTEP, VELOCITY, POSITION);
        this.model.ClearForces();
        
        this.entityList.forEach(gameObj =>{
            gameObj.update(dt);
        })
    }

    render(dt){
        //FIXME: RENDERING IS KINDA BAD RIGHT NOW, need to fix positioning

        this.entityList.forEach(gameObj =>{
            gameObj.render(dt);
        })
        this.World.render();
    }

    getModel() { return this.model; }

    //Populates the EntityList and all objects in it
    _populateEntityList(levelDetails){
        //Load level itself
        //Empties previously loaded level
        //FIXME:Remove comment
        //$('#game-window').empty();
        this.objectID=0;
        this.targetID=0;
        let position;
        //Creates obstacles in edit window
        levelDetails.level.entityLists.collidableList.forEach(object => {
            let $newEl = $(`<div 
                            id = "obstacle-${this.objectID++}"
                            class="obstacle debug" 
                            style = "position: absolute;
                                    top: ${object.pos.y}px;
                                    left: ${object.pos.x}px;
                                    width: ${object.entity.width}px;
                                    height: ${object.entity.height}px;
                                    background: url(${object.entity.texture});
                                    background-repeat: no-repeat;
                                    background-size: 100% 100%"
                            >
                            </div>`);

            //Adds object data to the object themselves               
            $newEl = this._addObjectData($newEl, object.entity);
            position = object.pos;

            //Creates new GameObject
            this.entityList.push(new GameObject(this, position, $newEl))

            //Appends objects to the window
            $('#game-window').append($newEl);
                      
        })

        //Add cannons and create cannon object
        let cannon = levelDetails.level.catapult;
        let $cannon = $(`<div
                            id= "cannon"
                            class="cannon debug"
                            style = "position: absolute;
                            top: ${cannon.pos.y}px;
                            left: ${cannon.pos.x}px;
                            width: 100px;
                            height: 100px;
                            background: url(./images/sprites/moving.gif);
                            background-repeat: no-repeat;
                            background-size: 100% 100%;
                            transform: scaleX(-1);">
                        </div>`);
    
        //Adds cannon to editor object
        $('#game-window').append($cannon);
        
        
        //Add Enemies and create enemy object
        levelDetails.level.entityLists.targetList.forEach(object => {
            let $newEn = $(`<div 
                            id = "enemy-${this.targetID++}"
                            class="enemy debug" 
                            style = "position: absolute;
                                    top: ${object.pos.y}px;
                                    left: ${object.pos.x}px;
                                    width: ${object.entity.width}px;
                                    height: ${object.entity.height}px;
                                    background: url(${object.entity.texture});
                                    background-repeat: no-repeat;
                                    background-size: 100% 100%">
                            </div>`)

            //Adds enemy data to the enemies
            $newEn = this._addObjectData($newEn, object.entity);
            position = object.pos;

            //Creates new GameObject
            this.entityList.push(new GameObject(this, position, $newEn))

            //Appends object to edit window
            $('#game-window').append($newEn);
            
        })
    }

    //Adds object data as JQuery attributes to the object
    _addObjectData($el, objectDetails){
        $el.attr("type", objectDetails.type);
        $el.attr("name", objectDetails.name);
        $el.attr("name", objectDetails.name);
        $el.attr("height", objectDetails.height);
        $el.attr("width", objectDetails.width);
        $el.attr("texture", `${objectDetails.texture}`);
        $el.attr("shape", `${objectDetails.shape}`);
        $el.attr("friction", `${objectDetails.friction}`);
        $el.attr("mass", `${objectDetails.mass}`);
        $el.attr("restitution", `${objectDetails.restitution}`);
        return $el;
    }

    _createBoundaries(){

        new GameObject(this, {}, this.$gameArea, true);
    }
}