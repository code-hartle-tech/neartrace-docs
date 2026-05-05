# Install & Permissions

> **S01E02 — "The app asks for a lot. Here's exactly why."**

<div class="tldr">
<strong>TL;DR</strong>
Install from Google Play. Grant Location (required for BLE scanning on Android — Google's rule, not ours) and Notifications (optional, for tracker alerts). That's it. No account, no sign-up.
</div>

## Install

Download NearTrace from [Google Play](https://neartrace.app). Minimum Android version: **8.0 (Oreo)**.

## Permissions explained

Android requires apps to justify every permission they request. Here's NearTrace's honest explanation:

| Permission | Why we need it |
|---|---|
| **Location (Precise)** | Android mandates this for any app that scans BLE. It has nothing to do with tracking *you* — Google uses it as a proxy for "can see nearby devices." We use GPS optionally to stamp sightings on a map. |
| **Nearby devices (Bluetooth)** | To discover BLE devices around you. Required on Android 12+. |
| **Notifications** | Only used by the Proximity Tracker to alert you when a pinned device disappears. You can skip this and still use the scanner. |
| **Camera / Photos** | Only if you tap "Add photo" on a device's detail page. Never accessed in the background. |

## What we don't ask for

- No contacts
- No microphone
- No SMS
- No internet (the scanner is fully offline — internet is only used for optional OUI vendor lookups and map tiles)

## Privacy

Everything stays on your phone. Read the [full privacy policy](/privacy) for the detailed breakdown.
