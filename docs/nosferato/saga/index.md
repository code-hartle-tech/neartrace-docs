---
title: S01 — The Saga
description: Season 1 of building Nosferato from scratch. Every episode catalogued.
---

# 🦇 S01 — The Saga of Nosferato

> *Bring me a bird beak and a powdered toad, and I shall conjure thee a distro.*

::: tip TL;DR
The complete chronicle of getting a hand-rolled Debian to boot on a Pi Zero 2 W and join wifi. **Three episodes**, **14 hours**, **one working SD card**.
:::

## Season pass

| EP | Title | Lesson | Status |
|---|---|---|---|
| **E12** | [I, Frankenstein](./e12-pi-not-dead) | Fact-check hardware claims | 🪦 Closed |
| **E13** | [Stage One, Where Art Thou?](./e13-bootcode-at-the-root) | Pi Zero 2 W boots `bootcode.bin` from FAT root | 🪦 Closed |
| **E14** | [Fourteen Hours in the Forest](./e14-whack-a-mole) | Use apt, not tarballs. Curated > hand-rolled. | 🪦 Closed |

[Cast](./cast) · [Bestiary](./bestiary) · [Credits](./credits)

## The arc, in one paragraph

The Pi appeared dead. It wasn't — we'd built a broken SD that the Pi's mask-ROM couldn't read. We fixed that. Then the Pi appeared to boot but did nothing — turns out we hadn't installed an init system. We fixed that. Then the Pi booted but had no wifi — and we proceeded to spend twelve hours chasing **firmware filename ghosts** before realizing every problem we had was already solved by Pi Foundation's own apt repo. We swapped tarball-extraction for apt, and on the very next flash: `ssh nt@192.168.0.129` → `nt@nosferato:~$`. Saga ends. Foundation laid.

## Recurring boss patterns

- 🐉 **The Naming Hydra** — BCM43436 vs BCM43430 vs CYW43436s vs cyfmac43430. Same silicon, ten names. Each driver/firmware/distro picks a different one. Heads grow back.
- 👻 **The Silent Failure** — driver loads, says nothing, fails silently. No `register_netdev`, no `wlan0:`, just void. The hardest kind of bug.
- 🪦 **The Misdiagnosis** — we declared the Pi "dead" based on a false LED-count claim, lost a session. Hardware facts must be verified, not recalled.
- ⛓️ **The Chain of Dependencies** — wifi needs DHCP needs ifupdown needs wpa_supplicant needs rfkill unblock needs country code needs… (turtles all the way down).

## Recurring heroes

- 🌐 **archive.raspberrypi.com/debian** — Pi Foundation's apt repo. The breakthrough.
- 📦 **`linux-image-rpi-v8`** — the canonical Pi-Foundation arm64 kernel package.
- 📦 **`firmware-brcm80211`** (from Pi repo, not Debian's) — the right blobs.
- 📦 **`raspi-firmware`** — populates `/boot/firmware/` with bootcode + dtbs + initramfs.
- 🛠️ **`debugfs`** — read ext4 partitions on macOS via Multipass VM. Diagnostic superpower.
- 🛠️ **`journalctl -D /path/to/journal`** — replay a captured journal from a powered-down device.

## Pacing

If you read in order, set aside 20-30 minutes. The episodes are dense but punchy. Code blocks, mermaid diagrams, and screenshots throughout.

If you only want one: read **[E14 — Fourteen Hours in the Forest](./e14-whack-a-mole)**. That's where the real lessons live.

→ [**Start: E12 — I, Frankenstein**](./e12-pi-not-dead)
