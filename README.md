# PowerControl Electron

Electron UI for PowerControl, intended to only be used with my [PowerControl fork](https://github.com/aarron-lee/PowerControl) + [unofficial decky loader](https://github.com/aarron-lee/decky-loader).

This frontend only has the fan curve management functionality, none of the TDP, CPU, or GPU related functionality.

![app](./images/app.png)

# Requirements

Unofficial Decky Loader and PowerControl Fork v2.1.0 or v2.0.9 installed to unofficial decky.

- note, unofficial decky can be used alongside regular decky, it does not interfere with regular Decky Loader.

# Features

Fan curve management (Note Fan curves in the desktop app are separate from the PowerControl Fan curves in the Steam Game mode plugin)

Tray Icon with `Toggle Window` and `Quit` options:

1. `Toggle Window` option will show/hide the window. this setting is saved across app reboots
2. `Quit` option quits the app

On KDE, right click the tray icon to see options. On Gnome, you need to enable a gnome extension for icons first.

# Installation

If not already installed, install unofficial decky

```
curl -L https://raw.githubusercontent.com/aarron-lee/decky-loader/main/dist/install_release.sh | sh
```

Then install the PowerControl fork to unofficial decky

```
curl -L https://raw.githubusercontent.com/aarron-lee/PowerControl-Electron/main/unofficial_powercontrol_install.sh | sh
```

After installing the correct PowerControl version, you can download the latest Desktop AppImage from [releases](https://github.com/aarron-lee/PowerControl-Electron/releases), and install it with either [Gear Lever](https://flathub.org/apps/it.mijorus.gearlever) or [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher)

# Disclaimer

created for my own personal use, I will not provide any support. This software is provided as-is, with no warranty, etc

# Attribution

favicon ([cc-by4.0 license](https://creativecommons.org/licenses/by/4.0/)) - https://favicon.io/emoji-favicons/chart-increasing

[PowerControl Decky Plugin](https://github.com/mengmeet/PowerControl)
