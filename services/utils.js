const attemptToProcessJSONAnswer = (answer) => {
    debug('Attempting to process JSON answer')
    try {
        const firstOpenBracket = answer.indexOf('{');
        const lastCloseBracket = answer.lastIndexOf('}');

        const subStringFromOpenAndCloseBracket = answer.substring(firstOpenBracket, lastCloseBracket + 1);

        const numberOfOpeningBrackets = subStringFromOpenAndCloseBracket.split('{').length;
        const numberOfClosingBrackets = subStringFromOpenAndCloseBracket.split('}').length;

        if (numberOfOpeningBrackets > numberOfClosingBrackets) {
            debug('Number of opening brackets is greater than number of closing brackets')
            playSound('error.mp3');
            let bracketString = '}';
    
            for (let i = 0; i < numberOfOpeningBrackets - numberOfClosingBrackets; i++) {
                debug('Adding closing bracket')
                bracketString += '}';
            }
    
            const parsedAnswer = JSON.parse(subStringFromOpenAndCloseBracket + bracketString);
            return parsedAnswer;
        }
    
        if (numberOfOpeningBrackets < numberOfClosingBrackets) {
            debug('Number of opening brackets is less than number of closing brackets')
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
        debug('Could not parse JSON answer')
        state.last_error = err;
        addToErrorCount();
        return false;
    }
};

const formatDocIfExists = () => {
    debug('Formatting doc if exists')
    if (Object.keys(state.outline).length > 0) {
        let markdownString = '';        
        Object.keys(state.outline).forEach(title => {
            markdownString += `# ${title}\n\n`;
            const subtitles = state.outline[title];
            Object.keys(subtitles).forEach(subtitle => {
                markdownString += `## ${subtitle}\n\n`;
                const sections = subtitles[subtitle];
                Object.keys(sections).forEach(section => {
                    markdownString += `### ${section}\n\n`;
                    const paragraphs = sections[section];
                    Object.keys(paragraphs).forEach(paragraph => {
                        markdownString += `${paragraphs[paragraph]}\n\n`;
                    });
                });
            });
        });

        var md = window.markdownit();
        markdownString = md.render(markdownString);
        selectorDocument().innerHTML = markdownString;
    }
};

const gatherAndOrderTalkingPoints = () => {
    debug('Gathering and ordering talking points')
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
    debug('Saving digested summary')
    // get all of state.context and loop through each file and using a reduce to create one array of talking points (chunks)
    talkingPoints = gatherAndOrderTalkingPoints();

    state.uploading = false;
    state.context_talking_points = talkingPoints;
    // downloadTxt(talkingPoints.join('\n'));
    playSound('context_complete')
};

const setQueueLengthAndEta = () => {
    // display s for seconds or m for minutes or h for hours or d for days depending on the intervalSpeed which is set in seconds
    // each item in the queue is itterates on intervalSpeed
    debug('Setting queue length and ETA')
    let etaString = '';
    if (state.queue.length > 0) {
        const eta = state.queue.length * (state.loopIntervalSpeed / 1000);
        if (eta < 60) {
            etaString = `${eta.toFixed(0)}s`;
        } else if (eta < 3600) {
            etaString = `${(eta / 60).toFixed(0)}m ${((eta / 60).toFixed(0) / 60).toFixed(0) }s`;
        } else if (eta < 86400) {
            etaString = `${(eta / 3600).toFixed(0)}h ${((eta / 3600).toFixed(0) / 60).toFixed(0) }m`;
        } else {
            etaString = `${(eta / 86400).toFixed(0)}d ${((eta / 86400).toFixed(0) / 24).toFixed(0) }h ${(((eta / 86400).toFixed(0) / 24).toFixed(0) / 60).toFixed(0) }m ${((((eta / 86400).toFixed(0) / 24).toFixed(0) / 60).toFixed(0) / 60).toFixed(0) }s`;
        }

        // if its empty return 0s
    } else {
        etaString = '0s';
    }

    selectorDocumanPercentageDone().innerText = `${state.queue.length}  Items in Queue. Minimum ETA: ${etaString}`;
};

const extractDocxText = (docxFile) => {
    debug('Extracting docx text')
    return new Promise((resolve, reject) => {

        console.log(docxFile.name)

        const doc = new Document(docxFile);
        if (!doc || !doc.body) {
            reject(new Error('Invalid docx file'));
            return;
        }
        let text = '';
        doc.body.forEach((element) => {
            if (element instanceof Paragraph) {
                text += element.text;
            }
        });
        resolve(text);
    });
};

const extractPdfText = (pdfFile) => {
    debug('Extracting PDF text')
    return new Promise((resolve, reject) => {
        const loadingTask = window.pdfjsLib.getDocument(pdfFile);
        loadingTask.promise.then((pdf) => {
            console.log('pdf', pdf);
            let text = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                pdf.getPage(i).then((page) => {
                    page.getTextContent().then((content) => {
                        const strings = content.items.map((item) => item.str);
                        text += strings.join(' ');
                        if (i === pdf.numPages) {
                            resolve(text);
                        }
                    }).catch((error) => {
                        reject(error);
                    });
                }).catch((error) => {
                    reject(error);
                });
            }
        }).catch((error) => {
            reject(error);
        });
    });
};