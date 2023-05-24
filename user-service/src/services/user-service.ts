import { UserService } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { securityId, UserProfile } from '@loopback/security';

import { User } from '../models';
import { Credentials, UserRepository } from '../repositories/user.repository';
import { checkHash } from '../utils/password';
import { Responsability } from '../keys';



export class MyUserService implements UserService<User, Credentials>{
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,

    // @inject('service.hasher')

  ) { }
  async verifyCredentials(credentials: Credentials): Promise<User> {
    // implement this method
    const foundUser = await this.userRepository.findOne({
      where: {
        email: credentials.email
      }
    });
    if (!foundUser) {
      throw new HttpErrors.NotFound('user not found');
    }
    const passwordMatched = await checkHash(credentials.password, foundUser.password)
    if (!passwordMatched)
      throw new HttpErrors.Unauthorized('password is not valid');
    return foundUser;
  }
  convertToUserProfile(user: User): UserProfile & { responsibilities:Responsability[] } {
    let userName = user.name;
    return {
      [securityId]: user.id!.toString(),
      name: userName,
      id: user.id,
      email: user.email,
      responsibilities: user.responsibilities
    };
  }


}
