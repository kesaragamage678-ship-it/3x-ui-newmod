#!/usr/bin/env bash
# ============================================================================
# 3x-ui + Custom UI — install from your own GitHub Release.
# No Go/Node build toolchain needed on the VPS — much faster than building
# locally, since your GitHub Actions workflow already compiled the binary.
#
# USAGE:
#   GITHUB_TOKEN=ghp_xxxxxxxxxxxx REPO=yourname/yourrepo TAG=v3.6.0-custom1 \
#     bash <(curl -Ls https://raw.githubusercontent.com/yourname/yourrepo/main/install-from-release.sh)
#
# (If the repo is private, you also need the token just to fetch this
# script itself via curl — see README-RELEASE.md for the exact command.)
# ============================================================================
set -e

: "${GITHUB_TOKEN:?Set GITHUB_TOKEN=<your personal access token>}"
: "${REPO:?Set REPO=yourname/yourrepo}"
: "${TAG:?Set TAG=v3.6.0-custom1 (the release tag to install)}"

echo "################################################################"
echo "# 1) Official 3x-ui install (unchanged, stock process)"
echo "################################################################"
bash <(curl -Ls https://raw.githubusercontent.com/mhsanaei/3x-ui/master/install.sh)

echo ""
echo "################################################################"
echo "# 2) Downloading your custom binary from GitHub Release"
echo "################################################################"
ARCH=$(uname -m)
case "$ARCH" in
  x86_64) ASSET="x-ui-linux-amd64" ;;
  aarch64) ASSET="x-ui-linux-arm64" ;;
  *) echo "Unsupported arch: $ARCH"; exit 1 ;;
esac

API_URL="https://api.github.com/repos/${REPO}/releases/tags/${TAG}"
ASSET_ID=$(curl -sL -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github+json" "$API_URL" \
  | grep -B3 "\"name\": \"${ASSET}\"" | grep '"id"' | head -1 | grep -oP '\d+')

if [ -z "$ASSET_ID" ]; then
  echo "ERROR: Could not find asset '$ASSET' in release '$TAG' of '$REPO'."
  echo "Check: repo name, tag name, and that the workflow actually finished."
  exit 1
fi

curl -sL -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Accept: application/octet-stream" \
  "https://api.github.com/repos/${REPO}/releases/assets/${ASSET_ID}" \
  -o /root/x-ui-custom-downloaded

chmod +x /root/x-ui-custom-downloaded
echo "Downloaded: $(ls -lh /root/x-ui-custom-downloaded)"

echo ""
echo "################################################################"
echo "# 3) Going live — stop, swap, restart (with backup)"
echo "################################################################"
systemctl stop x-ui
for i in $(seq 1 10); do
  if ! pgrep -f "/usr/local/x-ui/x-ui$" >/dev/null; then break; fi
  sleep 1
done

BACKUP="/usr/local/x-ui/x-ui.stock-backup-$(date +%Y%m%d-%H%M%S)"
cp /usr/local/x-ui/x-ui "$BACKUP"
cp /root/x-ui-custom-downloaded /usr/local/x-ui/x-ui
chmod +x /usr/local/x-ui/x-ui

systemctl start x-ui
sleep 3
systemctl status x-ui --no-pager -l | head -15

echo ""
echo "=================================================================="
echo " DONE. Backup: $BACKUP"
echo " Rollback: systemctl stop x-ui && cp \"$BACKUP\" /usr/local/x-ui/x-ui && systemctl start x-ui"
echo "=================================================================="
