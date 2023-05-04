// Extractive summarization



const confirmationModel = `{"confirmation": "I understand"}`;
const chunkSummaryModel = `{"chunk_summary": { "extractive_summary_list: ["",""], "file": "thefilesname.txt" } }`;
const titlesModel = `{"titles":["Title 1","Title 2","Title 3",...]}`;
const titleModel = `{"title":{ "Title 1":{"subtitles":["Subtitle 1","Subtitle 2",...]}}}`;
const subtitleModel = `{"subtitle":{"Title 1":{"Subtitle 1":{"sections":["Topic 1","Topic 2","Topic 3",...]}}}}`;
const sectionModel = `{"section": {"Title 1":{"Subtitle 1":{"Section Topic 1":{"paragraphs":["Topic 1","Topic 2",...]}}}}}`;

const availableModels = [
    confirmationModel,
    chunkSummaryModel,
    titlesModel,
    titleModel,
    subtitleModel,
    sectionModel
].join('\n');

const createPlaySoundPrompt = (sound) => {
    const prompt = `Can you please fix this JSON for me? { "play_sound": "${sound}" }}`;
    return prompt;
};

const createCustomActionCompletePrompt = (action) => {
    const prompt = `Can you please fix this JSON for me? { "${action}": true }}`;
    return prompt;
};

const  createChunkPrompt = (fileName, chunkIndex, totalChunkCount, chunk) => {
    const prompt = `This is chunk ${chunkIndex}/${totalChunkCount} for the file ${fileName}.\nSTART_OF_CHUNK ${chunkIndex}\n${chunk}\nEND_OF_CHUNK ${chunkIndex}\nYour answer should look like this, with the extractive summary list being a list of sentences from the chunk that you want to include in the summary, please keep it as small as possible with no data loss.:\n${chunkSummaryModel}\n\n`;
    return prompt;
};

const createMemoryChunkPrompt = (chunkIndex, totalChunkCount, chunk) => {
    const prompt = `To keep you up to date on the context of what we're working on, here are chunks of context to refresh your memory.\nSTART_OF_CHUNK ${chunkIndex}\n${chunk}\nEND_OF_CHUNK ${chunkIndex}\nPlease respond with a confirmation model. Your answer should look like this:\n${confirmationModel}\n\n`;
    return prompt;
};

const convertString = `Please only return the JSON as your answer, as text, so I can JSON.parse the entire answer easily, also make sure it is valid JSON.`;

const createDidntUnderstandPrompt = () => {
    const prompt = `I couldn't digest that answer in my system, could you please try again using the format of one of these models:\n${availableModels}`;
    return prompt;
};

const createInvalidJsonPrompt = (action) => {
    const prompt = `I couldn't JSON.parse that, could you please try again?`;
    return prompt;
};

const createModelsAvailablePrompt = () => {
    const prompt = `Hi, When I'm talking to you and you answer my questions please respond in JSON format, the first property name is the model name I can digest with. Here is a list of available models that you can format your answers into:\n${availableModels}Please answer with the confirmation model to confirm you understand. Example Answer:\n${confirmationModel}`;
    return prompt;
};

const createSubTitlesOutOfTitlePrompt = (titleName) => {
    const prompt = `Thanks! Please create me a list of all the Sub-Title's for the ${titleName} title in JSON.
    Please refer to the chunks we uploaded earlier in this conversation for all relavent information you might need.

    Example Answer:
    {"title":{ "${titleName}":{"subtitles":["Subtitle 1","Subtitle 2",...]}}}

    Please only return the JSON as your answer, as text, so I can JSON.parse the entire answer easily, also make sure it is valid JSON
    `;
    return prompt;
};

