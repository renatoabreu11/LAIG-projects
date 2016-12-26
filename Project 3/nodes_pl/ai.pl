/*
*************************** CALLS FOR BOT MOVES ***************************
*/

%Selects a move accordingly to the difficulty
pickMove(Difficulty, Board, FinalBoard, Bot, NodeRowI-NodeColI, NodeRowF-NodeColF):-
    Difficulty == easy,
    pickRandomMove(Board, FinalBoard, Bot, NodeRowI-NodeColI, NodeRowF-NodeColF).

pickMove(Difficulty, Board, FinalBoard, Bot, NodeRowI-NodeColI, NodeRowF-NodeColF):-
    Difficulty == medium,
    pickBestMove(Board, FinalBoard, Bot, NodeRowI-NodeColI, NodeRowF-NodeColF).

%bot will randomly make a move
pickRandomMove(Board, FinalBoard, Bot, NodeRowI-NodeColI, NodeRowF-NodeColF):-
    getNodeCoordinates(Board, Bot, NodeRowI-NodeColI),
    getValidBoards(Board, Bot, ValidMoves),
    listLength(ValidMoves, 0, Length),
    random(0, Length, Value),
    getRowElement(ValidMoves, Value, FinalBoard),
    displayBoard(FinalBoard), 
    getNodeCoordinates(FinalBoard, Bot, NodeRowF-NodeColF).

%bot will make a calculated move
pickBestMove(Board, FinalBoard, Bot, NodeRowI-NodeColI, NodeRowF-NodeColF):-
    getNodeCoordinates(Board, Bot, NodeRowI-NodeColI),
    getValidCoords(Board, Bot, ValidMoves), !,
    bestMove(Board, Bot, ValidMoves, _,  -500, BestMove,BestValue),
    if1(BestValue>=0,applyMove(Board, BestMove, FinalBoard),
    	if1(moveNode(Board,Bot,FinalBoard), write(''), applyMove(Board, BestMove, FinalBoard))),
    displayBoard(FinalBoard), 
    getNodeCoordinates(FinalBoard, Bot, NodeRowF-NodeColF).


/*
*************************** OTHER PREDICATES ***************************
*/
% Gets all the possible movements -> Each instance is of type Board
getValidBoards(Board, Bot, ValidMoves):-
    getMatrixElements(Board, Units, Bot, 0),
    getMatrixElements(Board, Cells, space, 0),
    getNodeCoordinates(Board, blue, BlueNodeRow-BlueNodeCol), 
	getNodeCoordinates(Board, red, RedNodeRow-RedNodeCol),
    findall(NewBoard, (
        tryMove(Board, Units, Cells, BlueNodeRow-BlueNodeCol, RedNodeRow-RedNodeCol, Row-Col, DestRow-DestCol, Piece),
        movePiece(Piece, Row, Col, DestRow, DestCol, Board, NewBoard)),
    ValidMoves).

% Gets all the possible movements -> Each instance is of type [NodeRowI-NodeColI, NodeRowF-NodeColF]
getValidCoords(Board, Bot, ValidMoves):-
    getMatrixElements(Board, Units, Bot, 0),
    getMatrixElements(Board, Cells, space, 0),
    getNodeCoordinates(Board, blue, BlueNodeRow-BlueNodeCol), 
    getNodeCoordinates(Board, red, RedNodeRow-RedNodeCol),
    findall(Coords, (
        tryMove(Board, Units, Cells, BlueNodeRow-BlueNodeCol, RedNodeRow-RedNodeCol, Row-Col, DestRow-DestCol, _),
        appendCoordinates(Row-Col, DestRow-DestCol, Coords)),
    ValidMoves).

%Validates a movement
tryMove(Board, Units, Cells, BlueNodeRow-BlueNodeCol, RedNodeRow-RedNodeCol, Row-Col, DestRow-DestCol, Piece):-
    getElement(Units, Row, Col),
    getMatrixElement(Board, Row, Col, Piece),
    getElement(Cells, DestRow, DestCol),
    checkCommunicationLines(Row, Col, BlueNodeRow, BlueNodeCol, RedNodeRow, RedNodeCol, Board),
    if1(
		isJump(Row, Col, DestRow, DestCol, Board),
		true,
		validateMovement(Row,Col,DestRow,DestCol)).

appendCoordinates(Row-Col, DestRow-DestCol, [Row-Col, DestRow-DestCol]).

%To the move passed [SrcRow-SrcCol, DestRow-DestCol], applies the move and updates de board
applyMove(Board, [SrcRow-SrcCol, DestRow-DestCol], FinalBoard):-
    getMatrixElement(Board, SrcRow, SrcCol, Piece),
    movePiece(Piece, SrcRow, SrcCol, DestRow, DestCol, Board, FinalBoard).

%Goes through all the validMoves, asserts a value to each one and in the end gives the bestMove
bestMove(_, _, [], BestMove, BestValue, BestMove, BestValue).

