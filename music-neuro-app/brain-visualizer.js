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
        // Cache DOM elements - both the region itself and its parent group
        Object.keys(this.brainRegions).forEach(regionId => {
            const element = document.getElementById(regionId);
            const group = document.getElementById(`${regionId}-group`);
            this.regionElements[regionId] = {
                element: element,
                group: group || element
            };
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
            const regionData = this.regionElements[regionId];
            if (!regionData || !regionData.element) return;

            const element = regionData.element;
            const group = regionData.group;

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
                element.classList.remove('active-low', 'active-medium', 'active-high', 'active');
                group.classList.remove('active-low', 'active-medium', 'active-high', 'active');

                if (normalizedScore > region.threshold + 30) {
                    element.classList.add('active-high');
                    group.classList.add('active-high');
                } else if (normalizedScore > region.threshold + 15) {
                    element.classList.add('active-medium');
                    group.classList.add('active-medium');
                } else {
                    element.classList.add('active-low');
                    group.classList.add('active-low');
                }

                element.classList.add('active');
                group.classList.add('active');
            } else {
                element.classList.remove('active', 'active-low', 'active-medium', 'active-high');
                group.classList.remove('active', 'active-low', 'active-medium', 'active-high');
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
            const regionData = this.regionElements[regionId];
            if (regionData) {
                if (regionData.element) {
                    regionData.element.classList.remove('active', 'active-low', 'active-medium', 'active-high');
                }
                if (regionData.group) {
                    regionData.group.classList.remove('active', 'active-low', 'active-medium', 'active-high');
                }
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

// Dynamic Report Synthesizer
class ReportSynthesizer {
    constructor() {
        this.lastReportTime = 0;
        this.reportHistory = [];
        this.currentNarrative = '';
        this.narrativeSegments = [];
    }

    generateDynamicReport(analysis, activeRegions, brainRegions) {
        const now = Date.now();

        // Update report every 3 seconds
        if (now - this.lastReportTime < 3000) {
            return this.currentNarrative;
        }

        this.lastReportTime = now;

        // Build narrative based on current state
        const segments = [];

        // Analyze tempo patterns
        if (analysis.tempo > 140) {
            segments.push(`The rapid tempo of ${analysis.tempo} BPM is driving intense motor cortex activation, triggering strong movement impulses.`);
        } else if (analysis.tempo < 80) {
            segments.push(`The slow ${analysis.tempo} BPM tempo is inducing a relaxation response, lowering cortisol levels.`);
        } else {
            segments.push(`At ${analysis.tempo} BPM, the music maintains a balanced tempo that supports sustained attention.`);
        }

        // Analyze energy and emotional response
        if (analysis.energy > 70) {
            segments.push(`High energy levels (${analysis.energy}%) are triggering dopamine release in the limbic system, creating feelings of excitement and euphoria.`);
        } else if (analysis.energy < 40) {
            segments.push(`The gentle energy profile (${analysis.energy}%) is activating parasympathetic responses, promoting calm and introspection.`);
        }

        // Analyze frequency content
        if (analysis.bassEnergy > 65) {
            segments.push(`Powerful bass frequencies are resonating through the brain stem and limbic system, creating visceral emotional responses.`);
        }

        if (analysis.brightness > 60) {
            segments.push(`Bright, high-frequency content (${analysis.brightness}% brightness) is enhancing alertness and positive emotional valence through auditory cortex stimulation.`);
        } else if (analysis.brightness < 35) {
            segments.push(`The darker timbral quality (${analysis.brightness}% brightness) creates emotional depth and contemplative mood states.`);
        }

        // Analyze active region count
        const activeCount = activeRegions.size;
        if (activeCount >= 7) {
            segments.push(`With ${activeCount} brain regions highly active, the music is creating a rich, immersive neural experience engaging multiple cognitive and emotional systems.`);
        } else if (activeCount >= 4) {
            segments.push(`${activeCount} brain regions are currently processing the music, showing balanced engagement across sensory and emotional centers.`);
        } else if (activeCount > 0) {
            segments.push(`Currently ${activeCount} regions show significant activity, indicating focused neural processing of specific musical elements.`);
        }

        // Pattern complexity
        if (analysis.spectralCentroid > 2500) {
            segments.push(`Complex harmonic patterns are engaging prefrontal cortex networks, stimulating anticipation and pattern recognition processes.`);
        }

        // Memory and familiarity
        if (analysis.midEnergy > 50 && activeRegions.has('temporal-lobe')) {
            segments.push(`Strong temporal lobe activation suggests the music is triggering memory networks, potentially evoking emotional associations and nostalgia.`);
        }

        // Select 2-3 most relevant segments
        const selectedSegments = segments.slice(0, Math.min(3, segments.length));
        this.currentNarrative = selectedSegments.join(' ');

        return this.currentNarrative;
    }

    generateActiveRegionsSummary(activeRegions, brainRegions, analysis) {
        const summaries = [];

        activeRegions.forEach(regionId => {
            const region = brainRegions[regionId];
            if (!region) return;

            let intensityDesc = 'moderate';
            let explanation = '';

            // Determine why this region is active
            if (regionId === 'motor-cortex') {
                intensityDesc = analysis.tempo > 140 ? 'high' : 'moderate';
                explanation = `responding to rhythmic patterns at ${analysis.tempo} BPM`;
            } else if (regionId === 'auditory-cortex') {
                intensityDesc = analysis.midEnergy > 60 ? 'high' : 'moderate';
                explanation = `processing complex melodic and timbral information`;
            } else if (regionId === 'limbic-system') {
                intensityDesc = analysis.energy > 70 ? 'intense' : 'moderate';
                explanation = `generating emotional responses and pleasure signals`;
            } else if (regionId === 'prefrontal-cortex') {
                intensityDesc = 'engaged';
                explanation = `anticipating musical patterns and regulating emotional responses`;
            } else if (regionId === 'cerebellum') {
                intensityDesc = analysis.bassEnergy > 60 ? 'high' : 'steady';
                explanation = `maintaining precise beat tracking and timing coordination`;
            } else if (regionId === 'temporal-lobe') {
                intensityDesc = 'active';
                explanation = `accessing musical memories and pattern recognition`;
            } else if (regionId === 'visual-cortex') {
                intensityDesc = 'engaged';
                explanation = `creating internal visualizations and pattern imagery`;
            } else {
                explanation = `actively processing musical information`;
            }

            summaries.push({
                name: region.name,
                intensity: intensityDesc,
                explanation: explanation
            });
        });

        return summaries;
    }
}
