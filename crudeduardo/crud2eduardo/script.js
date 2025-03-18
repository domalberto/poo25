// IndexedDB setup
let db;
const dbName = 'namesDB';
const storeName = 'names';
let names = [];

const request = indexedDB.open(dbName, 1);

request.onerror = (event) => {
    console.error('Database error:', event.target.error);
};

request.onupgradeneeded = (event) => {
    db = event.target.result;
    if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
    }
};

request.onsuccess = (event) => {
    db = event.target.result;
    loadNames();
};

// DOM Elements
const nameInput = document.getElementById('nameInput');
const addButton = document.getElementById('addButton');
const nameList = document.getElementById('nameList');
const editIndex = document.getElementById('editIndex');

function loadNames() {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
        names = getAllRequest.result;
        renderNames();
    };
}

function renderNames() {
    nameList.innerHTML = '';
    names.forEach((nameObj) => {
        const card = document.createElement('div');
        card.className = 'name-card';
        card.innerHTML = `
            <div class="name-content">${nameObj.name}</div>
            <div class="button-group">
                <button class="edit-btn" onclick="editName(${nameObj.id})">Editar</button>
                <button class="delete-btn" onclick="deleteName(${nameObj.id})">Apagar</button>
            </div>
        `;
        nameList.appendChild(card);
    });
}

function addName() {
    const name = nameInput.value.trim();
    if (!name) return;

    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    if (editIndex.value !== '') {
        // Editing existing name
        const id = parseInt(editIndex.value);
        const nameObj = { id: id, name: name };
        const request = store.put(nameObj);

        request.onsuccess = () => {
            editIndex.value = '';
            addButton.textContent = 'Adicionar';
            nameInput.value = '';
            loadNames();
        };
    } else {
        // Adding new name
        const nameObj = { name: name };
        const request = store.add(nameObj);

        request.onsuccess = () => {
            nameInput.value = '';
            loadNames();
        };
    }

    transaction.onerror = (event) => {
        console.error('Error in transaction:', event.target.error);
    };
}

function editName(id) {
    const nameObj = names.find(n => n.id === id);
    if (nameObj) {
        nameInput.value = nameObj.name;
        editIndex.value = id;
        addButton.textContent = 'Salvar';
        nameInput.focus();
    }
}

function deleteName(id) {
    if (confirm('Tem certeza que deseja apagar este nome?')) {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onsuccess = () => {
            loadNames();
        };

        transaction.onerror = (event) => {
            console.error('Error deleting:', event.target.error);
        };
    }
}

// Event Listeners
addButton.addEventListener('click', addName);
nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addName();
});
