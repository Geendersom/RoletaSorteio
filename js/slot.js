/**
 * SLOT MACHINE / CASSINO
 * Sistema de sorteio de números estilo cassino
 * 
 * Comunicação com a roleta via eventos/estado
 */

class SlotMachine {
    constructor() {
        this.selectedPrize = null; // Prêmio sorteado na roleta
        this.numberHistory = []; // Histórico de números sorteados (não pode repetir)
        this.isSpinning = false;
        this.finalNumber = null;
        
        // Elementos DOM
        this.modal = null;
        this.prizeDisplay = null;
        this.numberStartInput = null;
        this.numberEndInput = null;
        this.slotColumns = [];
        this.startButton = null;
        this.refreshButton = null;
        
        this.init();
    }
    
    /**
     * Inicializa o sistema de slot
     */
    init() {
        console.log('Inicializando SlotMachine...');
        this.createModal();
        this.setupEventListeners();
        console.log('SlotMachine inicializado com sucesso!');
    }
    
    /**
     * Cria o modal do cassino
     */
    createModal() {
        // Criar overlay do modal
        const overlay = document.createElement('div');
        overlay.className = 'casino-modal-overlay';
        overlay.id = 'casinoModal';
        
        // Criar conteúdo do modal
        const content = document.createElement('div');
        content.className = 'casino-modal-content';
        
        // Header com prêmio
        const header = document.createElement('div');
        header.className = 'casino-header';
        const prizeTitle = document.createElement('h1');
        prizeTitle.className = 'casino-prize-title';
        prizeTitle.id = 'casinoPrizeTitle';
        prizeTitle.textContent = 'PRÊMIO SORTEADO';
        header.appendChild(prizeTitle);
        
        // Campos de configuração
        const configSection = document.createElement('div');
        configSection.className = 'casino-config';
        
        const startLabel = document.createElement('label');
        startLabel.textContent = 'Número Inicial:';
        const startInput = document.createElement('input');
        startInput.type = 'number';
        startInput.id = 'numberStartInput';
        startInput.value = '0';
        startInput.min = '0';
        this.numberStartInput = startInput;
        
        const endLabel = document.createElement('label');
        endLabel.textContent = 'Número Final:';
        const endInput = document.createElement('input');
        endInput.type = 'number';
        endInput.id = 'numberEndInput';
        endInput.value = '0';
        endInput.min = '0';
        this.numberEndInput = endInput;
        
        configSection.appendChild(startLabel);
        configSection.appendChild(startInput);
        configSection.appendChild(endLabel);
        configSection.appendChild(endInput);
        
        // Área do slot
        const slotArea = document.createElement('div');
        slotArea.className = 'casino-slot-area';
        
        const slotContainer = document.createElement('div');
        slotContainer.className = 'casino-slot-container';
        
        // Criar 3 colunas de números
        for (let i = 0; i < 3; i++) {
            const column = document.createElement('div');
            column.className = 'casino-slot-column';
            column.id = `slotColumn${i}`;
            
            // Criar números visíveis (0-9)
            for (let j = 0; j < 10; j++) {
                const number = document.createElement('div');
                number.className = 'casino-slot-number';
                number.textContent = j;
                column.appendChild(number);
            }
            
            slotContainer.appendChild(column);
            this.slotColumns.push(column);
        }
        
        slotArea.appendChild(slotContainer);
        
        // Botão iniciar
        const startBtn = document.createElement('button');
        startBtn.className = 'casino-start-button';
        startBtn.id = 'casinoStartButton';
        startBtn.textContent = 'INICIAR';
        this.startButton = startBtn;
        
        // Área de resultado (inicialmente oculta)
        const resultArea = document.createElement('div');
        resultArea.className = 'casino-result-area';
        resultArea.id = 'casinoResultArea';
        resultArea.style.display = 'none';
        
        const resultNumber = document.createElement('div');
        resultNumber.className = 'casino-result-number';
        resultNumber.id = 'casinoResultNumber';
        resultArea.appendChild(resultNumber);
        
        // Botão refresh (inicialmente oculto)
        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'casino-refresh-button';
        refreshBtn.id = 'casinoRefreshButton';
        refreshBtn.innerHTML = '↻';
        refreshBtn.style.display = 'none';
        this.refreshButton = refreshBtn;
        resultArea.appendChild(refreshBtn);
        
        // Montar estrutura
        content.appendChild(header);
        content.appendChild(configSection);
        content.appendChild(slotArea);
        content.appendChild(startBtn);
        content.appendChild(resultArea);
        
        overlay.appendChild(content);
        
        // Verificar se o body existe antes de adicionar
        if (document.body) {
            document.body.appendChild(overlay);
        } else {
            console.error('document.body não existe ainda!');
            // Tentar novamente quando o DOM estiver pronto
            setTimeout(() => {
                if (document.body) {
                    document.body.appendChild(overlay);
                }
            }, 100);
        }
        
        this.modal = overlay;
        this.prizeDisplay = prizeTitle;
        
        console.log('Modal criado:', this.modal);
        console.log('Prize display criado:', this.prizeDisplay);
    }
    
