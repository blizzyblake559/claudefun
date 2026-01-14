// Global variables
let player;
let audioAnalyzer;
let brain3D;
let reportSynthesizer;
let isPlaying = false;
let updateInterval;

// Brain region mapping for display
const brainRegionsDisplay = {
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

// YouTube API ready callback
function onYouTubeIframeAPIReady() {
    console.log('YouTube API ready');
}

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.classList.add('show');

    try {
        // Initialize components
        audioAnalyzer = new AudioAnalyzer();
        reportSynthesizer = new ReportSynthesizer();

        // Initialize 3D brain - wait for Three.js to load
        if (typeof THREE === 'undefined') {
            throw new Error('Three.js not loaded');
        }

        brain3D = new Brain3D('brain-3d-container');
        brain3D.initialize();

        console.log('3D Brain initialized successfully');

        // Set up event listeners
        const analyzeBtn = document.getElementById('analyze-btn');
        const urlInput = document.getElementById('youtube-url');

        analyzeBtn.addEventListener('click', handleAnalyze);

        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleAnalyze();
            }
        });

        console.log('Neural Music Analyzer 3D initialized');
    } catch (error) {
        console.error('Initialization error:', error);
        alert('Failed to initialize 3D visualization. Please refresh the page.');
    } finally {
        loadingOverlay.classList.remove('show');
    }
});

async function handleAnalyze() {
    const urlInput = document.getElementById('youtube-url');
    const url = urlInput.value.trim();

    if (!url) {
        alert('Please enter a YouTube URL');
        return;
    }

    const videoId = extractVideoId(url);

    if (!videoId) {
        alert('Invalid YouTube URL. Please enter a valid URL.');
        return;
    }

    // Update status
    updateStatus('Loading video...', false);

    try {
        await loadVideo(videoId);
    } catch (error) {
        console.error('Error loading video:', error);
        alert('Failed to load video. Please try another URL.');
        updateStatus('Error loading video', false);
    }
}

function extractVideoId(url) {
    // Handle different YouTube URL formats
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
        /^([a-zA-Z0-9_-]{11})$/  // Direct video ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

async function loadVideo(videoId) {
    // Destroy existing player if any
    if (player) {
        player.destroy();
    }

    // Reset visualizations
    brain3D.reset();

    return new Promise((resolve, reject) => {
        // Determine the origin
        let originParam = window.location.origin;
        if (window.location.protocol === 'file:') {
            originParam = 'https://www.youtube.com';
        }

        player = new YT.Player('player', {
            height: '180',
            width: '320',
            videoId: videoId,
            playerVars: {
                autoplay: 1,
                controls: 1,
                enablejsapi: 1,
                playsinline: 1,
                rel: 0,
                modestbranding: 1,
                fs: 1
            },
            events: {
                onReady: async (event) => {
                    console.log('Player ready');

                    // Initialize demo analyzer
                    await initializeDemoAnalyzer();

                    // Try to play
                    try {
                        event.target.playVideo();
                        updateStatus('Playing', true);
                        startVisualization();
                    } catch (err) {
                        console.warn('Autoplay blocked:', err);
                        updateStatus('Click play to start', false);
                        startVisualization();
                    }

                    resolve();
                },
                onStateChange: onPlayerStateChange,
                onError: (error) => {
                    console.error('Player error code:', error.data);
                    let errorMsg = 'Failed to load video';

                    switch(error.data) {
                        case 2:
                            errorMsg = 'Invalid video ID';
                            break;
                        case 5:
                            errorMsg = 'HTML5 player error';
                            break;
                        case 100:
                            errorMsg = 'Video not found or private';
                            break;
                        case 101:
                        case 150:
                            errorMsg = 'Video cannot be embedded';
                            break;
                    }

                    updateStatus(errorMsg, false);
                    alert(`YouTube Error: ${errorMsg}\n\nTry:\n1. Using a different video\n2. Opening from a local server (not file://)\n3. Running: python -m http.server 8000`);
                    reject(error);
                }
            }
        });
    });
}

async function initializeDemoAnalyzer() {
    audioAnalyzer.isAnalyzing = true;

    // Initialize with random but realistic starting values
    audioAnalyzer.currentAnalysis = {
        frequency: 440,
        tempo: 120,
        energy: 50,
        brightness: 50,
        bassEnergy: 50,
        midEnergy: 50,
        highEnergy: 50,
        spectralCentroid: 1500
    };
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        updateStatus('Playing', true);
        startVisualization();
    } else if (event.data === YT.PlayerState.PAUSED) {
        isPlaying = false;
        updateStatus('Paused', false);
        stopVisualization();
    } else if (event.data === YT.PlayerState.ENDED) {
        isPlaying = false;
        updateStatus('Ended', false);
        stopVisualization();
    }
}

