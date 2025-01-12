class AntImage extends Image {
    loaded:boolean=false;
    constructor(src:string) {
        super();
        this.src = src;
        this.loaded = false;
        const load=(()=>this.loaded=true).bind(this);
        this.addEventListener("load",load);
        this.addEventListener("error", function() {
            console.error(`[AntEngine:Assets]>[AntImage] Failed to load AntImage on path ${src}`);
        });
    }
}

export default AntImage;