# 10. COST-BENEFIT ANALYSIS (Financial ROI)
## St. Clare Filing System - Capstone Project

**Document Classification:** IEEE 1016 - Business Case Analysis
**Version:** 1.0
**Date:** April 4, 2026
**Author:** Capstone Team
**Purpose:** Quantify financial impact and return on investment

---

## EXECUTIVE SUMMARY

St. Clare Filing System delivers **$426,000 net benefit over 3 years** with a **ROI of 380%** and **payback period of 6.2 months**.

| Metric | Value | Interpretation |
|--------|-------|-----------------|
| **Total Investment** | $112,000 | One-time + Year 1 costs |
| **3-Year Benefits** | $538,000 | Productivity + security gains |
| **Net Benefit** | $426,000 | After all costs |
| **ROI** | 380% | Return per dollar invested |
| **Payback Period** | 6.2 months | Break-even timeline |
| **BCR** | 4.8:1 | Benefit-to-cost ratio |

---

## COST ESTIMATION

### DEVELOPMENT COSTS

#### 1. Engineering Team ($45,000)

| Resource | Rate | Hours | Cost |
|----------|------|-------|------|
| Lead Developer | $75/hr | 200 | $15,000 |
| Junior Developer | $50/hr | 300 | $15,000 |
| QA Engineer | $60/hr | 100 | $6,000 |
| UI/UX Designer | $65/hr | 80 | $5,200 |
| Project Manager | $70/hr | 40 | $2,800 |
| **Subtotal** | | **720 hrs** | **$44,000** |

**Assumptions:**
- 4-month development cycle
- 3-person core team
- Includes design, coding, testing, documentation

---

#### 2. Infrastructure Setup ($8,000)

| Item | Cost | Details |
|------|------|---------|
| PostgreSQL Database Server | $2,500 | AWS RDS, 256GB storage initially |
| Cloud Hosting (Compute) | $3,000 | AWS EC2 + auto-scaling setup |
| SSL Certificates (3 years) | $600 | One certificate, auto-renewal |
| Email Server (notification) | $1,200 | SendGrid API, 100k emails/month |
| CDN for file delivery | $700 | CloudFlare cache |
| **Subtotal** | | **$8,000** |

---

#### 3. Security & Compliance ($12,000)

| Item | Cost | Rationale |
|------|------|-----------|
| Security Audit | $4,000 | Penetration testing by external firm |
| HIPAA Compliance (if needed) | $3,000 | Documentation, training, audit prep |
| Data Backup Solution | $3,000 | Automated backup + disaster recovery |
| SSL/TLS Implementation | $2,000 | Code review, secure deployment |
| **Subtotal** | | **$12,000** |

---

#### 4. Licensing & Tools ($8,000)

| Item | Cost | Details |
|------|------|---------|
| Development Tools (VS Code, etc.) | $500 | Team subscriptions |
| Collaboration Tools (Slack, Jira) | $1,500 | 6-month team coordination |
| Testing Tools (Jest, Selenium) | $1,500 | Automated test framework |
| Monitoring Tools (DataDog, Sentry) | $2,500 | Error tracking, performance monitoring |
| Licenses (Node.js ecosystem) | $1,000 | Various npm packages |
| Documentation Tools (Confluence) | $1,000 | Internal wiki maintenance |
| **Subtotal** | | **$8,000** |

---

### IMPLEMENTATION & DEPLOYMENT ($15,000)

| Activity | Cost | Notes |
|----------|------|-------|
| Staff Training (12 employees) | $4,000 | 4 hours × 12 staff × $83.33/hr |
| Change Management | $3,000 | Process documentation, guides |
| Data Migration (legacy import) | $5,000 | From old system to new |
| Pilot Testing (2-week phase) | $2,000 | Monitoring + bug fixes |
| Go-live Support (1 week 24/7) | $1,000 | On-call availability |
| **Subtotal** | | **$15,000** |

---

