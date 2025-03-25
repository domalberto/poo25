class Veiculo {
    constructor(quantidade_rodas) {
        this.quantidade_rodas = quantidade_rodas;
    }

    rodar() {
        return `Veículo genérico com ${this.quantidade_rodas} rodas está rodando`;
    }

    buzinar() {
        return 'Beep beep!';
    }
}

class Carro extends Veiculo {
    constructor() {
        super(4);
    }

    rodar() {
        return `Carro com ${this.quantidade_rodas} rodas está acelerando na pista`;
    }

    drift() {
        return 'Carro está fazendo drift!';
    }
}

class Moto extends Veiculo {
    constructor() {
        super(2);
    }

    rodar() {
        return `Moto com ${this.quantidade_rodas} rodas está pilotando na estrada`;
    }
}

class Caminhao extends Veiculo {
    constructor() {
        super(6);
    }

    rodar() {
        return `Caminhão com ${this.quantidade_rodas} rodas está transportando carga`;
    }

    buzinar() {
        return 'Vroom vroom!';
    }
}

let veiculos = [];

function criarVeiculo() {
    const rodas = parseInt(document.getElementById('rodas').value);
    const resultado = document.getElementById('resultado');
    
    if (rodas !== 2 && rodas !== 4 && rodas !== 6) {
        resultado.textContent = 'Por favor, insira 2 para moto, 4 para carro ou 6 para caminhão';
        return;
    }

    let veiculo;
    if (rodas === 2) {
        veiculo = new Moto();
    } else if (rodas === 4) {
        veiculo = new Carro();
    } else {
        veiculo = new Caminhao();
    }

    veiculos.push(veiculo);
    resultado.innerHTML += `<br>• ${veiculo.constructor.name}:<br>`;
    resultado.innerHTML += `${veiculo.rodar()}<br>`;
    resultado.innerHTML += `${veiculo.buzinar()}<br><br>`;

    if (veiculo instanceof Carro) {
        resultado.innerHTML += `${veiculo.drift()}<br><br>`;
    }

    // Exibir todos os veículos criados
    resultado.innerHTML += '<br>Veículos criados:<br>';
    veiculos.forEach(v => {
        resultado.innerHTML += `<br>• ${v.constructor.name}:<br>`;
        resultado.innerHTML += `${v.rodar()}<br>`;
        resultado.innerHTML += `${v.buzinar()}<br><br>`;
    });

    resultado.innerHTML += `<br>Total de veículos criados: ${veiculos.length}<br>`;
}