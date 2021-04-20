//Copyright (C) 2021 Jose Ignacio Ferrer Vera
'use strict';

import Physics from '../libs/Physics.js';
import GameObject from './GameObject.js';
import Level from './Level.js';

const TIMESTEP = 1/60;
const VELOCITY = 3;
const POSITION = 3;

const COOLDOWN = 3;

export default class World {
    constructor( $el ){
        let gravity = new Physics.Vec2( 0, Physics.GRAVITY);

        this.shotCooldown = 3;
        this.level = new Level(); //TODO: Get Level Object 

        this.entityID = 0;
        this.entityList = [] //List of game Objects

        this.$gameArea = $el;
        this.model = new Physics.World(gravity, true);

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

        this._addListeners();
    }

    _addListeners(){
        //Mouse Move listener
        $('#game-window')
            //Handles events when the mouse gets over the editor window
            .on('mousemove', event =>{
                event.preventDefault();
                this._onGameWindowMouseMove(event);
            })
            .on('click', event =>{
                event.preventDefault();
                this._shootPlayer(event);
            })

        //Physics Listener
        const listener = new Physics.Listener(); 

        listener.BeginContact = contact =>{
            //when things touch

            let itemA = contact.GetFixtureA().GetBody().GetUserData();
            let itemB = contact.GetFixtureB().GetBody().GetUserData();

            if ((itemA == null) || (itemB == null)){
                return;
            }

            console.log(`${itemA.name} hit ${itemB.name}`);
            

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

    _findEnemies() {
        let newList = this.entityList.map(value => { return{type, status}})
            .filter((value, index) =>{value.type == 1})
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
    }

    getModel() { return this.model; }

    //Populates the EntityList and all objects in it
    _populateEntityList(levelDetails){
        //Load level itself
        //Empties previously loaded level
        $('#game-window').empty();
        this.id=0;
        //Creates obstacles in edit window
        levelDetails.level.entityLists.collidableList.forEach(element => {
            //Creates new GameObject to entity list, to be updated
            this.entityList.push(new GameObject(this, element, this.id++))
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
                            background: url(./images/catapult.png);
                            background-repeat: no-repeat;
                            background-size: 100% 100%;
                            transform: scaleX(-1);">
                        </div>`);
    
        //Adds cannon to editor object
        $('#game-window').append($cannon);

        //Add Enemies and create enemy object
        levelDetails.level.entityLists.targetList.forEach(element => {
            //Creates new GameObject
            this.entityList.push(new GameObject(this, element, this.id++))
            
        })
    }

    _createBoundaries(){

        //TODO:BUILD TERRAIN
        let world = this.getModel();

        let bodyDefn = new Physics.BodyDef();
        bodyDefn.type = Physics.Body.b2_staticBody;

        let fixDefn = new Physics.FixtureDef();
        fixDefn.shape = new Physics.PolygonShape();
        fixDefn.restitution = 0;
        fixDefn.friction = 0;


        //create ground
        fixDefn.shape.SetAsBox(Physics.WIDTH/2, .5);
        bodyDefn.position.Set(Physics.WIDTH/2, Physics.HEIGHT-.5);
        world.CreateBody(bodyDefn).CreateFixture(fixDefn);

        //Create roof
        bodyDefn.position.Set(0, -1);
        world.CreateBody(bodyDefn).CreateFixture(fixDefn);

        //left wall
        fixDefn.shape.SetAsBox(.5, Physics.HEIGHT/2);
        bodyDefn.position.Set(-1, Physics.HEIGHT/2);
        world.CreateBody(bodyDefn).CreateFixture(fixDefn);

        //right wall
        bodyDefn.position.Set(Physics.WIDTH, Physics.HEIGHT/2);
        world.CreateBody(bodyDefn).CreateFixture(fixDefn);
        
    }

    _shootPlayer(){
        this.entityList.push()
    }

        //Shoiws position of mouse in editor window
    _onGameWindowMouseMove(event){
        
        let x = Math.floor( event.target.offsetLeft);
        let y = Math.floor( event.target.offsetTop);
        $('#info-window').html(`Mouse at: (${event.clientX-320}, ${event.clientY-114})`);
    }
}