const gameArea = document.getElementById('game-area');
        const playerContainer = document.getElementById('player-container');
        const playerSprite = document.getElementById('player-sprite');
        const scoreBoard = document.getElementById('score-board');
        const livesBoard = document.getElementById('lives-board');
        const startScreen = document.getElementById('start-screen');
        const gameOverScreen = document.getElementById('gameover-screen');
        const winScreen = document.getElementById('win-screen');

        let isPlaying = false;
        let score = 0;
        let lives = 3;
        const targetScore = 18;
        let playerX = window.innerWidth / 2;
        let fallingObjects = []; 
        let spawnHeartTimer, spawnBombTimer;
        let gameLoopTimer;

        let isDragging = false;
        let lastX = playerX;
        let currentAnim = 'idle';
        let moveTimeout;

        function setAnimation(animClass) {
            if (currentAnim === animClass) return;
            playerSprite.className = ''; 
            playerSprite.classList.add(animClass);
            currentAnim = animClass;
        }

        function updatePlayerPosition() {
            const playerWidth = 75; 
            const maxRight = window.innerWidth - playerWidth / 2;
            const minLeft = playerWidth / 2;

            if (playerX > maxRight) playerX = maxRight;
            if (playerX < minLeft) playerX = minLeft;

            playerContainer.style.left = `${playerX}px`;
        }

        function handlePointerMove(newX) {
            if(!isPlaying) return;
            if (newX > lastX + 2) setAnimation('run-right');
            else if (newX < lastX - 2) setAnimation('run-left');
            playerX = newX; lastX = newX; updatePlayerPosition();

            clearTimeout(moveTimeout);
            moveTimeout = setTimeout(() => { if(isDragging) setAnimation('idle'); }, 100);
        }

        gameArea.addEventListener('touchstart', (e) => { isDragging = true; lastX = e.touches[0].clientX; });
        gameArea.addEventListener('touchmove', (e) => { if(isDragging) handlePointerMove(e.touches[0].clientX); });
        gameArea.addEventListener('touchend', () => { isDragging = false; setAnimation('idle'); });

        gameArea.addEventListener('mousedown', (e) => { isDragging = true; lastX = e.clientX; });
        gameArea.addEventListener('mousemove', (e) => { if(isDragging) handlePointerMove(e.clientX); });
        gameArea.addEventListener('mouseup', () => { isDragging = false; setAnimation('idle'); });

        window.addEventListener('keydown', (e) => {
            if(!isPlaying) return;
            const speed = 30; 
            if(e.key === 'ArrowLeft') { playerX -= speed; setAnimation('run-left'); }
            if(e.key === 'ArrowRight') { playerX += speed; setAnimation('run-right'); }
            updatePlayerPosition();
        });
        window.addEventListener('keyup', (e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') setAnimation('idle'); });

        function updateLivesDisplay() {
            let hearts = '';
            for(let i=0; i<lives; i++) hearts += '❤️';
            livesBoard.innerText = `Nyawa: ${hearts}`;
        }

        function startGame() {
            // BUG FIX 1: Menghilangkan fokus dari tombol agar spasi tidak kepencet ulang
            if (document.activeElement) document.activeElement.blur();
            
            // BUG FIX 2: Kembalikan posisi sapi jadi lurus (tidak miring)
            playerContainer.style.transform = `translateX(-50%) rotate(0deg)`;

            startScreen.classList.add('hidden');
            gameOverScreen.classList.add('hidden');
            winScreen.classList.add('hidden');
            
            isPlaying = true;
            score = 0;
            lives = 3;
            scoreBoard.innerText = `Skor: 0 / ${targetScore}`;
            updateLivesDisplay();
            
            playerContainer.style.left = '50%';
            playerX = window.innerWidth / 2;
            
            fallingObjects.forEach(obj => obj.el.remove());
            fallingObjects = [];
            setAnimation('idle');

            spawnHeartTimer = setInterval(() => spawnObject('heart'), 800);
            spawnBombTimer = setInterval(() => spawnObject('bomb'), 1500); 
            
            gameLoopTimer = requestAnimationFrame(gameLoop);
        }

        function spawnObject(type) {
            if (!isPlaying) return;
            const obj = document.createElement('div');
            obj.classList.add('falling-obj', type);
            
            if(type === 'heart') obj.innerText = '💜';
            else if(type === 'bomb') obj.innerText = '💣';
            
            const randomX = Math.random() * (window.innerWidth - 40);
            obj.style.left = `${randomX}px`;
            obj.style.top = `-50px`; 
            
            gameArea.appendChild(obj);
            fallingObjects.push({ el: obj, y: -50, type: type });
        }

        function showEffect(x, y, type) {
            const effect = document.createElement('div');
            effect.classList.add('effect');
            if(type === 'catch') {
                effect.classList.add('catch-effect');
                effect.innerText = '+1';
            } else {
                effect.classList.add('damage-effect');
                effect.innerText = '💥';
            }
            effect.style.left = `${x}px`;
            effect.style.top = `${y}px`;
            gameArea.appendChild(effect);
            setTimeout(() => effect.remove(), 800);
        }

        function gameLoop() {
            if (!isPlaying) return;

            const playerRect = playerContainer.getBoundingClientRect();

            for (let i = fallingObjects.length - 1; i >= 0; i--) {
                let fObj = fallingObjects[i];
                
                fObj.y += (fObj.type === 'bomb') ? 6 : 5; 
                fObj.el.style.top = `${fObj.y}px`;

                const objRect = fObj.el.getBoundingClientRect();

                if (objRect.bottom >= playerRect.top + 20 &&
                    objRect.top <= playerRect.bottom &&
                    objRect.right >= playerRect.left &&
                    objRect.left <= playerRect.right) {
                    
                    showEffect(objRect.left, objRect.top, fObj.type === 'heart' ? 'catch' : 'damage');
                    
                    if(fObj.type === 'heart') {
                        score++;
                        scoreBoard.innerText = `Skor: ${score} / ${targetScore}`;
                        if (score >= targetScore) return endCondition('win');
                    } else if (fObj.type === 'bomb') {
                        lives--;
                        updateLivesDisplay();
                        
                        // Efek getar dan miring
                        playerContainer.style.transform = `translateX(-50%) rotate(15deg)`;
                        setTimeout(() => { 
                            if(isPlaying) playerContainer.style.transform = `translateX(-50%) rotate(0deg)`; 
                        }, 250);
                        
                        if(lives <= 0) return endCondition('lose');
                    }

                    fObj.el.remove();
                    fallingObjects.splice(i, 1);
                } 
                else if (fObj.y > window.innerHeight) {
                    fObj.el.remove();
                    fallingObjects.splice(i, 1);
                }
            }
            requestAnimationFrame(gameLoop);
        }

        function endCondition(status) {
            isPlaying = false;
            clearInterval(spawnHeartTimer);
            clearInterval(spawnBombTimer);
            cancelAnimationFrame(gameLoopTimer);
            setAnimation('idle');

            fallingObjects.forEach(obj => obj.el.remove());
            fallingObjects = [];

            setTimeout(() => { 
                if(status === 'win') winScreen.classList.remove('hidden'); 
                else gameOverScreen.classList.remove('hidden');
            }, 500);
        }