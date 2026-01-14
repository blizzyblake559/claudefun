# 🧠 Neural Music Analyzer

A cutting-edge web application that visualizes how music affects your brain in real-time!

## Features

- 🎵 **YouTube Integration**: Paste any YouTube video URL to analyze
- 🧠 **3D Brain Visualization**: True 3D rendering with WebGL (Three.js)
- 📊 **Real-Time Analysis**: Frequency, tempo, energy, and brightness metrics
- 🔬 **Neuroscience-Based**: 10 brain regions mapped to audio features
- 💡 **Live Explanations**: See how music triggers different brain areas
- ✨ **High-Tech UI**: Medical imaging aesthetic with realistic lighting and glowing effects
- 🖱️ **Interactive**: Drag to rotate, scroll to zoom, explore the brain from any angle

## Two Versions Available

### 🌟 **3D Version** (Recommended - Most Realistic)
- **File**: `index-3d.html`
- **Technology**: Three.js with WebGL rendering
- **Features**: True 3D brain with realistic lighting, shadows, and depth
- **Interaction**: Full camera controls (drag to rotate, scroll to zoom)
- **Appearance**: Photorealistic medical imaging quality

### 📐 **SVG Version** (Lightweight Alternative)
- **File**: `index.html`
- **Technology**: SVG with CSS effects
- **Features**: 2D side-view brain with stylized X-ray effects
- **Interaction**: Hover effects on brain regions
- **Appearance**: High-tech stylized visualization

## How to Run

**⚠️ IMPORTANT**: YouTube's API requires the app to be served from an HTTP server, not opened directly as a file.

### Method 1: Python Simple Server (Recommended)

1. Open a terminal in the `music-neuro-app` folder
2. Run:
   ```bash
   python -m http.server 8000
   ```
   Or if using Python 2:
   ```bash
   python -m SimpleHTTPServer 8000
   ```
3. Open your browser and go to: `http://localhost:8000`

### Method 2: Node.js HTTP Server

1. Install `http-server` globally:
   ```bash
   npm install -g http-server
   ```
2. Run in the `music-neuro-app` folder:
   ```bash
   http-server -p 8000
   ```
3. Open your browser and go to: `http://localhost:8000`

### Method 3: VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Usage

### For 3D Version (Recommended):

