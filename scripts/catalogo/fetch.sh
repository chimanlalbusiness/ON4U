#!/usr/bin/env bash
# Downloads the Databox DATA STREAM files the catalogue needs into .databox/
# (gitignored). Only catalogue, stock and type groups: ON4U's price file is
# deliberately NOT downloaded, so it can never end up in this public repo.
#
# Credentials come from the environment, never from the repo:
#   DATABOX_FTP_HOST  DATABOX_FTP_USER  DATABOX_FTP_PASS
# They are passed to curl on stdin (-K -) so they don't show in `ps`.
#
# Usage: bash scripts/catalogo/fetch.sh [out-dir]
set -euo pipefail

: "${DATABOX_FTP_HOST:?Set DATABOX_FTP_HOST}"
: "${DATABOX_FTP_USER:?Set DATABOX_FTP_USER}"
: "${DATABOX_FTP_PASS:?Set DATABOX_FTP_PASS}"

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="${1:-$HERE/../../.databox}"
mkdir -p "$OUT"

auth() {
  local cred
  cred="$(printf '%s:%s' "$DATABOX_FTP_USER" "$DATABOX_FTP_PASS" | sed 's/[\\"]/\\&/g')"
  printf 'user = "%s"\n' "$cred"
}

# get <remote path> <local name> [extra curl args...]
get() {
  local remote="$1" name="$2"; shift 2
  echo "  ↓ $remote"
  auth | curl -sS -K - --retry 3 --retry-delay 10 --connect-timeout 30 --max-time 900 \
    -R "$@" -o "$OUT/$name.part" "ftp://$DATABOX_FTP_HOST/$remote"
  mv -f "$OUT/$name.part" "$OUT/$name"
}

echo "Databox → $OUT"
get "CatArtDatabox.txt" "CatArtDatabox.txt"
get "StockSDatabox.txt" "StockSDatabox.txt"
get "Geral/AgrupTipos_Join.csv" "AgrupTipos_Join.csv"
# Name-only listing (NLST): the detailed LIST of this ~28k-file folder is
# too slow on Databox's server and times out.
get "Geral/FOTOS/" "fotos-list.txt" -l
echo "Done: $(wc -l < "$OUT/CatArtDatabox.txt") catalogue lines, $(wc -l < "$OUT/fotos-list.txt") photos listed."
