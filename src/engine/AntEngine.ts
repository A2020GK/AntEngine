import AntCamera from "./render/AntCamera";
import AntGame from "./AntGame";
import BezierEasing from "./animation/BezierEasing";
import AntGL from "./render/AntGL";

interface AntKeyboard {
    watch: Record<string, any>,
    press: Record<string, (event:KeyboardEvent) => void>
}
class AntEngine {
    version = "1.1";
    fpsFrames = 0;
    fps: number | string = 0;
    animations = new Map();
    assets = new Map();
    running = false;
    protected debugTextLine = 1;
    appLog: string[] = [];
    renderApi:AntGL;
    camera: AntCamera;
    protected resizeHandler: () => void;
    protected keydownHandler: (event: KeyboardEvent) => void;
    protected keyupHandler: (event: KeyboardEvent) => void;
    protected fpsInterval: number;
    app!: AntGame;

    keyboard: AntKeyboard = { watch: {}, press: {} };

    constructor(canvas: HTMLElement|null) {
        console.log("-----------------------------------")
        console.log(`[AntEngine ${this.version} is used]`);
        if(canvas == null) throw new Error("Given HTMLCanvasElement is wrong or null");
        this.renderApi=new AntGL(canvas as HTMLCanvasElement);
        this.camera = new AntCamera(this);

        // Bind methods once
        this.resizeHandler = this.updateSize.bind(this);
        this.keydownHandler = (e) => this.keyaction(e, true);
        this.keyupHandler = (e) => this.keyaction(e, false);

        addEventListener("resize", this.resizeHandler);
        this.updateSize();
        document.addEventListener("keydown", this.keydownHandler);
        document.addEventListener("keyup", this.keyupHandler);

        // Use RAF for FPS counting
        this.fpsInterval = setInterval(() => {
            this.fps = this.fpsFrames;
            this.fpsFrames = 0;
        }, 1000);
    }

