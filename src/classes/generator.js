
/*
    Generator class
    Used to spawn Block objects.
*/
function Generator(){

    this.position = {
        x: 0,
        y: 0
    }

}

// Sets Generator to a desired position.
Generator.prototype.setPosition = function(x, y){
    this.position.x = x;
    this.position.y = y;
}

// Spawns a block of a random block type.
Generator.prototype.spawnBlock = function(){
        
    return new Block(Math.floor( Math.random() * config.NUM_OF_TYPES ),
        this.position.x,
        this.position.y
    );
    
}
