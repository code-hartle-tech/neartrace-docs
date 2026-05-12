---
title: S01E12 — I, Frankenstein
description: The Pi we declared dead. The Pi that wasn't dead. The Pi that lived.
---

# 🦇 S01E12 — I, Frankenstein

> *"It's not dead. I'm not dead. You shut up."*
> — the Pi, paraphrased

::: warning Plot
**Verdict at session-end 2026-05-11:** Pi Zero 2 W appears DOA. All LEDs dark. Order replacement.
**Verdict next morning:** Pi flashes PINN multiboot OS, boots fine.
**Verdict at episode close:** the Pi was alive the whole time. Our SD card was broken. And we believed a false claim about LEDs.
:::

## Cold open

End of S01E11. We'd just shipped the entire bootstrap pipeline. Mac side worked: Multipass VM, debootstrap, partitioning, dd, eject. The whole thing was beautiful. We popped the SD into the Pi, plugged power, and… nothing. Black silicon. No LEDs. The board looked like it had been shot.

We filed [#386: Hardware diagnosis + replacement plan](https://github.com/code-hartle-tech/neartrace-android-mvp/issues/386), listed the diagnostic ladder (PSU swap, cable swap, multimeter check, replacement parts), closed the session, ordered a backup board.

A confident bullet in that issue read:

> *"Without the SD, the red PWR LED should come on solid. If it doesn't, the board is fried."*

That bullet was the trap.

## Plot twist

User in the morning:

> *"Turns out it's not dead. You fucked up somewhere in the image creation. I just flashed PINN multiboot to it and it booted!"*

The Pi worked. Always had. We'd been wrong about the *symptom*.

Specifically: **the Pi Zero 2 W has ONE LED, not two**. Just a green ACT LED. No red PWR. So "no red light" wasn't a sign of death — there's no red light to begin with. The board was idling silently because it couldn't read our SD card.

This is one of those moments where the rabbit hole is your own confident assertion.

### The receipt

```
# What we should have done
WebFetch raspberrypi.com/documentation → confirm LED count

# What we did
recalled from training → declared 2 LEDs (1 red, 1 green)
→ user looked at board → "no red light" → misdiagnose → close session
```

→ [`feedback_fact_check_hardware_claims.md`](#) was written immediately after.

## Boss fight: where's the bug?

The Pi reads `bootcode.bin` from the SD card's FAT BOOT partition. If `bootcode.bin` isn't there, or isn't at the right location, the mask-ROM has nothing to load. No GPU init. No kernel. No LED activity. **Looks dead, isn't.**

We mounted PINN's working SD card on the Mac, ran `ls /Volumes/RECOVERY/`, and compared against the layout of our broken SD card's staging directory.

::: details The two layouts side-by-side

**PINN (working):**
```
/Volumes/RECOVERY/
├── bootcode.bin           ✓ at root
├── start.elf              ✓ at root
├── start4.elf             ✓ at root
├── fixup.dat              ✓ at root
├── fixup4.dat             ✓ at root
├── kernel8.img            ✓ at root
├── bcm2710-rpi-zero-2-w.dtb  ✓ at root
├── overlays/              ✓ at root
├── config.txt             ✓ at root
└── cmdline.txt            ✓ at root
```

**Our SD (broken):**
```
/Volumes/BOOT/
├── config.txt             ✓ at root
├── cmdline.txt            ✓ at root
└── boot/
    ├── bootcode.bin       ✗ NESTED!
    ├── start.elf          ✗ NESTED!
    ├── start4.elf         ✗ NESTED!
    ├── kernel8.img        ✗ NESTED!
    ├── bcm2710-rpi-zero-2-w.dtb  ✗ NESTED!
    └── overlays/          ✗ NESTED!
```
:::

The mask-ROM (in silicon) can't find `bootcode.bin` if it's nested in `boot/`. **Stage 1 fails. Nothing else even starts.**

Why was it nested? Because our `build-rootfs.sh` script created `$FW_STAGE/boot/`, copied firmware files in there, tarred `boot/` as the top-level entry of `boot.tgz`, and then `build.sh` extracted the tarball verbatim onto the SD's FAT partition. Whoever wrote the original script (👋 us) probably mirrored the Debian rootfs convention of `/boot/firmware/`. But the SD's FAT partition has no rootfs context. Files there go at the root.

## Resolution

E13 was filed: [#387 — `bootcode.bin` must live at FAT root, not /boot/ subdir](https://github.com/code-hartle-tech/neartrace-android-mvp/issues/387). Issue #386 closed.

## Lessons banked

1. **Fact-check hardware claims.** Saved as [`feedback_fact_check_hardware_claims.md`](#). When asserting any physical-board claim (LEDs, ports, voltages, button locations), verify against primary docs *before* typing the claim. A 30-second webfetch beats a 10-hour rabbit hole.

2. **LED state ≠ power state on the Pi Zero 2 W.** [Saved as a permanent reference memory.](#) The board has exactly one green ACT LED. "Off" doesn't mean "no power" — it means "no SD activity." To check power, use a USB power meter inline. To check boot, use the LED *blink pattern* (the Pi firmware uses encoded blink codes for specific errors).

3. **Direct observation beats recall.** If the user sees something and you don't believe it, *they're right by default*. Update your memory, don't argue.

## Final scene

> *"I am ALIVE."* — the Pi, finally allowed to boot once `bootcode.bin` lands at the FAT root.

→ [**Next: E13 — Stage One, Where Art Thou?**](./e13-bootcode-at-the-root)

## Source links

- [Raspberry Pi Zero 2 W Boot EEPROM docs](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html)
- [#386 — Hardware diagnosis + replacement plan (closed)](https://github.com/code-hartle-tech/neartrace-android-mvp/issues/386)
- [#387 — bootcode.bin must live at FAT root](https://github.com/code-hartle-tech/neartrace-android-mvp/issues/387)
- Commit [`ef0aa1f`](https://github.com/code-hartle-tech/neartrace-android-mvp/commit/ef0aa1f) — stage boot firmware at FAT root

## Memes

> *"It's just a model."*
> — Patsy, Monty Python and the Holy Grail
>
> The Pi was always real. The diagnosis wasn't.
