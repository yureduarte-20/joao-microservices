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
import { CustomUserProfile, QueueListenerAdapterBindings } from '../keys';
import { Doubt, DoubtsTags, DoubtStatus, IMessage } from '../models';
import { DoubtRepository } from '../repositories';
import { authenticate, AuthenticationBindings } from '@loopback/authentication';
@authenticate({ strategy: 'jwt' })
export class DoubtController {
  constructor(
    @repository(DoubtRepository)
    public doubtRepository: DoubtRepository,
    @inject(QueueListenerAdapterBindings.QUEUE_LISTENER_ADAPTER)
    private queue: QueueListenerAdapter,
    @inject(AuthenticationBindings.CURRENT_USER)
    private currentUser: CustomUserProfile
  ) { }

  @post('/doubt/problem/{id}')
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
              tagDoubt: {
                enum: Object.values(DoubtsTags)
              },
            },
          },
        },
      },
    })
    { tagDoubt }: { tagDoubt?: string },
    @param.path.string('id') problemId: string,
  ): Promise<Doubt> {
    const { count } = await this.doubtRepository.count({
      and: [
        { problemURI: `/problems/${problemId}` },
        { studentURI: `/users/${this.currentUser.id}` },
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
        studentName: this.currentUser.name,
        studentURI: `/users/${this.currentUser.id}`,
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
            },
            required: ['message']
          }
        },
      },
    })
    message: IMessage,
    @param.path.string('doubtId') doubtId: string
  ): Promise<void> {
    message.userURI = `/users/${this.currentUser.id}`
    let response = await this.doubtRepository.findOne({
      where: {
        and: [
          { id: doubtId },
          {
            or: [
              { advisorURI: message.userURI },
              { studentURI: message.userURI },
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
    @param.path.string('doubtId') doubtId: string
  ): Promise<void> {
    const userURI = `/users/${this.currentUser.id}`
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

  @get('/doubts')
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

    @param.filter(Doubt) filter?: Filter<Doubt>,
  ): Promise<Doubt[]> {
    const studentId = this.currentUser.id
    if (filter)
      filter.where = { ...filter.where, advisorURI: undefined, studentURI: undefined };
    return this.doubtRepository.find({
      ...filter, where: {
        ...filter?.where,
        studentURI: `/users/${studentId}`
      }
    });
  }
  @get('/doubts/{id}')
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
    @param.filter(Doubt) filter?: Filter<Doubt>
  ): Promise<Doubt> {
    const userId = this.currentUser.id
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
