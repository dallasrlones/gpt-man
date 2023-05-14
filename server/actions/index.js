((actionsService, { serverState }, { prompts }, { addToQueue }, { updateOutline }) => {

    actionsService.refreshContext = () => {
        return { success: true, action: "REFRESH_CONTEXT", question: prompts.buildContextUpload() }
    };

    actionsService['CONFIRMATION'] = (_payload, done) => {
        done();
    };

    actionsService['CREATE_DOCUMENT_SMALL'] = (payload, done) => {
        const { documentName } = payload.payload;
        serverState.outline[documentName] = {};
        updateOutline();
        addToQueue({ action: 'CREATE_DOCUMENT', question: prompts.createDocument(documentName) });
        addToQueue({ action: 'REFRESH_CONTEXT', question: prompts.buildContextUpload() });
        addToQueue({ action: 'CREATE_TITLES_AND_SUBTITLES_SMALL', question: prompts.createTitlesAndSubtitlesSmall(documentName) });
        done();
    };

    actionsService['CREATE_DOCUMENT_MEDIUM'] = (payload, done) => {
        const { documentName } = payload.payload;
        serverState.outline[documentName] = {};
        updateOutline();
        addToQueue({ action: 'CREATE_DOCUMENT', question: prompts.createDocument(documentName) });
        addToQueue({ action: 'REFRESH_CONTEXT', question: prompts.buildContextUpload() });
        addToQueue({ action: 'CREATE_TITLES_AND_SUBTITLES_MEDIUM', question: prompts.createTitlesAndSubtitlesMedium(documentName) });
        done();
    };

    actionsService['CREATE_DOCUMENT_LARGE'] = (payload, done) => {
        const { documentName } = payload.payload;
        serverState.outline[documentName] = {};
        updateOutline();
        addToQueue({ action: 'CREATE_DOCUMENT', question: prompts.createDocument(documentName) });
        addToQueue({ action: 'REFRESH_CONTEXT', question: prompts.buildContextUpload() });
        addToQueue({ action: 'CREATE_TITLES_AND_SUBTITLES_LARGE', question: prompts.createTitlesAndSubtitlesLarge(documentName) });
        done();
    };


    actionsService['CREATE_TITLES_AND_SUBTITLES_SMALL'] = (payload, done) => {
        // serverState.outline = { ...serverState.outline, ...payload } we need to make it { blah: { blah: [] }}
        const titles = Object.keys(payload.payload);
        serverState.outline = { ...serverState.outline }
        titles.forEach(title => {
            const subtitles = payload.payload[title];
            serverState.outline[title] = {};
            subtitles.forEach(subtitle => {
                // titles, subs, sections which are the paragraphs
                serverState.outline[title][subtitle] = '';
                addToQueue({ action: 'CREATE_SECTIONS_FOR_SUBTITLE_SMALL', question: prompts.createSectionsSmall(title, subtitle)});
            });
        });
        updateOutline();
        done();
    };

    actionsService['CREATE_TITLES_AND_SUBTITLES_MEDIUM'] = (payload, done) => {
        // serverState.outline = { ...serverState.outline, ...payload } we need to make it { blah: { blah: [] }}
        const titles = Object.keys(payload.payload);
        serverState.outline = { ...serverState.outline }
        titles.forEach(title => {
            const subtitles = payload.payload[title];
            serverState.outline[title] = {};
            subtitles.forEach(subtitle => {
                serverState.outline[title][subtitle] = {};
                addToQueue({ action: 'CREATE_SECTIONS_FOR_SUBTITLE_MEDIUM', question: prompts.createSectionsMedium(title, subtitle)});
            });
        });
        updateOutline();
        done();
    };

    actionsService['CREATE_TITLES_AND_SUBTITLES_LARGE'] = (payload, done) => {
        // serverState.outline = { ...serverState.outline, ...payload } we need to make it { blah: { blah: [] }}
        const titles = Object.keys(payload.payload);
        serverState.outline = { ...serverState.outline }
        titles.forEach(title => {
            const subtitles = payload.payload[title];
            serverState.outline[title] = {};
            subtitles.forEach(subtitle => {
                serverState.outline[title][subtitle] = {};
                addToQueue({ action: 'CREATE_SECTIONS_FOR_SUBTITLE_LARGE', question: prompts.createSectionsLarge(title, subtitle)});
            });
        });
        updateOutline();
        done();
    };


    actionsService['CREATE_SECTIONS_FOR_SUBTITLE_SMALL'] = (payload, done) => {
        console.log(payload)
        const { title, subtitle } = payload;
        const section = payload.payload;

        serverState.outline[title][subtitle] = section;
        updateOutline();
        done();
    };

    actionsService['CREATE_SECTIONS_FOR_SUBTITLE_MEDIUM'] = (payload, done) => {
        console.log(payload)
        const { title, subtitle } = payload;
        payload.payload.forEach(section => {
            serverState.outline[title][subtitle][section] = [];
            addToQueue({ action: 'CREATE_TALKING_POINTS_MEDIUM', question: prompts.createTalkingPointsMedium(title, subtitle, section)});
        });
        updateOutline();
        done();
    };

    actionsService['CREATE_SECTIONS_FOR_SUBTITLE_LARGE'] = (payload, done) => {
        console.log(payload)
        const { title, subtitle } = payload;
        payload.payload.forEach(section => {
            serverState.outline[title][subtitle][section] = [];
            addToQueue({ action: 'CREATE_TALKING_POINTS_LARGE', question: prompts.createTalkingPointsLarge(title, subtitle, section)});
        });
        updateOutline();
        done();
    };

    actionsService['CREATE_TALKING_POINTS_MEDIUM'] = (payload, done) => {
        const { title, subtitle, section } = payload;
        serverState.outline[title][subtitle][section] = payload.payload;
        updateOutline();
        done();
    };

    actionsService['CREATE_TALKING_POINTS_LARGE'] = (payload, done) => {
        const { title, subtitle, section } = payload;
        serverState.outline[title][subtitle][section] = payload.payload;
        updateOutline();
        done();
    };


    actionsService['UPDATE_TALKING_POINT'] = (payload, done) => {
        const { title, subtitle, section, talkingPoint, fullText } = payload;
        serverState.outline[title][subtitle][section][talkingPoint] = fullText;
        updateOutline();
        done();
    };

})(module.exports, require('../state'), require('../prompts'), require('../services/queueService'), require('../services/utils'));