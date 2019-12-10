class Map {
    constructor(mapinput) {
        this.map = mapinput.split(',').map(x => x.split(''));
        this.asteroids = [];
        this.populateAsteroids();
        this.calculateSightings();
    }
    populateAsteroids = function () {

        for (var y = 0; y < this.map.length; y++) {
            for (var x = 0; x < this.map[y].length; x++) {
                if (this.map[y][x] === '#') {
                    this.asteroids.push(new Asteroid(x,y));
                }
            }
        }
    }
    calculateSightings = function () {
        this.asteroids.forEach(asteroidSrc => {
            this.asteroids.forEach(asteroidDst => {
                asteroidSrc.addSighting(asteroidDst.x,asteroidDst.y);
            });
        });
    }
    getMaxSightings = function () {
        var max = 0;
        var maxAst = null
        this.asteroids.forEach(asteroid =>{
            if(max<asteroid.getSightingCount())
            {
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
    addSighting = function (x, y) {
        var label;
        if (x < this.x) {
            label = 'n'; //North
        }
        else {
            label = 's'; //South
        }
        switch (true) {
            case x === this.x && y === this.y:
                //We're us. Stop right here.
                return;
            case x === this.x:
                //We're on the vertical line
                label += y < this.y ? 'n' : 's';
                break;
            case y === this.y:
                label += x < this.x ? 'w' : 'e';
                break;
            default:
                label += (Math.round(1000 * ((x - this.x) / (y - this.y))));
                break;

        }

        //Now all astroids on the same line from `this` will get same label.
        if (_.indexOf(this.sightings, label) === -1) {
            this.sightings.push(label);
        }
    }
    getSightingCount(){return this.sightings.length;}
}


//Test 1
var mapInput = '.#..#,.....,#####,....#,...##'
var map = new Map(mapInput);
console.log(map.getMaxSightings());

//Test 2
var mapInput = '......#.#.,#..#.#....,..#######.,.#.#.###..,.#..#.....,..#....#.#,#..#....#.,.##.#..###,##...#..#.,.#....####';
var map = new Map(mapInput);
console.log(map.getMaxSightings());

//Test 3
var mapInput = '#.#...#.#.,.###....#.,.#....#...,##.#.#.#.#,....#.#.#.,.##..###.#,..#...##..,..##....##,......#...,.####.###.';
var map = new Map(mapInput);
console.log(map.getMaxSightings());

//Test 4
var mapInput = '.#..#..###,####.###.#,....###.#.,..###.##.#,##.##.#.#.,....###..#,..#.#..#.#,#..#.#.###,.##...##.#,.....#.#..';
var map = new Map(mapInput);
console.log(map.getMaxSightings());

//Test 5
var mapInput = '.#..##.###...#######,##.############..##.,.#.######.########.#,.###.#######.####.#.,#####.##.#.##.###.##,..#####..#.#########,####################,#.####....###.#.#.##,##.#################,#####.##.###..####..,..######..##.#######,####.##.####...##..#,.#####..#.######.###,##...#.##########...,#.##########.#######,.####.#.###.###.#.##,....##.##.###..#####,.#.#.###########.###,#.#.#.#####.####.###,###.##.####.##.#..##';
var map = new Map(mapInput);
console.log(map.getMaxSightings());

//Puzzle 1
var startTime = Date.now();

//Puzzle part 1:
console.log('Part 1:')
var mapInput = '#.....#...#.........###.#........#..,....#......###..#.#.###....#......##,......#..###.......#.#.#.#..#.......,......#......#.#....#.##....##.#.#.#,...###.#.#.......#..#...............,....##...#..#....##....#...#.#......,..##...#.###.....##....#.#..##.##...,..##....#.#......#.#...#.#...#.#....,.#.##..##......##..#...#.....##...##,.......##.....#.....##..#..#..#.....,..#..#...#......#..##...#.#...#...##,......##.##.#.#.###....#.#..#......#,#..#.#...#.....#...#...####.#..#...#,...##...##.#..#.....####.#....##....,.#....###.#...#....#..#......#......,.##.#.#...#....##......#.....##...##,.....#....###...#.....#....#........,...#...#....##..#.#......#.#.#......,.#..###............#.#..#...####.##.,.#.###..#.....#......#..###....##..#,#......#.#.#.#.#.#...#.#.#....##....,.#.....#.....#...##.#......#.#...#..,...##..###.........##.........#.....,..#.#..#.#...#.....#.....#...###.#..,.#..........#.......#....#..........,...##..#..#...#..#...#......####....,.#..#...##.##..##..###......#.......,.##.....#.......#..#...#..#.......#.,#.#.#..#..##..#..............#....##,..#....##......##.....#...#...##....,.##..##..#.#..#.................####,##.......#..#.#..##..#...#..........,#..##...#.##.#.#.........#..#..#....,.....#...#...#.#......#....#........,....#......###.#..#......##.....#..#,#..#...##.........#.....##.....#....';
var map = new Map(mapInput);
console.log(map.getMaxSightings());
var millis = Date.now() - startTime;
console.log(`Milliseconds elapsed = ${millis}`);
