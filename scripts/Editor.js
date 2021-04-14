//Copyright (C) 2021 Jose Ignacio Ferrer Vera
'use strict';
import Request from './Request.js';
import Level from './Level.js';

export default class Editor {
    
    constructor() {
        
        //setUp fields to hold data
        this.existingObjectId = 0;
        this.offset = {
            x:0,
            y:0
        };

        this.$dragTarget;

        this.objectID = 0;
        this.targetID = 0;

        //Set the level itself on the DOM
        this.gameObjectList=[];

        //fetch list of levels
        this._populateLevelList();

        //fetch list of gameObjects
        this._populateGameObjectList()
            .then( gameObjects => {
                //build sidebar with gameObjects
                this._generateObject(gameObjects);

            })
            .catch(error => {this._showErrorDialog(error)});

        //Loads first level on startup
        this._loadLevelOnStartup();

        //Handle DragEvents
        this._handleEventListeners();

        //Handle user save events
        //Load level characteristics on sidebar
        this._loadOnLevelChange();

        //Save level
        this._handleSaveEvents();

    }


    run(){

    }

    _showErrorDialog(error){
        //TODO: build a dialog system for shooting error messages

    }

    _populateLevelList(){
        //post a message to the server
        $.post('/api/get_level_list', {
            userId: "pg20jose",
            type: "level"
            })
            .then(levelData =>JSON.parse(levelData))
            .then( levelData => {
                //populate the pulldown in the form
                this._updateLevelList(levelData);
            });
    }

    //Updates the level list at the top left of the screen
    _updateLevelList(levelList){

        //Calls the level list option selector
        const $optionId = $('#level-list');
        
        //Empties it out before building it again
        $optionId.empty();

        //Adds an element to the list for every existing level
        levelList.payload.forEach(element => {

            let $newOption = $(`<option value = "${element.filename}">${element.name}</option>`);
            $optionId.append($newOption);
        });
    }

    //Gathers the object list based on all the objects that exist
    _populateGameObjectList(){

        return new Promise( (resolve, reject) =>{
            //Gets object list async
             $.post('/api/get_object_list',{
                userId: "pg20jose",
                type: "object"
                    })
                .then(objectList => JSON.parse(objectList))
                .then(objectList=> {
                    //if succesful resolve(data)
                    resolve(objectList);
                })
                .catch(error => {
                    //if unsuccesful = reject(error)
                    reject(error)
                })
        });
    }

    //Gives the object its properties correctly and adds it to the object list
    _generateObject(gameObjects){

        //Empties the list to fully rebuild
        $('#object-list').empty();

        //For every object received in the response, create an object for the sidebar
        gameObjects.payload.forEach(object =>{
            //Gets object data from the files and attach it to the objects in the sidebar
            this._loadObject(object)
            //Parses object data
            .then(objectDetails => JSON.parse(objectDetails.payload)) 
            .then(objectDetails=> {

                //Creates object in sidebar
                let $list = $(`<li name="${object.name}" value="${object.filename}"> </li>`);
                let $el = $(`<div
                                id = "${object.name}"
                                class="debug draggable" 
                                style = "width: ${objectDetails.width}px;
                                        height: ${objectDetails.height}px;
                                        background: url(${objectDetails.texture});
                                        margin-top = .5rem;
                                        margin-bottom: .5rem;
                                        background-repeat: no-repeat;
                                        background-size: 100% 100%"
                                draggable="true">
                            </div>`);
                
                //Ads jquery data to the object 
                let $newEl = this._addObjectData($el, objectDetails);
                
                //Makes the object draggable
                this._isDraggable($newEl);

                //Appends object to the list object
                $list.append($newEl);

                //appends list object to list
                $('#object-list').append($list);
            })
            .catch(err => this._showErrorDialog(err));
        })
    }

