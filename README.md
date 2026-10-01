# Avid Keyboard Locale Fix

A small AutoHotkey v2 workaround for an Avid Media Composer issue on Windows.

When switching the Windows keyboard/input language while Media Composer is active, Avid may repeatedly display a warning recommending that the matching **Keyboard Setting** be activated. In some installations, clicking **"Don't warn me again"** does not reliably suppress the warning.

This script detects that specific Avid dialog and immediately sends **Enter**, dismissing it with **OK**.

## What it does

The script checks the active window every 10 ms and only acts when several characteristics match the known Avid warning:

- Process: `AvidMediaComposer.exe`
- Qt window class: `Qt656QWindowIcon`
- Window title: `AvidMediaComposer`
- Dialog dimensions matching the known warning at common Windows display scaling values
- The same dialog must be detected twice consecutively before Enter is sent

The intent is to avoid interfering with normal Avid windows or unrelated applications.

## Requirements

- Windows
- Avid Media Composer
- AutoHotkey v2

Download AutoHotkey only from its official website.

## Installation

1. Install AutoHotkey v2.
2. Download and extract the release ZIP.
3. Double-click `Install Avid Keyboard Locale Fix.cmd`.
4. The script starts immediately and a Startup entry is created for the current Windows user.

You can also run `Avid Keyboard Locale Fix.ahk` directly without installing it.

## Uninstallation

Run `Uninstall Avid Keyboard Locale Fix.cmd`.

If the script is currently running, exit it from the AutoHotkey tray icon. The uninstaller deliberately does not kill every AutoHotkey process, because users may have other scripts running.

## Display scaling

The original warning was measured at approximately **502 × 132 logical pixels**. The script recognizes dimensions corresponding to common Windows scaling levels:

100%, 125%, 150%, 175%, and 200%.

The 150% case was tested with a Windows-reported dialog size of **753 × 198**.

Different Avid releases, Windows versions, themes, DPI behavior, or monitor configurations may produce different dimensions. If the script does not detect the warning, open AutoHotkey Window Spy while the warning is visible and report:

- Window title
- `ahk_class`
- `ahk_exe`
- Width and height

## Known limitation

Avid's Qt dialog does not expose the warning text or its OK button as standard Windows controls in the configuration used to develop this workaround. Therefore v1.0 identifies the dialog using a conservative window fingerprint rather than matching the warning text itself.

## Safety

The source is intentionally short and readable. Review the `.ahk` and `.cmd` files before running them if desired.

No network access, telemetry, data collection, or file monitoring is performed.

## Contributing

Reports from other Media Composer versions and Windows display-scaling configurations are welcome. Please include the Avid version, Windows version, display scaling percentage, and Window Spy information for the warning dialog.

## Disclaimer

This is an unofficial community workaround and is not affiliated with or endorsed by Avid Technology or AutoHotkey.

## License

MIT License. See `LICENSE`.
