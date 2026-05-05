# Your First Scan

> **S01E03 — "Press the button. Watch the world appear."**

<div class="tldr">
<strong>TL;DR</strong>
Tap Start. Devices appear. Tap any row for details. Long-press for actions. Filter by BLE/Wi-Fi and signal strength. That's the core loop.
</div>

## Starting a scan

1. Open NearTrace
2. Tap **Start** in the control bar at the top
3. Devices start appearing in the list, sorted by signal strength (strongest first)

The scan runs continuously until you tap **Stop**. Tap **Clear** to wipe the current session's device list without stopping the scan.

## Reading the device list

Each row shows:

- **Left accent stripe** — colour-coded by radio type (blue = BLE, green = Wi-Fi)
- **Device icon** — guessed from vendor data and advertisement type
- **Name** — the device's advertised name, or a vendor inference (e.g. "Apple · AirPods Pro 2")
- **MAC address** — the hardware identifier. May rotate on Apple/Google devices every ~15 minutes for privacy
- **RSSI counter** — signal strength in dBm. Higher (closer to 0) = stronger
- **Badge bar** — radio type, BT version, Find My detection, Wi-Fi generation, and more

## Signal strength presets

Use the signal range selector to filter by distance:

| Preset | Approx. range |
|---|---|
| Under my nose | 0–1 m |
| Handy | 1–3 m |
| Far-sighted | 3–10 m |
| Wally | Weak signals only |
| Wormhole | Everything |
| Custom | You decide |

## Tap a device

Opens the device detail page: map view, full advertisement decode, photo, plugins (port scan, mDNS, SSDP, vulnerability check), export options.

## Next steps

- [Scanner deep-dive →](/features/scanner)
- [Pin a device for tracking →](/features/tracker)
