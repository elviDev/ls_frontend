#!/bin/bash

# Script to find files that likely need internationalization
# This looks for TSX files with hardcoded English text

echo "🔍 Finding files that need internationalization..."
echo ""
echo "Files with potential hardcoded text:"
echo "===================================="
echo ""

# Find TSX files with hardcoded strings (looking for common patterns)
find app components -name "*.tsx" -type f 2>/dev/null | while read file; do
    # Skip node_modules and .next
    if [[ $file == *"node_modules"* ]] || [[ $file == *".next"* ]]; then
        continue
    fi
    
    # Check if file has useTranslations or getTranslations
    has_translations=$(grep -l "useTranslations\|getTranslations" "$file" 2>/dev/null)
    
    # Check if file has hardcoded text patterns
    has_hardcoded=$(grep -E ">[A-Z][a-z]{3,}|\"[A-Z][a-z]{3,}" "$file" 2>/dev/null | grep -v "import\|export\|className\|const\|let\|var\|type\|interface" | head -1)
    
    if [ -n "$has_hardcoded" ]; then
        if [ -z "$has_translations" ]; then
            echo "❌ $file (NO translations imported)"
        else
            echo "⚠️  $file (has translations but may have missed text)"
        fi
    fi
done

echo ""
echo "===================================="
echo ""
echo "📊 Summary:"
echo ""

total_tsx=$(find app components -name "*.tsx" -type f 2>/dev/null | wc -l | tr -d ' ')
with_translations=$(find app components -name "*.tsx" -type f -exec grep -l "useTranslations\|getTranslations" {} \; 2>/dev/null | wc -l | tr -d ' ')
without_translations=$((total_tsx - with_translations))

echo "Total TSX files: $total_tsx"
echo "With translations: $with_translations"
echo "Without translations: $without_translations"
echo ""
echo "Progress: $(awk "BEGIN {printf \"%.1f\", ($with_translations/$total_tsx)*100}")%"
echo ""
echo "💡 Tip: Focus on files marked with ❌ first"
echo "📖 See I18N_IMPLEMENTATION_GUIDE.md for detailed instructions"
