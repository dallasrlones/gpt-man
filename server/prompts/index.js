((promptsService, documentPrompts, memoryPrompts) => {

    promptsService.prompts = { ...documentPrompts, ...memoryPrompts };

})(
    module.exports,
    require('./documents'),
    require('./memory')
);