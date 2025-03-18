let db;
const request = indexedDB.open('crudDB', 1);

request.onupgradeneeded = (event) => {
    db = event.target.result;
    db.createObjectStore('items', { keyPath: 'id', autoIncrement: true });
};

request.onsuccess = (event) => {
    db = event.target.result;
    loadData();
};

request.onerror = (event) => {
    console.error('Erro ao abrir o IndexedDB:', event);
};

function loadData() {
    const transaction = db.transaction('items', 'readonly');
    const store = transaction.objectStore('items');
    const request = store.getAll();

    request.onsuccess = (event) => {
        const items = event.target.result;
        const dataList = document.getElementById('dataList');
        dataList.innerHTML = '';
        items.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${item.value}</span> <button class='edit' onclick='editItem(${item.id})'>Editar</button> <button class='delete' onclick='deleteItem(${item.id})'>Excluir</button>`;
            dataList.appendChild(li);
        });
    };
}

function editItem(id) {
    const transaction = db.transaction('items', 'readwrite');
    const store = transaction.objectStore('items');
    const request = store.get(id);

    request.onsuccess = (event) => {
        const item = event.target.result;
        const newValue = prompt('Editar valor:', item.value);
        if (newValue) {
            item.value = newValue;
            store.put(item);
            loadData();
        }
    };
}

function deleteItem(id) {
    const transaction = db.transaction('items', 'readwrite');
    const store = transaction.objectStore('items');
    store.delete(id);
    loadData();
}

document.getElementById('dataForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const dataInput = document.getElementById('dataInput');
    const transaction = db.transaction('items', 'readwrite');
    const store = transaction.objectStore('items');
    store.add({ value: dataInput.value });
    dataInput.value = '';
    loadData();
});
