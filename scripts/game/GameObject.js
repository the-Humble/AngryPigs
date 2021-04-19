//Copyright (C) Jose Ignacio Ferrer Vera
'use strict';

import Physics from '../libs/Physics.js';

export default class GameObject {  
    
    constructor( world, position, $el, isStatic = false) {
        this.controller = world;    
        this.$object = $el;
        
        this.rotation = 0;

        this.size = {
            width:(parseInt(this.$object.attr("width"))/(Physics.WORLD_SCALE))/2,
            height:(parseInt(this.$object.attr("height"))/(Physics.WORLD_SCALE))/2,
            radius: parseInt(this.$object.attr("radius"))
        }    

        // some local and constructor stuff here    
        this.pos = {
            x: (position.x / Physics.WORLD_SCALE) + this.size.width,
            y: (position.y / Physics.WORLD_SCALE) + + this.size.height
        };
        
        this.userData = this.SetUserData(this.$object);
        
        if(isStatic)
        {
            this._createTerrain();
        }
        else
        {
            this.model = this._createModel( this.pos, this.size, isStatic);
        }  
            
        
        //Reset DOM object position for use with CSS3 positioning    
        this.$object.css({'left':`${position.x}`, 'top':`${position.y}`, 'transform': `rotate(${this.rotation})`});  
    }

    SetUserData( $el ){

        return {
            domObj: $el,
            width: parseInt($el.attr('width')),
            height: parseInt($el.attr('height')),
            shape: `${$el.attr('shape')}`,
            friction: parseInt($el.attr('friction')),
            mass: parseInt($el.attr('mass')),
            restitution: parseInt($el.attr('restitution'))
        }
    }

    static get OBJECTTYPE()
    {
        return {
            TARGET: 1,
            FRIENDLY: 2,
            OBJECT: 3,
            TERRAIN: 4,
        }
    }

    _createModel( pos, size, isStatic) {    
        
        let bodyDefn = new Physics.BodyDef();         
        bodyDefn.position.x = pos.x;    
        bodyDefn.position.y = pos.y;  
        
        
        bodyDefn.type = Physics.Body.b2_dynamicBody;
        

        let fixDefn = new Physics.FixtureDef();
        
        //Set Shape
        if(this.userData.shape == 'circle')
        {
            fixDefn.shape = new Physics.CircleShape();
            fixDefn.shape.radius = size.radius;

        }else{
            fixDefn.shape = new Physics.PolygonShape();
            fixDefn.shape.SetAsBox(size.width, size.height);
        }
        
        let density = this.userData.mass / (size.width * size.height * 4);
        fixDefn.density = density; // density * area = mass    
        fixDefn.friction = this.userData.friction; // 1 = sticky, 0 = slippery    
        fixDefn.restitution = this.userData.restitution; // 1 = very bouncy, 0 =  no bounce     
        
        let world = this.controller.getModel();   

        let body = world.CreateBody( bodyDefn );   
        body.CreateFixture( fixDefn );

        return body;  
    }

    _createTerrain(){
        let world = this.controller.getModel();

        let bodyDefn = new Physics.BodyDef();
        bodyDefn.type = Physics.Body.b2_staticBody;

        let fixDefn = new Physics.FixtureDef();
        fixDefn.shape = new Physics.PolygonShape();
        fixDefn.restitution = 0;
        fixDefn.friction = 0;


        //create ground
        fixDefn.shape.SetAsBox(Physics.WIDTH/2, .5);
        bodyDefn.position.Set(Physics.WIDTH/2, Physics.HEIGHT-2);
        world.CreateBody(bodyDefn).CreateFixture(fixDefn);

        //Create roof
        bodyDefn.position.Set(0, -1);
        world.CreateBody(bodyDefn).CreateFixture(fixDefn);

        //left wall
        fixDefn.shape.SetAsBox(.5, Physics.HEIGHT/2);
        bodyDefn.position.Set(-1, Physics.HEIGHT/2);
        world.CreateBody(bodyDefn).CreateFixture(fixDefn);

        //right wall
        bodyDefn.position.Set(Physics.WIDTH/2, Physics.HEIGHT/2);
        world.CreateBody(bodyDefn).CreateFixture(fixDefn);

    }

    update( dt ){
        this.pos.x = this.model.GetPosition().x;
        this.pos.y = this.model.GetPosition().y;
        this.rotation = this.model.GetAngle()*Physics.RAD_2_DEG;
    }

    render( dt ){
        this.userData.domObj.css({
            'left':`${(this.pos.x * Physics.WORLD_SCALE) - this.size.width}px`, 
            'top':`${(this.pos.y * Physics.WORLD_SCALE) - this.size.height}px`, 
            'transform': `rotate(${this.rotation}deg)`}, 
            );
    }
}