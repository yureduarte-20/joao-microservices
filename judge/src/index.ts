import { consume, sendToQueue } from './utils/queue'
import NodeJSService from './utils/nodejs'
import { writeFileSync,mkdirSync, unlink } from 'fs'
const nodejsService = new NodeJSService()
function createTmpScript(basePath: string, fileName: string, data: string) {
    mkdirSync(basePath, { recursive: true })
    writeFileSync(`${basePath}/${fileName}`, data, )
}


function deleteTmpScript(basePath: string, fileName: string) {
    unlink(`${basePath}/${fileName}`, (err) => {
        if (err) console.log(`Falhou em deletar ${fileName}`)
    })
}
consume('submission_to_be_evaluate', async (data) => {
    if (data) {
        const json = JSON.parse(JSON.parse(data.content.toString()))
        let basePath = __dirname + '/tmp'
        let fileName =  json.submission.id + '.js'
        createTmpScript(basePath, fileName, json.code)
        nodejsService.execute({ basePath, fileName }, json.problem.testCases.map((item: any) => item.outputs))
        .then(data =>{
            sendToQueue('submission_evaluated', { problem:json["problem"], submission:json.submission, data })
        })
        .catch((e : Error) =>{
            sendToQueue('submission_evaluated', { problem:json.problem, submission:json.submission, error:{ message:e.message, stack: e.stack, name:e.name } })
        }).finally(() =>{
          deleteTmpScript(basePath, fileName)  
        })

    }
})
