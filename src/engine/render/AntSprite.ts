import AntImage from "./AntImage";

export class AntImageSprite {
    indexX:number=0;
    indexY:number=0;
    x:number=0;
    y:number=0;
    width:number=this.sprite_size;
    height:number=this.sprite_size;
    constructor(
        public spritesheet: AntImage,
         public sprite_size: number) { }
    render(ctx: CanvasRenderingContext2D) {
        if (this.spritesheet.loaded) ctx.drawImage(
            this.spritesheet,
            this.indexX * this.sprite_size,
            this.indexY * this.sprite_size,
            this.sprite_size,
            this.sprite_size,
            this.x, this.y, this.width, this.height
        );
    }
}