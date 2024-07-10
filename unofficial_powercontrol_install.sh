#!/usr/bin/bash

if [[ -d $HOME/.unofficial_homebrew/plugins ]]; then
  echo "Unofficial decky required. Exiting..."
  exit
fi

# installs the following:
# - PowerControl Fork Decky Plugin
if [ "$EUID" -eq 0 ]
  then echo "Please do not run as root"
  exit
fi

echo "removing previous install if it exists"

cd $HOME

sudo rm -rf $HOME/.unofficial_homebrew/plugins/PowerControl

echo "installing PowerControl Fork plugin for Fan control"

FINAL_URL="https://api.github.com/repos/aarron-lee/PowerControl/releases/tags/v2.1.0"

echo $FINAL_URL

# download + install plugin
curl -L $(curl -s "${FINAL_URL}" | grep "browser_download_url" | cut -d '"' -f 4) -o $HOME/PowerControl.tar.gz
sudo tar -xzf PowerControl.tar.gz -C $HOME/.unofficial_homebrew/plugins

# install complete, remove build dir
rm  $HOME/PowerControl.tar.gz
sudo systemctl restart unofficial_plugin_loader.service

echo "Installation complete"
