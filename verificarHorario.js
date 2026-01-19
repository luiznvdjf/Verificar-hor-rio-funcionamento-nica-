/**
 * AJUDA: Converte string "DD/MM/YYYY HH:mm" para Objeto Date
 */
function converterStringParaData(dataString) {
  // Espera formato: "30/12/2025 10:15"
  const [dataPart, horaPart] = dataString.split(' ');
  const [dia, mes, ano] = dataPart.split('/').map(Number);
  const [hora, minuto] = horaPart.split(':').map(Number);

  // Mês no JS começa em 0 (Janeiro = 0, Dezembro = 11)
  return new Date(ano, mes - 1, dia, hora, minuto);
}

/**
 * Verifica horários (Sem consulta de API de feriados)
 * Útil para validações rápidas locais
 */
function verificarHorarioSimples(dataString) {
  const data = converterStringParaData(dataString); // Conversão aqui
  
  const diaSemana = data.getDay(); // 0 = Domingo ... 6 = Sábado
  const hora = data.getHours();
  const minutos = data.getMinutes();
  const horarioAtual = hora + (minutos / 60);

  // 1. Finais de semana
  if (diaSemana === 0 || diaSemana === 6) {
    return `[${dataString}] Fechado (Final de semana)`;
  }

  // 2. Regras de horário
  // Segunda a Quinta (1-4): 08:00 as 20:00
  if (diaSemana >= 1 && diaSemana <= 4) {
    if (horarioAtual >= 8 && horarioAtual < 20) {
      return `[${dataString}] Aberto`;
    }
  }

  // Sexta (5): 08:00 as 19:00
  if (diaSemana === 5) {
    if (horarioAtual >= 8 && horarioAtual < 19) {
      return `[${dataString}] Aberto`;
    }
  }

  return `[${dataString}] Fechado (Fora do horário)`;
}

/**
 * Consulta API para saber se é feriado
 */
async function ehFeriado(data) {
  try {
    const ano = data.getFullYear();
    // Formata para o padrão da API (YYYY-MM-DD)
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    const dataFormatada = `${ano}-${mes}-${dia}`;
    
    // API BrasilAPI
    const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
    const feriados = await response.json();
    
    // Procura a data na lista
    const feriadoEncontrado = feriados.find(f => f.date === dataFormatada);
    return feriadoEncontrado ? feriadoEncontrado.name : false;
    
  } catch (error) {
    console.error('Erro na API de feriados:', error);
    return false; 
  }
}

/**
 * Função Principal (Completa com Feriados)
 */
async function verificarHorarioCompleto(dataString) {
  const data = converterStringParaData(dataString);
  
  // 1. Verifica Feriado antes de tudo (requer await)
  const nomeFeriado = await ehFeriado(data);
  if (nomeFeriado) {
    return `[${dataString}] Fechado (Feriado: ${nomeFeriado})`;
  }

  // 2. Se não for feriado, reutiliza a lógica simples
  // Mas precisamos tratar o retorno da função simples para manter consistência
  return verificarHorarioSimples(dataString);
}

// ========== EXEMPLOS DE USO (NOVO FORMATO) ==========

(async () => {
  console.log("--- TESTES SÍNCRONOS (Apenas horário) ---");
  console.log(verificarHorarioSimples("30/12/2025 10:15")); // Terça - Aberto
  console.log(verificarHorarioSimples("30/12/2025 21:00")); // Terça - Fechado
  console.log(verificarHorarioSimples("28/12/2025 14:00")); // Domingo - Fechado

  console.log("\n--- TESTES ASSÍNCRONOS (Com Feriados) ---");
  
  // Exemplo: Natal
  const testeNatal = await verificarHorarioCompleto("25/12/2025 14:00");
  console.log(testeNatal); // Deve retornar Fechado (Natal)

  // Exemplo: Confraternização Universal
  const testeAnoNovo = await verificarHorarioCompleto("01/01/2026 09:00");
  console.log(testeAnoNovo); // Deve retornar Fechado (Confraternização Universal)
  
  // Exemplo: Dia comum
  const testeDiaComum = await verificarHorarioCompleto("05/06/2025 10:00");
  console.log(testeDiaComum); // Aberto
})();
