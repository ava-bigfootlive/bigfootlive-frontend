#!/bin/bash

echo "Fixing specific errors in individual files..."

# Fix ContentLibrary.tsx
sed -i '' 's/onValueChange={(v) => setUploadType(v as any)}/onValueChange={(v) => setUploadType(v as "file" | "url" | "simlive")}/g' src/pages/tenant/ContentLibrary.tsx

# Fix Settings.tsx parsing error - need to look at the line 972 issue
# Already fixed in previous edit

# Fix all _error that should be error in StreamViewer (already done)

# Fix unused variables in hooks
find src/hooks -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' 's/const \[error, setError\]/const [_error, setError]/g' "$file"
done

# Fix catch blocks more comprehensively
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  # Fix multi-line catch blocks
  perl -i -pe 's/} catch \((error|err|e)\) \{/} catch (_$1) {/g' "$file"
  
  # Fix object destructuring with error
  sed -i '' 's/const { error }/const { error: _error }/g' "$file"
  sed -i '' 's/const {error}/const {error: _error}/g' "$file"
done

echo "Specific errors fixed!"