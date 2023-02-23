import {
  /* inject, Application, CoreBindings, */
  lifeCycleObserver, // The decorator
  LifeCycleObserver, // The interface
  inject
} from '@loopback/core';
import { repository } from '@loopback/repository';

import QueueListenerAdapter from '../adapters/QueueListenerAdapter';
import { QueueListenerAdapterBindinds } from '../keys';
import { ProblemRepository } from '../repositories';

/**
 * This class will be bound to the application as a `LifeCycleObserver` during
 * `boot`
 */
@lifeCycleObserver('')
export class ProblemRequestObserver implements LifeCycleObserver {

  constructor(
    @repository(ProblemRepository) private problemRepository: ProblemRepository,
    @inject(QueueListenerAdapterBindinds.QUEUE_LISTENER_ADAPTER) private queue: QueueListenerAdapter
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
    this.queue.onReceiveProblemDataRequest(async ({ problemId }) => {
      return new Promise((res, rej) => {
        this.problemRepository.findById(problemId)
          .then(res)
          .catch(e => {
            if (e.code == 'ENTITY_NOT_FOUND') {
              return res({ statusCode: 404, message: `Problema com id: ${e.entityId} não encontrado`, ...e  })
            }
            res({ statusCode: 422, message:'Erro ao tentar recuperar o problema ' + e.entityId, ...e })
          })
      })
    })
  }

  /**
   * This method will be invoked when the application stops.
   */
  async stop(): Promise<void> {
    // Add your logic for stop
  }
}
