#!/bin/bash

echo "Fixing syntax errors from previous script..."

# Fix the broken catch blocks
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  # Fix the malformed catch blocks
  sed -i '' 's/} catch (error) { void error; {/} catch (error) { void error;/g' "$file"
  sed -i '' 's/} catch (err) { void err; {/} catch (err) { void err;/g' "$file"
  sed -i '' 's/} catch (_error) { void _error; {/} catch (_error) { void _error;/g' "$file"
  sed -i '' 's/} catch (_err) { void _err; {/} catch (_err) { void _err;/g' "$file"
done

# Fix main.tsx specific error
sed -i '' 's/${_error}/${error instanceof Error ? error.message : "Unknown error"}/g' src/main.tsx
sed -i '' 's/${_error}/${error instanceof Error ? error.message : "Unknown error"}/g' src/test-main.tsx

# Fix the broken void statements (remove duplicates and fix placement)
sed -i '' '/void copyCodeBlock;.*navigator.clipboard/s/void copyCodeBlock;    //' src/pages/tenant/DocumentationArchive.tsx
sed -i '' '/void toggleBookmark;.*setDocSections/s/void toggleBookmark;    //' src/pages/tenant/DocumentationArchive.tsx
sed -i '' '/void getStatusColor;.*switch/s/void getStatusColor;    //' src/pages/tenant/DashboardHome.tsx
sed -i '' '/void handleScheduleStream;.*if/s/void handleScheduleStream;    //' src/pages/NewStreamEnhanced.tsx
sed -i '' '/void filteredStreams;.*const matchesSearch/s/void filteredStreams;    //' src/pages/tenant/LiveControlCenter.tsx
sed -i '' '/void navigate;.*return/s/void navigate;\s*//' src/pages/tenant/ContentLibrary.tsx
sed -i '' '/void selectedCategory; void setSelectedCategory;.*const/s/void selectedCategory; void setSelectedCategory;  //' src/pages/StreamsEnhanced.tsx
sed -i '' '/void selectedStream; void setSelectedStream;.*const/s/void selectedStream; void setSelectedStream;  //' src/pages/StreamsEnhanced.tsx
sed -i '' '/void selectedStream; void setSelectedStream;/s/void selectedStream; void setSelectedStream;//' src/pages/tenant/AnalyticsHub.tsx
sed -i '' '/void error;.*const/s/void error;  //' src/pages/StreamViewer.tsx
sed -i '' '/void error;/s/void error;//' src/hooks/useApiData.ts
sed -i '' '/void setProgress;.*const/s/void setProgress;  //' src/pages/UIShowcase.tsx
sed -i '' '/void setTimeRange;.*const/s/void setTimeRange;  //' src/pages/tenant/DashboardHome.tsx

# Fix duplicate navigate declarations in ContentLibrary
sed -i '' '/const navigate = useNavigate();/,+1s/void navigate;//' src/pages/tenant/ContentLibrary.tsx

echo "Syntax errors fixed!"