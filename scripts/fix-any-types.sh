#!/bin/bash

# Fix any types by replacing with unknown

find src -name "*.tsx" -o -name "*.ts" | while read file; do
  # Replace specific any types with unknown
  sed -i '' 's/onValueChange={(v) => setUploadType(v as any)}/onValueChange={(v) => setUploadType(v as "file" | "url" | "simlive")}/g' "$file"
  sed -i '' 's/} catch (e: any)/} catch (e: unknown)/g' "$file"
  sed -i '' 's/error: any/error: unknown/g' "$file"
done

echo "Fixed any types"