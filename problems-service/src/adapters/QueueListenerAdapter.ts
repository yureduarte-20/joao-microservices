import { generateUniqueId, inject, uuid } from '@loopback/core'
import { repository } from '@loopback/repository';
import { RabbitServiceBindings, SubmissionStatus } from "../keys";
import { ITestCase, Problem, Submission } from "../models";
import { SubmissionRepository } from '../repositories';
import RabbitService from "../services/rabbit.service";

export interface ISubmissionExecutedMassage {
    submission: Submission
    results: [
        {
            success: boolean,
            outputs?: {
                output_as_string: string,
                output_as_array: string[]
            },
            testCase: ITestCase,
            error?: {
                message: string,
                stack: string,
                name: string
            }
        }
    ],
}

export default class QueueListenerAdapter {
    @inject(RabbitServiceBindings.RABBIT_SERVICE)
    private rabbitService: RabbitService
    public sendSubmissionToEvaluate(data: { code: string, problem: Partial<Problem>, submission: Partial<Submission> }): void {
        this.rabbitService.sendToQueue('submission:execute', data)
    }
    public async onReceiveExecutedSubmission(cb: (sub: ISubmissionExecutedMassage) => void) {
        this.rabbitService.consume('submission:executed', async message => {
            // console.log(message?.content.toString())
            if (message && message.content) {
                const data: ISubmissionExecutedMassage = JSON.parse(message.content.toString())
                cb(data)
            }
        })
    }
    public async sendDoubt(data: {
        problemId: string,
        userURI: string,
        problemTitle: string,
        userName: string
    }): Promise<any> {
        return new Promise<any>((res, rej) => {
            //this.rabbitService.sendToQueue('doubt:create', { problemURI: `/problems/${problemId}`, userURI, problemTitle }, rej, { correlationId: generateUniqueId() })
            console.log('enviado')
            this.rabbitService.sendAndWait('doubt:create', data, res, rej)
        })
    }   
    public async onReceiveProblemDataRequest(cb: (data: { problemId: string }) => Promise<any>, err?: () => void) {
        this.rabbitService.consumeAndReturn('problem:request', cb, err)
    }
}