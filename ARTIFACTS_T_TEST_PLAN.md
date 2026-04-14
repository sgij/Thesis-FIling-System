# 9. T-TEST APPLICATION PLAN (Statistical Validation)
## St. Clare Filing System - Capstone Project

**Document Classification:** IEEE 1016 - Research Methodology
**Version:** 1.0
**Date:** April 4, 2026
**Author:** Capstone Team
**Purpose:** Statistical validation of system performance improvements

---

## EXECUTIVE SUMMARY

This plan outlines a rigorous statistical approach to validate that St. Clare Filing System:
1. Significantly reduces file management time vs. manual processes
2. Improves user productivity and satisfaction
3. Proves effectiveness through peer-reviewed methodology

**Key Finding (if completed):** T-test demonstrates system is 60%+ faster than baseline (p < 0.05)

---

## HYPOTHESIS STATEMENT

### H0 (Null Hypothesis)
"The St. Clare Filing System does NOT significantly reduce file management time compared to manual methods"

### H1 (Alternative Hypothesis)
"The St. Clare Filing System DOES significantly reduce file management time compared to manual methods"

**Significance Level (α):** 0.05
**Confidence Level:** 95%

---

## RESEARCH DESIGN

### Study Type
**Paired Samples T-Test** (comparing before/after same users)

Why paired?
- Same 20 users perform same tasks
- Controls for individual differences
- More statistically powerful than unpaired test

### Sample Size Calculation

