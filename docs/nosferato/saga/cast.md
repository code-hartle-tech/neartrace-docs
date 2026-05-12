---
title: Cast — Dramatis Personae
description: Heroes, villains, NPCs, and inanimate objects that played roles in the Nosferato saga.
---

# 🦇 Cast

## Heroes

### Pi Foundation
**Power:** Curates `archive.raspberrypi.com/debian` — a single apt repo where kernel, modules, firmware, and dtbs all match.
**Backstory:** We ignored them for two episodes. They were patient. When we finally asked for help, they handed over the working triple in 90 seconds.

### `debugfs`
**Power:** Reads ext4 filesystems without mounting. Works on macOS via Multipass VM.
**Signature move:** `debugfs -R "cat /var/lib/dpkg/status" image.img` — pulls the dpkg state from a powered-down SD card.

### `journalctl -D`
**Power:** Replays a captured systemd journal from a different machine.
**Signature move:** `journalctl -D /mnt/captured/var/log/journal -b 0 -p err` — shows you what the driver said before it died.

### `peebles/rpi3-wifi-station-ap` (GitHub)
**Power:** The reference recipe for STA+AP simultaneously on one wifi radio via the `uap0` virtual-interface trick.
**Cameo:** Set up to appear in S01E15 (mgmt AP bake-in).

### Kali ARM (in absentia)
**Power:** Built the Pi distro architecture we eventually adopted (apt-based, not tarball-based).
**Reference:** [`raspberry-pi-zero-2-w.sh`](https://gitlab.com/kalilinux/build-scripts/kali-arm/-/blob/main/raspberry-pi-zero-2-w.sh).
**Sin:** We didn't read it carefully until Arc 8.

## Villains

### `debootstrap --variant=minbase`
**Crime:** Strips `Priority: important` packages including systemd, dbus, openssh-server. Leaves you with no init, no networking, no remote access.
**Sentence:** Add the essentials back to `--include`. Pardoned for use cases that *really* want minimal.

### The Naming Hydra
**Crime:** The Pi Zero 2 W's wifi chip has FOUR official names depending on who you ask:
- **BCM43436** — Pi Foundation marketing
- **BCM43430** — brcmfmac driver source (chip family)
- **CYW43436s** — Cypress (silicon vendor), `s` suffix for rev 1.0
- **cyfmac43430** — Debian's `firmware-brcm80211` filename
**Sentence:** Use the apt-managed firmware-brcm80211 from Pi's repo. It picks the right one for you.

### rfkill (the soft-block at boot)
**Crime:** The Pi kernel boots with wifi rfkill **soft-blocked by default** (regulatory protection). Even with country code set in `wpa_supplicant.conf`, the radio can't transmit. dhclient returns "Network is down" forever.
**Sentence:** Drop a oneshot `systemd-rfkill-unblock.service` that runs `rfkill unblock all` early in boot. Pi OS does this via `raspi-config do_wifi_country`; minbase doesn't, so we wrote our own.

### `dtoverlay=dwc2` (the red herring)
**Crime:** Spent half an arc suspecting this caused wifi failure. It didn't. dwc2 only switches USB controller mode.
**Sentence:** Cleared of all charges. Currently dropped from `config.txt` while we focus on wifi; may return when we want USB OTG.

### `gpu_mem=16` (the other red herring)
**Crime:** Looked guilty for "too aggressive memory restriction." Wasn't.
**Sentence:** Cleared. Currently dropped from `config.txt`; default is fine.

### `txcap_blob: -2` (the alarm bell that wasn't)
**Crime:** Spends 8 lines of dmesg looking alarming, but is purely cosmetic. Documented in [raspberrypi/linux#6317](https://github.com/raspberrypi/linux/issues/6317).
**Sentence:** Ignore.

## NPCs (non-player characters)

### PINN (Pi Imager NOOBS Next-generation)
**Role:** Provided the empirical proof that the Pi Zero 2 W was alive.
**Cameo:** S01E12 — the user flashed PINN to demonstrate the Pi worked. Our scripts didn't.

### `Multipass` (Canonical's lightweight VM)
**Role:** The arm64 build environment. Runs debootstrap, debugfs, journalctl, e2fsck. Lives between flashes.
**Quirk:** Wall-clock drift across day boundaries breaks apt date checks. Fixed via `systemctl restart systemd-timesyncd` in `build-rootfs.sh`.

### macOS `diskutil`
**Role:** Partitions the SD card. Mounts and unmounts FAT.
**Quirk:** Doesn't format ext4 natively. We have to format as FAT32 then dd the ext4 image over.

### The mask-ROM (BCM2837 silicon)
**Role:** Reads `bootcode.bin` from the SD's FAT root.
**Cameo:** S01E13 — the silent judge. No `bootcode.bin` at root, no boot. No appeals.

### iPhone Personal Hotspot (`172.20.10.0/28`)
**Role:** Initially suspected as the network the Pi joined.
**Cameo:** S01E14 final arc — wrong-network detour. Turned out the Pi joined the home wifi (`192.168.0.0/24`). Proxy-ARP on the iPhone hotspot made our subnet scan return false positives.

## Inanimate co-stars

| Object | Role |
|---|---|
| `/dev/disk4` (then `/dev/disk5`, then `/dev/disk6`) | The SD card. macOS reassigns the diskN ordinal on every re-attach, hence the device-path-as-env-var pattern. |
| `boot.tgz` | The boot-firmware tarball. Started as a stale extraction from `raspberrypi/firmware`, eventually regenerated from the apt-installed `/boot/firmware/`. |
| `captured.img` | The 3GB ext4 capture of the SD card's root partition, dd'd back to the Mac for diagnosis. |
| `diagnostic-latest.log` | The output of `diagnose-sd.sh`. The detective's notebook. |

## Final scene

Episode end: all parties at peace. Pi running. SSH working. Bugs filed. Memory entries written. The frontrat sleeps.

→ [Bestiary](./bestiary) · [Credits](./credits) · [Saga index](./)
