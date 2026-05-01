const slides = document.querySelectorAll('.slide');
let currentSlide = 0;
let confettiInterval; 
let isMusicPlaying = false; 

// --- SISTEM PERGANTIAN SLIDE UTAMA & MUSIK ---
document.body.addEventListener('click', (e) => {

    // 1. PUTAR MUSIK SAAT LAYAR DISENTUH PERTAMA KALI
    const bgMusic = document.getElementById('bg-music');
    if (!isMusicPlaying && bgMusic) {
        bgMusic.volume = 0.5; 
        bgMusic.play().catch(err => console.log("Browser memblokir autoplay", err));
        isMusicPlaying = true;
        
        // Ganti teks petunjuk di layar 1 agar dia tahu harus tap lagi
        const hintText = document.querySelector('#slide1 .click-hint');
        if (hintText) {
            hintText.innerText = "(Tap sekali lagi untuk lanjut)";
        }

        // PENTING: Hentikan kode di sini! 
        // Ini membuat tap pertama HANYA menyalakan musik dan tidak memindah slide.
        return; 
    }

    // 2. Cegah pindah slide jika mengklik elemen khusus
    if (e.target.closest('.btn') || e.target.closest('.stacked-paper') || e.target.closest('.polaroid-side')) {
        return; 
    }

    // 3. Logika Pindah Slide
    if (currentSlide < slides.length - 1) {
        slides[currentSlide].classList.remove('active');
        currentSlide++;
        slides[currentSlide].classList.add('active');

        // Matikan confetti jika pindah dari Slide 1
        if (currentSlide === 1) {
            clearInterval(confettiInterval); 
        }
    }
});

// --- FUNGSI KLIK BUANG KERTAS (SLIDE 4) ---
function tossPaper(event) {
    if (event) event.stopPropagation();
    const currentPaper = event.currentTarget.closest('.stacked-paper');
    if (currentPaper) {
        currentPaper.classList.add('tossed');
    }
}

// --- SISTEM HUJAN CONFETTI (SLIDE 1) ---
function createConfetti() {
    const slide1 = document.getElementById('slide1');
    if (currentSlide !== 0) return;

    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        
        confetti.style.left = Math.random() * 100 + 'vw';
        
        const size = Math.random() * 10 + 5 + 'px';
        confetti.style.width = size;
        confetti.style.height = size;
        
        confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
        
        const colors = ['#b05cff', '#ff2a5f', '#ebd9ff'];
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        slide1.appendChild(confetti);

        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

createConfetti();
confettiInterval = setInterval(createConfetti, 3000);