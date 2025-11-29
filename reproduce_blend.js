
function testBlend(rL, gL, bL, rD, gD, bD) {
    console.log(`\n--- Test: L(${rL},${gL},${bL}) D(${rD},${gD},${bD}) ---`);

    // Current RMS Algo
    const intL = Math.sqrt((rL*rL + gL*gL + bL*bL)/3);
    const intD = Math.sqrt((rD*rD + gD*gD + bD*bD)/3);
    let a_rms = 1 - (intL - intD) / 255;
    a_rms = Math.max(0.005, Math.min(0.995, a_rms));
    
    const r_rms = Math.min(255, rD / a_rms);
    const g_rms = Math.min(255, gD / a_rms);
    const b_rms = Math.min(255, bD / a_rms);
    
    console.log(`RMS Alpha: ${a_rms.toFixed(3)}`);
    console.log(`RMS Color: ${r_rms.toFixed(0)}, ${g_rms.toFixed(0)}, ${b_rms.toFixed(0)}`);
    
    // Simulate on White
    const rW_rms = r_rms * a_rms + 255 * (1 - a_rms);
    const gW_rms = g_rms * a_rms + 255 * (1 - a_rms);
    const bW_rms = b_rms * a_rms + 255 * (1 - a_rms);
    console.log(`RMS on White: ${rW_rms.toFixed(0)}, ${gW_rms.toFixed(0)}, ${bW_rms.toFixed(0)} (Target: ${rL}, ${gL}, ${bL})`);

    // New Max Algo
    const a_R = 1 - (rL - rD) / 255;
    const a_G = 1 - (gL - gD) / 255;
    const a_B = 1 - (bL - bD) / 255;
    
    let a_new = Math.max(a_R, a_G, a_B);
    // Also enforce a >= max(rD, gD, bD) / 255 to avoid clipping?
    const min_a_clip = Math.max(rD, gD, bD) / 255;
    a_new = Math.max(a_new, min_a_clip);
    
    a_new = Math.max(0.005, Math.min(0.995, a_new));

    const r_new = Math.min(255, rD / a_new);
    const g_new = Math.min(255, gD / a_new);
    const b_new = Math.min(255, bD / a_new);

    console.log(`New Alpha: ${a_new.toFixed(3)}`);
    console.log(`New Color: ${r_new.toFixed(0)}, ${g_new.toFixed(0)}, ${b_new.toFixed(0)}`);

    const rW_new = r_new * a_new + 255 * (1 - a_new);
    const gW_new = g_new * a_new + 255 * (1 - a_new);
    const bW_new = b_new * a_new + 255 * (1 - a_new);
    console.log(`New on White: ${rW_new.toFixed(0)}, ${gW_new.toFixed(0)}, ${bW_new.toFixed(0)} (Target: ${rL}, ${gL}, ${bL})`);
}

testBlend(255, 0, 0, 100, 0, 0); // Red vs Dark Red
testBlend(0, 0, 255, 0, 0, 100); // Blue vs Dark Blue
testBlend(255, 255, 0, 100, 100, 0); // Yellow vs Dark Yellow
