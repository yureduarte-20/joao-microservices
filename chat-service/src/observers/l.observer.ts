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
    this.queue.onReceiveNewChatRequest(async ({ problemURI, userURI }) => {
      const { count } = await this.doubtRepository.count({
        and: [
          { problemURI },
          { studentURI: userURI },
          { or: [{ status: DoubtStatus.OPEN }, { status: DoubtStatus.ON_GOING }] }
        ],
      });
      if (count > 0) return
      await this.doubtRepository.create({ problemURI, studentURI: userURI })
    })
  }

  /**
   * This method will be invoked when the application stops.
   */
  async stop(): Promise<void> {
    // Add your logic for stop
  }
}