document.addEventListener('DOMContentLoaded', () => {
    const bookForm = document.getElementById('add-book-form');
    const booksContainer = document.getElementById('books-container');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const bookDetails = document.getElementById('book-details');
    const bookInfo = document.getElementById('book-info');
    const purchaseDetails = document.getElementById('purchase-details');
    const closeDetails = document.getElementById('close-details');
    const categoryTabs = document.querySelectorAll('.tab-button');

    let books = JSON.parse(localStorage.getItem('books')) || [];
    let currentCategory = 'all';

    // Inicialização
    renderBooks();
    setupEventListeners();

    function setupEventListeners() {
        bookForm.addEventListener('submit', handleAddBook);
        searchButton.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
        closeDetails.addEventListener('click', () => {
            bookDetails.classList.remove('visible');
        });
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                categoryTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentCategory = tab.dataset.category;
                renderBooks();
            });
        });
    }

    function handleAddBook(e) {
        e.preventDefault();
        const title = document.getElementById('book-title').value;
        const author = document.getElementById('book-author').value;
        const description = document.getElementById('book-description').value;
        
        addBook(title, author, description);
        bookForm.reset();
    }

    function addBook(title, author, description = '') {
        const book = {
            id: Date.now(),
            title,
            author,
            description,
            read: false,
            favorite: false,
            image: 'https://via.placeholder.com/200x300?text=No+Image'
        };
        books.push(book);
        saveBooks();
        renderBooks();
    }

    function renderBooks() {
        booksContainer.innerHTML = '';
        const filteredBooks = filterBooksByCategory();
        
        filteredBooks.forEach(book => {
            const bookItem = createBookElement(book);
            booksContainer.appendChild(bookItem);
        });
    }

    function filterBooksByCategory() {
        switch (currentCategory) {
            case 'read':
                return books.filter(book => book.read);
            case 'unread':
                return books.filter(book => !book.read);
            case 'favorites':
                return books.filter(book => book.favorite);
            default:
                return books;
        }
    }

    function createBookElement(book) {
        const bookItem = document.createElement('div');
        bookItem.className = `book-item ${book.read ? 'read' : ''} ${book.favorite ? 'favorite' : ''}`;
        bookItem.innerHTML = `
            <img src="${book.image}" alt="${book.title}">
            <div class="book-item-content">
                <h3>${book.title}</h3>
                <p>${book.author}</p>
                <div class="book-actions">
                    <button onclick="toggleRead(${book.id})">
                        ${book.read ? 'Marcar como Não Lido' : 'Marcar como Lido'}
                    </button>
                    <button onclick="toggleFavorite(${book.id})">
                        ${book.favorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                    </button>
                    <button onclick="showBookDetails(${book.id})">Detalhes</button>
                    <button onclick="removeBook(${book.id})">Remover</button>
                </div>
            </div>
        `;
        return bookItem;
    }

    function handleSearch() {
        const query = searchInput.value.trim();
        if (query) {
            searchGoogleBooks(query);
        }
    }

    async function searchGoogleBooks(query) {
        try {
            // Primeiro, tentamos buscar livros em português
            const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&language=por`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Se não encontrarmos livros em português, buscamos em qualquer idioma
            if (!data.docs || data.docs.length === 0) {
                const responseAll = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
                const dataAll = await responseAll.json();
                
                if (dataAll.docs && dataAll.docs.length > 0) {
                    displaySearchResults(dataAll.docs, false); // false indica que não são livros em português
                } else {
                    alert('Nenhum livro encontrado com este título.');
                }
            } else {
                displaySearchResults(data.docs, true); // true indica que são livros em português
            }
        } catch (error) {
            console.error('Erro ao buscar livros:', error);
            alert('Erro ao buscar livros. Por favor, tente novamente mais tarde.');
        }
    }

    function displaySearchResults(items, isPortuguese) {
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results';
        
        items.slice(0, 5).forEach(book => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            
            // Limpar strings para evitar problemas com aspas
            const cleanTitle = (book.title || 'Sem título').replace(/["']/g, '');
            const cleanAuthor = (book.author_name?.[0] || 'Autor desconhecido').replace(/["']/g, '');
            const cleanDescription = (book.first_sentence?.[0] || 'Sem descrição disponível').replace(/["']/g, '');
            const coverId = book.cover_i;
            const imageUrl = coverId 
                ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
                : 'https://via.placeholder.com/100x150?text=Sem+Imagem';

            // Adicionar indicador de idioma
            const languageIndicator = isPortuguese ? 
                '<span class="language-tag">PT-BR</span>' : 
                '<span class="language-tag foreign">Original</span>';

            resultItem.innerHTML = `
                <img src="${imageUrl}" alt="${cleanTitle}">
                <div class="result-content">
                    <h3>${cleanTitle} ${languageIndicator}</h3>
                    <p><strong>Autor:</strong> ${cleanAuthor}</p>
                    <p><strong>Ano de Publicação:</strong> ${book.first_publish_year || 'Não informado'}</p>
                    <p><strong>Editora:</strong> ${book.publisher?.[0] || 'Não informada'}</p>
                    <p class="description">${cleanDescription}</p>
                    <button onclick="addBookFromSearch(\`${cleanTitle}\`, \`${cleanAuthor}\`, \`${cleanDescription}\`, \`${imageUrl}\`)">
                        Adicionar à Biblioteca
                    </button>
                </div>
            `;
            resultsContainer.appendChild(resultItem);
        });
        
        const bookDetails = document.getElementById('book-details');
        bookDetails.innerHTML = '';
        
        const detailsContent = document.createElement('div');
        detailsContent.className = 'book-details-content';
        detailsContent.innerHTML = `
            <h2>Resultados da Busca ${isPortuguese ? '(Livros em Português)' : '(Todos os Livros)'}</h2>
            <button id="close-details"><i class="fas fa-times"></i></button>
        `;
        detailsContent.appendChild(resultsContainer);
        
        bookDetails.appendChild(detailsContent);
        bookDetails.classList.add('visible');
        
        document.getElementById('close-details').addEventListener('click', () => {
            bookDetails.classList.remove('visible');
        });
    }

    function showBookDetails(bookId) {
        const book = books.find(b => b.id === bookId);
        if (book) {
            const bookDetails = document.getElementById('book-details');
            bookDetails.innerHTML = '';
            
            const detailsContent = document.createElement('div');
            detailsContent.className = 'book-details-content';
            
            detailsContent.innerHTML = `
                <h2>Detalhes do Livro</h2>
                <button id="close-details"><i class="fas fa-times"></i></button>
                <div class="book-details-grid">
                    <div class="book-cover">
                        <img src="${book.image}" alt="${book.title}">
                    </div>
                    <div class="book-info">
                        <h3>${book.title}</h3>
                        <p><strong>Autor:</strong> ${book.author}</p>
                        <p><strong>Descrição:</strong> ${book.description || 'Sem descrição disponível'}</p>
                        <p><strong>Status:</strong> ${book.read ? 'Lido' : 'Não Lido'}</p>
                        <p><strong>Favorito:</strong> ${book.favorite ? 'Sim' : 'Não'}</p>
                    </div>
                    <div id="purchase-info" class="purchase-info">
                        <h3>Informações para Compra</h3>
                        <div id="purchase-details">
                            <p>Carregando informações de compra...</p>
                        </div>
                    </div>
                </div>
            `;
            
            bookDetails.appendChild(detailsContent);
            bookDetails.classList.add('visible');
            
            document.getElementById('close-details').addEventListener('click', () => {
                bookDetails.classList.remove('visible');
            });
            
            // Buscar informações de compra
            searchPurchaseInfo(book.title);
        }
    }

    async function searchPurchaseInfo(title) {
        try {
            const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(title)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.docs?.[0]) {
                const book = data.docs[0];
                const workId = book.key;
                
                purchaseDetails.innerHTML = `
                    <p><strong>Disponível em:</strong></p>
                    <ul>
                        ${book.isbn ? `
                            <li>ISBN: ${book.isbn[0]}</li>
                        ` : ''}
                        <li>Open Library: <a href="https://openlibrary.org${workId}" target="_blank" rel="noopener">Ver no Open Library</a></li>
                        <li>Amazon: <a href="https://www.amazon.com.br/s?k=${encodeURIComponent(title)}" target="_blank" rel="noopener">Buscar na Amazon</a></li>
                        <li>Estante Virtual: <a href="https://www.estantevirtual.com.br/busca?q=${encodeURIComponent(title)}" target="_blank" rel="noopener">Buscar na Estante Virtual</a></li>
                    </ul>
                    <p><small>* Os preços podem variar de acordo com a edição e o vendedor</small></p>
                `;
            } else {
                purchaseDetails.innerHTML = '<p>Nenhuma informação de compra disponível.</p>';
            }
        } catch (error) {
            console.error('Erro ao buscar informações de compra:', error);
            purchaseDetails.innerHTML = '<p>Erro ao buscar informações de compra.</p>';
        }
    }

    function toggleRead(bookId) {
        const book = books.find(b => b.id === bookId);
        if (book) {
            book.read = !book.read;
            saveBooks();
            renderBooks();
        }
    }

    function toggleFavorite(bookId) {
        const book = books.find(b => b.id === bookId);
        if (book) {
            book.favorite = !book.favorite;
            saveBooks();
            renderBooks();
        }
    }

    function removeBook(bookId) {
        books = books.filter(b => b.id !== bookId);
        saveBooks();
        renderBooks();
    }

    function saveBooks() {
        localStorage.setItem('books', JSON.stringify(books));
    }

    // Funções globais para uso nos eventos inline
    window.toggleRead = toggleRead;
    window.toggleFavorite = toggleFavorite;
    window.removeBook = removeBook;
    window.showBookDetails = showBookDetails;
    window.addBookFromSearch = (title, author, description, image) => {
        addBook(title, author, description);
        const newBook = books[books.length - 1];
        newBook.image = image;
        saveBooks();
        renderBooks();
        bookDetails.classList.remove('visible');
    };
}); 