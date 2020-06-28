const express = require('express')
const router = express.Router()
const BitShares = require('btsdex')
const JsonFile = require('jsonfile')
const config = JsonFile.readFileSync('./config.json')
let acc = null
BitShares.connect(config.bts.node, startAfterConnected);

async function startAfterConnected() {
    acc = await BitShares.login(config.bts.account, config.bts.password)
    console.log('acc', acc)
}

async function registerAccount(options) {
    let result

    return result

}


router.post('/v1/accounts', async function(req, res, next) {
    console.log('post',req.body)
    let result = false
    if (req.body.account) {
        result = await registerAccount({
            name: req.body.account.name,
            owner: req.body.account.owner_key,
            active: req.body.account.active_key,
            memo: req.body.account.memo_key,
        })
    }
    await res.json(result)
});

module.exports = router;
