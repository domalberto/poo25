// Elementos do DOM
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const timeInput = document.getElementById('timeInput');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const personInput = document.getElementById('personInput');
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const selectedAvatar = document.getElementById('selectedAvatar');
const avatarOptions = document.querySelectorAll('.avatar-options img');
const currentActivityNotification = document.getElementById('currentActivityNotification');
const notificationAvatar = document.getElementById('notificationAvatar');
const notificationPerson = document.getElementById('notificationPerson');
const notificationTask = document.getElementById('notificationTask');

// Elementos do seletor de imagem de fundo
const backgroundSelect = document.querySelector('.background-select');
const backgroundPreview = document.querySelector('.background-preview');

// Variáveis do timer
let timer;
let timeLeft = 0;
let isRunning = false;
let startTime;
let elapsedTime = 0;
let currentTask = null;

// Gestão de Riscos
const riskTextareas = document.querySelectorAll('.risk-cell textarea');

// Configuração dos avatares
avatarOptions.forEach(avatar => {
    avatar.addEventListener('click', () => {
        selectedAvatar.src = avatar.src;
        selectedAvatar.dataset.seed = avatar.dataset.seed;
    });
});

// Funções do timer
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timerDisplay').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateNotification(taskElement) {
    if (taskElement) {
        const avatar = taskElement.querySelector('.task-avatar');
        const person = taskElement.querySelector('.task-person');
        const task = taskElement.querySelector('span:not(.task-person)');
        
        notificationAvatar.src = avatar.src;
        notificationPerson.textContent = person.textContent;
        notificationTask.textContent = task.textContent;
        
        currentActivityNotification.style.display = 'block';
    } else {
        currentActivityNotification.style.display = 'none';
    }
}

function startTimer() {
    if (!isRunning) {
        if (!currentTask) {
            alert('Por favor, adicione uma atividade antes de iniciar o timer!');
            return;
        }
        
        isRunning = true;
        timeLeft = parseInt(timeInput.value) * 60;
        startTime = Date.now();
        
        // Atualizar notificação
        updateNotification(currentTask);
        
        timerId = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            updateDisplay(minutes, seconds);
            
            if (timeLeft === 0) {
                clearInterval(timerId);
                isRunning = false;
                alert('Tempo esgotado!');
                updateNotification(null);
            } else {
                timeLeft--;
            }
        }, 1000);
    }
}

function pauseTimer() {
    clearInterval(timerId);
    isRunning = false;
    elapsedTime += (Date.now() - startTime) / 1000;
}

function stopAndSaveTimer() {
    if (isRunning) {
        clearInterval(timerId);
        isRunning = false;
        elapsedTime += (Date.now() - startTime) / 1000;
        
        if (currentTask) {
            const timeSpan = document.createElement('span');
            timeSpan.className = 'task-time';
            timeSpan.textContent = `Tempo: ${formatTime(Math.floor(elapsedTime))}`;
            
            currentTask.appendChild(timeSpan);
            
            // Limpar campos
            currentTask = null;
            elapsedTime = 0;
            updateDisplay(parseInt(timeInput.value), 0);
            updateNotification(null);
        }
    } else {
        alert('O timer não está em execução!');
    }
}

function resetTimer() {
    clearInterval(timerId);
    isRunning = false;
    elapsedTime = 0;
    updateDisplay(parseInt(timeInput.value), 0);
    updateNotification(null);
}

// Funções de gerenciamento de tarefas
function addTask() {
    const personName = personInput.value.trim();
    const taskText = taskInput.value.trim();
    
    if (!personName) {
        alert('Por favor, digite o nome da pessoa!');
        return;
    }
    
    if (!taskText) {
        alert('Por favor, digite uma atividade!');
        return;
    }
    
    const li = document.createElement('li');
    li.className = 'task-item';
    
    const taskContent = document.createElement('div');
    taskContent.className = 'task-content';
    
    const taskAvatar = document.createElement('img');
    taskAvatar.className = 'task-avatar';
    taskAvatar.src = selectedAvatar.src;
    taskAvatar.alt = 'Avatar da atividade';
    
    const personSpan = document.createElement('span');
    personSpan.className = 'task-person';
    personSpan.textContent = personName;
    
    const taskSpan = document.createElement('span');
    taskSpan.textContent = taskText;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Excluir';
    deleteBtn.onclick = () => {
        if (currentTask === li) {
            currentTask = null;
            updateNotification(null);
        }
        li.remove();
    };
    
    taskSpan.onclick = () => {
        taskSpan.classList.toggle('completed');
    };
    
    taskContent.appendChild(taskAvatar);
    taskContent.appendChild(personSpan);
    taskContent.appendChild(taskSpan);
    li.appendChild(taskContent);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
    
    // Marcar como atividade atual
    currentTask = li;
    
    // Limpar campos
    personInput.value = '';
    taskInput.value = '';
    
    // Resetar o timer
    resetTimer();
}