function startVisualization() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }

    // Update visualization at 30 FPS
    updateInterval = setInterval(() => {
        if (isPlaying) {
            // Generate dynamic analysis values
            generateDynamicAnalysis();

            const analysis = audioAnalyzer.getAnalysis();

            // Update UI
            updateMetrics(analysis);

            // Update 3D brain
            brain3D.update(analysis);

            // Update text displays
            updateDynamicReports(analysis);
        }
    }, 33);
}

function stopVisualization() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}

function generateDynamicAnalysis() {
    // Generate realistic variations for demo purposes
    const analysis = audioAnalyzer.currentAnalysis;

    // Add smooth random variations
    const smoothRandom = (current, min, max, smoothing = 0.9) => {
        const target = min + Math.random() * (max - min);
        return current * smoothing + target * (1 - smoothing);
    };

    // Simulate music dynamics
    analysis.frequency = smoothRandom(analysis.frequency, 100, 2000, 0.85);
    analysis.tempo = smoothRandom(analysis.tempo, 80, 160, 0.95);
    analysis.energy = smoothRandom(analysis.energy, 30, 90, 0.88);
    analysis.brightness = smoothRandom(analysis.brightness, 25, 85, 0.87);

    // Frequency band energies should correlate
    const totalEnergy = analysis.energy;
    analysis.bassEnergy = smoothRandom(analysis.bassEnergy, totalEnergy * 0.3, totalEnergy * 1.2, 0.85);
    analysis.midEnergy = smoothRandom(analysis.midEnergy, totalEnergy * 0.5, totalEnergy * 1.1, 0.86);
    analysis.highEnergy = smoothRandom(analysis.highEnergy, totalEnergy * 0.2, totalEnergy * 0.9, 0.84);

    analysis.spectralCentroid = smoothRandom(analysis.spectralCentroid, 800, 3000, 0.90);

    // Occasionally create peaks
    if (Math.random() < 0.05) {
        analysis.energy = Math.min(100, analysis.energy * 1.5);
        analysis.bassEnergy = Math.min(100, analysis.bassEnergy * 1.5);
    }
}

function updateMetrics(analysis) {
    document.getElementById('frequency-value').textContent = `${Math.round(analysis.frequency)} Hz`;
    document.getElementById('tempo-value').textContent = `${Math.round(analysis.tempo)} BPM`;
    document.getElementById('energy-value').textContent = `${Math.round(analysis.energy)}%`;
    document.getElementById('brightness-value').textContent = `${Math.round(analysis.brightness)}%`;
}

function updateDynamicReports(analysis) {
    // Get active regions from 3D brain
    const activeRegions = brain3D.activeRegions;

    // Generate dynamic narrative report
    const narrative = reportSynthesizer.generateDynamicReport(analysis, activeRegions, brainRegionsDisplay);

    // Update neurological effects with narrative
    const effectsElement = document.getElementById('effects-list');
    if (effectsElement && narrative) {
        effectsElement.innerHTML = `
            <div class="narrative-report">
                <p class="narrative-text">${narrative}</p>
                <span class="report-timestamp">Updated ${new Date().toLocaleTimeString()}</span>
            </div>
        `;
    }

    // Generate active regions summary
    const regionSummaries = reportSynthesizer.generateActiveRegionsSummary(activeRegions, brainRegionsDisplay, analysis);

    // Update active regions list
    const regionListElement = document.getElementById('region-list');
    if (regionListElement) {
        if (regionSummaries.length === 0) {
            regionListElement.innerHTML = '<p class="placeholder">No significant activity detected</p>';
        } else {
            let html = '';
            regionSummaries.forEach(summary => {
                html += `
                    <div class="region-item">
                        <div class="region-name">${summary.name}</div>
                        <div class="region-intensity">${summary.intensity} activity</div>
                        <div class="region-explanation">${summary.explanation}</div>
                    </div>
                `;
            });
            regionListElement.innerHTML = html;
        }
    }
}

function updateStatus(text, playing) {
    const statusElement = document.getElementById('audio-status');
    const indicator = statusElement.querySelector('.status-indicator');
    const span = statusElement.querySelector('span');

    span.textContent = text;

    if (playing) {
        indicator.classList.add('playing');
    } else {
        indicator.classList.remove('playing');
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && player) {
        e.preventDefault();
        if (isPlaying) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    }
});

// Note about 3D rendering
console.log('%c⚡ 3D Neural Music Analyzer', 'color: #00f2ff; font-size: 16px; font-weight: bold;');
console.log(
    'This version uses Three.js with WebGL for true 3D rendering.\\n' +
    'The brain visualization features realistic lighting, materials, and depth.\\n' +
    'Drag to rotate, scroll to zoom, and watch brain regions glow in real-time!'
);
