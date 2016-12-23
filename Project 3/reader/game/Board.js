/**
 * Board
 * @constructor
 */

function getInitialBoard(){
    return JSON.stringify([
        ['empty', 'empty', 'blueUnit', 'blueUnit', 'blueNode', 'blueUnit', 'blueUnit', 'empty', 'empty'],
        ['empty', 'space', 'space', 'blueUnit', 'blueUnit', 'blueUnit', 'space', 'space', 'empty'],
        ['space', 'space', 'space', 'space', 'blueUnit', 'space', 'space', 'space', 'space'],
        ['space', 'space', 'space', 'space', 'space', 'space', 'space', 'space', 'space'],
        ['space', 'space', 'space', 'space', 'space', 'space', 'space', 'space', 'space'],
        ['space', 'space', 'space', 'space', 'space', 'space', 'space', 'space', 'space'],
        ['space', 'space', 'space', 'space', 'redUnit', 'space', 'space', 'space', 'space'],
        ['empty', 'space', 'space', 'redUnit', 'redUnit', 'redUnit', 'space', 'space', 'empty'],
        ['empty', 'empty', 'redUnit', 'redUnit', 'redNode', 'redUnit', 'redUnit', 'empty', 'empty'],
    ]);
}
function Board(board_encoded) {
    console.log(JSON.parse(getInitialBoard()));
}

Board.prototype.constructor = Board;
