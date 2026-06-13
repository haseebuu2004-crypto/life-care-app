const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class AuditEvidenceVerifier {
    constructor() {
        this.auditDir = path.join(__dirname, '../audit_evidence');
    }

    verify() {
        const manifestFile = path.join(this.auditDir, 'manifest.json');
        if (!fs.existsSync(manifestFile)) {
            return this.outputResult("FAIL", ["Manifest file missing"]);
        }

        const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
        const mismatches = [];

        for (const entry of manifest) {
            const file = path.join(this.auditDir, entry.file);
            if (!fs.existsSync(file)) {
                mismatches.push(`${entry.file} is missing`);
                continue;
            }

            const data = JSON.parse(fs.readFileSync(file, 'utf8'));
            const originalChecksum = data.checksum;
            
            const reportData = { ...data };
            delete reportData.checksum;
            delete reportData.generatedAt;

            const contentStr = JSON.stringify(reportData, null, 2);
            const calculatedChecksum = crypto.createHash('sha256').update(contentStr).digest('hex');

            if (calculatedChecksum !== entry.checksum || originalChecksum !== entry.checksum) {
                mismatches.push(`${entry.file} checksum mismatch`);
            }
        }

        const status = mismatches.length === 0 ? "PASS" : "FAIL";
        return this.outputResult(status, mismatches);
    }

    outputResult(status, mismatches) {
        const report = {
            status,
            mismatches,
            verifiedAt: new Date().toISOString()
        };
        fs.writeFileSync(path.join(this.auditDir, 'verification_report.json'), JSON.stringify(report, null, 2));
        console.log(`Evidence Verification: ${status}`);
        if (mismatches.length > 0) console.error("Mismatches:", mismatches);
        return status === "PASS";
    }
}

const verifier = new AuditEvidenceVerifier();
if (require.main === module) {
    const passed = verifier.verify();
    process.exit(passed ? 0 : 1);
}

module.exports = verifier;
