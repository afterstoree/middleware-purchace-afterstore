import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
  const pedido = req.body;

  try {
    const capiPayload = {
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      event_id: `pedido_${pedido.numero}`,
      action_source: "website",
      event_source_url: "https://afterstoree.com.br/checkout/success",
      user_data: {
        em: [pedido.cliente?.email],
        ph: [pedido.cliente?.telefone_celular]
      },
      custom_data: {
        value: pedido.valor_total,
        currency: "BRL"
      }
    };

    await axios.post(
      `${process.env.GTM_SERVER_URL}?pixel_id=${process.env.META_PIXEL_ID}`,
      capiPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.STAPE_API_KEY}`
        }
      }
    );

    res.status(200).json({ status: 'Evento enviado com sucesso' });
  } catch (error) {
    console.error('Erro ao enviar para o GTM Server:', error.message);
    res.status(500).json({ error: 'Erro interno ao processar o webhook' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Middleware ativo na porta ${PORT}`);
});
