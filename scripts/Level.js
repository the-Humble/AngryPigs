//Copyright (C) 2021 Jose Ignacio Ferrer Vera
'use strict';

export default class Level {
    constructor(name, ammo){

        this.id = 0;
        this.__private__ ={
            level:{
                id: this.id++,
                name,
                ammo,
                catapult: {
                    id: this.id++,
                    pos: {
                        x:0,
                        y:0
                    }
                },

                entityLists:{
                    collidableList:[],
                    targetList:[]
                }
            }
        }
    }
    //Success Response
    //{
    //"userid": "valid vfs username", // eg pg15student
    //"name": "filename", // name of entity, no spaces, no extension
    //"type": "object" | "level", // one of these two key strings
    //"payload": "JSONString" // actual data in JSON format 
    //}           

    _appendObjectToList($objectDetails, x, y){
        let object = {
            id: this.id++,
            pos: {
                x,
                y, 
            },
            value: 100,
            entity: {
                type: $objectDetails.attr('type'),
                name: $objectDetails.attr('name'),
                height: $objectDetails.attr('height'),
                width: $objectDetails.attr('width'),
                texture: $objectDetails.attr('texture'),
                shape: $objectDetails.attr('shape'),
                friction: $objectDetails.attr('friction'),
                mass: $objectDetails.attr('mass'),
                restitution: $objectDetails.attr('restitution')
            }
        }
        this.__private__.level.entityLists.collidableList.push(object);
    }

    _appendEnemyToList(objectDetails, x, y){
        let object = {
            id: this.id++,
            pos: {
                x,
                y, 
            },
            value: 100,
            entity: {
                type: objectDetails.type,
                name: objectDetails.name,
                height: objectDetails.height,
                width: objectDetails.width,
                texture: objectDetails.texture,
                shape: objectDetails.shape,
                friction: objectDetails.friction,
                mass: objectDetails.mass,
                restitution: objectDetails.restitution
            }
        }
        this.__private__.level.entityLists.targetList.push(object);
    }
    
    serialize() {

        return JSON.stringify(this.__private__);
    }
}