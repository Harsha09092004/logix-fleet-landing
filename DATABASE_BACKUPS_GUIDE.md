# FreightFlow: Database Backups & Recovery Guide

**Phase:** 3.5 | **Status:** Ready for Implementation | **Target:** Complete by June 2, 2026

---

## 🎯 **Executive Overview**

Production database protection requires:
1. **Automated daily backups** (zero manual intervention)
2. **Geographic redundancy** (backup in different region)
3. **Quick recovery** (restore in <5 minutes)
4. **Verified testing** (monthly recovery drills)
5. **Alert system** (backup failures notified immediately)

**Business Impact:**
- Data loss = ₹50K+ revenue loss per hour
- Regulatory compliance (GST audit trail required)
- Customer trust: "Your data is safe with us"

**Recovery Targets:**
- **RPO** (Recovery Point Objective): Max 24 hours of data loss
- **RTO** (Recovery Time Objective): Restore within 30 minutes

---

## 📊 **Backup Strategy Comparison**

| Aspect | MongoDB Atlas | PostgreSQL (Railway) | Self-Managed |
|--------|---------------|----------------------|--------------|
| Cost | Free (512MB tier) | Included | ₹500-2000/mo |
| Setup | Automatic | Manual | Complex |
| Recovery Speed | 1-5 minutes | 5-10 minutes | 10-30 minutes |
| Geographic Redundancy | ✅ Auto (3 regions) | ⚠️ Manual | ❌ Manual |
| Compliance | ✅ SOC 2 | ✅ Configurable | ❌ Manual |
| Recommended | ✅ For FreightFlow | ⚠️ If using PG | ❌ Not recommended |

---

## 🛡️ **Part 1: MongoDB Atlas Backup (Recommended)**

### Step 1: Enable Automated Backups

**In MongoDB Atlas Dashboard:**

1. **Select Cluster → Backup**
2. **Enable Cloud Backups** (if not auto-enabled)
3. Configure settings:
   - Backup Frequency: **Every 6 hours** (4 backups/day)
   - Retention: **30 days** (covers entire month)
   - Backup Window: **2:00 AM UTC** (off-peak)

**Your Settings:**
```
Cluster: freightflow-prod
Backup Type: Cloud (managed by MongoDB)
Snapshot Frequency: Every 6 hours
Snapshots Retained: 120 (30 days)
Point-in-Time (PITR): 7 days
```

### Step 2: Verify Backup Creation

**Check Backup Status:**

1. Go to **Backup → Cloud Backup**
2. View snapshot schedule
3. Verify latest backup timestamp
4. Confirm backup size matches DB size

**Example:**
```
Latest Backup: Today 2:00 AM UTC (5.2 MB)
Previous: Yesterday 8:00 PM UTC (5.1 MB)
Status: ✅ Success
```

### Step 3: Configure Backup Notification Alerts

**In Alerts:**

1. **Create Alert:** "Backup Failed"
   - Condition: `Backup snapshot status = FAILURE`
   - Recipients: `admin@freightflow.in`
   - Severity: Critical

2. **Create Alert:** "Large Backup Size"
   - Condition: `Backup size > 100 MB`
   - Recipients: `admin@freightflow.in`
   - Severity: Warning

### Step 4: Test Restore Procedure

**Restore to New Cluster (Test Only):**

1. **Backup Tab → Select snapshot**
2. **Click "Restore"**
3. **Create new test cluster:**
   - Name: `freightflow-restore-test`
   - Choose latest snapshot
   - Click "Restore Backup"

Wait 3-5 minutes for restoration...

**Verify Restored Data:**

```bash
# Connect to restore test cluster
mongo "mongodb+srv://freightflow_user:PASSWORD@freightflow-restore-test.mongodb.net/freightflow"

# Count documents to verify
db.invoices.countDocuments()
db.users.countDocuments()
db.transactions.countDocuments()

# Should match production counts
# If verified, delete test cluster
```

### Step 5: Document Recovery Procedure

**Create Recovery Runbook:**

