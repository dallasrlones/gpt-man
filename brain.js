const state = {
    queue: [],
    total_gone_in_queue: 0,
    last_question: null,
    last_answer: null,
    last_error: null,
    powerOn: true,
    questions_asked: 0,
    questions_answered: 0,
    questions_processed: 0,
    outline: {},
    document: {},
    context: {},
    context_talking_points: [],
    uploading: false,
    intervalsSinceLastQuestion: 0,
    loopIntervalSpeed: 1000 * 20,
    sinceLastMemoryUpdate: 0,
    countDownTime: 0,
    debug: false,
    error_count: 0
};

state.countDownTime = state.loopIntervalSpeed / 1000;

const addToErrorCount = () => {
    debug('Adding to error count')
    state.error_count += 1;
};

const debug = (message) => {
    if (state.debug) {
        console.log(`DEBUG: ql: ${state.queue.length} qa: ${state.questions_asked} ap: ${state.questions_answered} pp: ${state.questions_processed}`);
        console.log(message);
    }
};

const addToQueue = (prompt) => {
    debug(`Adding to queue: ${prompt}`);
    state.queue.push(prompt);
    if (typeof prompt == 'string') {
        state.total_gone_in_queue += 1;
    }
};

const addToFrontOfQueue = (prompt) => {
    debug(`Adding to front of queue: ${prompt}`);
    state.queue.unshift(prompt);
    state.total_gone_in_queue += 1;
};

const addArrayToFrontOfQueue = (prompts) => {
    debug(`Adding array to front of queue: ${prompts.length}`);
    prompts = prompts.reverse();
    for (const prompt of prompts) {
        addToFrontOfQueue(prompt);
        state.total_gone_in_queue += 1;
    }
};

const displayDocumentAsHTML = () => {
    debug('Displaying document as HTML');
    return '';
};

const splitStringIntoChunks = (stringValue, chunkSize = 2000) => {
    debug(`Splitting string into chunks of ${chunkSize} words`);
    const chunks = [];
    const sentences = stringValue.split('\n');
    let tmpChunk = '';
    for (const sentence of sentences) {
        const tmpTmpChunk = tmpChunk + sentence + '\n';
        const wordsLength = tmpTmpChunk.split(' ').length;
        if (wordsLength > chunkSize) {
            chunks.push(tmpChunk);
            tmpChunk = sentence + '\n';
            continue;
        }
        tmpChunk += sentence + '\n';
    }
    chunks.push(tmpChunk);

    debug(`Split string into ${chunks.length} chunks`);
    return chunks;
};

const updateShortTermMemory = () => {
    debug('Updating short term memory')
    const chunks = splitStringIntoChunks(selectorDocumanContextWindow().value);
    addToQueue({ action: 'MEMORY_UPLOAD_COMPLETE' });
    state.uploading = true;
    chunks.reverse().forEach((chunk, i) => {
        addToFrontOfQueue(promptCreateUploadMemory(i, chunks.length - 1,chunk));
    });
    addToFrontOfQueue(promptCreateUpdateMemory(chunks.length - 1));
};

const checkForMemoryUpdate = () => {
    debug('Checking for memory update');
    state.sinceLastMemoryUpdate += 1;

    if (state.sinceLastMemoryUpdate > 5 && state.uploading == false) {
        state.sinceLastMemoryUpdate = 0;
        updateShortTermMemory();
    }
};

const generateDocument = (docType) => {
    debug(`Generating document of type ${docType}`);
    playSound('document_started');
    updateShortTermMemory();
    addToFrontOfQueue(promptCreateDocument(docType));
    addToQueue(promptCreateTitlesAndSubTitlesForDocument(docType));
};

const updateSaveFile = () => {
    debug('Updating save file');
    // selectorContext().value = JSON.stringify(state.context);
    selectorOutline().value = JSON.stringify(state.outline, null, 2);
    formatDocIfExists();
};



const askedGreaterThanAnswered = () => {
    return state.questions_asked > state.questions_answered;
};

const answeredGreaterThanProcessed = () => {
    return state.questions_answered > state.questions_processed;
};

const answeredIsEqualToProcessed = () => {
    return state.questions_answered == state.questions_processed;
};

const queueHasItems = () => {
    return state.queue.length > 0;
};

