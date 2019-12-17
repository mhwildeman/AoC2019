class Program {
    constructor(code) {
        this.code = code.split(',').map(Number);
        this.inputLocation = 0;
        this.pointer = 0;
        this.output = "";
        this.consumer = null;
        this.input = [];
        this.relativeBase = 0;
        this.executedIntructions = 0;
        this.finished = false;
    }
    setInput(value) {
        value.forEach(element => {
            this.input.push(element);
        })
        
    }
    run(inputValue) {
        if (typeof inputValue != 'undefined') {
            this.input.push(inputValue);
        }
        while (this.executedIntructions < 1000000) {
            this.executedIntructions++;
            if (this.executedIntructions === 1000000) {
                console.log('Instructions exceeded. Wrong program?');
            }
            var instruction = this.code[this.pointer];
            var A = 0, B = 0, C = 0, opCode = 0;

            if (instruction >= 20000) {
                //How can this ever be true? It's never used...
                instruction -= 20000;
                A = 2;
            } if (instruction >= 10000) {
                //How can this ever be true? It's never used...
                instruction -= 10000;
                A = 1;
            }
            if (instruction >= 2000) {
                instruction -= 2000;
                B = 2;
            } if (instruction >= 1000) {
                instruction -= 1000;
                B = 1;
            }
            if (instruction >= 200) {
                instruction -= 200;
                C = 2;
            } if (instruction >= 100) {
                instruction -= 100;
                C = 1;
            }
            opCode = instruction;

            var destinationAddress = 0;
            var firstParam = 0;
            var secondParam = 0;

            switch (A) {
                case 2:
                    destinationAddress = this.code[this.pointer + 3] + this.relativeBase;
                    break;
                case 1:
                    //This still should not happen.
                    destinationAddress = 0;
                    console.log('Error');
                    throw (new Error('Unexpected desitnation address'));
                    break;
                default:
                    destinationAddress = this.code[this.pointer + 3];
                    break;
            }

            switch (B) {
                case 2:
                    //Relative mode
                    secondParam = this.code[this.code[this.pointer + 2] + this.relativeBase]
                    break;
                case 1:
                    //Direct mode
                    secondParam = this.code[this.pointer + 2];
                    break;
                default:
                    //Address mode
                    secondParam = this.code[this.code[this.pointer + 2]]
                    break;
            }
            switch (C) {
                case 2:
                    //Relative mode
                    firstParam = this.code[this.code[this.pointer + 1] + this.relativeBase]
                    break;
                case 1:
                    //Direct mode
                    firstParam = this.code[this.pointer + 1];
                    break;
                default:
                    //Address mode
                    firstParam = this.code[this.code[this.pointer + 1]]
                    break;
            }
            if (typeof secondParam === 'undefined') {
                //We're pointing to a non initialized memory location. Assume 0;
                secondParam = 0;
            }
            if (typeof firstParam === 'undefined') {
                //We're pointing to a non initialized memory location. Assume 0;
                firstParam = 0;
            }

            //Parameters that an instruction writes to will never be in immediate mode.
            switch (opCode) {
                case 1:
                    //Addition
                    this.code[destinationAddress] = firstParam + secondParam;
                    this.pointer += 4; // three parameters
                    break;
                case 2:
                    //Multiply
                    this.code[destinationAddress] = firstParam * secondParam;
                    this.pointer += 4; // three parameters
                    break;
                case 3:
                    //Read from input and store to location.
                    //console.log(this.input[this.inputLocation]);
                    if (C == 2) {
                        this.code[this.code[this.pointer + 1] + this.relativeBase] = this.input[this.inputLocation];
                    }
                    else {
                        this.code[this.code[this.pointer + 1]] = this.input[this.inputLocation];
                    }
                    this.inputLocation++;
                    this.pointer += 2; // one parameter
                    break;
                case 4:
                    //Read
                    this.output = firstParam;
                    this.pointer += 2; // one parameter
                    return this.output;
                    break;
                case 5:
                    //Jump if true
                    if (firstParam !== 0) {
                        this.pointer = secondParam
                    }
                    else {
                        this.pointer += 3; // two parameters
                    }
                    break;
                case 6:
                    //Jump if false
                    if (firstParam === 0) {
                        this.pointer = secondParam
                    }
                    else {
                        this.pointer += 3; // two parameters
                    }
                    break;
                case 7:
                    //Less than
                    this.code[destinationAddress] = firstParam < secondParam ? 1 : 0;
                    this.pointer += 4; // three parameters
                    break;
                case 8:
                    //Equals
                    this.code[destinationAddress] = firstParam === secondParam ? 1 : 0;
                    this.pointer += 4; // three parameters
                    break;
                case 9:
                    //Modify relative base
                    this.relativeBase += firstParam;
                    this.pointer += 2; // one parameter
                    break;

                case 99:
                    this.finished = true;
                    console.log('done');
                    return this.output;
                    break;
                default:
                    console.log('Error');
                    throw (new Error('Unexpected opcode'));
            }
        }
    }
    setConsumer(consumer) {
        this.consumer = consumer;
    }
}
class Tile {
    constructor(type, x, y) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.distanceFromOxygen = 0;
        this.checkedPosition = [-1, -1, -1, -1];
        this.origin = 0;
        this.finished = false;
    }
    setOrigin(x, y) {
        switch (true) {
            case y < this.y:
                this.origin = 1;
                break;
            case y > this.y:
                this.origin = 2;
                break;
            case x < this.x:
                this.origin = 3;
                break;
            case x > this.x:
                this.origin = 4;
                break;
        }
        this.checkedPosition[this.origin - 1] = 'origin';
    }
    setBlocked(direction) {
        this.checkedPosition[direction - 1] = 'blocked';
    }
    getNextDirection() {
        var direction = 0;
        for (var i = 0; i < 4; i++) {
            if (this.checkedPosition[i] === -1) {
                direction = i + 1;
                break;
            }
        }
        if (direction > 0) { return direction; }
        this.finished = true;
        return this.origin;
    }
}

