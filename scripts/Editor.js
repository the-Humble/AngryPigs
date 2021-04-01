//Copyright (C) 2021 Jose Ignacio Ferrer Vera
'use strict';

export default class Editor {
    
    constructor() {
        
        //setUp fields to hold data
        this.existingObjectId = 0;
        this.offset = {
            x:0,
            y:0
        };

        this.$dragTarget;

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
        
        
        
        //Initialize the draggables
        this._handleDraggable();

        //Handle user save events
        //Load level characteristics on sidebar
        this._loadOnLevelChange();

        //Save level


        //Load Level on editor

        
    }


    run(){

    }

    _showErrorDialog(error){
        //TODO: build a dialog system for shooting error messages

    }

    _populateLevelList(){
        //post a message to the server
        //TODO: get the user's username
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

    _updateLevelList(levelList){
        const $optionId = $('#level-list');

        levelList.payload.forEach(element => {

            let $newOption = $(`<option value = "${element.filename}">${element.name}</option>`);
            $optionId.append($newOption);
        });
    }

    _populateGameObjectList(){

        return new Promise( (resolve, reject) =>{
            //do some work async
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

    _generateObject(gameObjects){
        gameObjects.payload.forEach(object =>{
            this._loadObject(object)
            .then(objectDetails => JSON.parse(objectDetails.payload)) 
            .then(objectDetails=> {
                let $newEl = $(`<li name="${object.name}" value="${object.filename}"> 
                                <div 
                                    class="obstacle debug draggable" 
                                    style = "width: ${objectDetails.width}px;
                                            height: ${objectDetails.height}px;
                                            background: url(${objectDetails.texture});
                                            margin-top = .5rem;
                                            margin-bottom: .5rem;
                                            background-repeat: no-repeat;
                                            background-size: 100% 100%"
                                    draggable="true">
                                </div>
                                </li>`);
                $('#object-list').append($newEl);
            })
            
        });
    }

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

    _loadOnLevelChange(){
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
                    //TODO: Handle level details
                    this._loadSidebar(levelDetails);
                    this._loadLevel(levelDetails);
                    
                })
                .catch(error => this._showErrorDialog(error));
            });
            
    }

    _loadSidebar(levelDetails){
        $('#obstacles-text').val(`${levelDetails.level.entityLists.collidableList.length}`);
        $('#cannons-text').val(`${levelDetails.level.catapult.length}`);
        $('#shots-text').val(`${levelDetails.level.ammo}`);
    }

    _loadLevel(levelDetails){
        //TODO: Load level itself
        $('#edit-window').empty();
        let idCounter = 0;
        levelDetails.level.entityLists.collidableList.forEach(object => {
            let $newEl = $(`<div 
                            id = "obstacle-${idCounter}"
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
                            </div>`)

            $('#edit-window').append($newEl);
            idCounter++;
        })
    }

    _handleDraggable(){
        $('.draggable')
            .on('dragstart', event => {
                this._onDraggableDragStart(event);

            })
            
        $('#edit-window')
            .on('mousemove', event =>{
                event.preventDefault();
                this._onEditWindowMouseMove(event);
            })
            .on('dragover', event=>{
                event.preventDefault();
                this._onEditWindowDragOver(event);
            })
            .on('drop', event=>{
                event.preventDefault();
                this._onEditWindowDrop(event);
            });
    }

    _cssFrom (left, top){
        return {
            position: "absolute",
            margin: "0px",
            left: left,
            top: top
        };
    }

    _onDraggableDragStart(event){
        let transferData = {
            targetId : event.target.id,
            gameParams: {}
        };

        //Attach transfer data
        event.originalEvent.dataTransfer.setData("text", JSON.stringify(transferData));
        event.originalEvent.dataTransfer.effectAllowed = "move";

        //grab offset
        this.$dragTarget = $(event.target);
        
        this.offset.x = event.clientX = Math.floor( event.target.offsetLeft);
        this.offset.y = event.clientY = Math.floor( event.target.offsetTop);
        
        //old z index
        this.z = this.$dragTarget.css("zIndex");
    }

    _onDraggableMouseOut(event){
        //TODO: change cursor back
    }

    _onEditWindowMouseMove(event){
        
        this.offset.x = Math.floor( event.target.offsetLeft);
        this.offset.y = Math.floor( event.target.offsetTop);
        $('#info-window').html(`Mouse at: (${event.clientX-this.offset.x}, ${event.clientY-this.offset.y})`);
    }

    _onEditWindowDragOver(event)
    {
        this.$dragTarget = $(event.target);

        this.offset.x = event.clientX = Math.floor( event.target.offsetLeft);
        this.offset.y = event.clientY = Math.floor( event.target.offsetTop);

        //update the css for the drag target
        let left = `${event.clientX-this.offset.x}px`;
        let top = `${event.clientY-this.offset.y}px`;

        let $el = $(`<div id="box-${this.existingObjectId++}" ></div>`);
        this.$dragTarget.append($el);
        $el.css(this._cssFrom(left, top));
    }

    _onEditWindowDrop(event){

        this.$dragTarget = $(event.target);

        //get embeded transfer data
        let rawData = event.originalEvent.dataTransfer.getData("text");
        let transferData = JSON.parse(rawData);

        //TODO:attach transferData.gameParams to something
        

        //TODO: create new element in right location
        //FIXME: Procedurally generate ids
        //let $el = $(`<div id="box-${id}" class="${} draggable" draggable = "true"></div>`);
        //$('#edit-window').append($el);

        $el.css(this._cssFrom(this.$dragTarget.css('left'), this.$dragTarget.css('top')));
    }
}