(function() {
    const currentReplicas = [];

    document.querySelectorAll('[data-id="replica-list"] input').forEach(el => {
        currentReplicas.push(el.name);
    });

    const addNewReplicaEl = document.querySelector('[data-id="add-new-replica"]');
    const replicaListEl = document.querySelector('[data-id="replica-list"]');
    const noReplicasEl = document.querySelector('[data-id="no-replicas"]');
    const hasReplicasEl = document.querySelector('[data-id="has-replicas"]');
    
    addNewReplicaEl.addEventListener('click', addNewReplica);
    updateHasReplicasInfo();

    async function addNewReplica() {
        const processName = await promptDialog("Please enter the process name", "", "Process name", "Such as 'web', 'worker' or any other name");

        if(!processName) {
            return;
        }

        const key = `process[${processName}]`;
        if(currentReplicas.includes(key)) {
            return alertDialog("A process with this name already exists", "Process already exists");
        }

        if(!isValidResourceName(processName)) {
            return alertDialog("- Must contain only letters, numbers, and hyphens.\n- Must not start with a hyphen.\n- Must not end with a hyphen.\n- Must not contain consecutive hyphens.\n- Must be between 2 and 63 characters long.", "Please enter a valid process name.");
        }

        currentReplicas.push(key);

        const replicaEl = document.createElement('div');
        replicaEl.classList.add('col-md-4', 'form-group', 'mb-3');

        const labelEl = document.createElement('label');
        labelEl.classList.add('fw-bold', "small");
        labelEl.htmlFor = 'replicas-'+processName;
        labelEl.innerText = `${processName} instances`;

        const inputEl = document.createElement('input');
        inputEl.type = 'number';
        inputEl.classList.add('form-control');
        inputEl.id = labelEl.htmlFor;
        inputEl.name = key;
        inputEl.min = 0;
        inputEl.value = 0;
        inputEl.required = true;

        replicaEl.appendChild(labelEl);
        replicaEl.appendChild(inputEl);

        replicaListEl.appendChild(replicaEl);
        updateHasReplicasInfo();
    }

    function updateHasReplicasInfo() {
        if(currentReplicas.length > 0) {
            noReplicasEl.classList.add('d-none');
            hasReplicasEl.classList.remove('d-none');
        } else {
            noReplicasEl.classList.remove('d-none');
            hasReplicasEl.classList.add('d-none');
        }
    }

    function isValidResourceName(resourceName) {
        //must contain only letters, numbers, and hyphens.
        //must not start with a hyphen.
        //must not end with a hyphen.
        //must not contain consecutive hyphens.
        if(!resourceName.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)) return false;

        //must be between 2 and 63 characters long.
        if(resourceName.length > 63 || resourceName.length < 2) return false;

        return true;
    }
})();