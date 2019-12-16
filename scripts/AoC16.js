function calculateZipper(i, length) {
    var iteration = [0, 1, 0, -1];
    var zipper = [];
    for (var j = 0; j < length + 1; j++) {
        zipper.push(iteration[Math.floor(j / i) % 4]);
    }
    zipper.shift();
    return zipper;
}

function calculate(code, iterations) {
    for (var iteration = 0; iteration < iterations; iteration++) {
        var code = code.split('').map(function (value) { return Number(value) });
        var newCode = [];
        for (var i = 0; i < code.length; i++) {
            var zipper = calculateZipper(i + 1, code.length);
            var combined = _.zipWith(code, zipper, function (a, b) { return a * b });
            newCode.push(_.reduce(combined, function (sum, n) {
                return sum + n;
            }, 0));
        }
        newCode = newCode.map(function (value) { return Number(Number(value).toString().substr(-1)) });
        code = newCode.join('');
    }

    return code;
}

function calculateLastHalf(code,iterations) {
    //Last half of calculation is easy, because of 0 and 1's.
    //From back to forth: 
    //First: 8, 8+7=5, 5+6=1, 1+5=6... etc.
    //Second: 8, 8+5=3, 3+1=4, 4+6=0
    //Third: 8, 8+3=1, 1+4=5, 5+0=5
    //Fourth: 8, 8+1=9, 9+5=4, 4+5=9
    for (var iteration = 0; iteration < iterations; iteration++) {
        code = code.split('').map(function (value) { return Number(value) });
        for (var i = code.length - 1; i >= 0; i--) {
            code[i] = ((code[i + 1] || 0) + code[i]) % 10;
        }
        code = code.join('');
    }
    return code;
}

function stringRepeat(input, iteration) {
    var returnValue = '';
    for (var i = 0; i < iteration; i++) {
        returnValue += input;
    }
    return returnValue;
}
// var test1 = '12345678';
// console.log(calculate(test1, 4, 0) === '01029498');

// var test1 = '5678';
// console.log(calculateLastHalf(test1, 4) === '9498');


// var test2 = '80871224585914546619083218645595';
// console.log(calculate(test2, 100).substr(0, 8) === '24176176');

// var test3 = '19617804207202209144916044189917';
// console.log(calculate(test3, 100).substr(0, 8) === '73745418');

// var test4 = '69317163492948606335995924319873';
// console.log(calculate(test4, 100).substr(0, 8) === '52432133');

var puzzleInput = '59762677844514231707968927042008409969419694517232887554478298452757853493727797530143429199414189647594938168529426160403829916419900898120019486915163598950118118387983556244981478390010010743564233546700525501778401179747909200321695327752871489034092824259484940223162317182126390835917821347817200000199661513570119976546997597685636902767647085231978254788567397815205001371476581059051537484714721063777591837624734411735276719972310946108792993253386343825492200871313132544437143522345753202438698221420628103468831032567529341170616724533679890049900700498413379538865945324121019550366835772552195421407346881595591791012185841146868209045';
console.log('Part 1: %s',calculate(puzzleInput, 100).substr(0,8));

var realPuzzleInput = stringRepeat(puzzleInput, 10000);
realPuzzleOffset = Number(realPuzzleInput.substr(0, 7));

//5976267>6500000/2 We're past halfway. As such, we have an easy solution.

finalPuzzleInput = realPuzzleInput.slice(realPuzzleOffset);
realPuzzleOutput = calculateLastHalf(finalPuzzleInput, 100);
console.log('Part 2: %s',realPuzzleOutput.substr(0, 8));