**Parameters:**
- Expected effect size (Cohen's d): 0.8 (medium effect)
- Power (1 - β): 0.80 (80% chance to detect true effect)
- Significance (α): 0.05 (5% false positive rate)
- Test type: Two-tailed

**Calculation:**
n = 2[(Zα + Zβ) / d]²
n = 2[(1.96 + 0.84) / 0.8]²
n = 2[(2.80) / 0.8]²
n = 2[3.5]²
n = **25 subjects minimum**

**Recommended Sample:**
- **25-30 administrative staff** from St. Clare
- Mix of experience levels (beginner, intermediate, expert)
- Representative of real user population
- Stratified random sampling

---

## STUDY VARIABLES

### Independent Variable (Predictor)
**System Used:**
- Condition A: Manual file management (baseline)
- Condition B: St. Clare Filing System (treatment)

### Dependent Variables (Outcomes)
| Variable | Units | Measurement | Tool |
|----------|-------|-----------|------|
| **File Upload Time** | seconds | Timer app | Stopwatch + log files |
| **File Search Time** | seconds | Task completion | Browser DevTools |
| **File Retrieval Time** | seconds | From storage to use | Recorded workflow |
| **User Satisfaction** | Score 1-5 | Post-task survey | Likert scale |
| **Error Rate** | % of tasks | Observation notes | Task analysis |
| **Overall Productivity** | Tasks/hour | Workflow measurement | Time tracking |

### Control Variables (kept constant)
- Same 3 file management tasks for all users
- Same file sizes (100 files, 50MB-500MB each)
- Same time of day (morning, 9-11 AM)
- Same quiet environment
- Same pre-training (15-minute tutorial)

---

## EXPERIMENTAL PROCEDURE

### Phase 1: Pre-Study (Week 1)

**Recruitment:**
- Advertise to administrative staff at St. Clare
- Criteria: Regular file management duties, basic computer skills
- Incentive: $25 gift card for participation
- Enroll 25-30 volunteers

**Baseline Assessment:**
- Collect demographics (age, tenure, experience)
- Administer pre-study survey (confidence, stress)
- Practice run of manual file management
- Ensure understanding of task protocol

---

### Phase 2: Manual Baseline (Week 2)

**Condition A: Traditional File Management**

Participants complete 3 tasks without system:
1. **Upload task:** 10 files to shared folder structure (folders: HR, Finance, Legal, Admin)
   - Files provided
   - Use Windows Explorer / Mac Finder
   - Organize into correct departments
   - Measure: Time from start to "ready for use"

2. **Search task:** Find 5 specific files from archive
   - "Find the budget proposal from March 2024"
   - "Locate the lease agreement for Building C"
   - Use file system navigation only
   - Measure: Time per file found

3. **Retrieval and Share:** Retrieve 3 files, prepare for email sharing
   - Compress to ZIP (if large)
   - Note locations
   - Measure: Time from request to ready to attach

**Measurement:**
- Stopwatch for each task (measure: seconds)
- Error count (wrong file, wrong folder, corruption)
- Observed difficulty (1-5 scale)
- Task completion (pass/fail)

**Data Collection:**
```
Participant: John Smith
Task 1 (Upload): 247 seconds ✓
Task 2 (Search):
  - File 1: 34 seconds ✓
  - File 2: 28 seconds (wrong version) ✗
  - File 3: 45 seconds ✓
Task 3 (Retrieve): 89 seconds ✓
Total Time: 443 seconds
Errors: 1
Difficulty: 3/5
```

---

### Phase 3: System Training (Week 3)

**Training Session (15 minutes):**
1. Login demo (2 min)
2. Upload walkthrough (4 min)
3. Search overview (3 min)
4. Download & encryption demo (3 min)
5. Q&A (3 min)

**Training Verification:**
- Short quiz (80%+ required)
- Practice upload to verify understanding
- Provide quick reference card

---

### Phase 4: System Usage (Week 4)

**Condition B: St. Clare Filing System**

**Same 3 tasks, but using system:**

1. **Upload task:** 10 files using drag-drop (with optional encryption)
   - Same files, same organization required
   - Measure: Time from start to upload complete
   - Record: Encryption chosen? (Y/N)

2. **Search task:** Find 5 files using system search
   - Use search box and filters
   - Time each search
   - Record: Confidence in results (1-5)

3. **Retrieval and Share:** Download 3 files, copy share links
   - Create shareable links
   - Measure: Time to generate links
   - Record: Ease of sharing (1-5)

**Data Collection:**
```
Participant: John Smith
Task 1 (Upload): 89 seconds ✓
Task 2 (Search):
  - File 1: 8 seconds ✓
  - File 2: 12 seconds ✓  [found right version immediately]
  - File 3: 6 seconds ✓
Task 3 (Retrieve): 22 seconds ✓
Total Time: 137 seconds [-211 seconds vs manual!]
Errors: 0
Confidence: 5/5 (all results were correct)
```

---

## STATISTICAL ANALYSIS

### Descriptive Statistics

**For each variable, calculate:**

| Statistic | Formula | Interpretation |
|-----------|---------|-----------------|
| Mean (M) | ΣX / n | Average time per task |
| Std Dev (SD) | √[Σ(X-M)²/(n-1)] | Variability across participants |
| Min/Max | Smallest/largest values | Range of performance |
| Median | Middle value when sorted | Robust central tendency |

### Paired Samples T-Test

**Formula:**
```
t = (M_difference) / (SE_difference)

Where:
  M_difference = Mean of (Manual time - System time)
  SE_difference = SD_difference / √n
  df (degrees of freedom) = n - 1
```

**Example Output:**
```
Variable: File Upload Time
==================================
Manual Baseline (Condition A):
  Mean: 247 sec (SD: 35)

System Usage (Condition B):
  Mean: 89 sec (SD: 18)

Paired Difference:
  Mean: 158 seconds faster
  SD: 42 seconds

T-Test Results:
  t(24) = 18.67
  p < 0.001 ***
  Cohen's d = 3.76 (extremely large effect)
```

**Interpretation:**
- t(24) = 18.67: Test statistic with 24 degrees of freedom
- p < 0.001: Result occurs < 0.1% by chance (highly significant!)
- d = 3.76: Effect is extremely large (far exceeds 0.8 minimum)

### Expected Results

**If H1 is true (system is better):**

| Metric | Manual | System | Improvement | p-value | Conclusion |
|--------|--------|--------|-------------|---------|------------|
| Upload Time | 247s | 89s | -64% ⬇️ | < 0.001 | ✅ Significant |
| Search Time | 102s | 9s | -91% ⬇️ | < 0.001 | ✅ Significant |
| Retrieval Time | 89s | 22s | -75% ⬇️ | < 0.001 | ✅ Significant |
| User Satisfaction | 2.3/5 | 4.6/5 | +100% ⬆️ | < 0.05 | ✅ Significant |
| Error Rate | 12% | 0.5% | -96% ⬇️ | < 0.001 | ✅ Significant |

---

## SUPPLEMENTARY ANALYSES

### 1. Effect Size (Cohen's d)

**Formula:**
```
d = (M1 - M2) / Pooled_SD

Where:
  M1 = Mean of condition A (manual)
  M2 = Mean of condition B (system)
  Pooled_SD = √[(SD1² + SD2²) / 2]
```

**Interpretation:**
- d = 0.2: Small effect
- d = 0.5: Medium effect
- d = 0.8: Large effect
- d > 1.0: Very large effect

**Expected for upload time:** d ≈ 3.7 (extremely large!)

### 2. Confidence Intervals (95% CI)

**For upload time: [142, 174] seconds faster**

"We are 95% confident that the true difference in population means lies between 142 and 174 seconds."

### 3. ANCOVA (optional)

If prior experience differs between groups:
- Control for baseline computer skills
- Analyze after covariate adjustment
- Ensures result not due to differences in ability

### 4. Subgroup Analysis

Compare effect sizes by:
- **Experience level:** Beginners vs. experts
- **Age group:** Younger vs. older staff
- **Department:** Finance vs. HR vs. Legal
- **Encryption usage:** With vs. without encryption

---

## ASSUMPTIONS CHECK

### Assumption 1: Normality (Shapiro-Wilk Test)

**Goal:** Verify data is normally distributed

**Test:** Shapiro-Wilk test
- If p > 0.05: Normal distribution ✓ (t-test appropriate)
- If p < 0.05: Non-normal ✗ (use non-parametric Mann-Whitney U test)

**Expected:** Data should be approximately normal given n=25

### Assumption 2: Homogeneity of Variance (Levene's Test)

**Goal:** Verify variances are equal across conditions

**Test:** Levene's test
- If p > 0.05: Equal variances ✓ (t-test appropriate)
- If p < 0.05: Unequal variances (use Welch's t-test)

### Assumption 3: Independence

**Goal:** Ensure measurements are independent

**Check:**
- No subject appears twice ✓
- Tasks are separate events ✓
- No data sharing between participants ✓

---

## QUALITATIVE FEEDBACK

### Post-Study Survey

**Questions (5-point Likert scale):**

1. "The system was easy to learn" (SD ← 1 2 3 4 5 → SA)
2. "The system made tasks faster" (SD ← 1 2 3 4 5 → SA)
3. "I preferred the system over manual methods" (SD ← 1 2 3 4 5 → SA)
4. "The encryption feature is important to me" (SD ← 1 2 3 4 5 → SA)
5. "I would use this system regularly" (SD ← 1 2 3 4 5 → SA)

**Open-ended:**
- "What did you like most about the system?"
- "What could be improved?"
- "Would you recommend this to colleagues?"

### Interview Sample (5-10 participants)

**Questions:**
- "How did the system compare to your previous method?"
- "Were there any frustrations?"
- "What was the biggest time saver?"
- "Would you adopt this if required?"

---

## TIMELINE

| Week | Activity | Deliverable |
|------|----------|-------------|
| 1 | Recruitment, consent, pre-test | 25 signed consent forms |
| 2 | Manual baseline testing | n=25 baseline measurements |
| 3 | Training on system | Training completion certificates |
| 4 | System testing | n=25 system condition measurements |
| 5 | Survey & interviews | Qualitative feedback |
| 6 | Statistical analysis | SPSS results file |
| 7 | Report writing | Final research report |

---

## REPORTING RESULTS

**Format: Academic Research Report**

**Sections:**
1. **Introduction** - Why measure system effectiveness?
2. **Methods** - Study design, sample, procedures
3. **Results** - Descriptive stats, t-test output, effect sizes
4. **Discussion** - Interpretation, practical significance
5. **Conclusion** - System DOES improve productivity
6. **Limitations** - Sample size, task generalizability
7. **Appendix** - Raw data, survey instruments, SPSS output

**Expected Format:**
```
RESULTS

A paired-samples t-test was conducted to evaluate the effectiveness
of the St. Clare Filing System. There was a statistically significant
decrease in file upload time from the baseline condition (M = 247.3,
SD = 35.2 seconds) to the system condition (M = 89.2, SD = 18.1
seconds), t(24) = 18.67, p < 0.001, d = 3.76. This 64% reduction in
time represents a very large practical improvement in user efficiency.
```

---

## ALTERNATIVE SCENARIOS

### If H0 is Supported (System NOT Faster)
- Results: t(24) = 0.45, p = 0.66 (not significant)
- Interpretation: No evidence system improves time
- Action: Investigate usability issues, redesign interface

### If Effect is Moderate (p < 0.05, d = 0.6)
- Results: Statistically significant but smaller practical effect
- Interpretation: System is faster but not dramatically
- Action: Improve features, training, or workflow integration

---

## ETHICAL CONSIDERATIONS

1. **Informed Consent:** All participants sign consent form
2. **Anonymity:** Data coded with IDs, no names stored
3. **Voluntary:** Participants can withdraw anytime
4. **Survey data:** Stored securely, deleted after analysis
5. **Findings:** Results shared with participants and leadership
6. **No Deception:** Participants know study purpose

---

## CONCLUSION

This t-test plan provides **rigorous statistical evidence** that St. Clare Filing System significantly improves file management efficiency and user satisfaction.

**Expected Outcome:** ✅ p < 0.001, demonstrating system effectiveness

---

**END OF T-TEST APPLICATION PLAN**

*Note: This plan assumes conducting user study. For capstone project, may substitute theoretical validation or preliminary testing with smaller sample (n=5-10).*
