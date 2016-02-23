/*
    Scene class
    Represents visual and abstract layers of a game scene: an area, where events take place.
    
    >> Implementation notice:
    Scene is governed by Game class instance and doesn't know of it's existance. Scene can
    perform some actions on it's children (grid and block being the most important ones)
    and return results of these action to governing object. Game then decides what to do.
*/
function Scene() {
    
    // a two-dimensional array; represents a game area; 
    // keeps record of currently active block and remembers, where other blocks have landed    
    this.grid;

    // stores coordinates on the grid that are currently in TEMPORARY state
    // (which means that a block is located there); introduced for optimization's purposes
    this.temporary;

    // scene parameters
    this.params;

    // Block class object;
    // a currently active block; passed to Scene by governing Game object
    this.block;

    // PIXI's graphics component handler; passed to a scene by it's parent Game object
    this.graphics;

}

// initialize scene's grid
Scene.prototype.init = function(numOfCols, numOfRows) {

    this.params = {};

    // store size    
    this.params.cols = numOfCols;
    this.params.rows = numOfRows;

    // allocate grid
    this.grid = new Array(numOfCols);
    for (var i = 0; i < numOfCols; ++i)
        this.grid[i] = new Array(numOfRows);

    // initialize grid
    for (var cols = 0; cols < numOfCols; ++cols)
        for (var rows = 0; rows < numOfRows; ++rows)
            this.grid[cols][rows] = {status: 0, color: 0};

    temporary = [];

}

// set scene parameters
Scene.prototype.setParams = function(sceneColor, fieldSize, drawStart){

    // scene color (background)
    this.params.color = sceneColor;

    // size of a single field in pixels
    this.params.fieldSizePX = fieldSize;

    // where to start drawing grid on screen
    this.params.drawStart = drawStart;
}

/*
    Redraws scene.
*/
Scene.prototype.clear = function(){

    this.graphics.clear();

    var cols = this.params.cols,
        rows = this.params.rows,
        fieldSize = this.params.fieldSizePX;

    // draw background
    this.graphics.beginFill(this.params.color);
    this.graphics.lineStyle(1, 0xFFFFFF);
    this.graphics.drawRect(this.params.drawStart, 0, fieldSize * cols, fieldSize * rows);
    this.graphics.endFill();

    // draw occupied fields
    for (var col = 0; col < cols; ++col)
        for (var row = 0; row < rows; ++row)
            if (this.grid[col][row].status === SquareStatus.FIXED) {
                this.graphics.beginFill(this.grid[col][row].color + 0x222222);
                this.graphics.lineStyle(2, 0x000000);
                this.graphics.drawRect(this.params.drawStart + col * fieldSize, row * fieldSize, fieldSize, fieldSize);
                this.graphics.endFill();
            }
}

/*
    Resets the game area.
*/
Scene.prototype.restart = function(){

    var cols = this.params.cols,
        rows = this.params.rows,
        fieldSize = this.params.fieldSizePX;

    // clear area on screen
    this.graphics.beginFill(0xFFFFFF);
    this.graphics.drawRect(this.params.drawStart, 0, fieldSize * cols, fieldSize * rows);
    this.graphics.endFill();
    
    // reset arrays
    this.temporary = [];
    
    for (var col = 0; col < cols; ++col)
       for (var row = 0; row < rows; ++row)
           this.grid[col][row] = {status: 0, color: 0};

}

/*
    Clears rows received as an array of their positions numbers.
*/
Scene.prototype.clearRows = function(rows){

    var toClear,
        offset = rows.length,
        fieldSize = this.params.fieldSizePX;

    // make sure, that the last element in array is the lowest row
    rows = rows.sort();
    var lowest = rows[rows.length - 1];

    this.graphics.beginFill(0xBBFFDD);
    this.graphics.lineStyle(2, 0x444444);

    // mark rows being removed
    this.graphics.drawRect(this.params.drawStart,
        (lowest - offset + 1) * fieldSize,
        fieldSize * this.params.cols,
        offset * fieldSize
    );

    // alter grid status
    for (var col = 0; col < this.params.cols; ++col){

        for (var row = lowest; row > offset; --row){
            this.grid[col][row].status = this.grid[col][row-offset].status;
            this.grid[col][row].color = this.grid[col][row-offset].color;
        }

    }

    this.graphics.endFill();

}

