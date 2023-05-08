let promptBuildActionResponse = (action, payload) => {
    let prompt = `{"action":"${action}"`;

    if (payload) {
        for (const key in payload) {
            if (typeof payload[key] === 'object') {
                prompt += `, "${key}": ${JSON.stringify(payload[key])}`;
            } else if(typeof payload[key] === 'string') {
                prompt += `, "${key}": "${payload[key]}"`;
            } else {
                prompt += `, "${key}": ${payload[key]}`;
            }
        }
    }
    prompt += '}';
    return prompt;
};

let promptYourResponseShouldLookLike = (thisResponse) => {
    let prompt = `\n\nYour response should look like this (unless it's a confirmation action then just return confirmation json response) and icnlude JSON:\n${thisResponse}\n${promptTemplateQuestionaireIfNoContext()}`;
    return prompt;
};

let promptYourResponseShouldLookLikeWithoutQuestions = (thisResponse) => {
    let prompt = `\n\nYour response should look like this:\n${thisResponse}\n\n`;
    return prompt;
};

// DOCUMENT CREATION
let promptCreateDocument = (docName) => {
    let prompt = `Hi, I want to create a ${docName}, but I need your help. Please confirm you understand by sending me a JSON formatted confirmation.`;
    prompt += promptYourResponseShouldLookLike(promptBuildActionResponse('CONFIRMATION'));
    return prompt;
};

let promptCreateQuestionsForDocument = (docName) => {
    let prompt = ``;
    prompt += `Please create me a detailed list of questions you need answered to help me write the ${docName} that isn't included in the Chunks.`;
    prompt += promptYourResponseShouldLookLike(promptBuildActionResponse('ASK_QUESTIONS_FOR_CONTEXT', ["questions", "you want", "answered"]));
    return prompt;
};

// {
//     "action":"CREATE_SECTIONS",
//     "title": "Company Overview",
//     "subtitle": "Company History",
//     "payload": [
//     "Founding of the company",
//     "Key milestones in company history",
//     "Significant changes in company direction or leadership",
//     "Company growth and expansion",
//     "Notable partnerships or collaborations",
//     {
//     "title": "Sources",
//     "items": [
//     "Company website",
//     "Press releases",
//     "Media coverage",
//     "Interviews with company executives"
//     ]
//     }
//     ]
// }

let promptTemplateForTitlesAndSubTitles = () => {
    const template = {
        "Title 1 Name": ['Sub Title 1 Name'],
        "Title 2 Name": ['Sub Title 1 Name'],
        "another title name": ['more', 'subtitles']
    };
    return promptBuildActionResponse('CREATE_TITLES_AND_SUBTITLES', { payload: JSON.stringify(template) });
};

let promptCreateTitlesAndSubTitlesForDocument = docName => {
    let prompt = `Please create me a document outline in JSON format for a ${docName}, include all the titles and sub-titles I should talk about, be thorough`;
    prompt += ` and use the information from the chunks I sent you, don't make anything up.`;
    prompt += ` Please don't be vague, the more specific you are the better I can write, nothing like "Title 1" or "Competitor 1" but instead be descriptive.`;
    prompt += promptYourResponseShouldLookLike(promptTemplateForTitlesAndSubTitles());
    return prompt;
};

let promptTemplateSectionsForSubTitle = (title, subtitle) => {
    let template = ['Section Topic 1', 'Section Topic 2', 'Section Topic 3', 'Section Topic 17'];
    return promptBuildActionResponse('CREATE_SECTIONS', { title, subtitle, payload: template });
};

let promptCreateSectionsForSubTitle = (title, subtitle) => {
    let prompt = `Please create me an outline for the ${title} - ${subtitle} sections in JSON format and be thorough.`;
    prompt += ` Please use the information from the chunks I sent you and don't make anything up.`;
    prompt += ` Please don't be vague, the more specific you are the better I can write, nothing like "Title 1" or "Competitor 1" but instead be descriptive.`;
    prompt += ` We'll be using these as blueprints later to write talking points with these sections.`;
    prompt += promptYourResponseShouldLookLike(promptTemplateSectionsForSubTitle(title, subtitle));
    return prompt;
};

let promptTemplateTopicsForSection = (title, subtitle, section) => {
    let template = ['Section Talking Point 1', 'Talking Point 2', 'Talking Point 3', 'Talkign Point 7'];
    return promptBuildActionResponse('CREATE_TALKING_POINTS', { title, subtitle, section, payload: template });
};

let promptCreateTopicsForSection = (title, subtitle, section) => {
    // know that I will be using these as blueprints to write paragraphs with these later so think of each talking point as a paragraph
    let prompt = `Please write me the ${title} - ${subtitle} - ${section} talking points for me in JSON format, be thorough`;
    prompt += ` and use the information from the chunks I sent you, don't make anything up.`;
    prompt += ` Please don't be vague, the more specific you are the better I can write. Don't write anything like "Title 1" or "[Competitor 1]" or "Feature 1", but instead be very descriptive and get your information from the Chunks.`;
    prompt += ` We'll be using these as blueprints later to write paragraphs with these talking points, so think of each talking point as a paragraph.`;
    prompt += ` Once these are done I can start writinng the document by going through each title - subtitle - section - and then talking points`;
    prompt += promptYourResponseShouldLookLike(promptTemplateTopicsForSection(title, subtitle, section));
    return prompt;
};

// UTILS

let promptCreateActionComplete = () => {
    let prompt = `Please fix this JSON for me ${promptBuildActionResponse('ACTION_COMPLETE')}}`;
    return prompt;
};

let promptCreateCouldntUnderstandAnswer = () => {
    let prompt = `That was a great answer! But, I couldn't JSON.parse that, can you please try again and try to format it based on the schema provided in the question.`;
    prompt += ` If you were confirming something please return the { "action": "CONFIRMATION" } JSON response.`;
    prompt += ` If you were trying to ask me a question because you don't have enough information please use the { "action": "ASK_QUESTIONS_FOR_CONTEXT", "payload": ["questions", "to", "ask"] } JSON response.`;
    prompt += ` Please only select one of the action response templates in JSON format for your response.`;
    return prompt;
};

let promptCreateCouldntUnderstandAnswerSchemaMismatch = (action) => {
    const schema = actionMethods[`${action}_SCHEMA_TEMPLATE`]();
    let prompt = ` That was a great answer but it didn't match the schema I wanted, please try again and try to format it based on the schema provided in the question.`;
    prompt += ` Your answer should be formatted in this schema:\n${schema}\n\n`;
    return prompt;
};

// MEMORY CREATION / UPLOAD

let promptCreateUpdateMemory = (chunkSize) => {
    let prompt = `I'm going to be sending you ${chunkSize + 1} chunks of information to refresh your context of what I'm trying to do. Please confirm you understand by sending me a JSON confirmation response.`;
    prompt += promptYourResponseShouldLookLikeWithoutQuestions(promptBuildActionResponse('CONFIRMATION'));
    return prompt;
};

let promptCreateUploadMemory = (i, size, chunk) => {
    let prompt = `I'm going to be sending you ${size + 1} chunks of information to refresh your context of what I'm trying to do. Here is Chunk ${i} of ${size} of what I'm sending you, when you've read it please send me a CONFIRMATION response formatted in JSON.`;
    prompt += promptYourResponseShouldLookLikeWithoutQuestions(promptBuildActionResponse('CONFIRMATION'));
    prompt += `\n\n${chunk}\n\n`;
    return prompt;
};