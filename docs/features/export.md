# Export & Integrations

> **S01E10 — "Your data, your formats, your servers."**

<div class="tldr">
<strong>TL;DR</strong>
Export scan results as CSV, JSON, or PDF. Opt-in WiGLE upload. Webhooks to any URL you control. Nothing leaves your phone by default.
</div>

## Export formats

From any device detail page or the scan history list:

| Format | Use case |
|---|---|
| **CSV** | Spreadsheets, data analysis |
| **JSON** | Programmatic processing, piping to other tools |
| **PDF** | Reports, evidence documentation |

## WiGLE upload

[WiGLE](https://wigle.net) is a community database of Wi-Fi and BLE sightings. Uploading your scans contributes to a global map.

**Off by default.** First time you enable it, NearTrace shows an explicit consent screen explaining exactly what gets uploaded. You can revoke consent at any time in Settings → Integrations → WiGLE.

## Webhooks

Send scan results to any URL you control — a home server, a SIEM, a custom API.

**Settings → Integrations → Webhooks → Add URL**

NearTrace validates the URL before saving: localhost, RFC 1918 addresses, and link-local ranges are blocked (SSRF protection). Only real internet URLs are accepted.

Payload format is JSON matching the export schema.

::: tip
Webhooks fire automatically at the end of each scan session. You can also trigger them manually from the device detail page.
:::