class RepairDroid {
    constructor(code) {
        this.program = new Program(code)
        this.tiles = {}
        this.tiles[0] = {};
        this.tiles[0][0] = new Tile(1, 0, 0)
        this.triedSteps = [this.tiles[0][0]];
        this.x = 0;
        this.y = 0;
        this.foundDistance = 0;
    }
    start() {
        this.amountOfStepsNeeded()
    }
    amountOfStepsNeeded() {
        var direction = 1;
        var removing = false;
        while (!this.program.finished) {
            var result = this.program.run(direction); //start North
            var tile = this.triedSteps[this.triedSteps.length - 1];
            //We add tile to route and update location.
            switch (direction) {
                case 1:
                    this.y--;
                    break;
                case 2:
                    this.y++;
                    break;
                case 3:
                    this.x--;
                    break;
                case 4:
                    this.x++;
                    break;
            }
            tile = this.setTyle(result, this.x, this.y, this.triedSteps[this.triedSteps.length - 1]);
            switch (result) {
                case 1:
                    //empty
                    if (!removing) {
                        this.triedSteps.push(tile);
                    }
                    else {
                        removing = false;
                    }
                    break;
                case 0:
                    //wall
                    tile = this.triedSteps[this.triedSteps.length - 1];
                    tile.setBlocked(direction);
                    //We add tile to route and update location.
                    switch (direction) {
                        case 1:
                            this.y++;
                            break;
                        case 2:
                            this.y--;
                            break;
                        case 3:
                            this.x++;
                            break;
                        case 4:
                            this.x--;
                            break;
                    }
                    break;
                case 2:
                    //hit!
                    this.foundDistance = this.triedSteps.length;
                    this.triedSteps.push(tile);
                    break;
            }
            direction = this.getNextDirection(tile);
            if (tile.finished) {
                var oppositeDirection = direction;
                switch (direction) {
                    case 1:
                        oppositeDirection = 2;
                        break;
                    case 2:
                        oppositeDirection = 1;
                        break;
                    case 3:
                        oppositeDirection = 4;
                        break;
                    case 4:
                        oppositeDirection = 3;
                        break;
                }
                //Tile is finished. This means we're moving back to origin.
                this.triedSteps.pop();
                if (this.triedSteps.length > 0) {
                    this.triedSteps[this.triedSteps.length - 1].setBlocked(oppositeDirection);
                }
                removing = true;
            }
        }
    }
    setTyle(type, locationX, locatoinY, lastTyle) {
        if (!this.tiles[locationX]) { this.tiles[locationX] = {} }
        if (!this.tiles[locationX][locatoinY]) {
            this.tiles[locationX][locatoinY] = new Tile(type, locationX, locatoinY);
            this.tiles[locationX][locatoinY].setOrigin(lastTyle.x, lastTyle.y);
        }
        var returnTile = this.tiles[locationX][locatoinY];
        return returnTile;
    }
    getNextDirection(tile) {
        return tile.getNextDirection();
    }
}

