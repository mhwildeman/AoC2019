class Program {
    constructor(code, phase, finalNode, callback) {
        this.code = code.split(',').map(Number);
        this.inputLocation = 0;
        this.pointer = 0;
        this.output = "";
        this.consumer = null;
        this.input = [phase];
        this.finalNode = finalNode;
        this.relativeBase = 0;
        this.executedIntructions = 0;
        this.callback = callback;
        this.finished = false;
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

class PaintRobot {
    constructor(intCode, startValue) {
        this.state = PaintRobot.PAINT;
        this.x = 0;
        this.y = 0;
        this.painting = {};
        this.paintedLocationsCount = 0;
        this.direction = 0;
        this.program = new Program(intCode, startValue, false);
        this.program.setConsumer(this);
    }
    static get PAINT() { return 'paint' };
    static get MOVE() { return 'move' };
    paint(value) {
        //value has the paint pixel value.
        this.state = PaintRobot.MOVE;
        //console.log('Paint %d', value);
        this.writePixel(value);
    }
    move(value) {
        switch (value) {
            case 0: //turn left.
                this.direction = (this.direction + 4 - 1) % 4;
                break;
            case 1: //turn right.
                this.direction = (this.direction + 1) % 4;
                break;
            default:
                throw new Error('unexpected direction');
        }

        switch (this.direction) {
            case 0: //up
                //console.log('Move up');
                this.y -= 1;
                break;
            case 1: //right
                //console.log('Move right');
                this.x += 1;
                break;
            case 2: //down
                //console.log('Move down');
                this.y += 1;
                break;
            case 3: //left
                //console.log('Move left');
                this.x -= 1;
                break;
        }
        //value has the rotation direction.
        this.state = PaintRobot.PAINT;
        return this.readPixel();
    }
    writePixel(value) {
        if (value < 0 || value > 1) {
            throw new Error('unexpected paint value');
        }
        if (this.painting[this.x]) {
            if (!this.painting[this.x][this.y]) {
                this.painting[this.x][this.y] = {};
                this.paintedLocationsCount++;
            }
        } else {
            this.painting[this.x] = {};
            this.painting[this.x][this.y] = {};
            this.paintedLocationsCount++;
        }

        //We've created the pixel. Now store value.
        this.painting[this.x][this.y].value = value;

    }
    readPixel() {
        if (this.painting[this.x] && this.painting[this.x][this.y]) {
            return this.painting[this.x][this.y].value;
        }
        return 0;
    }
    start() {
        var value = this.program.run();
        while (!this.program.finished) {
            switch (this.state) {
                case PaintRobot.PAINT:
                    //put current output to coord x,y. Continue program without imput.
                    this.paint(value);
                    value = this.program.run();
                    break;
                case PaintRobot.MOVE:
                    //rotate and move robot. Continue program with input from location.
                    value = this.program.run(this.move(value));
                    break;
            }
        }
    }
}

var convertToTable = function (width,height,template) {
    var table = '<table>';
    for (var row = 0; row < height; row++) {
        table += '<tr>';
        for (var column = 0; column < width; column++) {
            var value = 0;
            if(template[column] && template[column][row]){
                value = template[column][row].value;
            }
            switch (value) {
                case 0:
                    table += '<td class="black"></td>';
                    break;
                case 1:
                    table += '<td class="white"></td>';
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
var code = "3,8,1005,8,318,1106,0,11,0,0,0,104,1,104,0,3,8,102,-1,8,10,1001,10,1,10,4,10,1008,8,1,10,4,10,101,0,8,29,1,107,12,10,2,1003,8,10,3,8,102,-1,8,10,1001,10,1,10,4,10,1008,8,0,10,4,10,1002,8,1,59,1,108,18,10,2,6,7,10,2,1006,3,10,3,8,1002,8,-1,10,1001,10,1,10,4,10,1008,8,1,10,4,10,1002,8,1,93,1,1102,11,10,3,8,102,-1,8,10,1001,10,1,10,4,10,108,1,8,10,4,10,101,0,8,118,2,1102,10,10,3,8,102,-1,8,10,101,1,10,10,4,10,1008,8,0,10,4,10,101,0,8,145,1006,0,17,1006,0,67,3,8,1002,8,-1,10,101,1,10,10,4,10,1008,8,0,10,4,10,101,0,8,173,2,1109,4,10,1006,0,20,3,8,102,-1,8,10,1001,10,1,10,4,10,108,0,8,10,4,10,102,1,8,201,3,8,1002,8,-1,10,1001,10,1,10,4,10,1008,8,0,10,4,10,1002,8,1,224,1006,0,6,1,1008,17,10,2,101,5,10,3,8,1002,8,-1,10,1001,10,1,10,4,10,108,1,8,10,4,10,1001,8,0,256,2,1107,7,10,1,2,4,10,2,2,12,10,1006,0,82,3,8,1002,8,-1,10,1001,10,1,10,4,10,1008,8,1,10,4,10,1002,8,1,294,2,1107,2,10,101,1,9,9,1007,9,988,10,1005,10,15,99,109,640,104,0,104,1,21102,1,837548352256,1,21102,335,1,0,1105,1,439,21102,1,47677543180,1,21102,346,1,0,1106,0,439,3,10,104,0,104,1,3,10,104,0,104,0,3,10,104,0,104,1,3,10,104,0,104,1,3,10,104,0,104,0,3,10,104,0,104,1,21102,1,235190374592,1,21101,393,0,0,1105,1,439,21102,3451060455,1,1,21102,404,1,0,1105,1,439,3,10,104,0,104,0,3,10,104,0,104,0,21102,837896909668,1,1,21102,1,427,0,1105,1,439,21102,1,709580555020,1,21102,438,1,0,1105,1,439,99,109,2,21201,-1,0,1,21102,1,40,2,21102,1,470,3,21102,460,1,0,1106,0,503,109,-2,2105,1,0,0,1,0,0,1,109,2,3,10,204,-1,1001,465,466,481,4,0,1001,465,1,465,108,4,465,10,1006,10,497,1101,0,0,465,109,-2,2105,1,0,0,109,4,1201,-1,0,502,1207,-3,0,10,1006,10,520,21101,0,0,-3,21202,-3,1,1,22101,0,-2,2,21101,1,0,3,21101,0,539,0,1106,0,544,109,-4,2105,1,0,109,5,1207,-3,1,10,1006,10,567,2207,-4,-2,10,1006,10,567,21202,-4,1,-4,1105,1,635,22101,0,-4,1,21201,-3,-1,2,21202,-2,2,3,21101,0,586,0,1105,1,544,22102,1,1,-4,21102,1,1,-1,2207,-4,-2,10,1006,10,605,21102,1,0,-1,22202,-2,-1,-2,2107,0,-3,10,1006,10,627,21202,-1,1,1,21101,627,0,0,105,1,502,21202,-2,-1,-2,22201,-4,-2,-4,109,-5,2105,1,0";
var robot = new PaintRobot(code,0);
robot.start();
console.log('Painted locations: %c%d', 'font-weight: bold; color: #ff0000', robot.paintedLocationsCount);


var millis = Date.now() - startTime;
console.log(`Milliseconds elapsed = ${millis}`);


var startTime = Date.now();

//Puzzle part 2:
console.log('%c=============================', 'color: #cccccc;');
console.log('Part 2:');
var robot = new PaintRobot(code,1);
robot.start();
console.log('Painted locations: %c%d', 'font-weight: bold; color: #ff0000', robot.paintedLocationsCount);
//Draw the 'image' to webpage.
var table = convertToTable(43,6,robot.painting);
$(document).ready(function () {
    $('p').html(table);
});

var millis = Date.now() - startTime;
console.log(`Milliseconds elapsed = ${millis}`);