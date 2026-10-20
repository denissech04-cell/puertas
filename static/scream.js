const status = document.querySelector("[data-scream-status]");

async function playScream() {
    if (!(status instanceof HTMLElement)) {
        return;
    }

    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) {
        status.textContent = "Este navegador no admite la reproducción de audio.";
        return;
    }

    let context;
    try {
        context = new AudioContextClass();
        await context.resume();
        if (context.state !== "running") {
            await context.close();
            status.textContent = "El navegador bloqueó la reproducción automática del sonido.";
            return;
        }

        const now = context.currentTime;
        const duration = 1.7;
        const output = context.createGain();
        output.gain.setValueAtTime(0.0001, now);
        output.gain.exponentialRampToValueAtTime(0.28, now + 0.08);
        output.gain.setValueAtTime(0.28, now + 1.05);
        output.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        output.connect(context.destination);

        for (const detune of [-12, 12]) {
            const voice = context.createOscillator();
            voice.type = "sawtooth";
            voice.detune.value = detune;
            voice.frequency.setValueAtTime(480, now);
            voice.frequency.exponentialRampToValueAtTime(1050, now + 0.32);
            voice.frequency.exponentialRampToValueAtTime(620, now + 1.1);
            voice.frequency.exponentialRampToValueAtTime(190, now + duration);
            voice.connect(output);
            voice.start(now);
            voice.stop(now + duration);
        }

        const noiseBuffer = context.createBuffer(
            1,
            Math.ceil(context.sampleRate * duration),
            context.sampleRate,
        );
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i += 1) {
            noiseData[i] = Math.random() * 2 - 1;
        }

        const noise = context.createBufferSource();
        noise.buffer = noiseBuffer;
        const filter = context.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 1450;
        filter.Q.value = 0.8;
        const noiseGain = context.createGain();
        noiseGain.gain.setValueAtTime(0.0001, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.08, now + 0.1);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(output);
        noise.start(now);
        noise.stop(now + duration);

        noise.addEventListener("ended", async () => {
            await context.close();
            status.textContent = "El grito terminó.";
        }, { once: true });
        status.textContent = "Reproduciendo el grito.";
    } catch (error) {
        console.error("No se pudo reproducir el grito.", error);
        if (context && context.state !== "closed") {
            await context.close();
        }
        status.textContent = "No se pudo reproducir automáticamente el audio.";
    }
}

void playScream();
