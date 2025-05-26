const form = document.getElementById("form-aluno");
const input = document.getElementById("nome");
const lista = document.getElementById("lista-alunos");
let editId = null;

function carregarAlunos() {
  fetch("/alunos")
    .then(res => res.json())
    .then(data => {
      lista.innerHTML = "";
      data.forEach(aluno => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span>${aluno.nome}</span>
          <div>
            <button onclick="editar(${aluno.id}, '${aluno.nome}')">✏️</button>
            <button onclick="remover(${aluno.id})">🗑️</button>
          </div>
        `;
        lista.appendChild(li);
      });
    });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = input.value.trim();
  if (!nome) return;

  const url = editId ? `/alunos/${editId}` : "/alunos";
  const method = editId ? "PUT" : "POST";

  fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome })
  }).then(() => {
    input.value = "";
    editId = null;
    carregarAlunos();
  });
});

function editar(id, nome) {
  input.value = nome;
  editId = id;
}

function remover(id) {
  fetch(`/alunos/${id}`, { method: "DELETE" }).then(carregarAlunos);
}

carregarAlunos();
