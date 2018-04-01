// Description:
//   An autoresponder for people who greet you and then stay quiet.
//
// Dependencies:
//   None
//
// Configuration:
//   HUBOT_AUTORESPONDER_NAME: This the name people usually call you by on slack. (eg: "Hi Charles");
//   HUBOT_AUTORESPONDER_DELAY: How much do you want to wait (in ms) before auto-responding to people. (Default 60000ms)
//
// Commands:
//   No commands. This robot passively listens to DM input.
//
// Notes:
//   None
//
// Author:
//   @lmarkus



const NAME = process.env.HUBOT_AUTORESPONDER_NAME;
const debuglog = require('util').debuglog('SLACK_AUTORESPONDER');
const RESPONSE_DELAY = process.env.HUBOT_AUTORESPONDER_DELAY || 60000;
const GREETINGS = ["hi", "hello", "hey", `hi ${NAME}`, `hello ${NAME}`, `hey ${NAME}`]; // This should probably be an external config
const RESPONSE = `Hi! 👋 \n I'm an auto-responder. It's nice to say hello, but it's better to ask your full question in one shot.`;

module.exports = function (robot) {

  // Basic structure to keep track of ongoing conversations.
  let conversations = {};

  // Who am I?
  let self = robot.adapter.self.id;

  let COMPILED_GREETINGS = GREETINGS.map((greeting) => new RegExp(`^${greeting}$`, 'i'));

  /**
   * Use case:
   * A greeting is received. The timer starts ticking. However, if the human decides to reply to the message, the timer should be stopped.
   * This requires the script to listen to itself (Since it represents the human). The Hubot framework discards messages produced by the
   * bot (*or* the entity it represents), so we need to look at the raw incoming messages, to determine whether the human has stepped in.
   */
  robot.adapter.client.on('raw_message', rawMessage => {
    let message = processRaw(rawMessage);

  // Filter. Slack sends *a lot* of events
  if (message.type !== "message") {
    return;
  }

  if (message.user === self) {
    if (message.isBot) {
      debuglog('I heard my own bot message');
      // Leaving this one here for future expansion
    }
    else {
      debuglog('My human is taking over');
      if (message.isDM) {
        clearAutoReply(message.channel);
      }
    }
  }
});


  /**
   * In this particular case, it was easier to have a generic listener for all direct messages, rather than one to start the timer and a
   * separate one to cancel it.
   */
  robot.respond(/(.*)/, function (msg) {
    let channel = msg.envelope.room; // Direct Messages are still considered a room.
    let text = msg.match[1];
    if (COMPILED_GREETINGS.some((greeting) => text.match(greeting))) {
      let message = msg; // Saving the message in the function scope.
      debuglog(`"${text}" Greeting detected. Starting timer`);
      conversations[channel] = setTimeout(() => {
        message.reply(RESPONSE)
    }, RESPONSE_DELAY);
    }
  else {
      clearAutoReply(channel);
    }
  });


  /**
   * Parses a raw message and adds a few convenience properties.
   * @param rawMessage
   * @returns Message as a JSON object
   */
  function processRaw(rawMessage) {
    let message = JSON.parse(rawMessage);

    // In Slack, Direct message channels start with D.  Regular channel messages start with C
    if (message.type === "message" && message.channel.match(/^D/i)) {
      message.isDM = true
    }

    if (message.bot_id) {
      message.isBot = true;
    }
    return message;
  }


  /**
   * Looks at the conversations table.
   * If there is a ticking auto-reply timer, it is cleared.
   * @param channel
   */
  function clearAutoReply(channel) {
    if (conversations[channel]) {
      clearTimeout(conversations[channel]);
      delete conversations[channel];
      debuglog(`Cleared auto-reply in ${channel}`);
    }
  }

};
