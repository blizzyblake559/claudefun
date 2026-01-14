// Global variables
let player;
let audioAnalyzer;
let brainVisualizer;
let reportSynthesizer;
let isPlaying = false;
let updateInterval;

// YouTube API ready callback
function onYouTubeIframeAPIReady() {
    console.log('YouTube API ready');
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    audioAnalyzer = new AudioAnalyzer();
    brainVisualizer = new BrainVisualizer();
    brainVisualizer.initialize();
    reportSynthesizer = new ReportSynthesizer();

    // Set up event listeners
    const analyzeBtn = document.getElementById('analyze-btn');
    const urlInput = document.getElementById('youtube-url');

    analyzeBtn.addEventListener('click', handleAnalyze);

    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAnalyze();
        }
    });

    // Add hover tooltips to brain regions
    addBrainRegionTooltips();

    console.log('Neural Music Analyzer initialized');
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
    brainVisualizer.reset();

    return new Promise((resolve, reject) => {
        // Determine the origin - handle file:// protocol
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

                    // Initialize audio analyzer with player's iframe
                    const iframe = document.querySelector('#player');

                    // Note: Due to CORS restrictions, we need to use a workaround
                    // We'll analyze using the YouTube player's volume/state as proxy
                    // For full audio analysis, the audio would need to come from same origin

                    // For demo purposes, we'll use synthesized analysis based on playback state
                    await initializeDemoAnalyzer();

                    // Try to play - some videos may require user interaction first
                    try {
                        event.target.playVideo();
                        updateStatus('Playing', true);
                        startVisualization();
                    } catch (err) {
                        console.warn('Autoplay blocked, user interaction required:', err);
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
    // Since we can't access YouTube audio directly due to CORS,
    // we'll create a demonstration mode that generates realistic analysis
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
            // Generate dynamic analysis values for demo
            // In a real implementation, this would come from Web Audio API
            generateDynamicAnalysis();

            const analysis = audioAnalyzer.getAnalysis();

            // Update UI
            updateMetrics(analysis);
            brainVisualizer.update(analysis);

            // Generate and update dynamic reports
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

    // Occasionally create peaks (simulating beats, drops, etc.)
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
    // Get active regions from brain visualizer
    const activeRegions = brainVisualizer.activeRegions;
    const brainRegions = brainVisualizer.brainRegions;

    // Generate dynamic narrative report
    const narrative = reportSynthesizer.generateDynamicReport(analysis, activeRegions, brainRegions);

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
    const regionSummaries = reportSynthesizer.generateActiveRegionsSummary(activeRegions, brainRegions, analysis);

    // Update active regions list with detailed explanations
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

function addBrainRegionTooltips() {
    const regions = document.querySelectorAll('.brain-region');

    regions.forEach(region => {
        region.addEventListener('mouseenter', (e) => {
            const regionName = e.target.getAttribute('data-region');
            const regionFunction = e.target.getAttribute('data-function');

            // Show tooltip (you could enhance this with a proper tooltip library)
            console.log(`${regionName}: ${regionFunction}`);
        });
    });
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

// Note about audio analysis limitations
console.log('%c⚠️ Note about Audio Analysis', 'color: #00f2ff; font-size: 14px; font-weight: bold;');
console.log(
    'Due to CORS restrictions, direct audio analysis from YouTube videos is not possible.\n' +
    'This demo uses simulated analysis values to demonstrate the visualization system.\n' +
    'For real audio analysis, use audio files from the same origin or with CORS enabled.'
);