    protected updateSize() {
        this.renderApi.canvas.width = innerWidth;
        this.renderApi.canvas.height = innerHeight;
    }
    assetsLoad(assets: Record<string, any>) {
        Object.keys(assets).forEach(key => {
            this.assets.set(key, assets[key]);
        });
    }
    protected keyaction(event: KeyboardEvent, type: boolean) {
        this.keyboard.watch[event.code] = type;
        if (type) {
            if (this.keyboard.press[event.code] != undefined) {
                console.log(`[AntEngine:Keyboard] Key callback: ${event.code}`)
                this.keyboard.press[event.code](event);
            }
        }
    }
    log(message: string) {
        this.appLog.push(message);
        this.debugTextLine++;
    }
    protected fpsCheck() {
        this.fps = this.fpsFrames;
        this.fpsFrames = 0;
    }
    protected debugText(lines: string[], color = "blue") {
        const ctx: CanvasRenderingContext2D = this.renderApi.ctx;
        ctx.font = "20px Arial";
        ctx.fillStyle = color;
        ctx.textBaseline = "top";
        lines.forEach(line => {
            ctx.fillText(line, 5, 5 + this.debugTextLine * 25);
            this.debugTextLine++;
        });
    }
    protected loop(_timestamp: number = 0, init = false) {
        if (!this.running && init) {
            this.running = true;
            console.log("[AntEngine:MainLoop] Start");
        }

        // Update and render
        this.app.update();

        // Clear with cached dimensions
        const width = this.renderApi.canvas.width;
        const height = this.renderApi.canvas.height;
        this.renderApi.ctx.clearRect(0, 0, width, height);

        // Render the scene
        this.app.render();

        // this.renderApi.ctx.strokeStyle = "red";
        // this.renderApi.ctx.lineWidth = 1;
        // this.renderApi.ctx.beginPath();
        // this.renderApi.ctx.moveTo(-10, 0);
        // this.renderApi.ctx.lineTo(10, 0);
        // this.renderApi.ctx.stroke();
        // this.renderApi.ctx.beginPath();
        // this.renderApi.ctx.moveTo(0, -10);
        // this.renderApi.ctx.lineTo(0, 10);
        // this.renderApi.ctx.stroke();

        this.fpsFrames++;

        this.camera.effectEnd();

        // Prepare animation log
        let animationText: string | string[] = "--";
        if (this.animations.size > 0) {
            animationText = [];
            for (const [key, value] of this.animations) {
                animationText.push(`${key}(${(value[1] * 100).toFixed(2)}%)`);
            }
            animationText = animationText.join(", ");
        }
        this.debugTextLine = 0;
        if (!this.running) {
            this.fps = "[paused]";
            animationText = "paused";
        }
        // Debug information
        this.debugText([
            `[${this.app.constructor.name}]`,
            `AntEngine ${this.version}`,
            `FPS: ${this.fps}`,
            `Animations: [${animationText}]`,
            `Camera: [${~~this.camera.x},${~~this.camera.y}](${~~(this.camera.scale * 100)})`,
            `-------------------------------`
        ]);
        if (!this.running) return;
        this.debugText(this.appLog, "red");
        this.appLog = [];

        requestAnimationFrame(this.loop.bind(this));
    }
    run(app: (new (engine: AntEngine) => AntGame) | null = null) {
        if (app != null && this.app == undefined) {
            this.app = new app(this);
        }
        if (!this.running) {
            this.loop(0, true);
            this.app.start();
        }
    }
    pause() {
        this.running = false;
    }
    stop() {
        this.pause();
        this.app = new (this.app.constructor as new (engine: AntEngine) => AntGame)(this);
    }
    async animate(name: string, callback: (progress: number) => void, duration: number, easing: BezierEasing | string): Promise<void> {
        if (!this.running) return;
    
        return new Promise((resolve) => {
            if (!this.animations.has(name)) {
                console.log(`[AntEngine:Animations] Animating ${name}`);
    
                const start = performance.now();
                const animationLoop = (timestamp: number) => {
                    const progress = Math.min((timestamp - start) / duration, 1);
    
                    if (typeof easing === 'string') {
                        callback(BezierEasing.css[easing].get(progress));
                    } else if (easing instanceof BezierEasing) {
                        callback(easing.get(progress));
                    } else {
                        callback(progress); // Linear if no easing specified
                    }
    
                    if (progress < 1) {
                        this.animations.set(name, [requestAnimationFrame(animationLoop), progress]);
                    } else {
                        this.animations.delete(name);
                        resolve(); // Resolve the promise when the animation completes
                    }
                };
    
                this.animations.set(name, [requestAnimationFrame(animationLoop), 1]);
            }
        });
    }elAnimation(name: string) {
        const animation = this.animations.get(name);
        if (animation) {
            cancelAnimationFrame(animation[0]); // Cancel the animation frame
            this.animations.delete(name); // Correctly delete the entry from the Map
        }
    }
    collision(x1:number, y1:number, width1:number, height1:number, x2:number, y2:number, width2:number, height2:number, includeCorners = false) {
        const right1 = x1 + width1;
        const bottom1 = y1 + height1;
        const right2 = x2 + width2;
        const bottom2 = y2 + height2;

        return includeCorners ?
            (x1 <= right2 && right1 >= x2 && y1 <= bottom2 && bottom1 >= y2) :
            (x1 < right2 && right1 > x2 && y1 < bottom2 && bottom1 > y2);
    }
    watchKeys(keys:string[]) {
        console.log(`[AntEngine:Keyboard] Watching keys [${keys.join(", ")}]`);
        for (const key in keys) this.keyboard.watch[keys[key]] = false;
    }
    watchKeyPress(key:string, callback:(event:KeyboardEvent)=>void) {
        console.log(`[AntEngine:Keyboard] Watching key (callback) ${key}`);
        this.keyboard.press[key] = callback;
    }
}
export default AntEngine;