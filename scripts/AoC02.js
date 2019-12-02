var runProgram = function(noun, verb){
    var code = [1,12,2,3,1,1,2,3,1,3,4,3,1,5,0,3,2,13,1,19,1,10,19,23,1,23,9,27,1,5,27,31,2,31,13,35,1,35,5,39,1,39,5,43,2,13,43,47,2,47,10,51,1,51,6,55,2,55,9,59,1,59,5,63,1,63,13,67,2,67,6,71,1,71,5,75,1,75,5,79,1,79,9,83,1,10,83,87,1,87,10,91,1,91,9,95,1,10,95,99,1,10,99,103,2,103,10,107,1,107,9,111,2,6,111,115,1,5,115,119,2,119,13,123,1,6,123,127,2,9,127,131,1,131,5,135,1,135,13,139,1,139,10,143,1,2,143,147,1,147,10,0,99,2,0,14,0];
    code[1]=noun;
    code[2]=verb;
    var pointer = 0;
    while(code[pointer]!=99 && pointer<1000)
    {
        
        switch(code[pointer])
        {
            case 1:
                //Addition
                code[code[pointer+3]]=code[code[pointer+1]]+code[code[pointer+2]];
                break;
            case 2:
                //Multiply
                code[code[pointer+3]]=code[code[pointer+1]]*code[code[pointer+2]];
                break;
            default:
                console.log('Error');
                return;
        }
        pointer+=4;
    }
    return code[0];
}

//Test 1: 4930687
console.log(runProgram(12,2));
//Test 2: Find 19690720
for(var noun=0;noun<100;noun++){
    for(var verb=0;verb<100;verb++){
        if(runProgram(noun,verb)===19690720){
            console.log(100 * noun + verb);
        }
    }
}