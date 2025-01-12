class AntAnimations {
    static valueGoto(from:number, to:number, progress:number) {
        return from + (to - from) * progress;
    }
}
export default AntAnimations;