
function solveLeastSquares(rL, gL, bL, rD, gD, bD) {
    let bestAlpha = 0;
    let minError = Infinity;
    let bestC = [0, 0, 0];

    for (let a = 0.005; a <= 0.995; a += 0.005) {
        let currentError = 0;
        let currentC = [0, 0, 0];

        const channels = [[rL, rD], [gL, gD], [bL, bD]];

        for (let i = 0; i < 3; i++) {
            const L = channels[i][0];
            const D = channels[i][1];

            // Unconstrained optimal X
            let X = (L + D - 255 * (1 - a)) / 2;

            // Constrain X
            X = Math.max(0, Math.min(255 * a, X));

            // Calculate C
            const C = X / a;
            currentC[i] = C;

            // Error
            const errL = (X + 255 * (1 - a) - L);
            const errD = (X - D);
            currentError += errL * errL + errD * errD;
        }

        if (currentError < minError) {
            minError = currentError;
            bestAlpha = a;
            bestC = currentC;
        }
    }
    return { alpha: bestAlpha, color: bestC, error: minError };
}

function solveWeightedLeastSquares(rL, gL, bL, rD, gD, bD, weightL) {
    let bestAlpha = 0;
    let minError = Infinity;
    let bestC = [0, 0, 0];

    for (let a = 0.005; a <= 0.995; a += 0.005) {
        let currentError = 0;
        let currentC = [0, 0, 0];

        const channels = [[rL, rD], [gL, gD], [bL, bD]];

        for (let i = 0; i < 3; i++) {
            const L = channels[i][0];
            const D = channels[i][1];

            let X = (weightL * L + D - weightL * 255 * (1 - a)) / (weightL + 1);

            // Constrain X
            X = Math.max(0, Math.min(255 * a, X));

            // Calculate C
            const C = X / a;
            currentC[i] = C;

            // Error
            const errL = (X + 255 * (1 - a) - L);
            const errD = (X - D);
            currentError += weightL * errL * errL + errD * errD;
        }

        if (currentError < minError) {
            minError = currentError;
            bestAlpha = a;
            bestC = currentC;
        }
    }
    return { alpha: bestAlpha, color: bestC, error: minError };
}

function testBlend(name, rL, gL, bL, rD, gD, bD) {
    console.log(`\n--- Test: ${name} ---`);
    console.log(`Target L: (${rL},${gL},${bL})`);
    console.log(`Target D: (${rD},${gD},${bD})`);

    // 1. Current Max Algo
    const aR = 1 - (rL - rD) / 255;
    const aG = 1 - (gL - gD) / 255;
    const aB = 1 - (bL - bD) / 255;
    let a_max = Math.max(aR, aG, aB);
    const min_a_clip = Math.max(rD, gD, bD) / 255;
    a_max = Math.max(a_max, min_a_clip);
    a_max = Math.max(0.005, Math.min(0.995, a_max));

    const r_max = Math.min(255, rD / a_max);
    const g_max = Math.min(255, gD / a_max);
    const b_max = Math.min(255, bD / a_max);

    const rW_max = r_max * a_max + 255 * (1 - a_max);
    const gW_max = g_max * a_max + 255 * (1 - a_max);
    const bW_max = b_max * a_max + 255 * (1 - a_max);

    console.log(`[Current Max] Alpha: ${a_max.toFixed(3)}`);
    console.log(`[Current Max] On White: (${rW_max.toFixed(0)}, ${gW_max.toFixed(0)}, ${bW_max.toFixed(0)})`);
    console.log(`[Current Max] On Black: (${(r_max * a_max).toFixed(0)}, ${(g_max * a_max).toFixed(0)}, ${(b_max * a_max).toFixed(0)})`);

    // 2. Least Squares Algo
    const res = solveLeastSquares(rL, gL, bL, rD, gD, bD);
    const a_ls = res.alpha;
    const r_ls = res.color[0];
    const g_ls = res.color[1];
    const b_ls = res.color[2];

    const rW_ls = r_ls * a_ls + 255 * (1 - a_ls);
    const gW_ls = g_ls * a_ls + 255 * (1 - a_ls);
    const bW_ls = b_ls * a_ls + 255 * (1 - a_ls);

    console.log(`[Least Sq] Alpha: ${a_ls.toFixed(3)}`);
    console.log(`[Least Sq] On White: (${rW_ls.toFixed(0)}, ${gW_ls.toFixed(0)}, ${bW_ls.toFixed(0)})`);
    console.log(`[Least Sq] On Black: (${(r_ls * a_ls).toFixed(0)}, ${(g_ls * a_ls).toFixed(0)}, ${(b_ls * a_ls).toFixed(0)})`);

    // 3. Weighted Least Squares Algo (wL=10)
    const resW = solveWeightedLeastSquares(rL, gL, bL, rD, gD, bD, 10);
    const a_wls = resW.alpha;
    const r_wls = resW.color[0];
    const g_wls = resW.color[1];
    const b_wls = resW.color[2];

    const rW_wls = r_wls * a_wls + 255 * (1 - a_wls);
    const gW_wls = g_wls * a_wls + 255 * (1 - a_wls);
    const bW_wls = b_wls * a_wls + 255 * (1 - a_wls);

    console.log(`[Weighted LS] Alpha: ${a_wls.toFixed(3)}`);
    console.log(`[Weighted LS] On White: (${rW_wls.toFixed(0)}, ${gW_wls.toFixed(0)}, ${bW_wls.toFixed(0)})`);
    console.log(`[Weighted LS] On Black: (${(r_wls * a_wls).toFixed(0)}, ${(g_wls * a_wls).toFixed(0)}, ${(b_wls * a_wls).toFixed(0)})`);
}

// Case 1: Red Text on Dark, White on Light (The "Traces" Issue)
testBlend("Red Text Trace", 255, 255, 255, 255, 0, 0);

// Case 2: Pure Red on Light, Black on Dark (The "Greyed Out" Issue)
testBlend("Pure Red Saturation", 255, 0, 0, 100, 0, 0);
