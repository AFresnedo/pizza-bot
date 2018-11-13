// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes } = require('botbuilder');

/**
 *
 * Property names for all PizzaBot states
 */
const NEW_USER = 'newUserProperty';
const GREETED_USER = 'greetUserProperty';
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
        // Create a boolean to track if a user has been greeted in convo yet
        this.greetProperty = conversationState.createProperty(GREETED_USER);
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
            // TODO determine specifics of what is being read here
            let count = await this.turnCountProperty.get(turnContext)
            // If count is undefined: set to 1, else increment by 1
            count = count === undefined ? 1 : ++count;
            // Echo the user, with the turn count included
            await turnContext.sendActivity(`${count}: You said "${turnContext.activity.text}"`);
            // Set the turn count property with the new value
            await this.turnCountProperty.set(turnContext, count);
        // Perform convo update logic, if that type of event is detected
        } else if (turnContext.activity.type === ActivityTypes.ConversationUpdate) {
            // For every member in conversation: welcome them, if they just joined
            for (let e of turnContext.activity.membersAdded) {
                // TODO prompt with first time welcome msg, if user is a first time user
                if (false) {}
                // Else greet them, if they are simply joining convo
                // NOTE that conditional relies on conversationUpdate activity
                // not being sent to member joining channel
                else if (e.id !== turnContext.activity.recipient.id) {
                    await turnContext.sendActivity('Thanks for coming back!');
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
