"use-strict";
// Global Variable
var canvas;
var gl;
var maxNumVertices = 20000;
// var index = 0;
// State untuk game, jika 0 adalah pemain 1 dan kalo 1 adalah pemain 2
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

// Beberapa variable untuk menghandle animasi, dan mengatur attribut 
// canvas

var translation = [300, 250]
var canvasWidth;
var canvasHeight;

// Jenis piece
var RECTANGLE_STONE = 0;
var CIRCLE_STONE = 1;
var TRIANGLE_STONE = 2;
var currentSelectedStone = -1;

// Buffer untuk vertex, color, dan point size
var cBufferId, bufferId, sizeBufferId;
var canvasOffsetTop, canvasOffsetLeft;
var totalIndex = 0;

var statusDisplay;

// Beberapa Attribute untuk transformasi matrix

var movement = 1;
var scaleFactor = 0.005;
var currentScale = 0.005;
var currentPosition = 0;
var targetPosition = 0;
var translateFactor = 0.01;
var scale = [1.0, 1.0];
var angle = 0.0;
var renderAnimateLoadingId;
var matrixLocation;
var colorUniformLocation;

// Merupakan fungsi yang memberikan animasi untuk setiap piece ketika menang
// Jika piece adalah kotak maka akan bergerak ke kanan ke kiri
// Jika lingkaran maka, akan scale up down
// Jika segitiga maka, akan bergerak naik turun
function animatePiece(index) {
	index = makeSeparatorLine(index);
	for(var i = 0;i<stateOfGames.length;i++) {
		var x;
		var y;
		radius = 0.4;
		x = -0.5 - 0.2 + (i%3)*0.5 + (i % 3)*0.2;
		if(i>=0 && i<=2) {
			y = 0.5 + 0.2;
		} else if(i >= 3 && i <= 5) {
			y = 0;
		} else {
			y = -0.5 - 0.2;
		}
		var otherplayer;
		if(currentPlayer == PLAYER_1) {
			otherplayer = PLAYER_2;
		} else {
			otherplayer = PLAYER_1;
		}
		angle += 1.0;
		if(stateOfGames[i] == currentPlayer) {
			var stone = playerSelectedStone[currentPlayer];
			var type;
			var count;
			currentPosition += translateFactor;
			if(currentPosition > 0.12) {
				currentPosition = 0.12;
				translateFactor = -1*translateFactor;
			}
			if(currentPosition < -0.12) {
				currentPosition = -0.12;
				translateFactor = -1*translateFactor;
			}
			if(stone == RECTANGLE_STONE) {
				var start = index;
				// gl.clear(gl.COLOR_BUFFER_BIT);
				var vertices = [
					vec2(x-0.5*radius, y-0.5*radius),
					vec2(x-0.5*radius, y+0.5*radius),
					vec2(x+0.5*radius, y-0.5*radius),
					vec2(x+0.5*radius, y+0.5*radius),
				];
				console.log(x);
				for(var j = 0;j<vertices.length;j++) {
					gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
					gl.bufferSubData(gl.ARRAY_BUFFER, index*8.0, flatten(vertices[j]));
					index++;
				}
				var matrix = m3.identity();
				var translationMatrix = m3.translation(currentPosition, 0);
				matrix = m3.multiply(matrix, translationMatrix);
				gl.uniform4f(colorUniformLocation, 0, 1, 0, 1);
				gl.uniformMatrix3fv(matrixLocation, false, matrix);
				gl.drawArrays(gl.TRIANGLE_STRIP, start, 4);

			} else if(stone == CIRCLE_STONE) {
				count = 1000;
				type = gl.TRIANGLE_FAN;
				var start = index;
				radius = radius * 0.5;
				// gl.clear(gl.COLOR_BUFFER_BIT);
				var points = [];
				var numPoints = 1000;
				currentScale += scaleFactor;
				if(currentScale > 0.3) {
					currentScale = 0.3;
					scaleFactor = -1*scaleFactor;
				}
				if(currentScale < 0.05) {
					currentScale = 0.05;
					scaleFactor = -1*scaleFactor;
				}
				var matrix = m3.identity();
				var scaleMatrix = m3.scaling(scale[0] + currentScale, scale[1] + currentScale);
				matrix = m3.multiply(matrix, scaleMatrix);
				gl.uniform4f(colorUniformLocation, 0, 1, 0, 1);
				gl.uniformMatrix3fv(matrixLocation, false, matrix);
				for (var j = 0; j < numPoints; j++){
				    points.push(vec2(x +
				        radius*Math.cos(j*2*Math.PI/numPoints),
				        y + radius*Math.sin(j*2*Math.PI/numPoints) 
				    ));
				}

				for(var j = 0;j<points.length;j++) {
					gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
					gl.bufferSubData(gl.ARRAY_BUFFER, index*8.0, flatten(points[j]));
					index++;
				}
				gl.drawArrays( type, start, count);
			} else {
				type = gl.TRIANGLES;
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

				for(var j = 0; j< vertices.length;j++) {
					gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
					gl.bufferSubData(gl.ARRAY_BUFFER, index*8.0, flatten(vertices[j]));
					index++;
				}	
				for(var j = 0; j < vertices.length; j+=3) {
					var matrix = m3.identity();
					var translationMatrix = m3.translation(0, currentPosition);
					matrix = m3.multiply(matrix, translationMatrix);
					gl.uniform4f(colorUniformLocation, 0, 1, 0, 1);
					gl.uniformMatrix3fv(matrixLocation, false, matrix);
					gl.drawArrays(gl.TRIANGLES, start + j, 3);
				}

			}
		} else if (stateOfGames[i] == otherplayer) {
			// Bagian ini untuk merender object yang tidak memerlukan animasi
			// jadi hanya dikenai transformasi matrix indentity
			var stone = playerSelectedStone[otherplayer];
			if(stone == RECTANGLE_STONE) {
				index = makeRectangle(x, y, 0.4, index);
			} else if(stone == CIRCLE_STONE) {
				index = makeCircle(x, y, 0.4, index);
			} else {
				index = makeTriangle(x, y, 0.4, index);
			}
		}
	}
}

