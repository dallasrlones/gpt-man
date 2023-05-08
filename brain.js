const state = {
    queue: [],
    final_queue: [],
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
    intervals_since_last_question: 0,
    loopIntervalSpeed: 1000 * 30,
    sinceLastMemoryUpdate: 0,
    countDownTime: 0,
    debug: false,
    error_count: 0,
    retry_count: 0,
    speach_queue: [],
    speaking: false,
    speach_enabled: true,
    document_name: '',
    invalid_response: false
};

state.countDownTime = state.loopIntervalSpeed / 1000;

const resetState = () => {
    debug('Resetting state')
    state.queue = [];
    state.final_queue = [];
    state.total_gone_in_queue = 0;
    state.last_question = null;
    state.last_answer = null;
    state.last_error = null;
    state.powerOn = true;
    state.questions_asked = 0;
    state.questions_answered = 0;
    state.questions_processed = 0;
    state.outline = {};
    state.document = {};
    // state.context = {};
    state.context_talking_points = [];
    state.uploading = false;
    state.intervals_since_last_question = 0;
    state.sinceLastMemoryUpdate = 0;
    state.countDownTime = 0;
    state.error_count = 0;
    state.retry_count = 0;
    state.speach_queue = [];
    state.speaking = false;
    state.speach_enabled = true;
    state.document_name = '';
    state.invalid_response = false;
};

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

const splitStringIntoChunks = (stringValue, chunkSize = 3500) => {
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
    addToFrontOfQueue({ action: 'MEMORY_UPLOAD_COMPLETE' });
    state.uploading = true;
    chunks.reverse().forEach((chunk, i) => {
        addToFrontOfQueue(promptCreateUploadMemory(i, chunks.length - 1,chunk));
    });
    addToFrontOfQueue(promptCreateUpdateMemory(chunks.length - 1));
};

// if invalid response, make sure memory update is run after invalid response is handled
const checkForMemoryUpdate = () => {
    debug('Checking for memory update');
    if (state.uploading == false) {
        state.sinceLastMemoryUpdate += 1;
    }

    if (state.sinceLastMemoryUpdate > 4 && state.uploading == false) {
        state.sinceLastMemoryUpdate = 0;
        updateShortTermMemory();
    }
};

