class Program {
    constructor(code, phase, finalNode) {
        this.code = code.split(',').map(Number);
        this.inputLocation = 0;
        this.pointer = 0;
        this.output = "";
        this.consumer = null;
        this.input = [phase];
        this.finalNode = finalNode;
    }
    run(inputValue) {
        this.input.push(inputValue);
        while (this.pointer < 1000) {
            var instruction = this.code[this.pointer];
            var A = 0, B = 0, C = 0, opCode = 0;

            if (instruction >= 10000) {
                //How can this ever be true? It's never used...
                instruction -= 10000;
                A = 1;
            }
            if (instruction >= 1000) {
                instruction -= 1000;
                B = 1;
            }
            if (instruction >= 100) {
                instruction -= 100;
                C = 1;
            }
            opCode = instruction;

            if (A) {
                debugger;
            }

            //Parameters that an instruction writes to will never be in immediate mode.
            switch (opCode) {
                case 1:
                    //Addition
                    this.code[this.code[this.pointer + 3]] = (C ? this.code[this.pointer + 1] : this.code[this.code[this.pointer + 1]]) + (B ? this.code[this.pointer + 2] : this.code[this.code[this.pointer + 2]]);
                    this.pointer += 4; // three parameters
                    break;
                case 2:
                    //Multiply
                    this.code[this.code[this.pointer + 3]] = (C ? this.code[this.pointer + 1] : this.code[this.code[this.pointer + 1]]) * (B ? this.code[this.pointer + 2] : this.code[this.code[this.pointer + 2]]);
                    this.pointer += 4; // three parameters
                    break;
                case 3:
                    //Read from input and store to location.
                    this.code[this.code[this.pointer + 1]] = this.input[this.inputLocation];
                    this.inputLocation++;
                    this.pointer += 2; // one parameter
                    break;
                case 4:
                    //Read
                    this.output = C ? this.code[this.pointer + 1] : this.code[this.code[this.pointer + 1]];
                    //console.log("Output: %d",this.output);
                    this.pointer += 2; // one parameter
                    if (this.consumer) {
                        //Start the next node;
                        this.consumer.run(this.output);
                    }
                    break;
                case 5:
                    //Jump if true
                    if ((C ? this.code[this.pointer + 1] : this.code[this.code[this.pointer + 1]]) !== 0) {
                        this.pointer = (B ? this.code[this.pointer + 2] : this.code[this.code[this.pointer + 2]])
                    }
                    else {
                        this.pointer += 3; // two parameters
                    }
                    break;
                case 6:
                    //Jump if false
                    if ((C ? this.code[this.pointer + 1] : this.code[this.code[this.pointer + 1]]) === 0) {
                        this.pointer = (B ? this.code[this.pointer + 2] : this.code[this.code[this.pointer + 2]])
                    }
                    else {
                        this.pointer += 3; // two parameters
                    }
                    break;
                case 7:
                    //Less than
                    this.code[this.code[this.pointer + 3]] = (C ? this.code[this.pointer + 1] : this.code[this.code[this.pointer + 1]]) < (B ? this.code[this.pointer + 2] : this.code[this.code[this.pointer + 2]]) ? 1 : 0;
                    this.pointer += 4; // three parameters
                    break;
                case 8:
                    //Equals
                    this.code[this.code[this.pointer + 3]] = (C ? this.code[this.pointer + 1] : this.code[this.code[this.pointer + 1]]) === (B ? this.code[this.pointer + 2] : this.code[this.code[this.pointer + 2]]) ? 1 : 0;
                    this.pointer += 4; // three parameters
                    break;

                case 99:
                    //console.log('Exit code: %d.',output);
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
var possibilities = getAllPossibilities([0, 1, 2, 3, 4], []);

// //Test 1:
// var code = "3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0";
// var results = possibilities.map(phases => runAmplifiers(code,phases));
// var max = Math.max(...results);
// console.log('Max: %d', max);

// //Test 2:
// var code = "3,23,3,24,1002,24,10,24,1002,23,-1,23,101,5,23,23,1,24,23,23,4,23,99,0,0";
// var results = possibilities.map(phases => runAmplifiers(code,phases));
// var max = Math.max(...results);
// console.log('Max: %d', max);

// //Test 3:
// var code = "3,31,3,32,1002,32,10,32,1001,31,-2,31,1007,31,0,33,1002,33,7,33,1,33,31,31,1,32,31,31,4,31,99,0,0,0";
// var results = possibilities.map(phases => runAmplifiers(code,phases));
// var max = Math.max(...results);
// console.log('Max: %d', max);

var startTime = Date.now();

//Puzzle part 1:
console.log('Part 1:')
var code = "3,8,1001,8,10,8,105,1,0,0,21,30,51,72,81,94,175,256,337,418,99999,3,9,101,5,9,9,4,9,99,3,9,1001,9,3,9,1002,9,2,9,1001,9,2,9,1002,9,5,9,4,9,99,3,9,1002,9,4,9,101,4,9,9,102,5,9,9,101,3,9,9,4,9,99,3,9,1002,9,4,9,4,9,99,3,9,102,3,9,9,1001,9,4,9,4,9,99,3,9,1001,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,1,9,9,4,9,3,9,101,1,9,9,4,9,3,9,101,1,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,1002,9,2,9,4,9,99,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,101,1,9,9,4,9,3,9,101,2,9,9,4,9,3,9,102,2,9,9,4,9,99,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,1002,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,99,3,9,1001,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,1001,9,1,9,4,9,3,9,102,2,9,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,2,9,9,4,9,99,3,9,101,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,1001,9,1,9,4,9,3,9,1001,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,1,9,9,4,9,99";
var results = possibilities.map(phases => runAmplifiers(code, phases));
var max = Math.max(...results);
console.log('Max: %c%d', 'font-weight: bold; color: #ff0000', max);


var millis = Date.now() - startTime;
console.log(`Milliseconds elapsed = ${millis}`);



var possibilities = getAllPossibilities([5, 6, 7, 8, 9], []);

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
var code = "3,8,1001,8,10,8,105,1,0,0,21,30,51,72,81,94,175,256,337,418,99999,3,9,101,5,9,9,4,9,99,3,9,1001,9,3,9,1002,9,2,9,1001,9,2,9,1002,9,5,9,4,9,99,3,9,1002,9,4,9,101,4,9,9,102,5,9,9,101,3,9,9,4,9,99,3,9,1002,9,4,9,4,9,99,3,9,102,3,9,9,1001,9,4,9,4,9,99,3,9,1001,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,1,9,9,4,9,3,9,101,1,9,9,4,9,3,9,101,1,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,1002,9,2,9,4,9,99,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,101,1,9,9,4,9,3,9,101,2,9,9,4,9,3,9,102,2,9,9,4,9,99,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,1002,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,99,3,9,1001,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,1001,9,1,9,4,9,3,9,102,2,9,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,2,9,9,4,9,99,3,9,101,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,1001,9,1,9,4,9,3,9,1001,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,1,9,9,4,9,99";
var results = possibilities.map(phases => runAmplifiers(code, phases));
var max = Math.max(...results);
console.log('Max: %c%d', 'font-weight: bold; color: #ff0000', max);


var millis = Date.now() - startTime;
console.log(`Milliseconds elapsed = ${millis}`);