class BrainVisualizer {
    constructor() {
        this.brainRegions = {
            'prefrontal-cortex': {
                name: 'Prefrontal Cortex',
                triggers: ['tempo', 'pattern'],
                threshold: 40,
                description: 'Musical anticipation, emotional regulation & decision-making'
            },
            'motor-cortex': {
                name: 'Motor Cortex',
                triggers: ['tempo', 'bassEnergy'],
                threshold: 50,
                description: 'Rhythm processing, beat tracking & movement impulses'
            },
            'parietal-lobe': {
                name: 'Parietal Lobe',
                triggers: ['brightness', 'pattern'],
                threshold: 45,
                description: 'Spatial awareness & sensory integration'
            },
            'auditory-cortex': {
                name: 'Auditory Cortex',
                triggers: ['midEnergy', 'frequency', 'highEnergy'],
                threshold: 30,
                description: 'Sound processing, pitch, melody & timbre analysis'
            },
            'temporal-lobe': {
                name: 'Temporal Lobe',
                triggers: ['midEnergy'],
                threshold: 35,
                description: 'Musical memory, recognition & language processing'
            },
            'limbic-system': {
                name: 'Limbic System',
                triggers: ['energy', 'bassEnergy'],
                threshold: 55,
                description: 'Emotional response, pleasure & reward processing'
            },
            'cerebellum': {
                name: 'Cerebellum',
                triggers: ['tempo', 'bassEnergy'],
                threshold: 45,
                description: 'Timing precision, beat tracking & motor coordination'
            },
            'visual-cortex': {
                name: 'Visual Cortex',
                triggers: ['brightness', 'pattern'],
                threshold: 40,
                description: 'Pattern recognition & musical imagery'
            },
            'brainstem': {
                name: 'Brain Stem',
                triggers: ['energy'],
                threshold: 60,
                description: 'Arousal, attention & autonomic responses'
            },
            'hippocampus': {
                name: 'Hippocampus',
                triggers: ['midEnergy', 'pattern'],
                threshold: 38,
                description: 'Memory formation & emotional associations'
            }
        };

        this.activeRegions = new Set();
        this.regionElements = {};
        this.lastUpdate = Date.now();
    }

    initialize() {
        // Cache DOM elements
        Object.keys(this.brainRegions).forEach(regionId => {
            this.regionElements[regionId] = document.getElementById(regionId);
        });
    }

    update(analysis) {
        const now = Date.now();

        // Throttle updates to every 100ms for smoother animation
        if (now - this.lastUpdate < 100) return;
        this.lastUpdate = now;

        const newActiveRegions = new Set();

        // Check each brain region
        Object.entries(this.brainRegions).forEach(([regionId, region]) => {
            const element = this.regionElements[regionId];
            if (!element) return;

            // Calculate activation level based on triggers
            let activationScore = 0;
            let maxPossible = 0;

            region.triggers.forEach(trigger => {
                let value = 0;

                switch (trigger) {
                    case 'tempo':
                        // High tempo or very low tempo activates
                        value = analysis.tempo > 120 ? (analysis.tempo - 120) / 2 :
                                (analysis.tempo < 80 ? (80 - analysis.tempo) / 2 : 0);
                        break;
                    case 'bassEnergy':
                        value = analysis.bassEnergy;
                        break;
                    case 'midEnergy':
                        value = analysis.midEnergy;
                        break;
                    case 'highEnergy':
                        value = analysis.highEnergy;
                        break;
                    case 'energy':
                        value = analysis.energy;
                        break;
                    case 'brightness':
                        value = analysis.brightness;
                        break;
                    case 'frequency':
                        // Higher frequencies trigger more
                        value = Math.min(100, analysis.frequency / 20);
                        break;
                    case 'pattern':
                        // Use spectral centroid as pattern complexity
                        value = Math.min(100, analysis.spectralCentroid / 30);
                        break;
                }

                activationScore += value;
                maxPossible += 100;
            });

            // Normalize activation score
            const normalizedScore = (activationScore / maxPossible) * 100;

            // Determine activation level
            if (normalizedScore > region.threshold) {
                newActiveRegions.add(regionId);

                // Set activation intensity
                element.classList.remove('active-low', 'active-medium', 'active-high');

                if (normalizedScore > region.threshold + 30) {
                    element.classList.add('active-high');
                } else if (normalizedScore > region.threshold + 15) {
                    element.classList.add('active-medium');
                } else {
                    element.classList.add('active-low');
                }

                element.classList.add('active');
            } else {
                element.classList.remove('active', 'active-low', 'active-medium', 'active-high');
            }
        });

        this.activeRegions = newActiveRegions;
        this.updateRegionList(analysis);
    }

