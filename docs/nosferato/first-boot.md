# First boot

The first power-up is the longest one. The Pi has to:

1. Complete second-stage debootstrap (postinst scripts run on the
   actual hardware now)
2. Apply minimal config (hostname, fstab, apt sources, dpkg
   no-doc/no-locale rules)
3. Bring up wifi STA on `IoT` for internet
4. `apt update` + install **runit-init** — this is the moment
   systemd-sysv gets dropped and runit takes PID 1
5. Install the tool stack + bluez + nexmon build deps
6. Create the `nt:nt` user, NOPASSWD sudo, autologin getty on tty1
7. Build nexmon for BCM43436 (~15 min)
8. Patched firmware lands in `/lib/firmware/brcm/`
9. Configure runit services (sshd, wpa_supplicant, dhclient,
   hostapd for `nosferato-mgmt`, dnsmasq for AP+tether)
10. Set up USB OTG `g_multi` composite gadget
11. Strip locales, docs (~80MB recovered)
12. Self-disable + reboot

Total: 30–45 min depending on apt mirror speed.

## Watching it happen

Two ways:

- **Serial console** — UART on GPIO 14/15 at 115200 baud. Anything
  with a USB-TTL adapter (e.g. a CP2102) will show every step.
- **Tail the log after the fact** — once the rig is reachable,
  `cat /var/log/nosferato-firstboot.log`.

## When something fails

The only step likely to bite is the nexmon build (it pulls
~200MB of build deps + cross-compiles a kernel module). If it does:

```sh
ssh nt@10.10.10.1
cd ~/nexmon
source setup_env.sh
cd patches/bcm43436b0/9_88_4_65/nexmon
make
sudo cp brcmfmac43436-sdio.bin /lib/firmware/brcm/
sudo reboot
```

Everything else is idempotent — re-trigger by re-creating
`/boot/nosferato-firstboot` and rebooting. (You probably don't
want to though — it'll re-clone nexmon.)
