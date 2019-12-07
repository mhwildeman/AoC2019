var runProgram = function (code, input) {
    var code = code.split(',').map(Number);
    var inputLocation = 0;
    var pointer = 0;
    var output = "";
    while (pointer < 1000) {
        var instruction = code[pointer];
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
                code[code[pointer + 3]] = (C ? code[pointer + 1] : code[code[pointer + 1]]) + (B ? code[pointer + 2] : code[code[pointer + 2]]);
                pointer += 4; // three parameters
                break;
            case 2:
                //Multiply
                code[code[pointer + 3]] = (C ? code[pointer + 1] : code[code[pointer + 1]]) * (B ? code[pointer + 2] : code[code[pointer + 2]]);
                pointer += 4; // three parameters
                break;
            case 3:
                //Read from input and store to location.
                code[code[pointer + 1]] = input[inputLocation];
                inputLocation++;
                pointer += 2; // one parameter
                break;
            case 4:
                //Read
                output = C ? code[pointer + 1] : code[code[pointer + 1]];
                pointer += 2; // one parameter
                break;
            case 5:
                //Jump if true
                if ((C ? code[pointer + 1] : code[code[pointer + 1]]) !== 0) {
                    pointer = (B ? code[pointer + 2] : code[code[pointer + 2]])
                }
                else {
                    pointer += 3; // two parameters
                }
                break;
            case 6:
                //Jump if false
                if ((C ? code[pointer + 1] : code[code[pointer + 1]]) === 0) {
                    pointer = (B ? code[pointer + 2] : code[code[pointer + 2]])
                }
                else {
                    pointer += 3; // two parameters
                }
                break;
            case 7:
                //Less than
                code[code[pointer + 3]] = (C ? code[pointer + 1] : code[code[pointer + 1]]) < (B ? code[pointer + 2] : code[code[pointer + 2]]) ? 1 : 0;
                pointer += 4; // three parameters
                break;
            case 8:
                //Equals
                code[code[pointer + 3]] = (C ? code[pointer + 1] : code[code[pointer + 1]]) === (B ? code[pointer + 2] : code[code[pointer + 2]]) ? 1 : 0;
                pointer += 4; // three parameters
                break;

            case 99:
                //console.log('Exit code: %d.',output);
                return output;
            default:
                console.log('Error');
                throw (new Error('Unexpected opcode'));
        }
    }
    return output;

}

function runAmplifiers(code, phases){
    var output = 0;
    for(var i =0;i<phases.length;i++)
    {
        output = runProgram(code, [phases[i], output]);
    }
    return output;
};

function toArray(input){
    if(typeof input==='Array')
    {
        return input;
    }
    return [input];
}

function getAllPossibilities(array){
    var possibilities = [];

    var fn = function (current,leftArray){
        if(leftArray.length===0)
        {
            possibilities.push(current);
            return;
        }
        for(var i=0;i<leftArray.length;i++){
            var newLeftArray = [...leftArray];
            var newCurrent = [...current];
            var newItem = newLeftArray.splice(i,1);
            newCurrent = newCurrent.concat(newItem);
            fn(newCurrent,newLeftArray);
        }
    }

    fn([],array)
    
    return possibilities;
}
var possibilities = getAllPossibilities([0,1,2,3,4],[]);
//console.log(possibilities.length);

//Test 1:
var code = "3,15,3,16,1002,16,10,16,1,16,15,15,4,15,99,0,0";
var results = possibilities.map(phases => runAmplifiers(code,phases));
var max = Math.max(...results);
console.log('Max: %d', max);

//Test 2:
var code = "3,23,3,24,1002,24,10,24,1002,23,-1,23,101,5,23,23,1,24,23,23,4,23,99,0,0";
var results = possibilities.map(phases => runAmplifiers(code,phases));
var max = Math.max(...results);
console.log('Max: %d', max);

//Test 3:
var code = "3,31,3,32,1002,32,10,32,1001,31,-2,31,1007,31,0,33,1002,33,7,33,1,33,31,31,1,32,31,31,4,31,99,0,0,0";
var results = possibilities.map(phases => runAmplifiers(code,phases));
var max = Math.max(...results);
console.log('Max: %d', max);

var startTime = Date.now();

//Puzzle:
var code = "3,8,1001,8,10,8,105,1,0,0,21,30,51,72,81,94,175,256,337,418,99999,3,9,101,5,9,9,4,9,99,3,9,1001,9,3,9,1002,9,2,9,1001,9,2,9,1002,9,5,9,4,9,99,3,9,1002,9,4,9,101,4,9,9,102,5,9,9,101,3,9,9,4,9,99,3,9,1002,9,4,9,4,9,99,3,9,102,3,9,9,1001,9,4,9,4,9,99,3,9,1001,9,2,9,4,9,3,9,101,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,1,9,9,4,9,3,9,101,1,9,9,4,9,3,9,101,1,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,1002,9,2,9,4,9,99,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,102,2,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,101,1,9,9,4,9,3,9,101,2,9,9,4,9,3,9,102,2,9,9,4,9,99,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,1002,9,2,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,3,9,102,2,9,9,4,9,99,3,9,1001,9,2,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,1001,9,1,9,4,9,3,9,102,2,9,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,2,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,2,9,9,4,9,99,3,9,101,2,9,9,4,9,3,9,101,2,9,9,4,9,3,9,101,1,9,9,4,9,3,9,1001,9,1,9,4,9,3,9,1002,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,1001,9,1,9,4,9,3,9,1001,9,2,9,4,9,3,9,1001,9,1,9,4,9,3,9,101,1,9,9,4,9,99";
var results = possibilities.map(phases => runAmplifiers(code,phases));
var max = Math.max(...results);
console.log('Max: %d', max);


var millis = Date.now() - startTime;
console.log(`Milliseconds elapsed = ${millis}`);
