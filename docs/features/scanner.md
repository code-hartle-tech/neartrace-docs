# BLE & Wi-Fi Scanner

> **S01E04 — "Your phone has been a radio receiver this whole time. We just turned on the screen."**

<div class="tldr">
<strong>TL;DR</strong>
Passive discovery of every BLE and Wi-Fi device in range. Vendor inference from OUI + Apple Continuity packets. RSSI presets. GPS-stamped sightings. Per-device detail page with full advertisement decode and analysis plugins.
</div>

## How scanning works

NearTrace uses Android's `BluetoothLeScanner` and `WifiManager` APIs to passively receive advertisement packets. **It never initiates a connection.** Your phone is in receive-only mode — like a radio tuned to a station, not a transmitter.

Every packet received updates the device's entry: last-seen timestamp, signal strength, and any new advertisement data.

## Vendor inference

Raw BLE advertisements are full of information that most scanners throw away. NearTrace decodes:

### OUI lookup
The first 3 bytes of a MAC address identify the manufacturer (e.g., `A4:C3:F0` = Apple). NearTrace resolves these via `api.macvendors.com` (cached, with a circuit breaker — if the API is slow or down, it fails silently and retries in 5 minutes).

### Apple Continuity packets
Apple devices broadcast their entire ecosystem state in Continuity advertisement packets. NearTrace decodes these to surface:

| What you see | What it means |
|---|---|
| `Apple · AirPods Pro 2` | Continuity identifies the exact model |
| `Apple · iPhone` | NearbyInfo flags indicate device type |
| `Apple · iPhone (with AirPods)` | Companion audio device detected |
| `Find My (likely AirTag)` | Find My network packet detected |
| Continuity badges | Watch, AirDrop active, iCloud, Call in progress |

### BT version detection
NearTrace stamps BT 5+ in the badge bar only when it can prove it — extended advertising, 2M PHY, or CODED PHY observed. No guessing.

## GPS stamping

If you've granted location permission and pressed **Start**, every device sighting after that point gets a GPS coordinate. Devices discovered before you pressed Start intentionally get no location — they're pre-scan noise.

Tap a device → **Map** tab to see all sighting locations.

## Plugins

The device detail page runs optional analysis plugins:

| Plugin | What it does |
|---|---|
| **Service Inspector** | Decodes all advertised BLE services |
| **Connectivity Probe** | Checks common ports (80, 443, 22, etc.) |
| **Vulnerability Advisor** | Flags known CVEs for the device type |
| **mDNS** | Resolves the device's mDNS hostname |
| **SSDP** | Discovers UPnP service descriptions |

Plugins run on-demand — tap the plugin card to trigger it.
