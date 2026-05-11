# Pair with NearTrace (deferred — S01E07)

Tracking issue: [#381 The Phone-Pi Handshake](https://github.com/code-hartle-tech/neartrace-android-mvp/issues/381).

The plan:

1. Pi advertises an `_neartrace._tcp.local` mDNS service on the
   management AP + USB tether interfaces.
2. The NearTrace Android app already runs an mDNS scanner (it
   surfaces LAN hosts in the SPECS tab — see the main NearTrace
   wiki). When it sees this service, the UI offers a "Connect to
   capture rig" affordance.
3. Phone becomes the wireless UI for monitor-mode capture, deauth
   detection, PCAP browsing — leveraging features the Play-store
   build can't have but the Pi can.

This page lights up when S01E07 ships. Until then: SSH it the old
way ([reach the rig](./reach)).
