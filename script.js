"use-strict";

var canvas;
var gl;
var maxNumVertices = 20000;
// var index = 0;
var stateOfGames = [-1, -1 ,-1, -1, -1, -1, -1, -1, -1];
var player3Stones = [false, false];
var playerCountStep = [0, 0];
var playerLastStep = [[-1,-1],[-1,-1]];
var playerNames = ["Player1", "Player2"];
var playerSelectedStone = [-1, -1]
var NULL_STONE = -1;
var PLAYER_1 = 0;
var PLAYER_2 = 1;
var moveClickedCount = 0;
var stateIndexTemp = -1;
var currentPlayer = PLAYER_1;

var canvasWidth;
var canvasHeight;

var RECTANGLE_STONE = 0;
var CIRCLE_STONE = 1;
var TRIANGLE_STONE = 2;
var currentSelectedStone = -1;

var cBufferId, bufferId, sizeBufferId;
var canvasOffsetTop, canvasOffsetLeft;
var totalIndex = 0;
var statusDisplay;

var movement = 1;
var scaleFactor = 0.005;
var currentScale = 0.005;
var currentPosition = 0;
var targetPosition = 0;
var scale = [1.0, 1.0];

var matrixLocation;

function scalePiece(start, count) {
	currentScale += scaleFactor;
	if(currentScale > 1.5) {
		currentScale = 1.5;
		scaleFactor = -1*scaleFactor;
	}
	if(currentScale < 0.05) {
		currentScale = 0.05;
		scaleFactor = -1*scaleFactor;
	}
	var matrix = m3.identity();
	var projectionMatrix = m3.projection(canvas.width, canvas.height);
	var scaleMatrix = m3.scaling(scale[0] + currentScale, scale[1] + currentScale);
	matrix = m3.multiply(matrix, projectionMatrix);
	matrix = m3.multiply(matrix, scaleMatrix);

	gl.uniformMatrix3fv(matrixLocation, false, matrix);
	gl.drawArrays( gl.TRIANGLES, start, count );
	requestAnimationFrame(scalePiece);
}

function rotatePiece() {
	requestAnimation(rotatePiece);
}


function translatePiece(x, y, count) {
	var matrix = m3.identity();

	requestAnimation(translatePiece);
}

var m3 = { 						//setup 3x3 transformation matrix object
   identity: function() {
    return [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    ];
   },
   
   projection: function(width, height) {
    // Note: This matrix flips the Y axis so that 0 is at the top.
    return [
      2 / width, 0, 0,
      0, -2 / height, 0,
      -1, 1, 1
    ];
   },

  translation: function(tx, ty) {
    return [
      1, 0, 0,
      0, 1, 0,
      tx, ty, 1,
    ];
  },

  rotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [
      c,-s, 0,
      s, c, 0,
      0, 0, 1,
    ];
  },

  scaling: function(sx, sy) {
    return [
      sx, 0, 0,
      0, sy, 0,
      0, 0, 1,
    ];
  },

  multiply: function(a, b) {
    var a00 = a[0 * 3 + 0];
    var a01 = a[0 * 3 + 1];
    var a02 = a[0 * 3 + 2];
    var a10 = a[1 * 3 + 0];
    var a11 = a[1 * 3 + 1];
    var a12 = a[1 * 3 + 2];
    var a20 = a[2 * 3 + 0];
    var a21 = a[2 * 3 + 1];
    var a22 = a[2 * 3 + 2];
    var b00 = b[0 * 3 + 0];
    var b01 = b[0 * 3 + 1];
    var b02 = b[0 * 3 + 2];
    var b10 = b[1 * 3 + 0];
    var b11 = b[1 * 3 + 1];
    var b12 = b[1 * 3 + 2];
    var b20 = b[2 * 3 + 0];
    var b21 = b[2 * 3 + 1];
    var b22 = b[2 * 3 + 2];
    return [
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,
      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,
      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22,
    ];
  },
};

