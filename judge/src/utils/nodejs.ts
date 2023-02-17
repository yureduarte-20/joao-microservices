import {spawn} from 'child_process';
import TimeOutError from '../errors/TimeoutError';
export interface IFileNodejsProp {
  basePath: string, fileName: string,
}

export default class NodeJSService {
  private TIMEOUT_IN_SECONDS = Number(process.env.TIMEOUT_EXECUTION_IN_SECONDS) || 5;
  async execute({basePath, fileName}: IFileNodejsProp, args?: string[]) {
    let saidas: string;
    let erros: string;
    return new Promise<string>((res, rej) => {
      const argument = args ? [...args] : []

      const children_proccess = spawn("timeout", [
        "-s", "SIGTERM", this.TIMEOUT_IN_SECONDS.toString(),
        "node",
        `${basePath}/${fileName}`, ...argument])
      children_proccess.stderr.on('data', (err) => {
        erros = err.toString()
      })
      children_proccess.stdout.on("data", c => {
        saidas = c.toString()
      })
      children_proccess.on("exit", (code, s) => {

        if (code == 124 || s == 'SIGTERM') {
          return rej(new TimeOutError(`O código demorou mais de ${this.TIMEOUT_IN_SECONDS} segundos para executar`))
        }
        if (code) {
          try {
            let err: any = JSON.parse(erros)
            console.log(err)
            switch (err.name) {
              case 'TypeError':
                let typeError = new TypeError(err.message)
                typeError.stack = err.stack;
                return rej(typeError)
              case 'RangeError':
                let rangeError = new RangeError(err.message);
                rangeError.stack = err.stack;
                return rej(rangeError)
            }
          } catch (e) {
            return rej(new Error(erros));
          }
        }
        res(saidas);
      })
    })
  }
}