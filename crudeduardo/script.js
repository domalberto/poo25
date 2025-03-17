// Inicializa o IndexedDB
let db;
const request = indexedDB.open("meuBanco", 1);

request.onupgradeneeded = function (event) {
    let db = event.target.result;
    if (!db.objectStoreNames.contains("nomes")) {
        db.createObjectStore("nomes", { keyPath: "id", autoIncrement: true });
    }
};

request.onsuccess = function (event) {
    db = event.target.result;
    listarNomes(); // Carregar nomes na lista
};

request.onerror = function (event) {
    console.log("Erro ao abrir o banco: ", event.target.errorCode);
};

// Função para adicionar um nome
document.getElementById("form").addEventListener("submit", function (event) {
    event.preventDefault();
    let nome = document.getElementById("nome").value;
    
    let transaction = db.transaction(["nomes"], "readwrite");
    let store = transaction.objectStore("nomes");

    store.add({ nome });

    transaction.oncomplete = function () {
        document.getElementById("nome").value = "";
        listarNomes();
    };
});

// Função para listar os nomes na tela
function listarNomes() {
    let lista = document.getElementById("lista");
    lista.innerHTML = "";

    let transaction = db.transaction(["nomes"], "readonly");
    let store = transaction.objectStore("nomes");
    let request = store.openCursor();

    request.onsuccess = function (event) {
        let cursor = event.target.result;
        if (cursor) {
            let li = document.createElement("li");
            li.innerHTML = `${cursor.value.nome} 
                <button class="edit" onclick="editarNome(${cursor.value.id})">Editar</button>
                <button class="delete" onclick="deletarNome(${cursor.value.id})">Excluir</button>`;
            lista.appendChild(li);
            cursor.continue();
        }
    };
}

// Função para editar um nome
function editarNome(id) {
    let novoNome = prompt("Digite o novo nome:");
    if (novoNome) {
        let transaction = db.transaction(["nomes"], "readwrite");
        let store = transaction.objectStore("nomes");
        
        let request = store.get(id);
        request.onsuccess = function () {
            let data = request.result;
            data.nome = novoNome;
            store.put(data);
            listarNomes();
        };
    }
}

// Função para deletar um nome
function deletarNome(id) {
    let transaction = db.transaction(["nomes"], "readwrite");
    let store = transaction.objectStore("nomes");
    store.delete(id);
    
    transaction.oncomplete = function () {
        listarNomes();
    };
}
