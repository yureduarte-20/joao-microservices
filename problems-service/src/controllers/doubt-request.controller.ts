// Uncomment these imports to begin using these cool features!

import { inject } from "@loopback/core";
import { repository } from "@loopback/repository";
import { HttpErrors, param, post, requestBody, response } from "@loopback/rest";
import QueueListenerAdapter from "../adapters/QueueListenerAdapter";
import { QueueListenerAdapterBindinds } from "../keys";
import { ProblemRepository } from "../repositories";

// import {inject} from '@loopback/core';


export class DoubtRequestController {
  constructor(
    @inject(QueueListenerAdapterBindinds.QUEUE_LISTENER_ADAPTER)
    private queue: QueueListenerAdapter,
    @repository(ProblemRepository)
    private problemsRepository: ProblemRepository
  ) { }

  @post('/problems/{id}/doubt')
  @response(200, {
    description: 'Problem model instance',
    content: { 'application/json': { schema: { type: 'object' } } },
  })
  async createRequest(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            description: 'Data necessary to create new doubt',
            properties: {
              userURI: {
                type: 'string',
                description: 'User identification'
              },
              userName: {
                type: 'string',
              }
            },
            required: ['userName', 'userURI']
          }
        }
      }
    })
    data: { userURI: string, userName: string },
    @param.path.string('id') id: string
  ): Promise<any> {
    const problem = await this.problemsRepository.findById(id, { fields: { title: true } })
    try {
      const response: any = await this.queue.sendDoubt({
        userURI: data.userURI, problemId: id,
        problemTitle: problem.title, userName: data.userName
      })
      if (response.statusCode && response.statusCode > 299) {
        const statusCode = response.statusCode as number
        const error = HttpErrors()
        error.message = response.message
        error.statusCode = statusCode
        error.name = response.name
        error.details = response.details
        return Promise.reject(error)
      }
      if (response.error) {
        const statusCode = response.error.statusCode as number
        const error = HttpErrors()
        error.message = response.error.message
        error.statusCode = statusCode
        error.name = response.error.name
        error.details = response.error.details
        return Promise.reject(error)
      }
      console.log('Criado', response)
      return Promise.resolve(response)
    } catch (e) {
      if (e.error) {
        if (e.error.statusCode == 422)
          return Promise.reject(new HttpErrors[422](e.error.message))
      }
      return Promise.reject(new HttpErrors[422](e.message))
    }
  }
}
