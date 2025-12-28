#!/bin/bash
docker login ghcr.io -u "$GITHUB_ACTOR" -p "$GITHUB_TOKEN"
docker pull ghcr.io/"$GITHUB_ACTOR"/elancestvous-nextjs-16:latest
docker stop elancestvous-nextjs-16 || true
docker rm elancestvous-nextjs-16 || true
docker run --env-file /home/"$VPS_USR"/elancestvous/.env -d --name elancestvous-nextjs-16 -p 80:3000 ghcr.io/"$GITHUB_ACTOR"/elancestvous-nextjs-16:latest
