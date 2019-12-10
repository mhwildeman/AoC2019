class Map {
    constructor(mapinput) {
        this.map = mapinput.split(',').map(x => x.split(''));
        this.initialize();
    }
    initialize() {
        this.asteroids = [];
        this.populateAsteroids();
        this.calculateSightings();
    }
    populateAsteroids = function () {

        for (var y = 0; y < this.map.length; y++) {
            for (var x = 0; x < this.map[y].length; x++) {
                if (this.map[y][x] === '#') {
                    this.asteroids.push(new Asteroid(x, y));
                }
            }
        }
    }
    calculateSightings = function () {
        this.asteroids.forEach(asteroidSrc => {
            this.asteroids.forEach(asteroidDst => {
                asteroidSrc.addSighting(asteroidDst);
            });
        });
    }
    getMaxSightings = function () {
        var max = 0;
        var maxAst = null
        this.asteroids.forEach(asteroid => {
            if (max < asteroid.getSightingCount()) {
                max = asteroid.getSightingCount();
                maxAst = asteroid;
            }
        });
        return maxAst;
    }
}

class Asteroid {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.sightings = []; //this field contains sightings.
    }
    addSighting = function (addedAsteroid) {
        var x = addedAsteroid.x;
        var y = addedAsteroid.y;
        var degOffset;
        var degrees;
        switch (true) {
            case x === this.x && y === this.y:
                //We're us. Stop right here.
                return;
            case x === this.x:
                //We're on the vertical line
                degrees = y < this.y ? 0 : 180;
                break;
            case y === this.y:
                degrees = x < this.x ? 270 : 90;
                break;
            case y < this.y && x > this.x: //We're north-east. No offset.
                degOffset = 0;
                var o = Math.abs(x - this.x);
                var a = Math.abs(y - this.y)
                degrees = degOffset + Math.atan(o / a) * 180 / Math.PI;
                break;
            case y > this.y && x > this.x: //We're south-east.
                degOffset = 90;
                var o = Math.abs(y - this.y)
                var a = Math.abs(x - this.x);
                degrees = degOffset + Math.atan(o / a) * 180 / Math.PI;
                break;
            case y > this.y && x < this.x: //We're south-west.
                degOffset = 180;
                var a = Math.abs(y - this.y)
                var o = Math.abs(x - this.x);
                degrees = degOffset + Math.atan(o / a) * 180 / Math.PI;
                break;
            case y < this.y && x < this.x: //We're south-west.
                degOffset = 270;
                var o = Math.abs(y - this.y)
                var a = Math.abs(x - this.x);
                degrees = degOffset + Math.atan(o / a) * 180 / Math.PI;
                break;
        }

        var label = '' + Math.round(degrees * 1000);

        //Now all astroids on the same line from `this` will get same label.
        var ast = _.find(this.sightings, function (asteroid) { return asteroid.label === label });
        if (typeof ast === 'undefined') {
            this.sightings.push({ label: label, count: 1, degrees: degrees, ast: [addedAsteroid] });
        }
        else {
            ast.count += 1;
            ast.ast.push(addedAsteroid);
            //Make sure that first asteroid is closest.
            ast.ast = _.sortBy(ast.ast, function (ast) {
                return Math.sqrt(Math.pow(ast.y - y, 2) + Math.pow(ast.x - x, 2));
            });
        }
    }
    shootSightings(count) {
        this.sightings = _.sortBy(this.sightings, 'degrees');
        var vaporized = 0;
        if (count <= this.sightings.length) {
            //We need less than one turn. No need to complicate stuff.
            return this.sightings[count - 1].ast[0];
        }

        //This part is not needed for puzzle, but who knows. Maybe we'll need it some time.
        while (count > 0) {
            var asteroid = null;
            for (var i = 0; i < this.sightings.length; i++) {
                if (this.sightings[i].count > 0) {
                    this.sightings[i].count--;
                    asteroid = this.sightings[i].ast.shift();
                    count--;
                }
                if (count === 0) {
                    //We've made more than one turn and are done.
                    return asteroid;
                }

            }
        }
    }
    getSightingCount() { return this.sightings.length; }
}


