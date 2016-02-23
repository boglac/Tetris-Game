// initialize PIXI and some game's functionalities
var init = function(){
   
    // Initialize global Game object.
    var Tetris = new Game;

    // create an new instance of a pixi stage
    Tetris.setStage(new PIXI.Stage(0xFFFFFF));

    // create a renderer instance
    // use canvas renderer on Chrome due to cross-origin
    if (isChrome) 
        Tetris.setRenderer(new PIXI.CanvasRenderer(
            config.SCR_WIDTH,
            config.SCR_HEIGHT,
            {view:document.getElementById("game-canvas")}
        ));
    else
        Tetris.setRenderer(PIXI.autoDetectRenderer(
            config.SCR_WIDTH,
            config.SCR_HEIGHT,
            {view:document.getElementById("game-canvas")}
        ));

    // create graphics component
    Tetris.setGraphics(new PIXI.Graphics());

    try {
        // prepare and launch the game
        Tetris.prepareGame();
    } catch (e) {
        console.log('Exception caught:');
        console.log('--> ', e, ' <--');
        console.log('Quitting game');
        return;
    }

    // add the renderer view element to the DOM
    document.body.appendChild(Tetris.getRenderer().view);

    requestAnimationFrame(update);
    Tetris.render();

    function update() {

        setTimeout(function(){
            requestAnimationFrame(update);
            Tetris.render();
        }, 1000 / config.FPS);

    }

    // handle input
    window.addEventListener('keydown', function(event){
        Tetris.processKeyDown(event.keyCode);
    }, false);

    window.addEventListener('keyup', function(event){
        Tetris.processKeyUp(event.keyCode);
    }, false);

}