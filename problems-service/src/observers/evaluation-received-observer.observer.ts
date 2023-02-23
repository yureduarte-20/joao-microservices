import {
  inject,
  /* inject, Application, CoreBindings, */
  lifeCycleObserver, // The decorator
  LifeCycleObserver, // The interface
} from '@loopback/core';
import EvaluatorAdapter from '../adapters/EvaluatorAdapter';
import QueueListenerAdapter from '../adapters/QueueListenerAdapter';
import { EvaluatorAdapterBinding, JudgeConectorAdapterBindings } from '../keys';

/**
 * This class will be bound to the application as a `LifeCycleObserver` during
 * `boot`
 */
@lifeCycleObserver('')
export class EvaluationReceivedObserverObserver implements LifeCycleObserver {
  @inject(JudgeConectorAdapterBindings.JUDGE_ADAPTER)
  private judge: QueueListenerAdapter
  @inject(EvaluatorAdapterBinding.EVALUATOR_ADAPTER)
  private evaluator: EvaluatorAdapter
  /*
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private app: Application,
  ) {}
  */

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
    this.judge.onReceiveExecutedSubmission((sub) => this.evaluator.handleReceiveExecution(sub))
  }

  /**
   * This method will be invoked when the application stops.
   */
  async stop(): Promise<void> {
    // Add your logic for stop
  }
}
