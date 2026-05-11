# Release channels

Nosferato ships **NosferatOS** the way Apple ships macOS — same brand
parent, distinct OS name. NosferatOS comes in three flavors:

| Channel | Cadence | Source | Debian | Use case |
|---|---|---|---|---|
| `daily` | nightly cron | `nosferato` branch HEAD | testing + sid backports | bleeding-edge features, latest nexmon, possibly broken |
| `weekly` | Sundays 00:00 UTC | tagged `weekly-YYYY-WW` snapshot | testing pinned that week | mostly-tested rolling, ~1 day soak |
| `stable` | milestone releases | tagged `vN.M` | Bookworm stable only | vetted, supported, the one you give to someone else |

## Artifact format

```
nosferatos-daily-2026.05.11-b15e9e2.img.xz       # date + short-SHA
nosferatos-weekly-2026.19.img.xz                 # ISO week
nosferatos-1.0-phantom-blood.img.xz              # codenamed milestones
```

Stable codenames pull from JoJo / vampire lore. The first cut will be
**`phantom-blood`**.

## How to flash a channel

Default is `stable`. Override with `--channel`:

```sh
infra/nosferato/bootstrap/flash.sh                    # → stable
infra/nosferato/bootstrap/flash.sh --channel daily    # → today's bleeding edge
infra/nosferato/bootstrap/flash.sh --channel weekly   # → last Sunday's snapshot
```

`flash.sh` pulls the matching artifact from
[GitHub Releases](https://github.com/code-hartle-tech/neartrace-android-mvp/releases),
verifies its SHA256 against the channel manifest, then `dd`s it onto
`/dev/disk5` (with the same label-cross-check guard as `build.sh`).

## How to build from scratch instead

`build.sh` debootstraps from scratch via Multipass — same flow as
the CI runner. Use this when iterating on NosferatOS itself; for
day-to-day "I just want a fresh rig", `flash.sh --channel stable`
is faster.

## Pi self-update (queued)

Once the channel pipeline is up:

```sh
sudo nosferatos-update --channel weekly
```

Pulls the same artifacts over wifi, flashes the partition the rig
isn't currently running from, marks it as the next-boot target,
reboots into it. Tracking issue: still queued — depends on the
channel pipeline landing first.

## Tracking

[S01E11 — NosferatOS release channels](https://github.com/code-hartle-tech/neartrace-android-mvp/issues/385)
