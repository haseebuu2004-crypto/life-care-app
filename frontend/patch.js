const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/screens/Stock.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Remove tempPrice from state
content = content.replace(
    /const \[tempPrice, setTempPrice\] = useState\(item\.sp\.toString\(\)\);\n/,
    ''
);

// 2. Remove tempPrice from useEffect
content = content.replace(
    /    useEffect\(\(\) => \{\n        setTempQty\(item\.qty\.toString\(\)\);\n        setTempPrice\(item\.sp\.toString\(\)\);\n    \}, \[item\.qty, item\.sp\]\);/g,
    `    useEffect(() => {
        setTempQty(item.qty.toString());
    }, [item.qty]);`
);

// 3. Remove updateStockPrice from component signature
content = content.replace(
    /const StockRow = memo\(\(\{ item, isAdmin, canEditStockQty, updateStockQuantity, updateStockPrice, deleteStock \}\) => \{/,
    'const StockRow = memo(({ item, isAdmin, canEditStockQty, updateStockQuantity, deleteStock }) => {'
);

// 4. Remove handlePriceChange, commitPrice, handlePriceBlur
content = content.replace(/    const handlePriceChange =[\s\S]*?    };\n/g, '');
content = content.replace(/    const commitPrice =[\s\S]*?    };\n/g, '');
content = content.replace(/    const handlePriceBlur =[\s\S]*?    };\n/g, '');

// 5. Remove handlePriceBlur reference inside handleBlur if it was there (it isn't)
// Actually we can just simplify handleKeyDown
content = content.replace(
    /    const handleKeyDown = \(e\) => \{\n        if \(e\.key === 'Enter'\) \{\n            e\.target\.blur\(\); \/\/ Triggers blur to commit\n        \}\n    \};\n/g,
    `    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    };
`
);

// 6. Fix the Price column render logic (around line 140)
content = content.replace(
    /                \{isAdmin \? \([\s\S]*?\) : \([\s\S]*?\)\}/,
    `                \`₹\${item.sp}\``
);

// 7. Remove updateStockPrice passed down
content = content.replace(
    /updateStockPrice=\{updateStockPrice\}/g,
    ''
);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched Stock.jsx");
