const insertUI = () => {
    const parent = document.body;
    const newDiv = document.createElement('div');
    newDiv.style.position = 'fixed';

    try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', chrome.runtime.getURL('lib/ui2.html'), true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                newDiv.innerHTML = xhr.responseText;
            }
        };
        xhr.send();
        parent.appendChild(newDiv);
    } catch (err) {
        console.log(err)
    }
};

insertUI();

const http = {
    get: (url) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    resolve(JSON.parse(xhr.responseText));
                }
            };
            xhr.send();
        });
    },
    put: (url, data) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    resolve(JSON.parse(xhr.responseText));
                }
            };
            xhr.send(JSON.stringify(data));
        });
    },
    post: (url, data) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    resolve(JSON.parse(xhr.responseText));
                }
            };
            xhr.send(JSON.stringify(data));
        });
    }
};

const schemas = {
    confirmation: '\n{ "action": "CONFIRMATION" }\n\n',
    questionsForContext: '\n{ "action": "QUESTIONS_NEEDED", "payload": ["question 1", ...] }\n\n',
};

const pleaseFormatInThisSchema = (schema) => {
    let prompt = `Please format your response in this JSON schema:`;
    prompt += `\n${schema}\n\n`;
    return prompt;
};

const prompts = {
    pleaseFixJson: () => {
        return `That was a great answer but I couldn't JSON.parse it or it was chopped off because of the token limit. Please make sure the JSON ansnwer is in the schema above.`;
    },
    buildContextUpload: () => {
        let prompt = `Just to refresh your memory here is the context of what I'm talking about. Please confirm you understand with a JSON confirmation response.`;
        prompt += `\n\n${state.context.replace('\n', ' ')}\n`
        prompt += pleaseFormatInThisSchema(schemas.confirmation);

        if (prompt.split(' ').length > 4000) {
            console.log(prompt.split(' ').length)
            throw new Error('Context is too long');
        }

        return prompt;
    }
};

// input dissapears
// answer says problem
// click regenerate

const selectors = {
    gptInput: () => {
        const textAreas = document.getElementsByTagName('textarea').length;
        let textArea = null;
        for (let i = 0; i < textAreas; i++) {
            const el = document.getElementsByTagName('textarea')[i];
            if (el.id != 'documan-context') {
                textArea = el;
                break;
            }
        }
        return textArea;
    },
    gptStatus: () => {
        return document.querySelector(
            "#__next > div.overflow-hidden.w-full.h-full.relative.flex.z-0 > " + 
            "div.relative.flex.h-full.max-w-full.flex-1.overflow-hidden > div >" + 
            " main > div.absolute.bottom-0.left-0.w-full.border-t.md\\:border-t-0.dark\\:border" + 
            "-white\\/20.md\\:border-transparent.md\\:dark\\:border-transparent.md\\:bg-vert-light-" + 
            "gradient.bg-white.dark\\:bg-gray-800.md\\:\\!bg-transparent.dark\\:md\\:bg-vert-dark-gradie" + 
            "nt.pt-2 > form > div > div:nth-child(1) > div > button > div")
    },
    gptNewChatButton: () => {
        return document.querySelector('nav').firstChild;
    },
    gptAnswer: () => {
        const elements = document.querySelectorAll('div.relative.flex.w-\\[calc\\(100\\%-50px\\)\\].flex-col.gap-1.md\\:gap-3.lg\\:w-\\[calc\\(100\\%-115px\\)\\]');
        const lastElement = elements[elements.length - 1];
        if (!lastElement) {
            return null;
        }
        return lastElement.innerText;
    },
    documanRunning: () => {
        return document.querySelector('#documan-checkbox');
    },
    documanStatus: () => {
        return document.querySelector('#documan-status');
    },
    queueLength: () => {
        return document.querySelector('#documan-queue');
    },
    countdown: () => {
        return document.querySelector('#documan-countdown');
    },
    questionsAsked: () => {
        return document.querySelector('#documan-question-asked');
    },
    questionsAnswered: () => {
        return document.querySelector('#documan-question-answered');
    },
    questionsProcessed: () => {
        return document.querySelector('#documan-question-processed');
    },
    context: () => {
        return document.querySelector('#documan-context');
    },
    memoryUpload: () => {
        return document.querySelector('#documan-memory-upload');
    },
    host: () => {
        return document.getElementById('documan-host');
    }
};