    //Loads Object data into a javascript onbject 
    _loadObject(object){
        return new Promise((resolve, reject) => {
            $.post('/api/load', {
                userId: "pg20jose",
                name: `${object.filename}`,
                type: "object" 
            })
            .then(objectDetails => JSON.parse(objectDetails))
                .then(objectDetails=> {
                    //if succesful resolve(data)
                    resolve(objectDetails);
                })
                .catch(error => {
                    //if unsuccesful = reject(error)
                    reject(error)
                })
        })
    }

    //Adds object data as JQuery attributes to the object
    _addObjectData($el, objectDetails){
        $el.attr("type", objectDetails.type);
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

    //Loads level 1 on startup of the app (requires first level being called level_1.json)
    _loadLevelOnStartup(){
        $.post('/api/load', {
            userId: "pg20jose",
            name: `level_1.json`,
            type: "level" 
        })
        .then(levelDetails => JSON.parse(levelDetails))
        .then(levelDetails => JSON.parse(levelDetails.payload))
        .then(levelDetails => {
            //Loads level sidebar in with appropriate data
            this._loadSidebar(levelDetails);
            //Loads level using the level details
            this._loadLevel(levelDetails);
            
        })
        .catch(error => this._showErrorDialog(error));
    }

    //Makes Sure a new level is loaded when it is selected
    _loadOnLevelChange(){
        //Gathers level data from server
        $('#level-list')
            .on('change', event =>{
                $.post('/api/load', {
                    userId: "pg20jose",
                    name: `${event.target.value}`,
                    type: "level" 
                })
                .then(levelDetails => JSON.parse(levelDetails))
                .then(levelDetails => JSON.parse(levelDetails.payload))
                .then(levelDetails => {
                    //Loads sidebar
                    this._loadSidebar(levelDetails);
                    //Loads level
                    this._loadLevel(levelDetails);
                    
                })
                //Sends an error
                .catch(error => this._showErrorDialog(error));
            });
            
    }

    //Loads level information into the sidebar textfields
    _loadSidebar(levelDetails){
        $('#name-text').val(`${levelDetails.level.name}`);
        $('#shots-text').val(`${levelDetails.level.ammo}`);
        let filename = `${levelDetails.level.name}`.toLowerCase().replace("-", "_").concat(".json");
        $('#filename-text').val(filename);
    }

    _loadLevel(levelDetails){
        //Load level itself
        //Empties previously loaded level
        $('#edit-window').empty();
        this.objectID=0;
        this.targetID=0;
        //Creates obstacles in edit window
        levelDetails.level.entityLists.collidableList.forEach(object => {
            let $newEl = $(`<div 
                            id = "obstacle-${this.objectID++}"
                            class="obstacle debug draggable" 
                            style = "position: absolute;
                                    top: ${object.pos.y}px;
                                    left: ${object.pos.x}px;
                                    width: ${object.entity.width}px;
                                    height: ${object.entity.height}px;
                                    background: url(${object.entity.texture});
                                    background-repeat: no-repeat;
                                    background-size: 100% 100%"
                            draggable="true">
                            </div>`);

             //Adds object data to the object themselves               
            $newEl = this._addObjectData($newEl, object.entity);

            //Appends objects to the window
            $('#edit-window').append($newEl);
            //Makes object draggable
            this._isDraggable($newEl);
            $newEl.on('contextmenu', event=>{
                event.preventDefault();
                let $target = $(event.target);
                $target.remove();

            })
            
        })

        //Add cannons and create cannon object
        let cannon = levelDetails.level.catapult;
        let $cannon = $(`<div
                            id= "cannon"
                            class="cannon debug"
                            style = "position: absolute;
                            top: ${cannon.pos.y}px;
                            left: ${cannon.pos.x}px;
                            width: 200px;
                            height: 200px;
                            background: url(./images/catapult.png);
                            background-repeat: no-repeat;
                            background-size: 100% 100%;
                            transform: scaleX(-1);">
                        </div>`);
    
        //Adds cannon to editor object
        $('#edit-window').append($cannon);
        
        
        //Add Enemies and create enemy object
        levelDetails.level.entityLists.targetList.forEach(object => {
            let $newEn = $(`<div 
                            id = "enemy-${this.targetID++}"
                            class="enemy debug draggable" 
                            style = "position: absolute;
                                    top: ${object.pos.y}px;
                                    left: ${object.pos.x}px;
                                    width: ${object.entity.width}px;
                                    height: ${object.entity.height}px;
                                    background: url(${object.entity.texture});
                                    background-repeat: no-repeat;
                                    background-size: 100% 100%"
                            draggable="true">
                            </div>`)

            //Adds enemy data to the enemies
            $newEn = this._addObjectData($newEn, object.entity);
            
            //Appends object to edit window
            $('#edit-window').append($newEn);
            //Makes the objects draggable
            this._isDraggable($newEn);

            //Makes object deletable on rightClick
            $newEn.on('contextmenu', event=>{
                event.preventDefault();
                let $target = $(event.target);
                $target.remove();

            })
        })
    }

    //Makes the event listener on the editor
    _handleEventListeners(){      

        $('#edit-window')
            //Handles events when the mouse gets over the editor window
            .on('mousemove', event =>{
                event.preventDefault();
                this._onEditWindowMouseMove(event);
            })
            //Whenever a drag event is called on top of the editor
            .on('dragover', event=>{
                event.preventDefault();
            })

            //Whenever a drag event is ended on top of the editor, create an object in the location
            .on('drop', event=>{
                this.$dragTarget = $(event.target);
                
                //get embeded transfer data
                let rawData = event.originalEvent.dataTransfer.getData("text");
                let transferData = JSON.parse(rawData);

                //Check location of the drop
                this.offset.x = event.clientX - Math.floor( event.target.offsetLeft);
                this.offset.y = event.clientY - Math.floor( event.target.offsetTop);

                //Get transferData of the object to determine the type of object it is and how to render and categorize
                if(transferData.targetId.includes('enemy')){
                    let $newEn = $(`<div 
                            id = "enemy-${this.targetID++}"
                            class="enemy debug draggable" 
                            style = "position: absolute;
                                    top: ${this.offset.y}px;
                                    left: ${this.offset.x}px;
                                    width: ${transferData.gameParams.width}px;
                                    height: ${transferData.gameParams.height}px;
                                    background: url(${transferData.gameParams.texture});
                                    background-repeat: no-repeat;
                                    background-size: 100% 100%"
                            draggable="true">
                            </div>`)        
                    $newEn = this._addObjectData($newEn, transferData.gameParams);
                    $('#edit-window').append($newEn);
                    this._isDraggable($newEn);
                    $newEn.on('contextmenu', event=>{
                        event.preventDefault();
                        let $target = $(event.target);
                        $target.remove();

                    })
                }
                else{
                    //create new element in right location
                    let $newEl = $(`<div 
                            id = "obstacle-${this.objectID++}"
                            class="obstacle debug draggable" 
                            style = "position: absolute;
                                    top: ${this.offset.y}px;
                                    left: ${this.offset.x}px;
                                    width: ${transferData.gameParams.width}px;
                                    height: ${transferData.gameParams.height}px;
                                    background: url(${transferData.gameParams.texture});
                                    background-repeat: no-repeat;
                                    background-size: 100% 100%"
                            draggable="true">
                            </div>`);
                    //$('#edit-window').append($el);
                    $newEl = this._addObjectData($newEl, transferData.gameParams);
                    
                    this.$dragTarget.append($newEl);
                    this._isDraggable($newEl);
                    $newEl.on('contextmenu', event=>{
                        event.preventDefault();
                        let $target = $(event.target);
                        $target.remove();

                    })
                }
                
            });
    }


    //Makes objects draggable
    _isDraggable($newEl){
        $newEl.on('dragstart', event => {
            let $event = $(`#${event.target.id}`);
            //Adds transfer data to the object for whenever an event is called on it
            let transferData = {
                targetId : event.target.id,
                gameParams: {
                    type: `${$event.attr('type')}`,
                    name: `${$event.attr('name')}`,
                    height: `${$event.attr('height')}`,
                    width: `${$event.attr('width')}`,
                    texture: `${$event.attr('texture')}`,
                    shape: `${$event.attr('shape')}`,
                    friction: `${$event.attr('friction')}`,
                    mass: `${$event.attr('mass')}`,
                    restitution: `${$event.attr('restitution')}`
                }
            };

            //Attach transfer data
            event.originalEvent.dataTransfer.setData("text", JSON.stringify(transferData));
            event.originalEvent.dataTransfer.effectAllowed = "move";

        })
        
    }


    //Shoiws position of mouse in editor window
    _onEditWindowMouseMove(event){
        
        this.offset.x = Math.floor( event.target.offsetLeft);
        this.offset.y = Math.floor( event.target.offsetTop);
        $('#info-window').html(`Mouse at: (${event.clientX-this.offset.x}, ${event.clientY-this.offset.y})`);
    }

    //Makes it so that the positions of the objects are saved into the specified file, creating a new one if necessary
    _handleSaveEvents(){
        $('#save-button').on('click', event=>{
            let level = new Request($('#filename-text').val(), "level");
            let levelPayload = new Level($('#name-text').val(), parseInt($('#shots-text').val()));
            let levelDetails =  levelPayload.info.level;
            //https://stackoverflow.com/questions/3024391/how-do-i-iterate-through-children-elements-of-a-div-using-jquery
            
            //save general info
            //Save cannon
            $('#edit-window').children().each(function (){
                
                if(`${$(this).attr('id')}`.includes("cannon"))
                {
                    levelDetails.catapult.pos.x = this.offsetLeft;
                    levelDetails.catapult.pos.y = this.offsetTop;
                }
                
                //Append every single object to the object list
                if(`${$(this).attr('id')}`.includes("obstacle"))
                {
                    levelPayload._appendObjectToList($(this), this.offsetLeft, this.offsetTop);
                }

                //Append enemies to the target list
                if(`${$(this).attr('id')}`.includes("enemy"))
                {
                    levelPayload._appendEnemyToList($(this), this.offsetLeft, this.offsetTop);
                }
                
            })

            //Make file a string to be readable
            level.payload = levelPayload.serialize();

            $.post('/api/save', level.request)
            .then(answer => JSON.parse(answer))
            .then(answer=>{
                this._populateLevelList();
            });
        });

        //Creates an object based on the daa
        $('#create-object-button').on('click', event=>{
            let name = `${$('#object-name-text').val().toLowerCase().replace(" ", "_")}.json`
            let object = new Request(name, "object")
            
            //Add object details to the file to save
            let objectDetails = {
                type: `${$('#object-type-text').val()}`,
                name: `${$('#object-name-text').val()}`,
                height: `${$('#object-height-text').val()}`,
                width: `${$('#object-width-text').val()}`,
                texture: `${$('#object-texture-text').val()}`,
                shape: `${$('#object-shape-text').val()}`,
                friction: `${$('#object-friction-text').val()}`,
                mass: `${$('#object-mass-text').val()}`,
                restitution: `${$('#object-restitution-text').val()}`
            }

            object.payload = JSON.stringify(objectDetails);

            //Send string to the server for it to be saved as a file
            $.post('/api/save', object.request)
            .then(answer => JSON.parse(answer))
            .then(answer=>{
                this._populateGameObjectList()
                .then( gameObjects => {
                    //build sidebar with gameObjects
                    this._generateObject(gameObjects);

                })
                .catch(error => {this._showErrorDialog(error)});
            });
        })
    }
}