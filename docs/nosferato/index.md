# 🦇 Nosferato

> *Companion rig to NearTrace. Not safe for app stores.*

NearTrace lives inside Google's Play Store rules — phone-only,
defensive-framed, observation-grade. Some things you can't do from
inside that box. **Nosferato** is the body the protocol slips into
when it leaves.

A Raspberry Pi Zero 2 W, custom-built from a vanilla Debian
debootstrap with **no systemd**, runs the wireless layer NearTrace
can't reach: monitor mode, packet injection, real EAPOL handshake
capture, deauth probes, BLE active enumeration. The phone stays the
UI. The Pi grows the fangs.

## What it is

- A 25g pocket-sized SBC running ~150MB of vanilla Debian Bookworm,
  PID 1 = runit, boots in single-digit seconds
- BCM43436 onboard wifi patched with [nexmon](https://github.com/seemoo-lab/nexmon)
  for monitor + injection
- Onboard BLE via the standard bluez stack
- Top 10 wifi/ble pen-test tools preloaded
- Management AP on a virtual interface, USB OTG composite gadget
  (mass-storage + ethernet + ACM serial), and a wifi STA all
  simultaneously

## What it isn't

- A toy. The brcm chip is a real radio doing real injection.
- A hidden weapon. Nothing about Nosferato is covert — it broadcasts
  a management AP labelled `nosferato-mgmt`.
- A Play-store-acceptable feature. Hence the separate lane.

## Where to start

- [Build & flash the SD](./build) — Mac-side bootstrap (Multipass-based)
- [First boot & login](./first-boot) — what the Pi does when you power it on
- [Reach the rig](./reach) — wireless mgmt AP / USB tether / IoT wifi
- [The tool stack](./tools) — what the 10 preinstalled tools do
- [Pair with NearTrace](./pair) — phone↔Pi mDNS handshake

## The lore

The codename Nosferato is a triple homage:

- **Nosferatu** — the silent-film vampire. The rig wakes up at night
  and listens to what the radios won't admit during the day.
- **Dio Brando**'s vampiric arc in *JoJo's Bizarre Adventure* — and
  the legendary stand "The World" that follows him. The umbrella
  for this whole multi-platform program is The World; Nosferato is
  the predator that lives inside it.
- **RAT** — Remote Access Tool, and the literal mouse. The mascot
  is a vampire-hacker-rat — frontrat, frontman.

::: tip Mascot pending
Brand kit + frontrat illustration land in [S01E06](https://github.com/code-hartle-tech/neartrace-android-mvp/issues/380).
:::
