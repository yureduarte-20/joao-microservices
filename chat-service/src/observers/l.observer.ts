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

import { DoubtRepository } from '../repositories';

/**
 * This class will be bound to the application as a `LifeCycleObserver` during
 * `boot`
 */
@lifeCycleObserver('')
export class LObserver implements LifeCycleObserver {

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private app: Application,
    @inject(QueueListenerAdapterBindings.QUEUE_LISTENER_ADAPTER)
    private queue: QueueListenerAdapter,
    @repository(DoubtRepository) private doubtRepository: DoubtRepository,

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
  }

  /**
   * This method will be invoked when the application stops.
   */
  async stop(): Promise<void> {
    // Add your logic for stopz
  }
}
