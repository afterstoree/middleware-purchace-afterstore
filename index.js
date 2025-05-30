const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
    const pedido = req.body;

    try {
        const capiPayload = {
            event_name: "Purchase",
            event_time: Math.floor(Date.now() / 1000),
            event_id: `pedido_${pedido.numero}`,
            action_source: "website",
            event_source_url: "https://afterstoree.com.br/checkout/success",
            user_data: {},
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

        res.status(200).json({ status: "Evento enviado com sucesso" });
    } catch (error) {
        console.error("Erro ao enviar para CAPI:", error.message);
        res.status(500).json({ error: "Erro ao enviar para o GTM Server" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Middleware ativo na porta ${PORT}`);
});
