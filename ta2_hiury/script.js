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

        // Criar objeto do game com os dados da API
        const game = {
            title: gameData.name,
            genre: gameData.genres.map(g => g.name).join(', '),
            description: gameData.description_raw || 'Descrição não disponível',
            imageUrl: gameData.background_image || '',
            requirements: gameData.platforms && gameData.platforms.length > 0 ? 
                (gameData.platforms.find(p => p.platform.name === 'PC')?.requirements ? 
                    `Requisitos Mínimos:\n${gameData.platforms.find(p => p.platform.name === 'PC').requirements.minimum || 'Não especificados'}\n\nRequisitos Recomendados:\n${gameData.platforms.find(p => p.platform.name === 'PC').requirements.recommended || 'Não especificados'}` :
                    `Plataformas disponíveis: ${gameData.platforms.map(p => p.platform.name).join(', ')}\nData de lançamento: ${gameData.released || 'Não especificada'}\nDesenvolvedor: ${gameData.developers?.[0]?.name || 'Não especificado'}`) :
                'Requisitos não disponíveis'
        };

        // Salvar o game no servidor
        const success = await addGame(game);
        if (success) {
            // Fechar os resultados da busca
            searchResults.innerHTML = '';
            searchInput.value = '';
            // Mudar para a aba de cadastros
            switchTab('games-list');
            // Recarregar a lista de games
            loadGames();
        }
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
gameForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const game = {
        title: document.getElementById('gameTitle').value,
        genre: document.getElementById('gameGenre').value,
        description: document.getElementById('gameDescription').value,
        requirements: document.getElementById('gameRequirements').value,
        imageUrl: document.getElementById('gameImage')?.value || ''
    };
    
    const success = await addGame(game);
    if (success) {
        gameForm.reset();
        loadGames();
    }
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

// Função para carregar jogos do servidor
async function loadGames() {
    try {
        const response = await fetch('http://localhost:3000/api/games');
        const games = await response.json();
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
            if (game.imageUrl) {
                const imgElement = document.createElement('img');
                imgElement.className = 'game-image';
                imgElement.src = game.imageUrl;
                imgElement.alt = game.title;
                gameElement.insertBefore(imgElement, gameElement.firstChild);
            }

            // Adiciona o evento de clique para expandir/recolher
            gameElement.addEventListener('click', (e) => {
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
    } catch (error) {
        console.error('Erro ao carregar jogos:', error);
        alert('Erro ao carregar jogos. Por favor, tente novamente.');
    }
}

// Função para adicionar um novo jogo
async function addGame(game) {
    try {
        const response = await fetch('http://localhost:3000/api/games', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(game)
        });
        const newGame = await response.json();
        return true;
    } catch (error) {
        console.error('Erro ao adicionar jogo:', error);
        return false;
    }
}

// Função para atualizar um jogo
async function updateGame(id, game) {
    try {
        const response = await fetch(`http://localhost:3000/api/games/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(game)
        });
        await response.json();
        return true;
    } catch (error) {
        console.error('Erro ao atualizar jogo:', error);
        return false;
    }
}

// Função para excluir um jogo
async function deleteGame(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/games/${id}`, {
            method: 'DELETE'
        });
        await response.json();
        return true;
    } catch (error) {
        console.error('Erro ao excluir jogo:', error);
        return false;
    }
}

// Carregar jogos ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadGames();
});
