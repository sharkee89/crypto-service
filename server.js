const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const rp = require('request-promise');
const mongoose = require('mongoose');
const database = require('./config/database');

const Cryptoprice = require('./models/cryptoprice');

var swaggerUi = require('swagger-ui-express');
var swaggerDocument = require('./swagger/swagger.json');

// Connect to database
mongoose.connect(database.url, {
    useNewUrlParser: true
});

// On Connection
mongoose.connection.on('connected', () => {
    console.log('Connected to database ' + database.url);
});

// On Connection Error
mongoose.connection.on('error', (err) => {
    console.log('Database error: ' + err);
});

const app = express();

const port = 3000;
const cryptoSymbols = ['BTC', 'ETH', 'SFT', 'BLU'];

// Routes 
const cryptocurrencyRoute = require('./routes/cryptocurrency-route');

app.use(cors());

app.use(bodyParser.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/cryptocurrencies', cryptocurrencyRoute);

// // Return index page on default route for the application
app.get('/', function (req, res) {
    res.redirect('/api-docs');
});

setInterval(() => {
    const requestOptions = {
        method: 'GET',
        uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
        qs: {
            'start': 1,
            'limit': 5000,
            'convert': 'USD'
        },
        headers: {
            'X-CMC_PRO_API_KEY': 'de74ab32-a987-448c-8789-6dbf6d0bd309'
        },
        json: true,
        gzip: true
    };

    rp(requestOptions).then(response => {
        const cryptos = response.data.filter(crypto => cryptoSymbols.includes(crypto.symbol));
        cryptos.forEach((c) => {
            Cryptoprice.createCryptoprice({
                name: c.name,
                symbol: c.symbol,
                price: c.quote.USD.price,
                date: new Date()
            }, (err, crr) => {
                if (err) {
                    console.log(err);
                }
                console.log(`Success Saved: ${c.symbol} - ${new Date()}`);
            })
        });
    }).catch((err) => {
        console.log(err);
    });  
}, 300000);

setInterval(() => {
    Cryptoprice.find({}).sort('-date').exec(function(err, docs) {
        console.log(docs.length);
        if (docs.length > 28) {
            for (let i = 28; i < docs.length; i++) {
                Cryptoprice.remove({_id: docs[i]['_id']}, () => {
                    console.log('remove');
                });
            }
        }
    });
}, 28 * 60 * 1000);

// Starting server on decided port
app.listen(process.env.PORT || port);

console.log('Server started on port: ' + port);