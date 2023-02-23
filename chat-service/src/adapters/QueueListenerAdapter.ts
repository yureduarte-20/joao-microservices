import { inject } from "@loopback/core";
import { RabbitServiceBindings } from "../keys";
import { Doubt } from "../models";
import RabbitService from "../services/rabbit.service";
import amqplib from 'amqplib'

export default class QueueListenerAdapter {
    @inject(RabbitServiceBindings.RABBIT_SERVICE)
    private rabbitService: RabbitService
    async onReceiveNewChatRequest(cb: (d: {
        problemURI: typeof Doubt.prototype.problemURI,
        userURI: typeof Doubt.prototype.studentURI,
        problemTitle: typeof Doubt.prototype.problemTitle
    }) => void) {
        this.rabbitService.consume('doubt:create', message => {
            if (message) {
                return cb(JSON.parse(message.content.toString()))
            }
            console.log('Sem dados das mensagens')
            // this.sendNewChatResponse({ error:{ statusCode: 400, message:'Sem dados das mensagens' } })
        })
    }

    async sendNewChatResponse(callback: (data: any) => Promise<any>) {
        //this.rabbitService.sendToQueue('doubt:created', doubt)

        this.rabbitService.consumeAndReturn('doubt:create', callback, console.error)
    }
    async sendProblemRequest(data: { problemId: string }) {
        return new Promise<any>((res, rej) => {
            this.rabbitService.sendAndWait('problem:request', data, res, rej)
            console.log('enviado')
        })
    }
}