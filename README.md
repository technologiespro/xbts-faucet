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