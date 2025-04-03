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

// Variáveis do timer
let timeLeft;
let timerId = null;
let isRunning = false;
let startTime;
let elapsedTime = 0;
let currentTask = null;

// Configuração dos avatares
avatarOptions.forEach(avatar => {
    avatar.addEventListener('click', () => {
        selectedAvatar.src = avatar.src;
        selectedAvatar.dataset.seed = avatar.dataset.seed;
    });
});

// Funções do timer
function updateDisplay(minutes, seconds) {
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
        
        timerId = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            updateDisplay(minutes, seconds);
            
            if (timeLeft === 0) {
                clearInterval(timerId);
                isRunning = false;
                alert('Tempo esgotado!');
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