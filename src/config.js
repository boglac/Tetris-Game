/* config object stores some of the game parameters */
var config = {
    
    // overall game speed is slightly increased on Firefox,
    // due to known issue with slower setTimeout on this browser
    FPS: isFirefox ? 80 : 60,

    SCR_WIDTH: 450,
    SCR_HEIGHT: 720,
    
    DRAW_START: 30,

    GRID_ROWS: 20,
    GRID_COLS: 12,

    FIELD_DISPLAY_SIZE: 34,
    MAX_SHAPE_SIZE: 3,

    SPEED_DEFAULT: 0.05,
    SPEED_MAX: 0.2,

    ASSETS: {
        title: ['title', 'assets/name.png', 350, 720],
        panel: ['panel', 'assets/panel.png', 10, 655]
    },

    // Default grid background color
    GRID_COLOR: 0xCCCCFF,

    // Number of blocks' types. Arrays COLORS and BLOCKS should contain
    // amount of elements equal to this value.
    NUM_OF_TYPES: 7,

    // Possible colors for shapes. Each 4-bits in hex must be lower than 'e',
    // because blocks, which have landed, have their colors strengthened by 0x222222
    COLORS: [
        0xcc0000,
        0x00dd00,
        0x0000dd,
        0xdddd00,
        0xdd11dd,
        0x11dddd,
        0xdd7700
    ],

    /*
    Blocks' shapes are stored in abbinary format for memory usage optimization sake.
    Binary information about block's shape can be explained like this:
    Let's say we have a binary value of bi = 0b0000110001100000;
    This value originates from such representation of a shape:
        0000
        0110
        0110
        0000
    On block's initialization this binary value (bi) is translated in to an array,
    which stores information about block's shape.
    */
    BLOCKS: [
        {shape: 0b1111, size: 2},
        {shape: 0b010111000, size: 3},
        {shape: 0b011001001, size: 3},
        {shape: 0b011110000, size: 3},
        {shape: 0b110011000, size: 3},
        {shape: 0b111001000, size: 3},
        {shape: 0b0000111100000000, size: 4}
    ]
};

// Some enums.
var GameState = {
    INIT: 0,
    GAME: 1,
    SPAWN: 2,
    CLEAR: 3,
    LASTCHANCE: 4,
    END: 5
}

var MoveResult = {
    AVAILABLE: 0,
    COLLISION: 1,
    CLEAR: 2,
    ENDGAME: 3
}

var SquareStatus = {
    FREE: 0,
    TEMPORARY: 1,
    FIXED: 2
}

var KeyCodes = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
}
