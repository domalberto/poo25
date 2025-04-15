// Configuração do IndexedDB
let db;
const request = indexedDB.open('GamesDB', 1);

request.onerror = (event) => {
    console.error('Erro ao abrir o banco de dados:', event.target.error);
};

request.onupgradeneeded = (event) => {
    const db = event.target.result;
    const objectStore = db.createObjectStore('games', { keyPath: 'id', autoIncrement: true });
    objectStore.createIndex('title', 'title', { unique: false });
    objectStore.createIndex('genre', 'genre', { unique: false });
};

request.onsuccess = (event) => {
    db = event.target.result;
    loadGames();
};

// Array para armazenar os games
let games = [];

// Elementos do DOM
const gameForm = document.getElementById('gameForm');
const gamesList = document.getElementById('gamesList');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

// Configuração da API RAWG
const API_KEY = '5a1ea826b1e149af8ca762d5b035103e';
const API_URL = 'https://api.rawg.io/api/games';

// Função para buscar games na API
async function searchGame() {
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) return;

    try {
        console.log('Buscando por:', searchTerm);
        const url = `${API_URL}?key=${API_KEY}&search=${encodeURIComponent(searchTerm)}`;
        console.log('URL da requisição:', url);
        
        const response = await fetch(url);
        console.log('Status da resposta:', response.status);
        
        const data = await response.json();
        console.log('Dados recebidos:', data);
        
        if (data.results && data.results.length > 0) {
            displaySearchResults(data.results);
        } else {
            searchResults.innerHTML = '<p>Nenhum game encontrado.</p>';
            console.log('Nenhum resultado encontrado');
        }
    } catch (error) {
        console.error('Erro ao buscar games:', error);
        searchResults.innerHTML = '<p class="error">Erro ao buscar games. Tente novamente.</p>';
    }
}

// Função para exibir resultados da busca
function displaySearchResults(results) {
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = '<p>Nenhum game encontrado.</p>';
        return;
    }

    results.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'search-result-card';
        gameCard.innerHTML = `
            <img src="${game.background_image || 'https://via.placeholder.com/300x150?text=No+Image'}" alt="${game.name}">
            <h3>${game.name}</h3>
            <p>Gênero: ${game.genres.map(g => g.name).join(', ')}</p>
            <button onclick="importGame(${game.id})">Importar</button>
        `;
        searchResults.appendChild(gameCard);
    });
}

// Função para importar um game da API
async function importGame(gameId) {
    try {
        const response = await fetch(`${API_URL}/${gameId}?key=${API_KEY}`);
        const gameData = await response.json();

        // Preencher o formulário com os dados do game
        document.getElementById('gameTitle').value = gameData.name;
        document.getElementById('gameGenre').value = gameData.genres.map(g => g.name).join(', ');
        document.getElementById('gameDescription').value = gameData.description_raw || 'Descrição não disponível';
        
        // Salvar a imagem do jogo em um campo oculto
        const imageInput = document.createElement('input');
        imageInput.type = 'hidden';
        imageInput.id = 'gameImage';
        imageInput.value = gameData.background_image || '';
        document.getElementById('gameForm').appendChild(imageInput);
        
        // Buscar requisitos mínimos reais
        let requirements = 'Requisitos não disponíveis';
        
        if (gameData.platforms && gameData.platforms.length > 0) {
            // Procurar requisitos para PC
            const pcPlatform = gameData.platforms.find(p => p.platform.name === 'PC');
            if (pcPlatform && pcPlatform.requirements) {
                requirements = `
                    Requisitos Mínimos:
                    ${pcPlatform.requirements.minimum || 'Não especificados'}

                    Requisitos Recomendados:
                    ${pcPlatform.requirements.recommended || 'Não especificados'}
                `;
            } else {
                // Se não encontrar requisitos específicos, mostrar informações gerais
                requirements = `
                    Plataformas disponíveis: ${gameData.platforms.map(p => p.platform.name).join(', ')}
                    Data de lançamento: ${gameData.released || 'Não especificada'}
                    Desenvolvedor: ${gameData.developers?.[0]?.name || 'Não especificado'}
                `;
            }
        }

        document.getElementById('gameRequirements').value = requirements;

        // Fechar os resultados da busca
        searchResults.innerHTML = '';
        searchInput.value = '';

        // Mudar para a aba de cadastros
        switchTab('games-list');

    } catch (error) {
        console.error('Erro ao importar game:', error);
        alert('Erro ao importar game. Tente novamente.');
    }
}

