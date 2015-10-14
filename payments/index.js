var inherits = require('util').inherits;
var Service = require('../../node_modules/bitcore-node/lib/service');
var fs = require('fs');
var bitcore = require('bitcore');
var log;

function PaymentProcessor(options) {
  Service.call(this, options);
  log = this.node.log;

  this.html = fs.readFileSync(__dirname + '/index.html', 'utf8');
  this.amount = 12340000;

  // Use 1 HD Private Key and generate a unique address for every invoice
  this.hdPrivateKey = new bitcore.HDPrivateKey(this.node.network);
  this.addressIndex = 0;
}

inherits(PaymentProcessor, Service);

PaymentProcessor.dependencies = ['bitcoind', 'db', 'address'];

PaymentProcessor.prototype.setupRoutes = function(app, express) {
  var self = this;

  app.get('/', function(req, res, next) {
    res.status(200).send(self.filterHTML());
    self.addressIndex++;
  });
};

PaymentProcessor.prototype.filterHTML = function() {
  var btc = this.amount / 1e8;
  var address = this.hdPrivateKey.derive(this.addressIndex).privateKey.toAddress();
  var hash = address.hashBuffer.toString('hex');
  var transformed = this.html
    .replace(/{{amount}}/g, btc)
    .replace(/{{address}}/g, address)
    .replace(/{{hash}}/g, hash);
  return transformed;
};

module.exports = PaymentProcessor;