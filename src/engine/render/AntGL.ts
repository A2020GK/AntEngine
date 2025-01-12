import { AntImageSprite } from "./AntSprite";

class Color {
    constructor(
        public r: number, 
        public g: number, 
        public b: number
    ) {}

    // Converts the color to a CSS string
    toCss() {
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }

    // Static method to create a Color instance from a CSS color string
    static fromCss(cssColor: string): Color {
        // Create a temporary canvas element to use its context for color parsing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Could not create canvas context');
        }

        // Set the fill style to the CSS color
        ctx.fillStyle = cssColor;

        // Extract the RGB values from the fill style
        const rgb = ctx.fillStyle
            .replace(/[^\d,]/g, '') // Remove non-numeric characters
            .split(',') // Split into an array of strings
            .map(Number); // Convert to numbers

        return new Color(rgb[0], rgb[1], rgb[2]);
    }
}

// Классовая война!
// Давайте начнём классовую войну

/**
 * Graphics Library (AntEngine Module)
 * 
 * Uses Canvas Rendering Context 2D to render stuff, like some
 * ants, ants, more ants, ants everywhere!!
 * I AM GOING TO BUILD REAL ENGINE POWERED BY ANT RUNNING IN SOME WHEEL WHAWHAEFJLGR JNKJDF BEIHB KJNDSJ...
 */
class AntGL {
    ctx:CanvasRenderingContext2D;
    constructor(public canvas:HTMLCanvasElement) {
        const ctx: CanvasRenderingContext2D | null = this.canvas.getContext("2d", { alpha: false });
        if (ctx == null) throw new Error("CanvasRenderingContext2D is unavailable for given canvas");
        this.ctx=ctx;
    }
    lineColor(color:Color|string) {
        this.ctx.strokeStyle=(color instanceof Color)?color.toCss():color;
    }
    fillColor(color:Color|string) {
        this.ctx.fillStyle=(color instanceof Color)?color.toCss():color;
    }
    renderSprite(image:AntImageSprite) {
        image.render(this.ctx);
    }
}
export default AntGL;
export {Color};
