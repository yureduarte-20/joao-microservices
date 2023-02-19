import { inject } from "@loopback/core";
import { RabbitServiceBindings } from "../keys";
import { Doubt } from "../models";
import RabbitService from "../services/rabbit.service";


export default class QueueListenerAdapter {
    @inject(RabbitServiceBindings.RABBIT_SERVICE)
    private rabbitService: RabbitService
    async onReceiveNewChatRequest(cb: (d: {
        problemURI: typeof Doubt.prototype.problemURI,
        userURI: typeof Doubt.prototype.studentURI,
    }) => void) {
        this.rabbitService.consume('doubt:create', message =>{
            if(message){
                cb(JSON.parse(message.content.toString()))
            }
        })
    }
}