var convertToTable = function (minx, maxx, miny, maxy, template) {
    var table = '<table>';
    for (var row = miny; row < maxy; row++) {
        table += '<tr>';
        for (var column = minx; column < maxx; column++) {
            var value = 0;
            if (template[row] && template[row][column]) {
                value = template[row][column];
            }
            // if(column==0&&row==0){
            //     value = 3;
            // }
            switch (value) {
                case '#':
                    table += '<td class="black"></td>';
                    break;
                case '.':
                    table += '<td class="white"></td>';
                    break;
                case '^':
                case '>':
                case '<':
                case 'v':
                    table += '<td class="ball">' + value + '</td>';
                    break;
                case 'O':
                    table += '<td class="paddle"></td>';
                    break;
                case 4:
                    table += '<td class="ball"></td>';
                    break;
            }

        }
        table += '</tr>';
    }
    table += '</table>';
    return table;
}

var markIntersections = function (template, interSections) {
    var interSectionValue = 0;
    for (y = 0; y < template.length; y++) {
        for (x = 0; x < template[y].length; x++) {
            upperCell = y > 0 ? template[y - 1][x] : '.';
            leftCell = x > 0 ? template[y][x - 1] : '.';
            rightCell = x < template[y].length - 1 ? template[y][x + 1] : '.';
            bottomCell = y < template.length - 1 ? template[y + 1][x] : '.';
            var count = 0;
            if (upperCell === '#') {
                count++;
            }
            if (leftCell === '#') {
                count++;
            }
            if (rightCell === '#') {
                count++;
            }
            if (bottomCell === '#') {
                count++;
            }
            if(count>2 && template[y][x]!=='.'){
                template[y][x]='O'
                interSectionValue+=x*y;
                interSections.push({x:x,y:y});
            }
        }
    }
return interSectionValue;
}

function convertToInstruction(code){
    var numeric = [];
    for(var i=0;i<code.length;i++){
        numeric.push(code.charCodeAt(i));
    }
    numeric.push(10);
    return numeric;
}


var startTime = Date.now();