// Função para criar um novo game
function createGame(title, genre, description, requirements) {
    const game = {
        title,
        genre,
        description,
        requirements,
        image: document.getElementById('gameImage')?.value || ''
    };

    const transaction = db.transaction(['games'], 'readwrite');
    const objectStore = transaction.objectStore('games');
    const request = objectStore.add(game);

    request.onsuccess = () => {
        loadGames();
        // Remove o campo de imagem após salvar
        const imageInput = document.getElementById('gameImage');
        if (imageInput) {
            imageInput.remove();
        }
    };

    request.onerror = (event) => {
        console.error('Erro ao adicionar game:', event.target.error);
    };
}

// Função para ler e exibir os games
function renderGames() {
    gamesList.innerHTML = '';
    games.forEach(game => {
        const gameElement = document.createElement('div');
        gameElement.className = 'game-card';
        gameElement.innerHTML = `
            <div class="game-info">
                <h3>${game.title}</h3>
                <div class="game-details">
                    <div class="game-detail"><strong>Gênero:</strong> ${game.genre}</div>
                </div>
                <div class="game-description">
                    <strong>Descrição:</strong><br>
                    ${game.description}
                </div>
                <div class="game-requirements">
                    <strong>Requisitos Mínimos:</strong><br>
                    ${game.requirements}
                </div>
            </div>
            <div class="game-actions">
                <button class="edit-btn" onclick="editGame(${game.id})">Editar</button>
                <button class="delete-btn" onclick="deleteGame(${game.id})">Excluir</button>
            </div>
        `;

        // Adiciona a imagem do jogo se disponível
        if (game.image) {
            const imgElement = document.createElement('img');
            imgElement.className = 'game-image';
            imgElement.src = game.image;
            imgElement.alt = game.title;
            gameElement.insertBefore(imgElement, gameElement.firstChild);
        }

        // Adiciona o evento de clique para expandir/recolher
        gameElement.addEventListener('click', (e) => {
            // Não expande se o clique foi em um botão
            if (e.target.tagName === 'BUTTON') return;
            
            const isExpanded = gameElement.classList.contains('expanded');
            document.querySelectorAll('.game-card').forEach(card => {
                card.classList.remove('expanded');
            });
            
            if (!isExpanded) {
                gameElement.classList.add('expanded');
            }
        });

        gamesList.appendChild(gameElement);
    });
}

// Função para carregar games do IndexedDB
function loadGames() {
    const transaction = db.transaction(['games'], 'readonly');
    const objectStore = transaction.objectStore('games');
    const request = objectStore.getAll();

    request.onsuccess = (event) => {
        games = event.target.result;
        renderGames();
    };

    request.onerror = (event) => {
        console.error('Erro ao carregar games:', event.target.error);
    };
}

// Função para editar um game
function editGame(id) {
    const game = games.find(game => game.id === id);
    if (game) {
        const newTitle = prompt('Novo título:', game.title);
        const newGenre = prompt('Novo gênero:', game.genre);
        const newDescription = prompt('Nova descrição:', game.description);
        const newRequirements = prompt('Novos requisitos mínimos:', game.requirements);
        
        if (newTitle && newGenre && newDescription && newRequirements) {
            const updatedGame = {
                ...game,
                title: newTitle,
                genre: newGenre,
                description: newDescription,
                requirements: newRequirements
            };

            const transaction = db.transaction(['games'], 'readwrite');
            const objectStore = transaction.objectStore('games');
            const request = objectStore.put(updatedGame);

            request.onsuccess = () => {
                loadGames();
            };

            request.onerror = (event) => {
                console.error('Erro ao atualizar game:', event.target.error);
            };
        }
    }
}

// Função para excluir um game
function deleteGame(id) {
    if (confirm('Tem certeza que deseja excluir este game?')) {
        const transaction = db.transaction(['games'], 'readwrite');
        const objectStore = transaction.objectStore('games');
        const request = objectStore.delete(id);

        request.onsuccess = () => {
            loadGames();
        };

        request.onerror = (event) => {
            console.error('Erro ao excluir game:', event.target.error);
        };
    }
}

// Event listener para o formulário
gameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('gameTitle').value;
    const genre = document.getElementById('gameGenre').value;
    const description = document.getElementById('gameDescription').value;
    const requirements = document.getElementById('gameRequirements').value;
    
    createGame(title, genre, description, requirements);
    gameForm.reset();
});

// Event listener para o botão de busca
document.getElementById('searchButton').addEventListener('click', searchGame);

// Event listener para a tecla Enter no campo de busca
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchGame();
    }
});

// Função para alternar entre as abas
function switchTab(tabId) {
    // Esconde todos os conteúdos das abas
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove a classe active de todos os botões
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Mostra o conteúdo da aba selecionada
    document.getElementById(tabId).classList.add('active');
    
    // Ativa o botão da aba selecionada
    document.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add('active');
}

// Adiciona event listeners para os botões das abas
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        switchTab(tabId);
    });
});
