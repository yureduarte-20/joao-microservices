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
import { JudgeConectorAdapterBindings, SubmissionStatus } from '../keys';
import {
  Problem,
  Submission,
} from '../models';
import { ProblemRepository, SubmissionRepository } from '../repositories';
import { javascriptPrefix } from '../utils/javascriptScript';
import xmlToCode from '../utils/xmlToCode';

export class ProblemSubmissionController {
  @inject(JudgeConectorAdapterBindings.JUDGE_ADAPTER)
  private jud: QueueListenerAdapter
  constructor(
    @repository(ProblemRepository) protected problemRepository: ProblemRepository,
    @repository(SubmissionRepository) protected submissionRepository: SubmissionRepository,
  ) { }

  @get('/submissions/{id}/{userId}', {
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
    @param.path.string('userId') userId: string,
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Submission>,
  ): Promise<Submission | typeof HttpErrors.NotFound> {
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

  @get('/submissions/{userId}', {
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
    @param.path.string('userId') userId: string,
    @param.query.object('filter') filter?: Filter<Submission>,
  ): Promise<Submission[]> {
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
            exclude: ['id'],
            optional: ['problemId']
          }),
        },
      },
    }) submission: Omit<Submission, 'id'>,
  ): Promise<Submission> {
    submission.status = SubmissionStatus.PENDING
    const problem = await this.problemRepository.findById(id, { fields:{ testCases:true, id:true } })
    console.log(problem.testCases)
    const submissionData = await this.problemRepository.submissions(id).create(submission);
    this.jud.sendSubmissionToEvaluate({ code: javascriptPrefix + submission.blocksXml, problem:{ testCases: problem.testCases }, submission: submissionData })
    return submissionData
  }
}
