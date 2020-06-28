const express = require('express')
const router = express.Router()
const BitShares = require('btsdex')
const JsonFile = require('jsonfile')
const config = JsonFile.readFileSync('./config.json')
let acc = null

BitShares.connect(config.bts.node);
BitShares.subscribe('connected', startAfterConnected);

async function startAfterConnected() {
    acc = await BitShares.login(config.bts.registrar, config.bts.password)
    console.log('registrar', acc.account.id, acc.account.name)
}

async function registerAccount(options) {
    let result
    let params = {
        fee: {amount: 0, asset_id: "1.3.0"},
        name: options.name,
        registrar: acc.account.id,
        referrer: acc.account.id,
        referrer_percent: config.bts.referrer_percent * 100,
        owner: {
            weight_threshold: 1,
            account_auths: [],
            key_auths: [[options.owner, 1]],
            address_auths: []
        },
        active: {
            weight_threshold: 1,
            account_auths: [],
            key_auths: [[options.active, 1]],
            address_auths: []
        },
        options: {
            memo_key: options.memo,
            voting_account: "1.2.5",
            num_witness: 0,
            num_committee: 0,
            votes: []
        },
        extensions: []
    };

    let tx = acc.newTx()
    tx.account_create(params)
    try {
        let txResult = await tx.broadcast()
        console.log('txResult', txResult)
        result = {
            "status": "Account created",
            "account": {
                "name": options.name,
                "owner_key": options.owner,
                "active_key": options.active,
                "memo_key": options.memo,
            }
        }
    } catch (e) {
        result = e
    }

    return result

}


router.post('/v1/accounts', async function (req, res, next) {
    console.log('post', req.body)
    let result = false
    if (req.body.account) {
        result = await registerAccount({
            name: req.body.account.name,
            owner: req.body.account.owner_key,
            active: req.body.account.active_key,
            memo: req.body.account.memo_key,
            referrer: req.body.account.referrer,
        })
    }
    await res.json(result)
});

module.exports = router;
