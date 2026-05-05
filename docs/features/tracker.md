# Proximity Tracker

> **S01E05 — "The main quest: don't leave your camera at the café."**

<div class="tldr">
<strong>TL;DR</strong>
Pin any device. Get an alert the moment it drops out of range. 30-second grace period before the alarm fires. Works while the app is in the foreground.
</div>

## The problem it solves

You're on a shoot. You have a DJI drone, an Insta360, a lav mic, a tripod. You pack up in a hurry. Three blocks later — did you leave something?

NearTrace's tracker would have told you the moment your Insta360 stopped advertising. Before you were out of range. While you could still turn around.

## How to pin a device

1. Start a scan — let the device appear in the list
2. Tap the ⭐ star icon on the device row, or open the device detail and tap **Pin this device**
3. The device is now tracked — a banner appears when it drops out of range

## Grace period

NearTrace waits **30 seconds** after a device disappears before firing the alert. This prevents false positives from brief signal dropouts. If the device reappears within the grace period, no alert.

## Notification

When a tracked device drops out of range, you get a notification: `"[Device name] is no longer in range."` Tap it to jump directly to the device detail.

::: tip Grant notifications
The tracker alert requires the Notification permission. If you skipped it during onboarding, NearTrace will ask again when you pin your first device.
:::

## Current limitations

- **Foreground only** — the tracker monitors while NearTrace is running. Background monitoring (app in background, screen off) is on the v1.1 roadmap ([#14](https://github.com/code-hartle-tech/neartrace-android-mvp/issues/14)).
- **Global grace period** — all tracked devices share the same 30-second window. Per-device grace periods are v1.1 ([#15](https://github.com/code-hartle-tech/neartrace-android-mvp/issues/15)).
