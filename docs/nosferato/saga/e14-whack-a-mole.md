---
title: S01E14 — Fourteen Hours in the Forest
description: The whack-a-mole saga. Twelve specific bugs. One apt repo. One working SSH.
---

# 🦇 S01E14 — Fourteen Hours in the Forest

> *"I have become Death, destroyer of stack traces."*

::: tip TL;DR
With E13's fix, the Pi finally booted to the kernel — but for **fourteen hours** afterwards, every step in userspace failed in a new way. Missing init system. Missing networking. Missing dbus. Wrong firmware filenames. Wrong nvram. Wrong silicon variant. rfkill soft-block. The breakthrough was abandoning manual file extraction and using **Pi Foundation's apt repo** instead. One `apt install`, the entire kernel↔firmware↔modules triple resolves correctly, wlan0 registers, DHCP works, SSH works. The lesson: when a curated set exists, use it.
:::

## Cast

| Role | Name |
|---|---|
| Protagonist | the Pi Zero 2 W |
| Antagonist | every default in `debootstrap --variant=minbase` |
| Mentor (offscreen) | Pi Foundation, who curated the apt repo we ignored |
| Recurring villain | "the BCM43436/BCM43430/CYW43436s naming hydra" |
| Final-boss-revealed-as-friend | `firmware-brcm80211` from archive.raspberrypi.com |

→ See full [Cast](./cast) and [Bestiary](./bestiary).

## Episode arcs

### Arc 1 — "Where is /sbin/init?"

After E13, the Pi blinks then stays solid green. Looks alive but unresponsive. We capture the rootfs via `dd` on the SD card (it's still on the user's desk), mount it loopback in Multipass VM, run `debugfs` queries:

```
=== /sbin/init exists? (PID 1) ===
(empty)

=== /lib/systemd/systemd exists? ===
(empty)

=== installed packages — systemd / openssh / wpasupplicant ===
(empty)
```

**Nothing.** No init. No systemd. No ssh. No wifi tools.

`debootstrap --variant=minbase` strips `Priority: important` packages. systemd is `Priority: important`, not `Priority: required`. So minbase has no init system. Kernel boots, tries `/sbin/init`, file doesn't exist, **kernel panic** ("No working init found"). Panic = LED frozen in last state → solid green.

::: details The smoking gun
```
$ debugfs -R "stat /sbin/init" captured.img
/sbin/init: File not found by ext2_lookup
```
:::

