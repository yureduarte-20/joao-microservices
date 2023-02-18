import { consume, sendToQueue } from './utils/queue'
import NodeJSService from './utils/nodejs'
import { writeFileSync, mkdirSync, unlink } from 'fs'
const nodejsService = new NodeJSService()
function createTmpScript(basePath: string, fileName: string, data: string) {
    mkdirSync(basePath, { recursive: true })
    writeFileSync(`${basePath}/${fileName}`, data,)
}


function deleteTmpScript(basePath: string, fileName: string) {
    unlink(`${basePath}/${fileName}`, (err) => {
        if (err) console.log(`Falhou em deletar ${fileName}`)
    })
}
consume('submission:execute', async (data) => {
    if (data) {
        // console.log( JSON.parse(Buffer.from(data.content).toString('utf-8')))
        const json = JSON.parse(Buffer.from(data.content).toString('utf-8'))
        let basePath = __dirname + '/tmp'
        let fileName = json.submission.id + '.js'

        const executions: Promise<void>[] = []
        const testCasesOutputs: any[] = []
        createTmpScript(basePath, fileName, json.code)
        for (const testCase of json.problem.testCases) {
            const promise = nodejsService.execute({ basePath, fileName }, testCase?.inputs)
                .then(data => {
                    testCasesOutputs.push({ success: true, outputs: JSON.parse(data), testCase })
                })
                .catch((e: Error) => {
                    testCasesOutputs.push({ success: false, testCase, error: { message: e.message, stack: e.stack, name: e.name } })
                }).finally(() => {
                    deleteTmpScript(basePath, fileName)
                })
            executions.push(promise)
        }
        await Promise.allSettled(executions)
        sendToQueue('submission:executed', { submission: json.submission, results: testCasesOutputs })

    }
})