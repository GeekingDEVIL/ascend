class LowPassFilter {
    private y = 0;
    private s = 0;
    private initialized = false;

    filter(value: number, alpha: number): number {
        if (!this.initialized) { this.y = value; this.s = value; this.initialized = true; return value; }
        this.y = alpha * value + (1 - alpha) * this.s;
        this.s = this.y;
        return this.y;
    }

    reset() { this.initialized = false; }
}

export class OneEuroFilter {
    private freq: number;
    private minCutoff: number;
    private beta: number;
    private dCutoff: number;
    private xFilter = new LowPassFilter();
    private dxFilter = new LowPassFilter();
    private lastTime = -1;

    constructor(freq = 30, minCutoff = 1.0, beta = 0.007, dCutoff = 1.0) {
        this.freq = freq;
        this.minCutoff = minCutoff;
        this.beta = beta;
        this.dCutoff = dCutoff;
    }

    private alpha(cutoff: number): number {
        const te = 1.0 / this.freq;
        const tau = 1.0 / (2 * Math.PI * cutoff);
        return 1.0 / (1.0 + tau / te);
    }

    filter(value: number, timestamp?: number): number {
        if (timestamp !== undefined && this.lastTime >= 0) {
            const dt = timestamp - this.lastTime;
            if (dt > 0) this.freq = 1.0 / dt;
        }
        if (timestamp !== undefined) this.lastTime = timestamp;

        const dValue = this.xFilter["initialized"]
            ? (value - this.xFilter["s"]) * this.freq
            : 0;
        const edValue = this.dxFilter.filter(dValue, this.alpha(this.dCutoff));
        const cutoff = this.minCutoff + this.beta * Math.abs(edValue);
        return this.xFilter.filter(value, this.alpha(cutoff));
    }

    reset() {
        this.xFilter.reset();
        this.dxFilter.reset();
        this.lastTime = -1;
    }
}

export class LandmarkSmoother {
    private filters: OneEuroFilter[][] = [];

    smooth(landmarks: any[]): any[] {
        if (this.filters.length === 0) {
            for (let i = 0; i < landmarks.length; i++) {
                this.filters.push([
                    new OneEuroFilter(30, 1.0, 0.007, 1.0),
                    new OneEuroFilter(30, 1.0, 0.007, 1.0),
                    new OneEuroFilter(30, 1.0, 0.007, 1.0),
                ]);
            }
        }

        return landmarks.map((lm, i) => {
            if (!this.filters[i]) return lm;
            return {
                ...lm,
                x: this.filters[i][0].filter(lm.x),
                y: this.filters[i][1].filter(lm.y),
                z: this.filters[i][2].filter(lm.z),
            };
        });
    }

    reset() {
        for (const group of this.filters) {
            for (const f of group) f.reset();
        }
    }
}