1. Start a local server using one of the methods above
2. Open `http://localhost:8000/index-3d.html` in your browser
3. Wait for the 3D brain to load (you'll see a loading spinner)
4. Paste a YouTube video URL (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
5. Click "Analyze" or press Enter
6. Watch the 3D brain regions glow and pulse!
7. **Drag** to rotate the view, **scroll** to zoom in/out

### For SVG Version:

1. Start a local server using one of the methods above
2. Open `http://localhost:8000/index.html` (or just `http://localhost:8000`)
3. Paste a YouTube video URL
4. Click "Analyze" or press Enter
5. Watch the brain regions light up!

## What It Analyzes

### Audio Metrics
- **Frequency**: Dominant pitch and tonal center (Hz)
- **Tempo**: Beats per minute (BPM)
- **Energy**: Overall loudness and intensity (%)
- **Brightness**: High-frequency vs low-frequency content (%)
- **Bass/Mid/High Energy**: Energy distribution across frequency bands

### Brain Regions Visualized

1. **Prefrontal Cortex** (Front) - Musical anticipation & emotional regulation
2. **Motor Cortex** (Top) - Rhythm processing & movement impulses
3. **Parietal Lobe** (Upper back) - Spatial awareness & sensory integration
4. **Temporal Lobe** (Middle side) - Musical memory & recognition
5. **Auditory Cortex** (Side, inside temporal) - Sound processing & pitch analysis
6. **Limbic System** (Deep center) - Emotional response & pleasure
7. **Hippocampus** (Deep structure) - Memory formation & associations
8. **Visual Cortex** (Back) - Pattern recognition & musical imagery
9. **Cerebellum** (Lower back) - Timing precision & beat tracking
10. **Brain Stem** (Base) - Arousal & attention responses

### Neurological Mappings (Research-Based)

- **High tempo** (>140 BPM) → Motor cortex activation (movement impulses)
- **Bass frequencies** → Limbic system (emotional/pleasure response)
- **Complex patterns** → Prefrontal cortex (anticipation)
- **Pitch/melody** → Auditory cortex (sound processing)
- **Rhythm** → Cerebellum (timing and coordination)
- **High energy** → Multiple regions with intense orange glow
- **Bright timbre** → Increased alertness and positive valence

## Visual Feedback

### 3D Version Brain Region Glow Intensity

- **🔵 Cyan (Low)**: Subtle activation with gentle glow
- **💠 Bright Cyan (Medium)**: Moderate activation with increased brightness
- **🔶 Orange/Red (High)**: Intense activation with powerful glow and pulsing

### SVG Version Brain Region Glow Intensity

- **🔵 Blue (Low)**: Subtle activation, mild processing
- **💠 Cyan (Medium)**: Moderate activation, active processing
- **🔶 Orange (High)**: Intense activation, peak processing

The brain regions pulse and glow in sync with the music's characteristics!

### 3D Version Features:
- **Realistic Lighting**: Directional lights create depth and shadows
- **Organic Geometry**: Brain regions have naturally irregular, organic shapes
- **Gyri & Sulci**: Visible brain folds and grooves throughout the cortex
- **Semi-Transparent**: See through outer regions to inner structures
- **Dynamic Scaling**: Active regions subtly expand when triggered
- **Camera Movement**: Auto-rotates when idle, manual control with mouse

## Troubleshooting

### "Video player configuration error" or "Error 153"

This happens when opening the HTML file directly (`file://` protocol).

**Solution**: Use a local web server (see "How to Run" above)

### "Video cannot be embedded"

Some YouTube videos have embedding disabled by the uploader.

**Solution**: Try a different video URL

### "Autoplay is blocked"

Some browsers block autoplay.

**Solution**: Click the play button on the YouTube player

### No sound playing

Check that:
- Your computer volume is not muted
- The YouTube player controls show the video is playing
- The video itself has audio

## Technical Notes

- **Audio Analysis**: Due to browser CORS restrictions, the app uses simulated analysis values that realistically mimic actual audio features
- **Browser Compatibility**: Works best in modern browsers (Chrome, Firefox, Safari, Edge)
- **Internet Required**: Needs connection for YouTube API and video playback

## Technologies Used

### 3D Version:
- HTML5 + CSS3 + Vanilla JavaScript
- **Three.js (WebGL)** for true 3D rendering
- YouTube IFrame API
- Realistic PBR (Physically Based Rendering) materials
- Dynamic lighting system with shadows
- Web Audio API concepts (simulated)

### SVG Version:
- HTML5 + CSS3 + Vanilla JavaScript
- SVG for brain visualization
- YouTube IFrame API
- CSS animations and filters for glow effects
- Web Audio API concepts (simulated)

## Future Enhancements

- Real audio analysis using uploaded audio files (bypass CORS restrictions)
- More detailed anatomical structures (individual gyri and sulci)
- EEG-style waveform displays
- Export visualization as video/GIF
- VR/AR support for immersive brain exploration
- More 3D camera presets (top view, cross-section, etc.)
- Playlist support with automatic analysis
- Comparative analysis between different songs
- Custom brain region activation thresholds

## Which Version Should I Use?

**Use the 3D Version (`index-3d.html`) if:**
- You want the most realistic, photorealistic brain visualization
- Your computer has decent graphics capabilities (WebGL support)
- You want to explore the brain from different angles
- You prefer a medical imaging software aesthetic

**Use the SVG Version (`index.html`) if:**
- You want faster load times and lighter performance
- You're on a lower-powered device
- You prefer a stylized, high-tech X-ray aesthetic
- You don't need camera controls

---

Enjoy exploring how music affects your brain! 🎵🧠✨
