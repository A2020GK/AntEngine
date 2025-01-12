import AntAnimations from "./engine/animation/AntAnimations";
import BezierEasing from "./engine/animation/BezierEasing";
import AntEngine from "./engine/AntEngine";
import AntGame from "./engine/AntGame";
import AntImage from "./engine/render/AntImage";
import { AntImageSprite } from "./engine/render/AntSprite";
import { convertScale } from "./engine/utils";

export default class Game extends AntGame {
    player: AntImageSprite = new AntImageSprite(new AntImage("/textures/player.png"), 64);
    width: number = 64;
    speed: number = 4;
    // map: number[][] = [
    //     Array.from({length:50},()=>1),
    //     [1, ...Array.from({length:49},()=>0)],
    //     [1, 0, 0, 0, 0, 0, 0, 1, 1],
    //     [1, 0, 0, 0, 0, 0, 0, 0, 1],
    //     [1, 0, 0, 0, 0, 0, 0, 0, 1],
    //     [1, 1, 1, 1, 1, 1, 1, 1, 1]
    // ];
    map:number[][]=[
        Array.from({length:16},()=>1),
        ...Array.from({length:14},()=>[1,...Array.from({length:14},()=>0),1]),
        Array.from({length:16},()=>1)
    ]

    // debugCheckCells:[number,number][]=[[0,0],[0,0]];
    // debugCells:number[]=[];

    timer: number = performance.now();
    constructor(engine: AntEngine) {
        super(engine);

        // this.camera.y += this.map.length*this.width/2;
        // this.camera.x += this.map[0].length * this.width / 2;   

        this.player.width = this.player.height = 64;
        // this.player.x = Math.ceil((this.map[0].length - 1) * this.width / 2);
        // this.player.y = Math.ceil((this.map.length - 1) * this.width / 2);
        this.player.x = 2*this.width;
        this.player.y=2*this.width;
        this.player.indexY=10;

        this.engine.watchKeys(["KeyW", "KeyA", "KeyS", "KeyD"]);
        this.engine.watchKeyPress("KeyH",(async ()=>{
            let old=[this.camera.x,this.camera.y,this.camera.scale];
            this.engine.animate("camera-out",progress=>{
                this.camera.scale=AntAnimations.valueGoto(old[2], 0.75, progress);
                this.camera.x=AntAnimations.valueGoto(old[0],this.map.length*this.width/2, progress);
                this.camera.x=AntAnimations.valueGoto(old[0],this.map[0].length*this.width/2, progress);
            },1000, BezierEasing.css["ease-in-out"]);
            old=[this.camera.x,this.camera.y,this.camera.scale];
        }).bind(this));
    }
    async start() {
        this.engine.animate("init-scale-in", progress => {
            if(progress<0.75) {
                this.camera.scale = AntAnimations.valueGoto(0.2, 1.8, convertScale(progress, 0, 0.75, 0, 1));
            } else {
                this.camera.scale=AntAnimations.valueGoto(1.8, 1.5, convertScale(progress, 0.75, 1, 0, 1));
            }
            this.camera.x=AntAnimations.valueGoto(this.map.length*this.width/2, this.width*4, progress);
            this.camera.y=AntAnimations.valueGoto(this.map[0].length*this.width/2, this.width*4, progress);
        }, 1500, BezierEasing.css["ease-in-out"]);
    }
    playerCanGo(direction: "up" | "down" | "left" | "right"): boolean {
        let nextX = this.player.x;
        let nextY = this.player.y;
        const playerWidth = this.player.width;
        const playerHeight = this.player.height;
    
        // Calculate the next position based on the direction
        switch (direction) {
            case "up":
                nextY -= this.speed;
                break;
            case "down":
                nextY += this.speed;
                break;
            case "left":
                nextX -= this.speed;
                break;
            case "right":
                nextX += this.speed;
                break;
        }
    
        // Check if the next position is within the map boundaries
        if (
            nextX < 0 || // Left boundary
            nextY < 0 || // Top boundary
            nextX + playerWidth > this.map[0].length * this.width || // Right boundary
            nextY + playerHeight > this.map.length * this.width // Bottom boundary
        ) {
            return false;
        }
    
        // Check all four corners of the player's bounding box for obstacles
        const topLeftCellX = Math.floor(nextX / this.width);
        const topLeftCellY = Math.floor(nextY / this.width);
        const topRightCellX = Math.floor((nextX + playerWidth) / this.width);
        const bottomLeftCellY = Math.floor((nextY + playerHeight) / this.width);
    
        // Check if any of the corners are on an obstacle (cell value 1)
        if (
            this.map[topLeftCellY][topLeftCellX] === 1 || // Top-left corner
            this.map[topLeftCellY][topRightCellX] === 1 || // Top-right corner
            this.map[bottomLeftCellY][topLeftCellX] === 1 || // Bottom-left corner
            this.map[bottomLeftCellY][topRightCellX] === 1 // Bottom-right corner
        ) {
            return false;
        }
    
        return true;
    }
    
