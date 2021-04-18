//Copyright (C) Jose Ignacio Ferrer Vera
'use strict';

export default class GameObject {  
    
    constructor( world, $el, isStatic ) {
        // some local and constructor stuff here    
        let x = y = 0;
        let width = height = 0;    
        this.controller = world;    
        this.$object = $el;     
        this.model = this._createModel( x, y, width, height, isStatic );    
        this.userData = SetUserData(this.$object);

        //Reset DOM object position for use with CSS3 positioning    
        this.$object.css({'left':`${this.$object.pos.x}`, 'top':`${this.$object.pos.y}`});  
    }

    SetUserData( $el ){
        return {
            domObj: $el,
            width: $el.attr(width),
            height: $el.attr(height),
            shape: $el.attr(shape),
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

    _createModel( x, y, width, height ) {    
        
        let bodyDefn = new Physics.BodyDef;     
        bodyDefn.type = Physics.Body.dynamicBody;    
        bodyDefn.position.x = x / WORLD_SCALE;    
        bodyDefn.position.y = y / WORLD_SCALE;  

        let fixDefn = new Physics.FixtureDef;    
        fixDefn.shape = new Physics.PolygonShape;    
        fixDefn.shape.SetAsBox( width/WORLD_SCALE, height/WORLD_SCALE);    
        fixDefn.density = 4.0; // density * area = mass    
        fixDefn.friction = 0.7; // 1 = sticky, 0 = slippery    
        fixDefn.restitution = 0.2; // 1 = very bouncy, 0 =  no bounce     
        
        let world = this.controller.getModel();    

        let bodyModel = this.world.CreateBody( bodyDef );   
        bodyModel.CreateFixture( fixDefn );

        return bodyModel;  
    }
}