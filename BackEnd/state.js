const fs = require('fs');

function createStateManager({ statePath, debounceMs, buildSnapshot }) {
    let saveStateTimeout = null;
    let saveStateInFlight = false;
    let saveStatePendingContext = null;

    const loadState = async () => {
        if (!fs.existsSync(statePath)) {
            return null;
        }
        try {
            const raw = await fs.promises.readFile(statePath, 'utf-8');
            return JSON.parse(raw);
        } catch (error) {
            console.error('Failed to load state:', error);
            return null;
        }
    };

    const saveState = async (context = 'unknown') => {
        const snapshot = buildSnapshot();
        try {
            await fs.promises.writeFile(statePath, JSON.stringify(snapshot, null, 2));
        } catch (error) {
            console.error(`Failed to save state (${context}):`, error);
        }
    };

    const scheduleSaveState = (context = 'unknown') => {
        saveStatePendingContext = context;
        if (saveStateTimeout) {
            clearTimeout(saveStateTimeout);
        }
        saveStateTimeout = setTimeout(async () => {
            saveStateTimeout = null;
            if (saveStateInFlight) {
                scheduleSaveState(saveStatePendingContext || context);
                return;
            }
            const contextToSave = saveStatePendingContext || context;
            saveStatePendingContext = null;
            saveStateInFlight = true;
            try {
                await saveState(contextToSave);
            } finally {
                saveStateInFlight = false;
            }
        }, debounceMs);
    };

    return {
        loadState,
        saveState,
        scheduleSaveState,
    };
}

module.exports = {
    createStateManager,
};