//Puzzle part 1:
console.log('Part 1:')
var code = "1,330,331,332,109,3544,1101,0,1182,15,1102,1453,1,24,1002,0,1,570,1006,570,36,1001,571,0,0,1001,570,-1,570,1001,24,1,24,1106,0,18,1008,571,0,571,1001,15,1,15,1008,15,1453,570,1006,570,14,21101,58,0,0,1106,0,786,1006,332,62,99,21101,0,333,1,21101,0,73,0,1105,1,579,1102,1,0,572,1101,0,0,573,3,574,101,1,573,573,1007,574,65,570,1005,570,151,107,67,574,570,1005,570,151,1001,574,-64,574,1002,574,-1,574,1001,572,1,572,1007,572,11,570,1006,570,165,101,1182,572,127,102,1,574,0,3,574,101,1,573,573,1008,574,10,570,1005,570,189,1008,574,44,570,1006,570,158,1105,1,81,21101,0,340,1,1105,1,177,21101,0,477,1,1106,0,177,21101,514,0,1,21102,176,1,0,1105,1,579,99,21101,184,0,0,1105,1,579,4,574,104,10,99,1007,573,22,570,1006,570,165,1002,572,1,1182,21101,375,0,1,21102,1,211,0,1106,0,579,21101,1182,11,1,21102,1,222,0,1106,0,979,21102,388,1,1,21101,233,0,0,1105,1,579,21101,1182,22,1,21101,244,0,0,1106,0,979,21102,1,401,1,21101,0,255,0,1105,1,579,21101,1182,33,1,21102,1,266,0,1105,1,979,21102,414,1,1,21102,1,277,0,1106,0,579,3,575,1008,575,89,570,1008,575,121,575,1,575,570,575,3,574,1008,574,10,570,1006,570,291,104,10,21102,1,1182,1,21101,0,313,0,1105,1,622,1005,575,327,1102,1,1,575,21101,0,327,0,1105,1,786,4,438,99,0,1,1,6,77,97,105,110,58,10,33,10,69,120,112,101,99,116,101,100,32,102,117,110,99,116,105,111,110,32,110,97,109,101,32,98,117,116,32,103,111,116,58,32,0,12,70,117,110,99,116,105,111,110,32,65,58,10,12,70,117,110,99,116,105,111,110,32,66,58,10,12,70,117,110,99,116,105,111,110,32,67,58,10,23,67,111,110,116,105,110,117,111,117,115,32,118,105,100,101,111,32,102,101,101,100,63,10,0,37,10,69,120,112,101,99,116,101,100,32,82,44,32,76,44,32,111,114,32,100,105,115,116,97,110,99,101,32,98,117,116,32,103,111,116,58,32,36,10,69,120,112,101,99,116,101,100,32,99,111,109,109,97,32,111,114,32,110,101,119,108,105,110,101,32,98,117,116,32,103,111,116,58,32,43,10,68,101,102,105,110,105,116,105,111,110,115,32,109,97,121,32,98,101,32,97,116,32,109,111,115,116,32,50,48,32,99,104,97,114,97,99,116,101,114,115,33,10,94,62,118,60,0,1,0,-1,-1,0,1,0,0,0,0,0,0,1,26,40,0,109,4,2101,0,-3,586,21002,0,1,-1,22101,1,-3,-3,21101,0,0,-2,2208,-2,-1,570,1005,570,617,2201,-3,-2,609,4,0,21201,-2,1,-2,1105,1,597,109,-4,2106,0,0,109,5,1201,-4,0,630,20102,1,0,-2,22101,1,-4,-4,21101,0,0,-3,2208,-3,-2,570,1005,570,781,2201,-4,-3,652,21001,0,0,-1,1208,-1,-4,570,1005,570,709,1208,-1,-5,570,1005,570,734,1207,-1,0,570,1005,570,759,1206,-1,774,1001,578,562,684,1,0,576,576,1001,578,566,692,1,0,577,577,21101,702,0,0,1105,1,786,21201,-1,-1,-1,1105,1,676,1001,578,1,578,1008,578,4,570,1006,570,724,1001,578,-4,578,21102,1,731,0,1105,1,786,1105,1,774,1001,578,-1,578,1008,578,-1,570,1006,570,749,1001,578,4,578,21102,1,756,0,1105,1,786,1105,1,774,21202,-1,-11,1,22101,1182,1,1,21101,774,0,0,1105,1,622,21201,-3,1,-3,1106,0,640,109,-5,2106,0,0,109,7,1005,575,802,20101,0,576,-6,20102,1,577,-5,1106,0,814,21101,0,0,-1,21102,0,1,-5,21102,1,0,-6,20208,-6,576,-2,208,-5,577,570,22002,570,-2,-2,21202,-5,51,-3,22201,-6,-3,-3,22101,1453,-3,-3,1202,-3,1,843,1005,0,863,21202,-2,42,-4,22101,46,-4,-4,1206,-2,924,21102,1,1,-1,1106,0,924,1205,-2,873,21101,35,0,-4,1106,0,924,2102,1,-3,878,1008,0,1,570,1006,570,916,1001,374,1,374,2102,1,-3,895,1102,2,1,0,1201,-3,0,902,1001,438,0,438,2202,-6,-5,570,1,570,374,570,1,570,438,438,1001,578,558,921,21002,0,1,-4,1006,575,959,204,-4,22101,1,-6,-6,1208,-6,51,570,1006,570,814,104,10,22101,1,-5,-5,1208,-5,41,570,1006,570,810,104,10,1206,-1,974,99,1206,-1,974,1102,1,1,575,21101,0,973,0,1105,1,786,99,109,-7,2105,1,0,109,6,21102,1,0,-4,21102,0,1,-3,203,-2,22101,1,-3,-3,21208,-2,82,-1,1205,-1,1030,21208,-2,76,-1,1205,-1,1037,21207,-2,48,-1,1205,-1,1124,22107,57,-2,-1,1205,-1,1124,21201,-2,-48,-2,1105,1,1041,21101,0,-4,-2,1105,1,1041,21102,-5,1,-2,21201,-4,1,-4,21207,-4,11,-1,1206,-1,1138,2201,-5,-4,1059,1202,-2,1,0,203,-2,22101,1,-3,-3,21207,-2,48,-1,1205,-1,1107,22107,57,-2,-1,1205,-1,1107,21201,-2,-48,-2,2201,-5,-4,1090,20102,10,0,-1,22201,-2,-1,-2,2201,-5,-4,1103,1201,-2,0,0,1106,0,1060,21208,-2,10,-1,1205,-1,1162,21208,-2,44,-1,1206,-1,1131,1105,1,989,21102,439,1,1,1105,1,1150,21101,477,0,1,1106,0,1150,21102,1,514,1,21101,0,1149,0,1106,0,579,99,21102,1157,1,0,1105,1,579,204,-2,104,10,99,21207,-3,22,-1,1206,-1,1138,2101,0,-5,1176,2101,0,-4,0,109,-6,2106,0,0,26,9,42,1,7,1,42,1,7,1,42,1,7,1,38,9,3,1,38,1,3,1,3,1,3,1,38,1,3,1,3,1,3,1,38,1,3,1,3,1,3,1,38,1,1,11,38,1,1,1,1,1,3,1,36,5,1,1,1,1,1,5,36,1,3,1,1,1,1,1,42,1,3,1,1,9,36,1,3,1,3,1,5,1,36,1,3,1,3,1,5,1,36,1,3,1,3,1,5,1,36,9,5,1,40,1,9,1,40,1,9,1,3,7,30,1,9,1,3,1,5,1,10,9,1,11,9,1,3,1,5,1,10,1,7,1,1,1,19,1,3,1,5,1,10,1,7,1,1,1,19,11,10,1,7,1,1,1,23,1,16,1,7,1,1,1,23,1,3,9,4,1,7,1,1,1,23,1,11,1,4,1,7,1,1,1,23,9,3,1,4,1,7,1,1,1,31,1,3,1,4,11,29,11,8,1,31,1,1,1,3,1,3,1,8,11,21,1,1,1,3,1,3,1,18,1,21,1,1,1,3,1,3,1,18,1,21,7,3,1,18,1,23,1,7,1,18,1,23,1,7,1,18,1,23,1,7,1,18,1,23,9,18,1,50,1,50,1,50,9,24";
var program = new Program(code);
var row = []
var matrix = [];
while (!program.finished) {
    var value = program.run();
    {
        switch (value) {
            case 10:
                //newLine
                matrix.push(row);
                row = [];
                break;
            default:
                row.push(String.fromCharCode(value));
                break;
        }
    }
}
var interSections = [];
var intersectionValue = markIntersections(matrix,interSections);

