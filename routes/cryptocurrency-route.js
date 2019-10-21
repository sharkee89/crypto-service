const express = require('express');
const router = express.Router();
const rp = require('request-promise');
const Cryptocurrency = require('../models/cryptocurrency');
const Cryptoprice = require('../models/cryptoprice');

router.get('/:crypto_symbol', (req, res, next) => {
    let marketShare = '';
    let price = '';
    let lastUpdated = '';
    const requestOptions = {
        method: 'GET',
        uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/map',
        qs: {
            'symbol': req.params.crypto_symbol
        },
        headers: {
            'X-CMC_PRO_API_KEY': 'de74ab32-a987-448c-8789-6dbf6d0bd309'
        },
        json: true,
        gzip: true
    };

    rp(requestOptions).then(response => {
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
            const cryptos = response.data.filter(crypto => crypto.symbol === req.params.crypto_symbol);
            marketShare = cryptos[0].quote.USD['market_cap'];
            price = cryptos[0].quote.USD.price;
            lastUpdated = cryptos[0]['last_updated'];
            const cryptoRes = new Cryptocurrency(
                cryptos[0].id,
                cryptos[0].name,
                cryptos[0].symbol,
                cryptos[0]['cmc_rank'],
                marketShare,
                price,
                lastUpdated
            );
            res.status(200).json(cryptoRes);
        }).catch((err) => {
            console.log(err);
        });  
    }).catch((err) => {
        res.status(err.statusCode).json(err.response.body.status);
    });
});

router.get('/:crypto_symbol/prices', (req, res, next) => {
    Cryptoprice.getAllCryptopriceBySymbol(req.params.crypto_symbol, (err, prices) => {
        if (err) {
            res.send(err);
        }
        res.status(200).json(prices);
    });
});

getLatestDataForSymbol = () => {

}

module.exports = router;