### YEAR 1 OPERATIONAL COSTS ($32,000)

| Item | Cost | Breakdown |
|------|------|-----------|
| Cloud Hosting (annual) | $9,600 | $800/month × 12 |
| Database Maintenance | $3,600 | $300/month × 12 |
| Security Updates & Patches | $4,800 | $400/month × 12 |
| Support & Maintenance (0.5 FTE) | $10,000 | Part-time sysadmin |
| Monitoring & Logging | $2,400 | $200/month × 12 |
| Backup/Disaster Recovery | $1,600 | $133/month × 12 |
| **Subtotal** | | **$32,000** |

---

### YEARS 2-3 OPERATIONAL COSTS ($24,000/year)

Hosting and support decrease as system stabilizes:
- Cloud infrastructure: $8,500/year
- Database: $3,000/year
- Monitoring: $2,100/year
- Support (0.3 FTE): $6,400/year
- Miscellaneous: $4,000/year
- **Annual Total:** $24,000

**3-Year cost:** $24k × 2 = **$48,000**

---

## TOTAL COST CALCULATION

| Category | Year 0 | Year 1 | Year 2 | Year 3 | 3-Year Total |
|----------|--------|--------|--------|--------|-------------|
| Development | $45,000 | - | - | - | $45,000 |
| Infrastructure | $8,000 | - | - | - | $8,000 |
| Security | $12,000 | - | - | - | $12,000 |
| Licensing | $8,000 | - | - | - | $8,000 |
| Implementation | $15,000 | - | - | - | $15,000 |
| Operations | - | $32,000 | $24,000 | $24,000 | $80,000 |
| **TOTAL PER YEAR** | **$88,000** | **$32,000** | **$24,000** | **$24,000** | **$168,000** |

---

## BENEFIT ESTIMATION

### DIRECT BENEFITS

#### 1. Staff Time Savings ($320,000 over 3 years)

**Baseline:** Manual file management currently takes staff **4 hours/week**

**Participants:** 12 administrative staff
- Finance department: 3 staff
- HR department: 2 staff
- Legal department: 3 staff
- General Admin: 4 staff

**Current Workflow:**
- File search: 15 min/day average
- File upload/organization: 10 min/day average
- File retrieval/sharing: 5 min/day average
- **Total: 30 min/day = 4 hours/week per person**

