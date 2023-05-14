const get = (url, params) => {
    return new Promise((resolve, reject) => {
        axios.get(url, { params })
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
};

const post = (url, data) => {
    return new Promise((resolve, reject) => {
        axios.post(url, data)
            .then(response => {
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            });
    });
};

const getGPTState = () => {
    const currentState = selectors.gptStatus().innerText.trim();

    let status = 'UNKNOWN';

    if (currentState === 'Stop generating') {
        status = 'GENERATING';
    }

    if (currentState === 'Regenerate response') {
        status = 'READY';
    };

    state.status = status;
    return status;
};

const localActions = {
    'ASK_QUESTION': (payload) => {

    }
};

const state = {
    fileName: '',
    status
};

const loopState = {
    currentInterval: 0,
    currentAction: null,
    currentQuestion: null,
    currentAnswer: null,

    totalIntervals: 0,

    totalQuestionsAsked: 0,
    totalQuestionsAnswered: 0,
    totalQuestionsProcessed: 0,
    
    totalSuccess: 0,
    parseError: false,
    totalParseErrors: 0,
    schemaErrorList: [],
    errorList: []
};

const selectors = {
    gptInput: () => {
        return document.querySelector('textarea');
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
};

const prompts = {
    pleaseFixJson: () => {
        return `That was a great answer but I couldn't JSON.parse it or it was chopped off because of the token limit. Please make sure the JSON ansnwer is in the schema above.`;
    }
};

const gptInputHasValue = () => {
    return selectors.gptInput().value !== '';
};

const sendGptInput = () => {
    selectors.gptInput().value = loopState.currentQuestion;
    setTimeout(() => {
        selectors.gptInput().dispatchEvent(new Event('input', { bubbles: true }));
        selectors.gptInput().dispatchEvent(new KeyboardEvent('keydown', { 'key': 'Enter' }));
        document.querySelectorAll('button.absolute')[0].click();
    }, 1000);
};

const askQuestion = (response) => {
    const { question, action } = response;
    // add to queue if waiting for some reason? these will be null from server if nothing todo
    loopState.currentAction = action;
    loopState.currentQuestion = question;
    loopState.currentAnswer = null;

    sendGptInput();
};

const askToFixJSON = () => {
    loopState.currentAction = 'ASK_TO_FIX_JSON';
    loopState.currentQuestion = prompts.pleaseFixJson();
    loopState.currentAnswer = null;

    sendGptInput();
};

const gptHasNewAnswer = () => {
    return selectors.gptAnswer().value != '' && loopState.currentAnswer == null && loopState.currentAnswer != selectors.gptAnswer().value;
};

const processLoop = () => {
    loopState.currentInterval += 1;
    if (gptHasNewAnswer()) {
        // attempt to parse it locally, if you can parse it locally then send it to apiMan
        loopState.currentAnswer = selectors.gptAnswer().value;
        const parsedAnswer = parseAnswer(loopState.currentAnswer);
        if (parsedAnswer === true) {
            apiMan.sendPayload(parsedAnswer).then((response) => {
                if (response.success == false) {
                    // weird shit happened
                    // schema missmatch
                    return;
                }

                loop.currentAction = null;
                loop.currentQuestion = null;
            }).catch();
        } else {
            state.parseError = true;
            state.currentAnswer = null;
            state.currentAction = null;
        }
    }

    if (loopState.currentAction == null && loopState.currentInterval > 29) {
        loopState.currentInterval = 0;
        // fetch next action
        if (loopState.parseError == false) {
            apiMan.fetchNextAction().then((response) => {
                askQuestion(response);
            }).catch((error) => {
                const location = 'processLoop - fetchNextAction ERROR';
                console.log(location, error);
                errorList.push({ error, location });
            });
        } else {
            askToFixJSON();
        }
    }
};

const updateLoopState = () => {
    loopState.totalIntervals++;

    // send post to localhost 1337 with entire loopState and state

    axios.post('http://localhost:1337/state', { loopState, state }).then((response) => {}).catch((error) => {});
};

const updateUI = () => {
};

const icebergCaptain = () => {
    // try to see what error its returning us
    // set a timeout of an hour or so depending on what error it returned
    // start the loop again
};

const shortLoop = () => {
    updateLoopState();
    updateUI();
    // check gpt state
    const gptState = getGPTState();
    if (gptState === 'GENERATING') {
        return;
    } else
    
    if (gptState === 'READY') {
        processLoop();
    } else {
        // we hit call limit or an error
        icebergCaptain();
    }
};

// setInterval(() => {
//     shortLoop();
// }, 1000);



const apiMan = {
    fetchNextAction: () => {
        // this will return server state
        // this will look like


        // const response = {
        //     action: '',
        //     payload: {}
        // };


        return get('http://localhost:1337/next');
    },
    sendPayload: (payload) => {
        return post('http://localhost:1337/payload', payload);
    },
    

};

console.log('hit')