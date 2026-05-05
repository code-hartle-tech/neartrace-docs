# FAQ

> **S01E11 — "The questions you had but were afraid to ask."**

## Why does NearTrace need Location permission to scan Bluetooth?

This is Android's rule, not ours. Since Android 6.0, Google has required Location permission for apps that scan BLE, because BLE sightings can theoretically be used to infer your location (via known beacon positions). Granting Location permission to NearTrace does not mean we track your location — it just lets Android allow us to see nearby BLE devices.

If you're curious, [here's the official Android docs](https://developer.android.com/develop/connectivity/bluetooth/bt-permissions) explaining the requirement.

## Does NearTrace connect to devices it finds?

No. The scanner is purely passive — receive-only. NearTrace never initiates a Bluetooth or Wi-Fi connection to any device it discovers. The only exception is if you explicitly tap a plugin that requires a connection (e.g. Connectivity Probe checking open ports over TCP/IP on a Wi-Fi device).

## Can I use NearTrace to track someone else?

No — and this is intentional by design. NearTrace requires you to be physically present and scanning. It doesn't run in the background (yet), it doesn't upload device sightings to a server you can query remotely, and it doesn't have a "fleet tracking" mode. It's a tool for observing your own radio environment, not surveilling others.

## Why do device MAC addresses keep changing?

Apple and Google devices rotate their BLE MAC addresses every ~15 minutes for privacy. This means the same AirPods appear as a different "device" every quarter hour. NearTrace shows you what's actually being broadcast — the rotation is real and intentional. MAC-rotation-aware tracking (correlating sightings across rotations) is on the v1.1 roadmap ([#52](https://github.com/code-hartle-tech/neartrace-android-mvp/issues/52)).

## Is NearTrace safe to carry through border crossings?

The app itself is a passive scanner — the same category as apps like nRF Connect or LightBlue, which are available on the Play Store globally. The Red Button gives you a nuclear option if needed. See the [Red Button page](/features/red-button) for the full threat model.

## I set a PIN and forgot it. What now?

There's no PIN recovery. This is intentional — a recovery option would be a backdoor. Your options:
1. Uninstall and reinstall (loses all data, which is equivalent to the Red Button)
2. If you had the duress PIN, you can use it (triggers a wipe and resets to a clean state)

## Where is my data stored?

Entirely on your device. Scan history in a Room (SQLite) database, photos in the app's private storage directory, credentials in Android Keystore. Nothing is sent off-device by default. See the [Privacy Policy](/privacy) for the full breakdown.

## How do I report a bug or request a feature?

[Open an issue on GitHub](https://github.com/code-hartle-tech/neartrace-android-mvp/issues) or email [contact@hartle.tech](mailto:contact@hartle.tech).
