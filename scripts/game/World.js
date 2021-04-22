//Copyright (C) 2021 Jose Ignacio Ferrer Vera and Ana Carolina Arellano
'use strict';

import Physics from '../libs/Physics.js';
import Cannonball from './Cannonball.js';
import GameObject from './GameObject.js';
import Level from './Level.js';

const TIMESTEP = 1/60;
const VELOCITY = 10;
const POSITION = 10;

const COOLDOWN = 30;

export default class World {
    constructor( $el , levelName){
        //set attributes of the World
        let gravity = new Physics.Vec2(0, Physics.GRAVITY);

        this.shotCooldown = COOLDOWN;
        this.shoot = true;
        this.level = new Level(levelName); //TODO: Get Level Object 

        this.entityID = 0;

        this.entityList = [] //List of game Objects

        this.$gameArea = $el;
        this.model = new Physics.World(gravity, true);
        this.points = 0;
        
        this._createBoundaries();

        //load level into the would
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
    //returns points earned
    get POINTS(){ return this.points };
    _addListeners(){
        //Mouse Move listener
        $('#game-window')
            //Handles events when the mouse gets over the editor window
            .on('mousemove', event =>{
                event.preventDefault();//print position of mouse
                this._onGameWindowMouseMove(event);
            })  //click on the game window only work for shooting
            .on('click', event =>{
                event.preventDefault();
                if(this.shoot){
                    this._shootPlayer(event);
                }
            })

        //Physics Listener
        const listener = new Physics.Listener(); 

        listener.BeginContact = contact =>{
            //when things touch

            //get items that are interacting
            let itemA = contact.GetFixtureA().GetBody().GetUserData();
            let itemB = contact.GetFixtureB().GetBody().GetUserData();

            if ((itemA == null) || (itemB == null)){
                return;
            }
            //Check if the cannon ball was one of the objects having contact
            if(`${itemB.name}` == "Cannonball")
            {
                //add different amounts of money depending on what the cannon ball hit
                //and add it to the html
                if(`${itemA.name}` == "Ladder")
                {
                    this.points += 10;
                    $('#points').html(`<p>${this.points}</p>`)
                }
            }
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

    //find enemies present in the world
    _findEnemies() {
        let newList = this.entityList.map(value => { return{type, status}})
            .filter((value, index) =>{value.type == 1})
    }

    //manage the cooldown of the cannon ball
    _checkShoot(dt){
        if(this.shotCooldown>COOLDOWN){
            this.shoot = true;
            return;
        }
        this.shotCooldown += dt;
        this.shoot = false;
    }

    update(dt){
        //update every frame the model
        this.model.Step(TIMESTEP, VELOCITY, POSITION);
        this.model.ClearForces();
        
        //update every frame the entity list
        this.entityList.forEach(gameObj =>{
            gameObj.update(dt);
        })

        //update every frame the cannon ball
        this.cannonball?.update(dt);
        this._checkShoot(dt);
    }

    render(dt){
        //render each object
        this.entityList.forEach(gameObj =>{
            gameObj.render(dt);
        })
        //render cannon ball
        this.cannonball?.render(dt);
    }

    getModel() { return this.model; }

    //Populates the EntityList and all objects in it
    _populateEntityList(levelDetails){
        //Load level itself
        //Empties previously loaded level
        $('#game-window').empty();
        this.entityID=0;
        //Creates obstacles in edit window
        levelDetails.level.entityLists.collidableList.forEach(element => {
            //Creates new GameObject to entity list, to be updated
            this.entityList.push(new GameObject(this, element, this.entityID++))
        })

        //create cannon object
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
                            background-size: 100% 100%;">
                        </div>`);
    
        //Adds cannon to editor object
        $('#game-window').append($cannon);
        
        //Add Enemies and create enemy object
        levelDetails.level.entityLists.targetList.forEach(element => {
            //Creates new GameObject
            this.entityList.push(new GameObject(this, element, this.entityID++))
            
        })
        //create cannon ball
        this.cannonball = new Cannonball(this, this.entityID++);
        this.entityList.push(this.cannonball);
    }

    _createBoundaries(){

        //TODO:BUILD TERRAIN
        let world = this.getModel();

        let bodyDefn = new Physics.BodyDef();
        bodyDefn.type = Physics.Body.b2_staticBody;

        let fixDefn = new Physics.FixtureDef();
        fixDefn.shape = new Physics.PolygonShape();
        fixDefn.restitution = 0;
        fixDefn.friction = 1;


        //create ceiling
        fixDefn.shape.SetAsBox(Physics.WIDTH, 1);
        bodyDefn.position.Set(0, -1);
        world.CreateBody(bodyDefn).CreateFixture(fixDefn);

        //Create floor
        bodyDefn.position.Set(0, (Physics.HEIGHT)+1);
        world.CreateBody(bodyDefn).CreateFixture(fixDefn);

        //left wall
        fixDefn.shape.SetAsBox(1, Physics.HEIGHT);
        bodyDefn.position.Set(-1, 0);
        world.CreateBody(bodyDefn).CreateFixture(fixDefn);

        //right wall
        bodyDefn.position.Set(Physics.WIDTH+1, 0);
        world.CreateBody(bodyDefn).CreateFixture(fixDefn);
        
    }

    //parabolic shot from the cannon
    _shootPlayer(event){
        let vel = this.cannonball.body.GetLinearVelocity();
        vel.x = 0;
        vel.y = 0;
        this.cannonball.body.SetLinearVelocity(vel);

        let ang = this.cannonball.body.GetAngularVelocity();
        ang = 0;
        this.cannonball.body.SetAngularVelocity(ang);

        var pos = this.cannonball.body.GetPosition();
        pos.x = 25/Physics.WORLD_SCALE;
        pos.y= 650/Physics.WORLD_SCALE;
        this.cannonball.body.SetPosition( pos )
        this.shoot = false;
        this.shotCooldown = 0;
        let forceVec = new Physics.Vec2(70*(event.clientX-event.target.offsetLeft)/Physics.WORLD_SCALE, -70*(Physics.SCREEN.HEIGHT-(event.clientY-event.target.offsetTop))/Physics.WORLD_SCALE)
        this.cannonball.body.ApplyImpulse(forceVec, this.cannonball.body.GetWorldCenter());
        
    }

    //Shows position of mouse in editor window
    _onGameWindowMouseMove(event){
        
        let x = Math.floor( event.target.offsetLeft);
        let y = Math.floor( event.target.offsetTop);
        $('#info-window').html(`Mouse at: (${event.clientX-320}, ${event.clientY-180})`);
    }
}