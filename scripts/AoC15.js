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
        this.input = [value];
        this.inputLocation = 0;
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
                    if(!removing)
                    {
                        this.triedSteps.push(tile);
                    }
                    else
                    {
                        removing=false;
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
                if(this.triedSteps.length>0)
                {
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
    debugger;
    var table = '<table>';
    for (var row = miny; row < maxy; row++) {
        table += '<tr>';
        for (var column = minx; column < maxx; column++) {
            var value = 0;
            if (template[column] && template[column][row]) {
                value = template[column][row].type;
            }
            // if(column==0&&row==0){
            //     value = 3;
            // }
            switch (value) {
                case 0:
                    table += '<td class="black"></td>';
                    break;
                case 1:
                    table += '<td class="white"></td>';
                    break;
                case 2:
                    table += '<td class="ball"></td>';
                    break;
                case 3:
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


var startTime = Date.now();

//Puzzle part 1:
console.log('Part 1:')
var code = "3,1033,1008,1033,1,1032,1005,1032,31,1008,1033,2,1032,1005,1032,58,1008,1033,3,1032,1005,1032,81,1008,1033,4,1032,1005,1032,104,99,101,0,1034,1039,1002,1036,1,1041,1001,1035,-1,1040,1008,1038,0,1043,102,-1,1043,1032,1,1037,1032,1042,1105,1,124,1001,1034,0,1039,101,0,1036,1041,1001,1035,1,1040,1008,1038,0,1043,1,1037,1038,1042,1105,1,124,1001,1034,-1,1039,1008,1036,0,1041,102,1,1035,1040,1001,1038,0,1043,101,0,1037,1042,1106,0,124,1001,1034,1,1039,1008,1036,0,1041,101,0,1035,1040,1002,1038,1,1043,101,0,1037,1042,1006,1039,217,1006,1040,217,1008,1039,40,1032,1005,1032,217,1008,1040,40,1032,1005,1032,217,1008,1039,33,1032,1006,1032,165,1008,1040,35,1032,1006,1032,165,1101,0,2,1044,1105,1,224,2,1041,1043,1032,1006,1032,179,1101,0,1,1044,1106,0,224,1,1041,1043,1032,1006,1032,217,1,1042,1043,1032,1001,1032,-1,1032,1002,1032,39,1032,1,1032,1039,1032,101,-1,1032,1032,101,252,1032,211,1007,0,68,1044,1105,1,224,1101,0,0,1044,1106,0,224,1006,1044,247,101,0,1039,1034,102,1,1040,1035,1001,1041,0,1036,102,1,1043,1038,101,0,1042,1037,4,1044,1105,1,0,30,84,39,21,27,93,20,65,45,95,19,6,71,25,33,13,80,53,60,70,65,80,45,65,53,62,93,13,19,72,33,49,54,92,9,29,25,69,7,46,9,96,97,70,8,69,71,97,3,75,94,49,96,11,76,24,29,84,87,99,33,76,83,83,21,62,97,82,63,71,78,74,29,94,90,34,92,58,75,44,66,99,28,37,84,18,18,94,86,50,4,74,3,96,74,39,99,55,93,44,94,55,40,78,2,88,70,6,69,67,87,40,4,93,76,30,1,42,40,87,23,83,89,24,73,19,62,88,43,92,94,50,71,53,19,75,22,9,82,46,65,84,92,63,99,57,23,62,93,61,14,87,67,84,90,38,96,83,33,63,40,80,75,10,79,89,52,14,97,32,87,72,57,79,7,79,6,93,66,77,50,19,97,78,65,96,24,94,80,12,10,70,9,60,77,67,17,83,76,36,79,27,43,91,6,72,77,49,4,47,56,85,81,11,46,96,93,33,82,44,69,49,34,98,77,95,38,19,85,1,62,73,49,95,39,62,36,83,23,93,34,32,21,94,89,30,85,76,13,92,87,3,84,43,3,74,39,81,6,85,16,69,89,21,56,80,65,92,84,97,7,63,23,8,87,37,70,54,75,92,95,96,51,83,34,24,86,39,59,48,89,45,34,89,72,3,77,63,98,38,70,39,38,98,97,85,46,96,53,81,89,27,83,75,31,81,71,39,81,62,79,11,78,18,90,94,1,91,1,79,77,74,64,20,73,55,75,78,2,77,24,92,56,55,25,70,21,38,69,49,81,19,34,92,97,74,61,79,18,77,51,76,62,92,10,85,83,87,39,90,31,98,95,61,32,63,82,59,75,65,53,72,91,17,75,75,54,85,57,32,13,39,70,48,86,59,50,96,32,23,84,61,85,48,59,92,33,15,58,83,95,48,80,70,84,58,69,70,37,99,18,73,79,32,71,22,41,75,26,71,25,55,73,31,5,53,71,95,65,87,50,62,95,80,54,95,73,79,20,94,65,83,33,26,88,3,11,99,76,93,28,97,67,49,90,94,19,85,28,10,96,70,55,84,17,75,33,47,91,44,88,96,1,6,89,40,69,27,58,98,61,25,77,79,43,83,38,13,72,44,99,20,33,69,8,5,47,72,78,24,53,94,78,39,99,87,9,63,82,52,69,64,48,93,46,48,89,22,84,32,69,7,36,99,80,4,27,92,54,14,85,56,19,99,93,99,49,67,82,90,23,10,77,77,37,79,67,78,27,81,79,34,67,81,40,88,76,89,94,64,80,73,79,57,72,22,14,93,3,88,84,88,41,12,29,4,97,57,83,38,93,51,55,20,75,57,78,22,76,22,24,85,91,79,27,19,46,90,18,71,3,39,28,26,94,87,83,31,35,73,56,99,83,35,65,92,45,98,93,2,73,88,15,90,62,85,95,20,96,75,52,4,62,81,78,49,67,69,20,5,85,72,79,45,34,73,89,20,37,60,79,97,6,41,78,40,70,42,29,89,21,76,88,44,82,17,9,73,52,71,73,25,89,71,30,82,85,26,86,61,43,7,71,13,99,72,40,95,79,39,67,39,65,90,91,14,96,20,73,98,66,13,92,70,1,93,2,86,45,54,85,73,30,62,14,97,89,39,77,99,40,89,76,49,97,42,60,97,62,82,35,98,49,80,15,91,34,87,65,77,44,93,65,87,76,82,20,78,46,90,18,81,73,98,47,99,48,69,2,82,90,90,47,85,49,94,37,81,76,90,0,0,21,21,1,10,1,0,0,0,0,0,0";
var game = new RepairDroid(code);
game.start();
console.log('Number of block tyles: %c%d', 'font-weight: bold; color: #ff0000', game.foundDistance);

var tiles = game.tiles;

var table = convertToTable(-21,20,-21,20,tiles);
$(document).ready(function () {
    $('#game').html(table);
});

var millis = Date.now() - startTime;
console.log(`Milliseconds elapsed = ${millis}`);


var startTime = Date.now();

var millis = Date.now() - startTime;
console.log(`Milliseconds elapsed = ${millis}`);