/*
    Attempts to move a block. Returns MoveResult and - if necessary - additional data.
*/
Scene.prototype.moveBlock = function(){

    // before moving a block - check, if it can be moved
    var canMove = true, len = this.temporary.length, collisionRow = 1;

    // check for collision with bottom
    if (this.block.position.y + this.block.shape.lowest + 1 >= this.params.rows)
        canMove = false;
        
    // check for collision with FIXED squares, but only if a block is not at the bottom
    // so that checking grid on [][temporary[i].row + 1] position is safe
    if (canMove)
        for (var i = 0; i < len; ++i)
            if (this.grid[this.temporary[i].col][this.temporary[i].row + 1].status === SquareStatus.FIXED) {
                collisionRow = this.temporary[i].row;
                canMove = false;
                break;
            }

    // if colliding row is the highest row, the game end
    if (collisionRow === 0)
        return {result: MoveResult.ENDGAME}

    // if a block can't be moved anymore, set proper grid squares to FIXED and spawn a new block
    if (!canMove) {

        var temp, data = [];
        for (var i = 0; i < len; ++i) {
            temp = this.temporary[i];
            this.grid[temp.col][temp.row].status = SquareStatus.FIXED;
            this.grid[temp.col][temp.row].color = this.block.color;

            // new fields were set to FIXED, so it's time to check,
            // if a complete line has been formed in a currently altered row
            var clearRow = true;
            for (var col = 0; col < this.params.cols; ++col){
                if (this.grid[col][temp.row].status !== SquareStatus.FIXED) {
                    clearRow = false;
                    break;
                }
            }

            // store information about the row that should be cleared
            if (clearRow) data.push(temp.row);

        }

        if (data.length) return {result: MoveResult.CLEAR, data: data};
        return {result: MoveResult.COLLISION};

    }

    this.block.update();
    return {result: MoveResult.AVAILABLE};

}

/*
    Attempts to move block left.
*/
Scene.prototype.moveBlockLeft = function(){

    // Scene gets the most left coordinates of the block and,
    // knowing it's own borders (size) decides, if move is allowed.
    if (this.block.checkLeft() > 0){        

        // The last thing, that needs to be checked,
        // is there is a collision with another block on the left.
        var len = this.temporary.length;
        for (var i = 0; i < len; ++i)
            if (this.grid[this.temporary[i].col - 1][this.temporary[i].row].status === SquareStatus.FIXED)
                return;

        // move block if the way is clear
        this.block.moveLeft();
    }

}

/*
    Attempts to move block left.
*/
Scene.prototype.moveBlockRight = function(){

    // Scene gets the most right coordinates of the block and,
    // knowing it's own borders (size) decides, if move is allowed.
    if (this.block.checkRight() < this.params.cols - 1){

        // The last thing, that needs to be checked,
        // is if there is a collision with another block on the right.
        var len = this.temporary.length;
        for (var i = 0; i < len; ++i)
            if (this.grid[this.temporary[i].col +1][this.temporary[i].row].status === SquareStatus.FIXED)
                return;

        // move block if the way is clear
        this.block.moveRight();

    }

}

// Rotates block, if it's possible.
Scene.prototype.rotateBlockRight = function(){

    // TO DO check if rotation is possible (collision with wall or other block)

    this.block.rotateRight();

}

// Accelerates block
Scene.prototype.accelerateBlock = function(){
    this.block.accelerate();
}

// Slows down block
Scene.prototype.slowDownBlock  = function(){
    this.block.slowDown();
}

// Displays block at it's current position on the grid.
Scene.prototype.displayBlock = function(){

     // clear temporary array - it will be filled again, when block is displayed
     this.temporary = [];

    // display a block: go through it's shape array and update game grid
    // where shape[col[row] is different, than zero
    var size = this.block.shape.size;
    for (var col = 0; col < size; ++col)
        for (var row = 0; row < size; ++row) {
            if (this.block.shape.data[col][row])
                this.updateField(
                    Math.floor( this.block.position.x ) + col,
                    Math.floor( this.block.position.y ) + row,
                    this.block.color,
                    1
                );
        }

}

/*
    Updates chosen field on the grid. Sets it's color and status to new values.
    Displays result.
*/
Scene.prototype.updateField = function(col, row, color, status){

    var size = this.params.fieldSizePX;

    // block should never be outside of the grid,
    // but just double check and don't update a block's fragment that is beyond the grid
    if (row < 0 || row >= this.params.rows || col >= this.params.cols) return;
    
    this.graphics.beginFill(color);              
    this.graphics.lineStyle(0, 0x000000);

    // draw black border around fields occupied by a block
    if (status) this.graphics.lineStyle(2, 0x000000);

    this.graphics.drawRect(col * size + this.params.drawStart, row * size, size, size);
    this.graphics.endFill();

    this.grid[col][row].color = color;

    // update temporary array
    if (status === SquareStatus.TEMPORARY)
        this.temporary.push({row: row, col: col});

}