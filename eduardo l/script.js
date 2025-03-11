document.getElementById("userForm").addEventListener("submit", function(event) {
    event.preventDefault();
    let nome = document.getElementById("nome").value;
    
    if (nome.trim() !== "") {
        let li = document.createElement("li");
        li.textContent = nome;
        document.getElementById("userList").appendChild(li);
        document.getElementById("nome").value = "";
    }
});
