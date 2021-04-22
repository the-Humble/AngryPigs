//Copyright (C) 2021 Jose Ignacio Ferrer Vera and Ana Carolina Arellano
'use strict';

import Physics from '../libs/Physics.js';

export default class GameObject {  
    
    constructor( world, element, id) {
        //set attributes of game objects
        this.id = id;
        this.controller = world;    
        this.$object = this._createElement(element);
        if(element.entity.type == 1)
        {
            this.$object = this._createEnemy(element);
        }else if(element.entity.type == 2){
            this.$object = this._createCannonball(element);
        }

        this.rotation = 0;

        this.userData = this._CreateUserData(element);
        //set size
        this.domSize = {
            width: element.entity.width,
            height: element.entity.height,
            radius: element.entity.width //TODO: Include circle support

        }
        //set position 
        this.domPos = {
            top: element.pos.y,
            left: element.pos.x
        }

        //set size of box2D
        this.box2DSize = {
            width: (element.entity.width/Physics.WORLD_SCALE)/2,
            height:(element.entity.height/Physics.WORLD_SCALE)/2,
            radius: (element.entity.width/Physics.WORLD_SCALE)/2
        }    

        // set position of box2D
        this.box2DPos = {
            x: (element.pos.x+(element.entity.width/2))/Physics.WORLD_SCALE,
            y: (element.pos.y+(element.entity.width/2))/Physics.WORLD_SCALE
        };

        this.body = this._createModel( this.box2DPos, this.box2DSize);
            
        
        //Reset DOM object position for use with CSS3 positioning    
        this.$object.css({'transform': `translate(${this.domPos.left}px, ${this.domPos.top}px) rotate(${this.rotation}deg)`});  
        //Appends object to edit window
        $('#game-window').append(this.$object);
    }

    //store the data of the element within variables
    _CreateUserData( element){
        return {
            name: element.entity.name,
            type: element.entity.type,
            width: element.entity.width,
            height: element.entity.height,
            shape: element.entity.shape,
            friction: element.entity.friction,
            mass: element.entity.mass,
            restitution: element.entity.restitution
        }
    }

    //different types of objects
    static get OBJECTTYPE()
    {
        return {
            TARGET: 1,
            FRIENDLY: 2,
            OBJECT: 3,
            TERRAIN: 4,
        }
    }

    _createElement(element){
        let $newEl = $(`<div 
                            id = "obstacle-${this.id}"
                            class="obstacle debug" 
                            style = "position: absolute;
                                    width: ${element.entity.width}px;
                                    height: ${element.entity.height}px;
                                    background: url(${element.entity.texture});
                                    background-repeat: no-repeat;
                                    background-size: 100% 100%"
                            >
                            </div>`);

            //Adds object data to the object themselves               
            $newEl = this._addObjectData($newEl, element.entity);

            return $newEl;
    }

    _createEnemy(element){
        let $newEn = $(`<div 
                            id = "enemy-${this.id}"
                            class="enemy debug" 
                            style = "position: absolute;
                                    width: ${element.entity.width}px;
                                    height: ${element.entity.height}px;
                                    background: url(${element.entity.texture});
                                    background-repeat: no-repeat;
                                    background-size: 100% 100%"
                            >
                            </div>`)

            //Adds enemy data to the enemies
            $newEn = this._addObjectData($newEn, element.entity);

            return $newEn;
    }

    _createCannonball(element){
        let $newEl = $(`<div 
                            id = "cannonball-${this.id}"
                            class="obstacle debug" 
                            style = "position: absolute;
                                    width: ${element.entity.width}px;
                                    height: ${element.entity.height}px;
                                    background: url(${element.entity.texture});
                                    background-repeat: no-repeat;
                                    background-size: 100% 100%"
                            >
                            </div>`);

            //Adds object data to the object themselves               
            $newEl = this._addObjectData($newEl, element.entity);

            return $newEl;
    }

    _createModel( box2DPos, box2DSize) {    
        
        let bodyDefn = new Physics.BodyDef();         
        bodyDefn.position.x = box2DPos.x;    
        bodyDefn.position.y = box2DPos.y;  
        
        
        bodyDefn.type = Physics.Body.b2_dynamicBody;
        

        let fixDefn = new Physics.FixtureDef();
        
        //Set Shape
        fixDefn.shape = new Physics.PolygonShape();
        fixDefn.shape.SetAsBox(box2DSize.width, box2DSize.height);

        if(this.userData.shape == 'circle')
        {
            fixDefn.shape = new Physics.CircleShape();
            fixDefn.shape.SetRadius( box2DSize.radius );
        }
        
        let density = this.userData.mass / (box2DSize.width * box2DSize.height * 4);
        fixDefn.density = density; // density * area = mass    
        fixDefn.friction = this.userData.friction; // 1 = sticky, 0 = slippery    
        fixDefn.restitution = this.userData.restitution; // 1 = very bouncy, 0 =  no bounce     
        
        let world = this.controller.getModel();   

        let body = world.CreateBody( bodyDefn );   
        body.CreateFixture( fixDefn );
        body.SetUserData(this.userData);

        return body;  
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

    update( dt ){
        this.box2DPos.x = this.body.GetPosition().x;
        this.box2DPos.y = this.body.GetPosition().y;
        this.rotation = Math.floor(this.body.GetAngle()*Physics.RAD_2_DEG);
    
        this.domPos.left = (this.box2DPos.x *Physics.WORLD_SCALE)-(this.domSize.width/2);
        this.domPos.top = (this.box2DPos.y *Physics.WORLD_SCALE)-(this.domSize.height/2);
        
    }

    render( dt ){
        this.$object.css({
            'transform': `translate(${this.domPos.left}px, ${this.domPos.top}px) rotate(${this.rotation}deg)`}, 
            );
    }
}