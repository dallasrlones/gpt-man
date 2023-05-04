const gptInput = () => {
    return document.querySelector('textarea[data-id]');
};

const gptAnswerBox = () => {
    const elements = document.querySelectorAll('div.relative.flex.w-\\[calc\\(100\\%-50px\\)\\].flex-col.gap-1.md\\:gap-3.lg\\:w-\\[calc\\(100\\%-115px\\)\\]');
    const lastElement = elements[elements.length - 1];
    return lastElement || false;
};

const gptCurrentAnswer = () => {
    const elements = document.querySelectorAll('div.relative.flex.w-\\[calc\\(100\\%-50px\\)\\].flex-col.gap-1.md\\:gap-3.lg\\:w-\\[calc\\(100\\%-115px\\)\\]');
    const lastElement = elements[elements.length - 1];
    return lastElement.innerText;
};

const submitGptInput = () => {
    const input = gptInput();
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'Enter' }));
    document.querySelectorAll('button.absolute')[0].click();
};

const sendGptInput = (prompt) => {
    const input = gptInput();
    input.value = prompt;
    submitGptInput();
    state.questions_asked += 1;
};

const gptCurrentStatus = () => {
    const gptStatus = document.querySelector("#__next > div.overflow-hidden.w-full.h-full.relative.flex > div.flex.h-full.max-w-full.flex-1.flex-col > main > div.absolute.bottom-0.left-0.w-full.border-t.md\\:border-t-0.dark\\:border-white\\/20.md\\:border-transparent.md\\:dark\\:border-transparent.md\\:bg-vert-light-gradient.bg-white.dark\\:bg-gray-800.md\\:\\!bg-transparent.dark\\:md\\:bg-vert-dark-gradient.pt-2 > form > div > div:nth-child(1) > div > button")
    if (!gptStatus) {
        return "Loading...";
    }

    return gptStatus.innerText.trim();
};

const gptIsTalking = () => {
    return gptCurrentStatus() == "Stop generating";
};

const newGptChatButton = () => {
    return document.querySelector('nav').firstChild;
};

// queue loop
const loopQueue = [];
let waitingForAnswer = false;

const addToLoopQueue = (prompt) => {
    loopQueue.push(prompt);
};

// Generates a text file and triggers a file download
function downloadTxt(text) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.txt';
    a.click();
}

// const playSound = (sound_location) => {
//     var myAudio = new Audio(chrome.runtime.getURL(`lib/${sound_location}.wav`));
//     myAudio.play();
// };

const gatherAndOrderTalkingPoints = () => {
    const talkingPoints = Object.keys(state.context).reduce((acc, file) => {
        const chunks = state.context[file].chunks;
        const talkingPoints = chunks.reduce((acc, chunk) => {
            return acc.concat(chunk);
        }, []);
        return acc.concat(talkingPoints);
    }, []);
    return talkingPoints;
};

const saveDigestedSummary = (summary) => {
    // get all of state.context and loop through each file and using a reduce to create one array of talking points (chunks)
    talkingPoints = gatherAndOrderTalkingPoints();

    state.uploading = false;
    state.context_talking_points = talkingPoints;
    // downloadTxt(talkingPoints.join('\n'));
    playSound('context_complete')
};

