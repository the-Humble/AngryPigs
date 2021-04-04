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
        
        
        
        //Initialize the draggables
        this._handleDraggableEdit();

        //Loads first level on startup
        this._loadLevelOnStartup();

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
                let $list = $(`<li name="${object.name}" value="${object.filename}"> </li>`);
                let $el = $(`<div
                                id = "${object.name}" 
                                class="obstacle debug draggable" 
                                style = "width: ${objectDetails.width}px;
                                        height: ${objectDetails.height}px;
                                        background: url(${objectDetails.texture});
                                        margin-top = .5rem;
                                        margin-bottom: .5rem;
                                        background-repeat: no-repeat;
                                        background-size: 100% 100%"
                                draggable="true">
                            </div>`);
                
                let $newEl = this._addObjectData($el, objectDetails);
                $list.append($newEl);
                $('#object-list').append($list);
                this._handleDraggableObject();
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

    _loadLevelOnStartup(){
        $.post('/api/load', {
            userId: "pg20jose",
            name: `level_1.json`,
            type: "level" 
        })
        .then(levelDetails => JSON.parse(levelDetails))
        .then(levelDetails => JSON.parse(levelDetails.payload))
        .then(levelDetails => {
            this._loadSidebar(levelDetails);
            this._loadLevel(levelDetails);
            
        })
        .catch(error => this._showErrorDialog(error));
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
                    this._loadSidebar(levelDetails);
                    this._loadLevel(levelDetails);
                    
                })
                .catch(error => this._showErrorDialog(error));
            });
            
    }

    _loadSidebar(levelDetails){
        $('#name-text').val(`${levelDetails.level.name}`);
        $('#shots-text').val(`${levelDetails.level.ammo}`);
        let filename = `${levelDetails.level.name}`.toLowerCase().replace("-", "_").concat(".json");
        $('#filename-text').val(filename);
    }

    _loadLevel(levelDetails){
        //TODO: Load level itself
        
        $('#edit-window').empty();
        levelDetails.level.entityLists.collidableList.forEach(object => {
            let $newEl = $(`<div 
                            id = "obstacle-${this.objectID}"
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
            $newEl = this._addObjectData($newEl, object.entity);

            $('#edit-window').append($newEl);
            this._handleDraggableObject();
            this.objectID++;
        })

        //TODO: Add cannons and create cannon object
        let cannon = levelDetails.level.catapult;
        let $cannon = $(`<div
                            id= "cannon"
                            class="obstacle debug draggable"
                            style = "position: absolute;
                            top: ${cannon.pos.y}px;
                            left: ${cannon.pos.x}px;
                            width: 200px;
                            height: 200px;
                            background: url(./images/catapult.png);
                            background-repeat: no-repeat;
                            background-size: 100% 100%";
                            draggable="true">
                        </div>`);
        $('#edit-window').append($cannon);
        //TODO: Add Enemies and create enemy object
        
        levelDetails.level.entityLists.targetList.forEach(object => {
            let $newEn = $(`<div 
                            id = "enemy-${this.targetID}"
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
            $newEn = this._addObjectData($newEn, object.entity);
            $('#edit-window').append($newEn);
            this.targetID++;
        })
    }

    _handleDraggableObject(){
        $('.draggable')
            .on('dragstart', event => {
                this._onDraggableDragStart(event);

            })
    }

    _handleDraggableEdit(){
             
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
        let $event = $(`#${event.target.id}`);
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

        //grab offset
        this.$dragTarget = $(event.target);
        
        this.offset.x = event.clientX - Math.floor( event.target.offsetLeft);
        this.offset.y = event.clientY - Math.floor( event.target.offsetTop);
        
        //old z index
        this.z = this.$dragTarget.css("zIndex");
    }

    _onEditWindowMouseMove(event){
        
        this.offset.x = Math.floor( event.target.offsetLeft);
        this.offset.y = Math.floor( event.target.offsetTop);
        $('#info-window').html(`Mouse at: (${event.clientX-this.offset.x}, ${event.clientY-this.offset.y})`);
    }

    _onEditWindowDragOver(event)
    {
        this.$dragTarget = $(event.target);

        this.offset.x = event.clientX - Math.floor( event.target.offsetLeft);
        this.offset.y = event.clientY - Math.floor( event.target.offsetTop);

        //update the css for the drag target
        let left = `${event.clientX-this.offset.x}px`;
        let top = `${event.clientY-this.offset.y}px`;
    }

    _onEditWindowDrop(event){

        this.$dragTarget = $(event.target);

        //get embeded transfer data
        let rawData = event.originalEvent.dataTransfer.getData("text");
        let transferData = JSON.parse(rawData);

        //TODO:attach transferData.gameParams to something
        

        //TODO: create new element in right location
        //FIXME: Procedurally generate ids
        let $el = $(`<div 
                        id="box-${this.objectID++}" 
                        class="draggable" 
                        draggable = "true">
                    </div>`);
        //$('#edit-window').append($el);
        this.$dragTarget.append($el);
        $el.css(this._cssFrom(this.$dragTarget.css('left'), this.$dragTarget.css('top')));
    }

    _handleSaveEvents(){
        $('#save-button').on('click', event=>{
            let level = new Request($('#filename-text').val(), "level");
            let levelPayload = new Level($('#name-text').val(), parseInt($('#shots-text').val()));
            let levelDetails =  levelPayload.__private__.level;
            //https://stackoverflow.com/questions/3024391/how-do-i-iterate-through-children-elements-of-a-div-using-jquery
            
            //save general info
            //Save cannon
            $('#edit-window').children().each(function (){
                
                if(`${$(this).attr('id')}`.includes("cannon"))
                {
                    levelDetails.catapult.pos.x = this.offsetLeft;
                    levelDetails.catapult.pos.y = this.offsetTop;
                }
                
                if(`${$(this).attr('id')}`.includes("obstacle"))
                {
                    levelPayload._appendObjectToList($(this), this.offsetLeft, this.offsetTop);
                }

                if(`${$(this).attr('id')}`.includes("enemy"))
                {
                    levelPayload._appendEnemyToList($(this), this.offsetLeft, this.offsetTop);
                }
                
            })

            level.payload = levelPayload;

            //save objects

            //save tragets

            $.post('/api/save', level.serialize())
            .then();
        });

        $('create-object-button').on('click', event=>{

            let object = new Request($('#object-name-text').text(), "object")
            
            $.post('/api/save', level.serialize())
            .then();
        })
    }
}