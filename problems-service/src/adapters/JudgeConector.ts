import { inject } from '@loopback/core'
import { RabbitServiceBindings } from "../keys";
import { Problem, Submission } from "../models";
import RabbitService from "../services/rabbit.service";

export default class JudgeAdapter {
    @inject(RabbitServiceBindings.RABBIT_SERVICE)
    private rabbitService: RabbitService
    public sendSubmissionToEvaluate(data: { code:string, problem:Partial<Problem>, submission:Partial<Submission>  }): void {
        this.rabbitService.sendToQueue('submission:execute', data)
    }
    public async receive(){
        this.rabbitService.consume('submission:executed', message =>{
            console.log(message?.content.toString())
        })
    }
}