// //Test 1
// var mapInput = '.#..#,.....,#####,....#,...##'
// var map = new Map(mapInput);
// console.log(map.getMaxSightings());

// //Test 2
// var mapInput = '......#.#.,#..#.#....,..#######.,.#.#.###..,.#..#.....,..#....#.#,#..#....#.,.##.#..###,##...#..#.,.#....####';
// var map = new Map(mapInput);
// console.log(map.getMaxSightings());

// //Test 3
// var mapInput = '#.#...#.#.,.###....#.,.#....#...,##.#.#.#.#,....#.#.#.,.##..###.#,..#...##..,..##....##,......#...,.####.###.';
// var map = new Map(mapInput);
// console.log(map.getMaxSightings());

// //Test 4
// var mapInput = '.#..#..###,####.###.#,....###.#.,..###.##.#,##.##.#.#.,....###..#,..#.#..#.#,#..#.#.###,.##...##.#,.....#.#..';
// var map = new Map(mapInput);
// console.log(map.getMaxSightings());

// //Test 5
// var mapInput = '.#..##.###...#######,##.############..##.,.#.######.########.#,.###.#######.####.#.,#####.##.#.##.###.##,..#####..#.#########,####################,#.####....###.#.#.##,##.#################,#####.##.###..####..,..######..##.#######,####.##.####...##..#,.#####..#.######.###,##...#.##########...,#.##########.#######,.####.#.###.###.#.##,....##.##.###..#####,.#.#.###########.###,#.#.#.#####.####.###,###.##.####.##.#..##';
// var map = new Map(mapInput);
// var station = map.getMaxSightings();
// console.log(station)
// var astroidShot = station.shootSightings(200)
// console.log(astroidShot.x * 100 + astroidShot.y);

//Puzzle 1
var startTime = Date.now();

//Puzzle part 1:
console.log('Part 1:')
var mapInput = '#.....#...#.........###.#........#..,....#......###..#.#.###....#......##,......#..###.......#.#.#.#..#.......,......#......#.#....#.##....##.#.#.#,...###.#.#.......#..#...............,....##...#..#....##....#...#.#......,..##...#.###.....##....#.#..##.##...,..##....#.#......#.#...#.#...#.#....,.#.##..##......##..#...#.....##...##,.......##.....#.....##..#..#..#.....,..#..#...#......#..##...#.#...#...##,......##.##.#.#.###....#.#..#......#,#..#.#...#.....#...#...####.#..#...#,...##...##.#..#.....####.#....##....,.#....###.#...#....#..#......#......,.##.#.#...#....##......#.....##...##,.....#....###...#.....#....#........,...#...#....##..#.#......#.#.#......,.#..###............#.#..#...####.##.,.#.###..#.....#......#..###....##..#,#......#.#.#.#.#.#...#.#.#....##....,.#.....#.....#...##.#......#.#...#..,...##..###.........##.........#.....,..#.#..#.#...#.....#.....#...###.#..,.#..........#.......#....#..........,...##..#..#...#..#...#......####....,.#..#...##.##..##..###......#.......,.##.....#.......#..#...#..#.......#.,#.#.#..#..##..#..............#....##,..#....##......##.....#...#...##....,.##..##..#.#..#.................####,##.......#..#.#..##..#...#..........,#..##...#.##.#.#.........#..#..#....,.....#...#...#.#......#....#........,....#......###.#..#......##.....#..#,#..#...##.........#.....##.....#....';
var map = new Map(mapInput);
var station = map.getMaxSightings();
console.log(station)
console.log('Part 2:')
var astroidShot = station.shootSightings(200)
console.log(astroidShot.x * 100 + astroidShot.y);
var millis = Date.now() - startTime;
console.log(`Milliseconds elapsed = ${millis}`);
