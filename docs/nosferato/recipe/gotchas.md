---
title: Gotchas
description: The trap list. Every pitfall we hit, with the fix.
---

# 🩸 Gotchas

> *Save yourself the hours.*

## #1 — `bootcode.bin` at FAT root, NOT in a subdir {#bootcode-at-root}

**Trap:** Mirroring the Linux `/boot/firmware/` convention onto the FAT partition. Your rootfs has `/boot/firmware/bootcode.bin` — fine. The SD's FAT partition is NOT a Linux filesystem. The mask-ROM looks at the partition root.

**Wrong:**
```
/Volumes/BOOT/boot/bootcode.bin    ✗
/Volumes/BOOT/boot/start4.elf      ✗
```

**Right:**
```
/Volumes/BOOT/bootcode.bin         ✓
/Volumes/BOOT/start4.elf           ✓
/Volumes/BOOT/overlays/            ✓
```

→ [S01E13](/nosferato/saga/e13-bootcode-at-the-root)

## #2 — `debootstrap --variant=minbase` strips systemd {#minbase}

**Trap:** `minbase` is more aggressive than you think. It removes all `Priority: important` packages. systemd is one of them.

**Fix:** Add to `--include`:

```
systemd-sysv, dbus, openssh-server, wpasupplicant, wireless-tools,
ifupdown, isc-dhcp-client, rfkill, net-tools, kmod, parted, e2fsprogs
```

→ [Bestiary — Missing Init](/nosferato/saga/bestiary)

## #3 — `/etc/fstab` defaults to "UNCONFIGURED" {#fstab}

**Trap:** debootstrap's default fstab is the comment `# UNCONFIGURED FSTAB FOR BASE SYSTEM`. Nothing mounts. Anything that depends on `/boot/firmware/` (or `/boot/`) silently fails.

**Fix:** Write one explicitly:

```fstab
proc            /proc           proc    defaults                                   0  0
/dev/mmcblk0p1  /boot/firmware  vfat    defaults,flush,nofail                      0  0
/dev/mmcblk0p2  /               ext4    defaults,noatime,errors=remount-ro         0  1
```

## #4 — Mount FAT at `/boot/firmware/`, NOT `/boot/` {#mount-path}

**Trap:** Older Raspbian conventions mounted at `/boot/`. Bookworm switched to `/boot/firmware/`. The `raspi-firmware` apt package and kernel postinst hooks assume the new path. Using `/boot/` breaks apt upgrades.

**Right:** `/dev/mmcblk0p1 /boot/firmware vfat ...`

## #5 — rfkill is soft-blocked at boot {#rfkill}

**Trap:** The Pi kernel boots with wifi rfkill soft-blocked (regulatory safeguard). Setting `country=PT` in `wpa_supplicant.conf` does NOT auto-unblock. Pi OS unblocks via `raspi-config do_wifi_country`. minbase has no raspi-config.

**Symptom:** `wpa_supplicant: rfkill: WLAN soft blocked`, `dhclient: send_packet: Network is down`. Wifi looks like it should work but can't transmit.

**Fix:** A oneshot systemd unit:

