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
import { AxiosError } from 'axios';

import { Problem } from '../models';
import { ProblemRepository } from '../repositories';
import submission_api from '../utils/submission-api'

export class ProblemsControllerController {
  constructor(
    @repository(ProblemRepository)
    public problemRepository: ProblemRepository,
  ) { }

  @get('/problems/count')
  @response(200, {
    description: 'Problem model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(
    @param.where(Problem) where?: Where<Problem>,
  ): Promise<Count> {
    return this.problemRepository.count(where);
  }

  @get('/problems')
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
  ): Promise<Problem[]> {
    return this.problemRepository.find(filter);
  }

  @get('/problems/{id}')
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
    return this.problemRepository.findById(id, filter);
  }
  @post('/problems/submission')
  @response(200, {
    description: 'Problem model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Problem, { includeRelations: true }),
      },
    },
  })
  async createSubmission(
    @requestBody({
      content: {
        'application/json': {
          schema: { type: 'object' },
        },
      },
    })
    submission: any,
  ) {
    const p = await this.problemRepository.findById(submission.problemId, { fields: { title: true, testCases: true } })
    submission = { problemTitle: p.title, testCases: p.testCases, ...submission }
    try {
      const { data } = await submission_api.post('/submissions', submission)
      return data
    } catch (e) {
      let error: AxiosError = e
      if (error.response) {
        if (error.response.status == 422) {
          const { error: { message, details } }: any = error.response.data
          let httpError = new HttpErrors.UnprocessableEntity(message)
          httpError.details = details
          return Promise.reject(httpError)
        }
      }
      if (error.request) {
        return Promise.reject(new HttpErrors.InternalServerError())
      }
      return Promise.reject(new HttpErrors.InternalServerError())
    }
  }
}
