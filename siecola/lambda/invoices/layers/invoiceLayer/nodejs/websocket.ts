import { ApiGatewayManagementApi } from "aws-sdk";

export default class InvoiceWebSocket {
  private api: ApiGatewayManagementApi

  constructor(api: ApiGatewayManagementApi) {
    this.api = api
  }

  async sendData(connectionId: string, data: string): Promise<boolean> {

    try {
      await this.api.getConnection({ //check connection before
        ConnectionId: connectionId
      }).promise()

      await this.api.postToConnection({ //send data
        ConnectionId: connectionId,
        Data: data
      }).promise()

      return true
    } catch (error) {
      console.log(error)
      return false
    }
    
    
  }
}
