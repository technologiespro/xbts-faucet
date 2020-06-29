# Faucet XBTS DEX

The faucet is used to pay the registration fee for new users.

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
git clone https://github.com/technologiespro/xbts-faucet.git
cd xbts-faucet
npm install
```

## Settings
```
mv sample.config.json config.json
nano config.json
```

Set

- port - app port number up to 65535
- bts.node - public bitshares node
- bts.registrar - registrar account
- bts.password - registrar account password
- bts.default_referrer - default referrer account name
- bts.referrer_percent - referrer percent

save and exit from nano editor: CTRL+O, CTRL+X

## Start

`npm start` for testing

`sh restart.sh` for background running

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

- `GET https://faucet.xbts.io/api/v1/ip` - test get ip address
- `POST https://faucet.xbts.io/api/v1/accounts` - register new account

