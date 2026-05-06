# NearTrace Enrollment

> **S01E10 — "In which a new machine joins the team and doesn't have to suffer."**

<div class="tldr">
<strong>TL;DR</strong>
<code>neartrace-enroll</code> is a CLI that takes a blank machine from zero to fully configured — dev tools, credentials scaffold, and everything else — in a single command. Download it from GitHub Releases and run <code>enroll run</code>.
</div>

## What it is

`neartrace-enroll` is the official HARTLE.TECH machine onboarding tool. One binary. One command. No fumbling through wikis on a new machine.

It handles:

- Installing missing dev tools (Tailscale, Terraform, gh, git) via your platform's package manager
- Enrolling the machine onto the private network (browser-based sign-in with your `@hartle.tech` account)
- Scaffolding the credentials file so it's ready to be filled in
- Cloning all project repositories (optional — pass `--github-token`)

## Install

### One-liner (recommended)

```bash
curl -fsSL https://neartrace.app/install.sh | bash
```

::: info
The install script downloads the correct binary for your OS/architecture automatically.
:::

### Manual download

Go to [github.com/code-hartle-tech/neartrace-enroll/releases](https://github.com/code-hartle-tech/neartrace-enroll/releases) and download the binary for your platform:

| Platform | File |
|---|---|
| macOS (Apple Silicon) | `enroll_darwin_arm64` |
| macOS (Intel) | `enroll_darwin_amd64` |
| Linux (x86_64) | `enroll_linux_amd64` |
| Linux (ARM64) | `enroll_linux_arm64` |
| Windows (x86_64) | `enroll_windows_amd64.exe` |

Make it executable and move it to your PATH:

```bash
chmod +x enroll_darwin_arm64
mv enroll_darwin_arm64 /usr/local/bin/enroll
```

## Usage

### Full onboarding

```bash
enroll run
```

This installs missing tools, enrolls the machine, and scaffolds credentials. To also clone all repositories:

```bash
enroll run --github-token YOUR_PAT
```

### Check machine health

```bash
enroll check
```

Prints a health report: OS, architecture, tool versions, and network enrollment status.

### Enroll network only

```bash
enroll tailscale
```

### Install tools only

```bash
enroll tools
```

## What happens during `enroll run`

1. Dev tools are detected and any missing ones are installed via Homebrew (macOS), winget (Windows), or apt/dnf/pacman (Linux)
2. Machine enrollment is initiated — a browser window opens for sign-in
3. The credentials scaffold is written to `~/.config/hartle.tech/tokens` (mode 600) — fill in your API keys after
4. If `--github-token` is passed, all project repositories are cloned into `~/Projects/`
5. A final health check confirms everything is green

## Access

`neartrace-enroll` is intended for HARTLE.TECH team members. You need a `@hartle.tech` Google account to complete enrollment.

If you're not on the team and want access: contact [robert@hartle.tech](mailto:robert@hartle.tech).
