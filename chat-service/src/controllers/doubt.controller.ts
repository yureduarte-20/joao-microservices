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
import { Doubt, IMessage } from '../models';
import { DoubtRepository } from '../repositories';

export class DoubtController {
  constructor(
    @repository(DoubtRepository)
    public doubtRepository: DoubtRepository,
  ) { }

  @post('/doubts/{doubtId}')
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
              message: {
                type: 'string',
              },
              userURI: {
                type: 'string'
              }
            }
          }
        },
      },
    })
    message: IMessage,
    @param.path.string('doubtId') doubtId: string
  ): Promise<void> {
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
      },
      fields: { messages: true }
    })
    if (!response) return Promise.reject(HttpErrors.NotFound('Conversa não encontrada'));
    if (!response.messages)
      response.messages = []
    response.messages.push({ ...message, createdAt: new Date().toISOString() })
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

  @get('/doubts/{userId}')
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
    @param.path.string('userId') userId: string,
    @param.filter(Doubt) filter?: Filter<Doubt>,
  ): Promise<Doubt[]> {
    if (filter)
      filter.where = {...filter.where, advisorURI: undefined, studentURI: undefined };
    return this.doubtRepository.find({
      ...filter, where: {
        ...filter?.where,
        or: [
          { studentURI: `/users/${userId}` },
          { studentURI: userId }
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
      filter.where = {...filter.where, advisorURI: undefined, studentURI: undefined };
    const doubt = await this.doubtRepository.findOne({
      ...filter, where: {
        ...filter?.where,
        id: id,
        or: [
          { studentURI: `/users/${userId}` },
          { studentURI: userId }
        ]
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
