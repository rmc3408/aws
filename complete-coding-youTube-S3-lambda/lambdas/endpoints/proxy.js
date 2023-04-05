const Responses = require('../common/API_resp'); 


module.exports.handler = async (event) => {
    console.log('event is ', event);
        return Responses._200();
}

