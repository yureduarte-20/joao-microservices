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
import { Submission } from '../models';
import { SubmissionRepository } from '../repositories';
import problem_api from '../utils/problem_api';

export class SubmissionsController {
  constructor(
    @repository(SubmissionRepository)
    public submissionRepository: SubmissionRepository,
  ) { }

  @get('/submissions/count')
  @response(200, {
    description: 'Submission model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(
    @param.where(Submission) where?: Where<Submission>,
  ): Promise<Count> {
    return this.submissionRepository.count(where);
  }

  @get('/submissions/{userId}')
  @response(200, {
    description: 'Array of Submission model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Submission, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.path.string('userId') userId: string,
    @param.filter(Submission) filter?: Filter<Submission>,
  ): Promise<Submission[]> {
    return this.submissionRepository.find({ ...filter, where: { ...filter?.where, or: [{ userURI: userId }, { userURI: `/users/${userId}` }] } });
  }

  @get('/submissions/{userId}/{id}')
  @response(200, {
    description: 'Submission model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Submission, { includeRelations: true }),
      },
    },
  })
  async findByUser(
    @param.path.string('id') id: string,
    @param.path.string('userId') userId: string,
    @param.filter(Submission, { exclude: 'where' }) filter?: FilterExcludingWhere<Submission>
  ): Promise<Submission> {
    let sub = await this.submissionRepository.findOne({ ...filter, where: { and: [{ id }, { or: [{ userURI: userId }, { userURI: `/users/${userId}` }] }] } });
    if (!sub) return Promise.reject(new HttpErrors.NotFound('Submissão não encontrada'));
    return sub;
  }

  @post('/submissions')
  @response(200, {
    description: 'Submission model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Submission, { includeRelations: true }),
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {

        },
      },
    })
    submission: Submission,
  ): Promise<Submission> {
    return this.submissionRepository.create(submission)
  }
}
