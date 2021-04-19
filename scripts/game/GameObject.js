//Copyright (C) Jose Ignacio Ferrer Vera
'use strict';

import Physics from '../libs/Physics.js';

export default class GameObject {  
    
    constructor( world, $el, isStatic = false) {
        this.controller = world;    
        this.$object = $el;
        
        // some local and constructor stuff here    
        this.pos = {
            x:this.$object.attr("left"),
            y:this.$object.attr("top")
        };

        this.size = {
            width:this.$object.attr("width"),
            height:this.$object.attr("height"),
            radius: this.$object.attr("radius")
        }    
        
        this.userData = SetUserData(this.$object);     
        this.model = this._createModel( this.pos, this.size, isStatic );    
        

        //Reset DOM object position for use with CSS3 positioning    
        this.$object.css({'left':`${this.pos.x}`, 'top':`${this.pos.y}`});  
    }

    SetUserData( $el ){



        return {
            domObj: $el,
            width: $el.attr(width),
            height: $el.attr(height),
            shape: `${$el.attr(shape)}`,
            friction: $el.attr(friction),
            mass: $el.attr(mass),
            restitution: $el.attr(restitution)
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

    _createModel( pos, size, isStatic = false) {    
        
        let bodyDefn = new Physics.BodyDef;     
        bodyDefn.type = Physics.Body.dynamicBody;    
        bodyDefn.position.x = pos.x / WORLD_SCALE;    
        bodyDefn.position.y = pos.y / WORLD_SCALE;  

        let fixDefn = new Physics.FixtureDef;

        //Set Shape
        if(this.userData.shape == 'square')
        {
            fixDefn.shape = Physics.PolygonShape;
            fixDefn.shape.SetAsBox( size.width/WORLD_SCALE, size.height/WORLD_SCALE);
        }else{
            fixDefn.shape = Physics.CircleShape;
            fixDefn.shape.radius = size.radius;
        }
        
            
        fixDefn.density = 4.0; // density * area = mass    
        fixDefn.friction = 0.7; // 1 = sticky, 0 = slippery    
        fixDefn.restitution = 0.2; // 1 = very bouncy, 0 =  no bounce     
        
        let world = this.controller.getModel();    

        let bodyModel = this.world.CreateBody( bodyDef );   
        bodyModel.CreateFixture( fixDefn );

        return bodyModel;  
    }
}