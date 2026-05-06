# Round-Robin Staff Assignment System

## Overview
A sequential staff assignment system that cycles through available staff members automatically, ensuring equal work distribution across team members in each department.

---

## How It Works

### 1. **Assignment Tracking**
- Each issue category (Pothole, Streetlight, Drainage, etc.) has a rotation index that tracks the last assigned staff member
- The system remembers which staff member was last assigned within each category
- State is persisted in `localStorage` for consistency across sessions

### 2. **Round-Robin Cycle**
When an issue needs assignment:
1. **Get Current Index** → Retrieve the last assigned staff member's index for that category
2. **Assign Next Staff** → Get the next staff member in the sequence
3. **Increment Index** → Move pointer to next staff member (wraps around when reaching the end)
4. **Persist State** → Save the updated index to localStorage

**Example:**
```
Category: Pothole
Staff Pool: [Ravi Kumar (0), Nandini Rao (1)]

Assignment Sequence:
Issue 1 → Ravi Kumar (index: 0) → Next index: 1
Issue 2 → Nandini Rao (index: 1) → Next index: 0
Issue 3 → Ravi Kumar (index: 0) → Next index: 1
Issue 4 → Nandini Rao (index: 1) → Next index: 0
...
```

---

## Implementation Details

### Core Functions in `useStore.ts`

#### `getNextStaffForCategory(category: IssueCategory): StaffMember`
Returns the next staff member in rotation for the given category.
```typescript
const nextStaff = getNextStaffForCategory(IssueCategory.POTHOLE);
// Returns: { name: 'Ravi Kumar', title: 'Road Inspector', ... }
```

**Process:**
- Reads current index for category
- Fetches staff from CATEGORY_STAFF
- Returns that staff member
- Increments index for next call
- Saves state to localStorage

#### `getStaffRotationState(category: IssueCategory)`
Returns current rotation status (for UI display).
```typescript
const state = getStaffRotationState(IssueCategory.POTHOLE);
// Returns: { currentIndex: 1, totalStaff: 2 }
// Meaning: Next assignment will be index 1 out of 2 staff members
```

#### `staffAssignmentIndex`
Global tracking object persisted to localStorage as `jan_samadhan_v2_assignment_index`.

---

## UI Integration

### Admin Portal Assignment Button

Located in **Quick Actions** panel on each unreassigned issue:

```
┌─ Quick Actions ─────────┐
│ ✓ Assign to Next Staff  │  ← Orange button (only for unassigned issues)
│ □ Mark In Progress      │
│ □ Close Report          │
│ □ Reopen                │
└─────────────────────────┘
```

**When to Show:**
- Only appears when `issue.isAssigned === false`
- Only for issues with status ≠ RESOLVED

**On Click:**
- Calls `assignNextStaffMember(issue)`
- Creates progress update with stage: **"Assigned"**
- Sets progress to **50%**
- Records assignment note with staff name and title
- Automatically cycles to next staff for future assignments

---

## Data Flow

```
Admin clicks "Assign to Next Staff"
           ↓
assignNextStaffMember(issue)
           ↓
getNextStaffForCategory(category)
           ↓
Check staffAssignmentIndex[category]
           ↓
Get CATEGORY_STAFF[category][currentIndex]
           ↓
Increment index (mod total staff)
           ↓
saveToStorage()
           ↓
updateIssueProgress() with assigned staff
           ↓
Issue marked as "Assigned" with 50% progress
           ↓
Next issue will auto-assign to next staff member
```

---

## Storage Structure

### localStorage Keys

1. **`jan_samadhan_v2_assignment_index`**
   ```json
   {
     "Pothole": 1,
     "Streetlight": 0,
     "Drainage": 1,
     "Garbage": 0,
     "Water Supply": 1,
     "Electricity": 0,
     "Road Damage": 1,
     "Other": 0
   }
   ```
   Stores the next index to assign for each category

2. **`jan_samadhan_v2_issues`**
   - Updated to include `assignedStaff` field with assigned staff details

3. **`jan_samadhan_v2_staff`**
   - Registered/custom staff members if any

---

## Staff Pool by Category

