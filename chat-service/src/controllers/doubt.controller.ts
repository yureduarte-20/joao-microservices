'strict'
import { inject } from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  NullType,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import QueueListenerAdapter from '../adapters/QueueListenerAdapter';
import { QueueListenerAdapterBindings } from '../keys';
import { Doubt, DoubtsTags, DoubtStatus, IMessage } from '../models';
import { DoubtRepository } from '../repositories';

export class DoubtController {
  constructor(
    @repository(DoubtRepository)
    public doubtRepository: DoubtRepository,
    @inject(QueueListenerAdapterBindings.QUEUE_LISTENER_ADAPTER) private queue: QueueListenerAdapter
  ) { }

  @post('/problems/{id}/doubt')
  @response(200, {
    description: 'Doubt model instance',
    content: { 'application/json': { schema: getModelSchemaRef(Doubt) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            properties: {
              userURI: {
                type: "string"
              },
              userName: {
                type: 'string',
              },
              tagDoubt: {
                enum: Object.values(DoubtsTags)
              },
            },
            required: ['userName', 'userURI']
          },
        },
      },
    })
    { userName, userURI, tagDoubt }: { userURI: string, userName: string, tagDoubt?: string},
    @param.path.string('id') problemId: string,
  ): Promise<Doubt> {
    const { count } = await this.doubtRepository.count({
      and: [
        { problemURI: `/problems/${problemId}` },
        { studentURI: userURI },
        { or: [{ status: DoubtStatus.OPEN }, { status: DoubtStatus.ON_GOING }] }
      ],
    });
    if (count > 0) return Promise.reject(new HttpErrors.UnprocessableEntity('Já existe uma conversa em aberta para este problema'))
    try {
      const response = await this.queue.sendProblemRequest({ problemId })
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
      return this.doubtRepository.create({
        studentName: userName,
        studentURI: userURI.startsWith('/users') ? userURI : `/users/${userURI}`,
        problemURI: `/problems/${problemId}`,
        problemTitle: response.title,
        tag: tagDoubt
      })
    } catch (e) {
      if (e.error) {
        if (e.error.statusCode == 422)
          return Promise.reject(new HttpErrors[422](e.error.message))
      }
      return Promise.reject(new HttpErrors[422](e.message))
    }
    //return this.doubtRepository.create({});
  }

  @post('/doubts/{doubtId}')
  @response(200, {
    description: 'Doubt model instance',
    content: { 'application/json': { schema: getModelSchemaRef(Doubt) } },
  })
  async appendMessage(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            properties: {
              message: {
                type: 'string',
              },
              userURI: {
                type: 'string'
              },
            },
            required: ['userURI', 'message']
          }
        },
      },
    })
    message: IMessage,
    @param.path.string('doubtId') doubtId: string
  ): Promise<void> {
    console.log(message)
    let response = await this.doubtRepository.findOne({
      where: {
        and: [
          { id: doubtId },
          {
            or: [
              { advisorURI: message.userURI },
              { studentURI: message.userURI },
              { advisorURI: `/users/${message.userURI}` },
              { studentURI: `/users/${message.userURI}` },
            ]
          }
        ],
      }
    })
    if (!response) return Promise.reject(HttpErrors.NotFound('Conversa não encontrada'));
    if (response.status === DoubtStatus.COMPLETE) return Promise.reject(new HttpErrors.UnprocessableEntity('Conversa encerrada'))
    if (!response.messages)
      response.messages = []
    let date = new Date().toISOString()
    response.messages.push({ ...message, createdAt: date })
    response.updatedAt = date
    return this.doubtRepository.updateById(doubtId, response);
  }

  @post('/doubts/close/{doubtId}')
  @response(200, {
    description: 'Doubt model instance',
    content: { 'application/json': { schema: getModelSchemaRef(Doubt) } },
  })
  async close(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            properties: {
              userURI: {
                type: 'string'
              },
            },
            required: ['userURI']
          }
        },
      },
    })
    { userURI }: { userURI: string },
    @param.path.string('doubtId') doubtId: string
  ): Promise<void> {
    let response = await this.doubtRepository.findById(doubtId)
    if (![response.advisorURI, response.studentURI].includes(userURI)) return Promise.reject(new HttpErrors.UnprocessableEntity('Conversa não encontrada'))
    if (response.status === DoubtStatus.COMPLETE) return Promise.reject(new HttpErrors.UnprocessableEntity('Conversa já encerrada'))
    response.status = DoubtStatus.COMPLETE
    response.closedAt = new Date().toISOString()
    return this.doubtRepository.updateById(doubtId, response);
  }

  @get('/doubts/count')
  @response(200, {
    description: 'Doubt model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(
    @param.where(Doubt) where?: Where<Doubt>,
  ): Promise<Count> {
    return this.doubtRepository.count(where);
  }

  @get('/doubts/{studentId}')
  @response(200, {
    description: 'Array of Doubt model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Doubt, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.path.string('studentId') studentId: string,
    @param.filter(Doubt) filter?: Filter<Doubt>,
  ): Promise<Doubt[]> {
    if (filter)
      filter.where = { ...filter.where, advisorURI: undefined, studentURI: undefined };
    return this.doubtRepository.find({
      ...filter, where: {
        ...filter?.where,
        or: [
          { studentURI: `/users/${studentId}` },
          { studentURI: studentId }
        ]
      }
    });
  }
  @get('/doubts/{id}/{userId}')
  @response(200, {
    description: 'Doubt model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Doubt, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.path.string('userId') userId: string,
    @param.filter(Doubt) filter?: Filter<Doubt>
  ): Promise<Doubt> {
    if (filter)
      filter.where = { ...filter.where, advisorURI: undefined, studentURI: undefined };
    const doubt = await this.doubtRepository.findOne({
      ...filter, where: {
        ...filter?.where,
        and: [
          { id },
          {
            or: [
              { studentURI: `/users/${userId}` },
              { studentURI: userId }
            ]
          }
        ],
      }
    });
    if (!doubt) return Promise.reject(new HttpErrors.NotFound('Conversa não encontrada'))
    return doubt
  }

  /*   @del('/doubts/{id}')
    @response(204, {
      description: 'Doubt DELETE success',
    })
    async deleteById(@param.path.string('id') id: string): Promise<void> {
      await this.doubtRepository.deleteById(id);
    } */
}