```ini
# /etc/systemd/system/nosferato-rfkill.service
[Unit]
Description=Unblock wifi rfkill at boot
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

Then `systemctl enable nosferato-rfkill.service`.

## #6 — Wrong firmware filename for the chip {#firmware-filename}

**Trap:** The Pi Zero 2 W's wifi chip has FOUR naming conventions:
- `BCM43436` (Pi Foundation marketing)
- `BCM43430` (brcmfmac driver, silicon family)
- `CYW43436s` (Cypress, `s` = rev 1.0)
- `cyfmac43430` (Debian's `firmware-brcm80211` filename)

If you fetch the wrong name from a random GitHub URL, the driver loads it but the chip rejects → `HT Avail timeout`.

**Fix:** Don't hand-pick. `apt install firmware-brcm80211` from Pi Foundation's apt repo. apt resolves the rev-specific blob.

## #7 — `journalctl -b -1` vs `-b 0` {#journalctl-flags}

**Trap:** `-b -1` means "the boot BEFORE the current one." If you capture the SD post-shutdown and run `journalctl -D $JD -b -1`, there's no "previous" boot — the SD contains the LAST boot, accessible via `-b 0`.

**Right:** `journalctl -D /path/to/var/log/journal -b 0` for "the boot that happened on this SD before shutdown."

## #8 — macOS reassigns `/dev/diskN` ordinal on each attach {#disk-ordinal}

**Trap:** Hardcoding `/dev/disk5` in your build script. macOS reassigns based on attach order. Your SD might be `disk4` today, `disk6` tomorrow.

**Fix:** Parameterize the device path (env var or CLI arg). Auto-detect via partition label whitelist.

```bash
# safety-check that the target disk has one of YOUR labels
KNOWN_LABELS=(BOOT ROOT PI nosferato)
```

## #9 — diskutil eject can be blocked by Spotlight indexing {#diskutil-eject}

**Trap:** After `cp -R` onto the BOOT partition, `diskutil eject` can fail with "dissented by PID NNNN (mdsync)". Spotlight is indexing your freshly-written FAT.

**Symptom:** "Unmount of disk6 failed: at least one volume could not be unmounted"

**Fix:** It's cosmetic — the data is already synced (we ran `sync` before eject). Just `diskutil eject -force` or pull the SD card.

## #10 — Multipass VM clock drift breaks apt {#multipass-clock}

**Trap:** Multipass VMs that suspend/resume across days have hours of wall-clock drift. apt refuses Release files dated "in the future" relative to the VM clock.

**Symptom:** `E: Release file for ... is not valid yet (invalid for another 3h 17min 18s)`.

**Fix:** Pre-sync the VM clock inside `build-rootfs.sh`:

```bash
systemctl restart systemd-timesyncd
timedatectl set-ntp true
# wait a few sec for convergence
for i in 1 2 3 4 5; do
    timedatectl status | grep -q 'System clock synchronized: yes' && break
    sleep 1
done
```

Plus belt-and-suspenders apt flag: `apt-get -o Acquire::Check-Valid-Until=false update`.

## #11 — iPhone hotspot proxy-ARPs the whole subnet {#proxy-arp}

**Trap:** `ping -c 1 172.20.10.X` returns "alive" for ALL 13 IPs in an iPhone hotspot, because the iPhone responds to ARP for all of them with its own MAC.

**Symptom:** Looks like every IP is alive. Can't tell which one is the Pi.

**Fix:** TCP-scan port 22 instead:

```bash
for i in $(seq 2 14); do
    nc -z -w 2 172.20.10.$i 22 2>&1 | grep succeeded && echo "ssh on .$i"
done
```

Or check the iPhone's hotspot UI under Settings → Personal Hotspot for the connected device list.

## #12 — Pi Zero 2 W has ONE LED, not two {#led-count}

**Trap:** Some Pi models have two LEDs (red PWR + green ACT). The **Pi Zero 2 W has only the green ACT LED**. "No red light" doesn't mean "no power."

**Fix:** Use a USB power meter inline if you need to verify power. For boot status, look at the green LED's **blink pattern**: solid = panic, blinking = SD activity, off = idle.

## #13 — `txcap_blob err=-2` is cosmetic {#txcap}

**Trap:** Looks alarming in dmesg. Easy to assume it's why brcmfmac isn't finishing init.

**Reality:** It's cosmetic. Per [raspberrypi/linux#6317](https://github.com/raspberrypi/linux/issues/6317), the driver completes registration regardless.

**Fix:** Ignore it. Look elsewhere for the real bug.

## #14 — `dtoverlay=dwc2` + `gpu_mem=16` aren't wifi suspects {#dwc2-gpumem}

**Trap:** Modifying random `config.txt` parameters when wifi doesn't work, on the theory that "anything unfamiliar might be the problem."

**Reality:** `dtoverlay=dwc2` only switches USB controller mode (host ↔ gadget). `gpu_mem=16` is fine for headless (default is 76MB but Pi peripheral coprocessors don't actually run out of memory there). Neither affects wifi.

**Fix:** Don't change parameters you don't understand and can't justify. Document the suspect, dismiss it, move on.

→ [The Recipe](./) · [Step-by-Step](./from-scratch) · [Tools](/nosferato/tools/)
