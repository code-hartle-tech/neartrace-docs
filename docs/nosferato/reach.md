# Reach the rig

Three independent paths in. Pick whichever fits your situation.

## 1. Wireless management AP (default)

The Pi exposes a wifi network purely for managing it.

| Field | Value |
|---|---|
| SSID | `nosferato-mgmt` |
| Password | `nosferato2026` |
| Pi address | `10.10.10.1` |
| DHCP range | `10.10.10.10–50` |

```sh
ssh nt@10.10.10.1   # password: nt
```

## 2. USB OTG tether

Plug the **inner** micro-USB (the one closer to the HDMI port — it's
the data port; the outer one is power-only) into your machine.

The Pi appears as a virtual ethernet adapter:

| Field | Value |
|---|---|
| Pi address | `192.168.7.1` |
| DHCP range | `192.168.7.2–20` |

If your OS doesn't grab DHCP automatically, set the client manually
to `192.168.7.2/24`, gateway `192.168.7.1`, then:

```sh
ssh nt@192.168.7.1
```

## 3. Whatever your IoT wifi gave it

On first boot the Pi joins your `IoT` network as a normal client.
Find its IP via your router admin or:

```sh
arp -a | grep -i nosferato
```

Then SSH normally.

## Once you're in

You're `nt`. You have NOPASSWD sudo. You have:

```sh
which aircrack-ng hcxdumptool nmap tshark bettercap
ip a                       # see uap0 (mgmt AP) + wlan0 (STA) + usb0 (tether)
sudo iw wlan0 set monitor control     # nexmon test
sudo iw wlan0 set type managed        # back to STA mode
```
