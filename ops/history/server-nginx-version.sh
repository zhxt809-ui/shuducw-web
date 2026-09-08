#!/bin/bash
echo "=== nginx version ==="
nginx -v 2>&1
echo "=== ubuntu version ==="
lsb_release -d 2>/dev/null
