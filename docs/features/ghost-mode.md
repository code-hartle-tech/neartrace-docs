# Ghost Mode

> **S01E06 — "You can now haunt the Bluetooth spectrum."**

<div class="tldr">
<strong>TL;DR</strong>
Ghost Mode broadcasts a fake BLE beacon from your phone. You appear in other devices' Bluetooth scanners — including Apple's BT Settings — as a connectable device with a random pseudonym. The pseudonym changes every session.
</div>

## What it does

Your phone becomes a BLE advertiser. It broadcasts a connectable advertisement with a generated pseudonym as the device name. Any BLE scanner nearby — including iOS Bluetooth Settings, nRF Connect, and other NearTrace instances — will see you as a separate device.

This is real BLE advertising using Android's `BluetoothLeAdvertiser`. The phone's own Bluetooth name is **not changed** — only the advertisement payload carries the pseudonym.

## Starting Ghost Mode

1. Open the **Ghost Mode** tab (bottom nav)
2. Tap **Start Broadcasting**
3. Your current pseudonym is shown — it changes each session for plausible deniability

## Use cases

- **Testing your own BLE scanner setup** — verify your scanner sees what you expect
- **Privacy research** — observe how other devices react to a new BLE presence
- **Demonstrations** — show how BLE advertising works without exposing your real device identity

## What Ghost Mode does NOT do

- Does not spoof another real device's identity
- Does not change your phone's system Bluetooth name (that would persist after a crash)
- Does not broadcast any personal information
- Does not connect to other devices — it advertises as connectable but accepts no connections

::: warning
Ghost Mode is for your own devices and educational purposes. Broadcasting fake identities to deceive or harass others is your responsibility, not ours.
:::