const state = {
    fileName: '',
    status: 'UNKNOWN',

    powerOn: false,
    regenerate: false,

    gptIntervalSpeed: 30,
    memoryIntervalSpeed: 3,
    sinceLastMemoryUpdate: 0,

    currentInterval: 0,
    currentAction: null,
    currentQuestion: null,
    currentAnswer: null,
    lastAnswer: null,

    totalIntervals: 0,

    totalQuestionsAsked: 0,
    totalQuestionsAnswered: 0,
    totalQuestionsProcessed: 0,
    
    totalSuccess: 0,
    parseError: false,
    totalParseErrors: 0,
    schemaErrorList: [],
    errorList: [],
    parseError: false,
    debug: false,
    gptSystemError: false,
    gptSystemErrorCount: 0
};

const getGptStatus = () => {
    let status = 'UNKNOWN';
    
    try {
        const currentState = selectors.gptStatus().innerText.trim();
    

        if (currentState === 'Stop generating') {
            status = 'GENERATING';
        }

        if (currentState === 'Regenerate response') {
            status = 'READY';
        };
    } catch (err) {
        status = 'UNKNOWN';
    }

    state.status = status;
    selectors.documanStatus().innerText = status;
    return status;
};

const sendGptInput = () => {
    selectors.gptInput().value = state.currentQuestion;
    setTimeout(() => {
        selectors.gptInput().dispatchEvent(new Event('input', { bubbles: true }));
        selectors.gptInput().dispatchEvent(new KeyboardEvent('keydown', { 'key': 'Enter' }));
        document.querySelectorAll('button.absolute')[0].click();
        state.currentAnswer = null;
    }, 1000);
};

const askQuestion = (response) => {
    const { question, action } = response;
    state.currentAction = action;
    state.currentQuestion = question;
    state.sinceLastMemoryUpdate += 1;
    state.totalQuestionsAsked += 1;


    // turn questions asked to green
    // add the class green
    selectors.questionsAsked().classList.add('green');
    selectors.questionsAsked().classList.remove('white');
    selectors.questionsAnswered().classList.remove('green');
    selectors.questionsAnswered().classList.add('white');
    selectors.questionsProcessed().classList.remove('green');
    selectors.questionsProcessed().classList.add('white');

    playSound('typewriter_bell');
    playSound('typewriter_long');
    playSound('typewriter_long');
    playSound('typewriter_long');

    sendGptInput();
};

const parseAnswer = (answer) => {
    // try to json .parse it, look for the first { and the last }
    const first = answer.indexOf('{');
    const last = answer.lastIndexOf('}');

    if (first == -1 || last == -1) {
        playSoundNow('error.mp3');
        state.parseError = true;
        return false;
    }

    const subString = answer.substring(first, last + 1);
    try {
        const parsed = JSON.parse(subString);
        state.parseError = false;
        return parsed;
    } catch (err) {
        playSoundNow('error.mp3');
        state.parseError = true;
        return false;
    }
};

const sendPayload = (payload) => {
    return http.post('http://localhost:1337/payload', payload);
};

const fetchNextQuestion = () => {
    return http.get('http://localhost:1337/next');
};