// Função para atualizar a imagem de fundo
function updateBackground() {
    const selectedImage = backgroundSelect.value;
    document.documentElement.style.setProperty('--background-image', `url('${selectedImage}')`);
    backgroundPreview.src = selectedImage;
}

// Event Listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
stopBtn.addEventListener('click', stopAndSaveTimer);
resetBtn.addEventListener('click', resetTimer);
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});
personInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        taskInput.focus();
    }
});

// Event listener para mudança de imagem de fundo
backgroundSelect.addEventListener('change', updateBackground);

// Inicializar a imagem de fundo
updateBackground();

// Salvar riscos no localStorage
function saveRisks() {
    const risks = {};
    riskTextareas.forEach(textarea => {
        const cell = textarea.closest('.risk-cell');
        const riskKey = cell.dataset.risk;
        if (riskKey) {
            risks[riskKey] = textarea.value;
        }
    });
    localStorage.setItem('risks', JSON.stringify(risks));
}

// Carregar riscos do localStorage
function loadRisks() {
    const savedRisks = localStorage.getItem('risks');
    if (savedRisks) {
        const risks = JSON.parse(savedRisks);
        riskTextareas.forEach(textarea => {
            const cell = textarea.closest('.risk-cell');
            const riskKey = cell.dataset.risk;
            if (riskKey && risks[riskKey]) {
                textarea.value = risks[riskKey];
            }
        });
    }
}

// Event Listeners para salvar riscos
riskTextareas.forEach(textarea => {
    textarea.addEventListener('input', saveRisks);
    textarea.addEventListener('blur', saveRisks);
});

// Carregar riscos ao iniciar
loadRisks();

// Função para mostrar/esconder o balão de informação
function toggleInfo() {
    const infoContent = document.getElementById('riskInfo');
    infoContent.classList.toggle('active');
}

// Fechar o balão ao clicar fora
document.addEventListener('click', function(event) {
    const infoContent = document.getElementById('riskInfo');
    const infoButton = document.querySelector('.info-button');
    
    if (!infoContent.contains(event.target) && event.target !== infoButton) {
        infoContent.classList.remove('active');
    }
});

// Função para minimizar/maximizar a tabela de riscos
function toggleRiskMatrix() {
    const matrix = document.querySelector('.risk-matrix');
    const button = document.querySelector('.minimize-button');
    
    matrix.classList.toggle('minimized');
    button.classList.toggle('minimized');
    
    // Salvar o estado no localStorage
    const isMinimized = matrix.classList.contains('minimized');
    localStorage.setItem('riskMatrixMinimized', isMinimized);
}

// Carregar estado da minimização ao iniciar
window.addEventListener('load', function() {
    const isMinimized = localStorage.getItem('riskMatrixMinimized') === 'true';
    if (isMinimized) {
        const matrix = document.querySelector('.risk-matrix');
        const button = document.querySelector('.minimize-button');
        matrix.classList.add('minimized');
        button.classList.add('minimized');
    }
});

// Função para maximizar/minimizar a tabela de riscos
function toggleMaximize() {
    const riskManagement = document.querySelector('.risk-management');
    const maximizeButton = document.querySelector('.maximize-button');
    
    riskManagement.classList.toggle('maximized');
    maximizeButton.classList.toggle('maximized');
    
    // Salvar o estado no localStorage
    const isMaximized = riskManagement.classList.contains('maximized');
    localStorage.setItem('riskMatrixMaximized', isMaximized);
}

// Carregar estado da maximização ao iniciar
window.addEventListener('load', function() {
    const isMaximized = localStorage.getItem('riskMatrixMaximized') === 'true';
    if (isMaximized) {
        const riskManagement = document.querySelector('.risk-management');
        const maximizeButton = document.querySelector('.maximize-button');
        riskManagement.classList.add('maximized');
        maximizeButton.classList.add('maximized');
    }
});

// Função para controlar o scroll da lista de riscos
function handleRiskScroll(event) {
    const riskMatrix = document.querySelector('.risk-matrix');
    if (!riskMatrix) return;

    // Verifica se a matriz está visível
    if (riskMatrix.classList.contains('minimized')) return;

    // Scroll para baixo (tecla S)
    if (event.key.toLowerCase() === 's') {
        riskMatrix.scrollTop += 50;
    }
    // Scroll para cima (tecla W)
    else if (event.key.toLowerCase() === 'w') {
        riskMatrix.scrollTop -= 50;
    }
}

// Adicionar event listener para o scroll
document.addEventListener('keydown', handleRiskScroll); 