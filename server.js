const express = require('express');
const client = require('prom-client');

const app = express();
// CORRIGIDO: A função é chamada para iniciar a coleta de métricas padrão.
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics(); // A função precisa ser executada com ()

const counter = new client.Counter({
  name: 'app_request_total',
  help: 'Contador de requisições recebidas'
});

app.get('/', (req, res) => {
  counter.inc();
  res.send('Prometheus + Grafana + Kubernetes');
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(3123, () => {
  console.log('Servidor rodando na porta 3123');
});