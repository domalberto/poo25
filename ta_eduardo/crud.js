// DOM Elements
const processorForm = document.getElementById('processorForm');
const processorsTable = document.getElementById('processorsTable');
const toast = document.getElementById('toast');
let isFrequencyRange = false;

// Form handling
processorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const processor = {
        modelo: document.getElementById('modelo').value,
        marca: document.getElementById('marca').value,
        nucleos: parseInt(document.getElementById('nucleos').value),
        preco: parseFloat(document.getElementById('preco').value)
    };

    // Handle frequency based on type
    if (isFrequencyRange) {
        const min = parseFloat(document.getElementById('frequenciaMin').value);
        const max = parseFloat(document.getElementById('frequenciaMax').value);
        if (min > max) {
            showToast('A frequência mínima não pode ser maior que a máxima', 'error');
            return;
        }
        processor.frequencia = `${min} - ${max}`;
    } else {
        processor.frequencia = parseFloat(document.getElementById('frequencia').value);
    }

    const processorId = document.getElementById('processorId').value;

    try {
        if (processorId) {
            processor.id = parseInt(processorId);
            await dbOperations.update(processor);
            showToast('Processador atualizado com sucesso!', 'success');
        } else {
            await dbOperations.add(processor);
            showToast('Processador adicionado com sucesso!', 'success');
        }
        
        resetForm();
        loadProcessors();
    } catch (error) {
        showToast('Erro ao salvar processador!', 'error');
        console.error(error);
    }
});

// Toggle frequency input type
function toggleFrequencyType() {
    isFrequencyRange = !isFrequencyRange;
    const singleFreq = document.getElementById('frequencia');
    const rangeFreq = document.querySelector('.frequency-range');
    
    if (isFrequencyRange) {
        singleFreq.required = false;
        singleFreq.style.display = 'none';
        rangeFreq.classList.remove('hidden');
        document.getElementById('frequenciaMin').required = true;
        document.getElementById('frequenciaMax').required = true;
    } else {
        singleFreq.required = true;
        singleFreq.style.display = 'block';
        rangeFreq.classList.add('hidden');
        document.getElementById('frequenciaMin').required = false;
        document.getElementById('frequenciaMax').required = false;
    }
}

// Load processors
async function loadProcessors() {
    try {
        const processors = await dbOperations.getAll();
        const tbody = processorsTable.querySelector('tbody');
        tbody.innerHTML = '';

        processors.forEach(processor => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${processor.modelo}</td>
                <td>${processor.marca}</td>
                <td>${typeof processor.frequencia === 'string' ? processor.frequencia : processor.frequencia.toFixed(1)} GHz</td>
                <td>${processor.nucleos}</td>
                <td>R$ ${processor.preco.toFixed(2)}</td>
                <td>
                    <button onclick="editProcessor(${processor.id})" class="edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteProcessor(${processor.id})" class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
        });
    } catch (error) {
        showToast('Erro ao carregar processadores!', 'error');
        console.error(error);
    }
}

// Edit processor
async function editProcessor(id) {
    try {
        const processor = await dbOperations.getById(id);
        document.getElementById('processorId').value = processor.id;
        document.getElementById('modelo').value = processor.modelo;
        document.getElementById('marca').value = processor.marca;
        
        // Handle frequency range
        if (typeof processor.frequencia === 'string' && processor.frequencia.includes('-')) {
            const [min, max] = processor.frequencia.split('-').map(f => parseFloat(f.trim()));
            isFrequencyRange = true;
            document.getElementById('frequenciaMin').value = min;
            document.getElementById('frequenciaMax').value = max;
            toggleFrequencyType();
        } else {
            isFrequencyRange = false;
            document.getElementById('frequencia').value = processor.frequencia;
            if (document.querySelector('.frequency-range').classList.contains('hidden')) {
                document.getElementById('frequencia').style.display = 'block';
            }
        }
        
        document.getElementById('nucleos').value = processor.nucleos;
        document.getElementById('preco').value = processor.preco;
    } catch (error) {
        showToast('Erro ao carregar processador!', 'error');
        console.error(error);
    }
}

// Delete processor
async function deleteProcessor(id) {
    if (confirm('Tem certeza que deseja excluir este processador?')) {
        try {
            await dbOperations.delete(id);
            showToast('Processador excluído com sucesso!', 'success');
            loadProcessors();
        } catch (error) {
            showToast('Erro ao excluir processador!', 'error');
            console.error(error);
        }
    }
}

// Reset form
function resetForm() {
    processorForm.reset();
    document.getElementById('processorId').value = '';
}

// Change background image
function changeBackground() {
    const imageUrl = document.getElementById('bgImageUrl').value.trim();
    if (!imageUrl) {
        showToast('Por favor, insira um URL de imagem válido', 'error');
        return;
    }

    // Test if the image URL is valid
    const img = new Image();
    img.onload = function() {
        document.body.style.setProperty('--bg-image', `url(${imageUrl})`);
        document.body.style.setProperty('--bg-opacity', '1');
        document.documentElement.style.setProperty('--bg-image', `url(${imageUrl})`);
        document.querySelector('body::before').style.backgroundImage = `url(${imageUrl})`;
        showToast('Imagem de fundo alterada com sucesso!', 'success');
    };
    img.onerror = function() {
        showToast('URL da imagem inválido ou inacessível', 'error');
    };
    img.src = imageUrl;
}

// Show toast notification
function showToast(message, type) {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

// Load processors on page load
document.addEventListener('DOMContentLoaded', loadProcessors);
