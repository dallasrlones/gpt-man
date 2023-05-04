let documentName = '';

const generateDocument = (docType) => {
    // clearRightSideWindowText();
    playSound('document_started');
    playSoundOnRepeat('cafe.mp3', .4);
    playSongOnRepeat('song1.mp3', .3);
    updateShortTermMemory();
    documentName = docType;
    state.parsing_mode = true;
    addToLoopQueue(cereateTitlesOutlineOutOfDocuemntType(docType));
};

const extractDocxText = (docxFile) => {
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


const attachFileUploadListener = async () => {
    selectorDocumanFileUpload().addEventListener("change", async (event) => {

        state.uploading = true;

        playSound('attention_upload_started');

        selectorDocumanCurrentAction().innerText = "Uploading files...";

        const files = event.target.files;

        addToLoopQueue(createModelsAvailablePrompt());

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            let fileContents = '';

            // addToLoopQueue(`I'm going to be sending you a document called ${file.name} in chunks. I'll let you know the progress. 
            // This is so that you can learn more context on what I'm doing. Please only respond with true to this message to keep the token use down.`)

            selectorDocumanCurrentAction().innerText = `Adding to Queue - Uploading ${file.name}...`;

            state.context[file.name] = {
                // { chunk_name: ['item 1','item 2'] }
                chunks: []
            };

            addToLoopQueue(createFileUploadPrompt(file.name));

            // see if it's a pdf or a docx
            if (file.type === "application/pdf") {
                const text = await extractPdfText(file);
                fileContents = text;
            } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                const text = await extractDocxText(file);
                fileContents = text;
            } else if (file.type === "text/plain") {
                // handle plain text files
                fileContents = await file.text();
            }

            // chunk the file into segments of up to 2048 tokens each
            const words = fileContents.split(' ');
            const chunks = [];
            let currentChunk = '';
            for (let j = 0; j < words.length; j++) {
                const word = words[j];
                if (currentChunk.length + word.length + 1 <= 2048) {
                    // add the word to the current chunk
                    if (currentChunk.length > 0) {
                        currentChunk += ' ';
                    }
                    currentChunk += word;
                } else {
                    // start a new chunk
                    chunks.push(currentChunk);
                    currentChunk = word;
                }
            }
            if (currentChunk.length > 0) {
                chunks.push(currentChunk);
            }

            chunks.forEach((chunk, index) => {
                selectorDocumanCurrentAction().innerText = `Adding to Queue - Uploading ${file.name}... ${index + 1} of ${chunks.length}`;
                const chunkPrompt = createChunkPrompt(file.name, index, chunks.length, chunk);
                // const chunkPrompt = `chunk ${index + 1} of ${chunks.length} for ${file.name} \n When you see chunks please only respond with 'true' to let me know you got it. \n ${chunk} \n\n`;
                addToLoopQueue(chunkPrompt);
            });

            addToLoopQueue(createDoneSendingFilePrompt(file.name));
        }
        addToLoopQueue(createCustomActionCompletePrompt('all_context_complete'));
    });
};



