const express = require('express');
const IntaSend = require('intasend-node');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const intasend = new IntaSend(
  process.env.INTASEND_PUBLISHABLE_KEY,
  process.env.INTASEND_SECRET_KEY,
  process.env.IS_PRODUCTION === 'true' ? false : true 
);

app.get('/api/health', (req, res) => {
  if (!process.env.INTASEND_SECRET_KEY) {
    return res.status(500).json({ error: 'Keys Missing' });
  }
  res.json({ status: 'active' });
});

app.post('/api/pay', async (req, res) => {
  try {
    const { amount, phone } = req.body;
    const response = await intasend.collection().mpesaStkPush({
      phone_number: phone,
      amount: amount,
      api_ref: "WALLET_TX"
    });
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/status/:invoice_id', async (req, res) => {
  try {
    const { invoice_id } = req.params;
    const response = await intasend.collection().status(invoice_id);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Ready'));
