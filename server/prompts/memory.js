((memoryPrompts, { serverState }, { schemas, pleaseFormatInThisSchema }) => {

    memoryPrompts.buildContextUpload = () => {
        let prompt = `Just to refresh your memory here is the context of what I'm talking about. Please confirm you understand with a JSON confirmation response.`;
        prompt += `\n\n${serverState.context.replace('\n', ' ')}\n`
        prompt += pleaseFormatInThisSchema(schemas.confirmation);

        if (prompt.split(' ').length > 4000) {
            throw new Error('Context is too long');
        }

        return prompt;
    };

})(module.exports, require('../state'), require('./schemas'));