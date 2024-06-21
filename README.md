# PowerControl Electron Frontend

Based on Powercontrol frontend, intended to only be used with my [PowerControl fork](https://github.com/aarron-lee/PowerControl).

This frontend only has the fan curve management functionality, none of the TDP-related functionality.

This will NOT work with the main PowerControl plugin

![app](./images/app.png)

# Requirements

Decky Loader and PowerControl Fork installed

- requires PowerControl Fork v2.0.9

# Features

Fan curve management (Note Fan curves are separate from the PowerControl Fan curves in the plugin)

Tray Icon with `Toggle Window` and `Quit` options:

1. `Toggle Window` option will show/hide the window. this setting is saved across app reboots
2. `Quit` option quits the app

On KDE, right click the tray icon to see options. On Gnome, you need to enable a gnome extension for icons first.

# Installation

The Desktop app requires [PowerControl fork](https://github.com/aarron-lee/PowerControl). v2.0.9 to be installed. You can install v2.0.9 via the following command:

```
curl -L https://github.com/aarron-lee/PowerControl/raw/main/install.sh | VERSION_TAG=v2.0.9 sh
```

After installing the correct PowerControl version, you can download the latest Desktop AppImage from [releases](https://github.com/aarron-lee/PowerControl-Electron/releases), and install it with either [Gear Lever](https://flathub.org/apps/it.mijorus.gearlever) or [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher)

# Disclaimer

created for my own personal use, I will not provide any support. This software is provided as-is, with no warranty, etc

# Attribution

favicon ([cc-by4.0 license](https://creativecommons.org/licenses/by/4.0/)) - https://favicon.io/emoji-favicons/chart-increasing

[PowerControl Decky Plugin](https://github.com/mengmeet/PowerControl)
