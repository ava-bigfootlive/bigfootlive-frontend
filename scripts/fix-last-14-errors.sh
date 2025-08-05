#!/bin/bash

echo "Fixing last 14 errors..."

# StreamsEnhanced - These are actually used in dropdowns/filters
sed -i '' "70s/const \[selectedCategory, setSelectedCategory\]/const [_selectedCategory, _setSelectedCategory]/" src/pages/StreamsEnhanced.tsx
sed -i '' "73s/const \[selectedStream, setSelectedStream\]/const [_selectedStream, _setSelectedStream]/" src/pages/StreamsEnhanced.tsx

# DashboardHome - getStatusColor is actually used in the component
# Look for where it's used and fix
sed -i '' '/const getStatusColor = (status: string) => {/,/^  }/{ s/void getStatusColor;//; }' src/pages/tenant/DashboardHome.tsx
# Actually it's used in the Badge variant, so let's remove the void
sed -i '' 's/    void getStatusColor;  /    /' src/pages/tenant/DashboardHome.tsx

# DocumentationArchive - These functions are called in the UI
sed -i '' 's/    void copyCodeBlock;  /    /' src/pages/tenant/DocumentationArchive.tsx
sed -i '' 's/    void toggleBookmark;  /    /' src/pages/tenant/DocumentationArchive.tsx

# LiveControlCenter - filteredStreams is used in the render
# Find where it's used
grep -n "filteredStreams" src/pages/tenant/LiveControlCenter.tsx

# Actually check all usages
echo "Checking navigate usage in ContentLibrary..."
grep -n "navigate(" src/pages/tenant/ContentLibrary.tsx | head -5

echo "Done with script adjustments"