function getPlayer3Stones (PLAYER_NUM) {
	return player3Stones[PLAYER_NUM];
}

function checkWinner(lastPlayer) {
	var PLAYER_NUM = lastPlayer;
	var lastStep = playerLastStep[PLAYER_NUM][1];
	var isWin = false;
	if(stateOfGames[lastStep] == PLAYER_NUM) {
		if([1, 4, 7].indexOf(lastStep) != -1) {
			isWin = isWin || (stateOfGames[lastStep-1] == stateOfGames[lastStep] 
				&& stateOfGames[lastStep+1] == stateOfGames[lastStep]);
		} else if([0, 3, 6].indexOf(lastStep) != -1) {
			// console.log(lastStep);
			isWin = isWin || (stateOfGames[lastStep] == stateOfGames[lastStep+1] 
				&& stateOfGames[lastStep] == stateOfGames[lastStep+2]);
		} else {
			isWin = isWin || (stateOfGames[lastStep] == stateOfGames[lastStep-1] 
				&& stateOfGames[lastStep] == stateOfGames[lastStep-2]);
		}
		if(isWin) { return true };
		if([0, 1, 2].indexOf(lastStep) != -1) {
			isWin = isWin || (stateOfGames[lastStep] == stateOfGames[lastStep+3] 
				&& stateOfGames[lastStep] == stateOfGames[lastStep+6]);
		} else if([3, 4, 5].indexOf(lastStep) != -1) {
			console.log(lastStep);
			isWin = isWin || (stateOfGames[lastStep] == stateOfGames[lastStep-3] 
				&& stateOfGames[lastStep] == stateOfGames[lastStep+3]);
			console.log(isWin);
		} else {
			isWin = isWin || (stateOfGames[lastStep] == stateOfGames[lastStep-3] 
				&& stateOfGames[lastStep] == stateOfGames[lastStep-6]);
		}
		if(isWin) { return true };
		if(lastStep == 4) {
			isWin = isWin || (stateOfGames[lastStep] == stateOfGames[lastStep-4] 
				&& stateOfGames[lastStep] == stateOfGames[lastStep+4]);
			isWin = isWin || (stateOfGames[lastStep] == stateOfGames[lastStep-2] 
				&& stateOfGames[lastStep] == stateOfGames[lastStep+2]);
		} else if(lastStep == 0) {
			isWin = isWin || (stateOfGames[lastStep] == stateOfGames[lastStep+4] 
				&& stateOfGames[lastStep] == stateOfGames[lastStep+8]);
		} else if(lastStep == 2) {
			isWin = isWin || (stateOfGames[lastStep] == stateOfGames[lastStep+2] 
				&& stateOfGames[lastStep] == stateOfGames[lastStep+4]);
		} else if(lastStep == 6) {
			isWin = isWin || (stateOfGames[lastStep] == stateOfGames[lastStep-2] 
				&& stateOfGames[lastStep] == stateOfGames[lastStep=4]);
		} else if(lastStep == 8) {
			isWin = isWin || (stateOfGames[lastStep] == stateOfGames[lastStep-4] 
				&& stateOfGames[lastStep] == stateOfGames[lastStep-8]);
		}
		console.log(isWin);
		return isWin;
	}
}

