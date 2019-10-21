const mongoose = require('mongoose');

const cryptopriceSchema = new mongoose.Schema({
    symbol: String,
    name: String,
    price: Number,
    date: Date
});

const Cryptoprice = module.exports = mongoose.model('Cryptoprice', cryptopriceSchema);

module.exports.getAllCryptopriceBySymbol = (symbol, callback) => {
    Cryptoprice.find({ symbol: symbol }).sort('-date').exec(callback);
}

module.exports.createCryptoprice = (cryptoprice, callback) => {
    Cryptoprice.create(cryptoprice, callback);
}