import AntEngine from "../AntEngine";

class AntCamera {
    engine:AntEngine;
    constructor(engine:AntEngine) {
        this.engine = engine;
    }
    x = 0;
    y = 0;
    scale = 1;
    zoom(scale:number) {
        if(this.scale-scale > 0) this.scale -= scale;
    }
    effectBegin() {
        const ctx = this.engine.renderApi.ctx;
        const width = this.engine.renderApi.canvas.width;
        const height = this.engine.renderApi.canvas.height;
        // Save the context state
        ctx.save();

        // Translate to the center of the canvas
        ctx.translate(width / 2, height / 2);

        // Scale based on the camera scale
        ctx.scale(this.scale, this.scale);

        // Translate back to the camera position
        ctx.translate(-this.x, -this.y);
    }
    effectEnd() {
        const ctx = this.engine.renderApi.ctx;
        ctx.restore();
    }
}
export default AntCamera;