function moveStone(from, to, PLAYER_NUM) {
	var validMove;
	if(stateOfGames[from] == -1 || stateOfGames[to] != -1) {
		alert("Tidak valid");
		return false;
	} else {
		if(stateOfGames[from] == PLAYER_NUM) {
			if(from == 0) {
				validMove = (to == 1 || to == 3 || to == 4);
			} else if(from == 1) {
				validMove = (to == 0 || to == 2 || to == 4 || to == 3 || to == 5);
			} else if(from == 2) {
				validMove = (to == 1 || to == 5 || to == 4);
			} else if(from == 3) {
				validMove = (to == 0 || to == 6 || to == 1 || to == 7 || to == 4);
			} else if(from == 4) {
				validMove = (to != 4);
			} else if(from == 5) {
				validMove = (to == 2 || to == 1 || to == 4 || to == 7 || to == 8);
			} else if(from == 6) {
				validMove = (to == 3 || to == 4 || to == 6);
			} else if(from == 7) {
				validMove = (to == 3 || to == 4 || to == 5 || to == 6 || to == 8);
			} else {
				validMove = (to == 4 || to == 5 || to == 7);
			}
			if(validMove) {
				stateOfGames[from] = NULL_STONE;
				stateOfGames[to] = PLAYER_NUM;
				playerLastStep[PLAYER_NUM][0] = from;
				playerLastStep[PLAYER_NUM][1] = to;
				playerCountStep[PLAYER_NUM]++;
				return true;
			} else {
				alert("Tidak Valid");
				return false;
			}
		
		}
	}
	
}

function putStone(to, PLAYER_NUM) {
	if(stateOfGames[to] != -1) {
		alert("Tidak valid");
		return false;
	} else {
		stateOfGames[to] = PLAYER_NUM;
		playerCountStep[PLAYER_NUM]++;
		playerLastStep[PLAYER_NUM][1] = to;
		if(playerCountStep[PLAYER_NUM] >= 3) {
			player3Stones[PLAYER_NUM] = true;
		}
		return true;
	}
	
}


window.onload = function() {

	statusDisplay = $('h2#statusDisplay');

	$('#startButton').on('click', function() {
		$('#step-1').css({ 'display': 'none' });
		$('#step-2').css({ 'display': 'table-cell', 'vertial-align': 'middle' });
	});

	$('#nextToPlayer2').on('click', function() {
		$('#step-2').css({ 'display': 'none' });
		$('#step-3').css({ 'display': 'table-cell', 'vertial-align': 'middle' });
		playerNames[PLAYER_1] = $('#player-1-name').val();
	})

	$('#startGame').on('click', function() {
		playerNames[PLAYER_2] = $('#player-2-name').val();
		$('#step-3').css({ 'display': 'none' });
		$('#canvas-container').css({ 'display': 'block' });
		$('#prelude').css({ 'display': 'none' });
		startPlayingGame();
	})
	canvas = document.getElementById('gl-canvas');
	gl = WebGLUtils.setupWebGL(canvas);
	canvasWidth = canvas.width;
	canvasHeight = canvas.height;
	canvasOffsetTop = canvas.offsetTop;
	canvasOffsetLeft =  (window.innerWidth - canvasWidth) / 2;
	$(canvas).css({ 'margin-left': canvasOffsetLeft });
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

   	bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STATIC_DRAW );

    var vPos = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPos, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPos );

    matrixLocation = gl.getUniformLocation(program, "u_matrix");


    cBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );


    sizeBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, 4*maxNumVertices, gl.STATIC_DRAW);

    var vSize = gl.getAttribLocation(program, "vSize");
    gl.vertexAttribPointer(vSize, 1, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vSize);
    gl.clear(gl.COLOR_BUFFER_BIT);

	
}

function startPlayingGame() {
	showChoicesStone(0);
	$(statusDisplay).html('('+ playerNames[PLAYER_1] + ') Pilih Bentuk Bidak');
	canvas.addEventListener('click', onSelectStoneForPlayer1);
	$('button#selectStone1').on('click', function() {
		if(currentSelectedStone != -1) {
			playerSelectedStone[PLAYER_1] = currentSelectedStone;
			currentSelectedStone = -1;
			canvas.removeEventListener('click', onSelectStoneForPlayer1);
			canvas.addEventListener('click', onSelectStoneForPlayer2);
			$('button#selectStone1').css({'display': 'none'});
			$(statusDisplay).html('('+ playerNames[PLAYER_2] + ') Pilih Bentuk Bidak');
			showChoicesStone(0);
		}
	})

	$('button#selectStone2').on('click', function() {
		if(currentSelectedStone != -1) {
			playerSelectedStone[PLAYER_2] = currentSelectedStone;
			currentSelectedStone = -1;
			canvas.removeEventListener('click', onSelectStoneForPlayer2);
			canvas.addEventListener('click', putStoneState);
			$(statusDisplay).html('Giliran ' + playerNames[currentPlayer]);
			$('button#selectStone2').css({'display': 'none'});
			renderStateOfGame(0);
		}
	});
}

