document.getElementById('cadastroForm').addEventListener('submit', function(event) {
    event.preventDefault();
    let nome = document.getElementById('nome').value;
    let email = document.getElementById('email').value;
    alert(`Usuário ${nome} cadastrado com sucesso!`);
});
