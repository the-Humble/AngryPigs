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
        //Ideally creates a game object and tells it to populate itself
        /*
            this.gameObjectList = new GameObjectList();
            this.gameObjectList.populate();
        */
        this._populateGameObjectList()
            .then( gameObjects => {
                //build sidebar with gameObjects
                gameObjects.forEach(object =>{
                    let $newEl = $(`<li name="${object}" value="${object.name}"> <div class="obstacle debug" draggable="true"></div>`);
                    $('#object-list').append($newEl);
                });

            })
            .catch(error => {this._showErrorDialog(error)});
        
        
        //Initialize the draggables
        this._handleDraggable();
        //Handle user save events
        this._loadOnLevelChange();
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

                //tempList.level_1 === tempList['level_1']; //true
                this._updateLevelList(levelData);
            });
    }

    _updateLevelList(levelList){
        //TODO: do some jQuery to fill in the level list
        const $optionId = $('#level-list');

        //TODO: <option value = "level_1">Level 1</option>
        levelList.payload.forEach(element => {

            let $newOption = $(`<option value = "${element.filename}">${element.name}</option>`);
            $optionId.append($newOption);
        });
    }

    _populateGameObjectList(){

        return new Promise( (resolve, reject) =>{
            //do some work async
             $.post('/api/get_object_list',{type:'object'})
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
                    $('#obstacles-text').val(`${levelDetails.level.entityLists.collidableList.length}`);
                })
                .catch(error => this._showErrorDialog(error));
            });
            
    }

    _handleDraggable(){
        $('.draggable')
            .on('mouseover', event=>{
                this._onDraggableMouseOver(event);
            })
            .on('dragstart', event => {
                this._onDraggableDragStart(event);

            })
            .on('mouseout', event=>{
                this._onDraggableMouseOut(event);
            });
            
        $('#edit-window')
            .on('click', event => {
                console.log("I'm clicking");
            })
            .on('mousemove', event =>{
                console.log("I'm in");
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

    _onDraggableMouseOver(event){
        //TODO:change cursor
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