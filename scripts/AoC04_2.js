var start = 153517;
var stop = 630395;
var valid = 0;
var total = 0;
var startTime = Date.now();

for (var i=start;i<stop;i++)
{
    if(isValidNumber(i)){
        valid ++;
    }
    total++;
}

console.log("Valid: %d",valid);
console.log("Total: %d",total);
var millis = Date.now() - startTime;
console.log(`Milliseconds elapsed = ${millis}`);

function isValidNumber(number){
    var stringValue = Number(number).toString();
    var stringArray = Array.from(stringValue);

    //Duplicates?
    let unique = [...new Set(stringArray)];
    
    //No duplicates, return false;
    if (unique.length === stringArray.length) return false;

    var increasing = true;
    var lastItem = stringArray[0];

    //Increasing?
    stringArray.forEach(function(item){
        if(item<lastItem){
            increasing = false;
            return;
        }
        lastItem=item;
    });

    //Not increasing, return false
    if(!increasing){return false}

    //Contains pair?
    var countConsequtive = {};
    stringArray.forEach(function(item){
        if(typeof countConsequtive[item]==='undefined'){
            countConsequtive[item] = 1;
        }
        else
        {
            countConsequtive[item]++;
        }
    });

    var containsPair = false;
    Object.keys(countConsequtive).forEach(function(key){
        if(countConsequtive[key]===2){
            containsPair = true;
        }
    });

    return containsPair;
}