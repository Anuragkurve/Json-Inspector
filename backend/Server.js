const express = require('express');
const cors = require('cors');
const _ = require('lodash');

const app = express();
app.use(cors());
app.use(express.json());

const getCharacterIssues = (str) => {
    if (typeof str !== 'string') return null;
    const issues = [];
    if (/[\u200B-\u200D\uFEFF\u00A0]/.test(str)) issues.push("Invisible Unicode Character");
    if (str.startsWith(' ') || str.endsWith(' ')) issues.push("Leading/Trailing Space");
    if (str.includes('  ')) issues.push("Double Spaces");
    return issues.length > 0 ? issues : null;
};

const compareObjects = (obj1, obj2, path = "") => {
    let differences = [];
    const keys = _.union(Object.keys(obj1 || {}), Object.keys(obj2 || {}));

    keys.forEach(key => {
        const val1 = obj1 ? obj1[key] : undefined;
        const val2 = obj2 ? obj2[key] : undefined;
        const currentPath = path ? `${path}.${key}` : key;

        if (typeof val1 === 'object' && typeof val2 === 'object' && val1 !== null && val2 !== null) {
            differences = differences.concat(compareObjects(val1, val2, currentPath));
        } else if (val1 !== val2) {
            differences.push({
                path: currentPath,
                oldValue: val1,
                newValue: val2,
                oldType: typeof val1,
                newType: typeof val2,
                isTypeMismatch: (typeof val1 !== typeof val2) && (val1 !== undefined && val2 !== undefined),
                issues: {
                    old: getCharacterIssues(val1),
                    new: getCharacterIssues(val2)
                }
            });
        }
    });
    return differences;
};

app.post('/compare', (req, res) => {
    try {
        const { json1, json2 } = req.body;
        const diffs = compareObjects(json1, json2);
        res.json({ success: true, diffs });
    } catch (err) {
        res.status(400).json({ success: false, error: "Invalid JSON Data" });
    }
});

app.listen(5000, () => console.log('Backend running on http://localhost:5000'));