const processAnswer = (payload, done) => {
    // console.log(payload)
    debug(`Processing answer: ${JSON.stringify(payload)}`);

    if (payload.action == undefined) {
        // insert didn't understand in front of queue
        debug('Answer was not understood')
        addToFrontOfQueue(promptCreateCouldntUnderstandAnswer());
        return;
    }

    try {
        actionMethods[payload.action](payload, done);
    } catch (err) {
        playSound('shtf');
        console.log(err);
        state.last_error = err;
        state.isOn = false;
        addToErrorCount();
        return;
    }
    
};

const adjustMainElementWidth = () => {
    debug('Adjusting main element width')
    selectorMainElement().style.width = "60%";
};

const checkUIState = () => {
    debug('Checking UI state');
    if (selectorMainElement().style.width != '60%') {
        adjustMainElementWidth();
    }

    if (state.context_talking_points.length > 0) {
        debug('Context talking points length is greater than 0')
        selectorDocumanContextWindow().value = gatherAndOrderTalkingPoints().join('\n');
    }

    // update questions asked vs answered
    selectorDocumanQuestionsAsked().innerText = state.questions_asked;
    selectorDocumanQuestionsAnswered().innerText = state.questions_answered;
    // selectorDocumanQuestionsProcessed().innerText = state.questions_processed;
    // queuelength
    selectorDocumanQueueLength().innerText = `${state.queue.length} Items in Queue`;
    selectorDocumanSaveFile().value = JSON.stringify({ queue: state.queue });
    // ETA
    setQueueLengthAndEta();

    // errors
    selectorDocumanError().innerText = state.error_count;
};

const loop = () => {
    debug('Looping')
    state.countDownTime = state.loopIntervalSpeed / 1000;
    checkUIState();

    if (state.powerOn == false) {
        return;
    }

    state.loop_interval_count += 1;
    state.intervalsSinceLastQuestion += 1;

    if (gptIsTalking()) {
        debug('GPT is talking')
        return;
    }

    if (answerAvailable() && askedGreaterThanAnswered()) {
        debug('Answer is available and asked is greater than answered')
        state.questions_answered += 1;
        state.last_answer = gptCurrentAnswer();

        const parsedAnswer = attemptToProcessJSONAnswer(state.last_answer);
        if (parsedAnswer == false) {
            debug('Answer could not be parsed')
            playSound('attempting_recover')
            addToFrontOfQueue(promptCreateCouldntUnderstandAnswer());
            state.questions_processed += 1;
        } else {
            debug('Answer was parsed')
            processAnswer(parsedAnswer, () => { state.questions_processed += 1; });
        }
    }

    if (queueHasItems() && answeredIsEqualToProcessed()) {
        debug('Queue has items and answered is equal to processed')
        checkForMemoryUpdate();
        state.last_question = state.queue.shift();

        if (typeof state.last_question == 'string') {
            debug('Last question is a string')
            askQuestion(state.last_question);
        } else {
            debug('Last question is not a string')
            const actionObj = { ...state.last_question };
            state.last_question = state.queue.shift();
            actionMethods[actionObj.action](actionObj.payload);
            askQuestion(state.last_question);
        }
    }

    updateSaveFile();
    checkUIState();
};

const save = (itemName, itemValue) => {
    debug(`Saving ${itemName} as ${itemValue}`)
    if (typeof itemValue == 'object') {
        itemValue = JSON.stringify(itemValue);
    }

    localStorage.setItem(itemName, itemValue);
};

const readSave = (itemName) => {
    debug(`Reading save ${itemName}`)
    const itemValue = localStorage.getItem(itemName);
    try {
        return JSON.parse(itemValue);
    } catch (err) {
        return itemValue;
    }
};

const checkForSavedState = () => {
    debug('Checking for saved state')
    if (localStorage.getItem('context') != null) {
        selectorDocumanContextWindow().value = localStorage.getItem('context');
    }
};

const setUIState = (currentState) => {
    debug(`Setting UI state to ${currentState}`)
    selectorDocumanCurrentAction().innerText = currentState;
};

const initialize = () => {
    // insert the UI to the page
    debug('Initializing')
    setEventListeners();
    checkForSavedState();

    playSound('chair_is_yours');
};

const setCountDownInterval = () => {
    debug('Setting countdown interval')
    setInterval(() => {
        debug('Counting down')
        state.countDownTime -= 1;
        selectorDocumanCountdown().innerText = state.countDownTime;
    }, 1000);
};


setTimeout(() => {
    debug('Setting timeout')
    initialize();
    setInterval(loop, state.loopIntervalSpeed);
    setCountDownInterval();
}, 2000);

insertUI();