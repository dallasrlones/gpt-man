const hanndleFileUpload = async (file) => {
    debug('Handling file upload')
    let fileContents = '';

    setUIState(`Adding to Queue - Uploading ${file.name}...`);

    state.context[file.name] = {
        chunks: []
    };

    addToQueue(promptCreateUploadMemory(file.name));

    // see if it's a pdf or a docx
    if (file.type === "application/pdf") {
        const text = await extractPdfText(file);
        fileContents = text;
    } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const text = await extractDocxText(file);
        fileContents = text;
    } else if (file.type === "text/plain") {
        // handle plain text files
        fileContents = await file.text();
    }

    const chunks = chunkString(fileContents, 2000);

    chunks.forEach((chunk, index) => {
        addToQueue(promptCreateUploadMemory(index, chunks.size, chunk));
    });

    addToQueue(createDoneSendingFilePrompt(file.name));
};

const attachFileUploadListener = async () => {
    debug('Attaching file upload listener')
    selectorDocumanFileUpload().addEventListener("change", async (event) => {
        debug('Uploading files')
        state.uploading = true;

        playSound('attention_upload_started');

        setUIState("Uploading files...");

        for (const file of event.target.files) {
            hanndleFileUpload(file);
        }

        addToQueue(createCustomActionCompletePrompt('all_context_complete'));
    });
};

const eventListenerCreateDocument = () => {
    debug('Creating document');
    generateDocument(selectorDocumentType().value);
    selectorDocumentType().value = "";
    playSoundOnRepeat('cafe.mp3', 0.2);
    loop();
};

const downloadTxt = (name, text) => {
    debug(`Downloading ${name}`)
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
}

const copyToClipboard = (text) => {
    debug('Copying to clipboard')
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};

const downloadContext = () => {
    debug('Downloading context')
    downloadTxt('context', JSON.stringify(state.context, null, 2));
};

const copyContext = () => {
    debug('Copying context to clipboard')
    copyToClipboard(JSON.stringify(state.context, null, 2));
};

const downloadOutline = () => {
    debug('Downloading outline')
    downloadTxt('outline', JSON.stringify(state.outline, null, 2));
};

const copyOutline = () => {
    debug('Copying outline to clipboard')
    copyToClipboard(JSON.stringify(state.outline, null, 2));
};

const downloadDocument = () => {
    debug('Downloading document')
    downloadTxt('document', state.document);
};

const copyDocument = () => {
    debug('Copying document to clipboard')
    copyToClipboard(state.document);
};

const toggleDocumanRunning = () => {
    debug('Toggling documan running')
    state.powerOn = !state.powerOn;
};

const saveContext = () => {
    debug('Saving context')
    save('context', state.context);
};

const saveOutline = () => {
    debug('Saving outline')
    save('outline', state.outline);
};

const setEventListeners = () => {
    selectorDocumanRunning().addEventListener('change', toggleDocumanRunning);

    selectorButtonCreateDocument().addEventListener('click', eventListenerCreateDocument);
    selectorButtonDownloadContext().addEventListener('click', downloadContext);
    selectorButtonCopyContext().addEventListener('click', copyContext);
    selectorButtonDownloadOutline().addEventListener('click', downloadOutline);
    selectorButtonCopyOutline().addEventListener('click', copyOutline);
    selectorButtonDownloadDocument().addEventListener('click', downloadDocument);
    selectorButtonCopyDocument().addEventListener('click', copyDocument);

    selectorDocumanContextWindow().addEventListener('change', saveContext);
    selectorOutline().addEventListener('change', saveOutline);

    attachFileUploadListener();
};