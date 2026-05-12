---
title: The Recipe That Works
description: The condensed apt-based recipe to build NosferatOS for Pi Zero 2 W from scratch. Skip the 14-hour saga.
---

# 🩸 The Recipe That Works

> *"Forget the saga. Take the formula."*

::: tip TL;DR
1. Add Pi Foundation's apt repo to your debootstrap base.
2. `apt install linux-image-rpi-v8 raspi-firmware firmware-brcm80211 raspberrypi-sys-mods`.
3. Drop a `rfkill unblock all` oneshot at boot.
4. Mount FAT at `/boot/firmware/`, not `/boot/`.

That's it. Everything else is glue.
:::

## Why this recipe

Because **the kernel↔modules↔firmware triple is the bug surface** on a custom Pi distro, and Pi Foundation curates these as a working set. Trying to hand-pick them from upstream tarballs is a losing game — see the [saga](/nosferato/saga/) for the receipt.

## The ingredients

| Source | What it gives you |
|---|---|
| `debian.org/debian` (main, contrib, non-free, non-free-firmware) | Base Debian Bookworm rootfs |
| `archive.raspberrypi.com/debian` | Pi-Foundation kernel + firmware + sys-mods |

## The pipeline

→ See [**Step-by-Step Build**](./from-scratch) for the actual commands.

## What you skip by following this

- 🐉 Naming Hydra (the `brcmfmac43436` ↔ `BCM43430` ↔ `CYW43436s` ↔ `cyfmac43430` maze)
- 🐉 Wrong silicon-rev firmware → HT Avail timeout
- 🐉 Kernel↔modules version skew → silent driver failure
- 🐉 Hand-rolled DTB extraction → boot times out
- 🐉 Missing initramfs hooks → kernel boots but can't transition

You still own:
- 🛠️ The debootstrap base (provenance: you know what's in it)
- 🛠️ The hostname / user / passwords / wifi creds
- 🛠️ The firstboot orchestrator + customizations
- 🛠️ The boot side script (partitioning + dd + FAT staging)

## What you still need from the saga

Three lessons that aren't apt-fixable:

1. **rfkill unblock at boot.** No raspi-config? Drop a oneshot. [See here](./gotchas#rfkill).
2. **Mount FAT at `/boot/firmware/`.** Bookworm convention. apt upgrades break with `/boot/`.
3. **Add the essentials back to minbase.** `--variant=minbase` strips systemd. Re-add: `systemd-sysv, dbus, openssh-server, wpasupplicant, wireless-tools, ifupdown, isc-dhcp-client, rfkill, net-tools, parted, e2fsprogs`.

## Where to go next

- [**Step-by-Step Build**](./from-scratch) — actual `bash` invocations
- [**Gotchas**](./gotchas) — the trap list
- [Bestiary](/nosferato/saga/bestiary) — every bug catalogued
- [Tools](/nosferato/tools/) — diagnose-sd.sh
