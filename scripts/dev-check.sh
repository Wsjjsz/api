#!/usr/bin/env bash
set -euo pipefail

check_http_status() {
  local name="$1"
  local url="$2"
  local status
  status="$(curl -s -o /dev/null -w "%{http_code}" "${url}" || true)"
  if [[ "${status}" =~ ^(2|3) ]]; then
    echo "[ok] ${name}: ${url} -> ${status}"
  else
    echo "[fail] ${name}: ${url} -> ${status}"
    return 1
  fi
}

echo "Checking service ports..."
check_http_status "backend" "http://localhost:7529/api/user/get/login"
check_http_status "interface" "http://localhost:8123/api/name/random"
check_http_status "gateway" "http://localhost:8090/api/user/get/login"
check_http_status "frontend" "http://localhost:8000"

echo
echo "Checking signed invoke through gateway..."
AK="${API_ACCESS_KEY:-5e74a4f4f365f1d6a54529206dc9f6cc}"
SK="${API_SECRET_KEY:-6b1dec9ca0ace75add5ea3d9d8c6a007}"
BODY='{}'
TS="$(date +%s)"
SIGN="$(printf '%s' "${BODY}.${SK}" | shasum -a 256 | awk '{print $1}')"

RESP="$(
  curl -sS "http://localhost:8090/api/random/number?min=1&max=9&count=2" \
    -H "accessKey: ${AK}" \
    -H "nonce: 1234" \
    -H "timestamp: ${TS}" \
    -H "body: ${BODY}" \
    -H "sign: ${SIGN}" \
    || true
)"

if echo "${RESP}" | grep -q "numbers"; then
  echo "[ok] signed gateway invoke"
else
  echo "[fail] signed gateway invoke"
  echo "Response: ${RESP}"
  echo "Tip: export API_ACCESS_KEY / API_SECRET_KEY if your DB seed differs."
  exit 1
fi

echo
echo "All checks passed."