    updateRegionList(analysis) {
        const regionListElement = document.getElementById('region-list');
        if (!regionListElement) return;

        if (this.activeRegions.size === 0) {
            regionListElement.innerHTML = '<p class="placeholder">No significant activity detected</p>';
            return;
        }

        let html = '';
        this.activeRegions.forEach(regionId => {
            const region = this.brainRegions[regionId];
            const element = this.regionElements[regionId];

            const isHighActivity = element.classList.contains('active-high');
            const activityClass = isHighActivity ? 'high-activity' : '';

            html += `
                <div class="region-item ${activityClass}">
                    <div class="region-name">${region.name}</div>
                    <div class="region-function">${region.description}</div>
                </div>
            `;
        });

        regionListElement.innerHTML = html;
    }

    updateNeurologicalEffects(analysis) {
        const effectsElement = document.getElementById('effects-list');
        if (!effectsElement) return;

        const effects = this.generateNeurologicalEffects(analysis);

        if (effects.length === 0) {
            effectsElement.innerHTML = '<p class="placeholder">Play music to see neurological effects</p>';
            return;
        }

        let html = '';
        effects.forEach(effect => {
            html += `
                <div class="effect-item">
                    <div class="effect-title">${effect.title}</div>
                    <div class="effect-description">${effect.description}</div>
                </div>
            `;
        });

        effectsElement.innerHTML = html;
    }

    generateNeurologicalEffects(analysis) {
        const effects = [];

        // Tempo effects
        if (analysis.tempo > 140) {
            effects.push({
                title: '⚡ High Energy State',
                description: 'Fast tempo increases heart rate and dopamine release, promoting alertness and excitement.'
            });
        } else if (analysis.tempo < 80) {
            effects.push({
                title: '🧘 Relaxation Response',
                description: 'Slow tempo reduces cortisol levels and activates parasympathetic nervous system.'
            });
        }

        // Bass effects
        if (analysis.bassEnergy > 60) {
            effects.push({
                title: '🎵 Bass Resonance',
                description: 'Strong bass frequencies activate reward centers and create physical sensation through tactile response.'
            });
        }

        // Brightness effects
        if (analysis.brightness > 65) {
            effects.push({
                title: '✨ Bright Timbre',
                description: 'High-frequency content increases alertness and positive emotional valence.'
            });
        } else if (analysis.brightness < 35) {
            effects.push({
                title: '🌙 Dark Timbre',
                description: 'Lower frequencies create introspective mood and emotional depth.'
            });
        }

        // Overall energy effects
        if (analysis.energy > 70) {
            effects.push({
                title: '💪 Peak Arousal',
                description: 'High energy music triggers adrenaline release and increased motor cortex activity.'
            });
        }

        // Mid-range effects
        if (analysis.midEnergy > 55) {
            effects.push({
                title: '🎤 Vocal/Melodic Focus',
                description: 'Mid-range frequencies engage language processing and emotional recognition areas.'
            });
        }

        // Frequency-specific effects
        if (analysis.frequency > 2000) {
            effects.push({
                title: '🔔 High Pitch Processing',
                description: 'High frequencies increase alertness and can trigger emotional responses.'
            });
        }

        // Complex pattern effects
        if (analysis.spectralCentroid > 2000) {
            effects.push({
                title: '🧩 Complex Patterns',
                description: 'Rich harmonic content engages pattern recognition and sustained attention.'
            });
        }

        return effects.slice(0, 5); // Limit to 5 most relevant effects
    }

    reset() {
        Object.keys(this.regionElements).forEach(regionId => {
            const element = this.regionElements[regionId];
            if (element) {
                element.classList.remove('active', 'active-low', 'active-medium', 'active-high');
            }
        });

        this.activeRegions.clear();

        const regionListElement = document.getElementById('region-list');
        if (regionListElement) {
            regionListElement.innerHTML = '<p class="placeholder">Play music to see active regions</p>';
        }

        const effectsElement = document.getElementById('effects-list');
        if (effectsElement) {
            effectsElement.innerHTML = '<p class="placeholder">Analysis will appear here during playback</p>';
        }
    }
}
