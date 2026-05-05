# Red Button

> **S01E07 — "There are situations where the only right move is to make it all disappear."**

<div class="tldr">
<strong>TL;DR</strong>
One tap wipes everything NearTrace has ever stored — cryptographically. Scan history, device records, photos, credentials, cached data. Designed for two threat models: privacy hygiene and ICRC-grade device seizure.
</div>

## Why this exists

Most apps have a "clear data" option buried in Settings. That's for when you're bored of the app.

The Red Button is for when someone is going through your phone at a checkpoint and you need the data gone before they find it. It was designed with the threat model of journalists and humanitarian workers operating in conflict zones.

If that's not you, it's still a clean nuclear option for your privacy hygiene.

## What gets destroyed

| Data | Destruction method |
|---|---|
| Scan history & device records | Room database dropped and wiped |
| Photos | Files deleted from app storage |
| PIN / credentials | Android Keystore alias dropped (hardware-backed — irrecoverable) |
| Encrypted preferences | EncryptedSharedPreferences cleared |
| App cache | Cache directory wiped |
| Settings | Reset to defaults |

The Android Keystore alias drop is the key step. On devices with a hardware-backed Keystore (most modern Android phones), dropping the alias makes the encrypted data irrecoverable even with physical access to the NAND.

## How to trigger it

**Settings → Security → Red Button → Burn All Data**

A confirmation dialog appears. Confirm, and it's done. The app resets to a clean first-launch state.

## Duress PIN

If you set a PIN, you can configure a second **duress PIN**. If you enter the duress PIN, the Red Button fires silently in the background while the app appears to unlock normally — showing an empty device list and default settings. The wipe happens behind a convincing decoy.

Configure it in **Settings → Security → Duress PIN**.

## Coming in v1.1

- Panic gestures (volume combo, shake)
- Inactivity timer (auto-wipe after N hours unlocked)
- Geofence trigger (auto-wipe when leaving a safe zone)
- Dead-man-switch SMS from a trusted contact

::: danger
The Red Button cannot be undone. There is no backup, no recovery, no "are you sure?" after the first confirmation. This is intentional.
:::
