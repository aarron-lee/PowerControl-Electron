cd $HOME/Development/PowerControl
pnpm build
sudo rm -rf ~/homebrew/plugins/PowerControl/
sudo cp -rf $HOME/Development/PowerControl/ ~/homebrew/plugins/PowerControl/
sudo systemctl restart plugin_loader.service