const updateUI = () => {
    selectors.queueLength().innerText = serverState.queue.length;
    selectors.countdown().innerText = (state.gptIntervalSpeed - state.currentInterval) + 's';

    const elements = document.querySelectorAll('div.relative.flex.w-\\[calc\\(100\\%-50px\\)\\].flex-col.gap-1.md\\:gap-3.lg\\:w-\\[calc\\(100\\%-115px\\)\\]');
    const lastElement = elements[elements.length - 3];
    if (lastElement != null || lastElement != undefined) {
        // change lastElement to display none
        lastElement.parentElement.style.display = 'none';
    }

    const lastElement2 = elements[elements.length - 4];
    if (lastElement2 != null || lastElement2 != undefined) {
        // change lastElement to display none
        lastElement2.parentElement.style.display = 'none';
    }

    try {
        const last1 = elements[elements.length - 1];
        last1.background = "#1d1d1d";
        const last2 = elements[elements.length - 2];
        last2.background = "#1d1d1d";

        const bottomElement = document.querySelector("#__next > div.overflow-hidden.w-full.h-full.relative.flex.z-0 > div.relative.flex.h-full.max-w-full.flex-1.overflow-hidden > div > main > div.absolute.bottom-0.left-0.w-full.border-t.md\\:border-t-0.dark\\:border-white\\/20.md\\:border-transparent.md\\:dark\\:border-transparent.md\\:bg-vert-light-gradient.bg-white.dark\\:bg-gray-800.md\\:\\!bg-transparent.dark\\:md\\:bg-vert-dark-gradient.pt-2");
        bottomElement.background = "#1d1d1d";
    } catch (err) {
        // oh well
    }
};

const handleApiError = (err) => {
    playSound('error');
    console.log(err);
};

const handleServerError = (response) => {
    if (response.success != true) {
        playSound('error');
        console.log(response.error)
    }
};

const askToFixJSON = () => {
    state.currentAction = 'ASK_TO_FIX_JSON';
    state.currentQuestion = prompts.pleaseFixJson();
    state.currentAnswer = null;
    state.parseError == false

    sendGptInput();
};

const uploadMemory = () => {
    state.sinceLastMemoryUpdate = 0;
    state.currentAction = 'SYNCING_MEMORY';
    state.currentQuestion = prompts.buildContextUpload();
    state.currentAnswer = null;

    sendGptInput();
    setTimeout(() => {
        state.currentAction = null;
    }, 2000);
};

let serverState = {
    queue: [],
};

const fetchAndAssignCurrentState = () => {
    http.get('http://localhost:1337/state').then(response => {
       serverState = response.serverState;
    }).catch(handleApiError);
};

const sendCurrentState = () => {
    http.post('http://localhost:1337/state', { state }).then(handleServerError).catch(handleApiError);
};

const loopReady = () => {
    return aboveLoopIntervals = state.currentInterval > state.gptIntervalSpeed - 1;
};

const gptStatusUnknownOrReady = () => {
    return state.status == 'READY' || state.status == 'UNKNOWN';
};

const currentActionNull = () => {
    return state.currentAction == null;
};

const readyToAskQuestion = () => {
    return (state.currentAction == null && state.status == 'UNKNOWN' && state.totalIntervals == 1) || 
        (
            gptIsNotTalking() &&
            loopReady() && 
            gptStatusUnknownOrReady() && 
            currentActionNull()
        );
};

const fetchMemory = () => {
    return http.get('http://localhost:1337/memory');
};

const gptIsNotTalking = () => {
    return selectors.gptStatus() != null && selectors.gptStatus().innerText != 'Stop generating';
};

const gptAnswerIsAvailable = () => {
    return selectors.gptAnswer() != null &&  selectors.gptAnswer().innerText != '';
};

const gptHasNewAnswer = () => {
    return gptIsNotTalking() && gptAnswerIsAvailable() && state.currentAnswer == null;
};

const fetchIP = () => {
    http.get('http://localhost:1337/ip').then(response => {
        selectors.host().innerText = response.ip;
    }).catch(handleApiError);
};

const gptSystemError = () => {
    try {
        if(selectors.gptAnswer().children[0].children[0].children[0].classList.contains('border-red-500') || selectors.gptInput() == null) {
            state.gptSystemError = true;
            return true;
        }

        return false;
    } catch (err) {
        return false;
    }
    
};


