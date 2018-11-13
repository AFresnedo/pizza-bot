// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes } = require('botbuilder');

/**
 *
 * Property names for all PizzaBot states
 */
const NEW_USER = 'newUserProperty';
const TURN_COUNT = 'turnCountProperty';

class PizzaBot {
    /**
     *
     * @param {ConversationState} conversation state containing convo history
     * @param {UserState} state containing user-specific information
     */
    constructor(conversationState, userState) {
        // TODO create a userState property with order history
        // Create a boolean to indicate if the user is brand new to the bot
        this.newUserProperty = userState.createProperty(NEW_USER);
        // Add given user state to this PizzaBot instance
        this.userState = userState;
        // Create an integer to track turn count
        this.turnCountProperty = conversationState.createProperty(TURN_COUNT);
        // Add given conversation state to this PizzaBot instance
        this.conversationState = conversationState;
    }
    /**
     *
     * @param {TurnContext} on turn context object.
     */
    async onTurn(turnContext) {
        // Perform message handling logic, if that type of event is detected
        if (turnContext.activity.type === ActivityTypes.Message) {
            // Get cached property of conversation state relevant to turnContext
            let count = await this.turnCountProperty.get(turnContext)
            // If count is undefined: set to 1, else increment by 1
            count = count === undefined ? 1 : ++count;
            // Echo the user, with the turn count included
            await turnContext.sendActivity(`${count}: You said "${turnContext.activity.text}"`);
            // Set the turn count property with the new value
            await this.turnCountProperty.set(turnContext, count);
        // Perform convo update logic, if that type of event is detected
        } else if (turnContext.activity.type === ActivityTypes.ConversationUpdate) {
            // Identify if a user is new to the bot and, if so, mark them as no longer new
            const isNew = await this.newUserProperty.get(turnContext);
            if (isNew) {
                await this.newUserProperty.set(turnContext, false);
            }
            // For every member in conversation: welcome them, if they just joined
            for (let e of turnContext.activity.membersAdded) {
                // TODO prompt with first time welcome msg, if user's first time in convo
                if (isNew && (e.id !== turnContext.activity.recipient.id)) {
                    await turnContext.sendActivity(`Welcome ${e.name}! Since this is your first `
                        + 'time using this bot, feel free to type "help" for a quick introduction.')
                }
                // Else greet them, if they are joining the conversation
                // NOTE that this conditional relies on "join channel" conversationUpdate activity
                // not being sent to the member joining channel
                else if (e.id !== turnContext.activity.recipient.id) {
                  await turnContext.sendActivity(`Welcome back ${e.name}!`);
                }
                else {
                    await turnContext.sendActivity('Unhandled Conversation Update Detected');
                }
            }
        } else {
            await turnContext.sendActivity(`[${turnContext.activity.type} event detected]`);
        }
    }
}

module.exports.PizzaBot = PizzaBot;
