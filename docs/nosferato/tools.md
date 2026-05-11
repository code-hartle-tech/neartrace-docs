# The tool stack

Top 10 wifi/ble pen-test tools, all preinstalled at first boot.

| Tool | What it does |
|---|---|
| **aircrack-ng** | The deauth + WEP/WPA cracking suite. `aireplay-ng` for injection tests, `airodump-ng` for capture. |
| **hcxdumptool** | Modern PMKID + handshake capture, replaces older `airodump-ng` workflows for WPA2/3 cracking inputs. |
| **hcxtools** | The conversion suite — `hcxpcapngtool` turns captures into hashcat input. |
| **mdk4** | Stress-test framework: beacon flood, deauth flood, probe response flood. Use for testing your own AP's resilience. |
| **bettercap** | Swiss army knife for MITM, ARP spoofing, BLE recon, captive-portal attacks. Web UI on port 8083. |
| **kismet** | Passive multi-band sniffer. Detects rogue APs, runs continuously, logs everything. Web UI on port 2501. |
| **nmap** | The classic. Network discovery + service fingerprinting. |
| **tshark** | Wireshark CLI. Decode PCAPs without leaving the terminal. |
| **tcpdump** | The other classic. Lower-level than tshark, perfect for packet ring-buffers. |
| **reaver** | WPS PIN brute-force (Pixie Dust + classic). Targets routers with WPS still enabled. |

Plus the BLE side via `bluez` + `bluez-tools` — `bluetoothctl`,
`hcitool`, `gatttool`, `btmgmt`.

## Quick recipes

### Capture a WPA2 4-way handshake
```sh
sudo iw wlan0 set monitor control
sudo iw wlan0 set channel 6
sudo hcxdumptool -i wlan0 --enable_status=1 -w capture.pcapng
# In another terminal: deauth a connected client to force re-handshake
sudo aireplay-ng --deauth 5 -a <BSSID> -c <CLIENT> wlan0
# Convert for hashcat
hcxpcapngtool -o hash.hc22000 capture.pcapng
```

### Detect rogue APs around you
```sh
sudo kismet -c wlan0
# Browse to http://10.10.10.1:2501 from your phone over the mgmt AP
```

### BLE inventory
```sh
sudo hcitool lescan         # quick passive
bluetoothctl
> scan on
> devices
```

### Test injection
```sh
sudo iw wlan0 set monitor control
sudo aireplay-ng --test wlan0
# "Injection is working!" = nexmon is doing its job.
```

## What you DON'T have

- Any cracking horsepower. The Pi Zero 2 W is a quad-core ARM at
  ~1GHz. Move captures off the Pi and crack on real hardware
  (your desktop, an EC2 GPU instance, hashcat on your gaming rig).
  The Pi captures, the cracker breaks.
- Multiple radios. The onboard BCM43436 is one antenna. Plug in an
  Alfa AWUS036ACH on USB OTG hub for a real second radio (and the
  honeypot AP slot in [S01E05](https://github.com/code-hartle-tech/neartrace-android-mvp/issues/379) wakes up).
