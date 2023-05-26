import { inject } from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  HttpErrors,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import QueueListenerAdapter from '../adapters/QueueListenerAdapter';
import { CustomUserProfile, JudgeConectorAdapterBindings, SubmissionStatus } from '../keys';
import {
  Problem,
  Submission,
} from '../models';
import { ProblemRepository, SubmissionRepository } from '../repositories';
import { javascriptPrefix } from '../utils/javascriptScript';
import xmlToCode from '../utils/xmlToCode';
import { authenticate, AuthenticationBindings } from '@loopback/authentication';

@authenticate({ strategy: 'jwt' })
export class ProblemSubmissionController {
  @inject(JudgeConectorAdapterBindings.JUDGE_ADAPTER)
  private jud: QueueListenerAdapter
  constructor(
    @repository(ProblemRepository) protected problemRepository: ProblemRepository,
    @repository(SubmissionRepository) protected submissionRepository: SubmissionRepository,
    @inject(AuthenticationBindings.CURRENT_USER)
    private currentUser: CustomUserProfile
  ) { }

  @get('/submissions/{id}', {
    responses: {
      '200': {
        description: 'Array of Problem has many Submission',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Submission)
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Submission>,
  ): Promise<Submission | typeof HttpErrors.NotFound> {
    const userId = this.currentUser.id
    const sub = await this.submissionRepository.findOne({
      ...filter,
      where: {
        ...filter?.where,
        and: [{ id }, { or: [{ userURI: userId }, { userURI: `/users/${userId}` }] }]
      }
    })
    if (!sub || (Array.isArray(sub) && sub.length <= 0)) return Promise.reject(new HttpErrors.NotFound('Submissão não encontrada.'))
    return sub
  }

  @get('/submissions', {
    responses: {
      '200': {
        description: 'Array of Problem has many Submission',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(Submission) },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter') filter?: Filter<Submission>,
  ): Promise<Submission[]> {
    const userId = this.currentUser.id
    return this.submissionRepository.find({ ...filter, where: { ...filter?.where, or: [{ userURI: userId }, { userURI: `/users/${userId}` }] } })
  }

  @post('/problems/{id}/submissions', {
    responses: {
      '200': {
        description: 'Problem model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Submission) } },
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Problem.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Submission, {
            title: 'NewSubmissionInProblem',
            exclude: ['id', 'userURI'],
            optional: ['problemId']
          }),
        },
      },
    }) submission: Omit<Submission, 'id'>,
  ): Promise<Submission> {
    submission.userURI = `/users/${this.currentUser.id}`
    submission.status = SubmissionStatus.PENDING
    const problem = await this.problemRepository.findById(id, { fields: { testCases: true, id: true } })
    console.log(problem.testCases)
    const submissionData = await this.problemRepository.submissions(id).create(submission);
    this.jud.sendSubmissionToEvaluate({ code: javascriptPrefix + xmlToCode(submission.blocksXml), problem: { testCases: problem.testCases }, submission: submissionData })
    return submissionData
  }
}
