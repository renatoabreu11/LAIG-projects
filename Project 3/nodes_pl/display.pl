:- discontiguous translate/2.
:- discontiguous translate2/2.
:- discontiguous translate3/2.

/*
   Each element of the board has 6x3 dimensions. As such, every element has to be print 3 times (for the 3 lines) in different ways.
   As such, there are three 'displayLine' relations and other 3 'translate' relations, each pair to display 1 of those 3 lines.
   The first and second line of each element is used to show the pieces, and the third is used for separations.
*/

columnsIdentifiers :- write('      a     b     c     d     e     f     g     h     i').
initialSeparator :- write('               ._____._____._____._____._____.').

displayBoard(Board):- nl, columnsIdentifiers, nl,
                      initialSeparator, nl,
                      displayBoardAux(Board,1).

displayBoardAux([],_) :- nl.
displayBoardAux([L1|LS],N):- write('   '), displayLine1(L1),
                             write(N), write('  '), displayLine2(L1), 
                             write('   '), displayLine3(L1,N),
                             N2 is N+1,
                             displayBoardAux(LS, N2).

displayLine1([]) :- nl.
displayLine1([E1|ES]):-
    if1(ES==[], %get E2
        E2 is 0,
        (append([E2],_,ES), [E2] \= [])),
    if1(belongsTo(E1,_),%if E1 is a space or a piece
        write('|'),     %then put a separator
        write(' ')),    %else do nothing special
    translate(E1, V), 
    write(V),
    if1((belongsTo(E1,_),not(belongsTo(E2,_))),
        write('|'),
        write('')),
    displayLine1(ES).

displayLine2([]) :- nl.
displayLine2([E1|ES]):-
    if1(ES==[], %get E2
        E2 is 0,
        (append([E2],_,ES), [E2] \= [])),
    if1(belongsTo(E1,_),%if E1 is a space or a piece
        write('|'),     %then put a separator
        write(' ')),    %else do nothing special
    translate2(E1, V), 
    write(V),
    if1((belongsTo(E1,_),not(belongsTo(E2,_))),
        write('|'),
        write('')),
    displayLine2(ES).

displayLine3([],_) :- nl.
displayLine3([E1|ES],N):-
    if1(ES==[], %get E2
        E2 is 0,
        (append([E2],_,ES), [E2] \= [])),
    translate3(E1, V),

    if1(belongsTo(E1,_),        %if E1 is a space or a piece
        write('|'),  %then put a separator
        if1((belongsTo(E2,_),N<3),    %else if E2 is a space or piece
            write('._____'),     %then put prev ground filler
            write('      ')
            )
        ),
        write(V),

    if1((belongsTo(E1,_),not(belongsTo(E2,_))),
        if1(N<3,
            write('|_____'),
            write('|')),
        write('')),
    displayLine3(ES,N).


translate(space,  '  -  ').
translate2(space, '  -  ').
translate3(space, '-----').

translate(blueUnit,  '  B  ').
translate2(blueUnit, ' <+> ').
translate3(blueUnit, '-----').

translate(blueNode,  '  B  ').
translate2(blueNode, ' /_\\ ').
translate3(blueNode, '-----').

translate(redUnit,  '  R  ').
translate2(redUnit, ' <+> ').
translate3(redUnit, '-----').

translate(redNode,  '  R  ').
translate2(redNode, ' /_\\ ').
translate3(redNode, '-----').

translate(empty,  '     ').
translate2(empty, '     ').
translate3(empty, '').