**With System (64% time reduction per artifact #8 evaluation):**
- File search: 5 min/day (-67%)
- File upload/organization: 4 min/day (-60%)
- File retrieval/sharing: 2 min/day (-60%)
- **Total: 11 min/day = 1.5 hours/week per person**
- **Time saved: 2.5 hours/week per person**

**Calculation:**

| Year | Months | Staff | Hrs/Wk Saved | Weeks/Year | Total Hours | $/hr | Annual Benefit |
|------|--------|-------|--------------|-----------|-------------|------|-----------------|
| 1 | 4 | 12 | 2.5 | 52 | 6,240 | $45 | $280,800 |
| 2 | 12 | 12 | 2.5 | 52 | 15,600 | $45 | $702,000 |
| 3 | 12 | 12 | 2.5 | 52 | 15,600 | $50 | $780,000 |

**But conservative estimate (accounting for ramp-up):**
- Year 1: Only 4 months of use (Oct-Dec), 50% adoption → **$54,000**
- Year 2: Full 12 months, 85% adoption → **$205,000**
- Year 3: Full 12 months, 95% adoption → **$221,000**
- **3-Year Subtotal: $480,000**

*(Note: Using $45-50/hr average fully-loaded staff cost including benefits)*

---

#### 2. Reduced File Storage Costs ($18,000 over 3 years)

**Current State:** Files stored on:
- Network-attached storage (NAS): $5,000/year
- External cloud storage (Dropbox): $2,000/year
- Paper archives requiring physical storage: $1,000/year
- **Current total: $8,000/year**

**With System:**
- PostgreSQL database: $3,600/year (included in infrastructure)
- Backup/archival: $1,200/year (included in operations)
- Paper elimination: Saves $1,000/year
- **New total: $4,800/year**
- **Annual savings: $3,200**

**3-Year Benefit:** $3,200 × 3 = **$9,600**

---

#### 3. Error Reduction & Compliance ($30,000)

**Current Issues:**
- Lost files: 3 incidents/year, emergency recovery $2,000 each = $6,000/year
- Incorrect file sharing (compliance risk): 2 incidents/year, legal review $3,000 each = $6,000/year
- Regulatory penalties: 1 audit failure/2 years, $15,000 cost
- Manual audit trail: 40 hours/year of manual documentation = $1,800/year

**With System (automatic audit logging):**
- Lost files: Reduces to 0.5/year → Cost drops to $1,000/year
- Incorrect sharing: Reduces to 0 (access controls) → Cost drops to $1,000/year
- Regulatory penalties: Prevents failures → Saves $7,500/year
- Audit documentation: Automated → Saves $1,800/year
- **Annual savings: $15,300**

**3-Year Benefit:** $15,300 × 3 = **$45,900**

---

### INDIRECT BENEFITS

#### 4. Improved Productivity & Reduced Bottlenecks ($40,000)

**Scenario:**
- File management delays currently create 1.5 hours/week bottleneck per department
- Finance dept waits for file clarity: $500/week lost → $26,000/year
- Legal delays on contract access: $200/week lost → $10,400/year
- HR delays on employee docs: $150/week lost → $7,800/year
- **Current annual cost: $44,200**

**With System:**
- 80% reduction in delays → Saves $35,360/year
- Conservative (70%): **$31,000/year**

**3-Year Benefit:** $31,000 × 3 = **$93,000**

---

#### 5. Security & Risk Avoidance ($120,000 reduction in risk)

**Current Risks:**
- Data breach potential: $250,000 liability exposure
- HIPAA violation fine: $100,000 potential
- Ransomware attack impact: $75,000 potential
- **Total risk exposure: $425,000**

**System Reduces Risk:**
- Encryption reduces breach impact: -$75,000 exposure
- Access controls reduce unauthorized access: -$150,000 exposure
- Audit trails support compliance: -$80,000 exposure
- Regular backups reduce ransomware impact: -$120,000 exposure
- **Risk reduction: $425,000**

**Conservative Risk Benefit (assuming 20% actualized):** $425,000 × 0.20 = **$85,000 one-time benefit**

---

#### 6. Employee Satisfaction & Retention ($50,000)

**Current State:**
- Staff frustration with file management: 1 turnover per year
- Turnover cost (recruiting + training): $35,000 per person
- Annual turnover cost: $35,000

**With System:**
- Improved tool satisfaction increases retention: -0.6 turnovers/year
- Estimated savings: $21,000/year

**3-Year Benefit:** $21,000 × 3 = **$63,000**

---

## TOTAL BENEFIT CALCULATION

| Category | Year 1 | Year 2 | Year 3 | 3-Year Total |
|----------|--------|--------|--------|------------|
| **Direct Benefits** | | | | |
| Staff time savings | $54,000 | $205,000 | $221,000 | $480,000 |
| Storage cost reduction | $3,200 | $3,200 | $3,200 | $9,600 |
| Error reduction | $15,300 | $15,300 | $15,300 | $45,900 |
| **Indirect Benefits** | | | | |
| Productivity gains | $31,000 | $31,000 | $31,000 | $93,000 |
| Risk avoidance | $85,000 | $0 | $0 | $85,000 |
| Retention/satisfaction | $21,000 | $21,000 | $21,000 | $63,000 |
| **TOTAL ANNUAL BENEFIT** | **$209,500** | **$275,500** | **$291,500** | **$776,500** |

---

## FINANCIAL ANALYSIS

### Net Present Value (NPV)

**Formula:** NPV = Σ(Benefit Cash Flow) - Σ(Cost Cash Flow)

| Year | Benefits | Costs | Net Cash Flow | Discount (3%) | PV |
|------|----------|-------|---------------|---------------|-----|
| 0 | $0 | ($88,000) | ($88,000) | 1.000 | ($88,000) |
| 1 | $209,500 | ($32,000) | $177,500 | 0.971 | $172,345 |
| 2 | $275,500 | ($24,000) | $251,500 | 0.943 | $237,165 |
| 3 | $291,500 | ($24,000) | $267,500 | 0.915 | $244,653 |
| | | | | **NPV** | **$566,163** |

**Interpretation:** System generates $566,000 in true value (present dollars) over 3 years.

---

### Return on Investment (ROI)

**Formula:** ROI = (Total Benefits - Total Costs) / Total Costs × 100%

**Calculation:**
```
Total 3-Year Benefits: $776,500
Total 3-Year Costs: $168,000
Net Profit: $608,500

ROI = ($608,500 / $168,000) × 100% = 362%
```

**Interpretation:** For every $1 invested, receive $3.62 back in profit.

---

### Benefit-to-Cost Ratio (BCR)

**Formula:** BCR = Total Benefits / Total Costs

```
BCR = $776,500 / $168,000 = 4.62:1
```

**Interpretation:** Benefits exceed costs by 4.62 times. Excellent ratio (>1.0 is good, >3.0 is excellent).

---

### Payback Period

**Definition:** Time for cumulative benefits to exceed cumulative costs

| Period | Cumulative Costs | Cumulative Benefits | Status |
|--------|-----------------|-------------------|--------|
| Year 0 | ($88,000) | $0 | -$88,000 |
| Month 4 (Year 1) | ($96,000) | $39,925 | -$56,075 |
| Month 8 (Year 1) | ($104,000) | $79,850 | -$24,150 |
| Month 10 (Year 1) | ($106,667) | $99,813 | -$6,854 |
| Month 10.3 (Year 1) | ($106,667) | $106,667 | **BREAKEVEN** |

**Payback Period: 10.3 months (approximately 6.2 months AFTER go-live, since development is months 0-4)**

---

### Break-Even Analysis

**Monthly breakeven after deployment:**
- Monthly cost: $2,667 (operations only)
- Monthly benefit: $17,458 (average)
- **Surplus/month: $14,791**

System pays for operational costs within **9 days** of go-live.

---

## SENSITIVITY ANALYSIS

### Scenario 1: Pessimistic Case (-30% benefits)

| Metric | Base Case | Pessimistic | Change |
|--------|-----------|------------|--------|
| 3-Year Benefits | $776,500 | $543,550 | -30% |
| 3-Year Costs | $168,000 | $184,800 | +10% |
| Net Benefit | $608,500 | $358,750 | -41% |
| ROI | 362% | 194% | -46% |
| Payback | 10.3 months | 18.6 months | +8.3 mo |

**Even in pessimistic case: Still profitable with 194% ROI and 18.6-month payback.**

---

### Scenario 2: Optimistic Case (+20% benefits)

| Metric | Base Case | Optimistic | Change |
|--------|-----------|-----------|--------|
| 3-Year Benefits | $776,500 | $931,800 | +20% |
| 3-Year Costs | $168,000 | $156,000 | -7% |
| Net Benefit | $608,500 | $775,800 | +27% |
| ROI | 362% | 497% | +137% |
| Payback | 10.3 months | 8.1 months | -2.2 mo |

**Optimistic case: 497% ROI with 8.1-month payback - excellent outcome.**

---

### Scenario 3: High-Risk Case (Adoption only 50%)

If only 50% of staff adopt system:
- Time savings: $240,000 (instead of $480,000)
- Reduced errors: $23,000 (instead of $45,900)
- Productivity gains: $46,500 (instead of $93,000)
- **3-Year benefits: $520,000**

**Outcome:**
- Net benefit: $352,000
- ROI: 209%
- Payback: 15.2 months
- **Still profitable, but less impressive.**

---

## RISK FACTORS

### High-Impact Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **Staff resistance to change** | High (60%) | -30% adoption | Comprehensive training, change management |
| **Technical issues post-launch** | Medium (40%) | -$20K + delays | Thorough testing, 24/7 support |
| **Inadequate infrastructure** | Low (15%) | -$30K upgrade cost | Capacity planning, scalable cloud |
| **Security breach exposing costs** | Low (10%) | +$250K liability | Security audit pre-launch |
| **Scope creep in development** | Medium (50%) | +15% dev cost | Strict project management |

---

## INTANGIBLE BENEFITS (Not Quantified)

1. **Improved Data Governance**
   - Better access controls reduce unauthorized file access
   - Automatic audit trail improves regulatory standing
   - Industry reputation improvement

2. **Enhanced Employee Experience**
   - Modern, intuitive interface satisfaction
   - Reduced frustration with file management
   - Better work-life balance (less time searching files)

3. **Organizational Agility**
   - Faster file access enables faster decision-making
   - Remote work capability (cloud-based system)
   - Scalability to support organizational growth

4. **Knowledge Preservation**
   - Centralized file organization prevents knowledge loss
   - Search capability makes institutional knowledge accessible
   - Succession planning benefits from documented processes

---

## COMPARISON TO ALTERNATIVES

### Option A: Continue Current System (Do Nothing)
- **Costs:** $8,000/year ongoing (current NAS + cloud)
- **Benefits:** None
- **3-Year Cost:** $24,000
- **Verdict:** ❌ No improvement, growing compliance risk

### Option B: Buy Commercial Solution (SaaS)
- **Annual Cost:** $25,000 (commercial file management)
- **Setup:** $10,000
- **3-Year Cost:** $85,000
- **Benefits:** Similar to in-house (~90%)
- **Verdict:** ⚠️ Less control, higher vendor lock-in, licensing costs after 3 years

### Option C: Build In-House (Proposed Solution)
- **3-Year Cost:** $168,000 (development + ops)
- **3-Year Benefits:** $776,500
- **Net Benefit:** $608,500
- **Verdict:** ✅ Best ROI, full control, scalable

---

## COST-BENEFIT SUMMARY TABLE

| Dimension | Value | Assessment |
|-----------|-------|-----------|
| **Total Investment** | $168,000 | Moderate for government institution |
| **Payback Period** | 10.3 months | Fast (< 1 year) |
| **NPV (3-year)** | $566,163 | Very positive |
| **ROI (3-year)** | 362% | Excellent |
| **BCR** | 4.62:1 | Outstanding (target >1.0) |
| **Risk Level** | Medium | Mitigated through phased rollout |
| **Strategic Fit** | Excellent | Aligns with digital transformation goals |

---

## RECOMMENDATIONS

1. ✅ **PROCEED with development** - Clear positive ROI and payback period
2. ✅ **Invest in staff training** - Critical success factor for adoption
3. ✅ **Maintain 24/7 support** - First 3 months post-launch
4. ✅ **Monitor KPIs monthly** - Track actual benefits vs. projections
5. ✅ **Plan for Year 2 enhancements** - File sharing, versioning (already budgeted)
6. ⚠️ **Manage change carefully** - Address resistance through communication

---

## CONCLUSION

St. Clare Filing System is a **financially sound investment** with:
- ✅ $566,000 net present value
- ✅ 362% return on investment
- ✅ 10.3-month payback period
- ✅ Profitable even in pessimistic scenarios
- ✅ Strategic value beyond financial metrics

**RECOMMENDATION: Approve for immediate development & implementation.**

---

**END OF COST-BENEFIT ANALYSIS**

*All figures in USD. Assumes St. Clare is a US institution. Adjust based on local salary rates and infrastructure costs.*
