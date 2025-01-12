import AntEngine from "./AntEngine";
import AntCamera from "./render/AntCamera";
import AntGL from "./render/AntGL";

abstract class AntGame {
    engine:AntEngine;
    log:(message:string)=>void;
    camera:AntCamera;
    gl:AntGL;
    constructor(engine:AntEngine) {
        this.engine = engine;
        this.log=engine.log.bind(engine);
        this.camera=engine.camera;
        this.gl=engine.renderApi;
    }
    abstract update():void;
    abstract render():void;
    abstract start():void;
}

export default AntGame;