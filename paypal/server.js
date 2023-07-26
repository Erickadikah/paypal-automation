const express = require('express');
const paypal = require('@paypal/checkout-server-sdk');
require('dotenv').config();

const environment = process.env.NODE_ENV === 'production'
    ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
    : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);

const payPalClient = new paypal.core.PayPalHttpClient(environment);


const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());

const storeItems = new Map([
    [1, { price: 100, name: 'Learn React Today' }],
    [2, { price: 100, name: 'Learn CSS Today' }],
]);

app.get('/', (req, res) => {
    res.render('index.ejs', { paypalClientId: process.env.PAYPAL_CLIENT_ID });
});

app.post('/create-order', async (req, res) => {
    const request = new paypal.orders.OrdersCreateRequest();
    const total = req.body.items.reduce((sum, item) => {
        return sum + storeItems.get(item.id).price * item.quantity;
    }, 0);
    request.prefer("return=representation");
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [
            {
                amount: {
                    currency_code: 'USD',
                    value: total,
                    breakdown: {
                        item_total: {
                            currency_code: 'USD',
                            value: total,
                        }
                    }
                },
                items: req.body.items.map(item => {
                    const storeItem = storeItems.get(item.id);
                    return {
                        name: storeItem.name,
                        unit_amount: {
                            currency_code: 'USD',
                            value: storeItem.price,
                        },
                        quantity: item.quantity
                    }
                })

            }
        ]
    });

    try {
        const response = await payPalClient.execute(request);
        console.log(response.result)
        const orderID = response.result.id; // Extract the order ID from the response
        return res.json({ orderID }); // Send the orderID back to the client as JSON
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});