// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes } = require('botbuilder');
const { ChoicePrompt, DialogSet, WaterfallDialog } = require('botbuilder-dialogs');

//
// Property names for all PizzaBot states... why are these global constants? Is it wet otherwise?
//
const NEW_USER = 'recurringUserProperty';
const TURN_COUNT = 'turnCountProperty';
const DIALOG_STATE = 'dialogStateProperty';
const ORDER = 'orderProperty';

//
// Prompt names for all dialog prompts... why are these global constants? Is it wet otherwise?
//
const CHOOSE_PIZZA_TYPE_PROMPT = 'choosePizzaTypePrompt';
const CHOOSE_TOPPINGS_PROMPT = 'chooseToppingsPrompt';

//
// TODO remove from global scope, only used once: Prompt options
//
const SIZE_CHOICES = ['small', 'medium', 'large'];
const CRUST_CHOICES = ['regular', 'thin'];
const TOPPINGS_CHOICES = ['cheese', 'pepperoni', 'meaty', 'hawaiian'];

//
// Default values for objects stored in state
//
const ORDER_DEFAULT = { size: null, crust: null, toppings: null };

class PizzaBot {
    /**
     *
     * @param {ConversationState} conversation state containing convo history
     * @param {UserState} state containing user-specific information
     */
    constructor(conversationState, userState) {
        // Add given conversation state to this PizzaBot instance
        this.conversationState = conversationState;
        // Create an integer to track message-based-turn count
        this.turnCountProperty = conversationState.createProperty(TURN_COUNT);
        // Create current state of pizza order (storage and access interface)
        this.orderProperty = conversationState.createProperty(ORDER);

        // Add given user state to this PizzaBot instance
        this.userState = userState;
        // Create a boolean to indicate if the user is brand new to the bot
        this.recurringUserProperty = userState.createProperty(NEW_USER);
        // TODO create a userState property with order history

        // Create a dialog state property (provides Accessor used by DialogSet)
        // for more information, refer to:
        // https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-dialog-state?view=azure-bot-service-4.0
        this.dialogState = this.conversationState.createProperty(DIALOG_STATE);
        // Create dialog set (data structure for storing and "active"ating dialogs)
        this.dialogs = new DialogSet(this.dialogState);
        // Define and add prompts available to the bot, for more information refer to:
        // https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-prompts?view=azure-bot-service-4.0&tabs=csharp
        // Choice prompt ChoicesFactory https://github.com/Microsoft/botbuilder-js/blob/master/libraries/botbuilder-dialogs/src/choices/choiceFactory.ts
        this.dialogs.add(new ChoicePrompt(CHOOSE_PIZZA_TYPE_PROMPT));
        this.dialogs.add(new ChoicePrompt(CHOOSE_TOPPINGS_PROMPT));
        // TODO Define and add steps (filled-in prompts) for waterfall
        async pickCrust(step) {
            'what crust do you want?'
        }
        // TODO Define and add ordering waterfall
        this.dialogs.add(new WaterfallDialog(ORDER_PIZZA, [
            this.pickCrust.bind(this),
            this.pickToppings.bind(this)
        ]));
        // TODO create a dialog for toppings, for ordering dialog

    }
    /**
     *
     * @param {TurnContext} on turn context object.
     */
    // TODO repeat the topping dialog
    // https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-concept-dialog?view=azure-bot-service-4.0
    // has a loop step example:
    // https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-dialog-manage-complex-conversation-flow?view=azure-bot-service-4.0&tabs=javascript
    // onTurn is often referred to as the bot turn handler in the docs
    async onTurn(turnContext) {
        // Perform message handling logic, if that type of event is detected
        if (turnContext.activity.type === ActivityTypes.Message) {
            // Echo the user, with the turn count included
            await turnContext.sendActivity(`Turn ${count}: You said "${turnContext.activity.text}"`);
        // Perform convo update logic, if that type of event is detected
        } else if (turnContext.activity.type === ActivityTypes.ConversationUpdate) {
            // Identify if a user is new to the bot and, if so, mark them as no longer new
            const previousUser = await this.recurringUserProperty.get(turnContext);
            if (!previousUser) {
                await this.recurringUserProperty.set(turnContext, true);
            }
            // For every member in conversation: welcome them, if they just joined
            for (let e of turnContext.activity.membersAdded) {
                // TODO prompt with first time welcome msg, if user's first time in convo
                if (!previousUser && (e.id !== turnContext.activity.recipient.id)) {
                    await turnContext.sendActivity(`Welcome ${e.name}! Since this is your first `
                        + 'time using this bot, feel free to type "help" for a quick introduction.')
                }
                // Else greet them, if they are joining the conversation
                // NOTE that this conditional relies on "join channel" conversationUpdate activity
                // not being sent to the member joining the channel
                else if (e.id !== turnContext.activity.recipient.id) {
                  await turnContext.sendActivity(`Greetings ${e.name}!`);
                }
                else {
                    await turnContext.sendActivity('Unhandled Conversation Update Detected');
                }
            }
        } else if (turnContext.activity.type === ActivityTypes.DeleteUserData) {
          // The delete data request removes "recurring user" marker
          await this.recurringUserProperty.set(turnContext, false);
          await turnContext.sendActivity('Next user is now considered a new user');
        } else {
            await turnContext.sendActivity(`[${turnContext.activity.type} event detected]`);
        }
    }
}

module.exports.PizzaBot = PizzaBot;
