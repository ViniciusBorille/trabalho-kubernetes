// Importa as bibliotecas para criar o servidor (express) e as métricas (prom-client).
const express = require('express');
const client = require('prom-client');

// Cria o servidor web.
const app = express();

// Ativa a coleta de métricas padrão (uso de CPU, memória, etc.).
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

// Cria uma métrica para contar o total de visitas.
const counter = new client.Counter({
  name: 'app_request_total',
  help: 'Contador de requisições recebidas'
});

// Cria uma métrica para medir o tempo entre visitas.
const timeSinceLastRequest = new client.Gauge({
  name: 'app_time_since_main_request_seconds',
  help: 'Tempo em segundos desde a última requisição para a rota principal (/)',
});

// Armazena a hora da última visita. Começa como nulo.
let lastRequestTimestamp = null;

// Define o que acontece quando alguém acessa a página principal.
app.get('/', (req, res) => {
  // Aumenta o contador de visitas em 1.
  counter.inc();

  // Pega a hora atual.
  const now = Date.now();

  // Se não for a primeira visita...
  if (lastRequestTimestamp) {
    // ...calcula a diferença de tempo em segundos.
    const diffInSeconds = (now - lastRequestTimestamp) / 1000;
    // ...e atualiza a métrica de tempo com esse valor.
    timeSinceLastRequest.set(diffInSeconds);
  }

  // Guarda a hora atual para a próxima visita.
  lastRequestTimestamp = now;
  
  // Envia uma resposta para o navegador.
  res.send('Prometheus + Grafana + Kubernetes');
});

// Cria a página '/metrics' onde o Prometheus vai ler os dados.
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Inicia o servidor na porta 3123.
app.listen(3123, () => {
  console.log('Servidor rodando na porta 3123');
});