((schemaService) => {

    const pleaseFormatInThisSchema = (schema) => {
        let prompt = `Please format your answer in this JSON schema and make sure it fits in the token limit:`;
        prompt += `${schema}`;
        return prompt;
    };

    schemaService.pleaseFormatInThisSchema = pleaseFormatInThisSchema;

    schemaService.schemas = {
        titlesAndSubtitlesSmall: '\n{ "action": "CREATE_TITLES_AND_SUBTITLES_SMALL", "payload": { "Title Names": ["Subtitle Names"], "More Title Names": ["All Subtitles", "For This Title"] } }\n\n',
        titlesAndSubtitlesMedium: '\n{ "action": "CREATE_TITLES_AND_SUBTITLES_MEDIUM", "payload": { "Title Names": ["Subtitle Names"], "More Title Names": ["All Subtitles", "For This Title"] } }\n\n',
        titlesAndSubtitlesLarge: '\n{ "action": "CREATE_TITLES_AND_SUBTITLES_LARGE", "payload": { "Title Names": ["Subtitle Names"], "More Title Names": ["All Subtitles", "For This Title"] } }\n\n',
        
        sectionsSmall: (title, subtitle) => (`\n{ "action": "CREATE_SECTIONS_FOR_SUBTITLE_SMALL", "title": "${title}", "subtitle": "${subtitle}", "payload": "A detailed few paragraphs about the section" }\n\n`),
        sectionsMedium: (title, subtitle) => (`\n{ "action": "CREATE_SECTIONS_FOR_SUBTITLE_MEDIUM", "title": "${title}", "subtitle": "${subtitle}", "payload": ["Section pagraphs in great detail", ...] }\n\n`),
        sectionsLarge: (title, subtitle) => (`\n{ "action": "CREATE_SECTIONS_FOR_SUBTITLE_LARGE", "title": "${title}", "subtitle": "${subtitle}", "payload": ["Section Topic", ...] }\n\n`),
        
        talkingPointsMedium: (title, subtitle, section) => (`\n{ "action": "CREATE_TALKING_POINTS", "title": "${title}", "subtitle": "${subtitle}", section: "${section}": payload: ["Section's talking point topic.", ...] }\n\n`),
        talkingPointsLarge: (title, subtitle, section) => (`\n{ "action": "CREATE_TALKING_POINTS", "title": "${title}", "subtitle": "${subtitle}", section: "${section}": payload: ["Section's talking point topic.", ...] }\n\n`),
        
        updatedTalkingPoint: '\n{ "action": "UPDATE_TALKING_POINT", "old_talking_point": "the old talking point", "payload": "The fully written section for this talking point" }\n\n',
        confirmation: '\n{ "action": "CONFIRMATION" }\n\n',
        questionsForContext: '\n{ "action": "QUESTIONS_NEEDED", "payload": ["question 1", ...] }\n\n',
    };

})(module.exports);