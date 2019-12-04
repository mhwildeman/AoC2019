var start = 153517;
var stop = 630395;
var valid = 0;
var total = 0;
var startTime = Date.now();

for (var i=start;i<stop;i++)
{
    if(isValidNumber(i)){
        //console.log(i);
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

    let unique = [...new Set(stringArray)];
    if(unique.length >= stringArray.length)
    return false;

    var increasing = true;
    var lastItem = stringArray[0];
    stringArray.forEach(function(item){
        if(item<lastItem){
            increasing = false;
            return;
        }
        lastItem=item;
    });
    
    return increasing;
}