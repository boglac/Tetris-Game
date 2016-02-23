/*
    Block class
    Represents a single block.
    
    >> Implementation notice:
    Block is governed by Scene class instance. As a class it doesn't know of Scene existence;
    it's a encapsulated class that contains some methods, allowin to report or change it's status,
    and - by calling them - governing object decides what to do.
*/
function Block(type, posX, posY) {

    var that = this;

    // determines what kind of block this one is (type translates to shape, there are 7 possible shapes)
    this.type = type;

    // visual representation of a block.
    this.color = config.COLORS[type];

    // position and velocity determine block's appearence on the scene
    this.position = {
        x: posX,
        y: posY
    };

    this.velocity = {
        x: 0,
        y: config.SPEED_DEFAULT,
        min: config.SPEED_DEFAULT,
        max: config.SPEED_MAX
    }

    // SquareMatrix class object, being a abstract representative of block's shape
    this.shape;

    // initialize shape
    (function(type){

        var size = config.BLOCKS[type].size;
        var len = size * size;

        that.shape = new SquareMatrix(size);

        var source = config.BLOCKS[type],
            test = 0b1, result,
            row = 0, col = 0;

        for (var i = 0; i < len; ++i) {

            if (i > 0 && i % size == 0) {
               row++;
               col = 0;
            }

            // translate binary block shape into 0 / 1 values
            result = source.shape & test;
            if (result) {

                that.shape.data[col][row] = 1;
                that.shape.backup[col][row] = 1;

                that.shape.lowest = row;

                if (that.shape.right < col) that.shape.right = col;
                if (that.shape.left > col) that.shape.left = col;

            } else {
                that.shape.data[col][row] = 0;
                that.shape.backup[col][row] = 0;
            }

            col++;
            test <<= 1;

        }

    })(type)

};

// Moves block to position given with X and Y coordinates.
Block.prototype.setPosition = function(x, y) {
    this.position.x = x;
    this.position.y = y;
}

Block.prototype.accelerate = function(){
    this.velocity.y = this.velocity.max;
}

Block.prototype.slowDown = function(){
    this.velocity.y = this.velocity.min;
}

// Rotates block right
Block.prototype.rotateRight = function(){
    this.shape.rotateRight();
}

// returns left most coordinates
Block.prototype.checkLeft = function(){
    return (this.position.x + this.shape.left);
}

// returns right most coordinates
Block.prototype.checkRight = function(){
    return (this.position.x + this.shape.right);
}

Block.prototype.moveLeft = function(){
    this.position.x--;
}

Block.prototype.moveRight = function(){
    this.position.x++;
}

// Updates block. Called on every frame by parent object (Game).
Block.prototype.update = function() {

    this.setPosition(
        this.position.x + this.velocity.x,
        this.position.y + this.velocity.y
    );

}
