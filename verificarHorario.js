
function converterStringParaData(dataString) {

  const [dataPart, horaPart] = dataString.split(' ');
  const [dia, mes, ano] = dataPart.split('/').map(Number);
  const [hora, minuto] = horaPart.split(':').map(Number);

  
  return new Date(ano, mes - 1, dia, hora, minuto);
}

function verificarHorarioSimples(dataString) {
  const data = converterStringParaData(dataString); 
  
  const diaSemana = data.getDay(); 
  const hora = data.getHours();
  const minutos = data.getMinutes();
  const horarioAtual = hora + (minutos / 60);


  if (diaSemana === 0 || diaSemana === 6) {
    return `[${dataString}] Fechado (Final de semana)`;
  }


  if (diaSemana >= 1 && diaSemana <= 4) {
    if (horarioAtual >= 8 && horarioAtual < 20) {
      return `[${dataString}] Aberto`;
    }
  }

  if (diaSemana === 5) {
    if (horarioAtual >= 8 && horarioAtual < 19) {
      return `[${dataString}] Aberto`;
    }
  }

  return `[${dataString}] Fechado (Fora do horário)`;
}


async function ehFeriado(data) {
  try {
    const ano = data.getFullYear();
   
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    const dataFormatada = `${ano}-${mes}-${dia}`;
    
    const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
    const feriados = await response.json();
    
  
    const feriadoEncontrado = feriados.find(f => f.date === dataFormatada);
    return feriadoEncontrado ? feriadoEncontrado.name : false;
    
  } catch (error) {
    console.error('Erro na API de feriados:', error);
    return false; 
  }
}


async function verificarHorarioCompleto(dataString) {
  const data = converterStringParaData(dataString);
  
 
  const nomeFeriado = await ehFeriado(data);
  if (nomeFeriado) {
    return `[${dataString}] Fechado (Feriado: ${nomeFeriado})`;
  }


  return verificarHorarioSimples(dataString);
}



(async () => {
  console.log("--- TESTES SÍNCRONOS (Apenas horário) ---");
  console.log(verificarHorarioSimples("30/12/2025 10:15")); // Terça - Aberto
  console.log(verificarHorarioSimples("30/12/2025 21:00")); // Terça - Fechado
  console.log(verificarHorarioSimples("28/12/2025 14:00")); // Domingo - Fechado

  console.log("\n--- TESTES ASSÍNCRONOS (Com Feriados) ---");
  

  const testeNatal = await verificarHorarioCompleto("25/12/2025 14:00");
  console.log(testeNatal); 

  const testeAnoNovo = await verificarHorarioCompleto("01/01/2026 09:00");
  console.log(testeAnoNovo); 
  
  
  const testeDiaComum = await verificarHorarioCompleto("05/06/2025 10:00");
  console.log(testeDiaComum); 
})();