var table = convertToTable(0, matrix[0].length, 0, matrix.length, matrix);
$(document).ready(function () {
    $('#game').html(table);
});

console.log(intersectionValue);

var millis = Date.now() - startTime;
console.log(`Milliseconds elapsed = ${millis}`);


console.log('Part 2:')
var startTime = Date.now();
var code = "2,330,331,332,109,3544,1101,0,1182,15,1102,1453,1,24,1002,0,1,570,1006,570,36,1001,571,0,0,1001,570,-1,570,1001,24,1,24,1106,0,18,1008,571,0,571,1001,15,1,15,1008,15,1453,570,1006,570,14,21101,58,0,0,1106,0,786,1006,332,62,99,21101,0,333,1,21101,0,73,0,1105,1,579,1102,1,0,572,1101,0,0,573,3,574,101,1,573,573,1007,574,65,570,1005,570,151,107,67,574,570,1005,570,151,1001,574,-64,574,1002,574,-1,574,1001,572,1,572,1007,572,11,570,1006,570,165,101,1182,572,127,102,1,574,0,3,574,101,1,573,573,1008,574,10,570,1005,570,189,1008,574,44,570,1006,570,158,1105,1,81,21101,0,340,1,1105,1,177,21101,0,477,1,1106,0,177,21101,514,0,1,21102,176,1,0,1105,1,579,99,21101,184,0,0,1105,1,579,4,574,104,10,99,1007,573,22,570,1006,570,165,1002,572,1,1182,21101,375,0,1,21102,1,211,0,1106,0,579,21101,1182,11,1,21102,1,222,0,1106,0,979,21102,388,1,1,21101,233,0,0,1105,1,579,21101,1182,22,1,21101,244,0,0,1106,0,979,21102,1,401,1,21101,0,255,0,1105,1,579,21101,1182,33,1,21102,1,266,0,1105,1,979,21102,414,1,1,21102,1,277,0,1106,0,579,3,575,1008,575,89,570,1008,575,121,575,1,575,570,575,3,574,1008,574,10,570,1006,570,291,104,10,21102,1,1182,1,21101,0,313,0,1105,1,622,1005,575,327,1102,1,1,575,21101,0,327,0,1105,1,786,4,438,99,0,1,1,6,77,97,105,110,58,10,33,10,69,120,112,101,99,116,101,100,32,102,117,110,99,116,105,111,110,32,110,97,109,101,32,98,117,116,32,103,111,116,58,32,0,12,70,117,110,99,116,105,111,110,32,65,58,10,12,70,117,110,99,116,105,111,110,32,66,58,10,12,70,117,110,99,116,105,111,110,32,67,58,10,23,67,111,110,116,105,110,117,111,117,115,32,118,105,100,101,111,32,102,101,101,100,63,10,0,37,10,69,120,112,101,99,116,101,100,32,82,44,32,76,44,32,111,114,32,100,105,115,116,97,110,99,101,32,98,117,116,32,103,111,116,58,32,36,10,69,120,112,101,99,116,101,100,32,99,111,109,109,97,32,111,114,32,110,101,119,108,105,110,101,32,98,117,116,32,103,111,116,58,32,43,10,68,101,102,105,110,105,116,105,111,110,115,32,109,97,121,32,98,101,32,97,116,32,109,111,115,116,32,50,48,32,99,104,97,114,97,99,116,101,114,115,33,10,94,62,118,60,0,1,0,-1,-1,0,1,0,0,0,0,0,0,1,26,40,0,109,4,2101,0,-3,586,21002,0,1,-1,22101,1,-3,-3,21101,0,0,-2,2208,-2,-1,570,1005,570,617,2201,-3,-2,609,4,0,21201,-2,1,-2,1105,1,597,109,-4,2106,0,0,109,5,1201,-4,0,630,20102,1,0,-2,22101,1,-4,-4,21101,0,0,-3,2208,-3,-2,570,1005,570,781,2201,-4,-3,652,21001,0,0,-1,1208,-1,-4,570,1005,570,709,1208,-1,-5,570,1005,570,734,1207,-1,0,570,1005,570,759,1206,-1,774,1001,578,562,684,1,0,576,576,1001,578,566,692,1,0,577,577,21101,702,0,0,1105,1,786,21201,-1,-1,-1,1105,1,676,1001,578,1,578,1008,578,4,570,1006,570,724,1001,578,-4,578,21102,1,731,0,1105,1,786,1105,1,774,1001,578,-1,578,1008,578,-1,570,1006,570,749,1001,578,4,578,21102,1,756,0,1105,1,786,1105,1,774,21202,-1,-11,1,22101,1182,1,1,21101,774,0,0,1105,1,622,21201,-3,1,-3,1106,0,640,109,-5,2106,0,0,109,7,1005,575,802,20101,0,576,-6,20102,1,577,-5,1106,0,814,21101,0,0,-1,21102,0,1,-5,21102,1,0,-6,20208,-6,576,-2,208,-5,577,570,22002,570,-2,-2,21202,-5,51,-3,22201,-6,-3,-3,22101,1453,-3,-3,1202,-3,1,843,1005,0,863,21202,-2,42,-4,22101,46,-4,-4,1206,-2,924,21102,1,1,-1,1106,0,924,1205,-2,873,21101,35,0,-4,1106,0,924,2102,1,-3,878,1008,0,1,570,1006,570,916,1001,374,1,374,2102,1,-3,895,1102,2,1,0,1201,-3,0,902,1001,438,0,438,2202,-6,-5,570,1,570,374,570,1,570,438,438,1001,578,558,921,21002,0,1,-4,1006,575,959,204,-4,22101,1,-6,-6,1208,-6,51,570,1006,570,814,104,10,22101,1,-5,-5,1208,-5,41,570,1006,570,810,104,10,1206,-1,974,99,1206,-1,974,1102,1,1,575,21101,0,973,0,1105,1,786,99,109,-7,2105,1,0,109,6,21102,1,0,-4,21102,0,1,-3,203,-2,22101,1,-3,-3,21208,-2,82,-1,1205,-1,1030,21208,-2,76,-1,1205,-1,1037,21207,-2,48,-1,1205,-1,1124,22107,57,-2,-1,1205,-1,1124,21201,-2,-48,-2,1105,1,1041,21101,0,-4,-2,1105,1,1041,21102,-5,1,-2,21201,-4,1,-4,21207,-4,11,-1,1206,-1,1138,2201,-5,-4,1059,1202,-2,1,0,203,-2,22101,1,-3,-3,21207,-2,48,-1,1205,-1,1107,22107,57,-2,-1,1205,-1,1107,21201,-2,-48,-2,2201,-5,-4,1090,20102,10,0,-1,22201,-2,-1,-2,2201,-5,-4,1103,1201,-2,0,0,1106,0,1060,21208,-2,10,-1,1205,-1,1162,21208,-2,44,-1,1206,-1,1131,1105,1,989,21102,439,1,1,1105,1,1150,21101,477,0,1,1106,0,1150,21102,1,514,1,21101,0,1149,0,1106,0,579,99,21102,1157,1,0,1105,1,579,204,-2,104,10,99,21207,-3,22,-1,1206,-1,1138,2101,0,-5,1176,2101,0,-4,0,109,-6,2106,0,0,26,9,42,1,7,1,42,1,7,1,42,1,7,1,38,9,3,1,38,1,3,1,3,1,3,1,38,1,3,1,3,1,3,1,38,1,3,1,3,1,3,1,38,1,1,11,38,1,1,1,1,1,3,1,36,5,1,1,1,1,1,5,36,1,3,1,1,1,1,1,42,1,3,1,1,9,36,1,3,1,3,1,5,1,36,1,3,1,3,1,5,1,36,1,3,1,3,1,5,1,36,9,5,1,40,1,9,1,40,1,9,1,3,7,30,1,9,1,3,1,5,1,10,9,1,11,9,1,3,1,5,1,10,1,7,1,1,1,19,1,3,1,5,1,10,1,7,1,1,1,19,11,10,1,7,1,1,1,23,1,16,1,7,1,1,1,23,1,3,9,4,1,7,1,1,1,23,1,11,1,4,1,7,1,1,1,23,9,3,1,4,1,7,1,1,1,31,1,3,1,4,11,29,11,8,1,31,1,1,1,3,1,3,1,8,11,21,1,1,1,3,1,3,1,18,1,21,1,1,1,3,1,3,1,18,1,21,7,3,1,18,1,23,1,7,1,18,1,23,1,7,1,18,1,23,1,7,1,18,1,23,9,18,1,50,1,50,1,50,9,24";
var program = new Program(code);

//Do some paperwork. :-p
var main = convertToInstruction('A,B,A,C,B,C,A,C,B,C');
var A = convertToInstruction('L,8,R,10,L,10');
var B = convertToInstruction('R,10,L,8,L,8,L,10');
var C = convertToInstruction('L,4,L,6,L,8,L,8');
var feed = convertToInstruction('n');
program.setInput(main);
program.setInput(A);
program.setInput(B);
program.setInput(C);
program.setInput(feed);

var output = '';
var value = 0;
while (!program.finished) {
    value = program.run();
    {
        switch (value) {
            case 10:
                //newLine
                console.log(output);
                output = '';
                break;
            default:
                output +=String.fromCharCode(value);
                break;
        }
    }
}

console.log(value);
var millis = Date.now() - startTime;
console.log(`Milliseconds elapsed = ${millis}`);