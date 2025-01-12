class BezierEasing {
    static NEWTON_ITERATIONS: number = 4;
    static NEWTON_MIN_SLOPE: number = 0.001;
    static SUBDIVISION_PRECISION: number = 0.0000001;
    static SUBDIVISION_MAX_ITERATIONS: number = 10;
    static SPLINE_TABLE_SIZE: number = 11;
    static SAMPLE_STEP_SIZE: number = 1.0 / (BezierEasing.SPLINE_TABLE_SIZE - 1.0);

    static A(aA1: number, aA2: number): number { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
    static B(aA1: number, aA2: number): number { return 3.0 * aA2 - 6.0 * aA1; }
    static C(aA1: number): number { return 3.0 * aA1; }

    static calcBezier(aT: number, aA1: number, aA2: number): number {
        return ((BezierEasing.A(aA1, aA2) * aT + BezierEasing.B(aA1, aA2)) * aT + BezierEasing.C(aA1)) * aT;
    }

    static getSlope(aT: number, aA1: number, aA2: number): number {
        return 3.0 * BezierEasing.A(aA1, aA2) * aT * aT + 2.0 * BezierEasing.B(aA1, aA2) * aT + BezierEasing.C(aA1);
    }

    mX1: number;
    mY1: number;
    mX2: number;
    mY2: number;
    mSampleValues: Float32Array;
    _precomputed: boolean;

    constructor(mX1: number, mY1: number, mX2: number, mY2: number) {
        if (arguments.length !== 4) {
            throw new Error("BezierEasing requires 4 arguments.");
        }
        for (let i = 0; i < 4; ++i) {
            if (typeof arguments[i] !== "number" || isNaN(arguments[i]) || !isFinite(arguments[i])) {
                throw new Error("BezierEasing arguments should be numbers.");
            }
        }
        if (mX1 < 0 || mX1 > 1 || mX2 < 0 || mX2 > 1) {
            throw new Error("BezierEasing x values must be in [0, 1] range.");
        }

        this.mX1 = mX1;
        this.mY1 = mY1;
        this.mX2 = mX2;
        this.mY2 = mY2;
        this.mSampleValues = new Float32Array(BezierEasing.SPLINE_TABLE_SIZE);
        this._precomputed = false;
    }

    static css: { [key: string]: BezierEasing } = {
        "ease": new BezierEasing(0.25, 0.1, 0.25, 1.0),
        "linear": new BezierEasing(0.00, 0.0, 1.00, 1.0),
        "ease-in": new BezierEasing(0.42, 0.0, 1.00, 1.0),
        "ease-out": new BezierEasing(0.00, 0.0, 0.58, 1.0),
        "ease-in-out": new BezierEasing(0.42, 0.0, 0.58, 1.0)
    };

    binarySubdivide(aX: number, aA: number, aB: number): number {
        let currentX: number, currentT: number, i: number = 0;
        do {
            currentT = aA + (aB - aA) / 2.0;
            currentX = BezierEasing.calcBezier(currentT, this.mX1, this.mX2) - aX;
            if (currentX > 0.0) {
                aB = currentT;
            } else {
                aA = currentT;
            }
        } while (Math.abs(currentX) > BezierEasing.SUBDIVISION_PRECISION && ++i < BezierEasing.SUBDIVISION_MAX_ITERATIONS);
        return currentT;
    }

    newtonRaphsonIterate(aX: number, aGuessT: number): number {
        for (let i = 0; i < BezierEasing.NEWTON_ITERATIONS; ++i) {
            const currentSlope = BezierEasing.getSlope(aGuessT, this.mX1, this.mX2);
            if (currentSlope === 0.0) return aGuessT;
            const currentX = BezierEasing.calcBezier(aGuessT, this.mX1, this.mX2) - aX;
            aGuessT -= currentX / currentSlope;
        }
        return aGuessT;
    }

    calcSampleValues(): void {
        for (let i = 0; i < BezierEasing.SPLINE_TABLE_SIZE; ++i) {
            this.mSampleValues[i] = BezierEasing.calcBezier(i * BezierEasing.SAMPLE_STEP_SIZE, this.mX1, this.mX2);
        }
    }

    getTForX(aX: number): number {
        let intervalStart: number = 0.0;
        let currentSample: number = 1;
        const lastSample: number = BezierEasing.SPLINE_TABLE_SIZE - 1;

        for (; currentSample != lastSample && this.mSampleValues[currentSample] <= aX; ++currentSample) {
            intervalStart += BezierEasing.SAMPLE_STEP_SIZE;
        }
        --currentSample;

        const dist: number = (aX - this.mSampleValues[currentSample]) / (this.mSampleValues[currentSample + 1] - this.mSampleValues[currentSample]);
        const guessForT: number = intervalStart + dist * BezierEasing.SAMPLE_STEP_SIZE;

        const initialSlope: number = BezierEasing.getSlope(guessForT, this.mX1, this.mX2);
        if (initialSlope >= BezierEasing.NEWTON_MIN_SLOPE) {
            return this.newtonRaphsonIterate(aX, guessForT);
        } else if (initialSlope === 0.0) {
            return guessForT;
        } else {
            return this.binarySubdivide(aX, intervalStart, intervalStart + BezierEasing.SAMPLE_STEP_SIZE);
        }
    }

    precompute(): void {
        this._precomputed = true;
        if (this.mX1 != this.mY1 || this.mX2 != this.mY2)
            this.calcSampleValues();
    }

    get(aX: number): number {
        if (!this._precomputed) this.precompute();
        if (this.mX1 === this.mY1 && this.mX2 === this.mY2) return aX; // linear
        if (aX === 0) return 0;
        if (aX === 1) return 1;
        return BezierEasing.calcBezier(this.getTForX(aX), this.mY1, this.mY2);
    }

    getControlPoints(): { x: number, y: number }[] {
        return [{ x: this.mX1, y: this.mY1 }, { x: this.mX2, y: this.mY2 }];
    }

    toString(): string {
        return `BezierEasing(${[this.mX1, this.mY1, this.mX2, this.mY2]})`;
    }

    toCSS(): string {
        return `cubic-bezier(${[this.mX1, this.mY1, this.mX2, this.mY2]})`;
    }
}

export default BezierEasing;