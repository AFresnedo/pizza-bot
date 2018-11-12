// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes } = require('botbuilder');

/**
 *
 * Property names for all PizzaBot states
 */
const NEW_USER = 'newUserProperty';
const GREETED_USER = 'greetUserProperty';

class PizzaBot {
  /**
   *
   * @param {ConversationState} conversation state containing convo history
   * @param {UserState} state containing user-specific information
   */
  constructor(conversationState, userState) {
    // Create a boolean to indicate if the user is brand new to the bot
    this.newUserProperty = userState.createProperty(NEW_USER);
    // Add given user state to this PizzaBot instance
    this.userState = userState;
    // Create a boolean to track if a user has been greeted in convo yet
    this.greetProperty = conversationState.createProperty(GREETED_USER);
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
      await turnContext.sendActivity(`You said "${turnContext.activity.text}"`);
    // Perform convo update logic, if that type of event is detected
    } else if (turnContext.activity.type === ActivityTypes.ConversationUpdate) {
      await turnContext.sendActivity('Conversation Updated');
    } else {
      await turnContext.sendActivity(`[${turnContext.activity.type} event detected]`);
    }
    // Save state changes
    await this.conversationState.saveChanges(turnContext);
  }
}

module.exports.PizzaBot = PizzaBot;
