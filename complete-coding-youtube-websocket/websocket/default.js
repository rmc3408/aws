const Responses = require("../common/API_resp");

exports.ws = async (event) => {
  console.log("event is ", event);

  return Responses._200({ message: "default" });
};
