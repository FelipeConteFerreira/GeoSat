export function somenteDigitos(valor) {
  return String(valor ?? '').replace(/\D/g, '');
}

export function limitarTexto(valor, max) {
  return String(valor ?? '').trim().slice(0, max);
}

export function normalizarUf(estado) {
  return String(estado ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 2);
}

export function montarBodyProdutor({ nome, cpf, telefone, email }) {
  const nrCpf = somenteDigitos(cpf);
  const dsEmail = limitarTexto(email, 150);
  const body = {
    nmNome: limitarTexto(nome, 100),
    nrCpf,
    dsEmail,
  };

  const tel = somenteDigitos(telefone).slice(0, 15);
  if (tel) {
    body.nrTelefone = tel;
  }

  return body;
}

export function montarBodyPropriedade({ propriedade, municipio, estado }) {
  return {
    nmNome: limitarTexto(propriedade, 100),
    nmMunicipio: limitarTexto(municipio, 100),
    sgEstado: normalizarUf(estado),
    nrAreaHa: 1.0,
  };
}

export function montarBodyTalhao({ idPropriedade, nome, cultura }) {
  return {
    idPropriedade: Number(idPropriedade),
    nmNome: limitarTexto(nome, 100),
    dsCultura: limitarTexto(cultura, 50),
    nrAreaHa: 1.0,
  };
}

export function montarBodySensor({ idTalhao, identificador, localizacao }) {
  const body = {
    idTalhao: Number(idTalhao),
    cdIdentificadorHw: limitarTexto(identificador, 50),
  };

  const loc = limitarTexto(localizacao, 200);
  if (loc) {
    body.dsLocalizacao = loc;
  }

  return body;
}

export function montarBodyLeitura({ idSensor, temperatura, umidade }) {
  const temp = Math.min(70, Math.max(-50, parseFloat(String(temperatura).replace(',', '.'))));
  const umid = Math.min(100, Math.max(0, parseFloat(String(umidade).replace(',', '.'))));

  const agora = new Date();
  const dtLeitura = agora.toISOString().slice(0, 19);

  return {
    idSensor: Number(idSensor),
    dtLeitura,
    nrTempAr: temp,
    nrUmidadeSolo: umid,
    nrLuminosidade: 500,
  };
}

export function validarPerfilFormulario({ nome, email, cpf, propriedade, municipio, estado, cultivo }) {
  const erros = [];

  if (!limitarTexto(nome, 100)) erros.push('Nome é obrigatório (máx. 100 caracteres).');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limitarTexto(email, 150))) {
    erros.push('E-mail inválido.');
  }
  if (!/^\d{11}$/.test(somenteDigitos(cpf))) {
    erros.push('CPF deve ter exatamente 11 dígitos numéricos.');
  }
  if (!limitarTexto(propriedade, 100)) erros.push('Propriedade é obrigatória (máx. 100 caracteres).');
  if (!limitarTexto(municipio, 100)) erros.push('Município é obrigatório (máx. 100 caracteres).');
  if (!/^[A-Z]{2}$/.test(normalizarUf(estado))) {
    erros.push('Estado deve ser UF com 2 letras (ex: SP).');
  }
  if (!limitarTexto(cultivo, 50)) erros.push('Cultivo é obrigatório (máx. 50 caracteres).');

  return erros;
}
