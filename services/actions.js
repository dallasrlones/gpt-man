const actionMethods = {
    'context_summary_complete': (_payload, done) => {
        debug('Context summary complete');
        playSound('stand_by_upload_complete')
        done();
    },

    'all_context_complete': (_payload, done) => {
        debug('All context complete');
        saveDigestedSummary();
        done();
    },

    'chunk_summary': (payload, done) => {
        debug('Chunk summary complete');
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
        debug('confirmation received');
        // display to the user the chunk progress
        // rightSideWindowText().value = payload.confirmation;
        done();
    },

    'CONFIRMATION_SCHEMA_MATCHES': (incomingPayload) => {
        let matches = true;

        if (!incomingPayload['CONFIRMATION']) {
            matches = false;
        }

        return matches;
    },

    'CONFIRMATION': (payload, done) => {
        debug('Confirmation received')
        // display to the user the chunk progress
        // rightSideWindowText().value = payload.confirmation;
        done();
    },

    'MEMORY_UPLOAD_COMPLETE_SCHEMA_MATCHES': (incomingPayload) => {
        let matches = true;

        if (!incomingPayload['CONFIRMATION']) {
            matches = false;
        }

        return matches;
    },
    'MEMORY_UPLOAD_COMPLETE': (_payload, done) => {
        debug('Memory upload complete');
        state.uploading = false;
    },


    'PLAY_SOUND': (payload, done) => {
        debug(`Playing sound ${payload.payload}`)
        playSound(payload.payload);
        done();
    },
    'CREATE_TITLES_AND_SUBTITLES_SCHEMA_MATCHES': (incomingPayload) => {
        // make sure there is an object in payload.payload with subkeys
        let matches = true;

        Object.keys(payload.payload).forEach(title => {
            if (typeof payload.payload[title] !== 'object') {
                matches = false;
            }

            Object.keys(payload.payload[title]).forEach(subtitle => {
                if (typeof payload.payload[title][subtitle] !== 'object') {
                    matches = false;
                }
            });
        })

        return matches;
    },
    'CREATE_TITLES_AND_SUBTITLES': (payload, done) => {
        setUIState(`creating titles and subtitles`);
        debug('Creating titles and subtitles')
        // { "title 1":  ["Subtitle 1", "Subtitle 2", ...], ... }
        for (const title in payload.payload) {
            addToSpeachQueue(`creating title ${title}`);

            if (state.outline[title]) {
                debug(`Title ${title} already exists`)
                continue;
            }

            state.outline[title] = {};
            for (const subtitle of payload.payload[title]) {
                addToSpeachQueue(`creating subtitle ${subtitle}`);

                if (state.outline[title][subtitle]) {
                    debug(`Subtitle ${subtitle} already exists`)
                    continue;
                }

                state.outline[title][subtitle] = {};
                state.queue.push(promptCreateSectionsForSubTitle(title, subtitle));
            }
        }

        done();
    },
    'CREATE_SECTIONS_SCHEMA_MATCHES': (incomingPayload) => {
        let matches = true;

        if (!incomingPayload.title || !incomingPayload.subtitle || !incomingPayload.payload) {
            matches = false;
        }

        if (!Array.isArray(incomingPayload.payload)) {
            matches = false;
        }

        return matches;
    },
    'CREATE_SECTIONS': (payload, done) => {
        debug('Creating sections')
        // { "title": "Title 1", "subtitle": "Subtitle 1", "payload": ["Section 1", "Section 2", ...] }
        const { title, subtitle } = payload;
        const sections = payload.payload;

        setUIState(`creating sections for ${title} - ${subtitle}`);
        addToSpeachQueue(`creating sections for ${title} - ${subtitle}`)

        if (!state.outline[title]) {
            debug(`Creating title ${title}`)
            state.outline[title] = {};
        } else if (!state.outline[title][subtitle]) {
            debug(`Creating subtitle ${subtitle}`)
            state.outline[title][subtitle] = {};
        }

        for (const section of sections) {
            debug(`Creating section ${section}`)
            addToSpeachQueue(`creating section ${section}`);

            if (state.outline[title][subtitle][section]) {
                debug(`Section ${section} already exists`)
                continue;
            }

            state.outline[title][subtitle][section] = [];
            state.queue.push(promptCreateTopicsForSection(title, subtitle, section));
        }

        done();
    },
    'CREATE_TALKING_POINTS_SCHEMA_MATCHES': (incomingPayload) => {
        let matches = true;

        if (!incomingPayload.title || !incomingPayload.subtitle || !incomingPayload.section || !incomingPayload.payload) {
            matches = false;
        }

        if (!Array.isArray(incomingPayload.payload)) {
            matches = false;
        }

        return matches;
    },
    'CREATE_TALKING_POINTS': (payload, done) => {
        debug('Creating talking points')
        // { "title": "Title 1", "subtitle": "Subtitle 1", "section": "Section 1", "payload": ["Talking Point 1", "Talking Point 2", ...] }
        const { title, subtitle, section } = payload;
        const talkingPoints = payload.payload;

        setUIState(`creating talking points for ${title} - ${subtitle} - ${section}`);
        addToSpeachQueue(`creating talking points for ${title} - ${subtitle} - ${section}`)

        if (!state.outline[title]) {
            debug(`Creating title ${title}`)
            state.outline[title] = {};
        } else if (!state.outline[title][subtitle]) {
            debug(`Creating subtitle ${subtitle}`)
            state.outline[title][subtitle] = {};
        } else if (!state.outline[title][subtitle][section]) {
            debug(`Creating section ${section}`)
            state.outline[title][subtitle][section] = [];
        }

        for (const talkingPoint of talkingPoints) {
            addToSpeachQueue(`Creating talking point. ${talkingPoint}`);
            debug(`Creating talking point ${talkingPoint}`)
            state.outline[title][subtitle][section].push(talkingPoint);
        }

        done();
    },
    'ACTION_COMPLETE': (payload, done) => {
        debug('Action complete')
        playSound('document_complete')
        done();
    },
    'CREATE_DOCUMENT': (payload, done) => {
        debug('Creating document')
        done();
    },
    'CREATE_PARAGRAPH': (payload, done) => {
        debug('Creating paragraph')
        done();
    },
    'ASK_QUESTIONS_FOR_CONTEXT_SCHEMA_MATCHES': (incomingPayload) => {
        let matches = true;

        if (!incomingPayload.questions) {
            matches = false;
        }

        if (!Array.isArray(incomingPayload.questions)) {
            matches = false;
        }

        return matches;
    },
    'ASK_QUESTIONS_FOR_CONTEXT': questionaireActions.askQuestionsForContext
};