const digestMethods = {
    'play_sound': (payload, done) => {
        playSound(payload.location);
        done();
    },

    'context_summary_complete': (_payload, done) => {
        playSound('stand_by_upload_complete')
        done();
    },

    'all_context_complete': (_payload, done) => {
        saveDigestedSummary();
        done();
    },

    'chunk_summary': (payload, done) => {
        setUIState(`analyzing chunk summary`);
        // selectorDocumanContextWindow().value = JSON.stringify(payload, null, 2);
        try {
            // {"chunk_summary": { "extractive_summary_list: ["",""], "file": "thefilesname.txt" } }
            const chunkSummary = payload.chunk_summary;
            state.context[payload.chunk_summary.file].chunks.push(chunkSummary.extractive_summary_list);
            done();
        } catch (err) {
            setUIState(`chunk summary erro ${err.message}`)
            console.log(err);
        }

    },

    'confirmation': (payload, done) => {
        // display to the user the chunk progress
        // rightSideWindowText().value = payload.confirmation;
        done();
    },

    'statement': (payload, done) => {
        // display to the user before continue
        alert(payload.statement);
        done();
    },

    'question': (payload, done) => {
        // ask the user some how before continue, continue, 
        // get user response, send user response done(), get response
        alert(payload.question);
        done();
    },

    // will send commands to a shell hooked up to an API via NodeJS
    // this could be huge!
    'teminal_command': (payload, done) => {
        // alert user what this command is doing before running it
        // run command after user confirms via nodejs and process.exec by hitting localhost api DANGEROUS lol
        alert(payload.terminal_command);
        done();
    },

    'test_code': (payload, done) => {
        // when gpt thinks the app is ready
        // test docker run
        done();
    },

    // will open a web page, and feed it in chunks to gpt
    'search_web': (payload, done) => {
        alert(payload.search_web);
        done();
    },

    'titles': (payload, done) => {
        // {"titles":["Title 1","Title 2","Title 3",...]}
        payload.titles.forEach(title => {
            console.log(title);
            state.document[title] = { subtitles: {} };
            addToLoopQueue(createSubTitlesOutOfTitlePrompt(title));
        });
        setUIState('gathering subtitles complete');
        done();
    },
    'title': (payload, done) => {
        // {"title":{ ${titleName}":{"subtitles":['Subtitle 1','Subtitle 2',...]}}}

        const title = Object.keys(payload.title)[0];
        const subtitles = payload.title[title].subtitles;

        setUIState(`completed gathering subtitles for ${title}`);

        state.document[title] = { subtitles: {} };

        subtitles.forEach(subtitle => {
            state.document[title].subtitles[subtitle] = { sections: {} };
            addToLoopQueue(createSectionsOutOfSubTitlesPrompt(title, subtitle));
        });
        done();
    },
    'subtitle': (payload, done) => {
        // {"subtitle":{"${title}":{"${subTitle}":{"sections":["Section Name 1","Section Name 2","Section Name 3",...]}}}}

        const title = Object.keys(payload.subtitle)[0];
        const subtitle = Object.keys(payload.subtitle[title])[0];
        const sections = payload.subtitle[title][subtitle].sections;

        sections.forEach(section => {
            state.document[title].subtitles[subtitle].sections[section] = { paragraphs: [] };
            addToLoopQueue(createParagraphsOutOfSectionsPrompt(title, subtitle, section));
        });
        setUIState(`completed gathering sections for ${title} ${subtitle}`)
        done();
    },
    'section': (payload, done) => {
        // {"section": {"${title}":{"${subtitle}":{"${section}":{"paragraphs":["Paragraph 1 Title","Paragraph 2 Title",...]}}}}}

        const title = Object.keys(payload.section)[0];
        const subtitle = Object.keys(payload.section[title])[0];
        const section = Object.keys(payload.section[title][subtitle])[0];
        const paragraphs = payload.section[title][subtitle][section].paragraphs;

        state.document[title].subtitles[subtitle].sections[section].paragraphs.push(...paragraphs);
        setUIState(`completed gathering paragraphs for ${title} ${subtitle} ${section}`)
        done();
    },
    'paragraph': (payload, done) => {
        // {"paragraph":{"${title}":{"${subtitle}":{"${section}":{"${paragraph}":{"sentenses":["sentence 1...","sentence 2...", ...]}}}}}
        // assign all the sentences to state.document[title][subtitle][section][paragraph] += \n sentence \n
        // const title = Object.keys(payload.paragraph)[0];
        // const subtitle = Object.keys(payload.paragraph[title])[0];
        // const section = Object.keys(payload.paragraph[title][subtitle])[0];
        // const paragraph = Object.keys(payload.paragraph[title][subtitle][section])[0];
        // const sentences = payload.paragraph[title][subtitle][section][paragraph].sentences;

        // sentences.forEach(sentence => {
        //     state.document[title].subtitles[subtitle].sections[section].paragraphs[paragraph].sentences.push(sentence);
        // });
        done();
    }
};

const addPromptsArrayToFrontOfQueue = (prompts) => {
    prompts.reverse().forEach(prompt => {
        loopQueue.unshift(prompt);
    });
};

