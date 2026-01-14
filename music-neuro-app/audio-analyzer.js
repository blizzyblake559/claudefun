class AudioAnalyzer {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.bufferLength = null;
        this.source = null;
        this.isAnalyzing = false;

        // Analysis results
        this.currentAnalysis = {
            frequency: 0,
            tempo: 0,
            energy: 0,
            brightness: 0,
            bassEnergy: 0,
            midEnergy: 0,
            highEnergy: 0,
            spectralCentroid: 0
        };

        // For tempo detection
        this.beatHistory = [];
        this.lastBeatTime = 0;
        this.energyHistory = [];
    }

    async initialize(mediaElement) {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create analyser node
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;

            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);

            // Connect media element to analyser
            if (mediaElement) {
                this.source = this.audioContext.createMediaElementSource(mediaElement);
                this.source.connect(this.analyser);
                this.analyser.connect(this.audioContext.destination);
            }

            return true;
        } catch (error) {
            console.error('Failed to initialize audio analyzer:', error);
            return false;
        }
    }

    startAnalysis() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        this.isAnalyzing = true;
        this.analyze();
    }

    stopAnalysis() {
        this.isAnalyzing = false;
    }

    analyze() {
        if (!this.isAnalyzing || !this.analyser) return;

        this.analyser.getByteFrequencyData(this.dataArray);

        // Calculate frequency features
        const frequencies = this.extractFrequencyFeatures();

        // Calculate energy
        const energy = this.calculateEnergy();

        // Estimate tempo
        const tempo = this.estimateTempo(energy);

        // Calculate brightness (spectral centroid)
        const brightness = this.calculateBrightness();

        // Update current analysis
        this.currentAnalysis = {
            frequency: frequencies.dominant,
            tempo: tempo,
            energy: energy,
            brightness: brightness,
            bassEnergy: frequencies.bass,
            midEnergy: frequencies.mid,
            highEnergy: frequencies.high,
            spectralCentroid: frequencies.centroid
        };

        // Continue analysis loop
        requestAnimationFrame(() => this.analyze());
    }

    extractFrequencyFeatures() {
        const nyquist = this.audioContext.sampleRate / 2;
        const frequencyResolution = nyquist / this.bufferLength;

        // Find dominant frequency
        let maxValue = 0;
        let maxIndex = 0;

        for (let i = 0; i < this.bufferLength; i++) {
            if (this.dataArray[i] > maxValue) {
                maxValue = this.dataArray[i];
                maxIndex = i;
            }
        }

        const dominantFrequency = maxIndex * frequencyResolution;

        // Calculate energy in different frequency bands
        // Bass: 20-250 Hz
        const bassEnd = Math.floor(250 / frequencyResolution);
        const bassEnergy = this.calculateBandEnergy(0, bassEnd);

        // Mid: 250-2000 Hz
        const midStart = bassEnd;
        const midEnd = Math.floor(2000 / frequencyResolution);
        const midEnergy = this.calculateBandEnergy(midStart, midEnd);

        // High: 2000-20000 Hz
        const highStart = midEnd;
        const highEnergy = this.calculateBandEnergy(highStart, this.bufferLength);

        // Spectral centroid (brightness measure)
        let weightedSum = 0;
        let sum = 0;

        for (let i = 0; i < this.bufferLength; i++) {
            const frequency = i * frequencyResolution;
            weightedSum += frequency * this.dataArray[i];
            sum += this.dataArray[i];
        }

        const centroid = sum > 0 ? weightedSum / sum : 0;

        return {
            dominant: Math.round(dominantFrequency),
            bass: bassEnergy,
            mid: midEnergy,
            high: highEnergy,
            centroid: Math.round(centroid)
        };
    }

    calculateBandEnergy(startBin, endBin) {
        let sum = 0;
        for (let i = startBin; i < endBin && i < this.bufferLength; i++) {
            sum += this.dataArray[i];
        }
        return Math.round((sum / (endBin - startBin)) / 255 * 100);
    }

    calculateEnergy() {
        let sum = 0;
        for (let i = 0; i < this.bufferLength; i++) {
            sum += this.dataArray[i];
        }
        return Math.round((sum / this.bufferLength) / 255 * 100);
    }

    estimateTempo(currentEnergy) {
        const now = Date.now();

        // Keep energy history
        this.energyHistory.push({ time: now, energy: currentEnergy });

        // Keep only last 3 seconds of history
        this.energyHistory = this.energyHistory.filter(e => now - e.time < 3000);

        if (this.energyHistory.length < 10) {
            return this.currentAnalysis.tempo || 120; // Default to 120 BPM
        }

        // Simple beat detection: look for energy peaks
        const threshold = this.calculateEnergyThreshold();

        if (currentEnergy > threshold && now - this.lastBeatTime > 300) {
            this.beatHistory.push(now);
            this.lastBeatTime = now;

            // Keep only last 10 beats
            if (this.beatHistory.length > 10) {
                this.beatHistory.shift();
            }
        }

        // Calculate BPM from beat intervals
        if (this.beatHistory.length >= 4) {
            const intervals = [];
            for (let i = 1; i < this.beatHistory.length; i++) {
                intervals.push(this.beatHistory[i] - this.beatHistory[i - 1]);
            }

            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const bpm = Math.round(60000 / avgInterval);

            // Sanity check: typical music BPM is 60-200
            if (bpm >= 60 && bpm <= 200) {
                return bpm;
            }
        }

        return this.currentAnalysis.tempo || 120;
    }

    calculateEnergyThreshold() {
        if (this.energyHistory.length === 0) return 50;

        const avgEnergy = this.energyHistory.reduce((sum, e) => sum + e.energy, 0) / this.energyHistory.length;
        return avgEnergy * 1.3; // 30% above average
    }

    calculateBrightness() {
        // Brightness is the ratio of high-frequency to low-frequency content
        const nyquist = this.audioContext.sampleRate / 2;
        const frequencyResolution = nyquist / this.bufferLength;

        const midPoint = Math.floor(2000 / frequencyResolution);

        let lowSum = 0;
        let highSum = 0;

        for (let i = 0; i < midPoint && i < this.bufferLength; i++) {
            lowSum += this.dataArray[i];
        }

        for (let i = midPoint; i < this.bufferLength; i++) {
            highSum += this.dataArray[i];
        }

        const total = lowSum + highSum;
        return total > 0 ? Math.round((highSum / total) * 100) : 0;
    }

    getAnalysis() {
        return this.currentAnalysis;
    }

    // Get musical scale/mode detection (simplified)
    detectScale() {
        // This is a simplified version - proper scale detection is complex
        // We'll base it on brightness and frequency distribution

        if (this.currentAnalysis.brightness > 60) {
            return 'major'; // Brighter = Major keys
        } else if (this.currentAnalysis.brightness < 40) {
            return 'minor'; // Darker = Minor keys
        } else {
            return 'modal'; // In between
        }
    }

    // Analyze emotional valence based on audio features
    getEmotionalValence() {
        const { energy, brightness, tempo } = this.currentAnalysis;

        if (energy > 60 && brightness > 60 && tempo > 120) {
            return { emotion: 'energetic/happy', intensity: 'high' };
        } else if (energy < 40 && brightness < 40 && tempo < 90) {
            return { emotion: 'calm/melancholic', intensity: 'low' };
        } else if (energy > 60 && brightness < 40) {
            return { emotion: 'intense/dramatic', intensity: 'medium' };
        } else {
            return { emotion: 'neutral/balanced', intensity: 'medium' };
        }
    }
}
