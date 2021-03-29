//Copyright (C) 2021 Jose Ignacio Ferrer Vera
'use strict';

export default class Reply {
    constructor( error = 0, errMsg ="No Error" ){

        this.__private__ ={
            name:"",
            payload: {},
            bytes: 0,
            error,
            errMsg
        }
    }
    //Success Response
    //{
    //"name": "requested entity name",
    //"payload": "JSONString" // actual data in JSON format 
    //"bytes": "actual bytes read",
    //"error": 0
    //"errorMsg :"No Error
    //}

    set payload(value) {
        let my = this.__private__;
        my.payload = value;
    }

    ok() {
        let my = this.__private__;
        my.error = 0;
        my.errMsg = "No error";

        return this;
    }

    error( code = 0, msg = "No Error")
    {
        let my = this.__private__;
        my.error = code;
        my.errMsg = msg;

        return this;
    }
    
    serialize() {

        return JSON.stringify(this.__private__);
    }
}