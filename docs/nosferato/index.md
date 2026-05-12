---
title: 🦇 Nosferato
description: NSFAS — Not-Safe-For-App-Stores. The Pi-side rig of The World Project. Custom Debian distro for Raspberry Pi Zero 2 W.
---

# 🦇 Nosferato

> *Companion rig to NearTrace. Not safe for app stores. The frontrat awakens.*

NearTrace lives inside Google's Play Store rules — phone-only,
defensive-framed, observation-grade. Some things you can't do from
inside that box. **Nosferato** is the body the protocol slips into
when it leaves.

A Raspberry Pi Zero 2 W runs **NosferatOS** — our custom OS built
from a vanilla Debian Bookworm debootstrap, with kernel + firmware
curated by the Raspberry Pi Foundation's apt repo, plus our own
glue. It handles the wireless layer NearTrace can't reach: monitor
mode, packet injection, real EAPOL handshake capture, deauth probes,
BLE active enumeration. The phone stays the UI. The Pi grows the fangs.

> Nosferato is the brand. NosferatOS is the OS it ships.
> Same root, same vampire heritage — different identities.

## What it is

- A 25g pocket-sized SBC running Debian Bookworm + Pi-Foundation kernel
- Hand-rolled from debootstrap up — every package known, every config
  audited, every blob accounted for
- BCM43436 onboard wifi (patched with [nexmon](https://github.com/seemoo-lab/nexmon)
  for monitor + injection — backlog)
- Onboard BLE via standard bluez
- Wifi STA (joins upstream) + Wifi AP (`nosferato-mgmt`, mgmt path) +
  USB OTG composite gadget — all simultaneously
- Boots to SSH-ready state in **9 seconds**

## What it isn't

- A toy. The brcm chip is a real radio doing real injection.
- A hidden weapon. Nothing about Nosferato is covert — it broadcasts
  a management AP labelled `nosferato-mgmt`.
- A Play-store-acceptable feature. Hence the separate lane.

## The lore — NOS · FERA · RATO

The codename is a deliberate triple portmanteau:

- **NOS** — Nitrous Oxide Systems. The underground car-racing scene,
  illegal speed mods, the hacker-tinkerer mindset. *Fast & Furious* vibes.
- **FERA** — Latin/Portuguese/Spanish for "beast." Predator. Untamed.
- **RATO** — Portuguese/Spanish for "rat/mouse." Intelligence, urban survival,
  picking locks, the hacker-mascot lineage.

Combined: **NOS-FERA-RATO**, the beast-rat with speed mods.

Lineage also picks up:

- **Nosferatu** — the silent-film vampire. The rig wakes up at night
  and listens to what the radios won't admit during the day.
- **Dio Brando**'s vampiric arc in *JoJo's Bizarre Adventure* — and
  the legendary stand "The World" that follows him. The umbrella for
  this whole multi-platform program is The World; Nosferato is the
  predator that lives inside it.

## The Saga

Building the first working image took **14 hours** of debugging. We
caught and documented every single bug.

→ [**S01 — The Saga**](./saga/) — three-episode chronicle

The whole thing is yours to skim, study, or skip. It's the kind of
story you wish you'd had to read *before* spending a week on a
custom Pi distro.

## Quick links

- [**The Recipe That Works**](./recipe/) — copy-paste this, save 14 hours
- [**Build & flash the SD**](./build) — Mac-side bootstrap (Multipass-based)
- [**First boot & login**](./first-boot) — what the Pi does when you power it on
- [**Reach the rig**](./reach) — wireless mgmt AP / USB tether / IoT wifi
- [**The tool stack**](./tools) — what the preinstalled pen-test tools do
- [**Pair with NearTrace**](./pair) — phone↔Pi mDNS handshake
- [**Release channels**](./channels) — daily / weekly / stable
- [**Gotchas**](./recipe/gotchas) — the trap list
- [**Bestiary**](./saga/bestiary) — every bug we fought, classified
- [**Credits**](./saga/credits) — external sources we consulted
- [**Diagnose tool**](./recipe/diagnose-sd) — the SD inspector

## Codenames

| Codename | What it is |
|---|---|
| **Nosferato** | The brand / lane (NSFAS, Pi-side of NearTrace) |
| **NosferatOS** | The custom OS image we build (apple-style naming) |
| **frontrat** | The vampire-rat mascot |
| **The World** | The umbrella codename for the whole multi-phase NearTrace plan |

## Status

| Component | Status |
|---|---|
| Boot to userspace | ✅ Working (S01E14, 2026-05-12) |
| Wifi STA → upstream IoT | ✅ Working |
| SSH login | ✅ Working |
| Mgmt AP (`nosferato-mgmt`) | 🚧 Recipe verified, bake-in pending (S01E15 #389) |
| Source-level build-rootfs refactor | 🧹 #390 |
| Bluetooth firmware | 📋 #391 |
| Nexmon monitor mode | 📋 Backlog (#376) |
| USB OTG tether | 📋 Backlog (#378) |
| Channel-pipeline release builds | 📋 Backlog (#385) |

::: tip Mascot pending
Brand kit + frontrat illustration land in [S01E06 #380](https://github.com/code-hartle-tech/neartrace-android-mvp/issues/380).
:::

## Where to start

If you're **new here** — read [the saga](./saga/) for the story or [the recipe](./recipe/) for the answer.

If you're **building one** — go straight to [recipe/from-scratch](./recipe/from-scratch) (or the legacy [build guide](./build)).

If you're **debugging your own** — [diagnose-sd](./recipe/diagnose-sd) and [bestiary](./saga/bestiary).
