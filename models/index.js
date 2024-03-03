const { counterModel } = require('./counter.model');
module.exports = {
    user                : require('./user.model'),
    userProgress        : require('./userProgress.model'),
    orderSummary        : require('./orderSummary.model'),
    transactionHistory  : require('./transactionHistory.model'),
    company             : require('./company.model'),
    products            : require('./products.model'),
    invoiceCounter      : require('./invoiceCounter.model'),
    counter             : counterModel,
};