// fungsi untuk animasi setelah menang
function renderAnimate() {
	animatePiece(0);
	requestAnimationFrame(renderAnimate);
}
 
// Beberapa fungsi untuk operasi-operasi transformasi matrix
// Diambil dari contoh code
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

// Fungsi untuk mengecek apakah pemain sudah meletakkan batu dengan
// jumlah 3
function getPlayer3Stones (PLAYER_NUM) {
	return player3Stones[PLAYER_NUM];
}

// Fungsi untuk mengecek apakah ada pemain dengan langkah terakhir
// akan meraih kemenangan dalam game
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
			isWin = isWin || (stateOfGames[lastStep] == stateOfGames[lastStep-3] 
				&& stateOfGames[lastStep] == stateOfGames[lastStep+3]);
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
		return isWin;
	}
}

// Jika pemain sudah meletakkan batu berjumlah tiga
// kemungkinan langkah yang dapat diambil adalah memindahkan dari satu
// kotak dengan tempat lain yang berdekatan / bersisihan.
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

// Jika batu yang diletakkan kurang dari 3, maka tidak boleh melakukan pemindahan batu
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

// Fungsi yang di jalankan ketika semua objek dalam dokumen sudah di muat semuanya
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
		setTimeout(startPlayingGame, 3000);
		renderAnimateLoading();
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

	// Beberapa inisisasi konfigurasi mengatur canvas dan GL
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

   	bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STATIC_DRAW );

    var vPos = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPos, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPos );

    matrixLocation = gl.getUniformLocation(program, "u_matrix");
    colorUniformLocation = gl.getUniformLocation(program, "u_color");

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

// Fungsi yang menampilkan kotak berputar sebelum memilih piece
// Dummy loading
function animateLoading(x, y, index) {
	angle += 1.0;
	var radius = 0.4;
	var angleInRadians = (angle * Math.PI/180); //rotating counter clockwise

	var start = 0;
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
	var matrix = m3.identity();
	var rotationMatrix = m3.rotation(angleInRadians);
	matrix = m3.multiply(matrix, rotationMatrix);
	gl.uniform4f(colorUniformLocation, 0, 1, 0, 1);
	gl.uniformMatrix3fv(matrixLocation, false, matrix);
	gl.drawArrays(gl.TRIANGLE_STRIP, start, 4);
}

