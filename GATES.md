# Acceptance Gates: Pure Clean Real Account & Smart Reset

- [x] `gate-1-machines-tenant-isolated`: Machines IoT state is isolated per ownerUid (`lh_machines_${uid}`) and starts empty `[]` for real accounts. (PASSED)
- [x] `gate-2-stats-clean-slate`: Monthly and Yearly stats dynamically calculate from real orders, with NO hardcoded demo numbers ("Desember (Est)", "Rp 69.200.000", "+40.2% CAGR", "Rp 1.52 Milyar", "116.490 kg", "Kemang/Bintaro/Tebet") for real accounts. (PASSED)
- [x] `gate-3-login-clean-tenant-loaded`: `loginWithPersonalGoogle` and `loginWithGmail` call `loadTenantData` to purge in-memory demo data and load real tenant data. (PASSED)
- [x] `gate-4-smart-reset-all-data`: `resetAllData()` resets real accounts to pure clean slate (0 orders, 0 inventory, 0 machines, 0 customers, 0 staff except owner) without injecting `ALL_ORDERS` or demo users. (PASSED)
- [x] `gate-5-build-and-e2e-verification`: `npm run build` passes with zero TypeScript errors, and Puppeteer E2E test proves real account clean slate and reset behavior across all tabs. (PASSED)