→ Filed [#388 — S01E14 issue](https://github.com/code-hartle-tech/neartrace-android-mvp/issues/388).
→ Fix: `--include=systemd-sysv,openssh-server,wpasupplicant,wireless-tools,ifupdown,isc-dhcp-client,net-tools,rfkill,parted,e2fsprogs,dbus` added to debootstrap.

### Arc 2 — "Where is /boot mounted?"

Init installed, kernel boots, but `rc.local` doesn't fire `firstboot.sh`. Why? It checks `[ -f /boot/nosferato-firstboot ]` for the trigger marker. We *put* the marker on the FAT BOOT partition. But the FAT partition never mounted — `/etc/fstab` was the debootstrap default:

```
# UNCONFIGURED FSTAB FOR BASE SYSTEM
```

So `/boot` was a vestigial empty directory in the rootfs. Marker invisible. Firstboot never triggered.

→ Fix: write a real fstab in `build-rootfs.sh`:

```fstab
proc            /proc           proc    defaults                                   0  0
/dev/mmcblk0p1  /boot           vfat    defaults,flush,nofail                      0  0
/dev/mmcblk0p2  /               ext4    defaults,noatime,errors=remount-ro         0  1
```

### Arc 3 — "Where are the kernel modules?"

After fstab fix, `/boot` mounts, marker visible, `firstboot.sh` runs. But wifi still doesn't come up. We re-dd, re-mount, re-`debugfs`:

```
=== /lib/modules — kernel modules dir? ===
/lib/modules: File not found by ext2_lookup
```

**No kernel modules.** Pi kernel from `raspberrypi/firmware`'s `stable.tar.gz` ships kernel image + module tree. We extracted the kernel image into the BOOT partition but forgot to copy the module tree into `/lib/modules/<release>/` of the rootfs. Without modules: no `vfat`, no `brcmfmac`, no usb-host, nothing.

→ Fix: copy `/tmp/fw/modules/*-v8+/` → `$ROOTFS_MNT/lib/modules/` during `build-rootfs.sh`.

### Arc 4 — "Where does brcmfmac auto-load from?"

Modules now present. Reflash, boot. We have `wlan0`. Wait — do we?

```
$ journalctl -k | grep -iE '(mmc1|brcmfmac|wlan)'
mmc1: new high speed SDIO card at address 0001
(nothing else)
```

SDIO bus enumerates the wifi chip. But no `brcmfmac` probe. The udev cold-plug never fired a modprobe for the chip. Why?

We grep `modules.alias` for SDIO IDs:

```bash
$ grep brcmfmac modules.alias | grep '^alias sdio:'
alias sdio:c*v02D0d4345*  brcmfmac    # Pi 3B+
alias sdio:c*v02D0d4354*  brcmfmac    # Pi 3
alias sdio:c*v02D0dA9A6*  brcmfmac    # <-- CYW43436 (Pi Zero 2 W?)
... (32 entries total)
```

Pi Zero 2 W's wifi chip reports `0xa9a6`. Matches. Should auto-load. Doesn't.

This was the moment we stopped trusting udev and force-loaded the driver via `/etc/modules-load.d/nosferato-wifi.conf`:

```
brcmfmac
brcmutil
cfg80211
```

→ Fix: created the modules-load.d config + ensured systemd-modules-load.service runs early.

### Arc 5 — "wpa_supplicant talks to dbus over what?"

Wifi driver loaded! Reflash. Boot. wpa_supplicant.service starts:

```
wpa_supplicant: dbus: Could not acquire the system bus:
    org.freedesktop.DBus.Error.FileNotFound -
    Failed to connect to socket /run/dbus/system_bus_socket
wpa_supplicant: Failed to initialize wpa_supplicant
```

No dbus. `wpasupplicant` package only *recommends* dbus — and minbase doesn't install recommends. The systemd unit for wpa_supplicant needs dbus.

→ Fix: added `dbus` to `--include`.

### Arc 6 — "Why does the firmware say it loaded but the chip is silent?"

dbus installed. wpa_supplicant starts cleanly. But the chip:

```
brcmfmac: F1 signature read @0x18000000=0x1541a9a6
brcmfmac: brcmf_fw_alloc_request: using brcm/brcmfmac43430-sdio for chip BCM43430/1
brcmfmac mmc1:0001:1: Direct firmware load for brcm/brcmfmac43430-sdio.raspberrypi,model-zero-2-w.bin failed with error -2
brcmfmac mmc1:0001:1: Direct firmware load for brcm/brcmfmac43430-sdio.bin failed with error -2
```

`-2 ENOENT`. We have files named `brcmfmac43436-sdio.bin` from RPi-Distro. Driver wants `brcmfmac43430-sdio.*`. The chip's silicon ID maps to "43430" inside brcmfmac source, even though the Pi Foundation markets the chip as "BCM43436."

This was the **naming hydra**:

| Name | Where it comes from |
|---|---|
| BCM43436 | Pi Foundation marketing (the Pi Zero 2 W's chip) |
| BCM43430 | brcmfmac source-tree chip name (silicon family) |
| CYW43436s | Cypress (silicon vendor) — `s` suffix for rev 1.0 |
| cyfmac43430 | Debian's `firmware-brcm80211` package — Cypress naming |

→ Tried fix: symlinks `brcmfmac43430-sdio.* → brcmfmac43436-sdio.*`. Driver loads the file. Boot continues.

But the chip stays in `HT Avail timeout` — firmware loaded but the chip never enters HT clock state. Means: wrong firmware-for-chip-rev. The "43436" file we had was for a DIFFERENT silicon revision than our actual chip.

### Arc 7 — "The Pi Foundation's chip ID is not the chip's chip ID"

We dig deeper. Read brcmfmac source. Inspect the actual firmware blob bytes. Try the `43436s` (with `s` suffix, for older rev). Try Debian's Cypress firmware (`cyfmac43430-sdio.bin`). Try Pi 3's nvram (`brcmfmac43430-sdio.raspberrypi,3-model-b.txt`) as a fallback. Each combination → different new failure mode.

After hours of trying combinations:

```
$ brcmfmac: brcmf_c_preinit_dcmds: Firmware: BCM43430/1 wl0: Jun 14 2023 07:27:45 version 7.45.96.s1 (gf031a129) FWID 01-70bd2af7 es7
```

**Chip started.** `preinit_dcmds` succeeded. Wifi firmware running. But… `wlan0` still didn't register. The driver completed preinit and then *fell silent*. No `register_netdev`. No interface. Wpa_supplicant has nothing to bind to.

[Raspberry Pi forum thread t=380824](https://forums.raspberrypi.com/viewtopic.php?t=380824) describes the exact symptom: firmware loads, no wlan0. Suggested cause: kernel↔firmware version skew.

### Arc 8 — The breakthrough

We stopped guessing. Ran proper research. Discovered the architecture every successful Pi distro uses:

**`archive.raspberrypi.com/debian` is an apt repo.** It ships:

- `linux-image-rpi-v8` — Pi Foundation's arm64 kernel + matching modules
- `raspi-firmware` — bootloader blobs, dtbs, initramfs hooks
- `firmware-brcm80211` (Pi-curated, not Debian's) — the right wifi firmware
- `raspberrypi-sys-mods` — Pi-specific systemd units (sshswitch, display-backlight, etc.)

apt resolves dependencies. apt resolves kernel↔modules version match. apt resolves firmware↔chip-rev match. Everything we'd been hand-assembling, Pi Foundation pre-tested.

We added the repo to our chroot, ran `apt install linux-image-rpi-v8 raspi-firmware firmware-brcm80211 raspberrypi-sys-mods`, regenerated `boot.tgz` from the apt-installed `/boot/firmware/`, updated `/etc/fstab` to mount the FAT at `/boot/firmware/` (Bookworm convention)…

…and the next flash gave us:

```
Jun 26 15:58:42 nosferato kernel: brcmfmac: brcmf_c_preinit_dcmds: Firmware: BCM43430/1 wl0: ...
Jun 26 15:58:43 nosferato systemd[1]: Expecting device sys-subsystem-net-devices-wlan0.device
Jun 26 15:58:43 nosferato systemd[1]: Found device sys-subsystem-net-devices-wlan0.device
Jun 26 15:58:43 nosferato systemd[1]: Started ifup@wlan0.service - ifup for wlan0
```

**wlan0 registered.** First time in the whole saga.

### Arc 9 — "rfkill: WLAN soft blocked"

But wifi didn't transmit:

```
wpa_supplicant: rfkill: WLAN soft blocked
dhclient: send_packet: Network is down
```

Pi kernel default: wifi rfkill soft-blocked at boot (regulatory protection). Pi OS lifts it via `raspi-config do_wifi_country`. We don't have raspi-config. **One-shot fix:**

```ini
# /etc/systemd/system/nosferato-rfkill.service
[Unit]
Description=Nosferato — unblock wifi rfkill at boot
DefaultDependencies=no
Before=network-pre.target wpa_supplicant.service ifupdown-pre.service
After=local-fs.target
Wants=network-pre.target

[Service]
Type=oneshot
ExecStart=/usr/sbin/rfkill unblock all
RemainAfterExit=yes

[Install]
WantedBy=sysinit.target
```

→ Commit [`b28eeb9`](https://github.com/code-hartle-tech/neartrace-android-mvp/commit/b28eeb9)

## The final ten minutes

After hours of bug-hunting, the actual winning sequence was minutes:

1. Apt-install `linux-image-rpi-v8 raspi-firmware firmware-brcm80211 raspberrypi-sys-mods` — 2 minutes.
2. Add `rfkill unblock` oneshot — 30 seconds.
3. Reflash — 90 seconds.
4. SSH in — instant.

```
~/Projects/neartrace-android-mvp nosferato* 1m 19s
❯ ssh nt@192.168.0.129
nt@nosferato:~$ uname -a
Linux nosferato 6.12.75+rpt-rpi-v8 #1 SMP PREEMPT Debian 1:6.12.75-1+rpt1~bookworm (2026-03-11) aarch64
```

🦇 **NOSFERATO LIVES.**

## Final score

| Stat | Number |
|---|---|
| Hours debugging | ~14 |
| Distinct bugs fought | 12 |
| Re-flashes | 8 |
| Diagnostic captures | 6 |
| GitHub issues filed | 2 (#387, #388) |
| Commits to fix | 11 |
| Lines of stale firmware files we no longer need | ~50 |
| Lines of script that survived | ~600 |
| Boot time (final) | **9 seconds** |
| MAC address of the Pi | `2c:cf:67:a6:76:03` |
| IP from home router | `192.168.0.129` |

## Lessons banked

1. **For ANY custom Pi distro: use the Pi Foundation apt repo.** Don't hand-extract from upstream tarballs. [`feedback_custom_pi_distro_lessons.md`](#).

2. **`debootstrap --variant=minbase` is too aggressive** for embedded work. Always add back: `systemd-sysv, dbus, openssh-server, wpasupplicant, wireless-tools, ifupdown, isc-dhcp-client, rfkill, net-tools`.

3. **Mount FAT at `/boot/firmware/` on Bookworm**, not `/boot/`. apt upgrades break otherwise.

4. **The Pi kernel boots with wifi rfkill soft-blocked.** Always add a `rfkill unblock all` oneshot if you don't have `raspi-config`.

5. **Silent driver failures are the hardest bugs.** Always reach for `journalctl -D /path/to/captured/journal -b 0` to see what the driver *did* say, not just what it didn't.

6. **`debugfs -R "..."`** can read ext4 partitions without mounting — gold for diagnosing a dead SD card from another machine.

## What's next

- 🚧 **Mgmt AP (`nosferato-mgmt`)** — uap0 virtual interface + hostapd + dnsmasq. Recipe verified, bake-in pending.
- 📋 **Nexmon driver** for monitor mode + injection.
- 📋 **USB OTG tether** to the Android NearTrace app.
- 📋 **First-boot orchestrator** for heavyweight install (tools, NSFAS-specific configs).
- 🧹 **Source-level refactor of `build-rootfs.sh`** — fold the patch-in-place changes back into the source. Current script doesn't produce a clean working image from scratch; needs ~30 min refactor.

## Saga close

> *"Just files in the right places."* — user, ten minutes after we logged in successfully.

The whole 14-hour saga, distilled. We did it from scratch. We did it ourselves. We did it the hard way. And we have the receipts.

→ [**The Recipe**](/nosferato/recipe/) — copy-paste this, never read the saga again
→ [**Bestiary**](./bestiary) — every bug, classified
→ [**Credits**](./credits) — external sources

## Source links

### Issues
- [#386 — Hardware diagnosis (closed; misdiagnosis)](https://github.com/code-hartle-tech/neartrace-android-mvp/issues/386)
- [#387 — bootcode.bin must live at FAT root](https://github.com/code-hartle-tech/neartrace-android-mvp/issues/387)
- [#388 — rootfs needs init + ssh + wifi at build time](https://github.com/code-hartle-tech/neartrace-android-mvp/issues/388)

### Commits (the war chronicle)
- [`ef0aa1f`](https://github.com/code-hartle-tech/neartrace-android-mvp/commit/ef0aa1f) — bootcode at FAT root (E13)
- [`c6199c9`](https://github.com/code-hartle-tech/neartrace-android-mvp/commit/c6199c9) — device path env var + sudo keepalive
- [`af2d7fe`](https://github.com/code-hartle-tech/neartrace-android-mvp/commit/af2d7fe) — exact-label safety check (so we don't trash the RPi Imager DMG)
- [`69bccbd`](https://github.com/code-hartle-tech/neartrace-android-mvp/commit/69bccbd) — bake init + ssh + wifi at build time
- [`4fc58b6`](https://github.com/code-hartle-tech/neartrace-android-mvp/commit/4fc58b6) — copy kernel modules + nofail /boot
- [`34e88d1`](https://github.com/code-hartle-tech/neartrace-android-mvp/commit/34e88d1) — dbus + force-load brcmfmac + drop g_multi
- [`c54cd1e`](https://github.com/code-hartle-tech/neartrace-android-mvp/commit/c54cd1e) — symlink brcmfmac43430 → brcmfmac43436 (the wrong fix)
- [`e5c9b94`](https://github.com/code-hartle-tech/neartrace-android-mvp/commit/e5c9b94) — Debian firmware-brcm80211 + Pi-Zero-2-W board nvram
- [`2a0ce5f`](https://github.com/code-hartle-tech/neartrace-android-mvp/commit/2a0ce5f) — drop dtoverlay=dwc2 + gpu_mem=16 (dead end)
- [`b28eeb9`](https://github.com/code-hartle-tech/neartrace-android-mvp/commit/b28eeb9) — **rfkill unblock oneshot at boot** (the final fix)

### External
- [Raspberry Pi forum: missing wlan0 on Pi Zero 2 W Rev 1.0](https://forums.raspberrypi.com/viewtopic.php?t=380824)
- [Raspberry Pi forum: regulatory.db fix](https://forums.raspberrypi.com/viewtopic.php?t=366620)
- [RPi-Distro/firmware-nonfree (the right blobs)](https://github.com/RPi-Distro/firmware-nonfree)
- [Kali ARM `raspberry-pi-zero-2-w.sh` build script](https://gitlab.com/kalilinux/build-scripts/kali-arm/-/blob/main/raspberry-pi-zero-2-w.sh) — the apt-based pattern we eventually adopted
- [raspberrypi/linux issue #6317 — txcap_blob warning is cosmetic](https://github.com/raspberrypi/linux/issues/6317)

## Anime equivalents

If this saga were an anime:

- Arcs 1-3 (init/fstab/modules): **the training arc** — recognize you're underprepared, fix your loadout.
- Arcs 4-7 (firmware names hydra): **the false-victory arc** — keep "winning" only to find the boss had a transformation phase.
- Arc 8 (apt repo): **the mentor reveal** — the entire technique you needed was sitting in `apt-get install` the whole time.
- Arc 9 (rfkill): **the final filler episode** — small thing, fast fix, victory.

> *"Time stop. Your move is forfeit."* — Dio Brando, JoJo's Bizarre Adventure.
> The Pi was the time-stopped victim. We were Dio.