// Fungsi akan dipanggil terus menerus
function renderAnimateLoading() {
	animateLoading(0,0,0);
	renderAnimateLoadingId = requestAnimationFrame(renderAnimateLoading);
}

// Jika kedua pemain selesai memasukkan nama, maka permainan dimulai
function startPlayingGame() {
	window.cancelAnimationFrame(renderAnimateLoadingId);
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

// Menentukan posisi index dalam array jika diberikan koordinat mousepoint dalam canvas
// mmengembalikan nila antara 0-2, dan akan dikombinasikan dengan fngsi di bawah
function getIndexStateX(x) {
	if(x >= -1 && x <= -0.4) {
		return 0;
	} else if(x >= -0.35 && x <= 0.3) {
		return 1;
	} else {
		return 2;
	}
}

// Mengembalikan nilai index kotak dalam array jika diberikkan koordinat mouse point X, dan Y
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

// Fungsi yang memvalidasi langakah move sebelum di lanjutkan ke fungsi moveStone, yang
// langsung beroperasi pada array stateOfGame
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
				renderAnimate();
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

// Meyhod yang memvalidasi input klik sebelum diteruskan ke fungsi putStone
function putStoneState(event) {
	var mousePoint  = vec2(((event.clientX - canvasOffsetLeft) / canvasWidth - 0.5)*2, 
		((event.clientY - canvasOffsetTop) / canvasHeight-0.5)*2);
	var stateIndex = getIndexStateOfGame(mousePoint[0], mousePoint[1]);
	var temp = putStone(stateIndex, currentPlayer);
	if(temp) {
		renderStateOfGame(0);
		if(checkWinner(currentPlayer)) {
			$(statusDisplay).html(playerNames[currentPlayer] + ' Menang!!!');
			renderAnimate();
			canvas.removeEventListener('click', putStoneState);
			canvas.removeEventListener('click', moveStoneState);
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

// Fungsi callback ketika pemain 2 sudah memilih piece / batu
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

// Fungsi callback ketika pemain 1 sudah memilih piece / batu
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

// Memberikan outline garis ke piece yang di klik oleh pemain
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


// Fungsi untuk membuat bentuk segitiga pada suatu koordinat x, y dan radius tertentu
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
		var matrix = m3.identity();
		gl.uniform4f(colorUniformLocation, 0, 1, 0, 1);
		gl.uniformMatrix3fv(matrixLocation, false, matrix);
		gl.drawArrays(gl.TRIANGLES, start + i, 3);
	}

	return index;
}

// Fungsi untuk membuat bentuk segi empat pada suatu koordinat x, y dan radius tertentu
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
	var matrix = m3.identity();
	gl.uniform4f(colorUniformLocation, 0, 1, 0, 1);
	gl.uniformMatrix3fv(matrixLocation, false, matrix);
	gl.drawArrays(gl.TRIANGLE_STRIP, start, 4);
	return index;

}

// Fungsi untuk membuat bentuk lingkaran pada suatu koordinat x, y dan radius tertentu
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
	var matrix = m3.identity();
	gl.uniform4f(colorUniformLocation, 0, 1, 0, 1);
	gl.uniformMatrix3fv(matrixLocation, false, matrix);
	gl.drawArrays(gl.TRIANGLE_FAN, start, numPoints);
	return index;
}

// Menampilkan pilihan piece untuk pemain
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

// Merender state dari game, untuk setiap putStone, dan moveStone akan memanggil fungsi ini
// untuk mengupdate tampilan dari state of game
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

// Fungsi untuk membuat separator line (grid)
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

    matrix = m3.identity();
   	for(var i = 0;i<index;i+=4) {
   		gl.uniformMatrix3fv(matrixLocation, false, matrix);
   		gl.drawArrays(gl.TRIANGLE_STRIP, start+i, 4);
   	}

   	return index;
}
