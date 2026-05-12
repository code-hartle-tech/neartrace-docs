---
title: 🛠️ Tools
description: The diagnostic toolkit that made the saga survivable.
---

# 🛠️ Tools

## `diagnose-sd.sh` — the SD inspector

Power down Pi → pull SD → plug into Mac → run **one command** → get a full report.

```bash
bash infra/nosferato/bootstrap/diagnose-sd.sh
```

What it does:

1. **Auto-detects** the SD card device (no `/dev/diskN` guessing)
2. `dd` captures the rootfs partition (3GB raw, ~30s)
3. `e2fsck -fy` replays the journal so `debugfs` reads consistently
4. Static rootfs queries via `debugfs`:
   - Does `/sbin/init` exist?
   - Is `/lib/modules/<release>/` present?
   - Are essential packages installed?
   - What's in `/etc/fstab`, `/etc/network/interfaces`, `/etc/passwd`?
   - Which systemd units are enabled in `multi-user.target.wants`?
5. **Loopback-mounts inside Multipass VM** and runs `journalctl -D` against the captured `/var/log/journal/` — actual systemd logs from the failed boot
6. Tails `/var/log/syslog`, dhcp leases, wpa_supplicant configs if present
7. Reads the BOOT FAT partition to confirm `wpa_supplicant.conf` etc.
8. Tees everything to `.build/diagnostic-<timestamp>.log` + a `diagnostic-latest.log` symlink

[**Source**](https://github.com/code-hartle-tech/neartrace-android-mvp/blob/nosferato/infra/nosferato/bootstrap/diagnose-sd.sh)

### Usage modes

```bash
# Auto-detect + capture
bash diagnose-sd.sh

# Reuse last capture (skip the dd)
bash diagnose-sd.sh --no-capture

# Explicit device
bash diagnose-sd.sh /dev/disk6

# Help
bash diagnose-sd.sh --help
```

### Output format

Each section prefixed with `━━ N. <title>` headers. ANSI-colored if the terminal supports it. Plain in the log file (tee-stripped).

Critical sections to check:
- **`5. Rootfs state`** — fs signature, init, modules, packages, fstab, interfaces, users, systemd wants
- **`6. Systemd journal`** — `-b 0` for the boot just captured; ERRORS-only filtered separately
- **`7. BOOT (FAT) partition state`** — confirms `wpa_supplicant.conf`, marker file, config.txt

### When to use

- 🐛 Pi seems dead → check section 5 (boot files present?)
- 🐛 Pi blinks then stops → check section 6 (kernel panic? init missing?)
- 🐛 Pi boots but no wifi → check section 6 errors (rfkill? brcmfmac probe?)
- 🐛 Wifi up but no SSH → check section 5 (ssh.service enabled? sshd config?)

### Required environment

- macOS host (auto-detect uses `diskutil`)
- Multipass VM named `nosferato-builder` running (or it'll start one)
- The VM has `e2fsprogs` installed (auto-installed during first `build.sh` run)

### Anti-patterns

- ❌ Don't tail the log file by hand — it's tee'd to stdout already
- ❌ Don't pull SD before running (auto-detect needs it attached)
- ❌ Don't run while a build is mid-flight (will fail at the dd step or get inconsistent capture)

→ [Source on GitHub](https://github.com/code-hartle-tech/neartrace-android-mvp/blob/nosferato/infra/nosferato/bootstrap/diagnose-sd.sh)

---

## `build.sh` — the SD card builder

Drives a Multipass VM to build the rootfs + boot files, then partitions and flashes the SD.

```bash
# Full clean build (~30-45 min)
./infra/nosferato/bootstrap/build.sh /dev/disk6

# Reuse last build artifacts (skip debootstrap; ~3-5 min)
./infra/nosferato/bootstrap/build.sh --reuse-build /dev/disk6
```

[**Source**](https://github.com/code-hartle-tech/neartrace-android-mvp/blob/nosferato/infra/nosferato/bootstrap/build.sh)

Key features:
- Positional CLI arg for device path (also `NOSFERATO_DEVICE` env var)
- Sudo keepalive: refreshes sudo timestamp every 60s during the 30+ min run
- Safety check: refuses to run against disks lacking a recognized partition label (BOOT, ROOT, PI, nosferato)
- `--reuse-build`: short-circuits VM debootstrap if cached artifacts exist
- 9-step pipeline with colored progress

### Internal pipeline

1. Ensure Multipass VM running
2. Mount shared dirs into VM
3. Run `build-rootfs.sh` in VM (debootstrap, apt-install Pi packages, configure)
4. Generate boot config files (config.txt, cmdline.txt, wpa_supplicant.conf, marker)
5. Partition the SD card (MBR, FAT32 BOOT 256MB + ROOT)
6. `dd` rootfs.img to ROOT partition (raw device, fast)
7. Note: resize2fs deferred to firstboot
8. Mount BOOT, copy config files
9. Eject

### `build-rootfs.sh`

The Linux-side companion. Runs inside the Multipass VM. Does:
- VM clock sync (fixes apt date-skew)
- debootstrap with all `--include` packages
- Pi Foundation apt repo + apt install of `linux-image-rpi-v8` + `raspi-firmware` + `firmware-brcm80211` + `raspberrypi-sys-mods`
- System identity (hostname, user, fstab, network/interfaces)
- rfkill-unblock service
- Persistent journal directory
- Boot.tgz packaged from `/boot/firmware/`

[**Source**](https://github.com/code-hartle-tech/neartrace-android-mvp/blob/nosferato/infra/nosferato/bootstrap/build-rootfs.sh)

→ [The Recipe](/nosferato/recipe/) · [Gotchas](/nosferato/recipe/gotchas)
