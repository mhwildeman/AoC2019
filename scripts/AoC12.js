class Moon {
    constructor(x, y, z) {
        this.location = [x, y, z];
        this.velocity = [0, 0, 0];
    }
    updateVelocity(otherMoon) {
        for (var i = 0; i < 3; i++) {
            switch (true) {
                case this.location[i] > otherMoon.location[i]:
                    //this = 5, other = 3 -> this -1 other +1
                    this.velocity[i] -= 1;
                    otherMoon.velocity[i] += 1;
                    break;
                case this.location[i] < otherMoon.location[i]:
                    this.velocity[i] += 1;
                    otherMoon.velocity[i] -= 1;
                    break;
                default:
                    //Do nothing.    
                    break;

            }

        }
    }
    updateLocation() {
        for (var i = 0; i < 3; i++) {
            this.location[i] += this.velocity[i];
        }
    }
    getEnergy(axes) {
        var potentialEnergy = 0;
        var kineticEnergy = 0;
        if (typeof axes === 'undefined') {
            for (var i = 0; i < 3; i++) {
                potentialEnergy += Math.abs(this.location[i]);
                kineticEnergy += Math.abs(this.velocity[i]);
            }
        }
        else {
            potentialEnergy += Math.abs(this.location[axes]);
            kineticEnergy += Math.abs(this.velocity[axes]);
        }
        return potentialEnergy * kineticEnergy;
    }
    toString() {
        return "pos=<x= " + this.location[0] + ", y=  " + this.location[1] + ", z= " + this.location[2] + ">, vel=<x= " + this.velocity[0] + ", y= " + this.velocity[1] + ", z= " + this.velocity[2] + ">"
    }
}

class Stellar {
    constructor() {
        this.moons = [];
        this.moonPairs = [];
    }
    addMoon(moon) {
        function getMoonPairs(array) {
            var remainingMoons = [...array];
            var pairs = [];

            while (remainingMoons.length >= 2) {
                for (var i = 1; i < remainingMoons.length; i++) {
                    pairs.push([remainingMoons[0], remainingMoons[i]]);
                }
                remainingMoons.shift();
            }
            return pairs;
        }
        this.moons.push(moon);
        this.moonPairs = getMoonPairs(this.moons);
    }

    processTick() {
        function updateVelocity(moonPairs) {
            moonPairs.forEach(function (pair) {
                pair[0].updateVelocity(pair[1]);
            });
        }
        function updateLocation(moons) {
            moons.forEach(function (moon) {
                moon.updateLocation();
            });
        }
        updateVelocity(this.moonPairs);
        updateLocation(this.moons);
    }
    toString() {
        var moons = ''
        this.moons.forEach(function (moon) {
            moons += moon.toString() + "\n";
        });
        return moons;
    }
    getEnergy(axes) {
        var energy = 0;
        this.moons.forEach(function (moon) {
            energy += moon.getEnergy(axes);
        });
        return energy;
    }
    calculateNeededTicks() {
        function gcd2(a, b) {
            // Greatest common divisor of 2 integers
            if (!b) return b === 0 ? a : NaN;
            return gcd2(b, a % b);
        }
        function lcm2(a, b) {
            // Least common multiple of 2 integers
            return a * b / gcd2(a, b);
        }
        function lcm(array) {
            // Least common multiple of a list of integers
            var n = 1;
            for (var i = 0; i < array.length; ++i)
                n = lcm2(array[i], n);
            return n;
        }

        var ticks = 0;
        //start
        var stellar = this;
        var xDone = false, yDone = false, zDone = false;
        var xTicks = 0, yTicks = 0, zTicks = 0;
        while (!(xDone && yDone && zDone)) {
            stellar.processTick();
            ticks++
            if (stellar.getEnergy(0) === 0 && !xDone) {
                xTicks = ticks;
                xDone = true;
            }
            if (stellar.getEnergy(1) === 0 && !yDone) {
                yTicks = ticks;
                yDone = true;
            }
            if (stellar.getEnergy(2) === 0 && !zDone) {
                zTicks = ticks;
                zDone = true;
            }
        }
        //We have made half a round.
        xTicks *= 2;
        yTicks *= 2;
        zTicks *= 2;
        //We have made full round.

        //Now return the least common multiple. This means that x, y and z have complete one ore more full circles.
        //See https://en.wikipedia.org/wiki/Least_common_multiple
        //lcm(a,b) = a*b / gcd(a,b)
        return lcm([xTicks, yTicks, zTicks]);
    }
}

// // <x=-1, y=0, z=2>
// // <x=2, y=-10, z=-7>
// // <x=4, y=-8, z=8>
// // <x=3, y=5, z=-1>
// var stellar = new Stellar();
// stellar.addMoon(new Moon(-1, 0, 2));
// stellar.addMoon(new Moon(2, -10, -7));
// stellar.addMoon(new Moon(4, -8, 8));
// stellar.addMoon(new Moon(3, 5, -1));

// console.log(stellar.calculateNeededTicks());
// console.log(stellar.toString());
// for (var i = 0; i < 10; i++) {
//     //console.log('');
//     stellar.processTick();
//     //console.log(stellar.toString());
// }
// console.log(stellar.getEnergy());

// var stellar = new Stellar();
// stellar.addMoon(new Moon(-1, 0, 2));
// stellar.addMoon(new Moon(2, -10, -7));
// stellar.addMoon(new Moon(4, -8, 8));
// stellar.addMoon(new Moon(3, 5, -1));


// //we've finished half a circle



// // <x=-8, y=-10, z=0>
// // <x=5, y=5, z=10>
// // <x=2, y=-7, z=3>
// // <x=9, y=-8, z=-3>
// var stellar = new Stellar();
// stellar.addMoon(new Moon(-8, -10, 0));
// stellar.addMoon(new Moon(5, 5, 10));
// stellar.addMoon(new Moon(2, -7, 3));
// stellar.addMoon(new Moon(9, -8, -3));

// console.log(stellar.calculateNeededTicks());
// console.log(stellar.toString());
// for (var i = 0; i < 100; i++) {
//     //console.log('');
//     stellar.processTick();
//     //console.log(stellar.toString());
// }

// console.log(stellar.getEnergy());

// <x=-4, y=-14, z=8>
// <x=1, y=-8, z=10>
// <x=-15, y=2, z=1>
// <x=-17, y=-17, z=16>
var stellar = new Stellar();
stellar.addMoon(new Moon(-4, -14, 8));
stellar.addMoon(new Moon(1, -8, 10));
stellar.addMoon(new Moon(-15, 2, 1));
stellar.addMoon(new Moon(-17, -17, 16));
for (var i = 0; i < 1000; i++) {
    stellar.processTick();
}

console.log('Energy after 1000 ticks: %d', stellar.getEnergy());

var stellar = new Stellar();
stellar.addMoon(new Moon(-4, -14, 8));
stellar.addMoon(new Moon(1, -8, 10));
stellar.addMoon(new Moon(-15, 2, 1));
stellar.addMoon(new Moon(-17, -17, 16));

console.log('Ticks needs for full cycle: %d', stellar.calculateNeededTicks());