bestMove(Board, Bot, [Head|Tail], _, Value, FinalMove, FinalValue):-
    evaluateMove(Board, Bot, Head, MoveValue),
    MoveValue >= Value, !,
    bestMove(Board, Bot, Tail, Head, MoveValue, FinalMove, FinalValue).

bestMove(Board, Bot, [Head|Tail], CurrBestMove, Value, FinalMove, FinalValue):-
    evaluateMove(Board, Bot, Head, MoveValue),
    MoveValue < Value, !,
    bestMove(Board, Bot, Tail, CurrBestMove, Value, FinalMove, FinalValue).

%Function that evaluates a move using this four parameters: CommunicationLine, AdjacencyToNode, DistanceToNode, EnemiesBetween
evaluateMove(Board, Bot, [SrcRow-SrcCol, DestRow-DestCol], MoveValue):-
    %Retrieve both nodes coordinates
    getNodeCoordinates(Board, Bot, NodeRowP-NodeColP),
    getOtherPlayer(Bot, Enemy),
    getNodeCoordinates(Board, Enemy, NodeRowE-NodeColE),
     
    %Append those coordinates to a list
    appendCoordinates(NodeRowP-NodeColP, NodeRowE-NodeColE, NodeCoords),
    %Evaluate unit communication with nodes
    evaluateCI(Board, DestRow-DestCol, NodeCoords, CommunicationValue, Bot), !,
    %Evaluate adjacency to enemy Node
    evaluateNA(Board, Bot, [SrcRow-SrcCol, DestRow-DestCol], NodeRowE-NodeColE, AdjacentValue), !,
    %Evaluate distance to enemy Node
    evaluateND([SrcRow-SrcCol, DestRow-DestCol], NodeCoords, DistanceValue), !,
    %Evaluate number of pieces between unit and node
    evaluatePB(Board, [SrcRow-SrcCol, DestRow-DestCol], NodeCoords, PiecesValue), !,

    %MoveValue is the sum of the 4 evaluations calculated above.
    MoveValue is CommunicationValue + DistanceValue + AdjacentValue + PiecesValue.

/*
*************************** Evaluate unit communication with nodes ***************************
Values given to the move:
14 if the new coords have communication with both nodes
12 if only has communication with one node
0 if both cases mentioned fail.
*/

% Has communication with both nodes.
evaluateCI(Board, DestRow-DestCol, [NodeRowP-NodeColP, NodeRowE-NodeColE], CommsValue, Bot):-
    or(checkCommunicationLines(DestRow, DestCol, NodeRowP, NodeColP, Board, Bot), 
    checkCommunicationLines(DestRow, DestCol, NodeRowE, NodeColE, Board, Bot)),
    CommsValue is 14.

% Has communication with the team node.
evaluateCI(Board, DestRow-DestCol, [NodeRowP-NodeColP, _], CommsValue, Bot):-
    checkCommunicationLines(DestRow, DestCol, NodeRowP, NodeColP, Board, Bot),
    CommsValue is 12.

% Has communication only with the enemy node.
evaluateCI(Board, DestRow-DestCol, [_, NodeRowE-NodeColE], CommsValue, Bot):-
    checkCommunicationLines(DestRow, DestCol, NodeRowE, NodeColE, Board, Bot),
    CommsValue is 12.

% Does not have communication with either node.
evaluateCI(_, _, _, 0, _).

/*
*************************** Evaluate adjacency to enemy Node ***************************
Values given to the move:
80*k, k being the number of units adjacent to enemy Node
*/

% Gives a value for the amount of PlayerColor's pieces adjacent to the enemy' Node
% evaluateAdjacencyToNode(Board,PlayerColor,NodeRow-NodeCol,Value).
evaluateNA(Board, PlayerColor, Coords, NodeRow-NodeCol, Value):-
    applyMove(Board, Coords, AuxBoard),
    North is (NodeRow-1),
    South is (NodeRow+1),
    East is (NodeCol+1),
    West is (NodeCol-1),
    getMatrixElement(AuxBoard, North, NodeCol, Piece1),
    isAdjacent(Piece1, PlayerColor, Val1),

    getMatrixElement(AuxBoard, South, NodeCol, Piece2),
    isAdjacent(Piece2, PlayerColor, Val2),
    
    getMatrixElement(AuxBoard, NodeRow, West, Piece3),
    isAdjacent(Piece3, PlayerColor, Val3),

    getMatrixElement(AuxBoard, NodeRow, East, Piece4),
    isAdjacent(Piece4, PlayerColor, Val4),

    Multiplier is 80,
    Value is Multiplier*(Val1+Val2+Val3+Val4).

isAdjacent(Piece, PlayerColor, 1):-
    belongsTo(Piece, PlayerColor).

isAdjacent(_, _, 0).

