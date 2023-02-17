import { inject } from '@loopback/core'
import { RabbitServiceBindings } from "../keys";
import { Problem } from "../models";
import RabbitService from "../services/rabbit.service";

export default class JudgeAdapter {
    @inject(RabbitServiceBindings.RABBIT_SERVICE)
    private rabbitService: RabbitService
    public sendSubmissionToEvaluate(data: { code:string, problem:Partial<Problem> }): void {
        this.rabbitService.sendToQueue('submission_to_be_evaluate', JSON.stringify(data))
    }
    public async receive(){
        this.rabbitService.consume('submission_evaluated', message =>{
            console.log(message?.content.toString())
        })
    }
}