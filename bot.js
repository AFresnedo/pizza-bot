// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes } = require('botbuilder');

/**
 *
 * Property names for all PizzaBot states
 */
const TURN_COUNTER_PROPERTY = 'turnCounterProperty';
const WELCOMED_USER = 'welcomedUserProperty';

class PizzaBot {
  /**
   *
   * @param {ConversationState} conversation state object
   * @param {UserState} state containing user-specific information
   */
  constructor(conversationState) {
    // Create a turn counter property and add it to given conversation state
    this.countProperty = conversationState.createProperty(TURN_COUNTER_PROPERTY);
    // Create a property to track if a user has been greeted
    this.welcomedProperty = conversationState.createProperty(WELCOMED_USER);
    // Add given conversation state to this PizzaBot instance
    this.conversationState = conversationState;
  }
  /**
   *
   * @param {TurnContext} on turn context object.
   */
  async onTurn(turnContext) {
    // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
    if (turnContext.activity.type === ActivityTypes.Message) {
      // read from state.
      let count = await this.countProperty.get(turnContext);
      count = count === undefined ? 1 : ++count;
      await turnContext.sendActivity(`${count}: You said "${turnContext.activity.text}"`);
      // increment and set turn counter.
      await this.countProperty.set(turnContext, count);
    } else {
      await turnContext.sendActivity(`[${turnContext.activity.type} event detected]`);
    }
    // Save state changes
    await this.conversationState.saveChanges(turnContext);
  }
}

module.exports.PizzaBot = PizzaBot;