function getIndexStateX(x) {
	if(x >= -1 && x <= -0.4) {
		return 0;
	} else if(x >= -0.35 && x <= 0.3) {
		return 1;
	} else {
		return 2;
	}
}

function getIndexStateOfGame(x, y) {
	var xTemp = getIndexStateX(x);
	if(y <= -0.38 && y >= -1) {
		return xTemp;
	} else if(y >= -0.32 && y <= 0.32) {
		return xTemp + 3;
	} else {
		return xTemp + 6;
	}
}

function moveStoneState(event) {
	var mousePoint  = vec2(((event.clientX - canvasOffsetLeft) / canvasWidth - 0.5)*2, 
		((event.clientY - canvasOffsetTop) / canvasHeight-0.5)*2);
	var stateIndex = getIndexStateOfGame(mousePoint[0], mousePoint[1]);
	if(moveClickedCount <= 0) {
		if(stateOfGames[stateIndex] == -1 || stateOfGames[stateIndex] != currentPlayer) {
			alert("Tidak Valid");
		} else {
			stateIndexTemp = stateIndex;
			moveClickedCount++;
		}
	} else {
		var temp = moveStone(stateIndexTemp, stateIndex, currentPlayer);
		if(temp) {
			renderStateOfGame(0);
			if(checkWinner(currentPlayer)) {
				$(statusDisplay).html(playerNames[currentPlayer] + ' Menang!!!');
				canvas.removeEventListener('click', moveStoneState);
				return;
			}
			moveClickedCount = 0;
			if(currentPlayer == PLAYER_1) {
				currentPlayer = PLAYER_2;
			} else {
				currentPlayer = PLAYER_1;	
			}
		} else {
			moveClickedCount = 0;
		}
		
	}
	$(statusDisplay).html('Giliran ' + playerNames[currentPlayer]);

}

function putStoneState(event) {
	var mousePoint  = vec2(((event.clientX - canvasOffsetLeft) / canvasWidth - 0.5)*2, 
		((event.clientY - canvasOffsetTop) / canvasHeight-0.5)*2);
	var stateIndex = getIndexStateOfGame(mousePoint[0], mousePoint[1]);
	var temp = putStone(stateIndex, currentPlayer);
	if(temp) {
		var total = renderStateOfGame(0);
		var start = total;
		if(checkWinner(currentPlayer)) {
			$(statusDisplay).html(playerNames[currentPlayer] + ' Menang!!!');
			for(var i = 0;i<stateOfGames.length;i++) {
				if(stateOfGames[i] == currentPlayer) {
					if(playerSelectedStone[currentPlayer] == CIRCLE_STONE) {
						var x;
						var y;
						x = -0.5 - 0.2 + (i%3)*0.5 + (i % 3)*0.2;
						if(i>=0 && i<=2) {
							y = 0.5 + 0.2;
						} else if(i >= 3 && i <= 5) {
							y = 0;
						} else {
							y = -0.5 - 0.2;
						}
						var count = 0;
						var radius = 0.4;
						radius = radius * 0.5;
						// gl.clear(gl.COLOR_BUFFER_BIT);
						var points = [];
						var numPoints = 1000;
						for (var i = 0; i < numPoints; i++){
						    points.push(vec2(x +
						        radius*Math.cos(i*2*Math.PI/numPoints),
						        y + radius*Math.sin(i*2*Math.PI/numPoints) 
						    ));
						}

						for(var i = 0;i<points.length;i++) {
							gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
							gl.bufferSubData(gl.ARRAY_BUFFER, total*8.0, flatten(points[i]));
							total++;
							count++;
						}
						scalePiece(start, count);
					} else if(playerSelectedStone[currentPlayer] == RECTANGLE_STONE) {

					} else {

					}
				}
			}
			canvas.removeEventListener('click', putStoneState);
			return;
		} else {
			if(currentPlayer == PLAYER_1) {
				currentPlayer = PLAYER_2;
			} else {
				currentPlayer = PLAYER_1;
			}
			if(player3Stones[PLAYER_1] && player3Stones[PLAYER_2]) {
				canvas.removeEventListener('click', putStoneState);
				canvas.addEventListener('click', moveStoneState);
			}
		}
		
	}
	$(statusDisplay).html('Giliran ' + playerNames[currentPlayer]);
	
}	

