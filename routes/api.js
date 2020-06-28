const express = require('express')
const router = express.Router()
const BitShares = require('btsdex')
const JsonFile = require('jsonfile')
const config = JsonFile.readFileSync('./config.json')

BitShares.connect(config.bts.node);

/* GET home page. */
router.get('/', function(req, res, next) {
    res.json('index', { title: 'Express' })
});

module.exports = router;
