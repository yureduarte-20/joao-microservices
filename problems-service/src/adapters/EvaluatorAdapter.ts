import { inject } from "@loopback/core";
import { repository } from "@loopback/repository";
import { SubmissionStatus } from "../keys";
import { ITestCase, Submission } from "../models";
import { SubmissionRepository } from "../repositories";
import { TimeOutError } from "../types";
import { ISubmissionExecutedMassage } from "./QueueListenerAdapter";

export default class EvaluatorAdapter {
    @repository(SubmissionRepository)
    private submissionRepository: SubmissionRepository
    constructor(
    ) {

    }
    private async allowedToChange(submissionId: typeof Submission.prototype.id) : Promise<boolean> {
        const submission = await this.submissionRepository.findById(submissionId, { fields: { status: true } })
        return submission.status === SubmissionStatus.PENDING
    }
    public async handleReceiveExecution(executionResult: ISubmissionExecutedMassage) {
        const resultsFails = executionResult.results.find(v => (v.error || !v.success))
        if (!(await this.allowedToChange(executionResult.submission.id)))
            return

        if (resultsFails) {
            return await this.submissionRepository.updateById(executionResult.submission.id, {
                status: resultsFails.error?.name == TimeOutError.name ?
                    SubmissionStatus.TIME_LIMIT_EXCEEDED : SubmissionStatus.RUNTIME_ERROR,
                error: JSON.stringify(resultsFails.error)
            })
        }
        
        if (executionResult.results.every(v => v.success && v.outputs?.output_as_string === v.testCase.outputs)) {
            return await this.submissionRepository.updateById(executionResult.submission.id, { status: SubmissionStatus.ACCEPTED, successfulRate: 1 })
        }

        for (const result of executionResult.results) {
            if (result.outputs) {
                const answer = this.handleOutput({ output: result.outputs.output_as_string, testCase: result.testCase })
                if (!executionResult.submission.results)
                    executionResult.submission.results = [];
                executionResult.submission.results.push(answer);
            }
        }

        if (executionResult.submission.results?.some(el => el == SubmissionStatus.PRESENTATION_ERROR)) {
            executionResult.submission.status = SubmissionStatus.PRESENTATION_ERROR
        } else {
            let count = 0
            executionResult.submission.status = SubmissionStatus.WRONG_ANSWER
            if (executionResult.submission.results) {
                executionResult.submission.results?.forEach((v) => {
                    if (v == SubmissionStatus.ACCEPTED) count++;
                })
                executionResult.submission.successfulRate = Number((count / executionResult.submission.results.length).toFixed(2));
            }
        }
        console.log(executionResult)
        return await this.submissionRepository.updateById(executionResult.submission.id, executionResult.submission)
    }
    private handleOutput({ output, testCase }: { output: string, testCase: ITestCase }) {

        if (output == testCase.outputs) {
            return SubmissionStatus.ACCEPTED
        }
        if (testCase.validationOutputRegex) {
            const regex = new RegExp(testCase.validationOutputRegex);
            if (!regex.test(output)) {
                return SubmissionStatus.PRESENTATION_ERROR
            }

        }
        return SubmissionStatus.WRONG_ANSWER

    }
}