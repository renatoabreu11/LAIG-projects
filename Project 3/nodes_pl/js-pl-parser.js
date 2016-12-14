function getInitialBoard(){
	return [
		['empty', 'empty', 'blueUnit', 'blueUnit', 'blueNode', 'blueUnit', 'blueUnit', 'empty', 'empty'],
		['empty', 'space', 'space', 'blueUnit', 'blueUnit', 'blueUnit', 'space', 'space', 'empty'],
		['space', 'space', 'space', 'space', 'blueUnit', 'space', 'space', 'space', 'space'],
		['space', 'space', 'space', 'space', 'space', 'space', 'space', 'space', 'space'],
		['space', 'space', 'space', 'space', 'space', 'space', 'space', 'space', 'space'],
		['space', 'space', 'space', 'space', 'space', 'space', 'space', 'space', 'space'],
		['space', 'space', 'space', 'space', 'redUnit', 'space', 'space', 'space', 'space'],
		['empty', 'space', 'space', 'redUnit', 'redUnit', 'redUnit', 'space', 'space', 'empty'],
		['empty', 'empty', 'redUnit', 'redUnit', 'redNode', 'redUnit', 'redUnit', 'empty', 'empty'],
	];
}

function boardJStoPL(jsBoard){
	plBoard="[";
	
	for(i=0; i<jsBoard.length; i++){
		var line = jsBoard[i];
		plBoard+="[";

		for(j=0; j<line.length; j++){
			plBoard+=line[j];
			if(j+1 != line.length)
				plBoard+=",";
		}

		plBoard+="]";
		if(i+1 != jsBoard.length)
			plBoard+=",";
	}

	plBoard+="]";

	return plBoard;
}

function boardPLtoJS(plBoard){ //inverter
	var jsBoard=[];
	var startIndex=2;

	while(plBoard.length>1) {
		finalIndex=plBoard.indexOf("]");
		var lineStr = plBoard.substring(startIndex,finalIndex);
		var lineArray = lineStr.split(",");
		jsBoard.push([lineArray]);

		plBoard = plBoard.substring(finalIndex+1);
	}
	
	console.log(jsBoard);
	console.log(plBoard);

	return jsBoard;
}

