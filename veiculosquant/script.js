class Veiculo {
  constructor(quantidade_rodas, quantidade_portas = 0) {
    this.quantidade_rodas = quantidade_rodas;
    this.quantidade_portas = quantidade_portas;
  }

  rodar() {
    console.log(`O veículo com ${this.quantidade_rodas} rodas e ${this.quantidade_portas} portas está rodando.`);
  }

  tipoVeiculo() {
    return 'Veículo Genérico';
  }
}

class Carro extends Veiculo {
  constructor() {
    super(4, 4);
  }

  tipoVeiculo() {
    return 'Carro';
  }
}

class Moto extends Veiculo {
  constructor() {
    super(2, 0);
  }

  tipoVeiculo() {
    return 'Moto';
  }
}

function criarVeiculo() {
  const rodas = parseInt(document.getElementById('veiculoInput').value);
  const portas = parseInt(document.getElementById('portasInput').value);
  let veiculo;
  if (rodas === 2) {
    veiculo = new Moto();
  } else if (rodas === 4) {
    veiculo = new Carro();
  } else {
    veiculo = new Veiculo(rodas, portas);
  }
  const message = `Veículo criado: ${veiculo.tipoVeiculo()} com ${veiculo.quantidade_rodas} rodas e ${veiculo.quantidade_portas} portas.`;
  document.getElementById('message').textContent = message;
  veiculo.rodar();
}