const updateShortTermMemory = () => {
    // fetch from context and feed via chunks into gpt
    // attach to the front of the queue
    const chunks = [];

    const context = selectorDocumanContextWindow().value;

    // loop through context and make sure its less than 2000 words per chunk
    // if its more than 2000 words, split it up into chunks
    // if its less than 2000 words, add it to the chunks array

    context.split(' ').forEach(word => {
        if (chunks.length === 0) {
            chunks.push(word);
        } else {
            const lastChunk = chunks[chunks.length - 1];
            if (lastChunk.split(' ').length < 2000) {
                chunks[chunks.length - 1] += ` ${word}`;
            } else {
                chunks.push(word);
            }
        }
    });

    const memoryPrompts = [];
    chunks.forEach((chunk, i) => {
        memoryPrompts.push(createMemoryChunkPrompt(i, chunk.length - 1,chunk));
    });
    addPromptsArrayToFrontOfQueue(memoryPrompts);
};

const attemptToProcessJSONAnswer = (answer) => {
    try {
        const firstOpenBracket = answer.indexOf('{');
        const lastCloseBracket = answer.lastIndexOf('}');

        const subStringFromOpenAndCloseBracket = answer.substring(firstOpenBracket, lastCloseBracket + 1);

        const numberOfOpeningBrackets = subStringFromOpenAndCloseBracket.split('{').length;
        const numberOfClosingBrackets = subStringFromOpenAndCloseBracket.split('}').length;

        if (numberOfOpeningBrackets > numberOfClosingBrackets) {
            playSound('error.mp3');
            let bracketString = '}';
    
            for (let i = 0; i < numberOfOpeningBrackets - numberOfClosingBrackets; i++) {
                bracketString += '}';
            }
    
            const parsedAnswer = JSON.parse(subStringFromOpenAndCloseBracket + bracketString);
            return parsedAnswer;
        }
    
        if (numberOfOpeningBrackets < numberOfClosingBrackets) {
            playSound('error.mp3');
            // remove the last characters from the answer
            const numberOfBrackets = numberOfClosingBrackets - numberOfOpeningBrackets;
            answer = answer.substring(0, answer.length - numberOfBrackets);
    
            const parsedAnswer = JSON.parse(answer);
            return parsedAnswer;
        }

        const parsedAnswer = JSON.parse(subStringFromOpenAndCloseBracket);
        return parsedAnswer;
    } catch (err) {
        console.log(err);
        return false;
    }
};

let lastDigestedAnswer = null;
let processAnswerRetryCount = 0;
let totalErrorCount = 0;
let questionsAskedSinceLastMemoryUpdate = 0;
const processAnswer = (answer) => {
    if (gptIsTalking()) {
        return;
    }

    questionsAskedSinceLastMemoryUpdate += 1;

    if (questionsAskedSinceLastMemoryUpdate > 4 && state.uploading == false) {
        questionsAskedSinceLastMemoryUpdate = 0;
        updateShortTermMemory();
    }

    const parsedAnswer = attemptToProcessJSONAnswer(answer);

    if (parsedAnswer == false) {
        playSound('attempting_recover');
        totalErrorCount += 1;
        console.log(selectorDocumanError());
        selectorDocumanError().innerHTML = totalErrorCount;
        gptInput().value = createInvalidJsonPrompt();
        questionsAskedSinceLastMemoryUpdate -= 1;
        return;
    }

    playSound('typewriter_long');

    if (lastDigestedAnswer === parsedAnswer) {
        return;
    }
    lastDigestedAnswer = parsedAnswer;

    const action = Object.keys(parsedAnswer)[0];

    setUIState(`digesting answer ${action}`);

    if (digestMethods[action] == undefined) {
        playSound('attempting_recover');
        totalErrorCount += 1;
        selectorDocumanError().innerText = totalErrorCount;
        gptInput().value = createDidntUnderstandPrompt();
        return;
    }

    selectorDocumanCurrentAction().innerText = action;

    digestMethods[action](parsedAnswer, () => { state.questions_answered += 1; });
    selectorDocumanContentWindow().value = JSON.stringify(state.document, null, 2);
    if (state.context_talking_points.length > 0) {
        selectorDocumanContextWindow().value = gatherAndOrderTalkingPoints().join('\n');
    }
};

const state = {
    questions_asked: 0,
    questions_answered: 0,
    parsing_mode: false,
    document: {},
    resting: false,
    last_question: '',
    last_answer: '',
    context: {},
    uploading: false,
    context_talking_points: []
};

let documanEnabled = true;
const toggleDocumanRunning = () => {
    documanEnabled = !documanEnabled;
};

const setUIState = (currentState) => {
    selectorDocumanCurrentAction().innerText = currentState;
};

