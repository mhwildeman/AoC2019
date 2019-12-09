class Program {
    constructor(code, phase, finalNode, verbose) {
        this.code = code.split(',').map(Number);
        this.inputLocation = 0;
        this.pointer = 0;
        this.output = "";
        this.consumer = null;
        this.input = [phase];
        this.finalNode = finalNode;
        this.relativeBase = 0;
        this.executedIntructions = 0;
        this.verbose = verbose;
    }
    run(inputValue) {
        this.input.push(inputValue);
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
                    //console.log("Output: %d",this.output);
                    this.pointer += 2; // one parameter
                    if (this.consumer) {
                        //Start the next node;
                        this.consumer.run(this.output);
                    }
                    else {
                        if (this.verbose) {
                            console.log(this.output);
                        }
                    }
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
                    if (this.verbose) {
                        console.log('Exit code: %d.', this.output);
                    }
                    if (this.finalNode)
                        return this.output;
                    return this.consumer.run(this.output);
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

function runAmplifiers(code, phases) {
    var amplifiers = []
    for (var i = 0; i < phases.length; i++) {
        var amp = new Program(code, phases[i], i == 4)
        amplifiers.push(amp);
        if (i > 0) {
            amplifiers[i - 1].setConsumer(amp);
        }
        if (i == 4) {
            amp.setConsumer(amplifiers[0])
        }
    }
    return amplifiers[0].run(0);
};

function toArray(input) {
    if (typeof input === 'Array') {
        return input;
    }
    return [input];
}

function getAllPossibilities(array) {
    var possibilities = [];

    var fn = function (current, leftArray) {
        if (leftArray.length === 0) {
            possibilities.push(current);
            return;
        }
        for (var i = 0; i < leftArray.length; i++) {
            var newLeftArray = [...leftArray];
            var newCurrent = [...current];
            var newItem = newLeftArray.splice(i, 1);
            newCurrent = newCurrent.concat(newItem);
            fn(newCurrent, newLeftArray);
        }
    }

    fn([], array)

    return possibilities;
}


// //Test 1:
// var code = "109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99";
// var program = new Program(code, 0, true, true);
// program.run(0);


// // //Test 2:
// var code = "1102,34915192,34915192,7,4,7,99,0";
// var program = new Program(code, 0, true);
// program.run(0);

// // //Test 3:
// var code = "104,1125899906842624,99";
// var program = new Program(code, 0, true);
// program.run(0);

var startTime = Date.now();

//Puzzle part 1:
console.log('Part 1:')
var code = "1102,34463338,34463338,63,1007,63,34463338,63,1005,63,53,1102,1,3,1000,109,988,209,12,9,1000,209,6,209,3,203,0,1008,1000,1,63,1005,63,65,1008,1000,2,63,1005,63,904,1008,1000,0,63,1005,63,58,4,25,104,0,99,4,0,104,0,99,4,17,104,0,99,0,0,1101,0,641,1026,1101,0,24,1014,1101,30,0,1015,1101,0,0,1020,1101,35,0,1000,1101,0,708,1029,1101,0,27,1009,1102,38,1,1007,1102,638,1,1027,1101,1,0,1021,1102,32,1,1003,1101,0,34,1012,1102,20,1,1017,1102,1,37,1010,1101,0,713,1028,1101,33,0,1019,1102,1,36,1001,1102,22,1,1005,1101,23,0,1018,1101,21,0,1016,1102,28,1,1006,1101,0,26,1011,1102,1,215,1022,1102,1,29,1013,1102,25,1,1004,1102,1,31,1008,1102,1,292,1025,1102,297,1,1024,1101,208,0,1023,1102,1,39,1002,109,12,1206,9,197,1001,64,1,64,1106,0,199,4,187,1002,64,2,64,109,11,2105,1,0,1001,64,1,64,1105,1,217,4,205,1002,64,2,64,109,2,21107,40,41,-9,1005,1016,235,4,223,1105,1,239,1001,64,1,64,1002,64,2,64,109,-28,1207,3,36,63,1005,63,261,4,245,1001,64,1,64,1105,1,261,1002,64,2,64,109,5,1207,1,31,63,1005,63,281,1001,64,1,64,1105,1,283,4,267,1002,64,2,64,109,22,2105,1,0,4,289,1105,1,301,1001,64,1,64,1002,64,2,64,109,-16,1201,0,0,63,1008,63,31,63,1005,63,323,4,307,1106,0,327,1001,64,1,64,1002,64,2,64,109,18,1205,-5,345,4,333,1001,64,1,64,1105,1,345,1002,64,2,64,109,-21,2101,0,-2,63,1008,63,32,63,1005,63,367,4,351,1106,0,371,1001,64,1,64,1002,64,2,64,109,6,21102,41,1,7,1008,1018,38,63,1005,63,395,1001,64,1,64,1105,1,397,4,377,1002,64,2,64,109,-1,21107,42,41,2,1005,1012,413,1106,0,419,4,403,1001,64,1,64,1002,64,2,64,109,-10,2107,36,0,63,1005,63,435,1106,0,441,4,425,1001,64,1,64,1002,64,2,64,109,9,21108,43,44,9,1005,1018,461,1001,64,1,64,1105,1,463,4,447,1002,64,2,64,109,-10,2102,1,8,63,1008,63,39,63,1005,63,483,1105,1,489,4,469,1001,64,1,64,1002,64,2,64,109,21,21108,44,44,-1,1005,1019,511,4,495,1001,64,1,64,1106,0,511,1002,64,2,64,109,-18,1208,1,32,63,1005,63,533,4,517,1001,64,1,64,1105,1,533,1002,64,2,64,109,5,2101,0,-5,63,1008,63,37,63,1005,63,557,1001,64,1,64,1105,1,559,4,539,1002,64,2,64,109,8,1208,-8,35,63,1005,63,575,1105,1,581,4,565,1001,64,1,64,1002,64,2,64,109,-5,1202,-3,1,63,1008,63,38,63,1005,63,607,4,587,1001,64,1,64,1106,0,607,1002,64,2,64,109,-17,2107,31,10,63,1005,63,629,4,613,1001,64,1,64,1106,0,629,1002,64,2,64,109,31,2106,0,3,1105,1,647,4,635,1001,64,1,64,1002,64,2,64,109,-7,1201,-9,0,63,1008,63,32,63,1005,63,667,1106,0,673,4,653,1001,64,1,64,1002,64,2,64,109,-5,1202,-5,1,63,1008,63,41,63,1005,63,693,1105,1,699,4,679,1001,64,1,64,1002,64,2,64,109,16,2106,0,0,4,705,1105,1,717,1001,64,1,64,1002,64,2,64,109,-6,1205,-2,729,1105,1,735,4,723,1001,64,1,64,1002,64,2,64,109,-18,2102,1,1,63,1008,63,22,63,1005,63,761,4,741,1001,64,1,64,1105,1,761,1002,64,2,64,109,-2,2108,32,1,63,1005,63,783,4,767,1001,64,1,64,1105,1,783,1002,64,2,64,109,13,21102,45,1,-2,1008,1013,45,63,1005,63,809,4,789,1001,64,1,64,1105,1,809,1002,64,2,64,109,-13,2108,24,3,63,1005,63,829,1001,64,1,64,1106,0,831,4,815,1002,64,2,64,109,13,21101,46,0,-3,1008,1012,43,63,1005,63,851,1106,0,857,4,837,1001,64,1,64,1002,64,2,64,109,14,1206,-9,875,4,863,1001,64,1,64,1106,0,875,1002,64,2,64,109,-3,21101,47,0,-7,1008,1019,47,63,1005,63,901,4,881,1001,64,1,64,1105,1,901,4,64,99,21101,27,0,1,21101,0,915,0,1106,0,922,21201,1,66926,1,204,1,99,109,3,1207,-2,3,63,1005,63,964,21201,-2,-1,1,21102,942,1,0,1105,1,922,21202,1,1,-1,21201,-2,-3,1,21101,957,0,0,1106,0,922,22201,1,-1,-2,1106,0,968,22102,1,-2,-2,109,-3,2106,0,0";

var program = new Program(code, 1, true);
var output = program.run(0);
console.log('keycode: %c%d', 'font-weight: bold; color: #ff0000', output);


var millis = Date.now() - startTime;
console.log(`Milliseconds elapsed = ${millis}`);


// //Test 1:
// var code = "3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5";

// var results = possibilities.map(phases => runAmplifiers(code,phases));
// var max = Math.max(...results);
// console.log('Max: %d', max);

// // //Test 2:
// var code = "3,52,1001,52,-5,52,3,53,1,52,56,54,1007,54,5,55,1005,55,26,1001,54,-5,54,1105,1,12,1,53,54,53,1008,54,0,55,1001,55,1,55,2,53,55,53,4,53,1001,56,-1,56,1005,56,6,99,0,0,0,0,10";
// var results = possibilities.map(phases => runAmplifiers(code,phases));
// var max = Math.max(...results);
// console.log('Max: %d', max);

var startTime = Date.now();

//Puzzle part 2:
console.log('%c=============================', 'color: #cccccc;');
console.log('Part 2:');
var program = new Program(code, 2, true);
var output = program.run(0);

console.log('Max: %c%d', 'font-weight: bold; color: #ff0000', output);


var millis = Date.now() - startTime;
console.log(`Milliseconds elapsed = ${millis}`);