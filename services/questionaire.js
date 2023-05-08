// I'm going to be sending you 1 chunks of information to refresh your context of what I'm trying to do. Please confirm you understand with a JSON response.

// Your response should look like this (unless it's a confirmation action then just return confirmation):
// {"action":"CONFIRMATION"}

// If you don't have enough information to build this, please respond with a list of questions you need answered to build this, that answer should look like:
// { "action": "ASK_QUESTIONS_FOR_CONTEXT", "payload": [] }


const promptTemplateQuestionaireIfNoContext = () => {
    let prompt = `\nIf you don't have enough information to build this, please respond with a list of questions you need answered to build this, in JSON format, that answer should look like:`;
    prompt += `\n{ "action": "ASK_QUESTIONS_FOR_CONTEXT", "payload": [] }\n\n`;
    return prompt;
};

const selectorQuestionaire = () => {
    return document.querySelector('#documan-questionaire');
};

const selectorQuestionaireQuestions = () => {
    return document.querySelector('#documan-questionaire-questions');
};

const selectorQuestionaireContext = () => {
    return document.querySelector('#documan-questionaire-context');
};

const selectorQuestionaireSubmit = () => {
    return document.querySelector('#documan-questionaire-submit');
};

const showQuestionaire = () => {
    selectorQuestionaire().style.display = 'block';
};

const hideQuestionaire = () => {
    selectorQuestionaire().style.display = 'none';
};

const openQuestionaire = (questions, done) => {
    let html = '';
    questions.forEach(question => {
        html += `<div class="documan-questionaire-question">${question}</div>`;
    });
    selectorQuestionaireQuestions().innerHTML = html;
    showQuestionaire();
    selectorQuestionaireSubmit().addEventListener('click', () => {
        closeQuestionaireAndUpdateContext();
        done();
    });
    playSound('context_needed')
};

const closeQuestionaireAndUpdateContext = () => {
    const newContext = selectorQuestionaireContext().value;
    // state.context += `\n${newContext}`;
    if (newContext != '') {
        selectorDocumanContextWindow().value = selectorDocumanContextWindow().value + `\n${newContext}`;
        updateShortTermMemory();
    }
    
    hideQuestionaire();
    selectorQuestionaireContext().value = '';
    selectorQuestionaireQuestions().innerHTML = '';
};

const questionaireActions = {
    askQuestionsForContext: (payload, done) => {
        debug('Asking questions for context');
        const questions = payload.payload;
        openQuestionaire(questions, done);
    }
};