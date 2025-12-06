#!/bin/sh

# Replace env placeholders in built JS files
find /app/.next -type f -name "*.js" -exec sed -i \
  -e "s|__NEXT_PUBLIC_GRAPHQL_ENDPOINT__|${NEXT_PUBLIC_GRAPHQL_ENDPOINT}|g" \
  -e "s|__NEXT_PUBLIC_BACKEND_URL__|${NEXT_PUBLIC_BACKEND_URL}|g" \
  -e "s|__NEXT_PUBLIC_TINYMCE_API_KEY__|${NEXT_PUBLIC_TINYMCE_API_KEY}|g" \
  {} \;

# Start the application
exec node server.js
