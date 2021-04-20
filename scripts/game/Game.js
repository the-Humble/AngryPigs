//Copyright (C) Jose Ignacio Ferrer Vera
'use strict';

import World from "./World.js";

export default class Game{

    constructor(levelname){
        this.lastUpdate = 0;
        this.gameState = Game.STATE.SPLASH;
        this.world = new World($('#game-area'));
        //load the level
        //build world model
        //set up event handlers for user
            //aim cannon
            //fire cannon
            //win/lose
        this.gameOver = false;
        this.win = false;
        //start listening

        $('#game-window')
            //Handles events when the mouse gets over the editor window
            .on('mousemove', event =>{
                event.preventDefault();
                this._onEditWindowMouseMove(event);
            })
    }

    //
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

    update( dt ) {
       
        if (this.gameState != Game.STATE.GAME)
        {
            this.gameState = Game.STATE.GAME;
            return;
        }
        //update special things

       //update the world
       this.world.update(dt);       
    }

    render( dt ) {
        this.world.render(dt);
   }

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