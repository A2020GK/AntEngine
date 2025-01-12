import "./style.css"
import AntEngine from "./engine/AntEngine";
import Game from "./Game";

const engine:AntEngine = new AntEngine(document.getElementById("canvas"));
engine.run(Game);