function onSelectStoneForPlayer2(event) {
	var mousePoint  = vec2(((event.clientX - canvasOffsetLeft) / canvasWidth - 0.5)*2, 
		((event.clientY - canvasOffsetTop) / canvasHeight-0.5)*2);
	var index = 0;
	if(mousePoint[0] >= -0.6 && mousePoint[0] <= -0.1 && mousePoint[1] >= -0.25 && mousePoint[1] <= 0.25) {
		$('button#selectStone2').css({ 'display': 'block' });
		if(playerSelectedStone[PLAYER_1] == RECTANGLE_STONE) {
			currentSelectedStone = CIRCLE_STONE;
		} else {
			currentSelectedStone = RECTANGLE_STONE;
		}
		index = showChoicesStone(index);
		index = makeBoundaryLine(-0.55, 0.2, 0.45, index);
		gl.flush();
	} else if(mousePoint[0] >= 0.1 && mousePoint[0] <= 0.6 && mousePoint[1] >= -0.25 && mousePoint[1] <= 0.25) {
		$('button#selectStone2').css({ 'display': 'block' });
		if(playerSelectedStone[PLAYER_1] == TRIANGLE_STONE) {
			currentSelectedStone = CIRCLE_STONE;
		} else {
			currentSelectedStone = TRIANGLE_STONE;
		}
		index = showChoicesStone(index);
		index = makeBoundaryLine(0.1 ,0.2, 0.45, index);
		gl.flush();
	} else {
		$('button#selectStone2').css({ 'display': 'none' });
		currentSelectedStone = -1;
		index = showChoicesStone(index);
	}
	totalIndex = index;
}

function onSelectStoneForPlayer1(event) {
	var mousePoint  = vec2(((event.clientX - canvasOffsetLeft) / canvasWidth - 0.5)*2, 
		((event.clientY - canvasOffsetTop) / canvasHeight-0.5)*2);
	var index = 0;
	if(mousePoint[0] >= -0.9 && mousePoint[0] <= -0.4 && mousePoint[1] >= -0.25 && mousePoint[1] <= 0.25) {
		$('button#selectStone1').css({ 'display': 'block' });
		currentSelectedStone = RECTANGLE_STONE;
		index = showChoicesStone(index);
		index = makeBoundaryLine(-0.84, 0.2, 0.4, index);
		gl.flush();
	} else if(mousePoint[0] >= -0.25 && mousePoint[0] <= 0.25 && mousePoint[1] >= - 0.25 && mousePoint[1] <= 0.25) {
		$('button#selectStone1').css({ 'display': 'block' });
		currentSelectedStone = CIRCLE_STONE;
		index = showChoicesStone(index);
		index = makeBoundaryLine(-0.2, 0.2, 0.4, index);
		gl.flush();
	} else if (mousePoint[0] >= 0.4 && mousePoint[0] <= 0.9 && mousePoint[1] >= - 0.25 && mousePoint[1] <= 0.25) {
		$('button#selectStone1').css({ 'display': 'block' });
		currentSelectedStone = TRIANGLE_STONE;
		index = showChoicesStone(index);
		index = makeBoundaryLine(0.44, 0.2, 0.4, index);
		gl.flush();
	} else {
		$('button#selectStone1').css({ 'display': 'none' });
		currentSelectedStone = -1;
		index = showChoicesStone(index);
	}
	totalIndex = index;
}