const formatDocIfExists = () => {
    if (Object.keys(state.document).length > 0) {
        let markdownString = '';        
        Object.keys(state.document).forEach(title => {
            markdownString += `# ${title}\n\n`;
            const subtitles = state.document[title].subtitles;
            Object.keys(subtitles).forEach(subtitle => {
                markdownString += `## ${subtitle}\n\n`;
                const sections = subtitles[subtitle].sections;
                Object.keys(sections).forEach(section => {
                    markdownString += `### ${section}\n\n`;
                    const paragraphs = sections[section].paragraphs;
                    Object.keys(paragraphs).forEach(paragraph => {
                        markdownString += `${paragraphs[paragraph]}\n\n`;
                    });
                });
            });
        });

        var md = window.markdownit();
        markdownString = md.render(markdownString);
        selectorDocumanFormatted().innerHTML = markdownString;
    }
};

const setQueueLengthAndEta = () => {
    // display s for seconds or m for minutes or h for hours or d for days depending on the intervalSpeed which is set in seconds
    // each item in the queue is itterates on intervalSpeed
    let etaString = '';
    if (loopQueue.length > 0) {
        const eta = loopQueue.length * (intervalSpeed / 1000);
        if (eta < 60) {
            etaString = `${eta.toFixed(0)}s`;
        } else if (eta < 3600) {
            etaString = `${(eta / 60).toFixed(0)}m`;
        } else if (eta < 86400) {
            etaString = `${(eta / 3600).toFixed(0)}h`;
        } else {
            etaString = `${(eta / 86400).toFixed(0)}d`;
        }

        // if its empty return 0s
    } else {
        etaString = '0s';
    }

    selectorDocumanPercentageDone().innerText = `${loopQueue.length}  Items in Queue. Minimum ETA: ${etaString}`;
};

const updateUI = () => {
    selectorQuestionsAnswered().innerText = state.questions_answered;
    selectorQuestionsAsked().innerText = state.questions_asked;
    setQueueLengthAndEta();
    //  Items in Queue.
    formatDocIfExists();

    if (selectorDocumanContextWindow().value.length != 0) {
        localStorage.setItem('context', selectorDocumanContextWindow().value);
    } else {
        if (localStorage.getItem('context') != null) {
            selectorDocumanContextWindow().value = localStorage.getItem('context');
        }
    }
};

let intervalsSinceLastQuestion = 0;
const loop = () => {
    intervalsSinceLastQuestion += 1;
    updateUI();

    if (documanEnabled == false || intervalsSinceLastQuestion < 2 || gptIsTalking()) {
        return;
    }

    if (state.questions_answered < state.questions_asked) {
        setUIState('processing last answer');
        processAnswer(gptCurrentAnswer());
    }

    const queueHasItems = loopQueue.length > 0;
    const gptInputIsEmpty = gptInput().value == '';
    const questionsAskedEqualsQuestionsAnswered = state.questions_asked == state.questions_answered;

    if (queueHasItems && questionsAskedEqualsQuestionsAnswered && gptInputIsEmpty) {
        sendGptInput(loopQueue.shift());
        intervalsSinceLastQuestion = 0;
        return;
    }

    if (gptInput().value.trim() != '' && intervalsSinceLastQuestion > 5) {
        setUIState('submitting gpt input automatically');
        submitGptInput();
        intervalsSinceLastQuestion = 0;
    }

    if (intervalsSinceLastQuestion > 10) {
        setUIState('Done');
    }
};

const initialize = () => {
    playSound('chair_is_yours');
    playSoundOnRepeat('cafe.mp3', .4);
    playSongOnRepeat('song3.mp3', .2);
    selectorDocumanRunning().addEventListener('change', toggleDocumanRunning);
    selectorDocumanSubmit().addEventListener('click', (e) => {
        const documentType = businessTypeInput().value;
        businessTypeInput().value = "";
        generateDocument(documentType);
    });
    attachFileUploadListener();
    adjustMainElementWidth();
    if (localStorage.getItem('context') != null) {
        selectorDocumanContextWindow().value = localStorage.getItem('context');
    }
};


const parent = document.body;
const newDiv = document.createElement('div');
newDiv.style.position = 'fixed';

try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', chrome.runtime.getURL('lib/ui.html'), true);
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

let intervalSpeed = 10000;

setTimeout(() => {
    initialize();
    setInterval(loop, intervalSpeed);
}, 2000);