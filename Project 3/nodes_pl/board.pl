/*
   BOARDS:
   initialBoard shows a board in its initial stage
   midBoard shows a board in the middle of a game
   finalBoard shows a board on gameover
*/
emptyBoard([
 [empty ,empty ,space ,space ,space ,space ,space ,empty ,empty ,empty],
 [empty ,space ,space ,space ,space ,space ,space ,space ,empty ,empty],
 [space ,space ,space ,space ,space ,space ,space ,space ,space ,empty],
 [space ,space ,space ,space ,space ,space ,space ,space ,space ,empty],
 [space ,space ,space ,space ,space ,space ,space ,space ,space ,empty],
 [space ,space ,space ,space ,space ,space ,space ,space ,space ,empty],
 [space ,space ,space ,space ,space ,space ,space ,space ,space ,empty],
 [empty ,space ,space ,space ,space ,space ,space ,space ,empty ,empty],
 [empty ,empty ,space ,space ,space ,space ,space ,empty ,empty ,empty]]).

initialBoard([
 [empty ,empty ,blueUnit ,blueUnit ,blueNode ,blueUnit ,blueUnit ,empty ,empty ,empty],
 [empty ,space ,space    ,blueUnit ,blueUnit ,blueUnit ,space    ,space ,empty, empty],
 [space ,space ,space    ,space    ,blueUnit ,space    ,space    ,space ,space ,empty],
 [space ,space ,space    ,space    ,space    ,space    ,space    ,space ,space ,empty],
 [space ,space ,space    ,space    ,space    ,space    ,space    ,space ,space ,empty],
 [space ,space ,space    ,space    ,space    ,space    ,space    ,space ,space ,empty],
 [space ,space ,space    ,space    ,redUnit  ,space    ,space    ,space ,space ,empty],
 [empty ,space ,space    ,redUnit  ,redUnit  ,redUnit  ,space    ,space ,empty ,empty],
 [empty ,empty ,redUnit  ,redUnit  ,redNode  ,redUnit  ,redUnit  ,empty ,empty ,empty]]).

midBoard([
 [empty    ,empty  ,blueUnit ,space    ,space    ,space    ,space   ,empty ,empty ,empty],
 [empty    ,space  ,space    ,blueUnit ,blueUnit ,blueUnit ,space   ,space ,empty ,empty],
 [space    ,space  ,space    ,blueNode ,blueUnit ,space    ,space   ,space ,space ,empty],
 [space    ,space  ,space    ,blueUnit ,redUnit  ,space    ,space   ,space ,space ,empty],
 [space    ,space  ,space    ,space    ,space    ,blueUnit ,space   ,space ,space ,empty],
 [space    ,space  ,redUnit  ,space    ,space    ,space    ,space   ,space ,space ,empty],
 [blueUnit ,space  ,space    ,space    ,redUnit  ,space    ,redUnit ,space ,space ,empty],
 [empty    ,space  ,space    ,redUnit  ,redUnit  ,redUnit  ,space   ,space ,empty ,empty],
 [empty    ,empty  ,space    ,redUnit  ,redNode  ,space    ,space   ,empty ,empty ,empty]]).

finalBoard([
 [empty ,empty    ,space    ,space    ,space   ,space    ,space   ,empty ,empty ,empty],
 [empty ,space    ,space    ,blueUnit ,space   ,space    ,space   ,space ,empty ,empty],
 [space ,space    ,redUnit  ,blueNode ,redUnit ,space    ,space   ,space ,space ,empty],
 [space ,space    ,blueUnit ,redUnit  ,redUnit ,space    ,space   ,space ,space ,empty],
 [space ,space    ,space    ,space    ,space   ,blueUnit ,space   ,space ,space ,empty],
 [space ,space    ,redUnit  ,space    ,space   ,space    ,space   ,space ,space ,empty],
 [space ,space    ,blueUnit ,blueUnit ,redUnit ,space    ,redUnit ,space ,space ,empty],
 [empty ,blueUnit ,redNode  ,blueUnit ,redUnit ,space    ,space   ,space ,empty ,empty],
 [empty ,empty    ,blueUnit ,space    ,space   ,space    ,space   ,empty ,empty ,empty]]).

isEmpty(space).

isNode(Node):-
    Node == blueNode.

isNode(Node):-
    Node == redNode.

isPlayerNode(blueNode, blue).
isPlayerNode(redNode, red).

isPiece(blueUnit).
isPiece(blueNode).
isPiece(redUnit).
isPiece(redNode).

belongsTo(blueUnit,blue).
belongsTo(blueNode,blue).
belongsTo(redUnit,red).
belongsTo(redNode,red).

belongsTo(blueUnit, unit).
belongsTo(redUnit, unit).

belongsTo(space,space).
        
