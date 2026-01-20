# AVA Integration Test Checklist

All AVA GeoJSON files have been added! Use this checklist to verify the integration is working correctly.

## 🧪 Testing Protocol

### Step 1: Start the Development Server
```bash
cd /Volumes/T7/Terranthro/TerranthroSite/client
npm run dev
```

### Step 2: Test National Map
- [ ] Globe loads with satellite imagery
- [ ] All 50 US states visible with white borders
- [ ] Hovering a state shows white glow
- [ ] Cursor changes to pointer on hover
- [ ] Navigation controls work (zoom, rotate)

### Step 3: Test State Navigation (Top Wine States)

#### California (Largest - ~140 AVAs)
- [ ] Click California on national map
- [ ] URL changes to `/states/california`
- [ ] Map centers on California
- [ ] Console shows: "✅ Loaded X AVAs for California"
- [ ] White AVA borders visible
- [ ] Hover AVA → white glow + name at top
- [ ] AVA list panel shows (bottom-left)
- [ ] State name + count at top-center

#### Oregon (Medium - ~20 AVAs)
- [ ] Click Oregon on national map
- [ ] URL changes to `/states/oregon`
- [ ] Map centers on Oregon
- [ ] Console shows: "✅ Loaded X AVAs for Oregon"
- [ ] AVA borders visible
- [ ] Hover → name displays at top
- [ ] Click AVA → navigates to AVA page

#### Washington (Medium - ~15 AVAs)
- [ ] Click Washington on national map
- [ ] URL changes to `/states/washington`
- [ ] AVAs load and display correctly
- [ ] All interactions work

#### New York (Medium - ~10 AVAs)
- [ ] Click New York on national map
- [ ] URL changes to `/states/new-york`
- [ ] AVAs load and display correctly
- [ ] Finger Lakes region visible

#### Texas (Growing - ~10 AVAs)
- [ ] Click Texas on national map
- [ ] Texas AVAs load
- [ ] Hill Country AVAs visible

### Step 4: Test AVA Navigation

Pick any state (recommend California for variety):

1. **From State Map**
   - [ ] Click an AVA polygon
   - [ ] URL changes to `/states/{state}/avas/{ava-name}`
   - [ ] AVA page loads with 3D terrain
   - [ ] AVA boundary visible in white
   - [ ] Terrain exaggeration visible (1.5x)

2. **From AVA List Panel**
   - [ ] Click an AVA name in the list
   - [ ] Same navigation works
   - [ ] AVA page loads correctly

### Step 5: Test All Wine States (Quick Check)

For each remaining state, verify basic functionality:

**Major Producers:**
- [ ] Virginia - AVAs load
- [ ] Pennsylvania - AVAs load
- [ ] Ohio - AVAs load
- [ ] Michigan - AVAs load
- [ ] Missouri - AVAs load
- [ ] North Carolina - AVAs load

**Smaller Producers:**
- [ ] New Jersey - AVAs load
- [ ] Illinois - AVAs load
- [ ] Indiana - AVAs load
- [ ] Colorado - AVAs load
- [ ] Arizona - AVAs load
- [ ] New Mexico - AVAs load
- [ ] Georgia - AVAs load
- [ ] Idaho - AVAs load
- [ ] Maryland - AVAs load

**Northeast:**
- [ ] Connecticut - AVAs load
- [ ] Massachusetts - AVAs load
- [ ] Rhode Island - AVAs load
- [ ] Vermont - AVAs load
- [ ] New Hampshire - AVAs load
- [ ] Maine - AVAs load

**Midwest:**
- [ ] Wisconsin - AVAs load
- [ ] Minnesota - AVAs load
- [ ] Iowa - AVAs load

**South:**
- [ ] Kentucky - AVAs load
- [ ] Tennessee - AVAs load
- [ ] Oklahoma - AVAs load

### Step 6: Test Browser Console

Open DevTools Console and verify:
- [ ] No 404 errors for AVA files
- [ ] Each state shows: "✅ Loaded X AVAs for [State Name]"
- [ ] No JavaScript errors
- [ ] All fetch requests succeed

### Step 7: Test UI Components

**AVA List Panel:**
- [ ] Displays correct AVA count
- [ ] AVAs sorted alphabetically
- [ ] Search works (if >5 AVAs)
- [ ] Click AVA name → navigates correctly
- [ ] Collapse/expand toggle works
- [ ] Scroll works for long lists

**Hover Display:**
- [ ] AVA name appears at top-center
- [ ] Dark overlay with good contrast
- [ ] Name disappears on mouse leave
- [ ] Doesn't block map interactions

**State Boundary:**
- [ ] White outline visible
- [ ] Doesn't interfere with AVA borders
- [ ] Provides geographic context

### Step 8: Test Direct URL Access

Test deep linking:
- [ ] `/states/california` - Loads directly
- [ ] `/states/oregon` - Loads directly
- [ ] `/states/california/avas/napa-valley` - Loads AVA directly
- [ ] Back button works from all pages

### Step 9: Test Mobile Responsiveness

If possible, test on mobile or use DevTools device emulation:
- [ ] Touch interactions work
- [ ] AVA list panel responsive
- [ ] Pinch to zoom works
- [ ] UI doesn't overlap
- [ ] Performance acceptable

### Step 10: Performance Check

- [ ] Initial load time < 3 seconds
- [ ] State navigation smooth
- [ ] No lag when hovering AVAs
- [ ] Map renders without flickering
- [ ] Transitions smooth

## 🐛 Common Issues & Fixes

### AVAs not loading
**Symptom:** Console shows 404 errors
**Fix:** Check files are in `client/public/data/` not `client/src/data/`

### Wrong state centers
**Symptom:** Map centers on wrong location
**Fix:** Verify coordinates in `stateConfig.js`

### No hover effect
**Symptom:** AVAs don't highlight on hover
**Fix:** Check `generateId: true` in map source

### Click not working
**Symptom:** Clicking AVA doesn't navigate
**Fix:** Verify click handler in `MapLibreStateMap.jsx`

## ✅ Success Criteria

The integration is successful when:
- ✅ All 32 wine states load their AVAs
- ✅ All hover interactions work smoothly
- ✅ All click navigation functions correctly
- ✅ Console shows no errors
- ✅ AVA list panel displays correct data
- ✅ Direct URLs work
- ✅ Back button navigation works
- ✅ Mobile experience is acceptable

## 📊 Expected Results

Based on UC Davis data, you should see approximately:

- **California**: 140+ AVAs (largest collection)
- **Oregon**: 20+ AVAs
- **Washington**: 15+ AVAs
- **New York**: 10+ AVAs
- **Virginia**: 8+ AVAs
- **Texas**: 10+ AVAs
- **Other states**: 1-10 AVAs each

**Total US AVAs**: 260+ across all wine regions

## 🎉 Next Steps

Once all tests pass:
1. Remove console.log statements (or reduce verbosity)
2. Add analytics tracking for state/AVA visits
3. Consider adding AVA metadata (soil types, climate data)
4. Implement search across all AVAs
5. Add state-to-state comparisons

---

**Test Date**: _________
**Tester**: _________
**Browser**: _________
**All Tests Passed**: ☐ Yes ☐ No

**Notes**:
