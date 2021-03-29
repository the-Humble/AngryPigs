//Copyright (C) 2021 Jose Ignacio Ferrer Vera
'use strict';

export default class ReplyGet {
    constructor( error = 0){

        this.__private__ ={
            payload: [],
            error,
        }
    }
    //Success Response
    //{
    //"payload": [],
    //"error": 0
    //}

    set payload(value) {
        let my = this.__private__;
        my.payload = value;
    }

    addToPayload(toAdd){
        let my = this.__private__;
        my.payload.push(toAdd);
    }

    ok() {
        let my = this.__private__;
        my.error = 0;

        return this;
    }

    error( code = 0)
    {
        let my = this.__private__;
        my.error = code;

        return this;
    }
    
    serialize() {
        return JSON.stringify(this.__private__);
    }
}