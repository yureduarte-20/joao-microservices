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
import { Problem } from '../models';
import { ProblemRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { Roles } from '../keys';
@authenticate({ strategy:'jwt' })
@authorize({ allowedRoles:[Roles.ADMIN, Roles.ADVISOR] })
export class AdvisorProblemsController {
  constructor(
    @repository(ProblemRepository)
    public problemRepository: ProblemRepository,
  ) { }

  @get('/advisor/problems/count')
  @response(200, {
    description: 'Problem model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(
    @param.where(Problem) where?: Where<Problem>,
  ): Promise<Count> {
    return this.problemRepository.count(where);
  }

  @get('/advisor/problems')
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
    ;
    return (await this.problemRepository.find(filter)).map(item => Object.assign({}, item))
  }

  @get('/advisor/problems/{id}')
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
  ): Promise<Problem> {
    return Object.assign({}, await this.problemRepository.findById(id, filter));
  }
}