```markdown
# MongoDB Atlas Restore Procedure

## If Accidental Data Deletion Occurs:

1. **Stop Production**
   - Tell users: "Brief maintenance, data is safe"
   - Stop API server to prevent further writes

2. **Find Latest Good Backup**
   - Go to Backup → Cloud Backup
   - Identify timestamp before deletion
   - Use that snapshot

3. **Restore to New Cluster**
   - Click "Restore"
   - Create temp cluster: `freightflow-restore-[timestamp]`
   - Wait for completion (3-5 min)

4. **Validate Data**
   - Connect to temp cluster
   - Verify deleted data is restored
   - Check record counts match

5. **Swap Databases**
   - Update DATABASE_URL in Railway to new cluster
   - Run smoke tests
   - Monitor for errors

6. **Clean Up**
   - Delete old cluster after confirming
   - Document incident

## Estimated Time: 10-15 minutes
## Data Loss: 0 to 6 hours (depending on backup frequency)
```

---

## 🗄️ **Part 2: PostgreSQL Backup (If Using PG)**

### Step 1: PostgreSQL On-Demand Backup

**For Railway-hosted PostgreSQL:**

```bash
# Install backup tool
npm install -g railway

# Login to Railway
railway login

# Backup current database
railway run pg_dump \
  $DATABASE_URL \
  > freightflow_backup_$(date +%Y%m%d_%H%M%S).sql

# Size check
ls -lh freightflow_backup_*.sql
```

### Step 2: Automated Daily Backup Script

**Create: `backup.sh`**

```bash
#!/bin/bash

# PostgreSQL Backup Script (runs daily via cron)
set -e

# Configuration
DB_HOST=$DB_HOST
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
BACKUP_DIR="/backups/postgresql"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Generate backup filename
BACKUP_FILE="$BACKUP_DIR/freightflow_$(date +%Y%m%d_%H%M%S).sql.gz"

# Run backup
PGPASSWORD=$DB_PASSWORD pg_dump \
  -h $DB_HOST \
  -U $DB_USER \
  -d $DB_NAME \
  | gzip > $BACKUP_FILE

echo "✅ Backup created: $BACKUP_FILE"

# Upload to S3
aws s3 cp $BACKUP_FILE s3://freightflow-backups/postgresql/

# Delete old backups (keep 30 days)
find $BACKUP_DIR -name "freightflow_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Old backups cleaned up"
```

### Step 3: Schedule Daily Backups (Cron)

**Add to Crontab:**

```bash
# Edit crontab
crontab -e

# Add this line (run every day at 2 AM)
0 2 * * * /home/ec2-user/backup.sh >> /var/log/backup.log 2>&1
```

### Step 4: Verify Backup Integrity

**Monthly Test Restore:**

```bash
# List available backups
ls -lh /backups/postgresql/

# Restore to test database
createdb freightflow_test

gunzip < freightflow_backup_20260515_020000.sql.gz | \
  psql -U freightflow_user -d freightflow_test

# Verify
psql -U freightflow_user -d freightflow_test -c "SELECT COUNT(*) FROM invoices;"

# Clean up test
dropdb freightflow_test
```

---

## ☁️ **Part 3: S3 Cloud Backup Archive**

### Step 1: Create AWS S3 Bucket

**For long-term cold storage:**

```bash
# Create bucket
aws s3 mb s3://freightflow-backups --region ap-south-1

# Enable versioning (accidental delete recovery)
aws s3api put-bucket-versioning \
  --bucket freightflow-backups \
  --versioning-configuration Status=Enabled

# Enable lifecycle policy (archive after 30 days)
cat > lifecycle.json << 'EOF'
{
  "Rules": [
    {
      "Id": "ArchiveOldBackups",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 365
      }
    }
  ]
}
EOF

aws s3api put-bucket-lifecycle-configuration \
  --bucket freightflow-backups \
  --lifecycle-configuration file://lifecycle.json
```

### Step 2: Auto-Upload Backups to S3

**Modify backup script to upload:**

```bash
# After creating backup
BACKUP_FILE="$BACKUP_DIR/freightflow_$(date +%Y%m%d_%H%M%S).sql.gz"

# ... backup code ...

# Upload to S3
aws s3 cp $BACKUP_FILE \
  s3://freightflow-backups/postgresql/ \
  --storage-class STANDARD_IA  # Infrequent Access = cheaper

# Verify upload
echo "✅ Backup uploaded to S3"

# Delete local copy after successful upload
rm $BACKUP_FILE
```

