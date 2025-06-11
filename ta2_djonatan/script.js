// Elementos do DOM
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const timeInput = document.getElementById('timeInput');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const toggleModeBtn = document.getElementById('toggleModeBtn');
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
const totalTimeDisplay = document.getElementById('totalTimeDisplay');

// Variáveis do timer
let timerId;
let elapsedTime = 0;
let isRunning = false;
let startTime;
let currentTask = null;
let isCountdownMode = false;

// Configuração dos avatares
avatarOptions.forEach(avatar => {
    avatar.addEventListener('click', () => {
        selectedAvatar.src = avatar.src;
        selectedAvatar.dataset.seed = avatar.dataset.seed;
    });
});

// Funções do timer
function updateDisplay() {
    let minutes, seconds;

    if (isCountdownMode) {
        const timeLeft = Math.max(0, parseInt(timeInput.value) * 60 - elapsedTime);
        minutes = Math.floor(timeLeft / 60);
        seconds = Math.floor(timeLeft % 60); // ADICIONADO Math.floor() AQUI
    } else { // Modo Crescente (Stopwatch)
        minutes = Math.floor(elapsedTime / 60);
        seconds = Math.floor(elapsedTime % 60); // Esta parte já estava correta
    }

    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
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
        startTime = Date.now() - (elapsedTime * 1000);
        
        // Atualizar notificação
        updateNotification(currentTask);
        
        timerId = setInterval(() => {
            elapsedTime = (Date.now() - startTime) / 1000;
            
            if (isCountdownMode && elapsedTime >= parseInt(timeInput.value) * 60) {
                clearInterval(timerId);
                isRunning = false;
                alert('Tempo esgotado!');
                updateNotification(null);
            }
            
            updateDisplay();
        }, 1000);
        
        updateDisplay();
    }
}

function pauseTimer() {
    if (isRunning) {
        clearInterval(timerId);
        isRunning = false;
    }
}

function calculateTotalTime() {
    const taskTimes = document.querySelectorAll('.task-time');
    let totalSeconds = 0;
    
    taskTimes.forEach(timeElement => {
        const timeText = timeElement.textContent;
        const timeMatch = timeText.match(/Tempo: (\d+):(\d+)/);
        if (timeMatch) {
            const minutes = parseInt(timeMatch[1]);
            const seconds = parseInt(timeMatch[2]);
            totalSeconds += (minutes * 60) + seconds;
        }
    });
    
    const totalMinutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    totalTimeDisplay.textContent = `Tempo Total: ${totalMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function stopAndSaveTimer() {
    if (isRunning) {
        clearInterval(timerId);
        isRunning = false;
        
        if (currentTask) {
            const timeSpan = document.createElement('span');
            timeSpan.className = 'task-time';
            timeSpan.textContent = `Tempo: ${formatTime(Math.floor(elapsedTime))}`;
            
            currentTask.appendChild(timeSpan);
            
            // Atualizar tempo total
            calculateTotalTime();
            
            // Limpar campos
            currentTask = null;
            elapsedTime = 0;
            updateDisplay();
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
    updateDisplay();
    updateNotification(null);
}

function toggleTimerMode() {
    if (isRunning) {
        alert('Por favor, pare o timer antes de mudar o modo!');
        return;
    }
    
    isCountdownMode = !isCountdownMode;
    toggleModeBtn.textContent = isCountdownMode ? 'Modo Decrescente' : 'Modo Crescente';
    resetTimer();
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
        calculateTotalTime(); // Recalcular tempo total após excluir uma tarefa
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

// Inicializar o tempo total
calculateTotalTime();

// Event Listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
stopBtn.addEventListener('click', stopAndSaveTimer);
resetBtn.addEventListener('click', resetTimer);
toggleModeBtn.addEventListener('click', toggleTimerMode);
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

