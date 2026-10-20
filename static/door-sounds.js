const soundLinks = document.querySelectorAll("a[data-sound]");
const soundStatus = document.querySelector("[data-sound-status]");

for (const link of soundLinks) {
    if (!(link instanceof HTMLAnchorElement)) {
        continue;
    }

    link.addEventListener("click", (event) => {
        if (
            event.button !== 0
            || event.ctrlKey
            || event.metaKey
            || event.shiftKey
            || event.altKey
        ) {
            return;
        }

        void playSound(link.dataset.sound);
    });
}

async function playSound(sound) {
    const AudioContextClass = window.AudioContext;

    if (!AudioContextClass || (sound !== "victory" && sound !== "spooky")) {
        if (soundStatus instanceof HTMLElement) {
            soundStatus.textContent = "Este navegador no admite la reproducción de audio.";
        }
        return;
    }

    let context;
    try {
        context = new AudioContextClass();
        const resume = context.resume();
        const duration = sound === "victory" ? playVictory(context) : playSpooky(context);
        await resume;

        if (context.state !== "running") {
            throw new Error("El navegador no permitió iniciar el audio.");
        }

        if (soundStatus instanceof HTMLElement) {
            soundStatus.textContent = sound === "victory"
                ? "Reproduciendo sonido de victoria."
                : "Reproduciendo sonido tenebroso.";
        }

        window.setTimeout(() => {
            void context.close();
        }, duration * 1000);
    } catch (error) {
        console.error("No se pudo reproducir el sonido de la puerta.", error);
        if (context && context.state !== "closed") {
            await context.close();
        }
    }
}

function playVictory(context) {
    const now = context.currentTime;
    const notes = [
        { frequency: 523.25, start: 0 },
        { frequency: 659.25, start: 0.22 },
        { frequency: 783.99, start: 0.44 },
        { frequency: 1046.5, start: 0.7 },
    ];

    for (const note of notes) {
        const oscillator = context.createOscillator();
        const volume = context.createGain();
        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(note.frequency, now + note.start);
        volume.gain.setValueAtTime(0.0001, now + note.start);
        volume.gain.exponentialRampToValueAtTime(0.16, now + note.start + 0.025);
        volume.gain.exponentialRampToValueAtTime(0.0001, now + note.start + 0.55);
        oscillator.connect(volume);
        volume.connect(context.destination);
        oscillator.start(now + note.start);
        oscillator.stop(now + note.start + 0.56);
    }

    return 1.3;
}

function playSpooky(context) {
    const now = context.currentTime;
    const duration = 2.1;

    for (const voice of [
        { frequency: 125, endFrequency: 48, detune: -9 },
        { frequency: 132, endFrequency: 52, detune: 9 },
        { frequency: 196, endFrequency: 74, detune: 0 },
    ]) {
        const oscillator = context.createOscillator();
        const volume = context.createGain();
        oscillator.type = "sawtooth";
        oscillator.detune.value = voice.detune;
        oscillator.frequency.setValueAtTime(voice.frequency, now);
        oscillator.frequency.exponentialRampToValueAtTime(voice.endFrequency, now + duration);
        volume.gain.setValueAtTime(0.0001, now);
        volume.gain.exponentialRampToValueAtTime(0.055, now + 0.15);
        volume.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        oscillator.connect(volume);
        volume.connect(context.destination);
        oscillator.start(now);
        oscillator.stop(now + duration);
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
    const filter = context.createBiquadFilter();
    const noiseVolume = context.createGain();
    noise.buffer = noiseBuffer;
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(700, now);
    filter.frequency.exponentialRampToValueAtTime(190, now + duration);
    filter.Q.value = 0.7;
    noiseVolume.gain.setValueAtTime(0.0001, now);
    noiseVolume.gain.exponentialRampToValueAtTime(0.045, now + 0.2);
    noiseVolume.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    noise.connect(filter);
    filter.connect(noiseVolume);
    noiseVolume.connect(context.destination);
    noise.start(now);
    noise.stop(now + duration);

    return duration + 0.1;
}
