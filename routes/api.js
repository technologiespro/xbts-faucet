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
let countRegs = 0
let registrar = null
let assetId = "1.3.0"
let referrer = "xbtsx"

BitShares.connect(config.bts.node);
BitShares.subscribe('connected', startAfterConnected);

async function is_cheap_name(account_name) {
    return /[0-9-]/.test(account_name) || !/[aeiouy]/.test(account_name);
}

async function startAfterConnected() {
    //acc = await BitShares.login(config.bts.registrar, config.bts.password)
    console.log('-------------------------------------------------')
    acc = new BitShares(config.bts.registrar, config.bts.wif)

    registrar = await BitShares.accounts[config.bts.registrar]
    console.log('registrar', registrar.id, registrar.name)

    countRegs = await dbu.dbGet(db, '0xREG') || 0
    console.log('countRegs', countRegs)

    assetId = (await BitShares.assets[config.bts.core_asset]).id
    console.log('assetId', assetId, config.bts.core_asset)

    referrer = await BitShares.accounts[config.bts.default_referrer]
    console.log('default referrer', referrer.id, referrer.name)
    console.log('premium names', config.bts.allowPremium)
    console.log('-------------------------------------------------')
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
        result = {"error": {"base": ["Only one account per IP " + config.bts.timeoutIp / 60 + " min"]}}
        return result
    }

    latestRegs[ip] = {
        time: Math.floor(Date.now() / 1000),
        name: options.name,
    }

    if (config.bts.broadcastTx && isAllowReg) {
        let params = {
            fee: {amount: 0, asset_id: assetId},
            name: options.name,
            registrar: registrar.id,
            referrer: referrer.id,
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
                voting_account: referrer.id,
                num_witness: 0,
                num_committee: 0,
                votes: []
            },
            extensions: []
        };
        try {
            let tx = acc.newTx()
            tx.account_create(params)
            await tx.broadcast()
            //console.log('tx Result', txResult[0].trx)
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
                "time": Math.floor(Date.now() / 1000),
            })
            countRegs++
            await db.put('0xREG', countRegs)


        } catch (e) {
            //console.log('e', e)
            result = {"error": {"base": ["Error registration new account."]}}
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
    // console.log('ip', ip, hashIp)
    // console.log('post', req.body)
    let result = false
    let err = false
    let name = (req.body.account.name).toLowerCase()

    if (!config.bts.allowPremium) {
        err = !(await is_cheap_name(name)) // is not cheap name = true
    }

    if (req.body.account && !err) {
        result = await registerAccount({
            name: name,
            owner: req.body.account.owner_key,
            active: req.body.account.active_key,
            memo: req.body.account.memo_key,
            referrer: req.body.account.referrer,
        }, hashIp)
    }
    //console.log(result)
    await res.json(result)
});

router.get('/v1/registrations', async function (req, res, next) {
    await res.json({
        total: await dbu.dbGet(db, '0xREG') || 0,
        accounts: await dbu.dbArray(db, '1', '2')
    })
})

router.get('/v1/counter', async function (req, res, next) {
    await res.json({
        registrations: await dbu.dbGet(db, '0xREG') || 0,
    })
})

module.exports = router;