---

## 📋 **Part 4: Backup Monitoring & Alerts**

### Dashboard Checklist

**Create backup dashboard in Railway/Grafana:**

```
Backup Status (Real-Time):
├── Last Backup: [Timestamp]
├── Backup Size: [5.2 MB]
├── Backup Age: [2 hours]
└── Status: ✅ Healthy

7-Day Backup History:
├── May 15 2:00 AM: ✅ 5.2 MB
├── May 14 8:00 PM: ✅ 5.1 MB
├── May 14 2:00 PM: ✅ 5.0 MB
└── ... (18 more)

Alerts:
├── Backup Failed: NONE
├── Backup Overdue: NONE
├── Disk Space Low: NONE
└── Recovery Test Failed: NONE
```

### Alert Configuration

**Set up backup failure alerts:**

**1. MongoDB Atlas Alerts:**

```
Alert Type: Backup Snapshot Status
Condition: status = FAILURE
Notify: Slack + Email
```

**2. PostgreSQL Script Alerts (via CloudWatch):**

```bash
# In backup script, send metric on failure
aws cloudwatch put-metric-data \
  --namespace FreightFlow \
  --metric-name BackupSuccess \
  --value 1  # or 0 if failed
```

---

## 🧪 **Part 5: Recovery Testing Schedule**

### Monthly Restore Drill

**First Friday of Each Month:**

```
1. Select random backup from 30 days ago
2. Restore to test cluster/database
3. Run data validation queries
4. Compare row counts with production
5. Document any anomalies
6. Clean up test resources
7. Post report in Slack
```

**Test Checklist:**

```markdown
# Backup Recovery Test - May 1, 2026

## Pre-Test
- [ ] Backup timestamp: May 1 2:00 AM
- [ ] Backup size: 5.1 MB
- [ ] Create test environment

## Restore Process
- [ ] Restore initiated: 2:30 PM
- [ ] Restore completed: 2:35 PM (5 min)
- [ ] Test cluster healthy

## Data Validation
- [ ] Invoices: 1,245 documents (✓ matches prod)
- [ ] Users: 89 documents (✓ matches prod)
- [ ] Transactions: 3,456 documents (✓ matches prod)

## Smoke Tests
- [ ] Can connect to DB
- [ ] Can query all collections
- [ ] No corrupted records
- [ ] Indexes working

## Cleanup
- [ ] Test cluster deleted
- [ ] S3 files verified
- [ ] No extra charges

## Result: ✅ SUCCESS
Time to Recovery: 5 minutes
Data Loss: 0 (100% preserved)
```

---

## 📊 **Part 6: Backup Metrics & Reporting**

### Weekly Backup Report

**Email: Ganesh, Monday 9 AM:**

```
📊 Backup Health Report - Week of May 12-18, 2026

✅ Backup Success Rate: 100% (168/168 backups)
✅ Average Backup Time: 2.3 minutes
✅ Average Backup Size: 5.1 MB
✅ Total Backups Retained: 120 (30 days)
✅ S3 Archive Size: 45 MB (3 months)

Last 5 Backups:
1. May 18 2:00 AM: ✅ 5.2 MB (2m 15s)
2. May 17 8:00 PM: ✅ 5.2 MB (2m 10s)
3. May 17 2:00 PM: ✅ 5.1 MB (2m 05s)
4. May 17 8:00 AM: ✅ 5.1 MB (2m 20s)
5. May 16 2:00 PM: ✅ 5.0 MB (2m 12s)

Next Recovery Test: June 1, 2026 (2 weeks)

Issues: NONE
Estimated Recovery Time: 5 minutes
Storage Cost: $0.50/month (S3)
```

### Backup Retention Matrix

```
Retention Policy:

Frequency | Duration | Total | Storage | Use Case
-----------|----------|-------|---------|----------
Every 6h | 30 days | 120 | 600 MB | Recent recovery
Daily | 90 days | 90 | 450 MB | Monthly reports
Weekly | 1 year | 52 | 250 MB | Compliance audit
Monthly | 7 years | 84 | 400 MB | Long-term retention

Total Storage: ~1.7 GB
Monthly S3 Cost: $0.50 (lifecycle → Glacier after 30 days)
Compliance: ✅ Exceeds GST audit requirements
```

