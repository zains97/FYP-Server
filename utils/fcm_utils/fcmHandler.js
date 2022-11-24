let FCM = require("fcm-node");

function sendMessageNotification(senderName, messageBody, senderFcmToken) {
  try {
    let serverKey =
      "AAAATvL2KLQ:APA91bHAJcXqFU63-nr3HZcB0s_3dKWIYpeN8NleBiOpHeGMf77586qP_M333mHSlyLgzYBFL_Zw6-nGU79fUou0tlPoULuNsWZhEumRd3rf96Yse8vosgrfeBU95O_uRk5kbtwiUvGc"; //put your server key here
    let fcm = new FCM(serverKey);

    let message = {
      //this may vary according to the message type (single recipient, multicast, topic, et cetera)
      to: senderFcmToken,
      //   collapse_key: "your_collapse_key",

      notification: {
        title: `A new message from ${senderName}`,
        body: `${messageBody}`,
      },

      //   data: {
      //     //you can send only notification or only data(or include both)
      //     my_key: "my value",
      //     my_another_key: "my another value",
      //   },
    };

    fcm.send(message, function (err, response) {
      if (err) {
        console.log("Something has gone wrong!");
      } else {
        console.log("Successfully sent with response: ", response);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = { sendMessageNotification };