function makeBoundaryLine(x, y, radius, index) {
	var start = index;
	var vertices = [
		vec2(x,y),
		vec2(x+radius, y),
		vec2(x+radius, y),
		vec2(x+radius, y - radius),
		vec2(x+radius, y - radius),
		vec2(x, y - radius),
		vec2(x, y - radius),
		vec2(x, y)
	];

	for(var i = 0;i<vertices.length;i++) {
		gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
		gl.bufferSubData(gl.ARRAY_BUFFER, index*8.0, flatten(vertices[i]));
		index++;
	}

	for(var i = 0;i < vertices.length; i+=2) {
		gl.drawArrays(gl.LINES, start + i, 2);
	}

	return index;
}

function makeTriangle(x, y, radius, index) {
	var start = index;
	// gl.clear(gl.COLOR_BUFFER_BIT);
	var vertices = [
		vec2(x, y + 0.5*radius),
		vec2(x - 0.5*radius, y-0.5*radius),
		vec2(x, y-0.5*radius),

		vec2(x, y + 0.5*radius),
		vec2(x + 0.5*radius, y-0.5*radius),
		vec2(x, y-0.5*radius)
	];

	for(var i = 0; i< vertices.length;i++) {
		gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
		gl.bufferSubData(gl.ARRAY_BUFFER, index*8.0, flatten(vertices[i]));
		index++;
	}

	for(var i = 0; i < vertices.length; i+=3) {
		gl.drawArrays(gl.TRIANGLES, start + i, 3);
	}

	return index;
}

function makeRectangle(x, y, radius, index) {
	var start = index;
	// gl.clear(gl.COLOR_BUFFER_BIT);
	var vertices = [
		vec2(x-0.5*radius, y-0.5*radius),
		vec2(x-0.5*radius, y+0.5*radius),
		vec2(x+0.5*radius, y-0.5*radius),
		vec2(x+0.5*radius, y+0.5*radius),
	];


	for(var i = 0;i<vertices.length;i++) {
		gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
		gl.bufferSubData(gl.ARRAY_BUFFER, index*8.0, flatten(vertices[i]));
		index++;
	}
	gl.drawArrays(gl.TRIANGLE_STRIP, start, 4);
	return index;

}

function makeCircle(x, y, radius, index) {
	var start = index;
	radius = radius * 0.5;
	// gl.clear(gl.COLOR_BUFFER_BIT);
	var points = [];
	var numPoints = 1000;
	for (var i = 0; i < numPoints; i++){
	    points.push(vec2(x +
	        radius*Math.cos(i*2*Math.PI/numPoints),
	        y + radius*Math.sin(i*2*Math.PI/numPoints) 
	    ));
	}

	for(var i = 0;i<points.length;i++) {
		gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
		gl.bufferSubData(gl.ARRAY_BUFFER, index*8.0, flatten(points[i]));
		index++;
	}
	
	gl.drawArrays(gl.TRIANGLE_FAN, start, numPoints);
	return index;
}

