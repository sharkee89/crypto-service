class Cryptocurrency {
    constructor(id, name, symbol, rank, marketShare, price, lastUpdated) {
        this.id = id;
        this.name = name;
        this.symbol = symbol;
        this.rank = rank;
        this.marketShare = marketShare;
        this.price = price;
        this.lastUpdated = lastUpdated;
    }
}

module.exports = Cryptocurrency;