/*
*************************** Evaluate distance to enemy Node ***************************
Values given to the move:
12*k UNIT IS k STEPS CLOSER TO ENEMY NODE
*/
        
% Finds out the distance between a unit("UnitCol-UnitRow") and the enemy node.
evaluateND([SrcRow-SrcCol, DestRow-DestCol], [_, NodeRowE-NodeColE],  DistanceValue):-       
    abs(SrcRow-NodeRowE, RowDiffOrigin),
    abs(SrcCol-NodeColE, ColDiffOrigin), %intermediate calculations for original distance
    DistanceOrigin is ColDiffOrigin+RowDiffOrigin,

    abs(DestRow-NodeRowE,RowDiffDest), 
    abs(DestCol-NodeColE,ColDiffDest), %intermediate calculations for new distance
    DistanceDest is ColDiffDest+RowDiffDest,

    Multiplier is 12,
    DistanceValue is Multiplier*(DistanceOrigin-DistanceDest).

/*
*************************** Evaluate number of enemies between unit and node ***************************
Values given to the move:
-8*k, with k being the number of units on the path
*/
        
% Finds the number of pieces between unit and node
evaluatePB(Board, [_, DestRow-DestCol], [_, NodeRowE-NodeColE], PiecesValue):-     
    getMatrixElements(Board, Units, unit, 0),
    setInc(DestRow, DestCol, NodeRowE, NodeColE, IncRow, IncCol),
    findall(EnemyUnit, 
            path(Units, DestRow, DestCol, NodeRowE, NodeColE, IncRow, IncCol, EnemyUnit),
    EnemiesBetween),
    listLength(EnemiesBetween, 0, Length),
    Multiplier is -8,
    PiecesValue is Multiplier*Length.

% Checks if the unit retrieved from units it is in the path connection both enemy node and destiny position 
path(Units, DestRow, DestCol, NodeRowE, NodeColE, IncRow, IncCol, EnemyUnit):-     
    getElement(Units, Row, Col),
    checkUnit(DestRow, DestCol, NodeRowE, NodeColE, IncRow, IncCol, Row, Col),
    not((NodeRowE == Row,
    NodeColE == Col)),
    EnemyUnit is [Row-Col].

checkUnit(DestRow, DestCol, _, _, IncRow, IncCol, Row, Col):-
    IncRow == 0,
    DestRow == Row,
    if1(IncCol == -1,
        DestCol > Col,
        DestCol < Col).
 
checkUnit(DestRow, DestCol, _, _, IncRow, IncCol, Row, Col):-
    IncCol == 0,
    DestCol == Col,
    if1(IncRow == -1,
        DestRow > Row,
        DestRow < Row).

checkUnit(DestRow, DestCol, NodeRowE, NodeColE, IncRow, IncCol, Row, Col):-
    if1(
          (IncRow == 1, IncCol == 1),
          (or(
                (DestCol == Col, DestRow < Row, Row =< NodeRowE),
                (NodeRowE == Row, DestCol < Col, Col < NodeColE))
           ),
        if1(
           (IncRow == 1, IncCol == -1),
           (or(
                (DestCol == Col, DestRow < Row, Row =< NodeRowE),
                (NodeRowE == Row, DestCol > Col, Col > NodeColE))
           ),
           fail
        )
    ).

checkUnit(DestRow, DestCol, NodeRowE, NodeColE, IncRow, IncCol, Row, Col):-
    if1(
          (IncRow == -1, IncCol == 1),
          (or(
                (DestCol == Col, DestRow > Row, Row >= NodeRowE),
                (NodeRowE == Row, DestCol < Col, Col < NodeColE))
           ),
        if1(
           (IncRow == -1, IncCol == -1),
           (or(
                (DestCol == Col, DestRow > Row, Row =< NodeRowE),
                (NodeRowE == Row, DestCol > Col, Col > NodeColE))
           ),
           fail
        )
    ).
           
           
%Gets all the possible moves to a node, and randomly selects one
moveNode(Board, Bot, FinalBoard):-
	getNodeCoordinates(Board, Bot, NodeRow-NodeCol),
        North is (NodeRow-1),
        South is (NodeRow+1),
        East is (NodeCol+1),
        West is (NodeCol-1),
        AdjacentCoords = [NodeRow-West, NodeRow-East, North-NodeCol, South-NodeCol],
        findall(Dest, 
            possibleMoves(AdjacentCoords, Board, NodeRow-NodeCol, Dest),
        Moves),
        listLength(Moves, 0, Length),
        random(0, Length, Value),
        getRowElement(Moves, Value, Coords),
        applyMove(Board, Coords, FinalBoard), !.
        

possibleMoves(AdjacentCoords, Board, NodeRow-NodeCol, [NodeRow-NodeCol, Row-Column]):-
        getElement(AdjacentCoords, Row, Column),
        getMatrixElement(Board, Row, Column, Piece),
        isEmpty(Piece).
