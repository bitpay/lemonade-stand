'use strict';

var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var bitcore = require('bitcore-lib');
var bodyParser = require('body-parser');

function LemonadeStand(options) {
  EventEmitter.call(this);

  this.node = options.node;
  this.log = this.node.log;

  this.invoiceHtml = fs.readFileSync(__dirname + '/invoice.html', 'utf8');
  this.amount = 12340000;

  // Use 1 HD Private Key and generate a unique address for every invoice
  this.hdPrivateKey = new bitcore.HDPrivateKey(this.node.network);
  this.log.info('Using key:', this.hdPrivateKey);
  this.addressIndex = 0;
}

LemonadeStand.dependencies = ['bitcoind'];

LemonadeStand.prototype.start = function(callback) {
  setImmediate(callback);
};

LemonadeStand.prototype.stop = function(callback) {
  setImmediate(callback);
};

LemonadeStand.prototype.getAPIMethods = function() {
  return [];
};

LemonadeStand.prototype.getPublishEvents = function() {
  return [];
};

LemonadeStand.prototype.setupRoutes = function(app, express) {
  var self = this;

  app.use(bodyParser.urlencoded({extended: true}));

  app.use('/', express.static(__dirname + '/static'));

  app.post('/invoice', function(req, res, next) {
    self.addressIndex++;
    self.amount = parseFloat(req.body.amount) * 1e8;
    res.status(200).send(self.filterInvoiceHTML());
  });
};

LemonadeStand.prototype.getRoutePrefix = function() {
  return 'lemonade-stand';
};

LemonadeStand.prototype.filterInvoiceHTML = function() {
  var btc = this.amount / 1e8;
  var address = this.hdPrivateKey.derive(this.addressIndex).privateKey.toAddress();
  this.log.info('New invoice with address:', address);
  var hash = address.hashBuffer.toString('hex');
  var transformed = this.invoiceHtml
    .replace(/{{amount}}/g, btc)
    .replace(/{{address}}/g, address)
    .replace(/{{hash}}/g, hash)
    .replace(/{{baseUrl}}/g, '/' + this.getRoutePrefix() + '/');
  return transformed;
};

module.exports = LemonadeStand;