---

## 🆘 **Emergency Recovery Procedures**

### Scenario 1: Accidental Invoice Deletion

```
Time to Recovery: 5-10 minutes
Data Loss: Up to 6 hours
Steps:

1. STOP: Immediately tell backend to stop processing (2 min)
2. IDENTIFY: Find backup from before deletion (1 min)
3. RESTORE: Restore to temp cluster (5 min)
4. VALIDATE: Query to confirm data exists (2 min)
5. SWAP: Update DATABASE_URL (1 min)
6. TEST: Run smoke tests (2 min)
7. COMMUNICATE: Email affected customers (5 min)

Total Time: ~18 minutes
Impact: Users see "system maintenance" banner
```

### Scenario 2: Database Corruption

```
Time to Recovery: 10-20 minutes
Data Loss: Up to 6 hours
Steps:

1. DETECT: MongoDB checks fail, errors in Sentry (1 min)
2. ALERT: Critical alert triggers (automatic) (0 min)
3. ASSESS: Check if affected data is critical (3 min)
4. RESTORE: Initiate restore from clean backup (1 min)
5. VALIDATE: Data validation queries (5 min)
6. SWAP: Update connection string (1 min)
7. MONITOR: Watch for issues (5 min)

Total Time: ~16 minutes
Impact: No user data loss, service degradation < 30 min
```

### Scenario 3: MongoDB Atlas Outage

```
Time to Recovery: 1-3 hours
Data Loss: ZERO (data replicated in 3 regions)
Steps:

1. WAIT: MongoDB auto-failover to replica (1-3 min)
2. MONITOR: Watch system metrics (continuous)
3. IF FAILOVER FAILS: Restore from S3 backup (20 min)

Note: This is extremely rare (MongoDB SLA 99.95%)
Alternative: Use PostgreSQL on Railway (different provider)
```

---

## ✅ **Backup Checklist**

**Initial Setup (Day 1):**
- [ ] MongoDB Atlas backups auto-enabled
- [ ] Snapshot frequency: Every 6 hours
- [ ] Retention: 30 days
- [ ] Alerts configured
- [ ] Backup window: 2 AM UTC
- [ ] S3 bucket created
- [ ] Lifecycle policy enabled
- [ ] Recovery procedure documented

**Ongoing (Weekly):**
- [ ] Check backup success rate (should be 100%)
- [ ] Verify backup sizes normal
- [ ] No alerts in past week
- [ ] Latest backup < 6 hours old

**Monthly:**
- [ ] Run restore test
- [ ] Generate backup report
- [ ] Review recovery procedures
- [ ] Update documentation if needed

**Before Launch:**
- [ ] Test full restore cycle
- [ ] Team trained on recovery
- [ ] Runbook tested
- [ ] All backup alerts green
- [ ] Document recovery time confirmed < 30 min

---

## 💰 **Cost Analysis**

| Component | Cost | Details |
|-----------|------|---------|
| MongoDB Atlas (free tier) | $0 | 512MB, auto backups included |
| S3 Storage (cold) | $0.50/mo | 1.7 GB, auto-archive to Glacier |
| Data Transfer (free tier) | $0 | AWS free tier covers |
| **Total Monthly** | **$0.50** | **Minimal cost for peace of mind** |

---

## 📚 **Resources & Documentation**

**MongoDB Backup Docs:**
- https://docs.mongodb.com/manual/core/backups/
- https://docs.atlas.mongodb.com/backup/

**PostgreSQL Backup Tools:**
- pg_dump: https://www.postgresql.org/docs/current/app-pgdump.html
- WAL archiving: https://www.postgresql.org/docs/current/wal-archiving.html

**AWS S3 Backup:**
- https://aws.amazon.com/blogs/storage/best-practices-for-aws-backup-recovery/
- S3 Lifecycle: https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html

**Compliance References:**
- GST audit trail: https://www.ato.gov.au/Business/GST/
- SOC 2 backup requirements: https://www.aicpa.org/soc2

---

**Owner:** Ganesh Kumar  
**Duration:** 1-2 days (Phase 3.5)  
**Status:** Ready for Implementation  
**Last Updated:** May 15, 2026