const createSectionsOutOfSubTitlesPrompt = (title, subTitle) => {
    const prompt = `Thanks! Please create me a list of all the Sections for the ${title} - ${subTitle} subtitle in JSON.
    Please refer to the chunks we uploaded earlier in this conversation for all relavent information you might need.

    Example Answer:
    {"subtitle":{"${title}":{"${subTitle}":{"sections":["Topic 1","Topic 2","Topic 3",...]}}}}

    Please only return the JSON as your answer, as text, so I can JSON.parse the entire answer easily, also make sure it is valid JSON
    `;
    return prompt;
};

// {"section":{"${section}":{"paragraphs":["Paragraph 1 Title","Paragraph 2 Title",...]}}}
const createParagraphsOutOfSectionsPrompt = (title, subtitle, section) => {
    const prompt = `Thanks! Please create me a list of all the Paragraphs for the ${title} - ${subtitle} - ${section} section in JSON.
    Please refer to the chunks we uploaded earlier in this conversation for all relavent information you might need.

    Example Answer:

    {"section": {"${title}":{"${subtitle}":{"${section}":{"paragraphs":["Topic 1","Topic 2",...]}}}}}

    Please only return the JSON as your answer, as text, so I can JSON.parse the entire answer easily, also make sure it is valid JSON
    `;
    return prompt;
};

// {"paragraph":{"${paragraph}":{"sentenses":["sentence 1...","sentence 2...", ...]}}}
const createSentencesOutOfParagraphsPrompt = (title, subtitle, section, paragraph) => {
    const prompt = `Thanks! Please write me a list of all the Sentences for the ${title} - ${subtitle} - ${section} - ${paragraph} paragraph in JSON.
    Please remember to cite your sources, this will be a professional business docuent, act as if you're a business lawyer writing this document.
    Please write it in a very professional and advanced manner, yet make sure it's easy to understand for the average person.
    
    Please refer to the chunks we uploaded earlier in this conversation for all relavent information you might need.

    Example Answer:

    {"paragraph":{"${title}":{"${subtitle}":{"${section}":{"${paragraph}":{"sentenses":["sentence 1...","sentence 2...", ...]}}}}}

    Please only return the JSON as your answer, as text, so I can JSON.parse the entire answer easily, also make sure it is valid JSON
    `;
    return prompt;
};

// make sure these are all organized within eachother
const cereateTitlesOutlineOutOfDocuemntType = (documentType) => {
    const prompt = `Thanks! Let's talk about the ${documentType} document, can you return me the JSON representation of every Title we should have inside that document? Please return only the JSON in your answer as text so I can parse it easily.
    
    Example Answer:
    {"titles":["Title 1","Title 2","Title 3",...]}
    
    Please only return the JSON as your answer, as text, so I can JSON.parse the entire answer easily, also make sure it is valid JSON
    `;
    return prompt;
};

const createFileCompletePrompt = fileName => {
    const prompt = `I've finished sending you the ${fileName} file.
        Please confirm by responding with confirm model in JSON plaintext so that I can parse your entire answer.
        
        Example Answer:
        {"confirmation": "I've received the ${fileName} file."}

        Please only return the JSON as your answer, as text, so I can JSON.parse the entire answer easily, also make sure it is valid JSON
        `;
    return prompt;
};

const createFileUploadPrompt = fileName => {
    const prompt = `I'm going to be sending you a document called ${fileName} in chunks. I'll let you know the progress.
    Please confirm by responding with confirm model in JSON plaintext so that I can parse your entire answer.
    
    Example Answer:
    {"confirmation": "Ready to upload ${fileName}"}

    Please only return the JSON as your answer, as text, so I can JSON.parse the entire answer easily, also make sure it is valid JSON
    `;
    return prompt;
};

const createDoneSendingFilePrompt = (fileName) => {
    const prompt = `I'm done sending you the file ${fileName}
    
    Please confirm by responding with confirm model in JSON plaintext so that I can parse your entire answer.

    Example Answer:
    {"confirmation": "I've received all of the chunks for the ${fileName} file."}
    `;
    return prompt;
};
