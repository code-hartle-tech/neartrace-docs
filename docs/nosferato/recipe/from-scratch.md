---
title: From-Scratch Build
description: The actual commands to build a working NosferatOS image for Pi Zero 2 W.
---

# 🩸 From-Scratch Build

> *"Boots in 9 seconds. SSH-able. Tested 2026-05-12."*

::: warning Prereqs
- macOS host with [Multipass](https://multipass.run) installed (or any Linux host)
- Multipass arm64 VM with internet (or any Linux arm64 host)
- A microSD card (≥8GB recommended)
- ~2GB free disk for the rootfs image staging
:::

## Phase 1 — debootstrap base

Inside the Linux/Multipass VM, as root:

```bash
ROOTFS=/mnt/rootfs
mkdir -p "$ROOTFS"

# Allocate a 3GB rootfs image
ROOTFS_IMG=/tmp/rootfs.img
truncate -s 3072M "$ROOTFS_IMG"
mkfs.ext4 -F -L nosferato "$ROOTFS_IMG"
mount -o loop "$ROOTFS_IMG" "$ROOTFS"

# debootstrap with all components (non-free-firmware is required for firmware-brcm80211 later)
debootstrap \
    --arch=arm64 \
    --variant=minbase \
    --components=main,contrib,non-free,non-free-firmware \
    --include=ca-certificates,wget,curl,gnupg,sudo,kmod,iproute2,iputils-ping,less,vim-tiny,nano,locales,systemd-sysv,openssh-server,wpasupplicant,wireless-tools,ifupdown,isc-dhcp-client,net-tools,rfkill,parted,e2fsprogs,dbus \
    bookworm \
    "$ROOTFS" \
    http://deb.debian.org/debian
```

## Phase 2 — chroot setup

```bash
# Bind mounts for chroot
mount --bind /proc "$ROOTFS/proc"
mount --bind /sys "$ROOTFS/sys"
mount --bind /dev "$ROOTFS/dev"
mount --bind /dev/pts "$ROOTFS/dev/pts"
cp /etc/resolv.conf "$ROOTFS/etc/resolv.conf"
```

## Phase 3 — Add Pi Foundation apt repo (the breakthrough)

```bash
chroot "$ROOTFS" /bin/bash -c '
    set -e
    export DEBIAN_FRONTEND=noninteractive
    
    mkdir -p /etc/apt/keyrings
    wget -qO - https://archive.raspberrypi.com/debian/raspberrypi.gpg.key | \
        gpg --dearmor -o /etc/apt/keyrings/raspberrypi-archive-keyring.gpg
    
    cat > /etc/apt/sources.list.d/raspi.list << EOF
deb [signed-by=/etc/apt/keyrings/raspberrypi-archive-keyring.gpg] http://archive.raspberrypi.com/debian bookworm main
EOF
    
    apt-get update -qq
    apt-get install -qq -y --no-install-recommends \
        linux-image-rpi-v8 raspi-firmware firmware-brcm80211 raspberrypi-sys-mods
'
```

This installs:
- `linux-image-rpi-v8` (Pi-Foundation arm64 kernel, e.g. 6.12.75+rpt-rpi-v8)
- Matching kernel modules tree at `/lib/modules/<release>/`
- `raspi-firmware` populates `/boot/firmware/` with bootcode + start.elf + dtbs + initramfs8
- `firmware-brcm80211` (Pi-curated) — the right wifi blobs
- `raspberrypi-sys-mods` — Pi-specific systemd units

## Phase 4 — Configure system identity

```bash
chroot "$ROOTFS" /bin/bash -c '
    echo "nosferato" > /etc/hostname
    cat > /etc/hosts << EOF
127.0.0.1   localhost
127.0.1.1   nosferato
::1         localhost ip6-localhost ip6-loopback
EOF
    
    # Create user nt with sudo
    useradd -m -s /bin/bash -G sudo nt
    echo "nt:nt" | chpasswd
    echo "root:nt" | chpasswd
    
    # Enable ssh + networking
    systemctl enable ssh
    systemctl enable networking
'
```

## Phase 5 — fstab (Bookworm convention: FAT at /boot/firmware/)

```bash
cat > "$ROOTFS/etc/fstab" << EOF
proc            /proc           proc    defaults                                   0  0
/dev/mmcblk0p1  /boot/firmware  vfat    defaults,flush,nofail                      0  0
/dev/mmcblk0p2  /               ext4    defaults,noatime,errors=remount-ro         0  1
EOF
```

## Phase 6 — /etc/network/interfaces

```bash
cat > "$ROOTFS/etc/network/interfaces" << 'EOF'
auto lo
iface lo inet loopback

allow-hotplug wlan0
iface wlan0 inet dhcp
    wpa-conf /boot/firmware/wpa_supplicant.conf
EOF
```

## Phase 7 — rfkill unblock oneshot (CRITICAL)

```bash
cat > "$ROOTFS/etc/systemd/system/nosferato-rfkill.service" << 'EOF'
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
EOF
chroot "$ROOTFS" systemctl enable nosferato-rfkill.service
```

Without this, wifi country gets set but the radio stays blocked. dhclient returns "Network is down" forever.

## Phase 8 — Persistent journal

```bash
mkdir -p "$ROOTFS/var/log/journal"
```

## Phase 9 — Cleanup chroot

```bash
umount "$ROOTFS/dev/pts" "$ROOTFS/dev" "$ROOTFS/sys" "$ROOTFS/proc"
sync
umount "$ROOTFS"
# $ROOTFS_IMG is now ready to flash to SD card's root partition
```

## Phase 10 — Stage BOOT partition contents

The FAT BOOT partition needs everything from `/boot/firmware/` of the rootfs:

```bash
# Re-mount rootfs to extract /boot/firmware/
mount -o loop "$ROOTFS_IMG" "$ROOTFS"
BOOT_STAGE=/tmp/boot-stage
mkdir -p "$BOOT_STAGE"
cp -R "$ROOTFS/boot/firmware/." "$BOOT_STAGE/"

# Add your wpa_supplicant.conf for the IoT/STA network
cat > "$BOOT_STAGE/wpa_supplicant.conf" << EOF
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=PT

network={
    ssid="YourIoTSSID"
    psk="YourPSK"
    key_mgmt=WPA-PSK
}
EOF

# Override config.txt if you want custom settings (the raspi-firmware default is fine)
cat > "$BOOT_STAGE/config.txt" << EOF
arm_64bit=1
enable_uart=1
disable_overscan=1
dtparam=audio=off
camera_auto_detect=0
display_auto_detect=0
EOF

cat > "$BOOT_STAGE/cmdline.txt" << EOF
console=serial0,115200 console=tty1 root=/dev/mmcblk0p2 rootfstype=ext4 fsck.repair=yes rootwait
EOF

umount "$ROOTFS"
```

## Phase 11 — Flash to SD

::: warning macOS specifics
On macOS use `diskutil partitionDisk` + `dd` to the raw `/dev/rdiskNs2` for ~4× speed.
:::

```bash
# Identify SD card device
SD=/dev/disk6   # or whatever — verify with `diskutil list external`
sudo diskutil unmountDisk "$SD"

# Partition: BOOT (FAT32, 256MB) + ROOT (we format FAT then dd ext4 over it)
sudo diskutil partitionDisk "$SD" 2 MBR \
    "MS-DOS FAT32" BOOT 256MB \
    "MS-DOS FAT32" ROOT R

# dd rootfs (raw device for speed)
sudo dd if="$ROOTFS_IMG" of="${SD/disk/rdisk}s2" bs=4m

# Mount BOOT and copy boot files
sudo diskutil mount "${SD}s1"
cp -R "$BOOT_STAGE/." /Volumes/BOOT/
sync
sudo diskutil eject "$SD"
```

## Phase 12 — Boot

Slot SD into the Pi. Power on. Within 9 seconds:
- Green ACT LED idle-blinks (active SD reads during boot, then quiet)
- Pi joins the wifi from `wpa_supplicant.conf`
- DHCP grants an IP
- sshd listens on port 22

To find the Pi from another device on the same network:

```bash
# arp the local subnet
sudo nmap -sn 192.168.0.0/24      # or your subnet
# look for Pi Foundation OUI (2c:cf:67, b8:27:eb, dc:a6:32, e4:5f:01)
arp -a | grep -i "2c:cf:67"
```

Then:

```bash
ssh nt@<pi-ip>
# password: nt
```

🦇 **NOSFERATO LIVES.**

→ [Gotchas](./gotchas) — pitfalls to watch
→ [Tools](/nosferato/tools/) — `diagnose-sd.sh` for when it doesn't work
