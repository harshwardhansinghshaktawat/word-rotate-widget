class WordRotate extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isAnimating = false;
    this.wordArray = [];
    this.currentWord = 0;
    this.intervalId = null;
  }

  static get observedAttributes() {
    return [
      'heading-tag', 'text-alignment', 'font-family', 'font-size',
      'before-text', 'after-text', 'rotation-time', 'words', 'color-preset'
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  connectedCallback() {
    this.render();
    this.handleResize = () => this.render();
    window.addEventListener('resize', this.handleResize);
    this.setupIntersectionObserver();
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.handleResize);
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.isAnimating) {
          this.isAnimating = true;
          this.startAnimation();
          observer.unobserve(this);
        }
      });
    }, { threshold: 0.1 });
    this.observer.observe(this);
  }

  getColorPreset(preset) {
    const presets = {
      'Ocean Vibes': ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51', '#D00000'],
      'Sunset Bliss': ['#FF6B6B', '#FF9F1C', '#FFD60A', '#FFEE88', '#F4A261', '#E63946'],
      'Forest Glow': ['#2D6A4F', '#40916C', '#74C69D', '#95D5B2', '#B7E4C7', '#D8F3DC'],
      'Neon Pulse': ['#FF00FF', '#00FFFF', '#FF66CC', '#66FF66', '#FFFF00', '#FF3300'],
      'Twilight Haze': ['#7209B7', '#9B5DE5', '#F15BB5', '#FEE440', '#00BBF9', '#00F5D4'],
      'Desert Sands': ['#8B5A2B', '#CD853F', '#F4A460', '#FFDAB9', '#FFE4C4', '#FFF8DC'],
      'Berry Blast': ['#9B1D64', '#D84797', '#F8A1D1', '#FF70A6', '#FF9770', '#FFD670'],
      'Cosmic Dust': ['#3D405B', '#5A5F7D', '#81A4CD', '#A3BFFA', '#C2E7FF', '#E2F0FF'],
      'Citrus Twist': ['#F4A261', '#E9C46A', '#FFD60A', '#FFEE88', '#ADFF2F', '#7FFF00'],
      'Midnight Sky': ['#03045E', '#023E8A', '#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8'],
      'Aurora Veil': ['#006D77', '#83C5BE', '#EDF6F9', '#FFDDD2', '#EF959D', '#E29578'],
      'Golden Hour': ['#FFD700', '#FFA500', '#FF4500', '#8B0000', '#B22222', '#DC143C'],
      'Emerald Dream': ['#004B23', '#006400', '#008000', '#228B22', '#32CD32', '#90EE90'],
      'Purple Reign': ['#4B0082', '#800080', '#DA70D6', '#FF00FF', '#FF69B4', '#FFB6C1'],
      'Tropical Wave': ['#00CED1', '#20B2AA', '#48D1CC', '#5F9EA0', '#AFEEEE', '#E0FFFF'],
      'Blush Bloom': ['#FF9999', '#FFCC99', '#FFFF99', '#CCFF99', '#99FFCC', '#99FFFF'],
      'Electric Storm': ['#483D8B', '#6A5ACD', '#9370DB', '#BA55D3', '#DDA0DD', '#E6E6FA'],
      'Fire Opal': ['#E25822', '#F28C38', '#FBBF24', '#FFD700', '#FFF8DC', '#FFFFE0'],
      'Icy Peak': ['#4682B4', '#87CEEB', '#ADD8E6', '#B0E0E6', '#E0FFFF', '#F0F8FF'],
      'Rainbow Rush': ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082']
    };
    return presets[preset] || presets['Ocean Vibes']; // Default to Ocean Vibes
  }

  splitLetters(word) {
    const content = word.textContent;
    word.innerHTML = '';
    const letters = [];
    for (let i = 0; i < content.length; i++) {
      const letter = document.createElement('span');
      letter.className = 'letter';
      letter.textContent = content.charAt(i);
      word.appendChild(letter);
      letters.push(letter);
    }
    return letters;
  }

  animateLetterOut(cw, i) {
    setTimeout(() => {
      cw[i].className = 'letter out';
    }, i * 80);
  }

  animateLetterIn(nw, i) {
    setTimeout(() => {
      nw[i].className = 'letter in';
    }, 340 + (i * 80));
  }

  changeWord() {
    const cw = this.wordArray[this.currentWord];
    const nw = this.currentWord === this.wordArray.length - 1 ? this.wordArray[0] : this.wordArray[this.currentWord + 1];
    for (let i = 0; i < cw.length; i++) {
      this.animateLetterOut(cw, i);
    }
    for (let i = 0; i < nw.length; i++) {
      nw[i].className = 'letter behind';
      nw[0].parentElement.style.opacity = 1;
      this.animateLetterIn(nw, i);
    }
    this.currentWord = (this.currentWord === this.wordArray.length - 1) ? 0 : this.currentWord + 1;
  }

  startAnimation() {
    const words = this.shadowRoot.querySelectorAll('.word');
    words[this.currentWord].style.opacity = 1;
    this.wordArray = [];
    words.forEach(word => {
      this.wordArray.push(this.splitLetters(word));
    });
    this.changeWord();
    const rotationTime = (parseFloat(this.getAttribute('rotation-time')) || 4) * 1000; // Convert to ms
    this.intervalId = setInterval(() => this.changeWord(), rotationTime);
  }

  render() {
    const headingTag = this.getAttribute('heading-tag') || 'p';
    const textAlignment = this.getAttribute('text-alignment') || 'center';
    const fontFamily = this.getAttribute('font-family') || 'Roboto';
    const fontSize = parseFloat(this.getAttribute('font-size')) || 40; // In px
    const beforeText = this.getAttribute('before-text') || 'Life is';
    const afterText = this.getAttribute('after-text') || '';
    const words = (this.getAttribute('words') || 'amazing,great,awesome,wonderful,beautiful,fantastic').split(',').map(word => word.trim());
    const colorPreset = this.getAttribute('color-preset') || 'Ocean Vibes';
    const colors = this.getColorPreset(colorPreset);

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.isAnimating = false;

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@600&display=swap');

        :host {
          display: block;
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
        }

        .text {
          position: absolute;
          width: 100%;
          height: 40px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: ${fontFamily}, sans-serif;
          font-weight: 600;
          font-size: ${fontSize}px;
          text-align: ${textAlignment};
          white-space: nowrap;
        }

        .before, .after {
          display: inline-block;
          vertical-align: top;
          margin: 0;
        }

        .word-container {
          display: inline-block;
          position: relative;
          width: ${Math.max(...words.map(w => w.length)) * (fontSize * 0.6)}px; /* Dynamic width based on longest word */
          height: ${fontSize}px;
          vertical-align: top;
        }

        .word {
          position: absolute;
          width: 100%;
          opacity: 0;
          text-align: ${textAlignment};
        }

        .letter {
          display: inline-block;
          position: relative;
          float: left;
          transform: translateZ(25px);
          transform-origin: 50% 50% 25px;
        }

        .letter.out {
          transform: rotateX(90deg);
          transition: transform 0.32s cubic-bezier(0.55, 0.055, 0.675, 0.19);
        }

        .letter.behind {
          transform: rotateX(-90deg);
        }

        .letter.in {
          transform: rotateX(0deg);
          transition: transform 0.38s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      </style>
      <div class="text">
        <${headingTag} class="before">${beforeText}</${headingTag}>
        <${headingTag} class="word-container">
          ${words.map((word, index) => `
            <span class="word" style="color: ${colors[index % colors.length]}">${word}</span>
          `).join('')}
        </${headingTag}>
        <${headingTag} class="after">${afterText}</${headingTag}>
      </div>
    `;
  }
}

customElements.define('word-rotate', WordRotate);
