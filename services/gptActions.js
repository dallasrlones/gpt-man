const gptInput = () => {
    debug('Getting GPT input')
    return document.querySelector('textarea[data-id]');
};

const gptAnswerBox = () => {
    debug('Getting GPT answer box')
    const elements = document.querySelectorAll('div.relative.flex.w-\\[calc\\(100\\%-50px\\)\\].flex-col.gap-1.md\\:gap-3.lg\\:w-\\[calc\\(100\\%-115px\\)\\]');
    const lastElement = elements[elements.length - 1];
    return lastElement || false;
};

const gptCurrentAnswer = () => {
    debug('Getting GPT current answer')
    const elements = document.querySelectorAll('div.relative.flex.w-\\[calc\\(100\\%-50px\\)\\].flex-col.gap-1.md\\:gap-3.lg\\:w-\\[calc\\(100\\%-115px\\)\\]');
    const lastElement = elements[elements.length - 1];
    return lastElement.innerText;
};

const submitGptInput = () => {
    debug('Submitting GPT input')
    const input = gptInput();
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'Enter' }));
    document.querySelectorAll('button.absolute')[0].click();
};


const gptCurrentStatus = () => {
    debug('Getting GPT current status')
    const gptStatus = document.querySelector("#__next > div.overflow-hidden.w-full.h-full.relative.flex > div.flex.h-full.max-w-full.flex-1.flex-col > main > div.absolute.bottom-0.left-0.w-full.border-t.md\\:border-t-0.dark\\:border-white\\/20.md\\:border-transparent.md\\:dark\\:border-transparent.md\\:bg-vert-light-gradient.bg-white.dark\\:bg-gray-800.md\\:\\!bg-transparent.dark\\:md\\:bg-vert-dark-gradient.pt-2 > form > div > div:nth-child(1) > div > button")
    if (!gptStatus) {
        return "Loading...";
    }

    return gptStatus.innerText.trim();
};

const gptIsTalking = () => {
    debug('Checking if GPT is talking')
    return gptCurrentStatus() == "Stop generating";
};

const newGptChatButton = () => {
    debug('Getting new GPT chat button')
    return document.querySelector('nav').firstChild;
};

const sendGptInput = (input) => {
    debug('Sending GPT input')
    gptInput().value = input;
    state.last_question = input;
    
    setTimeout(() => {
        try {
            submitGptInput();
        } catch (err) {
            console.log(err)
            console.log(gptCurrentStatus())
            state.queue.unshift(state.last_question);
        }
    }, 1000);
};

const answerAvailable = () => {
    debug('Checking if answer is available')
    return gptAnswerBox().value != '' && gptIsTalking() == false;
};

const askQuestion = (prompt) => {
    debug('Asking question')
    sendGptInput(prompt);
    state.questions_asked += 1;
    state.intervalsSinceLastQuestion = 0;
    for (let i = 0; i < 2; i++) { playSound('typewriter_long'); }
};

const insertUI = () => {
    debug('Inserting UI')
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

        adjustMainElementWidth();
    } catch (err) {
        console.log(err)
    }
};