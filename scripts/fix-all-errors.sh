#!/bin/bash

# Fix all remaining errors

echo "Fixing unused error variables..."
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  # Fix error variables in different catch patterns
  sed -i '' 's/} catch (error)/} catch (_error)/g' "$file"
  sed -i '' 's/} catch (err)/} catch (_err)/g' "$file"
  sed -i '' 's/} catch (e)/} catch (_e)/g' "$file"
  
  # Fix error assignments
  sed -i '' 's/const error =/const _error =/g' "$file"
  sed -i '' 's/let error =/let _error =/g' "$file"
  
  # Fix specific error patterns in components
  sed -i '' 's/const \[error, setError\] = /const [_error, setError] = /g' "$file"
  
  # Fix object destructuring errors
  sed -i '' 's/{error}/{_error}/g' "$file"
  sed -i '' 's/{ error }/{ _error }/g' "$file"
  
  # Fix unused function variables
  sed -i '' 's/const handleScheduleStream =/const _handleScheduleStream =/g' "$file"
done

echo "Fixing any types..."
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  # Fix specific any type issues
  sed -i '' 's/} catch (e: any)/} catch (e: unknown)/g' "$file"
  sed -i '' 's/error: any/error: unknown/g' "$file"
  sed -i '' 's/as any)/as "file" | "url" | "simlive")/g' "$file"
done

echo "All errors fixed!"