    update(): void {
        // Walk index 8 9 10 11
        this.log(`Player: [${this.player.x}, ${this.player.y}]`)
        this.log(`Keyboard: ${[this.engine.keyboard.watch.KeyW, this.engine.keyboard.watch.KeyA, this.engine.keyboard.watch.KeyS, this.engine.keyboard.watch.KeyD].join(", ")}`);
        if (this.engine.keyboard.watch.KeyW) {
            if (this.playerCanGo("up")) {
                this.player.y -= this.speed;
                this.animatePlayer();
            }
            this.player.indexY=8;
        }
        if (this.engine.keyboard.watch.KeyA) {
            if (this.playerCanGo("left")) {
                this.player.x -= this.speed;
                this.animatePlayer();
            }
            this.player.indexY=9;
        }
        if (this.engine.keyboard.watch.KeyS) {
            if (this.playerCanGo("down")) {
                this.player.y += this.speed;
                this.animatePlayer();
            }
            this.player.indexY=10;
        }
        if (this.engine.keyboard.watch.KeyD) {
            if (this.playerCanGo("right")) {
                this.player.x += this.speed;
                this.animatePlayer();
            }
            this.player.indexY=11;
        }
        if(!(this.engine.keyboard.watch.KeyW||this.engine.keyboard.watch.KeyA||this.engine.keyboard.watch.KeyS||this.engine.keyboard.watch.KeyD)) {
            this.player.indexX=0;
        }
        this.log(`P_Index: ${this.player.indexX}`);

        if(this.player.x -this.camera.x>(this.gl.canvas.width/2)*0.4) this.camera.x+=this.speed;
        if(this.player.x -this.camera.x>(this.gl.canvas.width/2)*0.4) this.camera.x+=this.speed;
if(this.player.x -this.camera.x<-(this.gl.canvas.width/2)*0.4) this.camera.x-=this.speed;
if(this.player.y -this.camera.y>(this.gl.canvas.height/2)*0.4) this.camera.y+=this.speed;
if(this.player.y -this.camera.y<-(this.gl.canvas.height/2)*0.4) this.camera.y-=this.speed;   
    }
    animatePlayer():void {
        this.player.indexX++;
        if(this.player.indexX>=9) this.player.indexX=0;
    }
    render(): void {
        this.camera.effectBegin();

        this.map.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell == 0) this.gl.fillColor("transparent");
                else if (cell == 1) this.gl.fillColor("white");
                this.gl.ctx.fillRect(x * this.width, y * this.width, this.width, this.width);
            });
        });

        this.gl.renderSprite(this.player);

        this.gl.fillColor("rgba(255,0,0,0.5)");
        // if(this.debugCheckCells[0]) {this.gl.ctx.fillRect(this.debugCheckCells[0][0]*this.width, this.debugCheckCells[0][1]*this.width, this.width, this.width);
        //     this.gl.ctx.fillRect(this.debugCheckCells[1][0]*this.width, this.debugCheckCells[1][1]*this.width, this.width, this.width);
        // }
        //this.gl.ctx.fillRect(this.debugCells[0]*this.width, this.debugCells[2]*this.width, this.width, this.width);

        this.camera.effectEnd();
    }
}