# BitShares Faucet NodeJS

Faucet is used to pay the registration fee for new BitShares users.
In order to ensure Anonymity of the user's IP, his IP-address is hashed.

## NodeJS Setup (if necessary)

```
sudo apt-get install build-essential g++ python git curl ntp htop nmon iftop nano -y
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh 2>/dev/null | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install 10.21.0 >>install.log
nvm use 10.21.0 >>install.log
nvm alias default 10.21.0
npm install -g npm forever grunt-cli
```

## Install App
```
git clone https://github.com/technologiespro/nodejs-faucet.git
cd nodejs-faucet
npm install
```

## Settings
```
mv sample.config.json config.json
nano config.json
```

Set

- port - app port number default 48887 up to 65535
- bts.node - public bitshares api node
- bts.registrar - registrar BitShares account
- bts.wif - registrar BitShares account private active key
- bts.default_referrer - default referrer account name
- bts.referrer_percent - referrer percent
- bts.broadcastTx - default true, for testing set false
- bts.timeoutIp - default 1800 sec (30 min) registration time on 1 ip
- bts.allowPremium - default false, registration premium names
- bts.allowCustomerReferer - default true, false - always use referrer from config

- bts.sendAfterReg.asset - asset name for send to new registered user (ex. XBTSX.STH)
- bts.sendAfterReg.amount - asset amount for send to new registered user (ex. 10)

save and exit from nano editor: CTRL+O, CTRL+X

## Start/Stop, Logs & Shell

`cd nodejs-faucet`

`npm start` for testing

or 

`cd nodejs-faucet`

`sh start.sh` - faucet start

`sh stop.sh` - faucet stop

`sh log.sh` - faucet log

default on http://localhost:48887, for use domain setup nginx

## Nginx Setup

`sudo apt install nginx`

`cd /etc/nginx/sites-available`

`sudo nano faucet`

- insert config

```
server {
        listen 80;
        listen 443 ssl;
        server_name faucet.yoursite.com;
        location / {
        proxy_pass http://localhost:48887;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
       }
}

```

- save settings: CTRL+O, CTRL+X
- `sudo ln -s /etc/nginx/sites-available/faucet /etc/nginx/sites-enabled/faucet`
- `sudo nginx -t`
- `sudo service nginx restart`
- for ssl install nginx certbot, instruction here https://certbot.eff.org/lets-encrypt/ubuntubionic-nginx

## API

- `GET /api/v1/ip` - test get ip address
- `GET /api/v1/latest` - latest registrations
- `GET /api/v1/counter` - count registrations
- `GET /api/v1/registrations` - list registrations
- `POST /api/v1/accounts` - register new account


## SSL

please visit https://certbot.eff.org/lets-encrypt/ubuntuxenial-nginx

## Vote for

witness: *xbtsio-wallet*
