// Copyright (c) 2021 Jose Ignacio Ferrer Vera
'use strict';

import Express from 'express';
import Path from 'path';
import HTTP from 'http';
const __dirname = Path.resolve();

const PORT = 3000;

class Server {

    constructor() {
        this.api = Express();
        this.api.use( Express.json())
                .use( Express.urlencoded( { extended: false }))
                .use( Express.static( Path.join(__dirname, '.')));
        
        //Get home page (index.html)
        this.api.get('/', (request, response) =>{

            response.sendFile('./index.html', {title:'AngryPigs'});
        });

        this.api.get('/editor', (request, response) =>{

            let indexFile = `${Path.join(__dirname, './')}editor.html`;
            response.sendFile(indexFile, {title:`${this.title} Editor`});
        });

        this.api.post('/api', (request, reponse) =>{
            
            let assert = true;
            let params = request.params;
            let query = request.query;
            let data = request.body;
        });

        this.run();
    }

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
}

const server = new Server();