function showChoicesStone(index) {
	var start = 0;
	gl.clear(gl.COLOR_BUFFER_BIT);

	if(playerSelectedStone[PLAYER_1] == -1) {
		index = makeRectangle(-0.84 + 0.2, 0, 0.3, index);
		index = makeCircle(0, 0, 0.3, index);
		index = makeTriangle(0.84 - 0.2, 0, 0.3, index);
	} else {
		if(playerSelectedStone[PLAYER_1] == 0) {
			index = makeCircle(-1/3.0, 0, 0.3, index);
			index = makeTriangle(1/3.0, 0, 0.3, index);
		} else if(playerSelectedStone[PLAYER_1] == 1) {
			index = makeRectangle(-1/3.0, 0, 0.3, index);
			index = makeTriangle(1/3.0, 0, 0.3, index);
		} else if(playerSelectedStone[PLAYER_1] == 2) {
			index = makeRectangle(-1/3.0, 0, 0.3, index);
			index = makeCircle(1/3.0, 0, 0.3, index);
		}
	}

	return index;

}

function renderStateOfGame(index) {
	var start = index;
	index = makeSeparatorLine(index);
	for(var i = 0;i<stateOfGames.length;i++) {
		var x;
		var y;
		x = -0.5 - 0.2 + (i%3)*0.5 + (i % 3)*0.2;
		if(i>=0 && i<=2) {
			y = 0.5 + 0.2;
		} else if(i >= 3 && i <= 5) {
			y = 0;
		} else {
			y = -0.5 - 0.2;
		}
		if(stateOfGames[i] == PLAYER_1) {
			var stone = playerSelectedStone[PLAYER_1];
			if(stone == RECTANGLE_STONE) {
				index = makeRectangle(x, y, 0.4, index);
			} else if(stone == CIRCLE_STONE) {
				index = makeCircle(x, y, 0.4, index);
			} else {
				index = makeTriangle(x, y, 0.4, index);
			}
		} else if(stateOfGames[i] == PLAYER_2) {
			var stone = playerSelectedStone[PLAYER_2];
			if(stone == RECTANGLE_STONE) {
				index = makeRectangle(x, y, 0.4, index);
			} else if(stone == CIRCLE_STONE) {
				index = makeCircle(x, y, 0.4, index);
			} else {
				index = makeTriangle(x, y, 0.4, index);
			}
		}
	}
	return index;
}

function makeSeparatorLine(index) {
	var start = index;
	var lineWidth = 0.03;
	gl.clear(gl.COLOR_BUFFER_BIT);
	var vertices = [
	 	vec2(-1/3.0 - lineWidth,  -1),
	 	vec2(-1/3.0- lineWidth, 1),
	 	vec2(-1/3.0, -1),
        vec2(-1/3.0,  1),
       	
        vec2(1/3.0 + lineWidth,  -1),
	 	vec2(1/3.0 + lineWidth, 1),
	 	vec2(1/3.0, -1),
        vec2(1/3.0,  1),

        vec2(-1, -1/3.0 - lineWidth),
        vec2(1, -1/3.0 - lineWidth),
        vec2(-1, -1/3.0),
        vec2(1, -1/3.0),

        vec2(-1, 1/3.0 + lineWidth),
        vec2(1, 1/3.0 + lineWidth),
        vec2(-1, 1/3.0),
        vec2(1, 1/3.0),


    ];

    var lineColor = vec4(1.0, 1.0, 1.0, 1.0);
    var pointSize = new Float32Array([20.0]);

    for(var i = 0;i<vertices.length;i++) {
    	gl.lineWidth(8)

    	gl.bindBuffer( gl.ARRAY_BUFFER, cBufferId );
	    gl.bufferSubData(gl.ARRAY_BUFFER, index*16.0, flatten(lineColor));

	    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
	    gl.bufferSubData( gl.ARRAY_BUFFER, index*8.0, flatten(vertices[i]));

	    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBufferId);
	    gl.bufferSubData(gl.ARRAY_BUFFER, index*4.0, flatten(pointSize));

	    index++;
    }

    
   	for(var i = 0;i<index;i+=4) {
   		gl.drawArrays(gl.TRIANGLE_STRIP, start+i, 4);
   	}

   	return index;
}
