//Copyright (C) 2021 Jose Ignacio Ferrer Vera
'use strict';

export default class Request {
    constructor(name, type){

        this.request ={
            userid:"pg20jose",
            name,
            type,
            payload:""
        }
    }
    //Success Response
    //{
    //"userid": "valid vfs username", // eg pg15student
    //"name": "filename", // name of entity, no spaces, no extension
    //"type": "object" | "level", // one of these two key strings
    //"payload": "JSONString" // actual data in JSON format 
    //}           

    set payload(value) {
        let my = this.request;
        my.payload = value;
    }
    
    serialize() {

        return JSON.stringify(this.request);
    }
}