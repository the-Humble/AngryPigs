//Copyright (C) 2021 Jose Ignacio Ferrer Vera and Ana Carolina Arellano
'use strict';

import World from "./World.js";

export default class Game{

    constructor(levelname){
        this.lastUpdate = 0;
        //set initial state
        this.gameState = Game.STATE.SPLASH;
        //build world model
        this.world = new World($('#game-area'), levelname);
        //win/lose
        this.gameOver = false;
        this.win = false;

        $('#game-window')
            //Handles events when the mouse gets over the editor window
            .on('mousemove', event =>{
                event.preventDefault();
                this._onEditWindowMouseMove(event);
            })
    }

    static get STATE() {
        //GameState
        return{
            SPLASH:0,
            LOADING:1,
            GAME: 2,
            RESULTS:3,
        }
        //Use check(Game.STATE.LOADING)
   }

   //update each frame
    update( dt ) {
       
        if (this.gameState == Game.STATE.SPLASH)
        {
            this.gameState = Game.STATE.GAME;
            return;
        }
       //update the world
       if(this.gameState == Game.STATE.GAME) {
           this.world.update(dt); 
       }
       
       if(this.world.gameOver){
           this.gameState = Game.STATE.RESULTS;
       }
    }

    //render world items on given frame
    render( dt ) {

        if(this.gameState == Game.STATE.GAME) {
           this.world.render(dt); 
       }
   }

    //manage time of game / frames
    run( timestep = 0 ) {

        let dt = timestep - this.lastUpdate;
        this.lastUpdate=timestep;

        this.update( dt );
        this.render( dt );

        window.requestAnimationFrame( timestep => this.run( timestep / 100 ));
    }

    //Shoiws position of mouse in editor window
    _onEditWindowMouseMove(event){
        
        let x = Math.floor( event.target.offsetLeft);
        let y = Math.floor( event.target.offsetTop);
        $('#info-window').html(`Mouse at: (${event.clientX-320}, ${event.clientY-114})`);
    }
}