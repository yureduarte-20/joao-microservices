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
} from '@loopback/rest';
import { Doubt } from '../models';
import { DoubtRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { Roles } from '../keys';

@authenticate({ strategy: 'jwt' })
@authorize({ allowedRoles: [Roles.ADMIN] })
export class AdminAdvisorController {
  constructor(
    @repository(DoubtRepository)
    public doubtRepository: DoubtRepository,
  ) { }

  @post('/admin/doubts')
  @response(200, {
    description: 'Doubt model instance',
    content: { 'application/json': { schema: getModelSchemaRef(Doubt) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Doubt, {
            title: 'NewDoubt',
            exclude: ['id'],
          }),
        },
      },
    })
    doubt: Omit<Doubt, 'id'>,
  ): Promise<Doubt> {
    return this.doubtRepository.create(doubt);
  }

  @get('/admin/doubts/count')
  @response(200, {
    description: 'Doubt model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(
    @param.where(Doubt) where?: Where<Doubt>,
  ): Promise<Count> {
    return this.doubtRepository.count(where);
  }

  @get('/admin/doubts')
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
    return this.doubtRepository.find(filter);
  }

  @patch('/admin/doubts')
  @response(200, {
    description: 'Doubt PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Doubt, { partial: true }),
        },
      },
    })
    doubt: Doubt,
    @param.where(Doubt) where?: Where<Doubt>,
  ): Promise<Count> {
    return this.doubtRepository.updateAll(doubt, where);
  }

  @get('/admin/doubts/{id}')
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

  @patch('/admin/doubts/{id}')
  @response(204, {
    description: 'Doubt PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Doubt, { partial: true }),
        },
      },
    })
    doubt: Doubt,
  ): Promise<void> {
    await this.doubtRepository.updateById(id, doubt);
  }

  @put('/admin/doubts/{id}')
  @response(204, {
    description: 'Doubt PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() doubt: Doubt,
  ): Promise<void> {
    await this.doubtRepository.replaceById(id, doubt);
  }

  @del('/admin/doubts/{id}')
  @response(204, {
    description: 'Doubt DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.doubtRepository.deleteById(id);
  }
}