// loop every 1 second, every 30 seconds check for question
const loop = () => {
    if (state.powerOn == false) {
        return;
    }

    fetchIP();

    state.currentInterval += 1;
    state.totalIntervals += 1;
    getGptStatus();
    fetchAndAssignCurrentState();
    sendCurrentState();

    console.log({
        state: state
    })

    console.log({
        gptHasNewAnswer: gptHasNewAnswer(),
        readyToAskQuestion: readyToAskQuestion()
    })

    if (gptSystemError() && gptIsNotTalking()) {
        state.gptSystemErrorCount += 1;
        if (state.gptSystemErrorCount > 2) {
            state.powerOn = false;
        }


        selectors.gptStatus().click();
        return;
    }

    state.gptSystemErrorCount = 0;


    if (gptHasNewAnswer() && state.parseError == false) {
        state.currentAnswer = selectors.gptAnswer();
        const parsedAnswer = parseAnswer(state.currentAnswer);
        if (parsedAnswer != false) {
            selectors.questionsAnswered().classList.add('green');
            selectors.questionsAnswered().classList.remove('white');

            // make sure parsedAnswer isn't the same as the last answer
            if (JSON.stringify(parsedAnswer) == JSON.stringify(state.lastAnswer || {})) {
                if (parsedAnswer.action != 'CONFIRMATION') {
                    state.regenerate = true;
                    return;
                }
            }

            state.lastAnswer = parsedAnswer;
            sendPayload(parsedAnswer).then((response) => {
                if (response.success == false) {
                    state.powerOn = false;
                    selectors.questionsAnswered().classList.remove('green');
                    selectors.questionsAnswered().classList.add('red');
                    console.log(response);
                    return;
                }
                state.currentAction = null;
                state.currentQuestion = null;
                selectors.questionsProcessed().classList.add('green')
                selectors.questionsProcessed().classList.remove('white')
            }).catch(err => {
                console.log(`sendpayload ${err}`)
            });
        } else {
            state.currentAnswer = null;
            state.currentAction = null;
        }
    }

    if (readyToAskQuestion()) {
        if (state.regenerate == true) {
            selectors.gptStatus().click();
            state.regenerate = false;
            state.currentInterval = 0;
            return;
        }

        if (state.parseError == true) {
            askToFixJSON();
            state.currentInterval = 0;
            return;
        }

        if (state.sinceLastMemoryUpdate > state.memoryIntervalSpeed) {
            fetchMemory().then(response => {
                if (response.success == true) {
                    state.sinceLastMemoryUpdate = 0;
                    askQuestion(response);
                }
            }).catch(handleApiError);
        } else {
            // this should get back an expected schema (title, sub, section...) for sendPayload
            fetchNextQuestion().then(response => {
                if (response.action != null) {
                    askQuestion(response);
                }
            }).catch(handleApiError);
        }
    }

    if (loopReady()) {
        state.currentInterval = 0;
    }

    updateUI();
};

const save = (itemName, value) => {
    if (typeof value == 'object') {
        localStorage.setItem(itemName, JSON.stringify(value));
    } else {
        localStorage.setItem(itemName, value);
    }
};

const loadSave = (itemName) => {
    return localStorage.getItem(itemName);
};

const sendContextToServer = () => {
    http.post('http://localhost:1337/context', { context: state.context })
        .then(handleServerError).catch(handleApiError);
};

const saveContext = () => {
    state.context = selectors.context().value;
    save('context', state.context);

    sendContextToServer();
};

const togglePowerOn = () => {
    state.powerOn = !state.powerOn;
    if (state.powerOn == true) {
        document.body.requestFullscreen();
        playSoundNow('chair_is_yours');
    } else {
        document.exitFullscreen();
    }
};

const addEventListeners = () => {
    selectors.documanRunning().addEventListener('change', togglePowerOn);
    selectors.context().addEventListener('input', saveContext);
    selectors.memoryUpload().addEventListener('click', uploadMemory);
};

const init = () => {
    const context = loadSave('context');
    if (context != null) {
        state.context = context;
        selectors.context().value = context;
    }
    updateUI();
    loop();
};

const debug = (message) => {
    if (state.debug == true) {
        console.log(message);
    }
};

setTimeout(() => {
    init();
    addEventListeners();
    setInterval(loop, 1000);
}, 1000);

