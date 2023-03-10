import {inject, injectable} from '@loopback/core';
import {
  Request,
  RestBindings,
  get,
  response,
  ResponseObject,
} from '@loopback/rest';
import JudgeAdapter from '../adapters/JudgeConector';
import { JudgeConectorAdapterBindings } from '../keys';
import { javascriptPrefix } from '../utils/javascriptScript';

/**
 * OpenAPI response for ping()
 */
const PING_RESPONSE: ResponseObject = {
  description: 'Ping Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'PingResponse',
        properties: {
          greeting: {type: 'string'},
          date: {type: 'string'},
          url: {type: 'string'},
          headers: {
            type: 'object',
            properties: {
              'Content-Type': {type: 'string'},
            },
            additionalProperties: true,
          },
        },
      },
    },
  },
};

/**
 * A simple controller to bounce back http requests
 */
export class PingController {
  @inject(JudgeConectorAdapterBindings.JUDGE_ADAPTER)
  private jud : JudgeAdapter
  constructor(@inject(RestBindings.Http.REQUEST) private req: Request) {}

  // Map to `GET /ping`
  @get('/ping')
  @response(200, PING_RESPONSE)
  ping(): object {
    // Reply with a greeting, the current time, the url, and request headers
    this.jud.sendSubmissionToEvaluate({ code:javascriptPrefix.concat("for(let i=0; i< 999999999; i++){window.alert('caata')}"), problem:{ id:'1', testCases:[{ outputs:'olá mundo' }] } })
    return {
      greeting: 'Hello from LoopBack',
      date: new Date(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers),
    };
  }
}
