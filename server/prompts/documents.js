((documentPrompts, { schemas, pleaseFormatInThisSchema }) => {

    documentPrompts.createDocument = (documentName) => {
        let prompt = ``;
        prompt += `Hi, I want to create a ${documentName}, but I need your help, please confirm you understand by sending me a confirmation response in JSON.`;
        prompt += pleaseFormatInThisSchema(schemas.confirmation);
        return prompt;
    };

    documentPrompts.createTitlesAndSubtitlesSmall = (docName) => {
        let prompt = `Please create me an outline in JSON format for writing a ${docName}, include all the titles and sub-titles I should talk about`;
        prompt += ` and use the information from the chunks I sent you, don't make anything up, please note I can only see whats returned in JSON format.`;
        prompt += ` Please don't be vague, the more specific you are the better I can write, do note write "Title 1" or "Competitor 1" but instead be descriptive based on the chunk information.`;
        prompt += ` Please make sure the answer also fits under the token limit.`;
        prompt += pleaseFormatInThisSchema(schemas.titlesAndSubtitlesSmall);
        return prompt;
    };

    documentPrompts.createTitlesAndSubtitlesMedium = (docName) => {
        let prompt = `Please create me an outline in JSON format for writing a ${docName}, include all the titles and sub-titles I should talk about, be thorough`;
        prompt += ` and use the information from the chunks I sent you, don't make anything up, please note I can only see whats returned in JSON format.`;
        prompt += ` Please don't be vague, the more specific you are the better I can write, do note write "Title 1" or "Competitor 1" but instead be descriptive based on the chunk information.`;
        prompt += ` Please make sure the answer also fits under the token limit.`;
        prompt += pleaseFormatInThisSchema(schemas.titlesAndSubtitlesMedium);
        return prompt;
    };

    documentPrompts.createTitlesAndSubtitlesLarge = (docName) => {
        let prompt = `Please create me an outline in JSON format for writing a ${docName}, include all the titles and sub-titles I should talk about, be thorough`;
        prompt += ` and use the information from the chunks I sent you, don't make anything up, please note I can only see whats returned in JSON format.`;
        prompt += ` Please don't be vague, the more specific you are the better I can write, do note write "Title 1" or "Competitor 1" but instead be descriptive based on the chunk information.`;
        prompt += ` Please make sure the answer also fits under the token limit.`;
        prompt += pleaseFormatInThisSchema(schemas.titlesAndSubtitlesLarge);
        return prompt;
    };
    
    documentPrompts.createSectionsSmall = (title, subtitle) => {
        let prompt = `Please write me the section for ${title} - ${subtitle} in JSON format and be thorough,`;
        prompt += ` use the information from the chunks I sent you and don't make anything up, please note I can only see whats returned in JSON format.`;
        prompt += ` Please don't be vague, the more specific you are the better I can write, nothing like "Title 1" or "Competitor 1" but instead be descriptive based on the chunk information.`;
        prompt += ` Note, I can only see whats in the JSON response, also please make sure to use the new line character in payloads to create new lines in the document.`;
        prompt += ` If you're talking about financials or projections cite your sources (if they're not in the chunk data) in the json response, and please make sure the answer also fits under the token limit.`;
        prompt += pleaseFormatInThisSchema(schemas.sectionsSmall(title, subtitle));
        return prompt;
    };

    documentPrompts.createSectionsMedium = (title, subtitle) => {
        let prompt = `Please create me an outline for the ${title} - ${subtitle} - sections in JSON format and be thorough,`;
        prompt += ` use the information from the chunks I sent you and don't make anything up, please note I can only see whats returned in JSON format.`;
        prompt += ` Please don't be vague, the more specific you are the better I can write, nothing like "Title 1" or "Competitor 1" but instead be descriptive based on the chunk information.`;
        prompt += ` We'll be using these as blueprints later to write talking points with these sections.`;
        prompt += ` Please make sure the answer also fits under the token limit.`;
        prompt += pleaseFormatInThisSchema(schemas.sectionsMedium(title, subtitle));
        return prompt;
    };

    documentPrompts.createSectionsLarge = (title, subtitle) => {
        let prompt = `Please create me an outline for the ${title} - ${subtitle} - sections in JSON format and be thorough,`;
        prompt += ` use the information from the chunks I sent you and don't make anything up, please note I can only see whats returned in JSON format.`;
        prompt += ` Please don't be vague, the more specific you are the better I can write, nothing like "Title 1" or "Competitor 1" but instead be descriptive based on the chunk information.`;
        prompt += ` We'll be using these as blueprints later to write talking points with these sections.`;
        prompt += ` Please make sure the answer also fits under the token limit.`;
        prompt += pleaseFormatInThisSchema(schemas.sectionsLarge(title, subtitle));
        return prompt;
    };
    
    documentPrompts.createTalkingPointsMedium = (title, subtitle, section) => {
        let prompt = `Please write me the ${title} - ${subtitle} - ${section} - talking points for me in JSON format, and be thorough,`;
        prompt += ` use the information from the chunks I sent you, don't make anything up, please note I can only see whats returned in JSON format.`;
        prompt += ` Please don't be vague, the more specific you are the better I can write. Don't write anything like "Title 1" or "[Competitor 1]" or "Feature 1", but instead be very descriptive and get your information from the Chunks.`;
        prompt += ` We'll be using these as blueprints later to write paragraphs with these talking points, so think of each talking point as a paragraph.`;
        prompt += ` Once these are done I can start writinng the document by going through each title - subtitle - section - and then talking points so please don't generalize them.`;
        prompt += ` If you're talking about financials or projections cite your sources (if they're not in the chunk data) in the json response, and please make sure the answer also fits under the token limit.`;
        prompt += pleaseFormatInThisSchema(schemas.talkingPointsMedium(title, subtitle, section));
        return prompt;
    };

    documentPrompts.createTalkingPointsLarge = (title, subtitle, section) => {
        let prompt = `Please write me the ${title} - ${subtitle} - ${section} - talking points for me in JSON format, and be thorough,`;
        prompt += ` use the information from the chunks I sent you, don't make anything up, please note I can only see whats returned in JSON format.`;
        prompt += ` Please don't be vague, the more specific you are the better I can write. Don't write anything like "Title 1" or "[Competitor 1]" or "Feature 1", but instead be very descriptive and get your information from the Chunks.`;
        prompt += ` We'll be using these as blueprints later to write paragraphs with these talking points, so think of each talking point as a paragraph.`;
        prompt += ` Once these are done I can start writinng the document by going through each title - subtitle - section - and then talking points so please don't generalize them.`;
        prompt += ` If you're talking about financials or projections cite your sources (if they're not in the chunk data) in the json response, and please make sure the answer also fits under the token limit.`;
        prompt += pleaseFormatInThisSchema(schemas.talkingPointsLarge(title, subtitle, section));
        return prompt;
    };

    documentPrompts.fineTuneTalkingPoint = (title, subtitle, section, talkingPoint, newContext) => {
        let prompt = `Please help me write this talking point for the ${title} - ${subtitle} - ${section} - section:`;
        prompt += `\n${talkingPoint}\n\n`;
        prompt += `And here is the updated context I have for this talking point:`;
        prompt += `\n${newContext}\n\n`;
        prompt += pleaseFormatInThisSchema(schemas.updatedTalkingPoint);
        return prompt;
    };

})(
    module.exports,
    require('./schemas')
)