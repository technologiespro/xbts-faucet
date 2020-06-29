const express = require('express')
const router = express.Router()
const BitShares = require('btsdex')
const JsonFile = require('jsonfile')
const level = require('level')
const config = JsonFile.readFileSync('./config.json')
const db = level('.faucet', {valueEncoding: 'json'})
const DbUtils = require('../modules/dbUtils')
const dbu = new DbUtils()
const crypto = require('crypto');

// db
// 0x - reserved for counters
// 1x - success registrations

let acc = null
let latestRegs = {}

BitShares.connect(config.bts.node);
BitShares.subscribe('connected', startAfterConnected);

async function startAfterConnected() {
    acc = await BitShares.login(config.bts.registrar, config.bts.password)
    console.log('registrar', acc.account.id, acc.account.name)
}

async function registerAccount(options, ip) {
    let isAllowReg = true
    let result = {
        "status": "Error registration account",
        "account": {
            "name": null,
            "owner_key": null,
            "active_key": null,
            "memo_key": null,
        }
    }

    if (latestRegs[ip]) {
        let time = Math.floor(Date.now() / 1000) - config.bts.timeoutIp
        isAllowReg = time > latestRegs[ip].time
        console.log('hold sec', latestRegs[ip].time - time)
    }

    console.log('isAllowReg', isAllowReg)

    if (!isAllowReg) {
        result = {"error": {"base": ["registration from 1 ip " + config.bts.timeoutIp / 60 + " min"]}}
        return result
    }

    latestRegs[ip] = {
        time: Math.floor(Date.now() / 1000),
        name: options.name,
    }

    if (config.bts.broadcastTx && isAllowReg) {
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
            console.log('tx Result', txResult[0].trx)
            if (txResult[0].id) {
                result = {
                    "status": "Account created",
                    "account": {
                        "name": options.name,
                        "owner_key": options.owner,
                        "active_key": options.active,
                        "memo_key": options.memo,
                    }
                }
                await db.put('1x' + options.name, {
                    "name": options.name,
                    "time": new Date.now(),
                })
            }
        } catch (e) {
            //console.log('e', e)
            result = {"error": {"base": ["Error registration new account"]}}
        }
    } else {
        result = {"error": {"base": ["Broadcast Tx off"]}}
    }
    return result
}

//test ip
router.get('/v1/ip', async function (req, res, next) {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    await res.json({
        ip: ip,
    })
})

router.get('/v1/latest', async function (req, res, next) {
    await res.json(latestRegs)
})

router.post('/v1/accounts', async function (req, res, next) {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let hashIp = crypto.createHash('md5').update(ip).digest("hex");
    console.log('ip', ip, hashIp)
    // console.log('post', req.body)
    let result = false
    if (req.body.account) {
        result = await registerAccount({
            name: req.body.account.name,
            owner: req.body.account.owner_key,
            active: req.body.account.active_key,
            memo: req.body.account.memo_key,
            referrer: req.body.account.referrer,
        }, hashIp)
    }
    console.log(result)
    await res.json(result)
});

router.post('/v1/registrations', async function (req, res, next) {
    await res.json(await dbu.dbArray(db, '1','2'))
})

module.exports = router;
