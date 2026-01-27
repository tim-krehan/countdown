#!/bin/sh

# check if environment variables are set, if not set default values
if [ -z "$TITLE" ]; then
  TITLE="I was built since"
fi
if [ -z "$FAVICON" ]; then
  FAVICON="fav.svg"
fi
if [ -z "$TARGET_DATE" ]; then
  TARGET_DATE=$(date -u "+%Y-%m-%dT%H:%M:%SZ")
fi

echo "const CONFIG = { \
    title: \"${TITLE}\", \
    targetDate: \"${TARGET_DATE}\", \
    favicon: \"${FAVICON}\" \
};" > /usr/share/nginx/html/config.js

# Start nginx in the foreground
exec nginx -g 'daemon off;'
