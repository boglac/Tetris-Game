/*
    Square Matrix class
*/
function SquareMatrix(size){

    this.size = size;

    // matrix data (two-dimensional array)
    this.data = new Array(size);

    // copy of data, implemented for optimization's sake:
    // A Matrix object can be rotated by user quite frequently. Thanks to the existance of a backup array,
    // there is no need to create a temporary array for each call of matrix transformation functions (rotate, reverse).
    // A memory overhead (16 int objects for this implementation) is inegligible.
    this.backup = new Array(size);

    for (var i = 0; i < size; ++i) {
        this.data[i] = new Array(size);
        this.backup[i] = new Array(size);
    }
    
    // keeps record of the lowest row with active cell (1)
    // used for slightly optimized collision detection;
    // updated when matrix is rotated
    this.lowest = 0;

    // same as above, for most left and most right active cell
    this.left = size;
    this.right = 0;

}

SquareMatrix.prototype.transpose = function(){

    // transpose matrix
    for (var row = 0; row < this.size; ++row)
        for (var col = 0; col < this.size; ++col)
            this.data[col][row] = this.backup[row][col];

    // update backup
    this.updateBackup();

}

SquareMatrix.prototype.reverseRows = function(){

    // reverse rows
    for (var row = 0; row < this.size; ++row)
        for (var col = 0; col < this.size; ++col)
            this.data[col][row] = this.backup[this.size - 1 - col][row];

    // update backup
    this.updateBackup();

}

// Rotates a matrix right and returns it's new lowest cooridinate.
SquareMatrix.prototype.rotateRight = function(){
    this.transpose();
    this.reverseRows();
}

// updates backup array and returns an integer, being a number of the lowest active row
SquareMatrix.prototype.updateBackup = function(){

    this.lowest = this.right = 0;
    this.left = this.size;

    for (var row = 0; row < this.size; ++row)
        for (var col = 0; col < this.size; ++col) {

            this.backup[col][row] = this.data[col][row];

            // update left, right and lowest
            if (this.backup[col][row]) {
                this.lowest = row;
                if (this.right < col) this.right = col;
                if (this.left > col) this.left = col;
            }

        }

}