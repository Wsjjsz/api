#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_DIR="${ROOT_DIR}/.run"
JAVA_TOOL_OPTIONS_VALUE="--add-opens=java.base/java.lang=ALL-UNNAMED --add-opens=java.base/java.math=ALL-UNNAMED"

mkdir -p "${RUN_DIR}"

start_service() {
  local name="$1"
  local port="$2"
  local workdir="$3"
  local command="$4"
  local log_file="${RUN_DIR}/${name}.log"
  local pid_file="${RUN_DIR}/${name}.pid"

  if command -v lsof >/dev/null 2>&1 && lsof -iTCP:"${port}" -sTCP:LISTEN -n -P >/dev/null 2>&1; then
    echo "[skip] ${name} is already listening on :${port}"
    return
  fi

  echo "[start] ${name} on :${port}"
  nohup /bin/zsh -lc "cd \"${workdir}\" && ${command}" >"${log_file}" 2>&1 &
  echo $! >"${pid_file}"
  sleep 2
}

start_service \
  "backend" \
  "7529" \
  "${ROOT_DIR}/api-interface" \
  "export JAVA_TOOL_OPTIONS='${JAVA_TOOL_OPTIONS_VALUE}'; sh mvnw -q -DskipTests -f ../pom.xml spring-boot:run -Dspring-boot.run.arguments='--server.port=7529 --spring.devtools.restart.enabled=false'"

start_service \
  "interface" \
  "8123" \
  "${ROOT_DIR}/api-interface" \
  "export JAVA_TOOL_OPTIONS='${JAVA_TOOL_OPTIONS_VALUE}'; sh mvnw -q -DskipTests spring-boot:run -Dspring-boot.run.arguments='--server.port=8123 --spring.devtools.restart.enabled=false'"

start_service \
  "gateway" \
  "8090" \
  "${ROOT_DIR}/api-gateway" \
  "export JAVA_TOOL_OPTIONS='${JAVA_TOOL_OPTIONS_VALUE}'; sh mvnw -q -DskipTests spring-boot:run -Dspring-boot.run.arguments='--server.port=8090 --spring.devtools.restart.enabled=false --api.inner-host=http://localhost:7529 --api.prefer-http-inner=true'"

start_service \
  "frontend" \
  "8000" \
  "${ROOT_DIR}/api-frontend" \
  "npm run start:dev -- --host 0.0.0.0 --port 8000"

echo
echo "All start commands were submitted."
echo "Logs: ${RUN_DIR}/*.log"
echo "Run ./scripts/dev-check.sh for linkage verification."
