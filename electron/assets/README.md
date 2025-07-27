# Electron Assets

This directory contains the application icons and assets needed for the Electron app.

## Required Files

- `icon.png` - Main application icon (512x512 PNG)
- `icon.icns` - macOS application icon
- `icon.ico` - Windows application icon  
- `tray-icon.png` - System tray icon (16x16 or 32x32 PNG)

## Generating Icons

You can use tools like:
- [electron-icon-builder](https://www.npmjs.com/package/electron-icon-builder)
- [electron-builder icon generation](https://www.electron.build/icons)
- Online converters for ICO and ICNS formats

## Icon Requirements

- **PNG**: 512x512 pixels for best quality across all platforms
- **ICO**: Windows icon with multiple sizes (16, 32, 48, 256 pixels)
- **ICNS**: macOS icon bundle with multiple sizes
- **Tray Icon**: Small icon for system tray (16x16 recommended)

The icons should represent the PhonoCorrect AI brand and be easily recognizable at small sizes.