export function evaluateTemperatura(temperatura) {
  const temp = parseFloat(String(temperatura).replace(',', '.'));

  if (isNaN(temp)) {
    return {
      status: 'invalido',
      message: 'Informe uma temperatura válida',
      color: '#757575',
    };
  }

  if (temp < 10) {
    return {
      status: 'critico',
      message: 'Perda total da plantação em casos extremos',
      color: '#B71C1C',
    };
  }

  if (temp > 30) {
    return {
      status: 'seca',
      message: 'Risco de seca detectado',
      color: '#E65100',
    };
  }

  if (temp >= 20 && temp <= 30) {
    return {
      status: 'normal',
      message: 'Temperatura normal',
      color: '#2E7D32',
    };
  }

  return {
    status: 'baixa',
    message: 'Temperatura abaixo do ideal (faixa normal: 20°C a 30°C)',
    color: '#F57F17',
  };
}
