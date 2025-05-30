
import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: "1mb" }));

app.post("/p", async (req, res) => {
  try {
    const token = req.body?.token;
    const ed_email = req.body?.cliente?.email || null;
    const ed_phone = req.body?.cliente?.telefone_celular || null;
    const ed_user_agent = req.headers["user-agent"] || null;
    const event_id = `${req.body?.id || ""}_${Date.now()}`;
    const timestamp = Math.floor(Date.now() / 1000);
    const page_location = "https://afterstoree.com.br/checkout/concluido";
    const value = req.body?.valor_total || 0;

    if (token !== "after_webhook_token_001") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const GTM_SERVER_URL = process.env.GTM_SERVER_URL;
    const META_PIXEL_ID = process.env.META_PIXEL_ID;

    if (!GTM_SERVER_URL || !META_PIXEL_ID) {
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    const payload = {
      data: [
        {
          event_name: "Purchase",
          event_time: timestamp,
          action_source: "website",
          event_source_url: page_location,
          user_data: {
            em: [ed_email],
            ph: [ed_phone],
            client_user_agent: ed_user_agent,
            fbc: req.body?.fbc || "",
            fbp: req.body?.fbp || "",
          },
          custom_data: {
            currency: "BRL",
            value: value,
          },
          event_id: event_id,
        },
      ],
    };

    const response = await axios.post(
      `${GTM_SERVER_URL}/p?pixel_id=${META_PIXEL_ID}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json({
      message: "Evento enviado com sucesso",
      event_id,
      data: response.data,
    });
  } catch (error) {
    console.error("Erro ao processar o webhook:", error?.response?.data || error.message);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
