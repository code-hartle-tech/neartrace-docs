# Build & flash the SD

Single-shot from a Mac on Apple Silicon. Whole thing takes ~15 min.

## What you need

- A Raspberry Pi Zero 2 W
- A microSD card (8GB+) labelled **`pi`** (the bootstrap script
  refuses to touch any other device)
- macOS with [Multipass](https://multipass.run) installed
  (`brew install multipass` if not)
- The `nosferato` branch of the NearTrace repo

## Run

```sh
git checkout nosferato
chmod +x infra/nosferato/bootstrap/*.sh infra/nosferato/firstboot/*.sh
sudo infra/nosferato/bootstrap/build.sh
```

The script:

1. Verifies `/dev/disk5` is the SD with label `pi`. Aborts otherwise.
2. Spins up an arm64 Multipass VM (~2 min, only the first run).
3. Inside the VM: debootstrap into a loopback ext4 image.
4. Pulls Raspberry Pi firmware blobs (start.elf, fixup.dat,
   bcm2710-rpi-zero-2-w.dtb, kernel8.img).
5. Mac side: partition the SD (256MB FAT32 + remainder).
6. dd the rootfs image onto the SD's root partition.
7. Mount FAT, drop config + firstboot script + firmware blobs.
8. Eject.

## Then

Slot the SD into the Pi, power it on. First boot takes ~30–45 min
(it's where systemd → runit swap, tool install, and the nexmon build
live). Don't unplug. See [first boot](./first-boot) for what to
expect.
