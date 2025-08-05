#!/bin/bash

# Fix unused imports by prefixing with underscore or removing them

# Fix unused imports in various files
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  # Replace unused error variables with underscore prefix
  sed -i '' 's/const \[error,/const [_error,/g' "$file"
  sed -i '' 's/} catch (error)/} catch (_error)/g' "$file"
  sed -i '' 's/} catch (err)/} catch (_err)/g' "$file"
  
  # Fix unused state setters
  sed -i '' 's/const \[selectedCategory, setSelectedCategory\]/const [_selectedCategory, _setSelectedCategory]/g' "$file"
  sed -i '' 's/const \[selectedStream, setSelectedStream\]/const [_selectedStream, _setSelectedStream]/g' "$file"
  
  # Fix unused function assignments
  sed -i '' "s/const handleScheduleStream =/const _handleScheduleStream =/g" "$file"
done

echo "Fixed unused variables and imports"