// Copyright (C) 2021 Jose Ignacio Ferrer Vera
'use strict';

import Express from 'express';
import Path from 'path';
const __dirname = Path.resolve();
import HTTP from 'http';
import FileSystem from 'fs-extra';

import Reply from './scripts/Reply.js';
import ReplyGet from './scripts/ReplyGet.js';

const PORT = 3000;

class Server {

    constructor() {
        this.title = "Angry Pigs"
        this.levelIDs = 0;
        this.objectIDs = 0;
        this.api = Express();
        this.api.use( Express.json())
                .use( Express.urlencoded( { extended: false }))
                .use( Express.static( Path.join(__dirname, '.')));
        
        //Get home page (index.html)
        this.api.get('/', (request, response) =>{

            response.sendFile('./index.html', {title:'AngryPigs'});
        });

        //Serve editor page
        this.api.get('/editor', (request, response) =>{

            let indexFile = `${Path.join(__dirname, './')}editor.html`;
            response.sendFile(indexFile, {title:`${this.title} Editor`});
        });

        //Standard API call
        this.api.post('/api', (request, reponse) =>{});

        //Sends Level list to Editor
        this.api.post('/api/get_level_list', (request, response) =>{
            let data = request.body;
            let reply = new ReplyGet(1);
            this._readThroughLevelList(reply, request.body)
                .then(newReply =>{
                    response.send(reply.serialize());
                })
                .catch(error => this._showErrorDialog(error));

        });

        //Send object list from data/library folder
        this.api.post('/api/get_object_list', (request, response) =>{
            
            let reply = new ReplyGet(1);
            this._gameObjectList(reply)
                .then(newReply => {
                    response.send(reply.ok().serialize());
                })
                .catch(error => {this._showErrorDialog(error)});

        });

        //Save objects from editor into server files
        this.api.post('/api/save', (request, response) =>{
            let answer = {
                error: +1
            }
            let contents = request.body.payload;
            if(request.body.type == "level" )
            {
                let file = `./data/${request.body.name}`;
                FileSystem.writeFile(file, contents)
                .then(event=>{
                    answer = {
                        name: `${request.body.name}`,
                        bytes: Buffer.byteLength(request.body.payload),
                        error: 0
                    }
                    response.send(JSON.stringify(answer));
                });
                
            }
            
            if(request.body.type == "object" )
            {
                let file = `./data/library/${request.body.name}`;
                FileSystem.writeFile(file, contents)
                .then(event=>{
                    answer = {
                        name: `${request.body.name}`,
                        bytes: Buffer.byteLength(request.body.payload),
                        error: 0
                    }
                    response.send(JSON.stringify(answer));
                })
            }
            
        });

        //Load object files from editor
        this.api.post('/api/load', (request, response) =>{
            
            let params = request.body;
            //Request params
            //{
            //"userid": "valid vfs username", // eg pg15student
            //"name": "filename", // name of entity, no spaces, no extension
            //"type": "object" | "level", // one of these two key strings
            //}
            let reply = new Reply( 1, "Don't use data" );

            this._loadFileContent(reply, params)
                .then(newReply => {
                    response.send(reply.ok().serialize());
                })
                .catch(error => []);
            
            
        });

        this.run();
    }

    //Sets server up
    run() {

        this.api.set('port', PORT);
        this.listener = HTTP.createServer( this.api );
        this.listener.listen(PORT);

        this.listener.on('listening', event =>{

            let addr = this.listener.address();
            let bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
            console.log(`Listening on ${bind}`);
        })

        
    }

    //Reads through lkevel folder and returns level names
    _readThroughLevelList(reply){
        return new Promise((resolve, reject) => {
            FileSystem.readdir( `./data`, {withFileTypes: true})
                .then(fileNamelist =>{    
                    fileNamelist.forEach(element => {
                        if(element.name.includes('.json')){
                            let newObj = {
                                name: `${element.name}`.replace(".json", ""),
                                filename: `${element.name}`
                            }
                            this.levelIDs++;
                            reply.addToPayload(newObj);
                        }
                    })
                    resolve(reply);
                })
                .catch(error => {reject(error)});
            })
    }

    //Reads through object folder and returns file names
    _gameObjectList(reply){
        return new Promise((resolve, reject) => {
            FileSystem.readdir( `./data/library`, {withFileTypes: true})
                .then(fileNamelist =>{    
                    fileNamelist.forEach(element => {
                        
                        let newObj = {
                            name: `${element.name}`.replace(".json", ""),
                            filename: `${element.name}`
                        }
                        this.objectIDs++;
                        reply.addToPayload(newObj);
                          
                    })
                    resolve(reply);
                })
                .catch(error => {reject(error)});
            })
    }

    //Loads the content of a file and sends it back, for both levels and objects
    _loadFileContent(reply, params)
    {
        return new Promise( (resolve, reject) =>{
            //open some file, name is in parameters
            let folder = "./data";
            if(params.type == "object"){
                folder += "/library"
            }
            
            FileSystem.readFile( `${folder}/${params.name}`, 'utf8')
                .then(fileData => {
                    //if data is okay, add to reply
                    resolve(reply.payload = fileData);
                })
                .catch(err =>{
                    reject(reply.error(1, "No data found"));
                });
        })
    }

    //TODO: Shoots an error dialog if something went wrong
    _showErrorDialog(error){
        //TODO: build a dialog system for shooting error messages
        console.log(error)
    }
}

const server = new Server();