    /**
     * Configura os event listeners
     */
    setupEventListeners() {
        this.startButton.addEventListener('click', () => this.startSpin());
        this.refreshButton.addEventListener('click', () => this.closeCasino());
    }
    
    /**
     * Abre o modal do cassino com o prêmio sorteado
     * @param {string} prize - Nome do prêmio sorteado
     */
    openCasino(prize) {
        console.log('SlotMachine.openCasino chamado com prêmio:', prize);
        
        if (!this.modal) {
            console.error('Modal não foi criado!');
            return;
        }
        
        if (!this.prizeDisplay) {
            console.error('Prize display não foi criado!');
            return;
        }
        
        this.selectedPrize = prize;
        this.prizeDisplay.textContent = prize.toUpperCase();
        this.modal.classList.add('active');
        this.resetSlot();
        
        // Bloquear interação com a roleta
        document.body.style.overflow = 'hidden';
        
        console.log('Modal aberto com sucesso!');
    }
    
    /**
     * Fecha o modal do cassino
     */
    closeCasino() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.resetSlot();
        
        // Disparar evento para a roleta saber que pode continuar
        window.dispatchEvent(new CustomEvent('casinoClosed'));
    }
    
    /**
     * Reseta o slot para o estado inicial
     */
    resetSlot() {
        this.isSpinning = false;
        this.finalNumber = null;
        
        // Resetar posição das colunas
        this.slotColumns.forEach(column => {
            column.style.transform = 'translateY(0)';
            column.classList.remove('stopped');
        });
        
        // Ocultar resultado
        const resultArea = document.getElementById('casinoResultArea');
        resultArea.style.display = 'none';
        this.refreshButton.style.display = 'none';
        
        // Habilitar botão iniciar
        this.startButton.disabled = false;
        this.startButton.style.display = 'block';
    }
    
    /**
     * Inicia a animação do slot
     */
    startSpin() {
        if (this.isSpinning) return;
        
        const startNum = parseInt(this.numberStartInput.value) || 0;
        const endNum = parseInt(this.numberEndInput.value) || 0;
        
        if (endNum <= startNum) {
            alert('O número final deve ser maior que o número inicial!');
            return;
        }
        
        this.isSpinning = true;
        this.startButton.disabled = true;
        
        // Gerar 3 números únicos (não podem se repetir)
        const numbers = this.generateUniqueNumbers(startNum, endNum, 3);
        this.finalNumber = parseInt(numbers.join(''));
        
        // Iniciar animação das 3 colunas simultaneamente
        this.animateColumns(numbers);
    }
    
    /**
     * Gera números únicos que não estão no histórico
     * @param {number} min - Número mínimo
     * @param {number} max - Número máximo
     * @param {number} count - Quantidade de números
     * @returns {Array} Array de números únicos
     */
    generateUniqueNumbers(min, max, count) {
        const numbers = [];
        const range = max - min + 1;
        
        for (let i = 0; i < count; i++) {
            let num;
            let attempts = 0;
            
            do {
                num = Math.floor(Math.random() * range) + min;
                attempts++;
                
                // Se tentou muitas vezes, usar qualquer número disponível
                if (attempts > 100) {
                    num = min + (i % range);
                    break;
                }
            } while (this.numberHistory.includes(num));
            
            numbers.push(num);
            this.numberHistory.push(num);
        }
        
        return numbers;
    }
    
    /**
     * Anima as colunas do slot sequencialmente
     * @param {Array} finalNumbers - Array com os 3 números finais [n1, n2, n3]
     */
    animateColumns(finalNumbers) {
        // Todas as colunas começam a girar ao mesmo tempo
        this.slotColumns.forEach((column, index) => {
            this.startColumnSpin(column, index);
        });
        
        // Primeiro número para após 3 segundos
        setTimeout(() => {
            this.stopColumn(this.slotColumns[0], finalNumbers[0]);
        }, 3000);
        
        // Segundo número para após 6 segundos (3s + 3s)
        setTimeout(() => {
            this.stopColumn(this.slotColumns[1], finalNumbers[1]);
        }, 6000);
        
        // Terceiro número para após 9 segundos (6s + 3s)
        setTimeout(() => {
            this.stopColumn(this.slotColumns[2], finalNumbers[2]);
            this.isSpinning = false;
            this.showResult();
        }, 9000);
    }
    
    /**
     * Inicia a animação de rotação de uma coluna
     * @param {HTMLElement} column - Elemento da coluna
     * @param {number} columnIndex - Índice da coluna (0, 1, 2)
     */
    startColumnSpin(column, columnIndex) {
        column.classList.remove('stopped');
        // Animação contínua de rotação
        const spinDuration = 0.1; // Velocidade da rotação (100ms por número)
        column.style.transition = `transform ${spinDuration}s linear`;
        
        // Criar loop de rotação
        let currentPosition = 0;
        const spinInterval = setInterval(() => {
            if (column.classList.contains('stopped')) {
                clearInterval(spinInterval);
                return;
            }
            
            currentPosition -= 60; // Altura de cada número (ajustar conforme CSS)
            column.style.transform = `translateY(${currentPosition}px)`;
            
            // Resetar posição quando chegar ao final
            if (Math.abs(currentPosition) >= 600) {
                currentPosition = 0;
            }
        }, spinDuration * 1000);
    }
    
    /**
     * Para uma coluna em um número específico
     * @param {HTMLElement} column - Elemento da coluna
     * @param {number} targetNumber - Número alvo
     */
    stopColumn(column, targetNumber) {
        column.classList.add('stopped');
        column.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        // Calcular posição final baseada no número alvo
        const numberHeight = 60; // Altura de cada número (deve corresponder ao CSS)
        const finalPosition = -(targetNumber * numberHeight);
        
        column.style.transform = `translateY(${finalPosition}px)`;
    }
    
    /**
     * Exibe o resultado final com animação de piscar
     */
    showResult() {
        const resultArea = document.getElementById('casinoResultArea');
        const resultNumber = document.getElementById('casinoResultNumber');
        
        resultNumber.textContent = this.finalNumber.toString().padStart(3, '0');
        resultArea.style.display = 'block';
        
        // Piscar 3 vezes
        let blinkCount = 0;
        const blinkInterval = setInterval(() => {
            resultNumber.classList.toggle('blink');
            
            blinkCount++;
            if (blinkCount >= 6) { // 3 piscadas (on/off = 2 estados por piscada)
                clearInterval(blinkInterval);
                resultNumber.classList.remove('blink');
                resultNumber.classList.add('highlighted');
                
                // Mostrar botão refresh após piscar
                setTimeout(() => {
                    this.refreshButton.style.display = 'block';
                }, 500);
            }
        }, 300);
    }
}

// Criar instância global do slot machine
// Aguardar DOM estar pronto antes de inicializar
let slotMachine;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        slotMachine = new SlotMachine();
        if (typeof window !== 'undefined') {
            window.slotMachine = slotMachine;
        }
        console.log('SlotMachine inicializado após DOMContentLoaded');
    });
} else {
    // DOM já está pronto
    slotMachine = new SlotMachine();
    if (typeof window !== 'undefined') {
        window.slotMachine = slotMachine;
    }
    console.log('SlotMachine inicializado imediatamente');
}

