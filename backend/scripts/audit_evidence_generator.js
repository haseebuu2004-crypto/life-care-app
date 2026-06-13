const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class AuditEvidenceGenerator {
    constructor() {
        this.auditDir = path.join(__dirname, '../audit_evidence');
        if (!fs.existsSync(this.auditDir)) fs.mkdirSync(this.auditDir, { recursive: true });
    }

    generate(reportData, filename) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const file = path.join(this.auditDir, `${filename}_${timestamp}.json`);
        
        const contentStr = JSON.stringify(reportData, null, 2);
        const checksum = crypto.createHash('sha256').update(contentStr).digest('hex');
        
        const finalData = {
            ...reportData,
            checksum,
            generatedAt: timestamp
        };
        
        fs.writeFileSync(file, JSON.stringify(finalData, null, 2));
        console.log(`Audit evidence generated: ${file}`);
        
        this.updateManifest(file, checksum);
    }

    updateManifest(file, checksum) {
        const manifestFile = path.join(this.auditDir, 'manifest.json');
        let manifest = [];
        if (fs.existsSync(manifestFile)) {
            manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
        }
        manifest.push({ file: path.basename(file), checksum });
        fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
    }
}

module.exports = new AuditEvidenceGenerator();
