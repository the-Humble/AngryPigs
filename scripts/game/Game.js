//Copyright (C) Jose Ignacio Ferrer Vera
'use strict';

export default class Game{

    constructor(){
        this.gameState = Game.STATE.SPLASH
        //load the level
        //build world model
        //set up event handlers for user
            //aim cannon
            //fire cannon
            //win/lose

        //start listening
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

    update( dt ) {
       
        if (this.gameState != Game.STATE.GAME)
        {
            return;
        }
        //update special things

       //update the world
    }

    render( dt ) {

   }

    run( dt ){
       this.update(dt);
       this.render(dt);

       window.requestAnimationFrame(dt=>{this.run(dt)});
   }
}