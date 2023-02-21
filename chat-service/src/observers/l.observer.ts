import {
  Application,
  CoreBindings,
  inject,
  /* inject, Application, CoreBindings, */
  lifeCycleObserver, // The decorator
  LifeCycleObserver, // The interface
} from '@loopback/core';
import { repository } from '@loopback/repository';
import QueueListenerAdapter from '../adapters/QueueListenerAdapter';
import { QueueListenerAdapterBindings } from '../keys';
import { DoubtStatus } from '../models';
import { DoubtRepository } from '../repositories';

/**
 * This class will be bound to the application as a `LifeCycleObserver` during
 * `boot`
 */
@lifeCycleObserver('')
export class LObserver implements LifeCycleObserver {

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private app: Application,
    @inject(QueueListenerAdapterBindings.QUEUE_LISTENER_ADAPTER) private queue: QueueListenerAdapter,
    @repository(DoubtRepository) private doubtRepository: DoubtRepository
  ) { }


  /**
   * This method will be invoked when the application initializes. It will be
   * called at most once for a given application instance.
   */
  async init(): Promise<void> {
    // Add your logic for init
  }

  /**
   * This method will be invoked when the application starts.
   */
  async start(): Promise<void> {
    // Add your logic for start
    /* this.queue.onReceiveNewChatRequest(async ({ problemURI, userURI, problemTitle }) => {
      console.log('Receba!')
      const { count } = await this.doubtRepository.count({
        and: [
          { problemURI },
          { studentURI: userURI },
          { or: [{ status: DoubtStatus.OPEN }, { status: DoubtStatus.ON_GOING }] }
        ],
      });
      if (count > 0) return this.queue.sendNewChatResponse({
        error: {
          statusCode: 422,
          message: `Já existe uma dúvida deste problema em aberto para este aluno.`
        }
      },
        (msg) => Promise.resolve(msg))
      await this.doubtRepository.create({ problemURI, studentURI: userURI, problemTitle })
        .then(d => this.queue.sendNewChatResponse(d, (msg) => Promise.resolve(msg)))
        .catch(e => this.queue.sendNewChatResponse(e, (msg) => Promise.resolve(msg)))
    }) */
    this.queue.sendNewChatResponse(async ({ problemId, userURI, problemTitle, userName ,...rest }: { problemId: string, userURI: string, problemTitle: string, userName: string }) => {
     // console.log('Receba!', rest)
      const { count } = await this.doubtRepository.count({
        and: [
          { problemURI: `/problems/${problemId}` },
          { studentURI: userURI },
          { or: [{ status: DoubtStatus.OPEN }, { status: DoubtStatus.ON_GOING }] }
        ],
      });
      if (count > 0) return ({
        error: {
          statusCode: 422,
          message: `Já existe uma dúvida deste problema em aberto para este aluno.`
        }
      })
      return await this.doubtRepository.create({ problemURI: `/problems/${problemId}`, studentURI: userURI, problemTitle, studentName: userName  })
    })
  }

  /**
   * This method will be invoked when the application stops.
   */
  async stop(): Promise<void> {
    // Add your logic for stop
  }
}