const generateDocument = (docType) => {
    debug(`Generating document of type ${docType}`);
    state.document_name = docType;
    playSoundNow('document_started');
    addToFrontOfQueue(promptCreateQuestionsForDocument(docType))
    addToFrontOfQueue(promptCreateDocument(docType));
    addToQueue(promptCreateTitlesAndSubTitlesForDocument(docType));
    updateShortTermMemory();
    saveContext();
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
    state.countDownTime = state.loopIntervalSpeed / 1000;
    debug('Checking UI state');
    if (selectorMainElement().style.width != '60%') {
        adjustMainElementWidth();
    }

    selectorDocumanLastMemoryUdate().innerText = state.sinceLastMemoryUpdate;

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

const checkForRegenerateResponseAndHandle = () => {
    if (gptInput() == null && selectorRegenerateResponse() != null) {
        debug('GPT is down')
        playSound('shtf');
        state.retry_count += 1;
        if (state.retry_count > 3) {
            state.powerOn = false;
            setTimeout(() => {
                state.powerOn = true;
                state.retry_count = 0;
            }, 1000 * 60 * 60 * 2)
            return true;
        }
        selectorRegenerateResponse().click();
        return true;
    }

    return false;
};

const addToLoopIntervalCount = () => {
    debug('Adding to loop interval count')
    state.loop_interval_count += 1;
};

const addToIntervalSinceLastQuestionCount = () => {
    debug('Adding to intervals since last question count')
    state.intervals_since_last_question += 1;
};

const addToQuestionsAskedCount = () => {
    debug('Adding to questions asked count')
    state.questions_asked += 1;
};

const addToQuestionsAnsweredCount = () => {
    debug('Adding to questions answered count')
    state.questions_answered += 1;
};

const addToQuestionsProcessedCount = () => {
    debug('Adding to questions processed count')
    state.questions_processed += 1;
};

const powerIsOff = () => {
    return state.powerOn == false;
};

const powerIsOn = () => {
    return state.powerOn == true;
};

const answerAvailableToParse = () => {
    return answerAvailable() && askedGreaterThanAnswered();
};

const doesntMatchSchema = (parsedAnswer) => {
    if (parsedAnswer.action == undefined || parsedAnswer.payload == undefined || actionMethods[parsedAnswer.action] == undefined) {
        return true;
    }

    try {
        return actionMethods[`${parsedAnswer.action}_SCHEMA_MATCHES`](parsedAnswer);
    } catch (err) {
        return true;
    }
};

const handleAndProcessAnswerIfAvailable = () => {
    console.log('handleAndProcessAnswerIfAvailable')
    console.log(answerAvailableToParse())
    if (answerAvailableToParse()) {
        debug('Answer is available and asked is greater than answered')
        addToQuestionsAnsweredCount();
        state.last_answer = gptCurrentAnswer();

        console.log('attempting to process')
        const parsedAnswer = attemptToProcessJSONAnswer(state.last_answer);
        
        if (parsedAnswer == false || doesntMatchSchema(parsedAnswer)) {
            console.log('invalid response')
            state.invalid_response = true;
            debug('Answer could not be parsed')
            playSoundNow('invalid_response')
            addToFrontOfQueue(promptCreateCouldntUnderstandAnswer());
            state.questions_processed += 1;
        } else {
            console.log('valid response')
            state.invalid_response = false;
            debug('Answer was parsed')
            processAnswer(parsedAnswer, () => { state.questions_processed += 1; });
        }
    }
};

const handleAndProcessQuestionIfAvailable = () => {
    if (queueHasItems() && answeredIsEqualToProcessed()) {
        debug('Queue has items and answered is equal to processed')
        checkForMemoryUpdate();
        state.last_question = state.queue.shift();

        if (typeof state.last_question == 'string') {
            debug('Last question is a string')
            askQuestion(state.last_question);
        } else {
            if (typeof state.last_question == undefined) {
                debug('Last question is undefined')
            } else {
                debug('Last question is not a string')
                const actionObj = { ...state.last_question };
                actionMethods[actionObj.action](actionObj.payload);
                state.last_question = state.queue.shift();
                askQuestion(state.last_question);
            }
        }
    }
};

const checkAndHandleEndOfQueue = () => {
    debug('Checking end of queue')
    if (!queueHasItems() && answeredIsEqualToProcessed() && state.questions_processed > 0 && state.intervals_since_last_question > 2) {
        if (state.final_queue.length > 0) {
            // complete run final queue
            state.queue = [...state.final_queue]
            state.final_queue = [];
        } else {
            // complete
            // reset states
            playSound('document_complete');
            state.powerOn = false;
            resetState();
        }
    }

};

const loop = () => {
    debug('Looping')

    if (checkForRegenerateResponseAndHandle() || powerIsOff()) {
        return;
    }

    addToLoopIntervalCount();
    addToIntervalSinceLastQuestionCount();

    if (gptIsTalking()) {
        debug('GPT is talking')
        return;
    }

    // handle and process answer
    handleAndProcessAnswerIfAvailable();

    // handle and process question if available
    handleAndProcessQuestionIfAvailable();

    checkAndHandleEndOfQueue()

    updateSaveFile();
    checkUIState();
};

const save = (itemName, itemValue) => {
    debug(`Saving ${itemName} as ${itemValue}`)

    // if itemValue is equal to the current value of the item, don't save it
    if (readSave(itemName) == JSON.stringify(itemValue) || readSave(itemName) == itemValue) {
        return;
    }

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