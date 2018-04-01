# hubot-slack-auto-reply

One of my pet peeves with Slack (and other IM platforms) is when somebody needs something from you, but they just say "Hello" (Or "Hi", or "Hey Lenny", etc) and leave it at that.
In order to have effective async communication, people should write our their whole query in one shot.

This script implements an auto-responder that encourages people to do more than just greet you.

If a standard greeting is detected, with no follow up within a minute, the bot will reply prompting the user to add more information.

(If either party writes additional messages within the allowed timeframe, the auto-response is canceled)

See [`src/slack-auto-reply.js`](src/slack-auto-reply.js) for full documentation.

## Installation

In hubot project repo, run:

`npm install hubot-slack-auto-reply --save`

Then add **hubot-slack-auto-reply** to your `external-scripts.json`:

```json
[
  "hubot-slack-auto-reply"
]
```

## Sample Interaction

```
user1>> hi
<one minute later>
hubot>> Hi! 👋 I'm an auto-responder. It's nice to say hello, but it's better to ask your full question in one shot.
```

## NPM Module

https://www.npmjs.com/package/hubot-slack-auto-reply
