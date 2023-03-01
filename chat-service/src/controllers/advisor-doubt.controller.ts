import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
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
import { Doubt,  DoubtStatus } from '../models';

import { DoubtRepository } from '../repositories';

export class AdvisorDoubtController {
  constructor(
    @repository(DoubtRepository)
    public doubtRepository: DoubtRepository,
  ) { }
  /* 
    @post('/advisor/doubts/{doubtId}')
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
    } */

  @post('/advisor/doubts/subscribe/{doubtId}')
  @response(200, {
    description: 'Doubt model instance',
    content: { 'application/json': { schema: getModelSchemaRef(Doubt) } },
  })
  async subscribe(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            properties: {
              userURI: {
                type: 'string'
              },
              userName: {
                type:"string"
              }
            },
            required:['userURI', 'userName']
          }
        },
      },
    })
    data: { userURI: string, userName:string },
    @param.path.string('doubtId') doubtId: string
  ): Promise<void> {
    let response = await this.doubtRepository.findOne({
      where: {
        and: [
          { id: doubtId },
          {
            status: DoubtStatus.OPEN
          }
        ],
      }
    })
    console.log(data)
    if (!response) return Promise.reject(HttpErrors.NotFound('Conversa não encontrada, ou ela está sendo analisada por outro orientador'));
    response.advisorURI = data.userURI.startsWith('/users/') ? data.userURI : `/users/${data.userURI}`
    response.advisorName = data.userName
    response.status = DoubtStatus.ON_GOING
    return this.doubtRepository.updateById(doubtId, response);
  }

  @get('/advisor/doubts/count')
  @response(200, {
    description: 'Doubt model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(
    @param.where(Doubt) where?: Where<Doubt>,
  ): Promise<Count> {
    return this.doubtRepository.count(where);
  }

  @get('/advisor/doubts')
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
  async findAllOpen(
    @param.filter(Doubt) filter?: Filter<Doubt>,
  ): Promise<Doubt[]> {
    return this.doubtRepository.find(filter);
  }

  @get('/advisor/doubts/{id}')
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
    @param.filter(Doubt, { exclude: 'where' }) filter?: FilterExcludingWhere<Doubt>
  ): Promise<Doubt> {
    return this.doubtRepository.findById(id, filter);
  }

  @del('/advisor/doubts/{id}')
  @response(204, {
    description: 'Doubt DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.doubtRepository.deleteById(id);
  }
}
