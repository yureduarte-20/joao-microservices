import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import { CustomUserProfile, Roles } from '../keys';
import { Problem } from '../models';
import { ProblemRepository } from '../repositories';
import { inject } from '@loopback/core';


@authenticate({ strategy: 'jwt' })
@authorize({ allowedRoles: [Roles.ADMIN] })
export class ProblemsAdminController {
  constructor(
    @repository(ProblemRepository)
    public problemRepository: ProblemRepository,
    @inject(AuthenticationBindings.CURRENT_USER)
    private currentUser: CustomUserProfile
  ) { }

  @post('/admin/problems')
  @response(200, {
    description: 'Problem model instance',
    content: { 'application/json': { schema: getModelSchemaRef(Problem) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Problem, {
            title: 'NewProblem',
            exclude: ['id', 'createdByURI'],
          }),
        },
      },
    })
    problem: Omit<Problem, 'id'>,
  ): Promise<Problem> {
    return this.problemRepository.create({ ...problem, createdByURI: `/users/${this.currentUser.id}` });
  }

  @get('/admin/problems/count')
  @response(200, {
    description: 'Problem model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(
    @param.where(Problem) where?: Where<Problem>,
  ): Promise<Count> {
    return this.problemRepository.count(where);
  }

  @get('/admin/problems')
  @response(200, {
    description: 'Array of Problem model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Problem, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(Problem) filter?: Filter<Problem>,
  ): Promise<any[]> {
    const problems = await this.problemRepository.find(filter);
    return problems.map(item => Object.assign({}, item))
  }

  @patch('/admin/problems')
  @response(200, {
    description: 'Problem PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Problem, { partial: true }),
        },
      },
    })
    problem: Problem,
    @param.where(Problem) where?: Where<Problem>,
  ): Promise<Count> {
    return this.problemRepository.updateAll(problem, where);
  }

  @get('/admin/problems/{id}')
  @response(200, {
    description: 'Problem model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Problem, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Problem, { exclude: 'where' }) filter?: FilterExcludingWhere<Problem>
  ): Promise<any> {
    const problem = await this.problemRepository.findById(id, filter);
    return Object.assign({}, problem)
  }

  @patch('/admin/problems/{id}')
  @response(204, {
    description: 'Problem PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Problem, { partial: true }),
        },
      },
    })
    problem: Problem,
  ): Promise<void> {
    await this.problemRepository.updateById(id, problem);
  }

  @put('/admin/problems/{id}')
  @response(204, {
    description: 'Problem PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() problem: Problem,
  ): Promise<void> {
    await this.problemRepository.replaceById(id, problem);
  }

  @del('/admin/problems/{id}')
  @response(204, {
    description: 'Problem DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.problemRepository.deleteById(id);
  }
}
