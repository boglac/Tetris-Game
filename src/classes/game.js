/*
    Game class
    Fulfils a role of a governor: initializes components, gathers other objects taking part in the game,
    gives tasks, checks for their results and reacts to them properly. If game behaviour is to be changed,
    this is the only class that needs to be modified.
    
    >> Implementation notice:
    Instance of this class is the only object needed to initialize and start a game; because of it's role and scope
    this class is highly protected (only private properties). All other objects in this implementation are available
    only through this class (or it's children), thus are also secured.
*/
function Game(){

    var that = this;

    // -------------------------------------------
    //  Private properites
    // -------------------------------------------
    // objects delivered by PIXI component
    var _PIXI = {
        stage: null,
        renderer: null,
        graphics: null
    }

    // Scene class object; represents game area and handles it's behaviour
    var _scene;

    // Generator class object; used to spawn blocks
    var _generator;

    // keeps record of a state game is currently in
    var _state;

    // enablse / disables user input
    var _inputAvailable;
    
    var _sprites;

    // -------------------------------------------
    //  Private methods
    // -------------------------------------------
    var _initGame = function() {

        this.inputAvailable = false;
        _state = GameState.INIT;

        _scene = new Scene;
        _scene.init(config.GRID_COLS, config.GRID_ROWS);
        _scene.setParams(config.GRID_COLOR, config.FIELD_DISPLAY_SIZE, config.DRAW_START);
        
        // create Graphics objects to handle drawing
        _scene.graphics = _PIXI.graphics;

        // perform some initializations
        _generator = new Generator;
                
        // draw empty scene
        _scene.clear();

        _PIXI.stage.addChild(_PIXI.graphics);

        _setImages();

        // the game is ready - spawn first block
        _state = GameState.SPAWN;
        
    }

    // loads sprites from pre-loaded resources and places them on screen,
    // at positions given in config object
    var _setImages = function(){

        _sprites = [];

        var sprite, assets = config.ASSETS;
        for (p in assets) {

            sprite = new PIXI.Sprite(PIXI.loader.resources[assets[p][0]].texture);
            _sprites.push(sprite);

            // center the sprites anchor point
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            
            sprite.position.set(assets[p][2], assets[p][3] - sprite.height / 2);
            _PIXI.stage.addChild(sprite);

        }

    }

    // reacts to _scene.moveBlock result, which gives info about
    // current game state (blocks colliding, row to clear, etc)
    var _handleResult = function(e){
        switch(e.result){
            case MoveResult.COLLISION:
                _state = GameState.SPAWN;
            break;

            case MoveResult.CLEAR:
                _scene.clearRows(e.data);
                _state = GameState.CLEAR;
            break;

            case MoveResult.ENDGAME:
                _state = GameState.END;
            break;
        }
    }
    
    // -------------------------------------------
    //  Privileged functions
    // -------------------------------------------
    // performs some preparations, like assets loading (if any)
    this.prepareGame = function(images){

        if (!_PIXI.stage || !_PIXI.renderer || !_PIXI.graphics)
            throw "PIXI components not initialized. Make sure setRenderer, setStage and setGrapchis were called for Game object."

        var loader = PIXI.loader;

        var assets = config.ASSETS;
        for (p in assets)
            loader.add(assets[p][0], assets[p][1]);
        
        //for (var i = 0; i < assets.length; i++)
          //  loader.add(assets[i][0], assets[i][1])

        loader.once('complete', _initGame);

        loader.load(); 

    }

    // stage setter
    this.setStage = function(arg){
        _PIXI.stage = arg;
    }

    // renderer setter and getter
    this.setRenderer = function(arg){
        _PIXI.renderer = arg;
    }

    this.getRenderer = function(){
        return _PIXI.renderer;
    }
    
    // graphics setter
    this.setGraphics = function(arg){
        _PIXI.graphics = arg;
    }

    // renders current state of the game
    this.render = function(){
        _PIXI.renderer.render(_PIXI.stage);
        that.update();
    }

    // update game, called on every game tick
    this.update = function(){

        switch (_state) {
            case GameState.SPAWN:
                _inputAvailable = false;

                // set generator to random position
                _generator.setPosition(
                    Math.floor( Math.random() * (config.GRID_COLS - config.MAX_SHAPE_SIZE) ),
                    -3
                );

                // spawn new block
                _scene.block = _generator.spawnBlock();

                _state = GameState.GAME;
            break;

            case GameState.GAME:
                _scene.clear();
                _scene.displayBlock();

                _inputAvailable = true;

                var result = _scene.moveBlock();
                _handleResult(result);
            break;
            
            case GameState.CLEAR:
                _inputAvailable = false;

                // make some hang on row clear, so it's noticed by user
                setTimeout(function(){
                    _state = GameState.SPAWN;
                }, 300);
            break;

            case GameState.END:
                _inputAvailable = false

                setTimeout(function(){
                    _scene.restart();
                    _state = GameState.SPAWN;
                }, 800);
            break;
        }

    }

    // Handle user's input.
    this.processKeyDown = function(key){

        if (!_inputAvailable) return;

        switch (key) {
            case KeyCodes.LEFT:
                _scene.moveBlockLeft();
            break;

            case KeyCodes.UP:
                _scene.rotateBlockRight();
            break;

            case KeyCodes.RIGHT:
                _scene.moveBlockRight();
            break;

            case KeyCodes.DOWN:
                _scene.accelerateBlock();
            break;
        }

    }

    this.processKeyUp = function(key){
        if (!_inputAvailable) return;

        if (key === KeyCodes.DOWN)
            _scene.slowDownBlock();
    }

};