| Category | Staff Members | Rotation |
|----------|---|---|
| Pothole | Ravi Kumar, Nandini Rao | 2 |
| Streetlight | Suresh Babu, Anita George | 2 |
| Drainage | Prakash Singh, Meera Das | 2 |
| Garbage | Salim Khan, Kavya Menon | 2 |
| Water Supply | Arjun Patel, Shweta Iyer | 2 |
| Electricity | Deepak Verma, Pooja Nair | 2 |
| Road Damage | Rahul Sen, Asha Khan | 2 |
| Other | Mohan Das, Farah Ali | 2 |

---

## Example Workflow

### Scenario: Pothole Category Assignment

**Initial State:**
```
staffAssignmentIndex[Pothole] = 0
```

**Step 1: First Issue Reported**
- Admin clicks "Assign to Next Staff"
- System retrieves index 0 → **Ravi Kumar**
- Progress: Reported → Assigned (50%)
- Next index set to 1

**Step 2: Second Issue Reported**
- Admin clicks "Assign to Next Staff"
- System retrieves index 1 → **Nandini Rao**
- Progress: Reported → Assigned (50%)
- Next index set to 0 (wraps around)

**Step 3: Third Issue Reported**
- Admin clicks "Assign to Next Staff"
- System retrieves index 0 → **Ravi Kumar** (again)
- Progress: Reported → Assigned (50%)
- Next index set to 1

---

## Key Features

✅ **Automatic Load Balancing**
- Work distributed fairly across all staff members
- No manual tracking needed

✅ **Persistent State**
- Tracks across browser sessions
- Survives page refreshes

✅ **Per-Category Rotation**
- Each issue category maintains separate rotation
- Pothole assignments don't affect Streetlight assignments

✅ **Clear UI Feedback**
- Button only shows when appropriate
- Shows assigned staff details immediately after assignment
- Progress updates with staff name and assignment note

✅ **Scalable**
- Works with 2+ staff members per category
- Easy to add more staff in CATEGORY_STAFF

---

## Modifications Made

### Files Updated:

1. **`store/useStore.ts`**
   - Added import: `CATEGORY_STAFF` from constants
   - Added: `staffAssignmentIndex` global tracking
   - Added: `initStaffAssignmentIndex()` initialization
   - Added: `getNextStaffForCategory()` - main round-robin function
   - Added: `getStaffRotationState()` - for UI display
   - Updated: `saveToStorage()` - persists assignment index
   - Updated: `loadFromStorage()` - restores assignment index
   - Updated: Return object to export new functions

2. **`pages/AdminPortal.tsx`**
   - Updated: useStore hook call to include new functions
   - Added: `assignNextStaffMember()` handler function
   - Updated: enrichedIssues useMemo to include `isAssigned` flag
   - Added: "Assign to Next Staff" button in Quick Actions
   - Added: UserCheck icon import
   - Updated: Button visibility logic

---

## Testing Round-Robin Assignment

1. **Open Admin Portal**
   - Navigate to Command Center
   - Go to "Reported Issues" tab
   - Select "Last 24 Hours" or "In Progress"

2. **Find an unassigned issue**
   - Look for issue without assigned staff
   - Should show "Assign to Next Staff" button (amber color)

3. **Click the button**
   - Watch the "Assigned Staff" card update
   - Staff should rotate based on category
   - Progress should move to "Assigned" (50%)
   - Note should indicate round-robin assignment

4. **Create another issue in same category**
   - Click "Assign to Next Staff"
   - Staff should be different (next in sequence)
   - Continue to verify rotation works

---

## Troubleshooting

**Issue: Button doesn't appear**
- ✓ Check if issue is already assigned
- ✓ Check if issue status is RESOLVED
- ✓ Refresh page and try again

**Issue: Same staff assigned multiple times**
- ✓ Clear localStorage: `localStorage.removeItem('jan_samadhan_v2_assignment_index')`
- ✓ Refresh page
- ✓ Try assignment again

**Issue: Assignment index not saving**
- ✓ Check browser localStorage is enabled
- ✓ Check console for errors
- ✓ Verify localStorage quota not exceeded
