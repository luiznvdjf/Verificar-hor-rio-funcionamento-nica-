/**
 * Verifica se o horário atual está dentro do horário de funcionamento
 * Horário de funcionamento:
 * - Segunda a Quinta-feira: 08:00 às 20:00
 * - Sexta-feira: 08:00 às 19:00
 * - Finais de semana e feriados: FECHADO
 */

function verificarHorarioFuncionamento(dataHora) {
  // Converte a string de entrada para objeto Date
  const data = new Date(dataHora);
  
  // Extrai informações da data
  const diaSemana = data.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  const hora = data.getHours();
  const minutos = data.getMinutes();
  const horarioAtual = hora + minutos / 60; // Converte para decimal
  
  // Verifica se é final de semana
  if (diaSemana === 0 || diaSemana === 6) {
    return "Está fora do horário de funcionamento (final de semana)";
  }
  
  // Verifica se é feriado (opcional - você pode buscar via API)
  if (ehFeriado(data)) {
    return "Está fora do horário de funcionamento por ser feriado";
  }
  
  // Segunda a Quinta-feira (1-4): 08:00 às 20:00
  if (diaSemana >= 1 && diaSemana <= 4) {
    if (horarioAtual >= 8 && horarioAtual < 20) {
      return "Está dentro do horário de funcionamento";
    } else {
      return "Está fora do horário de funcionamento";
    }
  }
  
  // Sexta-feira (5): 08:00 às 19:00
  if (diaSemana === 5) {
    if (horarioAtual >= 8 && horarioAtual < 19) {
      return "Está dentro do horário de funcionamento";
    } else {
      return "Está fora do horário de funcionamento";
    }
  }
}

/**
 * Verifica se a data é feriado
 * Aqui você pode consumir a API de feriados do Brasil
 */
async function ehFeriado(data) {
  try {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    const dataFormatada = `${ano}-${mes}-${dia}`;
    
    // Consome a API de feriados
    const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
    const feriados = await response.json();
    
    // Verifica se a data está na lista de feriados
    return feriados.some(feriado => feriado.date === dataFormatada);
  } catch (error) {
    console.error('Erro ao buscar feriados:', error);
    return false; // Se houver erro, assume que não é feriado
  }
}

/**
 * Função assíncrona para verificar com feriados da API
 */
async function verificarHorarioComFeriados(dataHora) {
  const data = new Date(dataHora);
  const diaSemana = data.getDay();
  const hora = data.getHours();
  const minutos = data.getMinutes();
  const horarioAtual = hora + minutos / 60;
  
  // Verifica se é final de semana
  if (diaSemana === 0 || diaSemana === 6) {
    return "Está fora do horário de funcionamento (final de semana)";
  }
  
  // Verifica se é feriado via API
  const isFeriado = await ehFeriado(data);
  if (isFeriado) {
    return "Está fora do horário de funcionamento por ser feriado";
  }
  
  // Segunda a Quinta-feira (1-4): 08:00 às 20:00
  if (diaSemana >= 1 && diaSemana <= 4) {
    if (horarioAtual >= 8 && horarioAtual < 20) {
      return "Está dentro do horário de funcionamento";
    } else {
      return "Está fora do horário de funcionamento";
    }
  }
  
  // Sexta-feira (5): 08:00 às 19:00
  if (diaSemana === 5) {
    if (horarioAtual >= 8 && horarioAtual < 19) {
      return "Está dentro do horário de funcionamento";
    } else {
      return "Está fora do horário de funcionamento";
    }
  }
}

// ========== EXEMPLOS DE USO ==========

// Exemplo 1: Terça-feira dentro do horário
console.log("Exemplo 1:");
console.log("Entrada: 2025-12-30 10:15 (terça-feira)");
console.log("Resultado:", verificarHorarioFuncionamento("2025-12-30 10:15"));
console.log("");

// Exemplo 2: Terça-feira fora do horário
console.log("Exemplo 2:");
console.log("Entrada: 2025-12-30 19:10 (terça-feira)");
console.log("Resultado:", verificarHorarioFuncionamento("2025-12-30 19:10"));
console.log("");

// Exemplo 3: Domingo (final de semana)
console.log("Exemplo 3:");
console.log("Entrada: 2025-12-28 11:00 (domingo)");
console.log("Resultado:", verificarHorarioFuncionamento("2025-12-28 11:00"));
console.log("");

// Exemplo 4: Quinta-feira (Natal) - precisa usar a versão com API
console.log("Exemplo 4 (com API de feriados):");
console.log("Entrada: 2025-12-25 10:00 (quinta-feira - Natal)");
verificarHorarioComFeriados("2025-12-25 10:00").then(resultado => {
  console.log("Resultado:", resultado);
});
console.log("");

// Exemplo 5: Sexta-feira dentro do horário
console.log("Exemplo 5:");
console.log("Entrada: 2025-12-26 18:00 (sexta-feira)");
console.log("Resultado:", verificarHorarioFuncionamento("2025-12-26 18:00"));
console.log("");

// Exemplo 6: Sexta-feira após o horário
console.log("Exemplo 6:");
console.log("Entrada: 2025-12-26 19:30 (sexta-feira)");
console.log("Resultado:", verificarHorarioFuncionamento("2025-12-26 19:30"));
