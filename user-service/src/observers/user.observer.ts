import {
  /* inject, Application, CoreBindings, */
  lifeCycleObserver, // The decorator
  LifeCycleObserver, // The interface
} from '@loopback/core';
import { repository } from '@loopback/repository';
import { Roles, Services } from '../keys';
import { UserRepository } from '../repositories';
import { generateHash } from '../utils/password'
/**
 * This class will be bound to the application as a `LifeCycleObserver` during
 * `boot`
 */
@lifeCycleObserver('seeds')
export class UserObserver implements LifeCycleObserver {


  constructor(
    @repository(UserRepository) private userRepository: UserRepository
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
    const email = process.env.ADMIN_EMAIL as string ?? ''
    const password = process.env.ADMIN_PASSWORD as string ?? ''
    if (email == '' || password == '')
      return console.warn('Sem email e senha para seed de usuários')
    const { count } = await this.userRepository.count({ email })
    if (count > 0) return
    await this.userRepository.create({
      email, password: await generateHash(password), name: 'Usuário ADMIN padrão',
      responsibilities: [
        { service: Services.CHAT_SERVICE, role:Roles.ADMIN },
        { role:Roles.ADMIN, service:Services.JUDGE_SERVICE },
        { role:Roles.ADMIN, service:Services.PROBLEM_SERVICE },
        { role:Roles.ADMIN, service:Services.USER_SERVICE },
      ]
    })
      .catch(console.error)
  }

  /**
   * This method will be invoked when the application stops.
   */
  async stop(): Promise<void> {
    // Add your logic for stop
  }
}
