# ClaudeFun 🎉

A fun collection of tools that bring joy and exploration!

## Features

### CLI Tool
- 😄 **Joke Generator**: Get random jokes to brighten your day
- 🔮 **Fortune Teller**: Receive mystical fortunes and predictions
- 🎲 **Random Number Generator**: Generate lucky numbers

### 🧠 Neural Music Analyzer (Web App)
A cutting-edge web application that visualizes how music affects your brain in real-time!

**Features:**
- 🎵 Paste any YouTube video URL and analyze the music
- 🧠 X-ray style brain visualization that lights up based on audio features
- 📊 Real-time analysis of frequency, tempo, energy, and brightness
- 🔬 Neuroscience-based mapping of audio features to brain regions
- 💡 Live explanations of neurological effects during playback

**Brain Regions Visualized:**
- **Auditory Cortex**: Processes pitch, melody, and timbre
- **Motor Cortex**: Responds to rhythm and tempo
- **Limbic System**: Emotional responses and pleasure
- **Cerebellum**: Beat tracking and timing
- **Prefrontal Cortex**: Musical anticipation and emotional regulation
- **Temporal Lobes**: Musical memory and recognition
- And more!

## Installation

```bash
pip install -r requirements.txt
```

## Usage

### CLI Tool
```bash
python claudefun.py joke       # Get a random joke
python claudefun.py fortune    # Get your fortune
python claudefun.py lucky      # Generate lucky numbers
python claudefun.py --help     # See all options
```

### Neural Music Analyzer Web App

1. Open `music-neuro-app/index.html` in a modern web browser
2. Paste a YouTube video URL (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
3. Click "Analyze" or press Enter
4. Watch as the brain lights up in real-time based on musical features!

**What the App Analyzes:**
- **Frequency**: Dominant pitch and tonal center
- **Tempo**: Beats per minute (BPM)
- **Energy**: Overall loudness and intensity
- **Brightness**: High-frequency content vs low-frequency
- **Bass/Mid/High Energy**: Energy distribution across frequency bands

**Neurological Mappings (Based on Research):**
- High tempo → Motor cortex activation (movement impulses)
- Bass frequencies → Limbic system (emotional/pleasure response)
- Complex patterns → Prefrontal cortex (anticipation)
- Pitch/melody → Auditory cortex (sound processing)
- Rhythm → Cerebellum (timing and coordination)

**Technical Note:** Due to browser CORS restrictions, the app uses simulated analysis to demonstrate the visualization system. For production use with real audio analysis, serve audio from the same origin or use CORS-enabled sources.

## Requirements

### CLI Tool
- Python 3.7+

### Neural Music Analyzer
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Internet connection (for YouTube API)

## Contributing

Feel free to add more fun features! Some ideas:
- ASCII art generator
- Dad joke vs regular joke modes
- Horoscope reader
- Fun facts generator
- Quote of the day

## License

MIT License - Have fun!
