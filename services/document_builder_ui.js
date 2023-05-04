const adjustMainElementWidth = () => {
    mainElement().style.width = "60%";
};

const createBusinessDocumentInput = () => {
    const input = document.createElement("input");
    input.type = "text";
    input.style.position = "fixed";
    input.style.bottom = "50px";
    input.style.right = "10px";
    input.style.width = "30%";
    input.style.background = "rgb(117 117 117 / 18%)";
    input.style.padding = "15px";
    input.style.borderRadius = "10px";
    input.style.border = "1px solid #36363d";
    input.style.boxShadow = "0 0 2px #262626 inset";
    input.placeholder = "Type the document you want to create here";
    input.id = "document_type_input";
    return input;
};

const createRightSideWindowElements = () => {
    const rightSideWindow = document.createElement("div");
    rightSideWindow.style.position = "fixed";
    rightSideWindow.style.top = "0";
    rightSideWindow.style.right = "0";
    rightSideWindow.style.width = "30%";
    rightSideWindow.style.height = "80%";
    rightSideWindow.style.background = "rgb(117 117 117 / 18%)";
    rightSideWindow.style.padding = "15px";
    rightSideWindow.style.borderRadius = "0px 0px 0px 10px";
    rightSideWindow.style.border = "1px solid #36363d";
    rightSideWindow.style.boxShadow = "0 0 2px #262626 inset";
    rightSideWindow.id = "right_side_window";

    return rightSideWindow;
};

const createRideSideWindowText = () => {
    // create a textarea element called right-side-window-text
    const rightSideWindowText = document.createElement("textarea");

    rightSideWindowText.style.width = "100%";
    rightSideWindowText.style.height = "100%";
    rightSideWindowText.style.background = "#ffffff";
    rightSideWindowText.style.padding = "15px";
    rightSideWindowText.style.borderRadius = "10px";
    rightSideWindowText.style.border = "1px solid #ffffff";
    rightSideWindowText.style.boxShadow = "0 0 2px #ffffff inset";
    rightSideWindowText.style.fontSize = "10px";
    rightSideWindowText.style.lineHeight = "12px";
    rightSideWindowText.style.color = "#1d1d1d";
    rightSideWindowText.style.overflowY = "scroll";
    rightSideWindowText.style.resize = "none";
    rightSideWindowText.value = "This is where your document will be generated.";

    rightSideWindowText.id = "right_side_window_text";
    return rightSideWindowText;
};

const createRightSideFileUpload = () => {
    const rightSideFileUpload = document.createElement("input");
    rightSideFileUpload.type = "file";
    rightSideFileUpload.style.position = "fixed";
    rightSideFileUpload.style.bottom = "120px";
    rightSideFileUpload.style.right = "30px";
    rightSideFileUpload.style.padding = "15px";
    rightSideFileUpload.multiple = true;
    rightSideFileUpload.id = "right_side_file_upload";
    return rightSideFileUpload;
};

const createRightSideSubmitButton = () => {
    const rightSideSubmitButton = document.createElement("button");
    rightSideSubmitButton.style.position = "fixed";
    rightSideSubmitButton.style.bottom = "135px";
    rightSideSubmitButton.style.right = "30px";
    rightSideSubmitButton.style.padding = "5px";
    rightSideSubmitButton.style.borderRadius = "10px";
    rightSideSubmitButton.style.border = "1px solid #36363d";
    rightSideSubmitButton.style.boxShadow = "0 0 2px #262626 inset";
    rightSideSubmitButton.style.background = "#ffffff";
    rightSideSubmitButton.style.color = "#1d1d1d";
    rightSideSubmitButton.style.fontSize = ".6em";
    rightSideSubmitButton.innerText = "Generate Document";
    rightSideSubmitButton.id = "right_side_window_submit";

    // add event listner to it
    rightSideSubmitButton.addEventListener("click", (e) => {
        const documentType = businessTypeInput().value;
        businessTypeInput().value = "";
        generateDocument(documentType);
    });

    return rightSideSubmitButton;
};

const appendToRightSideWindowText = (text) => {
    rightSideWindowText().value += text;
};

const clearRightSideWindowText = () => {
    rightSideWindowText().value = "";
};

const checkForMainWidthAndAdjustIfNecessary = () => {
    if (mainElement().style.width !== "60%") {
        adjustMainElementWidth();
    }
};

const checkAndAttachBusinessTypeInput = () => {
    if (!businessTypeInput()) {
        // add the input to the DOM
        rightSideWindowElement().appendChild(createBusinessDocumentInput());
    }
};

const checkAndAttachRightSideWindow = () => {
    if (!rightSideWindowElement()) {
        // add the right side window to the DOM
        gptInput().parentNode.insertBefore(createRightSideWindowElements(), gptInput());
        // rightSideWindowElement().parentNode.insert(createRideSideWindowText());
        // insert the right side window text into the right side window
        rightSideWindowElement().appendChild(createRideSideWindowText());
    }
};

const checkAndAttachRightSideSubmitButton = () => {
    if (!rightSideSubmitButton()) {
        // add the submit button to the DOM
        rightSideWindowElement().appendChild(createRightSideSubmitButton());
    }
};

const checkForInputElementsAndCreateIfMissing = () => {
    if (gptInput()) {
        checkAndAttachRightSideWindow();
        checkAndAttachRightSideFileUpload();
        checkAndAttachBusinessTypeInput();
        checkForMainWidthAndAdjustIfNecessary();
        checkAndAttachRightSideSubmitButton();
    }
};

const checkAndAttachRightSideFileUpload = () => {
    if (!rightSideFileUpload()) {
        rightSideWindowElement().appendChild(createRightSideFileUpload());
        attachRightSideFileUploadEventListner();
    }
};