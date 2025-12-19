/**
 * SISTEMA DE MÚLTIPLAS ROLETAS
 * Gerencia criação, atualização e controle de múltiplas roletas
 */

// Funções utilitárias compartilhadas
function generateUniqueColor(index, total) {
    const hue = (index * 360) / total;
    const saturation = 70;
    const lightness = 50;
    
    const hslToRgb = (h, s, l) => {
        s /= 100;
        l /= 100;
        const k = (n) => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return [255 * f(0), 255 * f(8), 255 * f(4)];
    };
    
    const [r, g, b] = hslToRgb(hue, saturation, lightness);
    const toHex = (n) => Math.round(n).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getTextColor(hexColor) {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5 ? '#ffffff' : '#000000';
}

/**
 * Classe que representa uma roleta individual
 */
class Wheel {
    constructor(id, container) {
        console.log('Wheel constructor chamado com id:', id, 'container:', container);
        
        this.id = id;
        this.container = container;
        this.options = ['Prêmio 1', 'Prêmio 2', 'Prêmio 3', 'Prêmio 4', 'Prêmio 5', 'Prêmio 6', 'Prêmio 7', 'Prêmio 8'];
        this.currentRotation = 0;
        this.isSpinning = false;
        this.selectedPrizeIndex = null;
        this.prizeOverlay = null;
        
        if (!container) {
            console.error('Container não encontrado para criar a roleta!');
            return;
        }
        
        console.log('Criando HTML da roleta...');
        this.createWheelHTML();
        console.log('HTML criado, criando wheel SVG...');
        this.createWheel();
        console.log('Wheel SVG criado');
        
        // Aguardar um pouco para garantir que o elemento está no DOM antes de criar as luzes
        setTimeout(() => {
            console.log('Criando luzes...');
            this.createLights();
        }, 100);
    }
    
    createWheelHTML() {
        const wheelContainer = document.createElement('div');
        wheelContainer.className = 'wheel-container';
        wheelContainer.id = `wheelContainer${this.id}`;
        
        const wheelFrame = document.createElement('div');
        wheelFrame.className = 'wheel-frame';
        
        const wheelLights = document.createElement('div');
        wheelLights.className = 'wheel-lights';
        wheelLights.id = `wheelLights${this.id}`;
        
        const wheelInner = document.createElement('div');
        wheelInner.className = 'wheel-inner';
        wheelInner.id = `wheelInner${this.id}`;
        
        const wheelSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        wheelSvg.setAttribute('class', 'wheel-svg');
        wheelSvg.setAttribute('id', `wheel${this.id}`);
        wheelSvg.setAttribute('viewBox', '0 0 700 700');
        
        const wheelCenter = document.createElement('div');
        wheelCenter.className = 'wheel-center';
        const starIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        starIcon.setAttribute('class', 'star-icon');
        starIcon.setAttribute('viewBox', '0 0 24 24');
        starIcon.setAttribute('fill', '#FFD700');
        const starPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        starPath.setAttribute('d', 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z');
        starIcon.appendChild(starPath);
        wheelCenter.appendChild(starIcon);
        
        const wheelPointer = document.createElement('div');
        wheelPointer.className = 'wheel-pointer';
        
        wheelInner.appendChild(wheelSvg);
        wheelInner.appendChild(wheelCenter);
        wheelFrame.appendChild(wheelLights);
        wheelFrame.appendChild(wheelInner);
        wheelFrame.appendChild(wheelPointer);
        wheelContainer.appendChild(wheelFrame);
        
        if (!this.container) {
            console.error('Container não existe para adicionar a roleta!');
            return;
        }
        
        this.container.appendChild(wheelContainer);
        console.log('Roleta HTML criada e adicionada ao container');
        console.log('Elemento adicionado:', wheelContainer);
        console.log('Container agora tem', this.container.children.length, 'filhos');
        
        // Armazenar referências
        this.wheelElement = wheelSvg;
        this.wheelLightsElement = wheelLights;
        this.wheelInnerElement = wheelInner;
        this.wheelFrameElement = wheelFrame;
        this.wheelContainerElement = wheelContainer;
        
        // Verificar se o elemento está visível
        console.log('wheelContainer visível?', wheelContainer.offsetWidth > 0 && wheelContainer.offsetHeight > 0);
        console.log('wheelContainer dimensões:', wheelContainer.offsetWidth, 'x', wheelContainer.offsetHeight);
        
        // Event listener para girar
        wheelFrame.addEventListener('click', () => this.spin());
    }
    
    createLights() {
        if (!this.wheelLightsElement || !this.wheelFrameElement) return;
        
        this.wheelLightsElement.innerHTML = '';
        const numLights = 18;
        const anglePerLight = 360 / numLights;
        
        // Usar um tamanho padrão se ainda não estiver renderizado
        const frameRect = this.wheelFrameElement.getBoundingClientRect();
        let containerSize = frameRect.width || this.wheelFrameElement.offsetWidth;
        
        // Se ainda não tiver tamanho, usar valor padrão e recalcular depois
        if (!containerSize || containerSize === 0) {
            containerSize = 700; // Tamanho padrão
            // Tentar recalcular após um pequeno delay
            setTimeout(() => {
                this.createLights();
            }, 100);
            return;
        }
        
        const raioExterno = containerSize / 2;
        const espessuraDaBorda = 18;
        const raioLuz = raioExterno - (espessuraDaBorda / 2);

        for (let i = 0; i < numLights; i++) {
            const light = document.createElement('div');
            light.className = 'wheel-light';
            
            const angle = i * anglePerLight;
            const angleRad = (angle - 90) * Math.PI / 180;
            const x = raioLuz * Math.cos(angleRad);
            const y = raioLuz * Math.sin(angleRad);
            
            light.style.position = 'absolute';
            light.style.left = `calc(50% + ${x}px)`;
            light.style.top = `calc(50% + ${y}px)`;
            light.style.transform = 'translate(-50%, -50%)';
            light.style.zIndex = '10';
            light.style.animationDelay = `${i * 0.15}s`;
            
            this.wheelLightsElement.appendChild(light);
        }
    }
    
    createWheel() {
        console.log('createWheel chamado, wheelElement:', this.wheelElement);
        
        if (!this.wheelElement) {
            console.error('wheelElement não existe!');
            return;
        }
        
        this.wheelElement.innerHTML = '';
        const numOptions = this.options.length;
        console.log('Número de opções:', numOptions);
        
        const angleStep = 360 / numOptions;
        const cx = 350;
        const cy = 350;
        const radius = 332;
        const toRad = (deg) => (deg - 90) * Math.PI / 180;
        
        // Criar segmentos
        this.options.forEach((option, index) => {
            const startAngle = index * angleStep;
            const endAngle = startAngle + angleStep;
            const startRad = toRad(startAngle);
            const endRad = toRad(endAngle);
            
            const x1 = cx + radius * Math.cos(startRad);
            const y1 = cy + radius * Math.sin(startRad);
            const x2 = cx + radius * Math.cos(endRad);
            const y2 = cy + radius * Math.sin(endRad);
            const largeArcFlag = angleStep > 180 ? 1 : 0;
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const pathData = [
                `M ${cx} ${cy}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
            ].join(' ');
            
            const uniqueColor = generateUniqueColor(index, numOptions);
            path.setAttribute('d', pathData);
            path.setAttribute('fill', uniqueColor);
            path.setAttribute('class', 'wheel-segment-path');
            this.wheelElement.appendChild(path);
        });
        
        // Criar textos
        this.options.forEach((option, index) => {
            const startAngle = index * angleStep;
            const angleMid = startAngle + (angleStep / 2);
            const middleRad = toRad(angleMid);
            const textRadius = radius * 0.50;
            const textX = cx + textRadius * Math.cos(middleRad);
            const textY = cy + textRadius * Math.sin(middleRad);
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', textX);
            text.setAttribute('y', textY);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'middle');
            const fontSize = Math.max(24, Math.min(32, 520 / (numOptions * 2.5)));
            text.setAttribute('font-size', fontSize);
            text.setAttribute('font-weight', '600');
            text.setAttribute('font-family', 'Arial, sans-serif');
            text.setAttribute('class', 'wheel-segment-text');
            
            let textRotation = angleMid - 90;
            if (textRotation > 90 && textRotation < 270) {
                textRotation = textRotation + 180;
            }
            text.setAttribute('transform', `rotate(${textRotation} ${textX} ${textY})`);
            
            const segmentColor = generateUniqueColor(index, numOptions);
            const textColor = getTextColor(segmentColor);
            text.setAttribute('fill', textColor);
            text.textContent = option;
            this.wheelElement.appendChild(text);
        });
        
        // Aplicar rotação atual
        if (this.currentRotation !== undefined) {
            this.wheelInnerElement.style.transform = `rotate(${this.currentRotation}deg)`;
        }
        
        console.log('createWheel concluído, criando luzes em 100ms...');
        
        // Aguardar um pouco para garantir que o elemento está no DOM antes de criar as luzes
        setTimeout(() => {
            this.createLights();
        }, 100);
    }
    
    spin() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        this.wheelFrameElement.style.cursor = 'not-allowed';
        
        // Fechar overlay se estiver aberto
        this.closePrizeOverlay();
        
        const numOptions = this.options.length;
        const anglePerSection = 360 / numOptions;
        const spins = 5 + Math.random() * 5;
        const randomAngle = Math.random() * 360;
        const totalRotation = spins * 360 + randomAngle;
        const normalizedAngle = totalRotation % 360;
        const selectedIndex = Math.floor((360 - normalizedAngle) / anglePerSection) % numOptions;
        const adjustedRotation = totalRotation - (normalizedAngle % anglePerSection) + (anglePerSection / 2);
        
        this.currentRotation += adjustedRotation;
        
        this.wheelInnerElement.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
        this.wheelInnerElement.style.transform = `rotate(${this.currentRotation}deg)`;
        
        setTimeout(() => {
            this.currentRotation = this.currentRotation % 360;
            this.wheelInnerElement.style.transition = 'none';
            this.wheelInnerElement.style.transform = `rotate(${this.currentRotation}deg)`;
            this.isSpinning = false;
            this.wheelFrameElement.style.cursor = 'pointer';
            
            const selectedPrize = this.options[selectedIndex];
            this.selectedPrizeIndex = selectedIndex; // Armazenar o índice do prêmio selecionado
            this.triggerConfetti();
            
            // Mostrar overlay com o prêmio após os confetes
            setTimeout(() => {
                this.showPrizeOverlay(selectedPrize);
            }, 2500);
        }, 4000);
    }
    
    triggerConfetti() {
        if (typeof confetti === 'undefined') return;
        
        const rect = this.wheelContainerElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const x = centerX / window.innerWidth;
        const y = centerY / window.innerHeight;
        
        const colors = ['#FF0000', '#FFD700', '#00FF00', '#0000FF', '#FF00FF', '#00FFFF', '#FFA500', '#FF1493', '#32CD32', '#FF69B4', '#00CED1', '#FF6347'];
        
        confetti({
            particleCount: 400,
            angle: 90,
            spread: 360,
            origin: { x: x, y: y },
            colors: colors,
            shapes: ['square', 'circle'],
            gravity: 0.5,
            ticks: 200,
            decay: 0.94,
            startVelocity: 45,
            drift: 0.2,
            scalar: 1.3,
            zIndex: 9999
        });
        
        setTimeout(() => {
            confetti({
                particleCount: 250,
                angle: 90,
                spread: 360,
                origin: { x: x, y: y },
                colors: colors,
                shapes: ['square', 'circle'],
                gravity: 0.4,
                ticks: 180,
                decay: 0.93,
                startVelocity: 40,
                drift: 0.15,
                scalar: 1.2,
                zIndex: 9999
            });
        }, 100);
        
        setTimeout(() => {
            confetti({
                particleCount: 200,
                angle: 90,
                spread: 360,
                origin: { x: x, y: y },
                colors: colors,
                shapes: ['square', 'circle'],
                gravity: 0.45,
                ticks: 170,
                decay: 0.92,
                startVelocity: 35,
                drift: 0.25,
                scalar: 1.1,
                zIndex: 9999
            });
        }, 200);
    }
    
    updateOptions(newOptions) {
        this.options = newOptions.length > 0 ? newOptions : ['Prêmio 1'];
        this.createWheel();
    }
    
    reset() {
        this.isSpinning = false;
        this.currentRotation = 0;
        this.options = ['Prêmio 1', 'Prêmio 2', 'Prêmio 3', 'Prêmio 4', 'Prêmio 5', 'Prêmio 6', 'Prêmio 7', 'Prêmio 8'];
        this.wheelFrameElement.style.cursor = 'pointer';
        this.wheelInnerElement.style.transition = 'none';
        this.wheelInnerElement.style.transform = 'rotate(0deg)';
        this.createWheel();
    }
    
    remove() {
        this.wheelContainerElement.remove();
        if (this.prizeOverlay) {
            this.prizeOverlay.remove();
        }
    }
    
    /**
     * Mostra overlay com o prêmio selecionado
     */
    showPrizeOverlay(prize) {
        // Remover overlay anterior se existir
        this.closePrizeOverlay();
        
        // Criar overlay
        const overlay = document.createElement('div');
        overlay.className = 'prize-overlay';
        overlay.id = `prizeOverlay${this.id}`;
        
        const content = document.createElement('div');
        content.className = 'prize-overlay-content';
        
        const title = document.createElement('h2');
        title.className = 'prize-overlay-title';
        title.textContent = 'Prêmio Selecionado!';
        
        const prizeName = document.createElement('div');
        prizeName.className = 'prize-overlay-prize';
        prizeName.textContent = prize;
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'prize-overlay-buttons';
        
        const removeButton = document.createElement('button');
        removeButton.className = 'prize-overlay-remove-btn';
        removeButton.textContent = 'Remover da Roleta';
        removeButton.addEventListener('click', () => {
            this.removeSelectedPrize();
        });
        
        const closeButton = document.createElement('button');
        closeButton.className = 'prize-overlay-close-btn';
        closeButton.textContent = 'Fechar';
        closeButton.addEventListener('click', () => {
            this.closePrizeOverlay();
        });
        
        buttonContainer.appendChild(removeButton);
        buttonContainer.appendChild(closeButton);
        
        content.appendChild(title);
        content.appendChild(prizeName);
        content.appendChild(buttonContainer);
        overlay.appendChild(content);
        
        // Adicionar ao container da roleta
        this.wheelContainerElement.appendChild(overlay);
        this.prizeOverlay = overlay;
        
        // Animação de entrada
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);
    }
    
    /**
     * Fecha o overlay do prêmio
     */
    closePrizeOverlay() {
        if (this.prizeOverlay) {
            this.prizeOverlay.classList.remove('active');
            setTimeout(() => {
                if (this.prizeOverlay && this.prizeOverlay.parentNode) {
                    this.prizeOverlay.remove();
                }
                this.prizeOverlay = null;
            }, 300);
        }
    }
    
    /**
     * Remove o prêmio selecionado da roleta
     */
    removeSelectedPrize() {
        if (this.selectedPrizeIndex === null || this.selectedPrizeIndex < 0 || this.selectedPrizeIndex >= this.options.length) {
            console.error('Índice de prêmio inválido:', this.selectedPrizeIndex);
            return;
        }
        
        // Remover o prêmio da lista
        this.options = this.options.filter((_, index) => index !== this.selectedPrizeIndex);
        
        // Se não houver mais opções, adicionar uma opção padrão
        if (this.options.length === 0) {
            this.options = ['Prêmio Final'];
        }
        
        // Fechar overlay
        this.closePrizeOverlay();
        
        // Recriar a roleta sem o prêmio removido
        this.createWheel();
        
        // Resetar índice selecionado
        this.selectedPrizeIndex = null;
    }
}

/**
 * Gerenciador de múltiplas roletas
 */
class WheelManager {
    constructor() {
        this.wheels = [];
        this.wheelCount = 1;
        this.mainContainer = document.getElementById('mainContainer');
        this.wheelDivider = document.getElementById('wheelDivider');
        
        if (!this.mainContainer) {
            console.error('mainContainer não encontrado!');
            return;
        }
        
        this.createInitialWheel();
    }
    
    createInitialWheel() {
        console.log('createInitialWheel chamado');
        console.log('mainContainer:', this.mainContainer);
        
        if (!this.mainContainer) {
            console.error('Não é possível criar roleta inicial: mainContainer não existe');
            return;
        }
        
        console.log('Criando nova Wheel com id 0...');
        const wheel = new Wheel(0, this.mainContainer);
        this.wheels.push(wheel);
        console.log('Roleta inicial criada:', wheel);
        console.log('Número de roletas após criação:', this.wheels.length);
    }
    
    addWheel() {
        if (this.wheelCount >= 2) return; // Máximo de 2 roletas
        
        const wheel = new Wheel(this.wheelCount, this.mainContainer);
        this.wheels.push(wheel);
        this.wheelCount++;
        
        this.updateLayout();
    }
    
    removeWheel() {
        if (this.wheelCount <= 1) return;
        
        const wheel = this.wheels.pop();
        wheel.remove();
        this.wheelCount--;
        
        this.updateLayout();
    }
    
    updateLayout() {
        if (this.wheelCount === 2) {
            this.mainContainer.classList.add('two-wheels');
            if (this.wheelDivider) {
                this.wheelDivider.style.display = 'block';
            }
        } else {
            this.mainContainer.classList.remove('two-wheels');
            if (this.wheelDivider) {
                this.wheelDivider.style.display = 'none';
            }
        }
    }
    
    getWheel(index) {
        return this.wheels[index];
    }
    
    resetAll() {
        // Se houver 2 roletas, remover a segunda
        while (this.wheelCount > 1) {
            this.removeWheel();
        }
        
        // Resetar a roleta restante
        if (this.wheels.length > 0) {
            this.wheels[0].reset();
        }
        
        // Atualizar layout
        this.updateLayout();
    }
}

