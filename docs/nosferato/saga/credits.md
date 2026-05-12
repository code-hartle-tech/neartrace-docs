---
title: Credits — Sources We Consulted
description: Every URL, repo, forum thread, and primary doc that helped fight bugs.
---

# 🦇 Credits

> *"Nos honram, eles que vieram antes."* — we honor those who came before.

The Nosferato saga ran on shoulders. Here are them.

## Primary docs (the canonical truth)

- 📜 [Raspberry Pi documentation — bootloader](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html) — what the mask-ROM expects, partition layout, boot stages
- 📜 [Raspberry Pi documentation — configuration](https://www.raspberrypi.com/documentation/computers/configuration.html) — config.txt, cmdline.txt reference
- 📜 [Debian `raspi-firmware` package file list](https://packages.debian.org/bookworm/all/raspi-firmware/filelist) — the canonical "where do firmware files live"
- 📜 [`archive.raspberrypi.com/debian`](https://archive.raspberrypi.com/debian/) — Pi Foundation's apt repo. **The breakthrough.**

## Reference implementations

- 🛠️ [Kali ARM build scripts — `raspberry-pi-zero-2-w.sh`](https://gitlab.com/kalilinux/build-scripts/kali-arm/-/blob/main/raspberry-pi-zero-2-w.sh) — the apt-based architecture pattern we eventually adopted. Cite the line `apt-get -y -q install raspi-firmware linux-image-rpi-v8 ...`
- 🛠️ [RPi-Distro/pi-gen](https://github.com/RPi-Distro/pi-gen) — official Pi OS build pipeline. We did NOT use it (sticking to debootstrap base for provenance), but its stage layout informed our thinking.
- 🛠️ [RPi-Distro/firmware-nonfree](https://github.com/RPi-Distro/firmware-nonfree) — the Pi-Foundation-curated firmware tree. Symlinked into our `firmware-brcm80211` install path.
- 🛠️ [peebles/rpi3-wifi-station-ap](https://github.com/peebles/rpi3-wifi-station-ap) — the canonical `uap0`-virtual-interface recipe for STA+AP on one wifi radio. Slated for S01E15 (mgmt AP bake-in).

## Critical issues / forum threads

- 🐛 [Raspberry Pi forum t=380824 — Missing wlan0 on Pi Zero 2 W Rev 1.0](https://forums.raspberrypi.com/viewtopic.php?t=380824) — exact symptom we hit in Arc 7
- 🐛 [Raspberry Pi forum t=366620 — Bullseye→Bookworm breaks wifi on Pi 0W (regulatory.db fix)](https://forums.raspberrypi.com/viewtopic.php?t=366620) — the regulatory.db / rfkill-unblock connection
- 🐛 [raspberrypi/linux#6317 — txcap_blob err=-2 is cosmetic](https://github.com/raspberrypi/linux/issues/6317) — saved us from chasing a red herring
- 🐛 [RPi-Distro/firmware-nonfree#27 — BCM43430/2 firmware](https://github.com/RPi-Distro/firmware-nonfree/issues/27) — the silicon-rev naming maze
- 🐛 [Arch Linux ARM forum — brcmfmac43436 firmware missing](https://archlinuxarm.org/forum/viewtopic.php?f=64&t=16035) — confirmation that the naming hydra is real

## Tooling — the diagnostic toolkit

- 🔧 [`debugfs`](https://man7.org/linux/man-pages/man8/debugfs.8.html) — `e2fsprogs` swiss-army knife. Read ext4 partitions without mounting.
- 🔧 [`journalctl -D /path`](https://man7.org/linux/man-pages/man1/journalctl.1.html) — replay captured systemd journals from elsewhere
- 🔧 [`multipass` (Canonical)](https://multipass.run/) — lightweight Ubuntu VMs on macOS, arm64 native
- 🔧 [`debootstrap`](https://salsa.debian.org/installer-team/debootstrap) — bootstrap a Debian root from scratch
- 🔧 [`e2fsck -fy`](https://man7.org/linux/man-pages/man8/e2fsck.8.html) — replay a captured ext4 journal so debugfs reads consistently

## Companion tools / distros surveyed (didn't switch to, learned from)

- [DietPi](https://dietpi.com) — what minimal-Debian-on-Pi looks like
- [Alpine Linux for Raspberry Pi](https://wiki.alpinelinux.org/wiki/Raspberry_Pi) — tiny-musl approach (~150MB)
- [OpenWrt for bcm27xx](https://openwrt.org/toh/raspberry_pi_foundation/raspberry_pi) — pure wifi-router OS
- [Buildroot raspberrypizero2w_64_defconfig](https://github.com/buildroot/buildroot/tree/master/board/raspberrypi) — assemble-from-scratch route

## Acknowledgements

- **Pi Foundation** — for `archive.raspberrypi.com/debian`. Saved the day in Arc 8.
- **Cypress / Broadcom** — for the BCM43430 family of wifi chips (despite the naming chaos).
- **The user** — for the empirical proof in S01E12 (flashed PINN, demonstrated the Pi was alive), for redirecting us to "stop guessing" in Arc 8 (the moment we abandoned trial-and-error and did proper research), and for the **NOS-FERA-RATO** etymology that gives this whole thing its identity. *Nos honram.*

## Citation format

If you re-use any of this in your own writing or another project:

```
S01E14 of the Nosferato saga, NearTrace project, Hartle Tech.
https://docs.neartrace.app/nosferato/saga/e14-whack-a-mole
2026-05-12
```

→ [Saga index](./) · [Bestiary](./bestiary) · [Cast](./cast)
