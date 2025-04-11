document.addEventListener('DOMContentLoaded', () => {
    // --- Day.js Setup ---
    // Ensure plugins are loaded *before* use and extend dayjs
    if (window.dayjs_plugin_utc) dayjs.extend(window.dayjs_plugin_utc);
    if (window.dayjs_plugin_relativeTime) dayjs.extend(window.dayjs_plugin_relativeTime);
    if (window.dayjs_plugin_isSameOrAfter) dayjs.extend(window.dayjs_plugin_isSameOrAfter);
    if (window.dayjs_plugin_isBefore) dayjs.extend(window.dayjs_plugin_isBefore);

    // Check if essential plugins loaded (optional but good for debugging)
    if (typeof dayjs().isSameOrAfter !== 'function') {
        console.error("Day.js isSameOrAfter plugin failed to load!");
        alert("Error: A required date library component (isSameOrAfter) failed to load. Some features might not work correctly. Please check your internet connection and refresh.");
    }
     if (typeof dayjs().isBefore !== 'function') {
        console.error("Day.js isBefore plugin failed to load!");
        // Potentially show an alert here too if needed
    }


    // --- Constants ---
    const DB_KEY = 'hormoneTrackerData_v2';
    const LAB_UNITS = {
        totalT: 'ng/dL', freeT: 'pg/mL', e2: 'pg/mL', shbg: 'nmol/L',
        prolactin: 'ng/mL', hematocrit: '%', cholesterol: 'mg/dL'
    };
    const LAB_REFERENCE_RANGES = {
        totalT: { min: 264, max: 916 }, freeT: { min: 9, max: 30 }, e2: { min: 10, max: 40 },
        shbg: { min: 10, max: 50 }, prolactin: { min: 2, max: 18 }, hematocrit: { min: 38, max: 52 },
        cholesterol: { min: 0, max: 200 }
    };
    const DATE_FORMAT = 'YYYY-MM-DD';
    const DISPLAY_DATE_FORMAT = 'MMM D, YYYY';

    // --- DOM Elements ---
    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('.nav-item');
    const notification = document.getElementById('notification');
    const resetDataBtn = document.getElementById('reset-data-btn');
    const exportDataBtn = document.getElementById('export-data-btn');
    const importDataBtn = document.getElementById('import-data-btn');
    const importFileInput = document.getElementById('import-file-input');
    const activeCycleDashboard = document.getElementById('active-cycle-dashboard');
    const dashboardCycleName = document.getElementById('dashboard-cycle-name');
    const dashboardCycleDates = document.getElementById('dashboard-cycle-dates');
    const dashboardCycleStatus = document.getElementById('dashboard-cycle-status');
    const dashboardCycleProgress = document.getElementById('dashboard-cycle-progress');
    const dosesCompletedCount = document.getElementById('doses-completed-count');
    const cycleEndDate = document.getElementById('cycle-end-date');
    const timeRemaining = document.getElementById('time-remaining');
    const nextDoseInfo = document.getElementById('next-dose-info');
    const lastDoseInfo = document.getElementById('last-dose-info');
    const latestLabSummary = document.getElementById('latest-lab-summary');
    const viewAllLabsBtn = document.getElementById('view-all-labs-btn');
    const viewCycleDetailsBtn = document.getElementById('view-cycle-details-btn');
    const startCycleBtnDash = document.getElementById('start-cycle-btn-dash');
    const newCycleBtn = document.getElementById('new-cycle-btn');
    const cycleForm = document.getElementById('cycle-form');
    const cancelCycleBtn = document.getElementById('cancel-cycle-btn');
    const saveCycleBtn = document.getElementById('save-cycle-btn');
    const cycleNameInput = document.getElementById('cycle-name');
    const cycleStartDateInput = document.getElementById('cycle-start-date');
    const testosteroneDoseInput = document.getElementById('testosterone-dose-amount');
    const testosteroneDurationInput = document.getElementById('testosterone-duration');
    const hcgDoseInput = document.getElementById('hcg-dose-amount');
    const hcgDurationInput = document.getElementById('hcg-duration');
    const hcgFrequencyOptions = document.querySelectorAll('input[name="hcg-frequency"]');
    const noCycleMessage = document.getElementById('no-cycle-message');
    const activeCycleDetails = document.getElementById('active-cycle-details');
    const activeCycleName = document.getElementById('active-cycle-name');
    const activeCycleDates = document.getElementById('active-cycle-dates');
    const activeCycleDurations = document.getElementById('active-cycle-durations');
    const activeCycleStatus = document.getElementById('active-cycle-status');
    const editCycleNameBtn = document.getElementById('edit-cycle-name-btn');
    const completeCycleBtn = document.getElementById('complete-cycle-btn');
    const doseScheduleBody = document.getElementById('dose-schedule-body');
    const cycleProgressBar = document.getElementById('cycle-progress-bar');
    const editTestosteroneDoseInput = document.getElementById('edit-testosterone-dose');
    const editHcgDoseInput = document.getElementById('edit-hcg-dose');
    const saveDoseChangesBtn = document.getElementById('save-dose-changes-btn');
    const cycleNotesTextarea = document.getElementById('cycle-notes');
    const saveNotesBtn = document.getElementById('save-notes-btn');
    const activeCycleLabResultsBody = document.getElementById('active-cycle-lab-results-body');
    const addLabResultCurrentCycleBtn = document.getElementById('add-lab-result-current-cycle-btn');
    const allLabResultsBody = document.getElementById('all-lab-results-body');
    const addLabResultAllBtn = document.getElementById('add-lab-result-all-btn');
    const historyList = document.getElementById('history-list');
    const historyDetailModal = document.getElementById('history-detail-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const closeModalFooterBtn = document.getElementById('close-modal-footer-btn');
    const modalCycleName = document.getElementById('modal-cycle-name');
    const modalCycleDates = document.getElementById('modal-cycle-dates');
    const modalDoseScheduleBody = document.getElementById('modal-dose-schedule-body');
    const modalLabResultsBody = document.getElementById('modal-lab-results-body');
    const modalCycleNotes = document.getElementById('modal-cycle-notes');
    const editCycleModal = document.getElementById('edit-cycle-modal');
    const closeEditModalBtn = document.getElementById('close-edit-modal');
    const cancelEditCycleBtn = document.getElementById('cancel-edit-cycle');
    const saveEditCycleBtn = document.getElementById('save-edit-cycle');
    const editCycleNameInput = document.getElementById('edit-cycle-name');
    const addLabModal = document.getElementById('add-lab-modal');
    const addLabForm = document.getElementById('add-lab-form');
    const closeAddLabModalBtn = document.getElementById('close-add-lab-modal');
    const cancelAddLabBtn = document.getElementById('cancel-add-lab');
    // const saveAddLabBtn = document.getElementById('save-add-lab'); // Not explicitly used if form submits
    const addLabCycleSelect = document.getElementById('add-lab-cycle-select');
    const addLabDateInput = document.getElementById('add-lab-date');
    let addLabModalFocusableEls, addLabModalFirstFocusableEl, addLabModalLastFocusableEl;
    const editDoseModal = document.getElementById('edit-dose-modal');
    const editDoseForm = document.getElementById('edit-dose-form');
    const closeEditDoseModalBtn = document.getElementById('close-edit-dose-modal');
    const cancelEditDoseBtn = document.getElementById('cancel-edit-dose');
    // const saveEditDoseBtn = document.getElementById('save-edit-dose'); // Not explicitly used if form submits
    const editDoseIdInput = document.getElementById('edit-dose-id');
    const editDoseCycleIdInput = document.getElementById('edit-dose-cycle-id');
    const editDoseDateInput = document.getElementById('edit-dose-date');
    const editDoseTypeInput = document.getElementById('edit-dose-type');
    const editDoseAmountInput = document.getElementById('edit-dose-amount');
    const editDoseUnitInput = document.getElementById('edit-dose-unit');
    const cyclesListContainer = document.getElementById('cycles-list-container');
    const generateComparisonBtn = document.getElementById('generate-comparison-btn');
    const comparisonResults = document.getElementById('comparison-results');
    const testCheckboxes = document.querySelectorAll('input[name="tests"]');

    // --- Application State ---
    let appData = { cycles: [], activeCycleId: null };
    let comparisonCharts = {};

    // --- Initialization ---
    try {
        loadData();
        setupEventListeners();
        renderUI();
        if (window.ChartjsPluginAnnotation) {
            Chart.register(window.ChartjsPluginAnnotation);
        } else {
            console.error("Chart.js Annotation plugin not loaded!");
        }
    } catch (error) {
        console.error("Initialization Error:", error);
        showNotification("Application failed to initialize. Check console.", "error", 10000);
        // Optionally display a more user-friendly error message on the page itself
        document.body.innerHTML = `<div class="p-8 text-center text-red-600">
            <h1 class="text-2xl font-bold mb-4">Initialization Error</h1>
            <p>The application could not start correctly. Please check the browser console (F12) for details.</p>
            <p class="mt-4">You might need to reset application data or check your internet connection.</p>
            </div>`;
    }


    // --- Data Handling ---
    function loadData() {
        const storedData = localStorage.getItem(DB_KEY);
        let loadedAppData = { cycles: [], activeCycleId: null };

        if (storedData) {
            try {
                loadedAppData = JSON.parse(storedData);
                 if (!loadedAppData || typeof loadedAppData !== 'object') {
                     throw new Error("Stored data is not a valid object.");
                 }
                if (!loadedAppData.cycles || !Array.isArray(loadedAppData.cycles)) {
                     console.warn("Stored data missing 'cycles' array, initializing empty.");
                     loadedAppData.cycles = [];
                 }
                // Ensure activeCycleId exists, default to null if not
                loadedAppData.activeCycleId = loadedAppData.activeCycleId || null;


                loadedAppData.cycles.forEach(cycle => {
                    // Basic structure validation
                    cycle.id = cycle.id || generateId();
                    cycle.doses = cycle.doses || [];
                    cycle.labResults = cycle.labResults || [];
                    cycle.notes = cycle.notes || '';
                    cycle.status = cycle.status || 'completed';

                    // Validate or default durations
                    cycle.testosteroneDurationWeeks = Number.isFinite(cycle.testosteroneDurationWeeks) ? cycle.testosteroneDurationWeeks : 8;
                    cycle.hcgDurationWeeks = Number.isFinite(cycle.hcgDurationWeeks) ? cycle.hcgDurationWeeks : 7;

                    // Validate or default doses
                    cycle.defaultTestosteroneDose = Number.isFinite(cycle.defaultTestosteroneDose) ? cycle.defaultTestosteroneDose : (findTypicalDose(cycle.doses, 'Testosterone') ?? 125);
                    cycle.defaultHcgDose = Number.isFinite(cycle.defaultHcgDose) ? cycle.defaultHcgDose : (findTypicalDose(cycle.doses, 'HCG') ?? 500);

                    // Recalculate end date if needed, ensuring valid start date
                    if ((!cycle.scheduledEndDate || !dayjs(cycle.scheduledEndDate).isValid()) && cycle.startDate && dayjs(cycle.startDate).isValid()) {
                        cycle.scheduledEndDate = calculateScheduledEndDate(cycle.startDate, cycle.testosteroneDurationWeeks, cycle.hcgDurationWeeks);
                    }

                    // Validate individual doses
                    cycle.doses.forEach(dose => {
                        dose.id = dose.id || generateId();
                         if (dose.amount !== null && typeof dose.amount !== 'number') {
                             const parsed = parseFloat(dose.amount);
                             dose.amount = isNaN(parsed) ? null : parsed;
                         }
                         if (dose.amount !== null && dose.amount < 0) dose.amount = 0; // Ensure non-negative
                         dose.date = (dose.date && dayjs(dose.date).isValid()) ? dayjs(dose.date).format(DATE_FORMAT) : dayjs().format(DATE_FORMAT); // Default invalid dates
                         dose.type = dose.type || 'Unknown';
                         dose.unit = dose.unit || (dose.type === 'Testosterone' ? 'mg' : dose.type === 'HCG' ? 'IU' : '');
                         dose.completed = typeof dose.completed === 'boolean' ? dose.completed : false;
                    });

                     // Validate individual lab results
                    cycle.labResults.forEach(lab => {
                        lab.id = lab.id || generateId();
                        lab.date = (lab.date && dayjs(lab.date).isValid()) ? dayjs(lab.date).format(DATE_FORMAT) : dayjs().format(DATE_FORMAT);
                        Object.keys(LAB_UNITS).forEach(key => {
                             const labValue = lab[key];
                             const currentValue = (labValue?.value ?? labValue);
                             lab[key] = { value: null, unit: LAB_UNITS[key] }; // Initialize safely
                             if (currentValue !== undefined && currentValue !== null) {
                                 const parsed = parseFloat(currentValue);
                                 if (!isNaN(parsed) && parsed >= 0) { // Ensure non-negative labs
                                     lab[key].value = parsed;
                                 }
                             }
                        });
                    });
                });

            } catch (e) {
                console.error("Error processing stored data:", e);
                showNotification('Error loading data. Resetting to default.', 'error', 5000);
                loadedAppData = { cycles: [], activeCycleId: null }; // Reset on error
            }
        }

        appData = loadedAppData; // Assign processed data

        // Ensure only one active cycle
        let activeFound = false;
        appData.cycles.sort((a, b) => dayjs(b.startDate).diff(dayjs(a.startDate))); // Sort newest first

        appData.cycles.forEach(cycle => {
            if (cycle.status === 'active') {
                if (!activeFound) {
                    appData.activeCycleId = cycle.id; // Keep the newest active one
                    activeFound = true;
                } else {
                    console.warn(`Marking older active cycle "${cycle.name}" as completed.`);
                    cycle.status = 'completed';
                    cycle.completionDate = cycle.completionDate || cycle.scheduledEndDate || dayjs().format(DATE_FORMAT);
                }
            }
        });
        if (!activeFound) {
            appData.activeCycleId = null; // Ensure null if none are active
        }

        console.log("Data loaded. Active Cycle ID:", appData.activeCycleId);
        saveData();
    }

    function findTypicalDose(doses, type) {
        if (!Array.isArray(doses)) return null;
        const relevantDoses = doses.filter(d => d.type === type && d.amount !== null && !isNaN(d.amount));
        if (relevantDoses.length === 0) return null;
        const counts = relevantDoses.reduce((acc, dose) => {
            acc[dose.amount] = (acc[dose.amount] || 0) + 1;
            return acc;
        }, {});
        return parseFloat(Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b));
    }

    function saveData() {
        try {
            localStorage.setItem(DB_KEY, JSON.stringify(appData));
        } catch (e) {
            console.error("Error saving data:", e);
            showNotification('Error saving data. Storage might be full.', 'error', 5000);
        }
    }

    function exportData() {
        try {
            const dataStr = JSON.stringify(appData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `hormone_tracker_backup_${dayjs().format('YYYYMMDD_HHmmss')}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showNotification('Data exported successfully.');
        } catch (e) {
            console.error("Error exporting data:", e);
            showNotification('Error exporting data.', 'error');
        }
    }

    function importData() {
        importFileInput.click();
    }

    function handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (importedData && Array.isArray(importedData.cycles)) {
                    if (confirm('Importing will OVERWRITE all current data. Are you sure?')) {
                        appData = importedData;
                        loadData(); // Re-run load to clean/validate
                        renderUI();
                        showNotification('Data imported successfully.');
                        switchSection('dashboard');
                    }
                } else {
                    showNotification('Invalid file format.', 'error', 5000);
                }
            } catch (err) {
                console.error("Import Error:", err);
                showNotification(`Error importing file: ${err.message}`, 'error', 5000);
            } finally {
                 importFileInput.value = '';
            }
        };
        reader.onerror = () => {
            showNotification('Error reading file.', 'error');
            importFileInput.value = '';
        };
        reader.readAsText(file);
    }

    function resetData() {
        if (confirm('ARE YOU SURE you want to delete ALL data? This cannot be undone.')) {
            resetDataInternal();
            showNotification('All data deleted.');
            switchSection('dashboard');
        }
    }

    function resetDataInternal() {
        appData = { cycles: [], activeCycleId: null };
        localStorage.removeItem(DB_KEY);
        renderUI();
    }

    // --- UI Rendering ---
    function renderUI() {
        updateActiveCycleView();
        updateHistoryList();
        updateDashboard();
        updateAllLabResultsTable();
        updateCyclesForComparison();
        populateCycleDropdown(addLabCycleSelect);
    }

    function updateDashboard() {
        const activeCycle = getActiveCycle(); // Uses the FIXED function

        if (activeCycle && activeCycle.doses) { // Ensure activeCycle and its doses exist
            activeCycleDashboard.classList.add('has-active');

            const completedDoses = activeCycle.doses.filter(d => d.completed).length;
            const totalDoses = activeCycle.doses.length;
            const progress = totalDoses > 0 ? Math.round((completedDoses / totalDoses) * 100) : 0;

            const schedEndDate = dayjs(activeCycle.scheduledEndDate);
            const today = dayjs().startOf('day');
            const daysRemaining = schedEndDate.diff(today, 'day');

            dashboardCycleName.textContent = activeCycle.name;
            dashboardCycleDates.textContent = `Started: ${formatDate(activeCycle.startDate)}`;
            dosesCompletedCount.textContent = `${completedDoses}/${totalDoses} doses`;

            if (dashboardCycleProgress) {
                const progressBarInner = dashboardCycleProgress;
                const progressTextElement = progressBarInner.querySelector('.progress-text');
                progressBarInner.style.width = `${progress}%`;
                if (progressTextElement) progressTextElement.textContent = `${progress}%`;
                progressBarInner.setAttribute('aria-valuenow', progress);
            }

            cycleEndDate.textContent = `Scheduled End: ${formatDate(activeCycle.scheduledEndDate)}`;

            if (schedEndDate.isSame(today)) timeRemaining.textContent = `Ends today`;
            else if (schedEndDate.isAfter(today)) timeRemaining.textContent = `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`;
            else timeRemaining.textContent = `${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? 's' : ''} past scheduled end`;

            // Next Dose Logic
            const todayStr = today.format(DATE_FORMAT); // Use today's date string
             // Check if dayjs().isSameOrAfter is available
             const upcomingDoses = typeof dayjs.prototype.isSameOrAfter === 'function'
                ? activeCycle.doses.filter(d => !d.completed && dayjs(d.date).isSameOrAfter(todayStr))
                : activeCycle.doses.filter(d => !d.completed && d.date >= todayStr); // Fallback to string comparison

            upcomingDoses.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));

            if (upcomingDoses.length > 0) {
                const nextDoseDate = upcomingDoses[0].date;
                const nextDosesOnSameDay = upcomingDoses.filter(d => d.date === nextDoseDate);
                let html = `<p class="text-gray-600 mb-2">${formatDate(nextDoseDate)} (${timeUntil(nextDoseDate)})</p>`;
                html += '<div class="space-y-1">';
                nextDosesOnSameDay.forEach(dose => { html += `<p class="text-lg font-medium">${dose.type} ${dose.amount !== null ? `(${dose.amount} ${dose.unit})` : ''}</p>`; });
                html += '</div>';
                nextDoseInfo.innerHTML = html;
            } else {
                nextDoseInfo.innerHTML = `<p class="text-gray-500">All scheduled doses completed or past.</p>`;
            }

            // Last Dose Logic
            const completedDosesSorted = activeCycle.doses.filter(d => d.completed).sort((a, b) => dayjs(b.date).diff(dayjs(a.date)));
            if (completedDosesSorted.length > 0) {
                 const lastDose = completedDosesSorted[0];
                 lastDoseInfo.innerHTML = `<p class="text-lg font-medium">${lastDose.type} ${lastDose.amount !== null ? `(${lastDose.amount} ${lastDose.unit})` : ''}</p><p class="text-gray-600">${formatDate(lastDose.date)} (${timeUntil(lastDose.date)})</p>`;
            } else {
                lastDoseInfo.innerHTML = `<p class="text-gray-500">No doses completed yet.</p>`;
            }

        } else {
            // No active cycle found
            activeCycleDashboard.classList.remove('has-active');
            nextDoseInfo.innerHTML = `<p class="text-gray-500">No active cycle.</p>`;
            lastDoseInfo.innerHTML = `<p class="text-gray-500">No active cycle.</p>`;
            dashboardCycleName.textContent = '';
            dashboardCycleDates.textContent = '';
            dosesCompletedCount.textContent = '0/0 doses';
            cycleEndDate.textContent = 'Scheduled End: -';
            timeRemaining.textContent = '-';
            if (dashboardCycleProgress) {
                 const progressBarInner = dashboardCycleProgress;
                 const progressTextElement = progressBarInner.querySelector('.progress-text');
                 progressBarInner.style.width = `0%`;
                 if (progressTextElement) progressTextElement.textContent = `0%`;
                 progressBarInner.setAttribute('aria-valuenow', 0);
            }
        }
        updateLatestLabSummary();
    }

    function updateActiveCycleView() {
        const activeCycle = getActiveCycle();
        if (activeCycle) {
            noCycleMessage.classList.add('hidden');
            activeCycleDetails.classList.remove('hidden');
            cycleForm.classList.add('hidden');
            newCycleBtn.disabled = true;
            newCycleBtn.classList.add('opacity-50', 'cursor-not-allowed');
            activeCycleName.textContent = activeCycle.name;
            activeCycleDates.textContent = `Started: ${formatDate(activeCycle.startDate)}, Scheduled End: ${formatDate(activeCycle.scheduledEndDate)}`;
            activeCycleDurations.textContent = `Durations: T ${activeCycle.testosteroneDurationWeeks}wk / HCG ${activeCycle.hcgDurationWeeks}wk`;
            activeCycleStatus.textContent = 'Active';
            activeCycleStatus.className = 'status-badge bg-green-100 text-green-800';
            editTestosteroneDoseInput.value = activeCycle.defaultTestosteroneDose ?? '';
            editHcgDoseInput.value = activeCycle.defaultHcgDose ?? '';
            renderDoseScheduleTable(activeCycle);
            updateCycleProgress(activeCycle);
            renderActiveCycleLabTable(activeCycle);
            cycleNotesTextarea.value = activeCycle.notes || '';
        } else {
            noCycleMessage.classList.remove('hidden');
            activeCycleDetails.classList.add('hidden');
            newCycleBtn.disabled = false;
            newCycleBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            cycleNotesTextarea.value = '';
        }
    }

    function renderDoseScheduleTable(cycle) {
        if (!cycle || !cycle.doses || cycle.doses.length === 0) {
            doseScheduleBody.innerHTML = `<tr><td colspan="5" class="py-4 px-4 text-center text-gray-500">No doses scheduled.</td></tr>`; return;
        }
        const sortedDoses = [...cycle.doses].sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
        const todayStr = dayjs().format(DATE_FORMAT);
        doseScheduleBody.innerHTML = sortedDoses.map(dose => {
            const isCompleted = dose.completed;
            const isPast = !isCompleted && dayjs(dose.date).isBefore(todayStr, 'day');
            const rowClass = isCompleted ? 'dose-completed' : '';
            const statusText = isCompleted ? 'Completed' : (isPast ? 'Missed' : 'Scheduled');
            const statusClass = isCompleted ? 'text-green-600' : (isPast ? 'text-red-600' : 'text-yellow-600');
            const doseAmountDisplay = dose.amount !== null ? `${dose.amount} ${dose.unit || ''}`.trim() : '-';
            return `
                <tr class="${rowClass}">
                    <td class="py-3 px-4 whitespace-nowrap">${formatDate(dose.date)}</td>
                    <td class="py-3 px-4 whitespace-nowrap">${dose.type}</td>
                    <td class="py-3 px-4 whitespace-nowrap">${doseAmountDisplay}</td>
                    <td class="py-3 px-4 whitespace-nowrap"><span class="font-semibold status-text ${statusClass}">${statusText}</span></td>
                    <td class="py-3 px-4 whitespace-nowrap text-sm font-medium space-x-2">
                        ${!isCompleted ? `
                            <button class="text-green-500 hover:text-green-700 complete-dose-btn tooltip" data-dose-id="${dose.id}" data-cycle-id="${cycle.id}" aria-label="Mark Completed">
                                <i class="fas fa-check-circle text-lg"></i><span class="tooltiptext">Mark Completed</span>
                            </button>
                            <button class="text-orange-500 hover:text-orange-700 edit-dose-btn tooltip" data-dose-id="${dose.id}" data-cycle-id="${cycle.id}" aria-label="Edit Dose">
                                <i class="fas fa-edit text-lg"></i><span class="tooltiptext">Edit Dose</span>
                            </button>
                        ` : `
                            <button class="text-gray-400 hover:text-gray-600 uncomplete-dose-btn tooltip" data-dose-id="${dose.id}" data-cycle-id="${cycle.id}" aria-label="Mark Incomplete">
                                <i class="fas fa-undo text-lg"></i><span class="tooltiptext">Mark Incomplete</span>
                            </button>
                            <span class="inline-block w-6"></span>
                        `}
                    </td>
                </tr>`;
        }).join('');
    }

    function updateCycleProgress(cycle) {
        if (!cycle || !cycle.doses || cycle.doses.length === 0) {
             if (cycleProgressBar) {
                const progressText = cycleProgressBar.querySelector('.progress-text');
                cycleProgressBar.style.width = '0%';
                if (progressText) progressText.textContent = '0%';
                cycleProgressBar.setAttribute('aria-valuenow', 0);
             }
             return;
        }
        const completedDoses = cycle.doses.filter(d => d.completed).length;
        const totalDoses = cycle.doses.length;
        const progress = totalDoses > 0 ? Math.round((completedDoses / totalDoses) * 100) : 0;
        if (cycleProgressBar) {
             const progressText = cycleProgressBar.querySelector('.progress-text');
             cycleProgressBar.style.width = `${progress}%`;
             if (progressText) progressText.textContent = `${progress}%`;
             cycleProgressBar.setAttribute('aria-valuenow', progress);
        }
     }

    function renderActiveCycleLabTable(cycle) { renderLabTable(activeCycleLabResultsBody, cycle?.labResults, cycle?.id); }
    function updateAllLabResultsTable() {
        const allLabs = appData.cycles.flatMap(c => c.labResults.map(lab => ({ ...lab, cycleName: c.name, cycleId: c.id })));
        renderLabTable(allLabResultsBody, allLabs, null);
    }

    function renderLabTable(tbodyElement, labResults, currentCycleId) {
        const sortedLabs = [...(labResults || [])].sort((a, b) => dayjs(b.date).diff(dayjs(a.date)));
        if (sortedLabs.length === 0) {
            const colspan = tbodyElement.id === 'all-lab-results-body' ? 10 : 9;
            tbodyElement.innerHTML = `<tr><td colspan="${colspan}" class="py-4 px-4 text-center text-gray-500">No lab results found.</td></tr>`; return;
        }
        tbodyElement.innerHTML = sortedLabs.map(lab => {
            const isAllLabsTable = tbodyElement.id === 'all-lab-results-body';
            const cycleIdForAction = lab.cycleId || currentCycleId;
            const cycleName = isAllLabsTable ? (lab.cycleName || findCycleNameById(cycleIdForAction) || 'N/A') : '';
            return `
                <tr>
                    ${isAllLabsTable ? `<td class="py-3 px-4 whitespace-nowrap">${cycleName}</td>` : ''}
                    <td class="py-3 px-4 whitespace-nowrap">${formatDate(lab.date)}</td>
                    <td class="py-3 px-4 whitespace-nowrap">${formatLabValueWithRange(lab.totalT, 'totalT')}</td>
                    <td class="py-3 px-4 whitespace-nowrap">${formatLabValueWithRange(lab.freeT, 'freeT')}</td>
                    <td class="py-3 px-4 whitespace-nowrap">${formatLabValueWithRange(lab.e2, 'e2')}</td>
                    <td class="py-3 px-4 whitespace-nowrap">${formatLabValueWithRange(lab.shbg, 'shbg')}</td>
                    <td class="py-3 px-4 whitespace-nowrap">${formatLabValueWithRange(lab.prolactin, 'prolactin')}</td>
                    <td class="py-3 px-4 whitespace-nowrap">${formatLabValueWithRange(lab.hematocrit, 'hematocrit')}</td>
                    <td class="py-3 px-4 whitespace-nowrap">${formatLabValueWithRange(lab.cholesterol, 'cholesterol')}</td>
                    <td class="py-3 px-4 whitespace-nowrap text-sm font-medium">
                        <button class="text-red-500 hover:text-red-700 delete-lab-btn tooltip" data-lab-id="${lab.id}" data-cycle-id="${cycleIdForAction}" aria-label="Delete Lab Result">
                            <i class="fas fa-trash-alt text-lg"></i><span class="tooltiptext">Delete Lab</span>
                        </button>
                    </td>
                </tr>`;
        }).join('');
    }

    function updateHistoryList() {
         const completedCycles = appData.cycles.filter(c => c.status === 'completed')
            .sort((a, b) => dayjs(b.completionDate || b.scheduledEndDate || b.startDate).diff(dayjs(a.completionDate || a.scheduledEndDate || a.startDate)));
         if (completedCycles.length > 0) {
             historyList.innerHTML = completedCycles.map(cycle => {
                 const completionText = cycle.completionDate && cycle.completionDate !== cycle.scheduledEndDate ? ` (Completed: ${formatDate(cycle.completionDate)})` : '';
                 const doseCount = cycle.doses?.length || 0;
                 const completedDoseCount = cycle.doses?.filter(d => d.completed).length || 0;
                 return `
                 <div class="cycle-card bg-white p-4 rounded-lg shadow border border-gray-200 flex justify-between items-center gap-4 flex-wrap">
                     <div>
                         <h4 class="font-semibold text-lg">${cycle.name}</h4>
                         <p class="text-sm text-gray-600">${formatDate(cycle.startDate)} - ${formatDate(cycle.scheduledEndDate)}<span class="text-xs italic text-gray-500">${completionText}</span></p>
                         <p class="text-xs text-gray-500 mt-1">T: ${cycle.testosteroneDurationWeeks}wk / HCG: ${cycle.hcgDurationWeeks}wk | ${completedDoseCount}/${doseCount} doses | ${cycle.labResults?.length || 0} labs</p>
                     </div>
                     <button class="view-history-btn bg-teal-100 text-teal-700 hover:bg-teal-200 px-3 py-1 rounded-md text-sm transition whitespace-nowrap" data-cycle-id="${cycle.id}">View Details</button>
                 </div>`;
             }).join('');
         } else { historyList.innerHTML = `<p class="text-gray-500">No completed cycles.</p>`; }
     }

    function updateCyclesForComparison() {
        const cyclesWithLabs = appData.cycles.filter(c => c.labResults?.length > 0).sort((a, b) => dayjs(b.startDate).diff(dayjs(a.startDate)));
        if (cyclesWithLabs.length === 0) { cyclesListContainer.innerHTML = '<p class="text-gray-500">No cycles with lab results.</p>'; return; }
        cyclesListContainer.innerHTML = cyclesWithLabs.map(cycle => `
            <label class="cycle-checkbox">
                <input type="checkbox" name="cycles" value="${cycle.id}" checked>
                <span>${cycle.name} (${formatDate(cycle.startDate)})</span>
                <span class="text-xs text-gray-500 ml-auto">(${cycle.labResults.length} labs)</span>
            </label>`).join('');
    }

    function showHistoryDetailModal(cycleId) {
        const cycle = appData.cycles.find(c => c.id === cycleId);
        if (!cycle) return;
        modalCycleName.textContent = `Details: ${cycle.name}`;
        let dateText = `Scheduled: ${formatDate(cycle.startDate)} - ${formatDate(cycle.scheduledEndDate)}`;
        if (cycle.completionDate && cycle.completionDate !== cycle.scheduledEndDate) dateText += ` | Completed: ${formatDate(cycle.completionDate)}`;
        dateText += ` | Durations: T ${cycle.testosteroneDurationWeeks}wk / HCG ${cycle.hcgDurationWeeks}wk`;
        modalCycleDates.textContent = dateText;

        if (cycle.doses?.length > 0) {
             const sortedDoses = [...cycle.doses].sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
             modalDoseScheduleBody.innerHTML = sortedDoses.map(dose => {
                 const statusText = dose.completed ? 'Completed' : 'Not Completed';
                 const statusClass = dose.completed ? 'text-green-600' : 'text-gray-500';
                 const doseAmountDisplay = dose.amount !== null ? `${dose.amount} ${dose.unit || ''}`.trim() : '-';
                 return `<tr><td class="py-2 px-3">${formatDate(dose.date)}</td><td class="py-2 px-3">${dose.type}</td><td class="py-2 px-3">${doseAmountDisplay}</td><td class="py-2 px-3"><span class="font-semibold ${statusClass}">${statusText}</span></td></tr>`;
             }).join('');
         } else { modalDoseScheduleBody.innerHTML = `<tr><td colspan="4" class="py-4 px-4 text-center text-gray-500">No doses recorded.</td></tr>`; }

        if (cycle.labResults?.length > 0) {
            const sortedLabs = [...cycle.labResults].sort((a, b) => dayjs(b.date).diff(dayjs(a.date)));
            modalLabResultsBody.innerHTML = sortedLabs.map(lab => `
                <tr>
                    <td class="py-2 px-3">${formatDate(lab.date)}</td>
                    <td class="py-2 px-3">${formatLabValueSimple({ ...lab.totalT, labType: 'totalT' })}</td>
                    <td class="py-2 px-3">${formatLabValueSimple({ ...lab.freeT, labType: 'freeT' })}</td>
                    <td class="py-2 px-3">${formatLabValueSimple({ ...lab.e2, labType: 'e2' })}</td>
                    <td class="py-2 px-3">${formatLabValueSimple({ ...lab.shbg, labType: 'shbg' })}</td>
                    <td class="py-2 px-3">${formatLabValueSimple({ ...lab.prolactin, labType: 'prolactin' })}</td>
                    <td class="py-2 px-3">${formatLabValueSimple({ ...lab.hematocrit, labType: 'hematocrit' })}</td>
                    <td class="py-2 px-3">${formatLabValueSimple({ ...lab.cholesterol, labType: 'cholesterol' })}</td>
                </tr>`).join('');
        } else { modalLabResultsBody.innerHTML = `<tr><td colspan="8" class="py-4 px-4 text-center text-gray-500">No labs recorded.</td></tr>`; }

        modalCycleNotes.textContent = cycle.notes || 'No notes recorded.';
        modalCycleNotes.classList.toggle('text-gray-500', !cycle.notes); modalCycleNotes.classList.toggle('italic', !cycle.notes);
        closeModal(editCycleModal); closeModal(addLabModal); closeModal(editDoseModal); openModal(historyDetailModal);
    }

    function updateLatestLabSummary() {
        const allLabs = appData.cycles.flatMap(c => c.labResults.map(lab => ({ ...lab, cycleName: c.name, date: lab.date })));
        if (allLabs.length > 0) {
            const latestLab = allLabs.sort((a, b) => dayjs(b.date).diff(dayjs(a.date)))[0];
            latestLabSummary.innerHTML = `<p class="text-sm text-gray-600 mb-2">Latest: <strong>${latestLab.cycleName}</strong> on ${formatDate(latestLab.date)}</p><div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1 text-sm">${Object.keys(LAB_UNITS).map(key => latestLab[key]?.value !== null ? `<div>${getTestDisplayName(key)}: ${formatLabValueWithRange(latestLab[key], key)}</div>` : '').join('')}</div>`;
        } else { latestLabSummary.innerHTML = `<p class="text-gray-500">No lab results recorded.</p>`; }
    }

    // --- Lab Comparison Logic ---
    function generateComparison() {
         const selectedCycleIds = Array.from(document.querySelectorAll('input[name="cycles"]:checked')).map(el => el.value);
         if (selectedCycleIds.length < 2) { showNotification('Select 2+ cycles with lab data.', 'warning'); return; }
         const selectedTests = Array.from(testCheckboxes).filter(cb => cb.checked).map(el => el.value);
         if (selectedTests.length === 0) { showNotification('Select tests to compare.', 'error'); return; }
         const cyclesToCompare = appData.cycles.filter(c => selectedCycleIds.includes(c.id) && c.labResults?.length > 0);
         if (cyclesToCompare.length < 2) { comparisonResults.innerHTML = '<p class="no-data-message">Need 2+ selected cycles with lab data.</p>'; return; }
         const comparisonData = cyclesToCompare.map(c => {
             const avgs = {};
             selectedTests.forEach(t => {
                 const v = c.labResults.map(l => l[t]?.value).filter(val => val !== null && !isNaN(val));
                 avgs[t] = v.length ? v.reduce((s, val) => s + val, 0) / v.length : null;
             }); return { cycleId: c.id, cycleName: `${c.name} (${formatDate(c.startDate)})`, startDate: c.startDate, averages: avgs };
         }).sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)));
         renderComparisonCharts(comparisonData, selectedTests);
     }

    function renderComparisonCharts(comparisonData, selectedTests) {
        Object.values(comparisonCharts).forEach(chart => chart?.destroy()); comparisonCharts = {}; comparisonResults.innerHTML = '';
        let chartsRendered = 0;
        selectedTests.forEach(test => {
             const validData = comparisonData.filter(item => item.averages[test] !== null);
             if (validData.length === 0) return;
             chartsRendered++;
             const container = document.createElement('div'); container.className = 'mb-8';
             container.innerHTML = `<h4 class="font-semibold mb-2 text-lg">${getTestDisplayName(test)}</h4><div class="chart-container"><canvas id="chart-${test}"></canvas></div>`;
             comparisonResults.appendChild(container);
             const ctx = document.getElementById(`chart-${test}`).getContext('2d');
             const labels = validData.map(item => item.cycleName), data = validData.map(item => item.averages[test]);
             const unit = LAB_UNITS[test], colors = data.map(v => getLabValueColor(v, test)), annotations = createChartAnnotations(test);
             comparisonCharts[test] = new Chart(ctx, {
                 type: 'bar', data: { labels, datasets: [{ label: `Avg ${getTestDisplayName(test)} (${unit})`, data, backgroundColor: colors, borderColor: colors, borderWidth: 1 }] },
                 options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: ['cholesterol', 'hematocrit'].includes(test), title: { display: true, text: `Average (${unit})` } }, x: { ticks:{ autoSkip: false, maxRotation: 45, minRotation: 0 } } }, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => formatChartTooltip(ctx, test, unit) } }, annotation: { annotations } } }
             });
        });
        if (chartsRendered === 0) comparisonResults.innerHTML = '<p class="no-data-message">No comparable data found.</p>';
    }

    function createChartAnnotations(test) {
        const range = LAB_REFERENCE_RANGES[test], annotations = {}; if (!range || !window.ChartjsPluginAnnotation) return annotations;
        const style = { type: 'line', scaleID: 'y', borderColor: 'rgba(100, 116, 139, 0.5)', borderWidth: 1, borderDash: [6, 6], label: { enabled: true, position: 'start', font: {size: 9}, backgroundColor: 'rgba(248, 250, 252, 0.6)' } };
        if (range.min !== undefined && test !== 'cholesterol') annotations.lineMin = { ...style, value: range.min, label: { ...style.label, content: `Min: ${range.min}`, yAdjust: -5 } };
        if (range.max !== undefined) annotations.lineMax = { ...style, value: range.max, label: { ...style.label, content: `Max: ${range.max}`, yAdjust: 5 } }; return annotations;
     }

    function formatChartTooltip(context, test, unit) {
        const v = context.raw, range = LAB_REFERENCE_RANGES[test]; let s = '';
        if (range && v !== null) { if (test === 'cholesterol') s = v > range.max ? ' (High)' : ' (OK)'; else if (v < range.min) s = ' (Low)'; else if (v > range.max) s = ' (High)'; else s = ' (OK)'; }
        const vStr = v !== null ? v.toFixed(getDecimalPlaces(test)) : 'N/A'; return `${context.dataset.label.split('(')[0]}: ${vStr} ${unit}${s}`;
     }
    function getDecimalPlaces(test) { const dec = { freeT: 1, e2: 1, shbg: 1, prolactin: 1, hematocrit: 1 }; return dec[test] ?? 0; }
    function getTestDisplayName(key) { const n = { totalT: 'Total T', freeT: 'Free T', e2: 'Estradiol', shbg: 'SHBG', prolactin: 'Prolactin', hematocrit: 'Hematocrit', cholesterol: 'Cholesterol' }; return n[key] || key; }

    // --- Event Listeners Setup ---
    function setupEventListeners() {
        navItems.forEach(i => i.addEventListener('click', () => switchSection(i.dataset.section)));
        resetDataBtn.addEventListener('click', resetData);
        exportDataBtn.addEventListener('click', exportData);
        importDataBtn.addEventListener('click', importData);
        importFileInput.addEventListener('change', handleFileImport);
        newCycleBtn.addEventListener('click', showNewCycleForm);
        cancelCycleBtn.addEventListener('click', hideNewCycleForm);
        saveCycleBtn.addEventListener('click', startNewCycle);
        completeCycleBtn.addEventListener('click', handleCompleteCycle);
        saveDoseChangesBtn.addEventListener('click', handleSaveDoseChanges);
        saveNotesBtn.addEventListener('click', handleSaveNotes);
        editCycleNameBtn.addEventListener('click', showEditCycleNameModal);
        saveEditCycleBtn.addEventListener('click', handleSaveCycleName);
        [closeEditModalBtn, cancelEditCycleBtn].forEach(b => b.addEventListener('click', () => closeModal(editCycleModal)));
        editCycleModal.addEventListener('click', e => { if(e.target === editCycleModal) closeModal(editCycleModal); });
        addLabResultAllBtn.addEventListener('click', () => showAddLabModal());
        addLabResultCurrentCycleBtn.addEventListener('click', () => showAddLabModal(getActiveCycle()?.id));
        addLabForm.addEventListener('submit', handleAddLabResult);
        [closeAddLabModalBtn, cancelAddLabBtn].forEach(b => b.addEventListener('click', () => closeModal(addLabModal)));
        addLabModal.addEventListener('click', e => { if(e.target === addLabModal) closeModal(addLabModal); });
        addLabModal.addEventListener('keydown', handleModalFocusTrap);
        editDoseForm.addEventListener('submit', handleSaveEditedDose);
        [closeEditDoseModalBtn, cancelEditDoseBtn].forEach(b => b.addEventListener('click', () => closeModal(editDoseModal)));
        editDoseModal.addEventListener('click', e => { if(e.target === editDoseModal) closeModal(editDoseModal); });
        [closeModalBtn, closeModalFooterBtn].forEach(b => b.addEventListener('click', () => closeModal(historyDetailModal)));
        historyDetailModal.addEventListener('click', e => { if(e.target === historyDetailModal) closeModal(historyDetailModal); });
        viewCycleDetailsBtn?.addEventListener('click', () => switchSection('dose-management'));
        startCycleBtnDash?.addEventListener('click', () => { switchSection('dose-management'); showNewCycleForm(); });
        viewAllLabsBtn.addEventListener('click', () => switchSection('lab-results'));
        generateComparisonBtn.addEventListener('click', generateComparison);
        document.body.addEventListener('click', handleDelegatedClicks);
    }

    // --- Event Handlers ---
    function showNewCycleForm(){ if (!getActiveCycle()) { cycleForm.classList.remove('hidden'); cycleStartDateInput.value = dayjs().format(DATE_FORMAT); cycleNameInput.focus(); } else { showNotification("Complete current cycle first.", "warning"); } }
    function hideNewCycleForm(){ cycleForm.classList.add('hidden'); resetCycleForm(); }
    function handleDelegatedClicks(event) {
        const actions = {
            '.complete-dose-btn': (btn) => markDoseStatus(btn.dataset.doseId, btn.dataset.cycleId, true),
            '.uncomplete-dose-btn': (btn) => markDoseStatus(btn.dataset.doseId, btn.dataset.cycleId, false),
            '.edit-dose-btn': (btn) => showEditDoseModal(btn.dataset.doseId, btn.dataset.cycleId),
            '.delete-lab-btn': (btn) => handleDeleteLabResult(btn.dataset.labId, btn.dataset.cycleId),
            '.view-history-btn': (btn) => showHistoryDetailModal(btn.dataset.cycleId)
        };
        for (const selector in actions) {
            const button = event.target.closest(selector);
            if (button) { actions[selector](button); return; }
        }
    }
    function switchSection(id) { sections.forEach(s => s.classList.toggle('active', s.id === id)); navItems.forEach(i => i.classList.toggle('active', i.dataset.section === id)); window.scrollTo(0, 0); const refreshMap = { 'dashboard': updateDashboard, 'dose-management': updateActiveCycleView, 'history': updateHistoryList, 'lab-results': updateAllLabResultsTable, 'lab-comparison': updateCyclesForComparison }; refreshMap[id]?.(); }
    function resetCycleForm(){ cycleForm.reset(); cycleNameInput.value = ''; cycleStartDateInput.value = dayjs().format(DATE_FORMAT); testosteroneDoseInput.value = '125'; testosteroneDurationInput.value = '8'; hcgDoseInput.value = '500'; hcgDurationInput.value = '7'; document.querySelector('input[name="hcg-frequency"][value="eod"]').checked = true; }
    function startNewCycle() {
        const name = cycleNameInput.value.trim(), startDateStr = cycleStartDateInput.value, tAmt = parseFloat(testosteroneDoseInput.value), tDur = parseInt(testosteroneDurationInput.value, 10), hcgAmt = parseFloat(hcgDoseInput.value), hcgDur = parseInt(hcgDurationInput.value, 10), hcgFreq = document.querySelector('input[name="hcg-frequency"]:checked')?.value;
        if (!name || !startDateStr || !dayjs(startDateStr).isValid() || isNaN(tAmt)||tAmt<0 || isNaN(tDur)||tDur<1 || isNaN(hcgAmt)||hcgAmt<0 || isNaN(hcgDur)||hcgDur<0 || (hcgAmt>0&&hcgDur>0&&!hcgFreq)) { showNotification('Invalid cycle details.', 'error', 6000); return; }
        if (getActiveCycle()) { showNotification('Complete current cycle first.', 'warning'); return; }
        if (hcgDur > tDur && hcgAmt > 0 && !confirm(`Warning: HCG > T duration. Continue?`)) return;
        const endDate = calculateScheduledEndDate(startDateStr, tDur, hcgDur);
        const cycle = { id: generateId(), name, startDate: startDateStr, scheduledEndDate: endDate, completionDate: null, status: 'active', testosteroneDurationWeeks: tDur, hcgDurationWeeks: hcgDur, defaultTestosteroneDose: tAmt, defaultHcgDose: hcgAmt, doses: generateDoseSchedule(startDateStr, tAmt, tDur, hcgAmt, hcgDur, hcgFreq), labResults: [], notes: '' };
        appData.cycles.push(cycle); appData.activeCycleId = cycle.id; saveData(); renderUI(); hideNewCycleForm(); showNotification(`Cycle "${name}" started.`); switchSection('dose-management');
    }
    function calculateScheduledEndDate(start, tWks, hcgWks){ const s = dayjs(start); if(!s.isValid()) return null; const dur = Math.max(tWks||0, hcgWks||0); return s.add(dur*7-1, 'day').format(DATE_FORMAT); }
    function generateDoseSchedule(startStr, tAmt, tWks, hcgAmt, hcgWks, hcgFreq) {
        const doses = [], start = dayjs(startStr), tUnit = 'mg', hcgUnit = 'IU';
        if (tAmt>=0 && tWks>0) for (let i=0; i<tWks; i++) doses.push({id:generateId(), type:'Testosterone', date:start.add(i*7,'day').format(DATE_FORMAT), amount:tAmt||null, unit:tAmt?tUnit:null, completed:false});
        if (hcgAmt>0 && hcgWks>0) { const end = start.add(hcgWks*7,'day'); if(hcgFreq === 'twice') for(let d=dayjs(start); d.isBefore(end); d=d.add(1,'day')) if(d.day()===0||d.day()===4) doses.push({id:generateId(),type:'HCG',date:d.format(DATE_FORMAT),amount:hcgAmt,unit:hcgUnit,completed:false}); else { let step=2; for(let d=dayjs(start); d.isBefore(end); d=d.add(step,'day')) doses.push({id:generateId(),type:'HCG',date:d.format(DATE_FORMAT),amount:hcgAmt,unit:hcgUnit,completed:false}); } }
        doses.sort((a,b) => dayjs(a.date).diff(dayjs(b.date))); return doses;
    }
    function handleCompleteCycle(){ const c=getActiveCycle(); if(c && confirm(`Complete cycle "${c.name}"?`)) completeCycle(c.id); }
    function completeCycle(id) { const c = appData.cycles.find(x => x.id === id); if(c){ c.status='completed'; c.completionDate=dayjs().format(DATE_FORMAT); if(appData.activeCycleId === id) appData.activeCycleId = null; saveData(); renderUI(); showNotification(`Cycle "${c.name}" completed.`); switchSection('history'); } }
    function handleSaveDoseChanges(){ const c=getActiveCycle(); if(!c)return; const t=parseFloat(editTestosteroneDoseInput.value),h=parseFloat(editHcgDoseInput.value); if(isNaN(t)||t<0||isNaN(h)||h<0){showNotification('Invalid default doses.', 'error'); return;} c.defaultTestosteroneDose=t; c.defaultHcgDose=h; const today=dayjs().format(DATE_FORMAT); let n=0; c.doses.forEach(d=>{ if(!d.completed && dayjs(d.date).isSameOrAfter(today)) { if(d.type==='Testosterone'&&d.amount!==t){d.amount=t||null;d.unit=t?'mg':null;n++;} else if(d.type==='HCG'&&d.amount!==h){d.amount=h||null;d.unit=h?'IU':null;n++;}}}); saveData(); renderDoseScheduleTable(c); updateDashboard(); showNotification(`Defaults saved. ${n} future doses updated.`); }
    function handleSaveNotes(){ const c=getActiveCycle(); if(c){ c.notes=cycleNotesTextarea.value; saveData(); showNotification('Notes saved.'); } else { showNotification('No active cycle.', 'warning'); } }
    function markDoseStatus(doseId, cycleId, status) { const c=appData.cycles.find(x=>x.id===cycleId); const d=c?.doses.find(x=>x.id===doseId); if(d){ d.completed=status; saveData(); if(c.status==='active'){renderDoseScheduleTable(c);updateCycleProgress(c);updateDashboard();} else if (historyDetailModal.classList.contains('active')&&modalCycleName.textContent.includes(c.name)) showHistoryDetailModal(cycleId); showNotification(`Dose marked ${status?'completed':'incomplete'}.`); } }
    function showAddLabModal(id=null) { addLabForm.reset(); populateCycleDropdown(addLabCycleSelect, id); addLabDateInput.value = dayjs().format(DATE_FORMAT); openModal(addLabModal); setTimeout(()=>{ addLabModalFocusableEls = addLabModal.querySelectorAll('select, input:not([type="hidden"]), button:not([disabled])'); if(addLabModalFocusableEls.length > 0){ addLabModalFirstFocusableEl = addLabModalFocusableEls[0]; addLabModalLastFocusableEl = addLabModalFocusableEls[addLabModalFocusableEls.length-1]; addLabModalFirstFocusableEl.focus(); } else { addLabModalFirstFocusableEl = addLabModalLastFocusableEl = null; }}, 50); }
    function handleAddLabResult(e) { e.preventDefault(); const cycleId = addLabCycleSelect.value, cycle = appData.cycles.find(c=>c.id===cycleId); if(!cycle){showNotification("Select cycle.", "error");return;} const date = addLabDateInput.value; if(!date||!dayjs(date).isValid()){showNotification("Invalid lab date.", "error");return;} const labDay = dayjs(date), startDay = dayjs(cycle.startDate), endDay = dayjs(cycle.completionDate || cycle.scheduledEndDate); if ((labDay.isBefore(startDay.subtract(30,'day'))||labDay.isAfter(endDay.add(30,'day'))) && !confirm(`Warning: Lab date far outside cycle "${cycle.name}". Add anyway?`)) return; const p=v=>{const f=parseFloat(v);return isNaN(f)||v===''?null:f;}; const r={id:generateId(),date}; Object.keys(LAB_UNITS).forEach(k=>{const el=document.getElementById(`add-lab-${k.toLowerCase().replace('t','-t').replace('e2','-e2')}`); r[k]=el?{value:p(el.value),unit:LAB_UNITS[k]}:{value:null,unit:LAB_UNITS[k]};}); const hasVal=Object.values(r).some(v=>typeof v==='object'&&v?.value!==null); if(!hasVal){showNotification("Enter 1+ lab value.", "error");return;} cycle.labResults.push(r); saveData(); if(cycle.status==='active'&&cycle.id===appData.activeCycleId)renderActiveCycleLabTable(cycle); updateAllLabResultsTable(); updateLatestLabSummary(); updateCyclesForComparison(); if(historyDetailModal.classList.contains('active')&&modalCycleName.textContent.includes(cycle.name))showHistoryDetailModal(cycle.id); showNotification("Lab result added."); closeModal(addLabModal); }
    function handleDeleteLabResult(labId, cycleId) { const c=appData.cycles.find(x=>x.id===cycleId); const i=c?.labResults.findIndex(l=>l.id===labId); if(i===undefined||i<0)return; if(confirm(`Delete lab from ${formatDate(c.labResults[i].date)} for cycle "${c.name}"?`)){ c.labResults.splice(i,1); saveData(); if(c.status==='active'&&c.id===appData.activeCycleId)renderActiveCycleLabTable(c); updateAllLabResultsTable(); updateLatestLabSummary(); updateCyclesForComparison(); if(historyDetailModal.classList.contains('active')&&modalCycleName.textContent.includes(c.name))showHistoryDetailModal(cycleId); showNotification('Lab result deleted.'); } }
    function showEditDoseModal(id, cId) { const c=appData.cycles.find(x=>x.id===cId), d=c?.doses.find(x=>x.id===id); if(!d||!c){showNotification("Cannot find dose.", "error");return;} if(d.completed){showNotification("Cannot edit completed dose.", "warning");return;} editDoseForm.reset(); editDoseIdInput.value=d.id; editDoseCycleIdInput.value=c.id; editDoseDateInput.value=d.date; editDoseTypeInput.value=d.type; editDoseAmountInput.value=d.amount??''; editDoseUnitInput.value=d.unit||''; openModal(editDoseModal); editDoseDateInput.focus(); }
    function handleSaveEditedDose(e) { e.preventDefault(); const id=editDoseIdInput.value, cId=editDoseCycleIdInput.value, date=editDoseDateInput.value, amtStr=editDoseAmountInput.value; const c=appData.cycles.find(x=>x.id===cId), dIdx=c?.doses.findIndex(x=>x.id===id); if(dIdx===undefined||dIdx<0||!c){showNotification("Error finding dose.", "error");return;} if(!date||!dayjs(date).isValid()){showNotification("Invalid date.", "error");return;} const amt=parseFloat(amtStr); if(amtStr!==''&&(isNaN(amt)||amt<0)){showNotification("Invalid amount.", "error");return;} const finalAmt=amtStr===''?null:amt; c.doses[dIdx].date=date; c.doses[dIdx].amount=finalAmt; c.doses[dIdx].unit=finalAmt!==null?(c.doses[dIdx].type==='Testosterone'?'mg':'IU'):null; c.doses.sort((a,b)=>dayjs(a.date).diff(dayjs(b.date))); saveData(); if(c.status==='active'){renderDoseScheduleTable(c); updateDashboard();} else if(historyDetailModal.classList.contains('active')&&modalCycleName.textContent.includes(c.name))showHistoryDetailModal(cId); showNotification("Dose updated."); closeModal(editDoseModal); }
    function showEditCycleNameModal(){ const c=getActiveCycle(); if(c){ editCycleNameInput.value=c.name; closeModal(historyDetailModal);closeModal(addLabModal);closeModal(editDoseModal); openModal(editCycleModal); editCycleNameInput.focus(); } }
    function handleSaveCycleName(){ const n=editCycleNameInput.value.trim(); if(!n){showNotification('Enter cycle name.', 'error');return;} const c=getActiveCycle(); if(c){ c.name=n; saveData(); renderUI(); closeModal(editCycleModal); showNotification('Cycle name updated.'); } }
    function openModal(el){ el.classList.add('active'); } function closeModal(el){ el.classList.remove('active'); }
    function handleModalFocusTrap(e){ if(!addLabModal.classList.contains('active')||!addLabModalFirstFocusableEl)return; if(e.key==='Tab'){ if(e.shiftKey){if(document.activeElement===addLabModalFirstFocusableEl){addLabModalLastFocusableEl.focus();e.preventDefault();}} else {if(document.activeElement===addLabModalLastFocusableEl){addLabModalFirstFocusableEl.focus();e.preventDefault();}}} else if(e.key==='Escape')closeModal(addLabModal); }
    function getActiveCycle() { return appData.activeCycleId ? appData.cycles.find(c => c.id === appData.activeCycleId && c.status === 'active') : null; } // FIXED: Ensure status check
    function findCycleNameById(id) { return appData.cycles.find(c => c.id === id)?.name; }
    function generateId() { return Date.now().toString(36) + Math.random().toString(36).substring(2, 9); }
    function showNotification(msg, type='success', dur=4000) { notification.textContent=msg; notification.className=`notification shadow-lg ${type==='error'?'bg-red-500':type==='warning'?'bg-yellow-500':'bg-green-500'}`; notification.style.display='block'; if(notification.timeoutId)clearTimeout(notification.timeoutId); notification.timeoutId=setTimeout(()=>{notification.style.display='none';notification.timeoutId=null;},dur); }
    function formatDate(dIn) { if(!dIn)return'-'; const d=dayjs(dIn); return d.isValid()?d.format(DISPLAY_DATE_FORMAT):'Invalid Date'; }
    function timeUntil(dStr) { if(!dStr)return''; const t=dayjs(dStr).startOf('day'), n=dayjs().startOf('day'); return t.isValid()?t.from(n):''; }
    function formatLabValueWithRange(lObj, lType) { if (!lObj||lObj.value===null||lObj.value===undefined)return'-'; const v=lObj.value,u=lObj.unit||LAB_UNITS[lType]||'',r=LAB_REFERENCE_RANGES[lType],c=getLabValueClass(v,lType),vStr=v.toFixed(getDecimalPlaces(lType)); let rTxt=r?(lType==='cholesterol'?`Ref: <${r.max}`:`Ref: ${r.min}-${r.max}`):''; return`<span class="${c}">${vStr}</span><span class="text-xs text-gray-500 ml-1">${u}</span>${rTxt?`<span class="lab-range">${rTxt}</span>`:''}`; }
    function formatLabValueSimple(lObj) { if(!lObj||lObj.value===null||lObj.value===undefined)return'-'; const v=lObj.value,u=lObj.unit||''; const vStr=typeof v==='number'?v.toFixed(getDecimalPlaces(lObj.labType||'default')):''; return`${vStr} <span class="text-xs text-gray-500">${u}</span>`; }
    function getLabValueClass(v,t){ if(v===null||v===undefined)return''; const r=LAB_REFERENCE_RANGES[t]; if(!r)return''; if(t==='cholesterol')return v>r.max?'lab-value-high':'lab-value-normal'; if(v<r.min)return'lab-value-low'; if(v>r.max)return'lab-value-high'; return'lab-value-normal'; }
    function getLabValueColor(v,t){ if(v===null||v===undefined)return'#a0aec0'; const r=LAB_REFERENCE_RANGES[t]; if(!r)return'#a0aec0'; const c={low:'#f59e0b',normal:'#10b981',high:'#ef4444'}; if(t==='cholesterol')return v>r.max?c.high:c.normal; if(v<r.min)return c.low; if(v>r.max)return c.high; return c.normal; }
    function populateCycleDropdown(sel, selId = null) { sel.innerHTML='<option value="">-- Select Cycle --</option>'; const cycles=[...appData.cycles].sort((a,b)=>dayjs(b.startDate).diff(dayjs(a.startDate))); cycles.forEach(c=>{const o=document.createElement('option');o.value=c.id;o.textContent=`${c.name} (${formatDate(c.startDate)}) ${c.status==='completed'?'[Completed]':c.status==='active'?'[Active]':''}`;o.selected=c.id===selId;sel.appendChild(o);}); }

}); // End DOMContentLoaded
