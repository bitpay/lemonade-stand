var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var bitcore = require('bitcore');
var bodyParser = require('body-parser');

function PaymentProcessor(options) {
  EventEmitter.call(this);

  this.node = options.node;

  this.invoiceHtml = fs.readFileSync(__dirname + '/invoice.html', 'utf8');

  // Use 1 HD Private Key and generate a unique address for every invoice
  this.hdPrivateKey = new bitcore.HDPrivateKey(this.node.network);
  this.addressIndex = 0;
}

inherits(PaymentProcessor, EventEmitter);

PaymentProcessor.dependencies = ['bitcoind', 'db', 'address'];

PaymentProcessor.prototype.start = function(callback) {
  setImmediate(callback);
};

PaymentProcessor.prototype.stop = function(callback) {
  setImmediate(callback);
};

PaymentProcessor.prototype.getAPIMethods = function() {
  return [];
};

PaymentProcessor.prototype.getPublishEvents = function() {
  return [];
};

PaymentProcessor.prototype.setupRoutes = function(app, express) {
  var self = this;

  app.use(bodyParser.urlencoded({extended: true}));

  app.use('/', express.static(__dirname + '/static'));

  app.post('/invoice', function(req, res, next) {
    self.addressIndex++;
    self.amount = parseFloat(req.body.amount) * 1e8;
    res.status(200).send(self.filterInvoiceHTML());
  });
};

PaymentProcessor.prototype.getRoutePrefix = function() {
  return 'payments';
};

PaymentProcessor.prototype.filterInvoiceHTML = function() {
  var btc = this.amount / 1e8;
  var address = this.hdPrivateKey.derive(this.addressIndex).privateKey.toAddress();
  var transformed = this.invoiceHtml
    .replace(/{{amount}}/g, btc)
    .replace(/{{address}}/g, address)
  return transformed;
};

module.exports = PaymentProcessor;