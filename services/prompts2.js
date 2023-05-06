// Here's an outline for the Market Analysis - Market Segmentation sections:

// {"action":"CREATE_SECTIONS", "title": "Market Analysis", "subtitle": "Market Segmentation", "payload": 
// ["Demographic Segmentation", "Geographic Segmentation", "Behavioral Segmentation", "Psychographic Segmentation", "Segmentation Criteria"]}

// Let me kno










const promptBuildActionResponse = (action, payload) => {
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

const promptYourResponseShouldLookLike = (thisResponse) => {
    const prompt = `\n\nYour response should look like this (unless it's a confirmation action then just return confirmation json response) and icnlude JSON:\n${thisResponse}\n${promptTemplateQuestionaireIfNoContext()}`;
    return prompt;
};

const promptYourResponseShouldLookLikeWithoutQuestions = (thisResponse) => {
    const prompt = `\n\nYour response should look like this:\n${thisResponse}\n\n`;
    return prompt;
};

// DOCUMENT CREATION
const promptCreateDocument = (docName) => {
    let prompt = `Hi, I want to create a ${docName}, but I need your help. Please confirm you understand by sending me a JSON formatted confirmation.`;
    prompt += promptYourResponseShouldLookLike(promptBuildActionResponse('CONFIRMATION'));
    return prompt;
};

const promptTemplateForTitlesAndSubTitles = () => {
    const template = {
        "Title 1": ['Sub Title 1', 'Sub Title 2'],
        "Title 2": ['Sub Title 1', 'Sub Title 2']
    };
    return promptBuildActionResponse('CREATE_TITLES_AND_SUBTITLES', { payload: JSON.stringify(template) });
};

const promptCreateTitlesAndSubTitlesForDocument = docName => {
    let prompt = `Please create me a document outline in JSON format for a ${docName}, include all the titles and sub-titles I should talk about. Please use the information from the chunks I sent you.`;
    prompt += promptYourResponseShouldLookLike(promptTemplateForTitlesAndSubTitles());
    return prompt;
};

const promptTemplateSectionsForSubTitle = (title, subtitle) => {
    let template = ['Section Topic 1', 'Section Topic 2', 'Section Topic 3'];
    return promptBuildActionResponse('CREATE_SECTIONS', { title, subtitle, payload: template });
};

const promptCreateSectionsForSubTitle = (title, subtitle) => {
    let prompt = `Please create me an outline for the ${title} - ${subtitle} sections in JSON format. Please use the information from the chunks I sent you.`;
    prompt += promptYourResponseShouldLookLike(promptTemplateSectionsForSubTitle(title, subtitle));
    return prompt;
};

const promptTemplateTopicsForSection = (title, subtitle, section) => {
    let template = ['Section Talking Point 1', 'Talking Point 2', 'Taling Point 3'];
    return promptBuildActionResponse('CREATE_TALKING_POINTS', { title, subtitle, section, payload: template });
};

const promptCreateTopicsForSection = (title, subtitle, section) => {
    // know that I will be using these as blueprints to write paragraphs with these later so think of each talking point as a paragraph
    let prompt = `Please write me the ${title} - ${subtitle} - ${section} talking points for me in JSON format. Please use the information from the chunks I sent you.`;
    prompt += ` We'll be using these as blueprints later to write paragraphs with these talking points.`;
    prompt += promptYourResponseShouldLookLike(promptTemplateTopicsForSection(title, subtitle, section));
    return prompt;
};

// UTILS

const promptCreateActionComplete = () => {
    const prompt = `Please fix this JSON for me ${promptBuildActionResponse('ACTION_COMPLETE')}}`;
    return prompt;
};

const promptCreateCouldntUnderstandAnswer = () => {
    const prompt = `That was a great answer! But, I couldn't JSON.parse that, can you please try again and try to format it based on the question?`;
    return prompt;
};

// MEMORY CREATION / UPLOAD

const promptCreateUpdateMemory = (chunkSize) => {
    let prompt = `I'm going to be sending you ${chunkSize} chunks of information to refresh your context of what I'm trying to do. Please confirm you understand by sending me a JSON confirmation response.`;
    prompt += promptYourResponseShouldLookLikeWithoutQuestions(promptBuildActionResponse('CONFIRMATION'));
    return prompt;
};

const promptCreateUploadMemory = (i, size, chunk) => {
    let prompt = `Here is Chunk ${i} of ${size} of what I'm sending you, when you've read it please send me a confirmation response formatted in JSON.`;
    prompt += promptYourResponseShouldLookLikeWithoutQuestions(promptBuildActionResponse('CONFIRMATION'));
    prompt += `\n\n${chunk}\n\n`;
    return prompt;
};